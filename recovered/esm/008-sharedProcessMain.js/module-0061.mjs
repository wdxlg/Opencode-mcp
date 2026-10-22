// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/code/electron-utility/sharedProcess/contrib/logsDataCleaner.ts
import { Disposable } from "./module-0013.mjs";
import { RunOnceScheduler } from "./module-0029.mjs";
import { basename2, dirname2 } from "./module-0027.mjs";
import { Schemas } from "./module-0025.mjs";
import { Promises2 } from "./module-0038.mjs";
import { join } from "./module-0023.mjs";
import { onUnexpectedError } from "./module-0003.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEnvironmentService } from "./module-0047.mjs";
import { ILogService } from "./module-0044.mjs";


// src/vs/code/electron-utility/sharedProcess/contrib/logsDataCleaner.ts
var LogsDataCleaner = class extends Disposable {
  constructor(environmentService, logService) {
    super();
    this.environmentService = environmentService;
    this.logService = logService;
    const scheduler = this._register(new RunOnceScheduler(
      () => {
        this.cleanUpOldLogs();
      },
      10 * 1e3
      /* after 10s */
    ));
    scheduler.schedule();
  }
  async cleanUpOldLogs() {
    this.logService.trace("[logs cleanup]: Starting to clean up old logs.");
    try {
      const currentLog = basename2(this.environmentService.logsHome);
      const logsRoot = dirname2(this.environmentService.logsHome.with({ scheme: Schemas.file })).fsPath;
      const logFiles = await Promises2.readdir(logsRoot);
      const allSessions = logFiles.filter((logFile) => /^\d{8}T\d{6}$/.test(logFile));
      const oldSessions = allSessions.sort().filter((session) => session !== currentLog);
      const sessionsToDelete = oldSessions.slice(0, Math.max(0, oldSessions.length - 9));
      if (sessionsToDelete.length > 0) {
        this.logService.trace(`[logs cleanup]: Removing log folders '${sessionsToDelete.join(", ")}'`);
        await Promise.all(sessionsToDelete.map((sessionToDelete) => Promises2.rm(join(logsRoot, sessionToDelete))));
      }
    } catch (error) {
      onUnexpectedError(error);
    }
  }
};

LogsDataCleaner = __decorateClass([
  __decorateParam(0, IEnvironmentService),
  __decorateParam(1, ILogService)
], LogsDataCleaner);
export { LogsDataCleaner };
