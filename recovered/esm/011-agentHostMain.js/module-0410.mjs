// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostClientConnectionService.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable, toDisposable } from "./module-0010.mjs";


// src/vs/platform/agentHost/node/agentHostClientConnectionService.ts
var AGENT_HOST_CLIENT_CONNECTION_HISTORY_RETENTION = 3e4 * 10;

var IAgentHostClientConnectionService = createDecorator("agentHostClientConnectionService");

var AgentHostClientConnectionService = class extends Disposable {
  constructor() {
    super();
    this._sources = /* @__PURE__ */ new Set();
    this._register(toDisposable(() => this._sources.clear()));
  }
  registerSource(source) {
    if (this._sources.has(source)) {
      throw new Error("Agent Host client connection source is already registered");
    }
    this._sources.add(source);
    return toDisposable(() => this._sources.delete(source));
  }
  hasSeenClient(clientId) {
    for (const source of this._sources) {
      if (source.hasSeenClient(clientId)) {
        return true;
      }
    }
    return false;
  }
  isClientConnected(clientId) {
    for (const source of this._sources) {
      if (source.isClientConnected(clientId)) {
        return true;
      }
    }
    return false;
  }
  getConnectionCounts(clientId) {
    const connectedClients = /* @__PURE__ */ new Set();
    let connectedTransportCount = 0;
    let clientTransportCount = 0;
    for (const source of this._sources) {
      for (const [connectedClientId, transportCount] of source.getConnectedClientTransportCounts()) {
        connectedClients.add(connectedClientId);
        connectedTransportCount += transportCount;
        if (connectedClientId === clientId) {
          clientTransportCount += transportCount;
        }
      }
    }
    return {
      connectedClientCount: connectedClients.size,
      connectedTransportCount,
      clientTransportCount
    };
  }
};
export { AGENT_HOST_CLIENT_CONNECTION_HISTORY_RETENTION, IAgentHostClientConnectionService, AgentHostClientConnectionService };
