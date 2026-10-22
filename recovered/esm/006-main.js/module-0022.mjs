// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/cancellation.ts
import { __esm } from "./module-0000.mjs";
import { Emitter, Event, init_event } from "./module-0021.mjs";
import { init_lifecycle } from "./module-0018.mjs";


// src/vs/base/common/cancellation.ts
var shortcutEvent, CancellationToken, MutableToken, CancellationTokenSource;

var init_cancellation = __esm({
  "src/vs/base/common/cancellation.ts"() {
    init_event();
    init_lifecycle();
    shortcutEvent = Object.freeze(function(callback, context) {
      const handle = setTimeout(callback.bind(context), 0);
      return { dispose() {
        clearTimeout(handle);
      } };
    });
    ((CancellationToken7) => {
      function isCancellationToken(thing) {
        if (thing === CancellationToken7.None || thing === CancellationToken7.Cancelled) {
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
      CancellationToken7.isCancellationToken = isCancellationToken;
      CancellationToken7.None = Object.freeze({
        isCancellationRequested: false,
        onCancellationRequested: Event.None
      });
      CancellationToken7.Cancelled = Object.freeze({
        isCancellationRequested: true,
        onCancellationRequested: shortcutEvent
      });
    })(CancellationToken || (CancellationToken = {}));
    MutableToken = class {
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
    CancellationTokenSource = class {
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
  }
});
export { shortcutEvent, CancellationToken, MutableToken, CancellationTokenSource, init_cancellation };
