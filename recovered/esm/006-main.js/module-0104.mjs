// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/telemetry/common/telemetry.ts
import { __esm } from "./module-0000.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/telemetry/common/telemetry.ts
var ITelemetryService, ICustomEndpointTelemetryService, currentSessionDateStorageKey, firstSessionDateStorageKey, lastSessionDateStorageKey, machineIdKey, sqmIdKey, devDeviceIdKey, TELEMETRY_SECTION_ID, TELEMETRY_SETTING_ID, TELEMETRY_CRASH_REPORTER_SETTING_ID, TELEMETRY_OLD_SETTING_ID;

var init_telemetry = __esm({
  "src/vs/platform/telemetry/common/telemetry.ts"() {
    init_instantiation();
    ITelemetryService = createDecorator("telemetryService");
    ICustomEndpointTelemetryService = createDecorator("customEndpointTelemetryService");
    currentSessionDateStorageKey = "telemetry.currentSessionDate";
    firstSessionDateStorageKey = "telemetry.firstSessionDate";
    lastSessionDateStorageKey = "telemetry.lastSessionDate";
    machineIdKey = "telemetry.machineId";
    sqmIdKey = "telemetry.sqmId";
    devDeviceIdKey = "telemetry.devDeviceId";
    TELEMETRY_SECTION_ID = "telemetry";
    TELEMETRY_SETTING_ID = "telemetry.telemetryLevel";
    TELEMETRY_CRASH_REPORTER_SETTING_ID = "telemetry.enableCrashReporter";
    TELEMETRY_OLD_SETTING_ID = "telemetry.enableTelemetry";
  }
});
export { ITelemetryService, ICustomEndpointTelemetryService, currentSessionDateStorageKey, firstSessionDateStorageKey, lastSessionDateStorageKey, machineIdKey, sqmIdKey, devDeviceIdKey, TELEMETRY_SECTION_ID, TELEMETRY_SETTING_ID, TELEMETRY_CRASH_REPORTER_SETTING_ID, TELEMETRY_OLD_SETTING_ID, init_telemetry };
