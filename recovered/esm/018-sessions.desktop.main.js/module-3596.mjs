// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/models/githubPullRequestModel.ts
import { Disposable, DisposableSet, ReferenceCollection, toDisposable } from "./module-0012.mjs";
import { GitHubPRFetcher, computeMergeability } from "./module-3595.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { observableValue } from "./module-0048.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { transaction } from "./module-0045.mjs";


// src/vs/sessions/contrib/github/browser/models/githubPullRequestModel.ts
var LOG_PREFIX4 = "[GitHubPullRequestModel]";

var TRACE_PREFIX2 = "[PR-ICON-TRACE]";

var DEFAULT_POLL_INTERVAL_MS = 6e4;

var GitHubPullRequestModelReferenceCollection = class extends ReferenceCollection {
  constructor(apiClient, _logService) {
    super();
    this._logService = _logService;
    this._fetcher = new GitHubPRFetcher(apiClient);
  }
  createReferencedObject(key3, owner, repo, prNumber) {
    this._logService.trace(`${TRACE_PREFIX2} [GitHubPullRequestModelReferenceCollection][createReferencedObject] Creating PR model for ${key3}`);
    return new GitHubPullRequestModel(owner, repo, prNumber, this._fetcher, this._logService);
  }
  destroyReferencedObject(key3, object2) {
    this._logService.trace(`${TRACE_PREFIX2} [GitHubPullRequestModelReferenceCollection][destroyReferencedObject] Disposing PR model for ${key3}`);
    object2.dispose();
  }
};

GitHubPullRequestModelReferenceCollection = __decorateClass([
  __decorateParam(1, ILogService)
], GitHubPullRequestModelReferenceCollection);

var GitHubPullRequestModel = class extends Disposable {
  constructor(owner, repo, prNumber, _fetcher, _logService) {
    super();
    this.owner = owner;
    this.repo = repo;
    this.prNumber = prNumber;
    this._fetcher = _fetcher;
    this._logService = _logService;
    this._pullRequestEtag = void 0;
    this._pullRequest = observableValue(this, void 0);
    this.pullRequest = this._pullRequest;
    this._reviewsEtag = void 0;
    this._reviews = observableValue(this, void 0);
    this.reviews = this._reviews;
    this._mergeability = observableValue(this, void 0);
    this.mergeability = this._mergeability;
    this._refreshPromise = void 0;
    this._pollingDisposables = this._register(new DisposableSet());
    this._pollScheduler = this._register(new RunOnceScheduler(() => this._poll(), DEFAULT_POLL_INTERVAL_MS));
  }
  /**
   * Refresh all PR data: pull request info, and mergeability.
   */
  refresh() {
    if (!this._refreshPromise) {
      this._refreshPromise = this._refresh().finally(() => {
        this._refreshPromise = void 0;
      });
    }
    return this._refreshPromise;
  }
  /**
   * Post a top-level issue comment on the PR.
   */
  async postIssueComment(body) {
    return this._fetcher.postIssueComment(this.owner, this.repo, this.prNumber, body);
  }
  /**
   * Start periodic polling. Each cycle refreshes all PR data.
   */
  startPolling(intervalMs = DEFAULT_POLL_INTERVAL_MS) {
    const disposable = toDisposable(() => {
      this._pollingDisposables.deleteAndDispose(disposable);
      if (this._pollingDisposables.size === 0) {
        this._pollScheduler.cancel();
      }
    });
    this._pollingDisposables.add(disposable);
    if (this._pollingDisposables.size === 1) {
      this._logService.trace(`${TRACE_PREFIX2} [PRModel] Start polling ${this.owner}/${this.repo}#${this.prNumber} every ${intervalMs}ms`);
      this._pollScheduler.schedule(intervalMs);
    }
    return disposable;
  }
  async _poll() {
    this._logService.trace(`${TRACE_PREFIX2} [PRModel] Poll cycle for ${this.owner}/${this.repo}#${this.prNumber}`);
    await this.refresh();
    if (!this._store.isDisposed && this._pollingDisposables.size > 0) {
      this._pollScheduler.schedule();
    }
  }
  async _refresh() {
    this._logService.trace(`${TRACE_PREFIX2} [PRModel] Refreshing ${this.owner}/${this.repo}#${this.prNumber} (prEtag ${this._pullRequestEtag ?? "none"}, reviewsEtag ${this._reviewsEtag ?? "none"})`);
    try {
      const [pr, reviews] = await Promise.all([
        this._fetcher.getPullRequest(this.owner, this.repo, this.prNumber, this._pullRequestEtag),
        this._fetcher.getReviews(this.owner, this.repo, this.prNumber, this._reviewsEtag)
      ]);
      transaction((tx) => {
        if (pr.statusCode === 200 && pr.data) {
          this._pullRequestEtag = pr.etag;
          this._pullRequest.set(pr.data, tx);
        }
        if (reviews.statusCode === 200 && reviews.data) {
          this._reviewsEtag = reviews.etag;
          this._reviews.set(reviews.data, tx);
        }
        if (pr.statusCode === 200 || reviews.statusCode === 200) {
          const prData = pr.data ?? this._pullRequest.get();
          const reviewsData = reviews.data ?? this._reviews.get();
          if (prData && reviewsData) {
            const mergeability = computeMergeability(prData, reviewsData);
            this._mergeability.set(mergeability, tx);
          }
        }
      });
      const current = this._pullRequest.get();
      this._logService.trace(`${TRACE_PREFIX2} [PRModel] Refreshed ${this.owner}/${this.repo}#${this.prNumber}: prStatus ${pr.statusCode}, reviewsStatus ${reviews.statusCode}, state ${current?.state ?? "unknown"}, isDraft ${current?.isDraft ?? "unknown"}, headSha ${current?.headSha ?? "unknown"}`);
    } catch (err) {
      this._logService.error(`${TRACE_PREFIX2} ${LOG_PREFIX4} Failed to refresh PR #${this.prNumber}:`, err);
    }
  }
  dispose() {
    super.dispose();
  }
};
export { LOG_PREFIX4, TRACE_PREFIX2, DEFAULT_POLL_INTERVAL_MS, GitHubPullRequestModelReferenceCollection, GitHubPullRequestModel };
