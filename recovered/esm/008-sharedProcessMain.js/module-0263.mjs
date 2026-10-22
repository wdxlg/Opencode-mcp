// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/storage/common/storageService.ts
import { AbstractStorageService, isProfileUsingDefaultStorage } from "./module-0096.mjs";
import { DisposableStore } from "./module-0013.mjs";
import { ApplicationSharedStorageDatabaseClient, ApplicationStorageDatabaseClient, ProfileStorageDatabaseClient, WorkspaceStorageDatabaseClient } from "./module-0062.mjs";
import { Storage } from "./module-0093.mjs";
import { Promises } from "./module-0029.mjs";
import { joinPath } from "./module-0027.mjs";
import { Schemas } from "./module-0025.mjs";
import { isUserDataProfile } from "./module-0095.mjs";


// src/vs/platform/storage/common/storageService.ts
var RemoteStorageService = class extends AbstractStorageService {
  constructor(initialWorkspace, initialProfiles, remoteService, environmentService) {
    super();
    this.remoteService = remoteService;
    this.environmentService = environmentService;
    this.profileStorageDisposables = this._register(new DisposableStore());
    this.workspaceStorageDisposables = this._register(new DisposableStore());
    this.applicationStorageProfile = initialProfiles.defaultProfile;
    this.applicationStorage = this.createApplicationStorage();
    this.applicationSharedStorage = this.createApplicationSharedStorage();
    this.profileStorageProfile = initialProfiles.currentProfile;
    this.profileStorage = this.createProfileStorage(this.profileStorageProfile);
    this.workspaceStorageId = initialWorkspace?.id;
    this.workspaceStorage = this.createWorkspaceStorage(initialWorkspace);
  }
  createApplicationStorage() {
    const storageDataBaseClient = this._register(new ApplicationStorageDatabaseClient(this.remoteService.getChannel("storage")));
    const applicationStorage = this._register(new Storage(storageDataBaseClient));
    this._register(applicationStorage.onDidChangeStorage((e) => this.emitDidChangeValue(-1 /* APPLICATION */, e)));
    return applicationStorage;
  }
  createApplicationSharedStorage() {
    const storageDataBaseClient = this._register(new ApplicationSharedStorageDatabaseClient(this.remoteService.getChannel("storage")));
    const applicationSharedStorage = this._register(new Storage(storageDataBaseClient));
    this._register(applicationSharedStorage.onDidChangeStorage((e) => this.emitDidChangeValue(-2 /* APPLICATION_SHARED */, e)));
    return applicationSharedStorage;
  }
  createProfileStorage(profile) {
    this.profileStorageDisposables.clear();
    this.profileStorageProfile = profile;
    let profileStorage;
    if (isProfileUsingDefaultStorage(profile)) {
      profileStorage = this.applicationStorage;
    } else {
      const storageDataBaseClient = this.profileStorageDisposables.add(new ProfileStorageDatabaseClient(this.remoteService.getChannel("storage"), profile));
      profileStorage = this.profileStorageDisposables.add(new Storage(storageDataBaseClient));
    }
    this.profileStorageDisposables.add(profileStorage.onDidChangeStorage((e) => this.emitDidChangeValue(0 /* PROFILE */, e)));
    return profileStorage;
  }
  createWorkspaceStorage(workspace) {
    this.workspaceStorageDisposables.clear();
    this.workspaceStorageId = workspace?.id;
    let workspaceStorage = void 0;
    if (workspace) {
      const storageDataBaseClient = this.workspaceStorageDisposables.add(new WorkspaceStorageDatabaseClient(this.remoteService.getChannel("storage"), workspace));
      workspaceStorage = this.workspaceStorageDisposables.add(new Storage(storageDataBaseClient));
      this.workspaceStorageDisposables.add(workspaceStorage.onDidChangeStorage((e) => this.emitDidChangeValue(1 /* WORKSPACE */, e)));
    }
    return workspaceStorage;
  }
  async doInitialize() {
    await Promises.settled([
      this.applicationStorage.init(),
      this.applicationSharedStorage.init(),
      this.profileStorage.init(),
      this.workspaceStorage?.init() ?? Promise.resolve()
    ]);
  }
  getStorage(scope) {
    switch (scope) {
      case -2 /* APPLICATION_SHARED */:
        return this.applicationSharedStorage;
      case -1 /* APPLICATION */:
        return this.applicationStorage;
      case 0 /* PROFILE */:
        return this.profileStorage;
      default:
        return this.workspaceStorage;
    }
  }
  getLogDetails(scope) {
    switch (scope) {
      case -2 /* APPLICATION_SHARED */:
        return joinPath(this.environmentService.appSharedDataHome, "sharedStorage").with({ scheme: Schemas.file }).fsPath;
      case -1 /* APPLICATION */:
        return this.applicationStorageProfile.globalStorageHome.with({ scheme: Schemas.file }).fsPath;
      case 0 /* PROFILE */:
        return this.profileStorageProfile?.globalStorageHome.with({ scheme: Schemas.file }).fsPath;
      default:
        return this.workspaceStorageId ? `${joinPath(this.environmentService.workspaceStorageHome, this.workspaceStorageId, "state.vscdb").with({ scheme: Schemas.file }).fsPath}` : void 0;
    }
  }
  async close() {
    this.stopFlushWhenIdle();
    this.emitWillSaveState(1 /* SHUTDOWN */);
    await Promises.settled([
      this.applicationStorage.close(),
      this.applicationSharedStorage.close(),
      this.profileStorage.close(),
      this.workspaceStorage?.close() ?? Promise.resolve()
    ]);
  }
  async switchToProfile(toProfile) {
    if (!this.canSwitchProfile(this.profileStorageProfile, toProfile)) {
      return;
    }
    const oldProfileStorage = this.profileStorage;
    const oldItems = oldProfileStorage.items;
    if (oldProfileStorage !== this.applicationStorage) {
      await oldProfileStorage.close();
    }
    this.profileStorage = this.createProfileStorage(toProfile);
    await this.profileStorage.init();
    this.switchData(oldItems, this.profileStorage, 0 /* PROFILE */);
  }
  async switchToWorkspace(toWorkspace, preserveData) {
    const oldWorkspaceStorage = this.workspaceStorage;
    const oldItems = oldWorkspaceStorage?.items ?? /* @__PURE__ */ new Map();
    await oldWorkspaceStorage?.close();
    this.workspaceStorage = this.createWorkspaceStorage(toWorkspace);
    await this.workspaceStorage.init();
    this.switchData(oldItems, this.workspaceStorage, 1 /* WORKSPACE */);
  }
  hasScope(scope) {
    if (isUserDataProfile(scope)) {
      return this.profileStorageProfile.id === scope.id;
    }
    return this.workspaceStorageId === scope.id;
  }
};
export { RemoteStorageService };
