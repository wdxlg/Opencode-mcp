// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostWorkspace.ts
import { ExtUri, basename2, basenameOrAuthority, dirname2, relativePath } from "./module-0032.mjs";
import { compare } from "./module-0029.mjs";
import { delta, mapArrayOrNot } from "./module-0004.mjs";
import { Workspace, WorkspaceFolder } from "./module-0060.mjs";
import { TernarySearchTree } from "./module-0054.mjs";
import { URI, isUriComponents } from "./module-0023.mjs";
import { AsyncEmitter, Emitter } from "./module-0019.mjs";
import { Counter } from "./module-0056.mjs";
import { AsyncIterableProducer, Barrier } from "./module-0034.mjs";
import { MainContext } from "./module-0025.mjs";
import { Schemas } from "./module-0031.mjs";
import { Severity2 } from "./module-0059.mjs";
import { localize } from "./module-0015.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0026.mjs";
import { StopWatch } from "./module-0018.mjs";
import { GlobPattern } from "./module-0239.mjs";
import { DisposableStore, toDisposable } from "./module-0011.mjs";
import { resultIsMatch } from "./module-0241.mjs";
import { TextSearchContext2, TextSearchMatch2 } from "./module-0240.mjs";
import { Range2 } from "./module-0227.mjs";
import { revive } from "./module-0074.mjs";
import { UTF8, toDecodeStream, toEncodeReadable } from "./module-0243.mjs";
import { VSBuffer, bufferToStream, readableToBuffer } from "./module-0013.mjs";
import { consumeStream } from "./module-0012.mjs";
import { stringToSnapshot } from "./module-0244.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0052.mjs";
import { IExtHostInitDataService } from "./module-0049.mjs";
import { IExtHostFileSystemInfo } from "./module-0061.mjs";
import { ILogService } from "./module-0045.mjs";
import { IURITransformerService } from "./module-0053.mjs";
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/api/common/extHostWorkspace.ts
function isFolderEqual(folderA, folderB, extHostFileSystemInfo) {
  return new ExtUri((uri2) => ignorePathCasing(uri2, extHostFileSystemInfo)).isEqual(folderA, folderB);
}

function compareWorkspaceFolderByUri(a, b, extHostFileSystemInfo) {
  return isFolderEqual(a.uri, b.uri, extHostFileSystemInfo) ? 0 : compare(a.uri.toString(), b.uri.toString());
}

function compareWorkspaceFolderByUriAndNameAndIndex(a, b, extHostFileSystemInfo) {
  if (a.index !== b.index) {
    return a.index < b.index ? -1 : 1;
  }
  return isFolderEqual(a.uri, b.uri, extHostFileSystemInfo) ? compare(a.name, b.name) : compare(a.uri.toString(), b.uri.toString());
}

function delta2(oldFolders, newFolders, compare4, extHostFileSystemInfo) {
  const oldSortedFolders = oldFolders.slice(0).sort((a, b) => compare4(a, b, extHostFileSystemInfo));
  const newSortedFolders = newFolders.slice(0).sort((a, b) => compare4(a, b, extHostFileSystemInfo));
  return delta(oldSortedFolders, newSortedFolders, (a, b) => compare4(a, b, extHostFileSystemInfo));
}

function ignorePathCasing(uri2, extHostFileSystemInfo) {
  const capabilities = extHostFileSystemInfo.getCapabilities(uri2.scheme);
  return !(capabilities && capabilities & 1024 /* PathCaseSensitive */);
}

