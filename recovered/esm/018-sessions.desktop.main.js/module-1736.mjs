// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/remoteAgentHostService.ts
import { AHP_UNSUPPORTED_PROTOCOL_VERSION, ProtocolError } from "./module-1732.mjs";
import { readUnsupportedProtocolVersionErrorMeta } from "./module-1733.mjs";
import { DEFAULT_RECONNECT_POLICY } from "./module-1735.mjs";
import { normalizeRemoteAgentHostAddress } from "./module-1001.mjs";
import { TUNNEL_ADDRESS_PREFIX } from "./module-1734.mjs";
import { createDecorator } from "./module-0077.mjs";
import { connectionTokenQueryName } from "./module-0033.mjs";


// src/vs/platform/agentHost/common/remoteAgentHostService.ts
var RemoteAgentHostConnectionStatus;

((RemoteAgentHostConnectionStatus3) => {
  RemoteAgentHostConnectionStatus3.connected = Object.freeze({ kind: "connected" });
  RemoteAgentHostConnectionStatus3.connecting = Object.freeze({ kind: "connecting" });
  RemoteAgentHostConnectionStatus3.reconnecting = Object.freeze({ kind: "reconnecting" });
  RemoteAgentHostConnectionStatus3.disconnected = Object.freeze({ kind: "disconnected" });
  function incompatible(message, supportedByClient, offeredByServer, vscodeUpgradeMethod) {
    return Object.freeze({ kind: "incompatible", message, supportedByClient, offeredByServer, vscodeUpgradeMethod });
  }
  RemoteAgentHostConnectionStatus3.incompatible = incompatible;
  function isConnected(status2) {
    return status2?.kind === "connected";
  }
  RemoteAgentHostConnectionStatus3.isConnected = isConnected;
  function isConnecting(status2) {
    return status2?.kind === "connecting";
  }
  RemoteAgentHostConnectionStatus3.isConnecting = isConnecting;
  function isReconnecting(status2) {
    return status2?.kind === "reconnecting";
  }
  RemoteAgentHostConnectionStatus3.isReconnecting = isReconnecting;
  function isDisconnected(status2) {
    return status2?.kind === "disconnected";
  }
  RemoteAgentHostConnectionStatus3.isDisconnected = isDisconnected;
  function isIncompatible(status2) {
    return status2?.kind === "incompatible";
  }
  RemoteAgentHostConnectionStatus3.isIncompatible = isIncompatible;
  function isUnavailable(status2) {
    return status2?.kind !== "connected";
  }
  RemoteAgentHostConnectionStatus3.isUnavailable = isUnavailable;
  function fromConnectError(err, supportedByClient) {
    if (err instanceof ProtocolError && err.code === AHP_UNSUPPORTED_PROTOCOL_VERSION) {
      const data = err.data;
      const offeredByServer = Array.isArray(data?.supportedVersions) ? data.supportedVersions : void 0;
      const vscodeUpgradeMethod = readUnsupportedProtocolVersionErrorMeta(err.data)?.vscodeUpgradeMethod;
      return incompatible(err.message, supportedByClient, offeredByServer, vscodeUpgradeMethod);
    }
    return void 0;
  }
  RemoteAgentHostConnectionStatus3.fromConnectError = fromConnectError;
})(RemoteAgentHostConnectionStatus || (RemoteAgentHostConnectionStatus = {}));

var RemoteAgentHostsSettingId = "chat.remoteAgentHosts";

var RemoteAgentHostsEnabledSettingId = "chat.remoteAgentHostsEnabled";

var RemoteAgentHostAutoConnectSettingId = "chat.remoteAgentHostsAutoConnect";

var SSH_REMOTE_AGENT_HOSTS_STORAGE_KEY = "remoteAgentHost.sshConnections";

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

function entryAddressKey(entry) {
  const config = getEntryTypeConfig(entry.connection.type);
  const address = config.address(entry.connection);
  return config.normalizedAddress ? normalizeRemoteAgentHostAddress(address) : address;
}

