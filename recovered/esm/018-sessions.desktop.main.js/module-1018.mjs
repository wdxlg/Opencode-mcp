// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/observable/common/observableMemento.ts
import { ObservableValue } from "./module-0048.mjs";
import { DebugNameData } from "./module-0041.mjs";
import { strictEquals } from "./module-0042.mjs";
import { DebugLocation } from "./module-0046.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/platform/observable/common/observableMemento.ts
function observableMemento(opts) {
  return (scope, target, storageService) => {
    return new ObservableMemento(opts, scope, target, storageService);
  };
}

var ObservableMemento = class extends ObservableValue {
  constructor(opts, storageScope, storageTarget, storageService) {
    const getStorageValue = () => {
      const fromStorage = storageService.get(opts.key, storageScope);
      if (fromStorage !== void 0) {
        try {
          return opts.fromStorage(fromStorage);
        } catch {
          return opts.defaultValue;
        }
      }
      return opts.defaultValue;
    };
    const initialValue = getStorageValue();
    super(new DebugNameData(void 0, `storage/${opts.key}`, void 0), initialValue, strictEquals, DebugLocation.ofCaller());
    this.opts = opts;
    this.storageScope = storageScope;
    this.storageTarget = storageTarget;
    this.storageService = storageService;
    this._store = new DisposableStore();
    this._noStorageUpdateNeeded = false;
    const didChange = storageService.onDidChangeValue(storageScope, opts.key, this._store);
    this._store.add(didChange((e4) => {
      if (e4.external && e4.key === opts.key) {
        this._noStorageUpdateNeeded = true;
        try {
          this.set(getStorageValue(), void 0);
        } finally {
          this._noStorageUpdateNeeded = false;
        }
      }
    }));
  }
  _setValue(newValue) {
    super._setValue(newValue);
    if (this._noStorageUpdateNeeded) {
      return;
    }
    const valueToStore = this.opts.toStorage(this.get());
    this.storageService.store(this.opts.key, valueToStore, this.storageScope, this.storageTarget);
  }
  dispose() {
    this._store.dispose();
  }
};

ObservableMemento = __decorateClass([
  __decorateParam(3, IStorageService)
], ObservableMemento);
export { observableMemento, ObservableMemento };
