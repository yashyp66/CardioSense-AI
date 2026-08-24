const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

const REQUEST_TIMEOUT = 120000;


// ============================================================
// REQUEST HELPER
// ============================================================

async function fetchWithTimeout(
  url,
  options = {},
  timeout = REQUEST_TIMEOUT
) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "The ECG analysis is taking too long. Please check that the backend is running and try again."
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to the CardioSense backend. Please make sure the backend server is running."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}


// ============================================================
// API ERROR READER
// ============================================================

async function getErrorMessage(
  response,
  fallbackMessage
) {
  try {
    const contentType =
      response.headers.get("content-type") || "";

    if (
      contentType.includes("application/json")
    ) {
      const errorData =
        await response.json();

      if (
        typeof errorData?.detail ===
        "string"
      ) {
        return errorData.detail;
      }

      if (
        Array.isArray(errorData?.detail)
      ) {
        const messages =
          errorData.detail
            .map((item) => {
              if (
                typeof item === "string"
              ) {
                return item;
              }

              if (
                typeof item?.msg === "string"
              ) {
                return item.msg;
              }

              return null;
            })
            .filter(Boolean);

        if (messages.length > 0) {
          return messages.join(". ");
        }
      }

      if (
        typeof errorData?.message ===
        "string"
      ) {
        return errorData.message;
      }

      if (
        typeof errorData?.error ===
        "string"
      ) {
        return errorData.error;
      }
    }

    const text =
      await response.text();

    if (text?.trim()) {
      return text.trim();
    }
  } catch {
    // Keep fallback message.
  }

  return fallbackMessage;
}


// ============================================================
// PREDICTION ERROR MESSAGES
// ============================================================

function getPredictionErrorMessage(
  status
) {
  switch (status) {
    case 400:
      return (
        "The ECG files could not be processed. Please check that the .dat and .hea files belong to the same recording."
      );

    case 404:
      return (
        "The ECG prediction service could not be found. Please check that the backend is running correctly."
      );

    case 413:
      return (
        "The ECG recording is too large to process."
      );

    case 422:
      return (
        "The ECG files were not accepted by the analysis service. Please verify the selected files."
      );

    case 500:
      return (
        "The ECG analysis service encountered an internal error. Please try again."
      );

    case 502:
    case 503:
    case 504:
      return (
        "The ECG analysis service is temporarily unavailable. Please try again in a moment."
      );

    default:
      return (
        "ECG prediction failed. Please verify the selected files and try again."
      );
  }
}


// ============================================================
// PREDICT ECG
// ============================================================

export async function predictECG(
  datFile,
  heaFile
) {
  if (!datFile || !heaFile) {
    throw new Error(
      "Both the ECG .dat and .hea files are required."
    );
  }

  const formData =
    new FormData();

  formData.append(
    "dat_file",
    datFile
  );

  formData.append(
    "hea_file",
    heaFile
  );

  const response =
    await fetchWithTimeout(
      `${API_BASE_URL}/predict`,
      {
        method: "POST",
        body: formData,
      }
    );

  if (!response.ok) {
    const message =
      await getErrorMessage(
        response,
        getPredictionErrorMessage(
          response.status
        )
      );

    throw new Error(message);
  }

  let data;

  try {
    data =
      await response.json();
  } catch {
    throw new Error(
      "The backend returned an invalid analysis response."
    );
  }

  if (
    !data ||
    typeof data !== "object"
  ) {
    throw new Error(
      "The backend returned an empty analysis response."
    );
  }

  const ecgSignal =
    Array.isArray(data.ecg_signal)
      ? data.ecg_signal
      : [];

  const sampleRate =
    Number(data.sample_rate) ||
    Number(data.sampling_frequency) ||
    100;

  const samplingFrequency =
    Number(data.sampling_frequency) ||
    Number(data.sample_rate) ||
    100;

  const totalSamples =
    Number(data.total_samples) ||
    ecgSignal.length ||
    0;

  const durationSeconds =
    Number(data.duration_seconds) ||
    (
      totalSamples > 0 &&
      samplingFrequency > 0
        ? totalSamples /
          samplingFrequency
        : 0
    );

  const numChannels =
    Number(data.num_channels) ||
    1;

  return {
    ...data,

    ecg_signal:
      ecgSignal,

    sample_rate:
      sampleRate,

    sampling_frequency:
      samplingFrequency,

    total_samples:
      totalSamples,

    duration_seconds:
      durationSeconds,

    num_channels:
      numChannels,

    lead:
      data.lead ||
      "Lead I",

    record_name:
      data.record_name ||
      "ECG Recording",
  };
}


// ============================================================
// REPORT ERROR MESSAGES
// ============================================================

function getReportErrorMessage(
  status
) {
  switch (status) {
    case 400:
      return (
        "The ECG files could not be used to generate the clinical report."
      );

    case 404:
      return (
        "The clinical report service could not be found. Please check that the backend is running correctly."
      );

    case 413:
      return (
        "The ECG recording is too large to generate a report."
      );

    case 422:
      return (
        "The selected ECG files were not accepted for report generation."
      );

    case 500:
      return (
        "The clinical report could not be generated because the backend encountered an internal error."
      );

    case 502:
    case 503:
    case 504:
      return (
        "The clinical report service is temporarily unavailable. Please try again."
      );

    default:
      return (
        "Unable to generate the clinical report. Please try again."
      );
  }
}


// ============================================================
// DOWNLOAD CLINICAL REPORT
// ============================================================

export async function downloadReport(
  datFile,
  heaFile
) {
  if (!datFile || !heaFile) {
    throw new Error(
      "Both the ECG .dat and .hea files are required to generate the report."
    );
  }

  const formData =
    new FormData();

  formData.append(
    "dat_file",
    datFile
  );

  formData.append(
    "hea_file",
    heaFile
  );

  const response =
    await fetchWithTimeout(
      `${API_BASE_URL}/download-report`,
      {
        method: "POST",
        body: formData,
      }
    );

  if (!response.ok) {
    const message =
      await getErrorMessage(
        response,
        getReportErrorMessage(
          response.status
        )
      );

    throw new Error(message);
  }

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  if (
    !contentType.includes(
      "application/pdf"
    )
  ) {
    throw new Error(
      "The clinical report service returned an invalid file."
    );
  }

  const blob =
    await response.blob();

  if (
    !blob ||
    blob.size === 0
  ) {
    throw new Error(
      "The clinical report is empty. Please try generating it again."
    );
  }

  const url =
    window.URL.createObjectURL(
      blob
    );

  try {
    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "CardioSense-Clinical-Report.pdf";

    link.style.display =
      "none";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();
  } finally {
    setTimeout(() => {
      window.URL.revokeObjectURL(
        url
      );
    }, 1000);
  }
}