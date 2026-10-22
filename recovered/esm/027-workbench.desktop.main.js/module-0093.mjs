// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/telemetry/common/telemetry.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/telemetry/common/telemetry.ts
var ITelemetryService = createDecorator("telemetryService");

function telemetryLevelEnabled(service, level) {
  return service.telemetryLevel >= level;
}

function escapeModelIdForTelemetry(modelId) {
  return modelId?.replace(/[\/\\]/g, "|");
}

var ICustomEndpointTelemetryService = createDecorator("customEndpointTelemetryService");

var firstSessionDateStorageKey = "telemetry.firstSessionDate";

var lastSessionDateStorageKey = "telemetry.lastSessionDate";

var TELEMETRY_SECTION_ID = "telemetry";

var TELEMETRY_SETTING_ID = "telemetry.telemetryLevel";

var TELEMETRY_CRASH_REPORTER_SETTING_ID = "telemetry.enableCrashReporter";

var TELEMETRY_OLD_SETTING_ID = "telemetry.enableTelemetry";
export { telemetryLevelEnabled, escapeModelIdForTelemetry, ITelemetryService, ICustomEndpointTelemetryService, firstSessionDateStorageKey, lastSessionDateStorageKey, TELEMETRY_SECTION_ID, TELEMETRY_SETTING_ID, TELEMETRY_CRASH_REPORTER_SETTING_ID, TELEMETRY_OLD_SETTING_ID };
