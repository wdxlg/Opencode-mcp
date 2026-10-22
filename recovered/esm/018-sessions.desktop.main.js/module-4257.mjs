// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/otlp/otlpLogEmitter.ts



// src/vs/platform/agentHost/common/otlp/otlpLogEmitter.ts
var OTLP_LOG_LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"];

function parseOtlpLogLevel(value2) {
  const lower = value2.toLowerCase();
  return OTLP_LOG_LEVELS.includes(lower) ? lower : void 0;
}

function logLevelToOtlpSeverity(level) {
  switch (level) {
    case 1 /* Trace */:
      return { severityNumber: 1, severityText: "trace" };
    case 2 /* Debug */:
      return { severityNumber: 5, severityText: "debug" };
    case 3 /* Info */:
      return { severityNumber: 9, severityText: "info" };
    case 4 /* Warning */:
      return { severityNumber: 13, severityText: "warn" };
    case 5 /* Error */:
      return { severityNumber: 17, severityText: "error" };
    case 0 /* Off */:
      return { severityNumber: 0, severityText: "trace" };
  }
}

function logLevelToOtlpLevelName(level) {
  if (level === 0 /* Off */) {
    return void 0;
  }
  return logLevelToOtlpSeverity(level).severityText;
}

function severityNumberToLogLevel(severityNumber) {
  if (severityNumber >= 17) {
    return 5 /* Error */;
  }
  if (severityNumber >= 13) {
    return 4 /* Warning */;
  }
  if (severityNumber >= 9) {
    return 3 /* Info */;
  }
  if (severityNumber >= 5) {
    return 2 /* Debug */;
  }
  return 1 /* Trace */;
}

function* iterateOtlpLogRecords(payload) {
  if (!payload || typeof payload !== "object") {
    return;
  }
  const resourceLogs = payload.resourceLogs;
  if (!Array.isArray(resourceLogs)) {
    return;
  }
  for (const resourceLog of resourceLogs) {
    if (!resourceLog || typeof resourceLog !== "object") {
      continue;
    }
    const scopeLogs = resourceLog.scopeLogs;
    if (!Array.isArray(scopeLogs)) {
      continue;
    }
    for (const scopeLog of scopeLogs) {
      if (!scopeLog || typeof scopeLog !== "object") {
        continue;
      }
      const logRecords = scopeLog.logRecords;
      if (!Array.isArray(logRecords)) {
        continue;
      }
      for (const raw of logRecords) {
        const record = coerceLogRecord(raw);
        if (record) {
          yield record;
        }
      }
    }
  }
}

function coerceLogRecord(raw) {
  if (!raw || typeof raw !== "object") {
    return void 0;
  }
  const r2 = raw;
  const severityNumber = typeof r2.severityNumber === "number" ? r2.severityNumber : 0;
  const severityTextRaw = typeof r2.severityText === "string" ? r2.severityText.toLowerCase() : "";
  const severityText = parseOtlpLogLevel(severityTextRaw) ?? severityNameFromNumber(severityNumber);
  const timeUnixNano = typeof r2.timeUnixNano === "string" ? r2.timeUnixNano : typeof r2.observedTimeUnixNano === "string" ? r2.observedTimeUnixNano : "0";
  const body = extractBody(r2.body);
  const attributes = otlpToAttributes(r2.attributes);
  return attributes ? { timeUnixNano, severityNumber, severityText, body, attributes } : { timeUnixNano, severityNumber, severityText, body };
}

function otlpToAttributes(raw) {
  if (!Array.isArray(raw)) {
    return void 0;
  }
  const result = {};
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const key3 = entry.key;
    if (typeof key3 !== "string") {
      continue;
    }
    const value2 = fromAnyValue(entry.value);
    if (value2 !== void 0) {
      result[key3] = value2;
    }
  }
  return Object.keys(result).length > 0 ? result : void 0;
}

function fromAnyValue(value2) {
  if (!value2 || typeof value2 !== "object") {
    return void 0;
  }
  const v2 = value2;
  if (typeof v2.stringValue === "string") {
    return v2.stringValue;
  }
  if (typeof v2.boolValue === "boolean") {
    return v2.boolValue;
  }
  if (typeof v2.intValue === "number") {
    return Number.isSafeInteger(v2.intValue) ? v2.intValue : void 0;
  }
  if (typeof v2.intValue === "string") {
    const parsed = Number(v2.intValue);
    return Number.isSafeInteger(parsed) ? parsed : void 0;
  }
  if (typeof v2.doubleValue === "number") {
    return Number.isFinite(v2.doubleValue) ? v2.doubleValue : void 0;
  }
  return void 0;
}

function severityNameFromNumber(n2) {
  if (n2 >= 21) {
    return "fatal";
  }
  if (n2 >= 17) {
    return "error";
  }
  if (n2 >= 13) {
    return "warn";
  }
  if (n2 >= 9) {
    return "info";
  }
  if (n2 >= 5) {
    return "debug";
  }
  return "trace";
}

function extractBody(body) {
  if (typeof body === "string") {
    return body;
  }
  if (body && typeof body === "object") {
    const value2 = body.stringValue;
    if (typeof value2 === "string") {
      return value2;
    }
  }
  return "";
}
export { parseOtlpLogLevel, logLevelToOtlpSeverity, logLevelToOtlpLevelName, severityNumberToLogLevel, iterateOtlpLogRecords, coerceLogRecord, otlpToAttributes, fromAnyValue, severityNameFromNumber, extractBody, OTLP_LOG_LEVELS };
