// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/cache.ts
import { CancellationTokenSource } from "./module-0025.mjs";


// src/vs/base/common/cache.ts
var Cache2 = class {
  constructor(task) {
    this.task = task;
    this.result = null;
  }
  get() {
    if (this.result) {
      return this.result;
    }
    const cts = new CancellationTokenSource();
    const promise = this.task(cts.token);
    this.result = {
      promise,
      dispose: () => {
        this.result = null;
        cts.cancel();
        cts.dispose();
      }
    };
    return this.result;
  }
};

function identity(t2) {
  return t2;
}

var LRUCachedFunction = class {
  constructor(arg1, arg2) {
    this.lastCache = void 0;
    this.lastArgKey = void 0;
    if (typeof arg1 === "function") {
      this._fn = arg1;
      this._computeKey = identity;
    } else {
      this._fn = arg2;
      this._computeKey = arg1.getCacheKey;
    }
  }
  get(arg) {
    const key3 = this._computeKey(arg);
    if (this.lastArgKey !== key3) {
      this.lastArgKey = key3;
      this.lastCache = this._fn(arg);
    }
    return this.lastCache;
  }
};

var CachedFunction = class {
  constructor(arg1, arg2) {
    this._map = /* @__PURE__ */ new Map();
    this._map2 = /* @__PURE__ */ new Map();
    if (typeof arg1 === "function") {
      this._fn = arg1;
      this._computeKey = identity;
    } else {
      this._fn = arg2;
      this._computeKey = arg1.getCacheKey;
    }
  }
  get cachedValues() {
    return this._map;
  }
  get(arg) {
    const key3 = this._computeKey(arg);
    if (this._map2.has(key3)) {
      return this._map2.get(key3);
    }
    const value2 = this._fn(arg);
    this._map.set(arg, value2);
    this._map2.set(key3, value2);
    return value2;
  }
};

var WeakCachedFunction = class {
  constructor(arg1, arg2) {
    this._map = /* @__PURE__ */ new WeakMap();
    if (typeof arg1 === "function") {
      this._fn = arg1;
      this._computeKey = identity;
    } else {
      this._fn = arg2;
      this._computeKey = arg1.getCacheKey;
    }
  }
  get(arg) {
    const key3 = this._computeKey(arg);
    if (this._map.has(key3)) {
      return this._map.get(key3);
    }
    const value2 = this._fn(arg);
    this._map.set(key3, value2);
    return value2;
  }
};
export { identity, Cache2, LRUCachedFunction, CachedFunction, WeakCachedFunction };
