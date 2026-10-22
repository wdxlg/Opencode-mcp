// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/errors.ts



// src/vs/base/common/errors.ts
var ErrorHandler = class {
  constructor() {
    this.listeners = [];
    this.unexpectedErrorHandler = function(e) {
      setTimeout(() => {
        if (e.stack) {
          if (ErrorNoTelemetry.isErrorNoTelemetry(e)) {
            throw new ErrorNoTelemetry(e.message + "\n\n" + e.stack);
          }
          throw new Error(e.message + "\n\n" + e.stack);
        }
        throw e;
      }, 0);
    };
  }
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this._removeListener(listener);
    };
  }
  emit(e) {
    this.listeners.forEach((listener) => {
      listener(e);
    });
  }
  _removeListener(listener) {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }
  setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
    this.unexpectedErrorHandler = newUnexpectedErrorHandler;
  }
  getUnexpectedErrorHandler() {
    return this.unexpectedErrorHandler;
  }
  onUnexpectedError(e) {
    this.unexpectedErrorHandler(e);
    this.emit(e);
  }
  // For external errors, we don't want the listeners to be called
  onUnexpectedExternalError(e) {
    this.unexpectedErrorHandler(e);
  }
};

var errorHandler = new ErrorHandler();

function setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
  errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
}

function onBugIndicatingError(e) {
  errorHandler.onUnexpectedError(e);
  return void 0;
}

function onUnexpectedError(e) {
  if (!isCancellationError(e)) {
    errorHandler.onUnexpectedError(e);
  }
  return void 0;
}

function onUnexpectedExternalError(e) {
  if (!isCancellationError(e)) {
    errorHandler.onUnexpectedExternalError(e);
  }
  return void 0;
}

function transformErrorForSerialization(error) {
  if (error instanceof Error) {
    const { name: name2, message, cause } = error;
    const stack = error.stacktrace || error.stack;
    return {
      $isError: true,
      name: name2,
      message,
      stack,
      noTelemetry: ErrorNoTelemetry.isErrorNoTelemetry(error),
      cause: cause ? transformErrorForSerialization(cause) : void 0,
      code: error.code
    };
  }
  return error;
}

function transformErrorFromSerialization(data2) {
  let error;
  if (data2.noTelemetry) {
    error = new ErrorNoTelemetry();
  } else {
    error = new Error();
    error.name = data2.name;
  }
  error.message = data2.message;
  error.stack = data2.stack;
  if (data2.code) {
    error.code = data2.code;
  }
  if (data2.cause) {
    error.cause = transformErrorFromSerialization(data2.cause);
  }
  return error;
}

var canceledName = "Canceled";

function isCancellationError(error) {
  if (error instanceof CancellationError) {
    return true;
  }
  return error instanceof Error && error.name === canceledName && error.message === canceledName;
}

var CancellationError = class extends Error {
  constructor() {
    super(canceledName);
    this.name = this.message;
  }
};

var PendingMigrationError = class _PendingMigrationError extends Error {
  static {
    this._name = "PendingMigrationError";
  }
  static is(error) {
    return error instanceof _PendingMigrationError || error instanceof Error && error.name === _PendingMigrationError._name;
  }
  constructor(message) {
    super(message);
    this.name = _PendingMigrationError._name;
  }
};

function canceled() {
  const error = new Error(canceledName);
  error.name = error.message;
  return error;
}

function illegalArgument(name2) {
  if (name2) {
    return new Error(`Illegal argument: ${name2}`);
  } else {
    return new Error("Illegal argument");
  }
}

function illegalState(name2) {
  if (name2) {
    return new Error(`Illegal state: ${name2}`);
  } else {
    return new Error("Illegal state");
  }
}

var ReadonlyError = class extends TypeError {
  constructor(name2) {
    super(name2 ? `${name2} is read-only and cannot be changed` : "Cannot change read-only property");
  }
};

function getErrorMessage(err) {
  if (!err) {
    return "Error";
  }
  if (err.message) {
    return err.message;
  }
  if (err.stack) {
    return err.stack.split("\n")[0];
  }
  return String(err);
}

var NotImplementedError = class extends Error {
  constructor(message) {
    super("NotImplemented");
    if (message) {
      this.message = message;
    }
  }
};

var NotSupportedError = class extends Error {
  constructor(message) {
    super("NotSupported");
    if (message) {
      this.message = message;
    }
  }
};

var ErrorNoTelemetry = class _ErrorNoTelemetry extends Error {
  constructor(msg) {
    super(msg);
    this.name = "CodeExpectedError";
  }
  static fromError(err) {
    if (err instanceof _ErrorNoTelemetry) {
      return err;
    }
    const result = new _ErrorNoTelemetry();
    result.message = err.message;
    result.stack = err.stack;
    return result;
  }
  static isErrorNoTelemetry(err) {
    return err.name === "CodeExpectedError";
  }
};

var BugIndicatingError = class _BugIndicatingError extends Error {
  constructor(message) {
    super(message || "An unexpected bug occurred.");
    Object.setPrototypeOf(this, _BugIndicatingError.prototype);
  }
};
export { setUnexpectedErrorHandler, onBugIndicatingError, onUnexpectedError, onUnexpectedExternalError, transformErrorForSerialization, transformErrorFromSerialization, isCancellationError, canceled, illegalArgument, illegalState, getErrorMessage, ErrorHandler, errorHandler, canceledName, CancellationError, PendingMigrationError, ReadonlyError, NotImplementedError, NotSupportedError, ErrorNoTelemetry, BugIndicatingError };
