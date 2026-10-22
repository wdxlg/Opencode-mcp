// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostTelemetry.ts



// src/vs/platform/agentHost/common/agentHostTelemetry.ts
var AgentHostLaunchKindEnvVar = "VSCODE_AGENT_HOST_LAUNCH_KIND";

function createUnknownAgentHostClientTelemetryContext(clientType) {
  return {
    clientType,
    connectionKind: "unknown" /* Unknown */,
    transportKind: "unknown" /* Unknown */,
    hostLaunchKind: "unknown" /* Unknown */
  };
}

var CLIENT_CONNECTION_KIND_META_KEY = "vscode.clientConnectionKind";

var CLIENT_TELEMETRY_LEVEL_META_KEY = "vscode.telemetryLevel";

var CLIENT_MACHINE_ID_META_KEY = "vscode.clientMachineId";

var CLIENT_DEV_DEVICE_ID_META_KEY = "vscode.clientDevDeviceId";

function readClientConnectionKind(meta) {
  const value = meta?.[CLIENT_CONNECTION_KIND_META_KEY];
  switch (value) {
    case "local" /* Local */:
    case "direct_websocket" /* DirectWebSocket */:
    case "dev_tunnel" /* DevTunnel */:
    case "dev_container" /* DevContainer */:
    case "ssh" /* SSH */:
    case "wsl" /* WSL */:
    case "remote_extension_host" /* RemoteExtensionHost */:
    case "web_pub_sub" /* WebPubSub */:
      return value;
    default:
      return "unknown" /* Unknown */;
  }
}

function readClientTelemetryLevel(meta) {
  const value = meta?.[CLIENT_TELEMETRY_LEVEL_META_KEY];
  switch (value) {
    case "off" /* OFF */:
      return 0 /* NONE */;
    case "crash" /* CRASH */:
      return 1 /* CRASH */;
    case "error" /* ERROR */:
      return 2 /* ERROR */;
    case "all" /* ON */:
      return 3 /* USAGE */;
    default:
      return value === void 0 ? void 0 : 0 /* NONE */;
  }
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

function readClientMachineId(meta) {
  return readClientTelemetryIdentity(meta, CLIENT_MACHINE_ID_META_KEY);
}

function readClientDevDeviceId(meta) {
  return readClientTelemetryIdentity(meta, CLIENT_DEV_DEVICE_ID_META_KEY);
}

function readClientTelemetryIdentity(meta, key) {
  const value = meta?.[key];
  return typeof value === "string" && value.length > 0 ? value : void 0;
}

function readAgentHostLaunchKind(value) {
  switch (value) {
    case "vscode_main_process" /* VSCodeMainProcess */:
    case "vscode_cli" /* VSCodeCLI */:
      return value;
    default:
      return "unknown" /* Unknown */;
  }
}
export { createUnknownAgentHostClientTelemetryContext, readClientConnectionKind, readClientTelemetryLevel, telemetryLevelToAgentHostValue, readClientMachineId, readClientDevDeviceId, readClientTelemetryIdentity, readAgentHostLaunchKind, AgentHostLaunchKindEnvVar, CLIENT_CONNECTION_KIND_META_KEY, CLIENT_TELEMETRY_LEVEL_META_KEY, CLIENT_MACHINE_ID_META_KEY, CLIENT_DEV_DEVICE_ID_META_KEY };
