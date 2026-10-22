// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/log/common/log.ts
import { init_types, isNumber, isString } from "./module-0016.mjs";
import { Disposable, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { init_errorMessage, toErrorMessage } from "./module-0047.mjs";
import { __esm } from "./module-0000.mjs";
import { init_nls } from "./module-0005.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { hash, init_hash } from "./module-0067.mjs";
import { ResourceMap, init_map } from "./module-0014.mjs";
import { init_platform, isWindows2 } from "./module-0006.mjs";
import { init_resources, joinPath } from "./module-0032.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { RawContextKey, init_contextkey } from "./module-0074.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/log/common/log.ts
function now() {
  return (/* @__PURE__ */ new Date()).toISOString();
}

function isLogLevel(thing) {
  return isNumber(thing);
}

function canLog(loggerLevel, messageLevel) {
  return loggerLevel !== 0 /* Off */ && loggerLevel <= messageLevel;
}

function log(logger, level, message) {
  switch (level) {
    case 1 /* Trace */:
      logger.trace(message);
      break;
    case 2 /* Debug */:
      logger.debug(message);
      break;
    case 3 /* Info */:
      logger.info(message);
      break;
    case 4 /* Warning */:
      logger.warn(message);
      break;
    case 5 /* Error */:
      logger.error(message);
      break;
    case 0 /* Off */:
      break;
    default:
      throw new Error(`Invalid log level ${level}`);
  }
}

function getConsoleMethod(method) {
  switch (method) {
    case "debug":
      return console.debug;
    case "error":
      return console.error;
    case "info":
      return console.info;
    case "log":
      return console.log;
    case "warn":
      return console.warn;
  }
}

function setConsoleMethod(method, fn) {
  switch (method) {
    case "debug":
      console.debug = fn;
      break;
    case "error":
      console.error = fn;
      break;
    case "info":
      console.info = fn;
      break;
    case "log":
      console.log = fn;
      break;
    case "warn":
      console.warn = fn;
      break;
  }
}

function logToConsole(method, ...args2) {
  if (isConsoleForwarding) {
    return;
  }
  isLogServiceConsoleEcho = true;
  try {
    getConsoleMethod(method).apply(console, args2);
  } finally {
    isLogServiceConsoleEcho = false;
  }
}

function registerDevConsoleLogForwarder(logService) {
  const originalConsoleMethods = {
    debug: console.debug,
    error: console.error,
    info: console.info,
    log: console.log,
    warn: console.warn
  };
  const forward = (method, level, args2) => {
    if (!isLogServiceConsoleEcho) {
      isConsoleForwarding = true;
      try {
        log(logService, level, format2(args2));
      } catch {
      } finally {
        isConsoleForwarding = false;
      }
    }
    originalConsoleMethods[method].apply(console, args2);
  };
  const wrappers = {
    debug: (...args2) => forward("debug", 2 /* Debug */, args2),
    error: (...args2) => forward("error", 5 /* Error */, args2),
    info: (...args2) => forward("info", 3 /* Info */, args2),
    log: (...args2) => forward("log", 3 /* Info */, args2),
    warn: (...args2) => forward("warn", 4 /* Warning */, args2)
  };
  setConsoleMethod("debug", wrappers.debug);
  setConsoleMethod("error", wrappers.error);
  setConsoleMethod("info", wrappers.info);
  setConsoleMethod("log", wrappers.log);
  setConsoleMethod("warn", wrappers.warn);
  return toDisposable(() => {
    if (console.debug === wrappers.debug) {
      console.debug = originalConsoleMethods.debug;
    }
    if (console.error === wrappers.error) {
      console.error = originalConsoleMethods.error;
    }
    if (console.info === wrappers.info) {
      console.info = originalConsoleMethods.info;
    }
    if (console.log === wrappers.log) {
      console.log = originalConsoleMethods.log;
    }
    if (console.warn === wrappers.warn) {
      console.warn = originalConsoleMethods.warn;
    }
  });
}

function format2(args2, verbose = false) {
  let result = "";
  for (let i = 0; i < args2.length; i++) {
    let a = args2[i];
    if (a instanceof Error) {
      a = toErrorMessage(a, verbose);
    }
    if (typeof a === "object") {
      try {
        a = JSON.stringify(a);
      } catch (e) {
      }
    }
    result += (i > 0 ? " " : "") + a;
  }
  return result;
}

function getLogLevel(environmentService) {
  if (environmentService.verbose) {
    return 1 /* Trace */;
  }
  if (typeof environmentService.logLevel === "string") {
    const logLevel = parseLogLevel(environmentService.logLevel.toLowerCase());
    if (logLevel !== void 0) {
      return logLevel;
    }
  }
  return DEFAULT_LOG_LEVEL;
}

function LogLevelToString(logLevel) {
  switch (logLevel) {
    case 1 /* Trace */:
      return "trace";
    case 2 /* Debug */:
      return "debug";
    case 3 /* Info */:
      return "info";
    case 4 /* Warning */:
      return "warn";
    case 5 /* Error */:
      return "error";
    case 0 /* Off */:
      return "off";
  }
}

function parseLogLevel(logLevel) {
  switch (logLevel) {
    case "trace":
      return 1 /* Trace */;
    case "debug":
      return 2 /* Debug */;
    case "info":
      return 3 /* Info */;
    case "warn":
      return 4 /* Warning */;
    case "error":
      return 5 /* Error */;
    case "critical":
      return 5 /* Error */;
    case "off":
      return 0 /* Off */;
  }
  return void 0;
}

var ILogService, ILoggerService, DEFAULT_LOG_LEVEL, isDevConsoleLogForwardingEnabled, isConsoleForwarding, isLogServiceConsoleEcho, AbstractLogger, AbstractMessageLogger, ConsoleMainLogger, MultiplexLogger, AbstractLoggerService, NullLogger, NullLogService, CONTEXT_LOG_LEVEL;

var init_log = __esm({
  "src/vs/platform/log/common/log.ts"() {
    init_nls();
    init_errorMessage();
    init_event();
    init_hash();
    init_lifecycle();
    init_map();
    init_platform();
    init_resources();
    init_types();
    init_uri();
    init_contextkey();
    init_instantiation();
    ILogService = createDecorator("logService");
    ILoggerService = createDecorator("loggerService");
    DEFAULT_LOG_LEVEL = 3 /* Info */;
    isDevConsoleLogForwardingEnabled = false;
    isConsoleForwarding = false;
    isLogServiceConsoleEcho = false;
    AbstractLogger = class extends Disposable {
      constructor() {
        super(...arguments);
        this.level = DEFAULT_LOG_LEVEL;
        this._onDidChangeLogLevel = this._register(new Emitter());
      }
      get onDidChangeLogLevel() {
        return this._onDidChangeLogLevel.event;
      }
      setLevel(level) {
        if (this.level !== level) {
          this.level = level;
          this._onDidChangeLogLevel.fire(this.level);
        }
      }
      getLevel() {
        return this.level;
      }
      checkLogLevel(level) {
        return canLog(this.level, level);
      }
      canLog(level) {
        if (this._store.isDisposed) {
          return false;
        }
        return this.checkLogLevel(level);
      }
    };
    AbstractMessageLogger = class extends AbstractLogger {
      constructor(logAlways) {
        super();
        this.logAlways = logAlways;
      }
      checkLogLevel(level) {
        return this.logAlways || super.checkLogLevel(level);
      }
      trace(message, ...args2) {
        if (this.canLog(1 /* Trace */)) {
          this.log(1 /* Trace */, format2([message, ...args2], true));
        }
      }
      debug(message, ...args2) {
        if (this.canLog(2 /* Debug */)) {
          this.log(2 /* Debug */, format2([message, ...args2]));
        }
      }
      info(message, ...args2) {
        if (this.canLog(3 /* Info */)) {
          this.log(3 /* Info */, format2([message, ...args2]));
        }
      }
      warn(message, ...args2) {
        if (this.canLog(4 /* Warning */)) {
          this.log(4 /* Warning */, format2([message, ...args2]));
        }
      }
      error(message, ...args2) {
        if (this.canLog(5 /* Error */)) {
          if (message instanceof Error) {
            const array = Array.prototype.slice.call(arguments);
            array[0] = message.stack;
            this.log(5 /* Error */, format2(array));
          } else {
            this.log(5 /* Error */, format2([message, ...args2]));
          }
        }
      }
      flush() {
      }
    };
    ConsoleMainLogger = class extends AbstractLogger {
      constructor(logLevel = DEFAULT_LOG_LEVEL) {
        super();
        this.setLevel(logLevel);
        this.useColors = !isWindows2;
      }
      trace(message, ...args2) {
        if (this.canLog(1 /* Trace */)) {
          if (this.useColors) {
            logToConsole("log", `\x1B[90m[main ${now()}]\x1B[0m`, message, ...args2);
          } else {
            logToConsole("log", `[main ${now()}]`, message, ...args2);
          }
        }
      }
      debug(message, ...args2) {
        if (this.canLog(2 /* Debug */)) {
          if (this.useColors) {
            logToConsole("log", `\x1B[90m[main ${now()}]\x1B[0m`, message, ...args2);
          } else {
            logToConsole("log", `[main ${now()}]`, message, ...args2);
          }
        }
      }
      info(message, ...args2) {
        if (this.canLog(3 /* Info */)) {
          if (this.useColors) {
            logToConsole("log", `\x1B[90m[main ${now()}]\x1B[0m`, message, ...args2);
          } else {
            logToConsole("log", `[main ${now()}]`, message, ...args2);
          }
        }
      }
      warn(message, ...args2) {
        if (this.canLog(4 /* Warning */)) {
          if (this.useColors) {
            logToConsole("warn", `\x1B[93m[main ${now()}]\x1B[0m`, message, ...args2);
          } else {
            logToConsole("warn", `[main ${now()}]`, message, ...args2);
          }
        }
      }
      error(message, ...args2) {
        if (this.canLog(5 /* Error */)) {
          if (this.useColors) {
            logToConsole("error", `\x1B[91m[main ${now()}]\x1B[0m`, message, ...args2);
          } else {
            logToConsole("error", `[main ${now()}]`, message, ...args2);
          }
        }
      }
      flush() {
      }
    };
    MultiplexLogger = class extends AbstractLogger {
      constructor(loggers) {
        super();
        this.loggers = loggers;
        if (loggers.length) {
          this.setLevel(loggers[0].getLevel());
        }
      }
      setLevel(level) {
        for (const logger of this.loggers) {
          logger.setLevel(level);
        }
        super.setLevel(level);
      }
      trace(message, ...args2) {
        for (const logger of this.loggers) {
          logger.trace(message, ...args2);
        }
      }
      debug(message, ...args2) {
        for (const logger of this.loggers) {
          logger.debug(message, ...args2);
        }
      }
      info(message, ...args2) {
        for (const logger of this.loggers) {
          logger.info(message, ...args2);
        }
      }
      warn(message, ...args2) {
        for (const logger of this.loggers) {
          logger.warn(message, ...args2);
        }
      }
      error(message, ...args2) {
        for (const logger of this.loggers) {
          logger.error(message, ...args2);
        }
      }
      flush() {
        for (const logger of this.loggers) {
          logger.flush();
        }
      }
      dispose() {
        for (const logger of this.loggers) {
          logger.dispose();
        }
        super.dispose();
      }
    };
    AbstractLoggerService = class extends Disposable {
      constructor(logLevel, logsHome, loggerResources) {
        super();
        this.logLevel = logLevel;
        this.logsHome = logsHome;
        this._loggers = new ResourceMap();
        this._onDidChangeLoggers = this._register(new Emitter());
        this.onDidChangeLoggers = this._onDidChangeLoggers.event;
        this._onDidChangeLogLevel = this._register(new Emitter());
        this.onDidChangeLogLevel = this._onDidChangeLogLevel.event;
        this._onDidChangeVisibility = this._register(new Emitter());
        this.onDidChangeVisibility = this._onDidChangeVisibility.event;
        if (loggerResources) {
          for (const loggerResource of loggerResources) {
            this._loggers.set(loggerResource.resource, { logger: void 0, info: loggerResource });
          }
        }
      }
      getLoggerEntry(resourceOrId) {
        if (isString(resourceOrId)) {
          return [...this._loggers.values()].find((logger) => logger.info.id === resourceOrId);
        }
        return this._loggers.get(resourceOrId);
      }
      getLogger(resourceOrId) {
        return this.getLoggerEntry(resourceOrId)?.logger;
      }
      createLogger(idOrResource, options) {
        const resource = this.toResource(idOrResource);
        const id2 = isString(idOrResource) ? idOrResource : options?.id ?? hash(resource.toString()).toString(16);
        let logger = this._loggers.get(resource)?.logger;
        const logLevel = options?.logLevel === "always" ? 1 /* Trace */ : options?.logLevel;
        if (!logger) {
          logger = this.doCreateLogger(resource, logLevel ?? this.getLogLevel(resource) ?? this.logLevel, { ...options, id: id2 });
        }
        const loggerEntry = {
          logger,
          info: {
            resource,
            id: id2,
            logLevel,
            name: options?.name,
            hidden: options?.hidden,
            group: options?.group,
            extensionId: options?.extensionId,
            when: options?.when
          }
        };
        this.registerLogger(loggerEntry.info);
        this._loggers.set(resource, loggerEntry);
        return logger;
      }
      toResource(idOrResource) {
        return isString(idOrResource) ? joinPath(this.logsHome, `${idOrResource.replace(/[\\/:\*\?"<>\|]/g, "")}.log`) : idOrResource;
      }
      setLogLevel(arg1, arg2) {
        if (URI.isUri(arg1)) {
          const resource = arg1;
          const logLevel = arg2;
          const logger = this._loggers.get(resource);
          if (logger && logLevel !== logger.info.logLevel) {
            logger.info.logLevel = logLevel === this.logLevel ? void 0 : logLevel;
            logger.logger?.setLevel(logLevel);
            this._loggers.set(logger.info.resource, logger);
            this._onDidChangeLogLevel.fire([resource, logLevel]);
          }
        } else {
          this.logLevel = arg1;
          for (const [resource, logger] of this._loggers.entries()) {
            if (this._loggers.get(resource)?.info.logLevel === void 0) {
              logger.logger?.setLevel(this.logLevel);
            }
          }
          this._onDidChangeLogLevel.fire(this.logLevel);
        }
      }
      setVisibility(resourceOrId, visibility) {
        const logger = this.getLoggerEntry(resourceOrId);
        if (logger && visibility !== !logger.info.hidden) {
          logger.info.hidden = !visibility;
          this._loggers.set(logger.info.resource, logger);
          this._onDidChangeVisibility.fire([logger.info.resource, visibility]);
        }
      }
      getLogLevel(resource) {
        let logLevel;
        if (resource) {
          logLevel = this._loggers.get(resource)?.info.logLevel;
        }
        return logLevel ?? this.logLevel;
      }
      registerLogger(resource) {
        const existing = this._loggers.get(resource.resource);
        if (existing) {
          if (existing.info.hidden !== resource.hidden) {
            this.setVisibility(resource.resource, !resource.hidden);
          }
        } else {
          this._loggers.set(resource.resource, { info: resource, logger: void 0 });
          this._onDidChangeLoggers.fire({ added: [resource], removed: [] });
        }
      }
      deregisterLogger(idOrResource) {
        const resource = this.toResource(idOrResource);
        const existing = this._loggers.get(resource);
        if (existing) {
          if (existing.logger) {
            existing.logger.dispose();
          }
          this._loggers.delete(resource);
          this._onDidChangeLoggers.fire({ added: [], removed: [existing.info] });
        }
      }
      *getRegisteredLoggers() {
        for (const entry of this._loggers.values()) {
          yield entry.info;
        }
      }
      getRegisteredLogger(resource) {
        return this._loggers.get(resource)?.info;
      }
      dispose() {
        this._loggers.forEach((logger) => logger.logger?.dispose());
        this._loggers.clear();
        super.dispose();
      }
    };
    NullLogger = class {
      constructor() {
        this.onDidChangeLogLevel = new Emitter().event;
      }
      setLevel(level) {
      }
      getLevel() {
        return 3 /* Info */;
      }
      trace(message, ...args2) {
      }
      debug(message, ...args2) {
      }
      info(message, ...args2) {
      }
      warn(message, ...args2) {
      }
      error(message, ...args2) {
      }
      critical(message, ...args2) {
      }
      dispose() {
      }
      flush() {
      }
    };
    NullLogService = class extends NullLogger {
    };
    CONTEXT_LOG_LEVEL = new RawContextKey("logLevel", LogLevelToString(3 /* Info */));
  }
});
export { now, isLogLevel, canLog, log, getConsoleMethod, setConsoleMethod, logToConsole, registerDevConsoleLogForwarder, format2, getLogLevel, LogLevelToString, parseLogLevel, ILogService, ILoggerService, DEFAULT_LOG_LEVEL, isDevConsoleLogForwardingEnabled, isConsoleForwarding, isLogServiceConsoleEcho, AbstractLogger, AbstractMessageLogger, ConsoleMainLogger, MultiplexLogger, AbstractLoggerService, NullLogger, NullLogService, CONTEXT_LOG_LEVEL, init_log };
