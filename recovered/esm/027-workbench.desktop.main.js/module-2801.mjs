// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/pluginGitCommandService.ts
import { CancellationToken } from "./module-0025.mjs";
import { GitHubAuthRequiredError, GitHubRateLimitError, fetchAndExtractGitHubRepo, parseGitHubCloneUrl, resolveGitHubRefToSha } from "./module-2800.mjs";
import { CancellationError } from "./module-0004.mjs";
import { localize } from "./module-0001.mjs";
import { getComparisonKey } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { IRequestService } from "./module-0946.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IAuthenticationService } from "./module-0951.mjs";


// src/vs/workbench/contrib/chat/browser/pluginGitCommandService.ts
var BROWSER_CACHE_STORAGE_KEY = "chat.plugins.browserCache.v1";

var BrowserPluginGitCommandService = class {
  constructor(_fileService, _logService, _requestService, _storageService, _authenticationService) {
    this._fileService = _fileService;
    this._logService = _logService;
    this._requestService = _requestService;
    this._storageService = _storageService;
    this._authenticationService = _authenticationService;
  }
  async cloneRepository(cloneUrl, targetDir, ref, token) {
    const repo = this._parseOrThrow(cloneUrl);
    const cancel = token ?? CancellationToken.None;
    const cloneWithToken = async (authToken) => {
      const sha = await resolveGitHubRefToSha(this._requestService, repo, ref, authToken, cancel);
      await fetchAndExtractGitHubRepo(this._requestService, this._fileService, this._logService, repo, sha, targetDir, authToken, cancel);
      this._setCacheEntry(targetDir, { owner: repo.owner, repo: repo.repo, ref, sha, fetchedAt: Date.now() });
    };
    const initialAuthToken = await this._lookupGitHubToken();
    const attempts = [
      async () => initialAuthToken
    ];
    if (initialAuthToken) {
      attempts.push(async () => void 0);
    }
    attempts.push(() => this._requestGitHubToken(repo));
    let lastErr;
    for (const getToken of attempts) {
      if (cancel.isCancellationRequested) {
        throw new CancellationError();
      }
      try {
        await cloneWithToken(await getToken());
        return;
      } catch (err) {
        lastErr = err;
        this._maybeLogTransientError(err, repo);
        if (!(err instanceof GitHubAuthRequiredError)) {
          throw err;
        }
      }
    }
    if (lastErr instanceof GitHubAuthRequiredError) {
      throw new Error(localize(
        11350,
        null,
        `${repo.owner}/${repo.repo}`
      ));
    }
    throw lastErr;
  }
  async pull(repoDir, token) {
    const entry = this._getCacheEntry(repoDir);
    if (!entry) {
      throw new Error(`Cannot pull plugin: no cached metadata for ${repoDir.toString()}`);
    }
    const cancel = token ?? CancellationToken.None;
    const authToken = await this._lookupGitHubToken();
    const repo = { owner: entry.owner, repo: entry.repo };
    try {
      const newSha = await resolveGitHubRefToSha(this._requestService, repo, entry.ref, authToken, cancel);
      if (newSha === entry.sha) {
        return false;
      }
      await fetchAndExtractGitHubRepo(this._requestService, this._fileService, this._logService, repo, newSha, repoDir, authToken, cancel);
      this._setCacheEntry(repoDir, { ...entry, sha: newSha, fetchedAt: Date.now() });
      return true;
    } catch (err) {
      this._maybeLogTransientError(err, repo);
      throw err;
    }
  }
  async checkout(repoDir, treeish, _detached, token) {
    const entry = this._getCacheEntry(repoDir);
    if (!entry) {
      throw new Error(`Cannot checkout plugin: no cached metadata for ${repoDir.toString()}`);
    }
    const cancel = token ?? CancellationToken.None;
    const authToken = await this._lookupGitHubToken();
    const repo = { owner: entry.owner, repo: entry.repo };
    const requestedRef = treeish.trim();
    const isFullSha = /^[0-9a-f]{40}$/i.test(requestedRef);
    const requestedSha = isFullSha ? requestedRef.toLowerCase() : await resolveGitHubRefToSha(this._requestService, repo, requestedRef, authToken, cancel);
    await this._materializeCommit(repoDir, entry, requestedSha, isFullSha ? entry.ref : requestedRef, authToken, cancel);
  }
  async checkoutCommit(repoDir, commit, token) {
    const expectedCommit = commit.trim().toLowerCase();
    if (!/^[0-9a-f]{40}$/.test(expectedCommit)) {
      throw new Error(localize(11353, null, commit));
    }
    const entry = this._getCacheEntry(repoDir);
    if (!entry) {
      throw new Error(`Cannot checkout plugin: no cached metadata for ${repoDir.toString()}`);
    }
    if (entry.sha.toLowerCase() === expectedCommit) {
      return;
    }
    const cancel = token ?? CancellationToken.None;
    const authToken = await this._lookupGitHubToken();
    const repo = { owner: entry.owner, repo: entry.repo };
    const resolvedCommit = (await resolveGitHubRefToSha(this._requestService, repo, expectedCommit, authToken, cancel)).toLowerCase();
    if (resolvedCommit !== expectedCommit) {
      throw new Error(localize(11355, null, commit, resolvedCommit));
    }
    await this._materializeCommit(repoDir, entry, resolvedCommit, entry.ref, authToken, cancel);
    const checkedOutCommit = (await this.revParse(repoDir, "HEAD")).toLowerCase();
    if (checkedOutCommit !== expectedCommit) {
      throw new Error(localize(11354, null, commit, checkedOutCommit));
    }
  }
  async revParse(repoDir, ref) {
    const entry = this._getCacheEntry(repoDir);
    if (!entry) {
      throw new Error(`Cannot resolve ref: no cached metadata for ${repoDir.toString()}`);
    }
    const trimmed = ref.trim();
    const isFullSha = /^[0-9a-f]{40}$/i.test(trimmed);
    if (isFullSha && trimmed.toLowerCase() !== entry.sha.toLowerCase()) {
      throw new Error(`Cannot resolve ref '${ref}' in tree-cached plugin: only HEAD/${entry.sha} is materialised`);
    }
    return entry.sha;
  }
  async fetch(_repoDir, _token) {
  }
  async fetchRepository(_repoDir, _token) {
  }
  async revListCount(_repoDir, _fromRef, _toRef) {
    return 0;
  }
  // -- helpers --------------------------------------------------------------
  async _materializeCommit(repoDir, entry, commit, ref, authToken, token) {
    if (commit === entry.sha.toLowerCase()) {
      return;
    }
    const repo = { owner: entry.owner, repo: entry.repo };
    try {
      await fetchAndExtractGitHubRepo(this._requestService, this._fileService, this._logService, repo, commit, repoDir, authToken, token);
      this._setCacheEntry(repoDir, {
        ...entry,
        ref,
        sha: commit,
        fetchedAt: Date.now()
      });
    } catch (err) {
      this._maybeLogTransientError(err, repo);
      throw err;
    }
  }
  _parseOrThrow(cloneUrl) {
    const parsed = parseGitHubCloneUrl(cloneUrl);
    if (!parsed) {
      throw new Error(localize(
        11352,
        null,
        cloneUrl
      ));
    }
    return parsed;
  }
  _maybeLogTransientError(err, repo) {
    if (err instanceof GitHubAuthRequiredError) {
      this._logService.warn(`[BrowserPluginGitCommandService] GitHub auth required for ${repo.owner}/${repo.repo}: ${err.message}`);
    } else if (err instanceof GitHubRateLimitError) {
      const wait2 = err.retryAfterSeconds !== void 0 ? ` (retry after ${err.retryAfterSeconds}s)` : "";
      this._logService.warn(`[BrowserPluginGitCommandService] GitHub rate limit hit for ${repo.owner}/${repo.repo}${wait2}: ${err.message}`);
    } else if (err instanceof Error) {
      const cause = err.cause instanceof Error ? ` (cause: ${err.cause.name}: ${err.cause.message})` : "";
      this._logService.error(`[BrowserPluginGitCommandService] Clone failed for ${repo.owner}/${repo.repo}: ${err.message}${cause}`);
    }
  }
  /**
   * Best-effort silent lookup of an existing GitHub session token. Returns
   * `undefined` when no session is available; callers fall back to anonymous,
   * which still works for public repos. Prefers a `repo`-scoped session when
   * multiple are present (e.g. EMU + personal).
   */
  async _lookupGitHubToken() {
    try {
      const sessions = await this._authenticationService.getSessions("github", [], { silent: true });
      if (sessions.length === 0) {
        return void 0;
      }
      const repoScopeSession = sessions.find((session) => session.scopes.includes("repo"));
      return repoScopeSession?.accessToken ?? sessions[0].accessToken;
    } catch (err) {
      this._logService.trace("[BrowserPluginGitCommandService] Silent GitHub session lookup failed:", err);
      return void 0;
    }
  }
  async _requestGitHubToken(repo) {
    try {
      const session = await this._authenticationService.createSession("github", ["repo"], { activateImmediate: true });
      return session.accessToken;
    } catch (err) {
      this._logService.trace("[BrowserPluginGitCommandService] GitHub session request failed:", err);
      throw new Error(localize(
        11351,
        null,
        `${repo.owner}/${repo.repo}`
      ));
    }
  }
  // -- metadata cache (IStorageService) -------------------------------------
  _cacheKey(targetDir) {
    return getComparisonKey(targetDir, true);
  }
  async _pruneStaleEntries(cache2, knownDirs) {
    const removed = [];
    await Promise.all(Array.from(knownDirs, async ([key3, uri5]) => {
      try {
        if (!await this._fileService.exists(uri5)) {
          removed.push(key3);
        }
      } catch {
      }
    }));
    if (removed.length === 0) {
      return;
    }
    for (const key3 of removed) {
      cache2.delete(key3);
    }
    this._logService.trace(`[BrowserPluginGitCommandService] Pruned ${removed.length} stale cache entries`);
    this._persistCache();
  }
  _ensureCacheLoaded() {
    if (this._cache) {
      return this._cache;
    }
    const cache2 = /* @__PURE__ */ new Map();
    const stored = this._storageService.getObject(BROWSER_CACHE_STORAGE_KEY, -1 /* APPLICATION */);
    const knownDirs = /* @__PURE__ */ new Map();
    if (stored) {
      for (const [key3, entry] of Object.entries(stored)) {
        if (entry && typeof entry.sha === "string" && typeof entry.owner === "string" && typeof entry.repo === "string") {
          cache2.set(key3, {
            owner: entry.owner,
            repo: entry.repo,
            ref: typeof entry.ref === "string" ? entry.ref : void 0,
            sha: entry.sha,
            fetchedAt: typeof entry.fetchedAt === "number" ? entry.fetchedAt : 0
          });
          try {
            knownDirs.set(key3, URI.parse(key3));
          } catch {
            cache2.delete(key3);
          }
        }
      }
    }
    this._cache = cache2;
    if (knownDirs.size > 0) {
      this._pruneStaleEntries(cache2, knownDirs).catch((err) => {
        this._logService.trace("[BrowserPluginGitCommandService] Cache prune failed:", err);
      });
    }
    return cache2;
  }
  _getCacheEntry(targetDir) {
    return this._ensureCacheLoaded().get(this._cacheKey(targetDir));
  }
  _setCacheEntry(targetDir, entry) {
    const cache2 = this._ensureCacheLoaded();
    cache2.set(this._cacheKey(targetDir), entry);
    this._persistCache();
  }
  _persistCache() {
    if (!this._cache) {
      return;
    }
    const serialized = {};
    for (const [key3, entry] of this._cache) {
      serialized[key3] = entry;
    }
    if (Object.keys(serialized).length === 0) {
      this._storageService.remove(BROWSER_CACHE_STORAGE_KEY, -1 /* APPLICATION */);
      return;
    }
    this._storageService.store(BROWSER_CACHE_STORAGE_KEY, JSON.stringify(serialized), -1 /* APPLICATION */, 1 /* MACHINE */);
  }
};

BrowserPluginGitCommandService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IRequestService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IAuthenticationService)
], BrowserPluginGitCommandService);
export { BROWSER_CACHE_STORAGE_KEY, BrowserPluginGitCommandService };
