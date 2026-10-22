// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/common/stopwatch.ts
import { __esm } from "./module-0000.mjs";


// src/vs/base/common/stopwatch.ts
var performanceNow, StopWatch;

var init_stopwatch = __esm({
  "src/vs/base/common/stopwatch.ts"() {
    performanceNow = globalThis.performance.now.bind(globalThis.performance);
    StopWatch = class _StopWatch {
      static create(highResolution) {
        return new _StopWatch(highResolution);
      }
      constructor(highResolution) {
        this._now = highResolution === false ? Date.now : performanceNow;
        this._startTime = this._now();
        this._stopTime = -1;
      }
      stop() {
        this._stopTime = this._now();
      }
      reset() {
        this._startTime = this._now();
        this._stopTime = -1;
      }
      elapsed() {
        if (this._stopTime !== -1) {
          return this._stopTime - this._startTime;
        }
        return this._now() - this._startTime;
      }
    };
  }
});
export { performanceNow, StopWatch, init_stopwatch };
