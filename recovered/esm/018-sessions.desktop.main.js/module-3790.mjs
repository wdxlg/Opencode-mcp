// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/automations/browser/automationStorageService.ts
import { BrowserStorageService } from "./module-3789.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/sessions/contrib/automations/browser/automationStorageService.ts
var BrowserAutomationStorageService = class {
  constructor(storageService) {
    if (!(storageService instanceof BrowserStorageService)) {
      throw new Error("Browser automation storage requires BrowserStorageService.");
    }
    this.storageService = storageService;
  }
  async read(key3) {
    return this.storageService.getApplicationStorageValue(key3);
  }
  async compareAndSwap(key3, expectedValue, newValue) {
    return this.storageService.compareAndSwapApplicationStorage(key3, expectedValue, newValue);
  }
};

BrowserAutomationStorageService = __decorateClass([
  __decorateParam(0, IStorageService)
], BrowserAutomationStorageService);
export { BrowserAutomationStorageService };
