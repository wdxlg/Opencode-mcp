// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/utils/utils.ts
import { observableValue } from "./module-0048.mjs";
import { DebugLocation } from "./module-0046.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { observableSignal } from "./module-0058.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { _setKeepObserved, _setRecomputeInitiallyAndOnChange } from "./module-0047.mjs";


// src/vs/base/common/observableInternal/utils/utils.ts
function observableFromPromise(promise) {
  const observable = observableValue("promiseValue", {});
  promise.then((value2) => {
    observable.set({ value: value2 }, void 0);
  });
  return observable;
}

function debouncedObservable(observable, debounceMs, debugLocation = DebugLocation.ofCaller()) {
  let hasValue = false;
  let lastValue;
  let timeout2 = void 0;
  return observableFromEvent(void 0, (cb) => {
    const d = autorun((reader) => {
      const value2 = observable.read(reader);
      if (!hasValue) {
        hasValue = true;
        lastValue = value2;
      } else {
        if (timeout2) {
          clearTimeout(timeout2);
        }
        const debounceDuration = typeof debounceMs === "number" ? debounceMs : debounceMs(lastValue, value2);
        if (debounceDuration === 0) {
          lastValue = value2;
          cb();
          return;
        }
        timeout2 = setTimeout(() => {
          lastValue = value2;
          cb();
        }, debounceDuration);
      }
    });
    return {
      dispose() {
        d.dispose();
        hasValue = false;
        lastValue = void 0;
      }
    };
  }, () => {
    if (hasValue) {
      return lastValue;
    } else {
      return observable.get();
    }
  }, debugLocation);
}

function throttledObservable(observable, throttleMs, debugLocation = DebugLocation.ofCaller()) {
  let hasValue = false;
  let lastValue;
  let timeout2 = void 0;
  return observableFromEvent(void 0, (cb) => {
    const d = autorun((reader) => {
      const value2 = observable.read(reader);
      if (!hasValue) {
        hasValue = true;
        lastValue = value2;
      } else if (!timeout2) {
        timeout2 = setTimeout(() => {
          timeout2 = void 0;
          lastValue = observable.read(void 0);
          cb();
        }, throttleMs);
      }
    });
    return {
      dispose() {
        d.dispose();
        if (timeout2) {
          clearTimeout(timeout2);
          timeout2 = void 0;
        }
        hasValue = false;
        lastValue = void 0;
      }
    };
  }, () => {
    if (hasValue) {
      return lastValue;
    } else {
      return observable.get();
    }
  }, debugLocation);
}

function debouncedObservable2(observable, debounceMs, debugLocation = DebugLocation.ofCaller()) {
  const s = observableSignal("handleTimeout");
  let currentValue = void 0;
  let timeout2 = void 0;
  const d = derivedOpts({
    owner: void 0,
    onLastObserverRemoved: () => {
      currentValue = void 0;
    }
  }, (reader) => {
    const val = observable.read(reader);
    s.read(reader);
    if (val !== currentValue) {
      const debounceDuration = typeof debounceMs === "number" ? debounceMs : debounceMs(currentValue, val);
      if (debounceDuration === 0) {
        currentValue = val;
        return val;
      }
      if (timeout2) {
        clearTimeout(timeout2);
      }
      timeout2 = setTimeout(() => {
        currentValue = val;
        s.trigger(void 0);
      }, debounceDuration);
    }
    return currentValue;
  }, debugLocation);
  return d;
}

function wasEventTriggeredRecently(event, timeoutMs, disposableStore) {
  const observable = observableValue("triggeredRecently", false);
  let timeout2 = void 0;
  disposableStore.add(event(() => {
    observable.set(true, void 0);
    if (timeout2) {
      clearTimeout(timeout2);
    }
    timeout2 = setTimeout(() => {
      observable.set(false, void 0);
    }, timeoutMs);
  }));
  return observable;
}

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

function derivedObservableWithCache(owner, computeFn) {
  let lastValue = void 0;
  const observable = derivedOpts({ owner, debugReferenceFn: computeFn }, (reader) => {
    lastValue = computeFn(reader, lastValue);
    return lastValue;
  });
  return observable;
}

function derivedObservableWithWritableCache(owner, computeFn) {
  let lastValue = void 0;
  const onChange = observableSignal("derivedObservableWithWritableCache");
  const observable = derived(owner, (reader) => {
    onChange.read(reader);
    lastValue = computeFn(reader, lastValue);
    return lastValue;
  });
  return Object.assign(observable, {
    clearCache: (tx) => {
      lastValue = void 0;
      onChange.trigger(tx);
    },
    setCache: (newValue, tx) => {
      lastValue = newValue;
      onChange.trigger(tx);
    }
  });
}

function mapObservableArrayCached(owner, items, map, keySelector) {
  let m = new ArrayMap(map, keySelector);
  const self2 = derivedOpts({
    debugReferenceFn: map,
    owner,
    onLastObserverRemoved: () => {
      m.dispose();
      m = new ArrayMap(map);
    }
  }, (reader) => {
    const i2 = items.read(reader);
    m.setItems(i2);
    return m.getItems();
  });
  return self2;
}

var ArrayMap = class {
  constructor(_map, _keySelector) {
    this._map = _map;
    this._keySelector = _keySelector;
    this._cache = /* @__PURE__ */ new Map();
    this._items = [];
  }
  dispose() {
    this._cache.forEach((entry) => entry.store.dispose());
    this._cache.clear();
  }
  setItems(items) {
    const newItems = [];
    const itemsToRemove = new Set(this._cache.keys());
    for (const item of items) {
      const key3 = this._keySelector ? this._keySelector(item) : item;
      let entry = this._cache.get(key3);
      if (!entry) {
        const store = new DisposableStore();
        const out = this._map(item, store);
        entry = { out, store };
        this._cache.set(key3, entry);
      } else {
        itemsToRemove.delete(key3);
      }
      newItems.push(entry.out);
    }
    for (const item of itemsToRemove) {
      const entry = this._cache.get(item);
      entry.store.dispose();
      this._cache.delete(item);
    }
    this._items = newItems;
  }
  getItems() {
    return this._items;
  }
};

function isObservable(obj) {
  return !!obj && obj.read !== void 0 && obj.reportChanges !== void 0;
}
export { observableFromPromise, debouncedObservable, throttledObservable, debouncedObservable2, wasEventTriggeredRecently, keepObserved, recomputeInitiallyAndOnChange, derivedObservableWithCache, derivedObservableWithWritableCache, mapObservableArrayCached, isObservable, KeepAliveObserver, ArrayMap };
