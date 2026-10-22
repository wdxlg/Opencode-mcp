// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editSessions/common/editSessionsLogService.ts
import { AbstractLogger, ILoggerService } from "./module-0095.mjs";
import { joinPath } from "./module-0034.mjs";
import { editSessionsLogId } from "./module-3626.mjs";
import { localize } from "./module-0001.mjs";
import { windowLogGroup } from "./module-1509.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEnvironmentService } from "./module-0508.mjs";


// src/vs/workbench/contrib/editSessions/common/editSessionsLogService.ts
var EditSessionsLogService = class extends AbstractLogger {
  constructor(loggerService, environmentService) {
    super();
    this.logger = this._register(loggerService.createLogger(joinPath(environmentService.logsHome, `${editSessionsLogId}.log`), { id: editSessionsLogId, name: localize(14956, null), group: windowLogGroup }));
  }
  trace(message, ...args2) {
    this.logger.trace(message, ...args2);
  }
  debug(message, ...args2) {
    this.logger.debug(message, ...args2);
  }
  info(message, ...args2) {
    this.logger.info(message, ...args2);
  }
  warn(message, ...args2) {
    this.logger.warn(message, ...args2);
  }
  error(message, ...args2) {
    this.logger.error(message, ...args2);
  }
  flush() {
    this.logger.flush();
  }
};

EditSessionsLogService = __decorateClass([
  __decorateParam(0, ILoggerService),
  __decorateParam(1, IEnvironmentService)
], EditSessionsLogService);
export { EditSessionsLogService };
