// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workspaces/electron-browser/workspaceEditingService.ts
import { AbstractWorkspaceEditingService } from "./module-3820.mjs";
import { IWorkspaceContextService, hasWorkspaceFileExtension, isUntitledWorkspace, isWorkspaceIdentifier, toWorkspaceIdentifier } from "./module-0509.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { basename2 } from "./module-0034.mjs";
import { WorkingCopyBackupService } from "./module-3821.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IJSONEditingService } from "./module-1643.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IWorkbenchConfigurationService } from "./module-1198.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IWorkingCopyBackupService } from "./module-1121.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IWorkspacesService } from "./module-1379.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IHostService } from "./module-1117.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IWorkspaceEditingService } from "./module-1314.mjs";


// src/vs/workbench/services/workspaces/electron-browser/workspaceEditingService.ts
var NativeWorkspaceEditingService = class extends AbstractWorkspaceEditingService {
  constructor(jsonEditingService, contextService, nativeHostService, configurationService, storageService, extensionService, workingCopyBackupService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, lifecycleService, labelService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService, logService) {
    super(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService, logService);
    this.nativeHostService = nativeHostService;
    this.storageService = storageService;
    this.extensionService = extensionService;
    this.workingCopyBackupService = workingCopyBackupService;
    this.lifecycleService = lifecycleService;
    this.labelService = labelService;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.lifecycleService.onBeforeShutdown((e) => {
      const saveOperation = this.saveUntitledBeforeShutdown(e.reason);
      e.veto(saveOperation, "veto.untitledWorkspace");
    }));
  }
  async saveUntitledBeforeShutdown(reason) {
    if (reason !== 4 /* LOAD */ && reason !== 1 /* CLOSE */) {
      return false;
    }
    const workspaceIdentifier = this.getCurrentWorkspaceIdentifier();
    if (!workspaceIdentifier || !isUntitledWorkspace(workspaceIdentifier.configPath, this.environmentService)) {
      return false;
    }
    const windowCount = await this.nativeHostService.getWindowCount();
    if (reason === 1 /* CLOSE */ && !isMacintosh && windowCount === 1) {
      return false;
    }
    const confirmSaveUntitledWorkspace = this.configurationService.getValue("window.confirmSaveUntitledWorkspace") !== false;
    if (!confirmSaveUntitledWorkspace) {
      await this.workspacesService.deleteUntitledWorkspace(workspaceIdentifier);
      return false;
    }
    let canceled2 = false;
    const { result, checkboxChecked } = await this.dialogService.prompt({
      type: Severity2.Warning,
      message: localize(23789, null),
      detail: localize(23788, null),
      buttons: [
        {
          label: localize(23787, null),
          run: async () => {
            const newWorkspacePath = await this.pickNewWorkspacePath();
            if (!newWorkspacePath || !hasWorkspaceFileExtension(newWorkspacePath)) {
              return true;
            }
            try {
              await this.saveWorkspaceAs(workspaceIdentifier, newWorkspacePath);
              const newWorkspaceIdentifier = await this.workspacesService.getWorkspaceIdentifier(newWorkspacePath);
              await this.workspacesService.addRecentlyOpened([{
                label: this.labelService.getWorkspaceLabel(newWorkspaceIdentifier, { verbose: 2 /* LONG */ }),
                workspace: newWorkspaceIdentifier,
                remoteAuthority: this.environmentService.remoteAuthority
                // remember whether this was a remote window
              }]);
              await this.workspacesService.deleteUntitledWorkspace(workspaceIdentifier);
            } catch (error) {
            }
            return false;
          }
        },
        {
          label: localize(23785, null),
          run: async () => {
            await this.workspacesService.deleteUntitledWorkspace(workspaceIdentifier);
            return false;
          }
        }
      ],
      cancelButton: {
        run: () => {
          canceled2 = true;
          return true;
        }
      },
      checkbox: {
        label: localize(23784, null)
      }
    });
    if (!canceled2 && checkboxChecked) {
      await this.configurationService.updateValue("window.confirmSaveUntitledWorkspace", false, 2 /* USER */);
    }
    return result;
  }
  async isValidTargetWorkspacePath(workspaceUri) {
    const windows = await this.nativeHostService.getWindows({ includeAuxiliaryWindows: false });
    if (windows.some((window2) => isWorkspaceIdentifier(window2.workspace) && this.uriIdentityService.extUri.isEqual(window2.workspace.configPath, workspaceUri))) {
      await this.dialogService.info(
        localize(23791, null, basename2(workspaceUri)),
        localize(23790, null)
      );
      return false;
    }
    return true;
  }
  async enterWorkspace(workspaceUri) {
    const stopped = await this.extensionService.stopExtensionHosts(localize(23786, null));
    if (!stopped) {
      return;
    }
    const oldWorkspace = toWorkspaceIdentifier(this.contextService.getWorkspace());
    const result = await this.doEnterWorkspace(workspaceUri);
    if (result) {
      await this.storageService.switch(
        result.workspace,
        true
        /* preserve data */
      );
      if (this.workingCopyBackupService instanceof WorkingCopyBackupService) {
        const newBackupWorkspaceHome = result.backupPath ? URI.file(result.backupPath).with({ scheme: this.environmentService.userRoamingDataHome.scheme }) : void 0;
        this.workingCopyBackupService.reinitialize(newBackupWorkspaceHome);
      }
      await this.fireDidEnterWorkspace(oldWorkspace, result.workspace);
    }
    if (this.environmentService.remoteAuthority) {
      this.hostService.reload();
    } else {
      this.extensionService.startExtensionHosts();
    }
  }
};

NativeWorkspaceEditingService = __decorateClass([
  __decorateParam(0, IJSONEditingService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, INativeHostService),
  __decorateParam(3, IWorkbenchConfigurationService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, IWorkingCopyBackupService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, ICommandService),
  __decorateParam(9, IFileService),
  __decorateParam(10, ITextFileService),
  __decorateParam(11, IWorkspacesService),
  __decorateParam(12, INativeWorkbenchEnvironmentService),
  __decorateParam(13, IFileDialogService),
  __decorateParam(14, IDialogService),
  __decorateParam(15, ILifecycleService),
  __decorateParam(16, ILabelService),
  __decorateParam(17, IHostService),
  __decorateParam(18, IUriIdentityService),
  __decorateParam(19, IWorkspaceTrustManagementService),
  __decorateParam(20, IUserDataProfilesService),
  __decorateParam(21, IUserDataProfileService),
  __decorateParam(22, ILogService)
], NativeWorkspaceEditingService);

registerSingleton(IWorkspaceEditingService, NativeWorkspaceEditingService, 1 /* Delayed */);
export { NativeWorkspaceEditingService };
