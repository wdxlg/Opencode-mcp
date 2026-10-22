// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/userDataSyncIpc.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { AbstractUserDataSyncStoreManagementService } from "./module-1745.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0873.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/platform/userDataSync/common/userDataSyncIpc.ts
var UserDataSyncAccountServiceChannelClient = class extends Disposable {
  constructor(channel) {
    super();
    this.channel = channel;
    this._onDidChangeAccount = this._register(new Emitter());
    this.onDidChangeAccount = this._onDidChangeAccount.event;
    this.channel.call("_getInitialData").then((account) => {
      this._account = account;
      this._register(this.channel.listen("onDidChangeAccount")((account2) => {
        this._account = account2;
        this._onDidChangeAccount.fire(account2);
      }));
    });
  }
  get account() {
    return this._account;
  }
  get onTokenFailed() {
    return this.channel.listen("onTokenFailed");
  }
  updateAccount(account) {
    return this.channel.call("updateAccount", account);
  }
};

var UserDataSyncStoreManagementServiceChannelClient = class extends AbstractUserDataSyncStoreManagementService {
  constructor(channel, productService, configurationService, storageService) {
    super(productService, configurationService, storageService);
    this.channel = channel;
    this._register(this.channel.listen("onDidChangeUserDataSyncStore")(() => this.updateUserDataSyncStore()));
  }
  async switch(type) {
    return this.channel.call("switch", [type]);
  }
  async getPreviousUserDataSyncStore() {
    const userDataSyncStore = await this.channel.call("getPreviousUserDataSyncStore");
    return this.revive(userDataSyncStore);
  }
  revive(userDataSyncStore) {
    return {
      url: URI.revive(userDataSyncStore.url),
      type: userDataSyncStore.type,
      defaultUrl: URI.revive(userDataSyncStore.defaultUrl),
      insidersUrl: URI.revive(userDataSyncStore.insidersUrl),
      stableUrl: URI.revive(userDataSyncStore.stableUrl),
      canSwitch: userDataSyncStore.canSwitch,
      authenticationProviders: userDataSyncStore.authenticationProviders
    };
  }
};

UserDataSyncStoreManagementServiceChannelClient = __decorateClass([
  __decorateParam(1, IProductService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IStorageService)
], UserDataSyncStoreManagementServiceChannelClient);
export { UserDataSyncAccountServiceChannelClient, UserDataSyncStoreManagementServiceChannelClient };
