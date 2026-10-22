// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/workspaces/electron-main/workspacesMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { IBackupMainService, init_backup } from "./module-0111.mjs";
import { IWindowsMainService, init_windows } from "./module-0101.mjs";
import { IWorkspacesHistoryMainService, init_workspacesHistoryMainService } from "./module-0203.mjs";
import { IWorkspacesManagementMainService, init_workspacesManagementMainService } from "./module-0129.mjs";


// src/vs/platform/workspaces/electron-main/workspacesMainService.ts
var WorkspacesMainService;

var init_workspacesMainService = __esm({
  "src/vs/platform/workspaces/electron-main/workspacesMainService.ts"() {
    init_backup();
    init_windows();
    init_workspacesHistoryMainService();
    init_workspacesManagementMainService();
    WorkspacesMainService = class {
      constructor(workspacesManagementMainService, windowsMainService, workspacesHistoryMainService, backupMainService) {
        this.workspacesManagementMainService = workspacesManagementMainService;
        this.windowsMainService = windowsMainService;
        this.workspacesHistoryMainService = workspacesHistoryMainService;
        this.backupMainService = backupMainService;
        this.onDidChangeRecentlyOpened = this.workspacesHistoryMainService.onDidChangeRecentlyOpened;
      }
      //#region Workspace Management
      async enterWorkspace(windowId, path4) {
        const window2 = this.windowsMainService.getWindowById(windowId);
        if (window2) {
          return this.workspacesManagementMainService.enterWorkspace(window2, this.windowsMainService.getWindows(), path4);
        }
        return void 0;
      }
      createUntitledWorkspace(windowId, folders, remoteAuthority) {
        return this.workspacesManagementMainService.createUntitledWorkspace(folders, remoteAuthority);
      }
      deleteUntitledWorkspace(windowId, workspace) {
        return this.workspacesManagementMainService.deleteUntitledWorkspace(workspace);
      }
      getWorkspaceIdentifier(windowId, workspacePath) {
        return this.workspacesManagementMainService.getWorkspaceIdentifier(workspacePath);
      }
      getRecentlyOpened(windowId) {
        return this.workspacesHistoryMainService.getRecentlyOpened();
      }
      addRecentlyOpened(windowId, recents) {
        return this.workspacesHistoryMainService.addRecentlyOpened(recents);
      }
      removeRecentlyOpened(windowId, paths) {
        return this.workspacesHistoryMainService.removeRecentlyOpened(paths);
      }
      clearRecentlyOpened(windowId) {
        return this.workspacesHistoryMainService.clearRecentlyOpened();
      }
      //#endregion
      //#region Dirty Workspaces
      async getDirtyWorkspaces() {
        return this.backupMainService.getDirtyWorkspaces();
      }
      //#endregion
    };
    WorkspacesMainService = __decorateClass([
      __decorateParam(0, IWorkspacesManagementMainService),
      __decorateParam(1, IWindowsMainService),
      __decorateParam(2, IWorkspacesHistoryMainService),
      __decorateParam(3, IBackupMainService)
    ], WorkspacesMainService);
  }
});
export { WorkspacesMainService, init_workspacesMainService };
