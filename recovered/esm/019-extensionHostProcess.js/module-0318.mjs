// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/search/common/textSearchManager.ts
import { CancellationTokenSource } from "./module-0018.mjs";
import { AISearchKeyword, TextSearchMatch2 } from "./module-0246.mjs";
import { toErrorMessage } from "./module-0060.mjs";
import { FolderQuerySearchTree } from "./module-0316.mjs";
import { DEFAULT_MAX_SEARCH_RESULTS, DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS, QueryGlobTester, excludeToGlobPattern, hasSiblingPromiseFn, resolvePatternsForProvider } from "./module-0247.mjs";
import { Schemas } from "./module-0026.mjs";
import { dirname2, isEqual2, relativePath } from "./module-0027.mjs";
import { basename } from "./module-0019.mjs";
import { isThenable } from "./module-0029.mjs";
import { URI } from "./module-0025.mjs";


// src/vs/workbench/services/search/common/textSearchManager.ts
var TextSearchManager = class {
  constructor(queryProviderPair, fileUtils, processType) {
    this.queryProviderPair = queryProviderPair;
    this.fileUtils = fileUtils;
    this.processType = processType;
    this.collector = null;
    this.isLimitHit = false;
    this.resultCount = 0;
  }
  get query() {
    return this.queryProviderPair.query;
  }
  search(onProgress, token, onKeywordResult) {
    const folderQueries = this.query.folderQueries || [];
    const tokenSource = new CancellationTokenSource(token);
    return new Promise((resolve2, reject) => {
      this.collector = new TextSearchResultsCollector(onProgress);
      let isCanceled = false;
      const onResult = (result, folderIdx) => {
        if (result instanceof AISearchKeyword) {
          return;
        }
        if (isCanceled) {
          return;
        }
        if (!this.isLimitHit) {
          const resultSize = this.resultSize(result);
          if (result instanceof TextSearchMatch2 && typeof this.query.maxResults === "number" && this.resultCount + resultSize > this.query.maxResults) {
            this.isLimitHit = true;
            isCanceled = true;
            tokenSource.cancel();
            result = this.trimResultToSize(result, this.query.maxResults - this.resultCount);
          }
          const newResultSize = this.resultSize(result);
          this.resultCount += newResultSize;
          const a = result instanceof TextSearchMatch2;
          if (newResultSize > 0 || !a) {
            this.collector.add(result, folderIdx);
          }
        }
      };
      this.doSearch(folderQueries, onResult, tokenSource.token, onKeywordResult).then((result) => {
        tokenSource.dispose();
        this.collector.flush();
        resolve2({
          limitHit: this.isLimitHit || result?.limitHit,
          messages: this.getMessagesFromResults(result),
          stats: {
            type: this.processType
          }
        });
      }, (err) => {
        tokenSource.dispose();
        const errMsg = toErrorMessage(err);
        reject(new Error(errMsg));
      });
    });
  }
  getMessagesFromResults(result) {
    if (!result?.message) {
      return [];
    }
    if (Array.isArray(result.message)) {
      return result.message;
    }
    return [result.message];
  }
  resultSize(result) {
    if (result instanceof TextSearchMatch2) {
      return Array.isArray(result.ranges) ? result.ranges.length : 1;
    } else {
      return 0;
    }
  }
  trimResultToSize(result, size) {
    return new TextSearchMatch2(result.uri, result.ranges.slice(0, size), result.previewText);
  }
  async doSearch(folderQueries, onResult, token, onKeywordResult) {
    const folderMappings = new FolderQuerySearchTree(
      folderQueries,
      (fq, i) => {
        const queryTester = new QueryGlobTester(this.query, fq);
        return { queryTester, folder: fq.folder, folderIdx: i };
      },
      () => true
    );
    const testingPs = [];
    const progress = {
      report: (result2) => {
        if (result2 instanceof AISearchKeyword) {
          onKeywordResult?.(result2);
        } else {
          if (result2.uri === void 0) {
            throw Error("Text search result URI is undefined. Please check provider implementation.");
          }
          const folderQuery = folderMappings.findQueryFragmentAwareSubstr(result2.uri);
          if (folderQuery?.folder?.scheme) {
            const hasSibling = folderQuery.folder.scheme === Schemas.file ? hasSiblingPromiseFn(() => {
              return this.fileUtils.readdir(dirname2(result2.uri));
            }) : void 0;
            const relativePath2 = relativePath(folderQuery.folder, result2.uri);
            if (relativePath2) {
              const included = folderQuery.queryTester.includedInQuery(relativePath2, basename(relativePath2), hasSibling);
              if (isThenable(included)) {
                testingPs.push(
                  included.then((isIncluded) => {
                    if (isIncluded) {
                      onResult(result2, folderQuery.folderIdx);
                    }
                  })
                );
              } else if (included) {
                onResult(result2, folderQuery.folderIdx);
              }
            }
          }
        }
      }
    };
    const folderOptions = folderQueries.map((fq) => this.getSearchOptionsForFolder(fq));
    const searchOptions = {
      folderOptions,
      maxFileSize: this.query.maxFileSize,
      maxResults: this.query.maxResults ?? DEFAULT_MAX_SEARCH_RESULTS,
      previewOptions: this.query.previewOptions ?? DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS,
      surroundingContext: this.query.surroundingContext ?? 0
    };
    let result;
    if (this.queryProviderPair.query.type === 3 /* aiText */) {
      result = await this.queryProviderPair.provider.provideAITextSearchResults(this.queryProviderPair.query.contentPattern, searchOptions, progress, token);
    } else {
      result = await this.queryProviderPair.provider.provideTextSearchResults(patternInfoToQuery(this.queryProviderPair.query.contentPattern), searchOptions, progress, token);
    }
    if (testingPs.length) {
      await Promise.all(testingPs);
    }
    return result;
  }
  getSearchOptionsForFolder(fq) {
    const includes = resolvePatternsForProvider(this.query.includePattern, fq.includePattern);
    let excludePattern = fq.excludePattern?.map((e) => ({
      folder: e.folder,
      patterns: resolvePatternsForProvider(this.query.excludePattern, e.pattern)
    }));
    if (!excludePattern || excludePattern.length === 0) {
      excludePattern = [{
        folder: void 0,
        patterns: resolvePatternsForProvider(this.query.excludePattern, void 0)
      }];
    }
    const excludes = excludeToGlobPattern(excludePattern);
    const options2 = {
      folder: URI.from(fq.folder),
      excludes,
      includes,
      useIgnoreFiles: {
        local: !fq.disregardIgnoreFiles,
        parent: !fq.disregardParentIgnoreFiles,
        global: !fq.disregardGlobalIgnoreFiles
      },
      followSymlinks: !fq.ignoreSymlinks,
      encoding: (fq.fileEncoding && this.fileUtils.toCanonicalName(fq.fileEncoding)) ?? "",
      ignoreGlobCase: this.query.ignoreGlobCase || fq.ignoreGlobCase
    };
    return options2;
  }
};

