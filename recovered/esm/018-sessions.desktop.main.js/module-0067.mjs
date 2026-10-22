// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/map.ts
import { observableValueOpts } from "./module-0050.mjs";


// src/vs/base/common/observableInternal/map.ts
var ObservableMap = class {
  constructor() {
    this._data = /* @__PURE__ */ new Map();
    this._obs = observableValueOpts({ equalsFn: () => false }, this);
    this.observable = this._obs;
  }
  get size() {
    return this._data.size;
  }
  has(key3) {
    return this._data.has(key3);
  }
  get(key3) {
    return this._data.get(key3);
  }
  set(key3, value2, tx) {
    const hadKey = this._data.has(key3);
    const oldValue = this._data.get(key3);
    if (!hadKey || oldValue !== value2) {
      this._data.set(key3, value2);
      this._obs.set(this, tx);
    }
    return this;
  }
  delete(key3, tx) {
    const result = this._data.delete(key3);
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
    this._data.forEach((value2, key3, _map) => {
      callbackfn.call(thisArg, value2, key3, this);
    });
  }
  *entries() {
    yield* this._data.entries();
  }
  *keys() {
    yield* this._data.keys();
  }
  *values() {
    yield* this._data.values();
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  get [Symbol.toStringTag]() {
    return "ObservableMap";
  }
};
export { ObservableMap };
