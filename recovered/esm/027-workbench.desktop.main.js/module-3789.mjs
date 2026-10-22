// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/dialogs/browser/abstractFileDialogService.ts
import { basename2, dirname2, extname2, isEqual2, isEqualOrParent2, toLocalResource } from "./module-0034.mjs";
import { Schemas } from "./module-0033.mjs";
import { isAbsolute, normalize } from "./module-0026.mjs";
import { IWorkspaceContextService, WORKSPACE_EXTENSION, isSavedWorkspace, isTemporaryWorkspace } from "./module-0509.mjs";
import { localize } from "./module-0001.mjs";
import { IDialogService, getFileNamesMessage } from "./module-0267.mjs";
import { severity_default } from "./module-0266.mjs";
import { isFileToOpen, isWorkspaceToOpen } from "./module-0515.mjs";
import { SimpleFileDialog } from "./module-3788.mjs";
import { coalesce, distinct } from "./module-0007.mjs";
import { trim } from "./module-0030.mjs";
import { PLAINTEXT_EXTENSION } from "./module-0141.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHostService } from "./module-1117.mjs";
import { IHistoryService } from "./module-1494.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService } from "./module-0269.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IWorkspacesService } from "./module-1379.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IPathService } from "./module-0938.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { ILogService } from "./module-0095.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";


