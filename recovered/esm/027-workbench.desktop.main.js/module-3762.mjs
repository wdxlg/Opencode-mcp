// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/log/electron-browser/logService.ts
import { LogService } from "./module-3761.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { windowLogGroup, windowLogId } from "./module-1509.mjs";
import { ConsoleLogger, isDevConsoleLogForwardingEnabled, registerDevConsoleLogForwarder } from "./module-0095.mjs";


// src/vs/workbench/services/log/electron-browser/logService.ts
var NativeLogService = class extends LogService {
  constructor(loggerService, environmentService) {
    const disposables = new DisposableStore();
    const fileLogger = disposables.add(loggerService.createLogger(environmentService.logFile, { id: windowLogId, name: windowLogGroup.name, group: windowLogGroup }));
    let consoleLogger;
    if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
      consoleLogger = loggerService.createConsoleMainLogger();
    } else {
      consoleLogger = new ConsoleLogger(fileLogger.getLevel());
    }
    super(fileLogger, [consoleLogger]);
    if (!environmentService.isBuilt && isDevConsoleLogForwardingEnabled) {
      this._register(registerDevConsoleLogForwarder(this));
    }
    this._register(disposables);
  }
};
export { NativeLogService };
