// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/observableInternal/observables/observableSignal.ts
import { DebugLocation } from "./module-0102.mjs";
import { BaseObservable } from "./module-0103.mjs";
import { DebugNameData } from "./module-0097.mjs";
import { transaction } from "./module-0101.mjs";


// src/vs/base/common/observableInternal/observables/observableSignal.ts
function observableSignal(debugNameOrOwner, debugLocation = DebugLocation.ofCaller()) {
  if (typeof debugNameOrOwner === "string") {
    return new ObservableSignal(debugNameOrOwner, void 0, debugLocation);
  } else {
    return new ObservableSignal(void 0, debugNameOrOwner, debugLocation);
  }
}

var ObservableSignal = class extends BaseObservable {
  constructor(_debugName, _owner, debugLocation) {
    super(debugLocation);
    this._debugName = _debugName;
    this._owner = _owner;
  }
  get debugName() {
    return new DebugNameData(this._owner, this._debugName, void 0).getDebugName(this) ?? "Observable Signal";
  }
  toString() {
    return this.debugName;
  }
  trigger(tx, change) {
    if (!tx) {
      transaction((tx2) => {
        this.trigger(tx2, change);
      }, () => `Trigger signal ${this.debugName}`);
      return;
    }
    for (const o of this._observers) {
      tx.updateObserver(o, this);
      o.handleChange(this, change);
    }
  }
  get() {
  }
};
export { observableSignal, ObservableSignal };
