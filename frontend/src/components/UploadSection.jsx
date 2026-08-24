import { useState } from "react";

import {
  Activity,
  FileText,
  Check,
  ArrowRight,
  ShieldCheck,
  Cpu,
  BarChart3,
  AlertCircle,
} from "lucide-react";

import { predictECG } from "../services/api";
import AnalysisOverlay from "./AnalysisOverlay";


export default function UploadSection({
  onReportReady,
}) {
  const [datFile, setDatFile] =
    useState(null);

  const [heaFile, setHeaFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [analysisError, setAnalysisError] =
    useState(null);


  /* =========================================================
     FILE HANDLERS
  ========================================================= */

  const handleDatChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setDatFile(null);
      return;
    }

    const validation = validateFile(file, ".dat");

    if (!validation.valid) {
      setDatFile(null);
      event.target.value = "";
      setError(validation.message);
      return;
    }

    setDatFile(file);
    setError("");
  };


  const handleHeaChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setHeaFile(null);
      return;
    }

    const validation = validateFile(file, ".hea");

    if (!validation.valid) {
      setHeaFile(null);
      event.target.value = "";
      setError(validation.message);
      return;
    }

    setHeaFile(file);
    setError("");
  };


  /* =========================================================
     GENERATE REPORT
  ========================================================= */

  const handleSubmit = async () => {
    if (loading) {
      return;
    }

    const validation = validateRecordPair(
      datFile,
      heaFile
    );

    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnalysisError(null);

      const response = await predictECG(
        datFile,
        heaFile
      );

      const finalResult = {
        ...response,
        datFile,
        heaFile,
      };

      /*
       * Give the analysis overlay a short moment to communicate
       * completion before transitioning to the report.
       */
      setTimeout(() => {
        setLoading(false);

        if (onReportReady) {
          onReportReady(finalResult);
        }
      }, 1200);

    } catch (err) {
      console.error("ECG prediction error:", err);

      setLoading(false);

      setAnalysisError(
        err?.message ||
          "Prediction failed. Please verify that the .dat and .hea files belong to the same ECG record and try again."
      );
    }
  };


  const filesReady =
    Boolean(
      datFile &&
      heaFile
    );


  /* =========================================================
     UI
  ========================================================= */

  return (
    <>

      {(loading || analysisError) && (
        <AnalysisOverlay
          error={analysisError}
          onRetry={
            analysisError
              ? () => {
                  setAnalysisError(null);
                  setError("");
                  handleSubmit();
                }
              : undefined
          }
          onCancel={
            analysisError
              ? () => {
                  setAnalysisError(null);
                  setError("");
                }
              : undefined
          }
        />
      )}


      <section
        id="upload"
        className="
          relative
          scroll-mt-24
        "
      >


        {/* =================================================
            SECTION INTRO
        ================================================= */}

        <div
          className="
            mb-7
            flex
            flex-col
            gap-5
            md:flex-row
            md:items-end
            md:justify-between
          "
        >

          <div className="max-w-2xl">


            {/* SECTION LABEL */}

            <div
              className="
                mb-3
                flex
                items-center
                gap-2
              "
            >

              <span
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[var(--text-muted)]
                "
              >
                ECG Analysis
              </span>


              <span
                className="
                  h-px
                  w-8
                  bg-[var(--border-strong)]
                "
              />


              <span
                className="
                  text-[11px]
                  text-[var(--text-muted)]
                "
              >
                WFDB format
              </span>

            </div>


            {/* HEADING */}

            <h2
              className="
                text-3xl
                font-semibold
                tracking-[-0.03em]
                text-[var(--text-primary)]
                transition-colors
                duration-200
                md:text-4xl
              "
            >
              Prepare your recording.
            </h2>


            {/* DESCRIPTION */}

            <p
              className="
                mt-3
                max-w-xl
                text-sm
                leading-6
                text-[var(--text-secondary)]
                transition-colors
                duration-200
                md:text-base
              "
            >
              Upload the matching WFDB data
              and header files. CardioSense will
              process the ECG, extract HRV
              biomarkers and generate the clinical
              analysis.
            </p>

          </div>


          {/* =================================================
              STATUS
          ================================================= */}

          <div
            className={`
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              px-3.5
              py-2
              text-xs
              font-medium
              transition-all
              duration-200

              ${
                filesReady
                  ? `
                    border-[var(--success)]/20
                    bg-[var(--success-soft)]
                    text-[var(--success)]
                  `
                  : `
                    border-[var(--border)]
                    bg-[var(--surface)]
                    text-[var(--text-secondary)]
                  `
              }
            `}
          >

            <span
              className={`
                h-1.5
                w-1.5
                rounded-full

                ${
                  filesReady
                    ? "bg-[var(--success)]"
                    : "bg-[var(--text-faint)]"
                }
              `}
            />


            {filesReady
              ? "Record ready for analysis"
              : "Awaiting ECG files"}

          </div>

        </div>


        {/* =================================================
            MAIN ANALYSIS PANEL
        ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-[24px]
            border
            border-[var(--border)]
            bg-[var(--surface)]
            shadow-[0_18px_60px_var(--shadow-color)]
            transition-all
            duration-200
          "
        >


          {/* =================================================
              PANEL HEADER
          ================================================= */}

          <div
            className="
              border-b
              border-[var(--border)]
              px-5
              py-5
              md:px-7
            "
          >

            <div
              className="
                flex
                flex-col
                gap-5
                md:flex-row
                md:items-center
                md:justify-between
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[var(--surface-muted)]
                  "
                >

                  <Activity
                    className="
                      h-5
                      w-5
                      text-[#E85D5D]
                    "
                    strokeWidth={1.8}
                  />

                </div>


                <div>

                  <p
                    className="
                      text-sm
                      font-medium
                      text-[var(--text-primary)]
                    "
                  >
                    ECG recording
                  </p>


                  <p
                    className="
                      text-xs
                      text-[var(--text-muted)]
                    "
                  >
                    Two files are required for
                    analysis
                  </p>

                </div>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-5
                  text-xs
                  text-[var(--text-muted)]
                "
              >

                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                  "
                >

                  <ShieldCheck
                    className="h-3.5 w-3.5"
                  />

                  Secure processing

                </span>


                <span
                  className="
                    hidden
                    text-[var(--text-faint)]
                    md:inline
                  "
                >
                  •
                </span>


                <span>
                  WFDB compatible
                </span>

              </div>

            </div>

          </div>


          {/* =================================================
              FILE SELECTION
          ================================================= */}

          <div
            className="
              grid
              gap-0
              md:grid-cols-2
            "
          >

            {/* DAT */}

            <FileSelector
              step="01"
              title="ECG signal"
              subtitle="Waveform data"
              extension=".dat"
              description="Primary signal recording containing the ECG samples."
              file={datFile}
              onChange={handleDatChange}
              icon={
                <Activity
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              }
              accent="red"
            />


            {/* HEA */}

            <FileSelector
              step="02"
              title="Record header"
              subtitle="Signal metadata"
              extension=".hea"
              description="Header containing sampling rate, channels and record metadata."
              file={heaFile}
              onChange={handleHeaChange}
              icon={
                <FileText
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              }
              accent="slate"
              bordered
            />

          </div>


          {/* =================================================
              RECORD STATUS
          ================================================= */}

          <div
            className="
              border-t
              border-[var(--border)]
              bg-[var(--surface-subtle)]
              px-5
              py-5
              transition-colors
              duration-200
              md:px-7
            "
          >

            <div
              className="
                flex
                flex-col
                gap-4
                md:flex-row
                md:items-center
                md:justify-between
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className={`
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full

                    ${
                      filesReady
                        ? "bg-[var(--success-soft)]"
                        : "bg-[var(--surface-muted)]"
                    }
                  `}
                >

                  {filesReady ? (

                    <Check
                      className="
                        h-4
                        w-4
                        text-[var(--success)]
                      "
                      strokeWidth={2}
                    />

                  ) : (

                    <Activity
                      className="
                        h-4
                        w-4
                        text-[var(--text-muted)]
                      "
                      strokeWidth={1.8}
                    />

                  )}

                </div>


                <div>

                  <p
                    className="
                      text-sm
                      font-medium
                      text-[var(--text-primary)]
                    "
                  >

                    {filesReady
                      ? "ECG record is complete"
                      : "Complete the ECG record"}

                  </p>


                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-[var(--text-muted)]
                    "
                  >

                    {filesReady
                      ? "Both required files have been selected."
                      : "Select the matching .dat and .hea files."}

                  </p>

                </div>

              </div>


              {/* FILE STATUS */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  text-[var(--text-muted)]
                "
              >

                <span
                  className={
                    datFile
                      ? "font-medium text-[var(--success)]"
                      : ""
                  }
                >
                  DAT
                </span>


                <span>
                  +
                </span>


                <span
                  className={
                    heaFile
                      ? "font-medium text-[var(--success)]"
                      : ""
                  }
                >
                  HEA
                </span>

              </div>

            </div>

          </div>


          {/* =================================================
              ANALYSIS INFO
          ================================================= */}

          <div
            className="
              grid
              border-t
              border-[var(--border)]
              md:grid-cols-3
            "
          >

            <InfoItem
              icon={
                <Cpu
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              }
              title="Signal processing"
              text="ECG waveform analysis"
            />


            <InfoItem
              icon={
                <BarChart3
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              }
              title="HRV biomarkers"
              text="RR, SDNN, RMSSD & pNN50"
            />


            <InfoItem
              icon={
                <Activity
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />
              }
              title="Stress assessment"
              text="AI-assisted classification"
            />

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div
              className="
                border-t
                border-[var(--danger)]/20
                bg-[var(--danger-soft)]
                px-5
                py-4
                md:px-7
              "
            >

              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >

                <AlertCircle
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-[var(--danger)]
                  "
                />


                <div>

                  <p
                    className="
                      text-sm
                      font-medium
                      text-[var(--danger)]
                    "
                  >
                    Analysis could not start
                  </p>


                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-[var(--text-secondary)]
                    "
                  >
                    {error}
                  </p>

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              ACTION
          ================================================= */}

          <div
            className="
              border-t
              border-[var(--border)]
              px-5
              py-5
              md:px-7
            "
          >

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !filesReady}
              aria-busy={loading}
              aria-disabled={loading || !filesReady}
              className={`
                group
                flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-xl
                py-3.5
                text-sm
                font-medium
                transition-all
                duration-300

                ${
                  loading
                    ? `
                      cursor-not-allowed
                      bg-[var(--surface-muted)]
                      text-[var(--text-muted)]
                    `
                    : filesReady
                    ? `
                      bg-[var(--primary)]
                      text-[var(--background)]
                      shadow-[0_8px_24px_var(--shadow-color)]
                      hover:-translate-y-0.5
                      hover:bg-[var(--primary-hover)]
                      hover:shadow-[0_12px_30px_var(--shadow-color)]
                    `
                    : `
                      cursor-not-allowed
                      bg-[var(--surface-muted)]
                      text-[var(--text-muted)]
                    `
                }
              `}
            >

              {loading ? (

                <>

                  <span
                    className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-[var(--text-muted)]
                      border-t-transparent
                    "
                  />

                  Processing ECG...

                </>

              ) : (

                <>

                  Generate Clinical Report


                  <ArrowRight
                    className={`
                      h-4
                      w-4
                      transition-transform
                      duration-200

                      ${
                        filesReady
                          ? "group-hover:translate-x-1"
                          : ""
                      }
                    `}
                    strokeWidth={1.8}
                  />

                </>

              )}

            </button>


            <p
              className="
                mt-3
                text-center
                text-[11px]
                text-[var(--text-muted)]
              "
            >
              Analysis uses the selected ECG
              recording and does not modify your
              original files.
            </p>

          </div>

        </div>

      </section>

    </>
  );
}


