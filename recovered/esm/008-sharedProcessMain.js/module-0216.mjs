// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostTelemetry.ts



// src/vs/platform/agentHost/common/agentHostTelemetry.ts
function telemetryLevelToAgentHostValue(telemetryLevel) {
  switch (telemetryLevel) {
    case 0 /* NONE */:
      return "off" /* OFF */;
    case 1 /* CRASH */:
      return "crash" /* CRASH */;
    case 2 /* ERROR */:
      return "error" /* ERROR */;
    case 3 /* USAGE */:
      return "all" /* ON */;
    default:
      return "off" /* OFF */;
  }
}
export { telemetryLevelToAgentHostValue };
