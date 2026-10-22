// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/storage/electron-main/storageMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { init_path, join4 } from "./module-0008.mjs";
import { INativeEnvironmentService, init_environment } from "./module-0071.mjs";
import { IFileService, init_files } from "./module-0072.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { AbstractStorageService, init_storage2, isProfileUsingDefaultStorage } from "./module-0079.mjs";
import { ApplicationSharedStorageMain, ApplicationStorageMain, InMemoryStorageMain, ProfileStorageMain, WorkspaceStorageMain, init_storageMain } from "./module-0105.mjs";
import { IUserDataProfilesService, init_userDataProfile } from "./module-0078.mjs";
import { IUserDataProfilesMainService, init_userDataProfile3 } from "./module-0108.mjs";
import { IUriIdentityService, init_uriIdentity } from "./module-0077.mjs";
import { Schemas, init_network } from "./module-0031.mjs";


// src/vs/platform/storage/electron-main/storageMainService.ts
var IStorageMainService, StorageMainService, IApplicationStorageMainService, ApplicationStorageMainService;

var init_storageMainService = __esm({
  "src/vs/platform/storage/electron-main/storageMainService.ts"() {
    init_uri();
    init_event();
    init_lifecycle();
    init_path();
    init_environment();
    init_files();
    init_instantiation();
    init_lifecycleMainService();
    init_log();
    init_storage2();
    init_storageMain();
    init_userDataProfile();
    init_userDataProfile3();
    init_uriIdentity();
    init_network();
    IStorageMainService = createDecorator("storageMainService");
    StorageMainService = class extends Disposable {
      constructor(logService, environmentService, userDataProfilesService, lifecycleMainService, fileService, uriIdentityService) {
        super();
        this.logService = logService;
        this.environmentService = environmentService;
        this.userDataProfilesService = userDataProfilesService;
        this.lifecycleMainService = lifecycleMainService;
        this.fileService = fileService;
        this.uriIdentityService = uriIdentityService;
        this.shutdownReason = void 0;
        this._onDidChangeProfileStorage = this._register(new Emitter());
        this.onDidChangeProfileStorage = this._onDidChangeProfileStorage.event;
        //#endregion
        //#region Profile Storage
        this.mapProfileToStorage = /* @__PURE__ */ new Map();
        //#endregion
        //#region Workspace Storage
        this.mapWorkspaceToStorage = /* @__PURE__ */ new Map();
        this.applicationStorage = this._register(this.createApplicationStorage());
        this.applicationSharedStorage = this._register(this.createApplicationSharedStorage());
        this.registerListeners();
      }
      getStorageOptions() {
        return {
          useInMemoryStorage: !!this.environmentService.extensionTestsLocationURI
          // no storage during extension tests!
        };
      }
      registerListeners() {
        (async () => {
          await this.lifecycleMainService.when(3 /* AfterWindowOpen */);
          this.applicationStorage.init();
          this.applicationSharedStorage.init();
        })();
        this._register(this.lifecycleMainService.onWillLoadWindow((e) => {
          if (e.window.profile) {
            this.profileStorage(e.window.profile).init();
          }
          if (e.workspace) {
            this.workspaceStorage(e.workspace).init();
          }
        }));
        this._register(this.lifecycleMainService.onWillShutdown((e) => {
          this.logService.trace("storageMainService#onWillShutdown()");
          this.shutdownReason = e.reason;
          e.join("applicationStorage", this.applicationStorage.close());
          e.join("applicationSharedStorage", this.applicationSharedStorage.close());
          for (const [, profileStorage] of this.mapProfileToStorage) {
            e.join("profileStorage", profileStorage.close());
          }
          for (const [, workspaceStorage] of this.mapWorkspaceToStorage) {
            e.join("workspaceStorage", workspaceStorage.close());
          }
        }));
        this._register(this.userDataProfilesService.onWillCreateProfile((e) => {
          e.join((async () => {
            if (!await this.fileService.exists(e.profile.globalStorageHome)) {
              await this.fileService.createFolder(e.profile.globalStorageHome);
            }
          })());
        }));
        this._register(this.userDataProfilesService.onWillRemoveProfile((e) => {
          const storage = this.mapProfileToStorage.get(e.profile.id);
          if (storage) {
            e.join(storage.close());
          }
        }));
      }
      createApplicationStorage() {
        this.logService.trace(`StorageMainService: creating application storage`);
        const applicationStorage = new ApplicationStorageMain(this.getStorageOptions(), this.userDataProfilesService, this.logService, this.fileService);
        this._register(Event.once(applicationStorage.onDidCloseStorage)(() => {
          this.logService.trace(`StorageMainService: closed application storage`);
        }));
        return applicationStorage;
      }
      createApplicationSharedStorage() {
        this.logService.info(`StorageMainService: creating application shared storage`);
        const sharedStorageFolderPath = join4(this.environmentService.appSharedDataHome.with({ scheme: Schemas.file }).fsPath, "sharedStorage");
        const applicationSharedStorage = new ApplicationSharedStorageMain(this.getStorageOptions(), sharedStorageFolderPath, this.applicationStorage, this.logService, this.fileService);
        this._register(Event.once(applicationSharedStorage.onDidCloseStorage)(() => {
          this.logService.trace(`StorageMainService: closed application shared storage`);
        }));
        return applicationSharedStorage;
      }
      profileStorage(profile) {
        if (isProfileUsingDefaultStorage(profile)) {
          return this.applicationStorage;
        }
        let profileStorage = this.mapProfileToStorage.get(profile.id);
        if (!profileStorage) {
          this.logService.trace(`StorageMainService: creating profile storage (${profile.name})`);
          profileStorage = this._register(this.createProfileStorage(profile));
          this.mapProfileToStorage.set(profile.id, profileStorage);
          const listener = profileStorage.onDidChangeStorage((e) => this._onDidChangeProfileStorage.fire({
            ...e,
            storage: profileStorage,
            profile
          }));
          Event.once(profileStorage.onDidCloseStorage)(() => {
            this.logService.trace(`StorageMainService: closed profile storage (${profile.name})`);
            this.mapProfileToStorage.delete(profile.id);
            listener.dispose();
          });
        }
        return profileStorage;
      }
      createProfileStorage(profile) {
        if (this.shutdownReason === 2 /* KILL */) {
          return new InMemoryStorageMain(this.logService, this.fileService);
        }
        return new ProfileStorageMain(profile, this.getStorageOptions(), this.logService, this.fileService);
      }
      workspaceStorage(workspace) {
        let workspaceStorage = this.mapWorkspaceToStorage.get(workspace.id);
        if (!workspaceStorage) {
          this.logService.trace(`StorageMainService: creating workspace storage (${workspace.id})`);
          workspaceStorage = this._register(this.createWorkspaceStorage(workspace));
          this.mapWorkspaceToStorage.set(workspace.id, workspaceStorage);
          Event.once(workspaceStorage.onDidCloseStorage)(() => {
            this.logService.trace(`StorageMainService: closed workspace storage (${workspace.id})`);
            this.mapWorkspaceToStorage.delete(workspace.id);
          });
        }
        return workspaceStorage;
      }
      createWorkspaceStorage(workspace) {
        if (this.shutdownReason === 2 /* KILL */) {
          return new InMemoryStorageMain(this.logService, this.fileService);
        }
        return new WorkspaceStorageMain(workspace, this.getStorageOptions(), this.logService, this.environmentService, this.fileService);
      }
      //#endregion
      isUsed(path4) {
        const pathUri = URI.file(path4);
        for (const storage of [this.applicationStorage, this.applicationSharedStorage, ...this.mapProfileToStorage.values(), ...this.mapWorkspaceToStorage.values()]) {
          if (!storage.path) {
            continue;
          }
          if (this.uriIdentityService.extUri.isEqualOrParent(URI.file(storage.path), pathUri)) {
            return true;
          }
        }
        return false;
      }
    };
    StorageMainService = __decorateClass([
      __decorateParam(0, ILogService),
      __decorateParam(1, INativeEnvironmentService),
      __decorateParam(2, IUserDataProfilesMainService),
      __decorateParam(3, ILifecycleMainService),
      __decorateParam(4, IFileService),
      __decorateParam(5, IUriIdentityService)
    ], StorageMainService);
    IApplicationStorageMainService = createDecorator("applicationStorageMainService");
    ApplicationStorageMainService = class extends AbstractStorageService {
      constructor(userDataProfilesService, storageMainService) {
        super();
        this.userDataProfilesService = userDataProfilesService;
        this.storageMainService = storageMainService;
        this.whenReady = Promise.all([
          this.storageMainService.applicationStorage.whenInit,
          this.storageMainService.applicationSharedStorage.whenInit
        ]).then(() => void 0);
      }
      doInitialize() {
        return Promise.all([
          this.storageMainService.applicationStorage.whenInit,
          this.storageMainService.applicationSharedStorage.whenInit
        ]).then(() => void 0);
      }
      getStorage(scope) {
        if (scope === -1 /* APPLICATION */) {
          return this.storageMainService.applicationStorage.storage;
        }
        if (scope === -2 /* APPLICATION_SHARED */) {
          return this.storageMainService.applicationSharedStorage.storage;
        }
        return void 0;
      }
      getLogDetails(scope) {
        if (scope === -1 /* APPLICATION */) {
          return this.userDataProfilesService.defaultProfile.globalStorageHome.with({ scheme: Schemas.file }).fsPath;
        }
        if (scope === -2 /* APPLICATION_SHARED */) {
          return this.storageMainService.applicationSharedStorage.path;
        }
        return void 0;
      }
      shouldFlushWhenIdle() {
        return false;
      }
      switch() {
        throw new Error("Migrating storage is unsupported from main process");
      }
      switchToProfile() {
        throw new Error("Switching storage profile is unsupported from main process");
      }
      switchToWorkspace() {
        throw new Error("Switching storage workspace is unsupported from main process");
      }
      hasScope() {
        throw new Error("Main process is never profile or workspace scoped");
      }
    };
    ApplicationStorageMainService = __decorateClass([
      __decorateParam(0, IUserDataProfilesService),
      __decorateParam(1, IStorageMainService)
    ], ApplicationStorageMainService);
  }
});
export { IStorageMainService, StorageMainService, IApplicationStorageMainService, ApplicationStorageMainService, init_storageMainService };
