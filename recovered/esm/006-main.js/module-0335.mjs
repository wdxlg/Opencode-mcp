// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/telemetry/common/errorTelemetry.ts
import { init_objects, safeStringify } from "./module-0121.mjs";
import { __esm } from "./module-0000.mjs";
import { binarySearch, init_arrays } from "./module-0013.mjs";
import { ErrorNoTelemetry, PendingMigrationError, errorHandler, init_errors } from "./module-0010.mjs";
import { ListenerLeakError, init_event } from "./module-0021.mjs";
import { DisposableStore, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { FileOperationError, init_files } from "./module-0072.mjs";


// src/vs/platform/telemetry/common/errorTelemetry.ts
function packErrorForTelemetry(err) {
  if (!err || typeof err !== "object") {
    return { callstack: void 0, msg: safeStringify(err) };
  }
  const callstack = Array.isArray(err.stack) ? err.stack.join("\n") : err.stack;
  const msg = err.message ? err.message : safeStringify(err);
  return { callstack, msg };
}

var ErrorEvent, BaseErrorTelemetry;

var init_errorTelemetry = __esm({
  "src/vs/platform/telemetry/common/errorTelemetry.ts"() {
    init_arrays();
    init_errors();
    init_event();
    init_lifecycle();
    init_objects();
    init_files();
    ((ErrorEvent2) => {
      function compare4(a, b) {
        if (a.callstack < b.callstack) {
          return -1;
        } else if (a.callstack > b.callstack) {
          return 1;
        }
        return 0;
      }
      ErrorEvent2.compare = compare4;
    })(ErrorEvent || (ErrorEvent = {}));
    BaseErrorTelemetry = class _BaseErrorTelemetry {
      constructor(telemetryService, flushDelay = _BaseErrorTelemetry.ERROR_FLUSH_TIMEOUT) {
        this._flushHandle = void 0;
        this._buffer = [];
        this._disposables = new DisposableStore();
        this._telemetryService = telemetryService;
        this._flushDelay = flushDelay;
        const unbind = errorHandler.addListener((err) => this._onErrorEvent(err));
        this._disposables.add(toDisposable(unbind));
        this.installErrorListeners();
      }
      static {
        this.ERROR_FLUSH_TIMEOUT = 5 * 1e3;
      }
      dispose() {
        clearTimeout(this._flushHandle);
        this._flushBuffer();
        this._disposables.dispose();
      }
      installErrorListeners() {
      }
      _onErrorEvent(err) {
        if (!err || err.code) {
          return;
        }
        if (err.detail && err.detail.stack) {
          err = err.detail;
        }
        if (ErrorNoTelemetry.isErrorNoTelemetry(err) || err instanceof FileOperationError || PendingMigrationError.is(err) || typeof err?.message === "string" && err.message.includes("Unable to read file")) {
          return;
        }
        const { callstack, msg } = packErrorForTelemetry(err);
        if (!callstack) {
          return;
        }
        const errorEvent = { msg, callstack };
        if (ListenerLeakError.is(err)) {
          errorEvent.kind = err.kind;
          errorEvent.listenerCount = err.listenerCount;
        }
        this._enqueue(errorEvent);
      }
      _enqueue(e) {
        const idx = binarySearch(this._buffer, e, ErrorEvent.compare);
        if (idx < 0) {
          e.count = 1;
          this._buffer.splice(~idx, 0, e);
        } else {
          if (!this._buffer[idx].count) {
            this._buffer[idx].count = 0;
          }
          this._buffer[idx].count += 1;
        }
        if (this._flushHandle === void 0) {
          this._flushHandle = setTimeout(() => {
            this._flushBuffer();
            this._flushHandle = void 0;
          }, this._flushDelay);
        }
      }
      _flushBuffer() {
        for (const error of this._buffer) {
          this._telemetryService.publicLogError2("UnhandledError", error);
        }
        this._buffer.length = 0;
      }
    };
  }
});
export { packErrorForTelemetry, ErrorEvent, BaseErrorTelemetry, init_errorTelemetry };
