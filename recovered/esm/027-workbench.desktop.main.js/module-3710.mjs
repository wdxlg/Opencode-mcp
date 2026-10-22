// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/opener/browser/opener.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { REVEAL_IN_EXPLORER_COMMAND_ID } from "./module-2017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/opener/browser/opener.contribution.ts
var WorkbenchOpenerContribution = class extends Disposable {
  constructor(openerService, commandService, fileService, workspaceContextService) {
    super();
    this.commandService = commandService;
    this.fileService = fileService;
    this.workspaceContextService = workspaceContextService;
    this._register(openerService.registerOpener(this));
  }
  static {
    this.ID = "workbench.contrib.opener";
  }
  async open(link2, options3) {
    try {
      if (options3?.openExternal) {
        return false;
      }
      const uri5 = typeof link2 === "string" ? URI.parse(link2) : link2;
      if (this.workspaceContextService.isInsideWorkspace(uri5)) {
        if ((await this.fileService.stat(uri5)).isDirectory) {
          await this.commandService.executeCommand(REVEAL_IN_EXPLORER_COMMAND_ID, uri5);
          return true;
        }
      }
    } catch {
    }
    return false;
  }
};

WorkbenchOpenerContribution = __decorateClass([
  __decorateParam(0, IOpenerService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IWorkspaceContextService)
], WorkbenchOpenerContribution);

registerWorkbenchContribution2(WorkbenchOpenerContribution.ID, WorkbenchOpenerContribution, WorkbenchPhase.Eventually);
export { WorkbenchOpenerContribution };
