// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/logging/logging.ts



// src/vs/base/common/observableInternal/logging/logging.ts
var globalObservableLogger;

function addLogger(logger) {
  if (!globalObservableLogger) {
    globalObservableLogger = logger;
  } else if (globalObservableLogger instanceof ComposedLogger) {
    globalObservableLogger.loggers.push(logger);
  } else {
    globalObservableLogger = new ComposedLogger([globalObservableLogger, logger]);
  }
}

function getLogger() {
  return globalObservableLogger;
}

var globalObservableLoggerFn = void 0;

function setLogObservableFn(fn) {
  globalObservableLoggerFn = fn;
}

function logObservable(obs) {
  if (globalObservableLoggerFn) {
    globalObservableLoggerFn(obs);
  }
}

var ComposedLogger = class {
  constructor(loggers) {
    this.loggers = loggers;
  }
  handleObservableCreated(observable, location2) {
    for (const logger of this.loggers) {
      logger.handleObservableCreated(observable, location2);
    }
  }
  handleOnListenerCountChanged(observable, newCount) {
    for (const logger of this.loggers) {
      logger.handleOnListenerCountChanged(observable, newCount);
    }
  }
  handleObservableUpdated(observable, info) {
    for (const logger of this.loggers) {
      logger.handleObservableUpdated(observable, info);
    }
  }
  handleAutorunCreated(autorun2, location2) {
    for (const logger of this.loggers) {
      logger.handleAutorunCreated(autorun2, location2);
    }
  }
  handleAutorunDisposed(autorun2) {
    for (const logger of this.loggers) {
      logger.handleAutorunDisposed(autorun2);
    }
  }
  handleAutorunDependencyChanged(autorun2, observable, change) {
    for (const logger of this.loggers) {
      logger.handleAutorunDependencyChanged(autorun2, observable, change);
    }
  }
  handleAutorunStarted(autorun2) {
    for (const logger of this.loggers) {
      logger.handleAutorunStarted(autorun2);
    }
  }
  handleAutorunFinished(autorun2) {
    for (const logger of this.loggers) {
      logger.handleAutorunFinished(autorun2);
    }
  }
  handleDerivedDependencyChanged(derived2, observable, change) {
    for (const logger of this.loggers) {
      logger.handleDerivedDependencyChanged(derived2, observable, change);
    }
  }
  handleDerivedCleared(observable) {
    for (const logger of this.loggers) {
      logger.handleDerivedCleared(observable);
    }
  }
  handleBeginTransaction(transaction2) {
    for (const logger of this.loggers) {
      logger.handleBeginTransaction(transaction2);
    }
  }
  handleEndTransaction(transaction2) {
    for (const logger of this.loggers) {
      logger.handleEndTransaction(transaction2);
    }
  }
};
export { addLogger, getLogger, setLogObservableFn, logObservable, globalObservableLogger, globalObservableLoggerFn, ComposedLogger };
