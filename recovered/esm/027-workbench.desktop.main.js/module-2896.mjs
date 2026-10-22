// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostProtectedResourcesService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostProtectedResourcesService.ts
var IAgentHostProtectedResourcesService = createDecorator("agentHostProtectedResourcesService");

var AgentHostProtectedResourcesService = class extends Disposable {
  constructor(_agentHostService) {
    super();
    this._agentHostService = _agentHostService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    /**
     * Signature of the protected resources last seen per provider, so a change is
     * emitted only when the advertised set actually changes (e.g. Claude switching
     * between native and proxy) rather than on every root state update.
     */
    this._lastSignature = /* @__PURE__ */ new Map();
    this._register(this._agentHostService.rootState.onDidChange((rootState) => this._sync(rootState)));
    const initial = this._agentHostService.rootState.value;
    if (initial && !(initial instanceof Error)) {
      this._sync(initial);
    }
  }
  getProtectedResources(providerId) {
    const rootState = this._agentHostService.rootState.value;
    if (!rootState || rootState instanceof Error) {
      return void 0;
    }
    const agent = rootState.agents.find((a) => a.provider === providerId);
    return agent ? agent.protectedResources ?? [] : void 0;
  }
  _sync(rootState) {
    const incoming = new Set(rootState.agents.map((a) => a.provider));
    const changed = [];
    for (const provider of [...this._lastSignature.keys()]) {
      if (!incoming.has(provider)) {
        this._lastSignature.delete(provider);
        changed.push(provider);
      }
    }
    for (const agent of rootState.agents) {
      const signature = JSON.stringify(
        (agent.protectedResources ?? []).map((resource) => [resource.resource, resource.required !== false])
      );
      if (this._lastSignature.get(agent.provider) !== signature) {
        this._lastSignature.set(agent.provider, signature);
        changed.push(agent.provider);
      }
    }
    for (const provider of changed) {
      this._onDidChange.fire(provider);
    }
  }
};

AgentHostProtectedResourcesService = __decorateClass([
  __decorateParam(0, IAgentHostService)
], AgentHostProtectedResourcesService);

registerSingleton(IAgentHostProtectedResourcesService, AgentHostProtectedResourcesService, 1 /* Delayed */);
export { IAgentHostProtectedResourcesService, AgentHostProtectedResourcesService };
