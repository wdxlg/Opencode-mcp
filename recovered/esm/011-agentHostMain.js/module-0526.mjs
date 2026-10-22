// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostPullRequestStatusService.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable, DisposableStore } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { parsePullRequestUrl } from "./module-0474.mjs";
import { autorun } from "./module-0068.mjs";
import { getSessionRelatedPullRequestUrls, hasSessionPullRequestForBranch, isSessionStatusArchived, readSessionGitHubState, readSessionGitState } from "./module-0047.mjs";
import { structuralEquals } from "./module-0050.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IAgentHostChangesetSubscriptionService } from "./module-0453.mjs";
import { IAgentHostGitStateService } from "./module-0445.mjs";
import { IGitHubService } from "./module-0472.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostPullRequestStatusService.ts
var MERGEABLE_STATES = /* @__PURE__ */ new Set(["CLEAN", "HAS_HOOKS", "UNSTABLE"]);

var IAgentHostPullRequestStatusService = createDecorator("agentHostPullRequestStatusService");

var AgentHostPullRequestStatusService = class extends Disposable {
  constructor(_stateManager, _changesetSubscriptions, _gitStateService, _gitHubService, _logService) {
    super();
    this._stateManager = _stateManager;
    this._changesetSubscriptions = _changesetSubscriptions;
    this._gitStateService = _gitStateService;
    this._gitHubService = _gitHubService;
    this._logService = _logService;
    this._watches = /* @__PURE__ */ new Map();
    this._pendingSyncs = /* @__PURE__ */ new Map();
    this._staleSyncs = /* @__PURE__ */ new Set();
    this._abortController = new AbortController();
    this._onDidChangePullRequestStatus = this._register(new Emitter());
    this.onDidChangePullRequestStatus = this._onDidChangePullRequestStatus.event;
    this._register(this._changesetSubscriptions.onDidChangeSessionSubscriptions((session) => this._sync(session)));
    this._register(this._gitStateService.onDidRefreshSessionGitState((session) => this._sync(session)));
    this._register(this._gitStateService.onDidChangeSessionGitHubState((session) => this._sync(session)));
    this._register(this._stateManager.onDidRemoveSession((session) => this._stopWatch(session)));
    this._register(this._stateManager.onDidEmitEnvelope((envelope) => {
      if (envelope.action.type === "session/isArchivedChanged" /* SessionIsArchivedChanged */) {
        this._sync(envelope.channel);
      }
    }));
    this._register(this._gitHubService.credentials.onDidInvalidate((event) => this._handleCredentialInvalidation(event)));
  }
  /**
   * Rebuilds watches whose backing pull request resource the resource service
   * has thrown away.
   *
   * An account or endpoint change disposes the resource outright, leaving a
   * subscription whose snapshot can never update — the button bar would then
   * advertise stale operations until some unrelated git or subscription event
   * happened to trigger a resync. A replaced or re-authenticated credential
   * keeps the resource and refreshes it in place, so those need nothing here.
   */
  _handleCredentialInvalidation(event) {
    if (event.reason === "replacement" || event.reason === "authentication") {
      return;
    }
    for (const [sessionKey, watch2] of [...this._watches]) {
      if (event.credential && !sameAccount5(event.credential.account, watch2.ref)) {
        continue;
      }
      this._stopWatch(sessionKey, `the GitHub credential was invalidated (${event.reason})`);
      if (event.reason !== "shutdown") {
        this._sync(sessionKey);
      }
    }
  }
  getPullRequestStatus(sessionKey) {
    return this._watches.get(sessionKey)?.status;
  }
  async refresh(sessionKey) {
    const watch2 = this._watches.get(sessionKey);
    if (!watch2) {
      this._logService.trace(`[AgentHostPullRequestStatusService] Refresh skipped because no pull request is being watched: session=${sessionKey}`);
      return;
    }
    try {
      this._logService.trace(`[AgentHostPullRequestStatusService] Refreshing pull request: session=${sessionKey}, pr=${describeRef(watch2.ref)}`);
      await watch2.subscription.refresh(void 0, void 0, { authoritative: true });
    } catch (error) {
      this._logService.warn(`[AgentHostPullRequestStatusService] Refresh failed: session=${sessionKey}, pr=${describeRef(watch2.ref)}, error=${error}`);
    }
  }
  dispose() {
    this._abortController.abort();
    this._staleSyncs.clear();
    for (const watch2 of this._watches.values()) {
      watch2.dispose();
    }
    this._watches.clear();
    super.dispose();
  }
  /**
   * Starts, replaces, or stops the watch for `sessionKey` so it matches the
   * session's current eligibility. Serialized per session because resolving
   * the pull request ref needs a credential, and two overlapping syncs would
   * otherwise race to install different subscriptions. Changes observed while
   * a sync is in flight are coalesced into one follow-up run so the watch
   * never settles on state that was already stale when it was read.
   */
  _sync(sessionKey) {
    if (this._pendingSyncs.has(sessionKey)) {
      this._staleSyncs.add(sessionKey);
      return;
    }
    this._runSync(sessionKey);
  }
  _runSync(sessionKey) {
    this._staleSyncs.delete(sessionKey);
    const run2 = this._doSync(sessionKey).catch((error) => {
      this._logService.debug(`[AgentHostPullRequestStatusService] Sync failed: session=${sessionKey}, error=${error}`);
    }).finally(() => {
      if (this._pendingSyncs.get(sessionKey) !== run2) {
        return;
      }
      this._pendingSyncs.delete(sessionKey);
      if (this._staleSyncs.delete(sessionKey) && !this._abortController.signal.aborted) {
        this._runSync(sessionKey);
      }
    });
    this._pendingSyncs.set(sessionKey, run2);
  }
  async _doSync(sessionKey) {
    if (this._abortController.signal.aborted) {
      return;
    }
    const target = this._getWatchTarget(sessionKey);
    if (target.kind === "skip") {
      this._stopWatch(sessionKey, target.reason);
      return;
    }
    const parsed = parsePullRequestUrl(target.pullRequestUrl);
    if (!parsed) {
      this._stopWatch(sessionKey, `pull request URL could not be parsed: ${target.pullRequestUrl}`);
      return;
    }
    const existing = this._watches.get(sessionKey);
    if (existing && sameRef2(existing.ref, parsed)) {
      return;
    }
    const credential = await this._gitHubService.credentials.getCredential(this._abortController.signal);
    if (this._abortController.signal.aborted) {
      return;
    }
    if (credential.account.host.toLowerCase() !== parsed.apiHost.toLowerCase()) {
      const reason = `the signed in account (${credential.account.host}) does not host ${parsed.owner}/${parsed.repo}#${parsed.number} (${parsed.apiHost})`;
      this._stopWatch(sessionKey, reason);
      this._logService.debug(`[AgentHostPullRequestStatusService] Not watching pull request: session=${sessionKey}, reason=${reason}`);
      return;
    }
    const ref = { ...credential.account, owner: parsed.owner, repo: parsed.repo, number: parsed.number };
    const current = this._getWatchTarget(sessionKey);
    if (current.kind === "skip" || current.pullRequestUrl !== target.pullRequestUrl) {
      this._logService.trace(`[AgentHostPullRequestStatusService] Retrying sync because the session changed while resolving credentials: session=${sessionKey}`);
      this._staleSyncs.add(sessionKey);
      return;
    }
    this._stopWatch(sessionKey, `replaced by ${describeRef(ref)}`);
    const store = new DisposableStore();
    const subscription = store.add(this._gitHubService.pullRequests.subscribePullRequest(ref, {
      priority: "visible",
      core: true,
      mergeability: true
    }));
    const watch2 = {
      ref,
      subscription,
      dispose: () => store.dispose()
    };
    this._watches.set(sessionKey, watch2);
    store.add(autorun((reader) => {
      const snapshot = subscription.resource.snapshot.read(reader);
      this._updateStatus(sessionKey, watch2, snapshot);
    }));
    this._logService.debug(`[AgentHostPullRequestStatusService] Watching pull request: session=${sessionKey}, pr=${describeRef(ref)}`);
  }
  /**
   * The pull request this session should be watching, or the reason it is not
   * eligible. The reason is carried rather than collapsed into `undefined` so
   * a missing button bar can be explained from the logs alone.
   */
  _getWatchTarget(sessionKey) {
    const state = this._stateManager.getSessionState(sessionKey);
    if (!state) {
      return { kind: "skip", reason: "session is unknown" };
    }
    if (isSessionStatusArchived(state.status)) {
      return { kind: "skip", reason: "session is archived" };
    }
    if (this._changesetSubscriptions.getSessionSubscriptions(sessionKey).size === 0) {
      return { kind: "skip", reason: "no client is subscribed to the session changes" };
    }
    const gitHubState = readSessionGitHubState(state._meta);
    const gitState = readSessionGitState(state._meta);
    if (!hasSessionPullRequestForBranch(gitHubState, gitState?.branchName)) {
      return { kind: "skip", reason: `no pull request is known for branch '${gitState?.branchName ?? "unknown"}'` };
    }
    const pullRequestUrl = getSessionRelatedPullRequestUrls(gitHubState)[0] ?? gitHubState?.pullRequestUrls?.[0];
    return pullRequestUrl ? { kind: "watch", pullRequestUrl } : { kind: "skip", reason: "the session has no pull request URL" };
  }
  _updateStatus(sessionKey, watch2, snapshot) {
    const status = toPullRequestStatus(snapshot);
    if (structuralEquals(watch2.status, status)) {
      return;
    }
    const previous = watch2.status;
    watch2.status = status;
    if (this._watches.get(sessionKey) !== watch2) {
      return;
    }
    this._logService.debug(`[AgentHostPullRequestStatusService] Status changed: session=${sessionKey}, pr=${describeRef(watch2.ref)}, from=[${describeStatus(previous)}], to=[${describeStatus(status)}]`);
    this._onDidChangePullRequestStatus.fire(sessionKey);
  }
  _stopWatch(sessionKey, reason) {
    const watch2 = this._watches.get(sessionKey);
    if (!watch2) {
      return;
    }
    this._watches.delete(sessionKey);
    watch2.dispose();
    this._logService.debug(`[AgentHostPullRequestStatusService] Stopped watching pull request: session=${sessionKey}, pr=${describeRef(watch2.ref)}, reason=${reason ?? "session removed"}`);
    this._onDidChangePullRequestStatus.fire(sessionKey);
  }
};