// src/vs/workbench/services/dialogs/browser/abstractFileDialogService.ts
var AbstractFileDialogService = class {
  constructor(hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, dialogService, languageService, workspacesService, labelService, pathService, commandService, editorService, codeEditorService, logService, remoteAgentService) {
    this.hostService = hostService;
    this.contextService = contextService;
    this.historyService = historyService;
    this.environmentService = environmentService;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.fileService = fileService;
    this.openerService = openerService;
    this.dialogService = dialogService;
    this.languageService = languageService;
    this.workspacesService = workspacesService;
    this.labelService = labelService;
    this.pathService = pathService;
    this.commandService = commandService;
    this.editorService = editorService;
    this.codeEditorService = codeEditorService;
    this.logService = logService;
    this.remoteAgentService = remoteAgentService;
  }
  async defaultFilePath(schemeFilter = this.getSchemeFilterForWindow(), authorityFilter = this.getAuthorityFilterForWindow()) {
    let candidate = this.historyService.getLastActiveFile(schemeFilter, authorityFilter);
    if (candidate && await this.isRemoteUserData(candidate)) {
      this.logService.debug(`[FileDialogService] Skipping last active file as it is a remote user data resource: ${candidate}`);
      candidate = void 0;
    }
    if (!candidate) {
      candidate = this.historyService.getLastActiveWorkspaceRoot(schemeFilter, authorityFilter);
      if (candidate) {
        this.logService.debug(`[FileDialogService] Default file path using last active workspace root: ${candidate}`);
      }
    } else {
      this.logService.debug(`[FileDialogService] Default file path using parent of last active file: ${candidate}`);
      candidate = dirname2(candidate);
    }
    if (!candidate) {
      candidate = await this.preferredHome(schemeFilter);
      this.logService.debug(`[FileDialogService] Default file path using preferred home: ${candidate}`);
    }
    return candidate;
  }
  async defaultFolderPath(schemeFilter = this.getSchemeFilterForWindow(), authorityFilter = this.getAuthorityFilterForWindow()) {
    let candidate = this.historyService.getLastActiveWorkspaceRoot(schemeFilter, authorityFilter);
    if (!candidate) {
      candidate = this.historyService.getLastActiveFile(schemeFilter, authorityFilter);
      if (candidate && await this.isRemoteUserData(candidate)) {
        this.logService.debug(`[FileDialogService] Skipping last active file as it is a remote user data resource: ${candidate}`);
        candidate = void 0;
      }
      if (candidate) {
        this.logService.debug(`[FileDialogService] Default folder path using parent of last active file: ${candidate}`);
      }
    } else {
      this.logService.debug(`[FileDialogService] Default folder path using last active workspace root: ${candidate}`);
    }
    if (!candidate) {
      const preferredHome = await this.preferredHome(schemeFilter);
      this.logService.debug(`[FileDialogService] Default folder path using preferred home: ${preferredHome}`);
      return preferredHome;
    }
    return dirname2(candidate);
  }
  async preferredHome(schemeFilter = this.getSchemeFilterForWindow()) {
    const preferLocal = schemeFilter === Schemas.file;
    const preferredHomeConfig = this.configurationService.inspect("files.dialog.defaultPath");
    const preferredHomeCandidate = preferLocal ? preferredHomeConfig.userLocalValue : preferredHomeConfig.userRemoteValue;
    this.logService.debug(`[FileDialogService] Preferred home: preferLocal=${preferLocal}, userLocalValue=${preferredHomeConfig.userLocalValue}, userRemoteValue=${preferredHomeConfig.userRemoteValue}`);
    if (preferredHomeCandidate) {
      const isPreferredHomeCandidateAbsolute = preferLocal ? isAbsolute(preferredHomeCandidate) : (await this.pathService.path).isAbsolute(preferredHomeCandidate);
      if (isPreferredHomeCandidateAbsolute) {
        const preferredHomeNormalized = preferLocal ? normalize(preferredHomeCandidate) : (await this.pathService.path).normalize(preferredHomeCandidate);
        const preferredHome = toLocalResource(await this.pathService.fileURI(preferredHomeNormalized), this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
        if (await this.fileService.exists(preferredHome)) {
          this.logService.debug(`[FileDialogService] Preferred home using files.dialog.defaultPath setting: ${preferredHome}`);
          return preferredHome;
        }
        this.logService.debug(`[FileDialogService] Preferred home files.dialog.defaultPath path does not exist: ${preferredHome}`);
      } else {
        this.logService.debug(`[FileDialogService] Preferred home files.dialog.defaultPath is not absolute: ${preferredHomeCandidate}`);
      }
    }
    const userHome = this.pathService.userHome({ preferLocal });
    this.logService.debug(`[FileDialogService] Preferred home using user home: ${userHome}`);
    return userHome;
  }
  async defaultWorkspacePath(schemeFilter = this.getSchemeFilterForWindow()) {
    let defaultWorkspacePath;
    if (this.contextService.getWorkbenchState() === 3 /* WORKSPACE */) {
      const configuration2 = this.contextService.getWorkspace().configuration;
      if (configuration2?.scheme === schemeFilter && isSavedWorkspace(configuration2, this.environmentService) && !isTemporaryWorkspace(configuration2)) {
        defaultWorkspacePath = dirname2(configuration2);
      }
    }
    if (!defaultWorkspacePath) {
      defaultWorkspacePath = await this.defaultFilePath(schemeFilter);
    }
    return defaultWorkspacePath;
  }
  async showSaveConfirm(fileNamesOrResources) {
    if (this.skipDialogs()) {
      this.logService.trace("FileDialogService: refused to show save confirmation dialog in tests.");
      return 1 /* DONT_SAVE */;
    }
    return this.doShowSaveConfirm(fileNamesOrResources);
  }
  skipDialogs() {
    if (this.environmentService.enableSmokeTestDriver) {
      this.logService.warn("DialogService: Dialog requested during smoke test.");
    }
    return this.environmentService.isExtensionDevelopment && !!this.environmentService.extensionTestsLocationURI;
  }
  async doShowSaveConfirm(fileNamesOrResources) {
    if (fileNamesOrResources.length === 0) {
      return 1 /* DONT_SAVE */;
    }
    let message;
    let detail2 = localize(22876, null);
    if (fileNamesOrResources.length === 1) {
      message = localize(22877, null, typeof fileNamesOrResources[0] === "string" ? fileNamesOrResources[0] : basename2(fileNamesOrResources[0]));
    } else {
      message = localize(22878, null, fileNamesOrResources.length);
      detail2 = getFileNamesMessage(fileNamesOrResources) + "\n" + detail2;
    }
    const { result } = await this.dialogService.prompt({
      type: severity_default.Warning,
      message,
      detail: detail2,
      buttons: [
        {
          label: fileNamesOrResources.length > 1 ? localize(22874, null) : localize(22873, null),
          run: () => 0 /* SAVE */
        },
        {
          label: localize(22866, null),
          run: () => 1 /* DONT_SAVE */
        }
      ],
      cancelButton: {
        run: () => 2 /* CANCEL */
      }
    });
    return result;
  }
  addFileSchemaIfNeeded(schema10, _isFolder) {
    return schema10 === Schemas.untitled ? [Schemas.file] : schema10 !== Schemas.file ? [schema10, Schemas.file] : [schema10];
  }
  async pickFileFolderAndOpenSimplified(schema10, options3, preferNewWindow) {
    const title = localize(22870, null);
    const availableFileSystems = this.addFileSchemaIfNeeded(schema10);
    const uris = await this.pickResource({ canSelectFiles: true, canSelectFolders: true, canSelectMany: false, defaultUri: options3.defaultUri, title, availableFileSystems });
    const uri5 = uris?.[0];
    if (uri5) {
      const stat = await this.fileService.stat(uri5);
      const toOpen = stat.isDirectory ? { folderUri: uri5 } : { fileUri: uri5 };
      if (!isWorkspaceToOpen(toOpen) && isFileToOpen(toOpen)) {
        this.addFileToRecentlyOpened(toOpen.fileUri);
      }
      if (stat.isDirectory || options3.forceNewWindow || preferNewWindow) {
        await this.hostService.openWindow([toOpen], { forceNewWindow: options3.forceNewWindow, remoteAuthority: options3.remoteAuthority });
      } else {
        await this.editorService.openEditors([{ resource: uri5, options: { source: 1 /* USER */, pinned: true } }], void 0, { validateTrust: true });
      }
    }
  }
  async pickFileAndOpenSimplified(schema10, options3, preferNewWindow) {
    const title = localize(22869, null);
    const availableFileSystems = this.addFileSchemaIfNeeded(schema10);
    const uris = await this.pickResource({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, defaultUri: options3.defaultUri, title, availableFileSystems });
    const uri5 = uris?.[0];
    if (uri5) {
      this.addFileToRecentlyOpened(uri5);
      if (options3.forceNewWindow || preferNewWindow) {
        await this.hostService.openWindow([{ fileUri: uri5 }], { forceNewWindow: options3.forceNewWindow, remoteAuthority: options3.remoteAuthority });
      } else {
        await this.editorService.openEditors([{ resource: uri5, options: { source: 1 /* USER */, pinned: true } }], void 0, { validateTrust: true });
      }
    }
  }
  addFileToRecentlyOpened(uri5) {
    this.workspacesService.addRecentlyOpened([{ fileUri: uri5, label: this.labelService.getUriLabel(uri5, { appendWorkspaceSuffix: true }) }]);
  }
  async pickFolderAndOpenSimplified(schema10, options3) {
    const title = localize(22871, null);
    const availableFileSystems = this.addFileSchemaIfNeeded(schema10, true);
    const uris = await this.pickResource({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, defaultUri: options3.defaultUri, title, availableFileSystems });
    const uri5 = uris?.[0];
    if (uri5) {
      return this.hostService.openWindow([{ folderUri: uri5 }], { forceNewWindow: options3.forceNewWindow, remoteAuthority: options3.remoteAuthority });
    }
  }
  async pickWorkspaceAndOpenSimplified(schema10, options3) {
    const title = localize(22872, null);
    const filters2 = [{ name: localize(22867, null), extensions: [WORKSPACE_EXTENSION] }];
    const availableFileSystems = this.addFileSchemaIfNeeded(schema10, true);
    const uris = await this.pickResource({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, defaultUri: options3.defaultUri, title, filters: filters2, availableFileSystems });
    const uri5 = uris?.[0];
    if (uri5) {
      return this.hostService.openWindow([{ workspaceUri: uri5 }], { forceNewWindow: options3.forceNewWindow, remoteAuthority: options3.remoteAuthority });
    }
  }
  async pickFileToSaveSimplified(schema10, options3) {
    if (!options3.availableFileSystems) {
      options3.availableFileSystems = this.addFileSchemaIfNeeded(schema10);
    }
    options3.title = localize(22879, null);
    const uri5 = await this.saveRemoteResource(options3);
    if (uri5) {
      this.addFileToRecentlyOpened(uri5);
    }
    return uri5;
  }
  async showSaveDialogSimplified(schema10, options3) {
    if (!options3.availableFileSystems) {
      options3.availableFileSystems = this.addFileSchemaIfNeeded(schema10);
    }
    return this.saveRemoteResource(options3);
  }
  async showOpenDialogSimplified(schema10, options3) {
    if (!options3.availableFileSystems) {
      options3.availableFileSystems = this.addFileSchemaIfNeeded(schema10, options3.canSelectFolders);
    }
    return this.pickResource(options3);
  }
  getSimpleFileDialog() {
    return this.instantiationService.createInstance(SimpleFileDialog);
  }
  pickResource(options3) {
    return this.getSimpleFileDialog().showOpenDialog(options3);
  }
  saveRemoteResource(options3) {
    return this.getSimpleFileDialog().showSaveDialog(options3);
  }
  /**
   * Checks whether the given resource is a remote user data file
   * that should not be used as a default file dialog path candidate.
   * This covers remote user data files such as settings.json, keybindings.json, etc.
   */
  async isRemoteUserData(resource) {
    if (!this.environmentService.remoteAuthority) {
      return false;
    }
    const remoteEnv = await this.remoteAgentService.getEnvironment();
    if (remoteEnv) {
      const remoteDataHome = dirname2(dirname2(remoteEnv.settingsPath));
      if (!isEqual2(remoteDataHome, remoteDataHome.with({ path: "/" })) && isEqualOrParent2(resource, remoteDataHome)) {
        return true;
      }
    }
    return false;
  }
  getSchemeFilterForWindow(defaultUriScheme) {
    return defaultUriScheme ?? this.pathService.defaultUriScheme;
  }
  getAuthorityFilterForWindow() {
    return this.environmentService.remoteAuthority;
  }
  getFileSystemSchema(options3) {
    return options3.availableFileSystems?.[0] || this.getSchemeFilterForWindow(options3.defaultUri?.scheme);
  }
  getWorkspaceAvailableFileSystems(options3) {
    if (options3.availableFileSystems && options3.availableFileSystems.length > 0) {
      return options3.availableFileSystems;
    }
    const availableFileSystems = [Schemas.file];
    if (this.environmentService.remoteAuthority) {
      availableFileSystems.unshift(Schemas.vscodeRemote);
    }
    return availableFileSystems;
  }
  getPickFileToSaveDialogOptions(defaultUri, availableFileSystems) {
    const options3 = {
      defaultUri,
      title: localize(22875, null),
      availableFileSystems
    };
    const ext = defaultUri ? extname2(defaultUri) : void 0;
    let matchingFilter;
    const registeredLanguageNames = this.languageService.getSortedRegisteredLanguageNames();
    const registeredLanguageFilters = coalesce(registeredLanguageNames.map(({ languageName, languageId }) => {
      const extensions = this.languageService.getExtensions(languageId);
      if (!extensions.length) {
        return null;
      }
      const filter2 = { name: languageName, extensions: distinct(extensions).slice(0, 10).map((e) => trim(e, ".")) };
      const extOrPlaintext = ext || PLAINTEXT_EXTENSION;
      if (!matchingFilter && extensions.includes(extOrPlaintext)) {
        matchingFilter = filter2;
        const trimmedExt = trim(extOrPlaintext, ".");
        if (!filter2.extensions.includes(trimmedExt)) {
          filter2.extensions.unshift(trimmedExt);
        }
        return null;
      }
      return filter2;
    }));
    if (!matchingFilter && ext) {
      matchingFilter = { name: trim(ext, ".").toUpperCase(), extensions: [trim(ext, ".")] };
    }
    options3.filters = coalesce([
      { name: localize(22865, null), extensions: ["*"] },
      matchingFilter,
      ...registeredLanguageFilters,
      { name: localize(22868, null), extensions: [""] }
    ]);
    return options3;
  }
};

AbstractFileDialogService = __decorateClass([
  __decorateParam(0, IHostService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IHistoryService),
  __decorateParam(3, IWorkbenchEnvironmentService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IFileService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, ILanguageService),
  __decorateParam(10, IWorkspacesService),
  __decorateParam(11, ILabelService),
  __decorateParam(12, IPathService),
  __decorateParam(13, ICommandService),
  __decorateParam(14, IEditorService),
  __decorateParam(15, ICodeEditorService),
  __decorateParam(16, ILogService),
  __decorateParam(17, IRemoteAgentService)
], AbstractFileDialogService);
export { AbstractFileDialogService };
