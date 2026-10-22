// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/telemetry/browser/errorTelemetry.ts
import { BaseErrorTelemetry } from "./module-1828.mjs";
import { mainWindow } from "./module-0002.mjs";
import { toDisposable } from "./module-0012.mjs";
import { ErrorNoTelemetry } from "./module-0004.mjs";
import { getRecentDisposableResizeObserverContextForLoopError } from "./module-0075.mjs";


// src/vs/platform/telemetry/browser/errorTelemetry.ts
var ErrorTelemetry = class extends BaseErrorTelemetry {
  installErrorListeners() {
    let oldOnError;
    const that = this;
    if (typeof mainWindow.onerror === "function") {
      oldOnError = mainWindow.onerror;
    }
    mainWindow.onerror = function(message, filename, line, column, error) {
      that._onUncaughtError(message, filename, line, column, error);
      oldOnError?.apply(this, [message, filename, line, column, error]);
    };
    this._disposables.add(toDisposable(() => {
      if (oldOnError) {
        mainWindow.onerror = oldOnError;
      }
    }));
  }
  _onUncaughtError(msg, file, line, column, err) {
    const data = {
      callstack: msg,
      msg,
      file,
      line,
      column
    };
    if (err) {
      if (ErrorNoTelemetry.isErrorNoTelemetry(err)) {
        return;
      }
      const { name, message, stack } = err;
      data.uncaught_error_name = name;
      if (message) {
        data.uncaught_error_msg = message;
      }
      if (stack) {
        data.callstack = Array.isArray(err.stack) ? err.stack = err.stack.join("\n") : err.stack;
      }
    }
    const resizeObserverContext = getRecentDisposableResizeObserverContextForLoopError(msg);
    if (resizeObserverContext) {
      data.msg = resizeObserverContext;
      data.callstack = resizeObserverContext;
    }
    this._enqueue(data);
  }
};
export { ErrorTelemetry };
