// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataProfile/node/userDataProfileStorageService.ts
import { RemoteUserDataProfileStorageService } from "./module-0169.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMainProcessService } from "./module-0067.mjs";
import { IUserDataProfilesService } from "./module-0095.mjs";
import { IStorageService } from "./module-0096.mjs";
import { ILogService } from "./module-0044.mjs";


// src/vs/platform/userDataProfile/node/userDataProfileStorageService.ts
var SharedProcessUserDataProfileStorageService = class extends RemoteUserDataProfileStorageService {
  constructor(mainProcessService, userDataProfilesService, storageService, logService) {
    super(true, mainProcessService, userDataProfilesService, storageService, logService);
  }
};

SharedProcessUserDataProfileStorageService = __decorateClass([
  __decorateParam(0, IMainProcessService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, ILogService)
], SharedProcessUserDataProfileStorageService);
export { SharedProcessUserDataProfileStorageService };
