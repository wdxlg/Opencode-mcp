// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/common/observableInternal/observables/observableValue.ts
import { DebugLocation } from "./module-0062.mjs";
import { DebugNameData } from "./module-0058.mjs";
import { strictEquals } from "./module-0050.mjs";
import { BaseObservable } from "./module-0063.mjs";
import { getLogger } from "./module-0060.mjs";
import { TransactionImpl } from "./module-0061.mjs";


// src/vs/base/common/observableInternal/observables/observableValue.ts
function observableValue(nameOrOwner, initialValue, debugLocation = DebugLocation.ofCaller()) {
  let debugNameData;
  if (typeof nameOrOwner === "string") {
    debugNameData = new DebugNameData(void 0, nameOrOwner, void 0);
  } else {
    debugNameData = new DebugNameData(nameOrOwner, void 0, void 0);
  }
  return new ObservableValue(debugNameData, initialValue, strictEquals, debugLocation);
}

var ObservableValue = class extends BaseObservable {
  constructor(_debugNameData, initialValue, _equalityComparator, debugLocation) {
    super(debugLocation);
    this._debugNameData = _debugNameData;
    this._equalityComparator = _equalityComparator;
    this._value = initialValue;
    getLogger()?.handleObservableUpdated(this, { hadValue: false, newValue: initialValue, change: void 0, didChange: true, oldValue: void 0 });
  }
  get debugName() {
    return this._debugNameData.getDebugName(this) ?? "ObservableValue";
  }
  get() {
    return this._value;
  }
  set(value, tx, change) {
    if (change === void 0 && this._equalityComparator(this._value, value)) {
      return;
    }
    let _tx;
    if (!tx) {
      tx = _tx = new TransactionImpl(() => {
      }, () => `Setting ${this.debugName}`);
    }
    try {
      const oldValue = this._value;
      this._setValue(value);
      getLogger()?.handleObservableUpdated(this, { oldValue, newValue: value, change, didChange: true, hadValue: true });
      for (const observer of this._observers) {
        tx.updateObserver(observer, this);
        observer.handleChange(this, change);
      }
    } finally {
      if (_tx) {
        _tx.finish();
      }
    }
  }
  toString() {
    return `${this.debugName}: ${this._value}`;
  }
  _setValue(newValue) {
    this._value = newValue;
  }
  debugGetState() {
    return {
      value: this._value
    };
  }
  debugSetValue(value) {
    this._value = value;
  }
};
export { observableValue, ObservableValue };
