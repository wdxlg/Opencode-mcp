// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/numbers.ts



// src/vs/base/common/numbers.ts
var Counter = class {
  constructor() {
    this._next = 0;
  }
  getNext() {
    return this._next++;
  }
};
export { Counter };
