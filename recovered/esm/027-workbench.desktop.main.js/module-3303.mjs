// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/common/environmentVariableService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { deserializeEnvironmentDescriptionMap, deserializeEnvironmentVariableCollection, serializeEnvironmentDescriptionMap, serializeEnvironmentVariableCollection } from "./module-1273.mjs";
import { MergedEnvironmentVariableCollection } from "./module-3284.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { debounce, throttle } from "./module-0250.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/terminal/common/environmentVariableService.ts
var EnvironmentVariableService = class extends Disposable {
  constructor(_extensionService, _storageService) {
    super();
    this._extensionService = _extensionService;
    this._storageService = _storageService;
    this.collections = /* @__PURE__ */ new Map();
    this._onDidChangeCollections = this._register(new Emitter());
    this._storageService.remove("terminal.integrated.environmentVariableCollections" /* DeprecatedEnvironmentVariableCollections */, 1 /* WORKSPACE */);
    const serializedPersistedCollections = this._storageService.get("terminal.integrated.environmentVariableCollectionsV2" /* EnvironmentVariableCollections */, 1 /* WORKSPACE */);
    if (serializedPersistedCollections) {
      const collectionsJson = JSON.parse(serializedPersistedCollections);
      collectionsJson.forEach((c) => this.collections.set(c.extensionIdentifier, {
        persistent: true,
        map: deserializeEnvironmentVariableCollection(c.collection),
        descriptionMap: deserializeEnvironmentDescriptionMap(c.description)
      }));
      this._invalidateExtensionCollections();
    }
    this.mergedCollection = this._resolveMergedCollection();
    this._register(this._extensionService.onDidChangeExtensions(() => this._invalidateExtensionCollections()));
  }
  get onDidChangeCollections() {
    return this._onDidChangeCollections.event;
  }
  set(extensionIdentifier, collection) {
    this.collections.set(extensionIdentifier, collection);
    this._updateCollections();
  }
  delete(extensionIdentifier) {
    this.collections.delete(extensionIdentifier);
    this._updateCollections();
  }
  _updateCollections() {
    this._persistCollectionsEventually();
    this.mergedCollection = this._resolveMergedCollection();
    this._notifyCollectionUpdatesEventually();
  }
  _persistCollectionsEventually() {
    this._persistCollections();
  }
  _persistCollections() {
    const collectionsJson = [];
    this.collections.forEach((collection, extensionIdentifier) => {
      if (collection.persistent) {
        collectionsJson.push({
          extensionIdentifier,
          collection: serializeEnvironmentVariableCollection(this.collections.get(extensionIdentifier).map),
          description: serializeEnvironmentDescriptionMap(collection.descriptionMap)
        });
      }
    });
    const stringifiedJson = JSON.stringify(collectionsJson);
    this._storageService.store("terminal.integrated.environmentVariableCollectionsV2" /* EnvironmentVariableCollections */, stringifiedJson, 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  _notifyCollectionUpdatesEventually() {
    this._notifyCollectionUpdates();
  }
  _notifyCollectionUpdates() {
    this._onDidChangeCollections.fire(this.mergedCollection);
  }
  _resolveMergedCollection() {
    return new MergedEnvironmentVariableCollection(this.collections);
  }
  async _invalidateExtensionCollections() {
    await this._extensionService.whenInstalledExtensionsRegistered();
    const registeredExtensions = this._extensionService.extensions;
    let changes = false;
    this.collections.forEach((_, extensionIdentifier) => {
      const isExtensionRegistered = registeredExtensions.some((r2) => r2.identifier.value === extensionIdentifier);
      if (!isExtensionRegistered) {
        this.collections.delete(extensionIdentifier);
        changes = true;
      }
    });
    if (changes) {
      this._updateCollections();
    }
  }
};

__decorateClass([
  throttle(1e3)
], EnvironmentVariableService.prototype, "_persistCollectionsEventually", 1);

__decorateClass([
  debounce(1e3)
], EnvironmentVariableService.prototype, "_notifyCollectionUpdatesEventually", 1);

EnvironmentVariableService = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IStorageService)
], EnvironmentVariableService);
export { EnvironmentVariableService };
