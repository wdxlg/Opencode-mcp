// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/agentHost/node/tunnelAgentHostService.ts
import { Disposable, toDisposable } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";
import { TUNNEL_AGENT_HOST_PORT, TUNNEL_LAUNCHER_LABEL, TUNNEL_MIN_PROTOCOL_VERSION } from "./module-0234.mjs";
import { TunnelAgentHostConnector, parseTunnelInfo } from "./module-0235.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0044.mjs";


// src/vs/platform/agentHost/node/tunnelAgentHostService.ts
var LOG_PREFIX5 = "[TunnelAgentHost]";

var NodeTunnelRelayClient = class {
  constructor(_relayClient, _tunnel) {
    this._relayClient = _relayClient;
    this._tunnel = _tunnel;
  }
  connect() {
    return this._relayClient.connect(this._tunnel);
  }
  waitForForwardedPort(port) {
    return this._relayClient.waitForForwardedPort(port);
  }
  async connectToForwardedPort(port) {
    return await this._relayClient.connectToForwardedPort(port);
  }
  dispose() {
    this._relayClient.dispose();
  }
};

var NodeTunnelRelayClientFactory = class {
  constructor(_createManagementClient) {
    this._createManagementClient = _createManagementClient;
  }
  async getTunnel(tunnelId, clusterId, authProvider, token) {
    const managementClient = await this._createManagementClient(token, authProvider);
    const resolved = await managementClient.getTunnel({ tunnelId, clusterId }, {
      includePorts: true,
      tokenScopes: ["connect"]
    });
    if (!resolved) {
      return void 0;
    }
    return {
      tunnel: resolved,
      createRelayClient: async () => {
        const { TunnelRelayTunnelClient } = await import("@microsoft/dev-tunnels-connections");
        const relayClient = new TunnelRelayTunnelClient(managementClient);
        relayClient.acceptLocalConnectionsForForwardedPorts = false;
        if (resolved.endpoints) {
          relayClient.endpoints = resolved.endpoints;
        }
        return new NodeTunnelRelayClient(relayClient, resolved);
      }
    };
  }
};

var NodeTunnelMessageSocket = class extends Disposable {
  constructor(_socket) {
    super();
    this._socket = _socket;
    this._onDidReceiveMessage = this._register(new Emitter());
    this.onDidReceiveMessage = this._onDidReceiveMessage.event;
    this._onDidClose = this._register(new Emitter());
    this.onDidClose = this._onDidClose.event;
    const onMessage = (data) => this._onDidReceiveMessage.fire(rawGatewayDataToString(data));
    const onClose = (code, reason) => this._onDidClose.fire({ code, reason: reason?.toString() || void 0 });
    const onError = (error) => this._onDidClose.fire({ error });
    this._socket.on("message", onMessage);
    this._socket.on("close", onClose);
    this._socket.on("error", onError);
    this._register(toDisposable(() => {
      this._socket.off("message", onMessage);
      this._socket.off("close", onClose);
      this._socket.off("error", onError);
    }));
  }
  send(data) {
    if (this._socket.readyState === this._socket.OPEN) {
      this._socket.send(data);
    }
  }
  close() {
    this._socket.close();
  }
  dispose() {
    super.dispose();
  }
};

var NodeTunnelSocketFactory = class {
  async open(stream, path) {
    const WS = await import("ws");
    return new Promise((resolve3, reject) => {
      const socket = new WS.WebSocket(`ws://localhost:${TUNNEL_AGENT_HOST_PORT}${path}`, {
        createConnection: (() => stream)
      });
      const onError = (error) => {
        socket.off("open", onOpen);
        reject(error);
      };
      const onOpen = () => {
        socket.off("error", onError);
        resolve3(new NodeTunnelMessageSocket(socket));
      };
      socket.once("open", onOpen);
      socket.once("error", onError);
    });
  }
};

function rawGatewayDataToString(data) {
  if (Array.isArray(data)) {
    return Buffer.concat(data).toString();
  } else if (data instanceof ArrayBuffer) {
    return Buffer.from(new Uint8Array(data)).toString();
  }
  return data.toString();
}

