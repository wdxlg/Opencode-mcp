// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/models/githubPullRequestCIModel.ts
import { Disposable, ReferenceCollection, toDisposable } from "./module-0012.mjs";
import { GitHubPRCIFetcher, computeOverallCIStatus } from "./module-3598.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IStorageService } from "./module-0512.mjs";
import { observableValue } from "./module-0048.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";


// src/vs/sessions/contrib/github/browser/models/githubPullRequestCIModel.ts
var LOG_PREFIX6 = "[GitHubPullRequestCIModel]";

var TRACE_PREFIX4 = "[PR-ICON-TRACE]";

var DEFAULT_POLL_INTERVAL_MS3 = 6e4;

var STORAGE_KEY_FIX_REQUESTED = "sessions.ci.fixRequested";

var GitHubPullRequestCIModelReferenceCollection = class extends ReferenceCollection {
  constructor(apiClient, _logService, _storageService) {
    super();
    this._logService = _logService;
    this._storageService = _storageService;
    this._fetcher = new GitHubPRCIFetcher(apiClient);
  }
  createReferencedObject(key3, owner, repo, prNumber, headSha) {
    this._logService.trace(`${TRACE_PREFIX4} [GitHubPullRequestCIModelReferenceCollection][createReferencedObject] Creating CI model for ${key3}`);
    return new GitHubPullRequestCIModel(owner, repo, prNumber, headSha, this._fetcher, this._logService, this._storageService);
  }
  destroyReferencedObject(key3, object2) {
    this._logService.trace(`${TRACE_PREFIX4} [GitHubPullRequestCIModelReferenceCollection][destroyReferencedObject] Disposing CI model for ${key3}`);
    object2.dispose();
  }
};

GitHubPullRequestCIModelReferenceCollection = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, IStorageService)
], GitHubPullRequestCIModelReferenceCollection);

var GitHubPullRequestCIModel = class extends Disposable {
  constructor(owner, repo, prNumber, headSha, _fetcher, _logService, _storageService) {
    super();
    this.owner = owner;
    this.repo = repo;
    this.prNumber = prNumber;
    this.headSha = headSha;
    this._fetcher = _fetcher;
    this._logService = _logService;
    this._storageService = _storageService;
    this._checksEtag = void 0;
    this._checks = observableValue(this, []);
    this.checks = this._checks;
    this._overallStatus = observableValue(this, "neutral" /* Neutral */);
    this.overallStatus = this._overallStatus;
    this._fixRequested = observableValue(this, false);
    /**
     * Whether the user has already requested a CI fix for this PR head SHA.
     * Resets automatically once a new commit lands (a new model is created for
     * the new head SHA) so the "Fix Checks" action surfaces again.
     */
    this.fixRequested = this._fixRequested;
    this._refreshPromise = void 0;
    this._pollingClientCount = 0;
    this._prKey = `${owner}/${repo}/${prNumber}`;
    this._fixRequested.set(this._readFixRequested(), void 0);
    this._register(this._storageService.onDidChangeValue(0 /* PROFILE */, STORAGE_KEY_FIX_REQUESTED, this._store)(() => {
      this._fixRequested.set(this._readFixRequested(), void 0);
    }));
    this._pollScheduler = this._register(new RunOnceScheduler(() => this._poll(), DEFAULT_POLL_INTERVAL_MS3));
  }
  /**
   * Remember that the user requested a CI fix for the current head SHA so the
   * "Fix Checks" action is suppressed until a new commit lands on the PR.
   */
  markFixRequested() {
    const map = this._readFixRequestedMap();
    map.set(this._prKey, this.headSha);
    this._storageService.store(STORAGE_KEY_FIX_REQUESTED, JSON.stringify(Object.fromEntries(map)), 0 /* PROFILE */, 0 /* USER */);
    this._fixRequested.set(true, void 0);
  }
  _readFixRequested() {
    return this._readFixRequestedMap().get(this._prKey) === this.headSha;
  }
  _readFixRequestedMap() {
    const raw = this._storageService.get(STORAGE_KEY_FIX_REQUESTED, 0 /* PROFILE */);
    if (!raw) {
      return /* @__PURE__ */ new Map();
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return new Map(Object.entries(parsed).filter((entry) => typeof entry[1] === "string"));
      }
    } catch {
    }
    return /* @__PURE__ */ new Map();
  }
  /**
   * Refresh all CI check data.
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
    this._logService.trace(`${TRACE_PREFIX4} [CIModel] Refreshing CI for ${this.owner}/${this.repo}#${this.prNumber}@${this.headSha} (checksEtag ${this._checksEtag ?? "none"})`);
    try {
      const response = await this._fetcher.getCheckRuns(this.owner, this.repo, this.headSha, this._checksEtag);
      if (response.statusCode === 200 && response.data) {
        this._checksEtag = response.etag;
        this._checks.set(response.data, void 0);
        this._overallStatus.set(computeOverallCIStatus(response.data), void 0);
      }
      this._logService.trace(`${TRACE_PREFIX4} [CIModel] Refreshed CI for ${this.owner}/${this.repo}#${this.prNumber}@${this.headSha}: status ${response.statusCode}, ${this._checks.get().length} check(s), overallStatus ${this._overallStatus.get()}`);
    } catch (err) {
      this._logService.error(`${TRACE_PREFIX4} ${LOG_PREFIX6} Failed to refresh CI checks for ${this.owner}/${this.repo}#${this.prNumber}@${this.headSha}:`, err);
    }
  }
  /**
   * Get annotations (structured logs) for a specific check run.
   */
  async getCheckRunAnnotations(checkRunId) {
    return this._fetcher.getCheckRunAnnotations(this.owner, this.repo, checkRunId);
  }
  /**
   * Rerun a failed check by extracting the workflow run ID from its details URL
   * and calling the GitHub Actions rerun-failed-jobs API, then refresh status.
   */
  async rerunFailedCheck(check) {
    const runId = parseWorkflowRunId(check.detailsUrl);
    if (!runId) {
      this._logService.warn(`${LOG_PREFIX6} Cannot rerun check "${check.name}": no workflow run ID found in detailsUrl`);
      return;
    }
    await this._fetcher.rerunFailedJobs(this.owner, this.repo, runId);
    await this.refresh(true);
  }
  /**
   * Start periodic polling. Each cycle refreshes CI check data.
   */
  startPolling(intervalMs = DEFAULT_POLL_INTERVAL_MS3) {
    if (this._pollingClientCount++ === 0) {
      this._logService.trace(`${TRACE_PREFIX4} [CIModel] Start polling ${this.owner}/${this.repo}#${this.prNumber}@${this.headSha} every ${intervalMs}ms`);
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
    this._logService.trace(`${TRACE_PREFIX4} [CIModel] Poll cycle for ${this.owner}/${this.repo}#${this.prNumber}@${this.headSha}`);
    await this.refresh();
    if (!this._store.isDisposed && this._pollingClientCount > 0) {
      this._pollScheduler.schedule();
    }
  }
  dispose() {
    super.dispose();
  }
};

function parseWorkflowRunId(detailsUrl) {
  if (!detailsUrl) {
    return void 0;
  }
  const match2 = /\/actions\/runs\/(?<runId>\d+)/.exec(detailsUrl);
  const runId = match2?.groups?.runId;
  return runId ? parseInt(runId, 10) : void 0;
}
export { parseWorkflowRunId, LOG_PREFIX6, TRACE_PREFIX4, DEFAULT_POLL_INTERVAL_MS3, STORAGE_KEY_FIX_REQUESTED, GitHubPullRequestCIModelReferenceCollection, GitHubPullRequestCIModel };
