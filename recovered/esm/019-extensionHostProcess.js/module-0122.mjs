// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/observableInternal/observables/observableSignalFromEvent.ts
import { DebugLocation } from "./module-0109.mjs";
import { DebugNameData } from "./module-0104.mjs";
import { BaseObservable } from "./module-0110.mjs";
import { transaction } from "./module-0108.mjs";


// src/vs/base/common/observableInternal/observables/observableSignalFromEvent.ts
function observableSignalFromEvent(owner, event, debugLocation = DebugLocation.ofCaller()) {
  return new FromEventObservableSignal(typeof owner === "string" ? owner : new DebugNameData(owner, void 0, void 0), event, debugLocation);
}

var FromEventObservableSignal = class extends BaseObservable {
  constructor(debugNameDataOrName, event, debugLocation) {
    super(debugLocation);
    this.event = event;
    this.handleEvent = () => {
      transaction(
        (tx) => {
          for (const o of this._observers) {
            tx.updateObserver(o, this);
            o.handleChange(this, void 0);
          }
        },
        () => this.debugName
      );
    };
    this.debugName = typeof debugNameDataOrName === "string" ? debugNameDataOrName : debugNameDataOrName.getDebugName(this) ?? "Observable Signal From Event";
  }
  onFirstObserverAdded() {
    this.subscription = this.event(this.handleEvent);
  }
  onLastObserverRemoved() {
    this.subscription.dispose();
    this.subscription = void 0;
  }
  get() {
  }
};
export { observableSignalFromEvent, FromEventObservableSignal };
