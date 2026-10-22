// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/observableInternal/observables/constObservable.ts
import { ConvenientObservable } from "./module-0103.mjs";


// src/vs/base/common/observableInternal/observables/constObservable.ts
function constObservable(value) {
  return new ConstObservable(value);
}

var ConstObservable = class extends ConvenientObservable {
  constructor(value) {
    super();
    this.value = value;
  }
  get debugName() {
    return this.toString();
  }
  get() {
    return this.value;
  }
  addObserver(observer) {
  }
  removeObserver(observer) {
  }
  log() {
    return this;
  }
  toString() {
    return `Const: ${this.value}`;
  }
};
export { constObservable, ConstObservable };
