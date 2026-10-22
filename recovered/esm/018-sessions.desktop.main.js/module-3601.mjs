// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/models/githubIssueModel.ts
import { Disposable, DisposableSet, ReferenceCollection, toDisposable } from "./module-0012.mjs";
import { LRUCache } from "./module-0008.mjs";
import { GitHubIssueFetcher } from "./module-3600.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { observableValue } from "./module-0048.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";


// src/vs/sessions/contrib/github/browser/models/githubIssueModel.ts
var LOG_PREFIX7 = "[GitHubIssueModel]";

var MIN_REFRESH_INTERVAL_MS = 6e4;

var DEFAULT_POLL_INTERVAL_MS4 = 9e5;

var MAX_CACHED_SNAPSHOTS = 100;

var GitHubIssueModelReferenceCollection = class extends ReferenceCollection {
  constructor(apiClient, _logService) {
    super();
    this._logService = _logService;
    /**
     * Revalidation state of issues whose model has been disposed, keyed like the
     * collection itself. Session switches and list re-renders release the last reference
     * to an issue model routinely; without this the next model would start cold and spend
     * a full, rate-limited request re-fetching a payload that almost never changed.
     */
    this._snapshots = new LRUCache(MAX_CACHED_SNAPSHOTS);
    this._fetcher = new GitHubIssueFetcher(apiClient);
  }
  createReferencedObject(key3, owner, repo, issueNumber) {
    const model = new GitHubIssueModel(owner, repo, issueNumber, this._fetcher, this._logService);
    const snapshot = this._snapshots.get(key3);
    if (snapshot) {
      model.restore(snapshot);
    }
    return model;
  }
  destroyReferencedObject(key3, object2) {
    const snapshot = object2.snapshot();
    if (snapshot) {
      this._snapshots.set(key3, snapshot);
    }
    object2.dispose();
  }
};

GitHubIssueModelReferenceCollection = __decorateClass([
  __decorateParam(1, ILogService)
], GitHubIssueModelReferenceCollection);

var GitHubIssueModel = class extends Disposable {
  constructor(owner, repo, issueNumber, _fetcher, _logService) {
    super();
    this.owner = owner;
    this.repo = repo;
    this.issueNumber = issueNumber;
    this._fetcher = _fetcher;
    this._logService = _logService;
    this._etag = void 0;
    this._issue = observableValue(this, void 0);
    this.issue = this._issue;
    this._refreshPromise = void 0;
    /** When the last request completed (whether it returned `200` or `304`). */
    this._refreshedAt = void 0;
    this._pollingDisposables = this._register(new DisposableSet());
    this._pollScheduler = this._register(new RunOnceScheduler(() => this._poll(), DEFAULT_POLL_INTERVAL_MS4));
  }
  /** Adopts the revalidation state of an earlier model for the same issue. */
  restore(snapshot) {
    this._etag = snapshot.etag;
    this._refreshedAt = snapshot.refreshedAt;
    if (snapshot.issue) {
      this._issue.set(snapshot.issue, void 0);
    }
  }
  /** The revalidation state to hand to the next model for this issue, if any. */
  snapshot() {
    return this._refreshedAt !== void 0 ? { etag: this._etag, issue: this._issue.get(), refreshedAt: this._refreshedAt } : void 0;
  }
  /**
   * Revalidates the issue, unless the last request completed less than
   * {@link MIN_REFRESH_INTERVAL_MS} ago.
   */
  refresh() {
    if (this._refreshedAt !== void 0 && Date.now() - this._refreshedAt < MIN_REFRESH_INTERVAL_MS) {
      return Promise.resolve();
    }
    return this._refreshNow();
  }
  startPolling(intervalMs = DEFAULT_POLL_INTERVAL_MS4) {
    const disposable = toDisposable(() => {
      this._pollingDisposables.deleteAndDispose(disposable);
      if (this._pollingDisposables.size === 0) {
        this._pollScheduler.cancel();
      }
    });
    this._pollingDisposables.add(disposable);
    if (this._pollingDisposables.size === 1) {
      this._pollScheduler.schedule(intervalMs);
    }
    return disposable;
  }
  _refreshNow() {
    if (!this._refreshPromise) {
      this._refreshPromise = this._refresh().finally(() => {
        this._refreshPromise = void 0;
      });
    }
    return this._refreshPromise;
  }
  async _poll() {
    await this._refreshNow();
    if (!this._store.isDisposed && this._pollingDisposables.size > 0) {
      this._pollScheduler.schedule();
    }
  }
  async _refresh() {
    try {
      const response = await this._fetcher.getIssue(this.owner, this.repo, this.issueNumber, this._etag);
      this._refreshedAt = Date.now();
      if (response.statusCode === 200 && response.data) {
        this._etag = response.etag;
        this._issue.set(response.data, void 0);
      }
    } catch (err) {
      this._logService.error(`${LOG_PREFIX7} Failed to refresh issue ${this.owner}/${this.repo}#${this.issueNumber}:`, err);
    }
  }
};
export { LOG_PREFIX7, MIN_REFRESH_INTERVAL_MS, DEFAULT_POLL_INTERVAL_MS4, MAX_CACHED_SNAPSHOTS, GitHubIssueModelReferenceCollection, GitHubIssueModel };
