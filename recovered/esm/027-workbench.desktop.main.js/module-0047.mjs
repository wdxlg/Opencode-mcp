// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/observables/baseObservable.ts
import { DebugLocation } from "./module-0046.mjs";
import { getFunctionName } from "./module-0041.mjs";
import { getLogger, logObservable } from "./module-0044.mjs";


// src/vs/base/common/observableInternal/observables/baseObservable.ts
var _derived;

function _setDerivedOpts(derived2) {
  _derived = derived2;
}

var _recomputeInitiallyAndOnChange;

function _setRecomputeInitiallyAndOnChange(recomputeInitiallyAndOnChange2) {
  _recomputeInitiallyAndOnChange = recomputeInitiallyAndOnChange2;
}

var _keepObserved;

function _setKeepObserved(keepObserved2) {
  _keepObserved = keepObserved2;
}

var _debugGetObservableGraph;

function _setDebugGetObservableGraph(debugGetObservableGraph2) {
  _debugGetObservableGraph = debugGetObservableGraph2;
}

var ConvenientObservable = class {
  get TChange() {
    return null;
  }
  reportChanges() {
    this.get();
  }
  /** @sealed */
  read(reader) {
    if (reader) {
      return reader.readObservable(this);
    } else {
      return this.get();
    }
  }
  map(fnOrOwner, fnOrUndefined, debugLocation = DebugLocation.ofCaller()) {
    const owner = fnOrUndefined === void 0 ? void 0 : fnOrOwner;
    const fn = fnOrUndefined === void 0 ? fnOrOwner : fnOrUndefined;
    return _derived(
      {
        owner,
        debugName: () => {
          const name = getFunctionName(fn);
          if (name !== void 0) {
            return name;
          }
          const regexp2 = /^\s*\(?\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*\)?\s*=>\s*\1(?:\??)\.([a-zA-Z_$][a-zA-Z_$0-9]*)\s*$/;
          const match2 = regexp2.exec(fn.toString());
          if (match2) {
            return `${this.debugName}.${match2[2]}`;
          }
          if (!owner) {
            return `${this.debugName} (mapped)`;
          }
          return void 0;
        },
        debugReferenceFn: fn
      },
      (reader) => fn(this.read(reader), reader),
      debugLocation
    );
  }
  /**
   * @sealed
   * Converts an observable of an observable value into a direct observable of the value.
  */
  flatten() {
    return _derived(
      {
        owner: void 0,
        debugName: () => `${this.debugName} (flattened)`
      },
      (reader) => this.read(reader).read(reader)
    );
  }
  recomputeInitiallyAndOnChange(store, handleValue) {
    store.add(_recomputeInitiallyAndOnChange(this, handleValue));
    return this;
  }
  /**
   * Ensures that this observable is observed. This keeps the cache alive.
   * However, in case of deriveds, it does not force eager evaluation (only when the value is read/get).
   * Use `recomputeInitiallyAndOnChange` for eager evaluation.
   */
  keepObserved(store) {
    store.add(_keepObserved(this));
    return this;
  }
  get debugValue() {
    return this.get();
  }
  get debug() {
    return new DebugHelper(this);
  }
};

var DebugHelper = class {
  constructor(observable) {
    this.observable = observable;
  }
  getDependencyGraph() {
    return _debugGetObservableGraph(this.observable, { type: "dependencies" });
  }
  getObserverGraph() {
    return _debugGetObservableGraph(this.observable, { type: "observers" });
  }
};

var BaseObservable = class extends ConvenientObservable {
  constructor(debugLocation) {
    super();
    this._observers = /* @__PURE__ */ new Set();
    getLogger()?.handleObservableCreated(this, debugLocation);
  }
  addObserver(observer) {
    const len = this._observers.size;
    this._observers.add(observer);
    if (len === 0) {
      this.onFirstObserverAdded();
    }
    if (len !== this._observers.size) {
      getLogger()?.handleOnListenerCountChanged(this, this._observers.size);
    }
  }
  removeObserver(observer) {
    const deleted = this._observers.delete(observer);
    if (deleted && this._observers.size === 0) {
      this.onLastObserverRemoved();
    }
    if (deleted) {
      getLogger()?.handleOnListenerCountChanged(this, this._observers.size);
    }
  }
  onFirstObserverAdded() {
  }
  onLastObserverRemoved() {
  }
  log() {
    const hadLogger = !!getLogger();
    logObservable(this);
    if (!hadLogger) {
      getLogger()?.handleObservableCreated(this, DebugLocation.ofCaller());
    }
    return this;
  }
  debugGetObservers() {
    return this._observers;
  }
};
export { _setDerivedOpts, _setRecomputeInitiallyAndOnChange, _setKeepObserved, _setDebugGetObservableGraph, _derived, _recomputeInitiallyAndOnChange, _keepObserved, _debugGetObservableGraph, ConvenientObservable, DebugHelper, BaseObservable };
