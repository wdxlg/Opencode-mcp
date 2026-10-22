// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/search/node/rawSearchService.ts
import { Emitter } from "./module-0017.mjs";
import { createCancelablePromise } from "./module-0029.mjs";
import { Engine } from "./module-0346.mjs";
import { TextSearchEngineAdapter } from "./module-0352.mjs";
import { ByteSize } from "./module-0073.mjs";
import { basename, dirname, join, sep } from "./module-0019.mjs";
import { StopWatch } from "./module-0016.mjs";
import { compareItemsByFuzzyScore, prepareQuery } from "./module-0345.mjs";
import { DEFAULT_MAX_SEARCH_RESULTS, isFilePatternMatch } from "./module-0247.mjs";
import { topAsync } from "./module-0006.mjs";
import { canceled } from "./module-0003.mjs";
import { URI } from "./module-0025.mjs";
import { revive } from "./module-0036.mjs";


// src/vs/workbench/services/search/node/rawSearchService.ts
var SearchService = class _SearchService {
  constructor(processType = "searchProcess", getNumThreads) {
    this.processType = processType;
    this.getNumThreads = getNumThreads;
    this.caches = /* @__PURE__ */ Object.create(null);
  }
  static {
    this.BATCH_SIZE = 512;
  }
  fileSearch(config) {
    let promise;
    const query = reviveQuery2(config);
    const emitter = new Emitter({
      onDidAddFirstListener: () => {
        promise = createCancelablePromise(async (token) => {
          const numThreads = await this.getNumThreads?.();
          return this.doFileSearchWithEngine(Engine, query, (p) => emitter.fire(p), token, _SearchService.BATCH_SIZE, numThreads);
        });
        promise.then(
          (c) => emitter.fire(c),
          (err) => emitter.fire({ type: "error", error: { message: err.message, stack: err.stack } })
        );
      },
      onDidRemoveLastListener: () => {
        promise.cancel();
      }
    });
    return emitter.event;
  }
  textSearch(rawQuery) {
    let promise;
    const query = reviveQuery2(rawQuery);
    const emitter = new Emitter({
      onDidAddFirstListener: () => {
        promise = createCancelablePromise((token) => {
          return this.ripgrepTextSearch(query, (p) => emitter.fire(p), token);
        });
        promise.then(
          (c) => emitter.fire(c),
          (err) => emitter.fire({ type: "error", error: { message: err.message, stack: err.stack } })
        );
      },
      onDidRemoveLastListener: () => {
        promise.cancel();
      }
    });
    return emitter.event;
  }
  async ripgrepTextSearch(config, progressCallback, token) {
    config.maxFileSize = this.getPlatformFileLimits().maxFileSize;
    const numThreads = await this.getNumThreads?.();
    const engine = new TextSearchEngineAdapter(config, numThreads);
    return engine.search(token, progressCallback, progressCallback);
  }
  getPlatformFileLimits() {
    return {
      maxFileSize: 16 * ByteSize.GB
    };
  }
  doFileSearch(config, numThreads, progressCallback, token) {
    return this.doFileSearchWithEngine(Engine, config, progressCallback, token, _SearchService.BATCH_SIZE, numThreads);
  }
  doFileSearchWithEngine(EngineClass, config, progressCallback, token, batchSize = _SearchService.BATCH_SIZE, threads) {
    let resultCount = 0;
    const fileProgressCallback = (progress) => {
      if (Array.isArray(progress)) {
        resultCount += progress.length;
        progressCallback(progress.map((m) => this.rawMatchToSearchItem(m)));
      } else if (progress.relativePath) {
        resultCount++;
        progressCallback(this.rawMatchToSearchItem(progress));
      } else {
        progressCallback(progress);
      }
    };
    if (config.sortByScore) {
      let sortedSearch = this.trySortedSearchFromCache(config, fileProgressCallback, token);
      if (!sortedSearch) {
        const walkerConfig = config.maxResults ? Object.assign({}, config, { maxResults: null }) : config;
        const engine2 = new EngineClass(walkerConfig, threads);
        sortedSearch = this.doSortedSearch(engine2, config, progressCallback, fileProgressCallback, token);
      }
      return new Promise((c, e) => {
        sortedSearch.then(([result, rawMatches]) => {
          const serializedMatches = rawMatches.map((rawMatch) => this.rawMatchToSearchItem(rawMatch));
          this.sendProgress(serializedMatches, progressCallback, batchSize);
          c(result);
        }, e);
      });
    }
    const engine = new EngineClass(config, threads);
    return this.doSearch(engine, fileProgressCallback, batchSize, token).then((complete) => {
      return {
        limitHit: complete.limitHit,
        type: "success",
        stats: {
          detailStats: complete.stats,
          type: this.processType,
          fromCache: false,
          resultCount,
          sortingTime: void 0
        },
        messages: []
      };
    });
  }
  rawMatchToSearchItem(match2) {
    return { path: match2.base ? join(match2.base, match2.relativePath) : match2.relativePath };
  }
  doSortedSearch(engine, config, progressCallback, fileProgressCallback, token) {
    const emitter = new Emitter();
    let allResultsPromise = createCancelablePromise((token2) => {
      let results = [];
      const innerProgressCallback = (progress) => {
        if (Array.isArray(progress)) {
          results = progress;
        } else {
          fileProgressCallback(progress);
          emitter.fire(progress);
        }
      };
      return this.doSearch(engine, innerProgressCallback, -1, token2).then((result) => {
        return [result, results];
      });
    });
    let cache2;
    if (config.cacheKey) {
      cache2 = this.getOrCreateCache(config.cacheKey);
      const cacheRow = {
        promise: allResultsPromise,
        event: emitter.event,
        resolved: false
      };
      cache2.resultsToSearchCache[config.filePattern || ""] = cacheRow;
      allResultsPromise.then(() => {
        cacheRow.resolved = true;
      }, (err) => {
        delete cache2.resultsToSearchCache[config.filePattern || ""];
      });
      allResultsPromise = this.preventCancellation(allResultsPromise);
    }
    return allResultsPromise.then(([result, results]) => {
      const scorerCache = cache2 ? cache2.scorerCache : /* @__PURE__ */ Object.create(null);
      const sortSW = (typeof config.maxResults !== "number" || config.maxResults > 0) && StopWatch.create(false);
      return this.sortResults(config, results, scorerCache, token).then((sortedResults) => {
        const sortingTime = sortSW ? sortSW.elapsed() : -1;
        return [{
          type: "success",
          stats: {
            detailStats: result.stats,
            sortingTime,
            fromCache: false,
            type: this.processType,
            resultCount: sortedResults.length
          },
          messages: result.messages,
          limitHit: result.limitHit || typeof config.maxResults === "number" && results.length > config.maxResults
        }, sortedResults];
      });
    });
  }
  getOrCreateCache(cacheKey2) {
    const existing = this.caches[cacheKey2];
    if (existing) {
      return existing;
    }
    return this.caches[cacheKey2] = new Cache2();
  }
  trySortedSearchFromCache(config, progressCallback, token) {
    const cache2 = config.cacheKey && this.caches[config.cacheKey];
    if (!cache2) {
      return void 0;
    }
    const cached = this.getResultsFromCache(cache2, config.filePattern || "", progressCallback, token);
    if (cached) {
      return cached.then(([result, results, cacheStats]) => {
        const sortSW = StopWatch.create(false);
        return this.sortResults(config, results, cache2.scorerCache, token).then((sortedResults) => {
          const sortingTime = sortSW.elapsed();
          const stats = {
            fromCache: true,
            detailStats: cacheStats,
            type: this.processType,
            resultCount: results.length,
            sortingTime
          };
          return [
            {
              type: "success",
              limitHit: result.limitHit || typeof config.maxResults === "number" && results.length > config.maxResults,
              stats,
              messages: []
            },
            sortedResults
          ];
        });
      });
    }
    return void 0;
  }
  sortResults(config, results, scorerCache, token) {
    const query = prepareQuery(config.filePattern || "");
    const compare4 = (matchA, matchB) => compareItemsByFuzzyScore(matchA, matchB, query, true, FileMatchItemAccessor, scorerCache);
    const maxResults = typeof config.maxResults === "number" ? config.maxResults : DEFAULT_MAX_SEARCH_RESULTS;
    return topAsync(results, compare4, maxResults, 1e4, token);
  }
  sendProgress(results, progressCb, batchSize) {
    if (batchSize && batchSize > 0) {
      for (let i = 0; i < results.length; i += batchSize) {
        progressCb(results.slice(i, i + batchSize));
      }
    } else {
      progressCb(results);
    }
  }
  getResultsFromCache(cache2, searchValue, progressCallback, token) {
    const cacheLookupSW = StopWatch.create(false);
    const hasPathSep = searchValue.indexOf(sep) >= 0;
    let cachedRow;
    for (const previousSearch in cache2.resultsToSearchCache) {
      if (searchValue.startsWith(previousSearch)) {
        if (hasPathSep && previousSearch.indexOf(sep) < 0 && previousSearch !== "") {
          continue;
        }
        const row = cache2.resultsToSearchCache[previousSearch];
        cachedRow = {
          promise: this.preventCancellation(row.promise),
          event: row.event,
          resolved: row.resolved
        };
        break;
      }
    }
    if (!cachedRow) {
      return null;
    }
    const cacheLookupTime = cacheLookupSW.elapsed();
    const cacheFilterSW = StopWatch.create(false);
    const listener = cachedRow.event(progressCallback);
    if (token) {
      token.onCancellationRequested(() => {
        listener.dispose();
      });
    }
    return cachedRow.promise.then(([complete, cachedEntries]) => {
      if (token && token.isCancellationRequested) {
        throw canceled();
      }
      const results = [];
      const normalizedSearchValueLowercase = prepareQuery(searchValue).normalizedLowercase;
      for (const entry of cachedEntries) {
        if (!isFilePatternMatch(entry, normalizedSearchValueLowercase)) {
          continue;
        }
        results.push(entry);
      }
      return [complete, results, {
        cacheWasResolved: cachedRow.resolved,
        cacheLookupTime,
        cacheFilterTime: cacheFilterSW.elapsed(),
        cacheEntryCount: cachedEntries.length
      }];
    });
  }
  doSearch(engine, progressCallback, batchSize, token) {
    return new Promise((c, e) => {
      let batch = [];
      token?.onCancellationRequested(() => engine.cancel());
      engine.search((match2) => {
        if (match2) {
          if (batchSize) {
            batch.push(match2);
            if (batchSize > 0 && batch.length >= batchSize) {
              progressCallback(batch);
              batch = [];
            }
          } else {
            progressCallback(match2);
          }
        }
      }, (progress) => {
        progressCallback(progress);
      }, (error, complete) => {
        if (batch.length) {
          progressCallback(batch);
        }
        if (error) {
          progressCallback({ message: "Search finished. Error: " + error.message });
          e(error);
        } else {
          progressCallback({ message: "Search finished. Stats: " + JSON.stringify(complete.stats) });
          c(complete);
        }
      });
    });
  }
  clearCache(cacheKey2) {
    delete this.caches[cacheKey2];
    return Promise.resolve(void 0);
  }
  /**
   * Return a CancelablePromise which is not actually cancelable
   * TODO@rob - Is this really needed?
   */
  preventCancellation(promise) {
    return new class {
      get [Symbol.toStringTag]() {
        return this.toString();
      }
      cancel() {
      }
      then(resolve2, reject) {
        return promise.then(resolve2, reject);
      }
      catch(reject) {
        return this.then(void 0, reject);
      }
      finally(onFinally) {
        return promise.finally(onFinally);
      }
    }();
  }
};

var Cache2 = class {
  constructor() {
    this.resultsToSearchCache = /* @__PURE__ */ Object.create(null);
    this.scorerCache = /* @__PURE__ */ Object.create(null);
  }
};

var FileMatchItemAccessor = new class {
  getItemLabel(match2) {
    return basename(match2.relativePath);
  }
  getItemDescription(match2) {
    return dirname(match2.relativePath);
  }
  getItemPath(match2) {
    return match2.relativePath;
  }
}();

function reviveQuery2(rawQuery) {
  return {
    // eslint-disable-next-line local/code-no-any-casts
    ...rawQuery,
    // TODO
    ...{
      folderQueries: rawQuery.folderQueries && rawQuery.folderQueries.map(reviveFolderQuery2),
      extraFileResources: rawQuery.extraFileResources && rawQuery.extraFileResources.map((components) => URI.revive(components))
    }
  };
}

function reviveFolderQuery2(rawFolderQuery) {
  return revive(rawFolderQuery);
}
export { reviveQuery2, reviveFolderQuery2, SearchService, Cache2, FileMatchItemAccessor };
