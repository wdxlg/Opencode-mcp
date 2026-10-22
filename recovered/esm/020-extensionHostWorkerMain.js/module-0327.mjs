// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostLogService.ts
import { LogService } from "./module-0326.mjs";
import { localize } from "./module-0015.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILoggerService } from "./module-0045.mjs";
import { IExtHostInitDataService } from "./module-0049.mjs";


// src/vs/workbench/api/common/extHostLogService.ts
var ExtHostLogService = class extends LogService {
  constructor(isWorker, loggerService, initData) {
    const id2 = initData.remote.isRemote ? "remoteexthost" : isWorker ? "workerexthost" : "exthost";
    const name2 = initData.remote.isRemote ? localize(5884, null) : isWorker ? localize(5885, null) : localize(5883, null);
    super(loggerService.createLogger(id2, { name: name2 }));
  }
};

ExtHostLogService = __decorateClass([
  __decorateParam(1, ILoggerService),
  __decorateParam(2, IExtHostInitDataService)
], ExtHostLogService);
export { ExtHostLogService };
