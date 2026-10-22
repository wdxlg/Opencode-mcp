// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/userDataSyncLog.ts
import { AbstractLogger, ILoggerService } from "./module-0044.mjs";
import { joinPath } from "./module-0027.mjs";
import { USER_DATA_SYNC_LOG_ID } from "./module-0157.mjs";
import { localize } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEnvironmentService } from "./module-0047.mjs";


// src/vs/platform/userDataSync/common/userDataSyncLog.ts
var UserDataSyncLogService = class extends AbstractLogger {
  constructor(loggerService, environmentService) {
    super();
    this.logger = this._register(loggerService.createLogger(joinPath(environmentService.logsHome, `${USER_DATA_SYNC_LOG_ID}.log`), { id: USER_DATA_SYNC_LOG_ID, name: localize(3693, null) }));
  }
  trace(message, ...args) {
    this.logger.trace(message, ...args);
  }
  debug(message, ...args) {
    this.logger.debug(message, ...args);
  }
  info(message, ...args) {
    this.logger.info(message, ...args);
  }
  warn(message, ...args) {
    this.logger.warn(message, ...args);
  }
  error(message, ...args) {
    this.logger.error(message, ...args);
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
