// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editSessions/common/workspaceStateSync.ts
import { Emitter } from "./module-0017.mjs";
import { AbstractSynchroniser } from "./module-1746.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { parse2, stringify } from "./module-0265.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceIdentityService } from "./module-3631.mjs";
import { IEditSessionsStorageService } from "./module-3626.mjs";


// src/vs/workbench/contrib/editSessions/common/workspaceStateSync.ts
var NullBackupStoreService = class {
  async writeResource() {
    return;
  }
  async getAllResourceRefs() {
    return [];
  }
  async resolveResourceContent() {
    return null;
  }
};

var NullEnablementService = class {
  constructor() {
    this._onDidChangeEnablement = new Emitter();
    this.onDidChangeEnablement = this._onDidChangeEnablement.event;
    this._onDidChangeResourceEnablement = new Emitter();
    this.onDidChangeResourceEnablement = this._onDidChangeResourceEnablement.event;
  }
  isEnabled() {
    return true;
  }
  canToggleEnablement() {
    return true;
  }
  setEnablement(_enabled) {
  }
  isResourceEnabled(_resource) {
    return true;
  }
  isResourceEnablementConfigured(_resource) {
    return false;
  }
  setResourceEnablement(_resource, _enabled) {
  }
  getResourceSyncStateVersion(_resource) {
    return void 0;
  }
};

var WorkspaceStateSynchroniser = class extends AbstractSynchroniser {
  constructor(profile, collection, userDataSyncStoreService, logService, fileService, environmentService, telemetryService, configurationService, storageService, uriIdentityService, workspaceIdentityService, editSessionsStorageService) {
    const userDataSyncLocalStoreService = new NullBackupStoreService();
    const userDataSyncEnablementService = new NullEnablementService();
    super({ syncResource: "workspaceState" /* WorkspaceState */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
    this.workspaceIdentityService = workspaceIdentityService;
    this.editSessionsStorageService = editSessionsStorageService;
    this.version = 1;
  }
  async sync() {
    const cancellationTokenSource = new CancellationTokenSource();
    const folders = await this.workspaceIdentityService.getWorkspaceStateFolders(cancellationTokenSource.token);
    if (!folders.length) {
      return null;
    }
    await this.storageService.flush();
    const keys = this.storageService.keys(1 /* WORKSPACE */, 0 /* USER */);
    if (!keys.length) {
      return null;
    }
    const contributedData = {};
    keys.forEach((key3) => {
      const data = this.storageService.get(key3, 1 /* WORKSPACE */);
      if (data) {
        contributedData[key3] = data;
      }
    });
    const content2 = { folders, storage: contributedData, version: this.version };
    await this.editSessionsStorageService.write("workspaceState", stringify(content2));
    return null;
  }
  async apply() {
    const payload = this.editSessionsStorageService.lastReadResources.get("editSessions")?.content;
    const workspaceStateId = payload ? JSON.parse(payload).workspaceStateId : void 0;
    const resource = await this.editSessionsStorageService.read("workspaceState", workspaceStateId);
    if (!resource) {
      return null;
    }
    const remoteWorkspaceState = parse2(resource.content);
    if (!remoteWorkspaceState) {
      this.logService.info("Skipping initializing workspace state because remote workspace state does not exist.");
      return null;
    }
    const cancellationTokenSource = new CancellationTokenSource();
    const replaceUris = await this.workspaceIdentityService.matches(remoteWorkspaceState.folders, cancellationTokenSource.token);
    if (!replaceUris) {
      this.logService.info("Skipping initializing workspace state because remote workspace state does not match current workspace.");
      return null;
    }
    const storage = {};
    for (const key3 of Object.keys(remoteWorkspaceState.storage)) {
      storage[key3] = remoteWorkspaceState.storage[key3];
    }
    if (Object.keys(storage).length) {
      const storageEntries = [];
      for (const key3 of Object.keys(storage)) {
        try {
          const value2 = parse2(storage[key3]);
          replaceUris(value2);
          storageEntries.push({ key: key3, value: value2, scope: 1 /* WORKSPACE */, target: 0 /* USER */ });
        } catch {
          storageEntries.push({ key: key3, value: storage[key3], scope: 1 /* WORKSPACE */, target: 0 /* USER */ });
        }
      }
      this.storageService.storeAll(storageEntries, true);
    }
    this.editSessionsStorageService.delete("workspaceState", resource.ref);
    return null;
  }
  // TODO@joyceerhl implement AbstractSynchronizer in full
  applyResult(remoteUserData, lastSyncUserData, result, force) {
    throw new Error("Method not implemented.");
  }
  async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration, token) {
    return [];
  }
  getMergeResult(resourcePreview, token) {
    throw new Error("Method not implemented.");
  }
  getAcceptResult(resourcePreview, resource, content2, token) {
    throw new Error("Method not implemented.");
  }
  async hasRemoteChanged(lastSyncUserData) {
    return true;
  }
  async hasLocalData() {
    return false;
  }
  async resolveContent(uri5) {
    return null;
  }
};

WorkspaceStateSynchroniser = __decorateClass([
  __decorateParam(4, IFileService),
  __decorateParam(5, IEnvironmentService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IUriIdentityService),
  __decorateParam(10, IWorkspaceIdentityService),
  __decorateParam(11, IEditSessionsStorageService)
], WorkspaceStateSynchroniser);
export { NullBackupStoreService, NullEnablementService, WorkspaceStateSynchroniser };
