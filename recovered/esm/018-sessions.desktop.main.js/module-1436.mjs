// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadSecretState.ts
import { Disposable } from "./module-0012.mjs";
import { SequencerByKey } from "./module-0036.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { ISecretStorageService } from "./module-0949.mjs";
import { ILogService } from "./module-0095.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0916.mjs";


// src/vs/workbench/api/browser/mainThreadSecretState.ts
var MainThreadSecretState = class extends Disposable {
  constructor(extHostContext, secretStorageService, logService, environmentService) {
    super();
    this.secretStorageService = secretStorageService;
    this.logService = logService;
    this._sequencer = new SequencerByKey();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostSecretState);
    this._register(this.secretStorageService.onDidChangeSecret((e4) => {
      const parsedKey = this.parseKey(e4);
      if (parsedKey) {
        this._proxy.$onDidChangePassword(parsedKey);
      }
    }));
  }
  $getPassword(extensionId, key3) {
    this.logService.trace(`[mainThreadSecretState] Getting password for ${extensionId} extension: `, key3);
    return this._sequencer.queue(extensionId, () => this.doGetPassword(extensionId, key3));
  }
  async doGetPassword(extensionId, key3) {
    const fullKey = this.getKey(extensionId, key3);
    const password = await this.secretStorageService.get(fullKey);
    this.logService.trace(`[mainThreadSecretState] ${password ? "P" : "No p"}assword found for: `, extensionId, key3);
    return password;
  }
  $setPassword(extensionId, key3, value2) {
    this.logService.trace(`[mainThreadSecretState] Setting password for ${extensionId} extension: `, key3);
    return this._sequencer.queue(extensionId, () => this.doSetPassword(extensionId, key3, value2));
  }
  async doSetPassword(extensionId, key3, value2) {
    const fullKey = this.getKey(extensionId, key3);
    await this.secretStorageService.set(fullKey, value2);
    this.logService.trace("[mainThreadSecretState] Password set for: ", extensionId, key3);
  }
  $deletePassword(extensionId, key3) {
    this.logService.trace(`[mainThreadSecretState] Deleting password for ${extensionId} extension: `, key3);
    return this._sequencer.queue(extensionId, () => this.doDeletePassword(extensionId, key3));
  }
  async doDeletePassword(extensionId, key3) {
    const fullKey = this.getKey(extensionId, key3);
    await this.secretStorageService.delete(fullKey);
    this.logService.trace("[mainThreadSecretState] Password deleted for: ", extensionId, key3);
  }
  $getKeys(extensionId) {
    this.logService.trace(`[mainThreadSecretState] Getting keys for ${extensionId} extension: `);
    return this._sequencer.queue(extensionId, () => this.doGetKeys(extensionId));
  }
  async doGetKeys(extensionId) {
    if (!this.secretStorageService.keys) {
      throw new Error("Secret storage service does not support keys() method");
    }
    const allKeys = await this.secretStorageService.keys();
    const keys = allKeys.map((key3) => this.parseKey(key3)).filter((parsedKey) => parsedKey !== void 0 && parsedKey.extensionId === extensionId).map(({ key: key3 }) => key3);
    this.logService.trace(`[mainThreadSecretState] Got ${keys.length}key(s) for: `, extensionId);
    return keys;
  }
  getKey(extensionId, key3) {
    return JSON.stringify({ extensionId, key: key3 });
  }
  parseKey(key3) {
    try {
      return JSON.parse(key3);
    } catch {
      return void 0;
    }
  }
};

MainThreadSecretState = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadSecretState),
  __decorateParam(1, ISecretStorageService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IBrowserWorkbenchEnvironmentService)
], MainThreadSecretState);
export { MainThreadSecretState };
