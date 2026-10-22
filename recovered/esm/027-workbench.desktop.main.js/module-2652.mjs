// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/discovery/pluginMcpDiscovery.ts
import { Disposable, DisposableResourceMap } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { isContributionEnabled } from "./module-1018.mjs";
import { MCP_PLUGIN_COLLECTION_ID_PREFIX, McpServerLaunch, McpServerTrust } from "./module-1206.mjs";
import { Schemas } from "./module-0033.mjs";
import { isDefined } from "./module-0010.mjs";
import { hash } from "./module-0039.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentPluginService } from "./module-1016.mjs";
import { IMcpRegistry } from "./module-1447.mjs";


// src/vs/workbench/contrib/mcp/common/discovery/pluginMcpDiscovery.ts
var PluginMcpDiscovery = class extends Disposable {
  constructor(_agentPluginService, _mcpRegistry) {
    super();
    this._agentPluginService = _agentPluginService;
    this._mcpRegistry = _mcpRegistry;
    this.fromGallery = false;
    this._collections = this._register(new DisposableResourceMap());
  }
  start() {
    this._register(autorun((reader) => {
      const plugins = this._agentPluginService.plugins.read(reader);
      const seen = new ResourceSet();
      for (const plugin of plugins) {
        if (!isContributionEnabled(plugin.enablement.read(reader))) {
          continue;
        }
        const servers = plugin.mcpServerDefinitions.read(reader);
        if (servers.length === 0) {
          continue;
        }
        seen.add(plugin.uri);
        let collectionState = this._collections.get(plugin.uri);
        if (!collectionState) {
          collectionState = this.createCollectionState(plugin, servers[0].uri);
          this._collections.set(plugin.uri, collectionState);
        }
      }
      for (const [pluginUri] of this._collections) {
        if (!seen.has(pluginUri)) {
          this._collections.deleteAndDispose(pluginUri);
        }
      }
    }));
  }
  createCollectionState(plugin, manifestURI) {
    const collectionId = `${MCP_PLUGIN_COLLECTION_ID_PREFIX}${plugin.uri}`;
    return this._mcpRegistry.registerCollection({
      id: collectionId,
      provenance: "plugin" /* Plugin */,
      label: `${plugin.label} (Agent Plugin)`,
      remoteAuthority: plugin.uri.scheme === Schemas.vscodeRemote ? plugin.uri.authority : null,
      configTarget: 2 /* USER */,
      scope: 0 /* PROFILE */,
      trustBehavior: McpServerTrust.Kind.Trusted,
      serverDefinitions: plugin.mcpServerDefinitions.map((defs) => defs.map((d) => this._toServerDefinition(collectionId, d)).filter(isDefined)),
      order: 350 /* Plugin */,
      presentation: {
        origin: manifestURI
      }
    });
  }
  _toServerDefinition(collectionId, { name, configuration: configuration2, defaultCwd }) {
    const launch = McpServerLaunch.fromServerConfiguration(configuration2);
    if (!launch) {
      return void 0;
    }
    return {
      id: `${collectionId}.${name}`,
      label: name,
      launch,
      defaultCwd,
      variableReplacement: { target: 2 /* USER */ },
      cacheNonce: String(hash(launch))
    };
  }
};

PluginMcpDiscovery = __decorateClass([
  __decorateParam(0, IAgentPluginService),
  __decorateParam(1, IMcpRegistry)
], PluginMcpDiscovery);
export { PluginMcpDiscovery };