var ExtHostWorkspaceImpl = class _ExtHostWorkspaceImpl extends Workspace {
  constructor(id2, _name, folders, transient, configuration, _isUntitled, ignorePathCasing2) {
    super(id2, folders.map((f) => new WorkspaceFolder(f)), transient, configuration, ignorePathCasing2);
    this._name = _name;
    this._isUntitled = _isUntitled;
    this._workspaceFolders = [];
    this._structure = TernarySearchTree.forUris(ignorePathCasing2, () => true);
    folders.forEach((folder) => {
      this._workspaceFolders.push(folder);
      this._structure.set(folder.uri, folder);
    });
  }
  static toExtHostWorkspace(data2, previousConfirmedWorkspace, previousUnconfirmedWorkspace, extHostFileSystemInfo) {
    if (!data2) {
      return { workspace: null, added: [], removed: [] };
    }
    const { id: id2, name: name2, folders, configuration, transient, isUntitled } = data2;
    const newWorkspaceFolders = [];
    const oldWorkspace = previousConfirmedWorkspace;
    if (previousConfirmedWorkspace) {
      folders.forEach((folderData, index) => {
        const folderUri = URI.revive(folderData.uri);
        const existingFolder = _ExtHostWorkspaceImpl._findFolder(previousUnconfirmedWorkspace || previousConfirmedWorkspace, folderUri, extHostFileSystemInfo);
        if (existingFolder) {
          existingFolder.name = folderData.name;
          existingFolder.index = folderData.index;
          newWorkspaceFolders.push(existingFolder);
        } else {
          newWorkspaceFolders.push({ uri: folderUri, name: folderData.name, index });
        }
      });
    } else {
      newWorkspaceFolders.push(...folders.map(({ uri: uri2, name: name3, index }) => ({ uri: URI.revive(uri2), name: name3, index })));
    }
    newWorkspaceFolders.sort((f1, f2) => f1.index < f2.index ? -1 : 1);
    const workspace = new _ExtHostWorkspaceImpl(id2, name2, newWorkspaceFolders, !!transient, configuration ? URI.revive(configuration) : null, !!isUntitled, (uri2) => ignorePathCasing(uri2, extHostFileSystemInfo));
    const { added, removed } = delta2(oldWorkspace ? oldWorkspace.workspaceFolders : [], workspace.workspaceFolders, compareWorkspaceFolderByUri, extHostFileSystemInfo);
    return { workspace, added, removed };
  }
  static _findFolder(workspace, folderUriToFind, extHostFileSystemInfo) {
    for (let i = 0; i < workspace.folders.length; i++) {
      const folder = workspace.workspaceFolders[i];
      if (isFolderEqual(folder.uri, folderUriToFind, extHostFileSystemInfo)) {
        return folder;
      }
    }
    return void 0;
  }
  get name() {
    return this._name;
  }
  get isUntitled() {
    return this._isUntitled;
  }
  get workspaceFolders() {
    return this._workspaceFolders.slice(0);
  }
  getWorkspaceFolder(uri2, resolveParent) {
    if (resolveParent && this._structure.get(uri2)) {
      uri2 = dirname2(uri2);
    }
    return this._structure.findSubstr(uri2);
  }
  resolveWorkspaceFolder(uri2) {
    return this._structure.get(uri2);
  }
};

