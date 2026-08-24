import {
  Activity,
  AlertCircle,
  Check,
  FileHeart,
  HeartPulse,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";


export default function AnalysisOverlay({
  error = null,
  onRetry,
  onCancel,
}) {
  const hasError = Boolean(error);

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-[var(--background)]/95
        px-5
        backdrop-blur-xl
        transition-colors
        duration-200
      "
    >
      <div
        className="
          w-full
          max-w-[560px]
        "
      >

        {/* =====================================================
            BRAND / CONTEXT
        ===================================================== */}

        <div
          className="
            mb-8
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <div
            className={`
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              shadow-[0_4px_14px_var(--shadow-color)]
              transition-colors
              duration-200

              ${
                hasError
                  ? `
                    bg-[var(--danger-soft)]
                    text-[var(--danger)]
                  `
                  : `
                    bg-[var(--primary)]
                    text-[var(--background)]
                  `
              }
            `}
          >
            {hasError ? (
              <AlertCircle
                size={16}
                strokeWidth={1.8}
              />
            ) : (
              <HeartPulse
                size={16}
                strokeWidth={1.8}
              />
            )}
          </div>

          <span
            className="
              text-[12px]
              font-semibold
              tracking-[-0.01em]
              text-[var(--text-primary)]
            "
          >
            CardioSense AI
          </span>
        </div>


        {/* =====================================================
            MAIN SURFACE
        ===================================================== */}

        <div
          className="
            overflow-hidden
            rounded-[24px]
            border
            border-[var(--border)]
            bg-[var(--surface)]
            shadow-[0_24px_70px_var(--shadow-color)]
            transition-all
            duration-200
          "
        >

          {/* ===================================================
              HEADER
          =================================================== */}

          <div
            className="
              border-b
              border-[var(--border)]
              px-7
              py-7
              transition-colors
              duration-200
              sm:px-9
            "
          >
            <div
              className="
                flex
                items-start
                gap-4
              "
            >

              {/* STATUS ICON */}

              <div
                className={`
                  relative
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  transition-colors
                  duration-200

                  ${
                    hasError
                      ? `
                        bg-[var(--danger-soft)]
                        text-[var(--danger)]
                      `
                      : `
                        bg-[var(--success-soft)]
                        text-[var(--success)]
                      `
                  }
                `}
              >
                {hasError ? (
                  <AlertCircle
                    size={21}
                    strokeWidth={1.7}
                  />
                ) : (
                  <>
                    <Activity
                      size={20}
                      strokeWidth={1.7}
                    />

                    <span
                      className="
                        absolute
                        right-1
                        top-1
                        h-1.5
                        w-1.5
                        animate-pulse
                        rounded-full
                        bg-[var(--success)]
                      "
                    />
                  </>
                )}
              </div>


              {/* HEADER COPY */}

              <div className="min-w-0">

                <p
                  className={`
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.19em]

                    ${
                      hasError
                        ? "text-[var(--danger)]"
                        : "text-[var(--text-muted)]"
                    }
                  `}
                >
                  {hasError
                    ? "Analysis interrupted"
                    : "ECG analysis"}
                </p>


                <h2
                  className="
                    mt-1.5
                    text-[24px]
                    font-semibold
                    tracking-[-0.035em]
                    text-[var(--text-primary)]
                  "
                >
                  {hasError
                    ? "Analysis couldn't be completed"
                    : "Analyzing your recording"}
                </h2>


                <p
                  className="
                    mt-2
                    text-[12px]
                    leading-5
                    text-[var(--text-secondary)]
                  "
                >
                  {hasError
                    ? "The ECG could not be processed successfully. Your original files have not been changed."
                    : "Processing the ECG signal and preparing your physiological assessment."}
                </p>

              </div>

            </div>
          </div>


          {/* ===================================================
              ERROR STATE
          =================================================== */}

          {hasError ? (

            <div
              className="
                px-7
                py-7
                sm:px-9
                sm:py-8
              "
            >

              {/* ERROR MESSAGE */}

              <div
                className="
                  rounded-2xl
                  border
                  border-[var(--danger-border)]
                  bg-[var(--danger-soft)]
                  p-5
                "
              >

                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >

                  <div
                    className="
                      mt-0.5
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-[var(--surface)]
                      text-[var(--danger)]
                    "
                  >
                    <AlertCircle
                      size={16}
                      strokeWidth={1.9}
                    />
                  </div>


                  <div className="min-w-0">

                    <p
                      className="
                        text-[12px]
                        font-semibold
                        text-[var(--text-primary)]
                      "
                    >
                      We couldn't process this recording
                    </p>

                    <p
                      className="
                        mt-1.5
                        break-words
                        text-[11px]
                        leading-5
                        text-[var(--text-secondary)]
                      "
                    >
                      {typeof error === "string"
                        ? error
                        : error?.message ||
                          "An unexpected error occurred while processing the ECG."}
                    </p>

                  </div>

                </div>

              </div>


              {/* RECOVERY ACTIONS */}

              <div
                className="
                  mt-6
                  flex
                  flex-col-reverse
                  gap-3
                  sm:flex-row
                  sm:justify-end
                "
              >

                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="
                      inline-flex
                      h-10
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      border
                      border-[var(--border)]
                      bg-[var(--surface)]
                      px-5
                      text-[12px]
                      font-semibold
                      text-[var(--text-secondary)]
                      transition-all
                      duration-200
                      hover:bg-[var(--surface-subtle)]
                      hover:text-[var(--text-primary)]
                    "
                  >
                    <X
                      size={14}
                      strokeWidth={2}
                    />

                    Back to upload
                  </button>
                )}


                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="
                      inline-flex
                      h-10
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      bg-[var(--primary)]
                      px-5
                      text-[12px]
                      font-semibold
                      text-[var(--background)]
                      shadow-[0_6px_18px_var(--shadow-color)]
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:opacity-95
                    "
                  >
                    <RotateCcw
                      size={14}
                      strokeWidth={2}
                    />

                    Try again
                  </button>
                )}

              </div>

            </div>

          ) : (

            /* =================================================
               NORMAL ANALYSIS PIPELINE
            ================================================= */

            <div
              className="
                px-7
                py-7
                sm:px-9
                sm:py-8
              "
            >

              <div
                className="
                  space-y-0
                "
              >

                <AnalysisStep
                  icon={
                    <FileHeart
                      size={16}
                      strokeWidth={1.8}
                    />
                  }
                  title="Reading ECG recording"
                  description="Preparing signal data"
                  state="complete"
                />

                <StepLine />

                <AnalysisStep
                  icon={
                    <Activity
                      size={16}
                      strokeWidth={1.8}
                    />
                  }
                  title="Processing cardiac signal"
                  description="Detecting cardiac activity"
                  state="active"
                />

                <StepLine />

                <AnalysisStep
                  icon={
                    <Sparkles
                      size={16}
                      strokeWidth={1.8}
                    />
                  }
                  title="Extracting HRV features"
                  description="Calculating physiological markers"
                  state="pending"
                />

                <StepLine />

                <AnalysisStep
                  icon={
                    <HeartPulse
                      size={16}
                      strokeWidth={1.8}
                    />
                  }
                  title="Generating assessment"
                  description="Preparing analysis result"
                  state="pending"
                />

              </div>


              {/* =================================================
                  PROGRESS
              ================================================= */}

              <div
                className="
                  mt-8
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <span
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-[var(--text-muted)]
                    "
                  >
                    Processing
                  </span>

                  <span
                    className="
                      text-[10px]
                      font-medium
                      text-[var(--text-secondary)]
                    "
                  >
                    Please wait
                  </span>

                </div>


                <div
                  className="
                    mt-3
                    h-[3px]
                    overflow-hidden
                    rounded-full
                    bg-[var(--surface-muted)]
                  "
                >

                  <div
                    className="
                      h-full
                      w-[58%]
                      animate-[analysisProgress_2.2s_ease-in-out_infinite]
                      rounded-full
                      bg-[var(--success)]
                    "
                  />

                </div>

              </div>

            </div>
          )}


          {/* ===================================================
              FOOTER
          =================================================== */}

          <div
            className="
              flex
              items-center
              gap-2
              border-t
              border-[var(--border)]
              bg-[var(--surface-subtle)]
              px-7
              py-4
              text-[10px]
              text-[var(--text-muted)]
              transition-colors
              duration-200
              sm:px-9
            "
          >

            <span
              className={`
                flex
                h-5
                w-5
                shrink-0
                items-center
                justify-center
                rounded-full

                ${
                  hasError
                    ? `
                      bg-[var(--danger-soft)]
                      text-[var(--danger)]
                    `
                    : `
                      bg-[var(--success-soft)]
                      text-[var(--success)]
                    `
                }
              `}
            >

              {hasError ? (
                <AlertCircle
                  size={11}
                  strokeWidth={2.2}
                />
              ) : (
                <Check
                  size={11}
                  strokeWidth={2.2}
                />
              )}

            </span>


            <span>
              {hasError
                ? "Your original ECG files remain unchanged."
                : "Your original ECG files remain unchanged."}
            </span>

          </div>

        </div>


        {/* =====================================================
            SMALL STATUS
        ===================================================== */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-2
          "
        >

          <span
            className={`
              h-1.5
              w-1.5
              rounded-full

              ${
                hasError
                  ? "bg-[var(--danger)]"
                  : "animate-pulse bg-[var(--success)]"
              }
            `}
          />


          <span
            className="
              text-[10px]
              font-medium
              text-[var(--text-muted)]
            "
          >
            {hasError
              ? "Analysis stopped"
              : "Secure analysis in progress"}
          </span>

        </div>

      </div>


      {/* =======================================================
          ANIMATION
      ======================================================= */}

      <style>{`
        @keyframes analysisProgress {

          0% {
            transform: translateX(-100%);
          }

          45% {
            transform: translateX(10%);
          }

          70% {
            transform: translateX(55%);
          }

          100% {
            transform: translateX(180%);
          }

        }
      `}</style>

    </div>
  );
}


