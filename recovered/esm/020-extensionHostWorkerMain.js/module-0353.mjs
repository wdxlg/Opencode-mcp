// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/cache.ts



// src/vs/workbench/api/common/cache.ts
var Cache2 = class _Cache {
  constructor(id2) {
    this.id = id2;
    this._data = /* @__PURE__ */ new Map();
    this._idPool = 1;
  }
  static {
    this.enableDebugLogging = false;
  }
  add(item) {
    const id2 = this._idPool++;
    this._data.set(id2, item);
    this.logDebugInfo();
    return id2;
  }
  get(pid, id2) {
    return this._data.has(pid) ? this._data.get(pid)[id2] : void 0;
  }
  delete(id2) {
    this._data.delete(id2);
    this.logDebugInfo();
  }
  logDebugInfo() {
    if (!_Cache.enableDebugLogging) {
      return;
    }
    console.log(`${this.id} cache size - ${this._data.size}`);
  }
};
export { Cache2 };
