// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/userDataSyncIpc.ts
import { AbstractUserDataSyncStoreManagementService } from "./module-0162.mjs";
import { URI } from "./module-0024.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0045.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { IStorageService } from "./module-0096.mjs";


// src/vs/platform/userDataSync/common/userDataSyncIpc.ts
var UserDataSyncAccountServiceChannel = class {
  constructor(service) {
    this.service = service;
  }
  listen(_, event) {
    switch (event) {
      case "onDidChangeAccount":
        return this.service.onDidChangeAccount;
      case "onTokenFailed":
        return this.service.onTokenFailed;
    }
    throw new Error(`[UserDataSyncAccountServiceChannel] Event not found: ${event}`);
  }
  call(context, command, args) {
    switch (command) {
      case "_getInitialData":
        return Promise.resolve(this.service.account);
      case "updateAccount":
        return this.service.updateAccount(args);
    }
    throw new Error("Invalid call");
  }
};

var UserDataSyncStoreManagementServiceChannel = class {
  constructor(service) {
    this.service = service;
  }
  listen(_, event) {
    switch (event) {
      case "onDidChangeUserDataSyncStore":
        return this.service.onDidChangeUserDataSyncStore;
    }
    throw new Error(`[UserDataSyncStoreManagementServiceChannel] Event not found: ${event}`);
  }
  call(context, command, args) {
    switch (command) {
      case "switch":
        return this.service.switch(args[0]);
      case "getPreviousUserDataSyncStore":
        return this.service.getPreviousUserDataSyncStore();
    }
    throw new Error("Invalid call");
  }
};

var UserDataSyncStoreManagementServiceChannelClient = class extends AbstractUserDataSyncStoreManagementService {
  constructor(channel, productService, configurationService, storageService) {
    super(productService, configurationService, storageService);
    this.channel = channel;
    this._register(this.channel.listen("onDidChangeUserDataSyncStore")(() => this.updateUserDataSyncStore()));
  }
  async switch(type2) {
    return this.channel.call("switch", [type2]);
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
export { UserDataSyncAccountServiceChannel, UserDataSyncStoreManagementServiceChannel, UserDataSyncStoreManagementServiceChannelClient };
