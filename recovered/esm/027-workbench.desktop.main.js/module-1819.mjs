// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/userDataSyncLog.ts
import { AbstractLogger, ILoggerService } from "./module-0095.mjs";
import { joinPath } from "./module-0034.mjs";
import { USER_DATA_SYNC_LOG_ID } from "./module-1696.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEnvironmentService } from "./module-0508.mjs";


// src/vs/platform/userDataSync/common/userDataSyncLog.ts
var UserDataSyncLogService = class extends AbstractLogger {
  constructor(loggerService, environmentService) {
    super();
    this.logger = this._register(loggerService.createLogger(joinPath(environmentService.logsHome, `${USER_DATA_SYNC_LOG_ID}.log`), { id: USER_DATA_SYNC_LOG_ID, name: localize(3693, null) }));
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

UserDataSyncLogService = __decorateClass([
  __decorateParam(0, ILoggerService),
  __decorateParam(1, IEnvironmentService)
], UserDataSyncLogService);
export { UserDataSyncLogService };
