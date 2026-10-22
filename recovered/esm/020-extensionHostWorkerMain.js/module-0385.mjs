// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/plugins/agentPluginService.ts
import { createDecorator } from "./module-0038.mjs";
import { toDisposable } from "./module-0011.mjs";


// src/vs/workbench/contrib/chat/common/plugins/agentPluginService.ts
var IAgentPluginService = createDecorator("agentPluginService");

var AgentPluginDiscoveryRegistry = class {
  constructor() {
    this._discovery = [];
    this._order = 0;
  }
  register(descriptor, priority) {
    const registration = { descriptor, priority, order: this._order++ };
    this._discovery.push(registration);
    return toDisposable(() => {
      const index = this._discovery.indexOf(registration);
      if (index >= 0) {
        this._discovery.splice(index, 1);
      }
    });
  }
  getAll() {
    return [...this._discovery].sort((a, b) => a.priority - b.priority || a.order - b.order);
  }
};

var agentPluginDiscoveryRegistry = new AgentPluginDiscoveryRegistry();
export { IAgentPluginService, AgentPluginDiscoveryRegistry, agentPluginDiscoveryRegistry };