/*
 * =========================================================
 * FILE VALIDATION
 * =========================================================
 */

function validateFile(file, expectedExtension) {
  if (!file) {
    return {
      valid: false,
      message: `Select a ${expectedExtension} file before continuing.`,
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      message: `The selected ${expectedExtension} file is empty. Please choose a valid ECG file.`,
    };
  }

  const fileName = file.name || "";
  const lowerName = fileName.toLowerCase();
  const extension = expectedExtension.toLowerCase();

  if (!lowerName.endsWith(extension)) {
    return {
      valid: false,
      message: `Invalid file type. Please select a ${expectedExtension} file.`,
    };
  }

  return {
    valid: true,
    message: "",
  };
}


function getRecordStem(file) {
  if (!file?.name) {
    return "";
  }

  return file.name
    .replace(/\.(dat|hea)$/i, "")
    .trim()
    .toLowerCase();
}


function validateRecordPair(datFile, heaFile) {
  const datValidation = validateFile(
    datFile,
    ".dat"
  );

  if (!datValidation.valid) {
    return datValidation;
  }

  const heaValidation = validateFile(
    heaFile,
    ".hea"
  );

  if (!heaValidation.valid) {
    return heaValidation;
  }

  const datStem = getRecordStem(datFile);
  const heaStem = getRecordStem(heaFile);

  if (!datStem || !heaStem) {
    return {
      valid: false,
      message:
        "The selected ECG files have invalid filenames. Please choose a matching .dat and .hea pair.",
    };
  }

  if (datStem !== heaStem) {
    return {
      valid: false,
      message:
        "The .dat and .hea files do not belong to the same ECG record. Please select the matching pair.",
    };
  }

  return {
    valid: true,
    message: "",
  };
}


