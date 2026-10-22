// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHostSearch.ts
import { ExtHostSearch, reviveQuery } from "./module-0319.mjs";
import { pfs_exports } from "./module-0033.mjs";
import { DisposableStore, toDisposable } from "./module-0011.mjs";
import { OutputChannel } from "./module-0348.mjs";
import { Schemas } from "./module-0026.mjs";
import { RipgrepSearchProvider } from "./module-0354.mjs";
import { SearchService } from "./module-0353.mjs";
import { isSerializedFileMatch } from "./module-0247.mjs";
import { URI } from "./module-0025.mjs";
import { NativeTextSearchManager } from "./module-0351.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { IExtHostInitDataService } from "./module-0066.mjs";
import { IURITransformerService } from "./module-0070.mjs";
import { IExtHostConfiguration } from "./module-0253.mjs";
import { ILogService } from "./module-0062.mjs";


// src/vs/workbench/api/node/extHostSearch.ts
var NativeExtHostSearch = class extends ExtHostSearch {
  constructor(extHostRpc, initData, _uriTransformer, configurationService, _logService) {
    super(extHostRpc, _uriTransformer, _logService);
    this.configurationService = configurationService;
    this._pfs = pfs_exports;
    // allow extending for tests
    this._internalFileSearchHandle = -1;
    this._internalFileSearchProvider = null;
    this._registeredEHSearchProvider = false;
    this._disposables = new DisposableStore();
    this.isDisposed = false;
    this.getNumThreads = this.getNumThreads.bind(this);
    this.getNumThreadsCached = this.getNumThreadsCached.bind(this);
    this.handleConfigurationChanged = this.handleConfigurationChanged.bind(this);
    const outputChannel = new OutputChannel("RipgrepSearchUD", this._logService);
    this._disposables.add(this.registerTextSearchProvider(Schemas.vscodeUserData, new RipgrepSearchProvider(outputChannel, this.getNumThreadsCached)));
    if (initData.remote.isRemote && initData.remote.authority) {
      this._registerEHSearchProviders();
    }
    configurationService.getConfigProvider().then((provider) => {
      if (this.isDisposed) {
        return;
      }
      this._disposables.add(provider.onDidChangeConfiguration(this.handleConfigurationChanged));
    });
  }
  handleConfigurationChanged(event) {
    if (!event.affectsConfiguration("search")) {
      return;
    }
    this._numThreadsPromise = void 0;
  }
  async getNumThreads() {
    const configProvider = await this.configurationService.getConfigProvider();
    const numThreads = configProvider.getConfiguration("search").get("ripgrep.maxThreads");
    return numThreads;
  }
  async getNumThreadsCached() {
    if (!this._numThreadsPromise) {
      this._numThreadsPromise = this.getNumThreads();
    }
    return this._numThreadsPromise;
  }
  dispose() {
    this.isDisposed = true;
    this._disposables.dispose();
  }
  $enableExtensionHostSearch() {
    this._registerEHSearchProviders();
  }
  _registerEHSearchProviders() {
    if (this._registeredEHSearchProvider) {
      return;
    }
    this._registeredEHSearchProvider = true;
    const outputChannel = new OutputChannel("RipgrepSearchEH", this._logService);
    this._disposables.add(this.registerTextSearchProvider(Schemas.file, new RipgrepSearchProvider(outputChannel, this.getNumThreadsCached)));
    this._disposables.add(this.registerInternalFileSearchProvider(Schemas.file, new SearchService("fileSearchProvider", this.getNumThreadsCached)));
  }
  registerInternalFileSearchProvider(scheme, provider) {
    const handle = this._handlePool++;
    this._internalFileSearchProvider = provider;
    this._internalFileSearchHandle = handle;
    this._proxy.$registerFileSearchProvider(handle, this._transformScheme(scheme));
    return toDisposable(() => {
      this._internalFileSearchProvider = null;
      this._proxy.$unregisterProvider(handle);
    });
  }
  $provideFileSearchResults(handle, session, rawQuery, token) {
    const query = reviveQuery(rawQuery);
    if (handle === this._internalFileSearchHandle) {
      const start = Date.now();
      return this.doInternalFileSearch(handle, session, query, token).then((result) => {
        const elapsed = Date.now() - start;
        this._logService.debug(`Ext host file search time: ${elapsed}ms`);
        return result;
      });
    }
    return super.$provideFileSearchResults(handle, session, rawQuery, token);
  }
  async doInternalFileSearchWithCustomCallback(rawQuery, token, handleFileMatch) {
    const onResult = (ev) => {
      if (isSerializedFileMatch(ev)) {
        ev = [ev];
      }
      if (Array.isArray(ev)) {
        handleFileMatch(ev.map((m) => URI.file(m.path)));
        return;
      }
      if (ev.message) {
        this._logService.debug("ExtHostSearch", ev.message);
      }
    };
    if (!this._internalFileSearchProvider) {
      throw new Error("No internal file search handler");
    }
    const numThreads = await this.getNumThreadsCached();
    return this._internalFileSearchProvider.doFileSearch(rawQuery, numThreads, onResult, token);
  }
  async doInternalFileSearch(handle, session, rawQuery, token) {
    return this.doInternalFileSearchWithCustomCallback(rawQuery, token, (data) => {
      this._proxy.$handleFileMatch(handle, session, data);
    });
  }
  $clearCache(cacheKey2) {
    this._internalFileSearchProvider?.clearCache(cacheKey2);
    return super.$clearCache(cacheKey2);
  }
  createTextSearchManager(query, provider) {
    return new NativeTextSearchManager(query, provider, void 0, "textSearchProvider");
  }
};

NativeExtHostSearch = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService),
  __decorateParam(2, IURITransformerService),
  __decorateParam(3, IExtHostConfiguration),
  __decorateParam(4, ILogService)
], NativeExtHostSearch);
export { NativeExtHostSearch };
