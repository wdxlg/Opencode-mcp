// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/userDataSync/browser/userDataSync.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { isWeb } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { toAction } from "./module-0082.mjs";
import { SHOW_SYNC_LOG_COMMAND_ID } from "./module-1744.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataAutoSyncService } from "./module-1696.mjs";
import { IProductService } from "./module-0873.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IHostService } from "./module-1117.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { UserDataSyncWorkbenchContribution } from "./module-3615.mjs";
import { UserDataSyncTrigger } from "./module-3616.mjs";


// src/vs/workbench/contrib/userDataSync/browser/userDataSync.contribution.ts
var UserDataSyncReportIssueContribution = class extends Disposable {
  constructor(userDataAutoSyncService, notificationService, productService, commandService, hostService) {
    super();
    this.notificationService = notificationService;
    this.productService = productService;
    this.commandService = commandService;
    this.hostService = hostService;
    this._register(userDataAutoSyncService.onError((error) => this.onAutoSyncError(error)));
  }
  onAutoSyncError(error) {
    switch (error.code) {
      case "LocalTooManyRequests" /* LocalTooManyRequests */: {
        const message = isWeb ? localize(21774, null, this.productService.nameLong) : localize(21775, null, this.productService.nameLong);
        this.notificationService.notify({
          severity: Severity2.Error,
          message,
          actions: {
            primary: [
              toAction({
                id: "Show Sync Logs",
                label: localize(21781, null),
                run: () => this.commandService.executeCommand(SHOW_SYNC_LOG_COMMAND_ID)
              }),
              toAction({
                id: "Restart",
                label: isWeb ? localize(21777, null) : localize(21778, null),
                run: () => this.hostService.restart()
              })
            ]
          }
        });
        return;
      }
      case "RemoteTooManyRequests" /* TooManyRequests */: {
        const operationId = error.operationId ? localize(21776, null, error.operationId) : void 0;
        const message = localize(21779, null);
        this.notificationService.notify({
          severity: Severity2.Error,
          message: operationId ? `${message} ${operationId}` : message,
          source: error.operationId ? localize(21780, null, error.operationId) : void 0,
          actions: {
            primary: [
              toAction({
                id: "Show Sync Logs",
                label: localize(21781, null),
                run: () => this.commandService.executeCommand(SHOW_SYNC_LOG_COMMAND_ID)
              })
            ]
          }
        });
        return;
      }
    }
  }
};

UserDataSyncReportIssueContribution = __decorateClass([
  __decorateParam(0, IUserDataAutoSyncService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, IProductService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IHostService)
], UserDataSyncReportIssueContribution);

var workbenchRegistry5 = Registry.as(Extensions10.Workbench);

workbenchRegistry5.registerWorkbenchContribution(UserDataSyncWorkbenchContribution, 3 /* Restored */);

workbenchRegistry5.registerWorkbenchContribution(UserDataSyncTrigger, 4 /* Eventually */);

workbenchRegistry5.registerWorkbenchContribution(UserDataSyncReportIssueContribution, 4 /* Eventually */);
export { UserDataSyncReportIssueContribution, workbenchRegistry5 };
