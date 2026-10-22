// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostChangesetService.ts
import { buildBranchChangesetUri, buildCompareTurnsChangesetUri, buildDefaultChangesetCatalog, buildSessionChangesetUri, buildTurnChangesetUri, buildUncommittedChangesetUri, parseChangesetUri } from "./module-0097.mjs";
import { CHANGESET_DB_METADATA_KEYS, CHANGES_SUMMARY_METADATA_KEYS, META_CHANGESET_BRANCH, META_CHANGESET_SESSION, META_CHANGES_SUMMARY, META_LEGACY_DIFFS } from "./module-0444.mjs";
import { toErrorMessage } from "./module-0080.mjs";
import { Disposable, DisposableMap } from "./module-0010.mjs";
import { Limiter, SequencerByKey, disposableTimeout } from "./module-0027.mjs";
import { NodeWorkerDiffComputeService } from "./module-0559.mjs";
import { AgentSession } from "./module-0048.mjs";
import { StopWatch } from "./module-0015.mjs";
import { URI } from "./module-0023.mjs";
import { reportAgentHostStaticChangesetComputed, reportAgentHostTurnChangesetComputed } from "./module-0569.mjs";
import { isMultiRootSession } from "./module-0478.mjs";
import { computeSessionDiffs, computeTurnDiffs, computeUnionedDiffs } from "./module-0567.mjs";
import { isDefaultChatUri, readSessionGitState } from "./module-0047.mjs";
import { resolveSessionRepositories } from "./module-0451.mjs";
import { dedupeSessionFileDiffs, evaluateMultiRootDiffSources } from "./module-0568.mjs";
import { extUriBiasedIgnorePathCase, relativePath } from "./module-0025.mjs";
import { IAgentHostGitService, META_DIFF_BASE_BRANCH, resolveDiffBaseBranchName } from "./module-0162.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { ILogService } from "./module-0084.mjs";
import { ISessionDataService } from "./module-0139.mjs";
import { IAgentHostCheckpointService } from "./module-0131.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { IAgentHostChangesetOperationService } from "./module-0443.mjs";
import { IAgentHostChangesetSubscriptionService } from "./module-0453.mjs";
import { IAgentHostReviewService } from "./module-0132.mjs";
import { ITelemetryService } from "./module-0053.mjs";
import { IAgentHostWorktreeIsolation } from "./module-0165.mjs";


// src/vs/platform/agentHost/node/agentHostChangesetService.ts
var MAX_TURN_DIFF_REPOSITORY_CONCURRENCY = 5;

function staticChangesetUri(session, kind) {
  return kind === "branch" ? buildBranchChangesetUri(session) : buildSessionChangesetUri(session);
}

function persistKeyFor(kind) {
  return kind === "branch" ? META_CHANGESET_BRANCH : META_CHANGESET_SESSION;
}

function summariseDiffs(diffs) {
  if (!diffs) {
    return void 0;
  }
  let additions = 0;
  let deletions = 0;
  for (const d of diffs) {
    additions += d.diff?.added ?? 0;
    deletions += d.diff?.removed ?? 0;
  }
  return { additions, deletions, files: diffs.length };
}

function computeChangesSummaryFromLiveState(session) {
  const sessionDiffs = session?.status === "ready" /* Ready */ ? session.files.map((f) => f.edit) : void 0;
  return summariseDiffs(sessionDiffs);
}

function computeChangesSummaryFromPersistedDiffs(sessionDiffs) {
  return summariseDiffs(sessionDiffs);
}

function tryParsePersistedDiffs(raw, sessionUri, kind, log4) {
  if (!raw) {
    return void 0;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    log4.warn(`[AgentHostChangesetService] Failed to parse persisted ${kind} diffs for ${sessionUri}: ${toErrorMessage(err)}`);
    return void 0;
  }
}

