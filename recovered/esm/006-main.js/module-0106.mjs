// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/state/node/stateService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { ThrottledDelayer, init_async } from "./module-0034.mjs";
import { VSBuffer, init_buffer } from "./module-0050.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { init_types, isUndefined, isUndefinedOrNull } from "./module-0016.mjs";
import { IEnvironmentService, init_environment } from "./module-0071.mjs";
import { IFileService, init_files } from "./module-0072.mjs";
import { ILogService, init_log } from "./module-0075.mjs";


// src/vs/platform/state/node/stateService.ts
var FileStorage, StateReadonlyService, StateService;

var init_stateService = __esm({
  "src/vs/platform/state/node/stateService.ts"() {
    init_async();
    init_buffer();
    init_lifecycle();
    init_types();
    init_environment();
    init_files();
    init_log();
    FileStorage = class extends Disposable {
      constructor(storagePath, saveStrategy, logService, fileService) {
        super();
        this.storagePath = storagePath;
        this.logService = logService;
        this.fileService = fileService;
        this.storage = /* @__PURE__ */ Object.create(null);
        this.lastSavedStorageContents = "";
        this.initializing = void 0;
        this.closing = void 0;
        this.flushDelayer = this._register(new ThrottledDelayer(
          saveStrategy === 0 /* IMMEDIATE */ ? 0 : 100
          /* buffer saves over a short time */
        ));
      }
      init() {
        if (!this.initializing) {
          this.initializing = this.doInit();
        }
        return this.initializing;
      }
      async doInit() {
        try {
          this.lastSavedStorageContents = (await this.fileService.readFile(this.storagePath)).value.toString();
          this.storage = JSON.parse(this.lastSavedStorageContents);
        } catch (error) {
          if (error.fileOperationResult !== 1 /* FILE_NOT_FOUND */) {
            this.logService.error(error);
          }
        }
      }
      getItem(key, defaultValue) {
        const res = this.storage[key];
        if (isUndefinedOrNull(res)) {
          return defaultValue;
        }
        return res;
      }
      setItem(key, data) {
        this.setItems([{ key, data }]);
      }
      setItems(items) {
        let save = false;
        for (const { key, data } of items) {
          if (this.storage[key] === data) {
            continue;
          }
          if (isUndefinedOrNull(data)) {
            if (!isUndefined(this.storage[key])) {
              this.storage[key] = void 0;
              save = true;
            }
          } else {
            this.storage[key] = data;
            save = true;
          }
        }
        if (save) {
          this.save();
        }
      }
      removeItem(key) {
        if (!isUndefined(this.storage[key])) {
          this.storage[key] = void 0;
          this.save();
        }
      }
      async save() {
        if (this.closing) {
          return;
        }
        return this.flushDelayer.trigger(() => this.doSave());
      }
      async doSave() {
        if (!this.initializing) {
          return;
        }
        await this.initializing;
        const serializedDatabase = JSON.stringify(this.storage, null, 4);
        if (serializedDatabase === this.lastSavedStorageContents) {
          return;
        }
        try {
          await this.fileService.writeFile(this.storagePath, VSBuffer.fromString(serializedDatabase), { atomic: { postfix: ".vsctmp" } });
          this.lastSavedStorageContents = serializedDatabase;
        } catch (error) {
          this.logService.error(error);
        }
      }
      async close() {
        if (!this.closing) {
          this.closing = this.flushDelayer.trigger(
            () => this.doSave(),
            0
            /* as soon as possible */
          );
        }
        return this.closing;
      }
    };
    StateReadonlyService = class extends Disposable {
      constructor(saveStrategy, environmentService, logService, fileService) {
        super();
        this.fileStorage = this._register(new FileStorage(environmentService.stateResource, saveStrategy, logService, fileService));
      }
      async init() {
        await this.fileStorage.init();
      }
      getItem(key, defaultValue) {
        return this.fileStorage.getItem(key, defaultValue);
      }
    };
    StateReadonlyService = __decorateClass([
      __decorateParam(1, IEnvironmentService),
      __decorateParam(2, ILogService),
      __decorateParam(3, IFileService)
    ], StateReadonlyService);
    StateService = class extends StateReadonlyService {
      setItem(key, data) {
        this.fileStorage.setItem(key, data);
      }
      setItems(items) {
        this.fileStorage.setItems(items);
      }
      removeItem(key) {
        this.fileStorage.removeItem(key);
      }
      close() {
        return this.fileStorage.close();
      }
    };
  }
});
export { FileStorage, StateReadonlyService, StateService, init_stateService };
