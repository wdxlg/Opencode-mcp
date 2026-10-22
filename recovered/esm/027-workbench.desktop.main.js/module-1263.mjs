// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadSearch.ts
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { SearchContext } from "./module-1262.mjs";
import { DisposableStore, dispose } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { ISearchService } from "./module-0999.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { revive } from "./module-0265.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/api/browser/mainThreadSearch.ts
var MainThreadSearch = class {
  constructor(extHostContext, _searchService, _telemetryService, _configurationService, contextKeyService) {
    this._searchService = _searchService;
    this._telemetryService = _telemetryService;
    this.contextKeyService = contextKeyService;
    this._searchProvider = /* @__PURE__ */ new Map();
    this._aiSearchProviderHandles = /* @__PURE__ */ new Set();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostSearch);
    this._proxy.$enableExtensionHostSearch();
  }
  dispose() {
    this._searchProvider.forEach((value2) => value2.dispose());
    this._searchProvider.clear();
    this._aiSearchProviderHandles.clear();
    SearchContext.hasAIResultProvider.bindTo(this.contextKeyService).set(false);
  }
  $registerTextSearchProvider(handle2, scheme) {
    this._searchProvider.set(handle2, new RemoteSearchProvider(this._searchService, 1 /* text */, scheme, handle2, this._proxy));
  }
  $registerAITextSearchProvider(handle2, scheme) {
    SearchContext.hasAIResultProvider.bindTo(this.contextKeyService).set(true);
    this._aiSearchProviderHandles.add(handle2);
    this._searchProvider.set(handle2, new RemoteSearchProvider(this._searchService, 2 /* aiText */, scheme, handle2, this._proxy));
  }
  $registerFileSearchProvider(handle2, scheme) {
    this._searchProvider.set(handle2, new RemoteSearchProvider(this._searchService, 0 /* file */, scheme, handle2, this._proxy));
  }
  $unregisterProvider(handle2) {
    dispose(this._searchProvider.get(handle2));
    this._searchProvider.delete(handle2);
    if (this._aiSearchProviderHandles.delete(handle2) && this._aiSearchProviderHandles.size === 0) {
      SearchContext.hasAIResultProvider.bindTo(this.contextKeyService).set(false);
    }
  }
  $handleFileMatch(handle2, session, data) {
    const provider = this._searchProvider.get(handle2);
    if (!provider) {
      throw new Error("Got result for unknown provider");
    }
    provider.handleFindMatch(session, data);
  }
  $handleTextMatch(handle2, session, data) {
    const provider = this._searchProvider.get(handle2);
    if (!provider) {
      throw new Error("Got result for unknown provider");
    }
    provider.handleFindMatch(session, data);
  }
  $handleKeywordResult(handle2, session, data) {
    const provider = this._searchProvider.get(handle2);
    if (!provider) {
      throw new Error("Got result for unknown provider");
    }
    provider.handleKeywordResult(session, data);
  }
  $handleTelemetry(eventName, data) {
    this._telemetryService.publicLog(eventName, data);
  }
};

MainThreadSearch = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadSearch),
  __decorateParam(1, ISearchService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService)
], MainThreadSearch);

var SearchOperation = class _SearchOperation {
  constructor(progress, id2 = ++_SearchOperation._idPool, matches2 = /* @__PURE__ */ new Map(), keywords = []) {
    this.progress = progress;
    this.id = id2;
    this.matches = matches2;
    this.keywords = keywords;
  }
  static {
    this._idPool = 0;
  }
  addMatch(match2) {
    const existingMatch = this.matches.get(match2.resource.toString());
    if (existingMatch) {
      if (existingMatch.results && match2.results) {
        existingMatch.results.push(...match2.results);
      }
    } else {
      this.matches.set(match2.resource.toString(), match2);
    }
    this.progress?.(match2);
  }
  addKeyword(result) {
    this.keywords.push(result);
    this.progress?.(result);
  }
};

var RemoteSearchProvider = class {
  constructor(searchService, type, _scheme, _handle, _proxy) {
    this._scheme = _scheme;
    this._handle = _handle;
    this._proxy = _proxy;
    this._registrations = new DisposableStore();
    this._searches = /* @__PURE__ */ new Map();
    this._registrations.add(searchService.registerSearchResultProvider(this._scheme, type, this));
  }
  async getAIName() {
    if (this.cachedAIName === void 0) {
      this.cachedAIName = await this._proxy.$getAIName(this._handle);
    }
    return this.cachedAIName;
  }
  dispose() {
    this._registrations.dispose();
  }
  fileSearch(query, token = CancellationToken.None) {
    return this.doSearch(query, void 0, token);
  }
  textSearch(query, onProgress, token = CancellationToken.None) {
    return this.doSearch(query, onProgress, token);
  }
  doSearch(query, onProgress, token = CancellationToken.None) {
    if (!query.folderQueries.length) {
      throw new Error("Empty folderQueries");
    }
    const search2 = new SearchOperation(onProgress);
    this._searches.set(search2.id, search2);
    const searchP = this._provideSearchResults(query, search2.id, token);
    return Promise.resolve(searchP).then((result) => {
      this._searches.delete(search2.id);
      return { results: Array.from(search2.matches.values()), aiKeywords: Array.from(search2.keywords), stats: result.stats, limitHit: result.limitHit, messages: result.messages };
    }, (err) => {
      this._searches.delete(search2.id);
      return Promise.reject(err);
    });
  }
  clearCache(cacheKey2) {
    return Promise.resolve(this._proxy.$clearCache(cacheKey2));
  }
  handleFindMatch(session, dataOrUri) {
    const searchOp = this._searches.get(session);
    if (!searchOp) {
      return;
    }
    dataOrUri.forEach((result) => {
      if (result.results) {
        searchOp.addMatch(revive(result));
      } else {
        searchOp.addMatch({
          resource: URI.revive(result)
        });
      }
    });
  }
  handleKeywordResult(session, data) {
    const searchOp = this._searches.get(session);
    if (!searchOp) {
      return;
    }
    searchOp.addKeyword(data);
  }
  _provideSearchResults(query, session, token) {
    switch (query.type) {
      case 1 /* File */:
        return this._proxy.$provideFileSearchResults(this._handle, session, query, token);
      case 2 /* Text */:
        return this._proxy.$provideTextSearchResults(this._handle, session, query, token);
      default:
        return this._proxy.$provideAITextSearchResults(this._handle, session, query, token);
    }
  }
};
export { MainThreadSearch, SearchOperation, RemoteSearchProvider };
