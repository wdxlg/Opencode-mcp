// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remoteCodingAgents/common/remoteCodingAgentsService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { Event2 } from "./module-0017.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/remoteCodingAgents/common/remoteCodingAgentsService.ts
var IRemoteCodingAgentsService = createDecorator("remoteCodingAgentsService");

var RemoteCodingAgentsService = class extends Disposable {
  constructor(contextKeyService) {
    super();
    this.contextKeyService = contextKeyService;
    this.agents = [];
    this.contextKeys = /* @__PURE__ */ new Set();
    this._ctxHasRemoteCodingAgent = ChatContextKeys.hasRemoteCodingAgent.bindTo(this.contextKeyService);
    this._register(Event2.filter(contextKeyService.onDidChangeContext, (e4) => e4.affectsSome(this.contextKeys))(() => {
      this.updateContextKeys();
    }));
  }
  getRegisteredAgents() {
    return [...this.agents];
  }
  getAvailableAgents() {
    return this.agents.filter((agent) => this.isAgentAvailable(agent));
  }
  registerAgent(agent) {
    const existingIndex = this.agents.findIndex((a) => a.id === agent.id);
    if (existingIndex >= 0) {
      this.agents[existingIndex] = agent;
    } else {
      this.agents.push(agent);
    }
    if (agent.when) {
      const whenExpr = ContextKeyExpr.deserialize(agent.when);
      if (whenExpr) {
        for (const key3 of whenExpr.keys()) {
          this.contextKeys.add(key3);
        }
      }
    }
    this.updateContextKeys();
  }
  isAgentAvailable(agent) {
    if (!agent.when) {
      return true;
    }
    const whenExpr = ContextKeyExpr.deserialize(agent.when);
    return !whenExpr || this.contextKeyService.contextMatchesRules(whenExpr);
  }
  updateContextKeys() {
    const hasAvailableAgent = this.getAvailableAgents().length > 0;
    this._ctxHasRemoteCodingAgent.set(hasAvailableAgent);
  }
};

RemoteCodingAgentsService = __decorateClass([
  __decorateParam(0, IContextKeyService)
], RemoteCodingAgentsService);

registerSingleton(IRemoteCodingAgentsService, RemoteCodingAgentsService, 1 /* Delayed */);
export { IRemoteCodingAgentsService, RemoteCodingAgentsService };
