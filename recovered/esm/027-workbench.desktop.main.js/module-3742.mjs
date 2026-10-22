// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/storage/electron-browser/storageService.ts
import { RemoteStorageService } from "./module-3741.mjs";
import { ApplicationSharedStorageDatabaseClient, FallbackApplicationStorageDatabaseClient } from "./module-1714.mjs";
import { MigratingStorage, Storage } from "./module-0507.mjs";


// src/vs/workbench/services/storage/electron-browser/storageService.ts
var NativeWorkbenchStorageService = class extends RemoteStorageService {
  constructor(workspace, userDataProfileService, userDataProfilesService, mainProcessService, workbenchEnvironmentService) {
    super(workspace, { currentProfile: userDataProfileService.currentProfile, defaultProfile: userDataProfilesService.defaultProfile }, mainProcessService, workbenchEnvironmentService);
    this.userDataProfileService = userDataProfileService;
    this.workbenchEnvironmentService = workbenchEnvironmentService;
    this.registerListeners();
  }
  createApplicationSharedStorage() {
    const channel = this.remoteService.getChannel("storage");
    const storageDataBaseClient = this._register(new ApplicationSharedStorageDatabaseClient(channel));
    const applicationSharedStorage = this._register(new MigratingStorage(storageDataBaseClient));
    this._register(applicationSharedStorage.onDidChangeStorage((e) => this.emitDidChangeValue(-2 /* APPLICATION_SHARED */, e)));
    return applicationSharedStorage;
  }
  async doInitialize() {
    await super.doInitialize();
    const applicationSharedStorage = this.getStorage(-2 /* APPLICATION_SHARED */);
    if (applicationSharedStorage instanceof MigratingStorage) {
      let applicationSharedFallbackStorage;
      if (this.workbenchEnvironmentService.isSessionsWindow) {
        const channel = this.remoteService.getChannel("storage");
        applicationSharedFallbackStorage = this._register(new Storage(this._register(new FallbackApplicationStorageDatabaseClient(channel))));
        await applicationSharedFallbackStorage.init();
      } else {
        applicationSharedFallbackStorage = this.getStorage(-1 /* APPLICATION */);
      }
      if (applicationSharedFallbackStorage) {
        applicationSharedStorage.setFallbackStorage(applicationSharedFallbackStorage, this.workbenchEnvironmentService.isSessionsWindow);
      }
    }
  }
  registerListeners() {
    this._register(this.userDataProfileService.onDidChangeCurrentProfile((e) => e.join(this.switchToProfile(e.profile))));
  }
};
export { NativeWorkbenchStorageService };
