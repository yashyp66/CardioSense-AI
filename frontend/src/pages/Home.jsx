import {
  lazy,
  Suspense,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import UploadSection from "../components/UploadSection";


// ============================================================
// CODE SPLITTING
// ============================================================
//
// ResultDashboard is only needed after an ECG analysis has
// completed. Loading it lazily keeps the initial application
// bundle smaller and improves first-load performance.
//

const ResultDashboard = lazy(
  () => import("../components/ResultDashboard")
);


// ============================================================
// REPORT CHUNK LOADING STATE
// ============================================================

function ReportLoadingState() {
  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[var(--background)]
        px-6
        text-[var(--text-primary)]
        transition-colors
        duration-200
      "
    >
      <div
        className="
          flex
          w-full
          max-w-sm
          flex-col
          items-center
          rounded-[24px]
          border
          border-[var(--border)]
          bg-[var(--surface)]
          px-7
          py-8
          text-center
          shadow-[0_20px_60px_var(--shadow-color)]
        "
      >

        {/* Loading indicator */}

        <div
          className="
            relative
            flex
            h-12
            w-12
            items-center
            justify-center
          "
        >

          <div
            className="
              absolute
              inset-0
              animate-ping
              rounded-full
              border
              border-[var(--success)]
              opacity-20
            "
          />

          <div
            className="
              absolute
              inset-1
              rounded-full
              border-2
              border-[var(--surface-muted)]
            "
          />

          <div
            className="
              absolute
              inset-1
              animate-spin
              rounded-full
              border-2
              border-transparent
              border-t-[var(--success)]
            "
          />

          <span
            className="
              h-2
              w-2
              rounded-full
              bg-[var(--success)]
            "
          />

        </div>


        {/* Copy */}

        <p
          className="
            mt-5
            text-[13px]
            font-semibold
            tracking-[-0.01em]
            text-[var(--text-primary)]
          "
        >
          Preparing your analysis
        </p>

        <p
          className="
            mt-1.5
            text-[11px]
            leading-5
            text-[var(--text-secondary)]
          "
        >
          Loading your ECG results securely.
        </p>

      </div>
    </div>
  );
}


// ============================================================
// HOME
// ============================================================

export default function Home() {

  const [
    reportResult,
    setReportResult,
  ] = useState(null);


  // ==========================================================
  // REPORT READY
  // ==========================================================

  const handleReportReady = (
    result
  ) => {

    setReportResult(result);

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });

  };


  // ==========================================================
  // NEW ANALYSIS
  // ==========================================================

  const handleNewAnalysis = () => {

    setReportResult(null);

    setTimeout(() => {

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    }, 50);

  };


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div
      className="
        min-h-screen
        bg-[var(--background)]
        text-[var(--text-primary)]
        transition-colors
        duration-200
      "
    >

      <AnimatePresence mode="wait">


        {/* ====================================================
            REPORT PAGE
        ==================================================== */}

        {reportResult ? (

          <motion.div
            key="report"

            initial={{
              opacity: 0,
              y: 12,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            exit={{
              opacity: 0,
              y: -12,
            }}

            transition={{
              duration: 0.35,
              ease: "easeOut",
            }}

            className="
              min-h-screen
              bg-[var(--background)]
              text-[var(--text-primary)]
              transition-colors
              duration-200
            "
          >

            <Suspense
              fallback={
                <ReportLoadingState />
              }
            >

              <ResultDashboard
                result={reportResult}
                onNewAnalysis={
                  handleNewAnalysis
                }
              />

            </Suspense>

          </motion.div>


        ) : (


          /* ==================================================
             LANDING / ANALYSIS PAGE
          ================================================== */

          <motion.div
            key="analysis"

            initial={{
              opacity: 0,
              y: 8,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            exit={{
              opacity: 0,
              y: -8,
            }}

            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}

            className="
              min-h-screen
              bg-[var(--background)]
              text-[var(--text-primary)]
              transition-colors
              duration-200
            "
          >

            <Navbar />


            <main
              className="
                mx-auto
                w-full
                max-w-7xl
                px-6
                py-8
                md:py-12
              "
            >

              {/* =================================================
                  HERO
              ================================================= */}

              <Hero />


              {/* =================================================
                  ECG UPLOAD
              ================================================= */}

              <section
                id="analysis"
                className="
                  mt-10
                  md:mt-14
                "
              >

                <UploadSection
                  onReportReady={
                    handleReportReady
                  }
                />

              </section>


              {/* =================================================
                  FOOTER
              ================================================= */}

              <footer
                className="
                  mt-16
                  pb-8
                  text-center
                  text-xs
                  text-[var(--text-muted)]
                  transition-colors
                  duration-200
                "
              >

                For research and educational use only.

              </footer>

            </main>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
}