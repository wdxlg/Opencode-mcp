// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostTurnTracker.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable, DisposableMap, toDisposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { createUnknownAgentHostClientTelemetryContext } from "./module-0054.mjs";
import { StopWatch } from "./module-0015.mjs";
import { canRefineContributor, toolSourceKindFromContributor } from "./module-0492.mjs";
import { disposableTimeout } from "./module-0027.mjs";
import { URI } from "./module-0023.mjs";
import { getErrorMessage } from "./module-0002.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostTelemetryReporter } from "./module-0253.mjs";
import { IAgentHostClientConnectionService } from "./module-0410.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostTurnTracker.ts
var TURN_HANG_THRESHOLD_MS = 5 * 60 * 1e3;

var MAX_HANG_CHECK_WINDOWS = 6;

var TURN_ACTIVITY_NONE = "none";

var IAgentHostTurnTracker = createDecorator("agentHostTurnTracker");

var AgentHostTurnTracker = class extends Disposable {
  constructor(_reporter, _clientConnections, _logService) {
    super();
    this._reporter = _reporter;
    this._clientConnections = _clientConnections;
    this._logService = _logService;
    this._turnTimings = /* @__PURE__ */ new Map();
    this._turnUsages = /* @__PURE__ */ new Map();
    this._hangWatchdogs = this._register(new DisposableMap());
    /** Maps `session:requestId` to the turn key blocked on that request. */
    this._blockerTurnKeys = /* @__PURE__ */ new Map();
    /**
     * Fires with the provider id whenever a turn starts, i.e. whenever the host
     * is about to make an LLM request on that provider's behalf.
     *
     * Consumed by {@link AgentModelRefreshScheduler} to gate its periodic model
     * refresh on real usage, so an idle host issues no `models` network
     * requests at all. Local host commands (`/rename`, `!command`) are
     * intercepted before `turnStarted` is reached and so correctly do not count
     * as activity.
     */
    this._onDidStartTurn = this._register(new Emitter());
    this.onDidStartTurn = this._onDidStartTurn.event;
    this._register(toDisposable(() => {
      this._turnTimings.clear();
      this._turnUsages.clear();
      this._blockerTurnKeys.clear();
    }));
  }
  turnStarted(agent, session, turnId, model, modelTelemetryKind, modelSelectionKind, permissionLevel, interactionMode, clientContext = createUnknownAgentHostClientTelemetryContext("unknown" /* Unknown */), initiatorClientId, parentTurnId, parentToolCallId, messageOriginKind) {
    const key = this._key(session, turnId);
    this._turnTimings.set(key, {
      stopWatch: StopWatch.create(false),
      agent,
      session,
      turnId,
      parentTurnId,
      parentToolCallId,
      model,
      modelTelemetryKind,
      modelSelectionKind,
      permissionLevel,
      interactionMode,
      messageOriginKind,
      clientContext,
      initiatorClientId,
      completedModelCallIds: /* @__PURE__ */ new Set(),
      firstProgressMs: void 0,
      currentStage: "validation",
      quietStopWatch: StopWatch.create(false),
      lastActivityKind: TURN_ACTIVITY_NONE,
      inFlightToolCalls: /* @__PURE__ */ new Map(),
      blockers: /* @__PURE__ */ new Map(),
      reportedHangReasons: /* @__PURE__ */ new Set(),
      hangReportCount: 0,
      lastHangReason: void 0,
      lastHangStopWatch: void 0,
      quietWindows: 0
    });
    this._turnUsages.set(key, {});
    this._armHangWatchdog(key);
    this._onDidStartTurn.fire(agent.id);
  }
  markFirstProgress(session, turnId) {
    const timing = this._turnTimings.get(this._key(session, turnId));
    if (timing && timing.firstProgressMs === void 0) {
      timing.firstProgressMs = timing.stopWatch.elapsed();
    }
  }
  /**
   * Records observed activity for a turn. `activityKind` is the protocol
   * action type that produced it, which is emitted verbatim in the hang event
   * so a hang can be attributed to what the turn was last doing.
   *
   * Every call debounces the hang watchdog, so a turn that keeps producing
   * signals of any kind is never reported as hung. This is deliberately
   * broader than {@link markFirstProgress}, which only counts *visible*
   * progress for the time-to-first-progress metric.
   */
  markActivity(session, turnId, activityKind) {
    const key = this._key(session, turnId);
    const timing = this._turnTimings.get(key);
    if (!timing) {
      return;
    }
    timing.lastActivityKind = activityKind;
    this._touch(key, timing);
  }
  setCurrentStage(session, turnId, stage) {
    const timing = this._turnTimings.get(this._key(session, turnId));
    if (timing) {
      timing.currentStage = stage;
    }
  }
  /** Resets the quiet period and re-arms the watchdog for a live turn. */
  _touch(key, timing) {
    timing.quietStopWatch = StopWatch.create(true);
    timing.quietWindows = 0;
    this._armHangWatchdog(key);
  }
  /**
   * Records that a tool call is in flight for the turn. An in-flight tool
   * call explains an otherwise quiet turn (a long build, or a subagent whose
   * progress is reported on its own chat channel), so the hang is reported
   * with the `runningTool` reason rather than as an unexplained stall.
   *
   * The tool's identity is retained so a hang report can name what the turn
   * is stuck on. This matters most for agent-host-provided tools: those never
   * enter the session input queue, so `agentHost.toolCallStalled` — which
   * only fires for blocked tool calls — cannot see them at all.
   */
  toolCallStarted(session, turnId, toolCallId, toolName, contributor) {
    this._turnTimings.get(this._key(session, turnId))?.inFlightToolCalls.set(toolCallId, {
      toolId: toolName,
      contributor,
      toolSourceKind: toolSourceKindFromContributor(contributor)
    });
  }
  /**
   * Refines an in-flight tool call's contributor once complete metadata is
   * available. Mirrors {@link AgentHostToolCallTracker.toolCallMetadataUpdated}
   * so `toolSourceKind` agrees between the two telemetry events for the same
   * tool call.
   */
  toolCallMetadataUpdated(session, turnId, toolCallId, contributor) {
    const inFlight = this._turnTimings.get(this._key(session, turnId))?.inFlightToolCalls.get(toolCallId);
    if (inFlight && contributor && canRefineContributor(inFlight.contributor, contributor)) {
      inFlight.contributor = contributor;
      inFlight.toolSourceKind = toolSourceKindFromContributor(contributor);
    }
  }
  toolCallEnded(session, turnId, toolCallId) {
    this._turnTimings.get(this._key(session, turnId))?.inFlightToolCalls.delete(toolCallId);
  }
  /**
   * Records that a session input request is outstanding for the turn.
   *
   * Only requests that block on a *human* make the turn `waitingOnUser`.
   * {@link SessionInputRequestKind.ToolClientExecution} is delegated running
   * work, not a prompt: the call has already cleared its confirmation gate
   * and is simply executing on a client. Counting it would report every
   * long-running client tool as waiting on the user. This mirrors the
   * `awaitsUser` predicate the protocol reducer uses for session status
   * (`channels-session/reducer.ts`), which cannot be imported here because
   * that file is generated. Client execution is still represented — the
   * in-flight tool set covers it and yields `runningTool`.
   *
   * Every outstanding request is recorded regardless, so unblocking can find
   * its turn and teardown can clean up its bookkeeping.
   */
  turnBlocked(session, turnId, requestId, kind, toolCallId) {
    const turnKey = this._key(session, turnId);
    const timing = this._turnTimings.get(turnKey);
    if (!timing) {
      return;
    }
    timing.blockers.set(requestId, { kind, toolCallId });
    this._blockerTurnKeys.set(this._key(session, requestId), turnKey);
    this._touch(turnKey, timing);
  }
  turnUnblocked(session, requestId) {
    const blockerKey = this._key(session, requestId);
    const turnKey = this._blockerTurnKeys.get(blockerKey);
    if (turnKey === void 0) {
      return;
    }
    this._blockerTurnKeys.delete(blockerKey);
    const timing = this._turnTimings.get(turnKey);
    if (!timing) {
      return;
    }
    timing.blockers.delete(requestId);
    this._touch(turnKey, timing);
  }
  updateModel(session, turnId, model, modelTelemetryKind) {
    const timing = this._turnTimings.get(this._key(session, turnId));
    if (timing) {
      timing.model = model;
      timing.modelTelemetryKind = modelTelemetryKind;
    }
  }
  updateBilledNanoAiu(session, turnId, billedNanoAiu) {
    const usage = this._turnUsages.get(this._key(session, turnId));
    if (usage && typeof billedNanoAiu === "number" && Number.isFinite(billedNanoAiu) && billedNanoAiu >= 0) {
      usage.billedNanoAiu = billedNanoAiu;
    }
  }
  updateDirectUsage(session, turnId, tokenTotals, billedNanoAiu) {
    const usage = this._turnUsages.get(this._key(session, turnId));
    if (!usage) {
      return;
    }
    if (tokenTotals) {
      usage.directPromptTokenCount = sumTokenCounts(tokenTotals, (total) => total.inputTokens);
      usage.directPromptCacheTokenCount = sumTokenCounts(tokenTotals, (total) => total.cachedTokens);
      usage.directCompletionTokenCount = sumTokenCounts(tokenTotals, (total) => total.outputTokens);
    }
    if (typeof billedNanoAiu === "number" && Number.isFinite(billedNanoAiu) && billedNanoAiu >= 0) {
      usage.directBilledNanoAiu = billedNanoAiu;
    }
  }
  modelCallCompleted(session, turnId, modelCallId) {
    this._turnTimings.get(this._key(session, turnId))?.completedModelCallIds.add(modelCallId);
  }
  getModelTelemetryContext(session, turnId) {
    const timing = this._turnTimings.get(this._key(session, turnId));
    return timing ? { model: timing.model, modelTelemetryKind: timing.modelTelemetryKind } : void 0;
  }
  getClientTelemetryContext(session, turnId) {
    return this._turnTimings.get(this._key(session, turnId))?.clientContext;
  }
  getInitiatorClientId(session, turnId) {
    return this._turnTimings.get(this._key(session, turnId))?.initiatorClientId;
  }
  /**
   * Records a turn's completion. Returns whether a tracked turn actually ended:
   * `false` means no turn was in flight for `turnId`, which happens for a stale or
   * duplicate terminal action that the reducer also no-ops. Callers that run
   * end-of-turn side effects should skip them when this returns `false`.
   */
  turnCompleted(session, turnId, result, failure, workspace) {
    const key = this._key(session, turnId);
    const timing = this._turnTimings.get(key);
    if (!timing) {
      return false;
    }
    const usage = this._turnUsages.get(key);
    this._disposeTurn(key, timing);
    this._reporter.turnCompleted({
      clientContext: timing.clientContext,
      provider: timing.agent.id,
      session: timing.session,
      turnId,
      parentTurnId: timing.parentTurnId,
      parentToolCallId: timing.parentToolCallId,
      timeToFirstProgress: timing.firstProgressMs,
      totalTime: timing.stopWatch.elapsed(),
      result,
      model: timing.model,
      modelTelemetryKind: timing.modelTelemetryKind,
      modelSelectionKind: timing.modelSelectionKind,
      permissionLevel: timing.permissionLevel,
      interactionMode: timing.interactionMode,
      messageOriginKind: timing.messageOriginKind,
      failure,
      isMultiRoot: workspace?.isMultiRoot ?? false,
      folderCount: workspace?.folderCount ?? 0,
      billedNanoAiu: usage?.billedNanoAiu,
      directPromptTokenCount: usage?.directPromptTokenCount,
      directPromptCacheTokenCount: usage?.directPromptCacheTokenCount,
      directCompletionTokenCount: usage?.directCompletionTokenCount,
      directBilledNanoAiu: usage?.directBilledNanoAiu,
      modelCallCount: timing.completedModelCallIds.size
    });
    if (timing.lastHangReason !== void 0) {
      this._reporter.hungTurnCompleted({
        clientContext: timing.clientContext,
        provider: timing.agent.id,
        session: timing.session,
        turnId,
        hangReason: timing.lastHangReason,
        result,
        hangReportCount: timing.hangReportCount,
        totalTimeMs: timing.stopWatch.elapsed(),
        timeAfterHangMs: timing.lastHangStopWatch?.elapsed() ?? 0
      });
    }
    return true;
  }
  /**
   * Drops any in-flight (never-completed) turns for a session without
   * reporting them. Called on session teardown so neither tracked turn state
   * nor watchdog timers can outlive the session they describe.
   */
  clearSession(session) {
    const prefix = `${session}\0`;
    for (const [key, timing] of this._turnTimings) {
      if (key.startsWith(prefix)) {
        this._disposeTurn(key, timing);
      }
    }
    for (const key of this._blockerTurnKeys.keys()) {
      if (key.startsWith(prefix)) {
        this._blockerTurnKeys.delete(key);
      }
    }
  }
  /**
   * Drops tracked turns for a channel that are not in `keepTurnIds`, without
   * reporting them. Used after a chat is truncated: the turns are gone from
   * state and will never complete, so their watchdogs must not survive to
   * report a hang for a turn that no longer exists.
   */
  clearTurnsExcept(session, keepTurnIds) {
    const prefix = `${session}\0`;
    for (const [key, timing] of this._turnTimings) {
      if (key.startsWith(prefix) && !keepTurnIds.has(timing.turnId)) {
        this._disposeTurn(key, timing);
      }
    }
  }
  _disposeTurn(key, timing) {
    this._turnTimings.delete(key);
    this._turnUsages.delete(key);
    this._hangWatchdogs.deleteAndDispose(key);
    for (const requestId of timing.blockers.keys()) {
      this._blockerTurnKeys.delete(this._key(timing.session, requestId));
    }
  }
  _armHangWatchdog(key) {
    this._hangWatchdogs.set(key, disposableTimeout(() => this._onHangWatchdogFired(key), TURN_HANG_THRESHOLD_MS));
  }
  _onHangWatchdogFired(key) {
    const timing = this._turnTimings.get(key);
    if (!timing) {
      return;
    }
    timing.quietWindows++;
    const hangReason = this._deriveHangReason(timing);
    if (!timing.reportedHangReasons.has(hangReason)) {
      timing.reportedHangReasons.add(hangReason);
      timing.hangReportCount++;
      timing.lastHangReason = hangReason;
      timing.lastHangStopWatch = StopWatch.create(true);
      const userBlocker = this._firstUserBlocker(timing);
      const stuckTool = this._resolveStuckTool(timing, hangReason);
      const providerDiagnostics = this._getProviderDiagnostics(timing);
      this._reporter.turnHung({
        clientContext: timing.clientContext,
        provider: timing.agent.id,
        session: timing.session,
        turnId: timing.turnId,
        hangReason,
        hadAnyProgress: timing.lastActivityKind !== TURN_ACTIVITY_NONE,
        lastActivityKind: timing.lastActivityKind,
        currentStage: timing.currentStage,
        ...providerDiagnostics,
        initiatorClientConnectionState: this._getInitiatorClientConnectionState(timing.initiatorClientId),
        blockedOn: userBlocker?.kind,
        toolId: stuckTool?.toolId,
        toolSourceKind: stuckTool?.toolSourceKind,
        inFlightToolCallCount: timing.inFlightToolCalls.size,
        quietTimeMs: timing.quietStopWatch.elapsed(),
        turnElapsedMs: timing.stopWatch.elapsed(),
        model: timing.model,
        modelTelemetryKind: timing.modelTelemetryKind,
        modelSelectionKind: timing.modelSelectionKind,
        permissionLevel: timing.permissionLevel
      });
    }
    if (timing.quietWindows < MAX_HANG_CHECK_WINDOWS) {
      this._armHangWatchdog(key);
    }
  }
  _getProviderDiagnostics(timing) {
    const getSnapshot = timing.agent.getTurnDiagnosticSnapshot;
    if (!getSnapshot) {
      return { providerDiagnosticState: "unsupported", providerDiagnosticSnapshot: void 0 };
    }
    try {
      const snapshot = getSnapshot.call(timing.agent, URI.parse(timing.session), timing.turnId);
      return snapshot ? { providerDiagnosticState: snapshot.state, providerDiagnosticSnapshot: snapshot } : { providerDiagnosticState: "unavailable", providerDiagnosticSnapshot: void 0 };
    } catch (error) {
      this._logService.error(`[AgentHostTurnTracker] Failed to collect provider diagnostics for provider=${timing.agent.id}: ${getErrorMessage(error)}`, error);
      return { providerDiagnosticState: "error", providerDiagnosticSnapshot: void 0 };
    }
  }
  _getInitiatorClientConnectionState(clientId) {
    if (!clientId) {
      return "unknown";
    }
    return this._clientConnections.isClientConnected(clientId) ? "connected" : "disconnected";
  }
  /**
   * The first outstanding request that blocks on the user, or `undefined`
   * when none does. See {@link turnBlocked} for why client tool execution is
   * not a user blocker.
   */
  _firstUserBlocker(timing) {
    for (const blocker of timing.blockers.values()) {
      if (blocker.kind !== "toolClientExecution" /* ToolClientExecution */) {
        return blocker;
      }
    }
    return void 0;
  }
  /**
   * Identifies the tool the turn appears to be stuck on, so a hang report can
   * name it rather than only counting it.
   *
   * For `waitingOnUser` this is the tool call gated by the blocking request.
   * A result-confirmation prompt resolves to `undefined`, because the tool
   * already completed and left the in-flight set — the turn is waiting on the
   * user reviewing a result, not on a tool. An elicitation has no tool at all.
   *
   * For `runningTool` this is the longest-running in-flight call. With
   * several tools running in parallel there is no way to tell which one is
   * wedged, so this is a heuristic; `inFlightToolCallCount` travels alongside
   * it, and filtering to `inFlightToolCallCount == 1` gives unambiguous
   * attribution.
   */
  _resolveStuckTool(timing, hangReason) {
    if (hangReason === "waitingOnUser") {
      const toolCallId = this._firstUserBlocker(timing)?.toolCallId;
      return toolCallId === void 0 ? void 0 : timing.inFlightToolCalls.get(toolCallId);
    }
    if (hangReason === "runningTool") {
      return timing.inFlightToolCalls.values().next().value;
    }
    return void 0;
  }
  _deriveHangReason(timing) {
    if (this._firstUserBlocker(timing) !== void 0) {
      return "waitingOnUser";
    }
    if (timing.inFlightToolCalls.size > 0) {
      return "runningTool";
    }
    return timing.lastActivityKind === TURN_ACTIVITY_NONE ? "noProgress" : "stalledAfterProgress";
  }
  _key(session, turnId) {
    return `${session}\0${turnId}`;
  }
};

AgentHostTurnTracker = __decorateClass([
  __decorateParam(0, IAgentHostTelemetryReporter),
  __decorateParam(1, IAgentHostClientConnectionService),
  __decorateParam(2, ILogService)
], AgentHostTurnTracker);

function sumTokenCounts(totals, getCount) {
  return totals.reduce((sum, total) => {
    const count = getCount(total);
    return sum + (Number.isFinite(count) && count >= 0 ? count : 0);
  }, 0);
}
export { sumTokenCounts, TURN_HANG_THRESHOLD_MS, MAX_HANG_CHECK_WINDOWS, TURN_ACTIVITY_NONE, IAgentHostTurnTracker, AgentHostTurnTracker };
