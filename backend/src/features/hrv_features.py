import numpy as np
import neurokit2 as nk


def extract_hrv_features(clean_ecg, sampling_rate=700):
    """
    Extract HRV features from a cleaned ECG signal.

    Parameters
    ----------
    clean_ecg : array-like
        Cleaned ECG signal.
    sampling_rate : int
        ECG sampling rate (default = 700 Hz for WESAD).

    Returns
    -------
    dict
        Dictionary containing HRV features.
    """

    # -----------------------------
    # Detect R-peaks
    # -----------------------------
    _, info = nk.ecg_peaks(
        clean_ecg,
        sampling_rate=sampling_rate
    )

    # -----------------------------
    # RR Intervals
    # -----------------------------
    r_peaks = info["ECG_R_Peaks"]
    rr_intervals = np.diff(r_peaks)
    rr_sec = rr_intervals / sampling_rate

    # -----------------------------
    # Mean RR
    # -----------------------------
    mean_rr = np.mean(rr_sec)

    # -----------------------------
    # Heart Rate
    # -----------------------------
    heart_rate = 60 / mean_rr

    # -----------------------------
    # SDNN
    # -----------------------------
    sdnn = np.std(rr_sec) * 1000  # milliseconds

    # -----------------------------
    # RMSSD
    # -----------------------------
    rr_diff = np.diff(rr_sec)
    rmssd = np.sqrt(np.mean(rr_diff ** 2)) * 1000  # milliseconds

    # -----------------------------
    # pNN50
    # -----------------------------
    rr_diff_abs = np.abs(rr_diff)
    count_over_50 = np.sum(rr_diff_abs > 0.05)
    pnn50 = (count_over_50 / len(rr_diff_abs)) * 100

    return {
        "mean_rr": mean_rr,
        "heart_rate": heart_rate,
        "sdnn": sdnn,
        "rmssd": rmssd,
        "pnn50": pnn50
    }