AgentHostPullRequestStatusService = __decorateClass([
  __decorateParam(0, IAgentHostStateManager),
  __decorateParam(1, IAgentHostChangesetSubscriptionService),
  __decorateParam(2, IAgentHostGitStateService),
  __decorateParam(3, IGitHubService),
  __decorateParam(4, ILogService)
], AgentHostPullRequestStatusService);

function describeRef(ref) {
  return `${ref.owner}/${ref.repo}#${ref.number}`;
}

function describeStatus(status) {
  if (!status) {
    return "unresolved";
  }
  return [
    `state=${status.state}`,
    `draft=${status.draft}`,
    `mergeReady=${status.mergeReady}`,
    `autoMergeEnabled=${status.autoMergeEnabled}`,
    `canEnableAutoMerge=${status.viewerCanEnableAutoMerge}`,
    `allowedMergeMethods=${status.allowedMergeMethods.join("|") || "none"}`
  ].join(", ");
}

function toPullRequestStatus(snapshot) {
  const core = snapshot.core.value;
  if (!core) {
    return void 0;
  }
  if (core.state !== "open") {
    return {
      ...core.id ? { pullRequestId: core.id } : {},
      number: core.number,
      url: core.url,
      headSha: core.headSha,
      state: core.state,
      draft: core.draft,
      mergeReady: false,
      viewerCanEnableAutoMerge: false,
      autoMergeEnabled: false,
      allowedMergeMethods: []
    };
  }
  const mergeability = snapshot.mergeability.value;
  if (!mergeability || snapshot.mergeability.headSha !== core.headSha) {
    return void 0;
  }
  return {
    ...core.id ? { pullRequestId: core.id } : {},
    number: core.number,
    url: core.url,
    headSha: core.headSha,
    state: core.state,
    draft: core.draft,
    mergeReady: !core.draft && mergeability.mergeable === "MERGEABLE" && mergeability.viewerCanMerge && MERGEABLE_STATES.has(mergeability.mergeStateStatus?.toUpperCase() ?? "CLEAN"),
    viewerCanEnableAutoMerge: mergeability.viewerCanEnableAutoMerge,
    autoMergeEnabled: mergeability.autoMergeEnabled,
    allowedMergeMethods: mergeability.allowedMergeMethods
  };
}

function sameRef2(left, right) {
  return left.owner.toLowerCase() === right.owner.toLowerCase() && left.repo.toLowerCase() === right.repo.toLowerCase() && left.number === right.number;
}

function sameAccount5(left, right) {
  return left.host.toLowerCase() === right.host.toLowerCase() && left.accountId === right.accountId;
}
export { describeRef, describeStatus, toPullRequestStatus, sameRef2, sameAccount5, MERGEABLE_STATES, IAgentHostPullRequestStatusService, AgentHostPullRequestStatusService };
