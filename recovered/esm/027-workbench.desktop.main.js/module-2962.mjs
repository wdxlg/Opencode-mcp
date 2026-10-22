// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/discovery/installedMcpServersDiscovery.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { Throttler } from "./module-0036.mjs";
import { getMcpServerMapping } from "./module-2961.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { IMcpWorkbenchService, MCP_CONFIGURATION_COLLECTION_ID_PREFIX, McpCollectionDefinition, McpServerDefinition, McpServerLaunch, McpServerTrust, getMcpCollectionProvenance } from "./module-1206.mjs";
import { mcpConfigurationSection } from "./module-1421.mjs";
import { observableValue } from "./module-0048.mjs";
import { equals } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMcpRegistry } from "./module-1447.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/mcp/common/discovery/installedMcpServersDiscovery.ts
var InstalledMcpServersDiscovery = class extends Disposable {
  constructor(mcpWorkbenchService, mcpRegistry, textModelService, logService) {
    super();
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.mcpRegistry = mcpRegistry;
    this.textModelService = textModelService;
    this.logService = logService;
    this.fromGallery = true;
    this.collections = this._register(new DisposableMap());
  }
  start() {
    const throttler = this._register(new Throttler());
    this._register(this.mcpWorkbenchService.onChange(() => throttler.queue(() => this.sync())));
    this.sync();
  }
  async getServerIdMapping(resource, pathToServers) {
    const store = new DisposableStore();
    try {
      const ref = await this.textModelService.createModelReference(resource);
      store.add(ref);
      const serverIdMapping = getMcpServerMapping({ model: ref.object.textEditorModel, pathToServers });
      return serverIdMapping;
    } catch {
      return /* @__PURE__ */ new Map();
    } finally {
      store.dispose();
    }
  }
  async sync() {
    try {
      const collections = /* @__PURE__ */ new Map();
      const mcpConfigPathInfos = new ResourceMap();
      for (const server of this.mcpWorkbenchService.getEnabledLocalMcpServers()) {
        let mcpConfigPathPromise = mcpConfigPathInfos.get(server.mcpResource);
        if (!mcpConfigPathPromise) {
          mcpConfigPathPromise = (async (local) => {
            const mcpConfigPath2 = this.mcpWorkbenchService.getMcpConfigPath(local);
            const locations = mcpConfigPath2?.uri ? await this.getServerIdMapping(mcpConfigPath2?.uri, mcpConfigPath2.section ? [...mcpConfigPath2.section, "servers"] : ["servers"]) : /* @__PURE__ */ new Map();
            return mcpConfigPath2 ? { ...mcpConfigPath2, locations } : void 0;
          })(server);
          mcpConfigPathInfos.set(server.mcpResource, mcpConfigPathPromise);
        }
        const config = server.config;
        const mcpConfigPath = await mcpConfigPathPromise;
        const collectionId = `${MCP_CONFIGURATION_COLLECTION_ID_PREFIX}${mcpConfigPath ? mcpConfigPath.id : "unknown"}`;
        let definitions3 = collections.get(collectionId);
        if (!definitions3) {
          definitions3 = [mcpConfigPath, []];
          collections.set(collectionId, definitions3);
        }
        const launch = McpServerLaunch.fromServerConfiguration(config, server.rootSandbox);
        if (!launch) {
          this.logService.warn(`Skipping invalid MCP server configuration: ${server.name}`);
          continue;
        }
        const defaultCwd = config.type === "http" ? void 0 : mcpConfigPath?.workspaceFolder?.uri;
        definitions3[1].push({
          id: `${collectionId}.${server.name}`,
          label: server.name,
          launch,
          sandboxEnabled: config.type === "http" ? void 0 : config.sandboxEnabled,
          defaultCwd,
          cacheNonce: await McpServerLaunch.hash(launch),
          roots: mcpConfigPath?.workspaceFolder ? [mcpConfigPath.workspaceFolder.uri] : void 0,
          variableReplacement: {
            folder: mcpConfigPath?.workspaceFolder,
            section: mcpConfigurationSection,
            target: mcpConfigPath?.target ?? 2 /* USER */
          },
          devMode: config.dev,
          presentation: {
            order: mcpConfigPath?.order,
            origin: mcpConfigPath?.locations.get(server.name)
          }
        });
      }
      for (const [id2] of this.collections) {
        if (!collections.has(id2)) {
          this.collections.deleteAndDispose(id2);
        }
      }
      for (const [id2, [mcpConfigPath, serverDefinitions]] of collections) {
        const newServerDefinitions = observableValue(this, serverDefinitions);
        const newCollection = {
          id: id2,
          provenance: getMcpCollectionProvenance(mcpConfigPath?.target),
          label: mcpConfigPath?.label ?? "",
          order: mcpConfigPath?.order ?? 200 /* User */,
          presentation: {
            origin: mcpConfigPath?.uri
          },
          remoteAuthority: mcpConfigPath?.remoteAuthority ?? null,
          serverDefinitions: newServerDefinitions,
          trustBehavior: McpServerTrust.Kind.Trusted,
          configTarget: mcpConfigPath?.target ?? 2 /* USER */,
          scope: mcpConfigPath?.scope ?? 0 /* PROFILE */
        };
        const existingCollection = this.collections.get(id2);
        const collectionDefinitionsChanged = existingCollection ? !McpCollectionDefinition.equals(existingCollection.definition, newCollection) : true;
        if (!collectionDefinitionsChanged) {
          const serverDefinitionsChanged = existingCollection ? !equals(existingCollection.definition.serverDefinitions.get(), newCollection.serverDefinitions.get(), McpServerDefinition.equals) : true;
          if (serverDefinitionsChanged) {
            existingCollection?.serverDefinitions.set(serverDefinitions, void 0);
          }
          continue;
        }
        this.collections.deleteAndDispose(id2);
        const disposable = this.mcpRegistry.registerCollection(newCollection);
        this.collections.set(id2, {
          definition: newCollection,
          serverDefinitions: newServerDefinitions,
          dispose: () => disposable.dispose()
        });
      }
    } catch (error) {
      this.logService.error(error);
    }
  }
};

InstalledMcpServersDiscovery = __decorateClass([
  __decorateParam(0, IMcpWorkbenchService),
  __decorateParam(1, IMcpRegistry),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, ILogService)
], InstalledMcpServersDiscovery);
export { InstalledMcpServersDiscovery };
