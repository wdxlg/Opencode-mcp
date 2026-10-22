// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/numbers.ts



// src/vs/base/common/numbers.ts
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

var Counter = class {
  constructor() {
    this._next = 0;
  }
  getNext() {
    return this._next++;
  }
};

var MovingAverage = class {
  constructor() {
    this._n = 1;
    this._val = 0;
  }
  update(value) {
    this._val = this._val + (value - this._val) / this._n;
    this._n += 1;
    return this._val;
  }
  get value() {
    return this._val;
  }
};
export { clamp, Counter, MovingAverage };
