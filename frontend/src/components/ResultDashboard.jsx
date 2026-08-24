import ECGChart from "./ECGChart";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";

import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  Loader2,
  AlertCircle,
  X,
  FileText,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";

import { downloadReport } from "../services/api";


export default function ResultDashboard({
  result,
  onNewAnalysis,
}) {
  const { isDark } = useTheme();

  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  if (!result) return null;


  /* =========================================================
     DATA
  ========================================================= */

  const features = result.features || {};

  const prediction =
    result.prediction ||
    result.predicted_state ||
    result.state ||
    "Unknown";

  const predictionText = String(prediction);

  const isStress = predictionText
    .toLowerCase()
    .includes("stress");


  const recordName =
    result.datFile?.name?.replace(/\.dat$/i, "") ||
    result.record_id ||
    result.recordId ||
    "ECG Recording";


  const heartRate =
    features.heart_rate ??
    features.hr ??
    result.heart_rate ??
    result.hr;


  const sdnn =
    features.sdnn ??
    result.sdnn;


  const rmssd =
    features.rmssd ??
    result.rmssd;


  const pnn50 =
    features.pnn50 ??
    result.pnn50;


  const signal = Array.isArray(result.ecg_signal)
    ? result.ecg_signal
    : [];


  /* =========================================================
     FORMAT
  ========================================================= */

  const formatValue = (
    value,
    digits = 1
  ) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      Number.isNaN(Number(value))
    ) {
      return "--";
    }

    return Number(value).toFixed(digits);
  };


  /* =========================================================
     ACTIONS
  ========================================================= */

  const handleNewAnalysis = () => {
    if (onNewAnalysis) {
      onNewAnalysis();
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setExportStatus(null);

    try {
      await downloadReport(
        result.datFile,
        result.heaFile
      );

      setExportStatus({
        type: "success",
        message: "Clinical report downloaded successfully.",
      });
    } catch (error) {
      console.error("PDF export failed:", error);

      setExportStatus({
        type: "error",
        message:
          error?.message ||
          "Unable to generate the clinical report. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };


  /* =========================================================
     DESIGN TOKENS
  ========================================================= */

  const accent = isStress
    ? (isDark ? "#E6A94A" : "#A66A10")
    : (isDark ? "#4FD1A5" : "#17795F");

  const accentSoft = isStress
    ? (isDark ? "#302617" : "#FBF6EC")
    : (isDark ? "#122C25" : "#F0F8F5");


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main
      className="min-h-screen w-full bg-[var(--page-bg)] text-[var(--text-primary)] transition-colors duration-200"
      style={{
        "--page-bg": isDark ? "#080D14" : "#F7F8FA",
        "--surface": isDark ? "#111923" : "#FFFFFF",
        "--surface-subtle": isDark ? "#0E151E" : "#FAFBFC",
        "--surface-muted": isDark ? "#182331" : "#F5F6F8",
        "--surface-hover": isDark ? "#17212D" : "#F8FAFC",
        "--text-primary": isDark ? "#F4F7FB" : "#172235",
        "--text-primary-soft": isDark ? "#E3EAF3" : "#344255",
        "--text-body": isDark ? "#C2CEDB" : "#58677A",
        "--text-secondary": isDark ? "#9EADBF" : "#667487",
        "--text-muted": isDark ? "#73849A" : "#929CAA",
        "--icon": isDark ? "#9EB0C3" : "#65758A",
        "--border": isDark ? "#243140" : "#DFE4E9",
        "--border-strong": isDark ? "#334355" : "#CBD4DD",
        "--divider": isDark ? "#2A3746" : "#D4D8DE",
        "--success": isDark ? "#4FD1A5" : "#168665",
        "--success-soft": isDark ? "#102C25" : "#F0F8F5",
        "--primary": isDark ? "#F3F6FA" : "#172235",
        "--primary-hover": isDark ? "#FFFFFF" : "#26354A",
        "--on-primary": isDark ? "#0B1118" : "#FFFFFF",
        "--shadow-color": isDark ? "rgba(0,0,0,0.34)" : "rgba(23,34,53,0.09)",
        "--shadow-color-strong": isDark ? "rgba(0,0,0,0.45)" : "rgba(23,34,53,0.14)",
        "--shadow-color-soft": isDark ? "rgba(0,0,0,0.22)" : "rgba(23,34,53,0.035)",
      }}
    >

      <div className="mx-auto w-full max-w-[1440px] px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12">


        {/* =====================================================
            PAGE NAVIGATION
        ===================================================== */}

        <div className="flex h-[64px] items-center justify-between border-b border-[var(--border)] sm:h-[72px]">

          <button
            type="button"
            onClick={handleNewAnalysis}
            className="group inline-flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.8}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />

            New analysis
          </button>


          <div className="hidden items-center gap-2 text-[11px] font-medium text-[var(--text-muted)] sm:flex">

            <span>
              CardioSense AI
            </span>

            <span className="text-[var(--divider)]">
              /
            </span>

            <span>
              Analysis report
            </span>

          </div>

        </div>


        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="pb-8 pt-9 sm:py-14 lg:py-16">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <CheckCircle2
                  size={15}
                  strokeWidth={2}
                  className="text-[var(--success)]"
                />

                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--success)] sm:text-[10px]">
                  Analysis complete
                </span>

              </div>


              <h1 className="mt-3.5 text-[39px] font-semibold leading-[1.02] tracking-[-0.052em] text-[var(--text-primary)] sm:mt-4 sm:text-[54px] lg:text-[60px]">
                ECG Stress Analysis
              </h1>


              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-[var(--text-secondary)] sm:mt-5 sm:text-[13px]">

                <span className="max-w-full truncate font-semibold text-[var(--text-primary-soft)]">
                  {recordName}
                </span>

                <span className="text-[var(--divider)]">
                  •
                </span>

                <span>
                  MIT-BIH ECG
                </span>

                <span className="text-[var(--divider)]">
                  •
                </span>

                <span>
                  ECG
                </span>

                <span className="text-[var(--divider)]">
                  •
                </span>

                <span>
                  5m 00s
                </span>

              </div>

            </div>


            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              aria-busy={isExporting}
              className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-full bg-[var(--text-primary)] px-5 text-[13px] font-semibold text-[var(--on-primary)] shadow-[0_5px_18px_var(--shadow-color)] transition-all duration-200 hover:bg-[var(--text-primary)] hover:shadow-[0_7px_22px_var(--shadow-color-strong)] disabled:cursor-wait disabled:opacity-70"
            >
              {isExporting ? (
                <Loader2
                  size={15}
                  strokeWidth={2}
                  className="animate-spin"
                />
              ) : (
                <Download
                  size={15}
                  strokeWidth={2}
                />
              )}

              {isExporting
                ? "Generating report..."
                : "Export report"}
            </button>

          </div>

        </header>

        {exportStatus && (
          <div
            role={exportStatus.type === "error" ? "alert" : "status"}
            className={`
              mb-8
              flex
              items-start
              gap-3
              rounded-[16px]
              border
              px-4
              py-3.5
              shadow-[0_8px_24px_var(--shadow-color-soft)]
              transition-colors
              duration-200
              ${
                exportStatus.type === "success"
                  ? "border-[var(--success)]/20 bg-[var(--success-soft)]"
                  : "border-[#C94B4B]/20 bg-[#C94B4B]/10"
              }
            `}
          >
            <div
              className={`
                mt-0.5
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-lg
                ${
                  exportStatus.type === "success"
                    ? "bg-[var(--surface)] text-[var(--success)]"
                    : "bg-[var(--surface)] text-[#C94B4B]"
                }
              `}
            >
              {exportStatus.type === "success" ? (
                <CheckCircle2 size={15} strokeWidth={2} />
              ) : (
                <AlertCircle size={15} strokeWidth={2} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-[var(--text-primary)]">
                {exportStatus.type === "success"
                  ? "Report ready"
                  : "Report could not be generated"}
              </p>

              <p className="mt-0.5 break-words text-[10px] leading-5 text-[var(--text-secondary)]">
                {exportStatus.message}
              </p>

              {exportStatus.type === "error" && (
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="mt-2 text-[10px] font-semibold text-[var(--text-primary)] underline underline-offset-2 transition-opacity hover:opacity-70 disabled:opacity-50"
                >
                  Try again
                </button>
              )}
            </div>

            <button
              type="button"
              aria-label="Dismiss export message"
              onClick={() => setExportStatus(null)}
              className="shrink-0 rounded-full p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
            >
              <X size={14} strokeWidth={1.8} />
            </button>
          </div>
        )}


        {/* =====================================================
            PRIMARY ASSESSMENT
        ===================================================== */}

        <section className="overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_20px_60px_var(--shadow-color)] transition-colors duration-200">

          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">


            {/* =================================================
                PRIMARY RESULT
            ================================================= */}

            <div className="relative px-6 py-7 sm:px-10 sm:py-11 lg:px-12 lg:py-12">

              <div
                className="absolute bottom-0 left-0 top-0 w-[3px]"
                style={{
                  backgroundColor: accent,
                }}
              />


              {/* ===============================================
                  RESULT HEADER
              =============================================== */}

              <div className="flex items-center justify-between gap-4">

                <div className="flex min-w-0 items-center gap-3">

                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: accentSoft,
                      color: accent,
                    }}
                  >
                    <HeartPulse
                      size={19}
                      strokeWidth={1.7}
                    />
                  </div>


                  <div className="min-w-0">

                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] sm:text-[10px]">
                      Primary assessment
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-[var(--text-secondary)] sm:text-[11px]">
                      Physiological state detected from ECG
                    </p>

                  </div>

                </div>


                {/* Desktop status */}

                <div className="hidden shrink-0 items-center gap-2 sm:flex">

                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: accent,
                    }}
                  />

                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                    style={{
                      color: accent,
                    }}
                  >
                    {isStress
                      ? "Elevated"
                      : "Baseline"}
                  </span>

                </div>

              </div>


              {/* ===============================================
                  RESULT AREA
              =============================================== */}

              <div className="mt-8 sm:mt-11">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                  <div>

                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] sm:text-[10px]">
                      AI prediction
                    </p>


                    <h2
                      className="mt-2 text-[46px] font-semibold leading-none tracking-[-0.06em] sm:text-[64px]"
                      style={{
                        color: accent,
                      }}
                    >
                      {predictionText}
                    </h2>

                  </div>


                  {/* Mobile + desktop status */}

                  <div className="flex w-fit items-center gap-2">

                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: accent,
                      }}
                    />

                    <span className="text-[10px] font-medium text-[var(--text-secondary)] sm:text-[11px]">
                      ECG-derived assessment
                    </span>

                  </div>

                </div>


                {/* =============================================
                    EXPLANATION
                ============================================= */}

                <div className="mt-6 max-w-[610px] sm:mt-7">

                  <p className="text-[13px] leading-6 text-[var(--text-body)] sm:text-[15px] sm:leading-7">

                    {isStress
                      ? "The extracted heart-rate variability features demonstrate a pattern that is more consistent with elevated physiological stress within this recording."
                      : "The extracted heart-rate variability features are consistent with a baseline physiological profile within this recording."}

                  </p>

                </div>


                {/* =============================================
                    AI NOTE
                ============================================= */}

                <div className="mt-6 border-t border-[var(--border)] pt-5 sm:mt-9">

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--icon)]">

                      <Sparkles
                        size={15}
                        strokeWidth={1.7}
                      />

                    </div>


                    <div className="min-w-0">

                      <p className="text-[11px] font-semibold text-[var(--text-primary-soft)]">
                        Automated physiological assessment
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)] sm:text-[11px]">
                        Derived from HRV features extracted from the analyzed ECG signal.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                PHYSIOLOGICAL PROFILE
            ================================================= */}

            <div className="border-t border-[var(--border)] lg:border-l lg:border-t-0">

              <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-6 sm:px-9">

                <div>

                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] sm:text-[10px]">
                    Supporting evidence
                  </p>

                  <h3 className="mt-1.5 text-[18px] font-semibold tracking-[-0.025em] text-[var(--text-primary)] sm:text-[19px]">
                    Physiological profile
                  </h3>

                </div>


                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--icon)]">

                  <Waves
                    size={17}
                    strokeWidth={1.7}
                  />

                </div>

              </div>


              <div className="grid grid-cols-2">

                <ProfileMetric
                  label="Heart rate"
                  value={formatValue(heartRate)}
                  unit="bpm"
                  description="Average cardiac rate"
                  icon={
                    <HeartPulse
                      size={16}
                    />
                  }
                />


                <ProfileMetric
                  label="SDNN"
                  value={formatValue(sdnn)}
                  unit="ms"
                  description="Overall variability"
                  icon={
                    <Activity
                      size={16}
                    />
                  }
                />


                <ProfileMetric
                  label="RMSSD"
                  value={formatValue(rmssd)}
                  unit="ms"
                  description="Short-term variation"
                  icon={
                    <Waves
                      size={16}
                    />
                  }
                />


                <ProfileMetric
                  label="pNN50"
                  value={formatValue(pnn50)}
                  unit="%"
                  description="Beat-to-beat variation"
                  icon={
                    <Activity
                      size={16}
                    />
                  }
                />

              </div>

            </div>

          </div>


          {/* ===================================================
              ANALYSIS SUMMARY
          =================================================== */}

          <div className="border-t border-[var(--border)] bg-[var(--surface-subtle)]">

            <div className="grid sm:grid-cols-3">

              <SummaryStep
                number="01"
                title="ECG signal"
                text="Signal acquired"
              />

              <SummaryStep
                number="02"
                title="HRV extraction"
                text="Features calculated"
              />

              <SummaryStep
                number="03"
                title="AI classification"
                text="State predicted"
                last
              />

            </div>

          </div>

        </section>


        {/* =====================================================
            RECORDING INFORMATION
        ===================================================== */}

        <section className="mt-14 sm:mt-16">

          <SectionHeading
            eyebrow="Recording"
            title="Signal information"
            description="Technical details associated with the analyzed recording."
          />


          <div className="mt-6 grid overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_34px_var(--shadow-color)] sm:grid-cols-2 lg:grid-cols-4">

            <InformationItem
              icon={
                <Database size={17} />
              }
              label="Record"
              value={recordName}
            />

            <InformationItem
              icon={
                <FileText size={17} />
              }
              label="Signal source"
              value="MIT-BIH ECG"
            />

            <InformationItem
              icon={
                <Clock3 size={17} />
              }
              label="Duration"
              value="300 seconds"
            />

            <InformationItem
              icon={
                <Waves size={17} />
              }
              label="Lead analyzed"
              value="Lead I"
              last
            />

          </div>

        </section>


        {/* =====================================================
            HRV
        ===================================================== */}

        <section className="mt-14 sm:mt-16">

          <SectionHeading
            eyebrow="Physiological markers"
            title="Heart-rate variability"
            description="Time-domain measurements calculated from the ECG recording."
          />


          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_10px_34px_var(--shadow-color)] lg:grid-cols-4">

            <LargeMetric
              label="Heart rate"
              value={formatValue(heartRate)}
              unit="bpm"
              description="Average cardiac rate"
              icon={
                <HeartPulse
                  size={17}
                />
              }
            />


            <LargeMetric
              label="SDNN"
              value={formatValue(sdnn)}
              unit="ms"
              description="Overall variability"
              icon={
                <Activity
                  size={17}
                />
              }
            />


            <LargeMetric
              label="RMSSD"
              value={formatValue(rmssd)}
              unit="ms"
              description="Short-term variation"
              icon={
                <Waves
                  size={17}
                />
              }
            />


            <LargeMetric
              label="pNN50"
              value={formatValue(pnn50)}
              unit="%"
              description="Beat-to-beat variation"
              icon={
                <Activity
                  size={17}
                />
              }
              last
            />

          </div>

        </section>


        {/* =====================================================
            ECG
        ===================================================== */}

        <section className="mt-14 sm:mt-16">

          <SectionHeading
            eyebrow="Signal"
            title="ECG waveform"
            description="Interactive visualization of the analyzed ECG recording."
          />


          <div className="mt-6 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_14px_42px_var(--shadow-color)] sm:rounded-[26px] transition-colors duration-200">

            <ECGChart
              signal={signal}
            />

          </div>

        </section>


        {/* =====================================================
            INTERPRETATION
        ===================================================== */}

        <section className="mt-14 sm:mt-16">

          <div className="border-t border-[var(--border)] pt-9 sm:pt-10">

            <SectionHeading
              eyebrow="Interpretation"
              title="What the analysis indicates"
              description="A concise explanation of the model-derived result."
            />


            <div className="mt-6 grid border-y border-[var(--border)] bg-[var(--surface)] lg:grid-cols-[1fr_320px]">


              {/* MAIN EXPLANATION */}

              <div className="p-6 sm:p-9 lg:p-11">

                <div className="flex items-start gap-4">

                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: accentSoft,
                      color: accent,
                    }}
                  >
                    <Sparkles
                      size={18}
                      strokeWidth={1.7}
                    />
                  </div>


                  <div className="min-w-0">

                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] sm:text-[10px]">
                      Model interpretation
                    </p>


                    <h3 className="mt-2 text-[20px] font-semibold tracking-[-0.025em] text-[var(--text-primary)] sm:text-[22px]">

                      {isStress
                        ? "Elevated physiological stress pattern"
                        : "Baseline physiological pattern"}

                    </h3>


                    <p className="mt-4 max-w-[760px] text-[13px] leading-7 text-[var(--text-body)] sm:text-[14px]">

                      {isStress
                        ? "The extracted heart-rate variability features demonstrate a pattern that is more consistent with elevated physiological stress within this recording."
                        : "The extracted heart-rate variability features are consistent with a baseline physiological profile within this recording."}

                    </p>

                  </div>

                </div>

              </div>


              {/* RESULT SUMMARY */}

              <div className="border-t border-[var(--border)] bg-[var(--surface-subtle)] p-6 sm:p-9 lg:border-l lg:border-t-0">

                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] sm:text-[10px]">
                  AI prediction
                </p>


                <div className="mt-4">

                  <p
                    className="break-words text-[34px] font-semibold leading-none tracking-[-0.05em] sm:text-[38px]"
                    style={{
                      color: accent,
                    }}
                  >
                    {predictionText}
                  </p>

                </div>


                <div className="mt-4 flex items-center gap-2 text-[10px] text-[var(--text-secondary)] sm:text-[11px]">

                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: accent,
                    }}
                  />

                  ECG-derived assessment

                </div>

              </div>

            </div>


            {/* METHOD */}

            <div className="grid border-b border-[var(--border)] sm:grid-cols-3">

              <MethodItem
                icon={
                  <Activity
                    size={17}
                  />
                }
                title="ECG signal"
                text="Signal acquired and prepared for analysis."
              />

              <MethodItem
                icon={
                  <Waves
                    size={17}
                  />
                }
                title="HRV features"
                text="Heart-rate variability measurements extracted from the recording."
              />

              <MethodItem
                icon={
                  <Sparkles
                    size={17}
                  />
                }
                title="Classification"
                text="Extracted features evaluated by the trained stress model."
                last
              />

            </div>


            {/* DISCLAIMER */}

            <div className="mt-5 flex items-start gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-4 sm:mt-6 sm:px-5">

              <ShieldCheck
                size={16}
                strokeWidth={1.7}
                className="mt-0.5 shrink-0 text-[var(--icon)]"
              />

              <p className="text-[10px] leading-5 text-[var(--text-secondary)] sm:text-[11px]">
                This automated analysis is intended for research and educational use. It should not be interpreted as a medical diagnosis or a substitute for professional clinical assessment.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="mt-10 flex flex-col gap-2 border-t border-[var(--border)] px-1 pt-6 text-[10px] font-medium text-[var(--text-muted)] sm:mt-12 sm:flex-row sm:items-center sm:justify-between">

          <span>
            CardioSense AI · Clinical Analysis Workspace
          </span>

          <span>
            Research & educational use only
          </span>

        </footer>

      </div>

    </main>
  );
}


