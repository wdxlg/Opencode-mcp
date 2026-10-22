// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/storage/browser/storageService.ts
import { AbstractStorageService, IS_NEW_KEY, isProfileUsingDefaultStorage } from "./module-0512.mjs";
import { DeferredPromise, Promises } from "./module-0036.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { InMemoryStorageDatabase, Storage, isStorageItemsChangeEvent } from "./module-0507.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { isSafari2 } from "./module-0018.mjs";
import { isUserDataProfile } from "./module-0511.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { Emitter } from "./module-0017.mjs";
import { BroadcastDataChannel } from "./module-1379.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { IndexedDB } from "./module-3788.mjs";


// src/vs/workbench/services/storage/browser/storageService.ts
var BrowserStorageService = class extends AbstractStorageService {
  constructor(workspace, userDataProfileService, logService) {
    super({ flushInterval: BrowserStorageService.BROWSER_DEFAULT_FLUSH_INTERVAL });
    this.workspace = workspace;
    this.userDataProfileService = userDataProfileService;
    this.logService = logService;
    this.applicationStoragePromise = new DeferredPromise();
    this.profileStorageDisposables = this._register(new DisposableStore());
    this.profileStorageProfile = this.userDataProfileService.currentProfile;
    this.registerListeners();
  }
  static {
    this.BROWSER_DEFAULT_FLUSH_INTERVAL = 5 * 1e3;
  }
  get hasPendingUpdate() {
    return Boolean(
      this.applicationStorageDatabase?.hasPendingUpdate || this.applicationSharedStorageDatabase?.hasPendingUpdate || this.profileStorageDatabase?.hasPendingUpdate || this.workspaceStorageDatabase?.hasPendingUpdate
    );
  }
  async getApplicationStorageValue(key3) {
    return (await this.applicationStoragePromise.p).indexedDb.getValue(key3);
  }
  async compareAndSwapApplicationStorage(key3, expectedValue, newValue) {
    return (await this.applicationStoragePromise.p).indexedDb.compareAndSwap(key3, expectedValue, newValue);
  }
  registerListeners() {
    this._register(this.userDataProfileService.onDidChangeCurrentProfile((e4) => e4.join(this.switchToProfile(e4.profile))));
  }
  async doInitialize() {
    await Promises.settled([
      this.createApplicationStorage(),
      this.createApplicationSharedStorage(),
      this.createProfileStorage(this.profileStorageProfile),
      this.createWorkspaceStorage()
    ]);
  }
  async createApplicationStorage() {
    const applicationStorageIndexedDB = await IndexedDBStorageDatabase.createApplicationStorage(this.logService);
    this.applicationStorageDatabase = this._register(applicationStorageIndexedDB);
    this.applicationStorage = this._register(new Storage(this.applicationStorageDatabase));
    this._register(this.applicationStorage.onDidChangeStorage((e4) => this.emitDidChangeValue(-1 /* APPLICATION */, e4)));
    await this.applicationStorage.init();
    this.updateIsNew(this.applicationStorage);
    this.applicationStoragePromise.complete({ indexedDb: applicationStorageIndexedDB, storage: this.applicationStorage });
  }
  async createApplicationSharedStorage() {
    const applicationSharedStorageIndexedDB = await IndexedDBStorageDatabase.createApplicationSharedStorage(this.logService);
    this.applicationSharedStorageDatabase = this._register(applicationSharedStorageIndexedDB);
    this.applicationSharedStorage = this._register(new Storage(this.applicationSharedStorageDatabase));
    this._register(this.applicationSharedStorage.onDidChangeStorage((e4) => this.emitDidChangeValue(-2 /* APPLICATION_SHARED */, e4)));
    await this.applicationSharedStorage.init();
    this.updateIsNew(this.applicationSharedStorage);
  }
  async createProfileStorage(profile) {
    this.profileStorageDisposables.clear();
    this.profileStorageProfile = profile;
    if (isProfileUsingDefaultStorage(this.profileStorageProfile)) {
      const { indexedDb: applicationStorageIndexedDB, storage: applicationStorage } = await this.applicationStoragePromise.p;
      this.profileStorageDatabase = applicationStorageIndexedDB;
      this.profileStorage = applicationStorage;
      this.profileStorageDisposables.add(this.profileStorage.onDidChangeStorage((e4) => this.emitDidChangeValue(0 /* PROFILE */, e4)));
    } else {
      const profileStorageIndexedDB = await IndexedDBStorageDatabase.createProfileStorage(this.profileStorageProfile, this.logService);
      this.profileStorageDatabase = this.profileStorageDisposables.add(profileStorageIndexedDB);
      this.profileStorage = this.profileStorageDisposables.add(new Storage(this.profileStorageDatabase));
      this.profileStorageDisposables.add(this.profileStorage.onDidChangeStorage((e4) => this.emitDidChangeValue(0 /* PROFILE */, e4)));
      await this.profileStorage.init();
      this.updateIsNew(this.profileStorage);
    }
  }
  async createWorkspaceStorage() {
    const workspaceStorageIndexedDB = await IndexedDBStorageDatabase.createWorkspaceStorage(this.workspace.id, this.logService);
    this.workspaceStorageDatabase = this._register(workspaceStorageIndexedDB);
    this.workspaceStorage = this._register(new Storage(this.workspaceStorageDatabase));
    this._register(this.workspaceStorage.onDidChangeStorage((e4) => this.emitDidChangeValue(1 /* WORKSPACE */, e4)));
    await this.workspaceStorage.init();
    this.updateIsNew(this.workspaceStorage);
  }
  updateIsNew(storage) {
    const firstOpen = storage.getBoolean(IS_NEW_KEY);
    if (firstOpen === void 0) {
      storage.set(IS_NEW_KEY, true);
    } else if (firstOpen) {
      storage.set(IS_NEW_KEY, false);
    }
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
        return this.applicationSharedStorageDatabase?.name;
      case -1 /* APPLICATION */:
        return this.applicationStorageDatabase?.name;
      case 0 /* PROFILE */:
        return this.profileStorageDatabase?.name;
      default:
        return this.workspaceStorageDatabase?.name;
    }
  }
  async switchToProfile(toProfile) {
    if (!this.canSwitchProfile(this.profileStorageProfile, toProfile)) {
      return;
    }
    const oldProfileStorage = assertReturnsDefined(this.profileStorage);
    const oldItems = oldProfileStorage.items;
    if (oldProfileStorage !== this.applicationStorage) {
      await oldProfileStorage.close();
    }
    await this.createProfileStorage(toProfile);
    this.switchData(oldItems, assertReturnsDefined(this.profileStorage), 0 /* PROFILE */);
  }
  async switchToWorkspace(toWorkspace, preserveData) {
    throw new Error("Migrating storage is currently unsupported in Web");
  }
  shouldFlushWhenIdle() {
    return getActiveWindow().document.hasFocus() && !this.hasPendingUpdate;
  }
  close() {
    if (isSafari2) {
      this.applicationStorage?.close();
      this.applicationSharedStorageDatabase?.close();
      this.profileStorageDatabase?.close();
      this.workspaceStorageDatabase?.close();
    }
    this.dispose();
  }
  async clear() {
    for (const scope of [-1 /* APPLICATION */, -2 /* APPLICATION_SHARED */, 0 /* PROFILE */, 1 /* WORKSPACE */]) {
      for (const target of [0 /* USER */, 1 /* MACHINE */]) {
        for (const key3 of this.keys(scope, target)) {
          this.remove(key3, scope);
        }
      }
      await this.getStorage(scope)?.whenFlushed();
    }
    await Promises.settled([
      this.applicationStorageDatabase?.clear() ?? Promise.resolve(),
      this.applicationSharedStorageDatabase?.clear() ?? Promise.resolve(),
      this.profileStorageDatabase?.clear() ?? Promise.resolve(),
      this.workspaceStorageDatabase?.clear() ?? Promise.resolve()
    ]);
  }
  hasScope(scope) {
    if (isUserDataProfile(scope)) {
      return this.profileStorageProfile.id === scope.id;
    }
    return this.workspace.id === scope.id;
  }
};

