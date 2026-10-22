// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/terminalLogService.ts
import { Disposable } from "./module-0012.mjs";
import { joinPath } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILoggerService } from "./module-0095.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IEnvironmentService } from "./module-0508.mjs";


// src/vs/platform/terminal/common/terminalLogService.ts
var TerminalLogService = class extends Disposable {
  constructor(_loggerService, workspaceContextService, environmentService) {
    super();
    this._loggerService = _loggerService;
    this._logger = this._loggerService.createLogger(joinPath(environmentService.logsHome, "terminal.log"), { id: "terminal", name: localize(3264, null) });
    this._register(Event2.runAndSubscribe(workspaceContextService.onDidChangeWorkspaceFolders, () => {
      this._workspaceId = workspaceContextService.getWorkspace().id.substring(0, 7);
    }));
  }
  get onDidChangeLogLevel() {
    return this._logger.onDidChangeLogLevel;
  }
  getLevel() {
    return this._logger.getLevel();
  }
  setLevel(level) {
    this._logger.setLevel(level);
  }
  flush() {
    this._logger.flush();
  }
  trace(message, ...args2) {
    this._logger.trace(this._formatMessage(message), args2);
  }
  debug(message, ...args2) {
    this._logger.debug(this._formatMessage(message), args2);
  }
  info(message, ...args2) {
    this._logger.info(this._formatMessage(message), args2);
  }
  warn(message, ...args2) {
    this._logger.warn(this._formatMessage(message), args2);
  }
  error(message, ...args2) {
    if (message instanceof Error) {
      this._logger.error(this._formatMessage(""), message, args2);
      return;
    }
    this._logger.error(this._formatMessage(message), args2);
  }
  _formatMessage(message) {
    if (this._logger.getLevel() === 1 /* Trace */) {
      return `[${this._workspaceId}] ${message}`;
    }
    return message;
  }
};

TerminalLogService = __decorateClass([
  __decorateParam(0, ILoggerService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IEnvironmentService)
], TerminalLogService);
export { TerminalLogService };