var ExtHostWorkspace = class {
  constructor(extHostRpc, initData, extHostFileSystemInfo, logService, uriTransformerService) {
    this._onDidChangeWorkspace = new Emitter();
    this.onDidChangeWorkspace = this._onDidChangeWorkspace.event;
    this._onDidGrantWorkspaceTrust = new Emitter();
    this.onDidGrantWorkspaceTrust = this._onDidGrantWorkspaceTrust.event;
    this._onDidChangeWorkspaceTrustedFolders = new Emitter();
    this.onDidChangeWorkspaceTrustedFolders = this._onDidChangeWorkspaceTrustedFolders.event;
    this._activeSearchCallbacks = [];
    this._trusted = false;
    this._editSessionIdentityProviders = /* @__PURE__ */ new Map();
    // --- edit sessions ---
    this._providerHandlePool = 0;
    this._onWillCreateEditSessionIdentityEvent = new AsyncEmitter();
    // --- canonical uri identity ---
    this._canonicalUriProviders = /* @__PURE__ */ new Map();
    this._logService = logService;
    this._extHostFileSystemInfo = extHostFileSystemInfo;
    this._uriTransformerService = uriTransformerService;
    this._requestIdProvider = new Counter();
    this._barrier = new Barrier();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadWorkspace);
    this._messageService = extHostRpc.getProxy(MainContext.MainThreadMessageService);
    this._telemetryProxy = extHostRpc.getProxy(MainContext.MainThreadTelemetry);
    const data2 = initData.workspace;
    this._confirmedWorkspace = data2 ? new ExtHostWorkspaceImpl(data2.id, data2.name, [], !!data2.transient, data2.configuration ? URI.revive(data2.configuration) : null, !!data2.isUntitled, (uri2) => ignorePathCasing(uri2, extHostFileSystemInfo)) : void 0;
  }
  /**
   * Receives the configuration provider from ExtHostConfiguration after init. We cannot inject
   * IExtHostConfiguration directly because it creates a DI cycle (ExtHostConfiguration already
   * depends on IExtHostWorkspace). Once set, settings reads in findFiles become synchronous.
   */
  $setConfigProvider(provider) {
    this._configProvider = provider;
  }
  _useIgnoreFilesInFindFiles() {
    return this._configProvider?.getConfiguration("search").get("experimental.useIgnoreFilesInFindFiles") ?? false;
  }
  _userIgnoreFilesSetting() {
    return this._configProvider?.getConfiguration("search").get("useIgnoreFiles") ?? true;
  }
  $initializeWorkspace(data2, trusted) {
    this._trusted = trusted;
    this.$acceptWorkspaceData(data2);
    this._barrier.open();
  }
  waitForInitializeCall() {
    return this._barrier.wait();
  }
  // --- workspace ---
  get workspace() {
    return this._actualWorkspace;
  }
  get name() {
    return this._actualWorkspace ? this._actualWorkspace.name : void 0;
  }
  get workspaceFile() {
    if (this._actualWorkspace) {
      if (this._actualWorkspace.configuration) {
        if (this._actualWorkspace.isUntitled) {
          return URI.from({ scheme: Schemas.untitled, path: basename2(dirname2(this._actualWorkspace.configuration)) });
        }
        return this._actualWorkspace.configuration;
      }
    }
    return void 0;
  }
  get _actualWorkspace() {
    return this._unconfirmedWorkspace || this._confirmedWorkspace;
  }
  getWorkspaceFolders() {
    if (!this._actualWorkspace) {
      return void 0;
    }
    return this._actualWorkspace.workspaceFolders.slice(0);
  }
  async getWorkspaceFolders2() {
    await this._barrier.wait();
    if (!this._actualWorkspace) {
      return void 0;
    }
    return this._actualWorkspace.workspaceFolders.slice(0);
  }
  updateWorkspaceFolders(extension, index, deleteCount, ...workspaceFoldersToAdd) {
    const validatedDistinctWorkspaceFoldersToAdd = [];
    if (Array.isArray(workspaceFoldersToAdd)) {
      workspaceFoldersToAdd.forEach((folderToAdd) => {
        if (URI.isUri(folderToAdd.uri) && !validatedDistinctWorkspaceFoldersToAdd.some((f) => isFolderEqual(f.uri, folderToAdd.uri, this._extHostFileSystemInfo))) {
          validatedDistinctWorkspaceFoldersToAdd.push({ uri: folderToAdd.uri, name: folderToAdd.name || basenameOrAuthority(folderToAdd.uri) });
        }
      });
    }
    if (!!this._unconfirmedWorkspace) {
      return false;
    }
    if ([index, deleteCount].some((i) => typeof i !== "number" || i < 0)) {
      return false;
    }
    if (deleteCount === 0 && validatedDistinctWorkspaceFoldersToAdd.length === 0) {
      return false;
    }
    const currentWorkspaceFolders = this._actualWorkspace ? this._actualWorkspace.workspaceFolders : [];
    if (index + deleteCount > currentWorkspaceFolders.length) {
      return false;
    }
    const newWorkspaceFolders = currentWorkspaceFolders.slice(0);
    newWorkspaceFolders.splice(index, deleteCount, ...validatedDistinctWorkspaceFoldersToAdd.map((f) => ({
      uri: f.uri,
      name: f.name || basenameOrAuthority(f.uri),
      index: void 0
      /* fixed later */
    })));
    for (let i = 0; i < newWorkspaceFolders.length; i++) {
      const folder = newWorkspaceFolders[i];
      if (newWorkspaceFolders.some((otherFolder, index2) => index2 !== i && isFolderEqual(folder.uri, otherFolder.uri, this._extHostFileSystemInfo))) {
        return false;
      }
    }
    newWorkspaceFolders.forEach((f, index2) => f.index = index2);
    const { added, removed } = delta2(currentWorkspaceFolders, newWorkspaceFolders, compareWorkspaceFolderByUriAndNameAndIndex, this._extHostFileSystemInfo);
    if (added.length === 0 && removed.length === 0) {
      return false;
    }
    if (this._proxy) {
      const extName = extension.displayName || extension.name;
      this._proxy.$updateWorkspaceFolders(extName, index, deleteCount, validatedDistinctWorkspaceFoldersToAdd).then(void 0, (error) => {
        this._unconfirmedWorkspace = void 0;
        const options2 = { source: { identifier: extension.identifier, label: extension.displayName || extension.name } };
        this._messageService.$showMessage(Severity2.Error, localize(5894, null, extName, error.toString()), options2, []);
      });
    }
    this.trySetWorkspaceFolders(newWorkspaceFolders);
    return true;
  }
  getWorkspaceFolder(uri2, resolveParent) {
    if (!this._actualWorkspace) {
      return void 0;
    }
    return this._actualWorkspace.getWorkspaceFolder(uri2, resolveParent);
  }
  async getWorkspaceFolder2(uri2, resolveParent) {
    await this._barrier.wait();
    if (!this._actualWorkspace) {
      return void 0;
    }
    return this._actualWorkspace.getWorkspaceFolder(uri2, resolveParent);
  }
  async resolveWorkspaceFolder(uri2) {
    await this._barrier.wait();
    if (!this._actualWorkspace) {
      return void 0;
    }
    return this._actualWorkspace.resolveWorkspaceFolder(uri2);
  }
  getPath() {
    if (!this._actualWorkspace) {
      return void 0;
    }
    const { folders } = this._actualWorkspace;
    if (folders.length === 0) {
      return void 0;
    }
    return folders[0].uri.fsPath;
  }
  getRelativePath(pathOrUri, includeWorkspace) {
    let resource;
    let path = "";
    if (typeof pathOrUri === "string") {
      resource = URI.file(pathOrUri);
      path = pathOrUri;
    } else if (typeof pathOrUri !== "undefined") {
      resource = pathOrUri;
      path = pathOrUri.fsPath;
    }
    if (!resource) {
      return path;
    }
    const folder = this.getWorkspaceFolder(
      resource,
      true
    );
    if (!folder) {
      return path;
    }
    if (typeof includeWorkspace === "undefined" && this._actualWorkspace) {
      includeWorkspace = this._actualWorkspace.folders.length > 1;
    }
    let result = relativePath(folder.uri, resource);
    if (includeWorkspace && folder.name) {
      result = `${folder.name}/${result}`;
    }
    return result;
  }
  trySetWorkspaceFolders(folders) {
    if (this._actualWorkspace) {
      this._unconfirmedWorkspace = ExtHostWorkspaceImpl.toExtHostWorkspace({
        id: this._actualWorkspace.id,
        name: this._actualWorkspace.name,
        configuration: this._actualWorkspace.configuration,
        folders,
        isUntitled: this._actualWorkspace.isUntitled
      }, this._actualWorkspace, void 0, this._extHostFileSystemInfo).workspace || void 0;
    }
  }
  $acceptWorkspaceData(data2) {
    const { workspace, added, removed } = ExtHostWorkspaceImpl.toExtHostWorkspace(data2, this._confirmedWorkspace, this._unconfirmedWorkspace, this._extHostFileSystemInfo);
    this._confirmedWorkspace = workspace || void 0;
    this._unconfirmedWorkspace = void 0;
    this._onDidChangeWorkspace.fire(Object.freeze({
      added,
      removed
    }));
  }
  // --- search ---
  /**
   * Note, null/undefined have different and important meanings for "exclude"
   */
  findFiles(include, exclude, maxResults, extensionId, token = CancellationToken.None) {
    this._logService.trace(`extHostWorkspace#findFiles: fileSearch, extension: ${extensionId.value}, entryPoint: findFiles`);
    let excludeString = "";
    let useFileExcludes = true;
    if (exclude === null) {
      useFileExcludes = false;
    } else if (exclude !== void 0) {
      if (typeof exclude === "string") {
        excludeString = exclude;
      } else {
        excludeString = exclude.pattern;
      }
    }
    const useIgnoreFilesOptIn = this._useIgnoreFilesInFindFiles();
    const localIgnoreFiles = useIgnoreFilesOptIn && exclude !== null ? void 0 : false;
    return this._findFilesImpl({ type: "include", value: include }, {
      exclude: [excludeString],
      maxResults,
      useExcludeSettings: useFileExcludes ? 2 /* FilesExclude */ : 1 /* None */,
      useIgnoreFiles: {
        local: localIgnoreFiles
      }
    }, extensionId, "findFiles", { useIgnoreFilesLocal: void 0, excludeWasNull: exclude === null }, token);
  }
  findFiles2(filePatterns, options2 = {}, extensionId, token = CancellationToken.None) {
    this._logService.trace(`extHostWorkspace#findFiles2New: fileSearch, extension: ${extensionId.value}, entryPoint: findFiles2New`);
    return this._findFilesImpl({ type: "filePatterns", value: filePatterns }, options2, extensionId, "findFiles2", { useIgnoreFilesLocal: options2.useIgnoreFiles?.local, excludeWasNull: false }, token);
  }
  async _findFilesImpl(query, options2, extensionId, apiKind, intent, token) {
    const useIgnoreFilesLocalRequested = intent.useIgnoreFilesLocal === true ? "true" : intent.useIgnoreFilesLocal === false ? "false" : "unspecified";
    const sw = new StopWatch(true);
    let queryCount = 0;
    let respectedIgnoreFiles = this._userIgnoreFilesSetting();
    let resultCount = 0;
    let cancelled = false;
    let errored = false;
    try {
      if (token.isCancellationRequested) {
        cancelled = true;
        return [];
      }
      const filePatternsToUse = query.type === "include" ? [query.value] : query.value ?? [];
      if (!Array.isArray(filePatternsToUse)) {
        console.error("Invalid file pattern provided", filePatternsToUse);
        throw new Error(`Invalid file pattern provided ${JSON.stringify(filePatternsToUse)}`);
      }
      const queryOptions = filePatternsToUse.map((filePattern) => {
        const excludePatterns = globsToISearchPatternBuilder(options2.exclude);
        const fileQueries = {
          ignoreSymlinks: typeof options2.followSymlinks === "boolean" ? !options2.followSymlinks : void 0,
          disregardIgnoreFiles: typeof options2.useIgnoreFiles?.local === "boolean" ? !options2.useIgnoreFiles.local : void 0,
          disregardGlobalIgnoreFiles: typeof options2.useIgnoreFiles?.global === "boolean" ? !options2.useIgnoreFiles.global : void 0,
          disregardParentIgnoreFiles: typeof options2.useIgnoreFiles?.parent === "boolean" ? !options2.useIgnoreFiles.parent : void 0,
          disregardExcludeSettings: options2.useExcludeSettings !== void 0 && options2.useExcludeSettings === 1 /* None */,
          disregardSearchExcludeSettings: options2.useExcludeSettings !== void 0 && options2.useExcludeSettings !== 3 /* SearchAndFilesExclude */,
          maxResults: options2.maxResults,
          excludePattern: excludePatterns.length > 0 ? excludePatterns : void 0,
          ignoreGlobCase: options2.caseInsensitive,
          _reason: "startFileSearch",
          shouldGlobSearch: query.type === "include" ? void 0 : true
        };
        const parseInclude = parseSearchExcludeInclude(GlobPattern.from(filePattern));
        const folderToUse = parseInclude?.folder;
        if (query.type === "include") {
          fileQueries.includePattern = parseInclude?.pattern;
        } else {
          fileQueries.filePattern = parseInclude?.pattern;
        }
        return {
          folder: folderToUse,
          options: fileQueries
        };
      });
      queryCount = queryOptions.length;
      const userHonorsIgnore = this._userIgnoreFilesSetting();
      respectedIgnoreFiles = queryOptions.every((q) => q.options.disregardIgnoreFiles === true ? false : q.options.disregardIgnoreFiles === false ? true : userHonorsIgnore);
      const result = await this._findFilesBase(queryOptions, token);
      resultCount = result.length;
      cancelled = token.isCancellationRequested;
      return result;
    } catch (err) {
      errored = true;
      cancelled = token.isCancellationRequested;
      throw err;
    } finally {
      this._reportFindFilesTelemetry({
        extensionId: extensionId.value,
        apiKind,
        respectedIgnoreFiles,
        useIgnoreFilesLocalRequested,
        excludeWasNull: intent.excludeWasNull,
        resultCount,
        durationMs: sw.elapsed(),
        queryCount,
        cancelled,
        errored
      });
    }
  }
  async _findFilesBase(queryOptions, token) {
    let tokenToUse = token;
    let linkedSource;
    if (!CancellationToken.isCancellationToken(token)) {
      linkedSource = new CancellationTokenSource();
      const foreignToken = token;
      if (typeof foreignToken.onCancellationRequested === "function") {
        foreignToken.onCancellationRequested(() => linkedSource.cancel());
      }
      tokenToUse = linkedSource.token;
    }
    const result = await Promise.all(queryOptions?.map(
      (option) => this._proxy.$startFileSearch(
        option.folder ?? null,
        option.options,
        tokenToUse
      ).then((data2) => Array.isArray(data2) ? data2.map((d) => URI.revive(d)) : [])
    ) ?? []);
    const flatResult = result.flat();
    linkedSource?.dispose();
    const extUri2 = new ExtUri((uri2) => ignorePathCasing(uri2, this._extHostFileSystemInfo));
    const uriMap = /* @__PURE__ */ new Map();
    for (const uri2 of flatResult) {
      const key = extUri2.getComparisonKey(uri2);
      if (!uriMap.has(key)) {
        uriMap.set(key, uri2);
      }
    }
    return Array.from(uriMap.values());
  }
  _reportFindFilesTelemetry(event) {
    this._telemetryProxy.$publicLog2("extHostFindFiles", event);
  }
  findTextInFiles2(query, options2, extensionId, token = CancellationToken.None) {
    this._logService.trace(`extHostWorkspace#findTextInFiles2: textSearch, extension: ${extensionId.value}, entryPoint: findTextInFiles2`);
    const getOptions = (include) => {
      if (!options2) {
        return {
          folder: void 0,
          options: {}
        };
      }
      const parsedInclude = include ? parseSearchExcludeInclude(GlobPattern.from(include)) : void 0;
      const excludePatterns = options2.exclude ? globsToISearchPatternBuilder(options2.exclude) : void 0;
      return {
        options: {
          ignoreSymlinks: typeof options2.followSymlinks === "boolean" ? !options2.followSymlinks : void 0,
          disregardIgnoreFiles: typeof options2.useIgnoreFiles?.local === "boolean" ? !options2.useIgnoreFiles?.local : void 0,
          disregardGlobalIgnoreFiles: typeof options2.useIgnoreFiles?.global === "boolean" ? !options2.useIgnoreFiles?.global : void 0,
          disregardParentIgnoreFiles: typeof options2.useIgnoreFiles?.parent === "boolean" ? !options2.useIgnoreFiles?.parent : void 0,
          disregardExcludeSettings: options2.useExcludeSettings !== void 0 && options2.useExcludeSettings === 1 /* None */,
          disregardSearchExcludeSettings: options2.useExcludeSettings !== void 0 && options2.useExcludeSettings !== 3 /* SearchAndFilesExclude */,
          fileEncoding: options2.encoding,
          maxResults: options2.maxResults,
          ignoreGlobCase: options2.caseInsensitive,
          previewOptions: options2.previewOptions ? {
            matchLines: options2.previewOptions?.numMatchLines ?? 100,
            charsPerLine: options2.previewOptions?.charsPerLine ?? 1e4
          } : void 0,
          surroundingContext: options2.surroundingContext,
          includePattern: parsedInclude?.pattern,
          excludePattern: excludePatterns
        },
        folder: parsedInclude?.folder
      };
    };
    const queryOptionsRaw = options2?.include?.map((include) => getOptions(include)) ?? [getOptions(void 0)];
    const queryOptions = queryOptionsRaw.filter((queryOps) => !!queryOps);
    const disposables = new DisposableStore();
    const progressEmitter = disposables.add(new Emitter());
    const complete = this.findTextInFilesBase(
      query,
      queryOptions,
      (result, uri2) => progressEmitter.fire({ result, uri: uri2 }),
      token
    );
    const asyncIterable = new AsyncIterableProducer(async (emitter) => {
      disposables.add(progressEmitter.event((e) => {
        const result = e.result;
        const uri2 = e.uri;
        if (resultIsMatch(result)) {
          emitter.emitOne(new TextSearchMatch2(
            uri2,
            result.rangeLocations.map((range) => ({
              previewRange: new Range2(range.preview.startLineNumber, range.preview.startColumn, range.preview.endLineNumber, range.preview.endColumn),
              sourceRange: new Range2(range.source.startLineNumber, range.source.startColumn, range.source.endLineNumber, range.source.endColumn)
            })),
            result.previewText
          ));
        } else {
          emitter.emitOne(new TextSearchContext2(
            uri2,
            result.text,
            result.lineNumber
          ));
        }
      }));
      await complete;
    });
    return {
      results: asyncIterable,
      complete: complete.then((e) => {
        disposables.dispose();
        return {
          limitHit: e?.limitHit ?? false
        };
      })
    };
  }
  async findTextInFilesBase(query, queryOptions, callback, token = CancellationToken.None) {
    const requestId = this._requestIdProvider.getNext();
    let isCanceled = false;
    token.onCancellationRequested((_) => {
      isCanceled = true;
    });
    this._activeSearchCallbacks[requestId] = (p) => {
      if (isCanceled) {
        return;
      }
      const uri2 = URI.revive(p.resource);
      p.results.forEach((rawResult) => {
        const result = revive(rawResult);
        callback(result, uri2);
      });
    };
    if (token.isCancellationRequested) {
      return {};
    }
    try {
      const result = await Promise.all(queryOptions?.map(
        (option) => this._proxy.$startTextSearch(
          query,
          option.folder ?? null,
          option.options,
          requestId,
          token
        ) || {}
      ) ?? []);
      delete this._activeSearchCallbacks[requestId];
      return result.reduce((acc, val) => {
        return {
          limitHit: acc?.limitHit || (val?.limitHit ?? false),
          message: [acc?.message ?? [], val?.message ?? []].flat()
        };
      }, {}) ?? { limitHit: false };
    } catch (err) {
      delete this._activeSearchCallbacks[requestId];
      throw err;
    }
  }
  async findTextInFiles(query, options2, callback, extensionId, token = CancellationToken.None) {
    this._logService.trace(`extHostWorkspace#findTextInFiles: textSearch, extension: ${extensionId.value}, entryPoint: findTextInFiles`);
    const previewOptions = typeof options2.previewOptions === "undefined" ? {
      matchLines: 100,
      charsPerLine: 1e4
    } : options2.previewOptions;
    const parsedInclude = parseSearchExcludeInclude(GlobPattern.from(options2.include));
    const excludePattern = typeof options2.exclude === "string" ? options2.exclude : options2.exclude ? options2.exclude.pattern : void 0;
    const queryOptions = {
      ignoreSymlinks: typeof options2.followSymlinks === "boolean" ? !options2.followSymlinks : void 0,
      disregardIgnoreFiles: typeof options2.useIgnoreFiles === "boolean" ? !options2.useIgnoreFiles : void 0,
      disregardGlobalIgnoreFiles: typeof options2.useGlobalIgnoreFiles === "boolean" ? !options2.useGlobalIgnoreFiles : void 0,
      disregardParentIgnoreFiles: typeof options2.useParentIgnoreFiles === "boolean" ? !options2.useParentIgnoreFiles : void 0,
      disregardExcludeSettings: typeof options2.useDefaultExcludes === "boolean" ? !options2.useDefaultExcludes : true,
      disregardSearchExcludeSettings: typeof options2.useSearchExclude === "boolean" ? !options2.useSearchExclude : true,
      fileEncoding: options2.encoding,
      maxResults: options2.maxResults,
      previewOptions,
      surroundingContext: options2.afterContext,
      // TODO: remove ability to have before/after context separately
      includePattern: parsedInclude?.pattern,
      excludePattern: excludePattern ? [{ pattern: excludePattern }] : void 0
    };
    const progress = (result, uri2) => {
      if (resultIsMatch(result)) {
        callback({
          uri: uri2,
          preview: {
            text: result.previewText,
            matches: mapArrayOrNot(
              result.rangeLocations,
              (m) => new Range2(m.preview.startLineNumber, m.preview.startColumn, m.preview.endLineNumber, m.preview.endColumn)
            )
          },
          ranges: mapArrayOrNot(
            result.rangeLocations,
            (r2) => new Range2(r2.source.startLineNumber, r2.source.startColumn, r2.source.endLineNumber, r2.source.endColumn)
          )
        });
      } else {
        callback({
          uri: uri2,
          text: result.text,
          lineNumber: result.lineNumber
        });
      }
    };
    return this.findTextInFilesBase(query, [{ options: queryOptions, folder: parsedInclude?.folder }], progress, token);
  }
  $handleTextSearchResult(result, requestId) {
    this._activeSearchCallbacks[requestId]?.(result);
  }
  async save(uri2) {
    const result = await this._proxy.$save(uri2, { saveAs: false });
    return URI.revive(result);
  }
  async saveAs(uri2) {
    const result = await this._proxy.$save(uri2, { saveAs: true });
    return URI.revive(result);
  }
  saveAll(includeUntitled) {
    return this._proxy.$saveAll(includeUntitled);
  }
  resolveProxy(url) {
    return this._proxy.$resolveProxy(url);
  }
  lookupAuthorization(authInfo) {
    return this._proxy.$lookupAuthorization(authInfo);
  }
  lookupKerberosAuthorization(url) {
    return this._proxy.$lookupKerberosAuthorization(url);
  }
  loadCertificates() {
    return this._proxy.$loadCertificates();
  }
  // --- trust ---
  get trusted() {
    return this._trusted;
  }
  requestResourceTrust(options2) {
    return this._proxy.$requestResourceTrust(options2);
  }
  requestWorkspaceTrust(options2) {
    return this._proxy.$requestWorkspaceTrust(options2);
  }
  $onDidGrantWorkspaceTrust() {
    if (!this._trusted) {
      this._trusted = true;
      this._onDidGrantWorkspaceTrust.fire();
    }
  }
  $onDidChangeWorkspaceTrustedFolders() {
    this._onDidChangeWorkspaceTrustedFolders.fire();
  }
  isResourceTrusted(resource) {
    return this._proxy.$isResourceTrusted(resource);
  }
  // called by ext host
  registerEditSessionIdentityProvider(scheme, provider) {
    if (this._editSessionIdentityProviders.has(scheme)) {
      throw new Error(`A provider has already been registered for scheme ${scheme}`);
    }
    this._editSessionIdentityProviders.set(scheme, provider);
    const outgoingScheme = this._uriTransformerService.transformOutgoingScheme(scheme);
    const handle = this._providerHandlePool++;
    this._proxy.$registerEditSessionIdentityProvider(handle, outgoingScheme);
    return toDisposable(() => {
      this._editSessionIdentityProviders.delete(scheme);
      this._proxy.$unregisterEditSessionIdentityProvider(handle);
    });
  }
  // called by main thread
  async $getEditSessionIdentifier(workspaceFolder, cancellationToken) {
    this._logService.info("Getting edit session identifier for workspaceFolder", workspaceFolder);
    const folder = await this.resolveWorkspaceFolder(URI.revive(workspaceFolder));
    if (!folder) {
      this._logService.warn("Unable to resolve workspace folder");
      return void 0;
    }
    this._logService.info("Invoking #provideEditSessionIdentity for workspaceFolder", folder);
    const provider = this._editSessionIdentityProviders.get(folder.uri.scheme);
    this._logService.info(`Provider for scheme ${folder.uri.scheme} is defined: `, !!provider);
    if (!provider) {
      return void 0;
    }
    const result = await provider.provideEditSessionIdentity(folder, cancellationToken);
    this._logService.info("Provider returned edit session identifier: ", result);
    if (!result) {
      return void 0;
    }
    return result;
  }
  async $provideEditSessionIdentityMatch(workspaceFolder, identity1, identity2, cancellationToken) {
    this._logService.info("Getting edit session identifier for workspaceFolder", workspaceFolder);
    const folder = await this.resolveWorkspaceFolder(URI.revive(workspaceFolder));
    if (!folder) {
      this._logService.warn("Unable to resolve workspace folder");
      return void 0;
    }
    this._logService.info("Invoking #provideEditSessionIdentity for workspaceFolder", folder);
    const provider = this._editSessionIdentityProviders.get(folder.uri.scheme);
    this._logService.info(`Provider for scheme ${folder.uri.scheme} is defined: `, !!provider);
    if (!provider) {
      return void 0;
    }
    const result = await provider.provideEditSessionIdentityMatch?.(identity1, identity2, cancellationToken);
    this._logService.info("Provider returned edit session identifier match result: ", result);
    if (!result) {
      return void 0;
    }
    return result;
  }
  getOnWillCreateEditSessionIdentityEvent(extension) {
    return (listener, thisArg, disposables) => {
      const wrappedListener = function wrapped(e) {
        listener.call(thisArg, e);
      };
      wrappedListener.extension = extension;
      return this._onWillCreateEditSessionIdentityEvent.event(wrappedListener, void 0, disposables);
    };
  }
  // main thread calls this to trigger participants
  async $onWillCreateEditSessionIdentity(workspaceFolder, token, timeout2) {
    const folder = await this.resolveWorkspaceFolder(URI.revive(workspaceFolder));
    if (folder === void 0) {
      throw new Error("Unable to resolve workspace folder");
    }
    await this._onWillCreateEditSessionIdentityEvent.fireAsync({ workspaceFolder: folder }, token, async (thenable, listener) => {
      const now = Date.now();
      await Promise.resolve(thenable);
      if (Date.now() - now > timeout2) {
        this._logService.warn("SLOW edit session create-participant", listener.extension.identifier);
      }
    });
    if (token.isCancellationRequested) {
      return void 0;
    }
  }
  // called by ext host
  registerCanonicalUriProvider(scheme, provider) {
    if (this._canonicalUriProviders.has(scheme)) {
      throw new Error(`A provider has already been registered for scheme ${scheme}`);
    }
    this._canonicalUriProviders.set(scheme, provider);
    const outgoingScheme = this._uriTransformerService.transformOutgoingScheme(scheme);
    const handle = this._providerHandlePool++;
    this._proxy.$registerCanonicalUriProvider(handle, outgoingScheme);
    return toDisposable(() => {
      this._canonicalUriProviders.delete(scheme);
      this._proxy.$unregisterCanonicalUriProvider(handle);
    });
  }
  async provideCanonicalUri(uri2, options2, cancellationToken) {
    const provider = this._canonicalUriProviders.get(uri2.scheme);
    if (!provider) {
      return void 0;
    }
    const result = await provider.provideCanonicalUri?.(URI.revive(uri2), options2, cancellationToken);
    if (!result) {
      return void 0;
    }
    return result;
  }
  // called by main thread
  async $provideCanonicalUri(uri2, targetScheme, cancellationToken) {
    return this.provideCanonicalUri(URI.revive(uri2), { targetScheme }, cancellationToken);
  }
  // --- encodings ---
  async decode(content, args) {
    const [uri2, opts] = this.toEncodeDecodeParameters(args);
    const options2 = await this._proxy.$resolveDecoding(uri2, opts);
    const stream = (await toDecodeStream(bufferToStream(VSBuffer.wrap(content)), {
      ...options2,
      acceptTextOnly: true,
      overwriteEncoding: (detectedEncoding) => {
        if (detectedEncoding === null || detectedEncoding === options2.preferredEncoding) {
          return Promise.resolve(options2.preferredEncoding);
        }
        return this._proxy.$validateDetectedEncoding(uri2, detectedEncoding, opts);
      }
    })).stream;
    return consumeStream(stream, (chunks) => chunks.join(""));
  }
  async encode(content, args) {
    const [uri2, options2] = this.toEncodeDecodeParameters(args);
    const { encoding, addBOM } = await this._proxy.$resolveEncoding(uri2, options2);
    if (encoding === UTF8 && !addBOM) {
      return VSBuffer.fromString(content).buffer;
    }
    const res = await toEncodeReadable(stringToSnapshot(content), encoding, { addBOM });
    return readableToBuffer(res).buffer;
  }
  toEncodeDecodeParameters(opts) {
    const uri2 = isUriComponents(opts?.uri) ? opts.uri : void 0;
    const encoding = typeof opts?.encoding === "string" ? opts.encoding : void 0;
    return [uri2, encoding ? { encoding } : void 0];
  }
};

