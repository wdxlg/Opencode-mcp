// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/remoteAgentHostService.ts
import { AHP_UNSUPPORTED_PROTOCOL_VERSION, ProtocolError } from "./module-1616.mjs";
import { readUnsupportedProtocolVersionErrorMeta } from "./module-1805.mjs";
import { DEFAULT_RECONNECT_POLICY } from "./module-1807.mjs";
import { TUNNEL_ADDRESS_PREFIX } from "./module-1806.mjs";
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/agentHost/common/remoteAgentHostService.ts
var RemoteAgentHostConnectionStatus;

((RemoteAgentHostConnectionStatus2) => {
  RemoteAgentHostConnectionStatus2.connected = Object.freeze({ kind: "connected" });
  RemoteAgentHostConnectionStatus2.connecting = Object.freeze({ kind: "connecting" });
  RemoteAgentHostConnectionStatus2.reconnecting = Object.freeze({ kind: "reconnecting" });
  RemoteAgentHostConnectionStatus2.disconnected = Object.freeze({ kind: "disconnected" });
  function incompatible(message, supportedByClient, offeredByServer, vscodeUpgradeMethod) {
    return Object.freeze({ kind: "incompatible", message, supportedByClient, offeredByServer, vscodeUpgradeMethod });
  }
  RemoteAgentHostConnectionStatus2.incompatible = incompatible;
  function isConnected(status2) {
    return status2?.kind === "connected";
  }
  RemoteAgentHostConnectionStatus2.isConnected = isConnected;
  function isConnecting(status2) {
    return status2?.kind === "connecting";
  }
  RemoteAgentHostConnectionStatus2.isConnecting = isConnecting;
  function isReconnecting(status2) {
    return status2?.kind === "reconnecting";
  }
  RemoteAgentHostConnectionStatus2.isReconnecting = isReconnecting;
  function isDisconnected(status2) {
    return status2?.kind === "disconnected";
  }
  RemoteAgentHostConnectionStatus2.isDisconnected = isDisconnected;
  function isIncompatible(status2) {
    return status2?.kind === "incompatible";
  }
  RemoteAgentHostConnectionStatus2.isIncompatible = isIncompatible;
  function isUnavailable(status2) {
    return status2?.kind !== "connected";
  }
  RemoteAgentHostConnectionStatus2.isUnavailable = isUnavailable;
  function fromConnectError(err, supportedByClient) {
    if (err instanceof ProtocolError && err.code === AHP_UNSUPPORTED_PROTOCOL_VERSION) {
      const data = err.data;
      const offeredByServer = Array.isArray(data?.supportedVersions) ? data.supportedVersions : void 0;
      const vscodeUpgradeMethod = readUnsupportedProtocolVersionErrorMeta(err.data)?.vscodeUpgradeMethod;
      return incompatible(err.message, supportedByClient, offeredByServer, vscodeUpgradeMethod);
    }
    return void 0;
  }
  RemoteAgentHostConnectionStatus2.fromConnectError = fromConnectError;
})(RemoteAgentHostConnectionStatus || (RemoteAgentHostConnectionStatus = {}));

var RemoteAgentHostsSettingId = "chat.remoteAgentHosts";

var RemoteAgentHostsEnabledSettingId = "chat.remoteAgentHostsEnabled";

function isRawRemoteAgentHostEntry(value2) {
  if (typeof value2 !== "object" || value2 === null) {
    return false;
  }
  const candidate = value2;
  return typeof candidate.address === "string" && typeof candidate.name === "string" && (candidate.connectionToken === void 0 || typeof candidate.connectionToken === "string") && (candidate.sshConfigHost === void 0 || typeof candidate.sshConfigHost === "string") && (candidate.sshHostName === void 0 || typeof candidate.sshHostName === "string") && (candidate.sshUser === void 0 || typeof candidate.sshUser === "string") && (candidate.sshPort === void 0 || typeof candidate.sshPort === "number") && (candidate.sshServerType === void 0 || candidate.sshServerType === "editor" || candidate.sshServerType === "standalone") && (candidate.sshInstanceId === void 0 || typeof candidate.sshInstanceId === "string") && (candidate.sshPrimary === void 0 || typeof candidate.sshPrimary === "boolean") && (candidate.sshLifecycle === void 0 || candidate.sshLifecycle === "managed" || candidate.sshLifecycle === "external");
}

function isLegacySshRawEntry(entry) {
  return entry.sshConfigHost !== void 0 || entry.sshHostName !== void 0 || entry.sshUser !== void 0 || entry.sshPort !== void 0;
}

var WEBSOCKET_ENTRY_TYPE_CONFIG = {
  type: "websocket" /* WebSocket */,
  store: "settings",
  dialableByService: true,
  normalizedAddress: true,
  reconnect: DEFAULT_RECONNECT_POLICY,
  address: (connection) => connection.address,
  toRaw: (entry, connection) => ({
    address: connection.address,
    name: entry.name,
    connectionToken: entry.connectionToken
  }),
  fromRaw: (raw) => ({ name: raw.name, connectionToken: raw.connectionToken, connection: { type: "websocket" /* WebSocket */, address: raw.address } })
};

