from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from .predict import predict_stress
from .pdf_report import generate_pdf_report

import wfdb
import os

from feature_extractor import extract_features


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="CardioSense AI",
    description="AI-Powered ECG Stress Analysis API",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        # Vite development server
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Vite production preview
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "message": "ECG Stress Analyzer API is running!"
    }


# ============================================================
# PREDICT ECG
# ============================================================

@app.post("/predict")
async def predict(
    dat_file: UploadFile = File(...),
    hea_file: UploadFile = File(...),
):

    # --------------------------------------------------------
    # Upload directory
    # --------------------------------------------------------

    upload_dir = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "uploads",
        )
    )

    os.makedirs(
        upload_dir,
        exist_ok=True,
    )


    # --------------------------------------------------------
    # Save uploaded files
    # --------------------------------------------------------

    dat_path = os.path.join(
        upload_dir,
        dat_file.filename,
    )

    hea_path = os.path.join(
        upload_dir,
        hea_file.filename,
    )


    with open(dat_path, "wb") as f:
        f.write(
            await dat_file.read()
        )


    with open(hea_path, "wb") as f:
        f.write(
            await hea_file.read()
        )


    # --------------------------------------------------------
    # WFDB record prefix
    # --------------------------------------------------------

    record_prefix = os.path.splitext(
        dat_path
    )[0]


    # ========================================================
    # HRV FEATURES
    # ========================================================

    features = extract_features(
        record_prefix
    )


    # ========================================================
    # STRESS PREDICTION
    # ========================================================

    prediction = predict_stress(
        features
    )


    # ========================================================
    # LOAD ECG
    # ========================================================

    record = wfdb.rdrecord(
        record_prefix
    )


    # --------------------------------------------------------
    # Sampling frequency
    # --------------------------------------------------------

    sample_rate = float(
        record.fs
    )


    # --------------------------------------------------------
    # Signal matrix
    #
    # Shape:
    #     samples × channels
    # --------------------------------------------------------

    signal_matrix = record.p_signal


    # --------------------------------------------------------
    # Number of samples
    # --------------------------------------------------------

    total_samples = int(
        signal_matrix.shape[0]
    )


    # --------------------------------------------------------
    # Number of channels
    # --------------------------------------------------------

    num_channels = int(
        signal_matrix.shape[1]
    )


    # --------------------------------------------------------
    # Recording duration
    # --------------------------------------------------------

    duration_seconds = (
        total_samples / sample_rate
        if sample_rate > 0
        else 0
    )


    # ========================================================
    # SELECT ECG LEAD
    # ========================================================

    # We currently use the first available channel.
    #
    # IMPORTANT:
    # The actual signal is NOT normalized, smoothed,
    # filtered, or artificially modified.

    selected_channel = 0

    ecg_signal = signal_matrix[
        :,
        selected_channel
    ]


    # --------------------------------------------------------
    # Lead name
    # --------------------------------------------------------

    lead_name = "Lead I"

    if (
        hasattr(record, "sig_name")
        and record.sig_name
        and len(record.sig_name) > selected_channel
    ):
        lead_name = record.sig_name[
            selected_channel
        ]


    # ========================================================
    # RETURN RESPONSE
    # ========================================================

    return {
        "prediction": prediction,

        "features": {
            "mean_rr": features[0],
            "heart_rate": features[1],
            "sdnn": features[2],
            "rmssd": features[3],
            "pnn50": features[4],
        },

        # ----------------------------------------------------
        # ECG
        # ----------------------------------------------------

        "ecg_signal": ecg_signal.tolist(),

        # ----------------------------------------------------
        # ECG metadata
        # ----------------------------------------------------

        "sample_rate": sample_rate,

        "sampling_frequency": sample_rate,

        "total_samples": total_samples,

        "duration_seconds": duration_seconds,

        "num_channels": num_channels,

        "lead": lead_name,

        "record_name": os.path.basename(
            record_prefix
        ),
    }


# ============================================================
# DOWNLOAD CLINICAL REPORT
# ============================================================

@app.post("/download-report")
async def download_report(
    dat_file: UploadFile = File(...),
    hea_file: UploadFile = File(...),
):

    # --------------------------------------------------------
    # Upload directory
    # --------------------------------------------------------

    upload_dir = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "uploads",
        )
    )

    os.makedirs(
        upload_dir,
        exist_ok=True,
    )


    # --------------------------------------------------------
    # Save files
    # --------------------------------------------------------

    dat_path = os.path.join(
        upload_dir,
        dat_file.filename,
    )

    hea_path = os.path.join(
        upload_dir,
        hea_file.filename,
    )


    with open(dat_path, "wb") as f:
        f.write(
            await dat_file.read()
        )


    with open(hea_path, "wb") as f:
        f.write(
            await hea_file.read()
        )


    # --------------------------------------------------------
    # Record prefix
    # --------------------------------------------------------

    record_prefix = os.path.splitext(
        dat_path
    )[0]


    # --------------------------------------------------------
    # Extract features
    # --------------------------------------------------------

    features_list = extract_features(
        record_prefix
    )


    features = {
        "mean_rr": features_list[0],
        "heart_rate": features_list[1],
        "sdnn": features_list[2],
        "rmssd": features_list[3],
        "pnn50": features_list[4],
    }


    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    prediction = predict_stress(
        features_list
    )


    # --------------------------------------------------------
    # Generate PDF
    # --------------------------------------------------------

    pdf_path = os.path.join(
        upload_dir,
        "CardioSense-Clinical-Report.pdf",
    )


    generate_pdf_report(
        pdf_path,
        prediction,
        features,
    )


    # --------------------------------------------------------
    # Return PDF
    # --------------------------------------------------------

    return FileResponse(
        path=pdf_path,
        filename="CardioSense-Clinical-Report.pdf",
        media_type="application/pdf",
    )