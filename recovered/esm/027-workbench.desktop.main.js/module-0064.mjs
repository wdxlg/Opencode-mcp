// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/utils/runOnChange.ts
import { autorunWithStoreHandleChanges } from "./module-0052.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { cancelOnDispose } from "./module-0025.mjs";


// src/vs/base/common/observableInternal/utils/runOnChange.ts
function runOnChange(observable, cb) {
  let _previousValue;
  let _firstRun = true;
  return autorunWithStoreHandleChanges({
    changeTracker: {
      createChangeSummary: () => ({ deltas: [], didChange: false }),
      handleChange: (context2, changeSummary) => {
        if (context2.didChange(observable)) {
          const e = context2.change;
          if (e !== void 0) {
            changeSummary.deltas.push(e);
          }
          changeSummary.didChange = true;
        }
        return true;
      }
    }
  }, (reader, changeSummary) => {
    const value2 = observable.read(reader);
    const previousValue = _previousValue;
    if (changeSummary.didChange) {
      _previousValue = value2;
      cb(value2, previousValue, changeSummary.deltas);
    }
    if (_firstRun) {
      _firstRun = false;
      _previousValue = value2;
    }
  });
}

function runOnChangeWithStore(observable, cb) {
  const store = new DisposableStore();
  const disposable = runOnChange(observable, (value2, previousValue, deltas) => {
    store.clear();
    cb(value2, previousValue, deltas, store);
  });
  return {
    dispose() {
      disposable.dispose();
      store.dispose();
    }
  };
}

function runOnChangeWithCancellationToken(observable, cb) {
  return runOnChangeWithStore(observable, (value2, previousValue, deltas, store) => {
    cb(value2, previousValue, deltas, cancelOnDispose(store));
  });
}
export { runOnChange, runOnChangeWithStore, runOnChangeWithCancellationToken };
