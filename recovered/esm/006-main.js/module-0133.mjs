// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/diagnostics/electron-main/diagnosticsMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { init_ipcMain, validatedIpcMain } from "./module-0059.mjs";
import { CancellationToken, init_cancellation } from "./module-0022.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { IWindowsMainService, getAllWindowsExcludingOffscreen, init_windows } from "./module-0101.mjs";
import { init_workspace, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from "./module-0076.mjs";
import { IWorkspacesManagementMainService, init_workspacesManagementMainService } from "./module-0129.mjs";
import { assertReturnsDefined, init_types } from "./module-0016.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { UtilityProcess, init_utilityProcess } from "./module-0132.mjs";


// src/vs/platform/diagnostics/electron-main/diagnosticsMainService.ts
import { app as app3 } from "electron";

var ID2, IDiagnosticsMainService, DiagnosticsMainService;

var init_diagnosticsMainService = __esm({
  "src/vs/platform/diagnostics/electron-main/diagnosticsMainService.ts"() {
    init_ipcMain();
    init_cancellation();
    init_instantiation();
    init_windows();
    init_workspace();
    init_workspacesManagementMainService();
    init_types();
    init_log();
    init_utilityProcess();
    ID2 = "diagnosticsMainService";
    IDiagnosticsMainService = createDecorator(ID2);
    DiagnosticsMainService = class {
      constructor(windowsMainService, workspacesManagementMainService, logService) {
        this.windowsMainService = windowsMainService;
        this.workspacesManagementMainService = workspacesManagementMainService;
        this.logService = logService;
      }
      async getRemoteDiagnostics(options) {
        const windows = this.windowsMainService.getWindows();
        const diagnostics = await Promise.all(windows.map(async (window2) => {
          const remoteAuthority = window2.remoteAuthority;
          if (!remoteAuthority) {
            return void 0;
          }
          const replyChannel = `vscode:getDiagnosticInfoResponse${window2.id}`;
          const args2 = {
            includeProcesses: options.includeProcesses,
            folders: options.includeWorkspaceMetadata ? await this.getFolderURIs(window2) : void 0
          };
          return new Promise((resolve3) => {
            window2.sendWhenReady("vscode:getDiagnosticInfo", CancellationToken.None, { replyChannel, args: args2 });
            validatedIpcMain.once(replyChannel, (_, data) => {
              if (!data) {
                resolve3({ hostName: remoteAuthority, errorMessage: `Unable to resolve connection to '${remoteAuthority}'.` });
              }
              resolve3(data);
            });
            setTimeout(() => {
              resolve3({ hostName: remoteAuthority, errorMessage: `Connection to '${remoteAuthority}' could not be established` });
            }, 5e3);
          });
        }));
        return diagnostics.filter((x) => !!x);
      }
      async getMainDiagnostics() {
        this.logService.trace("Received request for main process info from other instance.");
        const windows = [];
        for (const window2 of getAllWindowsExcludingOffscreen()) {
          const codeWindow = this.windowsMainService.getWindowById(window2.id);
          if (codeWindow) {
            windows.push(await this.codeWindowToInfo(codeWindow));
          } else {
            windows.push(this.browserWindowToInfo(window2));
          }
        }
        const pidToNames = [];
        for (const { pid, name } of UtilityProcess.getAll()) {
          pidToNames.push({ pid, name });
        }
        let gpuLogMessages = [];
        const customApp = app3;
        if (typeof customApp.getGPULogMessages === "function") {
          gpuLogMessages = customApp.getGPULogMessages();
        }
        return {
          mainPID: process.pid,
          mainArguments: process.argv.slice(1),
          windows,
          pidToNames,
          screenReader: !!app3.accessibilitySupportEnabled,
          gpuFeatureStatus: app3.getGPUFeatureStatus(),
          gpuLogMessages
        };
      }
      async codeWindowToInfo(window2) {
        const folderURIs = await this.getFolderURIs(window2);
        const win = assertReturnsDefined(window2.win);
        return this.browserWindowToInfo(win, folderURIs, window2.remoteAuthority);
      }
      browserWindowToInfo(window2, folderURIs = [], remoteAuthority) {
        return {
          id: window2.id,
          pid: window2.webContents.getOSProcessId(),
          title: window2.getTitle(),
          folderURIs,
          remoteAuthority
        };
      }
      async getFolderURIs(window2) {
        const folderURIs = [];
        const workspace = window2.openedWorkspace;
        if (isSingleFolderWorkspaceIdentifier(workspace)) {
          folderURIs.push(workspace.uri);
        } else if (isWorkspaceIdentifier(workspace)) {
          const resolvedWorkspace = await this.workspacesManagementMainService.resolveLocalWorkspace(workspace.configPath);
          if (resolvedWorkspace) {
            const rootFolders = resolvedWorkspace.folders;
            rootFolders.forEach((root) => {
              folderURIs.push(root.uri);
            });
          }
        }
        return folderURIs;
      }
    };
    DiagnosticsMainService = __decorateClass([
      __decorateParam(0, IWindowsMainService),
      __decorateParam(1, IWorkspacesManagementMainService),
      __decorateParam(2, ILogService)
    ], DiagnosticsMainService);
  }
});
export { app3, ID2, IDiagnosticsMainService, DiagnosticsMainService, init_diagnosticsMainService };
