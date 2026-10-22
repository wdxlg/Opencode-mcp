// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/otlp/otlpLogEmitter.ts
import { Disposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { AbstractMessageLogger, format3 } from "./module-0084.mjs";


// src/vs/platform/agentHost/common/otlp/otlpLogEmitter.ts
var OTLP_LOGS_CHANNEL_TEMPLATE = "ahp-otlp://logs/{level}";

var OTLP_CHANNEL_SCHEME = "ahp-otlp";

var OTLP_LOG_LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"];

function levelToSeverityNumber(level) {
  switch (level) {
    case "trace":
      return 1;
    case "debug":
      return 5;
    case "info":
      return 9;
    case "warn":
      return 13;
    case "error":
      return 17;
    case "fatal":
      return 21;
  }
}

function parseOtlpLogLevel(value) {
  const lower = value.toLowerCase();
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

var OtelData = class {
  constructor(attributes) {
    this.attributes = attributes;
  }
  toJSON() {
    return this.attributes;
  }
};

var OtlpLogEmitter = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidLog = this._register(new Emitter());
    this.onDidLog = this._onDidLog.event;
  }
  emit(record) {
    this._onDidLog.fire(record);
  }
};

var OtlpEmitterLogger = class extends AbstractMessageLogger {
  constructor(_emitter, initialLevel = 1 /* Trace */) {
    super();
    this._emitter = _emitter;
    this.setLevel(initialLevel);
  }
  trace(message, ...args) {
    if (this.canLog(1 /* Trace */)) {
      this._emit(1 /* Trace */, message, args, true);
    }
  }
  debug(message, ...args) {
    if (this.canLog(2 /* Debug */)) {
      this._emit(2 /* Debug */, message, args);
    }
  }
  info(message, ...args) {
    if (this.canLog(3 /* Info */)) {
      this._emit(3 /* Info */, message, args);
    }
  }
  warn(message, ...args) {
    if (this.canLog(4 /* Warning */)) {
      this._emit(4 /* Warning */, message, args);
    }
  }
  error(message, ...args) {
    if (this.canLog(5 /* Error */)) {
      const head = message instanceof Error ? message.stack ?? message.message : message;
      this._emit(5 /* Error */, head, args);
    }
  }
  log(level, message) {
    if (level === 0 /* Off */) {
      return;
    }
    this._emit(level, message, []);
  }
  /**
   * Formats `message` + `args` into the OTLP record body, lifting any
   * {@link OtelData} argument out into structured `attributes` so the
   * metadata is emitted over the channel rather than serialised into the
   * body. Mirrors the formatting the base `AbstractMessageLogger` would
   * apply (including the verbose flag for `trace`).
   */
  _emit(level, message, args, verbose = false) {
    let attributes;
    const index = args.findIndex((arg) => arg instanceof OtelData);
    if (index !== -1) {
      attributes = args[index].attributes;
      args = args.slice(0, index).concat(args.slice(index + 1));
    }
    const { severityNumber, severityText } = logLevelToOtlpSeverity(level);
    this._emitter.emit({
      timeUnixNano: msToUnixNano(Date.now()),
      severityNumber,
      severityText,
      body: format3([message, ...args], verbose),
      ...attributes ? { attributes } : void 0
    });
  }
};

function toResourceLogsPayload(record) {
  return toResourceLogsPayloadBatch([record]);
}

function toResourceLogsPayloadBatch(records) {
  return {
    resourceLogs: [
      {
        resource: { attributes: [] },
        scopeLogs: [
          {
            scope: { name: "vscode.agentHost" },
            logRecords: records.map((r) => ({
              timeUnixNano: r.timeUnixNano,
              observedTimeUnixNano: r.timeUnixNano,
              severityNumber: r.severityNumber,
              severityText: r.severityText,
              body: { stringValue: r.body },
              ...r.attributes ? { attributes: attributesToOtlp(r.attributes) } : void 0
            }))
          }
        ]
      }
    ]
  };
}

function attributesToOtlp(attributes) {
  return Object.entries(attributes).map(([key, value]) => ({ key, value: toAnyValue(value) }));
}

function toAnyValue(value) {
  switch (typeof value) {
    case "boolean":
      return { boolValue: value };
    case "number":
      return Number.isInteger(value) ? { intValue: String(value) } : { doubleValue: value };
    default:
      return { stringValue: value };
  }
}

function msToUnixNano(ms) {
  return `${ms}000000`;
}

function extractLevelFromOtlpLogsUri(uri) {
  const match2 = /^ahp-otlp:\/\/logs\/([^/?#]+)/i.exec(uri);
  if (!match2) {
    return void 0;
  }
  return parseOtlpLogLevel(match2[1]);
}

function buildOtlpLogsChannelUri(level) {
  return `ahp-otlp://logs/${level}`;
}
export { levelToSeverityNumber, parseOtlpLogLevel, logLevelToOtlpSeverity, toResourceLogsPayload, toResourceLogsPayloadBatch, attributesToOtlp, toAnyValue, msToUnixNano, extractLevelFromOtlpLogsUri, buildOtlpLogsChannelUri, OTLP_LOGS_CHANNEL_TEMPLATE, OTLP_CHANNEL_SCHEME, OTLP_LOG_LEVELS, OtelData, OtlpLogEmitter, OtlpEmitterLogger };
