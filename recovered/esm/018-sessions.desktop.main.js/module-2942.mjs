// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchTreeModel/searchModel.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2, PauseableEmitter } from "./module-0017.mjs";
import { SEARCH_MODEL_PREFIX, mergeSearchResultEvents } from "./module-2519.mjs";
import { SearchResultImpl } from "./module-2941.mjs";
import { Lazy } from "./module-0028.mjs";
import { ReplacePattern2 } from "./module-2940.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { Schemas } from "./module-0033.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISearchService } from "./module-1000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { INotebookSearchService } from "./module-2939.mjs";


// src/vs/workbench/contrib/search/browser/searchTreeModel/searchModel.ts
var SearchModelImpl = class extends Disposable {
  constructor(searchService, telemetryService, configurationService, instantiationService, logService, notebookSearchService) {
    super();
    this.searchService = searchService;
    this.telemetryService = telemetryService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.notebookSearchService = notebookSearchService;
    this._searchQuery = null;
    this._replaceActive = false;
    this._replaceString = null;
    this._replacePattern = null;
    this._preserveCase = false;
    this._startStreamDelay = Promise.resolve();
    this._resultQueue = [];
    this._aiResultQueue = [];
    this._onReplaceTermChanged = this._register(new Emitter());
    this.onReplaceTermChanged = this._onReplaceTermChanged.event;
    this._onSearchResultChanged = this._register(new PauseableEmitter({
      merge: mergeSearchResultEvents
    }));
    this.onSearchResultChanged = this._onSearchResultChanged.event;
    this.currentCancelTokenSource = null;
    this.currentAICancelTokenSource = null;
    this.searchCancelledForNewSearch = false;
    this.aiSearchCancelledForNewSearch = false;
    this.location = 0 /* PANEL */;
    this._searchResult = this.instantiationService.createInstance(SearchResultImpl, this);
    this._register(this._searchResult.onChange((e4) => this._onSearchResultChanged.fire(e4)));
    this._aiTextResultProviderName = new Lazy(async () => this.searchService.getAIName());
    this._id = SEARCH_MODEL_PREFIX + Date.now().toString();
  }
  id() {
    return this._id;
  }
  async getAITextResultProviderName() {
    const result = await this._aiTextResultProviderName.value;
    if (!result) {
      throw Error("Fetching AI name when no provider present.");
    }
    return result;
  }
  isReplaceActive() {
    return this._replaceActive;
  }
  set replaceActive(replaceActive) {
    this._replaceActive = replaceActive;
  }
  get replacePattern() {
    return this._replacePattern;
  }
  get replaceString() {
    return this._replaceString || "";
  }
  set preserveCase(value2) {
    this._preserveCase = value2;
  }
  get preserveCase() {
    return this._preserveCase;
  }
  set replaceString(replaceString) {
    this._replaceString = replaceString;
    if (this._searchQuery) {
      this._replacePattern = new ReplacePattern2(replaceString, this._searchQuery.contentPattern);
    }
    this._onReplaceTermChanged.fire();
  }
  get searchResult() {
    return this._searchResult;
  }
  aiSearch(onResult) {
    if (this.hasAIResults) {
      throw Error("AI results already exist");
    }
    if (!this._searchQuery) {
      throw Error("No search query");
    }
    const searchInstanceID = Date.now().toString();
    const tokenSource = new CancellationTokenSource();
    this.currentAICancelTokenSource = tokenSource;
    const start = Date.now();
    const asyncAIResults = this.searchService.aiTextSearch(
      { ...this._searchQuery, contentPattern: this._searchQuery.contentPattern.pattern, type: 3 /* aiText */ },
      tokenSource.token,
      async (p) => {
        onResult(p);
        this.onSearchProgress(p, searchInstanceID, false, true);
      }
    ).finally(() => {
      tokenSource.dispose(true);
    }).then(
      (value2) => {
        if (value2.results.length === 0) {
          onResult(void 0);
        }
        this.onSearchCompleted(value2, Date.now() - start, searchInstanceID, true);
        return value2;
      },
      (e4) => {
        this.onSearchError(e4, Date.now() - start, true);
        throw e4;
      }
    );
    return asyncAIResults;
  }
  doSearch(query, progressEmitter, searchQuery, searchInstanceID, onProgress, callerToken) {
    const asyncGenerateOnProgress = async (p) => {
      progressEmitter.fire();
      this.onSearchProgress(p, searchInstanceID, false, false);
      onProgress?.(p);
    };
    const syncGenerateOnProgress = (p) => {
      progressEmitter.fire();
      this.onSearchProgress(p, searchInstanceID, true);
      onProgress?.(p);
    };
    const tokenSource = this.currentCancelTokenSource = new CancellationTokenSource(callerToken);
    const notebookResult = this.notebookSearchService.notebookSearch(query, tokenSource.token, searchInstanceID, asyncGenerateOnProgress);
    const textResult = this.searchService.textSearchSplitSyncAsync(
      searchQuery,
      tokenSource.token,
      asyncGenerateOnProgress,
      notebookResult.openFilesToScan,
      notebookResult.allScannedFiles
    );
    const syncResults = textResult.syncResults.results;
    syncResults.forEach((p) => {
      if (p) {
        syncGenerateOnProgress(p);
      }
    });
    const getAsyncResults = async () => {
      const searchStart = Date.now();
      const allClosedEditorResults = await textResult.asyncResults;
      const resolvedNotebookResults = await notebookResult.completeData;
      const searchLength = Date.now() - searchStart;
      const resolvedResult = {
        results: [...allClosedEditorResults.results, ...resolvedNotebookResults.results],
        messages: [...allClosedEditorResults.messages, ...resolvedNotebookResults.messages],
        limitHit: allClosedEditorResults.limitHit || resolvedNotebookResults.limitHit,
        exit: allClosedEditorResults.exit,
        stats: allClosedEditorResults.stats
      };
      this.logService.trace(`whole search time | ${searchLength}ms`);
      return resolvedResult;
    };
    return {
      asyncResults: getAsyncResults().finally(() => tokenSource.dispose(true)),
      syncResults
    };
  }
  get hasAIResults() {
    return !!this.searchResult.getCachedSearchComplete(true) || !!this.currentAICancelTokenSource && !this.currentAICancelTokenSource.token.isCancellationRequested;
  }
  get hasPlainResults() {
    return !!this.searchResult.getCachedSearchComplete(false) || !!this.currentCancelTokenSource && !this.currentCancelTokenSource.token.isCancellationRequested;
  }
  search(query, onProgress, callerToken) {
    this.cancelSearch(true);
    this._searchQuery = query;
    if (!this.searchConfig.searchOnType) {
      this.searchResult.clear();
    }
    const searchInstanceID = Date.now().toString();
    this._searchResult.query = this._searchQuery;
    const progressEmitter = this._register(new Emitter());
    this._replacePattern = new ReplacePattern2(this.replaceString, this._searchQuery.contentPattern);
    this._startStreamDelay = new Promise((resolve3) => setTimeout(resolve3, this.searchConfig.searchOnType ? 150 : 0));
    const req = this.doSearch(query, progressEmitter, this._searchQuery, searchInstanceID, onProgress, callerToken);
    const asyncResults = req.asyncResults;
    const syncResults = req.syncResults;
    if (onProgress) {
      syncResults.forEach((p) => {
        if (p) {
          onProgress(p);
        }
      });
    }
    const start = Date.now();
    let event;
    const progressEmitterPromise = new Promise((resolve3) => {
      event = Event2.once(progressEmitter.event)(resolve3);
      return event;
    });
    Promise.race([asyncResults, progressEmitterPromise]).finally(() => {
      event?.dispose();
      this.telemetryService.publicLog("searchResultsFirstRender", { duration: Date.now() - start });
    });
    try {
      return {
        asyncResults: asyncResults.then(
          (value2) => {
            this.onSearchCompleted(value2, Date.now() - start, searchInstanceID, false);
            return value2;
          },
          (e4) => {
            this.onSearchError(e4, Date.now() - start, false);
            throw e4;
          }
        ),
        syncResults
      };
    } finally {
      this.telemetryService.publicLog("searchResultsFinished", { duration: Date.now() - start });
    }
  }
  onSearchCompleted(completed, duration, searchInstanceID, ai) {
    if (!this._searchQuery) {
      throw new Error("onSearchCompleted must be called after a search is started");
    }
    if (ai) {
      this._searchResult.add(this._aiResultQueue, searchInstanceID, true);
      this._aiResultQueue.length = 0;
    } else {
      this._searchResult.add(this._resultQueue, searchInstanceID, false);
      this._resultQueue.length = 0;
    }
    this.searchResult.setCachedSearchComplete(completed, ai);
    const options3 = Object.assign({}, this._searchQuery.contentPattern);
    delete options3.pattern;
    const stats = completed && completed.stats;
    const fileSchemeOnly = this._searchQuery.folderQueries.every((fq) => fq.folder.scheme === Schemas.file);
    const otherSchemeOnly = this._searchQuery.folderQueries.every((fq) => fq.folder.scheme !== Schemas.file);
    const scheme = fileSchemeOnly ? Schemas.file : otherSchemeOnly ? "other" : "mixed";
    this.telemetryService.publicLog("searchResultsShown", {
      count: this._searchResult.count(),
      fileCount: this._searchResult.fileCount(),
      options: options3,
      duration,
      type: stats && stats.type,
      scheme,
      searchOnTypeEnabled: this.searchConfig.searchOnType
    });
    return completed;
  }
  onSearchError(e4, duration, ai) {
    if (isCancellationError(e4)) {
      this.onSearchCompleted(
        (ai ? this.aiSearchCancelledForNewSearch : this.searchCancelledForNewSearch) ? { exit: 1 /* NewSearchStarted */, results: [], messages: [] } : void 0,
        duration,
        "",
        ai
      );
      if (ai) {
        this.aiSearchCancelledForNewSearch = false;
      } else {
        this.searchCancelledForNewSearch = false;
      }
    }
  }
  onSearchProgress(p, searchInstanceID, sync = true, ai = false) {
    const targetQueue = ai ? this._aiResultQueue : this._resultQueue;
    if (p.resource) {
      targetQueue.push(p);
      if (sync) {
        if (targetQueue.length) {
          this._searchResult.add(targetQueue, searchInstanceID, false, true);
          targetQueue.length = 0;
        }
      } else {
        this._startStreamDelay.then(() => {
          if (targetQueue.length) {
            this._searchResult.add(targetQueue, searchInstanceID, ai, !ai);
            targetQueue.length = 0;
          }
        });
      }
    }
  }
  get searchConfig() {
    return this.configurationService.getValue("search");
  }
  cancelSearch(cancelledForNewSearch = false) {
    if (this.currentCancelTokenSource) {
      this.searchCancelledForNewSearch = cancelledForNewSearch;
      this.currentCancelTokenSource.cancel();
      return true;
    }
    return false;
  }
  cancelAISearch(cancelledForNewSearch = false) {
    if (this.currentAICancelTokenSource) {
      this.aiSearchCancelledForNewSearch = cancelledForNewSearch;
      this.currentAICancelTokenSource.cancel();
      return true;
    }
    return false;
  }
  clearAiSearchResults() {
    this._aiResultQueue.length = 0;
    this._searchResult.aiTextSearchResult.clear(false);
  }
  dispose() {
    this.cancelSearch();
    this.cancelAISearch();
    this.searchResult.dispose();
    super.dispose();
  }
};

SearchModelImpl = __decorateClass([
  __decorateParam(0, ISearchService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILogService),
  __decorateParam(5, INotebookSearchService)
], SearchModelImpl);

var SearchViewModelWorkbenchService = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
    this._searchModel = null;
  }
  get searchModel() {
    if (!this._searchModel) {
      this._searchModel = this.instantiationService.createInstance(SearchModelImpl);
    }
    return this._searchModel;
  }
  set searchModel(searchModel) {
    this._searchModel?.dispose();
    this._searchModel = searchModel;
  }
};

SearchViewModelWorkbenchService = __decorateClass([
  __decorateParam(0, IInstantiationService)
], SearchViewModelWorkbenchService);
export { SearchModelImpl, SearchViewModelWorkbenchService };
