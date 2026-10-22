// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/workspaces/electron-main/workspacesManagementMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { init_json, parse4 } from "./module-0120.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { Schemas, init_network } from "./module-0031.mjs";
import { dirname3, init_path, join4 } from "./module-0008.mjs";
import { basename2, extUriBiasedIgnorePathCase, init_resources, joinPath, originalFSPath } from "./module-0032.mjs";
import { Promises2, init_pfs } from "./module-0036.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { IBackupMainService, init_backup } from "./module-0111.mjs";
import { IDialogMainService, init_dialogMainService } from "./module-0123.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IUserDataProfilesMainService, init_userDataProfile3 } from "./module-0108.mjs";
import { findWindowOnWorkspaceOrFolder, init_windowsFinder } from "./module-0124.mjs";
import { UNTITLED_WORKSPACE_NAME, hasWorkspaceFileExtension, init_workspace, isUntitledWorkspace, isWorkspaceIdentifier } from "./module-0076.mjs";
import { getStoredWorkspaceFolder, init_workspaces2, isStoredWorkspaceFolder, toWorkspaceFolders } from "./module-0128.mjs";
import { getWorkspaceIdentifier, init_workspaces } from "./module-0114.mjs";


// src/vs/platform/workspaces/electron-main/workspacesManagementMainService.ts
import * as fs7 from "fs";

import electron6 from "electron";

var IWorkspacesManagementMainService, WorkspacesManagementMainService;

