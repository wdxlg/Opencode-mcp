// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/errors.ts



// src/vs/base/common/errors.ts
var ErrorHandler = class {
  constructor() {
    this.listeners = [];
    this.unexpectedErrorHandler = function(e4) {
      setTimeout(() => {
        if (e4.stack) {
          if (ErrorNoTelemetry.isErrorNoTelemetry(e4)) {
            throw new ErrorNoTelemetry(e4.message + "\n\n" + e4.stack);
          }
          throw new Error(e4.message + "\n\n" + e4.stack);
        }
        throw e4;
      }, 0);
    };
  }
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this._removeListener(listener);
    };
  }
  emit(e4) {
    this.listeners.forEach((listener) => {
      listener(e4);
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
  onUnexpectedError(e4) {
    this.unexpectedErrorHandler(e4);
    this.emit(e4);
  }
  // For external errors, we don't want the listeners to be called
  onUnexpectedExternalError(e4) {
    this.unexpectedErrorHandler(e4);
  }
};

var errorHandler = new ErrorHandler();

function setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
  errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
}

function onBugIndicatingError(e4) {
  errorHandler.onUnexpectedError(e4);
  return void 0;
}

function onUnexpectedError(e4) {
  if (!isCancellationError(e4)) {
    errorHandler.onUnexpectedError(e4);
  }
  return void 0;
}

function onUnexpectedExternalError(e4) {
  if (!isCancellationError(e4)) {
    errorHandler.onUnexpectedExternalError(e4);
  }
  return void 0;
}

function hasErrorCode(error) {
  return Object.hasOwn(error, "code");
}

function getErrorCode(error) {
  if (!error || typeof error !== "object" || !hasErrorCode(error)) {
    return void 0;
  }
  const code = error.code;
  return typeof code === "string" || typeof code === "number" ? String(code) : void 0;
}

function transformErrorForSerialization(error) {
  if (error instanceof Error) {
    const { name, message, cause } = error;
    const stack = error.stacktrace || error.stack;
    return {
      $isError: true,
      name,
      message,
      stack,
      noTelemetry: ErrorNoTelemetry.isErrorNoTelemetry(error),
      cause: cause ? transformErrorForSerialization(cause) : void 0,
      code: error.code
    };
  }
  return error;
}

function transformErrorFromSerialization(data) {
  let error;
  if (data.noTelemetry) {
    error = new ErrorNoTelemetry();
  } else {
    error = new Error();
    error.name = data.name;
  }
  error.message = data.message;
  error.stack = data.stack;
  if (data.code) {
    error.code = data.code;
  }
  if (data.cause) {
    error.cause = transformErrorFromSerialization(data.cause);
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

function illegalArgument(name) {
  if (name) {
    return new Error(`Illegal argument: ${name}`);
  } else {
    return new Error("Illegal argument");
  }
}

function illegalState(name) {
  if (name) {
    return new Error(`Illegal state: ${name}`);
  } else {
    return new Error("Illegal state");
  }
}

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
export { setUnexpectedErrorHandler, onBugIndicatingError, onUnexpectedError, onUnexpectedExternalError, hasErrorCode, getErrorCode, transformErrorForSerialization, transformErrorFromSerialization, isCancellationError, canceled, illegalArgument, illegalState, getErrorMessage, ErrorHandler, errorHandler, canceledName, CancellationError, PendingMigrationError, NotSupportedError, ErrorNoTelemetry, BugIndicatingError };
