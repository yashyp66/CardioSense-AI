import wfdb
import neurokit2 as nk
import matplotlib.pyplot as plt
import numpy as np
from scipy.signal import butter, filtfilt
from scipy.interpolate import interp1d
import pandas as pd
import os

# --------------------------------------------------
# High-Pass Filter Function
# --------------------------------------------------
def highpass_filter(signal, cutoff, fs, order=4):
    nyquist = 0.5 * fs
    normal_cutoff = cutoff / nyquist

    b, a = butter(order, normal_cutoff, btype="high", analog=False)
    filtered_signal = filtfilt(b, a, signal)

    return filtered_signal

def extract_features(record_path):
# --------------------------------------------------
# Load ECG Record
# --------------------------------------------------
    record = wfdb.rdrecord(record_path)

    signal = record.p_signal[:, 0]
    fs = record.fs


    # --------------------------------------------------
    # Select First 10 Seconds
    # --------------------------------------------------
    duration = 300
    samples = int(duration * fs)

    ecg = signal[:samples]


    # --------------------------------------------------
    # Filter ECG
    # --------------------------------------------------
    filtered_ecg = highpass_filter(ecg, cutoff=0.5, fs=fs)
    cleaned_ecg = nk.ecg_clean(filtered_ecg, sampling_rate=fs)

    # --------------------------------------------------
    # Detect R-Peaks
    # --------------------------------------------------
    _, info = nk.ecg_peaks(cleaned_ecg, sampling_rate=fs)

    hrv_time = nk.hrv_time(info, sampling_rate=fs)
    hrv_frequency = nk.hrv_frequency(info, sampling_rate=fs)

    print("\nFrequency Domain HRV")
    print(hrv_frequency.T)
    print(hrv_time.T)
    r_peaks = info["ECG_R_Peaks"]


    # --------------------------------------------------
    # Heart Rate
    # --------------------------------------------------
    recording_duration = len(filtered_ecg) / fs
    heart_rate = len(r_peaks) * 60 / recording_duration


    # --------------------------------------------------
    # RR Intervals
    # --------------------------------------------------
    rr_intervals = np.diff(r_peaks) / fs

    rr_times = np.cumsum(rr_intervals)
    print(rr_times[:10])
    interp_fs = 4  # Interpolation frequency (4 Hz)

    uniform_time = np.arange(
        rr_times[0],
        rr_times[-1],
        1 / interp_fs
    )
    print(uniform_time[:10])

    interpolator = interp1d(
        rr_times,
        rr_intervals,
        kind="cubic"
    )

    uniform_rr = interpolator(uniform_time)

    from scipy.signal import welch

    frequencies, psd = welch(
        uniform_rr,
        fs=interp_fs
    )

    print("First 10 Frequencies:")
    print(frequencies[:10])

    print("\nFirst 10 PSD Values:")
    print(psd[:10])

    print(uniform_rr[:10])
    # --------------------------------------------------
    # Power Spectral Density (PSD)
    # --------------------------------------------------
    plt.figure(figsize=(10,5))

    plt.plot(frequencies, psd)
    # LF Region (0.04 - 0.15 Hz)
    lf_mask = (frequencies >= 0.04) & (frequencies <= 0.15)

    plt.fill_between(
        frequencies[lf_mask],
        psd[lf_mask],
        alpha=0.4,
        label="LF Power"
    )

    # HF Region (0.15 - 0.40 Hz)
    hf_mask = (frequencies >= 0.15) & (frequencies <= 0.40)

    plt.fill_between(
        frequencies[hf_mask],
        psd[hf_mask],
        alpha=0.4,
        label="HF Power"
    )
    plt.title("Power Spectral Density of HRV")
    plt.xlabel("Frequency (Hz)")
    plt.ylabel("Power")

    # HRV Band Boundaries
    plt.axvline(0.04, color="green", linestyle="--", label="LF Start")
    plt.axvline(0.15, color="red", linestyle="--", label="HF Start")
    plt.axvline(0.40, color="purple", linestyle="--", label="HF End")

    plt.xlim(0, 0.5)

    plt.legend()
    plt.grid(True)
    plt.show()
    plt.figure(figsize=(10, 4))

    plt.plot(uniform_time, uniform_rr, label="Interpolated RR", color="blue")

    plt.scatter(
        rr_times,
        rr_intervals,
        color="red",
        label="Original RR Intervals"
    )

    plt.xlabel("Time (seconds)")
    plt.ylabel("RR Interval (seconds)")
    plt.title("RR Interval Interpolation")
    plt.legend()
    plt.grid(True)

    plt.show()
    # --------------------------------------------------
    # HRV Metrics
    # --------------------------------------------------
    mean_rr = np.mean(rr_intervals)

    sdnn = np.std(rr_intervals)

    rr_diff = np.diff(rr_intervals)
    nn50 = np.sum(np.abs(rr_diff) > 0.05)
    pnn50 = (nn50 / len(rr_diff)) * 100
    rmssd = np.sqrt(np.mean(rr_diff ** 2))


    # --------------------------------------------------
    # Print Results
    # --------------------------------------------------
    print("---------- ECG ANALYSIS ----------")

    print(f"Recording Duration : {recording_duration:.2f} seconds")
    print(f"Heart Rate         : {heart_rate:.2f} BPM")

    print("\nRR Intervals (seconds)")
    #print(rr_intervals)

    print(f"\nMean RR : {mean_rr:.3f} seconds")
    print(f"SDNN    : {sdnn:.3f} seconds")
    print(f"RMSSD   : {rmssd:.3f} seconds")

    print(f"NN50     : {nn50}")
    print(f"pNN50    : {pnn50:.2f}%")
    # --------------------------------------------------
    # Feature Vector
    # --------------------------------------------------
    features = [
        heart_rate,
        mean_rr,
        sdnn,
        rmssd,
        nn50,
        pnn50,
        hrv_frequency["HRV_LF"].iloc[0],
        hrv_frequency["HRV_HF"].iloc[0],
        hrv_frequency["HRV_LFHF"].iloc[0]
    ]

    return features

