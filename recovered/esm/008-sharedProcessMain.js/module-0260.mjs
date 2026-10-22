// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/node/userDataAutoSyncService.ts
import { UserDataAutoSyncService } from "./module-0259.mjs";
import { Event } from "./module-0018.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0045.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncLogService, IUserDataSyncService, IUserDataSyncStoreManagementService, IUserDataSyncStoreService } from "./module-0157.mjs";
import { INativeHostService } from "./module-0066.mjs";
import { IUserDataSyncAccountService } from "./module-0158.mjs";
import { ITelemetryService } from "./module-0085.mjs";
import { IUserDataSyncMachinesService } from "./module-0165.mjs";
import { IStorageService } from "./module-0096.mjs";
import { IMeteredConnectionService } from "./module-0258.mjs";


// src/vs/platform/userDataSync/node/userDataAutoSyncService.ts
var UserDataAutoSyncService2 = class extends UserDataAutoSyncService {
  constructor(productService, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncEnablementService, userDataSyncService, nativeHostService, logService, authTokenService, telemetryService, userDataSyncMachinesService, storageService, meteredConnectionService) {
    super(productService, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncEnablementService, userDataSyncService, logService, authTokenService, telemetryService, userDataSyncMachinesService, storageService, meteredConnectionService);
    this._register(Event.debounce(Event.any(
      Event.map(nativeHostService.onDidFocusMainWindow, () => "windowFocus"),
      Event.map(nativeHostService.onDidOpenMainWindow, () => "windowOpen")
    ), (last, source) => last ? [...last, source] : [source], 1e3)((sources) => this.triggerSync(sources, { skipIfSyncedRecently: true })));
  }
};

UserDataAutoSyncService2 = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IUserDataSyncStoreManagementService),
  __decorateParam(2, IUserDataSyncStoreService),
  __decorateParam(3, IUserDataSyncEnablementService),
  __decorateParam(4, IUserDataSyncService),
  __decorateParam(5, INativeHostService),
  __decorateParam(6, IUserDataSyncLogService),
  __decorateParam(7, IUserDataSyncAccountService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, IUserDataSyncMachinesService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, IMeteredConnectionService)
], UserDataAutoSyncService2);
export { UserDataAutoSyncService2 };
