// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/cancellation.ts
import { Emitter, Event2 } from "./module-0017.mjs";
import { DisposableStore } from "./module-0012.mjs";


// src/vs/base/common/cancellation.ts
var shortcutEvent = Object.freeze(function(callback, context2) {
  const handle2 = setTimeout(callback.bind(context2), 0);
  return { dispose() {
    clearTimeout(handle2);
  } };
});

var CancellationToken;

((CancellationToken75) => {
  function isCancellationToken(thing) {
    if (thing === CancellationToken75.None || thing === CancellationToken75.Cancelled) {
      return true;
    }
    if (thing instanceof MutableToken) {
      return true;
    }
    if (!thing || typeof thing !== "object") {
      return false;
    }
    return typeof thing.isCancellationRequested === "boolean" && typeof thing.onCancellationRequested === "function";
  }
  CancellationToken75.isCancellationToken = isCancellationToken;
  CancellationToken75.None = Object.freeze({
    isCancellationRequested: false,
    onCancellationRequested: Event2.None
  });
  CancellationToken75.Cancelled = Object.freeze({
    isCancellationRequested: true,
    onCancellationRequested: shortcutEvent
  });
})(CancellationToken || (CancellationToken = {}));

var MutableToken = class {
  constructor() {
    this._isCancelled = false;
    this._emitter = null;
  }
  cancel() {
    if (!this._isCancelled) {
      this._isCancelled = true;
      if (this._emitter) {
        this._emitter.fire(void 0);
        this.dispose();
      }
    }
  }
  get isCancellationRequested() {
    return this._isCancelled;
  }
  get onCancellationRequested() {
    if (this._isCancelled) {
      return shortcutEvent;
    }
    if (!this._emitter) {
      this._emitter = new Emitter();
    }
    return this._emitter.event;
  }
  dispose() {
    if (this._emitter) {
      this._emitter.dispose();
      this._emitter = null;
    }
  }
};

var CancellationTokenSource = class {
  constructor(parent) {
    this._token = void 0;
    this._parentListener = void 0;
    this._parentListener = parent && parent.onCancellationRequested(this.cancel, this);
  }
  get token() {
    if (!this._token) {
      this._token = new MutableToken();
    }
    return this._token;
  }
  cancel() {
    if (!this._token) {
      this._token = CancellationToken.Cancelled;
    } else if (this._token instanceof MutableToken) {
      this._token.cancel();
    }
  }
  dispose(cancel = false) {
    if (cancel) {
      this.cancel();
    }
    this._parentListener?.dispose();
    if (!this._token) {
      this._token = CancellationToken.None;
    } else if (this._token instanceof MutableToken) {
      this._token.dispose();
    }
  }
};

function cancelOnDispose(store) {
  const source = new CancellationTokenSource();
  store.add({ dispose() {
    source.cancel();
  } });
  return source.token;
}

var CancellationTokenPool = class {
  constructor() {
    this._source = new CancellationTokenSource();
    this._listeners = new DisposableStore();
    this._total = 0;
    this._cancelled = 0;
    this._isDone = false;
  }
  get token() {
    return this._source.token;
  }
  /**
   * Add a token to the pool. If the token is already cancelled it is counted
   * immediately. Tokens added after the pool token has been cancelled are ignored.
   */
  add(token) {
    if (this._isDone) {
      return;
    }
    this._total++;
    if (token.isCancellationRequested) {
      this._cancelled++;
      this._check();
      return;
    }
    const d = token.onCancellationRequested(() => {
      d.dispose();
      this._cancelled++;
      this._check();
    });
    this._listeners.add(d);
  }
  _check() {
    if (!this._isDone && this._total > 0 && this._total === this._cancelled) {
      this._isDone = true;
      this._listeners.dispose();
      this._source.cancel();
    }
  }
  dispose() {
    this._listeners.dispose();
    this._source.dispose();
  }
};
export { cancelOnDispose, shortcutEvent, CancellationToken, MutableToken, CancellationTokenSource, CancellationTokenPool };
