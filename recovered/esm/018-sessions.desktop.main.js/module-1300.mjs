// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadPower.ts
import { Disposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IPowerService } from "./module-1299.mjs";


// src/vs/workbench/api/browser/mainThreadPower.ts
var MainThreadPower = class extends Disposable {
  constructor(extHostContext, powerService) {
    super();
    this.powerService = powerService;
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostPower);
    this._register(this.powerService.onDidSuspend(this.proxy.$onDidSuspend, this.proxy));
    this._register(this.powerService.onDidResume(this.proxy.$onDidResume, this.proxy));
    this._register(this.powerService.onDidChangeOnBatteryPower(this.proxy.$onDidChangeOnBatteryPower, this.proxy));
    this._register(this.powerService.onDidChangeThermalState((state) => this.proxy.$onDidChangeThermalState(state), this));
    this._register(this.powerService.onDidChangeSpeedLimit(this.proxy.$onDidChangeSpeedLimit, this.proxy));
    this._register(this.powerService.onWillShutdown(this.proxy.$onWillShutdown, this.proxy));
    this._register(this.powerService.onDidLockScreen(this.proxy.$onDidLockScreen, this.proxy));
    this._register(this.powerService.onDidUnlockScreen(this.proxy.$onDidUnlockScreen, this.proxy));
  }
  async $getSystemIdleState(idleThreshold) {
    return this.powerService.getSystemIdleState(idleThreshold);
  }
  async $getSystemIdleTime() {
    return this.powerService.getSystemIdleTime();
  }
  async $getCurrentThermalState() {
    return this.powerService.getCurrentThermalState();
  }
  async $isOnBatteryPower() {
    return this.powerService.isOnBatteryPower();
  }
  async $startPowerSaveBlocker(type) {
    return this.powerService.startPowerSaveBlocker(type);
  }
  async $stopPowerSaveBlocker(id2) {
    return this.powerService.stopPowerSaveBlocker(id2);
  }
  async $isPowerSaveBlockerStarted(id2) {
    return this.powerService.isPowerSaveBlockerStarted(id2);
  }
};

MainThreadPower = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadPower),
  __decorateParam(1, IPowerService)
], MainThreadPower);
export { MainThreadPower };
