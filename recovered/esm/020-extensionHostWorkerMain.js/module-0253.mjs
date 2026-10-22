// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostStoragePaths.ts
import { createDecorator } from "./module-0038.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostInitDataService } from "./module-0049.mjs";
import { ILogService } from "./module-0045.mjs";
import { IExtHostConsumerFileSystem } from "./module-0252.mjs";


// src/vs/workbench/api/common/extHostStoragePaths.ts
var IExtensionStoragePaths = createDecorator("IExtensionStoragePaths");

var ExtensionStoragePaths = class {
  constructor(initData, _logService, _extHostFileSystem) {
    this._logService = _logService;
    this._extHostFileSystem = _extHostFileSystem;
    this._workspace = initData.workspace ?? void 0;
    this._environment = initData.environment;
    this.whenReady = this._getOrCreateWorkspaceStoragePath().then((value) => this._value = value);
  }
  async _getWorkspaceStorageURI(storageName) {
    return URI.joinPath(this._environment.workspaceStorageHome, storageName);
  }
  async _getOrCreateWorkspaceStoragePath() {
    if (!this._workspace) {
      return Promise.resolve(void 0);
    }
    const storageName = this._workspace.id;
    const storageUri = await this._getWorkspaceStorageURI(storageName);
    try {
      await this._extHostFileSystem.value.stat(storageUri);
      this._logService.trace("[ExtHostStorage] storage dir already exists", storageUri);
      return storageUri;
    } catch {
    }
    try {
      this._logService.trace("[ExtHostStorage] creating dir and metadata-file", storageUri);
      await this._extHostFileSystem.value.createDirectory(storageUri);
      await this._extHostFileSystem.value.writeFile(
        URI.joinPath(storageUri, "meta.json"),
        new TextEncoder().encode(JSON.stringify({
          id: this._workspace.id,
          configuration: URI.revive(this._workspace.configuration)?.toString(),
          name: this._workspace.name
        }, void 0, 2))
      );
      return storageUri;
    } catch (e) {
      this._logService.error("[ExtHostStorage]", e);
      return void 0;
    }
  }
  workspaceValue(extension) {
    if (this._value) {
      return URI.joinPath(this._value, extension.identifier.value);
    }
    return void 0;
  }
  globalValue(extension) {
    return URI.joinPath(this._environment.globalStorageHome, extension.identifier.value.toLowerCase());
  }
  onWillDeactivateAll() {
  }
};

ExtensionStoragePaths = __decorateClass([
  __decorateParam(0, IExtHostInitDataService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IExtHostConsumerFileSystem)
], ExtensionStoragePaths);
export { IExtensionStoragePaths, ExtensionStoragePaths };
