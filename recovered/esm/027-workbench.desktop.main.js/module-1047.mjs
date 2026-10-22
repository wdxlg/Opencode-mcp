// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workspaces/common/workspaceTrust.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { promiseWithResolvers } from "./module-0036.mjs";
import { isWeb } from "./module-0014.mjs";
import { Schemas } from "./module-0033.mjs";
import { IWorkspaceContextService, isSavedWorkspace, isSingleFolderWorkspaceIdentifier, isTemporaryWorkspace, toWorkspaceIdentifier } from "./module-0509.mjs";
import { URI } from "./module-0032.mjs";
import { isVirtualResource } from "./module-0936.mjs";
import { AGENT_HOST_SCHEME } from "./module-1000.mjs";
import { isEqualAuthority } from "./module-0034.mjs";
import { getRemoteAuthority } from "./module-0687.mjs";
import { IRemoteAuthorityResolverService } from "./module-0894.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { IFileService } from "./module-0269.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { LinkedList } from "./module-0013.mjs";
import { Memento } from "./module-1041.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/workspaces/common/workspaceTrust.ts
var WORKSPACE_TRUST_ENABLED = "security.workspace.trust.enabled";

var WORKSPACE_TRUST_STARTUP_PROMPT = "security.workspace.trust.startupPrompt";

var WORKSPACE_TRUST_BANNER = "security.workspace.trust.banner";

var WORKSPACE_TRUST_UNTRUSTED_FILES = "security.workspace.trust.untrustedFiles";

var WORKSPACE_TRUST_EMPTY_WINDOW = "security.workspace.trust.emptyWindow";

var WORKSPACE_TRUST_EXTENSION_SUPPORT = "extensions.supportUntrustedWorkspaces";

var WORKSPACE_TRUST_STORAGE_KEY = "content.trust.model.key";

var CanonicalWorkspace = class {
  constructor(originalWorkspace, canonicalFolderUris, canonicalConfiguration) {
    this.originalWorkspace = originalWorkspace;
    this.canonicalFolderUris = canonicalFolderUris;
    this.canonicalConfiguration = canonicalConfiguration;
  }
  get folders() {
    return this.originalWorkspace.folders.map((folder, index2) => {
      return {
        index: folder.index,
        name: folder.name,
        toResource: folder.toResource,
        uri: this.canonicalFolderUris[index2]
      };
    });
  }
  get transient() {
    return this.originalWorkspace.transient;
  }
  get configuration() {
    return this.canonicalConfiguration ?? this.originalWorkspace.configuration;
  }
  get id() {
    return this.originalWorkspace.id;
  }
};

var WorkspaceTrustEnablementService = class extends Disposable {
  constructor(configurationService, environmentService) {
    super();
    this.configurationService = configurationService;
    this.environmentService = environmentService;
  }
  isWorkspaceTrustEnabled() {
    if (this.environmentService.disableWorkspaceTrust) {
      return false;
    }
    return !!this.configurationService.getValue(WORKSPACE_TRUST_ENABLED);
  }
};

WorkspaceTrustEnablementService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IWorkbenchEnvironmentService)
], WorkspaceTrustEnablementService);

