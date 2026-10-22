// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/services/notebookLoggingServiceImpl.ts
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { windowLogGroup } from "./module-1509.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILoggerService } from "./module-0095.mjs";


// src/vs/workbench/contrib/notebook/browser/services/notebookLoggingServiceImpl.ts
var logChannelId = "notebook.rendering";

var NotebookLoggingService = class extends Disposable {
  static {
    this.ID = "notebook";
  }
  constructor(loggerService) {
    super();
    this._logger = this._register(loggerService.createLogger(logChannelId, { name: localize(17865, null), group: windowLogGroup }));
  }
  trace(category11, output) {
    this._logger.trace(`[${category11}] ${output}`);
  }
  debug(category11, output) {
    this._logger.debug(`[${category11}] ${output}`);
  }
  info(category11, output) {
    this._logger.info(`[${category11}] ${output}`);
  }
  warn(category11, output) {
    this._logger.warn(`[${category11}] ${output}`);
  }
  error(category11, output) {
    this._logger.error(`[${category11}] ${output}`);
  }
};

NotebookLoggingService = __decorateClass([
  __decorateParam(0, ILoggerService)
], NotebookLoggingService);
export { logChannelId, NotebookLoggingService };
