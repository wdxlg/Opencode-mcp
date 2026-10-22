// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentMergeController.ts
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0010.mjs";
import { CancellationTokenSource } from "./module-0017.mjs";
import { RunOnceScheduler, SequencerByKey } from "./module-0027.mjs";
import { Emitter } from "./module-0016.mjs";
import { AGENT_MERGE_UNKNOWN_COMMIT, AgentMergeConfigKey, agentMergeDisableReasons, agentMergeDisabledNotice, agentMergeEnabledNotice, agentMergeGateFragments, agentMergeMergePullRequestDemotedNotice, agentMergeRootConfigSchema, defaultAgentMergeConfiguration, evaluateAgentMerge, readAgentMergeSessionState, resolveAgentMergeConfiguration, resolveMergeMethod, shouldStopMergingAfterAgentChanges } from "./module-0116.mjs";
import { structuralEquals } from "./module-0050.mjs";
import { getSessionRelatedPullRequestUrls, isAhpChatChannel, isSessionStatusArchived, needsSessionGitStateRefresh, parseRequiredSessionUriFromChatUri, readSessionGitHubState, readSessionGitState } from "./module-0047.mjs";
import { GitHubRequestError } from "./module-0462.mjs";
import { URI } from "./module-0023.mjs";
import { generateUuid } from "./module-0042.mjs";
import { buildAgentMergePrompt } from "./module-0473.mjs";
import { autorun } from "./module-0068.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { IAgentHostGitStateService } from "./module-0445.mjs";
import { IAgentHostGitService } from "./module-0162.mjs";
import { IGitHubService } from "./module-0472.mjs";
import { IAgentHostGitHubEndpointService } from "./module-0161.mjs";
import { ILogService } from "./module-0084.mjs";
import { deriveGitHubEndpoints } from "./module-0160.mjs";


// src/vs/platform/agentHost/node/agentMergeController.ts
var snapshotDebounce = 3e4;

var backstopInterval = 10 * 6e4;

var maximumRepeatedPromptCount = 3;

var maximumTotalPromptCount = 6;

var maximumIndeterminateDuration = 30 * 6e4;

var indeterminateObservationGap = 2 * backstopInterval;

var AgentMergeRuntime = class extends Disposable {
  constructor(session, evaluate) {
    super();
    this.session = session;
    this.subscription = this._register(new MutableDisposable());
    this.snapshotObserver = this._register(new MutableDisposable());
    this.cancellation = new CancellationTokenSource();
    this.abortController = new AbortController();
    /**
     * Whether this runtime already tried to recompute git state that reported
     * no usable branch. Caps that repair at one git call per runtime so a
     * checkout that can never report a branch does not spawn one on every
     * backstop.
     */
    this.didRefreshForMissingBranch = false;
    this.evaluationScheduler = this._register(new RunOnceScheduler(evaluate, snapshotDebounce));
    this.backstopScheduler = this._register(new RunOnceScheduler(evaluate, backstopInterval));
    this._register(toDisposable(() => this.cancellation.dispose(true)));
    this._register(toDisposable(() => this.abortController.abort(new Error("Agent Merge stopped"))));
  }
};

