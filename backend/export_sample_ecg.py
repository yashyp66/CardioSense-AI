import os
import json
import wfdb


# Project root
BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)


# Existing ECG record
RECORD_PATH = os.path.join(
    BASE_DIR,
    "frontend",
    "src",
    "uploads",
    "100"
)


# Output location for frontend
OUTPUT_PATH = os.path.join(
    BASE_DIR,
    "frontend",
    "public",
    "sample-ecg.json"
)


print("Reading ECG record:")
print(RECORD_PATH)


# Check files
if not os.path.exists(RECORD_PATH + ".dat"):
    raise FileNotFoundError(
        f"Missing ECG data file:\n{RECORD_PATH}.dat"
    )

if not os.path.exists(RECORD_PATH + ".hea"):
    raise FileNotFoundError(
        f"Missing ECG header file:\n{RECORD_PATH}.hea"
    )


# Read ECG using WFDB
record = wfdb.rdrecord(RECORD_PATH)


print("ECG loaded successfully")
print("Sampling frequency:", record.fs)
print("Number of samples:", len(record.p_signal))
print("Number of channels:", record.p_signal.shape[1])


# Use Lead I / first channel
ecg = record.p_signal[:, 0]


# Take approximately 10 seconds
duration_seconds = 10

num_samples = int(
    record.fs * duration_seconds
)

ecg = ecg[:num_samples]


# Convert NumPy values to normal Python floats
ecg = [float(value) for value in ecg]


# Create public directory if necessary
os.makedirs(
    os.path.dirname(OUTPUT_PATH),
    exist_ok=True
)


# Save JSON
with open(
    OUTPUT_PATH,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        ecg,
        f,
        separators=(",", ":")
    )


print()
print("===================================")
print("REAL ECG SAMPLE CREATED")
print("===================================")
print("Samples:", len(ecg))
print("Output:")
print(OUTPUT_PATH)
print("===================================")