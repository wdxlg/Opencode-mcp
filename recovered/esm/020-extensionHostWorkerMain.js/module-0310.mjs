// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/services/search/common/fileSearchManager.ts
import { parse3 } from "./module-0179.mjs";
import { basename, dirname, posix } from "./module-0022.mjs";
import { toErrorMessage } from "./module-0041.mjs";
import { CancellationTokenSource } from "./module-0026.mjs";
import { OldFileSearchProviderConverter } from "./module-0308.mjs";
import { DEFAULT_MAX_SEARCH_RESULTS, QueryGlobTester, excludeToGlobPattern, hasSiblingFn, resolvePatternsForProvider } from "./module-0241.mjs";
import { FolderQuerySearchTree } from "./module-0309.mjs";
import { StopWatch } from "./module-0018.mjs";
import { equals2 } from "./module-0029.mjs";
import { joinPath } from "./module-0032.mjs";


// src/vs/workbench/services/search/common/fileSearchManager.ts
var FileSearchEngine = class {
  constructor(config, provider, sessionLifecycle) {
    this.config = config;
    this.provider = provider;
    this.sessionLifecycle = sessionLifecycle;
    this.isLimitHit = false;
    this.resultCount = 0;
    this.isCanceled = false;
    this.filePattern = config.filePattern;
    const globOptions = config.ignoreGlobCase ? { ignoreCase: true } : void 0;
    this.includePattern = config.includePattern && parse3(config.includePattern, globOptions);
    this.maxResults = config.maxResults || void 0;
    this.exists = config.exists;
    this.activeCancellationTokens = /* @__PURE__ */ new Set();
    this.globalExcludePattern = config.excludePattern && parse3(config.excludePattern, globOptions);
  }
  cancel() {
    this.isCanceled = true;
    this.activeCancellationTokens.forEach((t) => t.cancel());
    this.activeCancellationTokens = /* @__PURE__ */ new Set();
  }
  search(_onResult) {
    const folderQueries = this.config.folderQueries || [];
    return new Promise((resolve2, reject) => {
      const onResult = (match2) => {
        this.resultCount++;
        _onResult(match2);
      };
      if (this.isCanceled) {
        return resolve2({ limitHit: this.isLimitHit });
      }
      if (this.config.extraFileResources) {
        this.config.extraFileResources.forEach((extraFile) => {
          const extraFileStr = extraFile.toString();
          const basename3 = basename(extraFileStr);
          if (this.globalExcludePattern && this.globalExcludePattern(extraFileStr, basename3)) {
            return;
          }
          this.matchFile(onResult, { base: extraFile, basename: basename3 });
        });
      }
      this.doSearch(folderQueries, onResult).then((stats) => {
        resolve2({
          limitHit: this.isLimitHit,
          stats: stats || void 0
          // Only looking at single-folder workspace stats...
        });
      }, (err) => {
        reject(new Error(toErrorMessage(err)));
      });
    });
  }
  async doSearch(fqs, onResult) {
    const cancellation = new CancellationTokenSource();
    const folderOptions = fqs.map((fq) => this.getSearchOptionsForFolder(fq));
    const session = this.provider instanceof OldFileSearchProviderConverter ? this.sessionLifecycle?.tokenSource.token : this.sessionLifecycle?.obj;
    const options2 = {
      folderOptions,
      maxResults: this.config.maxResults ?? DEFAULT_MAX_SEARCH_RESULTS,
      session
    };
    const getFolderQueryInfo = (fq) => {
      const queryTester = new QueryGlobTester(this.config, fq);
      const noSiblingsClauses = !queryTester.hasSiblingExcludeClauses();
      return { queryTester, noSiblingsClauses, folder: fq.folder, tree: this.initDirectoryTree() };
    };
    const folderMappings = new FolderQuerySearchTree(fqs, getFolderQueryInfo);
    let providerSW;
    try {
      this.activeCancellationTokens.add(cancellation);
      providerSW = StopWatch.create();
      const results = await this.provider.provideFileSearchResults(
        this.config.filePattern || "",
        options2,
        cancellation.token
      );
      const providerTime = providerSW.elapsed();
      const postProcessSW = StopWatch.create();
      if (this.isCanceled && !this.isLimitHit) {
        return null;
      }
      if (results) {
        results.forEach((result) => {
          const fqFolderInfo = folderMappings.findQueryFragmentAwareSubstr(result);
          const relativePath2 = posix.relative(fqFolderInfo.folder.path, result.path);
          if (fqFolderInfo.noSiblingsClauses) {
            const basename3 = basename(result.path);
            this.matchFile(onResult, { base: fqFolderInfo.folder, relativePath: relativePath2, basename: basename3 });
            return;
          }
          this.addDirectoryEntries(fqFolderInfo.tree, fqFolderInfo.folder, relativePath2, onResult);
        });
      }
      if (this.isCanceled && !this.isLimitHit) {
        return null;
      }
      folderMappings.forEachFolderQueryInfo((e) => {
        this.matchDirectoryTree(e.tree, e.queryTester, onResult);
      });
      return {
        providerTime,
        postProcessTime: postProcessSW.elapsed()
      };
    } finally {
      cancellation.dispose();
      this.activeCancellationTokens.delete(cancellation);
    }
  }
  getSearchOptionsForFolder(fq) {
    const includes = resolvePatternsForProvider(this.config.includePattern, fq.includePattern);
    let excludePattern = fq.excludePattern?.map((e) => ({
      folder: e.folder,
      patterns: resolvePatternsForProvider(this.config.excludePattern, e.pattern)
    }));
    if (!excludePattern?.length) {
      excludePattern = [{
        folder: void 0,
        patterns: resolvePatternsForProvider(this.config.excludePattern, void 0)
      }];
    }
    const excludes = excludeToGlobPattern(excludePattern);
    return {
      folder: fq.folder,
      excludes,
      includes,
      useIgnoreFiles: {
        local: !fq.disregardIgnoreFiles,
        parent: !fq.disregardParentIgnoreFiles,
        global: !fq.disregardGlobalIgnoreFiles
      },
      followSymlinks: !fq.ignoreSymlinks
    };
  }
  initDirectoryTree() {
    const tree = {
      rootEntries: [],
      pathToEntries: /* @__PURE__ */ Object.create(null)
    };
    tree.pathToEntries["."] = tree.rootEntries;
    return tree;
  }
  addDirectoryEntries({ pathToEntries }, base, relativeFile, onResult) {
    if (this.filePattern && equals2(relativeFile, this.filePattern, this.config.ignoreGlobCase)) {
      const basename3 = basename(this.filePattern);
      this.matchFile(onResult, { base, relativePath: this.filePattern, basename: basename3 });
    }
    function add(relativePath2) {
      const basename3 = basename(relativePath2);
      const dirname3 = dirname(relativePath2);
      let entries = pathToEntries[dirname3];
      if (!entries) {
        entries = pathToEntries[dirname3] = [];
        add(dirname3);
      }
      entries.push({
        base,
        relativePath: relativePath2,
        basename: basename3
      });
    }
    add(relativeFile);
  }
  matchDirectoryTree({ rootEntries, pathToEntries }, queryTester, onResult) {
    const self2 = this;
    const filePattern = this.filePattern;
    const ignoreGlobCase = this.config.ignoreGlobCase;
    function matchDirectory(entries) {
      const hasSibling = hasSiblingFn(() => entries.map((entry) => entry.basename));
      for (let i = 0, n = entries.length; i < n; i++) {
        const entry = entries[i];
        const { relativePath: relativePath2, basename: basename3 } = entry;
        if (queryTester.matchesExcludesSync(relativePath2, basename3, !equals2(filePattern, basename3, ignoreGlobCase) ? hasSibling : void 0)) {
          continue;
        }
        const sub = pathToEntries[relativePath2];
        if (sub) {
          matchDirectory(sub);
        } else {
          if (equals2(relativePath2, filePattern, ignoreGlobCase)) {
            continue;
          }
          self2.matchFile(onResult, entry);
        }
        if (self2.isLimitHit) {
          break;
        }
      }
    }
    matchDirectory(rootEntries);
  }
  matchFile(onResult, candidate) {
    if (!this.includePattern || candidate.relativePath && this.includePattern(candidate.relativePath, candidate.basename)) {
      if (this.exists || this.maxResults && this.resultCount >= this.maxResults) {
        this.isLimitHit = true;
        this.cancel();
      }
      if (!this.isLimitHit) {
        onResult(candidate);
      }
    }
  }
};

