// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/externalUriOpener/common/contributedOpeners.ts
import { Disposable } from "./module-0012.mjs";
import { Memento } from "./module-1041.mjs";
import { updateContributedOpeners } from "./module-1292.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionService } from "./module-0887.mjs";


// src/vs/workbench/contrib/externalUriOpener/common/contributedOpeners.ts
var ContributedExternalUriOpenersStore = class extends Disposable {
  constructor(storageService, _extensionService) {
    super();
    this._extensionService = _extensionService;
    this._openers = /* @__PURE__ */ new Map();
    this._memento = new Memento(ContributedExternalUriOpenersStore.STORAGE_ID, storageService);
    this._mementoObject = this._memento.getMemento(0 /* PROFILE */, 1 /* MACHINE */);
    for (const [id2, value2] of Object.entries(this._mementoObject || {})) {
      if (value2) {
        this.add(id2, value2.extensionId, { isCurrentlyRegistered: false });
      }
    }
    this.invalidateOpenersOnExtensionsChanged();
    this._register(this._extensionService.onDidChangeExtensions(() => this.invalidateOpenersOnExtensionsChanged()));
    this._register(this._extensionService.onDidChangeExtensionsStatus(() => this.invalidateOpenersOnExtensionsChanged()));
  }
  static {
    this.STORAGE_ID = "externalUriOpeners";
  }
  didRegisterOpener(id2, extensionId) {
    this.add(id2, extensionId, {
      isCurrentlyRegistered: true
    });
  }
  add(id2, extensionId, options3) {
    const existing = this._openers.get(id2);
    if (existing) {
      existing.isCurrentlyRegistered = existing.isCurrentlyRegistered || options3.isCurrentlyRegistered;
      return;
    }
    const entry = {
      extensionId,
      isCurrentlyRegistered: options3.isCurrentlyRegistered
    };
    this._openers.set(id2, entry);
    this._mementoObject[id2] = entry;
    this._memento.saveMemento();
    this.updateSchema();
  }
  delete(id2) {
    this._openers.delete(id2);
    delete this._mementoObject[id2];
    this._memento.saveMemento();
    this.updateSchema();
  }
  async invalidateOpenersOnExtensionsChanged() {
    await this._extensionService.whenInstalledExtensionsRegistered();
    const registeredExtensions = this._extensionService.extensions;
    for (const [id2, entry] of this._openers) {
      const extension = registeredExtensions.find((r2) => r2.identifier.value === entry.extensionId);
      if (extension) {
        if (!this._extensionService.canRemoveExtension(extension)) {
          if (!entry.isCurrentlyRegistered) {
            this.delete(id2);
          }
        }
      } else {
        this.delete(id2);
      }
    }
  }
  updateSchema() {
    const ids = [];
    const descriptions = [];
    for (const [id2, entry] of this._openers) {
      ids.push(id2);
      descriptions.push(entry.extensionId);
    }
    updateContributedOpeners(ids, descriptions);
  }
};

ContributedExternalUriOpenersStore = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IExtensionService)
], ContributedExternalUriOpenersStore);
export { ContributedExternalUriOpenersStore };