var AgentMergeController = class extends Disposable {
  constructor(_options, _stateManager, _configurationService, _gitStateService, _gitService, _gitHubService, _gitHubEndpointService, _logService) {
    super();
    this._options = _options;
    this._stateManager = _stateManager;
    this._configurationService = _configurationService;
    this._gitStateService = _gitStateService;
    this._gitService = _gitService;
    this._gitHubService = _gitHubService;
    this._gitHubEndpointService = _gitHubEndpointService;
    this._logService = _logService;
    this._runtimes = this._register(new DisposableMap());
    this._evaluations = new SequencerByKey();
    this._evaluatingSessions = /* @__PURE__ */ new Set();
    this._activeTurns = /* @__PURE__ */ new Map();
    this._onDidReleaseHold = this._register(new Emitter());
    /** Fires when Agent Merge stops holding a session, so the host can re-arm its idle release. */
    this.onDidReleaseHold = this._onDidReleaseHold.event;
    /** Sessions kept resident so their monitoring survives with no client subscriber. */
    this._heldSessions = /* @__PURE__ */ new Set();
    /**
     * Sessions this controller is monitoring in the current host lifetime. Only a
     * session in this set can produce the "turned off" notice, so the re-entrant
     * sync that {@link _disable} triggers cannot post a second, reasonless one.
     */
    this._monitoredSessions = /* @__PURE__ */ new Set();
    this._logService.debug("[AgentMergeController] Initialized");
    this._register(this._stateManager.onDidChangeSessionConfig((event) => {
      const previous = readAgentMergeSessionState(event.previous?.values);
      const current = readAgentMergeSessionState(event.current?.values);
      if (structuralEquals(previous, current)) {
        return;
      }
      const session = event.session.toString();
      if (this._resetRepairBaselineOnReselection(session, previous, current)) {
        return;
      }
      this._syncSession(session);
    }));
    this._register(this._stateManager.onDidChangeSessionActiveTurn((event) => {
      if (event.active) {
        return;
      }
      void this._completeTurn(event.session);
    }));
    this._register(this._stateManager.onDidRemoveSession((session) => {
      this._monitoredSessions.delete(session);
      this._stopRuntime(session);
    }));
    this._register(this._gitStateService.onDidRefreshSessionGitState((session) => {
      if (!this._evaluatingSessions.has(session)) {
        this._schedule(session, 0);
      }
    }));
    this._register(this._gitStateService.onDidChangeSessionGitHubState((session) => this._schedule(session, 0)));
    this._register(this._configurationService.onDidRootConfigChange(() => {
      for (const session of this._stateManager.getSessionUris()) {
        this._syncSession(session);
      }
    }));
    this._register(this._stateManager.onDidEmitEnvelope((envelope) => {
      if (envelope.action.type === "session/ready" /* SessionReady */ || envelope.action.type === "session/isArchivedChanged" /* SessionIsArchivedChanged */) {
        this._syncSession(envelope.channel);
      }
    }));
  }
  refresh() {
    this._logService.debug(`[AgentMergeController] Refreshing ${this._runtimes.size} active session(s) after authentication changed`);
    for (const session of this._runtimes.keys()) {
      this._schedule(session, 0);
    }
  }
  isEnabled() {
    return this._isFeatureEnabled();
  }
  /**
   * Whether Agent Merge is keeping `session` resident. The host consults this
   * before releasing an idle session, and re-arms that release when
   * {@link onDidReleaseHold} reports the hold has ended.
   */
  holdsSession(session) {
    return this._heldSessions.has(session);
  }
  onSessionAvailable(session) {
    this._logService.trace(`[AgentMergeController] Session available: session=${session}`);
    this._syncSession(session);
  }
  getTurnContext(session) {
    const sessionKey = isAhpChatChannel(session) ? parseRequiredSessionUriFromChatUri(session) : session;
    const context = this._activeTurns.get(sessionKey);
    if (!context || this._stateManager.getSessionState(sessionKey)?.activeTurn?.id !== context.turnId) {
      return void 0;
    }
    return context;
  }
  /**
   * Whether monitoring needs `session` in memory. Persisted enablement counts
   * even before a runtime starts, so a restore is not evicted out from under
   * the runtime that is about to claim it.
   */
  _shouldHoldSession(session) {
    if (this._runtimes.has(session)) {
      return true;
    }
    if (!this._isFeatureEnabled()) {
      return false;
    }
    const state = this._stateManager.getSessionState(session);
    if (!state || isSessionStatusArchived(state.status)) {
      return false;
    }
    return readAgentMergeSessionState(state.config?.values)?.enabled === true;
  }
  /**
   * Recomputes the hold after a state transition. Tracking it here — rather
   * than lazily when the host happens to ask — keeps the answer correct for a
   * session the host has never had reason to evict.
   */
  _updateHold(session) {
    const shouldHold = this._shouldHoldSession(session);
    if (shouldHold === this._heldSessions.has(session)) {
      return;
    }
    if (shouldHold) {
      this._heldSessions.add(session);
      return;
    }
    this._heldSessions.delete(session);
    this._logService.debug(`[AgentMergeController] Released session hold: session=${session}`);
    this._onDidReleaseHold.fire(session);
  }
  _syncSession(session) {
    try {
      this._doSyncSession(session);
    } finally {
      this._updateHold(session);
    }
  }
  _doSyncSession(session) {
    const state = this._stateManager.getSessionState(session);
    const agentMerge = readAgentMergeSessionState(state?.config?.values);
    if (!state || !agentMerge?.enabled) {
      if (this._runtimes.has(session) || agentMerge?.injectedConfiguration) {
        this._logService.info(`[AgentMergeController] Stopping disabled session: session=${session}`);
      }
      if (this._monitoredSessions.delete(session) && state) {
        this._postNotice(session, "agentMergeDisabled" /* AgentMergeDisabled */, agentMergeDisabledNotice());
      }
      if (agentMerge?.injectedConfiguration) {
        this._restoreInjectedConfiguration(session, agentMerge);
      }
      this._stopRuntime(session);
      return;
    }
    if (isSessionStatusArchived(state.status)) {
      this._disable(session, agentMerge, agentMergeDisableReasons.sessionArchived());
      return;
    }
    if (!this._isFeatureEnabled()) {
      if (this._runtimes.has(session) || agentMerge.injectedConfiguration) {
        this._logService.info(`[AgentMergeController] Pausing session because the feature is globally disabled: session=${session}`);
      }
      if (agentMerge.injectedConfiguration) {
        this._restoreInjectedConfiguration(session, agentMerge, true);
      }
      this._stopRuntime(session);
      return;
    }
    if (state.lifecycle !== "ready" /* Ready */) {
      if (this._runtimes.has(session)) {
        this._logService.debug(`[AgentMergeController] Stopping runtime because the session is not ready: session=${session}, lifecycle=${state.lifecycle}`);
      }
      this._stopRuntime(session);
      return;
    }
    if (!this._stateManager.hasActiveTurn(session)) {
      this._reconcileInjectedConfiguration(session, agentMerge);
    }
    let runtime = this._runtimes.get(session);
    if (!runtime) {
      runtime = new AgentMergeRuntime(session, () => this._queueEvaluation(session));
      this._runtimes.set(session, runtime);
      this._monitoredSessions.add(session);
      this._logService.info(`[AgentMergeController] Started session runtime: session=${session}, hasTarget=${agentMerge.target !== void 0}, overrides=${formatOverrideKeys(agentMerge)}`);
    }
    this._schedule(session, 0);
  }
  _isFeatureEnabled() {
    return this._configurationService.getRootValue(agentMergeRootConfigSchema, AgentMergeConfigKey.Enabled) ?? false;
  }
  /**
   * Applies the provider's current autonomous configuration, recomputing it every
   * cycle so a tightened managed policy revokes elevated approvals it previously
   * granted. The originally observed user values are preserved for restore.
   */
  _reconcileInjectedConfiguration(session, agentMerge) {
    const values = this._configurationService.getSessionConfigValues(session) ?? {};
    const injected = agentMerge.injectedConfiguration;
    const applied = this._options.getAutonomousSessionConfig(session, values) ?? {};
    if (!injected && Object.keys(applied).length === 0) {
      this._logService.debug(`[AgentMergeController] Provider did not select autonomous session configuration: session=${session}`);
      return;
    }
    const previous = {};
    const patch = {};
    for (const [key, value] of Object.entries(applied)) {
      previous[key] = injected && Object.hasOwn(injected.previous, key) ? injected.previous[key] : values[key];
      if (!structuralEquals(values[key], value)) {
        patch[key] = value;
      }
    }
    for (const [key, appliedValue] of Object.entries(injected?.applied ?? {})) {
      if (!Object.hasOwn(applied, key) && structuralEquals(values[key], appliedValue)) {
        patch[key] = injected.previous[key];
      }
    }
    const nextInjected = Object.keys(applied).length > 0 ? { previous, applied } : void 0;
    if (Object.keys(patch).length === 0 && structuralEquals(injected, nextInjected)) {
      return;
    }
    this._logService.info(`[AgentMergeController] Reconciled autonomous session configuration: session=${session}, applied=${Object.keys(applied).sort().join(",") || "none"}, changed=${Object.keys(patch).sort().join(",") || "none"}`);
    this._configurationService.updateSessionConfig(session, {
      ["agentMerge.controller" /* AgentMergeController */]: toControllerState(agentMerge, { injectedConfiguration: nextInjected }),
      ...patch
    });
  }
  _restoreInjectedConfiguration(session, agentMerge, preserveControllerState = false) {
    const injected = agentMerge.injectedConfiguration;
    if (!injected) {
      return;
    }
    const patch = {
      ["agentMerge.controller" /* AgentMergeController */]: preserveControllerState ? toControllerState(agentMerge, { injectedConfiguration: void 0 }) : {}
    };
    this._addInjectedConfigurationRestore(patch, session, agentMerge);
    this._logService.info(`[AgentMergeController] Restoring session configuration: session=${session}, restoreMode=${Object.hasOwn(patch, "mode" /* Mode */)}, restoreApprovals=${Object.hasOwn(patch, "autoApprove" /* AutoApprove */)}, preserveControllerState=${preserveControllerState}`);
    this._configurationService.updateSessionConfig(session, patch);
  }
  _schedule(session, delay) {
    const runtime = this._runtimes.get(session);
    if (!runtime) {
      return;
    }
    runtime.evaluationScheduler.schedule(delay);
  }
  _queueEvaluation(session) {
    void this._evaluations.queue(session, async () => {
      this._evaluatingSessions.add(session);
      try {
        this._logService.trace(`[AgentMergeController] Evaluation started: session=${session}`);
        await this._evaluate(session);
      } catch (error) {
        if (!this._runtimes.has(session)) {
          this._logService.trace(`[AgentMergeController] Evaluation stopped with disposed runtime: session=${session}`);
          return;
        }
        if (error instanceof GitHubRequestError && (error.kind === "authentication" || error.kind === "authorization")) {
          this._requestGitHubAuthorization(session, error.kind, error.message);
        }
        this._logService.error(error, `[AgentMergeController] Evaluation failed: session=${session}, kind=${githubErrorKind(error)}`);
        this._runtimes.get(session)?.backstopScheduler.schedule();
      } finally {
        this._evaluatingSessions.delete(session);
      }
    });
  }
  async _evaluate(session) {
    const runtime = this._runtimes.get(session);
    const state = this._stateManager.getSessionState(session);
    const agentMerge = readAgentMergeSessionState(state?.config?.values);
    if (!runtime || !state || !agentMerge?.enabled || this._stateManager.hasActiveTurn(session)) {
      return;
    }
    const branchName = await this._resolveCurrentBranch(session, runtime, state);
    if (!this._isCurrentRuntime(session, runtime)) {
      return;
    }
    if (!branchName) {
      this._logService.trace(`[AgentMergeController] Waiting for a current branch: session=${session}`);
      runtime.backstopScheduler.schedule();
      return;
    }
    let target = agentMerge.target;
    if (!target) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      target = { branchName, enabledAt: now, commentWatermark: now };
      this._logService.info(`[AgentMergeController] Captured session branch and feedback watermark: session=${session}`);
      this._postNotice(session, "agentMergeEnabled" /* AgentMergeEnabled */, agentMergeEnabledNotice(branchName));
      this._updateAgentMergeState(session, agentMerge, { target });
      return;
    }
    if (target.branchName !== branchName) {
      this._disable(session, agentMerge, agentMergeDisableReasons.branchChanged(target.branchName, branchName));
      return;
    }
    await this._gitStateService.attachSessionGitHubPullRequest(session, state.workingDirectories?.[0] ? URI.parse(state.workingDirectories[0]) : void 0);
    if (!this._isCurrentRuntime(session, runtime)) {
      return;
    }
    const refreshedState = this._stateManager.getSessionState(session);
    if (!this._hasTargetBranch(refreshedState, target.branchName)) {
      this._disable(session, agentMerge, agentMergeDisableReasons.branchChangedWhileRefreshing());
      return;
    }
    const gitHubState = readSessionGitHubState(refreshedState?._meta);
    const pullRequestUrl = getSessionRelatedPullRequestUrls(gitHubState)[0];
    if (!target.pullRequestUrl) {
      if (!pullRequestUrl) {
        this._logService.trace(`[AgentMergeController] Waiting for a pull request on the captured branch: session=${session}`);
        runtime.backstopScheduler.schedule();
        return;
      }
      target = { ...target, pullRequestUrl };
      this._logService.info(`[AgentMergeController] Bound session to its pull request: session=${session}`);
      this._updateAgentMergeState(session, agentMerge, { target });
      return;
    }
    if (pullRequestUrl && pullRequestUrl.toLowerCase() !== target.pullRequestUrl.toLowerCase()) {
      this._disable(session, agentMerge, agentMergeDisableReasons.differentPullRequest());
      return;
    }
    const parsed = parsePullRequestUrl(target.pullRequestUrl);
    if (!parsed) {
      this._disable(session, agentMerge, agentMergeDisableReasons.invalidPullRequestUrl());
      return;
    }
    const ref = await this._resolveRef(parsed, runtime.abortController.signal);
    if (!this._isCurrentRuntime(session, runtime)) {
      return;
    }
    if (!ref) {
      this._disable(session, agentMerge, agentMergeDisableReasons.differentGitHubHost());
      return;
    }
    const subscription = await this._ensureSubscription(session, runtime, ref);
    if (!subscription || !this._isCurrentRuntime(session, runtime)) {
      return;
    }
    const snapshot = subscription.resource.snapshot.get();
    const configuration = this._getConfiguration(agentMerge);
    if (await this._demoteMergePullRequestIfChanged(session, agentMerge, configuration)) {
      return;
    }
    if (!this._isCurrentRuntime(session, runtime)) {
      return;
    }
    const gate = evaluateAgentMerge(snapshot, configuration, target.commentWatermark);
    this._logGateResult(session, gate);
    if (gate.kind !== "indeterminate") {
      runtime.indeterminate = void 0;
      runtime.reportedCredentialFailure = void 0;
    }
    switch (gate.kind) {
      case "indeterminate":
        this._reportBlockedCredential(session, runtime, snapshot);
        if (this._isIndeterminateBudgetExhausted(session, runtime, gate.cause)) {
          this._disable(session, agentMerge, agentMergeDisableReasons.indeterminate(Math.round(maximumIndeterminateDuration / 6e4), gate.reason));
          return;
        }
        runtime.backstopScheduler.schedule();
        return;
      case "terminal":
        this._disable(session, agentMerge, agentMergeDisableReasons.pullRequestClosed());
        return;
      case "noWork":
        runtime.backstopScheduler.schedule();
        return;
      case "prompt": {
        if (!this._canRepairFork(snapshot)) {
          this._logService.info(`[AgentMergeController] Waiting because the pull request head fork does not allow maintainer edits for ${session}`);
          runtime.backstopScheduler.schedule();
          return;
        }
        if (!shouldRunFingerprint(agentMerge, gate.fingerprint)) {
          this._logService.debug(`[AgentMergeController] Suppressing unchanged repair turn until the backstop: session=${session}`);
          runtime.backstopScheduler.schedule();
          return;
        }
        const repeatedPromptCount = agentMerge.lastPromptFingerprint === gate.fingerprint ? (agentMerge.repeatedPromptCount ?? 0) + 1 : 0;
        const totalPromptCount = (agentMerge.totalPromptCount ?? 0) + 1;
        if (repeatedPromptCount >= maximumRepeatedPromptCount || totalPromptCount > maximumTotalPromptCount) {
          this._logService.warn(`[AgentMergeController] Repair attempt budget exhausted: session=${session}, repeatedAttempts=${repeatedPromptCount}, totalAttempts=${totalPromptCount}`);
          this._disable(session, agentMerge, agentMergeDisableReasons.repairBudgetExhausted());
          return;
        }
        const turnId = generateUuid();
        const repairBaseCommit = await this._resolveLocalCommit(session) ?? AGENT_MERGE_UNKNOWN_COMMIT;
        const context = {
          session,
          turnId,
          ref,
          headSha: gate.context.headSha,
          actions: gate.actions,
          configuration,
          snapshot,
          signal: runtime.abortController.signal,
          commentWatermark: gate.context.commentWatermark
        };
        if (!this._isCurrentRuntime(session, runtime) || !this._isTargetStillCurrent(session, target) || this._stateManager.hasActiveTurn(session) || !this._options.startTurn(session, turnId, buildAgentMergePrompt(gate.actions, gate.context))) {
          this._logService.debug(`[AgentMergeController] Repair turn was not claimed because the session became busy, retargeted, or stopped: session=${session}`);
          runtime.backstopScheduler.schedule();
          return;
        }
        this._activeTurns.set(session, context);
        this._logService.info(`[AgentMergeController] Started repair turn: session=${session}, turn=${turnId}, actions=${gate.actions.join(",")}, repeatedAttempts=${repeatedPromptCount}, totalAttempts=${totalPromptCount}`);
        this._updateAgentMergeState(session, agentMerge, {
          lastPromptFingerprint: gate.fingerprint,
          lastPromptAt: (/* @__PURE__ */ new Date()).toISOString(),
          repeatedPromptCount,
          totalPromptCount,
          repairBaseCommit
        });
        return;
      }
      case "merge":
        if (!shouldRunFingerprint(agentMerge, gate.fingerprint)) {
          this._logService.debug(`[AgentMergeController] Suppressing unchanged native merge attempt until the backstop: session=${session}`);
          runtime.backstopScheduler.schedule();
          return;
        }
        this._updateAgentMergeState(session, agentMerge, {
          lastPromptFingerprint: gate.fingerprint,
          lastPromptAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        this._logService.info(`[AgentMergeController] Starting native merge readiness verification: session=${session}, configuredMethod=${configuration.mergeMethod}`);
        await this._merge(session, runtime, ref, snapshot, configuration, agentMerge);
        return;
    }
  }
  /**
   * Resolves the branch Agent Merge should act on, repairing session git
   * state that does not report one.
   *
   * A failed git probe can leave persisted git state without a branch. The
   * refresh that would repair it normally rides along with a client watching
   * the session or an edit landing in the worktree, and neither happens for a
   * session this controller is holding resident on its own. Every later step
   * — binding the pull request, subscribing to it, acting on its feedback —
   * is gated on the branch, so without this the session idles on the backstop
   * indefinitely and Agent Merge silently never runs.
   *
   * A detached `HEAD` is excluded: it reports no branch by design, so
   * refreshing would never produce one. The attempt is capped at once per
   * runtime regardless, so any other checkout that cannot report a branch
   * costs a single git call rather than one per backstop.
   */
  async _resolveCurrentBranch(session, runtime, state) {
    const gitState = readSessionGitState(state._meta);
    if (gitState?.branchName) {
      return gitState.branchName;
    }
    if (runtime.didRefreshForMissingBranch || !needsSessionGitStateRefresh(gitState)) {
      return void 0;
    }
    runtime.didRefreshForMissingBranch = true;
    this._logService.debug(`[AgentMergeController] Refreshing git state because the session reports no branch: session=${session}`);
    await this._gitStateService.refreshSessionGitState(session, state.workingDirectories?.[0] ? URI.parse(state.workingDirectories[0]) : void 0);
    if (!this._isCurrentRuntime(session, runtime)) {
      return void 0;
    }
    const refreshed = readSessionGitState(this._stateManager.getSessionState(session)?._meta)?.branchName;
    if (refreshed) {
      this._logService.info(`[AgentMergeController] Recovered the session branch after refreshing git state: session=${session}`);
    } else {
      this._logService.warn(`[AgentMergeController] Session still reports no branch after refreshing git state: session=${session}`);
    }
    return refreshed;
  }
  async _resolveRef(parsed, signal) {
    const credential = await this._gitHubService.credentials.getCredential(signal);
    if (credential.account.host.toLowerCase() !== parsed.apiHost.toLowerCase()) {
      return void 0;
    }
    return { ...credential.account, owner: parsed.owner, repo: parsed.repo, number: parsed.number };
  }
  async _ensureSubscription(session, runtime, ref) {
    if (runtime.ref && sameRef(runtime.ref, ref) && runtime.subscription.value) {
      this._logService.trace(`[AgentMergeController] Reusing pull request subscription: session=${session}`);
      return runtime.subscription.value;
    }
    runtime.ref = ref;
    const subscription = this._gitHubService.pullRequests.subscribePullRequest(ref, {
      priority: "background",
      conversation: {
        topLevelComments: true,
        submittedReviews: true,
        reviewThreads: true,
        includeBodies: true
      },
      checks: { required: true },
      mergeability: true
    });
    this._logService.debug(`[AgentMergeController] Created pull request subscription: session=${session}, priority=background`);
    if (!this._isCurrentRuntime(session, runtime)) {
      subscription.dispose();
      return void 0;
    }
    runtime.subscription.value = subscription;
    const snapshotStore = new DisposableStore();
    snapshotStore.add(autorun((reader) => {
      subscription.resource.snapshot.read(reader);
      runtime.evaluationScheduler.schedule();
    }));
    runtime.snapshotObserver.value = snapshotStore;
    try {
      this._logService.trace(`[AgentMergeController] Refreshing authoritative pull request state: session=${session}`);
      await subscription.refresh(void 0, runtime.cancellation.token, { authoritative: true });
    } catch (error) {
      if (!this._isCurrentRuntime(session, runtime)) {
        return void 0;
      }
      throw error;
    }
    this._logService.debug(`[AgentMergeController] Pull request state ready: session=${session}`);
    return this._isCurrentRuntime(session, runtime) ? subscription : void 0;
  }
  _isCurrentRuntime(session, runtime) {
    return this._runtimes.get(session) === runtime && !runtime.abortController.signal.aborted;
  }
  _getConfiguration(agentMerge) {
    const defaults = {
      addressReviews: this._configurationService.getRootValue(agentMergeRootConfigSchema, AgentMergeConfigKey.AddressReviews) ?? defaultAgentMergeConfiguration.addressReviews,
      fixCI: this._configurationService.getRootValue(agentMergeRootConfigSchema, AgentMergeConfigKey.FixCI) ?? defaultAgentMergeConfiguration.fixCI,
      resolveConflicts: this._configurationService.getRootValue(agentMergeRootConfigSchema, AgentMergeConfigKey.ResolveConflicts) ?? defaultAgentMergeConfiguration.resolveConflicts,
      mergePullRequest: this._configurationService.getRootValue(agentMergeRootConfigSchema, AgentMergeConfigKey.MergePullRequest) ?? defaultAgentMergeConfiguration.mergePullRequest,
      mergeMethod: this._configurationService.getRootValue(agentMergeRootConfigSchema, AgentMergeConfigKey.MergeMethod) ?? defaultAgentMergeConfiguration.mergeMethod,
      replyAttribution: this._configurationService.getRootValue(agentMergeRootConfigSchema, AgentMergeConfigKey.ReplyAttribution) ?? defaultAgentMergeConfiguration.replyAttribution
    };
    return resolveAgentMergeConfiguration(defaults, agentMerge.overrides);
  }
  _canRepairFork(snapshot) {
    const core = snapshot.core.value;
    if (!core) {
      return false;
    }
    if (!core.headRepositoryNameWithOwner) {
      return false;
    }
    if (core.headRepositoryNameWithOwner.toLowerCase() === core.repositoryNameWithOwner.toLowerCase()) {
      return true;
    }
    return core.maintainerCanModify === true;
  }
  /** Whether the session still sits on the branch and pull request this run was authorized for. */
  _isTargetStillCurrent(session, target) {
    const state = this._stateManager.getSessionState(session);
    if (!this._hasTargetBranch(state, target.branchName)) {
      return false;
    }
    if (!target.pullRequestUrl) {
      return true;
    }
    const pullRequestUrl = getSessionRelatedPullRequestUrls(readSessionGitHubState(state?._meta))[0];
    return !pullRequestUrl || pullRequestUrl.toLowerCase() === target.pullRequestUrl.toLowerCase();
  }
  async _merge(session, runtime, ref, snapshot, configuration, agentMerge) {
    const headSha = snapshot.core.value?.headSha;
    if (!headSha) {
      this._logService.debug(`[AgentMergeController] Merge preparation deferred because the head SHA is unavailable: session=${session}`);
      runtime.backstopScheduler.schedule();
      return;
    }
    const preparation = await this._gitHubService.mutations.prepareMerge(ref, headSha, runtime.abortController.signal);
    this._logService.debug(`[AgentMergeController] Native merge preparation completed: session=${session}`);
    if (!this._isCurrentRuntime(session, runtime) || this._stateManager.hasActiveTurn(session)) {
      runtime.backstopScheduler.schedule();
      return;
    }
    const currentState = readAgentMergeSessionState(this._stateManager.getSessionState(session)?.config?.values);
    const currentTarget = currentState?.target;
    if (!currentState?.enabled || !currentTarget || !this._isTargetStillCurrent(session, currentTarget) || currentTarget.pullRequestUrl !== agentMerge.target?.pullRequestUrl) {
      this._logService.info(`[AgentMergeController] Native merge abandoned because authorization or target changed: session=${session}`);
      runtime.backstopScheduler.schedule();
      return;
    }
    const currentConfiguration = this._getConfiguration(currentState);
    if (!currentConfiguration.mergePullRequest) {
      this._logService.info(`[AgentMergeController] Native merge abandoned because automatic merge was switched off: session=${session}`);
      runtime.backstopScheduler.schedule();
      return;
    }
    const freshGate = evaluateAgentMerge(preparation.snapshot, currentConfiguration, currentTarget.commentWatermark);
    if (freshGate.kind !== "merge") {
      this._logService.info(`[AgentMergeController] Native merge aborted after fresh readiness check: session=${session}, outcome=${freshGate.kind}`);
      this._schedule(session, 0);
      return;
    }
    const authorization = {
      confirmed: true,
      authorizationId: `${currentTarget.enabledAt}:${currentTarget.pullRequestUrl}`
    };
    if (preparation.snapshot.mergeability.value.mergeQueueRequired) {
      const result2 = await this._gitHubService.mutations.enqueue(preparation, authorization, runtime.abortController.signal);
      this._logService.info(`[AgentMergeController] Pull request submitted to merge queue: session=${session}, outcome=${result2.outcome}`);
      runtime.backstopScheduler.schedule();
      return;
    }
    const method = resolveMergeMethod(currentConfiguration.mergeMethod, preparation.snapshot.mergeability.value.allowedMergeMethods);
    if (!method) {
      this._logService.warn(`[AgentMergeController] No allowed merge method is available for ${session}`);
      runtime.backstopScheduler.schedule();
      return;
    }
    const result = await this._gitHubService.mutations.merge(preparation, { method, authorization }, runtime.abortController.signal);
    this._logService.info(`[AgentMergeController] Pull request merged natively: session=${session}, method=${method}, outcome=${result.outcome}`);
    this._disable(session, currentState, agentMergeDisableReasons.pullRequestMerged());
  }
  async _completeTurn(session) {
    const context = this._activeTurns.get(session);
    if (!context) {
      this._schedule(session, 0);
      return;
    }
    this._activeTurns.delete(session);
    const state = this._stateManager.getSessionState(session);
    const completedTurn = state?.turns.find((turn) => turn.id === context.turnId);
    const agentMerge = readAgentMergeSessionState(state?.config?.values);
    const runtime = this._runtimes.get(session);
    if (!agentMerge?.enabled || !runtime?.subscription.value) {
      this._logService.debug(`[AgentMergeController] Repair turn ended after Agent Merge stopped: session=${session}, turn=${context.turnId}, outcome=${completedTurn?.state ?? "unknown"}`);
      return;
    }
    const shouldAdvanceWatermark = context.actions.includes("addressReviews") && completedTurn?.state === "complete" /* Complete */;
    this._logService.info(`[AgentMergeController] Repair turn ended: session=${session}, turn=${context.turnId}, outcome=${completedTurn?.state ?? "unknown"}, advanceFeedbackWatermark=${shouldAdvanceWatermark}`);
    if (shouldAdvanceWatermark && agentMerge.target && context.commentWatermark !== agentMerge.target.commentWatermark) {
      this._updateAgentMergeState(session, agentMerge, {
        target: { ...agentMerge.target, commentWatermark: context.commentWatermark }
      });
    }
    const current = readAgentMergeSessionState(this._stateManager.getSessionState(session)?.config?.values) ?? agentMerge;
    if (await this._demoteMergePullRequestIfChanged(session, current, this._getConfiguration(current))) {
      return;
    }
    try {
      await runtime.subscription.value.refresh(void 0, runtime.cancellation.token, { authoritative: true });
    } catch (error) {
      this._logService.warn(`[AgentMergeController] Failed to refresh pull request after turn for ${session}`, error);
    }
    this._schedule(session, 0);
  }
  /**
   * Resolves the session worktree's current commit, or `undefined` when the
   * worktree cannot be read. Callers treat `undefined` as "changed" so an
   * unreadable worktree can never authorize an automatic merge.
   */
  async _resolveLocalCommit(session) {
    try {
      const workingDirectory = this._stateManager.getSessionState(session)?.workingDirectories?.[0];
      if (!workingDirectory) {
        return void 0;
      }
      const repositoryRoot = await this._gitService.getRepositoryRoot(URI.parse(workingDirectory));
      return repositoryRoot ? await this._gitService.revParse(repositoryRoot, "HEAD") : void 0;
    } catch (error) {
      this._logService.warn(`[AgentMergeController] Failed to resolve the local commit: session=${session}`, error);
      return void 0;
    }
  }
  /**
   * Turns automatic merging off once a repair turn has produced work, for
   * sessions that only authorized merging while the pull request is unchanged.
   *
   * The chosen value is rewritten rather than merely gated so the dropdown
   * always shows what will actually happen, and so re-selecting the option
   * establishes a fresh baseline. Returns whether the value was demoted.
   */
  async _demoteMergePullRequestIfChanged(session, agentMerge, configuration) {
    if (configuration.mergePullRequest !== "ifUnchanged" || agentMerge.repairBaseCommit === void 0) {
      return false;
    }
    const currentCommit = await this._resolveLocalCommit(session);
    if (!shouldStopMergingAfterAgentChanges(configuration, agentMerge, currentCommit)) {
      return false;
    }
    this._logService.info(`[AgentMergeController] Turning automatic merge off because a repair turn changed the worktree: session=${session}, repairBaseCommit=${agentMerge.repairBaseCommit}, currentCommit=${currentCommit ?? "unresolved"}`);
    this._postNotice(session, "agentMergeDisabled" /* AgentMergeDisabled */, agentMergeMergePullRequestDemotedNotice());
    this._configurationService.updateSessionConfig(session, {
      ["agentMerge" /* AgentMerge */]: {
        enabled: agentMerge.enabled,
        overrides: { ...agentMerge.overrides, mergePullRequest: "never" }
      },
      // Dropping the baseline is what makes re-selecting the option start
      // fresh: without it the next evaluation would demote again against
      // this very same commit.
      ["agentMerge.controller" /* AgentMergeController */]: toControllerState(agentMerge, { repairBaseCommit: void 0 })
    });
    return true;
  }
  /**
   * Drops the repair baseline when the user selects "merge only while
   * unchanged" afresh.
   *
   * The client writes only its own Agent Merge state, so a baseline recorded
   * by an earlier repair turn survives the selection. Without this reset the
   * next evaluation would immediately demote the choice back to `never`
   * against work the user has already seen, and the option could never be
   * turned back on. Returns whether a reset was written.
   */
  _resetRepairBaselineOnReselection(session, previous, current) {
    if (!current || current.repairBaseCommit === void 0) {
      return false;
    }
    if (this._getConfiguration(current).mergePullRequest !== "ifUnchanged") {
      return false;
    }
    if (previous && this._getConfiguration(previous).mergePullRequest === "ifUnchanged") {
      return false;
    }
    this._logService.info(`[AgentMergeController] Starting a fresh unchanged-merge baseline after the choice was reselected: session=${session}`);
    this._updateAgentMergeState(session, current, { repairBaseCommit: void 0 });
    return true;
  }
  _updateAgentMergeState(session, current, patch) {
    this._configurationService.updateSessionConfig(session, {
      ["agentMerge.controller" /* AgentMergeController */]: toControllerState(current, patch)
    });
  }
  _disable(session, current, reason) {
    this._logService.info(`[AgentMergeController] Disabling Agent Merge for ${session}: ${reason.log}`);
    this._activeTurns.delete(session);
    this._monitoredSessions.delete(session);
    this._postNotice(session, "agentMergeDisabled" /* AgentMergeDisabled */, reason.notice);
    const patch = {
      ["agentMerge" /* AgentMerge */]: {
        enabled: false,
        ...current.overrides ? { overrides: current.overrides } : {}
      },
      ["agentMerge.controller" /* AgentMergeController */]: {}
    };
    this._addInjectedConfigurationRestore(patch, session, current);
    this._configurationService.updateSessionConfig(session, patch);
    this._stopRuntime(session);
  }
  /**
   * Reports an Agent Merge state change in the session transcript. A failure to
   * announce must never interrupt monitoring, so the notice is best-effort.
   */
  _postNotice(session, kind, content) {
    try {
      this._options.postNotice(session, kind, content);
    } catch (error) {
      this._logService.warn(`[AgentMergeController] Failed to post an Agent Merge notice: session=${session}`, error);
    }
  }
  _addInjectedConfigurationRestore(patch, session, agentMerge) {
    const injected = agentMerge.injectedConfiguration;
    if (!injected) {
      return;
    }
    const values = this._configurationService.getSessionConfigValues(session) ?? {};
    for (const [key, appliedValue] of Object.entries(injected.applied)) {
      if (structuralEquals(values[key], appliedValue)) {
        patch[key] = injected.previous[key];
      }
    }
  }
  _stopRuntime(session) {
    const context = this._activeTurns.get(session);
    if (context) {
      this._activeTurns.delete(session);
      if (this._stateManager.getSessionState(session)?.activeTurn?.id === context.turnId) {
        this._logService.info(`[AgentMergeController] Cancelling repair turn because Agent Merge stopped: session=${session}, turn=${context.turnId}`);
        this._options.cancelTurn(session, context.turnId);
      }
    }
    if (this._runtimes.has(session)) {
      this._runtimes.deleteAndDispose(session);
      this._logService.debug(`[AgentMergeController] Disposed session runtime: session=${session}`);
    }
    this._updateHold(session);
  }
  _hasTargetBranch(state, branchName) {
    return readSessionGitState(state?._meta)?.branchName === branchName;
  }
  /** Resolves the organization owning the bound pull request, for diagnostics. */
  _organizationForSession(session) {
    const state = this._stateManager.getSessionState(session);
    const pullRequestUrl = readAgentMergeSessionState(state?.config?.values)?.target?.pullRequestUrl;
    return pullRequestUrl ? parsePullRequestUrl(pullRequestUrl)?.owner : void 0;
  }
  /**
   * Asks the client for a credential that can read the bound pull request,
   * naming the organization to authorize when GitHub reports SAML enforcement.
   */
  _requestGitHubAuthorization(session, kind, message) {
    this._stateManager.emitAuthRequired({
      resource: this._gitHubEndpointService.getRepoResource(),
      reason: "required" /* Required */
    });
    const organization = this._organizationForSession(session);
    const remedy = isSamlEnforcementError(message) && organization ? `; the credential must be SSO-authorized for ${organization}` : "";
    this._logService.warn(`[AgentMergeController] GitHub refused the credential (${kind})${remedy}: session=${session}`);
  }
  /**
   * Requests a credential when a fragment the gate needs was refused by
   * GitHub, which only the first refresh of a subscription reports by throwing.
   */
  _reportBlockedCredential(session, runtime, snapshot) {
    const blocked = firstCredentialFailure(snapshot);
    if (!blocked) {
      runtime.reportedCredentialFailure = void 0;
      return;
    }
    if (runtime.reportedCredentialFailure === blocked.id) {
      return;
    }
    runtime.reportedCredentialFailure = blocked.id;
    this._requestGitHubAuthorization(session, blocked.kind, blocked.message);
  }
  /**
   * Reports whether one unchanged indeterminate cause has persisted past its
   * budget, measured over continuously observed time so a turn or a sleeping
   * host cannot exhaust it.
   */
  _isIndeterminateBudgetExhausted(session, runtime, cause) {
    const now = Date.now();
    const current = runtime.indeterminate;
    if (current?.cause !== cause || now - current.observedAt > indeterminateObservationGap) {
      runtime.indeterminate = { cause, since: now, observedAt: now };
      return false;
    }
    current.observedAt = now;
    if (now - current.since < maximumIndeterminateDuration) {
      return false;
    }
    this._logService.warn(`[AgentMergeController] Indeterminate budget exhausted: session=${session}, cause=${cause}`);
    return true;
  }
  _logGateResult(session, gate) {
    switch (gate.kind) {
      case "prompt":
        this._logService.debug(`[AgentMergeController] Gate selected repair: session=${session}, actions=${gate.actions.join(",")}, reviewThreads=${gate.context.reviewThreads.length}, reviewSummaries=${gate.context.reviewSummaries.length}, newComments=${gate.context.newComments.length}, failedChecks=${gate.context.failedChecks.length}, behind=${gate.context.behind}, conflicting=${gate.context.conflicting}`);
        break;
      case "merge":
        this._logService.debug(`[AgentMergeController] Gate selected native merge: session=${session}`);
        break;
      case "noWork":
        this._logService.trace(`[AgentMergeController] Gate found no work: session=${session}, waitingOnChecks=${gate.waitingOnChecks}`);
        break;
      case "indeterminate":
        this._logService.debug(`[AgentMergeController] Gate is indeterminate: session=${session}, reason=${gate.reason}`);
        break;
      case "terminal":
        this._logService.debug(`[AgentMergeController] Gate found terminal pull request state: session=${session}`);
        break;
    }
  }
};

AgentMergeController = __decorateClass([
  __decorateParam(1, IAgentHostStateManager),
  __decorateParam(2, IAgentConfigurationService),
  __decorateParam(3, IAgentHostGitStateService),
  __decorateParam(4, IAgentHostGitService),
  __decorateParam(5, IGitHubService),
  __decorateParam(6, IAgentHostGitHubEndpointService),
  __decorateParam(7, ILogService)
], AgentMergeController);

function parsePullRequestUrl(value) {
  let url2;
  try {
    url2 = new URL(value);
  } catch {
    return void 0;
  }
  const match2 = /^\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/pull\/(?<number>\d+)\/?$/.exec(url2.pathname);
  const number = Number(match2?.groups?.number);
  if (!match2?.groups || !Number.isSafeInteger(number) || number <= 0) {
    return void 0;
  }
  const host = url2.host.toLowerCase();
  return {
    owner: match2.groups.owner,
    repo: match2.groups.repo,
    number,
    // Derived rather than hard-coded so GitHub Enterprise Cloud web hosts
    // (`tenant.ghe.com`) canonicalize to the `api.` host the credential reports.
    apiHost: new URL(deriveGitHubEndpoints(`${url2.protocol}//${host}`).apiBaseUri).host.toLowerCase()
  };
}

function sameRef(left, right) {
  return left.host.toLowerCase() === right.host.toLowerCase() && left.accountId === right.accountId && left.owner.toLowerCase() === right.owner.toLowerCase() && left.repo.toLowerCase() === right.repo.toLowerCase() && left.number === right.number;
}

function shouldRunFingerprint(state, fingerprint) {
  if (state.lastPromptFingerprint !== fingerprint || !state.lastPromptAt) {
    return true;
  }
  const lastPromptAt = Date.parse(state.lastPromptAt);
  return !Number.isFinite(lastPromptAt) || Date.now() - lastPromptAt >= backstopInterval;
}

function toControllerState(current, patch) {
  const next = { ...current, ...patch };
  return {
    ...next.target ? { target: next.target } : {},
    ...next.injectedConfiguration ? { injectedConfiguration: next.injectedConfiguration } : {},
    ...next.lastPromptFingerprint ? { lastPromptFingerprint: next.lastPromptFingerprint } : {},
    ...next.lastPromptAt ? { lastPromptAt: next.lastPromptAt } : {},
    ...next.repeatedPromptCount !== void 0 ? { repeatedPromptCount: next.repeatedPromptCount } : {},
    ...next.totalPromptCount !== void 0 ? { totalPromptCount: next.totalPromptCount } : {},
    ...next.repairBaseCommit ? { repairBaseCommit: next.repairBaseCommit } : {}
  };
}

function formatOverrideKeys(state) {
  return state.overrides ? Object.keys(state.overrides).sort().join(",") || "none" : "none";
}

function githubErrorKind(error) {
  return error instanceof GitHubRequestError ? `${error.kind}${error.statusCode === void 0 ? "" : `:${error.statusCode}`}` : error instanceof Error ? error.name : typeof error;
}

function isSamlEnforcementError(message) {
  return message.toLowerCase().includes("saml enforcement");
}

function firstCredentialFailure(snapshot) {
  for (const fragment of agentMergeGateFragments) {
    const error = snapshot[fragment].error;
    if (error?.kind === "authentication" || error?.kind === "authorization") {
      return { id: `${fragment}:${error.kind}`, kind: error.kind, message: error.message };
    }
  }
  return void 0;
}
export { parsePullRequestUrl, sameRef, shouldRunFingerprint, toControllerState, formatOverrideKeys, githubErrorKind, isSamlEnforcementError, firstCredentialFailure, snapshotDebounce, backstopInterval, maximumRepeatedPromptCount, maximumTotalPromptCount, maximumIndeterminateDuration, indeterminateObservationGap, AgentMergeRuntime, AgentMergeController };
