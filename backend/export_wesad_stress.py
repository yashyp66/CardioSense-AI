import os
import pickle
import numpy as np
import wfdb

PKL_PATH = r"D:\Projects\ECG-Analyzer\datasets\WESAD\S2\S2.pkl"

print("Checking file:", PKL_PATH)
print("Exists:", os.path.exists(PKL_PATH))

with open(PKL_PATH, "rb") as f:
    data = pickle.load(f, encoding="latin1")

# Chest ECG signal
ecg = data["signal"]["chest"]["ECG"].flatten()

# Labels: 1=baseline, 2=stress
labels = data["label"]

fs = 700

# First stress segment
stress_indices = np.where(labels == 2)[0]
start = stress_indices[0]
end = start + 300 * fs

stress_ecg = ecg[start:end]

out_dir = r"D:\Projects\ECG-Analyzer\backend\stress_test"
os.makedirs(out_dir, exist_ok=True)

record_name = "wesad-stress-s2"

wfdb.wrsamp(
    record_name=record_name,
    fs=fs,
    units=["mV"],
    sig_name=["ECG"],
    p_signal=stress_ecg.reshape(-1, 1),
    write_dir=out_dir,
)

print("Export successful!")
print(record_name + ".dat")
print(record_name + ".hea")