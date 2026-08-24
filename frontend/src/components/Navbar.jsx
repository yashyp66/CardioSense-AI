import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "./ThemeProvider";


export default function Navbar() {
  const [scrolled, setScrolled] =
    useState(false);

  const {
    theme,
    toggleTheme,
  } = useTheme();


  /* ============================================================
     SCROLL STATE
  ============================================================ */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 20
      );
    };


    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll
    );


    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);


  /* ============================================================
     NAVIGATION
  ============================================================ */

  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  const goToAbout = () => {
    document
      .getElementById("capabilities")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };


  const goToAnalyze = () => {
    document
      .getElementById("upload")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };


  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <header
      className={`
        sticky
        top-0
        z-50
        border-b
        transition-all
        duration-300

        ${
          scrolled
            ? `
              border-[var(--border)]
              bg-[var(--surface)]/92
              shadow-[0_4px_20px_var(--shadow-color)]
              backdrop-blur-xl
            `
            : `
              border-transparent
              bg-[var(--background)]
            `
        }
      `}
    >

      <nav
        className="
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          px-5
          py-4
          sm:px-6
          md:px-8
        "
      >


        {/* ====================================================
            BRAND
        ==================================================== */}

        <button
          type="button"
          onClick={goToTop}
          className="
            group
            text-left
            outline-none
          "
          aria-label="Go to homepage"
        >

          <div className="flex items-center gap-3">


            {/* ECG MARK */}

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-[var(--border)]
                bg-[var(--surface)]
                shadow-[0_2px_8px_var(--shadow-color)]
                transition-all
                duration-300
                group-hover:scale-105
              "
            >

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >

                <path
                  d="M3 12H7L9.5 5L14 19L17 12H21"
                  stroke="#E85D5D"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

              </svg>

            </div>


            {/* BRAND TEXT */}

            <div className="min-w-0">

              <h1
                className="
                  text-base
                  font-semibold
                  tracking-[-0.02em]
                  text-[var(--text-primary)]
                  transition-colors
                  duration-200
                  md:text-lg
                "
              >
                CardioSense AI
              </h1>


              <p
                className="
                  text-[10px]
                  leading-4
                  text-[var(--text-muted)]
                  transition-colors
                  duration-200
                  sm:text-[11px]
                  md:text-xs
                "
              >
                AI-Powered ECG Stress Analysis
              </p>

            </div>

          </div>

        </button>


        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <div
          className="
            flex
            items-center
            gap-1.5
            sm:gap-2
            md:gap-3
          "
        >


          {/* ==================================================
              DASHBOARD
          ================================================== */}

          <button
            type="button"
            onClick={goToTop}
            className="
              hidden
              rounded-full
              px-3
              py-2
              text-sm
              font-medium
              text-[var(--text-secondary)]
              transition-all
              duration-200
              hover:bg-[var(--surface-hover)]
              hover:text-[var(--text-primary)]
              md:block
              md:px-4
            "
          >
            Dashboard
          </button>


          {/* ==================================================
              ABOUT
          ================================================== */}

          <button
            type="button"
            onClick={goToAbout}
            className="
              hidden
              rounded-full
              px-3
              py-2
              text-sm
              font-medium
              text-[var(--text-secondary)]
              transition-all
              duration-200
              hover:bg-[var(--surface-hover)]
              hover:text-[var(--text-primary)]
              md:block
              md:px-4
            "
          >
            About
          </button>


          {/* ==================================================
              THEME TOGGLE
          ================================================== */}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "light"
                ? "Switch to dark mode"
                : "Switch to light mode"
            }
            title={
              theme === "light"
                ? "Switch to dark mode"
                : "Switch to light mode"
            }
            className="
              group
              relative
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-[var(--border)]
              bg-[var(--surface)]
              text-[var(--text-secondary)]
              shadow-[0_2px_8px_var(--shadow-color)]
              transition-all
              duration-200
              hover:border-[var(--border-strong)]
              hover:bg-[var(--surface-hover)]
              hover:text-[var(--text-primary)]
              active:scale-95
              sm:h-10
              sm:w-10
            "
          >

            {/* LIGHT MODE ICON */}

            <Sun
              size={16}
              strokeWidth={1.8}
              className={`
                absolute
                transition-all
                duration-300

                ${
                  theme === "light"
                    ? "rotate-0 scale-100 opacity-100"
                    : "rotate-90 scale-50 opacity-0"
                }
              `}
            />


            {/* DARK MODE ICON */}

            <Moon
              size={16}
              strokeWidth={1.8}
              className={`
                absolute
                transition-all
                duration-300

                ${
                  theme === "dark"
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-50 opacity-0"
                }
              `}
            />

          </button>


          {/* ==================================================
              ANALYZE ECG
          ================================================== */}

          <button
            type="button"
            onClick={goToAnalyze}
            className="
              group
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[var(--primary)]
              px-4
              py-2.5
              text-xs
              font-semibold
              text-[var(--background)]
              shadow-[0_7px_20px_var(--shadow-color)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[var(--primary-hover)]
              hover:shadow-[0_10px_25px_var(--shadow-color)]
              sm:px-5
              sm:text-sm
            "
          >

            <span>
              Analyze ECG
            </span>


            <span
              className="
                transition-transform
                duration-200
                group-hover:translate-x-0.5
              "
              aria-hidden="true"
            >
              →
            </span>

          </button>

        </div>

      </nav>

    </header>
  );
}