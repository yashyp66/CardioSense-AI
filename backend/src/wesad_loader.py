import pickle
import os
import numpy as np
import neurokit2 as nk
import pandas as pd
from features.hrv_features import extract_hrv_features

SUBJECTS = [
    "S2", "S3", "S4", "S5",
    "S6", "S7", "S8", "S9",
    "S10", "S11", "S13",
    "S14", "S15", "S16", "S17"
]

all_features = []

for subject in SUBJECTS:

    # Path to Subject 2
    file_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "datasets",
        "WESAD",
        subject,
        f"{subject}.pkl"
    )

    with open(file_path, "rb") as f:
        data = pickle.load(f, encoding="latin1")

    ecg = data["signal"]["chest"]["ECG"]

   # print(type(ecg))
    #print(ecg.shape)



    labels = data["label"]

   
   # print("\nFirst 5 ECG samples:")
   # print(ecg[:5])
    #print("\nFirst 20 labels:")
    #print(labels[:20])
    baseline_start = np.where(labels == 1)[0][0]

    #print("\nBaseline starts at sample:")
    #print(baseline_start)
    stress_start = np.where(labels == 2)[0][0]

    #print("\nStress starts at sample:")
    #print(stress_start)
    baseline_indices = np.where(labels == 1)[0]
    baseline_end = baseline_indices[-1]

    baseline_ecg = ecg[baseline_start : baseline_end + 1]
    #print("\nBaseline ECG shape:")
    #print(baseline_ecg.shape)

    #print("\nBaseline ends at sample:")
    #print(baseline_indices[-1])

    stress_indices = np.where(labels == 2)[0] 
    stress_end = stress_indices[-1]

    stress_ecg = ecg[stress_start : stress_end + 1]

    #print("\nStress ends at sample:")
    #print(stress_end)

    #print("\nStress ECG shape:")
    #print(stress_ecg.shape)

    # -----------------------------
    # Clean ECG signals
    # -----------------------------
    baseline_clean = nk.ecg_clean(
        baseline_ecg,
        sampling_rate=700
    )

    stress_clean = nk.ecg_clean(
        stress_ecg,
        sampling_rate=700
    )
   # print("\nBaseline Clean Shape:")
    #print(baseline_clean.shape)

    #print("\nStress Clean Shape:")
    #print(stress_clean.shape)

    # ---------------------------------
    # Extract HRV Features
    # ---------------------------------
    baseline_features = extract_hrv_features(baseline_clean)
    stress_features = extract_hrv_features(stress_clean)

    baseline_features["subject"] = subject
    baseline_features["condition"] = "baseline"

    stress_features["subject"] = subject
    stress_features["condition"] = "stress"

    all_features.append(baseline_features)
    all_features.append(stress_features)

    # ---------------------------------
    # Print Results
    # ---------------------------------
   
df = pd.DataFrame(all_features)

output_path = os.path.join(
    os.path.dirname(__file__),
    "..",
    "outputs",
    "hrv_features.csv"
)

df.to_csv(output_path, index=False)

print("\n========================================")
print("HRV dataset created successfully!")
print(f"Subjects processed : {len(SUBJECTS)}")
print(f"Dataset shape      : {df.shape}")
print(f"Saved to           : {output_path}")
print("========================================")