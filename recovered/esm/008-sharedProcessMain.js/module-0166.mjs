// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/userDataSyncEnablementService.ts
import { Disposable } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";
import { ALL_SYNC_RESOURCES, IUserDataSyncStoreManagementService, getEnablementKey } from "./module-0157.mjs";
import { isWeb } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0096.mjs";
import { IEnvironmentService } from "./module-0047.mjs";


// src/vs/platform/userDataSync/common/userDataSyncEnablementService.ts
var enablementKey = "sync.enable";

var UserDataSyncEnablementService = class extends Disposable {
  constructor(storageService, environmentService, userDataSyncStoreManagementService) {
    super();
    this.storageService = storageService;
    this.environmentService = environmentService;
    this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
    this._onDidChangeEnablement = this._register(new Emitter());
    this.onDidChangeEnablement = this._onDidChangeEnablement.event;
    this._onDidChangeResourceEnablement = this._register(new Emitter());
    this.onDidChangeResourceEnablement = this._onDidChangeResourceEnablement.event;
    this._register(storageService.onDidChangeValue(-1 /* APPLICATION */, void 0, this._store)((e) => this.onDidStorageChange(e)));
  }
  isEnabled() {
    switch (this.environmentService.sync) {
      case "on":
        return true;
      case "off":
        return false;
    }
    return this.storageService.getBoolean(enablementKey, -1 /* APPLICATION */, false);
  }
  canToggleEnablement() {
    return this.userDataSyncStoreManagementService.userDataSyncStore !== void 0 && this.environmentService.sync === void 0;
  }
  setEnablement(enabled) {
    if (enabled && !this.canToggleEnablement()) {
      return;
    }
    this.storageService.store(enablementKey, enabled, -1 /* APPLICATION */, 1 /* MACHINE */);
  }
  isResourceEnabled(resource, defaultValue) {
    const storedValue = this.storageService.getBoolean(getEnablementKey(resource), -1 /* APPLICATION */);
    defaultValue = defaultValue ?? resource !== "prompts" /* Prompts */;
    return storedValue ?? defaultValue;
  }
  isResourceEnablementConfigured(resource) {
    const storedValue = this.storageService.getBoolean(getEnablementKey(resource), -1 /* APPLICATION */);
    return storedValue !== void 0;
  }
  setResourceEnablement(resource, enabled) {
    if (this.isResourceEnabled(resource) !== enabled) {
      const resourceEnablementKey = getEnablementKey(resource);
      this.storeResourceEnablement(resourceEnablementKey, enabled);
    }
  }
  getResourceSyncStateVersion(resource) {
    return void 0;
  }
  storeResourceEnablement(resourceEnablementKey, enabled) {
    this.storageService.store(resourceEnablementKey, enabled, -1 /* APPLICATION */, isWeb ? 0 /* USER */ : 1 /* MACHINE */);
  }
  onDidStorageChange(storageChangeEvent) {
    if (enablementKey === storageChangeEvent.key) {
      this._onDidChangeEnablement.fire(this.isEnabled());
      return;
    }
    const resourceKey = ALL_SYNC_RESOURCES.filter((resourceKey2) => getEnablementKey(resourceKey2) === storageChangeEvent.key)[0];
    if (resourceKey) {
      this._onDidChangeResourceEnablement.fire([resourceKey, this.isResourceEnabled(resourceKey)]);
      return;
    }
  }
};

UserDataSyncEnablementService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, IUserDataSyncStoreManagementService)
], UserDataSyncEnablementService);
export { enablementKey, UserDataSyncEnablementService };
