// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/telemetry/common/telemetry.ts
import { createDecorator } from "./module-0044.mjs";


// src/vs/platform/telemetry/common/telemetry.ts
var ITelemetryService = createDecorator("telemetryService");

var ICustomEndpointTelemetryService = createDecorator("customEndpointTelemetryService");

var TELEMETRY_SECTION_ID = "telemetry";

var TELEMETRY_SETTING_ID = "telemetry.telemetryLevel";

var TELEMETRY_CRASH_REPORTER_SETTING_ID = "telemetry.enableCrashReporter";

var TELEMETRY_OLD_SETTING_ID = "telemetry.enableTelemetry";
export { ITelemetryService, ICustomEndpointTelemetryService, TELEMETRY_SECTION_ID, TELEMETRY_SETTING_ID, TELEMETRY_CRASH_REPORTER_SETTING_ID, TELEMETRY_OLD_SETTING_ID };
