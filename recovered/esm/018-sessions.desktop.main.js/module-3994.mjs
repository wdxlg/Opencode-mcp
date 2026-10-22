// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/electron-browser/workingCopyBackupService.ts
import { WorkingCopyBackupService } from "./module-3991.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3824.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IWorkingCopyBackupService } from "./module-1122.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { NativeWorkingCopyBackupTracker } from "./module-3993.mjs";


// src/vs/workbench/services/workingCopy/electron-browser/workingCopyBackupService.ts
var NativeWorkingCopyBackupService = class extends WorkingCopyBackupService {
  constructor(environmentService, fileService, logService, lifecycleService) {
    super(environmentService.backupPath ? URI.file(environmentService.backupPath).with({ scheme: environmentService.userRoamingDataHome.scheme }) : void 0, fileService, logService);
    this.lifecycleService = lifecycleService;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.lifecycleService.onWillShutdown((event) => event.join(this.joinBackups(), { id: "join.workingCopyBackups", label: localize(23765, null) })));
  }
};

NativeWorkingCopyBackupService = __decorateClass([
  __decorateParam(0, INativeWorkbenchEnvironmentService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILogService),
  __decorateParam(3, ILifecycleService)
], NativeWorkingCopyBackupService);

registerSingleton(IWorkingCopyBackupService, NativeWorkingCopyBackupService, 0 /* Eager */);

registerWorkbenchContribution2(NativeWorkingCopyBackupTracker.ID, NativeWorkingCopyBackupTracker, WorkbenchPhase.BlockStartup);
export { NativeWorkingCopyBackupService };
