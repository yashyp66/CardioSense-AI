import { useEffect, useRef, useState } from "react";

import { useTheme } from "./ThemeProvider";


export default function Hero() {
  const canvasRef = useRef(null);

  const [ecgSignal, setEcgSignal] =
    useState([]);

  const [signalReady, setSignalReady] =
    useState(false);

  const [heartRate, setHeartRate] =
    useState("--");

  const [rrInterval, setRrInterval] =
    useState("--");

  const [signalQuality, setSignalQuality] =
    useState("Analyzing");


  /*
   * =========================================================
   * THEME
   * =========================================================
   */

  const { isDark } = useTheme();


  /*
   * =========================================================
   * LOAD REAL ECG SAMPLE
   * =========================================================
   *
   * Expected file:
   *
   * frontend/public/sample-ecg.json
   *
   * Supported formats:
   *
   * [0.1, 0.2, 0.3, ...]
   *
   * OR
   *
   * { signal: [0.1, 0.2, 0.3, ...] }
   */

  useEffect(() => {
    let active = true;


    fetch("/sample-ecg.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Could not load sample ECG"
          );
        }

        return response.json();
      })
      .then((data) => {
        if (!active) return;


        const signal =
          Array.isArray(data)
            ? data
            : Array.isArray(data.signal)
            ? data.signal
            : [];


        const cleaned = signal
          .map(Number)
          .filter((value) =>
            Number.isFinite(value)
          );


        if (cleaned.length < 100) {
          throw new Error(
            "ECG sample contains too few samples"
          );
        }


        setEcgSignal(cleaned);
        setSignalReady(true);
      })
      .catch((error) => {
        console.error(
          "ECG sample loading failed:",
          error
        );

        setSignalReady(false);
      });


    return () => {
      active = false;
    };
  }, []);


  /*
   * =========================================================
   * ECG METRICS
   * =========================================================
   */

  useEffect(() => {
    if (
      !signalReady ||
      ecgSignal.length === 0
    ) {
      return;
    }


    const samplingRate = 360;


    const min =
      Math.min(...ecgSignal);

    const max =
      Math.max(...ecgSignal);

    const range =
      max - min || 1;


    const normalized =
      ecgSignal.map(
        (value) =>
          (value - min) /
          range
      );


    /*
     * -------------------------------------------------------
     * R-PEAK DETECTION
     * -------------------------------------------------------
     */

    const peaks = [];


    const minimumDistance =
      Math.floor(
        samplingRate * 0.45
      );


    const threshold = 0.72;


    for (
      let i = 2;
      i < normalized.length - 2;
      i++
    ) {
      const value =
        normalized[i];


      const isPeak =
        value > threshold &&
        value >= normalized[i - 1] &&
        value >= normalized[i + 1] &&
        value >= normalized[i - 2] &&
        value >= normalized[i + 2];


      if (!isPeak) continue;


      if (
        peaks.length === 0 ||
        i -
          peaks[
            peaks.length - 1
          ] >=
          minimumDistance
      ) {
        peaks.push(i);
      }
    }


    /*
     * -------------------------------------------------------
     * RR INTERVAL
     * -------------------------------------------------------
     */

    const rrIntervals = [];


    for (
      let i = 1;
      i < peaks.length;
      i++
    ) {
      const rr =
        ((peaks[i] -
          peaks[i - 1]) /
          samplingRate) *
        1000;


      if (
        rr > 450 &&
        rr < 1500
      ) {
        rrIntervals.push(rr);
      }
    }


    if (
      rrIntervals.length > 0
    ) {
      const averageRR =
        rrIntervals.reduce(
          (sum, value) =>
            sum + value,
          0
        ) /
        rrIntervals.length;


      const calculatedHR =
        60000 / averageRR;


      setHeartRate(
        Math.round(
          calculatedHR
        )
      );


      setRrInterval(
        Math.round(
          averageRR
        )
      );
    } else {
      setHeartRate("--");
      setRrInterval("--");
    }


    /*
     * -------------------------------------------------------
     * SIGNAL QUALITY
     * -------------------------------------------------------
     */

    let totalChange = 0;


    for (
      let i = 1;
      i < normalized.length;
      i++
    ) {
      totalChange +=
        Math.abs(
          normalized[i] -
            normalized[i - 1]
        );
    }


    const averageChange =
      totalChange /
      normalized.length;


    if (
      Number.isFinite(
        averageChange
      ) &&
      averageChange < 0.035
    ) {
      setSignalQuality("Good");
    } else {
      setSignalQuality("Stable");
    }
  }, [
    ecgSignal,
    signalReady,
  ]);


  /*
   * =========================================================
   * ECG CANVAS
   * =========================================================
   */

  useEffect(() => {
    if (
      !signalReady ||
      ecgSignal.length === 0
    ) {
      return;
    }


    const canvas =
      canvasRef.current;


    if (!canvas) return;


    const ctx =
      canvas.getContext("2d");


    if (!ctx) return;


    let animationFrame;


    /*
     * -------------------------------------------------------
     * NORMALIZE SIGNAL
     * -------------------------------------------------------
     */

    const min =
      Math.min(...ecgSignal);

    const max =
      Math.max(...ecgSignal);

    const range =
      max - min || 1;


    const normalizedSignal =
      ecgSignal.map(
        (value) =>
          (value - min) /
          range
      );


    /*
     * -------------------------------------------------------
     * DISPLAY SETTINGS
     * -------------------------------------------------------
     */

    const SAMPLES_PER_PIXEL =
      2.0;


    const SCROLL_SPEED =
      0.32;


    /*
     * -------------------------------------------------------
     * SELECT A CONTINUOUS ECG WINDOW
     * -------------------------------------------------------
     */

    const DISPLAY_LENGTH =
      Math.min(
        normalizedSignal.length,
        5400
      );


    const startIndex =
      Math.min(
        600,
        Math.max(
          0,
          normalizedSignal.length -
            DISPLAY_LENGTH
        )
      );


    const displaySignal =
      normalizedSignal.slice(
        startIndex,
        startIndex +
          DISPLAY_LENGTH
      );


    /*
     * -------------------------------------------------------
     * SEAMLESS DISPLAY SIGNAL
     * -------------------------------------------------------
     */

    const CROSSFADE_SAMPLES =
      180;


    const seamlessSignal = [
      ...displaySignal.slice(
        0,
        Math.max(
          0,
          displaySignal.length -
            CROSSFADE_SAMPLES
        )
      ),
    ];


    const fadeStart =
      Math.max(
        0,
        displaySignal.length -
          CROSSFADE_SAMPLES
      );


    const actualCrossfade =
      Math.min(
        CROSSFADE_SAMPLES,
        displaySignal.length
      );


    for (
      let i = 0;
      i < actualCrossfade;
      i++
    ) {
      const progress =
        actualCrossfade <= 1
          ? 1
          : i /
            (actualCrossfade - 1);


      const endValue =
        displaySignal[
          fadeStart + i
        ];


      const beginningValue =
        displaySignal[i];


      const blended =
        endValue *
          (1 - progress) +
        beginningValue *
          progress;


      seamlessSignal.push(
        blended
      );
    }


    if (
      seamlessSignal.length < 100
    ) {
      return;
    }


    /*
     * -------------------------------------------------------
     * RESIZE
     * -------------------------------------------------------
     */

    const resize = () => {
      const rect =
        canvas.getBoundingClientRect();


      const dpr =
        window.devicePixelRatio || 1;


      canvas.width =
        Math.round(
          rect.width * dpr
        );


      canvas.height =
        Math.round(
          rect.height * dpr
        );


      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );
    };


    /*
     * -------------------------------------------------------
     * ECG GRID
     * -------------------------------------------------------
     *
     * Theme-aware canvas colors.
     */

    const drawGrid = (
      width,
      height
    ) => {

      ctx.clearRect(
        0,
        0,
        width,
        height
      );


      /*
       * LIGHT MODE
       */

      const minorGrid =
        isDark
          ? "rgba(255, 255, 255, 0.025)"
          : "rgba(17, 24, 39, 0.045)";


      const majorGrid =
        isDark
          ? "rgba(255, 255, 255, 0.055)"
          : "rgba(17, 24, 39, 0.075)";


      /*
       * Small ECG squares.
       */

      ctx.lineWidth = 1;

      ctx.strokeStyle =
        minorGrid;


      for (
        let x = 0;
        x <= width;
        x += 10
      ) {
        ctx.beginPath();

        ctx.moveTo(
          x,
          0
        );

        ctx.lineTo(
          x,
          height
        );

        ctx.stroke();
      }


      for (
        let y = 0;
        y <= height;
        y += 10
      ) {
        ctx.beginPath();

        ctx.moveTo(
          0,
          y
        );

        ctx.lineTo(
          width,
          y
        );

        ctx.stroke();
      }


      /*
       * Major ECG squares.
       */

      ctx.strokeStyle =
        majorGrid;


      for (
        let x = 0;
        x <= width;
        x += 50
      ) {
        ctx.beginPath();

        ctx.moveTo(
          x,
          0
        );

        ctx.lineTo(
          x,
          height
        );

        ctx.stroke();
      }


      for (
        let y = 0;
        y <= height;
        y += 50
      ) {
        ctx.beginPath();

        ctx.moveTo(
          0,
          y
        );

        ctx.lineTo(
          width,
          y
        );

        ctx.stroke();
      }
    };


    /*
     * -------------------------------------------------------
     * BUILD FIXED ECG WAVEFORM
     * -------------------------------------------------------
     */

    const buildWaveform = (
      width,
      height
    ) => {

      const baseline =
        height * 0.53;


      const amplitude =
        height * 0.36;


      const samplesNeeded =
        Math.ceil(
          width *
            SAMPLES_PER_PIXEL
        );


      const totalSamples =
        samplesNeeded * 2;


      const points = [];


      for (
        let i = 0;
        i < totalSamples;
        i++
      ) {
        const index =
          i %
          seamlessSignal.length;


        const value =
          seamlessSignal[index];


        const x =
          i /
          SAMPLES_PER_PIXEL;


        const y =
          baseline -
          (value - 0.5) *
            amplitude;


        points.push({
          x,
          y,
        });
      }


      return points;
    };


    /*
     * -------------------------------------------------------
     * DRAW WAVEFORM
     * -------------------------------------------------------
     */

    let scrollPosition = 0;

    let waveformPoints = [];

    let waveformWidth = 0;


    const drawWaveform = (
      width,
      height
    ) => {

      if (
        waveformPoints.length === 0
      ) {
        waveformPoints =
          buildWaveform(
            width,
            height
          );


        if (
          waveformPoints.length > 0
        ) {
          waveformWidth =
            waveformPoints[
              waveformPoints.length -
                1
            ].x;
        }
      }


      if (
        waveformPoints.length === 0 ||
        waveformWidth <= 0
      ) {
        return;
      }


      /*
       * Draw waveform copies.
       */

      const drawCopy = (
        translation
      ) => {

        ctx.beginPath();

        let started = false;


        for (
          let i = 0;
          i < waveformPoints.length;
          i++
        ) {
          const point =
            waveformPoints[i];


          const x =
            point.x +
            translation;


          if (
            x < -2 ||
            x > width + 2
          ) {
            continue;
          }


          if (!started) {

            ctx.moveTo(
              x,
              point.y
            );

            started = true;

          } else {

            ctx.lineTo(
              x,
              point.y
            );

          }
        }


        ctx.stroke();
      };


      ctx.save();


      /*
       * Clip to monitor.
       */

      ctx.beginPath();

      ctx.rect(
        0,
        0,
        width,
        height
      );

      ctx.clip();


      /*
       * ECG trace.
       */

      ctx.strokeStyle =
        "#E85D5D";

      ctx.lineWidth =
        isDark
          ? 1.8
          : 1.6;

      ctx.lineCap =
        "round";

      ctx.lineJoin =
        "round";


      drawCopy(
        -scrollPosition
      );


      drawCopy(
        -scrollPosition +
          waveformWidth
      );


      ctx.restore();
    };


    /*
     * -------------------------------------------------------
     * ANIMATION LOOP
     * -------------------------------------------------------
     */

    let lastTime = 0;


    const draw = (
      timestamp
    ) => {

      const width =
        canvas.clientWidth;


      const height =
        canvas.clientHeight;


      if (
        width <= 0 ||
        height <= 0
      ) {

        animationFrame =
          requestAnimationFrame(
            draw
          );

        return;
      }


      /*
       * Draw ECG paper.
       */

      drawGrid(
        width,
        height
      );


      /*
       * Draw ECG.
       */

      drawWaveform(
        width,
        height
      );


      /*
       * Maintain consistent speed.
       */

      if (
        lastTime === 0
      ) {
        lastTime =
          timestamp;
      }


      const delta =
        Math.min(
          timestamp -
            lastTime,
          40
        );


      lastTime =
        timestamp;


      scrollPosition +=
        SCROLL_SPEED *
        (delta / 16.67);


      if (
        waveformWidth > 0 &&
        scrollPosition >=
          waveformWidth
      ) {
        scrollPosition -=
          waveformWidth;
      }


      animationFrame =
        requestAnimationFrame(
          draw
        );
    };


    /*
     * -------------------------------------------------------
     * INITIALIZE
     * -------------------------------------------------------
     */

    resize();


    animationFrame =
      requestAnimationFrame(
        draw
      );


    /*
     * -------------------------------------------------------
     * RESIZE HANDLING
     * -------------------------------------------------------
     */

    const handleResize = () => {

      resize();

      waveformPoints = [];

      waveformWidth = 0;

      scrollPosition = 0;

      lastTime = 0;
    };


    window.addEventListener(
      "resize",
      handleResize
    );


    /*
     * -------------------------------------------------------
     * CLEANUP
     * -------------------------------------------------------
     */

    return () => {

      cancelAnimationFrame(
        animationFrame
      );


      window.removeEventListener(
        "resize",
        handleResize
      );

    };

  }, [
    ecgSignal,
    signalReady,
    isDark,
  ]);


  /*
   * =========================================================
   * BUTTON ACTIONS
   * =========================================================
   */

  const scrollToUpload = () => {

    document
      .getElementById("upload")
      ?.scrollIntoView({
        behavior: "smooth",
      });

  };


  const explorePlatform = () => {

    document
      .getElementById("capabilities")
      ?.scrollIntoView({
        behavior: "smooth",
      });

  };


  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (

    <section
      className="
        relative
        overflow-hidden
        pt-10
        pb-16
        md:pt-14
        md:pb-20
      "
    >

      <div
        className="
          mx-auto
          max-w-7xl
          px-6
        "
      >


        {/* =================================================
            HERO INTRODUCTION
        ================================================= */}

        <div className="max-w-4xl">


          {/* STATUS */}

          <div
            className="
              mb-5
              inline-flex
              items-center
              gap-2
              text-xs
              font-medium
              uppercase
              tracking-[0.18em]
              text-[var(--text-secondary)]
            "
          >

            <span
              className={`
                h-2
                w-2
                rounded-full

                ${
                  signalReady
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }
              `}
            />

            {signalReady
              ? "ECG Analysis Platform"
              : "Loading ECG Signal"}

          </div>


          {/* HEADING */}

          <h1
            className="
              text-5xl
              font-semibold
              leading-[1.02]
              tracking-[-0.035em]
              text-[var(--text-primary)]
              md:text-[5.25rem]
            "
          >

            Understand the signal

            <span
              className="
                block
                text-[var(--text-secondary)]
              "
            >
              behind the rhythm.
            </span>

          </h1>


          {/* DESCRIPTION */}

          <p
            className="
              mt-6
              max-w-2xl
              text-base
              leading-7
              text-[var(--text-secondary)]
              md:text-lg
            "
          >

            CardioSense analyzes ECG recordings
            to extract heart-rate variability
            biomarkers and provide an AI-assisted
            physiological stress assessment.

          </p>


          {/* ACTIONS */}

          <div
            className="
              mt-8
              flex
              flex-wrap
              items-center
              gap-4
            "
          >

            <button
              type="button"
              onClick={
                scrollToUpload
              }
              className="
                inline-flex
                items-center
                gap-3
                rounded-full
                bg-[var(--primary)]
                px-6
                py-3.5
                text-sm
                font-medium
                text-[var(--background)]
                shadow-[0_8px_24px_var(--shadow-color)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[var(--primary-hover)]
              "
            >

              Analyze an ECG

              <span
                aria-hidden="true"
              >
                →
              </span>

            </button>


            <button
              type="button"
              onClick={
                explorePlatform
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                px-5
                py-3.5
                text-sm
                font-medium
                text-[var(--text-secondary)]
                transition
                hover:text-[var(--text-primary)]
              "
            >

              Explore the platform

              <span
                aria-hidden="true"
              >
                ↓
              </span>

            </button>

          </div>

        </div>


        {/* =================================================
            ECG MONITOR
        ================================================= */}

        <div
          className="
            mt-12
            md:mt-14
          "
        >

          <div
            className="
              overflow-hidden
              rounded-[24px]
              border
              border-[var(--border)]
              bg-[var(--surface)]
              shadow-[0_20px_70px_var(--shadow-color)]
              backdrop-blur-xl
              transition-colors
              duration-200
            "
          >


            {/* =================================================
                MONITOR HEADER
            ================================================= */}

            <div
              className="
                flex
                flex-col
                gap-4
                border-b
                border-[var(--border)]
                px-5
                py-4
                md:flex-row
                md:items-center
                md:justify-between
                md:px-7
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
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-[var(--surface-muted)]
                  "
                >
                  <ActivityIcon />
                </div>


                <div>

                  <p
                    className="
                      text-sm
                      font-medium
                      text-[var(--text-primary)]
                    "
                  >
                    Lead I
                  </p>


                  <p
                    className="
                      text-xs
                      text-[var(--text-muted)]
                    "
                  >
                    Real ECG sample · live visualization
                  </p>

                </div>

              </div>


              <div
                className="
                  flex
                  items-center
                  gap-5
                  text-xs
                  text-[var(--text-secondary)]
                "
              >

                <span>
                  25 mm/s
                </span>

                <span>
                  10 mm/mV
                </span>


                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                  "
                >

                  <span
                    className={`
                      h-1.5
                      w-1.5
                      rounded-full

                      ${
                        signalReady
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-amber-500"
                      }
                    `}
                  />


                  {signalReady
                    ? "Signal active"
                    : "Loading signal"}

                </span>

              </div>

            </div>


            {/* =================================================
                ECG CANVAS
            ================================================= */}

            <div
              className="
                relative
                h-[235px]
                w-full
                bg-[var(--surface)]
                md:h-[285px]
              "
            >

              <div
                className="
                  absolute
                  inset-0
                  overflow-hidden
                "
              >

                <canvas
                  ref={canvasRef}
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                  "
                />


                {/* Live acquisition edge */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    right-0
                    top-0
                    h-full
                    w-px
                    bg-[#E85D5D]/30
                  "
                />


                {/* Subtle edge glow */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    right-0
                    top-0
                    h-full
                    w-8
                    bg-gradient-to-l
                    from-[#E85D5D]/[0.04]
                    to-transparent
                  "
                />

              </div>


              {/* VIEW LABEL */}

              <div
                className="
                  absolute
                  left-5
                  top-5
                  rounded-full
                  border
                  border-[var(--border)]
                  bg-[var(--surface)]/90
                  px-3
                  py-1.5
                  text-xs
                  text-[var(--text-secondary)]
                  shadow-[0_2px_8px_var(--shadow-color)]
                  backdrop-blur
                "
              >
                ECG · 10 s view
              </div>


              {/* SPEED / GAIN */}

              <div
                className="
                  absolute
                  bottom-5
                  left-5
                  flex
                  items-center
                  gap-6
                  text-xs
                  text-[var(--text-muted)]
                "
              >

                <span>
                  25 mm/s
                </span>

                <span>
                  10 mm/mV
                </span>

              </div>


              {/* STATUS */}

              <div
                className="
                  absolute
                  bottom-5
                  right-5
                  rounded-full
                  border
                  border-[var(--success)]/20
                  bg-[var(--success-soft)]
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-[var(--success)]
                "
              >
                Monitoring
              </div>

            </div>


            {/* =================================================
                METRICS
            ================================================= */}

            <div
              className="
                grid
                grid-cols-2
                border-t
                border-[var(--border)]
                md:grid-cols-4
              "
            >

              <MonitorMetric
                label="Heart Rate"
                value={heartRate}
                unit="bpm"
              />


              <MonitorMetric
                label="RR Interval"
                value={rrInterval}
                unit="ms"
              />


              <MonitorMetric
                label="Signal Quality"
                value={signalQuality}
              />


              <MonitorMetric
                label="Analysis"
                value={
                  signalReady
                    ? "Ready"
                    : "Loading"
                }
              />

            </div>

          </div>

        </div>


        {/* =================================================
            PLATFORM CAPABILITIES
        ================================================= */}

        <div
          id="capabilities"
          className="
            mt-16
            grid
            gap-5
            md:mt-20
            md:grid-cols-3
          "
        >

          <Capability
            number="01"
            title="Signal Processing"
            text="Clean ECG recordings and identify reliable cardiac cycles for downstream analysis."
          />


          <Capability
            number="02"
            title="HRV Biomarkers"
            text="Extract heart-rate variability measurements including SDNN, RMSSD and pNN50."
          />


          <Capability
            number="03"
            title="AI Assessment"
            text="Use the trained classification model to estimate the physiological stress state."
          />

        </div>

      </div>

    </section>
  );
}


/*
 * =========================================================
 * METRIC COMPONENT
 * =========================================================
 */

function MonitorMetric({
  label,
  value,
  unit,
}) {
  return (

    <div
      className="
        border-r
        border-[var(--border)]
        px-5
        py-5
        last:border-r-0
      "
    >

      <p
        className="
          text-xs
          text-[var(--text-muted)]
        "
      >
        {label}
      </p>


      <p
        className="
          mt-1
          text-lg
          font-medium
          tracking-tight
          text-[var(--text-primary)]
        "
      >

        {value}


        {unit && (
          <span
            className="
              ml-1
              text-xs
              font-normal
              text-[var(--text-muted)]
            "
          >
            {unit}
          </span>
        )}

      </p>

    </div>
  );
}


/*
 * =========================================================
 * CAPABILITY COMPONENT
 * =========================================================
 */

function Capability({
  number,
  title,
  text,
}) {
  return (

    <div
      className="
        border-t
        border-[var(--border)]
        pt-5
      "
    >

      <p
        className="
          text-xs
          font-medium
          tracking-[0.16em]
          text-[var(--text-muted)]
        "
      >
        {number}
      </p>


      <h3
        className="
          mt-3
          text-lg
          font-medium
          tracking-tight
          text-[var(--text-primary)]
        "
      >
        {title}
      </h3>


      <p
        className="
          mt-2
          max-w-sm
          text-sm
          leading-6
          text-[var(--text-secondary)]
        "
      >
        {text}
      </p>

    </div>
  );
}


/*
 * =========================================================
 * ECG ICON
 * =========================================================
 */

function ActivityIcon() {
  return (

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

  );
}