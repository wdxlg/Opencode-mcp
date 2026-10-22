// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostStorage.ts
import { Emitter } from "./module-0019.mjs";
import { MainContext } from "./module-0025.mjs";
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/api/common/extHostStorage.ts
var ExtHostStorage = class {
  constructor(mainContext, _logService) {
    this._logService = _logService;
    this._onDidChangeStorage = new Emitter();
    this.onDidChangeStorage = this._onDidChangeStorage.event;
    this._proxy = mainContext.getProxy(MainContext.MainThreadStorage);
  }
  registerExtensionStorageKeysToSync(extension, keys) {
    this._proxy.$registerExtensionStorageKeysToSync(extension, keys);
  }
  async initializeExtensionStorage(shared, key, defaultValue) {
    const value = await this._proxy.$initializeExtensionStorage(shared, key);
    let parsedValue;
    if (value) {
      parsedValue = this.safeParseValue(shared, key, value);
    }
    return parsedValue || defaultValue;
  }
  setValue(shared, key, value) {
    return this._proxy.$setValue(shared, key, value);
  }
  $acceptValue(shared, key, value) {
    const parsedValue = this.safeParseValue(shared, key, value);
    if (parsedValue) {
      this._onDidChangeStorage.fire({ shared, key, value: parsedValue });
    }
  }
  safeParseValue(shared, key, value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      this._logService.error(`[extHostStorage] unexpected error parsing storage contents (extensionId: ${key}, global: ${shared}): ${error}`);
    }
    return void 0;
  }
};

var IExtHostStorage = createDecorator("IExtHostStorage");
export { ExtHostStorage, IExtHostStorage };
