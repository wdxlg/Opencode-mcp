// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/dialogs/electron-browser/fileDialogService.ts
import { AbstractFileDialogService } from "./module-3909.mjs";
import { Schemas } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHostService } from "./module-1118.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IHistoryService } from "./module-1493.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService } from "./module-0269.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IWorkspacesService } from "./module-1378.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IPathService } from "./module-0939.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { ILogService } from "./module-0095.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/dialogs/electron-browser/fileDialogService.ts
var FileDialogService = class extends AbstractFileDialogService {
  constructor(hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, nativeHostService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService, remoteAgentService) {
    super(
      hostService,
      contextService,
      historyService,
      environmentService,
      instantiationService,
      configurationService,
      fileService,
      openerService,
      dialogService,
      languageService,
      workspacesService,
      labelService,
      pathService,
      commandService,
      editorService,
      codeEditorService,
      logService,
      remoteAgentService
    );
    this.nativeHostService = nativeHostService;
  }
  toNativeOpenDialogOptions(options3) {
    return {
      forceNewWindow: options3.forceNewWindow,
      telemetryExtraData: options3.telemetryExtraData,
      defaultPath: options3.defaultUri?.fsPath
    };
  }
  shouldUseSimplified(schema10) {
    const setting = this.configurationService.getValue("files.simpleDialog.enable") === true;
    const newWindowSetting = this.configurationService.getValue("window.openFilesInNewWindow") === "on";
    return {
      // - Only real files can be shown in the native file picker
      // - If the simple file dialog is enabled
      // - driver automation (like smoke tests) can use the simple file dialog but not native
      useSimplified: schema10 !== Schemas.file && schema10 !== Schemas.vscodeUserData || setting || !!this.environmentService.enableSmokeTestDriver,
      isSetting: newWindowSetting
    };
  }
  async pickFileFolderAndOpen(options3) {
    const schema10 = this.getFileSystemSchema(options3);
    if (!options3.defaultUri) {
      options3.defaultUri = await this.defaultFilePath(schema10);
    }
    const shouldUseSimplified = this.shouldUseSimplified(schema10);
    if (shouldUseSimplified.useSimplified) {
      return this.pickFileFolderAndOpenSimplified(schema10, options3, shouldUseSimplified.isSetting);
    }
    return this.nativeHostService.pickFileFolderAndOpen(this.toNativeOpenDialogOptions(options3));
  }
  async pickFileAndOpen(options3) {
    const schema10 = this.getFileSystemSchema(options3);
    if (!options3.defaultUri) {
      options3.defaultUri = await this.defaultFilePath(schema10);
    }
    const shouldUseSimplified = this.shouldUseSimplified(schema10);
    if (shouldUseSimplified.useSimplified) {
      return this.pickFileAndOpenSimplified(schema10, options3, shouldUseSimplified.isSetting);
    }
    return this.nativeHostService.pickFileAndOpen(this.toNativeOpenDialogOptions(options3));
  }
  async pickFolderAndOpen(options3) {
    const schema10 = this.getFileSystemSchema(options3);
    if (!options3.defaultUri) {
      options3.defaultUri = await this.defaultFolderPath(schema10);
    }
    if (this.shouldUseSimplified(schema10).useSimplified) {
      return this.pickFolderAndOpenSimplified(schema10, options3);
    }
    return this.nativeHostService.pickFolderAndOpen(this.toNativeOpenDialogOptions(options3));
  }
  async pickWorkspaceAndOpen(options3) {
    options3.availableFileSystems = this.getWorkspaceAvailableFileSystems(options3);
    const schema10 = this.getFileSystemSchema(options3);
    if (!options3.defaultUri) {
      options3.defaultUri = await this.defaultWorkspacePath(schema10);
    }
    if (this.shouldUseSimplified(schema10).useSimplified) {
      return this.pickWorkspaceAndOpenSimplified(schema10, options3);
    }
    return this.nativeHostService.pickWorkspaceAndOpen(this.toNativeOpenDialogOptions(options3));
  }
  async pickFileToSave(defaultUri, availableFileSystems) {
    const schema10 = this.getFileSystemSchema({ defaultUri, availableFileSystems });
    const options3 = this.getPickFileToSaveDialogOptions(defaultUri, availableFileSystems);
    if (this.shouldUseSimplified(schema10).useSimplified) {
      return this.pickFileToSaveSimplified(schema10, options3);
    } else {
      const result = await this.nativeHostService.showSaveDialog(this.toNativeSaveDialogOptions(options3));
      if (result && !result.canceled && result.filePath) {
        const uri4 = URI.file(result.filePath);
        this.addFileToRecentlyOpened(uri4);
        return uri4;
      }
    }
    return;
  }
  toNativeSaveDialogOptions(options3) {
    options3.defaultUri = options3.defaultUri ? URI.file(options3.defaultUri.path) : void 0;
    return {
      defaultPath: options3.defaultUri?.fsPath,
      buttonLabel: typeof options3.saveLabel === "string" ? options3.saveLabel : options3.saveLabel?.withMnemonic,
      filters: options3.filters,
      title: options3.title,
      targetWindowId: getActiveWindow().vscodeWindowId
    };
  }
  async showSaveDialog(options3) {
    const schema10 = this.getFileSystemSchema(options3);
    if (this.shouldUseSimplified(schema10).useSimplified) {
      return this.showSaveDialogSimplified(schema10, options3);
    }
    const result = await this.nativeHostService.showSaveDialog(this.toNativeSaveDialogOptions(options3));
    if (result && !result.canceled && result.filePath) {
      return URI.file(result.filePath);
    }
    return;
  }
  async showOpenDialog(options3) {
    const schema10 = this.getFileSystemSchema(options3);
    if (this.shouldUseSimplified(schema10).useSimplified) {
      return this.showOpenDialogSimplified(schema10, options3);
    }
    const newOptions = {
      title: options3.title,
      defaultPath: options3.defaultUri?.fsPath,
      buttonLabel: typeof options3.openLabel === "string" ? options3.openLabel : options3.openLabel?.withMnemonic,
      filters: options3.filters,
      properties: [],
      targetWindowId: getActiveWindow().vscodeWindowId
    };
    newOptions.properties.push("createDirectory");
    if (options3.canSelectFiles) {
      newOptions.properties.push("openFile");
    }
    if (options3.canSelectFolders) {
      newOptions.properties.push("openDirectory");
    }
    if (options3.canSelectMany) {
      newOptions.properties.push("multiSelections");
    }
    const result = await this.nativeHostService.showOpenDialog(newOptions);
    return result && Array.isArray(result.filePaths) && result.filePaths.length > 0 ? result.filePaths.map(URI.file) : void 0;
  }
};

FileDialogService = __decorateClass([
  __decorateParam(0, IHostService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IHistoryService),
  __decorateParam(3, IWorkbenchEnvironmentService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, INativeHostService),
  __decorateParam(9, IDialogService),
  __decorateParam(10, ILanguageService),
  __decorateParam(11, IWorkspacesService),
  __decorateParam(12, ILabelService),
  __decorateParam(13, IPathService),
  __decorateParam(14, ICommandService),
  __decorateParam(15, IEditorService),
  __decorateParam(16, ICodeEditorService),
  __decorateParam(17, ILogService),
  __decorateParam(18, IRemoteAgentService)
], FileDialogService);

registerSingleton(IFileDialogService, FileDialogService, 1 /* Delayed */);
export { FileDialogService };
