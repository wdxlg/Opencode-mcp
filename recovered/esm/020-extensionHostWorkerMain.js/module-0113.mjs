// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/observableInternal/utils/utils.ts
import { toDisposable } from "./module-0011.mjs";
import { _setKeepObserved, _setRecomputeInitiallyAndOnChange } from "./module-0103.mjs";


// src/vs/base/common/observableInternal/utils/utils.ts
function keepObserved(observable) {
  const o = new KeepAliveObserver(false, void 0);
  observable.addObserver(o);
  return toDisposable(() => {
    observable.removeObserver(o);
  });
}

_setKeepObserved(keepObserved);

function recomputeInitiallyAndOnChange(observable, handleValue) {
  const o = new KeepAliveObserver(true, handleValue);
  observable.addObserver(o);
  try {
    o.beginUpdate(observable);
  } finally {
    o.endUpdate(observable);
  }
  return toDisposable(() => {
    observable.removeObserver(o);
  });
}

_setRecomputeInitiallyAndOnChange(recomputeInitiallyAndOnChange);

var KeepAliveObserver = class {
  constructor(_forceRecompute, _handleValue) {
    this._forceRecompute = _forceRecompute;
    this._handleValue = _handleValue;
    this._counter = 0;
  }
  beginUpdate(observable) {
    this._counter++;
  }
  endUpdate(observable) {
    if (this._counter === 1 && this._forceRecompute) {
      if (this._handleValue) {
        this._handleValue(observable.get());
      } else {
        observable.reportChanges();
      }
    }
    this._counter--;
  }
  handlePossibleChange(observable) {
  }
  handleChange(observable, change) {
  }
};
export { keepObserved, recomputeInitiallyAndOnChange, KeepAliveObserver };