var WorkspaceTrustManagementService = class extends Disposable {
  constructor(configurationService, remoteAuthorityResolverService, storageService, uriIdentityService, environmentService, workspaceService, workspaceTrustEnablementService, fileService) {
    super();
    this.configurationService = configurationService;
    this.remoteAuthorityResolverService = remoteAuthorityResolverService;
    this.storageService = storageService;
    this.uriIdentityService = uriIdentityService;
    this.environmentService = environmentService;
    this.workspaceService = workspaceService;
    this.workspaceTrustEnablementService = workspaceTrustEnablementService;
    this.fileService = fileService;
    this.storageKey = WORKSPACE_TRUST_STORAGE_KEY;
    this._onDidChangeTrust = this._register(new Emitter());
    this.onDidChangeTrust = this._onDidChangeTrust.event;
    this._onDidChangeTrustedFolders = this._register(new Emitter());
    this.onDidChangeTrustedFolders = this._onDidChangeTrustedFolders.event;
    this._canonicalStartupFiles = [];
    this._canonicalUrisResolved = false;
    this._canonicalWorkspace = this.workspaceService.getWorkspace();
    ({ promise: this._workspaceResolvedPromise, resolve: this._workspaceResolvedPromiseResolve } = promiseWithResolvers());
    ({ promise: this._workspaceTrustInitializedPromise, resolve: this._workspaceTrustInitializedPromiseResolve } = promiseWithResolvers());
    this._storedTrustState = new WorkspaceTrustMemento(isWeb && this.isEmptyWorkspace() ? void 0 : this.storageService);
    this._trustTransitionManager = this._register(new WorkspaceTrustTransitionManager());
    this._trustStateInfo = this.loadTrustInfo();
    this._isTrusted = this.calculateWorkspaceTrust();
    this.initializeWorkspaceTrust();
    this.registerListeners();
  }
  //#region initialize
  initializeWorkspaceTrust() {
    this.resolveCanonicalUris().then(async () => {
      this._canonicalUrisResolved = true;
      await this.updateWorkspaceTrust();
    }).finally(() => {
      this._workspaceResolvedPromiseResolve();
      if (!this.environmentService.remoteAuthority) {
        this._workspaceTrustInitializedPromiseResolve();
      }
    });
    if (this.environmentService.remoteAuthority) {
      this.remoteAuthorityResolverService.resolveAuthority(this.environmentService.remoteAuthority).then(async (result) => {
        this._remoteAuthority = result;
        await this.fileService.activateProvider(Schemas.vscodeRemote);
        await this.updateWorkspaceTrust();
      }).finally(() => {
        this._workspaceTrustInitializedPromiseResolve();
      });
    }
    if (this.isEmptyWorkspace()) {
      this._workspaceTrustInitializedPromise.then(() => {
        if (this._storedTrustState.isEmptyWorkspaceTrusted === void 0) {
          this._storedTrustState.isEmptyWorkspaceTrusted = this.isWorkspaceTrusted();
        }
      });
    }
  }
  //#endregion
  //#region private interface
  registerListeners() {
    this._register(this.workspaceService.onDidChangeWorkspaceFolders(async () => await this.updateWorkspaceTrust()));
    this._register(this.storageService.onDidChangeValue(-2 /* APPLICATION_SHARED */, this.storageKey, this._store)(async () => {
      if (JSON.stringify(this._trustStateInfo) !== JSON.stringify(this.loadTrustInfo())) {
        this._trustStateInfo = this.loadTrustInfo();
        this._onDidChangeTrustedFolders.fire();
        await this.updateWorkspaceTrust();
      }
    }));
  }
  async getCanonicalUri(uri5) {
    let canonicalUri = uri5;
    if (this.environmentService.remoteAuthority && uri5.scheme === Schemas.vscodeRemote) {
      canonicalUri = await this.remoteAuthorityResolverService.getCanonicalURI(uri5);
    } else if (uri5.scheme === "vscode-vfs") {
      const index2 = uri5.authority.indexOf("+");
      if (index2 !== -1) {
        canonicalUri = uri5.with({ authority: uri5.authority.substr(0, index2) });
      }
    }
    return canonicalUri.with({ query: null, fragment: null });
  }
  async resolveCanonicalUris() {
    const filesToOpen = [];
    if (this.environmentService.filesToOpenOrCreate) {
      filesToOpen.push(...this.environmentService.filesToOpenOrCreate);
    }
    if (this.environmentService.filesToDiff) {
      filesToOpen.push(...this.environmentService.filesToDiff);
    }
    if (this.environmentService.filesToMerge) {
      filesToOpen.push(...this.environmentService.filesToMerge);
    }
    if (filesToOpen.length) {
      const filesToOpenOrCreateUris = filesToOpen.filter((f) => !!f.fileUri).map((f) => f.fileUri);
      const canonicalFilesToOpen = await Promise.all(filesToOpenOrCreateUris.map((uri5) => this.getCanonicalUri(uri5)));
      this._canonicalStartupFiles.push(...canonicalFilesToOpen.filter((uri5) => this._canonicalStartupFiles.every((u) => !this.uriIdentityService.extUri.isEqual(uri5, u))));
    }
    const workspaceUris = this.workspaceService.getWorkspace().folders.map((f) => f.uri);
    const canonicalWorkspaceFolders = await Promise.all(workspaceUris.map((uri5) => this.getCanonicalUri(uri5)));
    let canonicalWorkspaceConfiguration = this.workspaceService.getWorkspace().configuration;
    if (canonicalWorkspaceConfiguration && isSavedWorkspace(canonicalWorkspaceConfiguration, this.environmentService)) {
      canonicalWorkspaceConfiguration = await this.getCanonicalUri(canonicalWorkspaceConfiguration);
    }
    this._canonicalWorkspace = new CanonicalWorkspace(this.workspaceService.getWorkspace(), canonicalWorkspaceFolders, canonicalWorkspaceConfiguration);
  }
  loadTrustInfo() {
    const infoAsString = this.storageService.get(this.storageKey, -2 /* APPLICATION_SHARED */);
    let result;
    try {
      if (infoAsString) {
        result = JSON.parse(infoAsString);
      }
    } catch {
    }
    if (!result) {
      result = {
        uriTrustInfo: []
      };
    }
    if (!result.uriTrustInfo) {
      result.uriTrustInfo = [];
    }
    result.uriTrustInfo = result.uriTrustInfo.map((info) => {
      return { uri: URI.revive(info.uri), trusted: info.trusted };
    });
    result.uriTrustInfo = result.uriTrustInfo.filter((info) => info.trusted);
    return result;
  }
  async saveTrustInfo() {
    this.storageService.store(this.storageKey, JSON.stringify(this._trustStateInfo), -2 /* APPLICATION_SHARED */, 1 /* MACHINE */);
    this._onDidChangeTrustedFolders.fire();
    await this.updateWorkspaceTrust();
  }
  getWorkspaceUris() {
    const workspaceUris = this._canonicalWorkspace.folders.map((f) => f.uri);
    const workspaceConfiguration = this._canonicalWorkspace.configuration;
    if (workspaceConfiguration && isSavedWorkspace(workspaceConfiguration, this.environmentService)) {
      workspaceUris.push(workspaceConfiguration);
    }
    return workspaceUris;
  }
  calculateWorkspaceTrust() {
    if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
      return true;
    }
    if (!this._canonicalUrisResolved) {
      return false;
    }
    if (this.environmentService.remoteAuthority && this._remoteAuthority?.options?.isTrusted) {
      return this._remoteAuthority.options.isTrusted;
    }
    if (this.isEmptyWorkspace()) {
      if (this._storedTrustState.isEmptyWorkspaceTrusted !== void 0) {
        return this._storedTrustState.isEmptyWorkspaceTrusted;
      }
      if (this._canonicalStartupFiles.length) {
        return this.getUrisTrust(this._canonicalStartupFiles);
      }
      return !!this.configurationService.getValue(WORKSPACE_TRUST_EMPTY_WINDOW);
    }
    return this.getUrisTrust(this.getWorkspaceUris());
  }
  async updateWorkspaceTrust(trusted) {
    if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
      return;
    }
    if (trusted === void 0) {
      await this.resolveCanonicalUris();
      trusted = this.calculateWorkspaceTrust();
    }
    if (this.isWorkspaceTrusted() === trusted) {
      return;
    }
    this.isTrusted = trusted;
    await this._trustTransitionManager.participate(trusted);
    this._onDidChangeTrust.fire(trusted);
  }
  getUrisTrust(uris) {
    let state = true;
    for (const uri5 of uris) {
      const { trusted } = this.doGetUriTrustInfo(uri5);
      if (!trusted) {
        state = trusted;
        return state;
      }
    }
    return state;
  }
  doGetUriTrustInfo(uri5) {
    if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
      return { trusted: true, uri: uri5 };
    }
    if (this.uriIdentityService.extUri.isEqual(uri5, this.environmentService.agentSessionsWorkspace)) {
      return { trusted: true, uri: uri5 };
    }
    if (this.isTrustedVirtualResource(uri5)) {
      return { trusted: true, uri: uri5 };
    }
    if (this.isTrustedByRemote(uri5)) {
      return { trusted: true, uri: uri5 };
    }
    let resultState = false;
    let maxLength = -1;
    let resultUri = uri5;
    for (const trustInfo of this._trustStateInfo.uriTrustInfo) {
      if (this.uriIdentityService.extUri.isEqualOrParent(uri5, trustInfo.uri)) {
        const fsPath = trustInfo.uri.fsPath;
        if (fsPath.length > maxLength) {
          maxLength = fsPath.length;
          resultState = trustInfo.trusted;
          resultUri = trustInfo.uri;
        }
      }
    }
    return { trusted: resultState, uri: resultUri };
  }
  async doSetUrisTrust(uris, trusted) {
    let changed = false;
    for (const uri5 of uris) {
      if (trusted) {
        if (this.isTrustedVirtualResource(uri5)) {
          continue;
        }
        if (this.isTrustedByRemote(uri5)) {
          continue;
        }
        const foundItem = this._trustStateInfo.uriTrustInfo.find((trustInfo) => this.uriIdentityService.extUri.isEqual(trustInfo.uri, uri5));
        if (!foundItem) {
          this._trustStateInfo.uriTrustInfo.push({ uri: uri5, trusted: true });
          changed = true;
        }
      } else {
        const previousLength = this._trustStateInfo.uriTrustInfo.length;
        this._trustStateInfo.uriTrustInfo = this._trustStateInfo.uriTrustInfo.filter((trustInfo) => !this.uriIdentityService.extUri.isEqual(trustInfo.uri, uri5));
        if (previousLength !== this._trustStateInfo.uriTrustInfo.length) {
          changed = true;
        }
      }
    }
    if (changed) {
      await this.saveTrustInfo();
    }
  }
  isEmptyWorkspace() {
    if (this.workspaceService.getWorkbenchState() === 1 /* EMPTY */) {
      return true;
    }
    const workspace = this.workspaceService.getWorkspace();
    if (workspace) {
      return isTemporaryWorkspace(this.workspaceService.getWorkspace()) && workspace.folders.length === 0;
    }
    return false;
  }
  isTrustedVirtualResource(uri5) {
    return isVirtualResource(uri5) && uri5.scheme !== "vscode-vfs" && uri5.scheme !== AGENT_HOST_SCHEME;
  }
  isTrustedByRemote(uri5) {
    if (!this.environmentService.remoteAuthority) {
      return false;
    }
    if (!this._remoteAuthority) {
      return false;
    }
    return isEqualAuthority(getRemoteAuthority(uri5), this._remoteAuthority.authority.authority) && !!this._remoteAuthority.options?.isTrusted;
  }
  set isTrusted(value2) {
    this._isTrusted = value2;
    if (!value2) {
      this._storedTrustState.acceptsOutOfWorkspaceFiles = false;
    }
    if (this.isEmptyWorkspace()) {
      this._storedTrustState.isEmptyWorkspaceTrusted = value2;
    }
  }
  //#endregion
  //#region public interface
  get workspaceResolved() {
    return this._workspaceResolvedPromise;
  }
  get workspaceTrustInitialized() {
    return this._workspaceTrustInitializedPromise;
  }
  get acceptsOutOfWorkspaceFiles() {
    return this._storedTrustState.acceptsOutOfWorkspaceFiles;
  }
  set acceptsOutOfWorkspaceFiles(value2) {
    this._storedTrustState.acceptsOutOfWorkspaceFiles = value2;
  }
  isWorkspaceTrusted() {
    return this._isTrusted;
  }
  isWorkspaceTrustForced() {
    if (this.environmentService.remoteAuthority && this._remoteAuthority?.options?.isTrusted !== void 0) {
      return true;
    }
    const workspaceUris = this.getWorkspaceUris().filter((uri5) => !this.isTrustedVirtualResource(uri5));
    if (workspaceUris.length === 0) {
      return true;
    }
    return false;
  }
  canSetParentFolderTrust() {
    const workspaceIdentifier = toWorkspaceIdentifier(this._canonicalWorkspace);
    if (!isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
      return false;
    }
    if (workspaceIdentifier.uri.scheme !== Schemas.file && workspaceIdentifier.uri.scheme !== Schemas.vscodeRemote) {
      return false;
    }
    const parentFolder = this.uriIdentityService.extUri.dirname(workspaceIdentifier.uri);
    if (this.uriIdentityService.extUri.isEqual(workspaceIdentifier.uri, parentFolder)) {
      return false;
    }
    return true;
  }
  async setParentFolderTrust(trusted) {
    if (this.canSetParentFolderTrust()) {
      const workspaceUri = toWorkspaceIdentifier(this._canonicalWorkspace).uri;
      const parentFolder = this.uriIdentityService.extUri.dirname(workspaceUri);
      await this.setUrisTrust([parentFolder], trusted);
    }
  }
  canSetWorkspaceTrust() {
    if (this.environmentService.remoteAuthority && (!this._remoteAuthority || this._remoteAuthority.options?.isTrusted !== void 0)) {
      return false;
    }
    if (this.isEmptyWorkspace()) {
      return true;
    }
    const workspaceUris = this.getWorkspaceUris().filter((uri5) => !this.isTrustedVirtualResource(uri5));
    if (workspaceUris.length === 0) {
      return false;
    }
    if (!this.isWorkspaceTrusted()) {
      return true;
    }
    const workspaceIdentifier = toWorkspaceIdentifier(this._canonicalWorkspace);
    if (!isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
      return false;
    }
    if (workspaceIdentifier.uri.scheme !== Schemas.file && workspaceIdentifier.uri.scheme !== "vscode-vfs") {
      return false;
    }
    const trustInfo = this.doGetUriTrustInfo(workspaceIdentifier.uri);
    if (!trustInfo.trusted || !this.uriIdentityService.extUri.isEqual(workspaceIdentifier.uri, trustInfo.uri)) {
      return false;
    }
    if (this.canSetParentFolderTrust()) {
      const parentFolder = this.uriIdentityService.extUri.dirname(workspaceIdentifier.uri);
      const parentPathTrustInfo = this.doGetUriTrustInfo(parentFolder);
      if (parentPathTrustInfo.trusted) {
        return false;
      }
    }
    return true;
  }
  async setWorkspaceTrust(trusted) {
    if (this.isEmptyWorkspace()) {
      await this.updateWorkspaceTrust(trusted);
      return;
    }
    const workspaceFolders = this.getWorkspaceUris();
    await this.setUrisTrust(workspaceFolders, trusted);
  }
  async getUriTrustInfo(uri5) {
    if (!this.workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
      return { trusted: true, uri: uri5 };
    }
    if (this.isTrustedByRemote(uri5)) {
      return { trusted: true, uri: uri5 };
    }
    return this.doGetUriTrustInfo(await this.getCanonicalUri(uri5));
  }
  async setUrisTrust(uris, trusted) {
    await this.doSetUrisTrust(await Promise.all(uris.map((uri5) => this.getCanonicalUri(uri5))), trusted);
  }
  getTrustedUris() {
    return this._trustStateInfo.uriTrustInfo.map((info) => info.uri);
  }
  async setTrustedUris(uris) {
    this._trustStateInfo.uriTrustInfo = [];
    for (const uri5 of uris) {
      const canonicalUri = await this.getCanonicalUri(uri5);
      const cleanUri = this.uriIdentityService.extUri.removeTrailingPathSeparator(canonicalUri);
      let added = false;
      for (const addedUri of this._trustStateInfo.uriTrustInfo) {
        if (this.uriIdentityService.extUri.isEqual(addedUri.uri, cleanUri)) {
          added = true;
          break;
        }
      }
      if (added) {
        continue;
      }
      this._trustStateInfo.uriTrustInfo.push({
        trusted: true,
        uri: cleanUri
      });
    }
    await this.saveTrustInfo();
  }
  addWorkspaceTrustTransitionParticipant(participant) {
    return this._trustTransitionManager.addWorkspaceTrustTransitionParticipant(participant);
  }
  //#endregion
};