function patternInfoToQuery(patternInfo) {
  return {
    isCaseSensitive: patternInfo.isCaseSensitive || false,
    isRegExp: patternInfo.isRegExp || false,
    isWordMatch: patternInfo.isWordMatch || false,
    isMultiline: patternInfo.isMultiline || false,
    pattern: patternInfo.pattern
  };
}

var TextSearchResultsCollector = class {
  constructor(_onResult) {
    this._onResult = _onResult;
    this._currentFolderIdx = -1;
    this._currentFileMatch = null;
    this._batchedCollector = new BatchedCollector(512, (items) => this.sendItems(items));
  }
  add(data, folderIdx) {
    if (this._currentFileMatch && (this._currentFolderIdx !== folderIdx || !isEqual2(this._currentUri, data.uri))) {
      this.pushToCollector();
      this._currentFileMatch = null;
    }
    if (!this._currentFileMatch) {
      this._currentFolderIdx = folderIdx;
      this._currentUri = data.uri;
      this._currentFileMatch = {
        resource: data.uri,
        results: []
      };
    }
    this._currentFileMatch.results.push(extensionResultToFrontendResult(data));
  }
  pushToCollector() {
    const size = this._currentFileMatch && this._currentFileMatch.results ? this._currentFileMatch.results.length : 0;
    this._batchedCollector.addItem(this._currentFileMatch, size);
  }
  flush() {
    this.pushToCollector();
    this._batchedCollector.flush();
  }
  sendItems(items) {
    this._onResult(items);
  }
};

function extensionResultToFrontendResult(data) {
  if (data instanceof TextSearchMatch2) {
    return {
      previewText: data.previewText,
      rangeLocations: data.ranges.map((r2) => ({
        preview: {
          startLineNumber: r2.previewRange.start.line,
          startColumn: r2.previewRange.start.character,
          endLineNumber: r2.previewRange.end.line,
          endColumn: r2.previewRange.end.character
        },
        source: {
          startLineNumber: r2.sourceRange.start.line,
          startColumn: r2.sourceRange.start.character,
          endLineNumber: r2.sourceRange.end.line,
          endColumn: r2.sourceRange.end.character
        }
      }))
    };
  } else {
    return {
      text: data.text,
      lineNumber: data.lineNumber
    };
  }
}

var BatchedCollector = class _BatchedCollector {
  constructor(maxBatchSize, cb) {
    this.maxBatchSize = maxBatchSize;
    this.cb = cb;
    this.totalNumberCompleted = 0;
    this.batch = [];
    this.batchSize = 0;
  }
  static {
    this.TIMEOUT = 4e3;
  }
  static {
    // After START_BATCH_AFTER_COUNT items have been collected, stop flushing on timeout
    this.START_BATCH_AFTER_COUNT = 50;
  }
  addItem(item, size) {
    if (!item) {
      return;
    }
    this.addItemToBatch(item, size);
  }
  addItems(items, size) {
    if (!items) {
      return;
    }
    this.addItemsToBatch(items, size);
  }
  addItemToBatch(item, size) {
    this.batch.push(item);
    this.batchSize += size;
    this.onUpdate();
  }
  addItemsToBatch(item, size) {
    this.batch = this.batch.concat(item);
    this.batchSize += size;
    this.onUpdate();
  }
  onUpdate() {
    if (this.totalNumberCompleted < _BatchedCollector.START_BATCH_AFTER_COUNT) {
      this.flush();
    } else if (this.batchSize >= this.maxBatchSize) {
      this.flush();
    } else if (!this.timeoutHandle) {
      this.timeoutHandle = setTimeout(() => {
        this.flush();
      }, _BatchedCollector.TIMEOUT);
    }
  }
  flush() {
    if (this.batchSize) {
      this.totalNumberCompleted += this.batchSize;
      this.cb(this.batch);
      this.batch = [];
      this.batchSize = 0;
      if (this.timeoutHandle) {
        clearTimeout(this.timeoutHandle);
        this.timeoutHandle = void 0;
      }
    }
  }
};
export { patternInfoToQuery, extensionResultToFrontendResult, TextSearchManager, TextSearchResultsCollector, BatchedCollector };