/* =============================================================
   SECTION HEADING
============================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <div>

      <p className="text-[9px] font-semibold uppercase tracking-[0.19em] text-[var(--text-muted)] sm:text-[10px]">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.035em] text-[var(--text-primary)] sm:text-[27px]">
        {title}
      </h2>

      {description && (
        <p className="mt-1.5 max-w-[700px] text-[12px] text-[var(--text-secondary)] sm:text-[13px]">
          {description}
        </p>
      )}

    </div>
  );
}


/* =============================================================
   PROFILE METRIC
============================================================= */

function ProfileMetric({
  label,
  value,
  unit,
  description,
  icon,
}) {
  return (
    <div
      className="
        min-w-0
        border-b
        border-[var(--border)]
        p-4
        transition-colors
        duration-200
        hover:bg-[var(--surface-hover)]
        sm:p-7
        [&:nth-child(odd)]:border-r
      "
    >

      <div className="flex min-w-0 items-center gap-2">

        <div className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-[var(--surface-muted)]
          text-[var(--icon)]
          sm:h-9
          sm:w-9
        ">
          {icon}
        </div>


        <span className="
          min-w-0
          truncate
          text-[8px]
          font-semibold
          uppercase
          tracking-[0.13em]
          text-[var(--text-muted)]
          sm:text-[9px]
          sm:tracking-[0.16em]
        ">
          {label}
        </span>

      </div>


      <div className="
        mt-5
        flex
        items-baseline
        gap-1.5
        sm:mt-6
        sm:gap-2
      ">

        <span className="
          text-[27px]
          font-semibold
          leading-none
          tracking-[-0.05em]
          text-[var(--text-primary)]
          sm:text-[34px]
        ">
          {value}
        </span>

        <span className="
          text-[9px]
          font-medium
          text-[var(--text-muted)]
          sm:text-[11px]
        ">
          {unit}
        </span>

      </div>


      <p className="
        mt-2
        text-[9px]
        leading-4
        text-[var(--text-secondary)]
        sm:mt-2.5
        sm:text-[11px]
      ">
        {description}
      </p>

    </div>
  );
}