BrowserStorageService = __decorateClass([
  __decorateParam(2, ILogService)
], BrowserStorageService);

var InMemoryIndexedDBStorageDatabase = class extends InMemoryStorageDatabase {
  constructor() {
    super(...arguments);
    this.hasPendingUpdate = false;
    this.name = "in-memory-indexedb-storage";
  }
  async getValue(key3) {
    return (await this.getItems()).get(key3);
  }
  async compareAndSwap(key3, expectedValue, newValue) {
    const items = await this.getItems();
    const currentValue = items.get(key3);
    if (currentValue !== expectedValue) {
      return { swapped: false, currentValue };
    }
    await this.updateItems({ insert: /* @__PURE__ */ new Map([[key3, newValue]]) });
    return { swapped: true, currentValue: newValue };
  }
  async clear() {
    (await this.getItems()).clear();
  }
  dispose() {
  }
};

var IndexedDBStorageDatabase = class _IndexedDBStorageDatabase extends Disposable {
  constructor(options3, logService) {
    super();
    this.logService = logService;
    this._onDidChangeItemsExternal = this._register(new Emitter());
    this.onDidChangeItemsExternal = this._onDidChangeItemsExternal.event;
    this.pendingUpdate = void 0;
    this.name = `${_IndexedDBStorageDatabase.STORAGE_DATABASE_PREFIX}${options3.id}`;
    this.broadcastChannel = options3.broadcastChanges ? this._register(new BroadcastDataChannel(this.name)) : void 0;
    this.whenConnected = this.connect();
    this.registerListeners();
  }
  static async createApplicationStorage(logService) {
    return _IndexedDBStorageDatabase.create({ id: "global", broadcastChanges: true }, logService);
  }
  static async createApplicationSharedStorage(logService) {
    return _IndexedDBStorageDatabase.create({ id: "global-shared", broadcastChanges: true }, logService);
  }
  static async createProfileStorage(profile, logService) {
    return _IndexedDBStorageDatabase.create({ id: `global-${profile.id}`, broadcastChanges: true }, logService);
  }
  static async createWorkspaceStorage(workspaceId, logService) {
    return _IndexedDBStorageDatabase.create({ id: workspaceId }, logService);
  }
  static async create(options3, logService) {
    try {
      const database = new _IndexedDBStorageDatabase(options3, logService);
      await database.whenConnected;
      return database;
    } catch (error) {
      logService.error(`[IndexedDB Storage ${options3.id}] create(): ${toErrorMessage(error, true)}`);
      return new InMemoryIndexedDBStorageDatabase();
    }
  }
  static {
    this.STORAGE_DATABASE_PREFIX = "vscode-web-state-db-";
  }
  static {
    this.STORAGE_OBJECT_STORE = "ItemTable";
  }
  get hasPendingUpdate() {
    return !!this.pendingUpdate;
  }
  registerListeners() {
    if (this.broadcastChannel) {
      this._register(this.broadcastChannel.onDidReceiveData((data) => {
        if (isStorageItemsChangeEvent(data)) {
          this._onDidChangeItemsExternal.fire(data);
        }
      }));
    }
  }
  async connect() {
    try {
      return await IndexedDB.create(this.name, void 0, [_IndexedDBStorageDatabase.STORAGE_OBJECT_STORE]);
    } catch (error) {
      this.logService.error(`[IndexedDB Storage ${this.name}] connect() error: ${toErrorMessage(error)}`);
      throw error;
    }
  }
  async getItems() {
    const db = await this.whenConnected;
    function isValid2(value2) {
      return typeof value2 === "string";
    }
    return db.getKeyValues(_IndexedDBStorageDatabase.STORAGE_OBJECT_STORE, isValid2);
  }
  async getValue(key3) {
    const db = await this.whenConnected;
    const value2 = await db.runInTransaction(_IndexedDBStorageDatabase.STORAGE_OBJECT_STORE, "readonly", (objectStore) => objectStore.get(key3));
    return typeof value2 === "string" ? value2 : void 0;
  }
  async updateItems(request2) {
    let didUpdate = false;
    this.pendingUpdate = this.doUpdateItems(request2);
    try {
      didUpdate = await this.pendingUpdate;
    } finally {
      this.pendingUpdate = void 0;
    }
    if (this.broadcastChannel && didUpdate) {
      const event = {
        changed: request2.insert,
        deleted: request2.delete
      };
      this.broadcastChannel.postData(event);
    }
  }
  async compareAndSwap(key3, expectedValue, newValue) {
    const db = await this.whenConnected;
    const result = await db.compareAndSwap(
      _IndexedDBStorageDatabase.STORAGE_OBJECT_STORE,
      key3,
      expectedValue,
      newValue,
      (value2) => typeof value2 === "string"
    );
    if (result.swapped) {
      const event = { changed: /* @__PURE__ */ new Map([[key3, newValue]]) };
      this._onDidChangeItemsExternal.fire(event);
      this.broadcastChannel?.postData(event);
    }
    return result;
  }
  async doUpdateItems(request2) {
    const toInsert = request2.insert;
    const toDelete = request2.delete;
    if (!toInsert && !toDelete || toInsert?.size === 0 && toDelete?.size === 0) {
      return false;
    }
    const db = await this.whenConnected;
    await db.runInTransaction(_IndexedDBStorageDatabase.STORAGE_OBJECT_STORE, "readwrite", (objectStore) => {
      const requests = [];
      if (toInsert) {
        for (const [key3, value2] of toInsert) {
          requests.push(objectStore.put(value2, key3));
        }
      }
      if (toDelete) {
        for (const key3 of toDelete) {
          requests.push(objectStore.delete(key3));
        }
      }
      return requests;
    });
    return true;
  }
  async optimize() {
  }
  async close() {
    const db = await this.whenConnected;
    await this.pendingUpdate;
    return db.close();
  }
  async clear() {
    const db = await this.whenConnected;
    await db.runInTransaction(_IndexedDBStorageDatabase.STORAGE_OBJECT_STORE, "readwrite", (objectStore) => objectStore.clear());
  }
};
export { BrowserStorageService, InMemoryIndexedDBStorageDatabase, IndexedDBStorageDatabase };
