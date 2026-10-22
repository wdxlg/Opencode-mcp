// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editTelemetry/browser/helpers/utils.ts
import { observableValue } from "./module-0048.mjs";
import { runOnChange } from "./module-0064.mjs";
import { transaction } from "./module-0045.mjs";
import { AsyncIterableProducer } from "./module-0036.mjs";
import { toDisposable } from "./module-0012.mjs";


// src/vs/workbench/contrib/editTelemetry/browser/helpers/utils.ts
function sumByCategory(items, getValue, getCategory2) {
  return items.reduce((acc, item) => {
    const category9 = getCategory2(item);
    acc[category9] = (acc[category9] || 0) + getValue(item);
    return acc;
  }, {});
}

function mapObservableDelta(obs, mapFn, store) {
  const obsResult = observableValue("mapped", obs.get());
  store.add(runOnChange(obs, (value2, _prevValue, changes) => {
    transaction((tx) => {
      for (const c of changes) {
        obsResult.set(value2, tx, mapFn(c));
      }
    });
  }));
  return obsResult;
}

function iterateObservableChanges(obs, store) {
  return new AsyncIterableProducer((e4) => {
    if (store.isDisposed) {
      return;
    }
    store.add(runOnChange(obs, (value2, prevValue, change) => {
      e4.emitOne({ value: value2, prevValue, change });
    }));
    return new Promise((res) => {
      store.add(toDisposable(() => {
        res(void 0);
      }));
    });
  });
}
export { sumByCategory, mapObservableDelta, iterateObservableChanges };
