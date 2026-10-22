// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/blockedSessionsIndicatorModel.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { Emitter } from "./module-0017.mjs";
import { AgentSessionApprovalModel, agentSessionApprovalId } from "./module-2733.mjs";
import { BlockedSessions, describeBlockedSessions } from "./module-3714.mjs";
import { BlockedSessionsCIFixModel } from "./module-3715.mjs";
import { derived } from "./module-0054.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { getFirstApprovalAcrossChats } from "./module-3523.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IProductService } from "./module-0875.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/sessions/browser/blockedSessionsIndicatorModel.ts
var LOG_PREFIX12 = "[BlockedSessionsIndicator]";

var BlockedSessionsIndicatorModel = class extends Disposable {
  constructor(approvalModel, blockedSessions, ciFixModel, _sessionsService, instantiationService, productService, _logService) {
    super();
    this._sessionsService = _sessionsService;
    this._logService = _logService;
    /** Current blocked occurrences the user has already acknowledged, keyed by session id. */
    this._ignoredBlockOccurrences = observableValue("ignoredBlockOccurrences", /* @__PURE__ */ new Map());
    /**
     * Latest blocked occurrence per session, independent of visibility. Used so the
     * attention blink only fires for a genuinely new input request or CI failure.
     */
    this._lastBlockedOccurrences = /* @__PURE__ */ new Map();
    /**
     * Not-yet-visible blocked occurrences whose attention blink has not played yet.
     */
    this._pendingBlinkOccurrences = /* @__PURE__ */ new Map();
    this._onDidRequestBlink = this._register(new Emitter());
    /**
     * Fires when a genuinely new, not-yet-visible session becomes blocked and the
     * indicator should play its attention blink. Consumers should re-render and
     * call {@link consumePendingBlink}.
     */
    this.onDidRequestBlink = this._onDidRequestBlink.event;
    this._approvalModel = approvalModel ?? this._register(instantiationService.createInstance(AgentSessionApprovalModel));
    this._blockedSessionsModel = blockedSessions ?? this._register(instantiationService.createInstance(BlockedSessions));
    this._ciFixModel = ciFixModel ?? this._register(instantiationService.createInstance(BlockedSessionsCIFixModel));
    const enabled = productService.quality !== "stable";
    this._logService.trace(`${LOG_PREFIX12} created (enabled: ${enabled})`);
    this._register(toDisposable(() => this._logService.trace(`${LOG_PREFIX12} disposed, discarding ${this._ignoredBlockOccurrences.get().size} acknowledged occurrence(s)`)));
    this.blockedSessions = derived(this, (reader) => {
      if (!enabled) {
        return [];
      }
      const visibleSessionIds = /* @__PURE__ */ new Set();
      for (const session of this._sessionsService.visibleSessions.read(reader)) {
        if (session) {
          visibleSessionIds.add(session.sessionId);
        }
      }
      const ignoredOccurrences = this._ignoredBlockOccurrences.read(reader);
      const ciFixHidden = this._ciFixModel.hiddenSessions.read(reader);
      return this._blockedSessionsModel.blockedSessionsWithReasons.read(reader).filter((blocked) => !visibleSessionIds.has(blocked.session.sessionId) && !ciFixHidden.has(blocked.session.sessionId) && !this._isBlockIgnored(blocked, ignoredOccurrences, reader));
    });
    this.requiresInputKind = derived(this, (reader) => {
      const blocked = this.blockedSessions.read(reader);
      if (blocked.length === 0) {
        return void 0;
      }
      let common;
      let hasCommon = false;
      for (const entry of blocked) {
        const kind = this._kindOf(entry, reader);
        if (kind === void 0) {
          return void 0;
        }
        if (!hasCommon) {
          common = kind;
          hasCommon = true;
        } else if (common !== kind) {
          return void 0;
        }
      }
      return common;
    });
    this._register(autorun((reader) => {
      if (!enabled) {
        return;
      }
      const blockedSessions2 = this._blockedSessionsModel.blockedSessionsWithReasons.read(reader);
      const blockedById = new Map(blockedSessions2.map((entry) => [entry.session.sessionId, entry]));
      const visibleSessionIds = new Set(this._sessionsService.visibleSessions.read(reader).filter((session) => session !== void 0).map((session) => session.sessionId));
      const ignoredOccurrences = this._ignoredBlockOccurrences.read(reader);
      const next = new Map(ignoredOccurrences);
      let changed = false;
      for (const [sessionId, acknowledged] of ignoredOccurrences) {
        const blockedSession = blockedById.get(sessionId);
        if (blockedSession) {
          const occurrenceId = this._getBlockOccurrenceId(blockedSession, reader, acknowledged.occurrenceId);
          if (occurrenceId !== acknowledged.occurrenceId) {
            next.delete(sessionId);
            changed = true;
            this._logService.trace(`${LOG_PREFIX12} releasing acknowledgement of ${sessionId}: new occurrence ${occurrenceId} replaces ${acknowledged.occurrenceId}`);
          }
          continue;
        }
        if (acknowledged.reason === "failingCI" /* FailingCI */) {
          this._logService.trace(`${LOG_PREFIX12} keeping acknowledgement of ${sessionId} (${acknowledged.occurrenceId}) while it is not reported as blocked`);
          continue;
        }
        next.delete(sessionId);
        changed = true;
        this._logService.trace(`${LOG_PREFIX12} releasing acknowledgement of ${sessionId} (${acknowledged.occurrenceId}): no longer blocked`);
      }
      for (const blockedSession of blockedById.values()) {
        const sessionId = blockedSession.session.sessionId;
        if (!visibleSessionIds.has(sessionId)) {
          continue;
        }
        const occurrenceId = this._getBlockOccurrenceId(blockedSession, reader, next.get(sessionId)?.occurrenceId);
        if (next.get(sessionId)?.occurrenceId !== occurrenceId) {
          next.set(sessionId, { occurrenceId, reason: blockedSession.reason });
          changed = true;
          this._logService.trace(`${LOG_PREFIX12} acknowledging ${sessionId} (${occurrenceId}): the session is visible`);
        }
      }
      if (changed) {
        this._ignoredBlockOccurrences.set(next, void 0);
      }
    }));
    this._register(autorun((reader) => {
      if (!enabled) {
        return;
      }
      const ignoredOccurrences = this._ignoredBlockOccurrences.read(reader);
      const modelBlocked = this._blockedSessionsModel.blockedSessionsWithReasons.read(reader);
      const currentOccurrences = new Map(modelBlocked.map((blocked) => [
        blocked.session.sessionId,
        this._getBlockOccurrenceId(blocked, reader, ignoredOccurrences.get(blocked.session.sessionId)?.occurrenceId)
      ]));
      const previousOccurrences = this._lastBlockedOccurrences;
      this._lastBlockedOccurrences = currentOccurrences;
      const visibleSessionIds = /* @__PURE__ */ new Set();
      for (const session of this._sessionsService.visibleSessions.read(reader)) {
        if (session) {
          visibleSessionIds.add(session.sessionId);
        }
      }
      for (const [sessionId, occurrenceId] of this._pendingBlinkOccurrences) {
        if (currentOccurrences.get(sessionId) !== occurrenceId || visibleSessionIds.has(sessionId)) {
          this._pendingBlinkOccurrences.delete(sessionId);
        }
      }
      let queued = false;
      for (const blocked of modelBlocked) {
        const sessionId = blocked.session.sessionId;
        const occurrenceId = currentOccurrences.get(sessionId);
        if (previousOccurrences.get(sessionId) !== occurrenceId && !visibleSessionIds.has(sessionId)) {
          this._pendingBlinkOccurrences.set(sessionId, occurrenceId);
          queued = true;
          this._logService.trace(`${LOG_PREFIX12} queued attention blink for ${sessionId} (${occurrenceId})`);
        }
      }
      if (queued) {
        this._onDidRequestBlink.fire();
      }
    }));
    this._register(autorun((reader) => {
      const surfaced = this.blockedSessions.read(reader);
      this._logService.trace(`${LOG_PREFIX12} surfacing ${surfaced.length} blocked session(s): ${describeBlockedSessions(surfaced)}`);
    }));
  }
  /** The approval model, shared with the dropdown list so both agree on each session's pending action. */
  get approvalModel() {
    return this._approvalModel;
  }
  /** The CI-fix model, shared with the dropdown list so the fix action and the hide-while-fixing agree. */
  get ciFixModel() {
    return this._ciFixModel;
  }
  /**
   * Whether a fresh attention blink is pending. Returns `true` only when a session
   * queued as newly blocked is still in the surfaced (visible-filtered) blocked set,
   * so a blink queued while the pill was suppressed can't fire for a session that has
   * since become visible or unblocked. The pending queue is cleared as it is read so
   * a subsequent render won't replay the animation.
   */
  consumePendingBlink() {
    if (this._pendingBlinkOccurrences.size === 0) {
      return false;
    }
    const ignoredOccurrences = this._ignoredBlockOccurrences.get();
    const surfacedOccurrences = new Map(this.blockedSessions.get().map((blocked) => [
      blocked.session.sessionId,
      this._getBlockOccurrenceId(blocked, void 0, ignoredOccurrences.get(blocked.session.sessionId)?.occurrenceId)
    ]));
    let shouldBlink = false;
    for (const [sessionId, occurrenceId] of this._pendingBlinkOccurrences) {
      if (surfacedOccurrences.get(sessionId) === occurrenceId) {
        shouldBlink = true;
        break;
      }
    }
    this._pendingBlinkOccurrences.clear();
    return shouldBlink;
  }
  /** Ignore this session's current blocked occurrence. */
  ignoreSession(session) {
    const blocked = this._blockedSessionsModel.blockedSessionsWithReasons.get().find((entry) => entry.session.sessionId === session.sessionId);
    if (!blocked) {
      this._logService.trace(`${LOG_PREFIX12} ignore requested for ${session.sessionId}, but it is not reported as blocked`);
      return;
    }
    this._ignoreOccurrence(blocked, this._getBlockOccurrenceId(blocked, void 0, this._ignoredBlockOccurrences.get().get(session.sessionId)?.occurrenceId));
  }
  /** Ignore every blocked occurrence currently surfaced by the indicator. */
  ignoreAllSessions() {
    const blockedSessions = this.blockedSessions.get();
    if (blockedSessions.length === 0) {
      return;
    }
    const next = new Map(this._ignoredBlockOccurrences.get());
    for (const blocked of blockedSessions) {
      const sessionId = blocked.session.sessionId;
      const occurrenceId = this._getBlockOccurrenceId(blocked, void 0, next.get(sessionId)?.occurrenceId);
      next.set(sessionId, { occurrenceId, reason: blocked.reason });
      this._logService.trace(`${LOG_PREFIX12} ignoring ${sessionId} (${occurrenceId}): ignore all`);
    }
    this._ignoredBlockOccurrences.set(next, void 0);
  }
  /**
   * Remember that the user allowed this exact approval so the session drops out of
   * the blocked set immediately.
   */
  dismissApproval(approved) {
    const blocked = this._blockedSessionsModel.blockedSessionsWithReasons.get().find((entry) => entry.session.sessionId === approved.session.sessionId);
    if (!blocked || blocked.reason !== "needsInput" /* NeedsInput */) {
      return;
    }
    this._ignoreOccurrence(blocked, this._approvalOccurrenceId(blocked, approved.approvalId));
  }
  /**
   * Build the requires-input pill label. A homogeneous set of blocked sessions
   * gets a specific, more actionable message; a mix (or an unclassified session)
   * falls back to the generic "N sessions require input".
   */
  getRequiresInputLabel(count2, kind) {
    switch (kind) {
      case 0 /* TerminalApproval */:
        return count2 === 1 ? localize(5309, null) : localize(5305, null, count2);
      case 1 /* Question */:
        return count2 === 1 ? localize(5307, null) : localize(5303, null, count2);
      case 2 /* FailingCI */:
        return count2 === 1 ? localize(5306, null) : localize(5302, null, count2);
      default:
        return count2 === 1 ? localize(5308, null) : localize(5304, null, count2);
    }
  }
  _ignoreOccurrence(blocked, occurrenceId) {
    const next = new Map(this._ignoredBlockOccurrences.get());
    next.set(blocked.session.sessionId, { occurrenceId, reason: blocked.reason });
    this._ignoredBlockOccurrences.set(next, void 0);
    this._logService.trace(`${LOG_PREFIX12} ignoring ${blocked.session.sessionId} (${occurrenceId})`);
  }
  _isBlockIgnored(blocked, ignoredOccurrences, reader) {
    const acknowledged = ignoredOccurrences.get(blocked.session.sessionId);
    return acknowledged !== void 0 && this._getBlockOccurrenceId(blocked, reader, acknowledged.occurrenceId) === acknowledged.occurrenceId;
  }
  _getBlockOccurrenceId(blocked, reader, ignoredOccurrence) {
    if (blocked.reason !== "needsInput" /* NeedsInput */) {
      return blocked.occurrenceId;
    }
    const approval = getFirstApprovalAcrossChats(this._approvalModel, blocked.session, reader);
    if (approval) {
      return this._approvalOccurrenceId(blocked, agentSessionApprovalId(approval));
    }
    const approvalPrefix = this._approvalOccurrenceId(blocked, "");
    return ignoredOccurrence?.startsWith(approvalPrefix) ? ignoredOccurrence : blocked.occurrenceId;
  }
  _approvalOccurrenceId(blocked, approvalId) {
    return `${blocked.occurrenceId}:approval:${approvalId}`;
  }
  /**
   * Classify a single blocked session into a specific requires-input kind, or
   * `undefined` when it can't be classified (which forces the generic message).
   */
  _kindOf(blocked, reader) {
    switch (blocked.reason) {
      case "failingCI" /* FailingCI */:
        return 2 /* FailingCI */;
      case "needsInput" /* NeedsInput */: {
        const approval = getFirstApprovalAcrossChats(this._approvalModel, blocked.session, reader);
        switch (approval?.kind) {
          case "terminal" /* Terminal */:
            return 0 /* TerminalApproval */;
          case "question" /* Question */:
            return 1 /* Question */;
          default:
            return void 0;
        }
      }
      default:
        return void 0;
    }
  }
};

BlockedSessionsIndicatorModel = __decorateClass([
  __decorateParam(3, ISessionsService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IProductService),
  __decorateParam(6, ILogService)
], BlockedSessionsIndicatorModel);
export { LOG_PREFIX12, BlockedSessionsIndicatorModel };
