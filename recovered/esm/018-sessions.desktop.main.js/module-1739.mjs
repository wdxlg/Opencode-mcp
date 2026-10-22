// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostTelemetry.ts



// src/vs/platform/agentHost/common/agentHostTelemetry.ts
var CLIENT_CONNECTION_KIND_META_KEY = "vscode.clientConnectionKind";

var CLIENT_TELEMETRY_LEVEL_META_KEY = "vscode.telemetryLevel";

var CLIENT_MACHINE_ID_META_KEY = "vscode.clientMachineId";

var CLIENT_DEV_DEVICE_ID_META_KEY = "vscode.clientDevDeviceId";

function toAgentHostClientMeta(connectionKind, telemetryLevel, machineId, devDeviceId) {
  const meta = {
    [CLIENT_TELEMETRY_LEVEL_META_KEY]: telemetryLevelToAgentHostValue(telemetryLevel)
  };
  if (connectionKind !== void 0 && connectionKind !== "unknown" /* Unknown */) {
    meta[CLIENT_CONNECTION_KIND_META_KEY] = connectionKind;
  }
  if (machineId) {
    meta[CLIENT_MACHINE_ID_META_KEY] = machineId;
  }
  if (devDeviceId) {
    meta[CLIENT_DEV_DEVICE_ID_META_KEY] = devDeviceId;
  }
  return meta;
}

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
export { toAgentHostClientMeta, telemetryLevelToAgentHostValue, CLIENT_CONNECTION_KIND_META_KEY, CLIENT_TELEMETRY_LEVEL_META_KEY, CLIENT_MACHINE_ID_META_KEY, CLIENT_DEV_DEVICE_ID_META_KEY };
