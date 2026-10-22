// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/workspaces/browser/recentRemoteFolderPruner.ts
import { Schemas } from "./module-0033.mjs";
import { IFileService, toFileOperationResult } from "./module-0269.mjs";
import { isCancellationError, onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkspacesService } from "./module-1379.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/workspaces/browser/recentRemoteFolderPruner.ts
async function pruneRecentRemoteFolderIfMissing(contextService, fileService, workspacesService) {
  if (contextService.getWorkbenchState() !== 2 /* FOLDER */) {
    return;
  }
  const folderUri = contextService.getWorkspace().folders[0]?.uri;
  if (!folderUri || folderUri.scheme !== Schemas.vscodeRemote) {
    return;
  }
  try {
    await fileService.stat(folderUri);
  } catch (error) {
    if (toFileOperationResult(error) === 1 /* FILE_NOT_FOUND */) {
      await workspacesService.removeRecentlyOpened([folderUri]);
    }
  }
}

var RecentRemoteFolderPrunerContribution = class {
  static {
    this.ID = "workbench.contrib.recentRemoteFolderPruner";
  }
  constructor(contextService, fileService, workspacesService) {
    pruneRecentRemoteFolderIfMissing(contextService, fileService, workspacesService).catch((error) => {
      if (!isCancellationError(error)) {
        onUnexpectedError(error);
      }
    });
  }
};

RecentRemoteFolderPrunerContribution = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IWorkspacesService)
], RecentRemoteFolderPrunerContribution);

registerWorkbenchContribution2(RecentRemoteFolderPrunerContribution.ID, RecentRemoteFolderPrunerContribution, WorkbenchPhase.Eventually);
export { pruneRecentRemoteFolderIfMissing, RecentRemoteFolderPrunerContribution };
