// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpService.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { McpPrefixGenerator, McpServer, McpServerMetadataCache } from "./module-2334.mjs";
import { CollisionEnablementModel, EnablementModel, isContributionEnabled } from "./module-1018.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { mcpServerCollisionBehaviorSection } from "./module-1421.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { autorun } from "./module-0052.mjs";
import { mcpAutoStartConfig } from "./module-1196.mjs";
import { IAutostartResult, McpConnectionState, McpServerDefinition, McpStartServerInteraction, UserInteractionRequiredError } from "./module-1206.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { startServerAndWaitForLiveTools } from "./module-2199.mjs";
import { equals } from "./module-0007.mjs";
import { transaction } from "./module-0045.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IMcpRegistry } from "./module-1447.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { derived } from "./module-0054.mjs";


// src/vs/workbench/contrib/mcp/common/mcpService.ts
var McpService = class extends Disposable {
  constructor(_instantiationService, _mcpRegistry, _logService, configurationService, storageService) {
    super();
    this._instantiationService = _instantiationService;
    this._mcpRegistry = _mcpRegistry;
    this._logService = _logService;
    this.configurationService = configurationService;
    this._currentAutoStarts = /* @__PURE__ */ new Set();
    this._servers = observableValue(this, []);
    this.servers = this._servers.map((servers) => servers.map((s) => s.object));
    this._prefixGenerator = new McpPrefixGenerator();
    const baseEnablement = this._register(new EnablementModel("mcp.enablement", storageService));
    const collisionBehavior = observableConfigValue(mcpServerCollisionBehaviorSection, "disable" /* Disable */, configurationService);
    this.enablementModel = new McpCollisionEnablementModel(baseEnablement, this._mcpRegistry, collisionBehavior);
    this.userCache = this._register(_instantiationService.createInstance(McpServerMetadataCache, 0 /* PROFILE */));
    this.workspaceCache = this._register(_instantiationService.createInstance(McpServerMetadataCache, 1 /* WORKSPACE */));
    const updateThrottle = this._store.add(new RunOnceScheduler(() => this.updateCollectedServers(), 500));
    this._register(autorun((reader) => {
      for (const collection of this._mcpRegistry.collections.read(reader)) {
        collection.serverDefinitions.read(reader);
      }
      updateThrottle.schedule(500);
    }));
  }
  get lazyCollectionState() {
    return this._mcpRegistry.lazyCollectionState;
  }
  cancelAutostart() {
    for (const cts of this._currentAutoStarts) {
      cts.cancel();
    }
  }
  autostart(_token) {
    const autoStartConfig = this.configurationService.getValue(mcpAutoStartConfig);
    if (autoStartConfig === "never" /* Never */) {
      return observableValue(this, IAutostartResult.Empty);
    }
    const state = observableValue(this, { working: true, starting: [], serversRequiringInteraction: [] });
    const store = new DisposableStore();
    const cts = store.add(new CancellationTokenSource(_token));
    this._currentAutoStarts.add(cts);
    store.add(toDisposable(() => {
      this._currentAutoStarts.delete(cts);
    }));
    store.add(cts.token.onCancellationRequested(() => {
      state.set(IAutostartResult.Empty, void 0);
    }));
    this._autostart(autoStartConfig, state, cts.token).catch((err) => {
      this._logService.error("Error during MCP autostart:", err);
      state.set(IAutostartResult.Empty, void 0);
    }).finally(() => store.dispose());
    return state;
  }
  async _autostart(autoStartConfig, state, token) {
    await this._activateCollections();
    if (token.isCancellationRequested) {
      return;
    }
    const candidates = this.servers.get().filter(
      (s) => isContributionEnabled(s.enablement.get())
    );
    let todo = /* @__PURE__ */ new Set();
    const inError = (s) => s.connectionState.get().state === McpConnectionState.Kind.Error;
    if (autoStartConfig === "onlyNew" /* OnlyNew */) {
      todo = new Set(candidates.filter((s) => s.cacheState.get() === 0 /* Unknown */ || inError(s)));
    } else if (autoStartConfig === "newAndOutdated" /* NewAndOutdated */) {
      todo = new Set(candidates.filter((s) => {
        const c = s.cacheState.get();
        return c === 0 /* Unknown */ || c === 2 /* Outdated */ || inError(s);
      }));
    }
    if (!todo.size) {
      state.set(IAutostartResult.Empty, void 0);
      return;
    }
    const interaction = new McpStartServerInteraction();
    const requiringInteraction = [];
    const update = () => state.set({
      working: todo.size > 0,
      starting: [...todo].map((t2) => t2.definition),
      serversRequiringInteraction: requiringInteraction
    }, void 0);
    update();
    await Promise.all([...todo].map(async (server, i2) => {
      try {
        await startServerAndWaitForLiveTools(server, { interaction, errorOnUserInteraction: true }, token);
      } catch (error) {
        if (error instanceof UserInteractionRequiredError) {
          requiringInteraction.push({ id: server.definition.id, label: server.definition.label, errorMessage: error.message });
        }
      } finally {
        todo.delete(server);
        if (!token.isCancellationRequested) {
          update();
        }
      }
    }));
  }
  resetCaches() {
    this.userCache.reset();
    this.workspaceCache.reset();
  }
  resetTrust() {
    this.resetCaches();
  }
  async activateCollections() {
    await this._activateCollections();
  }
  async _activateCollections() {
    const collections = await this._mcpRegistry.discoverCollections();
    this.updateCollectedServers();
    return new Set(collections.map((c) => c.id));
  }
  updateCollectedServers() {
    const definitions3 = this._mcpRegistry.collections.get().flatMap(
      (collectionDefinition) => collectionDefinition.serverDefinitions.get().map((serverDefinition) => {
        return { serverDefinition, collectionDefinition };
      })
    );
    const nextDefinitions = new Set(definitions3);
    const currentServers = this._servers.get();
    const nextServers = [];
    const pushMatch = (match2, rec) => {
      nextDefinitions.delete(match2);
      nextServers.push(rec);
      const connection = rec.object.connection.get();
      if (connection && !McpServerDefinition.equals(connection.definition, match2.serverDefinition)) {
        rec.object.stop();
        this._logService.debug(`MCP server ${rec.object.definition.id} stopped because the definition changed`);
      }
    };
    for (const server of currentServers) {
      const match2 = definitions3.find((d) => defsEqual(server.object, d));
      if (match2) {
        pushMatch(match2, server);
      } else {
        server.object.dispose();
      }
    }
    for (const def2 of nextDefinitions) {
      const object2 = this._instantiationService.createInstance(
        McpServer,
        def2.collectionDefinition,
        def2.serverDefinition,
        def2.serverDefinition.roots,
        !!def2.collectionDefinition.lazy,
        def2.collectionDefinition.scope === 1 /* WORKSPACE */ ? this.workspaceCache : this.userCache,
        this._prefixGenerator,
        this.enablementModel
      );
      nextServers.push({ object: object2 });
    }
    if (!equals(currentServers, nextServers)) {
      transaction((tx) => {
        this._servers.set(nextServers, tx);
      });
    }
  }
  dispose() {
    this._servers.get().forEach((s) => s.object.dispose());
    super.dispose();
  }
};

