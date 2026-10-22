// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostSecretState.ts
import { Emitter } from "./module-0019.mjs";
import { MainContext } from "./module-0025.mjs";
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/api/common/extHostSecretState.ts
var ExtHostSecretState = class {
  constructor(mainContext) {
    this._onDidChangePassword = new Emitter();
    this.onDidChangePassword = this._onDidChangePassword.event;
    this._proxy = mainContext.getProxy(MainContext.MainThreadSecretState);
  }
  async $onDidChangePassword(e) {
    this._onDidChangePassword.fire(e);
  }
  get(extensionId, key) {
    return this._proxy.$getPassword(extensionId, key);
  }
  store(extensionId, key, value) {
    return this._proxy.$setPassword(extensionId, key, value);
  }
  delete(extensionId, key) {
    return this._proxy.$deletePassword(extensionId, key);
  }
  keys(extensionId) {
    return this._proxy.$getKeys(extensionId);
  }
};

var IExtHostSecretState = createDecorator("IExtHostSecretState");
export { ExtHostSecretState, IExtHostSecretState };
