// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/observableInternal/observables/observableFromEvent.ts
import { DebugNameData } from "./module-0104.mjs";
import { strictEquals } from "./module-0105.mjs";
import { DebugLocation } from "./module-0109.mjs";
import { BaseObservable } from "./module-0110.mjs";
import { subtransaction } from "./module-0108.mjs";
import { getLogger } from "./module-0107.mjs";


// src/vs/base/common/observableInternal/observables/observableFromEvent.ts
function observableFromEvent(...args2) {
  let owner;
  let event;
  let getValue;
  let debugLocation;
  if (args2.length === 2) {
    [event, getValue] = args2;
  } else {
    [owner, event, getValue, debugLocation] = args2;
  }
  return new FromEventObservable(
    new DebugNameData(owner, void 0, getValue),
    event,
    getValue,
    () => FromEventObservable.globalTransaction,
    strictEquals,
    debugLocation ?? DebugLocation.ofCaller()
  );
}

var FromEventObservable = class extends BaseObservable {
  constructor(_debugNameData, event, _getValue, _getTransaction, _equalityComparator, debugLocation) {
    super(debugLocation);
    this._debugNameData = _debugNameData;
    this.event = event;
    this._getValue = _getValue;
    this._getTransaction = _getTransaction;
    this._equalityComparator = _equalityComparator;
    this._hasValue = false;
    this.handleEvent = (args2) => {
      const newValue = this._getValue(args2);
      const oldValue = this._value;
      const hadValue = this._hasValue;
      const didChange = !hadValue || !this._equalityComparator(oldValue, newValue);
      let didRunTransaction = false;
      if (didChange) {
        this._value = newValue;
        this._hasValue = true;
        if (hadValue) {
          didRunTransaction = true;
          subtransaction(
            this._getTransaction(),
            (tx) => {
              getLogger()?.handleObservableUpdated(this, { oldValue, newValue, change: void 0, didChange, hadValue });
              for (const o of this._observers) {
                tx.updateObserver(o, this);
                o.handleChange(this, void 0);
              }
            },
            () => {
              const name = this.getDebugName();
              return "Event fired" + (name ? `: ${name}` : "");
            }
          );
        }
      }
      if (!didRunTransaction) {
        getLogger()?.handleObservableUpdated(this, { oldValue, newValue, change: void 0, didChange, hadValue });
      }
    };
  }
  getDebugName() {
    return this._debugNameData.getDebugName(this);
  }
  get debugName() {
    const name = this.getDebugName();
    return "From Event" + (name ? `: ${name}` : "");
  }
  onFirstObserverAdded() {
    this._subscription = this.event(this.handleEvent);
  }
  onLastObserverRemoved() {
    this._subscription.dispose();
    this._subscription = void 0;
    this._hasValue = false;
    this._value = void 0;
  }
  get() {
    if (this._subscription) {
      if (!this._hasValue) {
        this.handleEvent(void 0);
      }
      return this._value;
    } else {
      const value = this._getValue(void 0);
      return value;
    }
  }
  debugSetValue(value) {
    this._value = value;
  }
  debugGetState() {
    return { value: this._value, hasValue: this._hasValue };
  }
};

((observableFromEvent2) => {
  observableFromEvent2.Observer = FromEventObservable;
  function batchEventsGlobally(tx, fn) {
    let didSet = false;
    if (FromEventObservable.globalTransaction === void 0) {
      FromEventObservable.globalTransaction = tx;
      didSet = true;
    }
    try {
      fn();
    } finally {
      if (didSet) {
        FromEventObservable.globalTransaction = void 0;
      }
    }
  }
  observableFromEvent2.batchEventsGlobally = batchEventsGlobally;
})(observableFromEvent || (observableFromEvent = {}));
export { observableFromEvent, FromEventObservable };