function upsertRemoteAgentHostEntry(entries2, entry) {
  const address = entryAddressKey(entry);
  const existingIndex = entries2.findIndex((candidate) => entryAddressKey(candidate) === address);
  return existingIndex === -1 ? [...entries2, entry] : entries2.map((candidate, index2) => index2 === existingIndex ? entry : candidate);
}

function toRawEntriesOfKind(entries2, config) {
  const raw = [];
  for (const entry of entries2) {
    if (entry.connection.type === config.type) {
      raw.push(config.toRaw(entry, entry.connection));
    }
  }
  return raw;
}

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

async function storeWebSocketRemoteAgentHostEntries(configurationService, entries2) {
  const settings = readRemoteAgentHostSettings(configurationService);
  const preservedEntries = settings.entries.filter((entry) => !isRawRemoteAgentHostEntry(entry) || isLegacySshRawEntry(entry));
  const rawEntries = [
    ...preservedEntries,
    ...toRawEntriesOfKind(entries2, WEBSOCKET_ENTRY_TYPE_CONFIG)
  ];
  if (JSON.stringify(settings.entries) !== JSON.stringify(rawEntries)) {
    await configurationService.updateValue(RemoteAgentHostsSettingId, rawEntries, settings.target);
  }
}

async function addWebSocketRemoteAgentHostEntry(configurationService, entry) {
  if (entry.connection.type !== "websocket" /* WebSocket */) {
    throw new Error(`Expected a WebSocket remote agent host entry, got ${entry.connection.type}.`);
  }
  const normalizedEntry = {
    ...entry,
    connection: { ...entry.connection, address: normalizeRemoteAgentHostAddress(entry.connection.address) }
  };
  await storeWebSocketRemoteAgentHostEntries(configurationService, upsertRemoteAgentHostEntry(readWebSocketRemoteAgentHostEntries(configurationService, true), normalizedEntry));
}

async function removeWebSocketRemoteAgentHostEntry(configurationService, address) {
  const normalizedAddress = normalizeRemoteAgentHostAddress(address);
  await storeWebSocketRemoteAgentHostEntries(
    configurationService,
    readWebSocketRemoteAgentHostEntries(configurationService, true).filter((entry) => entryAddressKey(entry) !== normalizedAddress)
  );
}

function readSSHRemoteAgentHostEntries(storageService) {
  const raw = storageService.get(SSH_REMOTE_AGENT_HOSTS_STORAGE_KEY, -1 /* APPLICATION */);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isRawRemoteAgentHostEntry).filter(isLegacySshRawEntry).map((entry) => SSH_ENTRY_TYPE_CONFIG.fromRaw(entry)) : [];
  } catch {
    return [];
  }
}

function storeSSHRemoteAgentHostEntries(storageService, entries2) {
  const rawEntries = toRawEntriesOfKind(entries2, SSH_ENTRY_TYPE_CONFIG);
  const raw = JSON.stringify(rawEntries);
  const stored = storageService.get(SSH_REMOTE_AGENT_HOSTS_STORAGE_KEY, -1 /* APPLICATION */);
  if (stored === raw) {
    return;
  }
  if (rawEntries.length === 0) {
    if (stored !== void 0) {
      storageService.remove(SSH_REMOTE_AGENT_HOSTS_STORAGE_KEY, -1 /* APPLICATION */);
    }
    return;
  }
  storageService.store(SSH_REMOTE_AGENT_HOSTS_STORAGE_KEY, raw, -1 /* APPLICATION */, 0 /* USER */);
}

