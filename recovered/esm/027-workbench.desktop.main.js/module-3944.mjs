// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/logs/electron-browser/logsActions.ts
import { Action } from "./module-0082.mjs";
import { localize2 } from "./module-0001.mjs";
import { joinPath } from "./module-0034.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/workbench/contrib/logs/electron-browser/logsActions.ts
var OpenLogsFolderAction = class extends Action {
  constructor(id2, label3, environmentService, nativeHostService) {
    super(id2, label3);
    this.environmentService = environmentService;
    this.nativeHostService = nativeHostService;
  }
  static {
    this.ID = "workbench.action.openLogsFolder";
  }
  static {
    this.TITLE = localize2(16602, "Open Logs Folder");
  }
  run() {
    return this.nativeHostService.showItemInFolder(joinPath(this.environmentService.logsHome, "main.log").with({ scheme: Schemas.file }).fsPath);
  }
};

OpenLogsFolderAction = __decorateClass([
  __decorateParam(2, INativeWorkbenchEnvironmentService),
  __decorateParam(3, INativeHostService)
], OpenLogsFolderAction);

var OpenExtensionLogsFolderAction = class extends Action {
  constructor(id2, label3, environmentSerice, fileService, nativeHostService) {
    super(id2, label3);
    this.environmentSerice = environmentSerice;
    this.fileService = fileService;
    this.nativeHostService = nativeHostService;
  }
  static {
    this.ID = "workbench.action.openExtensionLogsFolder";
  }
  static {
    this.TITLE = localize2(16601, "Open Extension Logs Folder");
  }
  async run() {
    const folderStat = await this.fileService.resolve(this.environmentSerice.extHostLogsPath);
    if (folderStat.children && folderStat.children[0]) {
      return this.nativeHostService.showItemInFolder(folderStat.children[0].resource.with({ scheme: Schemas.file }).fsPath);
    }
  }
};

OpenExtensionLogsFolderAction = __decorateClass([
  __decorateParam(2, INativeWorkbenchEnvironmentService),
  __decorateParam(3, IFileService),
  __decorateParam(4, INativeHostService)
], OpenExtensionLogsFolderAction);
export { OpenLogsFolderAction, OpenExtensionLogsFolderAction };
