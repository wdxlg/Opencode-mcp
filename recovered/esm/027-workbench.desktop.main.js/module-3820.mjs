// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workspaces/browser/abstractWorkspaceEditingService.ts
import { Promises } from "./module-0036.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Schemas } from "./module-0033.mjs";
import { localize } from "./module-0001.mjs";
import { IWorkspaceContextService, WORKSPACE_EXTENSION, WORKSPACE_FILTER, hasWorkspaceFileExtension, isSavedWorkspace, isUntitledWorkspace, isWorkspaceIdentifier, toWorkspaceIdentifier } from "./module-0509.mjs";
import { basename2, isEqual2, isEqualAuthority, joinPath, removeTrailingPathSeparator2 } from "./module-0034.mjs";
import { distinct } from "./module-0007.mjs";
import { IWorkspacesService, rewriteWorkspaceFileForNewLocation } from "./module-1379.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IJSONEditingService } from "./module-1643.mjs";
import { IWorkbenchConfigurationService } from "./module-1198.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { IHostService } from "./module-1117.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/services/workspaces/browser/abstractWorkspaceEditingService.ts
var DidEnterWorkspaceEvent = class {
  constructor(oldWorkspace, newWorkspace) {
    this.oldWorkspace = oldWorkspace;
    this.newWorkspace = newWorkspace;
    this.promises = [];
  }
  join(promise) {
    this.promises.push(promise);
  }
  async wait() {
    await Promises.settled(this.promises);
  }
};

