// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadLogService.ts
import { DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { ILogService, ILoggerService, LogLevelToString, isLogLevel, log, parseLogLevel } from "./module-0095.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { IEnvironmentService } from "./module-0508.mjs";


// src/vs/workbench/api/browser/mainThreadLogService.ts
var MainThreadLoggerService = class {
  constructor(extHostContext, loggerService) {
    this.loggerService = loggerService;
    this.disposables = new DisposableStore();
    const proxy = extHostContext.getProxy(ExtHostContext.ExtHostLogLevelServiceShape);
    this.disposables.add(loggerService.onDidChangeLogLevel((arg) => {
      if (isLogLevel(arg)) {
        proxy.$setLogLevel(arg);
      } else {
        proxy.$setLogLevel(arg[1], arg[0]);
      }
    }));
  }
  $log(file, messages) {
    const logger = this.loggerService.getLogger(URI.revive(file));
    if (!logger) {
      throw new Error("Create the logger before logging");
    }
    for (const [level, message] of messages) {
      log(logger, level, message);
    }
  }
  async $createLogger(file, options3) {
    this.loggerService.createLogger(URI.revive(file), options3);
  }
  async $registerLogger(logResource) {
    this.loggerService.registerLogger({
      ...logResource,
      resource: URI.revive(logResource.resource)
    });
  }
  async $deregisterLogger(resource) {
    this.loggerService.deregisterLogger(URI.revive(resource));
  }
  async $setVisibility(resource, visible) {
    this.loggerService.setVisibility(URI.revive(resource), visible);
  }
  $flush(file) {
    const logger = this.loggerService.getLogger(URI.revive(file));
    if (!logger) {
      throw new Error("Create the logger before flushing");
    }
    logger.flush();
  }
  dispose() {
    this.disposables.dispose();
  }
};

MainThreadLoggerService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadLogger),
  __decorateParam(1, ILoggerService)
], MainThreadLoggerService);

CommandsRegistry.registerCommand("_extensionTests.setLogLevel", function(accessor, level) {
  const loggerService = accessor.get(ILoggerService);
  const environmentService = accessor.get(IEnvironmentService);
  if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
    const logLevel = parseLogLevel(level);
    if (logLevel !== void 0) {
      loggerService.setLogLevel(logLevel);
    }
  }
});

CommandsRegistry.registerCommand("_extensionTests.getLogLevel", function(accessor) {
  const logService = accessor.get(ILogService);
  return LogLevelToString(logService.getLevel());
});
export { MainThreadLoggerService };
