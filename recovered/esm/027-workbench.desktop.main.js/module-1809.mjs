// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/browser/agentHostConnectionsService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { AMBIENT_AGENT_HOST_AUTHORITY, IAgentHostConnectionsService, LOCAL_AGENT_HOST_SCHEME_PREFIX } from "./module-0959.mjs";
import { localize } from "./module-0001.mjs";
import { agentHostAuthority } from "./module-1000.mjs";
import { AgentSession } from "./module-1106.mjs";
import { findRemoteAgentHostSessionTypeAuthority, isRemoteAgentHostSessionType, remoteAgentHostSessionTypeAuthorityPrefix } from "./module-0958.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { IRemoteAgentHostService } from "./module-1808.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/platform/agentHost/browser/agentHostConnectionsService.ts
var AgentHostConnectionsService = class extends Disposable {
  constructor(_agentHostService, _remoteAgentHostService) {
    super();
    this._agentHostService = _agentHostService;
    this._remoteAgentHostService = _remoteAgentHostService;
    this._onDidChangeConnections = this._register(new Emitter());
    this.onDidChangeConnections = this._onDidChangeConnections.event;
    this._register(this._remoteAgentHostService.onDidChangeConnections(() => this._onDidChangeConnections.fire()));
    this._register(this._agentHostService.onAgentHostStart(() => this._onDidChangeConnections.fire()));
    this._register(this._agentHostService.onAgentHostExit(() => this._onDidChangeConnections.fire()));
  }
  get ambientConnection() {
    return this._agentHostService;
  }
  get connections() {
    const result = [{
      authority: AMBIENT_AGENT_HOST_AUTHORITY,
      address: void 0,
      name: localize(1870, null),
      isAmbient: true,
      connection: this._agentHostService
    }];
    for (const info of this._remoteAgentHostService.connections) {
      result.push({
        authority: agentHostAuthority(info.address),
        address: info.address,
        name: info.name,
        isAmbient: false,
        connection: this._remoteAgentHostService.getConnection(info.address)
      });
    }
    return result;
  }
  getConnectionByAuthority(authority) {
    if (authority === AMBIENT_AGENT_HOST_AUTHORITY) {
      return this._agentHostService;
    }
    return this._remoteAgentHostService.getConnectionByAuthority(authority);
  }
  getConnectionByAddress(address) {
    return this._remoteAgentHostService.getConnection(address);
  }
  resolveSessionResource(sessionResource) {
    const scheme = sessionResource.scheme;
    const rawSessionId = sessionResource.path.substring(1);
    if (scheme.startsWith(LOCAL_AGENT_HOST_SCHEME_PREFIX)) {
      const provider = scheme.substring(LOCAL_AGENT_HOST_SCHEME_PREFIX.length);
      return provider ? { connection: this._agentHostService, backendSession: AgentSession.uri(provider, rawSessionId) } : void 0;
    }
    if (isRemoteAgentHostSessionType(scheme)) {
      const authority = findRemoteAgentHostSessionTypeAuthority(scheme, this.connections.filter((c) => !c.isAmbient).map((c) => c.authority));
      if (authority) {
        const provider = scheme.substring(remoteAgentHostSessionTypeAuthorityPrefix(authority).length);
        const connection = this.getConnectionByAuthority(authority);
        if (provider && connection) {
          return { connection, backendSession: AgentSession.uri(provider, rawSessionId) };
        }
      }
    }
    return void 0;
  }
};

AgentHostConnectionsService = __decorateClass([
  __decorateParam(0, IAgentHostService),
  __decorateParam(1, IRemoteAgentHostService)
], AgentHostConnectionsService);

registerSingleton(IAgentHostConnectionsService, AgentHostConnectionsService, 1 /* Delayed */);
export { AgentHostConnectionsService };
