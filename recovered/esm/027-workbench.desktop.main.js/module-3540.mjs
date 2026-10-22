// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/update/common/updateUtils.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/update/common/updateUtils.ts
function computeProgressPercent(current, max) {
  if (current === void 0 || max === void 0 || max <= 0) {
    return void 0;
  }
  return Math.max(Math.min(Math.round(current / max * 100), 100), 0);
}

function computeDownloadTimeRemaining(state) {
  const { downloadedBytes, totalBytes, startTime } = state;
  if (downloadedBytes === void 0 || totalBytes === void 0 || startTime === void 0) {
    return void 0;
  }
  const elapsedMs = Date.now() - startTime;
  if (downloadedBytes <= 0 || totalBytes <= 0 || elapsedMs <= 0) {
    return void 0;
  }
  const remainingBytes = totalBytes - downloadedBytes;
  if (remainingBytes <= 0) {
    return 0;
  }
  const bytesPerMs = downloadedBytes / elapsedMs;
  if (bytesPerMs <= 0) {
    return void 0;
  }
  const remainingMs = remainingBytes / bytesPerMs;
  return Math.ceil(remainingMs / 1e3);
}

function computeDownloadSpeed(state) {
  const { downloadedBytes, startTime } = state;
  if (downloadedBytes === void 0 || startTime === void 0) {
    return void 0;
  }
  const elapsedMs = Date.now() - startTime;
  if (elapsedMs <= 0 || downloadedBytes <= 0) {
    return void 0;
  }
  return downloadedBytes / elapsedMs * 1e3;
}

function getUpdateInfoUrl(version2) {
  const versionLabel = version2.replace(/\./g, "_").replace(/_0$/, "");
  return `https://code.visualstudio.com/raw/v${versionLabel}_update.md`;
}

function formatTimeRemaining(seconds) {
  const hours = seconds / 3600;
  if (hours >= 1) {
    const formattedHours = formatDecimal(hours);
    if (formattedHours === "1") {
      return localize(21570, null, formattedHours);
    } else {
      return localize(21571, null, formattedHours);
    }
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes >= 1) {
    return localize(21572, null, minutes);
  }
  return localize(21573, null, seconds);
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return localize(21566, null, bytes);
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return localize(21568, null, formatDecimal(kb));
  }
  const mb = kb / 1024;
  if (mb < 1024) {
    return localize(21569, null, formatDecimal(mb));
  }
  const gb = mb / 1024;
  return localize(21567, null, formatDecimal(gb));
}

function tryParseDate(date) {
  if (date === void 0) {
    return void 0;
  }
  try {
    const parsed = Date.parse(date);
    return isNaN(parsed) ? void 0 : parsed;
  } catch {
    return void 0;
  }
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(void 0, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatDecimal(value2) {
  const rounded = Math.round(value2 * 10) / 10;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
}

function tryParseVersion(version2) {
  if (version2 === void 0) {
    return void 0;
  }
  const match2 = /^(\d{1,10})\.(\d{1,10})\.(\d{1,10})/.exec(version2);
  if (!match2) {
    return void 0;
  }
  try {
    return {
      major: parseInt(match2[1]),
      minor: parseInt(match2[2]),
      patch: parseInt(match2[3])
    };
  } catch {
    return void 0;
  }
}

function isMajorMinorVersionChange(previousVersion, newVersion) {
  const previous = tryParseVersion(previousVersion);
  const current = tryParseVersion(newVersion);
  return !!previous && !!current && (previous.major !== current.major || previous.minor !== current.minor);
}
export { computeProgressPercent, computeDownloadTimeRemaining, computeDownloadSpeed, getUpdateInfoUrl, formatTimeRemaining, formatBytes, tryParseDate, formatDate, formatDecimal, tryParseVersion, isMajorMinorVersionChange };
