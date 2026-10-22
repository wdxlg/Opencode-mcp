// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadWorkspace.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { QueryBuilder } from "./module-1311.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { isNative } from "./module-0014.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { IWorkspaceContextService, isUntitledWorkspace } from "./module-0509.mjs";
import { revive } from "./module-0265.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { checkGlobFileExists } from "./module-1312.mjs";
import { coalesce } from "./module-0007.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { ISearchService } from "./module-1000.mjs";
import { IEditSessionIdentityService } from "./module-1256.mjs";
import { ICanonicalUriService } from "./module-1314.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IWorkspaceEditingService } from "./module-1313.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IRequestService } from "./module-0947.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { ITextFileService } from "./module-1064.mjs";


// src/vs/workbench/api/browser/mainThreadWorkspace.ts
var MainThreadWorkspace = class extends Disposable {
  constructor(extHostContext, _searchService, _contextService, _editSessionIdentityService, _canonicalUriService, _editorService, _workspaceEditingService, _notificationService, _requestService, _instantiationService, _labelService, _environmentService, fileService, _workspaceTrustManagementService, _workspaceTrustRequestService, _textFileService) {
    super();
    this._searchService = _searchService;
    this._contextService = _contextService;
    this._editSessionIdentityService = _editSessionIdentityService;
    this._canonicalUriService = _canonicalUriService;
    this._editorService = _editorService;
    this._workspaceEditingService = _workspaceEditingService;
    this._notificationService = _notificationService;
    this._requestService = _requestService;
    this._instantiationService = _instantiationService;
    this._labelService = _labelService;
    this._environmentService = _environmentService;
    this._workspaceTrustManagementService = _workspaceTrustManagementService;
    this._workspaceTrustRequestService = _workspaceTrustRequestService;
    this._textFileService = _textFileService;
    this._activeCancelTokens = /* @__PURE__ */ Object.create(null);
    // --- edit sessions ---
    this.registeredEditSessionProviders = this._register(new DisposableMap());
    // --- canonical uri identities ---
    this.registeredCanonicalUriProviders = this._register(new DisposableMap());
    this._queryBuilder = this._instantiationService.createInstance(QueryBuilder);
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostWorkspace);
    const workspace = this._contextService.getWorkspace();
    if (workspace.configuration && !isNative && !fileService.hasProvider(workspace.configuration)) {
      this._proxy.$initializeWorkspace(this.getWorkspaceData(workspace), this.isWorkspaceTrusted());
    } else {
      this._contextService.getCompleteWorkspace().then((workspace2) => this._proxy.$initializeWorkspace(this.getWorkspaceData(workspace2), this.isWorkspaceTrusted()));
    }
    this._register(this._contextService.onDidChangeWorkspaceFolders(this._onDidChangeWorkspace, this));
    this._register(this._contextService.onDidChangeWorkbenchState(this._onDidChangeWorkspace, this));
    this._register(this._workspaceTrustManagementService.onDidChangeTrust(this._onDidGrantWorkspaceTrust, this));
    this._register(this._workspaceTrustManagementService.onDidChangeTrustedFolders(this._onDidChangeWorkspaceTrustedFolders, this));
  }
  dispose() {
    super.dispose();
    for (const requestId in this._activeCancelTokens) {
      const tokenSource = this._activeCancelTokens[requestId];
      tokenSource.cancel();
    }
  }
  // --- workspace ---
  $updateWorkspaceFolders(extensionName, index2, deleteCount, foldersToAdd) {
    const workspaceFoldersToAdd = foldersToAdd.map((f) => ({ uri: URI.revive(f.uri), name: f.name }));
    this._notificationService.status(this.getStatusMessage(extensionName, workspaceFoldersToAdd.length, deleteCount), {
      hideAfter: 10 * 1e3
      /* 10s */
    });
    return this._workspaceEditingService.updateFolders(index2, deleteCount, workspaceFoldersToAdd, true);
  }
  getStatusMessage(extensionName, addCount, removeCount) {
    let message;
    const wantsToAdd = addCount > 0;
    const wantsToDelete = removeCount > 0;
    if (wantsToAdd && !wantsToDelete) {
      if (addCount === 1) {
        message = localize(5743, null, extensionName);
      } else {
        message = localize(5742, null, extensionName, addCount);
      }
    } else if (wantsToDelete && !wantsToAdd) {
      if (removeCount === 1) {
        message = localize(5745, null, extensionName);
      } else {
        message = localize(5744, null, extensionName, removeCount);
      }
    } else {
      message = localize(5741, null, extensionName);
    }
    return message;
  }
  _onDidChangeWorkspace() {
    this._proxy.$acceptWorkspaceData(this.getWorkspaceData(this._contextService.getWorkspace()));
  }
  getWorkspaceData(workspace) {
    if (!this._contextService.hasWorkspaceData()) {
      return null;
    }
    return {
      configuration: workspace.configuration || void 0,
      isUntitled: workspace.configuration ? isUntitledWorkspace(workspace.configuration, this._environmentService) : false,
      folders: workspace.folders,
      id: workspace.id,
      name: this._labelService.getWorkspaceLabel(workspace),
      transient: workspace.transient
    };
  }
  // --- search ---
  $startFileSearch(_includeFolder, options3, token) {
    const includeFolder = URI.revive(_includeFolder);
    const workspace = this._contextService.getWorkspace();
    const query = this._queryBuilder.file(
      includeFolder ? [includeFolder] : workspace.folders,
      revive(options3)
    );
    return this._searchService.fileSearch(query, token).then((result) => {
      return result.results.map((m) => m.resource);
    }, (err) => {
      if (!isCancellationError(err)) {
        return Promise.reject(err);
      }
      return null;
    });
  }
  $startTextSearch(pattern, _folder, options3, requestId, token) {
    const folder = URI.revive(_folder);
    const workspace = this._contextService.getWorkspace();
    const folders = folder ? [folder] : workspace.folders.map((folder2) => folder2.uri);
    const query = this._queryBuilder.text(pattern, folders, revive(options3));
    query._reason = "startTextSearch";
    const onProgress = (p) => {
      if (p.results) {
        this._proxy.$handleTextSearchResult(p, requestId);
      }
    };
    const search2 = this._searchService.textSearch(query, token, onProgress).then(
      (result) => {
        return { limitHit: result.limitHit };
      },
      (err) => {
        if (!isCancellationError(err)) {
          return Promise.reject(err);
        }
        return null;
      }
    );
    return search2;
  }
  $checkExists(folders, includes2, token) {
    return this._instantiationService.invokeFunction((accessor) => checkGlobFileExists(accessor, folders, includes2, token));
  }
  // --- save & edit resources ---
  async $save(uriComponents, options3) {
    const uri4 = URI.revive(uriComponents);
    const editors = [...this._editorService.findEditors(uri4, { supportSideBySide: 1 /* PRIMARY */ })];
    const result = await this._editorService.save(editors, {
      reason: 1 /* EXPLICIT */,
      saveAs: options3.saveAs,
      force: !options3.saveAs
    });
    return this._saveResultToUris(result).at(0);
  }
  _saveResultToUris(result) {
    if (!result.success) {
      return [];
    }
    return coalesce(result.editors.map((editor) => EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: 1 /* PRIMARY */ })));
  }
  $saveAll(includeUntitled) {
    return this._editorService.saveAll({ includeUntitled }).then((res) => res.success);
  }
  $resolveProxy(url) {
    return this._requestService.resolveProxy(url);
  }
  $lookupAuthorization(authInfo) {
    return this._requestService.lookupAuthorization(authInfo);
  }
  $lookupKerberosAuthorization(url) {
    return this._requestService.lookupKerberosAuthorization(url);
  }
  $loadCertificates() {
    return this._requestService.loadCertificates();
  }
  // --- trust ---
  $requestResourceTrust(optionsDto) {
    const options3 = { ...optionsDto, uri: URI.revive(optionsDto.uri) };
    return this._workspaceTrustRequestService.requestResourcesTrust(options3);
  }
  $requestWorkspaceTrust(options3) {
    return this._workspaceTrustRequestService.requestWorkspaceTrust(options3);
  }
  async $isResourceTrusted(resource) {
    const uri4 = URI.revive(resource);
    const trustInfo = await this._workspaceTrustManagementService.getUriTrustInfo(uri4);
    return trustInfo.trusted;
  }
  isWorkspaceTrusted() {
    return this._workspaceTrustManagementService.isWorkspaceTrusted();
  }
  _onDidGrantWorkspaceTrust() {
    this._proxy.$onDidGrantWorkspaceTrust();
  }
  _onDidChangeWorkspaceTrustedFolders() {
    this._proxy.$onDidChangeWorkspaceTrustedFolders();
  }
  $registerEditSessionIdentityProvider(handle2, scheme) {
    const disposable = this._editSessionIdentityService.registerEditSessionIdentityProvider({
      scheme,
      getEditSessionIdentifier: async (workspaceFolder, token) => {
        return this._proxy.$getEditSessionIdentifier(workspaceFolder.uri, token);
      },
      provideEditSessionIdentityMatch: async (workspaceFolder, identity1, identity2, token) => {
        return this._proxy.$provideEditSessionIdentityMatch(workspaceFolder.uri, identity1, identity2, token);
      }
    });
    this.registeredEditSessionProviders.set(handle2, disposable);
  }
  $unregisterEditSessionIdentityProvider(handle2) {
    this.registeredEditSessionProviders.deleteAndDispose(handle2);
  }
  $registerCanonicalUriProvider(handle2, scheme) {
    const disposable = this._canonicalUriService.registerCanonicalUriProvider({
      scheme,
      provideCanonicalUri: async (uri4, targetScheme, token) => {
        const result = await this._proxy.$provideCanonicalUri(uri4, targetScheme, token);
        if (result) {
          return URI.revive(result);
        }
        return result;
      }
    });
    this.registeredCanonicalUriProviders.set(handle2, disposable);
  }
  $unregisterCanonicalUriProvider(handle2) {
    this.registeredCanonicalUriProviders.deleteAndDispose(handle2);
  }
  // --- encodings
  $resolveDecoding(resource, options3) {
    return this._textFileService.resolveDecoding(URI.revive(resource), options3);
  }
  $validateDetectedEncoding(resource, detectedEncoding, options3) {
    return this._textFileService.validateDetectedEncoding(URI.revive(resource), detectedEncoding, options3);
  }
  $resolveEncoding(resource, options3) {
    return this._textFileService.resolveEncoding(URI.revive(resource), options3);
  }
};

MainThreadWorkspace = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadWorkspace),
  __decorateParam(1, ISearchService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IEditSessionIdentityService),
  __decorateParam(4, ICanonicalUriService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IWorkspaceEditingService),
  __decorateParam(7, INotificationService),
  __decorateParam(8, IRequestService),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, ILabelService),
  __decorateParam(11, IEnvironmentService),
  __decorateParam(12, IFileService),
  __decorateParam(13, IWorkspaceTrustManagementService),
  __decorateParam(14, IWorkspaceTrustRequestService),
  __decorateParam(15, ITextFileService)
], MainThreadWorkspace);
export { MainThreadWorkspace };
