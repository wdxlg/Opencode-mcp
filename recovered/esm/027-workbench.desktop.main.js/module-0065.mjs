// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/experimental/utils.ts
import { BugIndicatingError } from "./module-0004.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { autorunOpts } from "./module-0052.mjs";
import { DebugNameData, getDebugName } from "./module-0041.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";


// src/vs/base/common/observableInternal/experimental/utils.ts
function latestChangedValue(owner, observables) {
  if (observables.length === 0) {
    throw new BugIndicatingError();
  }
  let hasLastChangedValue = false;
  let lastChangedValue = void 0;
  const result = observableFromEvent(owner, (cb) => {
    const store = new DisposableStore();
    for (const o of observables) {
      store.add(autorunOpts({ debugName: () => getDebugName(result, new DebugNameData(owner, void 0, void 0)) + ".updateLastChangedValue" }, (reader) => {
        hasLastChangedValue = true;
        lastChangedValue = o.read(reader);
        cb();
      }));
    }
    store.add({
      dispose() {
        hasLastChangedValue = false;
        lastChangedValue = void 0;
      }
    });
    return store;
  }, () => {
    if (hasLastChangedValue) {
      return lastChangedValue;
    } else {
      return observables[observables.length - 1].get();
    }
  });
  return result;
}

function derivedConstOnceDefined(owner, fn) {
  return derivedObservableWithCache(owner, (reader, lastValue) => lastValue ?? fn(reader));
}
export { latestChangedValue, derivedConstOnceDefined };
