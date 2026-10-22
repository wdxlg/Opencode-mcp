// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/log/electron-main/logIpc.ts
import { __esm } from "./module-0000.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { ResourceMap, init_map } from "./module-0014.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { init_log, isLogLevel, log } from "./module-0075.mjs";


// src/vs/platform/log/electron-main/logIpc.ts
var LoggerChannel;

var init_logIpc = __esm({
  "src/vs/platform/log/electron-main/logIpc.ts"() {
    init_lifecycle();
    init_map();
    init_uri();
    init_log();
    LoggerChannel = class extends Disposable {
      constructor(loggerService) {
        super();
        this.loggerService = loggerService;
        this.loggers = new ResourceMap();
        this._register(this.loggerService.onDidChangeLoggers(({ removed }) => {
          for (const loggerResource of removed) {
            this.loggers.delete(loggerResource.resource);
          }
        }));
      }
      listen(_, event, windowId) {
        switch (event) {
          case "onDidChangeLoggers":
            return windowId ? this.loggerService.getOnDidChangeLoggersEvent(windowId) : this.loggerService.onDidChangeLoggers;
          case "onDidChangeLogLevel":
            return windowId ? this.loggerService.getOnDidChangeLogLevelEvent(windowId) : this.loggerService.onDidChangeLogLevel;
          case "onDidChangeVisibility":
            return windowId ? this.loggerService.getOnDidChangeVisibilityEvent(windowId) : this.loggerService.onDidChangeVisibility;
        }
        throw new Error(`Event not found: ${event}`);
      }
      async call(_, command, arg) {
        switch (command) {
          case "createLogger":
            this.createLogger(URI.revive(arg[0]), arg[1], arg[2]);
            return;
          case "log":
            return this.log(URI.revive(arg[0]), arg[1]);
          case "consoleLog":
            return this.consoleLog(arg[0], arg[1]);
          case "setLogLevel":
            return isLogLevel(arg[0]) ? this.loggerService.setLogLevel(arg[0]) : this.loggerService.setLogLevel(URI.revive(arg[0]), arg[1]);
          case "setVisibility":
            return this.loggerService.setVisibility(URI.revive(arg[0]), arg[1]);
          case "registerLogger":
            return this.loggerService.registerLogger({ ...arg[0], resource: URI.revive(arg[0].resource) }, arg[1]);
          case "deregisterLogger":
            return this.loggerService.deregisterLogger(URI.revive(arg[0]));
        }
        throw new Error(`Call not found: ${command}`);
      }
      createLogger(file, options, windowId) {
        this.loggers.set(file, this.loggerService.createLogger(file, options, windowId));
      }
      consoleLog(level, args2) {
        let consoleFn = console.log;
        switch (level) {
          case 5 /* Error */:
            consoleFn = console.error;
            break;
          case 4 /* Warning */:
            consoleFn = console.warn;
            break;
          case 3 /* Info */:
            consoleFn = console.info;
            break;
        }
        consoleFn.call(console, ...args2);
      }
      log(file, messages) {
        const logger = this.loggers.get(file);
        if (!logger) {
          return;
        }
        for (const [level, message] of messages) {
          log(logger, level, message);
        }
      }
    };
  }
});
export { LoggerChannel, init_logIpc };
