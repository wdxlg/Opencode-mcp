// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadStorage.ts
import { DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { isWeb } from "./module-0014.mjs";
import { migrateExtensionStorage } from "./module-1265.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IExtensionStorageService } from "./module-1264.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/api/browser/mainThreadStorage.ts
var MainThreadStorage = class {
  constructor(extHostContext, _extensionStorageService, _storageService, _instantiationService, _logService) {
    this._extensionStorageService = _extensionStorageService;
    this._storageService = _storageService;
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._storageListener = new DisposableStore();
    this._sharedStorageKeysToWatch = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostStorage);
    this._storageListener.add(this._storageService.onDidChangeValue(0 /* PROFILE */, void 0, this._storageListener)((e4) => {
      if (this._sharedStorageKeysToWatch.has(e4.key)) {
        const rawState = this._extensionStorageService.getExtensionStateRaw(e4.key, true);
        if (typeof rawState === "string") {
          this._proxy.$acceptValue(true, e4.key, rawState);
        }
      }
    }));
  }
  dispose() {
    this._storageListener.dispose();
  }
  async $initializeExtensionStorage(shared, extensionId) {
    await this.checkAndMigrateExtensionStorage(extensionId, shared);
    if (shared) {
      this._sharedStorageKeysToWatch.set(extensionId, true);
    }
    return this._extensionStorageService.getExtensionStateRaw(extensionId, shared);
  }
  async $setValue(shared, key3, value2) {
    this._extensionStorageService.setExtensionState(key3, value2, shared);
  }
  $registerExtensionStorageKeysToSync(extension, keys) {
    this._extensionStorageService.setKeysForSync(extension, keys);
  }
  async checkAndMigrateExtensionStorage(extensionId, shared) {
    try {
      let sourceExtensionId = this._extensionStorageService.getSourceExtensionToMigrate(extensionId);
      if (!sourceExtensionId && isWeb && extensionId !== extensionId.toLowerCase()) {
        sourceExtensionId = extensionId.toLowerCase();
      }
      if (sourceExtensionId) {
        if (isWeb && sourceExtensionId !== sourceExtensionId.toLowerCase() && this._extensionStorageService.getExtensionState(sourceExtensionId.toLowerCase(), shared) && !this._extensionStorageService.getExtensionState(sourceExtensionId, shared)) {
          sourceExtensionId = sourceExtensionId.toLowerCase();
        }
        await migrateExtensionStorage(sourceExtensionId, extensionId, shared, this._instantiationService);
      }
    } catch (error) {
      this._logService.error(error);
    }
  }
};

MainThreadStorage = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadStorage),
  __decorateParam(1, IExtensionStorageService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILogService)
], MainThreadStorage);
export { MainThreadStorage };
