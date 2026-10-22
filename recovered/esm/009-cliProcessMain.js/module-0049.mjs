// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/log/common/log.ts
import { createDecorator } from "./module-0030.mjs";
import { toErrorMessage } from "./module-0029.mjs";
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0017.mjs";
import { ResourceMap } from "./module-0007.mjs";
import { isString } from "./module-0009.mjs";
import { hash } from "./module-0046.mjs";
import { joinPath } from "./module-0026.mjs";
import { URI } from "./module-0024.mjs";
import { RawContextKey } from "./module-0048.mjs";


// src/vs/platform/log/common/log.ts
var ILogService = createDecorator("logService");

var ILoggerService = createDecorator("loggerService");

var DEFAULT_LOG_LEVEL = 3 /* Info */;

function canLog(loggerLevel, messageLevel) {
  return loggerLevel !== 0 /* Off */ && loggerLevel <= messageLevel;
}

var isConsoleForwarding = false;

var isLogServiceConsoleEcho = false;

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

function logToConsole(method, ...args) {
  if (isConsoleForwarding) {
    return;
  }
  isLogServiceConsoleEcho = true;
  try {
    getConsoleMethod(method).apply(console, args);
  } finally {
    isLogServiceConsoleEcho = false;
  }
}

function format4(args, verbose = false) {
  let result = "";
  for (let i = 0; i < args.length; i++) {
    let a = args[i];
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

var AbstractLogger = class extends Disposable {
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

var AbstractMessageLogger = class extends AbstractLogger {
  constructor(logAlways) {
    super();
    this.logAlways = logAlways;
  }
  checkLogLevel(level) {
    return this.logAlways || super.checkLogLevel(level);
  }
  trace(message, ...args) {
    if (this.canLog(1 /* Trace */)) {
      this.log(1 /* Trace */, format4([message, ...args], true));
    }
  }
  debug(message, ...args) {
    if (this.canLog(2 /* Debug */)) {
      this.log(2 /* Debug */, format4([message, ...args]));
    }
  }
  info(message, ...args) {
    if (this.canLog(3 /* Info */)) {
      this.log(3 /* Info */, format4([message, ...args]));
    }
  }
  warn(message, ...args) {
    if (this.canLog(4 /* Warning */)) {
      this.log(4 /* Warning */, format4([message, ...args]));
    }
  }
  error(message, ...args) {
    if (this.canLog(5 /* Error */)) {
      if (message instanceof Error) {
        const array = Array.prototype.slice.call(arguments);
        array[0] = message.stack;
        this.log(5 /* Error */, format4(array));
      } else {
        this.log(5 /* Error */, format4([message, ...args]));
      }
    }
  }
  flush() {
  }
};

var ConsoleLogger = class extends AbstractLogger {
  constructor(logLevel = DEFAULT_LOG_LEVEL, useColors = true) {
    super();
    this.useColors = useColors;
    this.setLevel(logLevel);
  }
  trace(message, ...args) {
    if (this.canLog(1 /* Trace */)) {
      if (this.useColors) {
        logToConsole("log", "%cTRACE", "color: #888", message, ...args);
      } else {
        logToConsole("log", message, ...args);
      }
    }
  }
  debug(message, ...args) {
    if (this.canLog(2 /* Debug */)) {
      if (this.useColors) {
        logToConsole("log", "%cDEBUG", "background: #eee; color: #888", message, ...args);
      } else {
        logToConsole("log", message, ...args);
      }
    }
  }
  info(message, ...args) {
    if (this.canLog(3 /* Info */)) {
      if (this.useColors) {
        logToConsole("log", "%c INFO", "color: #33f", message, ...args);
      } else {
        logToConsole("log", message, ...args);
      }
    }
  }
  warn(message, ...args) {
    if (this.canLog(4 /* Warning */)) {
      if (this.useColors) {
        logToConsole("warn", "%c WARN", "color: #993", message, ...args);
      } else {
        logToConsole("log", message, ...args);
      }
    }
  }
  error(message, ...args) {
    if (this.canLog(5 /* Error */)) {
      if (this.useColors) {
        logToConsole("error", "%c  ERR", "color: #f33", message, ...args);
      } else {
        logToConsole("error", message, ...args);
      }
    }
  }
  flush() {
  }
};

var MultiplexLogger = class extends AbstractLogger {
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
  trace(message, ...args) {
    for (const logger of this.loggers) {
      logger.trace(message, ...args);
    }
  }
  debug(message, ...args) {
    for (const logger of this.loggers) {
      logger.debug(message, ...args);
    }
  }
  info(message, ...args) {
    for (const logger of this.loggers) {
      logger.info(message, ...args);
    }
  }
  warn(message, ...args) {
    for (const logger of this.loggers) {
      logger.warn(message, ...args);
    }
  }
  error(message, ...args) {
    for (const logger of this.loggers) {
      logger.error(message, ...args);
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

var AbstractLoggerService = class extends Disposable {
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

var NullLogger = class {
  constructor() {
    this.onDidChangeLogLevel = new Emitter().event;
  }
  setLevel(level) {
  }
  getLevel() {
    return 3 /* Info */;
  }
  trace(message, ...args) {
  }
  debug(message, ...args) {
  }
  info(message, ...args) {
  }
  warn(message, ...args) {
  }
  error(message, ...args) {
  }
  critical(message, ...args) {
  }
  dispose() {
  }
  flush() {
  }
};

var NullLogService = class extends NullLogger {
};

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

var CONTEXT_LOG_LEVEL = new RawContextKey("logLevel", LogLevelToString(3 /* Info */));
export { canLog, getConsoleMethod, logToConsole, format4, getLogLevel, LogLevelToString, parseLogLevel, ILogService, ILoggerService, DEFAULT_LOG_LEVEL, isConsoleForwarding, isLogServiceConsoleEcho, AbstractLogger, AbstractMessageLogger, ConsoleLogger, MultiplexLogger, AbstractLoggerService, NullLogger, NullLogService, CONTEXT_LOG_LEVEL };