ExtHostWorkspace = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService),
  __decorateParam(2, IExtHostFileSystemInfo),
  __decorateParam(3, ILogService),
  __decorateParam(4, IURITransformerService)
], ExtHostWorkspace);

var IExtHostWorkspace = createDecorator("IExtHostWorkspace");

function parseSearchExcludeInclude(include) {
  let pattern;
  let includeFolder;
  if (include) {
    if (typeof include === "string") {
      pattern = include;
    } else {
      pattern = include.pattern;
      includeFolder = URI.revive(include.baseUri);
    }
    return {
      pattern,
      folder: includeFolder
    };
  }
  return void 0;
}

function globsToISearchPatternBuilder(excludes) {
  return (excludes?.map((exclude) => {
    if (typeof exclude === "string") {
      if (exclude === "") {
        return void 0;
      }
      return {
        pattern: exclude,
        uri: void 0
      };
    } else {
      const parsedExclude = parseSearchExcludeInclude(exclude);
      if (!parsedExclude) {
        return void 0;
      }
      return {
        pattern: parsedExclude.pattern,
        uri: parsedExclude.folder
      };
    }
  }) ?? []).filter((e) => !!e);
}
export { isFolderEqual, compareWorkspaceFolderByUri, compareWorkspaceFolderByUriAndNameAndIndex, delta2, ignorePathCasing, parseSearchExcludeInclude, globsToISearchPatternBuilder, ExtHostWorkspaceImpl, ExtHostWorkspace, IExtHostWorkspace };