/* =============================================================
   LARGE METRIC
============================================================= */

function LargeMetric({
  label,
  value,
  unit,
  description,
  icon,
  last = false,
}) {
  return (
    <div
      className={`
        min-w-0
        border-b
        border-[var(--border)]
        p-4
        transition-colors
        duration-200
        hover:bg-[var(--surface-hover)]
        sm:p-8
        lg:border-b-0
        lg:border-r
        ${last ? "lg:border-r-0" : ""}
        [&:nth-child(odd)]:border-r
        lg:[&:nth-child(odd)]:border-r-0
      `}
    >

      <div className="flex min-w-0 items-center gap-2">

        <div className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-[var(--surface-muted)]
          text-[var(--icon)]
        ">
          {icon}
        </div>


        <span className="
          min-w-0
          truncate
          text-[8px]
          font-semibold
          uppercase
          tracking-[0.13em]
          text-[var(--text-muted)]
          sm:text-[9px]
          sm:tracking-[0.16em]
        ">
          {label}
        </span>

      </div>


      <div className="
        mt-5
        flex
        items-baseline
        gap-1.5
        sm:mt-6
        sm:gap-2
      ">

        <span className="
          text-[28px]
          font-semibold
          leading-none
          tracking-[-0.05em]
          text-[var(--text-primary)]
          sm:text-[39px]
        ">
          {value}
        </span>


        <span className="
          text-[9px]
          font-medium
          text-[var(--text-muted)]
          sm:text-[12px]
        ">
          {unit}
        </span>

      </div>


      <p className="
        mt-2
        text-[9px]
        leading-4
        text-[var(--text-secondary)]
        sm:mt-2.5
        sm:text-[11px]
      ">
        {description}
      </p>

    </div>
  );
}


