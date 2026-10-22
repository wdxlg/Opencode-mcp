// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataSync/browser/userDataSyncEnablementService.ts
import { UserDataSyncEnablementService } from "./module-3897.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IUserDataSyncEnablementService } from "./module-1696.mjs";


// src/vs/workbench/services/userDataSync/browser/userDataSyncEnablementService.ts
var UserDataSyncEnablementService2 = class extends UserDataSyncEnablementService {
  get workbenchEnvironmentService() {
    return this.environmentService;
  }
  getResourceSyncStateVersion(resource) {
    return resource === "extensions" /* Extensions */ ? this.workbenchEnvironmentService.options?.settingsSyncOptions?.extensionsSyncStateVersion : void 0;
  }
};

registerSingleton(IUserDataSyncEnablementService, UserDataSyncEnablementService2, 1 /* Delayed */);
export { UserDataSyncEnablementService2 };
