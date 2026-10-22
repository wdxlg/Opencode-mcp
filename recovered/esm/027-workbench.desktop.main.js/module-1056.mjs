// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadConsole.ts
import { parseExtensionDevOptions } from "./module-1055.mjs";
import { ILogService, isDevConsoleLogForwardingEnabled } from "./module-0095.mjs";
import { logRemoteEntry, logRemoteEntryIfError } from "./module-1054.mjs";
import { log2 } from "./module-1053.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { MainContext } from "./module-0921.mjs";
import { IEnvironmentService } from "./module-0508.mjs";


// src/vs/workbench/api/browser/mainThreadConsole.ts
var MainThreadConsole = class {
  constructor(_extHostContext, _environmentService, _logService) {
    this._environmentService = _environmentService;
    this._logService = _logService;
    const devOpts = parseExtensionDevOptions(this._environmentService);
    const isDevConsoleLogForwardingActive = !this._environmentService.isBuilt && isDevConsoleLogForwardingEnabled;
    this._logAllExtensionHostConsole = devOpts.isExtensionDevTestFromCli || isDevConsoleLogForwardingActive;
    this._logExtensionHostConsoleToLocalConsole = !devOpts.isExtensionDevTestFromCli && !isDevConsoleLogForwardingActive;
  }
  dispose() {
  }
  $logExtensionHostMessage(entry) {
    if (this._logAllExtensionHostConsole) {
      logRemoteEntry(this._logService, entry);
      if (this._logExtensionHostConsoleToLocalConsole) {
        log2(entry, "Extension Host");
      }
    } else {
      logRemoteEntryIfError(this._logService, entry, "Extension Host");
      log2(entry, "Extension Host");
    }
  }
};

MainThreadConsole = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadConsole),
  __decorateParam(1, IEnvironmentService),
  __decorateParam(2, ILogService)
], MainThreadConsole);
export { MainThreadConsole };
