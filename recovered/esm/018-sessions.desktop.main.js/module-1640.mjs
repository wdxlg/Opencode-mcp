// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/userDataSyncAccount.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataSyncLogService, IUserDataSyncStoreService } from "./module-1639.mjs";


// src/vs/platform/userDataSync/common/userDataSyncAccount.ts
var IUserDataSyncAccountService = createDecorator("IUserDataSyncAccountService");

var UserDataSyncAccountService = class extends Disposable {
  constructor(userDataSyncStoreService, logService) {
    super();
    this.userDataSyncStoreService = userDataSyncStoreService;
    this.logService = logService;
    this._onDidChangeAccount = this._register(new Emitter());
    this.onDidChangeAccount = this._onDidChangeAccount.event;
    this._onTokenFailed = this._register(new Emitter());
    this.onTokenFailed = this._onTokenFailed.event;
    this.wasTokenFailed = false;
    this._register(userDataSyncStoreService.onTokenFailed((code) => {
      this.logService.info("Settings Sync auth token failed", this.account?.authenticationProviderId, this.wasTokenFailed, code);
      this.updateAccount(void 0);
      if (code === "Forbidden" /* Forbidden */) {
        this._onTokenFailed.fire(
          true
          /*bail out immediately*/
        );
      } else {
        this._onTokenFailed.fire(
          this.wasTokenFailed
          /* bail out if token failed before */
        );
      }
      this.wasTokenFailed = true;
    }));
    this._register(userDataSyncStoreService.onTokenSucceed(() => this.wasTokenFailed = false));
  }
  get account() {
    return this._account;
  }
  async updateAccount(account) {
    if (account && this._account ? account.token !== this._account.token || account.authenticationProviderId !== this._account.authenticationProviderId : account !== this._account) {
      this._account = account;
      if (this._account) {
        this.userDataSyncStoreService.setAuthToken(this._account.token, this._account.authenticationProviderId);
      }
      this._onDidChangeAccount.fire(account);
    }
  }
};

UserDataSyncAccountService = __decorateClass([
  __decorateParam(0, IUserDataSyncStoreService),
  __decorateParam(1, IUserDataSyncLogService)
], UserDataSyncAccountService);
export { IUserDataSyncAccountService, UserDataSyncAccountService };
