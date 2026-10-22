// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/discovery/extensionMcpDiscovery.ts
import { ExtensionsRegistry } from "./module-0876.mjs";
import { mcpActivationEvent, mcpContributionPoint } from "./module-1421.mjs";
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { McpServerDefinition, McpServerTrust, extensionPrefixedIdentifier } from "./module-1206.mjs";
import { observableValue } from "./module-0048.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { isFalsyOrWhitespace } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMcpRegistry } from "./module-1447.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionService } from "./module-0887.mjs";


// src/vs/workbench/contrib/mcp/common/discovery/extensionMcpDiscovery.ts
var cacheKey = "mcp.extCachedServers";

var _mcpExtensionPoint = ExtensionsRegistry.registerExtensionPoint(mcpContributionPoint);

var ExtensionMcpDiscovery = class extends Disposable {
  constructor(_mcpRegistry, storageService, _extensionService, _contextKeyService) {
    super();
    this._mcpRegistry = _mcpRegistry;
    this._extensionService = _extensionService;
    this._contextKeyService = _contextKeyService;
    this.fromGallery = false;
    this._extensionCollectionIdsToPersist = /* @__PURE__ */ new Map();
    this._conditionalCollections = this._register(new DisposableMap());
    this.cachedServers = storageService.getObject(cacheKey, 1 /* WORKSPACE */, {});
    this._register(storageService.onWillSaveState(() => {
      let updated = false;
      for (const [collectionId, behavior] of this._extensionCollectionIdsToPersist.entries()) {
        const collection = this._mcpRegistry.collections.get().find((c) => c.id === collectionId);
        let defs = collection?.serverDefinitions.get();
        if (!collection || collection.lazy) {
          if (behavior === 1 /* Always */) {
            defs = [];
          } else {
            continue;
          }
        }
        if (defs) {
          updated = true;
          this.cachedServers[collectionId] = { servers: defs.map(McpServerDefinition.toSerialized) };
        }
      }
      if (updated) {
        storageService.store(cacheKey, this.cachedServers, 1 /* WORKSPACE */, 1 /* MACHINE */);
      }
    }));
  }
  start() {
    const extensionCollections = this._register(new DisposableMap());
    this._register(_mcpExtensionPoint.setHandler((_extensions, delta2) => {
      const { added, removed } = delta2;
      for (const collections of removed) {
        for (const coll of collections.value) {
          const id2 = extensionPrefixedIdentifier(collections.description.identifier, coll.id);
          extensionCollections.deleteAndDispose(id2);
          this._conditionalCollections.deleteAndDispose(id2);
        }
      }
      for (const collections of added) {
        if (!ExtensionMcpDiscovery._validate(collections)) {
          continue;
        }
        for (const coll of collections.value) {
          const id2 = extensionPrefixedIdentifier(collections.description.identifier, coll.id);
          this._extensionCollectionIdsToPersist.set(id2, 0 /* CollectionExists */);
          if (coll.when) {
            this._registerConditionalCollection(id2, coll, collections, extensionCollections);
          } else {
            this._registerCollection(id2, coll, collections, extensionCollections);
          }
        }
      }
    }));
  }
  _registerCollection(id2, coll, collections, extensionCollections) {
    const serverDefs = this.cachedServers.hasOwnProperty(id2) ? this.cachedServers[id2].servers : void 0;
    const dispo = this._mcpRegistry.registerCollection({
      id: id2,
      provenance: "extension" /* Extension */,
      label: coll.label,
      remoteAuthority: null,
      trustBehavior: McpServerTrust.Kind.Trusted,
      scope: 1 /* WORKSPACE */,
      configTarget: 2 /* USER */,
      order: 300 /* Extension */,
      serverDefinitions: observableValue(this, serverDefs?.map(McpServerDefinition.fromSerialized) || []),
      lazy: {
        isCached: !!serverDefs,
        load: () => this._activateExtensionServers(coll.id).then(() => {
          this._extensionCollectionIdsToPersist.set(id2, 1 /* Always */);
        }),
        removed: () => {
          extensionCollections.deleteAndDispose(id2);
          this._conditionalCollections.deleteAndDispose(id2);
        }
      },
      source: collections.description.identifier
    });
    extensionCollections.set(id2, dispo);
  }
  _registerConditionalCollection(id2, coll, collections, extensionCollections) {
    const whenClause = ContextKeyExpr.deserialize(coll.when);
    if (!whenClause) {
      return;
    }
    const evaluate = () => {
      const nowSatisfied = this._contextKeyService.contextMatchesRules(whenClause);
      const isRegistered = extensionCollections.has(id2);
      if (nowSatisfied && !isRegistered) {
        this._registerCollection(id2, coll, collections, extensionCollections);
      } else if (!nowSatisfied && isRegistered) {
        extensionCollections.deleteAndDispose(id2);
      }
    };
    const contextKeyListener = this._contextKeyService.onDidChangeContext(evaluate);
    evaluate();
    this._conditionalCollections.set(id2, contextKeyListener);
  }
  async _activateExtensionServers(collectionId) {
    await this._extensionService.activateByEvent(mcpActivationEvent(collectionId));
    await Promise.all(this._mcpRegistry.delegates.get().map((r2) => r2.waitForInitialProviderPromises()));
  }
  static _validate(user) {
    if (!Array.isArray(user.value)) {
      user.collector.error(localize(17100, null));
      return false;
    }
    for (const contribution of user.value) {
      if (typeof contribution.id !== "string" || isFalsyOrWhitespace(contribution.id)) {
        user.collector.error(localize(17101, null));
        return false;
      }
      if (typeof contribution.label !== "string" || isFalsyOrWhitespace(contribution.label)) {
        user.collector.error(localize(17102, null));
        return false;
      }
      if (contribution.when !== void 0 && (typeof contribution.when !== "string" || isFalsyOrWhitespace(contribution.when))) {
        user.collector.error(localize(17103, null));
        return false;
      }
    }
    return true;
  }
};

ExtensionMcpDiscovery = __decorateClass([
  __decorateParam(0, IMcpRegistry),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IContextKeyService)
], ExtensionMcpDiscovery);
export { cacheKey, _mcpExtensionPoint, ExtensionMcpDiscovery };
