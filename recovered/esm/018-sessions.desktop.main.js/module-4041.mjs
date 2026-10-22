// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/automations/electron-browser/automationStorageService.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMainProcessService } from "./module-3825.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IAutomationStorageService } from "./module-3680.mjs";


// src/vs/sessions/contrib/automations/electron-browser/automationStorageService.ts
var baseRequest = {
  profile: void 0,
  workspace: void 0
};

var NativeAutomationStorageService = class {
  constructor(mainProcessService) {
    this.channel = mainProcessService.getChannel("storage");
  }
  read(key3) {
    const request2 = {
      ...baseRequest,
      key: key3
    };
    return this.channel.call("getValue", request2);
  }
  compareAndSwap(key3, expectedValue, newValue) {
    const request2 = {
      ...baseRequest,
      key: key3,
      expectedValue,
      newValue
    };
    return this.channel.call("compareAndSwap", request2);
  }
};

NativeAutomationStorageService = __decorateClass([
  __decorateParam(0, IMainProcessService)
], NativeAutomationStorageService);

registerSingleton(IAutomationStorageService, NativeAutomationStorageService, 1 /* Delayed */);
export { baseRequest, NativeAutomationStorageService };
