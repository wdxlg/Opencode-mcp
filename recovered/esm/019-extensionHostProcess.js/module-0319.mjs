// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostSearch.ts
import { createDecorator2 } from "./module-0048.mjs";
import { MainContext } from "./module-0054.mjs";
import { FileSearchManager } from "./module-0317.mjs";
import { OldFileSearchProviderConverter, OldTextSearchProviderConverter } from "./module-0315.mjs";
import { toDisposable } from "./module-0011.mjs";
import { TextSearchManager } from "./module-0318.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { IURITransformerService } from "./module-0070.mjs";
import { ILogService } from "./module-0062.mjs";
import { URI } from "./module-0025.mjs";
import { revive } from "./module-0036.mjs";


// src/vs/workbench/api/common/extHostSearch.ts
var IExtHostSearch = createDecorator2("IExtHostSearch");

var ExtHostSearch = class {
  constructor(extHostRpc, _uriTransformer, _logService) {
    this.extHostRpc = extHostRpc;
    this._uriTransformer = _uriTransformer;
    this._logService = _logService;
    this._proxy = this.extHostRpc.getProxy(MainContext.MainThreadSearch);
    this._handlePool = 0;
    this._textSearchProvider = /* @__PURE__ */ new Map();
    this._textSearchUsedSchemes = /* @__PURE__ */ new Set();
    this._aiTextSearchProvider = /* @__PURE__ */ new Map();
    this._aiTextSearchUsedSchemes = /* @__PURE__ */ new Set();
    this._fileSearchProvider = /* @__PURE__ */ new Map();
    this._fileSearchUsedSchemes = /* @__PURE__ */ new Set();
    this._fileSearchManager = new FileSearchManager();
  }
  _transformScheme(scheme) {
    return this._uriTransformer.transformOutgoingScheme(scheme);
  }
  registerTextSearchProviderOld(scheme, provider) {
    if (this._textSearchUsedSchemes.has(scheme)) {
      throw new Error(`a text search provider for the scheme '${scheme}' is already registered`);
    }
    this._textSearchUsedSchemes.add(scheme);
    const handle = this._handlePool++;
    this._textSearchProvider.set(handle, new OldTextSearchProviderConverter(provider));
    this._proxy.$registerTextSearchProvider(handle, this._transformScheme(scheme));
    return toDisposable(() => {
      this._textSearchUsedSchemes.delete(scheme);
      this._textSearchProvider.delete(handle);
      this._proxy.$unregisterProvider(handle);
    });
  }
  registerTextSearchProvider(scheme, provider) {
    if (this._textSearchUsedSchemes.has(scheme)) {
      throw new Error(`a text search provider for the scheme '${scheme}' is already registered`);
    }
    this._textSearchUsedSchemes.add(scheme);
    const handle = this._handlePool++;
    this._textSearchProvider.set(handle, provider);
    this._proxy.$registerTextSearchProvider(handle, this._transformScheme(scheme));
    return toDisposable(() => {
      this._textSearchUsedSchemes.delete(scheme);
      this._textSearchProvider.delete(handle);
      this._proxy.$unregisterProvider(handle);
    });
  }
  registerAITextSearchProvider(scheme, provider) {
    if (this._aiTextSearchUsedSchemes.has(scheme)) {
      throw new Error(`an AI text search provider for the scheme '${scheme}'is already registered`);
    }
    this._aiTextSearchUsedSchemes.add(scheme);
    const handle = this._handlePool++;
    this._aiTextSearchProvider.set(handle, provider);
    this._proxy.$registerAITextSearchProvider(handle, this._transformScheme(scheme));
    return toDisposable(() => {
      this._aiTextSearchUsedSchemes.delete(scheme);
      this._aiTextSearchProvider.delete(handle);
      this._proxy.$unregisterProvider(handle);
    });
  }
  registerFileSearchProviderOld(scheme, provider) {
    if (this._fileSearchUsedSchemes.has(scheme)) {
      throw new Error(`a file search provider for the scheme '${scheme}' is already registered`);
    }
    this._fileSearchUsedSchemes.add(scheme);
    const handle = this._handlePool++;
    this._fileSearchProvider.set(handle, new OldFileSearchProviderConverter(provider));
    this._proxy.$registerFileSearchProvider(handle, this._transformScheme(scheme));
    return toDisposable(() => {
      this._fileSearchUsedSchemes.delete(scheme);
      this._fileSearchProvider.delete(handle);
      this._proxy.$unregisterProvider(handle);
    });
  }
  registerFileSearchProvider(scheme, provider) {
    if (this._fileSearchUsedSchemes.has(scheme)) {
      throw new Error(`a file search provider for the scheme '${scheme}' is already registered`);
    }
    this._fileSearchUsedSchemes.add(scheme);
    const handle = this._handlePool++;
    this._fileSearchProvider.set(handle, provider);
    this._proxy.$registerFileSearchProvider(handle, this._transformScheme(scheme));
    return toDisposable(() => {
      this._fileSearchUsedSchemes.delete(scheme);
      this._fileSearchProvider.delete(handle);
      this._proxy.$unregisterProvider(handle);
    });
  }
  $provideFileSearchResults(handle, session, rawQuery, token) {
    const query = reviveQuery(rawQuery);
    const provider = this._fileSearchProvider.get(handle);
    if (provider) {
      return this._fileSearchManager.fileSearch(query, provider, (batch) => {
        this._proxy.$handleFileMatch(handle, session, batch.map((p) => p.resource));
      }, token);
    } else {
      throw new Error("unknown provider: " + handle);
    }
  }
  async doInternalFileSearchWithCustomCallback(query, token, handleFileMatch) {
    return { messages: [] };
  }
  $clearCache(cacheKey2) {
    this._fileSearchManager.clearCache(cacheKey2);
    return Promise.resolve(void 0);
  }
  $provideTextSearchResults(handle, session, rawQuery, token) {
    const provider = this._textSearchProvider.get(handle);
    if (!provider || !provider.provideTextSearchResults) {
      throw new Error(`Unknown Text Search Provider ${handle}`);
    }
    const query = reviveQuery(rawQuery);
    const engine = this.createTextSearchManager(query, provider);
    return engine.search((progress) => this._proxy.$handleTextMatch(handle, session, progress), token);
  }
  $provideAITextSearchResults(handle, session, rawQuery, token) {
    const provider = this._aiTextSearchProvider.get(handle);
    if (!provider || !provider.provideAITextSearchResults) {
      throw new Error(`Unknown AI Text Search Provider ${handle}`);
    }
    const query = reviveQuery(rawQuery);
    const engine = this.createAITextSearchManager(query, provider);
    return engine.search((progress) => this._proxy.$handleTextMatch(handle, session, progress), token, (result) => this._proxy.$handleKeywordResult(handle, session, result));
  }
  $enableExtensionHostSearch() {
  }
  async $getAIName(handle) {
    const provider = this._aiTextSearchProvider.get(handle);
    if (!provider || !provider.provideAITextSearchResults) {
      return void 0;
    }
    return provider.name ?? "AI";
  }
  createTextSearchManager(query, provider) {
    return new TextSearchManager({ query, provider }, {
      readdir: (resource) => Promise.resolve([]),
      toCanonicalName: (encoding) => encoding
    }, "textSearchProvider");
  }
  createAITextSearchManager(query, provider) {
    return new TextSearchManager({ query, provider }, {
      readdir: (resource) => Promise.resolve([]),
      toCanonicalName: (encoding) => encoding
    }, "aiTextSearchProvider");
  }
};

ExtHostSearch = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IURITransformerService),
  __decorateParam(2, ILogService)
], ExtHostSearch);

function reviveQuery(rawQuery) {
  return {
    // eslint-disable-next-line local/code-no-any-casts
    ...rawQuery,
    // TODO@rob ???
    ...{
      folderQueries: rawQuery.folderQueries && rawQuery.folderQueries.map(reviveFolderQuery),
      extraFileResources: rawQuery.extraFileResources && rawQuery.extraFileResources.map((components) => URI.revive(components))
    }
  };
}

function reviveFolderQuery(rawFolderQuery) {
  return revive(rawFolderQuery);
}
export { reviveQuery, reviveFolderQuery, IExtHostSearch, ExtHostSearch };