var init_workspacesManagementMainService = __esm({
  "src/vs/platform/workspaces/electron-main/workspacesManagementMainService.ts"() {
    init_event();
    init_json();
    init_lifecycle();
    init_network();
    init_path();
    init_resources();
    init_pfs();
    init_nls();
    init_backup();
    init_dialogMainService();
    init_environmentMainService();
    init_instantiation();
    init_log();
    init_userDataProfile3();
    init_windowsFinder();
    init_workspace();
    init_workspaces2();
    init_workspaces();
    IWorkspacesManagementMainService = createDecorator("workspacesManagementMainService");
    WorkspacesManagementMainService = class extends Disposable {
      constructor(environmentMainService, logService, userDataProfilesMainService, backupMainService, dialogMainService) {
        super();
        this.environmentMainService = environmentMainService;
        this.logService = logService;
        this.userDataProfilesMainService = userDataProfilesMainService;
        this.backupMainService = backupMainService;
        this.dialogMainService = dialogMainService;
        this._onDidDeleteUntitledWorkspace = this._register(new Emitter());
        this.onDidDeleteUntitledWorkspace = this._onDidDeleteUntitledWorkspace.event;
        this._onDidEnterWorkspace = this._register(new Emitter());
        this.onDidEnterWorkspace = this._onDidEnterWorkspace.event;
        // local URI that contains all untitled workspaces
        this.untitledWorkspaces = [];
        this.untitledWorkspacesHome = this.environmentMainService.untitledWorkspacesHome;
      }
      async initialize() {
        this.untitledWorkspaces = [];
        try {
          const untitledWorkspacePaths = (await Promises2.readdir(this.untitledWorkspacesHome.with({ scheme: Schemas.file }).fsPath)).map((folder) => joinPath(this.untitledWorkspacesHome, folder, UNTITLED_WORKSPACE_NAME));
          for (const untitledWorkspacePath of untitledWorkspacePaths) {
            const workspace = getWorkspaceIdentifier(untitledWorkspacePath);
            const resolvedWorkspace = await this.resolveLocalWorkspace(untitledWorkspacePath);
            if (!resolvedWorkspace) {
              await this.deleteUntitledWorkspace(workspace);
            } else {
              this.untitledWorkspaces.push({ workspace, remoteAuthority: resolvedWorkspace.remoteAuthority });
            }
          }
        } catch (error) {
          if (error.code !== "ENOENT") {
            this.logService.warn(`Unable to read folders in ${this.untitledWorkspacesHome} (${error}).`);
          }
        }
      }
      resolveLocalWorkspace(uri) {
        return this.doResolveLocalWorkspace(uri, (path4) => fs7.promises.readFile(path4, "utf8"));
      }
      doResolveLocalWorkspace(uri, contentsFn) {
        if (!this.isWorkspacePath(uri)) {
          return void 0;
        }
        if (uri.scheme !== Schemas.file) {
          return void 0;
        }
        try {
          const contents = contentsFn(uri.fsPath);
          if (contents instanceof Promise) {
            return contents.then(
              (value) => this.doResolveWorkspace(uri, value),
              (error) => void 0
              /* invalid workspace */
            );
          } else {
            return this.doResolveWorkspace(uri, contents);
          }
        } catch {
          return void 0;
        }
      }
      isWorkspacePath(uri) {
        return isUntitledWorkspace(uri, this.environmentMainService) || hasWorkspaceFileExtension(uri);
      }
      doResolveWorkspace(path4, contents) {
        try {
          const workspace = this.doParseStoredWorkspace(path4, contents);
          const workspaceIdentifier = getWorkspaceIdentifier(path4);
          return {
            id: workspaceIdentifier.id,
            configPath: workspaceIdentifier.configPath,
            folders: toWorkspaceFolders(workspace.folders, workspaceIdentifier.configPath, extUriBiasedIgnorePathCase),
            remoteAuthority: workspace.remoteAuthority,
            transient: workspace.transient
          };
        } catch (error) {
          this.logService.warn(error.toString());
        }
        return void 0;
      }
      doParseStoredWorkspace(path4, contents) {
        const storedWorkspace = parse4(contents);
        if (storedWorkspace && Array.isArray(storedWorkspace.folders)) {
          storedWorkspace.folders = storedWorkspace.folders.filter((folder) => isStoredWorkspaceFolder(folder));
        } else {
          throw new Error(`${path4.toString(true)} looks like an invalid workspace file.`);
        }
        return storedWorkspace;
      }
      async createUntitledWorkspace(folders, remoteAuthority) {
        const { workspace, storedWorkspace } = this.newUntitledWorkspace(folders, remoteAuthority);
        const configPath = workspace.configPath.fsPath;
        await fs7.promises.mkdir(dirname3(configPath), { recursive: true });
        await Promises2.writeFile(configPath, JSON.stringify(storedWorkspace, null, "	"));
        this.untitledWorkspaces.push({ workspace, remoteAuthority });
        return workspace;
      }
      newUntitledWorkspace(folders = [], remoteAuthority) {
        const randomId = (Date.now() + Math.round(Math.random() * 1e3)).toString();
        const untitledWorkspaceConfigFolder = joinPath(this.untitledWorkspacesHome, randomId);
        const untitledWorkspaceConfigPath = joinPath(untitledWorkspaceConfigFolder, UNTITLED_WORKSPACE_NAME);
        const storedWorkspaceFolder = [];
        for (const folder of folders) {
          storedWorkspaceFolder.push(getStoredWorkspaceFolder(folder.uri, true, folder.name, untitledWorkspaceConfigFolder, extUriBiasedIgnorePathCase));
        }
        return {
          workspace: getWorkspaceIdentifier(untitledWorkspaceConfigPath),
          storedWorkspace: { folders: storedWorkspaceFolder, remoteAuthority }
        };
      }
      async getWorkspaceIdentifier(configPath) {
        return getWorkspaceIdentifier(configPath);
      }
      isUntitledWorkspace(workspace) {
        return isUntitledWorkspace(workspace.configPath, this.environmentMainService);
      }
      async deleteUntitledWorkspace(workspace) {
        if (!this.isUntitledWorkspace(workspace)) {
          return;
        }
        await this.doDeleteUntitledWorkspace(workspace);
        this.userDataProfilesMainService.unsetWorkspace(workspace);
        this._onDidDeleteUntitledWorkspace.fire(workspace);
      }
      async doDeleteUntitledWorkspace(workspace) {
        const configPath = originalFSPath(workspace.configPath);
        try {
          await Promises2.rm(dirname3(configPath));
          const workspaceStoragePath = join4(this.environmentMainService.workspaceStorageHome.with({ scheme: Schemas.file }).fsPath, workspace.id);
          if (await Promises2.exists(workspaceStoragePath)) {
            await Promises2.writeFile(join4(workspaceStoragePath, "obsolete"), "");
          }
          this.untitledWorkspaces = this.untitledWorkspaces.filter((untitledWorkspace) => untitledWorkspace.workspace.id !== workspace.id);
        } catch (error) {
          this.logService.warn(`Unable to delete untitled workspace ${configPath} (${error}).`);
        }
      }
      getUntitledWorkspaces() {
        return this.untitledWorkspaces;
      }
      async enterWorkspace(window2, windows, path4) {
        if (!window2?.win || !window2.isReady) {
          return void 0;
        }
        const isValid = await this.isValidTargetWorkspacePath(window2, windows, path4);
        if (!isValid) {
          return void 0;
        }
        const result = await this.doEnterWorkspace(window2, getWorkspaceIdentifier(path4));
        if (!result) {
          return void 0;
        }
        this._onDidEnterWorkspace.fire({ window: window2, workspace: result.workspace });
        return result;
      }
      async isValidTargetWorkspacePath(window2, windows, workspacePath) {
        if (!workspacePath) {
          return true;
        }
        if (isWorkspaceIdentifier(window2.openedWorkspace) && extUriBiasedIgnorePathCase.isEqual(window2.openedWorkspace.configPath, workspacePath)) {
          return false;
        }
        if (findWindowOnWorkspaceOrFolder(windows, workspacePath)) {
          await this.dialogMainService.showMessageBox({
            type: "info",
            buttons: [localize(3733, null)],
            message: localize(3735, null, basename2(workspacePath)),
            detail: localize(3734, null)
          }, electron6.BrowserWindow.getFocusedWindow() ?? void 0);
          return false;
        }
        return true;
      }
      async doEnterWorkspace(window2, workspace) {
        if (!window2.config) {
          return void 0;
        }
        window2.focus();
        let backupPath;
        if (!window2.config.extensionDevelopmentPath) {
          if (window2.config.backupPath) {
            backupPath = await this.backupMainService.registerWorkspaceBackup({ workspace, remoteAuthority: window2.remoteAuthority }, window2.config.backupPath);
          } else {
            backupPath = this.backupMainService.registerWorkspaceBackup({ workspace, remoteAuthority: window2.remoteAuthority });
          }
        }
        if (isWorkspaceIdentifier(window2.openedWorkspace) && this.isUntitledWorkspace(window2.openedWorkspace)) {
          await this.deleteUntitledWorkspace(window2.openedWorkspace);
        }
        window2.config.workspace = workspace;
        window2.config.backupPath = backupPath;
        return { workspace, backupPath };
      }
    };
    WorkspacesManagementMainService = __decorateClass([
      __decorateParam(0, IEnvironmentMainService),
      __decorateParam(1, ILogService),
      __decorateParam(2, IUserDataProfilesMainService),
      __decorateParam(3, IBackupMainService),
      __decorateParam(4, IDialogMainService)
    ], WorkspacesManagementMainService);
  }
});
export { fs7, electron6, IWorkspacesManagementMainService, WorkspacesManagementMainService, init_workspacesManagementMainService };