McpService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IMcpRegistry),
  __decorateParam(2, ILogService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IStorageService)
], McpService);

function defsEqual(server, def2) {
  return server.collection.id === def2.collectionDefinition.id && server.definition.id === def2.serverDefinition.id;
}

var McpCollisionEnablementModel = class extends CollisionEnablementModel {
  /**
   * For each server definition ID, the list of all definition IDs that share
   * the same (case-insensitive) label, in priority order (lowest collection
   * order first). Empty when collision behavior is `suffix`.
   */
  constructor(base, registry4, collisionBehavior) {
    const collisionGroups = derived((reader) => {
      if (collisionBehavior.read(reader) !== "disable" /* Disable */) {
        return /* @__PURE__ */ new Map();
      }
      const collections = registry4.collections.read(reader);
      const labelToIds = /* @__PURE__ */ new Map();
      for (const collection of collections) {
        for (const server of collection.serverDefinitions.read(reader)) {
          const key3 = server.label.toLowerCase();
          let ids = labelToIds.get(key3);
          if (!ids) {
            ids = [];
            labelToIds.set(key3, ids);
          }
          ids.push(server.id);
        }
      }
      const groups = /* @__PURE__ */ new Map();
      for (const ids of labelToIds.values()) {
        if (ids.length < 2) {
          continue;
        }
        for (const id2 of ids) {
          groups.set(id2, ids);
        }
      }
      return groups;
    });
    super(base, collisionGroups);
  }
};
export { defsEqual, McpService, McpCollisionEnablementModel };
