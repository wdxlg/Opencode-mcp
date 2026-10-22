// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostLogService.ts
import { LogService } from "./module-0513.mjs";
import { localize } from "./module-0013.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILoggerService } from "./module-0062.mjs";
import { IExtHostInitDataService } from "./module-0066.mjs";


// src/vs/workbench/api/common/extHostLogService.ts
var ExtHostLogService = class extends LogService {
  constructor(isWorker, loggerService, initData) {
    const id2 = initData.remote.isRemote ? "remoteexthost" : isWorker ? "workerexthost" : "exthost";
    const name = initData.remote.isRemote ? localize(5884, null) : isWorker ? localize(5885, null) : localize(5883, null);
    super(loggerService.createLogger(id2, { name }));
  }
};

ExtHostLogService = __decorateClass([
  __decorateParam(1, ILoggerService),
  __decorateParam(2, IExtHostInitDataService)
], ExtHostLogService);
export { ExtHostLogService };
