// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataProfile/common/userDataProfileStorageService.ts
import { createDecorator } from "./module-0042.mjs";
import { Disposable, DisposableMap, MutableDisposable, isDisposable, toDisposable } from "./module-0013.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { AbstractStorageService, IStorageService, isProfileUsingDefaultStorage } from "./module-0096.mjs";
import { Emitter } from "./module-0018.mjs";
import { reviveProfile } from "./module-0095.mjs";
import { ApplicationStorageDatabaseClient, ProfileStorageDatabaseClient } from "./module-0062.mjs";
import { Storage } from "./module-0093.mjs";


// src/vs/platform/userDataProfile/common/userDataProfileStorageService.ts
var IUserDataProfileStorageService = createDecorator("IUserDataProfileStorageService");

var AbstractUserDataProfileStorageService = class extends Disposable {
  constructor(persistStorages, storageService) {
    super();
    this.storageService = storageService;
    if (persistStorages) {
      this.storageServicesMap = this._register(new DisposableMap());
    }
  }
  async readStorageData(profile) {
    return this.withProfileScopedStorageService(profile, async (storageService) => this.getItems(storageService, profile));
  }
  async updateStorageData(profile, data, target, scope = 0 /* PROFILE */) {
    return this.withProfileScopedStorageService(profile, async (storageService) => this.writeItems(storageService, data, target, scope));
  }
  async withProfileScopedStorageService(profile, fn) {
    if (this.storageService.hasScope(profile)) {
      return fn(this.storageService);
    }
    let storageService = this.storageServicesMap?.get(profile.id);
    if (!storageService) {
      storageService = new StorageService(this.createStorageDatabase(profile));
      this.storageServicesMap?.set(profile.id, storageService);
      try {
        await storageService.initialize();
      } catch (error) {
        if (this.storageServicesMap?.has(profile.id)) {
          this.storageServicesMap.deleteAndDispose(profile.id);
        } else {
          storageService.dispose();
        }
        throw error;
      }
    }
    try {
      const result = await fn(storageService);
      await storageService.flush();
      return result;
    } finally {
      if (!this.storageServicesMap?.has(profile.id)) {
        storageService.dispose();
      }
    }
  }
  getItems(storageService, profile) {
    const result = /* @__PURE__ */ new Map();
    const populate = (scope, target) => {
      for (const key of storageService.keys(scope, target)) {
        result.set(key, { value: storageService.get(key, scope), target, scope });
      }
    };
    populate(0 /* PROFILE */, 0 /* USER */);
    populate(0 /* PROFILE */, 1 /* MACHINE */);
    if (profile.isDefault) {
      populate(-2 /* APPLICATION_SHARED */, 0 /* USER */);
      populate(-2 /* APPLICATION_SHARED */, 1 /* MACHINE */);
    }
    return result;
  }
  writeItems(storageService, items, target, scope = 0 /* PROFILE */) {
    storageService.storeAll(Array.from(items.entries()).map(([key, value]) => ({ key, value, scope, target })), true);
  }
};

AbstractUserDataProfileStorageService = __decorateClass([
  __decorateParam(1, IStorageService)
], AbstractUserDataProfileStorageService);

var RemoteUserDataProfileStorageService = class extends AbstractUserDataProfileStorageService {
  constructor(persistStorages, remoteService, userDataProfilesService, storageService, logService) {
    super(persistStorages, storageService);
    this.remoteService = remoteService;
    const channel = remoteService.getChannel("profileStorageListener");
    const disposable = this._register(new MutableDisposable());
    this._onDidChange = this._register(new Emitter({
      // Start listening to profile storage changes only when someone is listening
      onWillAddFirstListener: () => {
        disposable.value = channel.listen("onDidChange")((e) => {
          logService.trace("profile storage changes", e);
          this._onDidChange.fire({
            targetChanges: e.targetChanges.map((profile) => reviveProfile(profile, userDataProfilesService.profilesHome.scheme)),
            valueChanges: e.valueChanges.map((e2) => ({ ...e2, profile: reviveProfile(e2.profile, userDataProfilesService.profilesHome.scheme) }))
          });
        });
      },
      // Stop listening to profile storage changes when no one is listening
      onDidRemoveLastListener: () => disposable.value = void 0
    }));
    this.onDidChange = this._onDidChange.event;
  }
  async createStorageDatabase(profile) {
    const storageChannel = this.remoteService.getChannel("storage");
    return isProfileUsingDefaultStorage(profile) ? new ApplicationStorageDatabaseClient(storageChannel) : new ProfileStorageDatabaseClient(storageChannel, profile);
  }
};

var StorageService = class extends AbstractStorageService {
  constructor(profileStorageDatabase) {
    super({ flushInterval: 100 });
    this.profileStorageDatabase = profileStorageDatabase;
  }
  async doInitialize() {
    const profileStorageDatabase = await this.profileStorageDatabase;
    const profileStorage = new Storage(profileStorageDatabase);
    this._register(profileStorage.onDidChangeStorage((e) => {
      this.emitDidChangeValue(0 /* PROFILE */, e);
    }));
    this._register(toDisposable(() => {
      profileStorage.close();
      profileStorage.dispose();
      if (isDisposable(profileStorageDatabase)) {
        profileStorageDatabase.dispose();
      }
    }));
    this.profileStorage = profileStorage;
    return this.profileStorage.init();
  }
  getStorage(scope) {
    return scope === 0 /* PROFILE */ ? this.profileStorage : void 0;
  }
  getLogDetails() {
    return void 0;
  }
  async switchToProfile() {
  }
  async switchToWorkspace() {
  }
  hasScope() {
    return false;
  }
};
export { IUserDataProfileStorageService, AbstractUserDataProfileStorageService, RemoteUserDataProfileStorageService, StorageService };
