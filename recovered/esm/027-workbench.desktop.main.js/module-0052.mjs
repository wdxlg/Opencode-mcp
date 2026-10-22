// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/reactions/autorun.ts
import { DebugLocation } from "./module-0046.mjs";
import { AutorunObserver } from "./module-0051.mjs";
import { DebugNameData } from "./module-0041.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { transaction } from "./module-0045.mjs";
import { observableValue } from "./module-0048.mjs";


// src/vs/base/common/observableInternal/reactions/autorun.ts
function autorun(fn, debugLocation = DebugLocation.ofCaller()) {
  return new AutorunObserver(
    new DebugNameData(void 0, void 0, fn),
    fn,
    void 0,
    debugLocation
  );
}

function autorunOpts(options3, fn, debugLocation = DebugLocation.ofCaller()) {
  return new AutorunObserver(
    new DebugNameData(options3.owner, options3.debugName, options3.debugReferenceFn ?? fn),
    fn,
    void 0,
    debugLocation
  );
}

function autorunHandleChanges(options3, fn, debugLocation = DebugLocation.ofCaller()) {
  return new AutorunObserver(
    new DebugNameData(options3.owner, options3.debugName, options3.debugReferenceFn ?? fn),
    fn,
    options3.changeTracker,
    debugLocation
  );
}

function autorunWithStoreHandleChanges(options3, fn) {
  const store = new DisposableStore();
  const disposable = autorunHandleChanges(
    {
      owner: options3.owner,
      debugName: options3.debugName,
      debugReferenceFn: options3.debugReferenceFn ?? fn,
      changeTracker: options3.changeTracker
    },
    (reader, changeSummary) => {
      store.clear();
      fn(reader, changeSummary, store);
    }
  );
  return toDisposable(() => {
    disposable.dispose();
    store.dispose();
  });
}

function autorunWithStore(fn) {
  const store = new DisposableStore();
  const disposable = autorunOpts(
    {
      owner: void 0,
      debugName: void 0,
      debugReferenceFn: fn
    },
    (reader) => {
      store.clear();
      fn(reader, store);
    }
  );
  return toDisposable(() => {
    disposable.dispose();
    store.dispose();
  });
}

function autorunDelta(observable, handler) {
  let _lastValue;
  return autorunOpts({ debugReferenceFn: handler }, (reader) => {
    const newValue = observable.read(reader);
    const lastValue = _lastValue;
    _lastValue = newValue;
    handler({ lastValue, newValue });
  });
}

function autorunIterableDelta(getValue, handler, getUniqueIdentifier = (v2) => v2) {
  const lastValues = /* @__PURE__ */ new Map();
  return autorunOpts({ debugReferenceFn: getValue }, (reader) => {
    const newValues = /* @__PURE__ */ new Map();
    const removedValues = new Map(lastValues);
    for (const value2 of getValue(reader)) {
      const id2 = getUniqueIdentifier(value2);
      if (lastValues.has(id2)) {
        removedValues.delete(id2);
      } else {
        newValues.set(id2, value2);
        lastValues.set(id2, value2);
      }
    }
    for (const id2 of removedValues.keys()) {
      lastValues.delete(id2);
    }
    if (newValues.size || removedValues.size) {
      handler({ addedValues: [...newValues.values()], removedValues: [...removedValues.values()] });
    }
  });
}

function autorunPerKeyedItem(items, keyFn, setup2, debugLocation = DebugLocation.ofCaller()) {
  const cells = /* @__PURE__ */ new Map();
  const ar = autorunOpts({ debugReferenceFn: setup2 }, (reader) => {
    const arr = items.read(reader);
    const seen = /* @__PURE__ */ new Set();
    const additions = [];
    transaction((tx) => {
      for (const item of arr) {
        const key3 = keyFn(item);
        seen.add(key3);
        const existing = cells.get(key3);
        if (existing) {
          existing.value.set(item, tx);
        } else {
          const store = new DisposableStore();
          const value2 = observableValue("keyedItem", item);
          const cell = { value: value2, store };
          cells.set(key3, cell);
          additions.push({ key: key3, cell });
        }
      }
      for (const [k, cell] of cells) {
        if (!seen.has(k)) {
          cell.store.dispose();
          cells.delete(k);
        }
      }
    });
    for (const { key: key3, cell } of additions) {
      setup2(key3, cell.value, cell.store);
    }
  }, debugLocation);
  return toDisposable(() => {
    ar.dispose();
    for (const cell of cells.values()) {
      cell.store.dispose();
    }
    cells.clear();
  });
}

function autorunSelfDisposable(fn, debugLocation = DebugLocation.ofCaller()) {
  let ar;
  let disposed = false;
  ar = autorun((reader) => {
    fn({
      delayedStore: reader.delayedStore,
      store: reader.store,
      readObservable: reader.readObservable.bind(reader),
      dispose: () => {
        ar?.dispose();
        disposed = true;
      }
    });
  }, debugLocation);
  if (disposed) {
    ar.dispose();
  }
  return ar;
}

function registerAutorunSelfDisposable(store, fn, debugLocation = DebugLocation.ofCaller()) {
  let ar;
  let disposeSync = false;
  ar = autorun((reader) => {
    fn({
      delayedStore: reader.delayedStore,
      store: reader.store,
      readObservable: reader.readObservable.bind(reader),
      dispose: () => {
        if (!ar) {
          disposeSync = true;
        } else {
          store.delete(ar);
        }
      }
    });
  }, debugLocation);
  if (disposeSync) {
    ar.dispose();
  } else {
    store.add(ar);
  }
}
export { autorun, autorunOpts, autorunHandleChanges, autorunWithStoreHandleChanges, autorunWithStore, autorunDelta, autorunIterableDelta, autorunPerKeyedItem, autorunSelfDisposable, registerAutorunSelfDisposable };