var TunnelAgentHostMainService = class extends Disposable {
  constructor(_logService) {
    super();
    this._logService = _logService;
    this._connector = this._register(new TunnelAgentHostConnector(
      new NodeTunnelRelayClientFactory((token, authProvider) => this._createManagementClient(token, authProvider)),
      new NodeTunnelSocketFactory(),
      this._logService
    ));
    this.onDidRelayMessage = this._connector.onDidRelayMessage;
    this.onDidRelayClose = this._connector.onDidRelayClose;
  }
  async listTunnels(token, authProvider, additionalTunnelNames) {
    const client = await this._createManagementClient(token, authProvider);
    const results = [];
    const seen = /* @__PURE__ */ new Set();
    try {
      const tunnels = await client.listTunnels(void 0, void 0, {
        labels: [TUNNEL_LAUNCHER_LABEL],
        requireAllLabels: true,
        includePorts: true,
        tokenScopes: ["connect"]
      });
      for (const tunnel of tunnels) {
        const info = parseTunnelInfo(tunnel);
        if (info && info.protocolVersion >= TUNNEL_MIN_PROTOCOL_VERSION) {
          results.push(info);
          seen.add(info.tunnelId);
        }
      }
    } catch (err) {
      this._logService.error(`${LOG_PREFIX5} Failed to enumerate tunnels`, err);
    }
    if (additionalTunnelNames) {
      for (const tunnelName of additionalTunnelNames) {
        try {
          const [tunnel] = await client.listTunnels(void 0, void 0, {
            labels: [tunnelName, TUNNEL_LAUNCHER_LABEL],
            requireAllLabels: true,
            includePorts: true,
            tokenScopes: ["connect"],
            limit: 1
          });
          if (tunnel) {
            const info = parseTunnelInfo(tunnel);
            if (info && info.protocolVersion >= TUNNEL_MIN_PROTOCOL_VERSION && !seen.has(info.tunnelId)) {
              results.push(info);
              seen.add(info.tunnelId);
            }
          }
        } catch (err) {
          this._logService.warn(`${LOG_PREFIX5} Failed to look up tunnel '${tunnelName}'`, err);
        }
      }
    }
    this._logService.info(`${LOG_PREFIX5} Found ${results.length} tunnel(s) with agent host support`);
    return results;
  }
  async deleteTunnel(token, authProvider, tunnelId, clusterId) {
    const client = await this._createManagementClient(token, authProvider);
    this._logService.info(`${LOG_PREFIX5} Deleting tunnel ${tunnelId} in cluster ${clusterId}...`);
    await client.deleteTunnel({ tunnelId, clusterId });
    this._connector.closeTunnelConnections(tunnelId, "deleting");
    this._logService.info(`${LOG_PREFIX5} Deleted tunnel ${tunnelId}`);
  }
  connect(token, authProvider, tunnelId, clusterId) {
    return this._connector.connect(token, authProvider, tunnelId, clusterId);
  }
  prepareSelection(token, authProvider, tunnelId, clusterId) {
    return this._connector.prepareSelection(token, authProvider, tunnelId, clusterId);
  }
  completeSelection(selectionId, selection) {
    return this._connector.completeSelection(selectionId, selection);
  }
  cancelSelection(selectionId) {
    return this._connector.cancelSelection(selectionId);
  }
  relaySend(connectionId, message) {
    return this._connector.relaySend(connectionId, message);
  }
  disconnect(connectionId) {
    return this._connector.disconnect(connectionId);
  }
  async _createManagementClient(token, authProvider) {
    const management = await import("@microsoft/dev-tunnels-management");
    const authHeader = authProvider === "github" ? `github ${token}` : `Bearer ${token}`;
    return new management.TunnelManagementHttpClient(
      "vscode-sessions",
      management.ManagementApiVersions.Version20230927preview,
      async () => authHeader
    );
  }
};

TunnelAgentHostMainService = __decorateClass([
  __decorateParam(0, ILogService)
], TunnelAgentHostMainService);
export { rawGatewayDataToString, LOG_PREFIX5, NodeTunnelRelayClient, NodeTunnelRelayClientFactory, NodeTunnelMessageSocket, NodeTunnelSocketFactory, TunnelAgentHostMainService };
