// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostChangesetCoordinator.ts
import { Disposable } from "./module-0010.mjs";
import { ChangesetFileMonitorCoordinator } from "./module-0452.mjs";
import { IAgentHostChangesetService, META_CHANGESET_BRANCH, META_CHANGESET_SESSION, META_LEGACY_DIFFS } from "./module-0444.mjs";
import { buildBranchChangesetUri, parseChangesetUri } from "./module-0097.mjs";
import { isAhpChatChannel, parseSubagentSessionUri } from "./module-0047.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IAgentHostChangesetOperationService } from "./module-0443.mjs";
import { IAgentHostChangesetSubscriptionService } from "./module-0453.mjs";
import { IAgentHostGitStateService } from "./module-0445.mjs";
import { IInstantiationService } from "./module-0044.mjs";


// src/vs/platform/agentHost/node/agentHostChangesetCoordinator.ts
var AgentHostChangesetCoordinator = class extends Disposable {
  constructor(_stateManager, _changesetOperationService, _changesets, _changesetSubscriptions, gitStateService, instantiationService) {
    super();
    this._stateManager = _stateManager;
    this._changesetOperationService = _changesetOperationService;
    this._changesets = _changesets;
    this._changesetSubscriptions = _changesetSubscriptions;
    this._changesetFileMonitor = this._register(instantiationService.createInstance(ChangesetFileMonitorCoordinator));
    this._register(gitStateService.onDidRefreshSessionGitState((sessionStr) => this.onDidRunSessionGitStateRefresh(sessionStr)));
    this._register(gitStateService.onDidChangeSessionGitHubState((sessionStr) => this._changesetOperationService.updateOperations(sessionStr)));
    this._register(this._stateManager.onDidChangeSessionWorkingDirectories(({ session }) => this.onDidChangeSessionWorkingDirectories(session)));
  }
  // ---- Lifecycle hooks ----------------------------------------------------
  /**
   * Seeds the create-time catalogue and registers its backing changeset state
   * before `SessionReady` is dispatched.
   */
  onSessionCreated(sessionStr) {
    this._changesets.refreshChangesetCatalog(sessionStr);
    this._changesets.registerStaticChangesets(sessionStr);
  }
  /**
   * Called at session restore time. Registers the static changeset URIs
   * and reseeds them from any persisted blobs already read from the DB.
   * `metadata` must come from the same batched `getMetadataObject` call
   * `AgentService` already issues for title / read / archive / config
   * keys.
   */
  onSessionRestored(sessionStr, metadata) {
    this._changesets.refreshChangesetCatalog(sessionStr);
    this._changesets.registerStaticChangesets(sessionStr);
    this._changesets.restorePersistedStaticChangesets(sessionStr, {
      branchRaw: metadata[META_CHANGESET_BRANCH],
      sessionRaw: metadata[META_CHANGESET_SESSION],
      legacyRaw: metadata[META_LEGACY_DIFFS]
    });
    this._changesets.onWorkingDirectoryAvailable(sessionStr);
    this._changesetFileMonitor.onSessionRestored(sessionStr);
  }
  /**
   * Called when a provisional session is materialized (working directory
   * becomes known). Recomputes every current changeset subscription.
   */
  onSessionMaterialized(sessionStr) {
    this._changesets.refreshChangesetCatalog(sessionStr);
    this._changesets.onWorkingDirectoryAvailable(sessionStr);
    this._changesetFileMonitor.onSessionMaterialized(sessionStr);
  }
  onSessionDisposed(sessionStr) {
    this._changesetFileMonitor.onSessionDisposed(sessionStr);
    this._changesetSubscriptions.clearSessionSubscriptions(sessionStr);
  }
  onSessionTurnActiveChanged(sessionStr, active) {
    this._changesetFileMonitor.onSessionTurnActiveChanged(sessionStr, active);
    this._changesetOperationService.updateOperations(sessionStr);
  }
  // ---- Subscription hooks -------------------------------------------------
  /**
   * Called on every `addSubscriber` 0→1 transition. When `resource` is a
   * static changeset URI, triggers the first git-diff refresh (the
   * changeset service skips it when the working directory is not yet
   * known).
   *
   * Both {@link AgentService.subscribe} and the handshake fast-path
   * (`ProtocolServerHandler.initialSubscriptions`) call into
   * `addSubscriber`, so this single hook covers both paths.
   */
  onFirstSubscriber(resource) {
    const resourceStr = resource.toString();
    const parsed = parseChangesetUri(resourceStr);
    if (!parsed && !isAhpChatChannel(resourceStr) && this._stateManager.getSessionState(resourceStr)) {
      this._addSubscription(resourceStr, buildBranchChangesetUri(resourceStr));
      this._changesets.refreshBranchChangeset(resourceStr);
      this._changesetFileMonitor.trackSessionChanges(resourceStr, resourceStr);
      return;
    }
    if (parsed?.kind === "branch" /* Branch */) {
      this._addSubscription(parsed.sessionUri, resourceStr);
      this._changesets.refreshBranchChangeset(parsed.sessionUri);
      this._changesetFileMonitor.trackSessionChanges(resourceStr, parsed.sessionUri);
      return;
    }
    if (parsed?.kind === "uncommitted" /* Uncommitted */) {
      this._addSubscription(parsed.sessionUri, resourceStr);
      void this._changesets.computeUncommittedChangeset(parsed.sessionUri);
      this._changesetFileMonitor.trackSessionChanges(resourceStr, parsed.sessionUri);
      return;
    }
    if (parsed?.kind === "session" /* Session */) {
      this._addSubscription(parsed.sessionUri, resourceStr);
      this._changesets.refreshSessionChangeset(parsed.sessionUri);
      this._changesetFileMonitor.trackSessionChanges(resourceStr, parsed.sessionUri);
      return;
    }
    if (parsed?.kind === "turn" /* Turn */ && parsed.turnId !== void 0) {
      this._addSubscription(parsed.sessionUri, resourceStr);
      return;
    }
  }
  /**
   * Called when a resource's last subscriber drops. Removes the
   * changeset from the session's subscription set so a later
   * materialization / git-state recompute (driven by
   * {@link IAgentHostChangesetService.recomputeSubscribedChangesets})
   * naturally skips it — no explicit cancellation needed.
   */
  onLastSubscriber(resource) {
    const resourceStr = resource.toString();
    const parsed = parseChangesetUri(resourceStr);
    if (parsed?.kind === "branch" /* Branch */) {
      this._removeSubscription(parsed.sessionUri, resourceStr);
      this._changesetFileMonitor.untrackSessionChanges(resourceStr);
      return;
    }
    if (parsed?.kind === "uncommitted" /* Uncommitted */) {
      this._removeSubscription(parsed.sessionUri, resourceStr);
      this._changesetFileMonitor.untrackSessionChanges(resourceStr);
      return;
    }
    if (parsed?.kind === "session" /* Session */) {
      this._removeSubscription(parsed.sessionUri, resourceStr);
      this._changesetFileMonitor.untrackSessionChanges(resourceStr);
      return;
    }
    if (parsed?.kind === "turn" /* Turn */ && parsed.turnId !== void 0) {
      this._removeSubscription(parsed.sessionUri, resourceStr);
      return;
    }
    if (!parsed) {
      this._removeSubscription(resourceStr, resourceStr);
      this._changesetFileMonitor.untrackSessionChanges(resourceStr);
    }
  }
  /**
   * Restores the parent session when `resource` is a changeset URI and the
   * parent session is not already live. Non-changeset URIs are ignored.
   *
   * This is intentionally narrower than {@link tryHandleSubscribe}: it does
   * not compute per-turn / compare changesets and does not register static
   * changesets. It exists for the AgentService subscribe path where
   * `addSubscriber` may have already created a placeholder changeset snapshot
   * before the parent session restore had a chance to apply persisted diffs.
   */
  async restoreSessionIfChangesetSubscription(resource, restoreSession) {
    const resourceStr = resource.toString();
    const parsed = parseChangesetUri(resourceStr);
    if (!parsed) {
      return;
    }
    if (parsed.kind === "unknown" /* Unknown */) {
      throw new Error(`Cannot subscribe to unknown changeset resource: ${resourceStr}`);
    }
    if (!this._stateManager.getSessionState(parsed.sessionUri)) {
      await restoreSession(URI.parse(parsed.sessionUri));
    }
  }
  /**
   * If `resource` is a known changeset URI (uncommitted / session /
   * turn), seeds its state on the state manager and returns `true`.
   * Returns `false` for non-changeset URIs so callers fall through to
   * their default routing (session / subagent / terminal).
   *
   * The parent session is restored via the provided `restoreSession`
   * callback when no live state exists yet — this matches the previous
   * inline behaviour in `AgentService.subscribe`.
   *
   * Throws when the URI matches the changeset shape but the id is not
   * a well-known kind ({@link ChangesetKind.Unknown}). The unknown-id
   * rejection MUST fire before any parent-session restore so subscribing
   * to a bogus child URI cannot materialize the parent as a side effect.
   */
  async tryHandleSubscribe(resource, restoreSession) {
    const resourceStr = resource.toString();
    const parsed = parseChangesetUri(resourceStr);
    if (!parsed) {
      return false;
    }
    if (parsed.kind === "unknown" /* Unknown */) {
      throw new Error(`Cannot subscribe to unknown changeset resource: ${resourceStr}`);
    }
    await this.restoreSessionIfChangesetSubscription(resource, restoreSession);
    if (parsed.kind === "turn" /* Turn */ && parsed.turnId) {
      await this._changesets.computeTurnChangeset(parsed.sessionUri, parsed.turnId);
    } else if (parsed.kind === "compare-turns" /* Compare */ && parsed.originalTurnId && parsed.modifiedTurnId) {
      await this._changesets.computeCompareTurnsChangeset(parsed.sessionUri, parsed.originalTurnId, parsed.modifiedTurnId);
    } else {
      this._changesets.registerStaticChangesets(parsed.sessionUri);
    }
    return true;
  }
  _addSubscription(sessionStr, changesetStr) {
    this._changesetSubscriptions.addSubscription(sessionStr, changesetStr);
  }
  _removeSubscription(sessionStr, changesetStr) {
    this._changesetSubscriptions.removeSubscription(sessionStr, changesetStr);
  }
  // ---- listSessions overlay ----------------------------------------------
  /**
   * Returns the session-DB metadata keys to merge into a batched read
   * for `sessionStr`, OR `undefined` when live state already answers
   * the aggregate-counts question. Delegates to the changeset service,
   * which owns the live-vs-persisted decision.
   */
  getListMetadataKeys(sessionStr) {
    return this._changesets.getListMetadataKeys(sessionStr);
  }
  /**
   * Decorates a single listSessions entry with the `changes` aggregate
   * (additions / deletions / files for the session-wide changeset). The
   * aggregate computation lives in the changeset service; the coordinator
   * only projects the result onto the entry.
   */
  decorateListEntry(entry, metadata) {
    const changes = this._changesets.computeListEntryChanges(entry.session.toString(), metadata);
    return changes ? { ...entry, changes } : entry;
  }
  // ---- Git state  events -------------------------------------------------
  /**
   * Called when a session's Git state is refreshed.
   */
  onDidRunSessionGitStateRefresh(sessionStr) {
    this._changesets.refreshChangesetCatalog(sessionStr);
    this._changesets.recomputeSubscribedChangesets(sessionStr);
  }
  /**
   * Called when a session's effective working-directory set changes (a root
   * was added or removed, e.g. in the Editor Window). Multi-root suppression
   * of `turn` / `compare-turns` operations depends on this set, so recompute
   * operations for every subscribed changeset: `getOperations` re-applies the
   * guard, so those changesets drop to empty when the session becomes
   * multi-root and regain their operations when it returns to single-root.
   *
   * Subagent sessions inherit the parent's working directories
   * (`getEffectiveWorkingDirectories`), so a parent change flips their
   * multi-root state too. Refresh their operations as well, keeping the
   * advertised operations consistent with the invoke-time suppression (which
   * already uses the inherited set). `updateOperations` only dispatches for
   * subscribed changesets, so refreshing subagents without subscriptions is a
   * no-op.
   *
   * The changed set also determines which repository roots are watched for
   * external edits, so re-attach the file monitor for the session (and its
   * inheriting subagents) — otherwise a folder added or removed mid-session
   * would not start/stop being watched until an unrelated lifecycle event.
   */
  onDidChangeSessionWorkingDirectories(sessionStr) {
    this._changesetOperationService.updateOperations(sessionStr);
    this._changesetFileMonitor.onSessionWorkingDirectoriesChanged(sessionStr);
    for (const candidate of this._stateManager.getSessionUris()) {
      if (parseSubagentSessionUri(candidate)?.parentSession.toString() === sessionStr) {
        this._changesetOperationService.updateOperations(candidate);
        this._changesetFileMonitor.onSessionWorkingDirectoriesChanged(candidate);
      }
    }
  }
};

AgentHostChangesetCoordinator = __decorateClass([
  __decorateParam(0, IAgentHostStateManager),
  __decorateParam(1, IAgentHostChangesetOperationService),
  __decorateParam(2, IAgentHostChangesetService),
  __decorateParam(3, IAgentHostChangesetSubscriptionService),
  __decorateParam(4, IAgentHostGitStateService),
  __decorateParam(5, IInstantiationService)
], AgentHostChangesetCoordinator);
export { AgentHostChangesetCoordinator };