/*
 * =========================================================
 * FILE SELECTOR
 * =========================================================
 */

function FileSelector({
  step,
  title,
  subtitle,
  extension,
  description,
  file,
  onChange,
  icon,
  accent,
  bordered,
}) {

  const isSelected =
    Boolean(file);

  const isRed =
    accent === "red";


  return (

    <div
      className={`
        relative
        px-5
        py-6
        transition-colors
        duration-200
        md:px-7
        md:py-7

        ${
          bordered
            ? `
              border-t
              border-[var(--border)]
              md:border-l
              md:border-t-0
            `
            : ""
        }
      `}
    >


      {/* ======================================================
          STEP
      ====================================================== */}

      <div
        className="
          mb-5
          flex
          items-center
          justify-between
        "
      >

        <span
          className="
            text-[11px]
            font-semibold
            tracking-[0.16em]
            text-[var(--text-muted)]
          "
        >
          STEP {step}
        </span>


        <span
          className={`
            rounded-full
            border
            px-2.5
            py-1
            text-[10px]
            font-medium

            ${
              isSelected
                ? `
                  border-[var(--success)]/20
                  bg-[var(--success-soft)]
                  text-[var(--success)]
                `
                : `
                  border-[var(--border)]
                  bg-[var(--surface-subtle)]
                  text-[var(--text-muted)]
                `
            }
          `}
        >
          {isSelected
            ? "Selected"
            : "Required"}
        </span>

      </div>


      {/* ======================================================
          TITLE
      ====================================================== */}

      <div
        className="
          flex
          items-start
          gap-3
        "
      >

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl

            ${
              isRed
                ? `
                  bg-[var(--danger-soft)]
                  text-[var(--danger)]
                `
                : `
                  bg-[var(--surface-muted)]
                  text-[var(--text-secondary)]
                `
            }
          `}
        >
          {icon}
        </div>


        <div className="min-w-0">

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <h3
              className="
                text-sm
                font-medium
                text-[var(--text-primary)]
              "
            >
              {title}
            </h3>


            <span
              className="
                text-[10px]
                font-medium
                text-[var(--text-muted)]
              "
            >
              {extension}
            </span>

          </div>


          <p
            className="
              mt-0.5
              text-xs
              text-[var(--text-muted)]
            "
          >
            {subtitle}
          </p>

        </div>

      </div>


      {/* ======================================================
          DESCRIPTION
      ====================================================== */}

      <p
        className="
          mt-4
          max-w-md
          text-xs
          leading-5
          text-[var(--text-secondary)]
        "
      >
        {description}
      </p>


      {/* ======================================================
          FILE INPUT
      ====================================================== */}

      <div className="mt-5">

        <label
          className={`
            flex
            cursor-pointer
            items-center
            justify-between
            rounded-xl
            border
            px-4
            py-3
            transition-all
            duration-200

            ${
              isSelected
                ? `
                  border-[var(--success)]/20
                  bg-[var(--success-soft)]
                `
                : `
                  border-[var(--border)]
                  bg-[var(--surface)]
                  hover:border-[var(--border-strong)]
                  hover:bg-[var(--surface-hover)]
                `
            }
          `}
        >

          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >

            {isSelected ? (

              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[var(--success-soft)]
                "
              >

                <Check
                  className="
                    h-4
                    w-4
                    text-[var(--success)]
                  "
                  strokeWidth={2}
                />

              </div>

            ) : (

              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[var(--surface-muted)]
                "
              >

                <FileText
                  className="
                    h-4
                    w-4
                    text-[var(--text-secondary)]
                  "
                  strokeWidth={1.8}
                />

              </div>

            )}


            <div className="min-w-0">

              <p
                className="
                  truncate
                  text-xs
                  font-medium
                  text-[var(--text-primary)]
                "
              >

                {isSelected
                  ? file.name
                  : `Select ${extension} file`}

              </p>


              <p
                className="
                  mt-0.5
                  text-[10px]
                  text-[var(--text-muted)]
                "
              >

                {isSelected
                  ? formatFileSize(
                      file.size
                    )
                  : "Click to browse your files"}

              </p>

            </div>

          </div>


          <span
            className="
              ml-3
              shrink-0
              text-xs
              font-medium
              text-[var(--text-secondary)]
            "
          >
            Browse
          </span>


          <input
            type="file"
            accept={extension}
            onChange={onChange}
            className="sr-only"
          />

        </label>

      </div>

    </div>
  );
}


/*
 * =========================================================
 * INFO ITEM
 * =========================================================
 */

function InfoItem({
  icon,
  title,
  text,
}) {

  return (

    <div
      className="
        flex
        items-center
        gap-3
        border-b
        border-[var(--border)]
        px-5
        py-4
        last:border-b-0
        md:border-b-0
        md:border-r
        md:px-7
        md:last:border-r-0
      "
    >

      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-[var(--surface-muted)]
          text-[var(--text-secondary)]
        "
      >
        {icon}
      </div>


      <div className="min-w-0">

        <p
          className="
            text-xs
            font-medium
            text-[var(--text-primary)]
          "
        >
          {title}
        </p>


        <p
          className="
            mt-0.5
            truncate
            text-[10px]
            text-[var(--text-muted)]
          "
        >
          {text}
        </p>

      </div>

    </div>
  );
}


/*
 * =========================================================
 * FILE SIZE
 * =========================================================
 */

function formatFileSize(
  bytes
) {

  if (
    !bytes ||
    bytes <= 0
  ) {
    return "File selected";
  }


  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];


  let size = bytes;

  let unitIndex = 0;


  while (
    size >= 1024 &&
    unitIndex <
      units.length - 1
  ) {

    size /= 1024;

    unitIndex++;

  }


  return `${size.toFixed(
    size >= 10 ||
      unitIndex === 0
      ? 0
      : 1
  )} ${units[unitIndex]}`;
}