WorkspaceTrustManagementService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IRemoteAuthorityResolverService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IUriIdentityService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IWorkspaceTrustEnablementService),
  __decorateParam(7, IFileService)
], WorkspaceTrustManagementService);

var WorkspaceTrustRequestService = class extends Disposable {
  constructor(configurationService, workspaceTrustManagementService) {
    super();
    this.configurationService = configurationService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this._resourcesTrustRequestPromises = new ResourceMap();
    this._resourcesTrustRequestResolvers = new ResourceMap();
    this._onDidInitiateOpenFilesTrustRequest = this._register(new Emitter());
    this.onDidInitiateOpenFilesTrustRequest = this._onDidInitiateOpenFilesTrustRequest.event;
    this._onDidInitiateResourcesTrustRequest = this._register(new Emitter());
    this.onDidInitiateResourcesTrustRequest = this._onDidInitiateResourcesTrustRequest.event;
    this._onDidInitiateWorkspaceTrustRequest = this._register(new Emitter());
    this.onDidInitiateWorkspaceTrustRequest = this._onDidInitiateWorkspaceTrustRequest.event;
    this._onDidInitiateWorkspaceTrustRequestOnStartup = this._register(new Emitter());
    this.onDidInitiateWorkspaceTrustRequestOnStartup = this._onDidInitiateWorkspaceTrustRequestOnStartup.event;
  }
  //#region Open file(s) trust request
  get untrustedFilesSetting() {
    return this.configurationService.getValue(WORKSPACE_TRUST_UNTRUSTED_FILES);
  }
  set untrustedFilesSetting(value2) {
    this.configurationService.updateValue(WORKSPACE_TRUST_UNTRUSTED_FILES, value2);
  }
  async completeOpenFilesTrustRequest(result, saveResponse) {
    if (!this._openFilesTrustRequestResolver) {
      return;
    }
    if (result === 1 /* Open */) {
      this.workspaceTrustManagementService.acceptsOutOfWorkspaceFiles = true;
    }
    if (saveResponse) {
      if (result === 1 /* Open */) {
        this.untrustedFilesSetting = "open";
      }
      if (result === 2 /* OpenInNewWindow */) {
        this.untrustedFilesSetting = "newWindow";
      }
    }
    this._openFilesTrustRequestResolver(result);
    this._openFilesTrustRequestResolver = void 0;
    this._openFilesTrustRequestPromise = void 0;
  }
  async requestOpenFilesTrust(uris) {
    if (!this.workspaceTrustManagementService.isWorkspaceTrusted()) {
      return 1 /* Open */;
    }
    const openFilesTrustInfo = await Promise.all(uris.map((uri5) => this.workspaceTrustManagementService.getUriTrustInfo(uri5)));
    if (openFilesTrustInfo.map((info) => info.trusted).every((trusted) => trusted)) {
      return 1 /* Open */;
    }
    if (this.untrustedFilesSetting !== "prompt") {
      if (this.untrustedFilesSetting === "newWindow") {
        return 2 /* OpenInNewWindow */;
      }
      if (this.untrustedFilesSetting === "open") {
        return 1 /* Open */;
      }
    }
    if (this.workspaceTrustManagementService.acceptsOutOfWorkspaceFiles) {
      return 1 /* Open */;
    }
    if (!this._openFilesTrustRequestPromise) {
      this._openFilesTrustRequestPromise = new Promise((resolve3) => {
        this._openFilesTrustRequestResolver = resolve3;
      });
    } else {
      return this._openFilesTrustRequestPromise;
    }
    this._onDidInitiateOpenFilesTrustRequest.fire();
    return this._openFilesTrustRequestPromise;
  }
  //#endregion
  //#region Resource(s) trust request
  async completeResourcesTrustRequest(uri5, result) {
    const resolver = this._resourcesTrustRequestResolvers.get(uri5);
    if (!resolver) {
      return;
    }
    const trusted = result === 1 /* Open */;
    await this.workspaceTrustManagementService.setUrisTrust([uri5], trusted);
    resolver(trusted);
    this._resourcesTrustRequestResolvers.delete(uri5);
    this._resourcesTrustRequestPromises.delete(uri5);
  }
  async requestResourcesTrust(options3) {
    const resourcesTrustInfo = await this.workspaceTrustManagementService.getUriTrustInfo(options3.uri);
    if (resourcesTrustInfo.trusted) {
      return true;
    }
    const existingPromise = this._resourcesTrustRequestPromises.get(options3.uri);
    if (existingPromise) {
      return existingPromise;
    }
    const promise = new Promise((resolve3) => {
      this._resourcesTrustRequestResolvers.set(options3.uri, resolve3);
    });
    this._resourcesTrustRequestPromises.set(options3.uri, promise);
    this._onDidInitiateResourcesTrustRequest.fire(options3);
    return promise;
  }
  //#endregion
  //#region Workspace trust request
  resolveWorkspaceTrustRequest(trusted) {
    if (this._workspaceTrustRequestResolver) {
      this._workspaceTrustRequestResolver(trusted ?? this.workspaceTrustManagementService.isWorkspaceTrusted());
      this._workspaceTrustRequestResolver = void 0;
      this._workspaceTrustRequestPromise = void 0;
    }
  }
  cancelWorkspaceTrustRequest() {
    if (this._workspaceTrustRequestResolver) {
      this._workspaceTrustRequestResolver(void 0);
      this._workspaceTrustRequestResolver = void 0;
      this._workspaceTrustRequestPromise = void 0;
    }
  }
  async completeWorkspaceTrustRequest(trusted) {
    if (trusted === void 0 || trusted === this.workspaceTrustManagementService.isWorkspaceTrusted()) {
      this.resolveWorkspaceTrustRequest(trusted);
      return;
    }
    Event2.once(this.workspaceTrustManagementService.onDidChangeTrust)((trusted2) => this.resolveWorkspaceTrustRequest(trusted2));
    await this.workspaceTrustManagementService.setWorkspaceTrust(trusted);
  }
  async requestWorkspaceTrust(options3) {
    if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
      return this.workspaceTrustManagementService.isWorkspaceTrusted();
    }
    if (!this._workspaceTrustRequestPromise) {
      this._workspaceTrustRequestPromise = new Promise((resolve3) => {
        this._workspaceTrustRequestResolver = resolve3;
      });
    } else {
      return this._workspaceTrustRequestPromise;
    }
    this._onDidInitiateWorkspaceTrustRequest.fire(options3);
    return this._workspaceTrustRequestPromise;
  }
  requestWorkspaceTrustOnStartup() {
    if (!this._workspaceTrustRequestPromise) {
      this._workspaceTrustRequestPromise = new Promise((resolve3) => {
        this._workspaceTrustRequestResolver = resolve3;
      });
    }
    this._onDidInitiateWorkspaceTrustRequestOnStartup.fire();
  }
  //#endregion
};

