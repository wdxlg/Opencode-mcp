// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/utils/valueWithChangeEvent.ts
import { Event2 } from "./module-0017.mjs";
import { observableFromEvent } from "./module-0057.mjs";


// src/vs/base/common/observableInternal/utils/valueWithChangeEvent.ts
var ValueWithChangeEventFromObservable = class {
  constructor(observable) {
    this.observable = observable;
  }
  get onDidChange() {
    return Event2.fromObservableLight(this.observable);
  }
  get value() {
    return this.observable.get();
  }
};

function observableFromValueWithChangeEvent(owner, value2) {
  if (value2 instanceof ValueWithChangeEventFromObservable) {
    return value2.observable;
  }
  return observableFromEvent(owner, value2.onDidChange, () => value2.value);
}
export { observableFromValueWithChangeEvent, ValueWithChangeEventFromObservable };
