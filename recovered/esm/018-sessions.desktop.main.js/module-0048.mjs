// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/observables/observableValue.ts
import { DebugLocation } from "./module-0046.mjs";
import { DebugNameData } from "./module-0041.mjs";
import { strictEquals } from "./module-0042.mjs";
import { BaseObservable } from "./module-0047.mjs";
import { getLogger } from "./module-0044.mjs";
import { TransactionImpl } from "./module-0045.mjs";


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
  set(value2, tx, change) {
    if (change === void 0 && this._equalityComparator(this._value, value2)) {
      return;
    }
    let _tx;
    if (!tx) {
      tx = _tx = new TransactionImpl(() => {
      }, () => `Setting ${this.debugName}`);
    }
    try {
      const oldValue = this._value;
      this._setValue(value2);
      getLogger()?.handleObservableUpdated(this, { oldValue, newValue: value2, change, didChange: true, hadValue: true });
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
  debugSetValue(value2) {
    this._value = value2;
  }
};

function disposableObservableValue(nameOrOwner, initialValue, debugLocation = DebugLocation.ofCaller()) {
  let debugNameData;
  if (typeof nameOrOwner === "string") {
    debugNameData = new DebugNameData(void 0, nameOrOwner, void 0);
  } else {
    debugNameData = new DebugNameData(nameOrOwner, void 0, void 0);
  }
  return new DisposableObservableValue(debugNameData, initialValue, strictEquals, debugLocation);
}

var DisposableObservableValue = class extends ObservableValue {
  _setValue(newValue) {
    if (this._value === newValue) {
      return;
    }
    if (this._value) {
      this._value.dispose();
    }
    this._value = newValue;
  }
  dispose() {
    this._value?.dispose();
  }
};
export { observableValue, disposableObservableValue, ObservableValue, DisposableObservableValue };
