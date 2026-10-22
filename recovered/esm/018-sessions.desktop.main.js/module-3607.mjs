// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/githubService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { GitHubApiClient } from "./module-3591.mjs";
import { GitHubChangesFetcher } from "./module-3602.mjs";
import { GitHubRecentUserWorkFetcher } from "./module-3603.mjs";
import { GitHubPullRequestsFetcher } from "./module-3604.mjs";
import { GitHubPullRequestContextFetcher } from "./module-3605.mjs";
import { GitHubRepositoryModelReferenceCollection } from "./module-3593.mjs";
import { GitHubPullRequestModelReferenceCollection } from "./module-3596.mjs";
import { GitHubPullRequestReviewThreadsModelReferenceCollection } from "./module-3597.mjs";
import { GitHubPullRequestCIModelReferenceCollection } from "./module-3599.mjs";
import { GitHubIssueModelReferenceCollection } from "./module-3601.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { structuralEquals } from "./module-0042.mjs";
import { getPullRequestKey } from "./module-3606.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/github/browser/githubService.ts
var TRACE_PREFIX5 = "[PR-ICON-TRACE]";

var IGitHubService = createDecorator("sessionsGitHubService");

var GitHubService = class extends Disposable {
  constructor(instantiationService, sessionsService, _logService) {
    super();
    this._logService = _logService;
    /**
     * Cache of in-flight / resolved `findPullRequestNumberByHeadBranch`
     * lookups, keyed by `${owner}/${repo}#${branch}`. Promises are kept
     * indefinitely — PR-number assignment is monotonic for the lifetime of
     * a branch, and live PR state (open/closed/draft, CI) is refreshed via
     * `createPullRequestModelReference` once we know the number.
     */
    this._findPRByBranchCache = /* @__PURE__ */ new Map();
    const apiClient = this._register(instantiationService.createInstance(GitHubApiClient));
    this._apiClient = apiClient;
    this._changesFetcher = new GitHubChangesFetcher(apiClient);
    this._recentUserWorkFetcher = new GitHubRecentUserWorkFetcher(apiClient);
    this._pullRequestsFetcher = new GitHubPullRequestsFetcher(apiClient);
    this._pullRequestContextFetcher = new GitHubPullRequestContextFetcher(apiClient);
    this._repositoryReferences = instantiationService.createInstance(GitHubRepositoryModelReferenceCollection, apiClient);
    this._pullRequestReferences = instantiationService.createInstance(GitHubPullRequestModelReferenceCollection, apiClient);
    this._pullRequestReviewThreadsReferences = instantiationService.createInstance(GitHubPullRequestReviewThreadsModelReferenceCollection, apiClient);
    this._pullRequestCIReferences = instantiationService.createInstance(GitHubPullRequestCIModelReferenceCollection, apiClient);
    this._issueReferences = instantiationService.createInstance(GitHubIssueModelReferenceCollection, apiClient);
    const gitHubInfoObs = derivedOpts(
      { equalsFn: structuralEquals },
      (reader) => {
        const gitHubInfo = sessionsService.activeSession.read(reader)?.workspace.read(reader)?.folders[0]?.gitRepository?.gitHubInfo.read(reader);
        if (!gitHubInfo?.pullRequest) {
          return void 0;
        }
        return {
          owner: gitHubInfo.owner,
          repo: gitHubInfo.repo,
          pullRequestNumber: gitHubInfo.pullRequest.number
        };
      }
    );
    this.activeSessionPullRequestObs = derived((reader) => {
      const gitHubInfo = gitHubInfoObs.read(reader);
      if (!gitHubInfo) {
        return void 0;
      }
      const prModelRef = this.createPullRequestModelReference(gitHubInfo.owner, gitHubInfo.repo, gitHubInfo.pullRequestNumber);
      reader.store.add(prModelRef);
      return prModelRef.object;
    });
    const pullRequestInfoObs = derivedOpts(
      { equalsFn: structuralEquals },
      (reader) => {
        const pullRequest = this.activeSessionPullRequestObs.read(reader);
        const pullRequestDetails = pullRequest?.pullRequest.read(reader);
        if (!pullRequest || !pullRequestDetails) {
          return void 0;
        }
        return {
          owner: pullRequest.owner,
          repo: pullRequest.repo,
          prNumber: pullRequest.prNumber,
          headSha: pullRequestDetails.headSha
        };
      }
    );
    this.activeSessionPullRequestCIObs = derived((reader) => {
      const pullRequestInfo = pullRequestInfoObs.read(reader);
      if (!pullRequestInfo) {
        return void 0;
      }
      const prModelRef = this.createPullRequestCIModelReference(pullRequestInfo.owner, pullRequestInfo.repo, pullRequestInfo.prNumber, pullRequestInfo.headSha);
      reader.store.add(prModelRef);
      return prModelRef.object;
    });
    this.activeSessionPullRequestReviewThreadsObs = derived((reader) => {
      const gitHubInfo = gitHubInfoObs.read(reader);
      if (!gitHubInfo) {
        return void 0;
      }
      const reviewThreadsModelRef = this.createPullRequestReviewThreadsModelReference(gitHubInfo.owner, gitHubInfo.repo, gitHubInfo.pullRequestNumber);
      reader.store.add(reviewThreadsModelRef);
      return reviewThreadsModelRef.object;
    });
  }
  get enterpriseHost() {
    return this._apiClient.enterpriseHost;
  }
  createRepositoryModelReference(owner, repo) {
    return this._repositoryReferences.acquire(`${owner}/${repo}`, owner, repo);
  }
  createPullRequestModelReference(owner, repo, prNumber) {
    return this._pullRequestReferences.acquire(getPullRequestKey(owner, repo, prNumber), owner, repo, prNumber);
  }
  createPullRequestReviewThreadsModelReference(owner, repo, prNumber) {
    return this._pullRequestReviewThreadsReferences.acquire(getPullRequestKey(owner, repo, prNumber), owner, repo, prNumber);
  }
  createPullRequestCIModelReference(owner, repo, prNumber, headSha) {
    return this._pullRequestCIReferences.acquire(`${getPullRequestKey(owner, repo, prNumber)}/${headSha}`, owner, repo, prNumber, headSha);
  }
  createIssueModelReference(owner, repo, issueNumber) {
    return this._issueReferences.acquire(`${owner}/${repo}/issues/${issueNumber}`, owner, repo, issueNumber);
  }
  getRecentAssignedIssues(owner, repo, token) {
    return this._recentUserWorkFetcher.getRecentAssignedIssues(owner, repo, token);
  }
  getRecentAuthoredPullRequests(owner, repo, token) {
    return this._recentUserWorkFetcher.getRecentAuthoredPullRequests(owner, repo, token);
  }
  getPullRequestReviewThreads(owner, repo, pullRequestNumber, token) {
    return this._recentUserWorkFetcher.getPullRequestReviewThreads(owner, repo, pullRequestNumber, token);
  }
  getIssuesWithLinkedPullRequests(owner, repo, issueNumbers, token) {
    return this._recentUserWorkFetcher.getIssuesWithLinkedPullRequests(owner, repo, issueNumbers, token);
  }
  getChangedFiles(owner, repo, base, head) {
    return this._changesFetcher.getChangedFiles(owner, repo, base, head);
  }
  getPullRequests(owner, repo, cursor) {
    return this._pullRequestsFetcher.getPullRequests(owner, repo, cursor);
  }
  getPullRequestsWaitingForReview(owner, repo) {
    return this._pullRequestsFetcher.getPullRequestsWaitingForReview(owner, repo);
  }
  getPullRequestsAssignedToViewer(owner, repo) {
    return this._pullRequestsFetcher.getPullRequestsAssignedToViewer(owner, repo);
  }
  getPullRequestContext(owner, repo, number) {
    return this._pullRequestContextFetcher.getPullRequestContext(owner, repo, number);
  }
  findPullRequestNumberByHeadBranch(owner, repo, branch) {
    const key3 = `${owner}/${repo}#${branch}`;
    let promise = this._findPRByBranchCache.get(key3);
    if (!promise) {
      this._logService.trace(`${TRACE_PREFIX5} [GitHubService] findPullRequestNumberByHeadBranch cache MISS for ${key3}; starting lookup`);
      promise = this._fetchPullRequestNumberByHeadBranch(owner, repo, branch);
      this._findPRByBranchCache.set(key3, promise);
      promise.then(
        (value2) => {
          if (typeof value2 !== "number") {
            this._logService.trace(`${TRACE_PREFIX5} [GitHubService] findPullRequestNumberByHeadBranch for ${key3} resolved with NO pr number; dropping cache entry so a later call retries`);
            this._findPRByBranchCache.delete(key3);
          } else {
            this._logService.trace(`${TRACE_PREFIX5} [GitHubService] findPullRequestNumberByHeadBranch for ${key3} resolved PR #${value2}; caching indefinitely`);
          }
        },
        (err) => {
          this._logService.trace(`${TRACE_PREFIX5} [GitHubService] findPullRequestNumberByHeadBranch for ${key3} FAILED; dropping cache entry.`, err);
          this._findPRByBranchCache.delete(key3);
        }
      );
    } else {
      this._logService.trace(`${TRACE_PREFIX5} [GitHubService] findPullRequestNumberByHeadBranch cache HIT for ${key3}`);
    }
    return promise.catch(() => void 0);
  }
  async _fetchPullRequestNumberByHeadBranch(owner, repo, branch) {
    const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?head=${encodeURIComponent(`${owner}:${branch}`)}&state=all&sort=updated&direction=desc&per_page=1`;
    this._logService.trace(`${TRACE_PREFIX5} [GitHubService] Fetching PR number for head ${owner}:${branch} via GET ${path}`);
    const response = await this._apiClient.request(
      "GET",
      path,
      "githubApi.findPullRequestByHeadBranch"
    );
    const first2 = response.data?.[0];
    this._logService.trace(`${TRACE_PREFIX5} [GitHubService] PR number lookup for ${owner}:${branch} -> ${first2 ? `#${first2.number}` : "no match"} (status ${response.statusCode}, ${response.data?.length ?? 0} result(s))`);
    return first2 ? first2.number : void 0;
  }
};

GitHubService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, ILogService)
], GitHubService);
export { TRACE_PREFIX5, IGitHubService, GitHubService };
