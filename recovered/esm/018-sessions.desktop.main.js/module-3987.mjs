// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/userDataSync/electron-browser/userDataSyncUtilChannel.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataSyncUtilService } from "./module-1639.mjs";
import { ISharedProcessService } from "./module-3826.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/userDataSync/electron-browser/userDataSyncUtilChannel.contribution.ts
var UserDataSyncUtilChannelContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.userDataSyncServices";
  }
  constructor(userDataSyncUtilService, sharedProcessService) {
    super();
    sharedProcessService.registerChannel("userDataSyncUtil", ProxyChannel.fromService(userDataSyncUtilService, this._store));
  }
};

UserDataSyncUtilChannelContribution = __decorateClass([
  __decorateParam(0, IUserDataSyncUtilService),
  __decorateParam(1, ISharedProcessService)
], UserDataSyncUtilChannelContribution);

registerWorkbenchContribution2(UserDataSyncUtilChannelContribution.ID, UserDataSyncUtilChannelContribution, WorkbenchPhase.BlockStartup);
export { UserDataSyncUtilChannelContribution };
