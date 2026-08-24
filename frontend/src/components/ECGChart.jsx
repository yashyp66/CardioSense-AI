import { useMemo, useState } from "react";
import { useTheme } from "./ThemeProvider";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

export default function ECGChart({
  signal,
  sampleRate = 100,
  lead = "Lead I",
}) {
  const { isDark } = useTheme();

  const [view, setView] = useState(10);
  const [startTime, setStartTime] = useState(0);
  const [showGrid, setShowGrid] = useState(true);

  // Zoom is visual/time-window zoom.
  // 1 = normal, 2 = 2x, 4 = 4x, 8 = 8x.
  const [zoom, setZoom] = useState(1);


  const theme = isDark
    ? {
        surface: "#111923",
        surfaceSubtle: "#0E151E",
        surfaceMuted: "#182331",
        surfaceHover: "#17212D",
        textPrimary: "#F4F7FB",
        textSecondary: "#A8B6C7",
        textMuted: "#718197",
        border: "#263442",
        borderStrong: "#344557",
        gridMinor: "rgba(239,105,105,0.045)",
        gridMajor: "rgba(239,105,105,0.105)",
        zeroLine: "rgba(148,163,184,0.20)",
        trace: "#F06A6A",
        cursor: "rgba(240,106,106,0.48)",
        tooltipBg: "#151E29",
        tooltipBorder: "#344557",
        iconSurface: "#1A2633",
        accentSoft: "#182331",
        shadow: "rgba(0,0,0,0.28)",
      }
    : {
        surface: "#FFFFFF",
        surfaceSubtle: "#FAFBFC",
        surfaceMuted: "#F1F4F7",
        surfaceHover: "#F7F9FB",
        textPrimary: "#172235",
        textSecondary: "#667487",
        textMuted: "#8B98A8",
        border: "#DFE5EA",
        borderStrong: "#CBD5DF",
        gridMinor: "rgba(239,83,80,0.045)",
        gridMajor: "rgba(239,83,80,0.11)",
        zeroLine: "rgba(100,116,139,0.18)",
        trace: "#E25555",
        cursor: "rgba(239,83,80,0.55)",
        tooltipBg: "rgba(255,255,255,0.98)",
        tooltipBorder: "rgba(15,23,42,0.08)",
        iconSurface: "#FEF2F2",
        accentSoft: "#F1F4F7",
        shadow: "rgba(15,23,42,0.08)",
      };

  const cssVars = {
    "--ecg-surface": theme.surface,
    "--ecg-surface-subtle": theme.surfaceSubtle,
    "--ecg-muted": theme.surfaceMuted,
    "--ecg-hover": theme.surfaceHover,
    "--ecg-primary": theme.textPrimary,
    "--ecg-secondary": theme.textSecondary,
    "--ecg-tertiary": theme.textMuted,
    "--ecg-border": theme.border,
    "--ecg-border-strong": theme.borderStrong,
    "--ecg-trace": theme.trace,
    "--ecg-icon-surface": theme.iconSurface,
    "--ecg-accent-soft": theme.accentSoft,
    "--ecg-shadow": theme.shadow,
  };

  // ============================================================
  // CLEAN SIGNAL
  // ============================================================

  const rawSignal = useMemo(() => {
    if (!Array.isArray(signal)) {
      return [];
    }

    return signal
      .map(Number)
      .filter(Number.isFinite);
  }, [signal]);

  const safeSampleRate =
    Number(sampleRate) > 0
      ? Number(sampleRate)
      : 100;

  // ============================================================
  // EMPTY STATE
  // ============================================================

  if (rawSignal.length < 2) {
    return (
      <div className="flex h-[380px] items-center justify-center bg-[var(--ecg-surface)] text-[var(--ecg-primary)]">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ecg-muted)]">
            <span className="text-[var(--ecg-tertiary)]">—</span>
          </div>

          <p className="text-sm font-medium text-[var(--ecg-secondary)]">
            No ECG signal available
          </p>

          <p className="mt-1 text-xs text-[var(--ecg-tertiary)]">
            Upload a valid WFDB ECG recording.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RECORDING INFO
  // ============================================================

  const totalDuration =
    rawSignal.length / safeSampleRate;

  const isFull = view === "full";

  const baseWindowDuration = isFull
    ? totalDuration
    : Math.min(Number(view), totalDuration);

  const windowDuration = Math.max(
    0.5,
    baseWindowDuration / zoom
  );

  const maxStartTime = Math.max(
    0,
    totalDuration - windowDuration
  );

  const safeStartTime = Math.min(
    Math.max(startTime, 0),
    maxStartTime
  );

  const startSample = Math.floor(
    safeStartTime * safeSampleRate
  );

  const endSample = Math.min(
    rawSignal.length,
    Math.ceil(
      (safeStartTime + windowDuration) *
        safeSampleRate
    )
  );

  const source = rawSignal.slice(
    startSample,
    Math.max(startSample + 2, endSample)
  );

  // ============================================================
  // PEAK-PRESERVING DOWNSAMPLING
  // ============================================================

  const MAX_RENDER_POINTS = 3500;

  const renderData = useMemo(() => {
    if (source.length <= MAX_RENDER_POINTS) {
      return source.map((value, index) => ({
        time:
          safeStartTime +
          index / safeSampleRate,
        amplitude: value,
      }));
    }

    const bucketSize =
      source.length / MAX_RENDER_POINTS;

    const points = [];

    for (
      let bucket = 0;
      bucket < MAX_RENDER_POINTS;
      bucket++
    ) {
      const start = Math.floor(
        bucket * bucketSize
      );

      const end = Math.min(
        source.length,
        Math.max(
          start + 1,
          Math.floor(
            (bucket + 1) * bucketSize
          )
        )
      );

      let minValue = Infinity;
      let maxValue = -Infinity;

      let minIndex = start;
      let maxIndex = start;

      for (
        let i = start;
        i < end;
        i++
      ) {
        const value = source[i];

        if (value < minValue) {
          minValue = value;
          minIndex = i;
        }

        if (value > maxValue) {
          maxValue = value;
          maxIndex = i;
        }
      }

      if (minIndex < maxIndex) {
        points.push({
          time:
            safeStartTime +
            minIndex / safeSampleRate,
          amplitude: minValue,
        });

        points.push({
          time:
            safeStartTime +
            maxIndex / safeSampleRate,
          amplitude: maxValue,
        });
      } else {
        points.push({
          time:
            safeStartTime +
            maxIndex / safeSampleRate,
          amplitude: maxValue,
        });

        points.push({
          time:
            safeStartTime +
            minIndex / safeSampleRate,
          amplitude: minValue,
        });
      }
    }

    return points.sort(
      (a, b) => a.time - b.time
    );
  }, [
    source,
    safeSampleRate,
    safeStartTime,
  ]);

  // ============================================================
  // Y AXIS
  // ============================================================

  const amplitudeRange = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const point of renderData) {
      if (point.amplitude < min) {
        min = point.amplitude;
      }

      if (point.amplitude > max) {
        max = point.amplitude;
      }
    }

    if (
      !Number.isFinite(min) ||
      !Number.isFinite(max)
    ) {
      return {
        min: -1,
        max: 1,
      };
    }

    const range = max - min || 1;

    const padding = range * 0.12;

    return {
      min: min - padding,
      max: max + padding,
    };
  }, [renderData]);

  // ============================================================
  // GRID
  // ============================================================

  const gridStyle = showGrid
    ? {
        backgroundImage: `
          linear-gradient(
            to right,
            ${theme.gridMinor} 1px,
            transparent 1px
          ),
          linear-gradient(
            to bottom,
            ${theme.gridMinor} 1px,
            transparent 1px
          ),
          linear-gradient(
            to right,
            ${theme.gridMajor} 1px,
            transparent 1px
          ),
          linear-gradient(
            to bottom,
            ${theme.gridMajor} 1px,
            transparent 1px
          )
        `,
        backgroundSize:
          "8px 8px, 8px 8px, 40px 40px, 40px 40px",
      }
    : {};

  // ============================================================
  // VIEW CHANGE
  // ============================================================

  const changeView = (value) => {
    setView(value);
    setZoom(1);

    if (value === "full") {
      setStartTime(0);
      return;
    }

    const duration = Number(value);

    const newMaxStart = Math.max(
      0,
      totalDuration - duration
    );

    setStartTime((current) =>
      Math.min(current, newMaxStart)
    );
  };

  // ============================================================
  // ZOOM
  // ============================================================

  const zoomIn = () => {
    if (isFull && totalDuration <= 0.5) {
      return;
    }

    setZoom((current) => {
      const next = Math.min(
        current * 2,
        8
      );

      return next;
    });

    // Keep the current visible location.
    setStartTime((current) =>
      Math.min(
        Math.max(current, 0),
        Math.max(
          0,
          totalDuration -
            Math.max(
              0.5,
              baseWindowDuration / 2
            )
        )
      )
    );
  };

  const zoomOut = () => {
    setZoom((current) => {
      const next = Math.max(
        current / 2,
        1
      );

      return next;
    });
  };

  const resetZoom = () => {
    setZoom(1);

    setStartTime((current) => {
      const maxStart =
        Math.max(
          0,
          totalDuration -
            baseWindowDuration
        );

      return Math.min(
        current,
        maxStart
      );
    });
  };

  // ============================================================
  // WINDOW NAVIGATION
  // ============================================================

  const moveWindow = (direction) => {
    const amount =
      Math.max(
        windowDuration * 0.8,
        0.5
      );

    setStartTime((current) => {
      const next =
        current +
        direction * amount;

      return Math.min(
        Math.max(next, 0),
        maxStartTime
      );
    });
  };

  const goToBeginning = () => {
    setStartTime(0);
  };

  const goToEnd = () => {
    setStartTime(maxStartTime);
  };

  // ============================================================
  // VIEW BUTTON
  // ============================================================

  function ViewButton({
    value,
    children,
  }) {
    const active =
      view === value;

    return (
      <button
        type="button"
        onClick={() =>
          changeView(value)
        }
        className={
          active
            ? "rounded-lg bg-[var(--ecg-primary)] px-3.5 py-2 text-xs font-semibold text-[var(--ecg-surface)] shadow-sm"
            : "rounded-lg px-3.5 py-2 text-xs font-medium text-[var(--ecg-secondary)] transition hover:bg-[var(--ecg-hover)] hover:text-[var(--ecg-primary)]"
        }
      >
        {children}
      </button>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section className="w-full transition-colors duration-200" style={cssVars}>

      {/* HEADER */}

      <div className="border-b border-[var(--ecg-border)] bg-[var(--ecg-surface)] px-5 py-5 sm:px-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ecg-icon-surface)]">

              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M3 12h4l2.2-6 4.1 12 2.1-6H21"
                  stroke="#EF5350"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

            </div>

            <div>

              <p className="text-sm font-semibold text-[var(--ecg-primary)]">
                {lead}
              </p>

              <p className="mt-0.5 text-xs text-[var(--ecg-tertiary)]">
                Interactive ECG signal viewer
              </p>

            </div>

          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--ecg-secondary)]">

            <span>
              {safeSampleRate} Hz
            </span>

            <span className="text-[var(--ecg-border)]">
              |
            </span>

            <span>
              25 mm/s
            </span>

            <span className="text-[var(--ecg-border)]">
              |
            </span>

            <span>
              10 mm/mV
            </span>

            <span className="flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-[#18A875]" />

              Signal active

            </span>

          </div>

        </div>

      </div>


      {/* CONTROLS */}

      <div className="border-b border-[var(--ecg-border)] bg-[var(--ecg-surface)] px-5 py-3 sm:px-6">

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

          {/* RANGE */}

          <div className="flex w-fit items-center gap-1 rounded-xl bg-[var(--ecg-muted)] p-1">

            <ViewButton value={5}>
              5 sec
            </ViewButton>

            <ViewButton value={10}>
              10 sec
            </ViewButton>

            <ViewButton value={20}>
              20 sec
            </ViewButton>

            <ViewButton value="full">
              Full
            </ViewButton>

          </div>


          {/* NAVIGATION + ZOOM */}

          <div className="flex flex-wrap items-center gap-2">

            {!isFull && maxStartTime > 0 && (
              <>
                <button
                  type="button"
                  onClick={goToBeginning}
                  disabled={safeStartTime <= 0}
                  className="rounded-lg border border-[var(--ecg-border-strong)] bg-[var(--ecg-surface)] px-2.5 py-2 text-xs text-[var(--ecg-secondary)] transition hover:bg-[var(--ecg-muted)] disabled:cursor-not-allowed disabled:opacity-40"
                  title="Go to beginning"
                >
                  |‹
                </button>

                <button
                  type="button"
                  onClick={() =>
                    moveWindow(-1)
                  }
                  disabled={safeStartTime <= 0}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ecg-border-strong)] bg-[var(--ecg-surface)] text-[var(--ecg-secondary)] transition hover:bg-[var(--ecg-muted)] disabled:cursor-not-allowed disabled:opacity-40"
                  title="Previous section"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="hidden min-w-[135px] rounded-lg bg-[var(--ecg-muted)] px-3 py-2 text-center sm:block">

                  <p className="text-[9px] uppercase tracking-wider text-[var(--ecg-tertiary)]">
                    Viewing
                  </p>

                  <p className="text-xs font-semibold text-[var(--ecg-primary)]">
                    {safeStartTime.toFixed(1)}s
                    {" — "}
                    {Math.min(
                      safeStartTime +
                        windowDuration,
                      totalDuration
                    ).toFixed(1)}s
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    moveWindow(1)
                  }
                  disabled={
                    safeStartTime >=
                    maxStartTime
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ecg-border-strong)] bg-[var(--ecg-surface)] text-[var(--ecg-secondary)] transition hover:bg-[var(--ecg-muted)] disabled:cursor-not-allowed disabled:opacity-40"
                  title="Next section"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={goToEnd}
                  disabled={
                    safeStartTime >=
                    maxStartTime
                  }
                  className="rounded-lg border border-[var(--ecg-border-strong)] bg-[var(--ecg-surface)] px-2.5 py-2 text-xs text-[var(--ecg-secondary)] transition hover:bg-[var(--ecg-muted)] disabled:cursor-not-allowed disabled:opacity-40"
                  title="Go to end"
                >
                  ›|
                </button>
              </>
            )}


            {/* DIVIDER */}

            <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />


            {/* ZOOM OUT */}

            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ecg-border-strong)] bg-[var(--ecg-surface)] text-[var(--ecg-secondary)] transition hover:bg-[var(--ecg-muted)] disabled:cursor-not-allowed disabled:opacity-40"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>


            {/* ZOOM LEVEL */}

            <div className="min-w-[55px] rounded-lg bg-[var(--ecg-muted)] px-2 py-2 text-center text-xs font-semibold text-[var(--ecg-secondary)]">
              {zoom}×
            </div>


            {/* ZOOM IN */}

            <button
              type="button"
              onClick={zoomIn}
              disabled={
                zoom >= 8 ||
                windowDuration <= 0.5
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ecg-border-strong)] bg-[var(--ecg-surface)] text-[var(--ecg-secondary)] transition hover:bg-[var(--ecg-muted)] disabled:cursor-not-allowed disabled:opacity-40"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>


            {/* RESET */}

            <button
              type="button"
              onClick={resetZoom}
              disabled={zoom === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--ecg-border-strong)] bg-[var(--ecg-surface)] text-[var(--ecg-secondary)] transition hover:bg-[var(--ecg-muted)] disabled:cursor-not-allowed disabled:opacity-40"
              title="Reset zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>


            {/* GRID */}

            <button
              type="button"
              onClick={() =>
                setShowGrid(
                  (current) => !current
                )
              }
              className={
                showGrid
                  ? "flex h-9 items-center gap-2 rounded-lg border border-[var(--ecg-border-strong)] bg-[var(--ecg-muted)] px-3 text-xs font-medium text-[var(--ecg-primary)]"
                  : "flex h-9 items-center gap-2 rounded-lg border border-[var(--ecg-border-strong)] bg-[var(--ecg-surface)] px-3 text-xs font-medium text-[var(--ecg-tertiary)]"
              }
              title="Toggle ECG grid"
            >
              <Grid3X3 className="h-3.5 w-3.5" />

              <span className="hidden sm:inline">
                Grid
              </span>
            </button>

          </div>

        </div>

      </div>


      {/* GRAPH */}

      <div
        className="relative h-[380px] w-full overflow-hidden bg-[var(--ecg-surface)]"
        style={gridStyle}
      >

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <LineChart
            data={renderData}
            margin={{
              top: 30,
              right: 24,
              bottom: 35,
              left: 15,
            }}
          >

            <YAxis
              domain={[
                amplitudeRange.min,
                amplitudeRange.max,
              ]}
              width={45}
              tick={{
                fill: theme.textMuted,
                fontSize: 10,
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                Number(value).toFixed(2)
              }
            />

            <XAxis
              dataKey="time"
              type="number"
              domain={[
                safeStartTime,
                safeStartTime +
                  Math.max(
                    windowDuration,
                    0.01
                  ),
              ]}
              tick={{
                fill: theme.textMuted,
                fontSize: 10,
              }}
              tickLine={false}
              axisLine={{
                stroke: theme.borderStrong,
              }}
              tickFormatter={(value) =>
                `${Number(value).toFixed(
                  windowDuration <= 10
                    ? 1
                    : 0
                )}s`
              }
            />

            <ReferenceLine
              y={0}
              stroke={theme.zeroLine}
              strokeWidth={1}
            />

            <Tooltip
              cursor={{
                stroke: theme.cursor,
                strokeWidth: 1,
              }}
              contentStyle={{
                background: theme.tooltipBg,
                border: `1px solid ${theme.tooltipBorder}`,
                borderRadius: "12px",
                padding: "10px 12px",
                fontSize: "11px",
                boxShadow: isDark
                  ? "0 14px 36px rgba(0,0,0,0.38)"
                  : "0 10px 30px rgba(15,23,42,0.10)",
              }}
              labelFormatter={(value) =>
                `Time: ${Number(value).toFixed(3)} s`
              }
              formatter={(value) => [
                `${Number(value).toFixed(4)} mV`,
                "Amplitude",
              ]}
            />

            <Line
              type="linear"
              dataKey="amplitude"
              stroke={theme.trace}
              strokeWidth={1.8}
              dot={false}
              activeDot={{
                r: 4,
                fill: theme.trace,
                stroke: theme.surface,
                strokeWidth: 2,
              }}
              isAnimationActive={false}
              connectNulls={false}
            />

          </LineChart>

        </ResponsiveContainer>


        {/* VIEW LABEL */}

        <div className="pointer-events-none absolute left-5 top-4 rounded-full border border-[var(--ecg-border-strong)] bg-[var(--ecg-surface)]/95 px-3 py-1.5 text-[11px] font-medium text-[var(--ecg-secondary)] shadow-[0_5px_18px_var(--ecg-shadow)]">

          ECG ·{" "}

          {isFull
            ? "Full recording"
            : `${windowDuration.toFixed(
                windowDuration < 10
                  ? 1
                  : 0
              )} sec`}

        </div>


        {/* ZOOM INDICATOR */}

        {zoom > 1 && (
          <div className="pointer-events-none absolute right-5 top-4 rounded-full border border-[var(--ecg-border-strong)] bg-[var(--ecg-surface)]/95 px-3 py-1.5 text-[11px] font-semibold text-[var(--ecg-secondary)] shadow-[0_5px_18px_var(--ecg-shadow)]">
            Zoom {zoom}×
          </div>
        )}


        {/* POSITION */}

        <div className="pointer-events-none absolute bottom-12 left-5 rounded-lg border border-[var(--ecg-border-strong)] bg-[var(--ecg-surface)]/90 px-3 py-2 text-[10px] text-[var(--ecg-tertiary)]">

          Position{" "}

          <span className="font-semibold text-[var(--ecg-secondary)]">
            {safeStartTime.toFixed(1)}s
          </span>

          {" / "}

          {totalDuration.toFixed(1)}s

        </div>


        {/* SCALE */}

        <div className="pointer-events-none absolute bottom-12 right-6 flex items-end gap-2 rounded-lg border border-[var(--ecg-border-strong)] bg-[var(--ecg-surface)]/90 px-3 py-2 text-[10px] text-[var(--ecg-tertiary)]">

          <div className="h-6 w-8 border-b border-l border-slate-400" />

          <div>
            <div>0.2 s</div>
            <div>0.5 mV</div>
          </div>

        </div>

      </div>


      {/* TIMELINE */}

      {!isFull && maxStartTime > 0 && (
        <div className="border-t border-[var(--ecg-border)] bg-[var(--ecg-surface)] px-5 py-4 sm:px-6">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ecg-tertiary)]">
              Recording timeline
            </span>

            <span className="text-[10px] text-[var(--ecg-tertiary)]">
              Drag to navigate
            </span>

          </div>


          <input
            type="range"
            min="0"
            max={maxStartTime}
            step="0.1"
            value={safeStartTime}
            onChange={(event) =>
              setStartTime(
                Number(event.target.value)
              )
            }
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[var(--ecg-trace)]"
            aria-label="ECG recording position"
          />


          <div className="mt-2 flex justify-between text-[10px] text-[var(--ecg-tertiary)]">

            <span>
              0:00
            </span>

            <span>
              {formatTime(totalDuration)}
            </span>

          </div>

        </div>
      )}


      {/* FOOTER */}

      <div className="flex flex-col gap-2 border-t border-[var(--ecg-border)] bg-[var(--ecg-surface)] px-5 py-3 text-xs text-[var(--ecg-tertiary)] sm:flex-row sm:items-center sm:justify-between sm:px-6">

        <span>
          {renderData.length.toLocaleString()} points rendered
        </span>

        <span>
          {windowDuration.toFixed(1)} sec
          {" · "}
          {rawSignal.length.toLocaleString()} raw samples
        </span>

      </div>

    </section>
  );
}


// ============================================================
// TIME FORMATTER
// ============================================================

function formatTime(seconds) {
  const value = Math.max(
    0,
    Math.round(Number(seconds) || 0)
  );

  const minutes =
    Math.floor(value / 60);

  const remaining =
    value % 60;

  return `${minutes}:${String(
    remaining
  ).padStart(2, "0")}`;
}