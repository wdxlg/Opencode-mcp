// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionEnablementService.ts
import { Disposable } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";
import { DISABLED_EXTENSIONS_STORAGE_PATH, IExtensionManagementService } from "./module-0058.mjs";
import { areSameExtensions } from "./module-0091.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0096.mjs";
import { isUndefinedOrNull } from "./module-0006.mjs";


// src/vs/platform/extensionManagement/common/extensionEnablementService.ts
var GlobalExtensionEnablementService = class extends Disposable {
  constructor(storageService, extensionManagementService) {
    super();
    this._onDidChangeEnablement = this._register(new Emitter());
    this.onDidChangeEnablement = this._onDidChangeEnablement.event;
    this.storageManager = this._register(new StorageManager(storageService));
    this._register(this.storageManager.onDidChange((extensions) => this._onDidChangeEnablement.fire({ extensions, source: "storage" })));
    this._register(extensionManagementService.onDidInstallExtensions((e) => e.forEach(({ local, operation }) => {
      if (local && operation === 4 /* Migrate */) {
        this._removeFromDisabledExtensions(local.identifier);
      }
    })));
  }
  async enableExtension(extension, source) {
    if (this._removeFromDisabledExtensions(extension)) {
      this._onDidChangeEnablement.fire({ extensions: [extension], source });
      return true;
    }
    return false;
  }
  async disableExtension(extension, source) {
    if (this._addToDisabledExtensions(extension)) {
      this._onDidChangeEnablement.fire({ extensions: [extension], source });
      return true;
    }
    return false;
  }
  getDisabledExtensions() {
    return this._getExtensions(DISABLED_EXTENSIONS_STORAGE_PATH);
  }
  async getDisabledExtensionsAsync() {
    return this.getDisabledExtensions();
  }
  _addToDisabledExtensions(identifier) {
    const disabledExtensions = this.getDisabledExtensions();
    if (disabledExtensions.every((e) => !areSameExtensions(e, identifier))) {
      disabledExtensions.push(identifier);
      this._setDisabledExtensions(disabledExtensions);
      return true;
    }
    return false;
  }
  _removeFromDisabledExtensions(identifier) {
    const disabledExtensions = this.getDisabledExtensions();
    for (let index = 0; index < disabledExtensions.length; index++) {
      const disabledExtension = disabledExtensions[index];
      if (areSameExtensions(disabledExtension, identifier)) {
        disabledExtensions.splice(index, 1);
        this._setDisabledExtensions(disabledExtensions);
        return true;
      }
    }
    return false;
  }
  _setDisabledExtensions(disabledExtensions) {
    this._setExtensions(DISABLED_EXTENSIONS_STORAGE_PATH, disabledExtensions);
  }
  _getExtensions(storageId) {
    return this.storageManager.get(storageId, 0 /* PROFILE */);
  }
  _setExtensions(storageId, extensions) {
    this.storageManager.set(storageId, extensions, 0 /* PROFILE */);
  }
};

GlobalExtensionEnablementService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IExtensionManagementService)
], GlobalExtensionEnablementService);

var StorageManager = class extends Disposable {
  constructor(storageService) {
    super();
    this.storageService = storageService;
    this.storage = /* @__PURE__ */ Object.create(null);
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._register(storageService.onDidChangeValue(0 /* PROFILE */, void 0, this._store)((e) => this.onDidStorageChange(e)));
  }
  get(key, scope) {
    let value;
    if (scope === 0 /* PROFILE */) {
      if (isUndefinedOrNull(this.storage[key])) {
        this.storage[key] = this._get(key, scope);
      }
      value = this.storage[key];
    } else {
      value = this._get(key, scope);
    }
    return JSON.parse(value);
  }
  set(key, value, scope) {
    const newValue = JSON.stringify(value.map(({ id: id2, uuid }) => ({ id: id2, uuid })));
    const oldValue = this._get(key, scope);
    if (oldValue !== newValue) {
      if (scope === 0 /* PROFILE */) {
        if (value.length) {
          this.storage[key] = newValue;
        } else {
          delete this.storage[key];
        }
      }
      this._set(key, value.length ? newValue : void 0, scope);
    }
  }
  onDidStorageChange(storageChangeEvent) {
    if (!isUndefinedOrNull(this.storage[storageChangeEvent.key])) {
      const newValue = this._get(storageChangeEvent.key, storageChangeEvent.scope);
      if (newValue !== this.storage[storageChangeEvent.key]) {
        const oldValues = this.get(storageChangeEvent.key, storageChangeEvent.scope);
        delete this.storage[storageChangeEvent.key];
        const newValues = this.get(storageChangeEvent.key, storageChangeEvent.scope);
        const added = oldValues.filter((oldValue) => !newValues.some((newValue2) => areSameExtensions(oldValue, newValue2)));
        const removed = newValues.filter((newValue2) => !oldValues.some((oldValue) => areSameExtensions(oldValue, newValue2)));
        if (added.length || removed.length) {
          this._onDidChange.fire([...added, ...removed]);
        }
      }
    }
  }
  _get(key, scope) {
    return this.storageService.get(key, scope, "[]");
  }
  _set(key, value, scope) {
    if (value) {
      this.storageService.store(key, value, scope, 1 /* MACHINE */);
    } else {
      this.storageService.remove(key, scope);
    }
  }
};
export { GlobalExtensionEnablementService, StorageManager };