/* =============================================================
   INFORMATION ITEM
============================================================= */

function InformationItem({
  icon,
  label,
  value,
  last = false,
}) {
  return (
    <div
      className={`
        flex
        min-w-0
        items-center
        gap-3
        border-b
        border-[var(--border)]
        p-5
        sm:p-6
        lg:border-b-0
        lg:border-r
        ${last ? "lg:border-r-0" : ""}
      `}
    >

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--icon)]">
        {icon}
      </div>


      <div className="min-w-0">

        <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] sm:text-[9px]">
          {label}
        </p>

        <p className="mt-1 truncate text-[11px] font-semibold text-[var(--text-primary-soft)] sm:text-[12px]">
          {value}
        </p>

      </div>

    </div>
  );
}


/* =============================================================
   SUMMARY STEP
============================================================= */

function SummaryStep({
  number,
  title,
  text,
  last = false,
}) {
  return (
    <div
      className={`
        flex
        items-center
        gap-3
        p-5
        sm:p-6
        ${!last
          ? "border-b border-[var(--border)] sm:border-b-0 sm:border-r"
          : ""}
      `}
    >

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] text-[9px] font-semibold text-[var(--text-secondary)]">
        {number}
      </div>


      <div className="min-w-0">

        <p className="text-[10px] font-semibold text-[var(--text-primary-soft)]">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] text-[var(--text-muted)]">
          {text}
        </p>

      </div>

    </div>
  );
}


/* =============================================================
   METHOD ITEM
============================================================= */

function MethodItem({
  icon,
  title,
  text,
  last = false,
}) {
  return (
    <div
      className={`
        p-6
        sm:p-7
        ${!last
          ? "border-b border-[var(--border)] sm:border-b-0 sm:border-r"
          : ""}
      `}
    >

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--icon)]">
          {icon}
        </div>

        <p className="text-[12px] font-semibold text-[var(--text-primary-soft)]">
          {title}
        </p>

      </div>


      <p className="mt-3 text-[11px] leading-5 text-[var(--text-secondary)]">
        {text}
      </p>

    </div>
  );
}