var AbstractWorkspaceEditingService = class extends Disposable {
  constructor(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService, logService) {
    super();
    this.jsonEditingService = jsonEditingService;
    this.contextService = contextService;
    this.configurationService = configurationService;
    this.notificationService = notificationService;
    this.commandService = commandService;
    this.fileService = fileService;
    this.textFileService = textFileService;
    this.workspacesService = workspacesService;
    this.environmentService = environmentService;
    this.fileDialogService = fileDialogService;
    this.dialogService = dialogService;
    this.hostService = hostService;
    this.uriIdentityService = uriIdentityService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.userDataProfilesService = userDataProfilesService;
    this.userDataProfileService = userDataProfileService;
    this.logService = logService;
    this._onDidEnterWorkspace = this._register(new Emitter());
    this.onDidEnterWorkspace = this._onDidEnterWorkspace.event;
  }
  async pickNewWorkspacePath() {
    const availableFileSystems = [Schemas.file];
    if (this.environmentService.remoteAuthority) {
      availableFileSystems.unshift(Schemas.vscodeRemote);
    }
    let workspacePath = await this.fileDialogService.showSaveDialog({
      saveLabel: localize(23780, null),
      title: localize(23781, null),
      filters: WORKSPACE_FILTER,
      defaultUri: joinPath(await this.fileDialogService.defaultWorkspacePath(), this.getNewWorkspaceName()),
      availableFileSystems
    });
    if (!workspacePath) {
      return;
    }
    if (!hasWorkspaceFileExtension(workspacePath)) {
      workspacePath = workspacePath.with({ path: `${workspacePath.path}.${WORKSPACE_EXTENSION}` });
    }
    return workspacePath;
  }
  getNewWorkspaceName() {
    const configPathURI = this.getCurrentWorkspaceIdentifier()?.configPath;
    if (configPathURI && isSavedWorkspace(configPathURI, this.environmentService)) {
      return basename2(configPathURI);
    }
    const folder = this.contextService.getWorkspace().folders.at(0);
    if (folder) {
      return `${basename2(folder.uri)}.${WORKSPACE_EXTENSION}`;
    }
    return `workspace.${WORKSPACE_EXTENSION}`;
  }
  async updateFolders(index2, deleteCount, foldersToAddCandidates, donotNotifyError) {
    const folders = this.contextService.getWorkspace().folders;
    let foldersToDelete = [];
    if (typeof deleteCount === "number") {
      foldersToDelete = folders.slice(index2, index2 + deleteCount).map((folder) => folder.uri);
    }
    let foldersToAdd = [];
    if (Array.isArray(foldersToAddCandidates)) {
      foldersToAdd = foldersToAddCandidates.map((folderToAdd) => ({ uri: removeTrailingPathSeparator2(folderToAdd.uri), name: folderToAdd.name }));
    }
    const wantsToDelete = foldersToDelete.length > 0;
    const wantsToAdd = foldersToAdd.length > 0;
    if (!wantsToAdd && !wantsToDelete) {
      return;
    }
    if (wantsToAdd && !wantsToDelete) {
      return this.doAddFolders(foldersToAdd, index2, donotNotifyError);
    }
    if (wantsToDelete && !wantsToAdd) {
      return this.removeFolders(foldersToDelete);
    } else {
      if (this.includesSingleFolderWorkspace(foldersToDelete)) {
        return this.createAndEnterWorkspace(foldersToAdd);
      }
      if (this.contextService.getWorkbenchState() !== 3 /* WORKSPACE */) {
        return this.doAddFolders(foldersToAdd, index2, donotNotifyError);
      }
      return this.doUpdateFolders(foldersToAdd, foldersToDelete, index2, donotNotifyError);
    }
  }
  async doUpdateFolders(foldersToAdd, foldersToDelete, index2, donotNotifyError = false) {
    try {
      await this.contextService.updateFolders(foldersToAdd, foldersToDelete, index2);
    } catch (error) {
      if (donotNotifyError) {
        throw error;
      }
      this.handleWorkspaceConfigurationEditingError(error);
    }
  }
  addFolders(foldersToAddCandidates, donotNotifyError = false) {
    const foldersToAdd = foldersToAddCandidates.map((folderToAdd) => ({ uri: removeTrailingPathSeparator2(folderToAdd.uri), name: folderToAdd.name }));
    return this.doAddFolders(foldersToAdd, void 0, donotNotifyError);
  }
  async doAddFolders(foldersToAdd, index2, donotNotifyError = false) {
    const state = this.contextService.getWorkbenchState();
    const remoteAuthority = this.environmentService.remoteAuthority;
    if (remoteAuthority) {
      foldersToAdd = foldersToAdd.filter((folder) => folder.uri.scheme !== Schemas.file && (folder.uri.scheme !== Schemas.vscodeRemote || isEqualAuthority(folder.uri.authority, remoteAuthority)));
    }
    if (state !== 3 /* WORKSPACE */) {
      let newWorkspaceFolders = this.contextService.getWorkspace().folders.map((folder) => ({ uri: folder.uri }));
      newWorkspaceFolders.splice(typeof index2 === "number" ? index2 : newWorkspaceFolders.length, 0, ...foldersToAdd);
      newWorkspaceFolders = distinct(newWorkspaceFolders, (folder) => this.uriIdentityService.extUri.getComparisonKey(folder.uri));
      if (state === 1 /* EMPTY */ && newWorkspaceFolders.length === 0 || state === 2 /* FOLDER */ && newWorkspaceFolders.length === 1) {
        return;
      }
      return this.createAndEnterWorkspace(newWorkspaceFolders);
    }
    try {
      await this.contextService.addFolders(foldersToAdd, index2);
    } catch (error) {
      if (donotNotifyError) {
        throw error;
      }
      this.handleWorkspaceConfigurationEditingError(error);
    }
  }
  async removeFolders(foldersToRemove, donotNotifyError = false) {
    if (this.includesSingleFolderWorkspace(foldersToRemove)) {
      return this.createAndEnterWorkspace([]);
    }
    try {
      await this.contextService.removeFolders(foldersToRemove);
    } catch (error) {
      if (donotNotifyError) {
        throw error;
      }
      this.handleWorkspaceConfigurationEditingError(error);
    }
  }
  includesSingleFolderWorkspace(folders) {
    if (this.contextService.getWorkbenchState() === 2 /* FOLDER */) {
      const workspaceFolder = this.contextService.getWorkspace().folders[0];
      return folders.some((folder) => this.uriIdentityService.extUri.isEqual(folder, workspaceFolder.uri));
    }
    return false;
  }
  async createAndEnterWorkspace(folders, path) {
    if (path && !await this.isValidTargetWorkspacePath(path)) {
      return;
    }
    const remoteAuthority = this.environmentService.remoteAuthority;
    const untitledWorkspace = await this.workspacesService.createUntitledWorkspace(folders, remoteAuthority);
    if (path) {
      try {
        await this.saveWorkspaceAs(untitledWorkspace, path);
      } finally {
        await this.workspacesService.deleteUntitledWorkspace(untitledWorkspace);
      }
    } else {
      path = untitledWorkspace.configPath;
      if (!this.userDataProfileService.currentProfile.isDefault) {
        await this.userDataProfilesService.setProfileForWorkspace(untitledWorkspace, this.userDataProfileService.currentProfile);
      }
    }
    return this.enterWorkspace(path);
  }
  async saveAndEnterWorkspace(workspaceUri) {
    const workspaceIdentifier = this.getCurrentWorkspaceIdentifier();
    if (!workspaceIdentifier) {
      return;
    }
    if (isEqual2(workspaceIdentifier.configPath, workspaceUri)) {
      return this.saveWorkspace(workspaceIdentifier);
    }
    if (!await this.isValidTargetWorkspacePath(workspaceUri)) {
      return;
    }
    await this.saveWorkspaceAs(workspaceIdentifier, workspaceUri);
    return this.enterWorkspace(workspaceUri);
  }
  async isValidTargetWorkspacePath(workspaceUri) {
    return true;
  }
  async saveWorkspaceAs(workspace, targetConfigPathURI) {
    const configPathURI = workspace.configPath;
    const isNotUntitledWorkspace = !isUntitledWorkspace(targetConfigPathURI, this.environmentService);
    if (isNotUntitledWorkspace && !this.userDataProfileService.currentProfile.isDefault) {
      const newWorkspace = await this.workspacesService.getWorkspaceIdentifier(targetConfigPathURI);
      await this.userDataProfilesService.setProfileForWorkspace(newWorkspace, this.userDataProfileService.currentProfile);
    }
    if (this.uriIdentityService.extUri.isEqual(configPathURI, targetConfigPathURI)) {
      return;
    }
    const isFromUntitledWorkspace = isUntitledWorkspace(configPathURI, this.environmentService);
    const raw = await this.fileService.readFile(configPathURI);
    const newRawWorkspaceContents = rewriteWorkspaceFileForNewLocation(raw.value.toString(), configPathURI, isFromUntitledWorkspace, targetConfigPathURI, this.uriIdentityService.extUri);
    await this.textFileService.create([{ resource: targetConfigPathURI, value: newRawWorkspaceContents, options: { overwrite: true } }]);
    await this.trustWorkspaceConfiguration(targetConfigPathURI);
  }
  async saveWorkspace(workspace) {
    const configPathURI = workspace.configPath;
    const existingModel = this.textFileService.files.get(configPathURI);
    if (existingModel) {
      await existingModel.save({ force: true, reason: 1 /* EXPLICIT */ });
      return;
    }
    const workspaceFileExists = await this.fileService.exists(configPathURI);
    if (workspaceFileExists) {
      return;
    }
    const newWorkspace = { folders: [] };
    const newRawWorkspaceContents = rewriteWorkspaceFileForNewLocation(JSON.stringify(newWorkspace, null, "	"), configPathURI, false, configPathURI, this.uriIdentityService.extUri);
    await this.textFileService.create([{ resource: configPathURI, value: newRawWorkspaceContents }]);
  }
  handleWorkspaceConfigurationEditingError(error) {
    switch (error.code) {
      case 0 /* ERROR_INVALID_FILE */:
        this.onInvalidWorkspaceConfigurationFileError();
        break;
      default:
        this.notificationService.error(error.message);
    }
  }
  onInvalidWorkspaceConfigurationFileError() {
    const message = localize(23778, null);
    this.askToOpenWorkspaceConfigurationFile(message);
  }
  askToOpenWorkspaceConfigurationFile(message) {
    this.notificationService.prompt(
      Severity2.Error,
      message,
      [{
        label: localize(23779, null),
        run: () => this.commandService.executeCommand("workbench.action.openWorkspaceConfigFile")
      }]
    );
  }
  async fireDidEnterWorkspace(oldWorkspace, newWorkspace) {
    const event = new DidEnterWorkspaceEvent(oldWorkspace, newWorkspace);
    this._onDidEnterWorkspace.fire(event);
    try {
      await event.wait();
    } catch (error) {
      this.logService.error("Error while waiting for participants of onDidEnterWorkspace to join:", error);
    }
  }
  async doEnterWorkspace(workspaceUri) {
    if (this.environmentService.extensionTestsLocationURI) {
      throw new Error("Entering a new workspace is not possible in tests.");
    }
    const workspace = await this.workspacesService.getWorkspaceIdentifier(workspaceUri);
    if (this.contextService.getWorkbenchState() === 2 /* FOLDER */) {
      await this.migrateWorkspaceSettings(workspace);
    }
    await this.configurationService.initialize(workspace);
    return this.workspacesService.enterWorkspace(workspaceUri);
  }
  migrateWorkspaceSettings(toWorkspace) {
    return this.doCopyWorkspaceSettings(toWorkspace, (setting) => setting.scope === 4 /* WINDOW */);
  }
  copyWorkspaceSettings(toWorkspace) {
    return this.doCopyWorkspaceSettings(toWorkspace);
  }
  doCopyWorkspaceSettings(toWorkspace, filter2) {
    const configurationProperties = Registry.as(Extensions4.Configuration).getConfigurationProperties();
    const targetWorkspaceConfiguration = {};
    for (const key3 of this.configurationService.keys().workspace) {
      if (configurationProperties[key3]) {
        if (filter2 && !filter2(configurationProperties[key3])) {
          continue;
        }
        targetWorkspaceConfiguration[key3] = this.configurationService.inspect(key3).workspaceValue;
      }
    }
    return this.jsonEditingService.write(toWorkspace.configPath, [{ path: ["settings"], value: targetWorkspaceConfiguration }], true);
  }
  async trustWorkspaceConfiguration(configPathURI) {
    if (this.contextService.getWorkbenchState() !== 1 /* EMPTY */ && this.workspaceTrustManagementService.isWorkspaceTrusted()) {
      await this.workspaceTrustManagementService.setUrisTrust([configPathURI], true);
    }
  }
  getCurrentWorkspaceIdentifier() {
    const identifier2 = toWorkspaceIdentifier(this.contextService.getWorkspace());
    if (isWorkspaceIdentifier(identifier2)) {
      return identifier2;
    }
    return void 0;
  }
};

AbstractWorkspaceEditingService = __decorateClass([
  __decorateParam(0, IJSONEditingService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IWorkbenchConfigurationService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IFileService),
  __decorateParam(6, ITextFileService),
  __decorateParam(7, IWorkspacesService),
  __decorateParam(8, IWorkbenchEnvironmentService),
  __decorateParam(9, IFileDialogService),
  __decorateParam(10, IDialogService),
  __decorateParam(11, IHostService),
  __decorateParam(12, IUriIdentityService),
  __decorateParam(13, IWorkspaceTrustManagementService),
  __decorateParam(14, IUserDataProfilesService),
  __decorateParam(15, IUserDataProfileService),
  __decorateParam(16, ILogService)
], AbstractWorkspaceEditingService);
export { DidEnterWorkspaceEvent, AbstractWorkspaceEditingService };