print("\nFeature Vector:")
features = extract_features("datasets/mitdb/100")

print(features)
# --------------------------------------------------
# Create DataFrame
# --------------------------------------------------
columns = [
    "Heart_Rate",
    "Mean_RR",
    "SDNN",
    "RMSSD",
    "NN50",
    "pNN50",
    "LF",
    "HF",
    "LF_HF"
]

df = pd.DataFrame([features], columns=columns)

print("\nFeature DataFrame:")
print(df)
# --------------------------------------------------
# Save Features to CSV
# --------------------------------------------------
import os

filename = os.path.join(
    os.path.dirname(__file__),
    "outputs",
    "features.csv"
)

if os.path.exists(filename):
    df.to_csv(filename, mode="a", header=False, index=False)
else:
    df.to_csv(filename, index=False)

print("\nFeatures appended to features.csv")

print("\nFeatures saved to features.csv")
# --------------------------------------------------
# Time Axis
# --------------------------------------------------
time = np.arange(len(filtered_ecg)) / fs


# --------------------------------------------------
# Plot ECG
# --------------------------------------------------
plt.figure(figsize=(14, 4))
display_seconds = 10
display_samples = fs * display_seconds
plt.plot(
    time[:display_samples],
    filtered_ecg[:display_samples],
    label="Filtered ECG"
)

visible_peaks = r_peaks[r_peaks < display_samples]

plt.scatter(
    time[visible_peaks],
    filtered_ecg[visible_peaks],
    color="red",
    label="R Peaks",
    zorder=3
)

plt.title("Filtered ECG with Detected R Peaks")
plt.xlabel("Time (seconds)")
plt.ylabel("Amplitude (mV)")
plt.grid(True)
plt.legend()

plt.show()


# --------------------------------------------------
# Tachogram
# --------------------------------------------------
plt.figure(figsize=(10, 4))

plt.plot(rr_intervals, marker="o")

plt.title("RR Interval Tachogram")
plt.xlabel("Beat Number")
plt.ylabel("RR Interval (seconds)")
plt.grid(True)

plt.show()