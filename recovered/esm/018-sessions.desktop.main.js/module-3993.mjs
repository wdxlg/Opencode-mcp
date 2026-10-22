// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/electron-browser/workingCopyBackupTracker.ts
import { WorkingCopyBackupTracker } from "./module-3992.mjs";
import { localize } from "./module-0001.mjs";
import { HotExitConfiguration } from "./module-0269.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { IDialogService, IFileDialogService, getFileNamesMessage } from "./module-0267.mjs";
import { Promises, raceCancellation } from "./module-0036.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkingCopyBackupService } from "./module-1122.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { IWorkingCopyService } from "./module-1073.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { ILogService } from "./module-0095.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IWorkingCopyEditorService } from "./module-1395.mjs";
import { IEditorService } from "./module-0935.mjs";


// src/vs/workbench/services/workingCopy/electron-browser/workingCopyBackupTracker.ts
var NativeWorkingCopyBackupTracker = class extends WorkingCopyBackupTracker {
  constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, fileDialogService, dialogService, contextService, nativeHostService, logService, environmentService, progressService, workingCopyEditorService, editorService) {
    super(workingCopyBackupService, workingCopyService, logService, lifecycleService, filesConfigurationService, workingCopyEditorService, editorService);
    this.fileDialogService = fileDialogService;
    this.dialogService = dialogService;
    this.contextService = contextService;
    this.nativeHostService = nativeHostService;
    this.environmentService = environmentService;
    this.progressService = progressService;
  }
  static {
    this.ID = "workbench.contrib.nativeWorkingCopyBackupTracker";
  }
  async onFinalBeforeShutdown(reason) {
    this.cancelBackupOperations();
    const { resume } = this.suspendBackupOperations();
    try {
      const modifiedWorkingCopies = this.workingCopyService.modifiedWorkingCopies;
      if (modifiedWorkingCopies.length) {
        return await this.onBeforeShutdownWithModified(reason, modifiedWorkingCopies);
      } else {
        return await this.onBeforeShutdownWithoutModified();
      }
    } finally {
      resume();
    }
  }
  async onBeforeShutdownWithModified(reason, modifiedWorkingCopies) {
    const workingCopiesToAutoSave = modifiedWorkingCopies.filter((wc) => !(wc.capabilities & 2 /* Untitled */) && this.filesConfigurationService.getAutoSaveMode(wc.resource).mode !== 0 /* OFF */);
    if (workingCopiesToAutoSave.length > 0) {
      try {
        await this.doSaveAllBeforeShutdown(workingCopiesToAutoSave, 2 /* AUTO */);
      } catch (error) {
        this.logService.error(`[backup tracker] error saving modified working copies: ${error}`);
      }
      const remainingModifiedWorkingCopies = this.workingCopyService.modifiedWorkingCopies;
      if (remainingModifiedWorkingCopies.length) {
        return this.handleModifiedBeforeShutdown(remainingModifiedWorkingCopies, reason);
      }
      return this.noVeto([...modifiedWorkingCopies]);
    }
    return this.handleModifiedBeforeShutdown(modifiedWorkingCopies, reason);
  }
  async handleModifiedBeforeShutdown(modifiedWorkingCopies, reason) {
    let backups = [];
    let backupError = void 0;
    const modifiedWorkingCopiesToBackup = await this.shouldBackupBeforeShutdown(reason, modifiedWorkingCopies);
    if (modifiedWorkingCopiesToBackup.length > 0) {
      try {
        const backupResult = await this.backupBeforeShutdown(modifiedWorkingCopiesToBackup);
        backups = backupResult.backups;
        backupError = backupResult.error;
        if (backups.length === modifiedWorkingCopies.length) {
          return false;
        }
      } catch (error) {
        backupError = error;
      }
    }
    const remainingModifiedWorkingCopies = modifiedWorkingCopies.filter((workingCopy) => !backups.includes(workingCopy));
    if (backupError) {
      if (this.environmentService.isExtensionDevelopment) {
        this.logService.error(`[backup tracker] error creating backups: ${backupError}`);
        return false;
      }
      return this.showErrorDialog(localize(23769, null), remainingModifiedWorkingCopies, backupError, reason);
    }
    try {
      return await this.confirmBeforeShutdown(remainingModifiedWorkingCopies);
    } catch (error) {
      if (this.environmentService.isExtensionDevelopment) {
        this.logService.error(`[backup tracker] error saving or reverting modified working copies: ${error}`);
        return false;
      }
      return this.showErrorDialog(localize(23770, null), remainingModifiedWorkingCopies, error, reason);
    }
  }
  async shouldBackupBeforeShutdown(reason, modifiedWorkingCopies) {
    if (!this.filesConfigurationService.isHotExitEnabled) {
      return [];
    }
    if (this.environmentService.isExtensionDevelopment) {
      return modifiedWorkingCopies;
    }
    switch (reason) {
      // Window Close
      case 1 /* CLOSE */:
        if (this.contextService.getWorkbenchState() !== 1 /* EMPTY */ && this.filesConfigurationService.hotExitConfiguration === HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
          return modifiedWorkingCopies;
        }
        if (isMacintosh || await this.nativeHostService.getWindowCount() > 1) {
          if (this.contextService.getWorkbenchState() !== 1 /* EMPTY */) {
            return modifiedWorkingCopies.filter((modifiedWorkingCopy) => modifiedWorkingCopy.capabilities & 4 /* Scratchpad */);
          }
          return [];
        }
        return modifiedWorkingCopies;
      // backup if last window is closed on win/linux where the application quits right after
      // Application Quit
      case 2 /* QUIT */:
        return modifiedWorkingCopies;
      // backup because next start we restore all backups
      // Window Reload
      case 3 /* RELOAD */:
        return modifiedWorkingCopies;
      // backup because after window reload, backups restore
      // Workspace Change
      case 4 /* LOAD */:
        if (this.contextService.getWorkbenchState() !== 1 /* EMPTY */) {
          if (this.filesConfigurationService.hotExitConfiguration === HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
            return modifiedWorkingCopies;
          }
          return modifiedWorkingCopies.filter((modifiedWorkingCopy) => modifiedWorkingCopy.capabilities & 4 /* Scratchpad */);
        }
        return [];
    }
  }
  async showErrorDialog(message, workingCopies, error, reason) {
    this.logService.error(`[backup tracker] ${message}: ${error}`);
    const modifiedWorkingCopies = workingCopies.filter((workingCopy) => workingCopy.isModified());
    const advice = localize(23768, null);
    const detail2 = modifiedWorkingCopies.length ? `${getFileNamesMessage(modifiedWorkingCopies.map((x) => x.name))}
${advice}` : advice;
    const { result } = await this.dialogService.prompt({
      type: "error",
      message,
      detail: detail2,
      buttons: [
        {
          label: localize(23772, null),
          run: () => true
          // veto
        },
        {
          label: this.toForceShutdownLabel(reason),
          run: () => false
          // no veto
        }
      ]
    });
    return result ?? true;
  }
  toForceShutdownLabel(reason) {
    switch (reason) {
      case 1 /* CLOSE */:
      case 4 /* LOAD */:
        return localize(23775, null);
      case 2 /* QUIT */:
        return localize(23776, null);
      case 3 /* RELOAD */:
        return localize(23777, null);
    }
  }
  async backupBeforeShutdown(modifiedWorkingCopies) {
    const backups = [];
    let error = void 0;
    await this.withProgressAndCancellation(
      async (token) => {
        try {
          await Promises.settled(modifiedWorkingCopies.map(async (workingCopy) => {
            const contentVersion = this.getContentVersion(workingCopy);
            if (this.workingCopyBackupService.hasBackupSync(workingCopy, contentVersion)) {
              backups.push(workingCopy);
            } else {
              const backup = await workingCopy.backup(token);
              if (token.isCancellationRequested) {
                return;
              }
              await this.workingCopyBackupService.backup(workingCopy, backup.content, contentVersion, backup.meta, token);
              if (token.isCancellationRequested) {
                return;
              }
              backups.push(workingCopy);
            }
          }));
        } catch (backupError) {
          error = backupError;
        }
      },
      localize(23767, null),
      localize(23766, null)
    );
    return { backups, error };
  }
  async confirmBeforeShutdown(modifiedWorkingCopies) {
    const confirm = await this.fileDialogService.showSaveConfirm(modifiedWorkingCopies.map((workingCopy) => workingCopy.name));
    if (confirm === 0 /* SAVE */) {
      const modifiedCountBeforeSave = this.workingCopyService.modifiedCount;
      try {
        await this.doSaveAllBeforeShutdown(modifiedWorkingCopies, 1 /* EXPLICIT */);
      } catch (error) {
        this.logService.error(`[backup tracker] error saving modified working copies: ${error}`);
      }
      const savedWorkingCopies = modifiedCountBeforeSave - this.workingCopyService.modifiedCount;
      if (savedWorkingCopies < modifiedWorkingCopies.length) {
        return true;
      }
      return this.noVeto(modifiedWorkingCopies);
    } else if (confirm === 1 /* DONT_SAVE */) {
      try {
        await this.doRevertAllBeforeShutdown(modifiedWorkingCopies);
      } catch (error) {
        this.logService.error(`[backup tracker] error reverting modified working copies: ${error}`);
      }
      return this.noVeto(modifiedWorkingCopies);
    }
    return true;
  }
  doSaveAllBeforeShutdown(workingCopies, reason) {
    return this.withProgressAndCancellation(
      async () => {
        const saveOptions = { skipSaveParticipants: true, reason };
        let result = void 0;
        if (workingCopies.length === this.workingCopyService.modifiedCount) {
          result = (await this.editorService.saveAll({
            includeUntitled: { includeScratchpad: true },
            ...saveOptions
          })).success;
        }
        if (result !== false) {
          await Promises.settled(workingCopies.map((workingCopy) => workingCopy.isModified() ? workingCopy.save(saveOptions) : Promise.resolve(true)));
        }
      },
      localize(23774, null),
      void 0,
      // Do not pick `Dialog` as location for reporting progress if it is likely
      // that the save operation will itself open a dialog for asking for the
      // location to save to for untitled or scratchpad working copies.
      // https://github.com/microsoft/vscode-internalbacklog/issues/4943
      workingCopies.some((workingCopy) => workingCopy.capabilities & 2 /* Untitled */ || workingCopy.capabilities & 4 /* Scratchpad */) ? 10 /* Window */ : 20 /* Dialog */
    );
  }
  doRevertAllBeforeShutdown(modifiedWorkingCopies) {
    return this.withProgressAndCancellation(async () => {
      const revertOptions = { soft: true };
      if (modifiedWorkingCopies.length === this.workingCopyService.modifiedCount) {
        await this.editorService.revertAll(revertOptions);
      }
      await Promises.settled(modifiedWorkingCopies.map((workingCopy) => workingCopy.isModified() ? workingCopy.revert(revertOptions) : Promise.resolve()));
    }, localize(23773, null));
  }
  onBeforeShutdownWithoutModified() {
    return this.noVeto({ except: this.contextService.getWorkbenchState() === 1 /* EMPTY */ ? [] : Array.from(this.unrestoredBackups) });
  }
  async noVeto(arg1) {
    await this.discardBackupsBeforeShutdown(arg1);
    return false;
  }
  async discardBackupsBeforeShutdown(arg1) {
    if (!this.isReady) {
      return;
    }
    await this.withProgressAndCancellation(async () => {
      try {
        if (Array.isArray(arg1)) {
          await Promises.settled(arg1.map((workingCopy) => this.workingCopyBackupService.discardBackup(workingCopy)));
        } else {
          await this.workingCopyBackupService.discardBackups(arg1);
        }
      } catch (error) {
        this.logService.error(`[backup tracker] error discarding backups: ${error}`);
      }
    }, localize(23771, null));
  }
  withProgressAndCancellation(promiseFactory, title, detail2, location2 = 20 /* Dialog */) {
    const cts = new CancellationTokenSource();
    return this.progressService.withProgress({
      location: location2,
      // by default use a dialog to prevent the user from making any more changes now (https://github.com/microsoft/vscode/issues/122774)
      cancellable: true,
      // allow to cancel (https://github.com/microsoft/vscode/issues/112278)
      delay: 800,
      // delay so that it only appears when operation takes a long time
      title,
      detail: detail2
    }, () => raceCancellation(promiseFactory(cts.token), cts.token), () => cts.dispose(true));
  }
};

NativeWorkingCopyBackupTracker = __decorateClass([
  __decorateParam(0, IWorkingCopyBackupService),
  __decorateParam(1, IFilesConfigurationService),
  __decorateParam(2, IWorkingCopyService),
  __decorateParam(3, ILifecycleService),
  __decorateParam(4, IFileDialogService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, INativeHostService),
  __decorateParam(8, ILogService),
  __decorateParam(9, IEnvironmentService),
  __decorateParam(10, IProgressService),
  __decorateParam(11, IWorkingCopyEditorService),
  __decorateParam(12, IEditorService)
], NativeWorkingCopyBackupTracker);
export { NativeWorkingCopyBackupTracker };
