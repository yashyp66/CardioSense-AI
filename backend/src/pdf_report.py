from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from datetime import datetime


def generate_pdf_report(output_path, prediction, features):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph(
        "<b><font size=18>CardioSense AI</font></b>",
        styles["Title"]
    ))
    story.append(Paragraph(
        "<font size=13>Clinical ECG Analysis Report</font>",
        styles["Heading2"]
    ))
    story.append(Spacer(1, 10))

    # Report info
    report_info = [
        ["Analysis Date", datetime.now().strftime("%d %B %Y, %H:%M")],
        ["Report Status", "Completed"],
        ["Predicted State", prediction],
    ]

    info_table = Table(report_info, colWidths=[55 * mm, 105 * mm])
    info_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 14))

    # Clinical impression
    story.append(Paragraph(
        "<b>Automated Clinical Impression</b>",
        styles["Heading2"]
    ))

    if prediction == "Stress":
        impression = (
            "The extracted HRV features are more consistent with an elevated "
            "physiological stress pattern. Reduced autonomic variability may be present."
        )
    else:
        impression = (
            "The extracted HRV features are consistent with a baseline resting autonomic "
            "profile with preserved variability in this recording."
        )

    story.append(Paragraph(impression, styles["BodyText"]))
    story.append(Spacer(1, 14))

    # HRV table
    story.append(Paragraph(
        "<b>Heart Rate Variability Measurements</b>",
        styles["Heading2"]
    ))

    hrv_data = [
        ["Parameter", "Value", "Reference", "Interpretation"],
        [
            "Heart Rate",
            f"{features['heart_rate']:.1f} bpm",
            "60-100 bpm",
            "Resting range"
        ],
        [
            "SDNN",
            f"{features['sdnn']:.1f} ms",
            ">50 ms",
            "Overall variability"
        ],
        [
            "RMSSD",
            f"{features['rmssd']:.1f} ms",
            "20-50 ms",
            "Parasympathetic tone"
        ],
        [
            "pNN50",
            f"{features['pnn50']:.1f} %",
            ">3 %",
            "Vagal activity"
        ],
    ]

    hrv_table = Table(
        hrv_data,
        colWidths=[45 * mm, 35 * mm, 40 * mm, 50 * mm]
    )

    hrv_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
    ]))

    story.append(hrv_table)
    story.append(Spacer(1, 16))

    # Disclaimer
    disclaimer = (
        "<font size=9><b>Disclaimer:</b> This report is generated automatically "
        "from ECG-derived HRV features and is intended for research, educational, and "
        "screening workflows. It should not be used as a standalone diagnostic report "
        "without review by a qualified healthcare professional.</font>"
    )

    story.append(Paragraph(disclaimer, styles["BodyText"]))
    story.append(Spacer(1, 18))

    # Footer
    story.append(Paragraph(
        "<font size=8 color='grey'>CardioSense AI • Clinical Report • Version 1.0</font>",
        styles["BodyText"]
    ))

    doc.build(story)