var SessionLifecycle2 = class {
  constructor() {
    this._obj = new Object();
    this.tokenSource = new CancellationTokenSource();
  }
  get obj() {
    if (this._obj) {
      return this._obj;
    }
    throw new Error("Session object has been dereferenced.");
  }
  cancel() {
    this.tokenSource.cancel();
    this._obj = void 0;
  }
};

var FileSearchManager = class _FileSearchManager {
  constructor() {
    this.sessions = /* @__PURE__ */ new Map();
  }
  static {
    this.BATCH_SIZE = 512;
  }
  fileSearch(config, provider, onBatch, token) {
    const sessionTokenSource = this.getSessionTokenSource(config.cacheKey);
    const engine = new FileSearchEngine(config, provider, sessionTokenSource);
    let resultCount = 0;
    const onInternalResult = (batch) => {
      resultCount += batch.length;
      onBatch(batch.map((m) => this.rawMatchToSearchItem(m)));
    };
    return this.doSearch(engine, _FileSearchManager.BATCH_SIZE, onInternalResult, token).then(
      (result) => {
        return {
          limitHit: result.limitHit,
          stats: result.stats ? {
            fromCache: false,
            type: "fileSearchProvider",
            resultCount,
            detailStats: result.stats
          } : void 0,
          messages: []
        };
      }
    );
  }
  clearCache(cacheKey2) {
    this.sessions.get(cacheKey2)?.cancel();
    this.sessions.delete(cacheKey2);
  }
  getSessionTokenSource(cacheKey2) {
    if (!cacheKey2) {
      return void 0;
    }
    if (!this.sessions.has(cacheKey2)) {
      this.sessions.set(cacheKey2, new SessionLifecycle2());
    }
    return this.sessions.get(cacheKey2);
  }
  rawMatchToSearchItem(match2) {
    if (match2.relativePath) {
      return {
        resource: joinPath(match2.base, match2.relativePath)
      };
    } else {
      return {
        resource: match2.base
      };
    }
  }
  doSearch(engine, batchSize, onResultBatch, token) {
    const listener = token.onCancellationRequested(() => {
      engine.cancel();
    });
    const _onResult = (match2) => {
      if (match2) {
        batch.push(match2);
        if (batchSize > 0 && batch.length >= batchSize) {
          onResultBatch(batch);
          batch = [];
        }
      }
    };
    let batch = [];
    return engine.search(_onResult).then((result) => {
      if (batch.length) {
        onResultBatch(batch);
      }
      listener.dispose();
      return result;
    }, (error) => {
      if (batch.length) {
        onResultBatch(batch);
      }
      listener.dispose();
      return Promise.reject(error);
    });
  }
};
export { FileSearchEngine, SessionLifecycle2, FileSearchManager };