/* =============================================================
   ANALYSIS STEP
============================================================= */

function AnalysisStep({
  icon,
  title,
  description,
  state,
}) {
  const complete =
    state === "complete";

  const active =
    state === "active";


  return (
    <div
      className="
        flex
        items-center
        gap-4
      "
    >

      {/* STATUS */}

      <div
        className={`
          relative
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-full
          transition-colors
          duration-200

          ${
            complete
              ? `
                bg-[var(--success-soft)]
                text-[var(--success)]
              `
              : active
              ? `
                bg-[var(--success-soft)]
                text-[var(--success)]
              `
              : `
                bg-[var(--surface-muted)]
                text-[var(--text-muted)]
              `
          }
        `}
      >

        {complete ? (
          <Check
            size={16}
            strokeWidth={2.2}
          />
        ) : (
          icon
        )}


        {active && (
          <span
            className="
              absolute
              inset-0
              animate-ping
              rounded-full
              border
              border-[var(--success)]
              opacity-30
            "
          />
        )}

      </div>


      {/* CONTENT */}

      <div
        className="
          min-w-0
          flex-1
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
          "
        >

          <p
            className={`
              text-[12px]
              font-semibold

              ${
                active || complete
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)]"
              }
            `}
          >
            {title}
          </p>


          {complete && (
            <span
              className="
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[var(--success)]
              "
            >
              Complete
            </span>
          )}


          {active && (
            <span
              className="
                flex
                items-center
                gap-1.5
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[var(--success)]
              "
            >

              <span
                className="
                  h-1
                  w-1
                  animate-pulse
                  rounded-full
                  bg-[var(--success)]
                "
              />

              Active

            </span>
          )}

        </div>


        <p
          className={`
            mt-1
            text-[10px]

            ${
              active || complete
                ? "text-[var(--text-secondary)]"
                : "text-[var(--text-muted)]"
            }
          `}
        >
          {description}
        </p>

      </div>

    </div>
  );
}


/* =============================================================
   CONNECTOR
============================================================= */

function StepLine() {
  return (
    <div
      className="
        ml-[17px]
        h-5
        border-l
        border-dashed
        border-[var(--border)]
      "
    />
  );
}