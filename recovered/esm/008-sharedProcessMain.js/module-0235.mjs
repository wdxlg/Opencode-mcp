// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/agentHost/common/tunnelAgentHostConnector.ts
import { raceTimeout } from "./module-0029.mjs";
import { TUNNEL_ADDRESS_PREFIX, TUNNEL_AGENT_HOST_PORT, TUNNEL_GATEWAY_MIN_PROTOCOL_VERSION, TUNNEL_GATEWAY_SELECT_PATH, TUNNEL_MIN_PROTOCOL_VERSION, TunnelNotFoundError, TunnelTags, createTunnelGatewaySelectionRejectedError, parseTunnelGatewayInventory, parseTunnelGatewaySelectionResponse } from "./module-0234.mjs";
import { Disposable, DisposableMap } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";
import { generateUuid } from "./module-0082.mjs";


// src/vs/platform/agentHost/common/tunnelAgentHostConnector.ts
var LOG_PREFIX4 = "[TunnelAgentHost]";

var BASE64_URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

var TUNNEL_STEP_TIMEOUT_MS = 3e4;

async function withTimeout(op, timeoutMs, stepName) {
  let timedOut = false;
  const result = await raceTimeout(op(), timeoutMs, () => {
    timedOut = true;
  });
  if (timedOut) {
    throw new Error(`${LOG_PREFIX4} ${stepName} timed out after ${timeoutMs}ms`);
  }
  return result;
}

async function deriveConnectionToken(tunnelId) {
  const hash2 = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(tunnelId)));
  let result = "";
  for (let index = 0; index < hash2.length; index += 3) {
    const first = hash2[index];
    const second = hash2[index + 1];
    const third = hash2[index + 2];
    result += BASE64_URL_ALPHABET[first >> 2];
    result += BASE64_URL_ALPHABET[(first & 3) << 4 | (second ?? 0) >> 4];
    if (second !== void 0) {
      result += BASE64_URL_ALPHABET[(second & 15) << 2 | (third ?? 0) >> 6];
    }
    if (third !== void 0) {
      result += BASE64_URL_ALPHABET[third & 63];
    }
  }
  return result.startsWith("-") ? `a${result}` : result;
}

function parseTunnelInfo(tunnel) {
  const labels = tunnel.labels ?? [];
  const tags = new TunnelTags(labels);
  if (tags.protocolVersion < TUNNEL_MIN_PROTOCOL_VERSION) {
    return void 0;
  }
  const { tunnelId, clusterId } = tunnel;
  if (!tunnelId || !clusterId) {
    return void 0;
  }
  const rawCount = tunnel.status?.hostConnectionCount;
  return {
    tunnelId,
    clusterId,
    name: tags.name || tunnel.name || tunnelId,
    tags: labels,
    protocolVersion: tags.protocolVersion,
    hostConnectionCount: typeof rawCount === "number" ? rawCount : rawCount?.current ?? 0
  };
}

var PendingGatewaySelection = class {
  constructor(address, name, connectionToken, socket, relayClient, _onUnexpectedClose) {
    this.address = address;
    this.name = name;
    this.connectionToken = connectionToken;
    this.socket = socket;
    this.relayClient = relayClient;
    this._onUnexpectedClose = _onUnexpectedClose;
    this._disposed = false;
    this._onSocketClosedListener = this.socket.onDidClose(() => {
      if (!this._disposed) {
        this._onUnexpectedClose();
      }
    });
  }
  /** Transfers socket ownership to an active connection. */
  detach() {
    this._onSocketClosedListener.dispose();
  }
  dispose() {
    if (!this._disposed) {
      this._disposed = true;
      this._onSocketClosedListener.dispose();
      try {
        this.socket.close();
      } catch {
      }
      try {
        this.socket.dispose();
      } catch {
      }
      try {
        this.relayClient.dispose();
      } catch {
      }
    }
  }
};

