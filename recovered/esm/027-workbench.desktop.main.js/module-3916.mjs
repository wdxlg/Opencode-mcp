// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/userDataProfile/electron-browser/userDataProfileStorageService.ts
import { IUserDataProfileStorageService, RemoteUserDataProfileStorageService } from "./module-1715.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMainProcessService } from "./module-3728.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/platform/userDataProfile/electron-browser/userDataProfileStorageService.ts
var NativeUserDataProfileStorageService = class extends RemoteUserDataProfileStorageService {
  constructor(mainProcessService, userDataProfilesService, storageService, logService) {
    super(false, mainProcessService, userDataProfilesService, storageService, logService);
  }
};

NativeUserDataProfileStorageService = __decorateClass([
  __decorateParam(0, IMainProcessService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, ILogService)
], NativeUserDataProfileStorageService);

registerSingleton(IUserDataProfileStorageService, NativeUserDataProfileStorageService, 1 /* Delayed */);
export { NativeUserDataProfileStorageService };
