// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostGitStateService.ts
import { Disposable, toDisposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { SequencerByKey, ThrottlerByKey, timeout } from "./module-0027.mjs";
import { CancellationTokenSource } from "./module-0017.mjs";
import { getSessionRelatedPullRequestUrls, readSessionGitHubState, readSessionGitState, readSessionSourceControlState, withInitialSessionPullRequest, withMostRecentSessionPullRequest, withSessionGitHubState, withSessionGitState, withSessionSourceControlState } from "./module-0047.mjs";
import { IAgentHostGitService, META_DIFF_BASE_BRANCH, parseUpstreamBranchName, resolveDiffBaseBranchName } from "./module-0162.mjs";
import { URI } from "./module-0023.mjs";
import { equals2 } from "./module-0035.mjs";
import { isCancellationError } from "./module-0002.mjs";
import { META_GITHUB_STATE, META_GIT_STATE, META_SOURCE_CONTROL_STATE } from "./module-0445.mjs";
import { isEqual2 } from "./module-0025.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IAgentHostOctoKitService } from "./module-0524.mjs";
import { IAgentHostAuthenticationService } from "./module-0201.mjs";
import { IAgentHostGitHubEndpointService } from "./module-0161.mjs";
import { ILogService } from "./module-0084.mjs";
import { ISessionDataService } from "./module-0139.mjs";


// src/vs/platform/agentHost/node/agentHostGitStateService.ts
var PULL_REQUEST_CREATION_CLOCK_SKEW_MS = 5 * 6e4;

var AgentHostGitStateService = class extends Disposable {
  constructor(_stateManager, _gitService, _octoKitService, _authenticationService, _gitHubEndpointService, _logService, _sessionDataService) {
    super();
    this._stateManager = _stateManager;
    this._gitService = _gitService;
    this._octoKitService = _octoKitService;
    this._authenticationService = _authenticationService;
    this._gitHubEndpointService = _gitHubEndpointService;
    this._logService = _logService;
    this._sessionDataService = _sessionDataService;
    this._onDidRefreshSessionGitState = this._register(new Emitter());
    this.onDidRefreshSessionGitState = this._onDidRefreshSessionGitState.event;
    this._onDidChangeSessionGitHubState = this._register(new Emitter());
    this.onDidChangeSessionGitHubState = this._onDidChangeSessionGitHubState.event;
    this._gitStateRefreshThrottler = this._register(new ThrottlerByKey());
    this._gitStateRefreshCancellationTokenSource = new CancellationTokenSource();
    /**
     * Serializes pull request lookups per session so overlapping triggers (turn
     * completion, session restore, a refresh observing a branch change) issue at
     * most one GitHub request at a time and observe each other's writes.
     */
    this._pullRequestSequencer = new SequencerByKey();
    this._pullRequestAbortController = new AbortController();
    this._register(toDisposable(() => this._gitStateRefreshCancellationTokenSource.dispose(true)));
    this._register(toDisposable(() => this._pullRequestAbortController.abort()));
  }
  async attachSessionGitHubPullRequest(sessionKey, workingDirectory) {
    await this.refreshSessionGitState(sessionKey, workingDirectory);
    await this._queuePullRequestLookup(sessionKey);
  }
  /**
   * Queues a pull request lookup on the session's sequencer so overlapping
   * triggers (turn completion, session restore, a refresh observing a branch
   * change) issue at most one GitHub request at a time.
   */
  _queuePullRequestLookup(sessionKey) {
    return this._pullRequestSequencer.queue(sessionKey, () => this._attachSessionGitHubPullRequest(sessionKey));
  }
  async _attachSessionGitHubPullRequest(sessionKey) {
    const state = this._stateManager.getSessionState(sessionKey);
    if (!state) {
      return;
    }
    if (state.lifecycle !== "ready" /* Ready */) {
      return;
    }
    const gitHubState = readSessionGitHubState(this._stateManager.getSessionState(sessionKey)?._meta);
    if (!gitHubState?.owner || !gitHubState?.repo) {
      return;
    }
    const gitState = readSessionGitState(state._meta);
    const branchName = gitState?.branchName;
    if (!branchName || branchName === gitState?.baseBranchName) {
      return;
    }
    if (gitHubState.pullRequestBranchName === branchName) {
      return;
    }
    try {
      const repoResource = this._gitHubEndpointService.getRepoResource();
      const authToken = this._authenticationService.getAuthToken({
        resource: repoResource.resource,
        scopes: repoResource.scopes_supported
      });
      if (!authToken) {
        return;
      }
      const pr = await this._findPullRequestForCheckout(state, gitHubState.owner, gitHubState.repo, gitState, branchName, authToken);
      const currentBranchName = readSessionGitState(this._stateManager.getSessionState(sessionKey)?._meta)?.branchName;
      if (currentBranchName !== branchName) {
        return;
      }
      const currentState = this._stateManager.getSessionState(sessionKey);
      if (!currentState) {
        return;
      }
      const currentGitHubState = readSessionGitHubState(currentState._meta);
      if (!pr?.url) {
        if (this._isFolderSession(currentState, currentGitHubState) && currentGitHubState?.initialPullRequestUrls === void 0) {
          await this.setSessionGitHubState(sessionKey, withInitialSessionPullRequest(currentGitHubState));
        }
        this._logService.trace(`[AgentHostGitStateService][attachSessionGitHubPullRequest] No pull request found for ${sessionKey} on branch ${branchName}`);
        return;
      }
      let nextGitHubState = withMostRecentSessionPullRequest(currentGitHubState, pr.url, branchName);
      if (this._shouldAddToFolderBaseline(sessionKey, currentState, currentGitHubState, pr)) {
        nextGitHubState = {
          ...nextGitHubState,
          ...withInitialSessionPullRequest(currentGitHubState, pr.url)
        };
      } else if (this._isFolderSession(currentState, currentGitHubState) && currentGitHubState?.initialPullRequestUrls === void 0) {
        nextGitHubState = {
          ...nextGitHubState,
          ...withInitialSessionPullRequest(currentGitHubState)
        };
      }
      await this.setSessionGitHubState(sessionKey, nextGitHubState);
    } catch (error) {
      this._logService.warn(`[AgentHostGitStateService][attachSessionGitHubPullRequest] Failed to find pull request for ${sessionKey}`, error);
    }
  }
  _shouldAddToFolderBaseline(sessionKey, state, gitHubState, pullRequest) {
    if (!this._isFolderSession(state, gitHubState) || getSessionRelatedPullRequestUrls(gitHubState).some((url2) => url2.toLowerCase() === pullRequest.url.toLowerCase())) {
      return false;
    }
    if (pullRequest.createdAt !== void 0) {
      const sessionStart = Date.parse(this._stateManager.getSessionSummary(sessionKey)?.createdAt ?? "");
      return Number.isNaN(sessionStart) || pullRequest.createdAt < sessionStart - PULL_REQUEST_CREATION_CLOCK_SKEW_MS;
    }
    return gitHubState?.initialPullRequestUrls === void 0;
  }
  _isFolderSession(state, gitHubState) {
    return state.config?.values["isolation" /* Isolation */] === "folder" || gitHubState?.initialPullRequestUrls !== void 0;
  }
  /**
   * Resolves the pull request of the branch that is currently checked out,
   * preferring the remote head branch and falling back to the commit at HEAD
   * for local branches whose name never reached the remote.
   */
  async _findPullRequestForCheckout(state, owner, repo, gitState, branchName, authToken) {
    const signal = this._pullRequestAbortController.signal;
    const githubHeadOwner = gitState?.githubHeadOwner;
    const upstreamBranch = githubHeadOwner ? parseUpstreamBranchName(gitState?.upstreamBranchName) : void 0;
    const headBranch = upstreamBranch?.branch ?? branchName;
    const headOwner = githubHeadOwner ?? owner;
    const pullRequestByBranch = await this._octoKitService.findPullRequestByHeadBranch(owner, repo, headBranch, authToken, signal, headOwner);
    if (pullRequestByBranch) {
      return pullRequestByBranch;
    }
    const workingDirectory = state.workingDirectories?.[0];
    if (!workingDirectory) {
      return void 0;
    }
    const headSha = await this._gitService.revParse(URI.parse(workingDirectory), "HEAD");
    return headSha ? this._octoKitService.findPullRequestByHeadSha(owner, repo, headSha, authToken, signal) : void 0;
  }
  async refreshSessionGitState(sessionKey, workingDirectory) {
    const sessionState = this._stateManager.getSessionState(sessionKey);
    if (sessionState?.lifecycle === "failed" /* Failed */) {
      return;
    }
    if (!workingDirectory) {
      const workingDirectoryStr = sessionState?.workingDirectories?.[0];
      if (workingDirectoryStr) {
        workingDirectory = URI.parse(workingDirectoryStr);
      }
    }
    if (!workingDirectory) {
      return;
    }
    await this._gitStateRefreshThrottler.queue(sessionKey, async () => {
      try {
        this._logService.trace(`[AgentHostGitStateService][refreshSessionGitState] Refreshing git state for ${sessionKey}, ${workingDirectory?.fsPath}`);
        const baseBranchName = await this.resolveSessionBaseBranchName(sessionKey);
        const gitState = await this._gitService.getSessionGitState(workingDirectory, baseBranchName);
        if (gitState) {
          const currentMeta = this._stateManager.getSessionState(sessionKey)?._meta;
          const previousGitState = readSessionGitState(currentMeta);
          const gitStateChanged = !equals2(previousGitState, gitState);
          if (gitStateChanged) {
            await this._setSessionGitState(sessionKey, gitState);
          }
          if (gitState.githubOwner && gitState.githubRepo) {
            const currentGitHubState = readSessionGitHubState(currentMeta);
            if (currentGitHubState?.owner !== gitState.githubOwner || currentGitHubState.repo !== gitState.githubRepo) {
              await this.setSessionGitHubState(sessionKey, {
                owner: gitState.githubOwner,
                repo: gitState.githubRepo
              });
            }
            if (gitStateChanged && previousGitState?.branchName !== gitState.branchName) {
              await this._queuePullRequestLookup(sessionKey);
            }
          }
        }
        this._onDidRefreshSessionGitState.fire(sessionKey);
        await timeout(5e3, this._gitStateRefreshCancellationTokenSource.token);
      } catch (error) {
        if (isCancellationError(error)) {
          return;
        }
        this._logService.warn(`[AgentHostGitStateService][refreshSessionGitState] Failed to compute git state for ${sessionKey}:`, error);
      }
    });
  }
  async setSessionGitHubState(sessionKey, state) {
    const currentMeta = this._stateManager.getSessionState(sessionKey)?._meta;
    const currentState = readSessionGitHubState(currentMeta);
    const nextState = { ...currentState ?? {}, ...state };
    const currentPullRequest = getSessionRelatedPullRequestUrls(currentState)[0];
    const nextPullRequest = getSessionRelatedPullRequestUrls(nextState)[0];
    const currentSourceControlState = readSessionSourceControlState(currentMeta);
    const nextSourceControlState = nextPullRequest && nextPullRequest !== currentPullRequest ? { ...currentSourceControlState, latestOutcome: "pullRequest" /* PullRequest */ } : currentSourceControlState;
    const sourceControlStateChanged = !equals2(currentSourceControlState, nextSourceControlState);
    if (equals2(currentState, nextState) && !sourceControlStateChanged) {
      await this._saveSessionState(sessionKey, META_GITHUB_STATE, JSON.stringify(nextState));
      return;
    }
    const nextMeta = withSessionSourceControlState(withSessionGitHubState(currentMeta, nextState), nextSourceControlState);
    this._stateManager.setSessionMeta(sessionKey, nextMeta);
    this._onDidChangeSessionGitHubState.fire(sessionKey);
    await this._saveSessionState(sessionKey, META_GITHUB_STATE, JSON.stringify(nextState));
    if (sourceControlStateChanged && nextSourceControlState) {
      await this._saveSessionState(sessionKey, META_SOURCE_CONTROL_STATE, JSON.stringify(nextSourceControlState));
    }
  }
  async resolveSessionBaseBranchName(sessionKey) {
    const state = this._stateManager.getSessionState(sessionKey);
    const configValues = state?.config?.values;
    const configuredBranch = configValues?.["isolation" /* Isolation */] === "worktree" && configValues["worktreeCreateNewBranch" /* WorktreeCreateNewBranch */] !== false ? configValues["branch" /* Branch */] : void 0;
    if (typeof configuredBranch === "string" && configuredBranch.trim()) {
      return resolveDiffBaseBranchName(configuredBranch.trim(), void 0);
    }
    const gitStateBaseBranch = readSessionGitState(state?._meta)?.baseBranchName;
    const workingDirectory = state?.workingDirectories?.[0];
    const project = state?.project?.uri;
    if (!workingDirectory || !project || isEqual2(URI.parse(workingDirectory), URI.parse(project))) {
      return gitStateBaseBranch;
    }
    let databaseRef;
    try {
      databaseRef = await this._sessionDataService.tryOpenDatabase(URI.parse(sessionKey));
    } catch (error) {
      this._logService.warn(`[AgentHostGitStateService] Failed to open session database while resolving the base branch for ${sessionKey}`, error);
      return gitStateBaseBranch;
    }
    if (!databaseRef) {
      return gitStateBaseBranch;
    }
    try {
      return resolveDiffBaseBranchName(await databaseRef.object.getMetadata(META_DIFF_BASE_BRANCH), gitStateBaseBranch);
    } catch (error) {
      this._logService.warn(`[AgentHostGitStateService] Failed to read the persisted base branch for ${sessionKey}`, error);
      return gitStateBaseBranch;
    } finally {
      databaseRef.dispose();
    }
  }
  async recordSessionMerge(sessionKey, commit) {
    const currentMeta = this._stateManager.getSessionState(sessionKey)?._meta;
    const currentState = readSessionSourceControlState(currentMeta);
    const nextState = {
      ...currentState,
      merge: { commit },
      latestOutcome: "merge" /* Merge */
    };
    if (equals2(currentState, nextState)) {
      await this._saveSessionState(sessionKey, META_SOURCE_CONTROL_STATE, JSON.stringify(nextState));
      return;
    }
    this._stateManager.setSessionMeta(sessionKey, withSessionSourceControlState(currentMeta, nextState));
    await this._saveSessionState(sessionKey, META_SOURCE_CONTROL_STATE, JSON.stringify(nextState));
  }
  async _setSessionGitState(sessionKey, gitState) {
    const currentMeta = this._stateManager.getSessionState(sessionKey)?._meta;
    const nextMeta = withSessionGitState(currentMeta, gitState);
    this._stateManager.setSessionMeta(sessionKey, nextMeta);
    await this._saveSessionState(sessionKey, META_GIT_STATE, JSON.stringify(gitState));
  }
  async _saveSessionState(sessionKey, key, value) {
    const state = this._stateManager.getSessionState(sessionKey);
    if (state?.lifecycle === "creating" /* Creating */) {
      return;
    }
    let databaseRef;
    try {
      databaseRef = this._sessionDataService.openDatabase(URI.parse(sessionKey));
    } catch (error) {
      this._logService.warn(`[AgentHostGitStateService][_saveSessionState] Failed to open session database for ${sessionKey}`, error);
      return;
    }
    try {
      await databaseRef.object.setMetadata(key, value);
    } catch (error) {
      this._logService.warn(`[AgentHostGitStateService][_saveSessionState] Failed to persist ${key}`, error);
    } finally {
      databaseRef.dispose();
    }
  }
};

AgentHostGitStateService = __decorateClass([
  __decorateParam(0, IAgentHostStateManager),
  __decorateParam(1, IAgentHostGitService),
  __decorateParam(2, IAgentHostOctoKitService),
  __decorateParam(3, IAgentHostAuthenticationService),
  __decorateParam(4, IAgentHostGitHubEndpointService),
  __decorateParam(5, ILogService),
  __decorateParam(6, ISessionDataService)
], AgentHostGitStateService);
export { PULL_REQUEST_CREATION_CLOCK_SKEW_MS, AgentHostGitStateService };
