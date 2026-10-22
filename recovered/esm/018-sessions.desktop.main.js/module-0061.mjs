// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/observables/constObservable.ts
import { ConvenientObservable } from "./module-0047.mjs";


// src/vs/base/common/observableInternal/observables/constObservable.ts
function constObservable(value2) {
  return new ConstObservable(value2);
}

var ConstObservable = class extends ConvenientObservable {
  constructor(value2) {
    super();
    this.value = value2;
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
