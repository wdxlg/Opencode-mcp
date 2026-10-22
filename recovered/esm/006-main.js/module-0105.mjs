// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/storage/electron-main/storageMain.ts
import { __esm } from "./module-0000.mjs";
import { init_arrays, top } from "./module-0013.mjs";
import { DeferredPromise, init_async } from "./module-0034.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { init_path, join4 } from "./module-0008.mjs";
import { StopWatch, init_stopwatch } from "./module-0020.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { Promises2, init_pfs } from "./module-0036.mjs";
import { InMemoryStorageDatabase, MigratingStorage, Storage, init_storage } from "./module-0070.mjs";
import { SQLiteStorageDatabase, init_storage3 } from "./module-0103.mjs";
import { init_log } from "./module-0075.mjs";
import { IS_NEW_KEY, init_storage2 } from "./module-0079.mjs";
import { currentSessionDateStorageKey, firstSessionDateStorageKey, init_telemetry, lastSessionDateStorageKey } from "./module-0104.mjs";
import { init_workspace, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from "./module-0076.mjs";
import { Schemas, init_network } from "./module-0031.mjs";


// src/vs/platform/storage/electron-main/storageMain.ts
import * as fs6 from "fs";

var BaseStorageMain, BaseProfileAwareStorageMain, ProfileStorageMain, ApplicationStorageMain, ApplicationSharedStorageMain, WorkspaceStorageMain, InMemoryStorageMain;

var init_storageMain = __esm({
  "src/vs/platform/storage/electron-main/storageMain.ts"() {
    init_arrays();
    init_async();
    init_event();
    init_lifecycle();
    init_path();
    init_stopwatch();
    init_uri();
    init_pfs();
    init_storage();
    init_storage3();
    init_log();
    init_storage2();
    init_telemetry();
    init_workspace();
    init_network();
    BaseStorageMain = class _BaseStorageMain extends Disposable {
      constructor(logService, fileService) {
        super();
        this.logService = logService;
        this.fileService = fileService;
        this._onDidChangeStorage = this._register(new Emitter());
        this.onDidChangeStorage = this._onDidChangeStorage.event;
        this._onDidCloseStorage = this._register(new Emitter());
        this.onDidCloseStorage = this._onDidCloseStorage.event;
        this._storage = this._register(new Storage(new InMemoryStorageDatabase(), { hint: 1 /* STORAGE_IN_MEMORY */ }));
        this.initializePromise = void 0;
        this.whenInitPromise = new DeferredPromise();
        this.whenInit = this.whenInitPromise.p;
        this.state = 0 /* None */;
      }
      static {
        this.LOG_SLOW_CLOSE_THRESHOLD = 2e3;
      }
      // storage is in-memory until initialized
      get storage() {
        return this._storage;
      }
      isInMemory() {
        return this._storage.isInMemory();
      }
      init() {
        if (!this.initializePromise) {
          this.initializePromise = (async () => {
            if (this.state !== 0 /* None */) {
              return;
            }
            try {
              const storage = this._register(await this.doCreate());
              this._storage.dispose();
              this._storage = storage;
              this._register(storage.onDidChangeStorage((e) => this._onDidChangeStorage.fire(e)));
              await this.doInit(storage);
              const isNewStorage = storage.getBoolean(IS_NEW_KEY);
              if (isNewStorage === void 0) {
                storage.set(IS_NEW_KEY, true);
              } else if (isNewStorage) {
                storage.set(IS_NEW_KEY, false);
              }
            } catch (error) {
              this.logService.error(`[storage main] initialize(): Unable to init storage due to ${error}`);
            } finally {
              this.state = 1 /* Initialized */;
              this.whenInitPromise.complete();
            }
          })();
        }
        return this.initializePromise;
      }
      createLoggingOptions() {
        return {
          logTrace: this.logService.getLevel() === 1 /* Trace */ ? (msg) => this.logService.trace(msg) : void 0,
          logError: (error) => this.logService.error(error)
        };
      }
      doInit(storage) {
        return storage.init();
      }
      get items() {
        return this._storage.items;
      }
      get(key, fallbackValue) {
        return this._storage.get(key, fallbackValue);
      }
      set(key, value) {
        return this._storage.set(key, value);
      }
      delete(key) {
        return this._storage.delete(key);
      }
      optimize() {
        return this._storage.optimize();
      }
      async close() {
        const watch3 = new StopWatch(false);
        await this.doClose();
        watch3.stop();
        if (watch3.elapsed() > _BaseStorageMain.LOG_SLOW_CLOSE_THRESHOLD) {
          await this.logSlowClose(watch3);
        }
        this._onDidCloseStorage.fire();
      }
      async logSlowClose(watch3) {
        if (!this.path) {
          return;
        }
        try {
          const largestEntries = top(Array.from(this._storage.items.entries()).map(([key, value]) => ({ key, length: value.length })), (entryA, entryB) => entryB.length - entryA.length, 5).map((entry) => `${entry.key}:${entry.length}`).join(", ");
          const dbSize = (await this.fileService.stat(URI.file(this.path))).size;
          this.logService.warn(`[storage main] detected slow close() operation: Time: ${watch3.elapsed()}ms, DB size: ${dbSize}b, Large Keys: ${largestEntries}`);
        } catch (error) {
          this.logService.error("[storage main] figuring out stats for slow DB on close() resulted in an error", error);
        }
      }
      async doClose() {
        if (this.initializePromise) {
          await this.initializePromise;
        }
        this.state = 2 /* Closed */;
        await this._storage.close();
      }
    };
    BaseProfileAwareStorageMain = class _BaseProfileAwareStorageMain extends BaseStorageMain {
      constructor(profile, options, logService, fileService) {
        super(logService, fileService);
        this.profile = profile;
        this.options = options;
      }
      static {
        this.STORAGE_NAME = "state.vscdb";
      }
      get path() {
        if (!this.options.useInMemoryStorage) {
          return join4(this.profile.globalStorageHome.with({ scheme: Schemas.file }).fsPath, _BaseProfileAwareStorageMain.STORAGE_NAME);
        }
        return void 0;
      }
      async doCreate() {
        return new Storage(new SQLiteStorageDatabase(this.path ?? SQLiteStorageDatabase.IN_MEMORY_PATH, {
          logging: this.createLoggingOptions()
        }), !this.path ? { hint: 1 /* STORAGE_IN_MEMORY */ } : void 0);
      }
    };
    ProfileStorageMain = class extends BaseProfileAwareStorageMain {
    };
    ApplicationStorageMain = class extends BaseProfileAwareStorageMain {
      constructor(options, userDataProfileService, logService, fileService) {
        super(userDataProfileService.defaultProfile, options, logService, fileService);
      }
      async doInit(storage) {
        await super.doInit(storage);
        this.updateTelemetryState(storage);
      }
      updateTelemetryState(storage) {
        const firstSessionDate = storage.get(firstSessionDateStorageKey, void 0);
        if (firstSessionDate === void 0) {
          storage.set(firstSessionDateStorageKey, (/* @__PURE__ */ new Date()).toUTCString());
        }
        const lastSessionDate = storage.get(currentSessionDateStorageKey, void 0);
        const currentSessionDate = (/* @__PURE__ */ new Date()).toUTCString();
        storage.set(lastSessionDateStorageKey, typeof lastSessionDate === "undefined" ? null : lastSessionDate);
        storage.set(currentSessionDateStorageKey, currentSessionDate);
      }
    };
    ApplicationSharedStorageMain = class _ApplicationSharedStorageMain extends BaseStorageMain {
      constructor(options, storageFolderPath, applicationStorage, logService, fileService) {
        super(logService, fileService);
        this.options = options;
        this.storageFolderPath = storageFolderPath;
        this.applicationStorage = applicationStorage;
      }
      static {
        this.STORAGE_NAME = "state.vscdb";
      }
      get path() {
        if (!this.options.useInMemoryStorage) {
          return join4(this.storageFolderPath, _ApplicationSharedStorageMain.STORAGE_NAME);
        }
        return void 0;
      }
      async doCreate() {
        const { storageFilePath, wasCreated } = await this.prepareStorageFolder();
        this.logService.info(`[shared storage] Creating shared storage database at '${storageFilePath}' (wasCreated: ${wasCreated})`);
        const database = new SQLiteStorageDatabase(storageFilePath, {
          logging: this.createLoggingOptions()
        });
        this.logService.info(`[shared storage] Initializing fallback application storage (path: ${this.applicationStorage.path ?? "in-memory"})`);
        await this.applicationStorage.init();
        this.logService.info(`[shared storage] Fallback application storage initialized with ${this.applicationStorage.items.size} items`);
        const migratingStorage = this._register(new MigratingStorage(database, { hint: wasCreated ? 0 /* STORAGE_DOES_NOT_EXIST */ : void 0 }));
        migratingStorage.setFallbackStorage(this.applicationStorage.storage, false);
        return migratingStorage;
      }
      get applicationStorageItems() {
        return this.applicationStorage.items;
      }
      async prepareStorageFolder() {
        if (this.options.useInMemoryStorage) {
          return { storageFilePath: SQLiteStorageDatabase.IN_MEMORY_PATH, wasCreated: true };
        }
        const storageDatabasePath = join4(this.storageFolderPath, _ApplicationSharedStorageMain.STORAGE_NAME);
        const storageExists = await Promises2.exists(this.storageFolderPath);
        if (storageExists) {
          return { storageFilePath: storageDatabasePath, wasCreated: false };
        }
        await fs6.promises.mkdir(this.storageFolderPath, { recursive: true });
        return { storageFilePath: storageDatabasePath, wasCreated: true };
      }
    };
    WorkspaceStorageMain = class _WorkspaceStorageMain extends BaseStorageMain {
      constructor(workspace, options, logService, environmentService, fileService) {
        super(logService, fileService);
        this.workspace = workspace;
        this.options = options;
        this.environmentService = environmentService;
      }
      static {
        this.WORKSPACE_STORAGE_NAME = "state.vscdb";
      }
      static {
        this.WORKSPACE_META_NAME = "workspace.json";
      }
      get path() {
        if (!this.options.useInMemoryStorage) {
          return join4(this.environmentService.workspaceStorageHome.with({ scheme: Schemas.file }).fsPath, this.workspace.id, _WorkspaceStorageMain.WORKSPACE_STORAGE_NAME);
        }
        return void 0;
      }
      async doCreate() {
        const { storageFilePath, wasCreated } = await this.prepareWorkspaceStorageFolder();
        return new Storage(new SQLiteStorageDatabase(storageFilePath, {
          logging: this.createLoggingOptions()
        }), { hint: this.options.useInMemoryStorage ? 1 /* STORAGE_IN_MEMORY */ : wasCreated ? 0 /* STORAGE_DOES_NOT_EXIST */ : void 0 });
      }
      async prepareWorkspaceStorageFolder() {
        if (this.options.useInMemoryStorage) {
          return { storageFilePath: SQLiteStorageDatabase.IN_MEMORY_PATH, wasCreated: true };
        }
        const workspaceStorageFolderPath = join4(this.environmentService.workspaceStorageHome.with({ scheme: Schemas.file }).fsPath, this.workspace.id);
        const workspaceStorageDatabasePath = join4(workspaceStorageFolderPath, _WorkspaceStorageMain.WORKSPACE_STORAGE_NAME);
        const storageExists = await Promises2.exists(workspaceStorageFolderPath);
        if (storageExists) {
          return { storageFilePath: workspaceStorageDatabasePath, wasCreated: false };
        }
        await fs6.promises.mkdir(workspaceStorageFolderPath, { recursive: true });
        this.ensureWorkspaceStorageFolderMeta(workspaceStorageFolderPath);
        return { storageFilePath: workspaceStorageDatabasePath, wasCreated: true };
      }
      async ensureWorkspaceStorageFolderMeta(workspaceStorageFolderPath) {
        let meta = void 0;
        if (isSingleFolderWorkspaceIdentifier(this.workspace)) {
          meta = { folder: this.workspace.uri.toString() };
        } else if (isWorkspaceIdentifier(this.workspace)) {
          meta = { workspace: this.workspace.configPath.toString() };
        }
        if (meta) {
          try {
            const workspaceStorageMetaPath = join4(workspaceStorageFolderPath, _WorkspaceStorageMain.WORKSPACE_META_NAME);
            const storageExists = await Promises2.exists(workspaceStorageMetaPath);
            if (!storageExists) {
              await Promises2.writeFile(workspaceStorageMetaPath, JSON.stringify(meta, void 0, 2));
            }
          } catch (error) {
            this.logService.error(`[storage main] ensureWorkspaceStorageFolderMeta(): Unable to create workspace storage metadata due to ${error}`);
          }
        }
      }
    };
    InMemoryStorageMain = class extends BaseStorageMain {
      get path() {
        return void 0;
      }
      async doCreate() {
        return new Storage(new InMemoryStorageDatabase(), { hint: 1 /* STORAGE_IN_MEMORY */ });
      }
    };
  }
});
export { fs6, BaseStorageMain, BaseProfileAwareStorageMain, ProfileStorageMain, ApplicationStorageMain, ApplicationSharedStorageMain, WorkspaceStorageMain, InMemoryStorageMain, init_storageMain };