function removeSSHRemoteAgentHostEntry(storageService, address) {
  const normalizedAddress = normalizeRemoteAgentHostAddress(address);
  storeSSHRemoteAgentHostEntries(
    storageService,
    readSSHRemoteAgentHostEntries(storageService).filter((entry) => entryAddressKey(entry) !== normalizedAddress)
  );
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

function getEntryAddress(entry) {
  return getEntryTypeConfig(entry.connection.type).address(entry.connection);
}

function remoteAgentHostLogOutputChannelId(address) {
  return `agentHost.otlp.${address}`;
}

var AGENT_HOST_LOG_OUTPUT_CHANNEL_ID = "agenthost";

var IRemoteAgentHostService = createDecorator("remoteAgentHostService");

function parseRemoteAgentHostInput(input) {
  const trimmedInput = input.trim();
  if (!trimmedInput) {
    return { error: "empty" /* Empty */ };
  }
  const candidate = extractRemoteAgentHostCandidate(trimmedInput);
  if (!candidate) {
    return { error: "invalid" /* Invalid */ };
  }
  const hasExplicitScheme = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(candidate);
  try {
    const url = new URL(hasExplicitScheme ? candidate : `ws://${candidate}`);
    const normalizedProtocol = normalizeRemoteAgentHostProtocol(url.protocol);
    if (!normalizedProtocol || !url.host) {
      return { error: "invalid" /* Invalid */ };
    }
    const connectionToken = url.searchParams.get(connectionTokenQueryName) ?? void 0;
    url.searchParams.delete(connectionTokenQueryName);
    const address = formatRemoteAgentHostAddress(url, normalizedProtocol === "wss:" ? normalizedProtocol : void 0);
    if (!address) {
      return { error: "invalid" /* Invalid */ };
    }
    return {
      parsed: {
        address,
        connectionToken,
        suggestedName: url.host
      }
    };
  } catch {
    return { error: "invalid" /* Invalid */ };
  }
}

function extractRemoteAgentHostCandidate(input) {
  const urlMatch = input.match(/(?<url>(?:https?|wss?):\/\/\S+)/i);
  const candidate = urlMatch?.groups?.url ?? input;
  const trimmedCandidate = candidate.trim().replace(/[),.;\]]+$/, "");
  return trimmedCandidate || void 0;
}

function normalizeRemoteAgentHostProtocol(protocol) {
  switch (protocol.toLowerCase()) {
    case "ws:":
    case "http:":
      return "ws:";
    case "wss:":
    case "https:":
      return "wss:";
    default:
      return void 0;
  }
}

function formatRemoteAgentHostAddress(url, protocol) {
  if (!url.host) {
    return void 0;
  }
  const path = url.pathname !== "/" ? url.pathname : "";
  const query = url.search;
  const base = protocol ? `${protocol}//${url.host}` : url.host;
  return `${base}${path}${query}`;
}

function parseLegacyRawEntry(raw) {
  if (raw.sshConfigHost !== void 0 || raw.sshHostName !== void 0 || raw.sshUser !== void 0 || raw.sshPort !== void 0) {
    return SSH_ENTRY_TYPE_CONFIG.fromRaw(raw);
  }
  return WEBSOCKET_ENTRY_TYPE_CONFIG.fromRaw(raw);
}
export { isRawRemoteAgentHostEntry, isLegacySshRawEntry, entryAddressKey, upsertRemoteAgentHostEntry, toRawEntriesOfKind, readRemoteAgentHostSettings, readWebSocketRemoteAgentHostEntries, storeWebSocketRemoteAgentHostEntries, addWebSocketRemoteAgentHostEntry, removeWebSocketRemoteAgentHostEntry, readSSHRemoteAgentHostEntries, storeSSHRemoteAgentHostEntries, removeSSHRemoteAgentHostEntry, runtimeEntryTypeConfig, getEntryTypeConfig, getEntryAddress, remoteAgentHostLogOutputChannelId, parseRemoteAgentHostInput, extractRemoteAgentHostCandidate, normalizeRemoteAgentHostProtocol, formatRemoteAgentHostAddress, parseLegacyRawEntry, RemoteAgentHostConnectionStatus, RemoteAgentHostsSettingId, RemoteAgentHostsEnabledSettingId, RemoteAgentHostAutoConnectSettingId, SSH_REMOTE_AGENT_HOSTS_STORAGE_KEY, WEBSOCKET_ENTRY_TYPE_CONFIG, SSH_ENTRY_TYPE_CONFIG, WSL_ENTRY_TYPE_CONFIG, TUNNEL_ENTRY_TYPE_CONFIG, CLOUD_SANDBOX_ENTRY_TYPE_CONFIG, DEV_CONTAINER_RECONNECT_POLICY, DEV_CONTAINER_ENTRY_TYPE_CONFIG, ENTRY_TYPE_CONFIGS, AGENT_HOST_LOG_OUTPUT_CHANNEL_ID, IRemoteAgentHostService };