var SSH_ENTRY_TYPE_CONFIG = {
  type: "ssh" /* SSH */,
  store: "storage",
  dialableByService: true,
  normalizedAddress: true,
  reconnect: DEFAULT_RECONNECT_POLICY,
  address: (connection) => connection.address,
  toRaw: (entry, connection) => ({
    address: connection.address,
    name: entry.name,
    connectionToken: entry.connectionToken,
    sshConfigHost: connection.sshConfigHost,
    sshHostName: connection.hostName,
    sshUser: connection.user,
    sshPort: connection.port,
    sshServerType: connection.serverType,
    sshInstanceId: connection.instanceId,
    sshPrimary: connection.primary,
    sshLifecycle: connection.lifecycle
  }),
  fromRaw: (raw) => ({
    name: raw.name,
    connectionToken: raw.connectionToken,
    connection: {
      type: "ssh" /* SSH */,
      address: raw.address,
      sshConfigHost: raw.sshConfigHost,
      hostName: raw.sshHostName ?? raw.address,
      user: raw.sshUser,
      port: raw.sshPort,
      ...raw.sshServerType ? { serverType: raw.sshServerType } : void 0,
      ...raw.sshInstanceId ? { instanceId: raw.sshInstanceId } : void 0,
      ...raw.sshPrimary !== void 0 ? { primary: raw.sshPrimary } : void 0,
      ...raw.sshLifecycle ? { lifecycle: raw.sshLifecycle } : void 0
    }
  })
};

function readRemoteAgentHostSettings(configurationService) {
  const inspected = configurationService.inspect(RemoteAgentHostsSettingId);
  const target = inspected.userLocalValue !== void 0 ? 3 /* USER_LOCAL */ : inspected.userRemoteValue !== void 0 ? 4 /* USER_REMOTE */ : 2 /* USER */;
  return {
    target,
    entries: target === 3 /* USER_LOCAL */ ? inspected.userLocalValue ?? [] : target === 4 /* USER_REMOTE */ ? inspected.userRemoteValue ?? [] : inspected.userValue ?? []
  };
}

function readWebSocketRemoteAgentHostEntries(configurationService, targetOnly = false) {
  const entries2 = targetOnly ? readRemoteAgentHostSettings(configurationService).entries : configurationService.getValue(RemoteAgentHostsSettingId) ?? [];
  return entries2.filter(isRawRemoteAgentHostEntry).filter((entry) => !isLegacySshRawEntry(entry)).map((entry) => WEBSOCKET_ENTRY_TYPE_CONFIG.fromRaw(entry));
}

function runtimeEntryTypeConfig(type, normalizedAddress, address, reconnect = DEFAULT_RECONNECT_POLICY) {
  return { type, store: "runtime", dialableByService: false, normalizedAddress, reconnect, address };
}

var WSL_ENTRY_TYPE_CONFIG = runtimeEntryTypeConfig("wsl" /* WSL */, true, (connection) => connection.address);

var TUNNEL_ENTRY_TYPE_CONFIG = runtimeEntryTypeConfig("tunnel" /* Tunnel */, false, (connection) => `${TUNNEL_ADDRESS_PREFIX}${connection.tunnelId}`);

var CLOUD_SANDBOX_ENTRY_TYPE_CONFIG = runtimeEntryTypeConfig("cloudSandbox" /* CloudSandbox */, true, (connection) => connection.address);

var DEV_CONTAINER_RECONNECT_POLICY = {
  autoRestore: true,
  initialDelayMs: 2e3,
  maxDelayMs: 6e4,
  maxAttempts: 3
};

var DEV_CONTAINER_ENTRY_TYPE_CONFIG = runtimeEntryTypeConfig("devContainer" /* DevContainer */, true, (connection) => connection.address, DEV_CONTAINER_RECONNECT_POLICY);

var ENTRY_TYPE_CONFIGS = {
  ["websocket" /* WebSocket */]: WEBSOCKET_ENTRY_TYPE_CONFIG,
  ["ssh" /* SSH */]: SSH_ENTRY_TYPE_CONFIG,
  ["wsl" /* WSL */]: WSL_ENTRY_TYPE_CONFIG,
  ["tunnel" /* Tunnel */]: TUNNEL_ENTRY_TYPE_CONFIG,
  ["cloudSandbox" /* CloudSandbox */]: CLOUD_SANDBOX_ENTRY_TYPE_CONFIG,
  ["devContainer" /* DevContainer */]: DEV_CONTAINER_ENTRY_TYPE_CONFIG
};

function getEntryTypeConfig(type) {
  return ENTRY_TYPE_CONFIGS[type];
}

function remoteAgentHostLogOutputChannelId(address) {
  return `agentHost.otlp.${address}`;
}

var AGENT_HOST_LOG_OUTPUT_CHANNEL_ID = "agenthost";

var IRemoteAgentHostService = createDecorator("remoteAgentHostService");
export { isRawRemoteAgentHostEntry, isLegacySshRawEntry, readRemoteAgentHostSettings, readWebSocketRemoteAgentHostEntries, runtimeEntryTypeConfig, getEntryTypeConfig, remoteAgentHostLogOutputChannelId, RemoteAgentHostConnectionStatus, RemoteAgentHostsSettingId, RemoteAgentHostsEnabledSettingId, WEBSOCKET_ENTRY_TYPE_CONFIG, SSH_ENTRY_TYPE_CONFIG, WSL_ENTRY_TYPE_CONFIG, TUNNEL_ENTRY_TYPE_CONFIG, CLOUD_SANDBOX_ENTRY_TYPE_CONFIG, DEV_CONTAINER_RECONNECT_POLICY, DEV_CONTAINER_ENTRY_TYPE_CONFIG, ENTRY_TYPE_CONFIGS, AGENT_HOST_LOG_OUTPUT_CHANNEL_ID, IRemoteAgentHostService };