WorkspaceTrustRequestService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IWorkspaceTrustManagementService)
], WorkspaceTrustRequestService);

var WorkspaceTrustTransitionManager = class extends Disposable {
  constructor() {
    super(...arguments);
    this.participants = new LinkedList();
  }
  addWorkspaceTrustTransitionParticipant(participant) {
    const remove2 = this.participants.push(participant);
    return toDisposable(() => remove2());
  }
  async participate(trusted) {
    for (const participant of this.participants) {
      await participant.participate(trusted);
    }
  }
  dispose() {
    this.participants.clear();
    super.dispose();
  }
};

var WorkspaceTrustMemento = class {
  constructor(storageService) {
    this._acceptsOutOfWorkspaceFilesKey = "acceptsOutOfWorkspaceFiles";
    this._isEmptyWorkspaceTrustedKey = "isEmptyWorkspaceTrusted";
    if (storageService) {
      this._memento = new Memento("workspaceTrust", storageService);
      this._mementoObject = this._memento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
    } else {
      this._mementoObject = {};
    }
  }
  get acceptsOutOfWorkspaceFiles() {
    return this._mementoObject[this._acceptsOutOfWorkspaceFilesKey] ?? false;
  }
  set acceptsOutOfWorkspaceFiles(value2) {
    this._mementoObject[this._acceptsOutOfWorkspaceFilesKey] = value2;
    this._memento?.saveMemento();
  }
  get isEmptyWorkspaceTrusted() {
    return this._mementoObject[this._isEmptyWorkspaceTrustedKey];
  }
  set isEmptyWorkspaceTrusted(value2) {
    this._mementoObject[this._isEmptyWorkspaceTrustedKey] = value2;
    this._memento?.saveMemento();
  }
};

registerSingleton(IWorkspaceTrustRequestService, WorkspaceTrustRequestService, 1 /* Delayed */);
export { WORKSPACE_TRUST_ENABLED, WORKSPACE_TRUST_STARTUP_PROMPT, WORKSPACE_TRUST_BANNER, WORKSPACE_TRUST_UNTRUSTED_FILES, WORKSPACE_TRUST_EMPTY_WINDOW, WORKSPACE_TRUST_EXTENSION_SUPPORT, WORKSPACE_TRUST_STORAGE_KEY, CanonicalWorkspace, WorkspaceTrustEnablementService, WorkspaceTrustManagementService, WorkspaceTrustRequestService, WorkspaceTrustTransitionManager, WorkspaceTrustMemento };
