// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/state/node/stateService.ts
import { Disposable } from "./module-0011.mjs";
import { ThrottledDelayer } from "./module-0028.mjs";
import { isUndefined, isUndefinedOrNull } from "./module-0009.mjs";
import { VSBuffer } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEnvironmentService } from "./module-0056.mjs";
import { ILogService } from "./module-0049.mjs";
import { IFileService } from "./module-0044.mjs";


// src/vs/platform/state/node/stateService.ts
var FileStorage = class extends Disposable {
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

var StateReadonlyService = class extends Disposable {
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

var StateService = class extends StateReadonlyService {
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
export { FileStorage, StateReadonlyService, StateService };
