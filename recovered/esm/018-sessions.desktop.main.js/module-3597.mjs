// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/models/githubPullRequestReviewThreadsModel.ts
import { Disposable, ReferenceCollection, toDisposable } from "./module-0012.mjs";
import { GitHubPRFetcher } from "./module-3595.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { observableValue } from "./module-0048.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { transaction } from "./module-0045.mjs";


// src/vs/sessions/contrib/github/browser/models/githubPullRequestReviewThreadsModel.ts
var LOG_PREFIX5 = "[GitHubPullRequestReviewThreadsModel]";

var TRACE_PREFIX3 = "[PR-ICON-TRACE]";

var DEFAULT_POLL_INTERVAL_MS2 = 6e4;

var GitHubPullRequestReviewThreadsModelReferenceCollection = class extends ReferenceCollection {
  constructor(apiClient, _logService) {
    super();
    this._logService = _logService;
    this._fetcher = new GitHubPRFetcher(apiClient);
  }
  createReferencedObject(key3, owner, repo, prNumber) {
    this._logService.trace(`${TRACE_PREFIX3} [GitHubPullRequestReviewThreadsModelReferenceCollection][createReferencedObject] Creating PR review threads model for ${key3}`);
    return new GitHubPullRequestReviewThreadsModel(owner, repo, prNumber, this._fetcher, this._logService);
  }
  destroyReferencedObject(key3, object2) {
    this._logService.trace(`${TRACE_PREFIX3} [GitHubPullRequestReviewThreadsModelReferenceCollection][destroyReferencedObject] Disposing PR review threads model for ${key3}`);
    object2.dispose();
  }
};

GitHubPullRequestReviewThreadsModelReferenceCollection = __decorateClass([
  __decorateParam(1, ILogService)
], GitHubPullRequestReviewThreadsModelReferenceCollection);

var GitHubPullRequestReviewThreadsModel = class extends Disposable {
  constructor(owner, repo, prNumber, _fetcher, _logService) {
    super();
    this.owner = owner;
    this.repo = repo;
    this.prNumber = prNumber;
    this._fetcher = _fetcher;
    this._logService = _logService;
    this._reviewThreads = observableValue(this, []);
    this.reviewThreads = this._reviewThreads;
    this._hasLoaded = observableValue(this, false);
    this.hasLoaded = this._hasLoaded;
    this._initialRefreshCompleted = observableValue(this, false);
    this.initialRefreshCompleted = this._initialRefreshCompleted;
    this._refreshPromise = void 0;
    this._pollingClientCount = 0;
    this._pollScheduler = this._register(new RunOnceScheduler(() => this._poll(), DEFAULT_POLL_INTERVAL_MS2));
  }
  /**
   * Refresh review thread data.
   */
  refresh(force = false) {
    if (force && this._refreshPromise) {
      return this._refreshPromise.then(() => this.refresh(true));
    }
    if (force) {
      return this._refresh();
    }
    if (!this._refreshPromise) {
      this._refreshPromise = this._refresh().finally(() => {
        this._refreshPromise = void 0;
      });
    }
    return this._refreshPromise;
  }
  async _refresh() {
    this._logService.trace(`${TRACE_PREFIX3} [ReviewThreadsModel] Refreshing review threads for ${this.owner}/${this.repo}#${this.prNumber}`);
    try {
      const data = await this._fetcher.getReviewThreads(this.owner, this.repo, this.prNumber);
      transaction((tx) => {
        this._reviewThreads.set(data, tx);
        this._hasLoaded.set(true, tx);
        this._initialRefreshCompleted.set(true, tx);
      });
      const unresolved = data.filter((thread) => !thread.isResolved).length;
      this._logService.trace(`${TRACE_PREFIX3} [ReviewThreadsModel] Refreshed review threads for ${this.owner}/${this.repo}#${this.prNumber}: ${data.length} thread(s), ${unresolved} unresolved`);
    } catch (err) {
      this._initialRefreshCompleted.set(true, void 0);
      this._logService.error(`${TRACE_PREFIX3} ${LOG_PREFIX5} Failed to refresh threads for PR #${this.prNumber}:`, err);
    }
  }
  /**
   * Post a reply to an existing review thread and refresh threads.
   */
  async postReviewComment(body, inReplyTo) {
    const comment = await this._fetcher.postReviewComment(this.owner, this.repo, this.prNumber, body, inReplyTo);
    await this.refresh(true);
    return comment;
  }
  /**
   * Resolve a review thread and refresh the thread list.
   */
  async resolveThread(threadId) {
    await this._fetcher.resolveThread(this.owner, this.repo, threadId);
    await this.refresh(true);
  }
  /**
   * Start periodic polling. Each cycle refreshes review thread data.
   */
  startPolling(intervalMs = DEFAULT_POLL_INTERVAL_MS2) {
    if (this._pollingClientCount++ === 0) {
      this._logService.trace(`${TRACE_PREFIX3} [ReviewThreadsModel] Start polling ${this.owner}/${this.repo}#${this.prNumber} every ${intervalMs}ms`);
      this._pollScheduler.schedule(intervalMs);
    }
    return toDisposable(() => {
      if (this._store.isDisposed) {
        return;
      }
      if (--this._pollingClientCount === 0) {
        this._pollScheduler.cancel();
      }
    });
  }
  async _poll() {
    this._logService.trace(`${TRACE_PREFIX3} [ReviewThreadsModel] Poll cycle for ${this.owner}/${this.repo}#${this.prNumber}`);
    await this.refresh();
    if (!this._store.isDisposed && this._pollingClientCount > 0) {
      this._pollScheduler.schedule();
    }
  }
  dispose() {
    super.dispose();
  }
};
export { LOG_PREFIX5, TRACE_PREFIX3, DEFAULT_POLL_INTERVAL_MS2, GitHubPullRequestReviewThreadsModelReferenceCollection, GitHubPullRequestReviewThreadsModel };
