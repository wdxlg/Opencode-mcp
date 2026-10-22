// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/log/common/logIpc.ts
import { AbstractLoggerService, AbstractMessageLogger, AdapterLogger, isLogLevel } from "./module-0095.mjs";
import { URI } from "./module-0032.mjs";
import { Disposable } from "./module-0012.mjs";


// src/vs/platform/log/common/logIpc.ts
var LoggerChannelClient = class extends AbstractLoggerService {
  constructor(windowId, logLevel, logsHome, loggers, channel) {
    super(logLevel, logsHome, loggers);
    this.windowId = windowId;
    this.channel = channel;
    this._register(channel.listen("onDidChangeLogLevel", windowId)((arg) => {
      if (isLogLevel(arg)) {
        super.setLogLevel(arg);
      } else {
        super.setLogLevel(URI.revive(arg[0]), arg[1]);
      }
    }));
    this._register(channel.listen("onDidChangeVisibility", windowId)(([resource, visibility]) => super.setVisibility(URI.revive(resource), visibility)));
    this._register(channel.listen("onDidChangeLoggers", windowId)(({ added, removed }) => {
      for (const loggerResource of added) {
        super.registerLogger({ ...loggerResource, resource: URI.revive(loggerResource.resource) });
      }
      for (const loggerResource of removed) {
        super.deregisterLogger(loggerResource.resource);
      }
    }));
  }
  createConsoleMainLogger() {
    return new AdapterLogger({
      log: (level, args2) => {
        this.channel.call("consoleLog", [level, args2]);
      }
    });
  }
  registerLogger(logger) {
    super.registerLogger(logger);
    this.channel.call("registerLogger", [logger, this.windowId]);
  }
  deregisterLogger(idOrResource) {
    const resource = this.toResource(idOrResource);
    super.deregisterLogger(resource);
    this.channel.call("deregisterLogger", [resource, this.windowId]);
  }
  setLogLevel(arg1, arg2) {
    super.setLogLevel(arg1, arg2);
    this.channel.call("setLogLevel", [arg1, arg2]);
  }
  setVisibility(resourceOrId, visibility) {
    super.setVisibility(resourceOrId, visibility);
    this.channel.call("setVisibility", [this.toResource(resourceOrId), visibility]);
  }
  doCreateLogger(file, logLevel, options3) {
    return new Logger3(this.channel, file, logLevel, options3, this.windowId);
  }
  static setLogLevel(channel, arg1, arg2) {
    return channel.call("setLogLevel", [arg1, arg2]);
  }
};

var Logger3 = class extends AbstractMessageLogger {
  constructor(channel, file, logLevel, loggerOptions, windowId) {
    super(loggerOptions?.logLevel === "always");
    this.channel = channel;
    this.file = file;
    this.isLoggerCreated = false;
    this.buffer = [];
    this.setLevel(logLevel);
    this.channel.call("createLogger", [file, loggerOptions, windowId]).then(() => {
      this.doLog(this.buffer);
      this.isLoggerCreated = true;
    });
  }
  log(level, message) {
    const messages = [[level, message]];
    if (this.isLoggerCreated) {
      this.doLog(messages);
    } else {
      this.buffer.push(...messages);
    }
  }
  doLog(messages) {
    this.channel.call("log", [this.file, messages]);
  }
};

var RemoteLoggerChannelClient = class extends Disposable {
  constructor(loggerService, channel) {
    super();
    channel.call("setLogLevel", [loggerService.getLogLevel()]);
    this._register(loggerService.onDidChangeLogLevel((arg) => channel.call("setLogLevel", [arg])));
    channel.call("getRegisteredLoggers").then((loggers) => {
      for (const loggerResource of loggers) {
        loggerService.registerLogger({ ...loggerResource, resource: URI.revive(loggerResource.resource) });
      }
    });
    this._register(channel.listen("onDidChangeVisibility")(([resource, visibility]) => loggerService.setVisibility(URI.revive(resource), visibility)));
    this._register(channel.listen("onDidChangeLoggers")(({ added, removed }) => {
      for (const loggerResource of added) {
        loggerService.registerLogger({ ...loggerResource, resource: URI.revive(loggerResource.resource) });
      }
      for (const loggerResource of removed) {
        loggerService.deregisterLogger(loggerResource.resource);
      }
    }));
  }
};
export { LoggerChannelClient, Logger3, RemoteLoggerChannelClient };
