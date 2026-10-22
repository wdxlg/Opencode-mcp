// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/power/electron-browser/powerService.ts
import { Disposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IPowerService } from "./module-1300.mjs";


// src/vs/workbench/services/power/electron-browser/powerService.ts
var NativePowerService = class extends Disposable {
  constructor(nativeHostService) {
    super();
    this.nativeHostService = nativeHostService;
    this.onDidSuspend = nativeHostService.onDidSuspendOS;
    this.onDidResume = Event2.map(nativeHostService.onDidResumeOS, () => void 0);
    this.onDidChangeOnBatteryPower = nativeHostService.onDidChangeOnBatteryPower;
    this.onDidChangeThermalState = nativeHostService.onDidChangeThermalState;
    this.onDidChangeSpeedLimit = nativeHostService.onDidChangeSpeedLimit;
    this.onWillShutdown = nativeHostService.onWillShutdownOS;
    this.onDidLockScreen = nativeHostService.onDidLockScreen;
    this.onDidUnlockScreen = nativeHostService.onDidUnlockScreen;
  }
  async getSystemIdleState(idleThreshold) {
    return this.nativeHostService.getSystemIdleState(idleThreshold);
  }
  async getSystemIdleTime() {
    return this.nativeHostService.getSystemIdleTime();
  }
  async getCurrentThermalState() {
    return this.nativeHostService.getCurrentThermalState();
  }
  async isOnBatteryPower() {
    return this.nativeHostService.isOnBatteryPower();
  }
  async startPowerSaveBlocker(type) {
    return this.nativeHostService.startPowerSaveBlocker(type);
  }
  async stopPowerSaveBlocker(id2) {
    return this.nativeHostService.stopPowerSaveBlocker(id2);
  }
  async isPowerSaveBlockerStarted(id2) {
    return this.nativeHostService.isPowerSaveBlockerStarted(id2);
  }
};

NativePowerService = __decorateClass([
  __decorateParam(0, INativeHostService)
], NativePowerService);

registerSingleton(IPowerService, NativePowerService, 1 /* Delayed */);
export { NativePowerService };