var AgentHostChangesetService = class extends Disposable {
  constructor(_stateManager, _logService, _sessionDataService, _gitService, _checkpointService, _configurationService, _changesetOperationService, _changesetSubscriptions, _reviewService, _telemetryService, worktree) {
    super();
    this._stateManager = _stateManager;
    this._logService = _logService;
    this._sessionDataService = _sessionDataService;
    this._gitService = _gitService;
    this._checkpointService = _checkpointService;
    this._configurationService = _configurationService;
    this._changesetOperationService = _changesetOperationService;
    this._changesetSubscriptions = _changesetSubscriptions;
    this._reviewService = _reviewService;
    this._telemetryService = _telemetryService;
    /** Serializes per-session diff computations to avoid races with stale previousDiffs. */
    this._diffComputationSequencer = new SequencerByKey();
    /** Per-session debounce timers for mid-turn diff computation. */
    this._debouncedDiffTimers = this._register(new DisposableMap());
    /** Per-`(session, turnId)` debounce timers for mid-turn per-turn changeset recomputation. */
    this._perTurnDebouncedDiffTimers = this._register(new DisposableMap());
    this._activeStaticComputes = /* @__PURE__ */ new Set();
    this._worktree = worktree;
    this._diffComputeService = this._createDiffComputeService();
  }
  static {
    this._DIFF_DEBOUNCE_MS = 5e3;
  }
  /** Creates the diff-count service; overridable so tests can supply a synchronous in-process computer. */
  _createDiffComputeService() {
    return this._register(new NodeWorkerDiffComputeService(this._logService));
  }
  /**
   * Returns true when at least one client is subscribed to `changeset`
   * under `session`.
   */
  _hasSubscription(session, changeset) {
    return this._changesetSubscriptions.getSessionSubscriptions(session).has(changeset);
  }
  _hasWorkingDirectory(session) {
    return !this._worktree.isWorkingDirectoryPending(AgentSession.id(session)) && !!this._configurationService.getEffectiveWorkingDirectories(session)?.[0];
  }
  registerStaticChangesets(session) {
    this._stateManager.registerChangeset(buildBranchChangesetUri(session));
    this._stateManager.registerChangeset(buildUncommittedChangesetUri(session));
    this._stateManager.registerChangeset(buildSessionChangesetUri(session));
  }
  restoreStaticChangeset(session, kind, diffs) {
    const changesetUri = this._stateManager.registerChangeset(staticChangesetUri(session, kind));
    this._publishChangesetDiffs(session, changesetUri, diffs);
  }
  parsePersistedStaticChangesets(sessionUri, metadata) {
    const persistedBranch = tryParsePersistedDiffs(metadata.branchRaw, sessionUri, "branch", this._logService);
    const persistedSession = tryParsePersistedDiffs(metadata.sessionRaw, sessionUri, "session", this._logService) ?? tryParsePersistedDiffs(metadata.legacyRaw, sessionUri, "session (legacy)", this._logService);
    return { branch: persistedBranch, session: persistedSession };
  }
  applyPersistedStaticChangesets(sessionUri, diffs) {
    this._seedIfEmpty(sessionUri, "branch", diffs.branch);
    this._seedIfEmpty(sessionUri, "session", diffs.session);
  }
  restorePersistedStaticChangesets(sessionUri, metadata) {
    const parsed = this.parsePersistedStaticChangesets(sessionUri, metadata);
    this.applyPersistedStaticChangesets(sessionUri, parsed);
    return parsed;
  }
  persistChangesSummary(sessionUri, summary) {
    this._persistSessionFlag(sessionUri, META_CHANGES_SUMMARY, JSON.stringify(summary));
  }
  getListMetadataKeys(sessionUri) {
    const liveSummaryChanges = this._stateManager.getSessionSummary(sessionUri)?.changes;
    if (liveSummaryChanges) {
      return void 0;
    }
    const liveSession = this._stateManager.getChangesetState(buildSessionChangesetUri(sessionUri));
    if (liveSession?.status === "ready" /* Ready */) {
      return CHANGES_SUMMARY_METADATA_KEYS;
    }
    return CHANGESET_DB_METADATA_KEYS;
  }
  computeListEntryChanges(sessionUri, metadata) {
    if (this._stateManager.getSessionState(sessionUri)) {
      return void 0;
    }
    const changesSummary = metadata[META_CHANGES_SUMMARY];
    if (changesSummary !== void 0) {
      try {
        return JSON.parse(changesSummary);
      } catch (error) {
        return void 0;
      }
    }
    const liveSession = this._stateManager.getChangesetState(buildBranchChangesetUri(sessionUri));
    const liveChanges = computeChangesSummaryFromLiveState(liveSession);
    if (liveChanges) {
      this.persistChangesSummary(sessionUri, liveChanges);
      return liveChanges;
    }
    const branchRaw = metadata[META_CHANGESET_BRANCH];
    const legacyRaw = metadata[META_LEGACY_DIFFS];
    if (branchRaw === void 0 && legacyRaw === void 0) {
      return void 0;
    }
    const restored = this.parsePersistedStaticChangesets(sessionUri, { branchRaw, legacyRaw });
    const persistedChanges = computeChangesSummaryFromPersistedDiffs(restored.branch);
    if (persistedChanges) {
      this.persistChangesSummary(sessionUri, persistedChanges);
      return persistedChanges;
    }
    return void 0;
  }
  isStaticChangesetComputeActive(changesetUri) {
    return this._activeStaticComputes.has(changesetUri);
  }
  _seedIfEmpty(session, kind, diffs) {
    if (!diffs) {
      return;
    }
    const existing = this._stateManager.getChangesetState(staticChangesetUri(session, kind));
    if (existing && existing.files.length > 0) {
      return;
    }
    this.restoreStaticChangeset(session, kind, diffs);
  }
  refreshChangesetCatalog(session) {
    const state = this._stateManager.getSessionState(session);
    if (!state || state?.lifecycle === "failed" /* Failed */) {
      return;
    }
    const changesets = buildDefaultChangesetCatalog(session, state);
    this._stateManager.setSessionChangesets(session, changesets);
  }
  refreshBranchChangeset(session) {
    if (!this._hasWorkingDirectory(session)) {
      return;
    }
    this._scheduleStaticRecompute(session, "branch", void 0, this._markStaticChangesetComputing(session, "branch"));
  }
  refreshSessionChangeset(session) {
    if (!this._hasWorkingDirectory(session)) {
      return;
    }
    this._scheduleStaticRecompute(session, "session", void 0, this._markStaticChangesetComputing(session, "session"));
  }
  /**
   * Recomputes every changeset currently subscribed when a session is
   * materialized or restored.
   */
  onWorkingDirectoryAvailable(session) {
    this.recomputeSubscribedChangesets(session);
  }
  /**
   * Recomputes every changeset currently subscribed for `session`. Each
   * subscribed changeset is dispatched to its kind-specific recompute; the
   * recomputes skip while the working directory is still unknown.
   */
  recomputeSubscribedChangesets(session) {
    const subscriptions = this._changesetSubscriptions.getSessionSubscriptions(session);
    if (subscriptions.size === 0) {
      return;
    }
    for (const changeset of subscriptions) {
      const parsed = parseChangesetUri(changeset);
      switch (parsed?.kind) {
        case "branch" /* Branch */:
          this.refreshBranchChangeset(session);
          break;
        case "session" /* Session */:
          this.refreshSessionChangeset(session);
          break;
        case "uncommitted" /* Uncommitted */:
          void this.computeUncommittedChangeset(session);
          break;
        case "turn" /* Turn */:
          if (parsed.turnId !== void 0) {
            void this.computeTurnChangeset(session, parsed.turnId);
          }
          break;
        default:
          if (changeset === session) {
            this.refreshBranchChangeset(session);
            this.refreshSessionChangeset(session);
          }
          break;
      }
    }
  }
  computeTurnChangeset(session, turnId) {
    return this._computeTurnChangeset(session, turnId, false);
  }
  async _computeTurnChangeset(session, turnId, reportTelemetry, clientContext) {
    const turnUri = this._stateManager.registerChangeset(buildTurnChangesetUri(session, turnId));
    if (this._stateManager.getChangesetState(turnUri)?.status !== "computing" /* Computing */) {
      this._stateManager.dispatchServerAction(turnUri, {
        type: "changeset/statusChanged" /* ChangesetStatusChanged */,
        status: "computing" /* Computing */
      });
    }
    const stopWatch = StopWatch.create();
    let outcome = "error";
    let result;
    let fileCount;
    try {
      let ref;
      try {
        ref = this._sessionDataService.openDatabase(URI.parse(session));
      } catch (err) {
        this._logService.warn(`[AgentHostChangesetService] Failed to open session database for turn diff: ${session}`, err);
        this._stateManager.dispatchServerAction(turnUri, {
          type: "changeset/statusChanged" /* ChangesetStatusChanged */,
          status: "error" /* Error */,
          error: { errorType: "computeFailed", message: err instanceof Error ? err.message : String(err) }
        });
        outcome = "dbOpenFailed";
        return turnUri;
      }
      try {
        result = await this._computeTurnDiffsPreferCheckpoint(session, ref.object, turnId);
        outcome = result.outcome;
        fileCount = result.diffs.length;
        this._publishChangesetDiffs(session, turnUri, result.diffs);
      } catch (err) {
        this._logService.warn(`[AgentHostChangesetService] Failed to compute turn diffs for ${session}/${turnId}`, err);
        this._stateManager.dispatchServerAction(turnUri, {
          type: "changeset/statusChanged" /* ChangesetStatusChanged */,
          status: "error" /* Error */,
          error: { errorType: "computeFailed", message: err instanceof Error ? err.message : String(err) }
        });
        outcome = "error";
      } finally {
        ref.dispose();
      }
      return turnUri;
    } finally {
      if (reportTelemetry) {
        const workingDirectories = this._configurationService.getEffectiveWorkingDirectories(session);
        reportAgentHostTurnChangesetComputed(this._telemetryService, session, turnId, {
          outcome,
          durationMs: stopWatch.elapsed(),
          isMultiRoot: isMultiRootSession(workingDirectories),
          folderCount: workingDirectories?.length ?? 0,
          ...outcome === "computed" && fileCount !== void 0 ? { fileCount } : {},
          multiRoot: result?.multiRoot
        }, clientContext);
      }
    }
  }
  async computeCompareTurnsChangeset(session, originalTurnId, modifiedTurnId) {
    const compareUri = this._stateManager.registerChangeset(buildCompareTurnsChangesetUri(session, originalTurnId, modifiedTurnId));
    let ref;
    try {
      ref = this._sessionDataService.openDatabase(URI.parse(session));
    } catch (err) {
      this._logService.warn(`[AgentHostChangesetService] Failed to open session database for compare-turns diff: ${session}`, err);
      this._stateManager.dispatchServerAction(compareUri, {
        type: "changeset/statusChanged" /* ChangesetStatusChanged */,
        status: "error" /* Error */,
        error: { errorType: "computeFailed", message: err instanceof Error ? err.message : String(err) }
      });
      return compareUri;
    }
    try {
      const sessionUri = URI.parse(session);
      const [originalCurrentRef, modifiedPair] = await Promise.all([
        this._checkpointService.getTurnCheckpointPair(sessionUri, originalTurnId).then((p) => p?.current),
        this._checkpointService.getTurnCheckpointPair(sessionUri, modifiedTurnId)
      ]);
      if (!originalCurrentRef || !modifiedPair) {
        const missing = !originalCurrentRef && !modifiedPair ? "both turns" : !originalCurrentRef ? "original turn" : "modified turn";
        this._stateManager.dispatchServerAction(compareUri, {
          type: "changeset/statusChanged" /* ChangesetStatusChanged */,
          status: "error" /* Error */,
          error: { errorType: "computeFailed", message: `No checkpoint available for ${missing}; compare requires git-backed sessions.` }
        });
        return compareUri;
      }
      if (originalCurrentRef === modifiedPair.current) {
        this._publishChangesetDiffs(session, compareUri, []);
        return compareUri;
      }
      const workingDir = await this._resolveWorkingDirectory(session);
      if (!workingDir) {
        this._stateManager.dispatchServerAction(compareUri, {
          type: "changeset/statusChanged" /* ChangesetStatusChanged */,
          status: "error" /* Error */,
          error: { errorType: "computeFailed", message: "No working directory recorded for session; compare requires git-backed sessions." }
        });
        return compareUri;
      }
      const diffs = await this._gitService.computeFileDiffsBetweenRefs(workingDir, {
        sessionUri: session,
        fromRef: originalCurrentRef,
        toRef: modifiedPair.current
      });
      if (diffs === void 0) {
        this._stateManager.dispatchServerAction(compareUri, {
          type: "changeset/statusChanged" /* ChangesetStatusChanged */,
          status: "error" /* Error */,
          error: { errorType: "computeFailed", message: `Failed to compute compare-turns diff from git (${originalCurrentRef}..${modifiedPair.current}).` }
        });
        return compareUri;
      }
      this._publishChangesetDiffs(session, compareUri, diffs);
    } catch (err) {
      this._logService.warn(`[AgentHostChangesetService] Failed to compute compare-turns diffs for ${session}/${originalTurnId}/${modifiedTurnId}`, err);
      this._stateManager.dispatchServerAction(compareUri, {
        type: "changeset/statusChanged" /* ChangesetStatusChanged */,
        status: "error" /* Error */,
        error: { errorType: "computeFailed", message: err instanceof Error ? err.message : String(err) }
      });
    } finally {
      ref.dispose();
    }
    return compareUri;
  }
  computeUncommittedChangeset(session) {
    return this._queueUncommittedChangeset(session, void 0, false);
  }
  async _computeUncommittedChangeset(session, turnId, reportTelemetry, clientContext) {
    const uncommittedUri = this._stateManager.registerChangeset(buildUncommittedChangesetUri(session));
    if (!this._hasSubscription(session, uncommittedUri)) {
      return uncommittedUri;
    }
    const workingDirectory = this._stateManager.getSessionState(session)?.workingDirectories?.[0];
    if (!workingDirectory) {
      return uncommittedUri;
    }
    const statusBeforeCompute = this._stateManager.getChangesetState(uncommittedUri)?.status;
    if (statusBeforeCompute !== "computing" /* Computing */) {
      this._stateManager.dispatchServerAction(uncommittedUri, {
        type: "changeset/statusChanged" /* ChangesetStatusChanged */,
        status: "computing" /* Computing */
      });
    }
    const stopWatch = StopWatch.create();
    const workingDirectories = this._configurationService.getEffectiveWorkingDirectories(session);
    let outcome = "error";
    let fileCount;
    try {
      const diffs = await this._computeUncommittedDiffs(session);
      if (diffs === void 0) {
        this._stateManager.dispatchServerAction(uncommittedUri, {
          type: "changeset/statusChanged" /* ChangesetStatusChanged */,
          status: "error" /* Error */,
          error: { errorType: "computeFailed", message: "Failed to compute uncommitted diff from git." }
        });
        outcome = "gitUnavailable";
        return uncommittedUri;
      }
      this._publishChangesetDiffs(session, uncommittedUri, diffs);
      fileCount = diffs.length;
      outcome = "computed";
    } catch (err) {
      this._logService.warn(`[AgentHostChangesetService] Failed to compute uncommitted diffs for ${session}`, err);
      this._stateManager.dispatchServerAction(uncommittedUri, {
        type: "changeset/statusChanged" /* ChangesetStatusChanged */,
        status: "error" /* Error */,
        error: { errorType: "computeFailed", message: err instanceof Error ? err.message : String(err) }
      });
      outcome = "error";
    } finally {
      if (reportTelemetry) {
        reportAgentHostStaticChangesetComputed(this._telemetryService, session, turnId, {
          kind: "uncommitted",
          outcome,
          durationMs: stopWatch.elapsed(),
          isMultiRoot: isMultiRootSession(workingDirectories),
          folderCount: workingDirectories?.length ?? 0,
          ...outcome === "computed" && fileCount !== void 0 ? { fileCount } : {}
        }, clientContext);
      }
    }
    return uncommittedUri;
  }
  async _computeUncommittedDiffs(session) {
    const workingDirectory = this._stateManager.getSessionState(session)?.workingDirectories?.[0];
    if (!workingDirectory) {
      return void 0;
    }
    let workingDirectoryUri;
    try {
      workingDirectoryUri = URI.parse(workingDirectory);
    } catch {
      return void 0;
    }
    return this._gitService.computeSessionFileDiffs(workingDirectoryUri, {
      sessionUri: session
    });
  }
  async _computeTurnDiffsPreferCheckpoint(session, db, turnId) {
    const trackedSource = this._openTrackedTurnSource(session, db, turnId);
    try {
      if (!trackedSource.sessionUri) {
        return { diffs: [], outcome: "computed" };
      }
      const workingDirectories = this._configurationService.getEffectiveWorkingDirectories(session);
      if (isMultiRootSession(workingDirectories)) {
        return await this._computeMultiFolderTurnDiffs(session, trackedSource.sessionUri, trackedSource.db, turnId, workingDirectories);
      }
      const diffs = await this._computeSingleFolderTurnDiffs(session, trackedSource.sessionUri, trackedSource.db, turnId);
      return { diffs, outcome: "computed" };
    } finally {
      trackedSource.dispose();
    }
  }
  /**
   * The single-folder per-turn diff: prefer the checkpoint-ref git diff of the
   * primary working directory, else fall back to the SDK-tracked aggregator.
   */
  async _computeSingleFolderTurnDiffs(session, trackedSession, db, turnId) {
    const pair = await this._checkpointService.getTurnCheckpointPair(URI.parse(session), turnId);
    if (pair && pair.parent !== pair.current) {
      const workingDir = await this._resolveWorkingDirectory(session);
      if (workingDir) {
        const fromRefDiffs = await this._gitService.computeFileDiffsBetweenRefs(workingDir, {
          sessionUri: session,
          fromRef: pair.parent,
          toRef: pair.current
        });
        if (fromRefDiffs) {
          return fromRefDiffs;
        }
      }
    } else if (pair && pair.parent === pair.current) {
      return [];
    }
    return computeTurnDiffs(trackedSession, db, this._diffComputeService, turnId);
  }
  _openTrackedTurnSource(session, defaultDatabase, turnId) {
    const sessionState = this._stateManager.getSessionState(session);
    if (!sessionState) {
      return { sessionUri: session, db: defaultDatabase, dispose: () => {
      } };
    }
    const owningResources = [];
    if (sessionState.activeTurn?.id === turnId || (sessionState.turns ?? []).some((turn) => turn.id === turnId)) {
      owningResources.push(session);
    }
    for (const chat2 of sessionState.chats ?? []) {
      if (isDefaultChatUri(chat2.resource)) {
        continue;
      }
      const chatState = this._stateManager.getChatState(chat2.resource);
      if (chatState?.activeTurn?.id === turnId || chatState?.turns.some((turn) => turn.id === turnId)) {
        owningResources.push(chat2.resource);
      }
    }
    if (owningResources.length > 1) {
      this._logService.warn(`[AgentHostChangesetService] Turn id ${turnId} is shared by multiple chats in ${session}; skipping ambiguous tracked-file fallback`);
      return { sessionUri: void 0, db: defaultDatabase, dispose: () => {
      } };
    }
    if (owningResources.length === 0 || owningResources[0] === session) {
      return { sessionUri: session, db: defaultDatabase, dispose: () => {
      } };
    }
    const chat = owningResources[0];
    const chatDatabase = this._sessionDataService.openDatabase(URI.parse(chat));
    return { sessionUri: chat, db: chatDatabase.object, dispose: () => chatDatabase.dispose() };
  }
  /**
   * The multi-folder per-turn diff: diff each unique git repository once (in
   * parallel) from its checkpoint pair and add the tracked edits scoped to
   * the non-git folders. Per-folder failures are logged and skipped so one
   * folder never fails the whole turn changeset.
   */
  async _computeMultiFolderTurnDiffs(session, trackedSession, db, turnId, workingDirectories) {
    const sessionUri = URI.parse(session);
    const workingDirectoryUris = this._parseWorkingDirectoryUris(session, workingDirectories);
    let gitRepositories;
    let nonGitDirectories;
    try {
      ({ gitRepositories, nonGitDirectories } = await resolveSessionRepositories(workingDirectoryUris, this._gitService, (directory, err) => {
        this._logService.error(`[AgentHostChangesetService] Failed to resolve repository root for ${directory.toString()} in multi-folder turn ${session}/${turnId}; treating it as a non-git folder.`, err);
      }));
    } catch (err) {
      this._logService.error(`[AgentHostChangesetService] Failed to resolve repositories for multi-folder turn ${session}/${turnId}`, err);
      return { diffs: [], outcome: "resolveFailed" };
    }
    const limiter = new Limiter(MAX_TURN_DIFF_REPOSITORY_CONCURRENCY);
    const [perRepoDiffs, nonGitDiffs] = await Promise.all([
      Promise.all(gitRepositories.map((repoRoot) => limiter.queue(() => this._computeRepoTurnDiffs(session, trackedSession, sessionUri, db, turnId, repoRoot)))),
      this._computeNonGitTurnDiffsFromTrackedEdits(session, trackedSession, db, turnId, nonGitDirectories)
    ]).finally(() => limiter.dispose());
    const diffs = dedupeSessionFileDiffs([...perRepoDiffs.map((r) => r.diffs), nonGitDiffs]);
    return {
      diffs,
      outcome: "computed",
      multiRoot: {
        uniqueGitFolderCount: gitRepositories.length,
        nonGitFolderCount: nonGitDirectories.length,
        trackedEditFallbackFolderCount: perRepoDiffs.filter((r) => r.usedFallback).length
      }
    };
  }
  /**
   * Computes one git repository's per-turn diff from its checkpoint pair.
   * When the git diff is unavailable (missing checkpoint pair, `undefined`
   * diff, or an error), that repository falls back to its tracked edits so
   * one repo's git failure never drops the folder — mirroring the
   * single-folder path's edit-tracker fallback. `usedFallback` reports whether
   * that fallback was taken. Missing checkpoints are expected for older turns;
   * actual git failures are logged as errors.
   */
  async _computeRepoTurnDiffs(session, trackedSession, sessionUri, db, turnId, repoRoot) {
    try {
      const pair = await this._checkpointService.getTurnCheckpointPair(sessionUri, turnId, repoRoot);
      if (!pair) {
        this._logService.trace(`[AgentHostChangesetService] No checkpoint pair for multi-folder turn ${session}/${turnId} in repository ${repoRoot.toString()}; falling back to tracked edits for that repository.`);
        return { diffs: await this._computeRepoTurnDiffsFromTrackedEdits(session, trackedSession, db, turnId, repoRoot), usedFallback: true };
      }
      if (pair.parent === pair.current) {
        return { diffs: [], usedFallback: false };
      }
      const diffs = await this._gitService.computeFileDiffsBetweenRefs(repoRoot, {
        sessionUri: session,
        fromRef: pair.parent,
        toRef: pair.current
      });
      if (!diffs) {
        this._logService.error(`[AgentHostChangesetService] Git turn diff unavailable for multi-folder turn ${session}/${turnId} in repository ${repoRoot.toString()}; falling back to tracked edits for that repository.`);
        return { diffs: await this._computeRepoTurnDiffsFromTrackedEdits(session, trackedSession, db, turnId, repoRoot), usedFallback: true };
      }
      return { diffs, usedFallback: false };
    } catch (err) {
      this._logService.error(`[AgentHostChangesetService] Failed to compute git turn diff for multi-folder turn ${session}/${turnId} in repository ${repoRoot.toString()}; falling back to tracked edits for that repository.`, err);
      return { diffs: await this._computeRepoTurnDiffsFromTrackedEdits(session, trackedSession, db, turnId, repoRoot), usedFallback: true };
    }
  }
  /**
   * Computes one git repository's per-turn diff from the **edit tracker's
   * recorded file edits** (the session DB `file_edits` table written by
   * `FileEditTracker`), scoped to that repo root — NOT from git.
   *
   * Used as the per-repo fallback when the repository's git turn diff is
   * unavailable (missing checkpoint pair, `undefined` diff, or an error).
   * Unlike the git path, this only sees changes the agent made through tracked
   * edits. Scoping to the repo root keeps the git/non-git partition intact.
   * Logs and returns an empty list if the fallback itself fails, so the folder
   * contributes nothing rather than failing the whole turn.
   */
  async _computeRepoTurnDiffsFromTrackedEdits(session, trackedSession, db, turnId, repoRoot) {
    try {
      return await computeTurnDiffs(trackedSession, db, this._diffComputeService, turnId, [repoRoot]);
    } catch (err) {
      this._logService.error(`[AgentHostChangesetService] Tracked-edit fallback turn diff failed for multi-folder turn ${session}/${turnId} in repository ${repoRoot.toString()}`, err);
      return [];
    }
  }
  /**
   * Computes the session's non-git folders' per-turn diff from the **edit
   * tracker's recorded file edits** (the session DB `file_edits` table written
   * by `FileEditTracker`), scoped to those folder roots. Non-git folders have
   * no git to diff, so tracked edits are their only source (not a fallback).
   *
   * Scoping to the non-git roots keeps the git/non-git partition intact, so
   * git-folder edits (already covered by their git diff) are not
   * double-counted. Returns an empty list when there are no non-git folders,
   * and logs and returns an empty list on failure, so this never fails the
   * whole turn.
   */
  async _computeNonGitTurnDiffsFromTrackedEdits(session, trackedSession, db, turnId, nonGitDirectories) {
    if (nonGitDirectories.length === 0) {
      return [];
    }
    try {
      return await computeTurnDiffs(trackedSession, db, this._diffComputeService, turnId, nonGitDirectories);
    } catch (err) {
      this._logService.error(`[AgentHostChangesetService] Failed to compute non-git tracked-edit turn diff for multi-folder turn ${session}/${turnId}`, err);
      return [];
    }
  }
  /**
   * Parses a session's working-directory strings into URIs, logging and
   * skipping any that fail to parse so a malformed entry never fails the turn.
   */
  _parseWorkingDirectoryUris(session, workingDirectories) {
    const uris = [];
    for (const workingDirectory of workingDirectories) {
      try {
        uris.push(URI.parse(workingDirectory));
      } catch (err) {
        this._logService.warn(`[AgentHostChangesetService] Skipping unparseable working directory '${workingDirectory}' for session ${session}`, err);
      }
    }
    return uris;
  }
  /**
   * Recomputes and publishes the all-folder `summary.changes` chip for a
   * multi-folder session, writing both `META_CHANGES_SUMMARY` and the in-memory
   * summary. Sums every git repo's branch delta plus the non-git folders' edits
   * recorded by the edit tracker (`FileEditTracker`). Per-repo failures are
   * skipped and the fan-out runs at bounded concurrency; if all sources fail
   * the cached summary is preserved instead of writing zero.
   */
  async _updateMultiFolderChangesSummary(session, db, workingDirectories, primaryBranchDiffs) {
    const workingDirectoryUris = this._parseWorkingDirectoryUris(session, workingDirectories);
    let gitRepositories;
    let nonGitDirectories;
    try {
      ({ gitRepositories, nonGitDirectories } = await resolveSessionRepositories(workingDirectoryUris, this._gitService));
    } catch (err) {
      this._logService.error(`[AgentHostChangesetService] Failed to resolve repositories for multi-folder branch summary ${session}`, err);
      return;
    }
    const primaryRepositoryRoot = workingDirectoryUris.length > 0 ? await this._gitService.getRepositoryRoot(workingDirectoryUris[0]) : void 0;
    const primaryRepositoryKey = primaryRepositoryRoot ? extUriBiasedIgnorePathCase.getComparisonKey(primaryRepositoryRoot) : void 0;
    const sessionBaseBranch = await this._resolveBranchBaseBranch(session, db);
    const limiter = new Limiter(MAX_TURN_DIFF_REPOSITORY_CONCURRENCY);
    const [perRepoDiffs, nonGitDiffs] = await Promise.all([
      Promise.all(gitRepositories.map((repoRoot) => limiter.queue(async () => {
        try {
          const isPrimary = primaryRepositoryKey !== void 0 && extUriBiasedIgnorePathCase.getComparisonKey(repoRoot) === primaryRepositoryKey;
          if (isPrimary && primaryBranchDiffs) {
            return primaryBranchDiffs;
          }
          const baseBranch = isPrimary ? sessionBaseBranch : (await this._gitService.getDefaultBranch(repoRoot))?.name;
          return await this._computeRepoBranchDiffs(session, repoRoot, baseBranch);
        } catch (err) {
          this._logService.error(`[AgentHostChangesetService] Failed to compute branch diff for multi-folder branch summary ${session} in repository ${repoRoot.toString()}`, err);
          return void 0;
        }
      }))),
      this._computeNonGitBranchDiffs(session, db, nonGitDirectories)
    ]).finally(() => limiter.dispose());
    const orderedSources = [...perRepoDiffs];
    if (nonGitDirectories.length > 0) {
      orderedSources.push(nonGitDiffs);
    }
    const evaluation = evaluateMultiRootDiffSources(orderedSources);
    if (evaluation.outcome === "failed") {
      this._logService.warn(`[AgentHostChangesetService] No diff source available for multi-folder branch summary ${session}; preserving the cached summary.`);
      return;
    }
    let additions = 0;
    let deletions = 0;
    let files = 0;
    for (const diffs of evaluation.availableSources) {
      const summary = summariseDiffs(diffs);
      if (summary) {
        additions += summary.additions ?? 0;
        deletions += summary.deletions ?? 0;
        files += summary.files ?? 0;
      }
    }
    const changesSummary = { additions, deletions, files };
    this.persistChangesSummary(session, changesSummary);
    this._stateManager.setSessionSummaryChanges(session, changesSummary);
  }
  /**
   * Computes one git repository's branch diff for the multi-folder summary,
   * logging and returning `undefined` on any failure so a single repo never
   * fails the whole aggregate and an unavailable repo is counted as such (not
   * as a spurious zero). Uses the same `computeSessionFileDiffs` primitive as
   * the primary branch changeset, threading the resolved `baseBranch` so
   * committed-on-branch work is counted (not just uncommitted).
   */
  async _computeRepoBranchDiffs(session, repoRoot, baseBranch) {
    try {
      const diffs = await this._gitService.computeSessionFileDiffs(repoRoot, { sessionUri: session, baseBranch });
      if (!diffs) {
        this._logService.error(`[AgentHostChangesetService] Git branch diff unavailable for multi-folder branch summary ${session} in repository ${repoRoot.toString()}; skipping that repository.`);
        return void 0;
      }
      return diffs;
    } catch (err) {
      this._logService.error(`[AgentHostChangesetService] Failed to compute git branch diff for multi-folder branch summary ${session} in repository ${repoRoot.toString()}`, err);
      return void 0;
    }
  }
  /**
   * The session-level DB-tracked edits for the non-git folders, scoped to
   * those roots so the multi-folder summary counts non-git folder changes
   * (git folders are already covered by their branch diff, and the git/non-git
   * partition keeps the two disjoint). Uses full-session aggregation so a file
   * edited across several turns counts once. Callers only treat this as a
   * source when there ARE non-git folders; it returns `undefined` on failure
   * so a failed non-git source is counted as unavailable rather than empty.
   */
  async _computeNonGitBranchDiffs(session, db, nonGitDirectories) {
    if (nonGitDirectories.length === 0) {
      return [];
    }
    try {
      return await computeSessionDiffs(session, db, this._diffComputeService, void 0, nonGitDirectories);
    } catch (err) {
      this._logService.error(`[AgentHostChangesetService] Failed to compute non-git DB branch summary for multi-folder session ${session}`, err);
      return void 0;
    }
  }
  async _resolveWorkingDirectory(session) {
    const workingDirectories = this._configurationService.getEffectiveWorkingDirectories(session);
    return workingDirectories && workingDirectories.length > 0 ? URI.parse(workingDirectories[0]) : void 0;
  }
  // ---- Lifecycle hooks invoked by AgentSideEffects -----------------------
  onToolCallEditsApplied(session, turnId, clientContext) {
    this._scheduleDebouncedDiffComputation(session, turnId, clientContext);
    if (this._hasSubscription(session, buildTurnChangesetUri(session, turnId))) {
      this._scheduleDebouncedTurnDiffComputation(session, turnId, clientContext);
    }
  }
  onTurnComplete(session, turnId, clientContext) {
    this._cancelDebouncedDiffComputation(session);
    if (turnId !== void 0) {
      this._cancelDebouncedTurnDiffComputation(session, turnId);
      if (this._hasSubscription(session, buildTurnChangesetUri(session, turnId))) {
        this._scheduleTurnRecompute(session, turnId, true, clientContext);
      }
    }
    if (this._hasSubscription(session, buildUncommittedChangesetUri(session))) {
      this._scheduleUncommittedRecompute(session, turnId, true, clientContext);
    }
    this._scheduleStaticRecompute(session, "branch", turnId, void 0, true, clientContext);
    this._scheduleStaticRecompute(session, "session", turnId, void 0, true, clientContext);
  }
  onSessionTruncated(session) {
    this._scheduleStaticRecompute(session, "branch", void 0, void 0, true);
    this._scheduleStaticRecompute(session, "session", void 0, void 0, true);
  }
  // ---- Internal compute pipeline -----------------------------------------
  /**
   * Schedules a debounced session-changeset recomputation. Uncommitted
   * recomputes ride the same turn-complete path; mid-turn debounce only
   * makes sense for the SDK-tracked session-wide diff (which sees fresh
   * `tool_complete` events between turn boundaries).
   */
  _scheduleDebouncedDiffComputation(session, turnId, clientContext) {
    this._debouncedDiffTimers.set(session, disposableTimeout(() => {
      this._debouncedDiffTimers.deleteAndDispose(session);
      this._scheduleStaticRecompute(session, "branch", turnId, void 0, false, clientContext);
      this._scheduleStaticRecompute(session, "session", turnId, void 0, false, clientContext);
    }, AgentHostChangesetService._DIFF_DEBOUNCE_MS));
  }
  /**
   * Cancels any pending debounced diff computation for a session.
   * Called at turn end before the final (non-debounced) computation.
   */
  _cancelDebouncedDiffComputation(session) {
    this._debouncedDiffTimers.deleteAndDispose(session);
  }
  /**
   * Schedules a debounced per-turn changeset recomputation. Mirrors
   * {@link _scheduleDebouncedDiffComputation} but uses a per-
   * `(session, turnId)` map key so a long-running per-turn compute
   * doesn't block the static session recompute path (and vice versa).
   */
  _scheduleDebouncedTurnDiffComputation(session, turnId, clientContext) {
    const key = `${session}\0${turnId}`;
    this._perTurnDebouncedDiffTimers.set(key, disposableTimeout(() => {
      this._perTurnDebouncedDiffTimers.deleteAndDispose(key);
      this._scheduleTurnRecompute(session, turnId, false, clientContext);
    }, AgentHostChangesetService._DIFF_DEBOUNCE_MS));
  }
  /**
   * Cancels any pending debounced per-turn diff computation for a
   * `(session, turnId)`. Called at turn end before the final
   * (non-debounced) per-turn computation.
   */
  _cancelDebouncedTurnDiffComputation(session, turnId) {
    this._perTurnDebouncedDiffTimers.deleteAndDispose(`${session}\0${turnId}`);
  }
  /**
   * Queues a per-turn recompute on a per-`(session, turnId)` sequencer
   * key so back-to-back recomputes for the same turn serialise, but
   * recomputes for different turns (or for the static `session` /
   * `uncommitted` slots) run independently. Fire-and-forget — failures
   * are logged inside `computeTurnChangeset` and do not fail the turn.
   */
  _scheduleTurnRecompute(session, turnId, reportTelemetry = false, clientContext) {
    this._diffComputationSequencer.queue(`${session}\0turn\0${turnId}`, () => this._computeTurnChangeset(session, turnId, reportTelemetry, clientContext).then(() => void 0));
  }
  _scheduleUncommittedRecompute(session, turnId, reportTelemetry = false, clientContext) {
    void this._queueUncommittedChangeset(session, turnId, reportTelemetry, clientContext);
  }
  _queueUncommittedChangeset(session, turnId, reportTelemetry, clientContext) {
    return this._diffComputationSequencer.queue(`${session}\0uncommitted`, () => this._computeUncommittedChangeset(session, turnId, reportTelemetry, clientContext));
  }
  /**
   * Schedules a static changeset (`uncommitted` or `session`) recompute,
   * serialised per-session so back-to-back triggers don't race against
   * stale `previousDiffs` reads. Fire-and-forget — failures are logged
   * but do not fail the turn.
   */
  _scheduleStaticRecompute(session, kind, changedTurnId, statusBeforeRefresh, reportTelemetry = false, clientContext) {
    this._diffComputationSequencer.queue(`${session}\0${kind}`, () => this._doComputeStaticChangeset(session, kind, changedTurnId, statusBeforeRefresh, reportTelemetry, clientContext));
  }
  _markStaticChangesetComputing(session, kind) {
    const changesetUri = staticChangesetUri(session, kind);
    this._stateManager.registerChangeset(changesetUri);
    const status = this._stateManager.getChangesetState(changesetUri)?.status;
    if (status !== "computing" /* Computing */) {
      this._stateManager.dispatchServerAction(changesetUri, {
        type: "changeset/statusChanged" /* ChangesetStatusChanged */,
        status: "computing" /* Computing */
      });
    }
    return status;
  }
  async _doComputeStaticChangeset(session, kind, changedTurnId, statusBeforeRefresh, reportTelemetry = false, clientContext) {
    const changesetUri = staticChangesetUri(session, kind);
    const stopWatch = StopWatch.create();
    const workingDirectories = this._configurationService.getEffectiveWorkingDirectories(session);
    let outcome = "error";
    let fileCount = 0;
    let incrementalUsed = false;
    let usedEditTrackerFallback = false;
    const emitStaticTelemetry = () => {
      if (reportTelemetry) {
        reportAgentHostStaticChangesetComputed(this._telemetryService, session, changedTurnId, {
          kind,
          outcome,
          durationMs: stopWatch.elapsed(),
          isMultiRoot: isMultiRootSession(workingDirectories),
          folderCount: workingDirectories?.length ?? 0,
          ...outcome === "computed" ? { fileCount } : {},
          ...kind === "session" ? { incrementalUsed, usedEditTrackerFallback } : {}
        }, clientContext);
      }
    };
    this._activeStaticComputes.add(changesetUri);
    const statusBeforeCompute = statusBeforeRefresh ?? this._stateManager.getChangesetState(changesetUri)?.status;
    let ref;
    try {
      ref = this._sessionDataService.openDatabase(URI.parse(session));
    } catch (err) {
      this._logService.warn(`[AgentHostChangesetService] Failed to open session database for ${kind} diff computation: ${session}`, err);
      this._restoreStaticChangesetStatus(changesetUri, statusBeforeCompute);
      this._activeStaticComputes.delete(changesetUri);
      this._stateManager.onChangesetLivenessChanged();
      outcome = "dbOpenFailed";
      emitStaticTelemetry();
      return;
    }
    this._stateManager.registerChangeset(changesetUri);
    try {
      let diffs = await this._tryComputeGitDiffs(session, ref.object, kind);
      if (!diffs) {
        if (kind === "branch") {
          const workingDirectories2 = this._configurationService.getEffectiveWorkingDirectories(session);
          if (isMultiRootSession(workingDirectories2)) {
            await this._updateMultiFolderChangesSummary(session, ref.object, workingDirectories2);
          }
          this._logService.debug(`[AgentHostChangesetService] Branch git diff unavailable for ${session}; preserving cached changeset. previousStatus=${statusBeforeCompute ?? "unknown"} cachedFiles=${this._stateManager.getChangesetState(changesetUri)?.files.length ?? 0}`);
          this._restoreStaticChangesetStatus(changesetUri, statusBeforeCompute);
          outcome = "preserved";
          return;
        }
        usedEditTrackerFallback = true;
        const peerSources = this._openPeerChatSources(session);
        try {
          if (peerSources.length > 0) {
            const sources = [
              { sessionUri: session, db: ref.object },
              ...peerSources.map((p) => ({ sessionUri: p.sessionUri, db: p.ref.object }))
            ];
            diffs = await computeUnionedDiffs(sources, this._diffComputeService);
          } else {
            let incremental;
            if (changedTurnId) {
              const previousDiffs = this._readPreviousChangesetDiffs(changesetUri);
              if (previousDiffs) {
                incremental = { changedTurnId, previousDiffs: [...previousDiffs] };
                incrementalUsed = true;
              }
            }
            diffs = await computeSessionDiffs(session, ref.object, this._diffComputeService, incremental);
          }
        } finally {
          for (const peer of peerSources) {
            peer.ref.dispose();
          }
        }
      }
      const reviewed = kind === "branch" /* Branch */ ? await this._computeReviewedInfo(session, ref.object) : void 0;
      this._publishChangesetDiffs(session, changesetUri, diffs, reviewed);
      fileCount = diffs.length;
      outcome = "computed";
      this._persistSessionFlag(session, persistKeyFor(kind), JSON.stringify(diffs));
      if (kind === "branch" /* Branch */) {
        this._persistSessionFlag(session, META_LEGACY_DIFFS, JSON.stringify(diffs));
        const workingDirectories2 = this._configurationService.getEffectiveWorkingDirectories(session);
        if (isMultiRootSession(workingDirectories2)) {
          await this._updateMultiFolderChangesSummary(session, ref.object, workingDirectories2, diffs);
        } else {
          const changesSummary = summariseDiffs(diffs) ?? { additions: 0, deletions: 0, files: 0 };
          this.persistChangesSummary(session, changesSummary);
          this._stateManager.setSessionSummaryChanges(session, changesSummary);
        }
      }
    } catch (err) {
      this._logService.warn(`[AgentHostChangesetService] Failed to compute ${kind} diffs`, err);
      this._stateManager.dispatchServerAction(changesetUri, {
        type: "changeset/statusChanged" /* ChangesetStatusChanged */,
        status: "error" /* Error */,
        error: { errorType: "computeFailed", message: err instanceof Error ? err.message : String(err) }
      });
      outcome = "error";
    } finally {
      this._activeStaticComputes.delete(changesetUri);
      this._stateManager.onChangesetLivenessChanged();
      ref.dispose();
      emitStaticTelemetry();
    }
  }
  /**
   * Refresh requests optimistically mark static changesets as Computing
   * while preserving their current files. Some refresh paths intentionally
   * do not publish a replacement file list (for example, uncommitted git
   * diff is temporarily unavailable), so restore the previous non-computing
   * status instead of leaving a stale cached snapshot stuck as Computing.
   */
  _restoreStaticChangesetStatus(changesetUri, status) {
    if (!status || status === "computing" /* Computing */) {
      return;
    }
    this._stateManager.dispatchServerAction(changesetUri, {
      type: "changeset/statusChanged" /* ChangesetStatusChanged */,
      status
    });
  }
  /**
   * Reads the previous diff list back out of the changeset state so the
   * incremental aggregator can avoid recomputing files that haven't
   * changed.
   */
  _readPreviousChangesetDiffs(changesetUri) {
    const state = this._stateManager.getChangesetState(changesetUri);
    if (!state || state.files.length === 0) {
      return void 0;
    }
    return state.files.map((f) => f.edit);
  }
  /**
   * Translates the new file list into a sequence of changeset/* actions
   * (fileSet, fileRemoved) and moves the changeset to `ready` once the
   * fresh file list has been applied.
   */
  _publishChangesetDiffs(session, changesetUri, diffs, reviewed) {
    const operations = this._changesetOperationService.getOperations(session, changesetUri);
    const files = [];
    for (const edit of diffs) {
      const id2 = edit.after?.uri ?? edit.before?.uri;
      if (!id2) {
        continue;
      }
      if (reviewed) {
        const relPath = relativePath(reviewed.repoRoot, URI.parse(id2));
        files.push({
          id: id2,
          edit,
          reviewed: relPath ? reviewed.paths.has(relPath) : false
        });
      } else {
        files.push({ id: id2, edit });
      }
    }
    this._stateManager.dispatchServerAction(changesetUri, {
      type: "changeset/contentChanged" /* ChangesetContentChanged */,
      files,
      operations: operations ? [...operations] : void 0
    });
    const status = this._stateManager.getChangesetState(changesetUri)?.status;
    if (status !== "ready" /* Ready */) {
      this._stateManager.dispatchServerAction(changesetUri, {
        type: "changeset/statusChanged" /* ChangesetStatusChanged */,
        status: "ready" /* Ready */
      });
    }
  }
  /**
   * Opens the databases for every non-default (peer) chat in a multi-chat
   * session. Each peer chat records its file edits into its own database
   * keyed by the chat URI, so the session changeset must union those
   * databases with the session DB. Returns an empty array for single-chat
   * sessions. Callers MUST dispose every returned `ref`.
   */
  _openPeerChatSources(session) {
    const chats = this._stateManager.getSessionState(session)?.chats ?? [];
    const sources = [];
    for (const chat of chats) {
      if (isDefaultChatUri(chat.resource)) {
        continue;
      }
      try {
        const ref = this._sessionDataService.openDatabase(URI.parse(chat.resource));
        sources.push({ sessionUri: chat.resource, ref });
      } catch (err) {
        this._logService.warn(`[AgentHostChangesetService] Failed to open peer chat database for session changes: ${chat.resource}`, err);
      }
    }
    return sources;
  }
  /**
   * Returns the turn id whose checkpoint best represents the latest state of
   * the session's shared working tree. For single-chat sessions this is the
   * default chat's last turn. For multi-chat sessions it is the last turn of
   * the most-recently-modified chat (peer-chat turn checkpoints are stored
   * under the session URI keyed by their turn id). Returns `undefined` when
   * no chat has any turns.
   */
  _latestTurnIdAcrossChats(session) {
    const sessionState = this._stateManager.getSessionState(session);
    if (!sessionState) {
      return void 0;
    }
    const chats = sessionState.chats ?? [];
    if (chats.length <= 1) {
      return sessionState.turns.at(-1)?.id;
    }
    let bestTurnId;
    let bestModifiedAt = "";
    for (const chat of chats) {
      const turns = isDefaultChatUri(chat.resource) ? sessionState.turns : this._stateManager.getChatState(chat.resource)?.turns;
      const lastTurnId = turns?.at(-1)?.id;
      if (lastTurnId && chat.modifiedAt >= bestModifiedAt) {
        bestModifiedAt = chat.modifiedAt;
        bestTurnId = lastTurnId;
      }
    }
    return bestTurnId;
  }
  /**
   * Computes diffs for a static changeset by shelling out to git.
   * Returns the diff list when the session has a working directory and
   * that directory is a git work tree; returns `undefined` otherwise so
   * the caller can fall back to the edit-tracker aggregator (for
   * `kind: 'session'`) or preserve cached state (for `kind: 'branch'`).
   *
   * For `kind: 'session'` the diff is computed between the baseline
   * checkpoint ref and the latest turn checkpoint ref.
   * For `kind: 'branch'` the diff is computed against the merge-base
   * with {@link META_DIFF_BASE_BRANCH} when one is set; without a base
   * branch git falls back to `HEAD`.
   */
  async _tryComputeGitDiffs(session, db, kind) {
    const workingDirectory = this._stateManager.getSessionState(session)?.workingDirectories?.[0];
    if (!workingDirectory) {
      return void 0;
    }
    let workingDirectoryUri;
    try {
      workingDirectoryUri = URI.parse(workingDirectory);
    } catch {
      return void 0;
    }
    if (kind === "session") {
      const latestTurnId = this._latestTurnIdAcrossChats(session);
      if (!latestTurnId) {
        return void 0;
      }
      const sessionUri = URI.parse(session);
      const [baseline, pair] = await Promise.all([
        this._checkpointService.getBaselineCheckpoint(sessionUri),
        this._checkpointService.getTurnCheckpointPair(sessionUri, latestTurnId)
      ]);
      if (!baseline || !pair) {
        return void 0;
      }
      try {
        return await this._gitService.computeFileDiffsBetweenRefs(workingDirectoryUri, {
          sessionUri: session,
          fromRef: baseline,
          toRef: pair.current
        });
      } catch (err) {
        this._logService.warn(`[AgentHostChangesetService] git-driven ${kind} diff computation failed; falling back to edit-tracker`, err);
        return void 0;
      }
    }
    const baseBranch = await this._resolveBranchBaseBranch(session, db);
    try {
      return await this._gitService.computeSessionFileDiffs(workingDirectoryUri, {
        sessionUri: session,
        baseBranch
      });
    } catch (err) {
      this._logService.warn(`[AgentHostChangesetService] git-driven ${kind} diff computation failed; falling back to edit-tracker`, err);
      return void 0;
    }
  }
  /**
   * Resolves the Branch Changes base branch, reused by the diff computation
   * and the review-status lookup so both are keyed on the same baseline.
   */
  async _resolveBranchBaseBranch(session, db) {
    const persistedBaseBranch = await db.getMetadata(META_DIFF_BASE_BRANCH);
    const gitStateBaseBranch = readSessionGitState(this._stateManager.getSessionState(session)?._meta)?.baseBranchName;
    if (!persistedBaseBranch && gitStateBaseBranch) {
      this._logService.debug(`[AgentHostChangesetService] Using _meta.git base branch fallback for Branch Changes in ${session}: ${gitStateBaseBranch}`);
    }
    return resolveDiffBaseBranchName(persistedBaseBranch, gitStateBaseBranch);
  }
  /**
   * Computes the reviewed-paths overlay for the Branch changeset: the
   * repository root (used to key file ids to repo-relative paths) and the set
   * of reviewed repo-relative paths. Returns `undefined` when the session has
   * no git working directory (review status is then simply omitted).
   */
  async _computeReviewedInfo(session, db) {
    const workingDirectory = this._stateManager.getSessionState(session)?.workingDirectories?.[0];
    if (!workingDirectory) {
      return void 0;
    }
    let workingDirectoryUri;
    try {
      workingDirectoryUri = URI.parse(workingDirectory);
    } catch {
      return void 0;
    }
    const repoRoot = await this._gitService.getRepositoryRoot(workingDirectoryUri);
    if (!repoRoot) {
      return void 0;
    }
    const baseBranch = await this._resolveBranchBaseBranch(session, db);
    const paths = await this._reviewService.getReviewedPaths(session, workingDirectoryUri, baseBranch);
    return { repoRoot, paths };
  }
  /**
   * Persists a session metadata key/value pair to the session database.
   * Counterpart in `agentSideEffects.ts` (`AgentSideEffects._persistSessionFlag`):
   * keep both copies in sync if the signature changes. Duplicated rather
   * than lifted because the two consumers persist disjoint metadata
   * (changeset diffs here vs. customTitle / isRead / isArchived /
   * configValues there) and a shared util would only have two callers.
   */
  _persistSessionFlag(session, key, value) {
    const ref = this._sessionDataService.openDatabase(URI.parse(session));
    ref.object.setMetadata(key, value).catch((err) => {
      this._logService.warn(`[AgentHostChangesetService] Failed to persist ${key}`, err);
    }).finally(() => {
      ref.dispose();
    });
  }
};

AgentHostChangesetService = __decorateClass([
  __decorateParam(0, IAgentHostStateManager),
  __decorateParam(1, ILogService),
  __decorateParam(2, ISessionDataService),
  __decorateParam(3, IAgentHostGitService),
  __decorateParam(4, IAgentHostCheckpointService),
  __decorateParam(5, IAgentConfigurationService),
  __decorateParam(6, IAgentHostChangesetOperationService),
  __decorateParam(7, IAgentHostChangesetSubscriptionService),
  __decorateParam(8, IAgentHostReviewService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, IAgentHostWorktreeIsolation)
], AgentHostChangesetService);
export { staticChangesetUri, persistKeyFor, summariseDiffs, computeChangesSummaryFromLiveState, computeChangesSummaryFromPersistedDiffs, tryParsePersistedDiffs, MAX_TURN_DIFF_REPOSITORY_CONCURRENCY, AgentHostChangesetService };
