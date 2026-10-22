// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/set.ts
import { observableValueOpts } from "./module-0050.mjs";


// src/vs/base/common/observableInternal/set.ts
var ObservableSet = class {
  constructor() {
    this._data = /* @__PURE__ */ new Set();
    this._obs = observableValueOpts({ equalsFn: () => false }, this);
    this.observable = this._obs;
  }
  get size() {
    return this._data.size;
  }
  has(value2) {
    return this._data.has(value2);
  }
  add(value2, tx) {
    const hadValue = this._data.has(value2);
    if (!hadValue) {
      this._data.add(value2);
      this._obs.set(this, tx);
    }
    return this;
  }
  delete(value2, tx) {
    const result = this._data.delete(value2);
    if (result) {
      this._obs.set(this, tx);
    }
    return result;
  }
  clear(tx) {
    if (this._data.size > 0) {
      this._data.clear();
      this._obs.set(this, tx);
    }
  }
  forEach(callbackfn, thisArg) {
    this._data.forEach((value2, value22, _set) => {
      callbackfn.call(thisArg, value2, value22, this);
    });
  }
  *entries() {
    for (const value2 of this._data) {
      yield [value2, value2];
    }
  }
  *keys() {
    yield* this._data.keys();
  }
  *values() {
    yield* this._data.values();
  }
  [Symbol.iterator]() {
    return this.values();
  }
  get [Symbol.toStringTag]() {
    return "ObservableSet";
  }
};
export { ObservableSet };
