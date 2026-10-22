// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/tokens/common.ts



// src/vs/editor/common/tokens/common.ts
var RateLimiter = class {
  constructor(timesPerSecond = 5) {
    this.timesPerSecond = timesPerSecond;
    this._lastRun = 0;
    this._minimumTimeBetweenRuns = 1e3 / timesPerSecond;
  }
  runIfNotLimited(callback) {
    const now = Date.now();
    if (now - this._lastRun >= this._minimumTimeBetweenRuns) {
      this._lastRun = now;
      callback();
    }
  }
};
export { RateLimiter };
