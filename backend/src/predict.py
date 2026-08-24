import os
import joblib
import pandas as pd


# ============================================================
# MODEL PATH
# ============================================================

model_path = os.path.join(
    os.path.dirname(__file__),
    "..",
    "models",
    "random_forest.pkl",
)


# ============================================================
# LOAD MODEL
# ============================================================

model = joblib.load(model_path)

print("Model loaded successfully!")


# ============================================================
# PREDICT STRESS
# ============================================================

def predict_stress(features):

    feature_df = pd.DataFrame(
        [features],
        columns=[
            "mean_rr",
            "heart_rate",
            "sdnn",
            "rmssd",
            "pnn50",
        ],
    )

    prediction = model.predict(
        feature_df
    )

    if prediction[0] == 0:
        return "Baseline"

    return "Stress"


# ============================================================
# OPTIONAL MANUAL TEST
# ============================================================
#
# Run:
#
#     python predict.py
#
# if you want to manually test the model.
#
# It will NOT run automatically when FastAPI imports this file.
#

if __name__ == "__main__":

    sample_features = [
        0.82,
        73.5,
        0.05,
        0.03,
        18.2,
    ]

    result = predict_stress(
        sample_features
    )

    print(
        f"Prediction: {result}"
    )