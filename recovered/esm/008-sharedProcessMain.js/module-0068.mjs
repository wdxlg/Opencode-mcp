// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/code/electron-utility/sharedProcess/contrib/storageDataCleaner.ts
import { Disposable } from "./module-0013.mjs";
import { RunOnceScheduler } from "./module-0029.mjs";
import { Schemas } from "./module-0025.mjs";
import { Promises2 } from "./module-0038.mjs";
import { StorageClient } from "./module-0062.mjs";
import { join } from "./module-0023.mjs";
import { NON_EMPTY_WORKSPACE_ID_LENGTH } from "./module-0065.mjs";
import { EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE } from "./module-0063.mjs";
import { getWorkspaceIdentifier } from "./module-0064.mjs";
import { onUnexpectedError } from "./module-0003.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeEnvironmentService } from "./module-0047.mjs";
import { ILogService } from "./module-0044.mjs";
import { INativeHostService } from "./module-0066.mjs";
import { IMainProcessService } from "./module-0067.mjs";


// src/vs/code/electron-utility/sharedProcess/contrib/storageDataCleaner.ts
var UnusedWorkspaceStorageDataCleaner = class extends Disposable {
  constructor(environmentService, logService, nativeHostService, mainProcessService) {
    super();
    this.environmentService = environmentService;
    this.logService = logService;
    this.nativeHostService = nativeHostService;
    this.mainProcessService = mainProcessService;
    const scheduler = this._register(new RunOnceScheduler(
      () => {
        this.cleanUpStorage();
      },
      30 * 1e3
      /* after 30s */
    ));
    scheduler.schedule();
  }
  /**
   * Public for testing.
   */
  async cleanUpStorage() {
    this.logService.trace("[storage cleanup]: Starting to clean up workspace storage folders for unused empty workspaces.");
    try {
      const workspaceStorageHome = this.environmentService.workspaceStorageHome.with({ scheme: Schemas.file }).fsPath;
      const workspaceStorageFolders = await Promises2.readdir(workspaceStorageHome);
      const storageClient = new StorageClient(this.mainProcessService.getChannel("storage"));
      await Promise.all(workspaceStorageFolders.map(async (workspaceStorageFolder) => {
        const workspaceStoragePath = join(workspaceStorageHome, workspaceStorageFolder);
        if (workspaceStorageFolder.length === NON_EMPTY_WORKSPACE_ID_LENGTH) {
          return;
        }
        if (workspaceStorageFolder === EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE.id) {
          return;
        }
        if (workspaceStorageFolder === getWorkspaceIdentifier(this.environmentService.agentSessionsWorkspace).id) {
          return;
        }
        const windows = await this.nativeHostService.getWindows({ includeAuxiliaryWindows: false });
        if (windows.some((window2) => window2.workspace?.id === workspaceStorageFolder)) {
          return;
        }
        const isStorageUsed = await storageClient.isUsed(workspaceStoragePath);
        if (isStorageUsed) {
          return;
        }
        this.logService.trace(`[storage cleanup]: Deleting workspace storage folder ${workspaceStorageFolder} as it seems to be an unused empty workspace.`);
        await Promises2.rm(workspaceStoragePath);
      }));
    } catch (error) {
      onUnexpectedError(error);
    }
  }
};

UnusedWorkspaceStorageDataCleaner = __decorateClass([
  __decorateParam(0, INativeEnvironmentService),
  __decorateParam(1, ILogService),
  __decorateParam(2, INativeHostService),
  __decorateParam(3, IMainProcessService)
], UnusedWorkspaceStorageDataCleaner);
export { UnusedWorkspaceStorageDataCleaner };