var TunnelConnection = class extends Disposable {
  constructor(connectionId, address, name, connectionToken, _socket, _relayClient, onMessage, onSocketClose) {
    super();
    this.connectionId = connectionId;
    this.address = address;
    this.name = name;
    this.connectionToken = connectionToken;
    this._socket = _socket;
    this._relayClient = _relayClient;
    this._onDidClose = this._register(new Emitter());
    this.onDidClose = this._onDidClose.event;
    this._closed = false;
    this._register(this._socket.onDidReceiveMessage(onMessage));
    this._register(this._socket.onDidClose((event) => {
      onSocketClose(event);
      this.dispose();
    }));
  }
  relaySend(data) {
    this._socket.send(data);
  }
  dispose() {
    if (!this._closed) {
      this._closed = true;
      this._socket.close();
      this._socket.dispose();
      this._relayClient.dispose();
      this._onDidClose.fire();
    }
    super.dispose();
  }
};

var TunnelAgentHostConnector = class extends Disposable {
  constructor(_relayClientFactory, _socketFactory, _logService) {
    super();
    this._relayClientFactory = _relayClientFactory;
    this._socketFactory = _socketFactory;
    this._logService = _logService;
    this._onDidRelayMessage = this._register(new Emitter());
    this.onDidRelayMessage = this._onDidRelayMessage.event;
    this._onDidRelayClose = this._register(new Emitter());
    this.onDidRelayClose = this._onDidRelayClose.event;
    this._connections = this._register(new DisposableMap());
    this._pendingSelections = this._register(new DisposableMap());
  }
  async connect(token, authProvider, tunnelId, clusterId) {
    this.closeTunnelConnections(tunnelId, "reconnecting");
    this._logService.info(`${LOG_PREFIX4} Connecting to tunnel ${tunnelId} in cluster ${clusterId}...`);
    const session = await this._relayClientFactory.getTunnel(tunnelId, clusterId, authProvider, token);
    if (!session) {
      throw new TunnelNotFoundError(tunnelId);
    }
    const { tunnel } = session;
    const relayClient = await session.createRelayClient();
    let portStream;
    try {
      await withTimeout(() => relayClient.connect(), TUNNEL_STEP_TIMEOUT_MS, "tunnel relay connect");
      this._logService.info(`${LOG_PREFIX4} Tunnel relay connected, waiting for port ${TUNNEL_AGENT_HOST_PORT}...`);
      await withTimeout(() => relayClient.waitForForwardedPort(TUNNEL_AGENT_HOST_PORT), TUNNEL_STEP_TIMEOUT_MS, `wait for forwarded port ${TUNNEL_AGENT_HOST_PORT}`);
      portStream = await withTimeout(() => relayClient.connectToForwardedPort(TUNNEL_AGENT_HOST_PORT), TUNNEL_STEP_TIMEOUT_MS, `connect to forwarded port ${TUNNEL_AGENT_HOST_PORT}`);
      this._logService.info(`${LOG_PREFIX4} Connected to forwarded port ${TUNNEL_AGENT_HOST_PORT}`);
    } catch (err) {
      this._disposeRelayClient(relayClient);
      throw err;
    }
    const connectionToken = await deriveConnectionToken(tunnelId);
    const name = new TunnelTags(tunnel.labels).name || tunnel.name || tunnelId;
    const connectionId = generateUuid();
    let socket;
    try {
      socket = await withTimeout(
        () => this._socketFactory.open(portStream, `/?tkn=${encodeURIComponent(connectionToken)}`),
        TUNNEL_STEP_TIMEOUT_MS,
        "WebSocket relay open"
      );
      this._logService.info(`${LOG_PREFIX4} WebSocket relay connected to agent host via tunnel`);
    } catch (err) {
      this._disposeRelayClient(relayClient);
      throw err;
    }
    this._createConnection(connectionId, `${TUNNEL_ADDRESS_PREFIX}${tunnelId}`, name, connectionToken, socket, relayClient);
    return {
      connectionId,
      address: `${TUNNEL_ADDRESS_PREFIX}${tunnelId}`,
      name,
      connectionToken,
      selected: { serverType: "unknown", instanceId: "", role: "primary", lifecycle: "external" }
    };
  }
  async prepareSelection(token, authProvider, tunnelId, clusterId) {
    const session = await this._relayClientFactory.getTunnel(tunnelId, clusterId, authProvider, token);
    if (!session) {
      throw new TunnelNotFoundError(tunnelId);
    }
    const { tunnel } = session;
    const tags = new TunnelTags(tunnel.labels);
    if (tags.protocolVersion < TUNNEL_GATEWAY_MIN_PROTOCOL_VERSION) {
      return void 0;
    }
    this._logService.info(`${LOG_PREFIX4} Preparing gateway selection for tunnel ${tunnelId} in cluster ${clusterId}...`);
    const relayClient = await session.createRelayClient();
    let socket;
    try {
      await withTimeout(() => relayClient.connect(), TUNNEL_STEP_TIMEOUT_MS, "tunnel relay connect");
      await withTimeout(() => relayClient.waitForForwardedPort(TUNNEL_AGENT_HOST_PORT), TUNNEL_STEP_TIMEOUT_MS, `wait for forwarded port ${TUNNEL_AGENT_HOST_PORT}`);
      const portStream = await withTimeout(() => relayClient.connectToForwardedPort(TUNNEL_AGENT_HOST_PORT), TUNNEL_STEP_TIMEOUT_MS, `connect to forwarded port ${TUNNEL_AGENT_HOST_PORT}`);
      socket = await withTimeout(() => this._socketFactory.open(portStream, TUNNEL_GATEWAY_SELECT_PATH), TUNNEL_STEP_TIMEOUT_MS, "gateway selection WebSocket open");
    } catch (err) {
      this._disposeRelayClient(relayClient);
      throw err;
    }
    let inventoryText;
    try {
      inventoryText = await withTimeout(() => this._readNextGatewayMessage(socket), TUNNEL_STEP_TIMEOUT_MS, "gateway inventory message");
    } catch (err) {
      this._disposeSocket(socket);
      this._disposeRelayClient(relayClient);
      throw err;
    }
    let inventory;
    let connectionToken;
    try {
      inventory = parseTunnelGatewayInventory(inventoryText);
      connectionToken = await deriveConnectionToken(tunnelId);
    } catch (err) {
      this._disposeSocket(socket);
      this._disposeRelayClient(relayClient);
      throw err;
    }
    const selectionId = generateUuid();
    this._pendingSelections.set(selectionId, new PendingGatewaySelection(
      `${TUNNEL_ADDRESS_PREFIX}${tunnelId}`,
      tags.name || tunnel.name || tunnelId,
      connectionToken,
      socket,
      relayClient,
      () => {
        this._logService.warn(`${LOG_PREFIX4} Gateway selection WebSocket for ${selectionId} closed before a selection was made`);
        this._pendingSelections.deleteAndDispose(selectionId);
      }
    ));
    return { selectionId, inventory };
  }
  async completeSelection(selectionId, selection) {
    const pending = this._pendingSelections.deleteAndLeak(selectionId);
    if (!pending) {
      throw new Error(`${LOG_PREFIX4} No pending gateway selection with id ${selectionId}`);
    }
    pending.detach();
    let response;
    try {
      pending.socket.send(JSON.stringify(selection));
      const responseText = await withTimeout(() => this._readNextGatewayMessage(pending.socket), TUNNEL_STEP_TIMEOUT_MS, "gateway selection acknowledgement");
      response = parseTunnelGatewaySelectionResponse(responseText);
    } catch (err) {
      this._disposeSocket(pending.socket);
      this._disposeRelayClient(pending.relayClient);
      throw err;
    }
    if (!response.ok) {
      this._disposeSocket(pending.socket);
      this._disposeRelayClient(pending.relayClient);
      throw createTunnelGatewaySelectionRejectedError(`${LOG_PREFIX4} ${response.error}`);
    }
    const connectionId = generateUuid();
    this._createConnection(connectionId, pending.address, pending.name, pending.connectionToken, pending.socket, pending.relayClient);
    this._logService.info(`${LOG_PREFIX4} Gateway selection ${selectionId} completed: selected ${response.selected.serverType} ${response.selected.instanceId}`);
    return { connectionId, address: pending.address, name: pending.name, connectionToken: pending.connectionToken, selected: response.selected };
  }
  async cancelSelection(selectionId) {
    this._pendingSelections.deleteAndDispose(selectionId);
  }
  async relaySend(connectionId, message) {
    this._connections.get(connectionId)?.relaySend(message);
  }
  async disconnect(connectionId) {
    this._connections.deleteAndDispose(connectionId);
  }
  closeTunnelConnections(tunnelId, operation) {
    const address = `${TUNNEL_ADDRESS_PREFIX}${tunnelId}`;
    for (const [connectionId, connection] of this._connections) {
      if (connection.address === address) {
        this._logService.info(`${LOG_PREFIX4} Closing existing relay for tunnel ${tunnelId} before ${operation}`);
        this._connections.deleteAndDispose(connectionId);
      }
    }
  }
  /** Registers a pending selection without creating a relay for unit tests. */
  setPendingGatewaySelectionForTests(selectionId, pending) {
    this._pendingSelections.set(selectionId, pending);
  }
  /** Removes and disposes a pending selection for unit tests. */
  deletePendingGatewaySelectionForTests(selectionId) {
    this._pendingSelections.deleteAndDispose(selectionId);
  }
  _createConnection(connectionId, address, name, connectionToken, socket, relayClient) {
    const connection = new TunnelConnection(
      connectionId,
      address,
      name,
      connectionToken,
      socket,
      relayClient,
      (data) => this._onDidRelayMessage.fire({ connectionId, data }),
      (event) => this._logService.info(`${LOG_PREFIX4} WebSocket relay closed for connection ${connectionId}; code=${event.code}, reason=${event.reason || "(empty)"}`)
    );
    const onConnectionClose = connection.onDidClose(() => {
      onConnectionClose.dispose();
      this._connections.deleteAndLeak(connectionId);
      this._onDidRelayClose.fire(connectionId);
    });
    this._connections.set(connectionId, connection);
  }
  _readNextGatewayMessage(socket) {
    return new Promise((resolve3, reject) => {
      const subscriptions = [];
      let settled = false;
      const cleanup = () => {
        for (const subscription of subscriptions.splice(0)) {
          subscription.dispose();
        }
      };
      const onMessage = socket.onDidReceiveMessage((message) => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        resolve3(message);
      });
      if (settled) {
        onMessage.dispose();
        return;
      }
      subscriptions.push(onMessage);
      const onClose = socket.onDidClose((event) => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        if (event.error) {
          reject(event.error);
        } else {
          reject(new Error(`${LOG_PREFIX4} Gateway WebSocket closed before expected message; code=${event.code}, reason=${event.reason || "(empty)"}`));
        }
      });
      if (settled) {
        onClose.dispose();
      } else {
        subscriptions.push(onClose);
      }
    });
  }
  _disposeSocket(socket) {
    try {
      socket.close();
    } catch {
    }
    try {
      socket.dispose();
    } catch {
    }
  }
  _disposeRelayClient(relayClient) {
    try {
      relayClient.dispose();
    } catch {
    }
  }
};
export { withTimeout, deriveConnectionToken, parseTunnelInfo, LOG_PREFIX4, BASE64_URL_ALPHABET, TUNNEL_STEP_TIMEOUT_MS, PendingGatewaySelection, TunnelConnection, TunnelAgentHostConnector };
