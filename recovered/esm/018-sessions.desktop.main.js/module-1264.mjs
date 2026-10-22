// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/extensionManagement/common/extensionStorage.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { adoptToGalleryExtensionId, areSameExtensions, getExtensionId } from "./module-0888.mjs";
import { isString } from "./module-0010.mjs";
import { distinct } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IProductService } from "./module-0875.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/platform/extensionManagement/common/extensionStorage.ts
var IExtensionStorageService = createDecorator("IExtensionStorageService");

var EXTENSION_KEYS_ID_VERSION_REGEX = /^extensionKeys\/([^.]+\..+)@(\d+\.\d+\.\d+(-.*)?)$/;

var ExtensionStorageService = class extends Disposable {
  constructor(storageService, productService, logService) {
    super();
    this.storageService = storageService;
    this.productService = productService;
    this.logService = logService;
    this._onDidChangeExtensionStorageToSync = this._register(new Emitter());
    this.onDidChangeExtensionStorageToSync = this._onDidChangeExtensionStorageToSync.event;
    this.extensionsWithKeysForSync = ExtensionStorageService.readAllExtensionsWithKeysForSync(storageService);
    this._register(this.storageService.onDidChangeValue(0 /* PROFILE */, void 0, this._store)((e4) => this.onDidChangeStorageValue(e4)));
  }
  static {
    this.LARGE_STATE_WARNING_THRESHOLD = 512 * 1024;
  }
  static toKey(extension) {
    return `extensionKeys/${adoptToGalleryExtensionId(extension.id)}@${extension.version}`;
  }
  static fromKey(key3) {
    const matches2 = EXTENSION_KEYS_ID_VERSION_REGEX.exec(key3);
    if (matches2 && matches2[1]) {
      return { id: matches2[1], version: matches2[2] };
    }
    return void 0;
  }
  /* TODO @sandy081: This has to be done across all profiles */
  static async removeOutdatedExtensionVersions(extensionManagementService, storageService) {
    const extensions = await extensionManagementService.getInstalled();
    const extensionVersionsToRemove = [];
    for (const [id2, versions] of ExtensionStorageService.readAllExtensionsWithKeysForSync(storageService)) {
      const extensionVersion = extensions.find((e4) => areSameExtensions(e4.identifier, { id: id2 }))?.manifest.version;
      for (const version2 of versions) {
        if (extensionVersion !== version2) {
          extensionVersionsToRemove.push(ExtensionStorageService.toKey({ id: id2, version: version2 }));
        }
      }
    }
    for (const key3 of extensionVersionsToRemove) {
      storageService.remove(key3, 0 /* PROFILE */);
    }
  }
  static readAllExtensionsWithKeysForSync(storageService) {
    const extensionsWithKeysForSync = /* @__PURE__ */ new Map();
    const keys = storageService.keys(0 /* PROFILE */, 1 /* MACHINE */);
    for (const key3 of keys) {
      const extensionIdWithVersion = ExtensionStorageService.fromKey(key3);
      if (extensionIdWithVersion) {
        let versions = extensionsWithKeysForSync.get(extensionIdWithVersion.id.toLowerCase());
        if (!versions) {
          extensionsWithKeysForSync.set(extensionIdWithVersion.id.toLowerCase(), versions = []);
        }
        versions.push(extensionIdWithVersion.version);
      }
    }
    return extensionsWithKeysForSync;
  }
  onDidChangeStorageValue(e4) {
    if (this.extensionsWithKeysForSync.has(e4.key.toLowerCase())) {
      this._onDidChangeExtensionStorageToSync.fire();
      return;
    }
    const extensionIdWithVersion = ExtensionStorageService.fromKey(e4.key);
    if (extensionIdWithVersion) {
      if (this.storageService.get(e4.key, 0 /* PROFILE */) === void 0) {
        this.extensionsWithKeysForSync.delete(extensionIdWithVersion.id.toLowerCase());
      } else {
        let versions = this.extensionsWithKeysForSync.get(extensionIdWithVersion.id.toLowerCase());
        if (!versions) {
          this.extensionsWithKeysForSync.set(extensionIdWithVersion.id.toLowerCase(), versions = []);
        }
        versions.push(extensionIdWithVersion.version);
        this._onDidChangeExtensionStorageToSync.fire();
      }
      return;
    }
  }
  getExtensionId(extension) {
    if (isString(extension)) {
      return extension;
    }
    const publisher = extension.manifest ? extension.manifest.publisher : extension.publisher;
    const name = extension.manifest ? extension.manifest.name : extension.name;
    return getExtensionId(publisher, name);
  }
  getExtensionState(extension, global) {
    const extensionId = this.getExtensionId(extension);
    const jsonValue = this.getExtensionStateRaw(extension, global);
    if (jsonValue) {
      try {
        return JSON.parse(jsonValue);
      } catch (error) {
        this.logService.error(`[mainThreadStorage] unexpected error parsing storage contents (extensionId: ${extensionId}, global: ${global}): ${error}`);
      }
    }
    return void 0;
  }
  getExtensionStateRaw(extension, global) {
    const extensionId = this.getExtensionId(extension);
    const rawState = this.storageService.get(extensionId, global ? 0 /* PROFILE */ : 1 /* WORKSPACE */);
    if (rawState && rawState?.length > ExtensionStorageService.LARGE_STATE_WARNING_THRESHOLD) {
      this.logService.warn(`[mainThreadStorage] large extension state detected (extensionId: ${extensionId}, global: ${global}): ${rawState.length / 1024}kb. Consider to use 'storageUri' or 'globalStorageUri' to store this data on disk instead.`);
    }
    return rawState;
  }
  setExtensionState(extension, state, global) {
    const extensionId = this.getExtensionId(extension);
    if (state === void 0) {
      this.storageService.remove(extensionId, global ? 0 /* PROFILE */ : 1 /* WORKSPACE */);
    } else {
      this.storageService.store(
        extensionId,
        JSON.stringify(state),
        global ? 0 /* PROFILE */ : 1 /* WORKSPACE */,
        1 /* MACHINE */
        /* Extension state is synced separately through extensions */
      );
    }
  }
  setKeysForSync(extensionIdWithVersion, keys) {
    this.storageService.store(ExtensionStorageService.toKey(extensionIdWithVersion), JSON.stringify(keys), 0 /* PROFILE */, 1 /* MACHINE */);
  }
  getKeysForSync(extensionIdWithVersion) {
    const extensionKeysForSyncFromProduct = this.productService.extensionSyncedKeys?.[extensionIdWithVersion.id.toLowerCase()];
    const extensionKeysForSyncFromStorageValue = this.storageService.get(ExtensionStorageService.toKey(extensionIdWithVersion), 0 /* PROFILE */);
    const extensionKeysForSyncFromStorage = extensionKeysForSyncFromStorageValue ? JSON.parse(extensionKeysForSyncFromStorageValue) : void 0;
    return extensionKeysForSyncFromStorage && extensionKeysForSyncFromProduct ? distinct([...extensionKeysForSyncFromStorage, ...extensionKeysForSyncFromProduct]) : extensionKeysForSyncFromStorage || extensionKeysForSyncFromProduct;
  }
  addToMigrationList(from, to) {
    if (from !== to) {
      const migrationList = this.migrationList.filter((entry) => !entry.includes(from) && !entry.includes(to));
      migrationList.push([from, to]);
      this.migrationList = migrationList;
    }
  }
  getSourceExtensionToMigrate(toExtensionId) {
    const entry = this.migrationList.find(([, to]) => toExtensionId === to);
    return entry ? entry[0] : void 0;
  }
  get migrationList() {
    const value2 = this.storageService.get("extensionStorage.migrationList", -1 /* APPLICATION */, "[]");
    try {
      const migrationList = JSON.parse(value2);
      if (Array.isArray(migrationList)) {
        return migrationList;
      }
    } catch (error) {
    }
    return [];
  }
  set migrationList(migrationList) {
    if (migrationList.length) {
      this.storageService.store("extensionStorage.migrationList", JSON.stringify(migrationList), -1 /* APPLICATION */, 1 /* MACHINE */);
    } else {
      this.storageService.remove("extensionStorage.migrationList", -1 /* APPLICATION */);
    }
  }
};

ExtensionStorageService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IProductService),
  __decorateParam(2, ILogService)
], ExtensionStorageService);
export { IExtensionStorageService, EXTENSION_KEYS_ID_VERSION_REGEX, ExtensionStorageService };
