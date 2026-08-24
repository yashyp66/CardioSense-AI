import wfdb
import neurokit2 as nk
import numpy as np
from scipy.signal import butter, filtfilt


# ============================================================
# HIGH-PASS FILTER
# ============================================================

def highpass_filter(
    signal,
    cutoff,
    fs,
    order=4,
):
    """
    Apply a Butterworth high-pass filter
    to remove slow baseline drift.
    """

    nyquist = 0.5 * fs
    normal_cutoff = cutoff / nyquist

    b, a = butter(
        order,
        normal_cutoff,
        btype="high",
        analog=False,
    )

    filtered_signal = filtfilt(
        b,
        a,
        signal,
    )

    return filtered_signal


# ============================================================
# HRV FEATURE EXTRACTION
# ============================================================

def extract_features(record_path):
    """
    Extract the five HRV features used by the
    trained stress-classification model.

    Returned features:

        1. mean_rr
        2. heart_rate
        3. sdnn
        4. rmssd
        5. pnn50
    """

    # --------------------------------------------------------
    # Load ECG record
    # --------------------------------------------------------

    record = wfdb.rdrecord(
        record_path
    )

    if record.p_signal is None:
        raise ValueError(
            "The ECG record does not contain a usable signal."
        )

    if record.p_signal.shape[1] == 0:
        raise ValueError(
            "The ECG record does not contain any channels."
        )


    # --------------------------------------------------------
    # Use first ECG channel
    # --------------------------------------------------------

    signal = record.p_signal[:, 0]

    fs = float(record.fs)

    if fs <= 0:
        raise ValueError(
            "The ECG record has an invalid sampling frequency."
        )


    # --------------------------------------------------------
    # Use first 300 seconds of ECG
    # --------------------------------------------------------

    duration = 300

    samples = int(
        duration * fs
    )

    signal = signal[:samples]


    if len(signal) < 2:
        raise ValueError(
            "The ECG recording is too short to analyze."
        )


    # --------------------------------------------------------
    # High-pass filter
    # --------------------------------------------------------

    filtered_ecg = highpass_filter(
        signal,
        cutoff=0.5,
        fs=fs,
    )


    # --------------------------------------------------------
    # Clean ECG signal
    # --------------------------------------------------------

    cleaned_ecg = nk.ecg_clean(
        filtered_ecg,
        sampling_rate=fs,
    )


    # --------------------------------------------------------
    # Detect R-peaks
    # --------------------------------------------------------

    _, rpeaks = nk.ecg_peaks(
        cleaned_ecg,
        sampling_rate=fs,
    )

    rpeaks_indices = rpeaks[
        "ECG_R_Peaks"
    ]


    if (
        rpeaks_indices is None
        or len(rpeaks_indices) < 3
    ):
        raise ValueError(
            "Unable to detect enough heartbeats to calculate reliable HRV features."
        )


    # --------------------------------------------------------
    # HRV time-domain metrics
    # --------------------------------------------------------

    hrv_time = nk.hrv_time(
        rpeaks,
        sampling_rate=fs,
    )


    if hrv_time.empty:
        raise ValueError(
            "Unable to calculate HRV metrics from this ECG recording."
        )


    # --------------------------------------------------------
    # Extract model features
    # --------------------------------------------------------

    mean_rr = float(
        hrv_time[
            "HRV_MeanNN"
        ].iloc[0]
    )

    sdnn = float(
        hrv_time[
            "HRV_SDNN"
        ].iloc[0]
    )

    rmssd = float(
        hrv_time[
            "HRV_RMSSD"
        ].iloc[0]
    )

    pnn50 = float(
        hrv_time[
            "HRV_pNN50"
        ].iloc[0]
    )


    # --------------------------------------------------------
    # Heart rate
    # --------------------------------------------------------

    if mean_rr <= 0:
        raise ValueError(
            "The calculated RR interval is invalid."
        )

    heart_rate = (
        60 / mean_rr
    ) * 1000


    # --------------------------------------------------------
    # Validate feature values
    # --------------------------------------------------------

    features = [
        mean_rr,
        heart_rate,
        sdnn,
        rmssd,
        pnn50,
    ]


    if not all(
        np.isfinite(value)
        for value in features
    ):
        raise ValueError(
            "The ECG produced invalid HRV feature values."
        )


    # --------------------------------------------------------
    # Return feature vector
    # --------------------------------------------------------

    return features


# ============================================================
# MANUAL TEST
# ============================================================

if __name__ == "__main__":

    import os

    record_path = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "datasets",
        "mitdb",
        "100",
    )
)
    features = extract_features(
        record_path
    )

    print(features)