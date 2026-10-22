// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/tree/tree.ts



// src/vs/base/browser/ui/tree/tree.ts
var TreeError = class extends Error {
  constructor(user, message) {
    super(`TreeError [${user}] ${message}`);
  }
};

var WeakMapper = class {
  constructor(fn) {
    this.fn = fn;
    this._map = /* @__PURE__ */ new WeakMap();
  }
  map(key3) {
    let result = this._map.get(key3);
    if (!result) {
      result = this.fn(key3);
      this._map.set(key3, result);
    }
    return result;
  }
};
export { TreeError, WeakMapper };
