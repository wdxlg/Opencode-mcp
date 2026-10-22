// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/search/common/searchService.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { DEFAULT_MAX_SEARCH_RESULTS, FileMatch, SEARCH_RESULT_LANGUAGE_ID, deserializeSearchError, isAIKeyword, isFileMatch, isProgressMessage, pathIncludedInQuery } from "./module-0999.mjs";
import { Schemas } from "./module-0033.mjs";
import { coalesce, uniqueFilter } from "./module-0007.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { CancellationError } from "./module-0004.mjs";
import { DeferredPromise, raceCancellationError } from "./module-0036.mjs";
import { StopWatch } from "./module-0016.mjs";
import { randomChance } from "./module-0040.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { isNumber } from "./module-0010.mjs";
import { editorMatchesToTextSearchResults, getTextSearchMatchWithModelContext } from "./module-2846.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IFileService } from "./module-0269.mjs";
import { IUriIdentityService } from "./module-0510.mjs";


// src/vs/workbench/services/search/common/searchService.ts
var SearchService = class extends Disposable {
  constructor(modelService, editorService, telemetryService, logService, extensionService, fileService, uriIdentityService) {
    super();
    this.modelService = modelService;
    this.editorService = editorService;
    this.telemetryService = telemetryService;
    this.logService = logService;
    this.extensionService = extensionService;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.fileSearchProviders = /* @__PURE__ */ new Map();
    this.textSearchProviders = /* @__PURE__ */ new Map();
    this.aiTextSearchProviders = /* @__PURE__ */ new Map();
    this.deferredFileSearchesByScheme = /* @__PURE__ */ new Map();
    this.deferredTextSearchesByScheme = /* @__PURE__ */ new Map();
    this.deferredAITextSearchesByScheme = /* @__PURE__ */ new Map();
    this.loggedSchemesMissingProviders = /* @__PURE__ */ new Set();
  }
  registerSearchResultProvider(scheme, type, provider) {
    let list2;
    let deferredMap;
    if (type === 0 /* file */) {
      list2 = this.fileSearchProviders;
      deferredMap = this.deferredFileSearchesByScheme;
    } else if (type === 1 /* text */) {
      list2 = this.textSearchProviders;
      deferredMap = this.deferredTextSearchesByScheme;
    } else if (type === 2 /* aiText */) {
      list2 = this.aiTextSearchProviders;
      deferredMap = this.deferredAITextSearchesByScheme;
    } else {
      throw new Error("Unknown SearchProviderType");
    }
    list2.set(scheme, provider);
    if (deferredMap.has(scheme)) {
      deferredMap.get(scheme).complete(provider);
      deferredMap.delete(scheme);
    }
    return toDisposable(() => {
      list2.delete(scheme);
    });
  }
  async textSearch(query, token, onProgress) {
    const results = this.textSearchSplitSyncAsync(query, token, onProgress);
    const openEditorResults = results.syncResults;
    const otherResults = await results.asyncResults;
    return {
      limitHit: otherResults.limitHit || openEditorResults.limitHit,
      results: [...otherResults.results, ...openEditorResults.results],
      messages: [...otherResults.messages, ...openEditorResults.messages]
    };
  }
  async aiTextSearch(query, token, onProgress) {
    const onProviderProgress = (progress) => {
      if (onProgress) {
        if (isFileMatch(progress) || isAIKeyword(progress)) {
          onProgress(progress);
        } else {
          onProgress(progress);
        }
      }
      if (isProgressMessage(progress)) {
        this.logService.debug("SearchService#search", progress.message);
      }
    };
    return this.doSearch(query, token, onProviderProgress);
  }
  async getAIName() {
    const provider = this.getSearchProvider(3 /* aiText */).get(Schemas.file);
    return await provider?.getAIName();
  }
  textSearchSplitSyncAsync(query, token, onProgress, notebookFilesToIgnore, asyncNotebookFilesToIgnore) {
    const openEditorResults = this.getOpenEditorResults(query);
    if (onProgress) {
      coalesce([...openEditorResults.results.values()]).filter((e) => !(notebookFilesToIgnore && notebookFilesToIgnore.has(e.resource))).forEach(onProgress);
    }
    const syncResults = {
      results: coalesce([...openEditorResults.results.values()]),
      limitHit: openEditorResults.limitHit ?? false,
      messages: []
    };
    const getAsyncResults = async () => {
      const resolvedAsyncNotebookFilesToIgnore = await asyncNotebookFilesToIgnore ?? new ResourceSet();
      const onProviderProgress = (progress) => {
        if (isFileMatch(progress)) {
          if (!openEditorResults.results.has(progress.resource) && !resolvedAsyncNotebookFilesToIgnore.has(progress.resource) && onProgress) {
            onProgress(progress);
          }
        } else if (onProgress) {
          onProgress(progress);
        }
        if (isProgressMessage(progress)) {
          this.logService.debug("SearchService#search", progress.message);
        }
      };
      return await this.doSearch(query, token, onProviderProgress);
    };
    return {
      syncResults,
      asyncResults: getAsyncResults()
    };
  }
  fileSearch(query, token) {
    return this.doSearch(query, token);
  }
  schemeHasFileSearchProvider(scheme) {
    return this.fileSearchProviders.has(scheme);
  }
  doSearch(query, token, onProgress) {
    this.logService.trace("SearchService#search", JSON.stringify(query));
    const schemesInQuery = this.getSchemesInQuery(query);
    const providerActivations = [Promise.resolve(null)];
    schemesInQuery.forEach((scheme) => providerActivations.push(this.extensionService.activateByEvent(`onSearch:${scheme}`)));
    providerActivations.push(this.extensionService.activateByEvent("onSearch:file"));
    const providerPromise = (async () => {
      await Promise.all(providerActivations);
      await this.extensionService.whenInstalledExtensionsRegistered();
      if (token && token.isCancellationRequested) {
        return Promise.reject(new CancellationError());
      }
      const progressCallback = (item) => {
        if (token && token.isCancellationRequested) {
          return;
        }
        onProgress?.(item);
      };
      const exists = await Promise.all(query.folderQueries.map((query2) => this.fileService.exists(query2.folder)));
      query.folderQueries = query.folderQueries.filter((_, i2) => exists[i2]);
      let completes = await this.searchWithProviders(query, progressCallback, token);
      completes = coalesce(completes);
      if (!completes.length) {
        return {
          limitHit: false,
          results: [],
          messages: []
        };
      }
      return {
        limitHit: completes[0] && completes[0].limitHit,
        stats: completes[0].stats,
        messages: coalesce(completes.flatMap((i2) => i2.messages)).filter(uniqueFilter((message) => message.type + message.text + message.trusted)),
        results: completes.flatMap((c) => c.results),
        aiKeywords: completes.flatMap((c) => c.aiKeywords).filter((keyword) => keyword !== void 0)
      };
    })();
    return token ? raceCancellationError(providerPromise, token) : providerPromise;
  }
  getSchemesInQuery(query) {
    const schemes = /* @__PURE__ */ new Set();
    query.folderQueries?.forEach((fq) => schemes.add(fq.folder.scheme));
    query.extraFileResources?.forEach((extraFile) => schemes.add(extraFile.scheme));
    return schemes;
  }
  async waitForProvider(queryType, scheme) {
    const deferredMap = this.getDeferredTextSearchesByScheme(queryType);
    if (deferredMap.has(scheme)) {
      return deferredMap.get(scheme).p;
    } else {
      const deferred = new DeferredPromise();
      deferredMap.set(scheme, deferred);
      return deferred.p;
    }
  }
  getSearchProvider(type) {
    switch (type) {
      case 1 /* File */:
        return this.fileSearchProviders;
      case 2 /* Text */:
        return this.textSearchProviders;
      case 3 /* aiText */:
        return this.aiTextSearchProviders;
      default:
        throw new Error(`Unknown query type: ${type}`);
    }
  }
  getDeferredTextSearchesByScheme(type) {
    switch (type) {
      case 1 /* File */:
        return this.deferredFileSearchesByScheme;
      case 2 /* Text */:
        return this.deferredTextSearchesByScheme;
      case 3 /* aiText */:
        return this.deferredAITextSearchesByScheme;
      default:
        throw new Error(`Unknown query type: ${type}`);
    }
  }
  async searchWithProviders(query, onProviderProgress, token) {
    const e2eSW = StopWatch.create(false);
    const searchPs = [];
    const fqs = this.groupFolderQueriesByScheme(query);
    const someSchemeHasProvider = [...fqs.keys()].some((scheme) => {
      return this.getSearchProvider(query.type).has(scheme);
    });
    await Promise.all([...fqs.keys()].map(async (scheme) => {
      if (query.onlyFileScheme && scheme !== Schemas.file) {
        return;
      }
      const schemeFQs = fqs.get(scheme);
      let provider = this.getSearchProvider(query.type).get(scheme);
      if (!provider) {
        if (someSchemeHasProvider) {
          if (!this.loggedSchemesMissingProviders.has(scheme)) {
            this.logService.warn(`No search provider registered for scheme: ${scheme}. Another scheme has a provider, not waiting for ${scheme}`);
            this.loggedSchemesMissingProviders.add(scheme);
          }
          return;
        } else {
          if (!this.loggedSchemesMissingProviders.has(scheme)) {
            this.logService.warn(`No search provider registered for scheme: ${scheme}, waiting`);
            this.loggedSchemesMissingProviders.add(scheme);
          }
          provider = await this.waitForProvider(query.type, scheme);
        }
      }
      const oneSchemeQuery = {
        ...query,
        ...{
          folderQueries: schemeFQs
        }
      };
      const doProviderSearch = () => {
        switch (query.type) {
          case 1 /* File */:
            return provider.fileSearch(oneSchemeQuery, token);
          case 2 /* Text */:
            return provider.textSearch(oneSchemeQuery, onProviderProgress, token);
          default:
            return provider.textSearch(oneSchemeQuery, onProviderProgress, token);
        }
      };
      searchPs.push(doProviderSearch());
    }));
    return Promise.all(searchPs).then((completes) => {
      const endToEndTime = e2eSW.elapsed();
      this.logService.trace(`SearchService#search: ${endToEndTime}ms`);
      completes.forEach((complete) => {
        this.sendTelemetry(query, endToEndTime, complete);
      });
      return completes;
    }, (err) => {
      const endToEndTime = e2eSW.elapsed();
      this.logService.trace(`SearchService#search: ${endToEndTime}ms`);
      const searchError = deserializeSearchError(err);
      this.logService.trace(`SearchService#searchError: ${searchError.message}`);
      this.sendTelemetry(query, endToEndTime, void 0, searchError);
      throw searchError;
    });
  }
  groupFolderQueriesByScheme(query) {
    const queries = /* @__PURE__ */ new Map();
    query.folderQueries.forEach((fq) => {
      const schemeFQs = queries.get(fq.folder.scheme) || [];
      schemeFQs.push(fq);
      queries.set(fq.folder.scheme, schemeFQs);
    });
    return queries;
  }
  sendTelemetry(query, endToEndTime, complete, err) {
    if (!randomChance(5 / 100)) {
      return;
    }
    const fileSchemeOnly = query.folderQueries.every((fq) => fq.folder.scheme === Schemas.file);
    const otherSchemeOnly = query.folderQueries.every((fq) => fq.folder.scheme !== Schemas.file);
    const scheme = fileSchemeOnly ? Schemas.file : otherSchemeOnly ? "other" : "mixed";
    if (query.type === 1 /* File */ && complete && complete.stats) {
      const fileSearchStats = complete.stats;
      if (fileSearchStats.fromCache) {
        const cacheStats = fileSearchStats.detailStats;
        this.telemetryService.publicLog2("cachedSearchComplete", {
          reason: query._reason,
          resultCount: fileSearchStats.resultCount,
          workspaceFolderCount: query.folderQueries.length,
          endToEndTime,
          sortingTime: fileSearchStats.sortingTime,
          cacheWasResolved: cacheStats.cacheWasResolved,
          cacheLookupTime: cacheStats.cacheLookupTime,
          cacheFilterTime: cacheStats.cacheFilterTime,
          cacheEntryCount: cacheStats.cacheEntryCount,
          scheme
        });
      } else {
        const searchEngineStats = fileSearchStats.detailStats;
        this.telemetryService.publicLog2("searchComplete", {
          reason: query._reason,
          resultCount: fileSearchStats.resultCount,
          workspaceFolderCount: query.folderQueries.length,
          endToEndTime,
          sortingTime: fileSearchStats.sortingTime,
          fileWalkTime: searchEngineStats.fileWalkTime,
          directoriesWalked: searchEngineStats.directoriesWalked,
          filesWalked: searchEngineStats.filesWalked,
          cmdTime: searchEngineStats.cmdTime,
          cmdResultCount: searchEngineStats.cmdResultCount,
          scheme
        });
      }
    } else if (query.type === 2 /* Text */) {
      let errorType;
      if (err) {
        errorType = err.code === 2 /* regexParseError */ ? "regex" : err.code === 1 /* unknownEncoding */ ? "encoding" : err.code === 3 /* globParseError */ ? "glob" : err.code === 4 /* invalidLiteral */ ? "literal" : err.code === 6 /* other */ ? "other" : err.code === 7 /* canceled */ ? "canceled" : "unknown";
      }
      this.telemetryService.publicLog2("textSearchComplete", {
        reason: query._reason,
        workspaceFolderCount: query.folderQueries.length,
        endToEndTime,
        scheme,
        error: errorType
      });
    }
  }
  getOpenEditorResults(query) {
    const openEditorResults = new ResourceMap((uri5) => this.uriIdentityService.extUri.getComparisonKey(uri5));
    let limitHit = false;
    if (query.type === 2 /* Text */) {
      const canonicalToOriginalResources = new ResourceMap();
      for (const editorInput of this.editorService.editors) {
        const canonical = EditorResourceAccessor.getCanonicalUri(editorInput, { supportSideBySide: 1 /* PRIMARY */ });
        const original = EditorResourceAccessor.getOriginalUri(editorInput, { supportSideBySide: 1 /* PRIMARY */ });
        if (canonical) {
          canonicalToOriginalResources.set(canonical, original ?? canonical);
        }
      }
      const models = this.modelService.getModels();
      models.forEach((model) => {
        const resource = model.uri;
        if (!resource) {
          return;
        }
        if (limitHit) {
          return;
        }
        const originalResource = canonicalToOriginalResources.get(resource);
        if (!originalResource) {
          return;
        }
        if (model.getLanguageId() === SEARCH_RESULT_LANGUAGE_ID && !(query.includePattern && query.includePattern["**/*.code-search"])) {
          return;
        }
        if (originalResource.scheme !== Schemas.untitled && !this.fileService.hasProvider(originalResource)) {
          return;
        }
        if (originalResource.scheme === "git") {
          return;
        }
        if (!this.matches(originalResource, query)) {
          return;
        }
        const askMax = (isNumber(query.maxResults) ? query.maxResults : DEFAULT_MAX_SEARCH_RESULTS) + 1;
        let matches2 = model.findMatches(query.contentPattern.pattern, false, !!query.contentPattern.isRegExp, !!query.contentPattern.isCaseSensitive, query.contentPattern.isWordMatch ? query.contentPattern.wordSeparators : null, false, askMax);
        if (matches2.length) {
          if (askMax && matches2.length >= askMax) {
            limitHit = true;
            matches2 = matches2.slice(0, askMax - 1);
          }
          const fileMatch = new FileMatch(originalResource);
          openEditorResults.set(originalResource, fileMatch);
          const textSearchResults = editorMatchesToTextSearchResults(matches2, model, query.previewOptions);
          fileMatch.results = getTextSearchMatchWithModelContext(textSearchResults, model, query);
        } else {
          openEditorResults.set(originalResource, null);
        }
      });
    }
    return {
      results: openEditorResults,
      limitHit
    };
  }
  matches(resource, query) {
    return pathIncludedInQuery(query, resource.fsPath);
  }
  async clearCache(cacheKey2) {
    const clearPs = Array.from(this.fileSearchProviders.values()).map((provider) => provider && provider.clearCache(cacheKey2));
    await Promise.all(clearPs);
  }
};

SearchService = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IExtensionService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IUriIdentityService)
], SearchService);
export { SearchService };
