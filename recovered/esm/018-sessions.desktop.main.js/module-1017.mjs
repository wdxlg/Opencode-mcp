// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/plugins/agentPluginService.ts
import { createDecorator } from "./module-0077.mjs";
import { basename2 } from "./module-0034.mjs";
import { toDisposable } from "./module-0012.mjs";


// src/vs/workbench/contrib/chat/common/plugins/agentPluginService.ts
var IAgentPluginService = createDecorator("agentPluginService");

function getCanonicalPluginCommandId(plugin, commandName) {
  const prefix = (plugin.label ? normalizePluginToken(plugin.label) : "") || normalizePluginToken(basename2(plugin.uri));
  const normalizedCommand = normalizePluginToken(commandName);
  if (normalizedCommand.startsWith(`${prefix}:`)) {
    return normalizedCommand;
  }
  if (prefix === normalizedCommand) {
    return prefix;
  }
  return `${prefix}:${normalizedCommand}`;
}

function normalizePluginToken(value2) {
  return value2.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_.:-]/g, "-").replace(/-+/g, "-").replace(/^[-:.]+|[-:.]+$/g, "");
}

var AgentPluginDiscoveryRegistry = class {
  constructor() {
    this._discovery = [];
    this._order = 0;
  }
  register(descriptor, priority) {
    const registration = { descriptor, priority, order: this._order++ };
    this._discovery.push(registration);
    return toDisposable(() => {
      const index2 = this._discovery.indexOf(registration);
      if (index2 >= 0) {
        this._discovery.splice(index2, 1);
      }
    });
  }
  getAll() {
    return [...this._discovery].sort((a, b) => a.priority - b.priority || a.order - b.order);
  }
};

var agentPluginDiscoveryRegistry = new AgentPluginDiscoveryRegistry();
export { getCanonicalPluginCommandId, normalizePluginToken, IAgentPluginService, AgentPluginDiscoveryRegistry, agentPluginDiscoveryRegistry };
