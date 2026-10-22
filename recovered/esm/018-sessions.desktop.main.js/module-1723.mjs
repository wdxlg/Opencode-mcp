// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/experimental/time.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { observableValue } from "./module-0048.mjs";


// src/vs/base/common/observableInternal/experimental/time.ts
var TotalTrueTimeObservable = class extends Disposable {
  constructor(value2) {
    super();
    this.value = value2;
    this._totalTime = 0;
    this._startTime = void 0;
    this._register(autorun((reader) => {
      const isTrue = this.value.read(reader);
      if (isTrue) {
        this._startTime = Date.now();
      } else {
        if (this._startTime !== void 0) {
          const delta2 = Date.now() - this._startTime;
          this._totalTime += delta2;
          this._startTime = void 0;
        }
      }
    }));
  }
  /**
   * Reports the total time the observable has been true in milliseconds.
   * E.g. `true` for 100ms, then `false` for 50ms, then `true` for 200ms results in 300ms.
  */
  totalTimeMs() {
    if (this._startTime !== void 0) {
      return this._totalTime + (Date.now() - this._startTime);
    }
    return this._totalTime;
  }
  /**
   * Runs the callback when the total time the observable has been true increased by the given delta in milliseconds.
  */
  fireWhenTimeIncreasedBy(deltaTimeMs, callback) {
    const store = new DisposableStore();
    let accumulatedTime = 0;
    let startTime = void 0;
    store.add(autorun((reader) => {
      const isTrue = this.value.read(reader);
      if (isTrue) {
        startTime = Date.now();
        const remainingTime = deltaTimeMs - accumulatedTime;
        if (remainingTime <= 0) {
          callback();
          store.dispose();
          return;
        }
        const handle2 = setTimeout(() => {
          accumulatedTime += Date.now() - startTime;
          startTime = void 0;
          callback();
          store.dispose();
        }, remainingTime);
        reader.store.add(toDisposable(() => {
          clearTimeout(handle2);
          if (startTime !== void 0) {
            accumulatedTime += Date.now() - startTime;
            startTime = void 0;
          }
        }));
      }
    }));
    return store;
  }
};

function wasTrueRecently(obs, timeMs, store) {
  const result = observableValue("wasTrueRecently", false);
  let timeout2;
  store.add(autorun((reader) => {
    const value2 = obs.read(reader);
    if (value2) {
      result.set(true, void 0);
      if (timeout2 !== void 0) {
        clearTimeout(timeout2);
        timeout2 = void 0;
      }
    } else {
      timeout2 = setTimeout(() => {
        result.set(false, void 0);
        timeout2 = void 0;
      }, timeMs);
    }
  }));
  store.add(toDisposable(() => {
    if (timeout2 !== void 0) {
      clearTimeout(timeout2);
    }
  }));
  return result;
}
export { wasTrueRecently, TotalTrueTimeObservable };
