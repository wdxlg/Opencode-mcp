// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/discovery/mcpDiscovery.ts



// src/vs/workbench/contrib/mcp/common/discovery/mcpDiscovery.ts
var McpDiscoveryRegistry = class {
  constructor() {
    this._discovery = [];
  }
  register(discovery) {
    this._discovery.push(discovery);
  }
  getAll() {
    return this._discovery;
  }
};

var mcpDiscoveryRegistry = new McpDiscoveryRegistry();
export { McpDiscoveryRegistry, mcpDiscoveryRegistry };
