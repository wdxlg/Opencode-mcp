// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostPower.ts
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0019.mjs";
import { MainContext } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0052.mjs";
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/api/common/extHostPower.ts
var ExtHostPower = class extends Disposable {
  constructor(extHostRpc) {
    super();
    // Events
    this._onDidSuspend = this._register(new Emitter());
    this.onDidSuspend = this._onDidSuspend.event;
    this._onDidResume = this._register(new Emitter());
    this.onDidResume = this._onDidResume.event;
    this._onDidChangeOnBatteryPower = this._register(new Emitter());
    this.onDidChangeOnBatteryPower = this._onDidChangeOnBatteryPower.event;
    this._onDidChangeThermalState = this._register(new Emitter());
    this.onDidChangeThermalState = this._onDidChangeThermalState.event;
    this._onDidChangeSpeedLimit = this._register(new Emitter());
    this.onDidChangeSpeedLimit = this._onDidChangeSpeedLimit.event;
    this._onWillShutdown = this._register(new Emitter());
    this.onWillShutdown = this._onWillShutdown.event;
    this._onDidLockScreen = this._register(new Emitter());
    this.onDidLockScreen = this._onDidLockScreen.event;
    this._onDidUnlockScreen = this._register(new Emitter());
    this.onDidUnlockScreen = this._onDidUnlockScreen.event;
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadPower);
  }
  // === Proxy callbacks (called by MainThread) ===
  $onDidSuspend() {
    this._onDidSuspend.fire();
  }
  $onDidResume() {
    this._onDidResume.fire();
  }
  $onDidChangeOnBatteryPower(isOnBattery) {
    this._onDidChangeOnBatteryPower.fire(isOnBattery);
  }
  $onDidChangeThermalState(state) {
    this._onDidChangeThermalState.fire(state);
  }
  $onDidChangeSpeedLimit(limit) {
    this._onDidChangeSpeedLimit.fire(limit);
  }
  $onWillShutdown() {
    this._onWillShutdown.fire();
  }
  $onDidLockScreen() {
    this._onDidLockScreen.fire();
  }
  $onDidUnlockScreen() {
    this._onDidUnlockScreen.fire();
  }
  // === API for extensions ===
  getSystemIdleState(idleThresholdSeconds) {
    return this._proxy.$getSystemIdleState(idleThresholdSeconds);
  }
  getSystemIdleTime() {
    return this._proxy.$getSystemIdleTime();
  }
  getCurrentThermalState() {
    return this._proxy.$getCurrentThermalState();
  }
  isOnBatteryPower() {
    return this._proxy.$isOnBatteryPower();
  }
  async startPowerSaveBlocker(type) {
    const id2 = await this._proxy.$startPowerSaveBlocker(type);
    const proxy = this._proxy;
    const isSupported = id2 >= 0;
    let disposed = false;
    return {
      id: id2,
      get isStarted() {
        return isSupported && !disposed;
      },
      dispose: () => {
        if (isSupported && !disposed) {
          disposed = true;
          proxy.$stopPowerSaveBlocker(id2);
        }
      }
    };
  }
};

ExtHostPower = __decorateClass([
  __decorateParam(0, IExtHostRpcService)
], ExtHostPower);

var IExtHostPower = createDecorator("IExtHostPower");
export { ExtHostPower, IExtHostPower };
