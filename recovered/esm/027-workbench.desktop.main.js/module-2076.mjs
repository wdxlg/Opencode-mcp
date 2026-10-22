// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/voiceClient/voiceSessionController.ts
import { IChatEntitlementService, isProUser } from "./module-0953.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { URI } from "./module-0032.mjs";
import { autorun } from "./module-0052.mjs";
import { ChatSendResult, IChatService, IChatToolInvocation } from "./module-0972.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { IMicCaptureService, isMicrophonePermissionDeniedError } from "./module-1346.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { getVoiceConfirmationType, isPendingVoiceQuestionnaireInvocation, isVoiceQuestionnaireInvocation } from "./module-2068.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { addDisposableListener, disposableWindowInterval } from "./module-0075.mjs";
import { transaction } from "./module-0045.mjs";
import { IVoiceToolDispatchService, VoiceToolDispatchService } from "./module-2072.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { voiceCloseCodeInfo } from "./module-2066.mjs";
import { alert, status } from "./module-0076.mjs";
import { mainWindow } from "./module-0002.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { IVoiceClientService, VOICE_AGENT_PROGRESS_SETTING, derivePendingId, getVoiceToolApprovalCommand, isPendingIdResolved, isVoiceCheckpointId, restoreResolvedPendingId } from "./module-1342.mjs";
import { toAgentHostBackendSessionUri } from "./module-2074.mjs";
import { formatQuestionPrompt } from "./module-2075.mjs";
import { isExplicitFileOrImageVariableEntry } from "./module-0979.mjs";
import { SESSION_META_EHCLI_ADOPTABLE_KEY } from "./module-1007.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { isObject } from "./module-0010.mjs";
import { getDisplayedQuestionText, getOptionsWithDefaultsFirst } from "./module-2070.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITtsPlaybackService } from "./module-2069.mjs";
import { IVoicePlaybackService } from "./module-2073.mjs";
import { IAgentSessionsService } from "./module-1464.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { IVoiceTranscriptStore } from "./module-2065.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/voiceClient/voiceSessionController.ts
function isVoiceEntitled(chatEntitlementService) {
  return isProUser(chatEntitlementService.entitlement) && (chatEntitlementService.entitlement !== 9 /* Enterprise */ || chatEntitlementService.isInternal);
}

function hasOwn(value2, key3) {
  return Object.prototype.hasOwnProperty.call(value2, key3);
}

var IVoiceSessionController = createDecorator("voiceSessionController");

var VoiceSessionController = class extends Disposable {
  constructor(voiceClientService, micCaptureService, ttsPlaybackService, voiceToolDispatchService, voicePlaybackService, agentSessionsService, chatService, commandService, authenticationService, voiceTranscriptStore, logService, environmentService, telemetryService, configurationService, accessibilitySignalService, accessibilityService, chatWidgetService, notificationService, promptsService, chatEntitlementService) {
    super();
    this.voiceClientService = voiceClientService;
    this.micCaptureService = micCaptureService;
    this.ttsPlaybackService = ttsPlaybackService;
    this.voiceToolDispatchService = voiceToolDispatchService;
    this.voicePlaybackService = voicePlaybackService;
    this.agentSessionsService = agentSessionsService;
    this.chatService = chatService;
    this.commandService = commandService;
    this.authenticationService = authenticationService;
    this.voiceTranscriptStore = voiceTranscriptStore;
    this.logService = logService;
    this.environmentService = environmentService;
    this.telemetryService = telemetryService;
    this.configurationService = configurationService;
    this.accessibilitySignalService = accessibilitySignalService;
    this.accessibilityService = accessibilityService;
    this.chatWidgetService = chatWidgetService;
    this.notificationService = notificationService;
    this.promptsService = promptsService;
    this.chatEntitlementService = chatEntitlementService;
    // --- Observables ---
    this._voiceState = observableValue(this, "idle");
    this.voiceState = this._voiceState;
    this._statusText = observableValue(this, "Tap to start");
    this.statusText = this._statusText;
    this._transcriptTurns = observableValue(this, []);
    this.transcriptTurns = this._transcriptTurns;
    this._isConnected = observableValue(this, false);
    this.isConnected = this._isConnected;
    this._isConnecting = observableValue(this, false);
    this.isConnecting = this._isConnecting;
    this._isReconnecting = observableValue(this, false);
    this.isReconnecting = this._isReconnecting;
    /** User-facing microphone mute. When set, captured audio is not forwarded to
     *  the backend, but the session stays connected so the user can unmute and
     *  resume without a new handshake. Reset to `false` on (re)connect. */
    this._isMuted = observableValue(this, false);
    this.isMuted = this._isMuted;
    /** Set when the connection closed terminally (e.g. another window took over
     *  the session). Suppresses the reconnect display path so the controller
     *  settles to a clean, restartable state instead of a stuck "Reconnecting...".
     *  Cleared on the next {@link connect}. */
    this._fatalDisconnect = false;
    this._pendingToolConfirmations = observableValue(this, []);
    this.pendingToolConfirmations = this._pendingToolConfirmations;
    /**
     * Session resources whose pending confirmations were dropped at a terminal
     * teardown (disconnect/fatal). The always-on tracker excludes them so it
     * can't repopulate {@link _pendingToolConfirmations} from the still-pending
     * old session before the next {@link connect}, which clears this set.
     */
    this._suppressedConfirmationSessions = observableValue(this, /* @__PURE__ */ new Set());
    this._targetSession = observableValue(this, void 0);
    this.targetSession = this._targetSession;
    this._hasDraftTarget = observableValue(this, false);
    this.hasDraftTarget = this._hasDraftTarget;
    // --- Internal state ---
    this._pttHeld = false;
    /** True once speech is detected in the current passive hands-free turn. */
    this._speechDetectedInTurn = false;
    /**
     * Whether the current held turn's `ptt_start` was passive (a hands-free
     * open mic: auto-listen or barge-in). A passive turn tells the backend not
     * to latch `user_is_speaking`; a deliberate press (non-passive) does latch.
     * Read by {@link _prepareForPlayback} to decide whether aborting the held
     * turn (which sends no `ptt_end`) is safe. Only meaningful while `_pttHeld`.
     */
    this._pttCurrentTurnPassive = false;
    this._pttToggleMode = false;
    /**
     * True while a passive hands-free barge-in listen is streaming during the
     * assistant's playback (opened by `_startBargeInListen`). It is NOT toggle
     * mode — an explicit `pttDown()` promotes this stream into a user-driven
     * interrupt rather than finishing it. Cleared once the turn ends, is
     * promoted, or transitions to a normal listening turn when playback stops.
     */
    this._bargeInListenActive = false;
    /** When true, the auto-listen loop is suppressed (user pressed Stop
     *  Recording). Cleared on the next explicit `pttDown` or on connect. */
    this._autoListenSuppressed = false;
    /**
     * Auto-listen hold taken by UI that must not be talked over (see
     * {@link setAutoListenHeld}). Deliberately separate from
     * `_autoListenSuppressed`, which pttDown, playback prep and disconnect all
     * clear as part of normal turn-taking - a hold has to outlive all of that.
     */
    this._autoListenHeld = false;
    /** Timestamp (ms) until which an incoming `send_to_chat` is dropped after a
     *  discarded turn, so buffered speech from a focus-change discard can't be
     *  misrouted to the newly focused session. Cleared on the next `pttDown`. */
    this._suppressSendToChatUntil = 0;
    /** Armed on a fresh connect (hands-free); consumed on `session_init` to
     *  enter listening once the backend acks the session. */
    this._enterListenOnSessionInit = false;
    this._pttCurrentTurnId = "";
    this._voiceEventDisposables = this._register(new DisposableStore());
    this._windowFocusDisposables = this._register(new DisposableStore());
    this._voiceAutorunDisposable = this._register(new MutableDisposable());
    /**
     * Holds the model reference for a session created by {@link newSessionAsTarget}
     * until a host adopts it. `ChatService` deletes empty untitled local sessions
     * once their last reference is disposed, so releasing this eagerly would leave
     * {@link _targetSession} pointing at a session that no longer exists whenever
     * no chat pane picks the new session up.
     */
    this._newSessionRef = this._register(new MutableDisposable());
    /**
     * Watchdog that resets `isConnecting` (and surfaces feedback) if the connect
     * handshake never completes. Armed up front in {@link connect} so a step that
     * hangs (e.g. resolving the GitHub session while a chat request is in flight)
     * can't leave the toolbar spinner stuck indefinitely.
     */
    this._connectWatchdog = this._register(new MutableDisposable());
    /**
     * Grace window between the socket opening and the backend acking the session.
     * A rejected connect is accepted and then closed (so the close frame can carry
     * a reason), which means `onopen` fires for doomed sockets too; committing
     * `isConnected` on open would flash a connected UI on every retry. Doubles as
     * the "session_init never arrived" fallback for entering hands-free listening.
     */
    this._sessionAckGrace = this._register(new MutableDisposable());
    this._connectAttemptGeneration = 0;
    this._sessionInitializationGeneration = 0;
    this._autoApprovedSessions = /* @__PURE__ */ new Set();
    this._pttWaitingForPlayback = false;
    /** Guards auto re-listen: only re-arm after a reply has actually played. */
    this._replyPlayedSinceSend = false;
    /** Set after send_to_chat; blocks auto-listen until the reply TTS starts. */
    this._awaitingReplyAudio = false;
    // --- Audio FIFO queue ---
    this._audioQueue = [];
    this._currentPlaybackSessionId = null;
    // True once the currently-playing response has received its final audio
    // chunk. A same-session frame arriving after this marks a NEW response and
    // must be serialized (queued) rather than fast-pathed, or its audio would be
    // appended into the finalized playback turn and dropped past `node.stop()`.
    this._currentPlaybackFinalized = false;
    this._isProcessingQueue = false;
    // True while we're suppressing in-flight assistant audio from the previous
    // turn (e.g. user interrupted with PTT). Cleared the moment a new assistant
    // response begins — signalled by `is_first_chunk` on the audio_response —
    // so the next response plays cleanly. Earlier this flag keyed on
    // `transcript` presence, but the streaming pipeline sends a running-concat
    // transcript on every chunk, so a late chunk from the old turn would have
    // incorrectly cleared the flag.
    this._suppressIncomingAudio = false;
    /** Turn/response ids whose playback was cancelled by barge-in. */
    this._interruptedAudioIds = /* @__PURE__ */ new Set();
    this._widgetSessionListeners = this._register(new DisposableMap());
    /**
     * True once an embedder drives the active session via `setActiveSessionShown`.
     * Focus/last-shown heuristics are then disabled.
     */
    this._externalActiveSessionMode = false;
    /**
     * Buffered audio for responses that arrived while their session was not the
     * one shown to the user. Keyed by session, each session holds a FIFO list of
     * whole responses (a background session that produces several updates before
     * the user returns keeps ALL of them, in order). Every response is a group of
     * audio chunks plus a `finalized` flag (set on its final chunk) so
     * continuation chunks attach to the still-open response rather than starting a
     * new one. Flushed - all responses, in order - when the session is shown.
     */
    this._deferredResponses = /* @__PURE__ */ new Map();
    /**
     * Maps a backend chat resource string (bare provider scheme, e.g.
     * `copilotcli:/<id>`) to the UI agent-host session resource string
     * (`agent-host-<provider>:/<id>`) that owns it. The voice backend tags a
     * background (unfocused) session's audio with its bare backend id, while the
     * UI - focus tracking, defer/flush buffer keys, and the sessions-list pending
     * indicator - all work in the agent-host resource space. Canonicalizing an
     * incoming id through this map keeps a deferred response's buffer key aligned
     * with the resource we flush on focus, so it is read exactly once when the
     * session becomes focused rather than stranded forever. Rebuilt from the live
     * session list and cleared on disconnect.
     */
    this._uiResourceByBackendId = /* @__PURE__ */ new Map();
    /** Sessions currently showing a pending-response indicator because they are
     *  awaiting confirmation while unfocused (client-driven, no audio needed). */
    this._confirmationPendingSessions = /* @__PURE__ */ new Set();
    /** Narration ids of confirmation prompts whose confirmation was resolved
     *  (e.g. the user pressed Allow) before the narration finished. Any
     *  `audio_response` chunks echoing one of these ids are dropped so a
     *  just-answered approval is never read aloud. Bounded, and an id is
     *  removed once its final chunk arrives. */
    this._cancelledPendingNarrationIds = /* @__PURE__ */ new Set();
    /** Sessions showing a pending-response indicator because a reply COMPLETED
     *  while they were unfocused (client-driven, mirrors the confirmation
     *  indicator). Maps to the response summary to narrate when the session is
     *  focused - stored so playback is reliable even if the model has since
     *  unloaded. Independent of the audio-defer buffer ({@link _deferredResponses}),
     *  which only exists when the backend proactively sent audio. */
    this._pendingResponseSummaries = /* @__PURE__ */ new Map();
    /**
     * Keys (session resource string, or ``''`` for untagged audio) of responses
     * we are currently playing live rather than deferring. Recorded on the first
     * chunk so the remaining chunks of that response follow the same decision and
     * a response is never split between playback and the deferred buffer.
     *
     * A SET rather than a single key so overlapping responses for DIFFERENT
     * sessions each keep their own routing: a live reply for session B must not
     * clear the live route of an in-flight reply for session A (which would send
     * A's continuation chunks down the focus-based fallback). Two concurrent
     * responses for the SAME session still can't be told apart without a backend
     * response/turn id; that remains a known limitation.
     */
    this._liveReplyKeys = /* @__PURE__ */ new Set();
    /**
     * Per-response routing decision, keyed by the backend-echoed `responseId`
     * (see {@link IVoiceAudioResponse.responseId}). A response's fate (`live` vs
     * `deferred`) is decided ONCE, when its first chunk is seen, and every later
     * chunk of that same response follows it - so interleaved responses for
     * different sessions never steal each other's routing (which a single global
     * key did) and a response is never split between playback and the buffer. A
     * deferred entry is flipped to `live` when its session is focused (the buffer
     * is flushed), so post-flush continuation chunks keep playing. Entries are
     * removed on the final chunk. Used only when the backend echoes a responseId;
     * otherwise the legacy session-keyed {@link _liveReplyKeys} path applies.
     */
    this._responseRoutes = /* @__PURE__ */ new Map();
    this._responseSessionIds = /* @__PURE__ */ new Map();
    this._ownershipDroppedResponseIds = /* @__PURE__ */ new Set();
    /**
     * Per-session record of the reply we most recently read for a session (played
     * live or flushed from the deferred buffer): its transcript and when it was
     * read. The backend re-emits a session's reply when that session becomes
     * active (on focus), which would double-read it. Durable dedup is mirrored in
     * `_lastHeardTranscriptById`; this record also supports activation/flush
     * bookkeeping. */
    this._recentlyReadResponse = /* @__PURE__ */ new Map();
    /** In-flight backend re-narrations we are dropping, so continuation chunks are
     *  dropped too (not just the first). Keyed by responseId when the backend
     *  echoes one (so a different same-session response streaming concurrently is
     *  NOT dropped), else by sessionId as a fallback. */
    this._droppingRenarration = /* @__PURE__ */ new Set();
    /** Narration ids this client explicitly requested via {@link _narrate} (the
     *  `narration_id` we sent on `request_narration`, which the backend echoes as
     *  `responseId` on the audio it produces). Audio whose `responseId` is one of
     *  these was solicited by us and must never be classified as an unsolicited
     *  duplicate re-narration, even when its transcript matches content we
     *  read (e.g. narrating a completed reply on focus). Ids are pruned when their
     *  stream ends (final chunk) and cleared on disconnect. */
    this._solicitedNarrationIds = /* @__PURE__ */ new Set();
    /**
     * Last reply transcript heard per session. This is the durable exactly-once
     * guard: a backend re-read of that response is always dropped.
     */
    this._lastHeardTranscriptById = /* @__PURE__ */ new Map();
    // --- Session audio cache for replay ---
    this._sessionAudioCache = /* @__PURE__ */ new Map();
    // --- Session state tracking for explicit change notifications ---
    this._prevSessionStates = /* @__PURE__ */ new Map();
    // Sessions the user explicitly cancelled from VS Code UI. We swallow the
    // NEXT state change for each (typically the chat model going `idle`) so the
    // backend doesn't narrate "the session became idle" right after the user
    // already hit Stop. Stored with a safety expiry in case the cancellation
    // never produces a state change.
    this._userCancelledSessions = /* @__PURE__ */ new Map();
    // Per-session watchdog timers that re-flush session_context shortly after
    // a confirmation transition. This is a paranoid mitigation: if the
    // transition's immediate flush is dropped (timer race, debounce timing,
    // or WS buffer hiccup), a second flush ~1.5s later guarantees the BE
    // observes the ``waiting_for_confirmation`` state. Subsequent re-sends
    // are no-ops on the BE because the merge-patch detects no field changes.
    this._confirmationFlushWatchdogs = /* @__PURE__ */ new Map();
    /**
     * Latest state change per session, buffered and flushed once after a short
     * settle window (see {@link _emitPendingStateChanges}) so a rapid
     * ``thinking <-> idle`` replay storm coalesces into a single net emission
     * instead of spamming the backend with contradictory transitions. Each entry
     * also records the burst's baseline (``fromState``/``fromDetail``) so a wobble
     * that returns to its starting state is recognized as net-zero.
     */
    this._pendingStateChanges = /* @__PURE__ */ new Map();
    /** Model refs eagerly loaded for sessions awaiting input (no UI focus needed). */
    this._eagerModelRefs = /* @__PURE__ */ new Map();
    /** Sessions with an in-flight eager model load, to dedupe concurrent loads. */
    this._eagerModelLoading = /* @__PURE__ */ new Set();
    /**
     * Sessions whose ``idle`` transition is being deferred until their chat
     * model loads, so the narration can include ``last_response_summary``.
     * While a session id is in this set we suppress emitting a premature,
     * summary-less ``idle`` to the backend (see _buildSessionContext).
     */
    this._pendingIdleNarration = /* @__PURE__ */ new Set();
    /**
     * Sessions that entered `thinking` during this controller's lifetime and are
     * therefore genuinely awaiting a completion. A summary-only transition (idle
     * state unchanged, but `last_response_summary` appeared/changed) only counts
     * as a NEW reply when the session is in this set - otherwise an OLD summary
     * surfacing because a dormant model was (re)hydrated would be mistaken for a
     * fresh response and wrongly light the sessions-list pending indicator.
     * Armed on an observed idle/waiting→thinking transition (never during eager
     * loading / replay) and consumed once the resulting idle+summary is accepted.
     */
    this._sessionsAwaitingResponseSummary = /* @__PURE__ */ new Set();
    /**
     * Last response summary captured per session WHILE its chat model was
     * resident. Copilot/remote session models are disposed as soon as the user
     * switches away, so a completion that lands while the session is unfocused
     * would otherwise be reported to the backend as a summary-less ``idle`` and
     * never narrated (the eager reload to recover the summary races the switch's
     * re-disposal). Caching the summary here — independent of the model's
     * lifetime — lets the no-model paths still report ``last_response_summary``.
     * Refreshed whenever a resident model exposes a summary; cleared when the
     * session starts a new turn (``thinking``) so a stale reply is never narrated.
     */
    this._lastResponseSummaryById = /* @__PURE__ */ new Map();
    /**
     * The exact text last narrated per session, used to de-duplicate narration
     * requests. Before asking the backend to speak a session's pending item we
     * check this map: an identical text was already spoken (live or on a prior
     * focus), so we skip it — this single guard replaces the old summary-identity
     * dedup, the recently-read window, and the focus/live double-narrate races.
     * Cleared for a session when it starts a new turn (`thinking`) so a repeated
     * identical reply later still narrates.
     */
    this._lastNarratedText = /* @__PURE__ */ new Map();
    /**
     * Narrations that could not be sent because the socket was closed (see
     * {@link _narrate}). Replayed once on the next `session_init` so a reply or
     * confirmation that landed during a disconnect is still spoken on reconnect.
     */
    this._pendingNarrationRetries = /* @__PURE__ */ new Map();
    /**
     * Narrations we requested (got a `narration_id` back) but whose audio has not
     * yet finished arriving. Keyed by that narration id. A request being accepted
     * by the backend is NOT proof the reply was heard - the audio can still be
     * dropped, deferred, or never returned - so we defer marking the reply as
     * narrated ({@link _lastNarratedText}) and clearing its pending indicator
     * until the final audio chunk for this id arrives (see {@link _markNarrationHeard}).
     * A safety timer releases the in-flight guard if no audio ever comes, so a
     * later focus/state event can retry rather than the reply being lost.
     */
    this._pendingSolicitedNarrations = /* @__PURE__ */ new Map();
    this._voiceProgressListeners = this._register(new DisposableMap());
    this._voiceProgressSessionByResponse = /* @__PURE__ */ new Map();
    this._lastSpokenAtBySession = /* @__PURE__ */ new Map();
    /**
     * Narrations the backend bounced (`narration_ack` `busy`) or cancelled
     * (`narration_interrupted`), awaiting retry. Keyed by canonical session key,
     * latest-wins (at most one pending per session). Retried on the
     * `narration_unblocked` nudge and replayed on `session_init`/`session_resumed`,
     * since a dropped socket loses any in-flight nudge. See
     * `_retryDeferredNarration`. Cleared on a new turn (`thinking`) or teardown.
     */
    this._deferredNarrations = /* @__PURE__ */ new Map();
    /**
     * The confirmation detail text last actually HEARD (final audio arrived) per
     * canonical session key. Confirmations are deliberately excluded from
     * {@link _lastNarratedText} (a tool can legitimately re-raise the identical
     * prompt), so this is the per-occurrence "already spoken" marker that stops a
     * still-pending confirmation from being re-narrated on every refocus (see
     * {@link _activateShownSession}). Recorded only once its audio finalizes (in
     * {@link _markNarrationHeard}), so a confirmation that was deferred/dropped and
     * never heard is still retried on focus. Cleared when the session leaves
     * `waiting_for_confirmation` (in the autorun) so a genuinely new confirmation -
     * even with identical text - narrates again.
     */
    this._narratedPending = /* @__PURE__ */ new Map();
    // --- Telemetry tracking ---
    this._telemetrySessionIndex = 0;
    this._telemetryTurnCount = 0;
    this._telemetryReconnectCount = 0;
    this._telemetryFirstConnect = true;
    this._telemetryTtsInterrupted = false;
    this._entitlementCheckScheduled = false;
    /** Last-N cross-session timeline entries — voice turns, voice tool
     * calls, coding-session events, plus a synthesized first-2-sentences
     * summary of the latest Copilot reply per active session. Sent to the
     * BE on the next start_session and then cleared — single-shot recall. */
    this._pendingPriorTimeline = [];
    this._register(this.chatEntitlementService.onDidChangeEntitlement(() => {
      if (this._entitlementCheckScheduled) {
        return;
      }
      this._entitlementCheckScheduled = true;
      queueMicrotask(() => {
        this._entitlementCheckScheduled = false;
        if (!this._store.isDisposed && !isVoiceEntitled(this.chatEntitlementService)) {
          this.disconnect();
        }
      });
    }));
    this._register(this.chatWidgetService.onDidChangeFocusedSession(() => this._onFocusedSessionChanged()));
    this._register(this.chatWidgetService.onDidChangeWidgetVisibility((widget) => {
      if (widget.visible) {
        this._onSessionShown(widget.viewModel?.sessionResource);
      }
    }));
    for (const widget of this.chatWidgetService.getAllWidgets()) {
      this._trackWidgetSession(widget);
    }
    this._register(this.chatWidgetService.onDidAddWidget((widget) => this._trackWidgetSession(widget)));
    this._register(this.chatWidgetService.onDidRemoveWidget((widget) => this._widgetSessionListeners.deleteAndDispose(widget)));
    this.voiceToolDispatchService.setDelegate({
      acceptInput: (text2) => {
        this.commandService.executeCommand("_chat.voice.acceptInput", text2).catch((err) => {
          this.logService.warn("[voice] acceptInput delegate failed:", err);
        });
        return true;
      },
      getCurrentSessionResource: async () => {
        const resourceStr = await this.commandService.executeCommand("_chat.voice.getCurrentSession").catch(() => void 0);
        return resourceStr ? URI.parse(resourceStr) : void 0;
      },
      switchToSession: async (resource) => await this.commandService.executeCommand("_chat.voice.switchToSession", resource.toString()).catch(() => false) === true,
      setTargetSession: (resource) => this.setTargetSession(resource),
      getTargetSessionResource: () => this._targetSession.get(),
      selectModel: async (requestedModel) => await this.commandService.executeCommand("_chat.voice.selectModel", requestedModel).catch(() => void 0) ?? { ok: false, reason: "no_input" },
      getAutoApprovedSessions: () => {
        return this._autoApprovedSessions;
      },
      addAllAutoApprovedSessions: () => {
        const sessions = this.agentSessionsService.model.sessions.filter((s) => !s.isArchived());
        for (const s of sessions) {
          this._autoApprovedSessions.add(s.resource.toString());
          const model = this.chatService.getSession(s.resource);
          if (model) {
            this._autoApprovePendingTools(model);
          }
        }
      },
      removeAutoApprovedSession: (resource) => {
        this._autoApprovedSessions.delete(resource);
      },
      triggerAutoApproveCheck: () => {
        this._autoApproveCheck();
      }
    });
    this._register(autorun((reader) => {
      const agentSessions = this.agentSessionsService.model.sessions.filter((s) => !s.isArchived());
      const toolConfirmations = [];
      const processedResources = /* @__PURE__ */ new Set();
      const suppressedSessions = this._suppressedConfirmationSessions.read(reader);
      const modelsToCheck = [];
      for (const s of agentSessions) {
        processedResources.add(s.resource.toString());
        this._recordSessionAlias(s.resource);
        const model = this.chatService.getSession(s.resource);
        if (model) {
          modelsToCheck.push({ model, resource: s.resource, label: s.label || "Untitled session" });
        }
      }
      for (const chatModel of this.chatService.chatModels.read(reader)) {
        const key3 = chatModel.sessionResource.toString();
        if (processedResources.has(key3)) {
          continue;
        }
        if (chatModel.getRequests().length === 0) {
          continue;
        }
        processedResources.add(key3);
        modelsToCheck.push({ model: chatModel, resource: chatModel.sessionResource, label: chatModel.title || "Chat" });
      }
      for (const { model, resource, label: label3 } of modelsToCheck) {
        if (suppressedSessions.has(resource.toString())) {
          continue;
        }
        const lastReq = model.lastRequestObs.read(reader);
        if (lastReq?.response) {
          const pending = lastReq.response.isPendingConfirmation.read(reader);
          if (pending && !this._autoApprovedSessions.has(resource.toString())) {
            const confirmType = this._classifyPendingType(lastReq.response);
            const desc = this._getConfirmationDescription(lastReq.response);
            toolConfirmations.push({
              type: confirmType,
              sessionLabel: label3,
              sessionResource: resource,
              description: desc || pending.detail || (confirmType === "input" ? "Needs your input" : "Needs approval"),
              approve: () => {
                if (lastReq.response) {
                  for (const part of lastReq.response.response.value) {
                    if (part.kind === "toolInvocation") {
                      IChatToolInvocation.confirmWith(part, { type: 4 /* UserAction */ });
                    }
                  }
                }
              },
              deny: () => {
                if (lastReq.response) {
                  for (const part of lastReq.response.response.value) {
                    if (part.kind === "toolInvocation") {
                      IChatToolInvocation.confirmWith(part, { type: 0 /* Denied */ });
                    }
                  }
                }
              }
            });
          }
          if (!pending && !this._autoApprovedSessions.has(resource.toString())) {
            for (const part of lastReq.response.response.value) {
              if (part.kind === "toolInvocation") {
                const toolState = part.state.read(reader);
                if (toolState.type === IChatToolInvocation.StateKind.WaitingForConfirmation) {
                  const params = toolState.parameters;
                  const questions = params?.["questions"];
                  let desc = "";
                  if (Array.isArray(questions) && questions.length > 0) {
                    desc = questions.map((q) => {
                      const title = q["header"] || q["question"];
                      if (!title) {
                        return "";
                      }
                      const options3 = q["options"];
                      if (Array.isArray(options3) && options3.length > 0) {
                        const labels2 = options3.map((o) => o["label"]).filter(Boolean);
                        if (labels2.length > 0) {
                          return `${title}: ${labels2.join(", ")}`;
                        }
                      }
                      return title;
                    }).filter(Boolean).join("; ");
                  }
                  toolConfirmations.push({
                    type: "input",
                    sessionLabel: label3,
                    sessionResource: resource,
                    description: desc || "Needs your input",
                    approve: () => {
                      IChatToolInvocation.confirmWith(part, { type: 4 /* UserAction */ });
                    },
                    deny: () => {
                      IChatToolInvocation.confirmWith(part, { type: 0 /* Denied */ });
                    }
                  });
                  break;
                }
              }
            }
          }
        }
      }
      this._pendingToolConfirmations.set(toolConfirmations, void 0);
    }));
    this._register(CommandsRegistry.registerCommand("_chat.voicePlayback.replay", (_accessor, payload) => {
      const sessionId = payload?.sessionId;
      if (!sessionId) {
        return;
      }
      this._replaySessionAudio(sessionId);
    }));
    this._register(CommandsRegistry.registerCommand("_chat.voicePlayback.stop", (_accessor, payload) => {
      this._stopReplay();
      if (payload?.sessionId) {
        this.voicePlaybackService.notifyPlaybackEnd(URI.parse(payload.sessionId));
      }
    }));
    this._register({ dispose: () => this.disconnect() });
  }
  static {
    // Rolling buffer (max 2). Each `pttDown` and each assistant turn pushes a new
    // entry; the oldest is evicted. Live user transcription mutates the last
    // entry in place while it's still a user turn at the tail.
    this._MAX_TURNS = 2;
  }
  static {
    this._CONNECT_TIMEOUT_MS = 1e4;
  }
  static {
    this._SESSION_ACK_GRACE_MS = 750;
  }
  static {
    this._PTT_MAX_DURATION_MS = 5 * 60 * 1e3;
  }
  static {
    /** Short-tap threshold: if the key is held for less than this, enter
     *  toggle mode where a second tap finishes the recording. */
    this._PTT_TOGGLE_THRESHOLD_MS = 300;
  }
  static {
    /** Debounce before re-entering listening after assistant stops speaking. */
    this._AUTO_LISTEN_QUIET_MS = 1200;
  }
  static {
    this._USER_CANCEL_SUPPRESS_MS = 1e4;
  }
  static {
    /** After a focus-change discard, drop a stray backend `send_to_chat` for
     *  this long so late-finalized buffered speech isn't misrouted. */
    this._DISCARD_SEND_SUPPRESS_MS = 2e3;
  }
  static {
    /** How long a focus-change submit stays pinned to the original session
     *  while the backend finalizes the turn and emits `send_to_chat`, before the
     *  pin is cleared so it can't misroute a much later, unrelated turn. */
    this._PINNED_SUBMIT_EXPIRY_MS = 15e3;
  }
  static {
    this._CONFIRMATION_FLUSH_DELAY_MS = 1500;
  }
  static {
    this._STATE_CHANGE_SETTLE_MS = 120;
  }
  static {
    this._SOLICITED_NARRATION_AUDIO_START_TIMEOUT_MS = 3e4;
  }
  static {
    this._VOICE_PROGRESS_INITIAL_DELAY_MS = 5e3;
  }
  static {
    this._VOICE_PROGRESS_INTERVAL_MS = 1e4;
  }
  static {
    this._MAX_VOICE_PROGRESS_PER_REQUEST = 5;
  }
  static {
    this._MAX_CONFIRMATION_NARRATION_CHARS = 2400;
  }
  static {
    this._MAX_QUESTIONNAIRE_QUESTIONS = 6;
  }
  static {
    this._MAX_QUESTIONNAIRE_OPTIONS = 5;
  }
  static {
    this._MAX_CONFIRMATION_FIELD_CHARS = 280;
  }
  static {
    /**
     * How many of the most recent persisted timeline entries we forward
     * to the BE (across all kinds). Coding-agent reply synthesis happens
     * on top of this — we add one entry per active coding session.
     */
    this.PRIOR_TIMELINE_ENTRY_LIMIT = 30;
  }
  static {
    /**
     * Max sentences of Copilot's last reply we include per active coding
     * session when synthesizing ``coding_agent_reply`` entries. Bounded
     * because the full reply can be arbitrarily long.
     */
    this.CODING_AGENT_REPLY_SENTENCE_LIMIT = 2;
  }
  async connect(window2) {
    if (this._isConnecting.get() || this._isConnected.get()) {
      return;
    }
    if (!isVoiceEntitled(this.chatEntitlementService)) {
      this.notificationService.warn(this.chatEntitlementService.entitlement === 9 /* Enterprise */ ? localize(11832, null) : localize(11833, null));
      return;
    }
    const connectAttemptGeneration = ++this._connectAttemptGeneration;
    this.setActiveWindow(window2);
    this._fatalDisconnect = false;
    this._suppressedConfirmationSessions.set(/* @__PURE__ */ new Set(), void 0);
    this._isConnecting.set(true, void 0);
    this._statusText.set("Connecting...", void 0);
    this._voiceState.set("idle", void 0);
    this._telemetryConnectStartMs = Date.now();
    this._armConnectWatchdog();
    let authToken;
    try {
      const sessions = await this.authenticationService.getSessions("github");
      if (connectAttemptGeneration !== this._connectAttemptGeneration) {
        return;
      }
      this._userLogin = sessions[0]?.account.label;
      authToken = sessions[0]?.accessToken;
      if (!this._userLogin) {
        this.logService.warn("[voice] no GitHub session found; transcripts will not be persisted");
      } else {
        const lastTurn = (await this.voiceTranscriptStore.loadTurns(this._userLogin, { limit: 1 }))[0];
        if (connectAttemptGeneration !== this._connectAttemptGeneration) {
          return;
        }
        this._lastPersistedTurnId = lastTurn?.turnId;
        try {
          const recent = await this.voiceTranscriptStore.loadTurns(
            this._userLogin,
            { limit: VoiceSessionController.PRIOR_TIMELINE_ENTRY_LIMIT }
          );
          if (connectAttemptGeneration !== this._connectAttemptGeneration) {
            return;
          }
          this._pendingPriorTimeline = this._buildPriorTimeline(recent);
        } catch (err) {
          this.logService.warn("[voice] failed to load prior timeline entries for context", err);
          this._pendingPriorTimeline = [];
        }
      }
    } catch (err) {
      this.logService.warn("[voice] failed to resolve GitHub session", err);
    }
    if (!this._isConnecting.get() || connectAttemptGeneration !== this._connectAttemptGeneration) {
      return;
    }
    this._voiceEventDisposables.clear();
    this._voiceEventDisposables.add(this.micCaptureService.onPttStart((passive) => {
      this.voiceClientService.sendPttStart(this._pttCurrentTurnId, {
        hasActiveSession: this._hasSessionInProgress(),
        passive
      });
    }));
    this._voiceEventDisposables.add(this.micCaptureService.onPttAudioChunk((b64) => {
      if (this._isMuted.get()) {
        return;
      }
      this.voiceClientService.sendPttAudioChunk(b64);
    }));
    this._voiceEventDisposables.add(this.micCaptureService.onPttEnd(() => {
      this.voiceClientService.sendPttEnd();
    }));
    this._voiceEventDisposables.add(this.micCaptureService.onPttDiagnostic((diag) => {
      this.logService.trace(
        `[voice] ptt.diagnostic turn_id=${diag.turnId} msHeld=${diag.msHeld} chunksSent=${diag.chunksSent} samplesSent=${diag.samplesSent} drainFired=${diag.drainFired} drainChunks=${diag.drainChunks} drainSamples=${diag.drainSamples} drainWindowMs=${diag.drainWindowMs} drainSkippedByMute=${diag.drainSkippedByMute} drainSkippedBySuppression=${diag.drainSkippedBySuppression} postReleaseCallbacks=${diag.postReleaseCallbacks} postReleaseSamples=${diag.postReleaseSamples} postReleaseSkippedByMute=${diag.postReleaseSkippedByMute} postReleaseSkippedBySuppression=${diag.postReleaseSkippedBySuppression} postReleaseWindowMs=${diag.postReleaseWindowMs} releasedDuringAcquire=${diag.releasedDuringAcquire} pttUpWithoutCapture=${diag.pttUpWithoutCapture}`
      );
      this.voiceClientService.sendPttDiagnostic(diag.turnId, {
        ms_held: diag.msHeld,
        chunks_sent: diag.chunksSent,
        samples_sent: diag.samplesSent,
        drain_fired: diag.drainFired,
        drain_chunks: diag.drainChunks,
        drain_samples: diag.drainSamples,
        drain_window_ms: diag.drainWindowMs,
        drain_skipped_by_mute: diag.drainSkippedByMute,
        drain_skipped_by_suppression: diag.drainSkippedBySuppression,
        post_release_callbacks: diag.postReleaseCallbacks,
        post_release_samples: diag.postReleaseSamples,
        post_release_skipped_by_mute: diag.postReleaseSkippedByMute,
        post_release_skipped_by_suppression: diag.postReleaseSkippedBySuppression,
        post_release_window_ms: diag.postReleaseWindowMs,
        released_during_acquire: diag.releasedDuringAcquire,
        ptt_up_without_capture: diag.pttUpWithoutCapture
      });
    }));
    this._voiceEventDisposables.add(this.ttsPlaybackService.onPlaybackStopped(() => {
      const wasInterrupted = this._telemetryTtsInterrupted;
      const listenedToEnd = !wasInterrupted;
      this.telemetryService.publicLog2("voiceTtsListenThrough", {
        listenedToEnd,
        listenedPct: listenedToEnd ? 100 : 50
        // approximation; exact % requires tracking audio position
      });
      this._telemetryTtsInterrupted = false;
      const finishedSessionId = this._currentPlaybackSessionId;
      const samples = this.ttsPlaybackService.getLastPlayedSamples();
      if (samples && finishedSessionId !== null) {
        const cacheKey2 = finishedSessionId ?? "__generic__";
        this._sessionAudioCache.set(cacheKey2, samples);
      }
      this.voicePlaybackService.notifyPlaybackEnd(void 0);
      this._currentPlaybackSessionId = null;
      this._currentPlaybackFinalized = false;
      const finishedResponseId = this._currentPlaybackResponseId;
      this._currentPlaybackResponseId = void 0;
      const finishedNarration = this._currentPlaybackNarration;
      this._currentPlaybackNarration = void 0;
      const finishedTranscript = this._currentPlaybackTranscript;
      this._currentPlaybackTranscript = void 0;
      if (!wasInterrupted) {
        const spokenSessionId = finishedSessionId ?? this._shownSessionId();
        if (spokenSessionId) {
          const spokenSessionKey = this._sessionKey(spokenSessionId);
          this._lastSpokenAtBySession.set(spokenSessionKey, Date.now());
          if (finishedResponseId) {
            this._notifyCheckpointPlaybackComplete(spokenSessionId, finishedResponseId, finishedNarration);
          }
          if (finishedNarration?.kind === "response" || finishedNarration === void 0) {
            if (finishedTranscript) {
              this._lastNarratedText.set(spokenSessionKey, finishedTranscript);
            }
            this._clearPendingResponse(spokenSessionKey);
          }
        }
        if (finishedResponseId) {
          this._markNarrationHeard(finishedResponseId);
        }
      } else if (finishedResponseId && wasInterrupted) {
        const pending = this._pendingSolicitedNarrations.get(finishedResponseId);
        if (pending) {
          this._deferInterruptedNarration(finishedResponseId, pending);
        }
      }
      if (this._audioQueue.length > 0) {
        setTimeout(() => this._processQueue(), 500);
      } else {
        if (this._pttHeld) {
          if (this._bargeInListenActive) {
            this._bargeInListenActive = false;
            this._pttToggleMode = true;
          }
          this._voiceState.set("listening", void 0);
          this._statusText.set("Listening...", void 0);
        } else {
          this._voiceState.set("idle", void 0);
          this._statusText.set("Hold to speak...", void 0);
          if (this._pttWaitingForPlayback) {
            this._scheduleDelayedMicStop();
          }
          if (this._isHandsFreeEnabled() && !this._awaitingReplyAudio && this._replyPlayedSinceSend) {
            this._scheduleAutoListen();
          }
        }
      }
    }));
    this._voiceEventDisposables.add(this.voiceClientService.onDidChangeConnectionState(async (connected) => {
      if (connected) {
        const sessionInitializationGeneration = ++this._sessionInitializationGeneration;
        this._armConnectWatchdog();
        const pbCtx = this.ttsPlaybackService.ensureContext(window2);
        pbCtx.resume();
        const isResuming = this.voiceClientService.isResuming;
        const now = Date.now();
        const voiceInstructions = await this.promptsService.getVoiceInstructions(CancellationToken.None);
        if (connectAttemptGeneration !== this._connectAttemptGeneration || sessionInitializationGeneration !== this._sessionInitializationGeneration || !this.voiceClientService.isConnected || !this._isConnecting.get() && !this._isReconnecting.get()) {
          return;
        }
        this._pendingConnectTelemetry = {
          connectMs: this._telemetryConnectStartMs ? now - this._telemetryConnectStartMs : 0,
          isResuming,
          at: now
        };
        if (isResuming) {
          this.micCaptureService.stopCapture();
        }
        this.micCaptureService.prepare(window2);
        if (this._isHandsFreeEnabled()) {
          try {
            await this.micCaptureService.startCapture(window2);
          } catch (err) {
            if (connectAttemptGeneration !== this._connectAttemptGeneration || sessionInitializationGeneration !== this._sessionInitializationGeneration || !this.voiceClientService.isConnected || !this._isConnecting.get() && !this._isReconnecting.get()) {
              return;
            }
            this.logService.warn("[voice] failed to warm microphone capture for hands-free mode; resetting voice mode", err);
            const permissionDenied = isMicrophonePermissionDeniedError(err);
            this._resetFailedConnection(!permissionDenied);
            return;
          }
          if (connectAttemptGeneration !== this._connectAttemptGeneration || sessionInitializationGeneration !== this._sessionInitializationGeneration || !this.voiceClientService.isConnected || !this._isConnecting.get() && !this._isReconnecting.get()) {
            return;
          }
        }
        if (isResuming) {
          this.voiceClientService.sendResumeSession(this._buildSessionContext(), this._getMachineId(), voiceInstructions);
        } else {
          const priorTimeline = this._pendingPriorTimeline;
          this._pendingPriorTimeline = [];
          this.voiceClientService.sendStartSession(this._buildSessionContext(), this._getMachineId(), priorTimeline, void 0, voiceInstructions);
        }
        this._sessionAckGrace.value = disposableTimeout(
          () => this._commitConnected(true),
          VoiceSessionController._SESSION_ACK_GRACE_MS
        );
        const seededResources = /* @__PURE__ */ new Set();
        for (const s of this.agentSessionsService.model.sessions.filter((ss) => !ss.isArchived())) {
          seededResources.add(s.resource.toString());
          const model = this.chatService.getSession(s.resource);
          const info = model ? this._getAgentStateInfo(model) : void 0;
          const currentState = info?.state ?? (s.status === 2 /* InProgress */ ? "thinking" : s.status === 3 /* NeedsInput */ ? "waiting_for_confirmation" : s.status === 1 /* Completed */ ? "idle" : "unknown");
          if (currentState !== "unknown") {
            this._prevSessionStates.set(s.resource.toString(), { state: currentState, detail: info?.detail ?? "", pendingId: currentState === "waiting_for_confirmation" ? this._pendingIdFor(s.resource.toString()) : "", confirmationType: info?.confirmation_type, lastResponseSummary: info?.last_response_summary ?? "" });
          }
        }
        for (const chatModel of this.chatService.chatModels.get()) {
          const key3 = chatModel.sessionResource.toString();
          if (seededResources.has(key3)) {
            continue;
          }
          if (chatModel.getRequests().length === 0) {
            continue;
          }
          const info = this._getAgentStateInfo(chatModel);
          if (info.state !== "unknown") {
            this._prevSessionStates.set(key3, { state: info.state, detail: info.detail ?? "", pendingId: info.state === "waiting_for_confirmation" ? this._pendingIdFor(key3) : "", confirmationType: info.confirmation_type, lastResponseSummary: info.last_response_summary ?? "" });
          }
        }
        const sessionChangeListener = this.agentSessionsService.model.onDidChangeSessions(() => {
          this._checkSessionStateChanges();
          this._sendContext();
        });
        const autorunDisposable = autorun((reader) => {
          const agentSessions = this.agentSessionsService.model.sessions.filter((s) => !s.isArchived());
          let needsRecheck = false;
          const stateChanges = [];
          const waitingForConfirmationSessions = [];
          const processedResources = /* @__PURE__ */ new Set();
          const processModel = (model, resource, label3) => {
            const sessionId = resource.toString();
            const lastReq = model.lastRequestObs.read(reader);
            if (lastReq?.response) {
              lastReq.response.isIncomplete.read(reader);
              const pending = lastReq.response.isPendingConfirmation.read(reader);
              const confirmationType2 = getVoiceConfirmationType(lastReq.response.response.value);
              if (pending && confirmationType2 === "tool" && this._autoApprovedSessions.has(sessionId)) {
                for (const part of lastReq.response.response.value) {
                  if (part.kind === "toolInvocation") {
                    if (IChatToolInvocation.confirmWith(part, { type: 4 /* UserAction */ })) {
                      needsRecheck = true;
                    }
                  }
                }
              }
              const responseSignal = observableSignalFromEvent(lastReq.response, lastReq.response.onDidChange);
              responseSignal.read(reader);
            }
            const info = this._getAgentStateInfo(model);
            const currentState = this._effectiveResidentState(sessionId, info);
            if (currentState === info.state) {
              this._pendingIdleNarration.delete(sessionId);
            }
            const detail2 = info.detail;
            const confirmationType = info.confirmation_type;
            const lastResponseSummary = info.last_response_summary;
            this._cacheResponseSummary(sessionId, info.state, lastResponseSummary);
            const prev = this._prevSessionStates.get(sessionId);
            const normalizedSummary = lastResponseSummary ?? "";
            const isStateTransition = prev !== void 0 && prev.state !== currentState && currentState !== "unknown";
            const pendingId = currentState === "waiting_for_confirmation" ? this._pendingIdFor(sessionId) : "";
            const isDetailTransition = !isStateTransition && prev !== void 0 && currentState === "waiting_for_confirmation" && ((detail2 ?? "") !== prev.detail || pendingId !== prev.pendingId || confirmationType !== prev.confirmationType);
            const isResponseSummaryTransition = !isStateTransition && prev !== void 0 && currentState === "idle" && !!normalizedSummary && normalizedSummary !== prev.lastResponseSummary && this._sessionsAwaitingResponseSummary.has(sessionId);
            const isTransition = isStateTransition || isDetailTransition || isResponseSummaryTransition;
            if (isTransition) {
              this.logService.trace(`[voice] autorun transition id=${sessionId.slice(-32)} ${prev?.state}\u2192${currentState} detailChanged=${isDetailTransition} summaryChanged=${isResponseSummaryTransition} hasDetail=${!!detail2}`);
              if (currentState === "thinking" && !this._eagerModelLoading.has(sessionId)) {
                this._clearLastNarratedText(sessionId);
                this._clearDeferred(this._sessionKey(sessionId));
                this._sessionsAwaitingResponseSummary.add(sessionId);
              }
              if (currentState === "idle" && !!normalizedSummary) {
                this._sessionsAwaitingResponseSummary.delete(sessionId);
              }
              const cancelExpiry = this._userCancelledSessions.get(sessionId);
              if (cancelExpiry) {
                this.logService.trace(`[voice] autorun swallowing transition (user-cancelled) id=${sessionId.slice(-32)}`);
                clearTimeout(cancelExpiry);
                this._userCancelledSessions.delete(sessionId);
              } else {
                stateChanges.push({ sessionId, currentState, label: label3, detail: detail2, confirmationType, lastResponseSummary, fromState: prev?.state ?? currentState, fromDetail: prev?.detail ?? "", fromConfirmationType: prev?.confirmationType, fromResponseSummary: prev?.lastResponseSummary ?? "", pendingId, fromPendingId: prev?.pendingId ?? "" });
              }
            }
            if (currentState !== "unknown") {
              const rememberedSummary = normalizedSummary || this._lastResponseSummaryById.get(sessionId) || prev?.lastResponseSummary || "";
              this._prevSessionStates.set(sessionId, { state: currentState, detail: detail2 ?? "", pendingId, confirmationType, lastResponseSummary: rememberedSummary });
              if (currentState !== "waiting_for_confirmation") {
                this._narratedPending.delete(this._sessionKey(sessionId));
                if (prev?.state === "waiting_for_confirmation") {
                  this._stopPendingNarration(sessionId);
                }
              } else if (isDetailTransition) {
                this._narratedPending.delete(this._sessionKey(sessionId));
                this._stopPendingNarration(sessionId);
              }
            }
            if (currentState === "waiting_for_confirmation") {
              waitingForConfirmationSessions.push({ sessionId, label: label3, detail: detail2, transition: isTransition });
            }
          };
          for (const s of agentSessions) {
            processedResources.add(s.resource.toString());
            const model = this.chatService.getSession(s.resource);
            if (model) {
              processModel(model, s.resource, s.label || "Untitled session");
            } else {
              const sessionId = s.resource.toString();
              const currentState = s.status === 2 /* InProgress */ ? "thinking" : s.status === 3 /* NeedsInput */ ? "waiting_for_confirmation" : s.status === 1 /* Completed */ ? "idle" : "unknown";
              this._cacheResponseSummary(sessionId, currentState, void 0);
              if (s.status === 3 /* NeedsInput */) {
                this._ensureModelLoaded(s.resource);
              }
              const prev = this._prevSessionStates.get(sessionId);
              const isStateTransition = prev !== void 0 && prev.state !== currentState && currentState !== "unknown";
              if (isStateTransition && currentState === "thinking") {
                this._sessionsAwaitingResponseSummary.add(sessionId);
              }
              if (prev?.state === "waiting_for_confirmation" && currentState !== "waiting_for_confirmation" && currentState !== "unknown") {
                this._narratedPending.delete(this._sessionKey(sessionId));
                this._stopPendingNarration(sessionId);
              }
              if (isStateTransition && currentState === "idle") {
                const cachedSummary = this._lastResponseSummaryById.get(sessionId);
                if (!cachedSummary) {
                  this._deferIdleNarrationUntilModelLoaded(s.resource);
                  continue;
                }
                this._sessionsAwaitingResponseSummary.delete(sessionId);
                if (!this._userCancelledSessions.has(sessionId)) {
                  stateChanges.push({ sessionId, currentState, label: s.label || "Untitled session", lastResponseSummary: cachedSummary, fromState: prev?.state ?? currentState, fromDetail: prev?.detail ?? "", fromConfirmationType: prev?.confirmationType, fromResponseSummary: prev?.lastResponseSummary ?? "", pendingId: "", fromPendingId: prev?.pendingId ?? "" });
                }
                this._prevSessionStates.set(sessionId, { state: currentState, detail: "", pendingId: "", lastResponseSummary: cachedSummary ?? "" });
                continue;
              }
              if (isStateTransition) {
                const cancelExpiry = this._userCancelledSessions.get(sessionId);
                if (cancelExpiry) {
                  clearTimeout(cancelExpiry);
                  this._userCancelledSessions.delete(sessionId);
                } else {
                  stateChanges.push({ sessionId, currentState, label: s.label || "Untitled session", fromState: prev?.state ?? currentState, fromDetail: prev?.detail ?? "", fromConfirmationType: prev?.confirmationType, fromResponseSummary: prev?.lastResponseSummary ?? "", pendingId: "", fromPendingId: prev?.pendingId ?? "" });
                }
              }
              if (currentState !== "unknown") {
                const rememberedSummary = this._lastResponseSummaryById.get(sessionId) || prev?.lastResponseSummary || "";
                this._prevSessionStates.set(sessionId, { state: currentState, detail: "", pendingId: "", lastResponseSummary: rememberedSummary });
                if (currentState !== "waiting_for_confirmation") {
                  this._narratedPending.delete(this._sessionKey(sessionId));
                }
              }
              if (currentState === "waiting_for_confirmation") {
                waitingForConfirmationSessions.push({ sessionId, label: s.label || "Untitled session", detail: void 0, transition: isStateTransition });
              }
            }
          }
          for (const chatModel of this.chatService.chatModels.read(reader)) {
            const key3 = chatModel.sessionResource.toString();
            if (processedResources.has(key3)) {
              continue;
            }
            if (chatModel.getRequests().length === 0) {
              continue;
            }
            processedResources.add(key3);
            processModel(chatModel, chatModel.sessionResource, chatModel.title || "Chat");
          }
          if (needsRecheck) {
            setTimeout(() => this._autoApproveCheck(), 500);
          }
          this._pruneSessionCaches(processedResources);
          if (stateChanges.length > 0) {
            for (const change of stateChanges) {
              const existing = this._pendingStateChanges.get(change.sessionId);
              this._pendingStateChanges.set(change.sessionId, existing ? { ...change, fromState: existing.fromState, fromDetail: existing.fromDetail, fromConfirmationType: existing.fromConfirmationType, fromResponseSummary: existing.fromResponseSummary, fromPendingId: existing.fromPendingId } : change);
            }
            this._scheduleStateChangeEmit();
          } else {
            this._sendContext();
          }
          for (const w of waitingForConfirmationSessions) {
            this._armConfirmationFlushWatchdog(w.sessionId, w.label, w.transition);
          }
          const stillWaiting = new Set(waitingForConfirmationSessions.map((w) => w.sessionId));
          this._reconcileConfirmationIndicators(stillWaiting);
          for (const id2 of [...this._confirmationFlushWatchdogs.keys()]) {
            if (!stillWaiting.has(id2)) {
              const t2 = this._confirmationFlushWatchdogs.get(id2);
              if (t2) {
                clearTimeout(t2);
              }
              this._confirmationFlushWatchdogs.delete(id2);
            }
          }
          for (const id2 of [...this._eagerModelRefs.keys()]) {
            if (!stillWaiting.has(id2)) {
              this._eagerModelRefs.get(id2).dispose();
              this._eagerModelRefs.delete(id2);
            }
          }
        });
        const connectionDisposables = new DisposableStore();
        connectionDisposables.add(sessionChangeListener);
        connectionDisposables.add(autorunDisposable);
        connectionDisposables.add(disposableWindowInterval(this._window, () => this._checkSessionStateChanges(), 5e3));
        this._voiceAutorunDisposable.value = connectionDisposables;
        this.micCaptureService.isMuted = false;
        this._isMuted.set(false, void 0);
        this._statusText.set("Hold to speak...", void 0);
        this._voiceState.set("idle", void 0);
        this._enterListenOnSessionInit = this._shouldEnterListenOnSessionInit(isResuming);
        this.logService.trace(`[voice] connected: isResuming=${isResuming} handsFree=${this._isHandsFreeEnabled()} armListen=${this._enterListenOnSessionInit}`);
      } else {
        this._sessionInitializationGeneration++;
        if (this._fatalDisconnect) {
        } else if (!this.voiceClientService.willReconnect) {
          this.disconnect();
        } else if (this._isConnected.get()) {
          this._onConnectionLost();
        } else {
          this.micCaptureService.stopCapture();
          transaction((tx) => {
            this._isConnecting.set(false, tx);
            this._isReconnecting.set(true, tx);
          });
          this._voiceState.set("idle", void 0);
          this._statusText.set("Reconnecting...", void 0);
        }
      }
    }));
    this._voiceEventDisposables.add(this.voiceClientService.onSessionInit(() => {
      this._commitConnected();
      this.logService.trace(`[voice] session_init received; armListen=${this._enterListenOnSessionInit} pendingRetries=${this._pendingNarrationRetries.size} deferredNarrations=${this._deferredNarrations.size}`);
      let narrated = false;
      if (this._pendingNarrationRetries.size > 0) {
        const retries = [...this._pendingNarrationRetries.entries()];
        this._pendingNarrationRetries.clear();
        for (const [sessionId, item] of retries) {
          narrated = this._retryPendingNarration(sessionId, item) || narrated;
        }
      }
      if (this._deferredNarrations.size > 0) {
        const deferredKeys = [...this._deferredNarrations.keys()];
        for (const sessionKey of deferredKeys) {
          narrated = this._retryDeferredNarration(sessionKey) || narrated;
        }
      }
      if (this._enterListenOnSessionInit && !narrated) {
        this._enterListenOnSessionInit = false;
        this._enterAutoListen("connect");
      } else if (narrated) {
        this._enterListenOnSessionInit = false;
      }
    }));
    this._voiceEventDisposables.add(this.voiceClientService.onBargeIn((e) => this._handleBargeIn(e)));
    this._voiceEventDisposables.add(this.voiceClientService.onNarrationAck((e) => {
      this._handleNarrationAck(e);
    }));
    this._voiceEventDisposables.add(this.voiceClientService.onNarrationUnblocked((e) => {
      this._retryDeferredNarration(this._sessionKey(e.codingSessionId), e.narrationId || void 0);
    }));
    this._voiceEventDisposables.add(this.voiceClientService.onNarrationInterrupted((e) => {
      this._handleNarrationInterrupted(e);
    }));
    this._voiceEventDisposables.add(this.voiceClientService.onSpeechStarted((event) => {
      this._speechDetectedInTurn = true;
      this._clearAutoListenTimer();
      this._interruptAssistantPlayback();
      const turnId = event.turnId || this._pttCurrentTurnId;
      if (turnId && this._transcriptionTurnState?.turnId !== turnId) {
        this._beginTranscriptionTurn(turnId);
      }
      this._startUserTurn();
    }));
    this._voiceEventDisposables.add(this.voiceClientService.onTurnAutoEnded((e) => this._handleTurnAutoEnded(e)));
    this._voiceEventDisposables.add(this.voiceClientService.onTranscription((e) => this._handleTranscription(e)));
    this._voiceEventDisposables.add(this.voiceClientService.onAudioResponse((e) => {
      if (this._isInterruptedAudio(e)) {
        return;
      }
      const solicitedNarration = e.responseId ? this._pendingSolicitedNarrations.get(e.responseId) : void 0;
      const echoedCheckpoint = e.requestId && e.checkpointId && e.sequence !== void 0 ? { requestId: e.requestId, checkpointId: e.checkpointId, sequence: e.sequence } : void 0;
      const narrationKind = e.narrationKind ?? solicitedNarration?.kind;
      const playbackNarration = narrationKind ? {
        kind: narrationKind,
        checkpoint: echoedCheckpoint ?? solicitedNarration?.checkpoint,
        playbackId: e.playbackId
      } : void 0;
      const isCheckpointNarration = playbackNarration?.kind === "checkpoint";
      if (isCheckpointNarration && e.isFinal) {
        this.logService.trace(`[voice][checkpoint] received narration_id=${e.responseId} request_id=${playbackNarration.checkpoint?.requestId ?? "<unknown>"} phase=${playbackNarration.checkpoint?.checkpointId ?? "<unknown>"} sequence=${playbackNarration.checkpoint?.sequence ?? 0} playback_id=${playbackNarration.playbackId ?? "<none>"} spoken=${JSON.stringify(e.transcript ?? "")}`);
      }
      if (e.isFirstChunk && this._telemetryPttUpMs) {
        const ttft = this._telemetryFirstTranscriptionMs && this._telemetryPttDownMs ? this._telemetryFirstTranscriptionMs - this._telemetryPttDownMs : 0;
        const e2e = Date.now() - this._telemetryPttUpMs;
        this.telemetryService.publicLog2("voiceLatency", {
          timeToFirstTranscriptionMs: ttft,
          endToEndTurnMs: e2e
        });
        this._telemetryPttUpMs = void 0;
      }
      const codingSessionId = this._canonicalSessionId(e.codingSessionId ?? solicitedNarration?.sessionId ?? (e.responseId ? this._responseSessionIds.get(e.responseId) : void 0));
      if (e.responseId && codingSessionId) {
        this._responseSessionIds.set(e.responseId, codingSessionId);
      }
      if (e.responseId && this._ownershipDroppedResponseIds.has(e.responseId)) {
        if (e.isFinal) {
          this._ownershipDroppedResponseIds.delete(e.responseId);
          this._responseSessionIds.delete(e.responseId);
          this._responseRoutes.delete(e.responseId);
        }
        return;
      }
      if (e.responseId !== void 0 && this._cancelledPendingNarrationIds.has(e.responseId)) {
        if (e.isFinal) {
          this._cancelledPendingNarrationIds.delete(e.responseId);
        }
        return;
      }
      if (e.audio) {
        this._markSolicitedNarrationAudioStarted(e.responseId);
      }
      if (isCheckpointNarration && solicitedNarration && e.isFinal && !e.audio && !solicitedNarration.hasReceivedAudio) {
        if (e.responseId) {
          this._clearPendingSolicitedNarration(e.responseId, solicitedNarration);
          this._solicitedNarrationIds.delete(e.responseId);
          this._responseRoutes.delete(e.responseId);
        }
        return;
      }
      const isRenarration = this._isRenarration(e.responseId, codingSessionId, e.transcript, e.isFirstChunk, e.isFinal);
      const targetSessionId = this._targetSession.get()?.toString();
      const belongsToVoiceSession = !codingSessionId || !this._hasDraftTarget.get() && (!targetSessionId || this._isSameSession(codingSessionId, targetSessionId));
      if (!belongsToVoiceSession) {
        if (e.responseId && !e.isFinal) {
          this._ownershipDroppedResponseIds.add(e.responseId);
        }
        if (e.responseId) {
          const pending = this._pendingSolicitedNarrations.get(e.responseId);
          if (pending) {
            if (pending.kind === "response") {
              const key3 = this._sessionKey(pending.sessionId);
              this._pendingResponseSummaries.set(key3, pending.text);
              this._markPendingResponse(key3, true);
            }
            this._deferInterruptedNarration(e.responseId, pending);
          }
        }
        if (e.responseId && e.isFinal) {
          this._responseSessionIds.delete(e.responseId);
          this._responseRoutes.delete(e.responseId);
        }
        this.logService.trace(`[voice] dropping audio for non-target session=${codingSessionId} target=${targetSessionId}`);
        return;
      }
      const defer = isRenarration ? false : this._shouldDeferResponseStream(e.responseId, codingSessionId, e.isFirstChunk);
      if (e.isFirstChunk || e.isFinal) {
        this.logService.trace(`[voice] audio_response codingSessionId=${codingSessionId ?? "<none>"} responseId=${e.responseId?.slice(0, 8) ?? "<none>"} shown=${this._shownSessionId() ?? "<none>"} focused=${this._getFocusedSessionId() ?? "<none>"} external=${this._activeSessionShown ?? "<none>"} awaiting=${this._awaitingReplyForSession ?? "<none>"} isFirstChunk=${e.isFirstChunk} isFinal=${e.isFinal} suppress=${this._suppressIncomingAudio} renarration=${isRenarration} defer=${defer}`);
      }
      if (isRenarration) {
        this.logService.trace(`[voice] dropping re-narration for session=${codingSessionId} responseId=${e.responseId?.slice(0, 8) ?? "<none>"} isFirstChunk=${e.isFirstChunk} isFinal=${e.isFinal}`);
      } else if (defer && isCheckpointNarration) {
        if (e.responseId && solicitedNarration) {
          this._clearPendingSolicitedNarration(e.responseId, solicitedNarration);
          this._solicitedNarrationIds.delete(e.responseId);
        }
        return;
      } else if (defer) {
        this._deferResponse(codingSessionId, e.audio, e.isFirstChunk, e.isFinal, e.transcript, e.responseId, e.turnId);
      } else {
        if (e.audio && !isCheckpointNarration) {
          this._preemptCheckpointPlayback();
        }
        if (e.isFirstChunk && codingSessionId && this._deferredResponses.has(codingSessionId) && !this._deferredBufferHasResponse(codingSessionId, e.responseId)) {
          this._flushDeferredResponse(codingSessionId);
        }
        this._enqueueAudio(codingSessionId, e.audio, e.isFirstChunk, e.isFinal, e.transcript, e.responseId, playbackNarration);
        if (e.isFinal) {
          this._liveReplyKeys.delete(codingSessionId ?? "");
          const heardSessionId = codingSessionId ?? this._awaitingReplyForSession ?? this._shownSessionId();
          if (!isCheckpointNarration && heardSessionId && e.transcript) {
            const heard = this._normalizeTranscript(e.transcript);
            if (heard) {
              const heardKey = this._sessionKey(heardSessionId);
              this._lastHeardTranscriptById.set(heardKey, heard);
              this._recentlyReadResponse.set(heardKey, { transcript: heard, at: Date.now() });
            }
          }
        }
      }
      if (!isCheckpointNarration && e.isFinal && e.transcript) {
        this._persistTurn("assistant", e.transcript);
      }
      if (e.isFinal && e.responseId) {
        this._responseSessionIds.delete(e.responseId);
        this._responseRoutes.delete(e.responseId);
      }
    }));
    this._voiceEventDisposables.add(this.voiceClientService.onToolCall((e) => {
      this.logService.trace(`[voice] tool_call received name=${e.name} coding_session_id=${typeof e.args?.["coding_session_id"] === "string" ? String(e.args["coding_session_id"]).slice(-32) : "<none>"} activeId=${this._getActiveSessionId()?.slice(-32) ?? "<none>"}`);
      const allowedTools = [
        "send_to_chat",
        "get_session_info",
        "get_session_changes",
        "get_session_thread",
        "respond_to_session",
        "auto_approve_session",
        "revoke_auto_approve",
        "focus_session"
      ];
      if (e.name === "send_to_chat") {
        if (Date.now() < this._suppressSendToChatUntil) {
          this.logService.trace("[voice] dropping send_to_chat: turn discarded on focus change");
          this.voiceClientService.sendToolResult(e.callId, "ok");
          return;
        }
        const rawText = typeof e.args?.["text"] === "string" ? e.args["text"] : "";
        const text2 = this._stripStopPhrase(rawText);
        if (text2 !== rawText && e.args) {
          e.args["text"] = text2;
        }
        if (e.args?.["new_session"] === true) {
          this._setPinnedSubmitSession(void 0);
          this.newSessionAsTarget();
          if (text2.trim()) {
            this._setPinnedSubmitSession(this._targetSession.get());
          }
        }
        this._statusText.set(VoiceToolDispatchService.getActionLabel(e.name), void 0);
        this._persistEntry("agent_tool_call", this._renderToolCallSummary(e.name, e.args), {
          toolName: e.name,
          toolArgs: e.args
        });
        const shouldSend = text2.trim().length > 0;
        if (shouldSend) {
          this._setAwaitingReply();
        }
        const finishSend = (result) => {
          this._voiceState.set(this._awaitingReplyAudio ? "processing" : "idle", void 0);
          this._statusText.set(this._awaitingReplyAudio ? "Waiting for response..." : "Hold to speak...", void 0);
          this._sendContext();
          this.voiceClientService.sendToolResult(e.callId, result);
        };
        const sendPromise = shouldSend ? this._sendTranscriptionToChat(text2) : Promise.resolve(false);
        sendPromise.then((sent) => {
          if (!sent) {
            this._clearAwaitingReply();
          }
          finishSend(sent ? "ok" : "error");
        }, (err) => {
          this.logService.warn("[voice] send_to_chat delivery failed:", err);
          this._clearAwaitingReply();
          finishSend("error");
        });
        return;
      }
      if (allowedTools.includes(e.name)) {
        const passiveTools = ["get_session_info", "get_session_changes", "get_session_thread"];
        if (passiveTools.includes(e.name)) {
          this.voiceToolDispatchService.dispatchToolCall(e).then((result) => {
            this.voiceClientService.sendToolResult(e.callId, result);
          }, (err) => {
            this.logService.error(`[voice] passive tool ${e.name} dispatch failed`, err);
            this.voiceClientService.sendToolResult(e.callId, "error");
          });
          return;
        }
        this._statusText.set(VoiceToolDispatchService.getActionLabel(e.name), void 0);
        this._persistEntry("agent_tool_call", this._renderToolCallSummary(e.name, e.args), {
          toolName: e.name,
          toolArgs: e.args
        });
        if (this._pttHeld) {
          this._finishPtt();
        }
        this._suppressIncomingAudio = false;
        this._setAwaitingReply();
        const settle = () => {
          this._voiceState.set("idle", void 0);
          this._statusText.set("Hold to speak...", void 0);
          this._sendContext();
        };
        if (e.name === "respond_to_session") {
          const response = e.args?.["response"];
          const responseType = response && typeof response === "object" && !Array.isArray(response) ? response["type"] : void 0;
          this.voiceToolDispatchService.respondToSession(e).then((result) => {
            this.logService.trace(`[voice] respond_to_session type=${String(responseType)} ok=${result.ok} reason=${result.reason ?? "<none>"} coding_session_id=${typeof e.args?.["coding_session_id"] === "string" ? String(e.args["coding_session_id"]).slice(-32) : "<none>"}`);
            if (responseType === "approve" || responseType === "reject") {
              this.telemetryService.publicLog2("voiceToolApproval", {
                toolName: e.name,
                approved: responseType === "approve"
              });
            }
            this.voiceClientService.sendToolResult(e.callId, result);
            settle();
          }, (err) => {
            this.logService.error(`[voice] respond_to_session dispatch failed`, err);
            this.voiceClientService.sendToolResult(e.callId, { ok: false, reason: "unsupported" });
            settle();
          });
          return;
        }
        this.voiceToolDispatchService.dispatchToolCall(e).then((result) => {
          this.voiceClientService.sendToolResult(e.callId, result);
          settle();
        }, (err) => {
          this.logService.error(`[voice] tool ${e.name} dispatch failed`, err);
          this.voiceClientService.sendToolResult(e.callId, "error");
          settle();
        });
      } else {
        this.voiceClientService.sendToolResult(e.callId, "ok");
      }
    }));
    this._voiceEventDisposables.add(this.voiceClientService.onError((detail2) => {
      if (!this._isConnecting.get()) {
        this._voiceState.set("error", void 0);
        this._statusText.set(`Error: ${detail2}`, void 0);
      }
    }));
    this._voiceEventDisposables.add(this.voiceClientService.onFatalDisconnect((e) => {
      this._handleFatalDisconnect(e);
    }));
    this._voiceEventDisposables.add(this.voiceClientService.onConnectionIssue((e) => {
      if (!this._isReconnecting.get() && !this._isConnecting.get()) {
        return;
      }
      if (!this._isReconnecting.get() && this.voiceClientService.willReconnect) {
        transaction((tx) => {
          this._isConnecting.set(false, tx);
          this._isReconnecting.set(true, tx);
        });
      }
      this._statusText.set(this._reconnectingMessage(e.code, e.reason), void 0);
    }));
    await this.voiceClientService.connect(window2, authToken);
    if (!this._isConnecting.get() || connectAttemptGeneration !== this._connectAttemptGeneration) {
      return;
    }
    this._armConnectWatchdog();
  }
  setActiveWindow(window2) {
    this._window = window2;
    this._windowFocusDisposables.clear();
    this._windowFocusDisposables.add(addDisposableListener(window2, "blur", () => this._onWindowBlur()));
    this._windowFocusDisposables.add(addDisposableListener(window2, "focus", () => this._onWindowFocus()));
    this._onFocusedSessionChanged();
  }
  /**
   * Arms (or re-arms) the watchdog that resets voice mode if the connect
   * handshake never completes. Without this, a hung connect step leaves the
   * toolbar spinner spinning forever with no way to recover; on timeout we drop
   * back to a disconnected state and tell the user so they can retry.
   */
  _armConnectWatchdog() {
    this._connectWatchdog.value = disposableTimeout(() => {
      if (!this._isConnecting.get() || this._isConnected.get()) {
        return;
      }
      this.logService.warn("[voice] connect handshake timed out; resetting voice mode");
      this._resetFailedConnection();
    }, VoiceSessionController._CONNECT_TIMEOUT_MS);
  }
  /**
   * Promote an open socket to a live session. Called when the backend acks
   * (`session_init` / `session_resumed`), or from the ack grace timer if no ack
   * arrives. `viaFallback` also runs the hands-free auto-listen that the ack
   * would otherwise have triggered.
   */
  _commitConnected(viaFallback = false) {
    this._sessionAckGrace.clear();
    if (this._isConnected.get() || !this.voiceClientService.isConnected) {
      return;
    }
    transaction((tx) => {
      this._isConnecting.set(false, tx);
      this._isReconnecting.set(false, tx);
      this._isConnected.set(true, tx);
    });
    this._connectWatchdog.clear();
    this._flushConnectTelemetry();
    if (viaFallback && this._enterListenOnSessionInit) {
      this.logService.trace("[voice] session ack not seen within grace; entering listening via fallback");
      this._enterListenOnSessionInit = false;
      this._enterAutoListen("connect");
    }
  }
  /** Emit the connect telemetry the socket-open path deferred until admission. */
  _flushConnectTelemetry() {
    const pending = this._pendingConnectTelemetry;
    if (!pending) {
      return;
    }
    this._pendingConnectTelemetry = void 0;
    if (this._telemetryFirstConnect) {
      this._telemetryFirstConnect = false;
      this.telemetryService.publicLog2("voiceFirstConnect", { timeToConnectMs: pending.connectMs });
    }
    if (pending.isResuming) {
      this._telemetryReconnectCount++;
      const secSinceLast = this._telemetryLastConnectMs ? Math.round((pending.at - this._telemetryLastConnectMs) / 1e3) : 0;
      this.telemetryService.publicLog2("voiceReconnect", { timeSinceLastConnectSec: secSinceLast });
    } else {
      this._telemetrySessionIndex++;
      this._telemetrySessionStart = pending.at;
      this._telemetryTurnCount = 0;
      this._telemetryReconnectCount = 0;
      this.telemetryService.publicLog2("voiceSessionStarted", { sessionIndex: this._telemetrySessionIndex });
    }
    this._telemetryLastConnectMs = pending.at;
  }
  _resetFailedConnection(notifyUser = true) {
    this.disconnect();
    if (notifyUser) {
      this.notificationService.notify({
        severity: Severity2.Warning,
        message: localize(11831, null)
      });
    }
  }
  /**
   * Exclude the currently-pending confirmation sessions from the always-on
   * tracker until the next {@link connect}, so a terminal teardown's cleared
   * snapshot can't be repopulated from the still-pending old session.
   */
  _suppressPendingConfirmationsUntilConnect() {
    const suppressed = new Set(this._suppressedConfirmationSessions.get());
    for (const tc of this._pendingToolConfirmations.get()) {
      suppressed.add(tc.sessionResource.toString());
    }
    this._suppressedConfirmationSessions.set(suppressed, void 0);
  }
  disconnect(source = "internal") {
    this._connectAttemptGeneration++;
    const shouldPlayStoppedSignal = source === "explicit" && (this._isConnecting.get() || this._isConnected.get() || this._isReconnecting.get());
    const shouldPlayRecordingStoppedSignal = source === "explicit" && this._pttHeld;
    this._endTelemetrySession();
    this._isConnecting.set(false, void 0);
    this._isReconnecting.set(false, void 0);
    this._connectWatchdog.clear();
    this._sessionAckGrace.clear();
    this._pendingConnectTelemetry = void 0;
    this._voiceAutorunDisposable.clear();
    this._voiceEventDisposables.clear();
    this._windowFocusDisposables.clear();
    this.ttsPlaybackService.closeContext();
    this.micCaptureService.stopCapture();
    this.voiceClientService.disconnect();
    this._pttHeld = false;
    this._speechDetectedInTurn = false;
    this._pttToggleMode = false;
    this._pttCurrentTurnId = "";
    this._resetTranscriptionTurn();
    this._bargeInListenActive = false;
    this._isConnected.set(false, void 0);
    this._isMuted.set(false, void 0);
    this._voiceState.set("idle", void 0);
    this._statusText.set("Tap to start", void 0);
    this._transcriptTurns.set([], void 0);
    this._clearAutoListenTimer();
    this._clearAwaitingReply();
    this._autoListenSuppressed = false;
    this._enterListenOnSessionInit = false;
    this._replyPlayedSinceSend = false;
    this._audioQueue.length = 0;
    this._currentPlaybackSessionId = null;
    this._currentPlaybackResponseId = void 0;
    this._currentPlaybackNarration = void 0;
    this._currentPlaybackTranscript = void 0;
    this._lastSpokenResponseSessionId = void 0;
    this._isProcessingQueue = false;
    this._suppressIncomingAudio = false;
    this._interruptedAudioIds.clear();
    this._clearDeferredResponses();
    this._uiResourceByBackendId.clear();
    this._liveReplyKeys.clear();
    this._lastShownSessionId = void 0;
    this._setTargetSession(void 0);
    this._hasDraftTarget.set(false, void 0);
    this._suppressPendingConfirmationsUntilConnect();
    this._pendingToolConfirmations.set([], void 0);
    this._activeSessionShown = void 0;
    this._externalActiveSessionMode = false;
    this._recentlyReadResponse.clear();
    this._droppingRenarration.clear();
    this._solicitedNarrationIds.clear();
    this._cancelledPendingNarrationIds.clear();
    this._awaitingReplyForSession = void 0;
    this._prevSessionStates.clear();
    for (const t2 of this._userCancelledSessions.values()) {
      clearTimeout(t2);
    }
    this._userCancelledSessions.clear();
    for (const t2 of this._confirmationFlushWatchdogs.values()) {
      clearTimeout(t2);
    }
    this._confirmationFlushWatchdogs.clear();
    if (this._stateChangeEmitTimer) {
      clearTimeout(this._stateChangeEmitTimer);
      this._stateChangeEmitTimer = void 0;
    }
    this._pendingStateChanges.clear();
    for (const ref of this._eagerModelRefs.values()) {
      ref.dispose();
    }
    this._eagerModelRefs.clear();
    this._eagerModelLoading.clear();
    this._pendingIdleNarration.clear();
    this._sessionsAwaitingResponseSummary.clear();
    this._lastResponseSummaryById.clear();
    this._lastNarratedText.clear();
    this._pendingNarrationRetries.clear();
    this._voiceProgressListeners.clearAndDisposeAll();
    this._voiceProgressSessionByResponse.clear();
    this._lastSpokenAtBySession.clear();
    for (const [narrationId, pending] of this._pendingSolicitedNarrations) {
      this._clearPendingSolicitedNarration(narrationId, pending);
    }
    this._pendingSolicitedNarrations.clear();
    this._deferredNarrations.clear();
    this._narratedPending.clear();
    this._userLogin = void 0;
    this._lastPersistedTurnId = void 0;
    this._pendingPriorTimeline = [];
    this._stopReplay();
    this._sessionAudioCache.clear();
    if (shouldPlayRecordingStoppedSignal) {
      this._playRecordingStoppedSignal(true);
    }
    if (shouldPlayStoppedSignal) {
      void this.accessibilitySignalService.playSignal(AccessibilitySignal.voiceModeStopped, {
        source: "voiceMode.disconnect",
        userGesture: true
      });
    }
  }
  /** DEV ONLY: Simulate a connected session with fake transcript for UI testing. */
  simulateConnection() {
    this._isConnected.set(true, void 0);
    this._isConnecting.set(false, void 0);
    this._voiceState.set("idle", void 0);
    this._statusText.set("Hold to speak...", void 0);
    this._voiceEventDisposables.add(disposableTimeout(() => {
      if (!this._isConnected.get()) {
        return;
      }
      this._voiceState.set("listening", void 0);
      this._transcriptTurns.set([{ speaker: "user", text: "Create a", committed: "", isPartial: true }], void 0);
    }, 1e3));
    this._voiceEventDisposables.add(disposableTimeout(() => {
      if (!this._isConnected.get()) {
        return;
      }
      this._transcriptTurns.set([{ speaker: "user", text: "Create a new React component", committed: "Create a ", isPartial: true }], void 0);
    }, 2e3));
    this._voiceEventDisposables.add(disposableTimeout(() => {
      if (!this._isConnected.get()) {
        return;
      }
      this._transcriptTurns.set([{ speaker: "user", text: "Create a new React component for the dashboard", committed: "Create a new React component for the dashboard", isPartial: false }], void 0);
      this._voiceState.set("idle", void 0);
    }, 3e3));
    this._voiceEventDisposables.add(disposableTimeout(() => {
      if (!this._isConnected.get()) {
        return;
      }
      this._transcriptTurns.set([
        { speaker: "user", text: "Create a new React component for the dashboard", committed: "Create a new React component for the dashboard", isPartial: false },
        { speaker: "assistant", text: "I'll create a Dashboard component with some widgets...", committed: "", isPartial: false }
      ], void 0);
    }, 4500));
  }
  /**
   * Handle a terminal, non-recoverable close (e.g. another window took over the
   * single voice session -> backend closes this one with 4008). Unlike a
   * transient drop (see {@link _onConnectionLost}), there is no reconnect, so
   * fully tear down capture/playback and settle to a clean, restartable state
   * instead of leaving the UI stuck on "Reconnecting...". Fires before the
   * connection-state change, so `_fatalDisconnect` short-circuits that path.
   */
  _handleFatalDisconnect(event) {
    const { code, reason } = event;
    this.logService.warn(`[voice] fatal disconnect code=${code} reason=${reason}; tearing down (no reconnect)`);
    this._fatalDisconnect = true;
    this._audioQueue.length = 0;
    this._currentPlaybackSessionId = null;
    this._currentPlaybackResponseId = void 0;
    this._currentPlaybackNarration = void 0;
    this._isProcessingQueue = false;
    this.ttsPlaybackService.closeContext();
    this.micCaptureService.stopCapture();
    this._windowFocusDisposables.clear();
    this._pttHeld = false;
    this._pttToggleMode = false;
    for (const [narrationId, pending] of this._pendingSolicitedNarrations) {
      this._clearPendingSolicitedNarration(narrationId, pending);
    }
    this._pendingSolicitedNarrations.clear();
    this._solicitedNarrationIds.clear();
    this._cancelledPendingNarrationIds.clear();
    this._pendingNarrationRetries.clear();
    this._voiceProgressListeners.clearAndDisposeAll();
    this._voiceProgressSessionByResponse.clear();
    this._lastSpokenAtBySession.clear();
    this._deferredNarrations.clear();
    this._narratedPending.clear();
    this._setTargetSession(void 0);
    this._hasDraftTarget.set(false, void 0);
    this._suppressPendingConfirmationsUntilConnect();
    this._pendingToolConfirmations.set([], void 0);
    transaction((tx) => {
      this._isConnecting.set(false, tx);
      this._isReconnecting.set(false, tx);
      this._isConnected.set(false, tx);
    });
    const kind = event.kind ?? voiceCloseCodeInfo(code)?.kind ?? "fatal";
    const message = this._fatalDisconnectMessage(event);
    this._voiceState.set(kind === "expected" ? "idle" : "error", void 0);
    this._statusText.set(message, void 0);
    this._endTelemetrySession();
    if (kind === "fatal") {
      this._promptFatalDisconnect(event, message);
    } else if (kind === "expected") {
      status(message);
    } else {
      alert(message);
    }
  }
  _fatalDisconnectMessage(event) {
    if (event.clientSide) {
      return localize(11798, null);
    }
    switch (event.code) {
      case 4001 /* Unauthenticated */:
        return localize(11826, null);
      case 4003 /* Forbidden */:
        return localize(11797, null);
      case 4008 /* SessionReplaced */:
        return localize(11796, null);
      case 4029 /* ServerBusy */:
      case 1013:
        return localize(11823, null);
      case 4500 /* InternalError */:
      case 1011:
        return localize(11795, null);
      case 4503 /* AuthUnavailable */:
        return localize(11784, null);
      case 1e3:
      case 1001:
        return localize(11824, null);
      case 1006:
        return localize(11830, null);
      default:
        return event.reason || localize(11794, null);
    }
  }
  _reconnectingMessage(code, reason) {
    switch (code) {
      case 4029 /* ServerBusy */:
      case 1013:
        return localize(11819, null);
      case 4500 /* InternalError */:
      case 1011:
        return localize(11820, null);
      case 4503 /* AuthUnavailable */:
        return localize(11817, null);
      // A browser reports 1006 with no reason for anything it cannot inspect.
      case 1006:
        return localize(11821, null);
    }
    if (reason) {
      return localize(11818, null, reason);
    }
    return localize(11816, null);
  }
  _promptFatalDisconnect(event, message) {
    const info = voiceCloseCodeInfo(event.code);
    const action = event.clientSide ? void 0 : info ? info.action : "retry";
    const choices = [];
    if (action === "signIn") {
      choices.push({
        label: localize(11825, null),
        // Force reauthorization: an expired or under-scoped token still counts
        // as signed in, so plain setup can no-op and leave the user stuck.
        run: () => {
          void this.commandService.executeCommand("workbench.action.chat.triggerSetupForceSignIn");
        }
      });
    } else if (action === "retry") {
      choices.push({
        label: localize(11822, null),
        run: () => {
          void this.connect(this._window ?? mainWindow);
        }
      });
    }
    this.notificationService.prompt(Severity2.Error, message, choices);
  }
  _endTelemetrySession() {
    if (!this._telemetrySessionStart) {
      return;
    }
    const durationSec = Math.round((Date.now() - this._telemetrySessionStart) / 1e3);
    this.telemetryService.publicLog2("voiceSessionEnded", {
      turnCount: this._telemetryTurnCount,
      durationSec,
      reconnectCount: this._telemetryReconnectCount
    });
    this._telemetrySessionStart = void 0;
  }
  _onConnectionLost() {
    this.logService.warn("[voice] connection lost, preserving state for reconnect");
    this.ttsPlaybackService.closeContext();
    this._pttHeld = false;
    this._pttToggleMode = false;
    this._pttCurrentTurnId = "";
    this._resetTranscriptionTurn();
    this._isConnected.set(false, void 0);
    this._isReconnecting.set(true, void 0);
    this._voiceState.set("idle", void 0);
    this._statusText.set("Reconnecting...", void 0);
  }
  _beginTranscriptionTurn(turnId) {
    this._transcriptionTurnState = {
      turnId,
      highestRevision: void 0,
      phase: "active"
    };
  }
  _markTranscriptionTurnPending() {
    if (this._transcriptionTurnState?.turnId === this._pttCurrentTurnId && this._transcriptionTurnState.phase === "active") {
      this._transcriptionTurnState.phase = "pending";
    }
  }
  _resetTranscriptionTurn() {
    this._transcriptionTurnState = void 0;
  }
  _handleTurnAutoEnded(event) {
    if (!this._pttHeld) {
      return;
    }
    if (event.turnId && event.turnId !== this._pttCurrentTurnId) {
      return;
    }
    this._pttToggleMode = false;
    this._finishPtt("auto");
  }
  _handleBargeIn(event) {
    this._speechDetectedInTurn = true;
    if (event.turnId) {
      if (this._transcriptionTurnState?.turnId !== event.turnId) {
        this._beginTranscriptionTurn(event.turnId);
      }
    } else {
      this._resetTranscriptionTurn();
    }
    this._startUserTurn();
    this._rememberInterruptedAudioId(event.interruptedTurnId);
    this._dropInterruptedDeferredAudio();
    this._interruptAssistantPlayback();
  }
  _rememberInterruptedPlaybackIds() {
    this._rememberInterruptedAudioId(this._currentPlaybackResponseId);
    for (const queued of this._audioQueue) {
      this._rememberInterruptedAudioId(queued.responseId);
    }
  }
  _rememberInterruptedAudioId(id2) {
    if (!id2) {
      return;
    }
    this._interruptedAudioIds.delete(id2);
    if (this._interruptedAudioIds.size >= 64) {
      const oldest = this._interruptedAudioIds.values().next().value;
      if (oldest !== void 0) {
        this._interruptedAudioIds.delete(oldest);
      }
    }
    this._interruptedAudioIds.add(id2);
    this._responseRoutes.delete(id2);
  }
  _isInterruptedAudio(event) {
    return event.turnId !== void 0 && this._interruptedAudioIds.has(event.turnId) || event.responseId !== void 0 && this._interruptedAudioIds.has(event.responseId);
  }
  _dropInterruptedDeferredAudio() {
    for (const [key3, responses] of this._deferredResponses) {
      const kept = responses.filter((response) => {
        const interrupted = response.turnId !== void 0 && this._interruptedAudioIds.has(response.turnId) || response.responseId !== void 0 && this._interruptedAudioIds.has(response.responseId);
        if (interrupted && response.responseId) {
          this._responseRoutes.delete(response.responseId);
        }
        return !interrupted;
      });
      if (kept.length === responses.length) {
        continue;
      }
      if (kept.length === 0) {
        this._deferredResponses.delete(key3);
      } else {
        this._deferredResponses.set(key3, kept);
      }
      this._maybeHideIndicator(key3);
    }
  }
  _handleTranscription(event) {
    if (event.text.trim()) {
      this._speechDetectedInTurn = true;
    }
    const state = this._transcriptionTurnState;
    if (event.turnId) {
      if (!state || state.turnId !== event.turnId || state.phase === "final") {
        return;
      }
      if (event.revision !== void 0) {
        if (state.highestRevision !== void 0 && event.revision <= state.highestRevision) {
          return;
        }
        state.highestRevision = event.revision;
      }
    }
    if (!this._telemetryFirstTranscriptionMs && this._telemetryPttDownMs) {
      this._telemetryFirstTranscriptionMs = Date.now();
    }
    const isPartial = event.status === "partial";
    if (isPartial && !this._isLiveTranscriptEnabled()) {
      return;
    }
    this._updateUserTurn(event.text, event.committed ?? "", isPartial);
    if (isPartial) {
      return;
    }
    if (!this._pttHeld) {
      this._voiceState.set("processing", void 0);
      this._statusText.set("Processing...", void 0);
    }
    this._persistTurn("user", event.text);
    if (event.turnId && state) {
      state.phase = "final";
    }
  }
  pttDown(source = "explicit", forceNewTurn = false) {
    if (!this._isConnected.get()) {
      this.logService.trace("[voice] pttDown ignored: not connected");
      return;
    }
    const passive = source !== "explicit";
    this._suppressSendToChatUntil = 0;
    this._setPinnedSubmitSession(void 0);
    if (forceNewTurn) {
      this._pttToggleMode = false;
    } else if (this._pttToggleMode) {
      this.logService.trace("[voice] pttDown: toggle-mode second tap -> finishing turn");
      this._pttToggleMode = false;
      this._finishPtt();
      return;
    }
    if (this._bargeInListenActive) {
      this.logService.trace("[voice] pttDown: promoting passive barge-in listen to user interrupt");
      const shownSessionId = this._shownSessionId();
      if (shownSessionId) {
        this._cancelVoiceProgress(shownSessionId);
      }
      this._preemptCheckpointPlayback(void 0, void 0, false);
      this._bargeInListenActive = false;
      this._pttCurrentTurnPassive = false;
      this._speechDetectedInTurn = true;
      this._autoListenSuppressed = false;
      this._pttWaitingForPlayback = false;
      this._telemetryPttDownMs = Date.now();
      this._telemetryFirstTranscriptionMs = void 0;
      this._telemetryTurnCount++;
      this._rememberInterruptedPlaybackIds();
      this._telemetryTtsInterrupted = this._telemetryTtsInterrupted || this.ttsPlaybackService.isPlaying;
      if (this._delayedMicStopTimer) {
        clearTimeout(this._delayedMicStopTimer);
        this._delayedMicStopTimer = void 0;
      }
      this._cancelTranscriptFade();
      this._startUserTurn();
      this._audioQueue.length = 0;
      this._currentPlaybackSessionId = null;
      this._currentPlaybackResponseId = void 0;
      this._currentPlaybackNarration = void 0;
      this._currentPlaybackFinalized = false;
      this._isProcessingQueue = false;
      this._suppressIncomingAudio = true;
      this.ttsPlaybackService.stopPlayback();
      this._voiceState.set("listening", void 0);
      this._statusText.set("Listening...", void 0);
      if (source !== "auto") {
        this._playListeningStartedSignal(source);
      }
      if (!this._pttMaxDurationTimer) {
        this._pttMaxDurationTimer = setTimeout(() => {
          if (this._pttHeld) {
            this._statusText.set("Max duration reached", void 0);
            this.pttUp("internal");
          }
        }, VoiceSessionController._PTT_MAX_DURATION_MS);
      }
      return;
    }
    if (this._pttHeld) {
      this.logService.trace("[voice] pttDown ignored: already held");
      return;
    }
    if (source === "explicit") {
      const shownSessionId = this._shownSessionId();
      if (shownSessionId) {
        this._cancelVoiceProgress(shownSessionId);
      }
      this._preemptCheckpointPlayback(void 0, void 0, false);
    }
    this._pttHeld = true;
    this._pttCurrentTurnPassive = passive;
    this._speechDetectedInTurn = !passive;
    this._autoListenSuppressed = false;
    this._clearAutoListenTimer();
    this._pttCurrentTurnId = generateUuid();
    this._beginTranscriptionTurn(this._pttCurrentTurnId);
    this._pttWaitingForPlayback = false;
    this._telemetryPttDownMs = Date.now();
    this._telemetryFirstTranscriptionMs = void 0;
    this._telemetryTurnCount++;
    this._rememberInterruptedPlaybackIds();
    this._telemetryTtsInterrupted = this._telemetryTtsInterrupted || this.ttsPlaybackService.isPlaying;
    if (this._delayedMicStopTimer) {
      clearTimeout(this._delayedMicStopTimer);
      this._delayedMicStopTimer = void 0;
    }
    this._cancelTranscriptFade();
    this._startUserTurn();
    this._audioQueue.length = 0;
    this._currentPlaybackSessionId = null;
    this._currentPlaybackResponseId = void 0;
    this._currentPlaybackNarration = void 0;
    this._currentPlaybackFinalized = false;
    this._isProcessingQueue = false;
    this._suppressIncomingAudio = true;
    this.micCaptureService.isMuted = false;
    this.micCaptureService.suppressUntil(0);
    this.micCaptureService.pttDown(this._pttCurrentTurnId, passive).catch((err) => {
      this.logService.warn("[voice] mic acquisition failed on pttDown; disconnecting", err);
      this._pttHeld = false;
      this._statusText.set("Microphone denied", void 0);
      this._voiceState.set("error", void 0);
      if (this._pttMaxDurationTimer) {
        clearTimeout(this._pttMaxDurationTimer);
        this._pttMaxDurationTimer = void 0;
      }
      this.disconnect();
    });
    this.ttsPlaybackService.stopPlayback();
    this._voiceState.set("listening", void 0);
    this._statusText.set("Listening...", void 0);
    if (source !== "auto") {
      this._playListeningStartedSignal(source);
    }
    this._pttMaxDurationTimer = setTimeout(() => {
      if (this._pttHeld) {
        this._statusText.set("Max duration reached", void 0);
        this.pttUp("internal");
      }
    }, VoiceSessionController._PTT_MAX_DURATION_MS);
  }
  pttUp(source = "explicit", forceFinish = false) {
    if (!this._pttHeld) {
      return;
    }
    if (!forceFinish) {
      const holdMs = this._telemetryPttDownMs ? Date.now() - this._telemetryPttDownMs : Infinity;
      if (holdMs < VoiceSessionController._PTT_TOGGLE_THRESHOLD_MS) {
        this._pttToggleMode = true;
        return;
      }
    }
    this._finishPtt("local", source);
  }
  setAutoListenHeld(held) {
    if (this._autoListenHeld === held) {
      return;
    }
    this._autoListenHeld = held;
    this.logService.trace(`[voice] setAutoListenHeld: ${held}`);
    if (held) {
      this._clearAutoListenTimer();
      if (this._isConnected.get() && this._pttHeld) {
        this._finishPtt("local", "internal");
      }
      return;
    }
    if (this._isConnected.get() && this._isHandsFreeEnabled()) {
      this._enterAutoListen("connect");
    }
  }
  setMuted(muted) {
    if (this._isMuted.get() === muted) {
      return;
    }
    this._isMuted.set(muted, void 0);
    this.micCaptureService.isMuted = muted;
    this.logService.trace(`[voice] setMuted: ${muted}`);
  }
  stopListening(source = "explicit") {
    if (!this._isConnected.get()) {
      return;
    }
    this._autoListenSuppressed = true;
    this._pttToggleMode = false;
    this._clearAutoListenTimer();
    if (this._pttHeld) {
      this._finishPtt("local", source);
    } else {
      this._voiceState.set("idle", void 0);
      this._statusText.set("Tap to start", void 0);
    }
  }
  discardListening() {
    if (!this._isConnected.get()) {
      return;
    }
    this._autoListenSuppressed = true;
    this._pttToggleMode = false;
    this._clearAutoListenTimer();
    this._suppressSendToChatUntil = Date.now() + VoiceSessionController._DISCARD_SEND_SUPPRESS_MS;
    if (this._pttHeld) {
      this._finishPtt("discard");
    } else {
      this._voiceState.set("idle", void 0);
      this._statusText.set("Tap to start", void 0);
    }
  }
  finishListeningAndSubmitTo(session) {
    if (!this._isConnected.get()) {
      return;
    }
    this._autoListenSuppressed = true;
    this._pttToggleMode = false;
    this._clearAutoListenTimer();
    this._setPinnedSubmitSession(session);
    if (this._pttHeld) {
      this._finishPtt("local", "internal");
    } else {
      this._voiceState.set("processing", void 0);
      this._statusText.set("Processing...", void 0);
    }
  }
  _setPinnedSubmitSession(session) {
    if (this._pinnedSubmitTimer) {
      clearTimeout(this._pinnedSubmitTimer);
      this._pinnedSubmitTimer = void 0;
    }
    this._pinnedSubmitSession = session;
    if (session) {
      this._pinnedSubmitTimer = setTimeout(() => {
        this._pinnedSubmitTimer = void 0;
        this._pinnedSubmitSession = void 0;
      }, VoiceSessionController._PINNED_SUBMIT_EXPIRY_MS);
    }
  }
  _consumePinnedSubmitSession() {
    const pinned = this._pinnedSubmitSession;
    if (pinned) {
      this._setPinnedSubmitSession(void 0);
    }
    return pinned;
  }
  /**
   * Finish the current push-to-talk press.
   *
   * ``reason`` is ``'local'`` for a user-driven end (button release / toggle
   * tap / keyword) — the mic drains its tail and the ``onPttEnd`` → ``ptt_end``
   * path fires. It is ``'auto'`` when the backend ended the turn itself
   * (``turn_auto_ended``): the mic is aborted with no drain and NO ``ptt_end``
   * is sent for the turn. ``'discard'``
   * throws the press away on a focus change: like ``'auto'`` the mic is aborted
   * with NO ``ptt_end`` (so the backend never finalizes it into a
   * `send_to_chat`), but the state settles to ``idle`` rather than
   * ``processing`` since nothing is being sent.
   */
  _finishPtt(reason = "local", source = "explicit") {
    this._pttToggleMode = false;
    this._bargeInListenActive = false;
    if (!this._pttHeld) {
      return;
    }
    this._clearAutoListenTimer();
    this._pttHeld = false;
    this._speechDetectedInTurn = false;
    this._pttToggleMode = false;
    this._telemetryPttUpMs = Date.now();
    const holdMs = this._telemetryPttDownMs ? Date.now() - this._telemetryPttDownMs : 0;
    this.telemetryService.publicLog2("voicePtt", { holdDurationMs: holdMs });
    if (this._pttMaxDurationTimer) {
      clearTimeout(this._pttMaxDurationTimer);
      this._pttMaxDurationTimer = void 0;
    }
    this._voiceState.set("processing", void 0);
    this._statusText.set("Processing...", void 0);
    this._replyPlayedSinceSend = false;
    this._clearAwaitingReply();
    this._suppressIncomingAudio = false;
    this._markTranscriptionTurnPending();
    if (reason === "auto" || reason === "discard") {
      this.micCaptureService.abortPtt();
    } else {
      this.micCaptureService.pttUp();
    }
    if (reason === "discard") {
      this._voiceState.set("idle", void 0);
      this._statusText.set("Tap to start", void 0);
    }
    if (reason === "local" && source === "explicit") {
      this._playRecordingStoppedSignal(true);
    } else if (this.accessibilityService.isScreenReaderOptimized()) {
      this._playRecordingStoppedSignal(false);
    }
  }
  _playRecordingStoppedSignal(userGesture) {
    void this.accessibilitySignalService.playSignal(AccessibilitySignal.voiceRecordingStopped, {
      source: userGesture ? "voiceMode.explicitListeningStopped" : "voiceMode.listeningStopped",
      userGesture
    });
  }
  markUserCancelled(sessionId) {
    this._cancelVoiceProgress(sessionId);
    this._preemptCheckpointPlayback(sessionId);
    const existing = this._userCancelledSessions.get(sessionId);
    if (existing) {
      clearTimeout(existing);
    }
    const expiry = setTimeout(() => {
      this._userCancelledSessions.delete(sessionId);
    }, VoiceSessionController._USER_CANCEL_SUPPRESS_MS);
    this._userCancelledSessions.set(sessionId, expiry);
  }
  setTargetSession(resource) {
    this._hasDraftTarget.set(false, void 0);
    this._setTargetSession(resource);
  }
  getLastSpokenResponseSession() {
    if (!this._lastSpokenResponseSessionId) {
      return void 0;
    }
    try {
      return URI.parse(this._lastSpokenResponseSessionId);
    } catch {
      return void 0;
    }
  }
  setDraftTarget() {
    this._setTargetSession(void 0);
    this._hasDraftTarget.set(true, void 0);
  }
  promoteDraftTarget(resource) {
    if (!this._hasDraftTarget.get()) {
      return;
    }
    this._hasDraftTarget.set(false, void 0);
    this._setTargetSession(resource);
    if (this._isSameSession(resource.toString(), this._shownSessionId())) {
      this._activateShownSession(resource);
    }
  }
  newSessionAsTarget() {
    const ref = this.chatService.startNewLocalSession("panel" /* Chat */);
    const resource = ref.object.sessionResource;
    this._newSessionRef.value = ref;
    this._hasDraftTarget.set(false, void 0);
    this._setTargetSession(resource);
    this.commandService.executeCommand("_chat.voice.switchToSession", resource.toString()).then((switched) => {
      if (switched === true && this._newSessionRef.value === ref) {
        this._newSessionRef.clear();
      }
    }, () => {
    });
  }
  /**
   * Release the session created by {@link newSessionAsTarget} once voice stops
   * targeting it, so it is no longer kept alive on its behalf.
   */
  _releaseNewSessionRefUnlessTargeting(resource) {
    const held = this._newSessionRef.value;
    if (held && (!resource || !isEqual2(held.object.sessionResource, resource))) {
      this._newSessionRef.clear();
    }
  }
  _setTargetSession(resource, tx) {
    this._releaseNewSessionRefUnlessTargeting(resource);
    this._targetSession.set(resource, tx);
  }
  _scheduleDelayedMicStop() {
    if (this._delayedMicStopTimer) {
      clearTimeout(this._delayedMicStopTimer);
    }
    this._delayedMicStopTimer = setTimeout(() => {
      this._delayedMicStopTimer = void 0;
      this._pttWaitingForPlayback = false;
    }, 1e3);
  }
  _isHandsFreeEnabled() {
    return this.configurationService.getValue("agents.voice.handsFree") === true;
  }
  _shouldEnterListenOnSessionInit(isResuming) {
    return !isResuming && this._isHandsFreeEnabled();
  }
  _isLiveTranscriptEnabled() {
    return this.configurationService.getValue("agents.voice.liveTranscript") === true;
  }
  /**
   * Strip a trailing stop phrase (e.g. "send it") from a transcript before it
   * is sent to chat. The backend is supposed to strip the matched phrase from
   * `agents.voice.turn.stopPhrases`, but when it doesn't the raw phrase leaks
   * into the request, so we defensively strip it client-side. Matching is
   * case-insensitive, ignores trailing punctuation, and only strips on a word
   * boundary so phrases aren't removed from the middle of a word.
   */
  _stripStopPhrase(text2) {
    const raw = this.configurationService.getValue("agents.voice.turn.stopPhrases");
    const phrases = Array.isArray(raw) ? raw.map((p) => typeof p === "string" ? p.trim() : "").filter((p) => p.length > 0) : [];
    if (phrases.length === 0) {
      return text2;
    }
    const trimmed = text2.trimEnd().replace(/[.,!?;:]+$/, "").trimEnd();
    const trimmedLower = trimmed.toLowerCase();
    const sorted = [...phrases].sort((a, b) => b.length - a.length);
    for (const phrase of sorted) {
      const phraseLower = phrase.toLowerCase();
      if (!trimmedLower.endsWith(phraseLower)) {
        continue;
      }
      const idx = trimmed.length - phrase.length;
      if (idx === 0 || /\s/.test(trimmed[idx - 1])) {
        return trimmed.slice(0, idx).replace(/[.,!?;:\s]+$/, "");
      }
    }
    return text2;
  }
  /**
   * Whether this controller's window currently has OS focus. In multi-window
   * setups (e.g. an editor window + the agents window) each window has its own
   * controller/WebSocket, so without this gate every open window would re-arm
   * hands-free auto-listen and reply simultaneously. Only the focused window
   * should keep listening (#8507).
   */
  _isWindowFocused() {
    try {
      return this._window?.document.hasFocus() ?? false;
    } catch {
      return false;
    }
  }
  /** Called when this controller's window loses OS focus. Aborts any open
   *  passive turn so the background window stops recording while the newly
   *  focused window can take over hands-free listening (#8507). */
  _onWindowBlur() {
    if (this._pttHeld && this._pttCurrentTurnPassive) {
      this.logService.trace("[voice] window blur: aborting passive turn (multi-window hands-free #8507)");
      this._finishPtt("discard", "internal");
    }
  }
  /** Called when this controller's window gains OS focus. Re-arms hands-free
   *  auto-listen so the focused window is always the one that listens (#8507). */
  _onWindowFocus() {
    if (this._isHandsFreeEnabled()) {
      this.logService.trace("[voice] window focus: re-arming hands-free auto-listen (multi-window #8507)");
      this._enterAutoListen();
    }
  }
  /** Re-enter listening via synthetic short tap. */
  _enterAutoListen(source = "auto") {
    this._clearAutoListenTimer();
    if (this._autoListenHeld || this._autoListenSuppressed || !this._isConnected.get() || this._pttHeld) {
      this.logService.trace(`[voice] _enterAutoListen skipped: held=${this._autoListenHeld} suppressed=${this._autoListenSuppressed} connected=${this._isConnected.get()} pttHeld=${this._pttHeld}`);
      return;
    }
    if (source === "auto" && !this._isWindowFocused()) {
      this.logService.trace("[voice] _enterAutoListen skipped: window not focused (multi-window hands-free)");
      return;
    }
    if (this.ttsPlaybackService.isPlaying || this._audioQueue.length > 0 || this._currentPlaybackSessionId !== null) {
      this.logService.trace(`[voice] _enterAutoListen skipped: audio busy (playing=${this.ttsPlaybackService.isPlaying} queue=${this._audioQueue.length} pbSession=${this._currentPlaybackSessionId !== null})`);
      return;
    }
    this.logService.trace("[voice] _enterAutoListen entering listening");
    this.pttDown(source);
    this.pttUp("internal");
  }
  _playListeningStartedSignal(source) {
    if (source === "connect") {
      void this.accessibilitySignalService.playSignal(AccessibilitySignal.voiceModeStarted, {
        source: "voiceMode.connectListeningStarted",
        userGesture: true
      });
      return;
    }
    void this.accessibilitySignalService.playSignal(AccessibilitySignal.voiceRecordingStarted, {
      source: "voiceMode.explicitListeningStarted",
      userGesture: true
    });
  }
  /**
   * Hands-free barge-in listen: open a passive PTT streaming turn WITHOUT
   * interrupting the assistant's playback, so the backend's server-VAD keeps
   * receiving mic audio and can detect the user talking over the assistant.
   *
   * Unlike `pttDown()` (a user-driven interrupt) this does NOT stop playback,
   * clear the audio queue, or suppress incoming audio. The backend decides
   * when a real interruption happened and emits `speech_started` / `barge_in`
   * (already wired to cut off TTS). If the user stays silent the turn simply
   * stays open and becomes the next listening turn once playback ends
   * (`onPlaybackStopped` sees `_pttHeld` and stays in 'listening').
   *
   * Hands-free session initialization keeps capture warm before the backend can
   * send playback. Idempotent: a no-op while a turn is already held.
   */
  _startBargeInListen() {
    if (!this._isHandsFreeEnabled() || !this._isConnected.get() || this._pttHeld || this._autoListenHeld || this._autoListenSuppressed || !this._window) {
      return;
    }
    if (!this._isWindowFocused()) {
      return;
    }
    this._clearAutoListenTimer();
    this._pttCurrentTurnId = generateUuid();
    this._pttHeld = true;
    this._pttCurrentTurnPassive = true;
    this._speechDetectedInTurn = false;
    this._bargeInListenActive = true;
    this._telemetryPttDownMs = Date.now();
    this.micCaptureService.isMuted = false;
    this.micCaptureService.suppressUntil(0);
    this.micCaptureService.pttDown(
      this._pttCurrentTurnId,
      /* passive */
      true
    ).catch((err) => {
      this.logService.warn("[voice] barge-in listen failed to start", err);
      this._pttHeld = false;
      this._bargeInListenActive = false;
    });
  }
  /** Debounced re-listen after assistant stops speaking. */
  _scheduleAutoListen() {
    this._clearAutoListenTimer();
    this._autoListenTimer = setTimeout(() => {
      this._autoListenTimer = void 0;
      if (this._awaitingReplyAudio) {
        return;
      }
      this._enterAutoListen();
    }, VoiceSessionController._AUTO_LISTEN_QUIET_MS);
  }
  _clearAutoListenTimer() {
    if (this._autoListenTimer) {
      clearTimeout(this._autoListenTimer);
      this._autoListenTimer = void 0;
    }
  }
  /** Block auto-listen until reply audio arrives (with 30s watchdog). */
  _setAwaitingReply() {
    this._awaitingReplyAudio = true;
    this._awaitingReplyForSession = this._getActiveSessionId();
    this._clearAutoListenTimer();
    if (this._awaitingReplyWatchdog) {
      clearTimeout(this._awaitingReplyWatchdog);
    }
    this._awaitingReplyWatchdog = setTimeout(() => {
      this._awaitingReplyWatchdog = void 0;
      this._awaitingReplyAudio = false;
      this._awaitingReplyForSession = void 0;
      if (this._isHandsFreeEnabled() && !this._pttHeld) {
        this._enterAutoListen();
      }
    }, 3e4);
  }
  _clearAwaitingReply() {
    this._awaitingReplyAudio = false;
    this._awaitingReplyForSession = void 0;
    if (this._awaitingReplyWatchdog) {
      clearTimeout(this._awaitingReplyWatchdog);
      this._awaitingReplyWatchdog = void 0;
    }
  }
  async _acceptVoiceInput(text2, sessionResource) {
    try {
      const response = await this.commandService.executeCommand("_chat.voice.acceptInput", text2);
      this.logService.info(`[voice] acceptInput completed session=${sessionResource.toString()} response=${response?.id ?? "none"} connected=${this._isConnected.get()}`);
      if (response && this._isConnected.get()) {
        this._watchVoiceProgress(sessionResource, response);
      }
      return true;
    } catch (err) {
      this.logService.warn("[voice] acceptInput failed:", err);
      return false;
    }
  }
  async _sendVoiceRequest(sessionResource, text2) {
    const result = await this.chatService.sendRequest(sessionResource, text2, { isVoiceModeInput: this._isVoiceProgressEnabled() }).catch((err) => {
      this.logService.warn("[voice] Error sending transcription:", err);
      return void 0;
    });
    if (!result) {
      return void 0;
    }
    const sentResult = ChatSendResult.isQueued(result) ? result.deferred : Promise.resolve(result);
    sentResult.then(async (sent) => {
      if (ChatSendResult.isSent(sent)) {
        const response = await sent.data.responseCreatedPromise;
        if (this._isConnected.get()) {
          this._watchVoiceProgress(sessionResource, response);
        }
      }
    }).catch((err) => this.logService.warn("[voice] Failed to watch voice response:", err));
    return result;
  }
  _watchVoiceProgress(sessionResource, response) {
    if (!this._isVoiceProgressEnabled()) {
      return;
    }
    const disposables = new DisposableStore();
    const timer = disposables.add(new MutableDisposable());
    const seen = /* @__PURE__ */ new Set();
    const sessionId = sessionResource.toString();
    const sessionKey = this._sessionKey(sessionId);
    const requestStartedAt = Date.now();
    let narratedCount = 0;
    let lastCheckpointAt;
    let nextSequence = 1;
    let pending;
    this.logService.info(`[voice] watching progress session=${sessionId} response=${response.id} request=${response.requestId}`);
    const dispose2 = () => this._voiceProgressListeners.deleteAndDispose(response.id);
    const nextEligibleAt = () => {
      if (lastCheckpointAt !== void 0) {
        return lastCheckpointAt + VoiceSessionController._VOICE_PROGRESS_INTERVAL_MS;
      }
      const lastSpokenAt = this._lastSpokenAtBySession.get(sessionKey);
      return Math.max(
        requestStartedAt + VoiceSessionController._VOICE_PROGRESS_INITIAL_DELAY_MS,
        (lastSpokenAt ?? 0) + VoiceSessionController._VOICE_PROGRESS_INITIAL_DELAY_MS
      );
    };
    const flush = () => {
      timer.clear();
      if (!this._isVoiceProgressEnabled()) {
        dispose2();
        return;
      }
      if (response.isComplete || response.isCanceled) {
        dispose2();
        return;
      }
      if (!pending || narratedCount >= VoiceSessionController._MAX_VOICE_PROGRESS_PER_REQUEST) {
        return;
      }
      if (!this._isConnected.get()) {
        return;
      }
      const canReplacePlayingCheckpoint = this._currentPlaybackNarration?.kind === "checkpoint";
      if (this.ttsPlaybackService.isPlaying && !canReplacePlayingCheckpoint) {
        return;
      }
      const delay = nextEligibleAt() - Date.now();
      if (delay > 0) {
        timer.value = disposableTimeout(flush, delay);
        return;
      }
      const checkpoint = pending;
      pending = void 0;
      const metadata = {
        requestId: response.requestId,
        checkpointId: checkpoint.id,
        sequence: nextSequence++
      };
      const narrated = this._isConnected.get() && this._isSameSession(sessionId, this._shownSessionId()) && this._narrate(sessionId, "checkpoint", checkpoint.value, void 0, metadata);
      this.logService.info(`[voice] checkpoint dispatch session=${sessionId} response=${response.id} stage=${checkpoint.id} sequence=${metadata.sequence} narrated=${Boolean(narrated)}`);
      if (narrated) {
        narratedCount++;
        lastCheckpointAt = Date.now();
      }
    };
    const schedule = () => {
      timer.clear();
      const delay = nextEligibleAt() - Date.now();
      if (delay <= 0) {
        flush();
      } else {
        timer.value = disposableTimeout(flush, delay);
      }
    };
    const update = () => {
      if (!this._isVoiceProgressEnabled()) {
        dispose2();
        return;
      }
      if (response.isComplete || response.isCanceled) {
        this._preemptCheckpointPlayback(sessionId);
        dispose2();
        return;
      }
      for (const part of response.response.value) {
        if (part.kind !== "voiceProgress" || !isVoiceCheckpointId(part.id) || seen.has(part.id)) {
          continue;
        }
        seen.add(part.id);
        pending = { id: part.id, value: part.value };
        this.logService.info(`[voice] checkpoint observed session=${sessionId} response=${response.id} stage=${part.id}`);
      }
      if (pending) {
        schedule();
      }
    };
    disposables.add(response.onDidChange(update));
    disposables.add(autorun((reader) => {
      if (this._isConnected.read(reader) && pending) {
        schedule();
      }
    }));
    disposables.add(this.ttsPlaybackService.onPlaybackStopped(() => {
      if (pending) {
        schedule();
      }
    }));
    disposables.add({ dispose: () => this._voiceProgressSessionByResponse.delete(response.id) });
    this._voiceProgressListeners.set(response.id, disposables);
    this._voiceProgressSessionByResponse.set(response.id, sessionKey);
    update();
  }
  _isVoiceProgressEnabled() {
    return this.configurationService.getValue(VOICE_AGENT_PROGRESS_SETTING) === true;
  }
  _cancelVoiceProgress(sessionId) {
    const sessionKey = sessionId ? this._sessionKey(sessionId) : void 0;
    for (const responseId of [...this._voiceProgressListeners.keys()]) {
      if (sessionKey === void 0 || this._voiceProgressSessionByResponse.get(responseId) === sessionKey) {
        this._voiceProgressListeners.deleteAndDispose(responseId);
      }
    }
  }
  /**
   * Send transcription text to the target session or active chat.
   *
   * Returns `true` once the text has been accepted by a chat surface or send
   * request, and `false` when delivery was rejected or no send occurred.
   */
  async _sendTranscriptionToChat(text2) {
    const target = this._consumePinnedSubmitSession() ?? this._targetSession.get();
    if (target) {
      const currentSession = await this.commandService.executeCommand("_chat.voice.getCurrentSession").catch(() => void 0);
      const isTargetVisible = currentSession === target.toString();
      if (isTargetVisible) {
        return this._acceptVoiceInput(text2, target);
      } else {
        const cts = new CancellationTokenSource();
        const ref = await this.chatService.acquireOrLoadSession(target, "panel" /* Chat */, cts.token, "voice-send").catch((err) => {
          this.logService.warn("[voice] Failed to load target session:", err);
          return void 0;
        });
        cts.dispose();
        if (!ref) {
          this.logService.warn("[voice] Could not load target session, falling back to switch");
          const switched = await this.commandService.executeCommand("_chat.voice.switchToSession", target.toString()).catch(() => false);
          if (switched) {
            await new Promise((resolve3) => setTimeout(resolve3, 200));
            return this._acceptVoiceInput(text2, target);
          }
          return false;
        }
        const result = await this._sendVoiceRequest(target, text2);
        const accepted = !!result && !ChatSendResult.isRejected(result);
        if (accepted) {
          this._watchResponseForFloatingWindow(target);
          this.commandService.executeCommand("_agentsVoice.openWindow").catch(() => {
          });
          const model = this.chatService.getSession(target);
          if (model) {
            const lastReq = model.getRequests().at(-1);
            if (lastReq?.response && !lastReq.response.isComplete && !lastReq.response.isCanceled) {
              const responseDisposable = lastReq.response.onDidChange(() => {
                if (lastReq.response.isComplete || lastReq.response.isCanceled) {
                  responseDisposable.dispose();
                  ref.dispose();
                }
              });
            } else {
              ref.dispose();
            }
          } else {
            ref.dispose();
          }
        } else {
          ref.dispose();
        }
        return accepted;
      }
    } else {
      const currentSession = await this.commandService.executeCommand("_chat.voice.getCurrentSession").catch(() => void 0);
      let accepted = false;
      if (currentSession) {
        accepted = await this._acceptVoiceInput(text2, URI.parse(currentSession));
      } else {
        const models = [...this.chatService.chatModels.get()];
        const existingSession = models.length > 0 ? models[models.length - 1] : void 0;
        const sessionResource = existingSession?.sessionResource;
        if (sessionResource) {
          const switched = await this.commandService.executeCommand("_chat.voice.switchToSession", sessionResource.toString()).catch(() => false);
          if (switched) {
            await new Promise((resolve3) => setTimeout(resolve3, 200));
            accepted = await this._acceptVoiceInput(text2, sessionResource);
          } else {
            const result = await this._sendVoiceRequest(sessionResource, text2);
            accepted = !!result && !ChatSendResult.isRejected(result);
          }
        } else {
          const ref = this.chatService.startNewLocalSession("panel" /* Chat */);
          const resource = ref.object.sessionResource;
          ref.dispose();
          this.commandService.executeCommand("_chat.voice.switchToSession", resource.toString()).catch(() => {
          });
          const result = await this._sendVoiceRequest(resource, text2);
          accepted = !!result && !ChatSendResult.isRejected(result);
        }
      }
      this.commandService.executeCommand("workbench.panel.chat.view.copilot.focus").catch(() => {
      });
      return accepted;
    }
  }
  /**
   * Watch a session's latest response and surface it in the floating window
   * transcript. Called when voice sends to a non-visible session so the user
   * can see the reply without switching the chat panel.
   */
  _watchResponseForFloatingWindow(sessionResource) {
    const model = this.chatService.getSession(sessionResource);
    if (!model) {
      return;
    }
    this._prevSessionStates.set(sessionResource.toString(), { state: "thinking", detail: "", pendingId: "", lastResponseSummary: "" });
    this._sendContext();
    const disposables = new DisposableStore();
    let lastText = "";
    const updateFromResponse = () => {
      const lastReq = model.lastRequest;
      const response = lastReq?.response;
      if (!response) {
        return;
      }
      const markdown = response.response.getMarkdown();
      const previewText = markdown.length > 200 ? markdown.slice(0, 200) + "\u2026" : markdown;
      if (previewText && previewText !== lastText) {
        const isFirst = lastText === "";
        lastText = previewText;
        this._setAssistantTurn(previewText, { startNewTurn: isFirst });
      }
      if (response.isComplete || response.isCanceled) {
        this._prevSessionStates.set(sessionResource.toString(), { state: "idle", detail: "", pendingId: "", lastResponseSummary: "" });
        this._sendContext();
        this.voiceClientService.flushSessionContext();
        disposables.dispose();
      }
    };
    const checkResponse = () => {
      const lastReq = model.lastRequest;
      if (lastReq?.response) {
        disposables.add(lastReq.response.onDidChange(() => updateFromResponse()));
        updateFromResponse();
      }
    };
    disposables.add(model.onDidChange((e) => {
      if (e.kind === "addResponse") {
        checkResponse();
      }
    }));
    checkResponse();
    const timeout2 = setTimeout(() => disposables.dispose(), 5 * 60 * 1e3);
    disposables.add({ dispose: () => clearTimeout(timeout2) });
  }
  // --- Transcript buffer helpers ---
  _pushTurn(turn) {
    const cur = this._transcriptTurns.get();
    const next = [...cur, turn].slice(-VoiceSessionController._MAX_TURNS);
    this._transcriptTurns.set(next, void 0);
  }
  /**
   * Start a new user turn at the tail of the buffer. If the previous tail is
   * already an empty user turn (rapid PTT toggle before any transcription
   * landed), reuse it instead of pushing a duplicate empty entry.
   */
  _startUserTurn() {
    const cur = this._transcriptTurns.get();
    const last = cur[cur.length - 1];
    if (last && last.speaker === "user" && !last.text) {
      return;
    }
    this._pushTurn({ speaker: "user", text: "", committed: "", isPartial: true });
  }
  _updateUserTurn(text2, committed, isPartial) {
    const cur = this._transcriptTurns.get();
    const last = cur[cur.length - 1];
    if (!last || last.speaker !== "user") {
      this._pushTurn({ speaker: "user", text: text2, committed, isPartial });
      return;
    }
    const updated = { speaker: "user", text: text2, committed, isPartial };
    this._transcriptTurns.set([...cur.slice(0, -1), updated], void 0);
  }
  /**
   * Update the assistant turn at the tail of the buffer with `text`.
   *
   * The streaming TTS pipeline pushes a monotonically-growing transcript
   * with each audio chunk of a response. `startNewTurn` distinguishes
   * the first chunk of a NEW response (push a fresh assistant turn)
   * from continuation chunks of the SAME response (replace the tail's
   * text as the transcript grows). This prevents two distinct
   * assistant responses from collapsing into one when they happen
   * back-to-back without an intervening user turn (e.g. proactive
   * narration followed by a command reply).
   */
  _setAssistantTurn(text2, opts = { startNewTurn: true }) {
    const cur = this._transcriptTurns.get();
    const last = cur[cur.length - 1];
    if (!opts.startNewTurn && last && last.speaker === "assistant") {
      const updated = { speaker: "assistant", text: text2, committed: "", isPartial: false };
      this._transcriptTurns.set([...cur.slice(0, -1), updated], void 0);
      return;
    }
    this._pushTurn({ speaker: "assistant", text: text2, committed: "", isPartial: false });
  }
  _cancelTranscriptFade() {
    if (this._transcriptFadeTimer) {
      clearTimeout(this._transcriptFadeTimer);
      this._transcriptFadeTimer = void 0;
    }
  }
  // --- Transcript persistence (local-only) ---
  /**
   * Append a final entry to the on-disk transcript store.
   *
   * Entry ids are generated locally — voice_code's backend has no persistent
   * conversation memory today, so there's no server-issued id to defer to.
   * Each new entry chains off the previous one via ``ancestorIds`` so a UI
   * can show the linear conversation order.
   *
   * ``user_voice`` and ``agent_voice`` are user-visible in the transcripts
   * pane. ``agent_tool_call`` and ``coding_event`` are persisted only so we
   * can replay them as cross-session context to the backend on reconnect.
   */
  _persistEntry(kind, text2, metadata) {
    const userId = this._userLogin;
    if (!userId || !text2) {
      return;
    }
    const entry = {
      turnId: generateUuid(),
      ancestorIds: this._lastPersistedTurnId ? [this._lastPersistedTurnId] : [],
      kind,
      role: kind === "user_voice" ? "user" : "assistant",
      text: text2,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...metadata ? { metadata } : {}
    };
    this._lastPersistedTurnId = entry.turnId;
    this.voiceTranscriptStore.appendTurn(userId, entry).catch((err) => {
      this.logService.warn("[voice] failed to persist transcript entry", err);
    });
  }
  /** Back-compat thin shim for the two existing voice call sites. */
  _persistTurn(role, text2) {
    this._persistEntry(role === "user" ? "user_voice" : "agent_voice", text2);
  }
  /**
   * One-line, human/LLM-readable summary of a voice tool call for the
   * timeline. Backend's prior_timeline renderer expects this format — keep
   * it stable.
   *
   *   send_to_chat(text="Open a new terminal and cd into the current directory.")
   *   send_to_chat(text="Refactor upload service", new_session=true)
   *   respond_to_session(...)
   */
  _renderToolCallSummary(name, args2) {
    if (!args2 || Object.keys(args2).length === 0) {
      return `${name}()`;
    }
    const pairs2 = [];
    for (const [k, v2] of Object.entries(args2)) {
      let rendered;
      if (typeof v2 === "string") {
        rendered = v2.length > 200 ? `${v2.slice(0, 197)}...` : v2;
        rendered = JSON.stringify(rendered);
      } else {
        try {
          const json = JSON.stringify(v2);
          rendered = json.length > 200 ? `${json.slice(0, 197)}...` : json;
        } catch {
          rendered = String(v2);
        }
      }
      pairs2.push(`${k}=${rendered}`);
    }
    return `${name}(${pairs2.join(", ")})`;
  }
  /**
   * Convert persisted transcript turns into typed timeline entries for
   * the BE, then top up with a synthesized ``coding_agent_reply`` per
   * active coding session (first ~2 sentences of the latest Copilot
   * response). The synthetic entries are *not* persisted — they read
   * live ``IChatModel`` state so the summary stays fresh on every
   * reconnect.
   *
   * Output is chronological (oldest first), matching what the BE
   * renders into its ``[PRIOR_CONTEXT]`` block. Synthetic
   * ``coding_agent_reply`` entries are appended at the end since they
   * represent the *current* state of coding sessions at reconnect.
   */
  _buildPriorTimeline(turns) {
    const out = [];
    for (const t2 of turns) {
      const kind = t2.kind;
      if (!kind) {
        continue;
      }
      const entry = {
        kind,
        text: t2.text,
        timestamp: new Date(t2.timestamp).toISOString(),
        ...t2.metadata?.toolName ? { toolName: t2.metadata.toolName } : {},
        ...t2.metadata?.codingSessionId ? { codingSessionId: t2.metadata.codingSessionId } : {},
        ...t2.metadata?.codingStatus ? { codingStatus: t2.metadata.codingStatus } : {}
      };
      out.push(entry);
    }
    try {
      const sessions = this.agentSessionsService.model.sessions.filter((s) => !s.isArchived());
      for (const session of sessions) {
        const model = this.chatService.getSession(session.resource);
        const lastReq = model?.getRequests().at(-1);
        const value2 = lastReq?.response?.response.value;
        if (!value2) {
          continue;
        }
        const full = value2.filter((p) => p.kind === "markdownContent").map((p) => p.content.value).join(" ").trim();
        if (!full) {
          continue;
        }
        const summary = this._firstSentences(full, VoiceSessionController.CODING_AGENT_REPLY_SENTENCE_LIMIT);
        if (!summary) {
          continue;
        }
        out.push({
          kind: "coding_agent_reply",
          text: summary,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          codingSessionId: session.resource.toString()
        });
      }
    } catch (err) {
      this.logService.warn("[voice] failed to synthesize coding_agent_reply timeline entries", err);
    }
    return out;
  }
  /**
   * Return the first ``n`` sentences of ``text``. Cheap regex split —
   * good enough for a prompt-prefix summary; we don't need perfect NLP
   * boundaries here. Falls back to a hard char cap if no terminator
   * shows up in the first 600 chars.
   */
  _firstSentences(text2, n2) {
    const collapsed2 = text2.replace(/\s+/g, " ").trim();
    if (!collapsed2) {
      return "";
    }
    const sentences = [];
    const re = /[^.!?]+[.!?]+(\s|$)/g;
    let m;
    while ((m = re.exec(collapsed2)) !== null && sentences.length < n2) {
      sentences.push(m[0].trim());
    }
    if (sentences.length === 0) {
      return collapsed2.length > 600 ? `${collapsed2.slice(0, 597)}...` : collapsed2;
    }
    return sentences.join(" ");
  }
  // --- Deferred responses for non-focused sessions ---
  /**
   * Record the backend→UI resource alias for an agent-host session so a response
   * the voice backend tags with the bare backend id resolves to this UI session
   * resource (the space in which focus, defer/flush buffer keys, and the pending
   * indicator operate). No-op for non-agent-host resources.
   */
  _recordSessionAlias(uiResource) {
    const backend = toAgentHostBackendSessionUri(uiResource);
    if (!backend) {
      return;
    }
    const from = backend.toString();
    const to = uiResource.toString();
    if (this._uiResourceByBackendId.get(from) === to) {
      return;
    }
    this._uiResourceByBackendId.set(from, to);
    this._rekeySession(from, to);
  }
  /** Move every session-scoped entry (and the visible indicator) from a bare
   *  backend id to its canonical UI key once the alias becomes known. */
  _rekeySession(from, to) {
    if (from === to) {
      return;
    }
    const rekeyMap = (m) => {
      if (m.has(from)) {
        if (!m.has(to)) {
          m.set(to, m.get(from));
        }
        m.delete(from);
      }
    };
    const rekeySet = (s) => {
      if (s.has(from)) {
        s.delete(from);
        s.add(to);
      }
    };
    rekeyMap(this._deferredResponses);
    rekeyMap(this._pendingResponseSummaries);
    rekeyMap(this._lastNarratedText);
    rekeyMap(this._lastHeardTranscriptById);
    rekeyMap(this._recentlyReadResponse);
    rekeyMap(this._lastResponseSummaryById);
    rekeyMap(this._pendingNarrationRetries);
    rekeyMap(this._deferredNarrations);
    rekeyMap(this._narratedPending);
    rekeySet(this._confirmationPendingSessions);
    rekeySet(this._liveReplyKeys);
    rekeySet(this._sessionsAwaitingResponseSummary);
    rekeySet(this._pendingIdleNarration);
    this._markPendingResponse(from, false);
    if (this._pendingOwned(to)) {
      this._markPendingResponse(to, true);
    }
  }
  /**
   * The single canonical key for a session: the UI agent-host resource when the
   * backend tagged it with the bare backend id, else the id unchanged. Every
   * session-scoped collection is keyed by this, so the two id spaces never
   * diverge and ownership checks are plain O(1) map/set lookups.
   */
  _sessionKey(id2) {
    return this._uiResourceByBackendId.get(id2) ?? id2;
  }
  /** Whether any of the three indicator owners still holds this canonical key. */
  _pendingOwned(key3) {
    return this._confirmationPendingSessions.has(key3) || this._deferredResponses.has(key3) || this._pendingResponseSummaries.has(key3);
  }
  /**
   * Canonicalize a session id to the UI agent-host resource space when the
   * backend tagged it with the bare backend id. Untagged / non-agent-host ids
   * pass through unchanged.
   */
  _canonicalSessionId(id2) {
    return id2 ? this._uiResourceByBackendId.get(id2) ?? id2 : id2;
  }
  /**
   * Refresh the cached focused session and flush any response that was held
   * for the session that just became focused.
   */
  /**
   * The session the user is currently looking at, read live from the
   * last-focused chat widget (the same source that fires
   * `onDidChangeFocusedSession`). Reading live - rather than trusting a value
   * cached on the change event - protects the defer/flush decision from a
   * missed or out-of-order focus event, which would otherwise leave a response
   * buffered forever or drop it into the wrong session.
   */
  _getFocusedSessionId() {
    return this.chatWidgetService.lastFocusedWidget?.viewModel?.sessionResource?.toString();
  }
  _onFocusedSessionChanged() {
    if (this._externalActiveSessionMode) {
      return;
    }
    const focused = this._getFocusedSessionId();
    if (focused) {
      const resource = URI.parse(focused);
      if (this._isConnected.get() || this._isConnecting.get()) {
        this.setTargetSession(resource);
      }
      this._activateShownSession(resource);
      return;
    }
    this._sendContext();
    this.voiceClientService.flushSessionContext();
  }
  /**
   * Track a chat widget's view-model so we notice when a session is shown in it,
   * even if that widget never takes DOM focus (so `onDidChangeFocusedSession`
   * stays silent). Opening a session from the sessions list reveals it in the
   * chat view pane this way.
   */
  _trackWidgetSession(widget) {
    if (this._widgetSessionListeners.has(widget)) {
      return;
    }
    this._widgetSessionListeners.set(widget, widget.onDidChangeViewModel((e) => {
      this._rebindMaterializedSession(e.previousSessionResource, e.currentSessionResource);
      this._onSessionShown(e.currentSessionResource);
    }));
    this._onSessionShown(widget.viewModel?.sessionResource);
  }
  _rebindMaterializedSession(previous, current) {
    if (!previous || !current || previous.scheme !== current.scheme || !previous.scheme.startsWith("agent-host-") || !previous.path.replace(/^\//, "").startsWith("untitled-") || current.path.replace(/^\//, "").startsWith("untitled-")) {
      return;
    }
    const from = previous.toString();
    const to = current.toString();
    const canonicalFrom = this._sessionKey(from);
    const target = this._targetSession.get();
    if (target && isEqual2(target, previous)) {
      this._setTargetSession(current);
    }
    if (this._activeSessionShown === from) {
      this._activeSessionShown = to;
    }
    if (this._lastShownSessionId === from) {
      this._lastShownSessionId = to;
    }
    if (this._currentPlaybackSessionId === from) {
      this._currentPlaybackSessionId = to;
    }
    if (this._lastSpokenResponseSessionId === from) {
      this._lastSpokenResponseSessionId = to;
    }
    this._rekeySession(canonicalFrom, to);
    this._uiResourceByBackendId.set(from, to);
    const previousBackend = toAgentHostBackendSessionUri(previous);
    if (previousBackend) {
      this._uiResourceByBackendId.set(previousBackend.toString(), to);
    }
    this._recordSessionAlias(current);
    this.logService.trace(`[voice] rebound materialized session ${from.slice(-32)} -> ${to.slice(-32)}`);
  }
  /** A session became visible (opened/revealed): treat like a focus change — make it active, flush any buffered response, clear its pending indicator, and narrate its pending item. */
  _onSessionShown(resource) {
    if (this._externalActiveSessionMode) {
      return;
    }
    const key3 = resource?.toString();
    if (!key3) {
      return;
    }
    if (key3 === this._lastShownSessionId && !this._pendingOwned(this._sessionKey(key3))) {
      return;
    }
    this.logService.trace(`[voice] session shown=${key3}; flushing/re-sending context`);
    this._activateShownSession(resource);
  }
  /** Make a shown/focused session active: flush its buffered response, clear its pending indicator, and narrate its pending confirmation/response (loading the model first if a confirmation's detail isn't resident). */
  _activateShownSession(resource) {
    const key3 = resource.toString();
    this._lastShownSessionId = key3;
    this._suspendPlaybackForHiddenSessions();
    this._recordSessionAlias(resource);
    if (!this._isConnected.get()) {
      this.logService.trace(`[voice] _activateShownSession(${key3.slice(-32)}) skipped: controller not connected (external=${this._externalActiveSessionMode})`);
      return;
    }
    if (this._hasDraftTarget.get()) {
      this.logService.trace(`[voice] _activateShownSession(${key3.slice(-32)}) skipped: Voice Mode belongs to a draft`);
      return;
    }
    const flushResult = this._flushDeferredResponse(key3);
    this._clearConfirmationIndicator(key3);
    if (this._confirmationDetailPending(resource)) {
      this._ensureModelLoaded(resource);
    }
    if (this._externalActiveSessionMode && !this._recentlyReadResponse.has(key3)) {
      const heard = this._lastHeardTranscriptById.get(key3);
      if (heard) {
        this._recentlyReadResponse.set(key3, { transcript: heard, at: Date.now() });
      }
    }
    let narratable = this._currentNarratable(resource);
    const sessionKey = this._sessionKey(key3);
    const pendingSummary = this._pendingResponseSummaries.get(sessionKey);
    const pendingSummaryFlushed = !!pendingSummary && flushResult.finalTranscripts.includes(this._normalizeTranscript(pendingSummary));
    this.logService.trace(`[voice] activate shown=${key3.slice(-32)} pendingKey=${this._pendingResponseSummaries.has(sessionKey) ? sessionKey.slice(-32) : "<none>"} narratable=${narratable?.kind ?? "<none>"} flushedFinal=${flushResult.finalTranscripts.length} pendingFlushed=${pendingSummaryFlushed}`);
    if (!narratable && pendingSummary && !pendingSummaryFlushed) {
      narratable = { kind: "response", text: pendingSummary };
    }
    let handledResponse = pendingSummaryFlushed;
    this._sendContext();
    this.voiceClientService.flushSessionContext();
    if (narratable) {
      const wasJustPlayed = narratable.kind === "response" && flushResult.finalTranscripts.includes(this._normalizeTranscript(narratable.text));
      if (wasJustPlayed) {
        this._lastNarratedText.set(sessionKey, narratable.text);
        handledResponse = true;
      } else {
        const alreadyNarrated = narratable.kind === "response" && this._getLastNarratedText(key3) === narratable.text;
        const pendingAlreadyHeard = narratable.kind !== "response" && this._narratedPending.get(sessionKey) === this._narratableIdentity(narratable);
        const staleResponse = narratable.kind === "response" && !this._pendingResponseSummaries.has(sessionKey);
        const bufferRetainedUnderPress = flushResult.retained === true && narratable.kind === "response" && !!flushResult.retainedTranscript && this._normalizeTranscript(narratable.text) === flushResult.retainedTranscript;
        if (pendingAlreadyHeard) {
          this.logService.trace(`[voice] activate skip: ${narratable.kind} already heard for ${key3.slice(-32)}`);
        } else if (staleResponse) {
          this.logService.trace(`[voice] activate skip: stale response (no pending summary) for ${key3.slice(-32)}`);
        } else if (bufferRetainedUnderPress) {
          this.logService.trace(`[voice] activate skip: buffered reply retained under held press for ${key3.slice(-32)}`);
        } else {
          const deferred = this._deferredNarrations.get(sessionKey);
          if (deferred && this._narratableIdentity(deferred) === this._narratableIdentity(narratable)) {
            this._clearDeferred(sessionKey);
          }
          this._narrate(key3, narratable.kind, narratable.text, void 0, void 0, narratable.confirmationType, narratable.pending);
        }
        if (narratable.kind === "response") {
          handledResponse = handledResponse || alreadyNarrated;
        }
      }
    }
    if (handledResponse) {
      this._clearPendingResponse(sessionKey);
    }
  }
  /** Ask the backend to narrate a session's pending item, de-duped by the exact text last spoken for it ({@link _lastNarratedText}) and by any in-flight request for the same text ({@link _pendingSolicitedNarrations}); the single narration trigger for both live and on-focus paths. Returns `true` when a request was actually SENT - NOT that the reply was heard (the audio may still be dropped/deferred/never arrive). The reply is marked narrated and its pending indicator cleared only once its audio finalizes (see {@link _markNarrationHeard}). */
  _narrate(sessionId, kind, text2, reuseId, checkpoint, confirmationType, pending) {
    if (!text2) {
      return false;
    }
    const sessionKey = this._sessionKey(sessionId);
    const identity2 = this._narratableIdentity({ text: text2, pending, confirmationType });
    if (kind === "response" && this._wasResponseHeard(sessionId, text2)) {
      return false;
    }
    if (kind !== "response" && kind !== "checkpoint" && this._narratedPending.get(sessionKey) === identity2) {
      return false;
    }
    for (const s of this._pendingSolicitedNarrations.values()) {
      if (s.kind === kind && this._narratableIdentity(s) === identity2 && this._sessionKey(s.sessionId) === sessionKey) {
        return false;
      }
    }
    if (kind !== "response" && kind !== "checkpoint") {
      this._stopPendingNarration(sessionId);
    }
    if (kind !== "response") {
      this._preemptCheckpointPlayback();
    }
    if (kind !== "response" && kind !== "checkpoint") {
      this._sendContext();
      this.voiceClientService.flushSessionContext();
    }
    this.logService.trace(`[voice] narrate kind=${kind} id=${sessionId.slice(-32)}`);
    const narrationId = this.voiceClientService.requestNarration(sessionId, kind, text2, reuseId, checkpoint, confirmationType, pending);
    if (!narrationId) {
      if (kind === "checkpoint") {
        return false;
      }
      this._pendingNarrationRetries.set(sessionId, { kind, text: text2, confirmationType, pending });
      return false;
    }
    if (kind === "checkpoint") {
      this.logService.trace(`[voice][checkpoint] requested narration_id=${narrationId} request_id=${checkpoint?.requestId ?? "<unknown>"} phase=${checkpoint?.checkpointId ?? "<unknown>"} sequence=${checkpoint?.sequence ?? 0} seed=${JSON.stringify(text2)}`);
    }
    this._prepareForPlayback();
    this._pendingNarrationRetries.delete(sessionId);
    this._clearDeferred(sessionKey);
    if (this._solicitedNarrationIds.size >= 64) {
      const oldest = this._solicitedNarrationIds.values().next().value;
      if (oldest !== void 0) {
        this._solicitedNarrationIds.delete(oldest);
      }
    }
    this._solicitedNarrationIds.add(narrationId);
    const audioStartTimer = setTimeout(() => {
      this._handleSolicitedNarrationAudioStartTimeout(narrationId);
    }, VoiceSessionController._SOLICITED_NARRATION_AUDIO_START_TIMEOUT_MS);
    this._pendingSolicitedNarrations.set(narrationId, {
      sessionId,
      kind,
      text: text2,
      pending,
      checkpoint,
      confirmationType,
      audioStartTimer,
      hasReceivedAudio: false
    });
    return true;
  }
  _markSolicitedNarrationAudioStarted(narrationId) {
    if (!narrationId) {
      return;
    }
    const pending = this._pendingSolicitedNarrations.get(narrationId);
    if (!pending || pending.hasReceivedAudio) {
      return;
    }
    pending.hasReceivedAudio = true;
    clearTimeout(pending.audioStartTimer);
  }
  _handleSolicitedNarrationAudioStartTimeout(narrationId) {
    const pending = this._pendingSolicitedNarrations.get(narrationId);
    if (!pending || pending.hasReceivedAudio) {
      return;
    }
    this._pendingSolicitedNarrations.delete(narrationId);
    this._solicitedNarrationIds.delete(narrationId);
    if (this._awaitingReplyAudio || this._hasNarrationAwaitingAudio()) {
      this.logService.trace(`[voice] solicited narration ${narrationId.slice(0, 8)} timed out waiting for audio start; another response still expected, deferring state restore`);
      return;
    }
    this.logService.trace(`[voice] solicited narration ${narrationId.slice(0, 8)} timed out waiting for audio start; restoring idle state`);
    this._restoreVoiceStateAfterNarrationTimeout();
  }
  /** True while any tracked solicited narration is still waiting for its audio
   *  to start (i.e. a no-audio watchdog is still outstanding). */
  _hasNarrationAwaitingAudio() {
    for (const pending of this._pendingSolicitedNarrations.values()) {
      if (!pending.hasReceivedAudio) {
        return true;
      }
    }
    return false;
  }
  _clearPendingSolicitedNarration(narrationId, pending) {
    clearTimeout(pending.audioStartTimer);
    this._pendingSolicitedNarrations.delete(narrationId);
  }
  _notifyCheckpointPlaybackComplete(sessionId, narrationId, narration) {
    if (narration?.kind === "checkpoint" && narration.playbackId) {
      this.voiceClientService.sendNarrationPlaybackComplete(sessionId, narrationId, narration.playbackId);
    }
  }
  _restoreVoiceStateAfterNarrationTimeout() {
    if (this.ttsPlaybackService.isPlaying || this._audioQueue.length > 0 || this._currentPlaybackSessionId !== null || this._pttHeld) {
      return;
    }
    if (this._isHandsFreeEnabled() && this._window && this._isConnected.get()) {
      this._enterAutoListen();
      return;
    }
    this._voiceState.set("idle", void 0);
    this._statusText.set("Hold to speak...", void 0);
  }
  /** Mark a solicited narration's reply as actually heard once its final audio
   *  chunk arrives (responseId === the narration id we sent). Only now do we set
   *  the exactly-once dedup and clear the session's pending-response indicator,
   *  since a mere request acceptance is not proof the reply played. */
  _markNarrationHeard(narrationId) {
    const solicited = this._pendingSolicitedNarrations.get(narrationId);
    if (!solicited) {
      return;
    }
    this._clearPendingSolicitedNarration(narrationId, solicited);
    const sessionKey = this._sessionKey(solicited.sessionId);
    if (solicited.kind === "response") {
      this._lastNarratedText.set(sessionKey, solicited.text);
      this._clearPendingResponse(sessionKey);
    } else if (solicited.kind !== "checkpoint") {
      this._narratedPending.set(sessionKey, this._narratableIdentity(solicited));
      this.logService.trace(`[voice] pending item heard for ${sessionKey.slice(-32)}; marking occurrence spoken`);
    }
  }
  /**
   * Handle a `narration_ack` for a `request_narration` we sent.
   *
   * `accepted` needs nothing: the request is already tracked in
   * {@link _pendingSolicitedNarrations} and its audio will finalize normally.
   * `busy` means the backend could not play right now (user speaking / reply in
   * flight); it will nudge us with `narration_unblocked` when the guard clears,
   * so we stop tracking the id as in-flight and remember it for a revalidated
   * retry. `invalid` and legacy `suppressed` are terminal, so we drop them entirely.
   */
  _handleNarrationAck(e) {
    if (e.disposition === "accepted") {
      return;
    }
    const key3 = this._sessionKey(e.codingSessionId);
    const solicited = this._pendingSolicitedNarrations.get(e.narrationId);
    if (solicited) {
      this._clearPendingSolicitedNarration(e.narrationId, solicited);
    }
    this._solicitedNarrationIds.delete(e.narrationId);
    if (e.disposition === "invalid" || e.disposition === "suppressed") {
      this.logService.trace(`[voice] narration_ack ${e.disposition} id=${e.narrationId.slice(0, 8)} reason=${e.reason ?? "<none>"}; dropping`);
      this._clearDeferred(key3);
      if (solicited) {
        this.telemetryService.publicLog2("voiceNarrationDropped", { kind: solicited.kind, reason: e.disposition });
      }
      return;
    }
    const kind = solicited?.kind;
    const text2 = solicited?.text;
    if (kind && text2) {
      if (kind === "checkpoint") {
        this.logService.trace(`[voice] narration_ack busy id=${e.narrationId.slice(0, 8)}; dropping checkpoint`);
        return;
      }
      this.logService.trace(`[voice] narration_ack busy id=${e.narrationId.slice(0, 8)} reason=${e.reason ?? "<none>"}; deferring`);
      this._deferredNarrations.set(key3, { narrationId: e.narrationId, kind, text: text2, reuseNarrationId: true, confirmationType: solicited.confirmationType, pending: solicited.pending });
      this.telemetryService.publicLog2("voiceNarrationDeferred", { kind, reason: "busy" });
    }
  }
  /**
   * Handle a `narration_interrupted`: an accepted, in-flight narration was
   * cancelled by barge-in. The backend evicted the id, so stop tracking it and
   * defer a revalidated retry (driven by the `narration_unblocked` that follows
   * once the barge-in turn ends).
   */
  _handleNarrationInterrupted(e) {
    const solicited = this._pendingSolicitedNarrations.get(e.narrationId);
    if (solicited) {
      if (solicited.kind === "checkpoint") {
        this._preemptCheckpointPlayback(e.codingSessionId, e.narrationId);
        return;
      }
      this._deferInterruptedNarration(e.narrationId, solicited);
      this.logService.trace(`[voice] narration_interrupted id=${e.narrationId.slice(0, 8)}; deferring for revalidation`);
      this.telemetryService.publicLog2("voiceNarrationDeferred", { kind: solicited.kind, reason: "interrupted" });
    } else {
      this._solicitedNarrationIds.delete(e.narrationId);
    }
  }
  _deferInterruptedNarration(narrationId, solicited) {
    this._clearPendingSolicitedNarration(narrationId, solicited);
    this._solicitedNarrationIds.delete(narrationId);
    if (solicited.kind === "checkpoint") {
      return;
    }
    this._deferredNarrations.set(this._sessionKey(solicited.sessionId), {
      narrationId,
      kind: solicited.kind,
      text: solicited.text,
      reuseNarrationId: false,
      pending: solicited.pending,
      confirmationType: solicited.confirmationType
    });
  }
  /**
   * The `narration_unblocked` nudge fired for a deferred narration. Revalidate
   * against the current session state and only re-request if it is still
   * warranted, reusing the same id for a busy retry when the text is unchanged
   * (so the backend dedups a lost ack), but minting a fresh id after an
   * interruption because the old id is tombstoned for late-audio suppression.
   * If it is no longer warranted (resolved, or a different kind), drop it.
   */
  _retryDeferredNarration(sessionKey, unblockedNarrationId) {
    const deferred = this._deferredNarrations.get(sessionKey);
    if (!deferred) {
      this.logService.trace(`[voice] narration_unblocked for ${sessionKey.slice(-32)} but nothing deferred; nothing to retry`);
      return false;
    }
    if (unblockedNarrationId && deferred.narrationId !== unblockedNarrationId) {
      this.logService.trace(`[voice] narration_unblocked id=${unblockedNarrationId.slice(0, 8)} for ${sessionKey.slice(-32)} does not match currently deferred id=${deferred.narrationId.slice(0, 8)}; a newer entry superseded it, skipping`);
      return false;
    }
    let resource;
    try {
      resource = URI.parse(sessionKey);
    } catch {
      resource = void 0;
    }
    const narratable = resource ? this._currentNarratable(resource) : void 0;
    if (!narratable || narratable.kind !== deferred.kind || narratable.text !== deferred.text || deferred.kind === "confirmation" && narratable.confirmationType !== deferred.confirmationType) {
      this.logService.trace(`[voice] deferred narration for ${sessionKey.slice(-32)} no longer warranted; dropping`);
      this._clearDeferred(sessionKey);
      this.telemetryService.publicLog2("voiceNarrationDropped", { kind: deferred.kind, reason: "stale" });
      return false;
    }
    if (this._shouldDeferForSession(sessionKey)) {
      this.logService.trace(`[voice] deferred narration for ${sessionKey.slice(-32)} no longer shown; dropping`);
      this._clearDeferred(sessionKey);
      this.telemetryService.publicLog2("voiceNarrationDropped", { kind: deferred.kind, reason: "session_changed" });
      return false;
    }
    const reuseId = deferred.reuseNarrationId && this._narratableIdentity(narratable) === this._narratableIdentity(deferred) ? deferred.narrationId : void 0;
    this.logService.trace(`[voice] retrying deferred narration for ${sessionKey.slice(-32)} reuse=${!!reuseId}`);
    this._clearDeferred(sessionKey);
    return this._narrate(sessionKey, narratable.kind, narratable.text, reuseId, void 0, narratable.confirmationType, narratable.pending);
  }
  _retryPendingNarration(sessionId, pending) {
    let resource;
    try {
      resource = URI.parse(sessionId);
    } catch {
      this.logService.trace(`[voice] queued confirmation for invalid session id; dropping`);
      return false;
    }
    const current = this._currentNarratable(resource);
    if (!current || current.kind !== pending.kind || this._narratableIdentity(current) !== this._narratableIdentity(pending)) {
      this.logService.trace(`[voice] queued narration for ${sessionId.slice(-32)} no longer matches current state; dropping`);
      return false;
    }
    if (current.kind !== "response" && this._shouldDeferForSession(this._sessionKey(sessionId))) {
      this.logService.trace(`[voice] queued narration for ${sessionId.slice(-32)} is no longer shown; dropping`);
      return false;
    }
    return this._narrate(sessionId, current.kind, current.text, void 0, void 0, current.confirmationType, current.pending);
  }
  /** Drop a deferred narration. */
  _clearDeferred(sessionKey) {
    this._deferredNarrations.delete(sessionKey);
  }
  /** The pending item a session would narrate now (waiting confirmation prompt or completed reply summary), from the resident model or cached summary/status; returns undefined (kicking off a load) if a confirmation's detail isn't ready. */
  _currentNarratable(resource) {
    const model = this.chatService.getSession(resource);
    if (model) {
      const question = this._questionNarratable(model);
      if (question) {
        return question;
      }
      const info = this._getAgentStateInfo(model);
      if (info.state === "waiting_for_confirmation" && info.detail) {
        const pending = this._pendingNarrationReference(model);
        return { kind: "confirmation", text: info.detail, confirmationType: info.confirmation_type, ...pending ? { pending } : {} };
      }
      if (info.state === "idle" && info.last_response_summary) {
        return { kind: "response", text: info.last_response_summary };
      }
      return void 0;
    }
    const session = this.agentSessionsService.model.sessions.find((s) => !s.isArchived() && isEqual2(s.resource, resource));
    if (session?.status === 3 /* NeedsInput */) {
      this._ensureModelLoaded(resource);
      return void 0;
    }
    if (session?.status === 1 /* Completed */) {
      const summary = this._lastResponseSummaryById.get(resource.toString());
      if (summary) {
        return { kind: "response", text: summary };
      }
      this._ensureModelLoaded(resource);
      return void 0;
    }
    return void 0;
  }
  /**
   * The id of the pending item a session is showing right now, or `''`.
   *
   * Used as a per-occurrence fingerprint in state-transition detection: the
   * prose `detail` two forms produce can be identical, so without this,
   * replacing one form with another inside `waiting_for_confirmation` looks
   * like no change at all and is never narrated.
   */
  _pendingIdFor(sessionId) {
    const selected = this._selectPendingPart(this._modelForSession(sessionId));
    return selected ? derivePendingId(selected.requestId, selected.part, this._store) : "";
  }
  /**
   * The identity of one *occurrence* of a narratable item, for dedup.
   *
   * Two forms can ask the same questions and two tools can raise the same
   * prompt, so keying "already heard" on text alone swallows the second one.
   * Text is only a fallback for narratables with no structured pending.
   */
  _narratableIdentity(narratable) {
    return narratable.pending ? `#${narratable.pending.pendingId}` : `${narratable.confirmationType ?? ""}:${narratable.text}`;
  }
  /**
   * The spoken form of a session's pending question form, if it has one.
   *
   * This asks for *the form*, not a particular question in it: the backend owns
   * the draft of answers so far, so only it knows which question the form is
   * waiting on. Naming one here would leave a partially answered form silent,
   * since the client only ever sees question 1. The text is used during the
   * debounce window before the backend's mirror catches up, which is by
   * definition first sighting.
   */
  _questionNarratable(model) {
    const pending = model ? this._buildPendingPayload(model) : void 0;
    const question = pending?.type === "questions" ? pending.questions?.[0] : void 0;
    if (!pending || !question) {
      return void 0;
    }
    return {
      kind: "question",
      text: formatQuestionPrompt(question, pending.allow_skip === true),
      pending: { pendingId: pending.pending_id }
    };
  }
  /** Identify the exact structured approval being narrated, not merely its text. */
  _pendingNarrationReference(model) {
    const pending = model ? this._buildPendingPayload(model) : void 0;
    return pending ? { pendingId: pending.pending_id } : void 0;
  }
  /**
   * True when a session is awaiting confirmation but its confirmation detail is
   * not yet available (model not loaded, or the pending-confirmation part hasn't
   * rendered). Used to avoid narrating a detail-less confirmation on the first
   * context send followed by the detailed one moments later.
   */
  _confirmationDetailPending(resource) {
    const session = this.agentSessionsService.model.sessions.find((s) => !s.isArchived() && isEqual2(s.resource, resource));
    if (!session || session.status !== 3 /* NeedsInput */) {
      return false;
    }
    const model = this.chatService.getSession(resource);
    if (!model) {
      return true;
    }
    const info = this._getAgentStateInfo(model);
    return info.state !== "waiting_for_confirmation" || !info.detail;
  }
  /**
   * The session the user is actively working with for the purpose of routing
   * voice audio: the explicitly targeted session if one is set, otherwise the
   * session most recently shown to the user (across all widgets, so an opened
   * session that hasn't taken DOM focus still counts), falling back to the raw
   * focused widget. This mirrors how `_buildSessionContext` computes the
   * backend's `is_active` session, so playback and the backend agree on which
   * session is "active" and everything else is a background narration.
   */
  _getActiveSessionId() {
    if (this._hasDraftTarget.get()) {
      return void 0;
    }
    if (this._externalActiveSessionMode) {
      return this._targetSession.get()?.toString() ?? this._activeSessionShown;
    }
    return this._targetSession.get()?.toString() ?? this._activeSessionShown ?? this._lastShownSessionId ?? this._getFocusedSessionId();
  }
  /**
   * The session the user is currently looking at, used to route deferral and
   * decide which completions narrate immediately vs. defer + indicate.
   *
   * In focus-based (main-window) mode this is the LIVE focused session, NOT the
   * sticky `_lastShownSessionId`: that field is updated by any tracked chat
   * widget's view-model swap (see `_trackWidgetSession`), so while the backend
   * works a background session it can transiently point there and make that
   * session look "shown" - which suppressed deferral, the pending indicator, and
   * on-focus playback for responses. The confirmation indicator has always used
   * live focus (see `_reconcileConfirmationIndicators`) and worked correctly;
   * this keeps responses consistent with it. Opening a session still flushes its
   * buffer directly via `_onSessionShown`, so the sticky value isn't needed here.
   * Unlike {@link _getActiveSessionId} it ignores the sticky input
   * `_targetSession` (where the next utterance is sent, not what is viewed).
   */
  _shownSessionId() {
    if (this._externalActiveSessionMode) {
      return this._activeSessionShown;
    }
    return this._getFocusedSessionId();
  }
  _pinActiveSessionAsTarget() {
    if ((this._isConnected.get() || this._isConnecting.get()) && this._activeSessionShown && !this._targetSession.get() && !this._hasDraftTarget.get()) {
      this._setTargetSession(URI.parse(this._activeSessionShown));
    }
  }
  setActiveSessionShown(resource) {
    const key3 = resource?.toString();
    if (resource === null) {
      this._pinActiveSessionAsTarget();
      if (!this._targetSession.get()) {
        this._hasDraftTarget.set(true, void 0);
      }
      this.logService.trace(`[voice] setActiveSessionShown=<draft> (was ${this._activeSessionShown ?? "<none>"})`);
      this._externalActiveSessionMode = true;
      this._activeSessionShown = void 0;
      this._suspendPlaybackForHiddenSessions();
      return;
    }
    if (resource === void 0) {
      if (!this._externalActiveSessionMode && this._activeSessionShown === void 0) {
        return;
      }
      this._pinActiveSessionAsTarget();
      this.logService.trace(`[voice] setActiveSessionShown=<none>; restoring focus-based detection (was ${this._activeSessionShown ?? "<none>"})`);
      this._externalActiveSessionMode = false;
      this._activeSessionShown = void 0;
      this._hasDraftTarget.set(false, void 0);
      this._onFocusedSessionChanged();
      return;
    }
    this._externalActiveSessionMode = true;
    const definedKey = key3;
    if (this._isSameSession(definedKey, this._activeSessionShown)) {
      const sessionKey = this._sessionKey(definedKey);
      if (this._pendingOwned(sessionKey)) {
        this.logService.trace(`[voice] re-pinned active session=${definedKey} has pending voice work; re-activating`);
        this._activateShownSession(resource);
      }
      return;
    }
    this._pinActiveSessionAsTarget();
    this.logService.trace(`[voice] setActiveSessionShown=${definedKey} (was ${this._activeSessionShown ?? "<none>"})`);
    this._activeSessionShown = definedKey;
    this._suspendPlaybackForHiddenSessions();
    this._activateShownSession(resource);
  }
  activateSession(resource) {
    const key3 = resource.toString();
    this.logService.trace(`[voice] activateSession=${key3} (explicit UI action)`);
    if (this._externalActiveSessionMode) {
      this._activeSessionShown = key3;
    }
    this._activateShownSession(resource);
  }
  /**
   * Routing decision for one audio-response chunk. When the backend echoes a
   * per-response id, decide the whole response's fate once (on its first chunk),
   * store it in {@link _responseRoutes}, and make every later chunk of that id
   * follow it - so interleaved responses for different sessions never steal each
   * other's routing and a response is never split. Without a responseId, defer
   * to the legacy session-keyed {@link _shouldDeferResponse}.
   */
  _shouldDeferResponseStream(responseId, sessionId, isFirstChunk) {
    if (!responseId) {
      return this._shouldDeferResponse(sessionId, isFirstChunk);
    }
    const known = this._responseRoutes.get(responseId);
    if (known !== void 0) {
      if (known === "live" && this._shouldDeferForSession(sessionId)) {
        this._responseRoutes.set(responseId, "deferred");
        return true;
      }
      return known === "deferred";
    }
    const defer = this._shouldDeferForSession(sessionId);
    this._responseRoutes.set(responseId, defer ? "deferred" : "live");
    return defer;
  }
  /** Whether two session ids refer to the same session, tolerant of the two id
   *  spaces (bare backend id vs UI resource) and trivial serialization
   *  differences. Mirrors the matching used to flush buffered responses so the
   *  defer decision and the flush agree on identity. */
  _isSameSession(a, b) {
    if (!a || !b) {
      return false;
    }
    if (a === b || this._canonicalSessionId(a) === this._canonicalSessionId(b)) {
      return true;
    }
    try {
      return isEqual2(URI.parse(a), URI.parse(b));
    } catch {
      return false;
    }
  }
  /** Alias-aware read of the last text narrated for a session, used for
   *  exactly-once dedupe. */
  _getLastNarratedText(sessionId) {
    return this._lastNarratedText.get(this._sessionKey(sessionId));
  }
  _wasResponseHeard(sessionId, text2) {
    if (this._getLastNarratedText(sessionId) === text2) {
      return true;
    }
    const heard = this._lastHeardTranscriptById.get(this._sessionKey(sessionId));
    const requested = this._normalizeTranscript(text2);
    return !!heard && !!requested && (heard === requested || heard.startsWith(requested) || requested.startsWith(heard));
  }
  /** Clear the last-narrated dedupe for a session. */
  _clearLastNarratedText(sessionId) {
    this._lastNarratedText.delete(this._sessionKey(sessionId));
  }
  /** Whether a response for `sessionId` should defer: true unless it is the
   *  session currently shown to the user (untagged audio → play). A reply the
   *  user is awaiting is NOT exempted: if they switched away before it arrived,
   *  it is deferred like any other background narration and flushed on return. */
  _shouldDeferForSession(sessionId) {
    if (!sessionId) {
      return false;
    }
    return !this._isSameSession(this._shownSessionId(), sessionId);
  }
  /** True when one of the session's buffered responses is the SAME stream as
   *  `responseId` (so a live chunk for it is a promotion, not a new response). */
  _deferredBufferHasResponse(sessionId, responseId) {
    if (!responseId) {
      return false;
    }
    return this._deferredResponses.get(sessionId)?.some((r2) => r2.responseId === responseId) ?? false;
  }
  /**
   * A response is deferred when it is a background narration for a session the
   * user is NOT looking at. It plays immediately only for the shown session (or
   * when it is untagged audio); a reply the user was awaiting but has since
   * switched away from is deferred like any other background narration.
   *
   * The decision is made on the first chunk and recorded in `_liveReplyKeys`;
   * remaining chunks follow the same decision so a response is never split
   * between playback and the deferred buffer. This session-keyed heuristic is
   * the fallback for backends that don't echo a per-response id; when they do,
   * {@link _shouldDeferResponseStream} routes by that id instead.
   */
  _shouldDeferResponse(sessionId, isFirstChunk) {
    const key3 = sessionId ? this._sessionKey(sessionId) : "";
    if (isFirstChunk) {
      if (!sessionId) {
        this._liveReplyKeys.add(key3);
        return false;
      }
      if (!this._shouldDeferForSession(sessionId)) {
        this._liveReplyKeys.add(key3);
        return false;
      }
      this._liveReplyKeys.delete(key3);
      return true;
    }
    if (this._deferredResponses.has(key3)) {
      return true;
    }
    if (this._liveReplyKeys.has(key3)) {
      if (this._shouldDeferForSession(sessionId)) {
        this._liveReplyKeys.delete(key3);
        return true;
      }
      return false;
    }
    return this._shouldDeferForSession(sessionId);
  }
  _deferResponse(sessionId, audio, isFirstChunk, isFinal, transcript, responseId, turnId) {
    const key3 = this._sessionKey(sessionId);
    let responses = this._deferredResponses.get(key3);
    if (!responses) {
      responses = [];
      this._deferredResponses.set(key3, responses);
    }
    let response;
    if (!isFirstChunk) {
      response = responseId ? responses.find((r2) => r2.responseId === responseId) : [...responses].reverse().find((r2) => !r2.finalized);
    }
    if (!response) {
      response = { responseId, turnId, finalized: false, chunks: [] };
      responses.push(response);
      this._markPendingResponse(key3, true);
      this.logService.trace(`[voice] deferring response for unfocused session=${key3} (buffered=${responses.length}); showing pending indicator`);
    }
    response.chunks.push({ audio, isFirstChunk, isFinal, transcript });
    if (isFinal) {
      response.finalized = true;
    }
  }
  /** Find the buffered-response key for a now-shown session. The buffer is keyed
   *  by the canonical session key ({@link _sessionKey}); a structural URI-equality
   *  fallback guards a trivial serialization difference between the backend's
   *  coding_session_id and the focused sessionResource. */
  _matchDeferredKey(sessionId) {
    const key3 = this._sessionKey(sessionId);
    if (this._deferredResponses.has(key3)) {
      return key3;
    }
    if (this._deferredResponses.size === 0) {
      return void 0;
    }
    let focusedUri;
    try {
      focusedUri = URI.parse(key3);
    } catch {
      focusedUri = void 0;
    }
    if (focusedUri) {
      for (const candidate of this._deferredResponses.keys()) {
        try {
          if (isEqual2(URI.parse(candidate), focusedUri)) {
            return candidate;
          }
        } catch {
        }
      }
    }
    return void 0;
  }
  /** Replays all buffered responses for a now-shown session, in arrival order.
   *  Returns whether anything was flushed plus the normalized final transcript
   *  of each response played, so the caller can mark _lastNarratedText only for
   *  text that was actually read (never a newer, unplayed summary). */
  _flushDeferredResponse(sessionId) {
    const key3 = this._matchDeferredKey(sessionId);
    if (!key3) {
      if (this._deferredResponses.size > 0) {
        this.logService.trace(`[voice] no buffered response matches focused=${sessionId}; pending keys=[${[...this._deferredResponses.keys()].join(", ")}]`);
      }
      return { flushed: false, finalTranscripts: [] };
    }
    const responses = this._deferredResponses.get(key3);
    if (!responses || responses.length === 0) {
      this._deferredResponses.delete(key3);
      this._maybeHideIndicator(key3);
      return { flushed: false, finalTranscripts: [] };
    }
    if (!this._prepareForPlayback()) {
      this.logService.trace(`[voice] deferred flush for session=${key3} deferred: held deliberate press preserved, keeping ${responses.length} buffered response(s)`);
      const retainedFinals = responses.map((r2) => this._normalizeTranscript([...r2.chunks].reverse().find((c) => c.transcript)?.transcript ?? "")).filter((t2) => !!t2);
      return { flushed: false, retained: true, retainedTranscript: retainedFinals[retainedFinals.length - 1], finalTranscripts: [] };
    }
    this._deferredResponses.delete(key3);
    this._maybeHideIndicator(key3);
    const totalChunks = responses.reduce((n2, r2) => n2 + r2.chunks.length, 0);
    this.logService.trace(`[voice] flushing ${responses.length} buffered response(s) (${totalChunks} chunk(s)) for now-focused session=${key3}`);
    for (const r2 of responses) {
      if (r2.responseId && !r2.finalized) {
        this._responseRoutes.set(r2.responseId, "live");
      }
    }
    const finalTranscripts = responses.map((r2) => this._normalizeTranscript([...r2.chunks].reverse().find((c) => c.transcript)?.transcript ?? "")).filter((t2) => !!t2);
    const flushedTranscript = finalTranscripts[finalTranscripts.length - 1];
    if (flushedTranscript) {
      this._recentlyReadResponse.set(key3, { transcript: flushedTranscript, at: Date.now() });
      this._lastHeardTranscriptById.set(key3, flushedTranscript);
    }
    for (const r2 of responses) {
      for (const chunk of r2.chunks) {
        this._enqueueAudio(key3, chunk.audio, chunk.isFirstChunk, chunk.isFinal, chunk.transcript, r2.responseId);
      }
    }
    return { flushed: true, finalTranscripts };
  }
  _isUserActivelySpeaking() {
    return this._pttHeld && (!this._pttCurrentTurnPassive || this._speechDetectedInTurn);
  }
  /**
   * Get the controller out of listening/auto-listen and ready the playback slot
   * so an about-to-arrive (or just-buffered) narration actually plays instead of
   * being suppressed. Used before flushing a deferred response and before
   * narrating a freshly-shown session's pending item (e.g. a confirmation, which
   * carries no buffered audio and so never hits the flush path) - otherwise the
   * controller can sit in listening and the echoed audio is dropped, leaving the
   * user staring at a focused session that never speaks.
   *
   * Returns `true` when the playback slot is ready (no press held, or a passive
   * open-mic turn was torn down), and `false` when it deliberately preserved a
   * held non-passive press. A `false` return tells the flush caller to leave its
   * buffered audio deferred rather than play it over the user's live press.
   */
  _prepareForPlayback() {
    this._clearAutoListenTimer();
    this._autoListenSuppressed = false;
    if (this._isUserActivelySpeaking()) {
      return false;
    }
    if (this._pttHeld) {
      this._finishPtt("auto", "internal");
    }
    this._pttToggleMode = false;
    this._pttHeld = false;
    this._suppressIncomingAudio = false;
    if (!this.ttsPlaybackService.isPlaying && this._currentPlaybackSessionId !== null) {
      this._currentPlaybackSessionId = null;
    }
    return true;
  }
  /**
   * True when an incoming reply is a re-narration of a reply we recently read
   * for this session (played live or flushed from the deferred buffer). The
   * backend re-emits a session's reply when that session becomes active (on
   * focus), which would otherwise be read a second time. We drop it ONLY when
   * its transcript matches the last reply actually heard for the session.
   * That dedupe is durable: focus/context refreshes must never replay a response
   * the user already heard. A genuinely new reply (different text) still plays,
   * including while another reply from the same session is awaited.
   * The whole response (including continuation chunks) is dropped until final.
   *
   * This is purely content-based: it never suppresses a reply just because the
   * session was heard before, which is what let the backend's server-side
   * deferral of a NEW reply (delivered as an on-focus narration) be swallowed.
   */
  _isRenarration(responseId, sessionId, transcript, isFirstChunk, isFinal) {
    if (!sessionId) {
      return false;
    }
    const dropKey = responseId ?? sessionId;
    if (responseId && this._solicitedNarrationIds.has(responseId)) {
      if (isFinal) {
        this._solicitedNarrationIds.delete(responseId);
      }
      return false;
    }
    if (!isFirstChunk && this._droppingRenarration.has(dropKey)) {
      if (isFinal) {
        this._droppingRenarration.delete(dropKey);
      }
      return true;
    }
    if (!isFirstChunk) {
      return false;
    }
    const sessionKey = this._sessionKey(sessionId);
    const heard = this._lastHeardTranscriptById.get(sessionKey) ?? this._recentlyReadResponse.get(sessionKey)?.transcript;
    if (heard === void 0) {
      return false;
    }
    const incoming = this._normalizeTranscript(transcript ?? "");
    if (!incoming || !(heard === incoming || heard.startsWith(incoming))) {
      return false;
    }
    this._liveReplyKeys.delete(sessionId);
    if (!isFinal) {
      this._droppingRenarration.add(dropKey);
    }
    return true;
  }
  /** Lowercase, collapse whitespace and strip surrounding punctuation so two
   *  transcripts of the same reply compare equal despite minor formatting. */
  _normalizeTranscript(text2) {
    return text2.toLowerCase().replace(/\s+/g, " ").replace(/^[\s.,!?;:'"]+|[\s.,!?;:'"]+$/g, "").trim();
  }
  _markPendingResponse(sessionId, pending) {
    try {
      this.voicePlaybackService.setPendingResponse(URI.parse(sessionId), pending);
    } catch {
    }
  }
  /**
   * Reconcile the sessions-list "pending response" indicator for confirmations.
   * A session that is awaiting user confirmation while NOT focused should show
   * the indicator; once it is focused or the confirmation is resolved the
   * indicator is cleared. This is driven purely from client-observed session
   * state, so it is accurate regardless of whether the backend narrates the
   * confirmation as audio.
   */
  _reconcileConfirmationIndicators(waitingSessionIds) {
    const activeId = this._externalActiveSessionMode ? this._activeSessionShown : this._getFocusedSessionId();
    const activeKey = activeId ? this._sessionKey(activeId) : void 0;
    const waitingKeys = /* @__PURE__ */ new Set();
    for (const sessionId of waitingSessionIds) {
      const key3 = this._sessionKey(sessionId);
      waitingKeys.add(key3);
      if (key3 === activeKey) {
        this._clearConfirmationIndicator(key3);
        continue;
      }
      if (!this._confirmationPendingSessions.has(key3)) {
        this._confirmationPendingSessions.add(key3);
        this._markPendingResponse(key3, true);
      }
    }
    for (const key3 of [...this._confirmationPendingSessions]) {
      if (waitingKeys.has(key3) && key3 !== activeKey) {
        continue;
      }
      this._clearConfirmationIndicator(key3);
    }
  }
  _clearConfirmationIndicator(sessionId) {
    const key3 = this._sessionKey(sessionId);
    if (this._confirmationPendingSessions.delete(key3)) {
      this._maybeHideIndicator(key3);
    }
  }
  /** Drop a session's pending-response (completed-reply) indicator/summary. */
  _clearPendingResponse(sessionId) {
    const key3 = this._sessionKey(sessionId);
    if (this._pendingResponseSummaries.delete(key3)) {
      this._maybeHideIndicator(key3);
    }
  }
  /** Hide the sessions-list indicator only when no owner still needs it. The
   *  same visible indicator is shared by three independent sources - an
   *  unfocused confirmation, buffered deferred audio, and a completed
   *  background reply - so it must stay visible until all are resolved. */
  _maybeHideIndicator(sessionId) {
    const key3 = this._sessionKey(sessionId);
    if (this._pendingOwned(key3)) {
      return;
    }
    this._markPendingResponse(key3, false);
  }
  _clearDeferredResponses() {
    for (const key3 of this._deferredResponses.keys()) {
      this._markPendingResponse(key3, false);
    }
    this._deferredResponses.clear();
    this._responseRoutes.clear();
    this._responseSessionIds.clear();
    this._ownershipDroppedResponseIds.clear();
    for (const key3 of this._confirmationPendingSessions) {
      this._markPendingResponse(key3, false);
    }
    this._confirmationPendingSessions.clear();
    for (const key3 of this._pendingResponseSummaries.keys()) {
      this._markPendingResponse(key3, false);
    }
    this._pendingResponseSummaries.clear();
  }
  // --- Audio FIFO queue ---
  _suspendPlaybackForHiddenSessions() {
    const hiddenQueue = [];
    for (let i2 = this._audioQueue.length - 1; i2 >= 0; i2--) {
      const queued = this._audioQueue[i2];
      if (!queued.sessionId || !this._shouldDeferForSession(queued.sessionId)) {
        continue;
      }
      this._audioQueue.splice(i2, 1);
      hiddenQueue.unshift(queued);
    }
    for (const queued of hiddenQueue) {
      const sessionId = queued.sessionId;
      if (!sessionId) {
        continue;
      }
      if (queued.narration?.kind === "checkpoint") {
        this._preemptCheckpointPlayback(sessionId, queued.responseId, false);
        continue;
      }
      for (const chunk of queued.chunks) {
        this._deferResponse(sessionId, chunk.audio, chunk.isFirstChunk, chunk.isFinal, chunk.transcript, queued.responseId);
      }
    }
    const playingSession = this._currentPlaybackSessionId;
    if (playingSession && this._shouldDeferForSession(playingSession)) {
      this._stopCurrentPlaybackAsInterrupted();
    }
  }
  _preemptCheckpointPlayback(sessionId, targetNarrationId, stopActivePlayback = true) {
    const sessionKey = sessionId ? this._sessionKey(sessionId) : void 0;
    const shouldPreempt = (candidateSessionId, candidateNarrationId, narration) => {
      return narration?.kind === "checkpoint" && (targetNarrationId === void 0 || candidateNarrationId === targetNarrationId) && (sessionKey === void 0 || candidateSessionId !== void 0 && this._sessionKey(candidateSessionId) === sessionKey);
    };
    const interruptedIds = /* @__PURE__ */ new Set();
    for (let i2 = this._audioQueue.length - 1; i2 >= 0; i2--) {
      const queued = this._audioQueue[i2];
      if (!shouldPreempt(queued.sessionId, queued.responseId, queued.narration)) {
        continue;
      }
      if (queued.responseId) {
        interruptedIds.add(queued.responseId);
      }
      this._audioQueue.splice(i2, 1);
    }
    for (const [candidateNarrationId, pending] of this._pendingSolicitedNarrations) {
      if (pending.kind !== "checkpoint" || targetNarrationId !== void 0 && candidateNarrationId !== targetNarrationId || sessionKey !== void 0 && this._sessionKey(pending.sessionId) !== sessionKey) {
        continue;
      }
      interruptedIds.add(candidateNarrationId);
      this._clearPendingSolicitedNarration(candidateNarrationId, pending);
      this._solicitedNarrationIds.delete(candidateNarrationId);
    }
    for (const narrationId of interruptedIds) {
      this._rememberInterruptedAudioId(narrationId);
    }
    const activeCheckpointMatches = shouldPreempt(this._currentPlaybackSessionId ?? void 0, this._currentPlaybackResponseId, this._currentPlaybackNarration);
    if (activeCheckpointMatches && this._currentPlaybackResponseId) {
      this._rememberInterruptedAudioId(this._currentPlaybackResponseId);
    }
    if (activeCheckpointMatches && stopActivePlayback) {
      this._stopCurrentPlaybackAsInterrupted();
    }
  }
  _interruptAssistantPlayback() {
    const interruptedSessionId = this._currentPlaybackSessionId ?? this._shownSessionId();
    if (interruptedSessionId) {
      this._cancelVoiceProgress(interruptedSessionId);
    }
    this._preemptCheckpointPlayback(void 0, void 0, false);
    this._rememberInterruptedPlaybackIds();
    this._telemetryTtsInterrupted = this._telemetryTtsInterrupted || this.ttsPlaybackService.isPlaying;
    this._audioQueue.length = 0;
    this._currentPlaybackSessionId = null;
    this._currentPlaybackFinalized = false;
    this._isProcessingQueue = false;
    this._suppressIncomingAudio = true;
    this.ttsPlaybackService.stopPlayback();
    this._currentPlaybackResponseId = void 0;
    this._currentPlaybackNarration = void 0;
    this.voicePlaybackService.notifyPlaybackEnd(void 0);
  }
  _stopCurrentPlaybackAsInterrupted() {
    if (this.ttsPlaybackService.isPlaying) {
      this._telemetryTtsInterrupted = true;
      this.ttsPlaybackService.stopPlayback();
      return;
    }
    this.ttsPlaybackService.stopPlayback();
    this._telemetryTtsInterrupted = false;
    this._currentPlaybackSessionId = null;
    this._currentPlaybackResponseId = void 0;
    this._currentPlaybackNarration = void 0;
    this._currentPlaybackFinalized = false;
    this.voicePlaybackService.notifyPlaybackEnd(void 0);
    if (this._audioQueue.length > 0) {
      if (!this._isProcessingQueue) {
        this._processQueue();
      }
    } else {
      this._restoreVoiceStateAfterNarrationTimeout();
    }
  }
  /**
   * Stop reading an actionable pending request aloud once it has been resolved
   * (e.g. the user pressed Allow, or answered the form with the mouse, before
   * the narration finished). Cancels the session's in-flight
   * confirmation/question narration(s): drops their queued audio, remembers
   * their ids so trailing / not-yet arrived chunks are swallowed in the
   * `audio_response` handler, and cuts off playback if one of them is what is
   * currently speaking. The agent's subsequent real reply uses a different
   * narration id and is unaffected.
   *
   * Responses are deliberately exempt: a completed reply stays worth hearing
   * after the thing it describes has been dealt with, whereas a prompt for an
   * action that has already been taken is only confusing.
   */
  _stopPendingNarration(sessionId) {
    const sessionKey = this._sessionKey(sessionId);
    const cancelledIds = /* @__PURE__ */ new Set();
    for (const [narrationId, pending] of this._pendingSolicitedNarrations) {
      if (pending.kind !== "response" && this._sessionKey(pending.sessionId) === sessionKey) {
        cancelledIds.add(narrationId);
        this._clearPendingSolicitedNarration(narrationId, pending);
      }
    }
    if (cancelledIds.size === 0) {
      return;
    }
    for (let i2 = this._audioQueue.length - 1; i2 >= 0; i2--) {
      const responseId = this._audioQueue[i2].responseId;
      if (responseId !== void 0 && cancelledIds.has(responseId)) {
        this._audioQueue.splice(i2, 1);
      }
    }
    for (const id2 of cancelledIds) {
      if (this._cancelledPendingNarrationIds.size >= 64) {
        const oldest = this._cancelledPendingNarrationIds.values().next().value;
        if (oldest !== void 0) {
          this._cancelledPendingNarrationIds.delete(oldest);
        }
      }
      this._cancelledPendingNarrationIds.add(id2);
    }
    for (const [key3, responses] of this._deferredResponses) {
      const kept = responses.filter((r2) => r2.responseId === void 0 || !cancelledIds.has(r2.responseId));
      if (kept.length === responses.length) {
        continue;
      }
      if (kept.length === 0) {
        this._deferredResponses.delete(key3);
      } else {
        this._deferredResponses.set(key3, kept);
      }
      this._maybeHideIndicator(key3);
    }
    for (const id2 of cancelledIds) {
      this._responseRoutes.delete(id2);
    }
    if (this._currentPlaybackResponseId !== void 0 && cancelledIds.has(this._currentPlaybackResponseId)) {
      this._stopCurrentPlaybackAsInterrupted();
    }
  }
  /**
   * A confirmation or question supersedes completed-response audio for the
   * same session. Do not make the user hear an older reply before the prompt
   * they can act on now.
   */
  _discardResponsesSupersededByPending(sessionId) {
    const sessionKey = this._sessionKey(sessionId);
    const discardedIds = /* @__PURE__ */ new Set();
    for (const [narrationId, pending] of this._pendingSolicitedNarrations) {
      if (pending.kind === "response" && this._sessionKey(pending.sessionId) === sessionKey) {
        discardedIds.add(narrationId);
        this._clearPendingSolicitedNarration(narrationId, pending);
        this._solicitedNarrationIds.delete(narrationId);
      }
    }
    for (let i2 = this._audioQueue.length - 1; i2 >= 0; i2--) {
      const queued = this._audioQueue[i2];
      if (queued.sessionId && this._sessionKey(queued.sessionId) === sessionKey && queued.narration?.kind !== "confirmation" && queued.narration?.kind !== "question") {
        if (queued.responseId) {
          discardedIds.add(queued.responseId);
        }
        this._audioQueue.splice(i2, 1);
      }
    }
    const deferred = this._deferredResponses.get(sessionKey);
    if (deferred) {
      for (const response of deferred) {
        if (response.responseId) {
          discardedIds.add(response.responseId);
        }
      }
      this._deferredResponses.delete(sessionKey);
    }
    for (const id2 of discardedIds) {
      this._rememberInterruptedAudioId(id2);
    }
    this._clearPendingResponse(sessionKey);
    this._clearDeferred(sessionKey);
    this._lastResponseSummaryById.delete(sessionKey);
    this._sessionAudioCache.delete(sessionKey);
    this._maybeHideIndicator(sessionKey);
    const activeIsSupersededResponse = this._currentPlaybackSessionId !== null && this._currentPlaybackSessionId !== void 0 && this._sessionKey(this._currentPlaybackSessionId) === sessionKey && this._currentPlaybackNarration?.kind !== "confirmation" && this._currentPlaybackNarration?.kind !== "question";
    if (activeIsSupersededResponse) {
      this._rememberInterruptedAudioId(this._currentPlaybackResponseId);
      this._stopCurrentPlaybackAsInterrupted();
    }
  }
  _hasResponseAudioInFlight(sessionId) {
    const sessionKey = this._sessionKey(sessionId);
    const isResponseForSession = (candidateSessionId, narration) => !!candidateSessionId && this._sessionKey(candidateSessionId) === sessionKey && (narration === void 0 || narration.kind === "response");
    return isResponseForSession(this._currentPlaybackSessionId ?? void 0, this._currentPlaybackNarration) || this._audioQueue.some((queued) => isResponseForSession(queued.sessionId, queued.narration));
  }
  _enqueueAudio(sessionId, audio, isFirstChunk, isFinal, transcript, responseId, narration) {
    const isCheckpointNarration = narration?.kind === "checkpoint";
    this._clearAutoListenTimer();
    if (this._suppressIncomingAudio) {
      if (isFirstChunk) {
        this._suppressIncomingAudio = false;
      } else {
        return;
      }
    }
    if (isFirstChunk && !isCheckpointNarration) {
      this._clearAwaitingReply();
    }
    const nothingPlaying = this._currentPlaybackSessionId === null;
    const sameSession = !nothingPlaying && this._currentPlaybackSessionId === sessionId;
    const continuationOfCurrent = sameSession && !isFirstChunk && !this._currentPlaybackFinalized;
    if (nothingPlaying && this._audioQueue.length === 0 || continuationOfCurrent) {
      this._playChunk(sessionId, audio, isFirstChunk, isFinal, transcript, responseId, narration);
      return;
    }
    let entry = isFirstChunk ? void 0 : [...this._audioQueue].reverse().find(
      (e) => !e.finalized && (e.sessionId === sessionId || e.sessionId === void 0 && sessionId === void 0)
    );
    if (!entry) {
      entry = { sessionId, responseId, narration, finalized: false, chunks: [] };
      this._audioQueue.push(entry);
    }
    entry.chunks.push({ audio, isFirstChunk, isFinal, transcript });
    if (isFinal) {
      entry.finalized = true;
    }
    if (this._currentPlaybackSessionId === null && !this._isProcessingQueue) {
      this._processQueue();
    }
  }
  _playChunk(sessionId, audio, isFirstChunk, isFinal, transcript, responseId, narration) {
    const isCheckpointNarration = narration?.kind === "checkpoint";
    if (transcript) {
      this._setAssistantTurn(transcript, { startNewTurn: isFirstChunk });
    }
    const sessionResource = sessionId ? URI.parse(sessionId) : void 0;
    if (sessionResource) {
      this.voicePlaybackService.notifyPlaybackStart(sessionResource, transcript);
    }
    const speakResponsesEnabled = this.configurationService.getValue("agents.voice.speakResponses") !== false;
    if (speakResponsesEnabled && audio) {
      this._currentPlaybackSessionId = sessionId;
      if (sessionId && !isCheckpointNarration) {
        this._lastSpokenResponseSessionId = this._sessionKey(sessionId);
      }
      this._currentPlaybackResponseId = responseId;
      this._currentPlaybackNarration = narration;
      this._currentPlaybackTranscript = transcript ?? this._currentPlaybackTranscript;
      this._currentPlaybackFinalized = isFinal;
      this._clearAutoListenTimer();
      if (!isCheckpointNarration) {
        this._replyPlayedSinceSend = true;
      }
      this._voiceState.set("speaking", void 0);
      this._statusText.set("Speaking...", void 0);
      this.ttsPlaybackService.playAudioChunk(audio, isFinal, this._window);
      if (this._isHandsFreeEnabled()) {
        this._startBargeInListen();
      } else {
        this.micCaptureService.suppressUntil(Date.now() + 800);
      }
    } else if (!speakResponsesEnabled) {
      if (!isCheckpointNarration) {
        this._replyPlayedSinceSend = true;
      }
      if (isFinal) {
        this._currentPlaybackSessionId = null;
        this._currentPlaybackResponseId = void 0;
        this._currentPlaybackNarration = void 0;
        if (responseId) {
          if (sessionId) {
            this._notifyCheckpointPlaybackComplete(sessionId, responseId, narration);
          }
          this._markNarrationHeard(responseId);
        }
        if (!this._isProcessingQueue) {
          this._processQueue();
        }
        if (this._isHandsFreeEnabled()) {
          this._scheduleAutoListen();
        }
      }
    } else {
      if (isFinal && this._currentPlaybackSessionId === sessionId) {
        this._currentPlaybackFinalized = true;
      }
      this.ttsPlaybackService.playAudioChunk(audio, isFinal, this._window);
    }
  }
  _processQueue() {
    this._isProcessingQueue = true;
    while (this._currentPlaybackSessionId === null && this._audioQueue.length > 0) {
      const next = this._audioQueue.shift();
      for (const chunk of next.chunks) {
        this._playChunk(next.sessionId, chunk.audio, chunk.isFirstChunk, chunk.isFinal, chunk.transcript, next.responseId, next.narration);
      }
    }
    this._isProcessingQueue = false;
  }
  // --- Replay from cache ---
  _replaySessionAudio(sessionId) {
    this._stopReplay();
    const samples = this._sessionAudioCache.get(sessionId);
    if (!samples || !this._window) {
      return;
    }
    const ctx = this.ttsPlaybackService.ensureContext(this._window);
    const buffer = ctx.createBuffer(1, samples.length, 24e3);
    buffer.getChannelData(0).set(samples);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    this._replaySourceNode = source;
    const sessionResource = URI.parse(sessionId);
    this.voicePlaybackService.notifyPlaybackStart(sessionResource, void 0);
    this._voiceState.set("speaking", void 0);
    this._statusText.set("Replaying...", void 0);
    source.onended = () => {
      if (this._replaySourceNode === source) {
        this._replaySourceNode = void 0;
        this.voicePlaybackService.notifyPlaybackEnd(sessionResource);
        this._voiceState.set("idle", void 0);
        this._statusText.set("Hold to speak...", void 0);
      }
    };
    source.start(0);
  }
  _stopReplay() {
    if (this._replaySourceNode) {
      try {
        this._replaySourceNode.stop();
      } catch {
      }
      this._replaySourceNode = void 0;
    }
  }
  // --- Private helpers ---
  _sendContext() {
    this.voiceClientService.sendSessionContext(this._buildSessionContext());
  }
  /**
   * (Re)arm the settle timer that emits buffered session state changes. Each
   * detected transition resets the timer, so a rapid burst (e.g. the history
   * replay ``thinking <-> idle`` storm) is collapsed to one emission once the
   * state stops changing. See {@link _pendingStateChanges}.
   */
  _scheduleStateChangeEmit() {
    if (this._stateChangeEmitTimer) {
      clearTimeout(this._stateChangeEmitTimer);
    }
    this._stateChangeEmitTimer = setTimeout(() => {
      this._stateChangeEmitTimer = void 0;
      this._emitPendingStateChanges();
    }, VoiceSessionController._STATE_CHANGE_SETTLE_MS);
  }
  /** React to a session reaching a narratable state. If it's the shown session, speak it now; a completed reply on another background session instead shows the sessions-list pending indicator and is read when focused. A new turn (`thinking`) clears both the dedup and any stale pending indicator. */
  _handleNarratableStateChange(sessionId, currentState, detail2, lastResponseSummary, shownNow, confirmationType) {
    const sessionKey = this._sessionKey(sessionId);
    if (currentState === "idle" || currentState === "waiting_for_confirmation") {
      this._cancelVoiceProgress(sessionId);
    }
    if (currentState === "thinking") {
      this._clearLastNarratedText(sessionKey);
      this._clearPendingResponse(sessionKey);
      this._clearDeferred(sessionKey);
    }
    const targetSessionId = this._targetSession.get()?.toString();
    const sessionBoundElsewhere = this._hasDraftTarget.get() || targetSessionId && !this._isSameSession(sessionId, targetSessionId);
    if (!this._isSameSession(sessionId, shownNow)) {
      if (currentState === "idle" && lastResponseSummary) {
        const alreadyRead = this._lastNarratedText.get(sessionKey) === lastResponseSummary;
        const existingSummary = this._pendingResponseSummaries.get(sessionKey);
        if (!alreadyRead && existingSummary !== lastResponseSummary) {
          this._pendingResponseSummaries.set(sessionKey, lastResponseSummary);
          this._markPendingResponse(sessionKey, true);
          this.logService.trace(`[voice] response completed for unfocused session=${sessionKey.slice(-32)}; showing pending indicator`);
        }
      }
      return;
    }
    if (sessionBoundElsewhere) {
      return;
    }
    if (currentState === "idle" && lastResponseSummary) {
      const alreadyNarrated = this._lastNarratedText.get(sessionKey) === lastResponseSummary;
      if (this._hasResponseAudioInFlight(sessionKey)) {
        return;
      } else {
        this._narrate(sessionId, "response", lastResponseSummary);
        if (alreadyNarrated || this._wasResponseHeard(sessionId, lastResponseSummary)) {
          this._clearPendingResponse(sessionKey);
        }
      }
    } else if (currentState === "waiting_for_confirmation" && detail2) {
      this._discardResponsesSupersededByPending(sessionId);
      const question = this._questionNarratable(this._modelForSession(sessionId));
      if (question) {
        this._narrate(sessionId, question.kind, question.text, void 0, void 0, void 0, question.pending);
      } else {
        const pending = this._pendingNarrationReference(this._modelForSession(sessionId));
        const confirmation = { kind: "confirmation", text: detail2, confirmationType, ...pending ? { pending } : {} };
        this._narrate(sessionId, confirmation.kind, confirmation.text, void 0, void 0, confirmation.confirmationType, confirmation.pending);
      }
    }
  }
  /** The resident chat model for a session id, or `undefined` when it isn't loaded (or the id isn't a URI). */
  _modelForSession(sessionId) {
    let resource;
    try {
      resource = URI.parse(sessionId);
    } catch {
      return void 0;
    }
    return this.chatService.getSession(resource);
  }
  /**
   * Flush the coalesced session state changes to the backend and persist only
   * true net changes to the local timeline. {@link _sendContext} rebuilds the
   * full context from the now-settled model state and `_sendDelta` merge-patches
   * against the last-sent snapshot, so an oscillation that returned to its prior
   * state produces no delta. Each buffered change carries the burst's baseline
   * (`fromState`/`fromDetail`); we compare the settled state against it so a
   * net-zero wobble is neither traced nor persisted as a `coding_event` (which
   * would otherwise replay a phantom transition to the backend on reconnect),
   * and a detail change reached via an intermediate state (e.g.
   * `waiting(old) → thinking → waiting(new)`) is still treated as detail-only.
   */
  _emitPendingStateChanges() {
    const changes = [...this._pendingStateChanges.values()];
    this._pendingStateChanges.clear();
    if (changes.length === 0) {
      return;
    }
    const netChanges = [];
    for (const change of changes) {
      const detail2 = change.detail ?? "";
      const summary = change.lastResponseSummary ?? "";
      const stateChanged = change.fromState !== change.currentState;
      const detailOnly = !stateChanged && change.currentState === "waiting_for_confirmation" && (change.fromDetail !== detail2 || change.fromPendingId !== change.pendingId || change.fromConfirmationType !== change.confirmationType);
      const responseSummaryOnly = !stateChanged && change.currentState === "idle" && !!summary && change.fromResponseSummary !== summary;
      if (stateChanged || detailOnly || responseSummaryOnly) {
        netChanges.push({ change, detailOnly });
      }
    }
    if (netChanges.length === 0) {
      this._sendContext();
      return;
    }
    for (const { change, detailOnly } of netChanges) {
      if (detailOnly) {
        this.voiceClientService.invalidateSessionCache(change.sessionId);
      }
    }
    this._sendContext();
    this.voiceClientService.flushSessionContext();
    const shownNow = this._shownSessionId();
    for (const { change } of netChanges) {
      this._handleNarratableStateChange(change.sessionId, change.currentState, change.detail, change.lastResponseSummary, shownNow, change.confirmationType);
    }
    this.logService.trace(`[voice] emitting ${netChanges.length} settled stateChange(s): ${netChanges.map(({ change, detailOnly }) => `${change.label}:${change.currentState}${detailOnly ? " (detail-only)" : ""}`).join(", ")}`);
    for (const { change } of netChanges) {
      this._persistEntry(
        "coding_event",
        `session "${change.label}" \u2192 ${change.currentState}`,
        {
          codingSessionId: change.sessionId,
          codingStatus: change.currentState,
          codingSessionLabel: change.label
        }
      );
    }
  }
  /**
   * Paranoid mitigation for the "confirmation narration not fired while user
   * is on the same session" symptom. Even though the autorun calls
   * `_sendContext + flushSessionContext` at the transition, in practice
   * users observed that the BE-side narration ("I need approval to run X")
   * only fires after they navigate AWAY from the session.
   *
   * As a guarded fallback we schedule a single delayed context re-flush and
   * client-driven narration retry per session that's awaiting confirmation.
   * Backend auto-narration is disabled for this client, so re-sending context
   * alone cannot recover a missed local transition. `_retryPendingNarration`
   * revalidates the exact current occurrence and the common narration path
   * suppresses both in-flight and already-heard duplicates.
   *
   * The watchdog auto-clears once the autorun observes the session has left
   * `waiting_for_confirmation`.
   */
  _armConfirmationFlushWatchdog(sessionId, label3, isTransition) {
    if (this._confirmationFlushWatchdogs.has(sessionId)) {
      return;
    }
    if (isTransition) {
      this.logService.trace(`[voice] arming confirmation flush watchdog id=${sessionId.slice(-32)} label="${label3}"`);
    }
    const timer = setTimeout(() => {
      this._confirmationFlushWatchdogs.delete(sessionId);
      this.logService.trace(`[voice] confirmation flush watchdog firing id=${sessionId.slice(-32)} label="${label3}"`);
      this._sendContext();
      this.voiceClientService.flushSessionContext();
      let resource;
      try {
        resource = URI.parse(sessionId);
      } catch {
        return;
      }
      const narratable = this._currentNarratable(resource);
      if (narratable && narratable.kind !== "response") {
        this._retryPendingNarration(sessionId, narratable);
      }
    }, VoiceSessionController._CONFIRMATION_FLUSH_DELAY_MS);
    this._confirmationFlushWatchdogs.set(sessionId, timer);
  }
  /**
   * Check all sessions for state changes and send notifications to backend.
   * This catches state transitions for sessions without a loaded chat model
   * (which the autorun can't track via observables), and also regular chat
   * sessions that are not agent sessions.
   */
  _checkSessionStateChanges() {
    if (this._deferredResponses.size > 0) {
      const shown = this._shownSessionId();
      if (shown) {
        this._flushDeferredResponse(shown);
      }
    }
    const sessions = this.agentSessionsService.model.sessions.filter((s) => !s.isArchived());
    const stateChanges = [];
    const processedResources = /* @__PURE__ */ new Set();
    const waitingSessionIds = /* @__PURE__ */ new Set();
    for (const s of sessions) {
      processedResources.add(s.resource.toString());
      const sessionId = s.resource.toString();
      const model = this.chatService.getSession(s.resource);
      let currentState;
      let detail2;
      let confirmationType;
      let lastResponseSummary;
      if (model) {
        const info = this._getAgentStateInfo(model);
        currentState = this._effectiveResidentState(sessionId, info);
        detail2 = info.detail;
        confirmationType = info.confirmation_type;
        lastResponseSummary = currentState === info.state ? info.last_response_summary : void 0;
        this._cacheResponseSummary(sessionId, info.state, info.last_response_summary);
        if (currentState === info.state) {
          this._pendingIdleNarration.delete(sessionId);
        }
      } else {
        currentState = s.status === 2 /* InProgress */ ? "thinking" : s.status === 3 /* NeedsInput */ ? "waiting_for_confirmation" : s.status === 1 /* Completed */ ? "idle" : "unknown";
        this._cacheResponseSummary(sessionId, currentState, void 0);
        if (s.status === 3 /* NeedsInput */) {
          this._ensureModelLoaded(s.resource);
        }
      }
      const prev = this._prevSessionStates.get(sessionId);
      const isStateChange = prev !== void 0 && prev.state !== currentState && currentState !== "unknown";
      const pendingId = currentState === "waiting_for_confirmation" ? this._pendingIdFor(sessionId) : "";
      const isDetailChange = !isStateChange && prev !== void 0 && currentState === "waiting_for_confirmation" && ((detail2 ?? "") !== prev.detail || pendingId !== prev.pendingId || confirmationType !== prev.confirmationType);
      if (isStateChange && currentState === "thinking" && !this._eagerModelLoading.has(sessionId)) {
        this._sessionsAwaitingResponseSummary.add(sessionId);
      }
      if (!model && currentState === "idle" && isStateChange) {
        const cachedSummary = this._lastResponseSummaryById.get(sessionId);
        if (!cachedSummary) {
          this._deferIdleNarrationUntilModelLoaded(s.resource);
          continue;
        }
        lastResponseSummary = cachedSummary;
      }
      const normalizedSummary = lastResponseSummary ?? "";
      const isResponseSummaryChange = !isStateChange && prev !== void 0 && currentState === "idle" && !!normalizedSummary && normalizedSummary !== prev.lastResponseSummary && this._sessionsAwaitingResponseSummary.has(sessionId);
      if (isStateChange && currentState === "idle" && !!normalizedSummary || isResponseSummaryChange) {
        this._sessionsAwaitingResponseSummary.delete(sessionId);
      }
      if (isStateChange || isDetailChange || isResponseSummaryChange) {
        const cancelExpiry = this._userCancelledSessions.get(sessionId);
        if (cancelExpiry) {
          clearTimeout(cancelExpiry);
          this._userCancelledSessions.delete(sessionId);
        } else {
          if (isDetailChange) {
            this.voiceClientService.invalidateSessionCache(sessionId);
          }
          stateChanges.push({ sessionId, currentState, label: s.label || "Untitled session", detail: detail2, confirmationType, lastResponseSummary });
        }
      }
      if (currentState !== "unknown") {
        const rememberedSummary = normalizedSummary || this._lastResponseSummaryById.get(sessionId) || prev?.lastResponseSummary || "";
        this._prevSessionStates.set(sessionId, { state: currentState, detail: detail2 ?? "", pendingId, confirmationType, lastResponseSummary: rememberedSummary });
      }
      if (currentState === "waiting_for_confirmation") {
        waitingSessionIds.add(sessionId);
      }
    }
    for (const chatModel of this.chatService.chatModels.get()) {
      const key3 = chatModel.sessionResource.toString();
      if (processedResources.has(key3)) {
        continue;
      }
      if (chatModel.getRequests().length === 0) {
        continue;
      }
      const info = this._getAgentStateInfo(chatModel);
      const currentState = info.state;
      const detail2 = info.detail;
      const confirmationType = info.confirmation_type;
      const lastResponseSummary = info.last_response_summary;
      const prev = this._prevSessionStates.get(key3);
      const isStateChange = prev !== void 0 && prev.state !== currentState && currentState !== "unknown";
      const pendingId = currentState === "waiting_for_confirmation" ? this._pendingIdFor(key3) : "";
      const isDetailChange = !isStateChange && prev !== void 0 && currentState === "waiting_for_confirmation" && ((detail2 ?? "") !== prev.detail || pendingId !== prev.pendingId || confirmationType !== prev.confirmationType);
      if (isStateChange && currentState === "thinking" && !this._eagerModelLoading.has(key3)) {
        this._sessionsAwaitingResponseSummary.add(key3);
      }
      const normalizedSummary = lastResponseSummary ?? "";
      const isResponseSummaryChange = !isStateChange && prev !== void 0 && currentState === "idle" && !!normalizedSummary && normalizedSummary !== prev.lastResponseSummary && this._sessionsAwaitingResponseSummary.has(key3);
      if (isStateChange && currentState === "idle" && !!normalizedSummary || isResponseSummaryChange) {
        this._sessionsAwaitingResponseSummary.delete(key3);
      }
      if (isStateChange || isDetailChange || isResponseSummaryChange) {
        if (isDetailChange) {
          this.voiceClientService.invalidateSessionCache(key3);
        }
        stateChanges.push({ sessionId: key3, currentState, label: chatModel.title || "Chat", detail: detail2, confirmationType, lastResponseSummary });
      }
      if (currentState !== "unknown") {
        const rememberedSummary = normalizedSummary || this._lastResponseSummaryById.get(key3) || prev?.lastResponseSummary || "";
        this._prevSessionStates.set(key3, { state: currentState, detail: detail2 ?? "", pendingId, confirmationType, lastResponseSummary: rememberedSummary });
      }
      if (currentState === "waiting_for_confirmation") {
        waitingSessionIds.add(key3);
      }
    }
    this._reconcileConfirmationIndicators(waitingSessionIds);
    if (stateChanges.length > 0) {
      this.logService.trace(`[voice] onDidChangeSessions detected ${stateChanges.length} state change(s): ${stateChanges.map((c) => `${c.label}: ${c.currentState}`).join(", ")}`);
      this._sendContext();
      this.voiceClientService.flushSessionContext();
    }
    const shownNow = this._shownSessionId();
    for (const change of stateChanges) {
      this._handleNarratableStateChange(change.sessionId, change.currentState, change.detail, change.lastResponseSummary, shownNow, change.confirmationType);
    }
    if (stateChanges.length > 0) {
      for (const change of stateChanges) {
        this._persistEntry(
          "coding_event",
          `session "${change.label}" \u2192 ${change.currentState}`,
          {
            codingSessionId: change.sessionId,
            codingStatus: change.currentState,
            codingSessionLabel: change.label
          }
        );
      }
    }
  }
  /**
   * Scope confirmations to the active session before reporting to the backend.
   *
   * Only the active (focused/target) session's `waiting_for_confirmation` state
   * is reported as such; any OTHER session awaiting confirmation is downgraded
   * to `thinking` (and its confirmation detail dropped). This does two things:
   *
   *  1. The backend only ever sees a single confirmation, so it never asks the
   *     user "which one do you want me to approve?".
   *  2. When the user focuses a session that was awaiting confirmation while
   *     unfocused, `_buildSessionContext` starts reporting it as
   *     `waiting_for_confirmation`. The backend observes the fresh
   *     `thinking -> waiting_for_confirmation` transition and narrates the
   *     confirmation at that moment (the "read it out on focus" behaviour).
   *
   * The sessions-list pending indicator for the unfocused confirmation is
   * driven separately from client-observed state (_reconcileConfirmationIndicators),
   * so it stays accurate even though the backend isn't told about it.
   */
  _reportedAgentState(realState, isActive2) {
    if (realState === "waiting_for_confirmation" && !isActive2) {
      return { state: "thinking", hideConfirmationDetail: true };
    }
    return { state: realState, hideConfirmationDetail: false };
  }
  _getInputContext(model) {
    const state = model.inputModel?.state?.get();
    const selectedModel = state?.selectedModel ?? this.chatWidgetService.getWidgetBySessionResource(model.sessionResource)?.inputPart.selectedLanguageModel.get();
    const attachmentNames = state?.attachments.filter(isExplicitFileOrImageVariableEntry).map((attachment) => attachment.name).filter((name) => name.length > 0) ?? [];
    return {
      ...selectedModel ? {
        selected_model: {
          identifier: selectedModel.identifier,
          name: selectedModel.metadata.name,
          vendor: selectedModel.metadata.vendor
        }
      } : {},
      ...attachmentNames.length > 0 ? {
        attachment_names: attachmentNames.slice(0, 10),
        attachment_count: attachmentNames.length
      } : {}
    };
  }
  _hasSessionInProgress() {
    const activeSessionId = this._getActiveSessionId();
    if (!activeSessionId) {
      return false;
    }
    const session = this.agentSessionsService.model.sessions.find(
      (session2) => !session2.isArchived() && session2.resource.toString() === activeSessionId
    );
    if (session) {
      const model = this.chatService.getSession(session.resource);
      return session.status === 2 /* InProgress */ || model !== void 0 && this._getAgentStateInfo(model).state === "thinking";
    }
    for (const model of this.chatService.chatModels.get()) {
      if (model.sessionResource.toString() === activeSessionId) {
        return this._getAgentStateInfo(model).state === "thinking";
      }
    }
    return false;
  }
  _buildSessionContext() {
    const oneHourAgo = Date.now() - 60 * 60 * 1e3;
    const sessions = this.agentSessionsService.model.sessions.filter((s) => {
      if (s.isArchived()) {
        return false;
      }
      if (s.status === 2 /* InProgress */ || s.status === 3 /* NeedsInput */) {
        return true;
      }
      if (s.status === 1 /* Completed */) {
        const endedAt = s.timing.lastRequestEnded ?? s.timing.created;
        return endedAt !== void 0 && endedAt > oneHourAgo;
      }
      return false;
    });
    const targetSessionId = this._getActiveSessionId();
    const sessionList = sessions.map((s) => {
      const model = this.chatService.getSession(s.resource);
      const isActive2 = s.resource.toString() === targetSessionId;
      if (!model) {
        const sessionIdStr = s.resource.toString();
        let fallbackState = s.status === 2 /* InProgress */ ? "thinking" : s.status === 3 /* NeedsInput */ ? "waiting_for_confirmation" : s.status === 1 /* Completed */ ? "idle" : "unknown";
        if (fallbackState === "idle" && this._pendingIdleNarration.has(sessionIdStr) && !this._lastResponseSummaryById.has(sessionIdStr)) {
          const prev = this._prevSessionStates.get(sessionIdStr);
          if (prev?.state) {
            fallbackState = prev.state;
          }
        }
        if (fallbackState === "waiting_for_confirmation") {
          this._ensureModelLoaded(s.resource);
          fallbackState = "thinking";
        }
        const scoped2 = this._reportedAgentState(fallbackState, isActive2);
        const cachedSummary = fallbackState === "idle" ? this._lastResponseSummaryById.get(sessionIdStr) : void 0;
        return {
          id: sessionIdStr,
          ...s.label ? { label: s.label } : {},
          session_type: "agent",
          is_active: isActive2,
          agent_state: scoped2.state,
          ...cachedSummary ? { last_response_summary: cachedSummary } : {}
        };
      }
      const stateInfo = this._getAgentStateInfo(model);
      this._cacheResponseSummary(s.resource.toString(), stateInfo.state, stateInfo.last_response_summary);
      const detailPending = stateInfo.state === "waiting_for_confirmation" && !stateInfo.detail;
      const heldState = this._effectiveResidentState(s.resource.toString(), stateInfo);
      const scoped = detailPending ? { state: "thinking", hideConfirmationDetail: true } : this._reportedAgentState(heldState, isActive2);
      const shipSummary = heldState === stateInfo.state ? stateInfo.last_response_summary : void 0;
      const pending = this._buildPendingPayload(model);
      return {
        id: s.resource.toString(),
        ...s.label ? { label: s.label } : {},
        session_type: "agent",
        is_active: isActive2,
        agent_state: scoped.state,
        ...!scoped.hideConfirmationDetail && stateInfo.detail ? { agent_state_detail: stateInfo.detail } : {},
        ...!scoped.hideConfirmationDetail && stateInfo.confirmation_type ? { confirmation_type: stateInfo.confirmation_type } : {},
        ...shipSummary ? { last_response_summary: shipSummary } : {},
        ...pending ? { pending } : {},
        ...this._getInputContext(model)
      };
    });
    const agentResources = new Set(this.agentSessionsService.model.sessions.map((s) => s.resource.toString()));
    for (const chatModel of this.chatService.chatModels.get()) {
      const key3 = chatModel.sessionResource.toString();
      if (agentResources.has(key3)) {
        continue;
      }
      if (chatModel.getRequests().length === 0) {
        continue;
      }
      const stateInfo = this._getAgentStateInfo(chatModel);
      if (stateInfo.state === "idle") {
        const lastActive = chatModel.lastMessageDate;
        if (lastActive < oneHourAgo) {
          continue;
        }
      }
      const isActive2 = key3 === targetSessionId;
      const scoped = this._reportedAgentState(stateInfo.state, isActive2);
      const pending = this._buildPendingPayload(chatModel);
      sessionList.push({
        id: key3,
        ...chatModel.title ? { label: chatModel.title } : {},
        session_type: "chat",
        is_active: isActive2,
        agent_state: scoped.state,
        ...!scoped.hideConfirmationDetail && stateInfo.detail ? { agent_state_detail: stateInfo.detail } : {},
        ...!scoped.hideConfirmationDetail && stateInfo.confirmation_type ? { confirmation_type: stateInfo.confirmation_type } : {},
        ...stateInfo.last_response_summary ? { last_response_summary: stateInfo.last_response_summary } : {},
        ...pending ? { pending } : {},
        ...this._getInputContext(chatModel)
      });
    }
    return {
      sessions: sessionList,
      display_locale: this._window?.navigator.language || "en-US"
    };
  }
  /**
   * Eagerly load a chat model for a session that needs input but hasn't been
   * opened in the UI yet. Once loaded, the autorun observables will re-fire
   * with full confirmation detail so the backend can narrate properly.
   */
  _ensureModelLoaded(resource) {
    const key3 = resource.toString();
    if (this._eagerModelRefs.has(key3) || this._eagerModelLoading.has(key3) || this.chatService.getSession(resource)) {
      return;
    }
    if (this.agentSessionsService.model.getSession(resource)?.metadata?.[SESSION_META_EHCLI_ADOPTABLE_KEY] === true) {
      return;
    }
    this.logService.trace(`[voice] eagerly loading model for session ${key3.slice(-32)}`);
    this._eagerModelLoading.add(key3);
    const cts = new CancellationTokenSource();
    this.chatService.acquireOrLoadSession(resource, "panel" /* Chat */, cts.token, "VoiceSessionController#eagerLoad").then((ref) => {
      this._eagerModelLoading.delete(key3);
      if (ref) {
        const existing = this._eagerModelRefs.get(key3);
        if (!this._isConnected.get() || existing) {
          ref.dispose();
          if (!this._isConnected.get()) {
            this._pendingIdleNarration.delete(key3);
          }
        } else {
          this._eagerModelRefs.set(key3, ref);
          this._checkSessionStateChanges();
          this._sendContext();
          this.voiceClientService.flushSessionContext();
          if (this._shownSessionId() === key3) {
            this._activateShownSession(resource);
          }
        }
      } else {
        this._pendingIdleNarration.delete(key3);
      }
      cts.dispose();
    }, () => {
      this._eagerModelLoading.delete(key3);
      this._pendingIdleNarration.delete(key3);
      cts.dispose();
    });
  }
  /**
   * Defer narrating a session's ``idle`` transition until its chat model is
   * resident, so the narration can include ``last_response_summary``. Remote/
   * Copilot sessions don't keep their model loaded, so without this the
   * backend would only ever see a summary-less completion. Eagerly loads the
   * model; once it resolves the autorun re-fires and narrates with the summary.
   */
  _deferIdleNarrationUntilModelLoaded(resource) {
    this._pendingIdleNarration.add(resource.toString());
    this._ensureModelLoaded(resource);
  }
  /**
   * Cache (or invalidate) a session's response summary based on the current
   * state observed from its resident model. Called wherever a resident model's
   * state is computed so the summary survives the model's disposal.
   * - `idle` with a summary → cache it (the completed reply).
   * - `thinking` → a new turn started; drop the stale summary so a later
   *   completion never narrates the previous reply.
   */
  _cacheResponseSummary(sessionId, state, summary) {
    if (state === "idle" && summary) {
      this._lastResponseSummaryById.set(sessionId, summary);
    } else if (state === "thinking") {
      this._lastResponseSummaryById.delete(sessionId);
    }
  }
  /**
   * Drop per-session caches for sessions no longer in the tracked set, so a
   * long-lived voice connection doesn't retain summaries/state for archived,
   * removed, or disposed sessions that will never be narrated again.
   */
  _pruneSessionCaches(liveSessionIds) {
    for (const id2 of this._lastResponseSummaryById.keys()) {
      if (!liveSessionIds.has(id2)) {
        this._lastResponseSummaryById.delete(id2);
      }
    }
    for (const id2 of this._lastNarratedText.keys()) {
      if (!liveSessionIds.has(id2)) {
        this._lastNarratedText.delete(id2);
      }
    }
    for (const id2 of Array.from(this._sessionsAwaitingResponseSummary)) {
      if (!liveSessionIds.has(id2)) {
        this._sessionsAwaitingResponseSummary.delete(id2);
      }
    }
    for (const id2 of [...this._pendingResponseSummaries.keys()]) {
      if (!liveSessionIds.has(id2)) {
        this._clearPendingResponse(id2);
      }
    }
  }
  /**
   * The state to report for a resident model, applying the idle-narration hold.
   *
   * When a completion is detected for an unfocused session we eagerly reload
   * its (disposed) model to recover ``last_response_summary``. That reloaded
   * model is briefly resident with an EMPTY response while its history is still
   * replaying, so reporting its bare ``idle`` now would ship a summary-less
   * completion (which the backend never narrates) AND consume the ``idle``
   * transition before the summary exists. While the eager load is still in
   * flight we therefore hold — report the prior state — so the ``idle`` isn't
   * shipped until it can carry the summary. The load always resolves (its
   * callback clears ``_eagerModelLoading``), so the hold can never last forever.
   */
  _effectiveResidentState(sessionId, stateInfo) {
    if (stateInfo.state === "idle" && !stateInfo.last_response_summary && this._pendingIdleNarration.has(sessionId) && this._eagerModelLoading.has(sessionId)) {
      const prev = this._prevSessionStates.get(sessionId);
      return prev?.state ?? "thinking";
    }
    return stateInfo.state;
  }
  _visibleConfirmationText(value2, maxLength = VoiceSessionController._MAX_CONFIRMATION_FIELD_CHARS) {
    if (!value2) {
      return "";
    }
    const plainText = renderAsPlaintext(typeof value2 === "string" ? { value: value2 } : value2, { useLinkFormatter: true }).replace(/\s+/g, " ").trim();
    if (plainText.length <= maxLength) {
      return plainText;
    }
    const prefix = plainText.slice(0, maxLength - 3);
    const wordBoundary = prefix.lastIndexOf(" ");
    const truncated = wordBoundary > Math.floor(maxLength * 0.6) ? prefix.slice(0, wordBoundary) : prefix;
    return localize(11790, null, truncated);
  }
  _boundedConfirmationLines(lines, fallback2) {
    const result = [];
    for (const line of lines.filter(Boolean)) {
      const candidate = [...result, line].join("\n");
      if (candidate.length > VoiceSessionController._MAX_CONFIRMATION_NARRATION_CHARS) {
        break;
      }
      result.push(line);
    }
    return result.join("\n") || fallback2;
  }
  _visibleQuestionnaireFromCarousel(carousel, includeDetails) {
    return {
      context: carousel.message,
      questions: carousel.questions.map((question) => ({
        prompt: question.message ?? (question.title !== question.id ? question.title : void 0),
        details: includeDetails ? question.description ?? question.detailedMessage : void 0,
        options: (question.options ?? []).map((option2) => option2.label),
        allowFreeformInput: question.allowFreeformInput !== false
      }))
    };
  }
  _visibleQuestionnaireFromToolInvocation(toolInvocation) {
    if (!isPendingVoiceQuestionnaireInvocation(toolInvocation)) {
      return void 0;
    }
    const state = toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.WaitingForConfirmation && state.type !== IChatToolInvocation.StateKind.WaitingForPostApproval) {
      return void 0;
    }
    const parameters = state.parameters;
    if (!isObject(parameters) || !hasOwn(parameters, "questions") || !Array.isArray(parameters.questions) || parameters.questions.length === 0) {
      return void 0;
    }
    return {
      questions: parameters.questions.map((rawQuestion) => {
        if (!isObject(rawQuestion)) {
          return { options: [], allowFreeformInput: true };
        }
        const prompt = hasOwn(rawQuestion, "question") && typeof rawQuestion.question === "string" ? rawQuestion.question : void 0;
        const options3 = [];
        if (hasOwn(rawQuestion, "options") && Array.isArray(rawQuestion.options)) {
          for (const rawOption of rawQuestion.options) {
            if (!isObject(rawOption) || !hasOwn(rawOption, "label") || typeof rawOption.label !== "string") {
              continue;
            }
            const description = hasOwn(rawOption, "description") && typeof rawOption.description === "string" ? rawOption.description : void 0;
            options3.push(description ? `${rawOption.label} - ${description}` : rawOption.label);
          }
        }
        const allowFreeformInput = !(hasOwn(rawQuestion, "allowFreeformInput") && rawQuestion.allowFreeformInput === false);
        return { prompt, options: options3, allowFreeformInput };
      })
    };
  }
  _formatQuestionnaireNarration(questionnaire) {
    const fallback2 = localize(11806, null);
    if (questionnaire.questions.length === 0) {
      return void 0;
    }
    const lines = [
      questionnaire.questions.length === 1 ? localize(11815, null) : localize(11810, null, questionnaire.questions.length)
    ];
    const context2 = this._visibleConfirmationText(questionnaire.context, 220);
    if (context2) {
      lines.push(localize(11803, null, context2));
    }
    let includedQuestions = 0;
    const questionLimit = Math.min(questionnaire.questions.length, VoiceSessionController._MAX_QUESTIONNAIRE_QUESTIONS);
    for (let index2 = 0; index2 < questionLimit; index2++) {
      const question = questionnaire.questions[index2];
      const prompt = this._visibleConfirmationText(question.prompt);
      const questionLines = [
        localize(11814, null, index2 + 1, prompt || fallback2)
      ];
      const description = this._visibleConfirmationText(question.details, 180);
      if (description && description !== prompt) {
        questionLines.push(localize(11805, null, description));
      }
      const visibleOptions = question.options.map((option2) => this._visibleConfirmationText(option2, 160)).filter(Boolean);
      if (visibleOptions.length > 0) {
        const includedOptions = visibleOptions.slice(0, VoiceSessionController._MAX_QUESTIONNAIRE_OPTIONS);
        const omittedOptions = visibleOptions.length - includedOptions.length;
        let optionsText = includedOptions.join("; ");
        if (omittedOptions > 0) {
          optionsText = localize(11809, null, optionsText, omittedOptions);
        }
        if (question.allowFreeformInput) {
          optionsText = localize(11804, null, optionsText);
        }
        questionLines.push(localize(11813, null, optionsText));
      } else {
        questionLines.push(localize(11807, null));
      }
      const remainingAfterCandidate = questionnaire.questions.length - (includedQuestions + 1);
      const reservedSuffix = remainingAfterCandidate > 0 ? remainingAfterCandidate === 1 ? localize(11811, null) : localize(11808, null, remainingAfterCandidate) : localize(11812, null);
      const candidate = [...lines, ...questionLines, reservedSuffix].join("\n");
      if (candidate.length > VoiceSessionController._MAX_CONFIRMATION_NARRATION_CHARS) {
        break;
      }
      lines.push(...questionLines);
      includedQuestions++;
    }
    const omittedQuestions = questionnaire.questions.length - includedQuestions;
    if (omittedQuestions > 0) {
      lines.push(omittedQuestions === 1 ? localize(11811, null) : localize(11808, null, omittedQuestions));
    } else {
      lines.push(localize(11812, null));
    }
    return lines.join("\n") || fallback2;
  }
  _formatChoiceLabels(choices) {
    const visibleChoices = choices.map((choice) => {
      const label3 = this._visibleConfirmationText(choice.label, 160);
      const description = this._visibleConfirmationText(choice.description, 160);
      return description ? localize(11785, null, label3, description) : label3;
    }).filter(Boolean);
    if (visibleChoices.length === 0) {
      return void 0;
    }
    const includedChoices = visibleChoices.slice(0, VoiceSessionController._MAX_QUESTIONNAIRE_OPTIONS);
    const omittedChoices = visibleChoices.length - includedChoices.length;
    const text2 = includedChoices.join("; ");
    return omittedChoices > 0 ? localize(11788, null, text2, omittedChoices) : text2;
  }
  _formatPlanNarration(plan) {
    const fallback2 = localize(11800, null);
    const title = this._visibleConfirmationText(plan.title) || fallback2;
    const lines = [localize(11802, null, title)];
    const choices = this._formatChoiceLabels(plan.actions);
    if (choices) {
      lines.push(localize(11799, null, choices));
    }
    lines.push(localize(11801, null));
    return this._boundedConfirmationLines(lines, fallback2);
  }
  _formatElicitationNarration(elicitation) {
    const fallback2 = localize(11792, null);
    const title = this._visibleConfirmationText(elicitation.title);
    const message = this._visibleConfirmationText(elicitation.message);
    const subtitle = this._visibleConfirmationText(elicitation.subtitle);
    const lines = [localize(11793, null, title || message || fallback2)];
    if (subtitle && subtitle !== title) {
      lines.push(subtitle);
    }
    if (message && message !== title) {
      lines.push(message);
    }
    const choices = this._formatChoiceLabels([
      { label: elicitation.acceptButtonLabel },
      ...elicitation.rejectButtonLabel ? [{ label: elicitation.rejectButtonLabel }] : [],
      ...(elicitation.moreActions ?? []).map((action) => ({ label: action.label }))
    ]);
    if (choices) {
      lines.push(localize(11791, null, choices));
    }
    return this._boundedConfirmationLines(lines, fallback2);
  }
  _formatConfirmationNarration(confirmation) {
    const fallback2 = localize(11787, null);
    const title = this._visibleConfirmationText(confirmation.title);
    const message = this._visibleConfirmationText(confirmation.message);
    const lines = [localize(11789, null, title || message || fallback2)];
    if (message && message !== title) {
      lines.push(message);
    }
    const choices = this._formatChoiceLabels((confirmation.buttons ?? []).map((label3) => ({ label: label3 })));
    if (choices) {
      lines.push(localize(11786, null, choices));
    }
    return this._boundedConfirmationLines(lines, fallback2);
  }
  _formatToolNarration(toolInvocation) {
    const fallback2 = localize(11828, null);
    const state = toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.WaitingForConfirmation && state.type !== IChatToolInvocation.StateKind.WaitingForPostApproval) {
      return fallback2;
    }
    const messages = state.confirmationMessages;
    const title = this._visibleConfirmationText(messages?.title) || this._visibleConfirmationText(toolInvocation.invocationMessage);
    const message = this._visibleConfirmationText(messages?.message);
    const lines = [localize(11829, null, title || message || fallback2)];
    const command4 = getVoiceToolApprovalCommand(toolInvocation, false);
    if (command4) {
      lines.push(localize(11827, null, command4));
    }
    if (message && message !== title) {
      lines.push(message);
    }
    return this._boundedConfirmationLines(lines, fallback2);
  }
  _formatToolNarrationFallback() {
    const fallback2 = localize(11828, null);
    return localize(11829, null, fallback2);
  }
  _formatToolAuthenticationNarration(toolInvocation) {
    const state = toolInvocation.state.get();
    if (state.type !== IChatToolInvocation.StateKind.WaitingForAuthentication) {
      return void 0;
    }
    const serverName = this._visibleConfirmationText(state.server.name);
    const fallback2 = localize(11781, null);
    return this._boundedConfirmationLines([
      localize(11783, null),
      serverName ? localize(11782, null, serverName) : fallback2,
      localize(11780, null)
    ], fallback2);
  }
  _selectPendingPart(model) {
    const lastRequest2 = model?.getRequests().at(-1);
    const parts = lastRequest2?.response?.response.value;
    if (!lastRequest2 || !parts) {
      return void 0;
    }
    for (const part of parts) {
      if (part.kind === "toolInvocation" && this._isOpenPendingPart(part)) {
        derivePendingId(lastRequest2.id, part, this._store);
      }
    }
    for (let index2 = 0; index2 < parts.length; index2++) {
      const part = parts[index2];
      const type = getVoiceConfirmationType([part]);
      if (type && this._isOpenPendingPart(part)) {
        if (part.kind === "toolInvocation") {
          const pendingId = derivePendingId(lastRequest2.id, part, this._store);
          if (isPendingIdResolved(pendingId)) {
            continue;
          }
        }
        if (type === "questionnaire" && isVoiceQuestionnaireInvocation(part)) {
          const carousel = parts.slice(index2 + 1).find((candidate) => candidate.kind === "questionCarousel" && candidate.resolveId === part.toolCallId && this._isOpenPendingPart(candidate));
          if (carousel) {
            return { requestId: lastRequest2.id, type, part: carousel };
          }
        }
        return { requestId: lastRequest2.id, type, part };
      }
    }
    return void 0;
  }
  _isOpenPendingPart(part) {
    if (part.kind === "questionCarousel") {
      return !part.isUsed && !part.answeredExternally;
    }
    if (part.kind === "elicitation2") {
      return part.state.get() === "pending";
    }
    if (part.kind === "planReview" || part.kind === "confirmation") {
      return !part.isUsed;
    }
    if (part.kind === "toolInvocation") {
      const state = part.state.get();
      return state.type === IChatToolInvocation.StateKind.WaitingForConfirmation || state.type === IChatToolInvocation.StateKind.WaitingForPostApproval || state.type === IChatToolInvocation.StateKind.WaitingForAuthentication;
    }
    return false;
  }
  _getPendingConfirmationInfo(model) {
    const lastResponse = model.getRequests().at(-1)?.response;
    if (!lastResponse) {
      return void 0;
    }
    const parts = lastResponse.response.value;
    const selected = this._selectPendingPart(model);
    if (!selected) {
      return void 0;
    }
    const { type, part } = selected;
    const askQuestionsCallIds = new Set(parts.filter(isVoiceQuestionnaireInvocation).map((part2) => part2.toolCallId));
    if (type === "questionnaire" && part?.kind === "questionCarousel") {
      const includeDetails = !part.resolveId || !askQuestionsCallIds.has(part.resolveId);
      return { type, detail: this._formatQuestionnaireNarration(this._visibleQuestionnaireFromCarousel(part, includeDetails)) };
    }
    if (type === "questionnaire" && part?.kind === "toolInvocation") {
      const questionnaire = this._visibleQuestionnaireFromToolInvocation(part);
      if (questionnaire) {
        return { type, detail: this._formatQuestionnaireNarration(questionnaire) };
      }
    }
    if (type === "elicitation" && part?.kind === "elicitation2") {
      return { type, detail: this._formatElicitationNarration(part) };
    }
    if (type === "plan" && part?.kind === "planReview") {
      return { type, detail: this._formatPlanNarration(part) };
    }
    if (type === "tool" && part?.kind === "toolInvocation") {
      return { type, detail: this._formatToolNarration(part) };
    }
    if (type === "generic" && part?.kind === "confirmation") {
      return { type, detail: this._formatConfirmationNarration(part) };
    }
    if (type === "generic" && part?.kind === "toolInvocation") {
      return { type, detail: this._formatToolAuthenticationNarration(part) };
    }
    if (type === "questionnaire") {
      return { type };
    }
    return { type, detail: this._formatToolNarrationFallback() };
  }
  _getAgentStateInfo(model) {
    if (!model) {
      return { state: "unknown" };
    }
    const lastRequest2 = model.getRequests().at(-1);
    if (lastRequest2?.response?.isCanceled) {
      return { state: "idle" };
    }
    const pendingConfirmation = lastRequest2?.response?.isPendingConfirmation.get();
    const hasResolvedPendingToolApproval = pendingConfirmation && this._hasResolvedPendingToolApproval(model);
    const confirmation = hasResolvedPendingToolApproval ? void 0 : this._getPendingConfirmationInfo(model);
    if (confirmation || pendingConfirmation && !hasResolvedPendingToolApproval) {
      return {
        state: "waiting_for_confirmation",
        ...confirmation?.detail ? { detail: confirmation.detail } : !confirmation ? { detail: this._formatToolNarrationFallback() } : {},
        confirmation_type: confirmation?.type ?? "generic"
      };
    }
    const incomplete = lastRequest2?.response?.isIncomplete.get() ?? false;
    if (incomplete) {
      return { state: "thinking" };
    }
    const responseText = [
      lastRequest2?.response?.response.getMarkdown().trim(),
      lastRequest2?.response?.result?.errorDetails?.message.trim()
    ].filter((value2) => !!value2).join("\n\n");
    return { state: "idle", ...responseText ? { last_response_summary: responseText } : {} };
  }
  _hasResolvedPendingToolApproval(model) {
    const request2 = model.getRequests().at(-1);
    for (const part of request2?.response?.response.value ?? []) {
      if (part.kind !== "toolInvocation" || !this._isOpenPendingPart(part)) {
        continue;
      }
      if (restoreResolvedPendingId(request2.id, part, this._store)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Describe what a session is waiting on, structurally.
   *
   * `_getAgentStateInfo` flattens the same state into `agent_state_detail`,
   * which is fine to *say* but cannot be *acted on*: a form becomes
   * `questions: <titles>`, losing the options, their values and the ids. This
   * returns what the backend needs to route an answer back to the exact part.
   *
   * Uses the same typed pending selection as narration, so the backend never
   * receives an id for a different action than the one the user heard.
   */
  _buildPendingPayload(model) {
    const selected = this._selectPendingPart(model);
    if (!selected || selected.type !== "questionnaire" && selected.type !== "plan" && selected.type !== "tool") {
      return void 0;
    }
    const { requestId, type, part } = selected;
    const routing = () => ({ pending_id: derivePendingId(requestId, part, this._store), request_id: requestId });
    if (type === "questionnaire" && part.kind === "questionCarousel") {
      const carousel = part;
      if (carousel.answeredExternally || carousel.questions.length === 0) {
        return void 0;
      }
      return {
        type: "questions",
        ...routing(),
        allow_skip: carousel.allowSkip === true,
        ...carousel.message ? { message: this._plainText(carousel.message) } : {},
        questions: carousel.questions.map((question) => ({
          id: question.id,
          type: question.type,
          title: this._plainText(getDisplayedQuestionText(question)),
          allow_freeform: question.allowFreeformInput !== false,
          options: getOptionsWithDefaultsFirst(question).map(({ option: option2 }) => ({
            label: option2.label,
            value: option2.value
          }))
        }))
      };
    }
    if (type === "plan" && part.kind === "planReview") {
      return { type: "approval", ...routing(), message: this._formatPlanNarration(part) };
    }
    if (type === "tool" && part.kind === "toolInvocation") {
      return { type: "approval", ...routing(), message: this._formatToolNarration(part) };
    }
    return void 0;
  }
  _plainText(value2) {
    if (!value2) {
      return "";
    }
    return typeof value2 === "string" ? value2 : value2.value;
  }
  _classifyPendingType(response) {
    let result = "input";
    for (const part of response.response.value) {
      if (part.kind === "toolInvocation") {
        const invocation = part;
        const state = invocation.state.get();
        if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation || state.type === IChatToolInvocation.StateKind.WaitingForPostApproval) {
          result = "approval";
        }
      }
      if (part.kind === "confirmation" && !part.isUsed) {
        result = "approval";
      }
      if (part.kind === "questionCarousel" && !part.isUsed) {
        result = "input";
      }
      if (part.kind === "planReview" && !part.isUsed) {
        result = "input";
      }
      if (part.kind === "elicitation2") {
        result = "input";
      }
    }
    return result;
  }
  _getConfirmationDescription(response) {
    let desc = "";
    for (const part of response.response.value) {
      if (part.kind === "toolInvocation") {
        const invocation = part;
        const state = invocation.state.get();
        if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation) {
          const params = state.parameters;
          const command4 = params?.["command"] ?? params?.["input"];
          const explanation = params?.["explanation"] ?? params?.["goal"];
          if (typeof command4 === "string" && command4) {
            desc = typeof explanation === "string" ? `${command4} \u2014 ${explanation}` : command4;
          }
        }
      } else if (part.kind === "questionCarousel" && !part.isUsed) {
        const carousel = part;
        const titles = (carousel.questions ?? []).map((q) => q.title).filter(Boolean);
        if (titles.length > 0) {
          desc = titles.join(", ");
        } else {
          const msg = carousel.message;
          desc = msg ? typeof msg === "string" ? msg : msg.value : "asking clarifying questions";
        }
      } else if (part.kind === "elicitation2") {
        const elicitation = part;
        if (elicitation.state.get() === "pending") {
          const title = elicitation.title;
          desc = title ? typeof title === "string" ? title : title.value : "needs input";
        }
      } else if (part.kind === "planReview" && !part.isUsed) {
        desc = "review the plan to continue";
      } else if (part.kind === "confirmation" && !part.isUsed) {
        desc = part.title ?? "needs approval";
      }
    }
    return desc;
  }
  _autoApproveCheck() {
    if (this._autoApprovedSessions.size === 0) {
      return;
    }
    const sessions = this.agentSessionsService.model.sessions.filter((s) => !s.isArchived());
    for (const s of sessions) {
      if (!this._autoApprovedSessions.has(s.resource.toString())) {
        continue;
      }
      const model = this.chatService.getSession(s.resource);
      if (!model) {
        continue;
      }
      this._autoApprovePendingTools(model);
    }
  }
  _autoApprovePendingTools(model) {
    for (const request2 of model.getRequests()) {
      const response = request2.response;
      if (!response?.isPendingConfirmation.get() || getVoiceConfirmationType(response.response.value) !== "tool") {
        continue;
      }
      for (const part of response.response.value) {
        if (part.kind === "toolInvocation") {
          IChatToolInvocation.confirmWith(part, { type: 4 /* UserAction */ });
        }
      }
    }
  }
  // --- Machine ID ---
  _getMachineId() {
    return this.environmentService.machineId ?? "unknown";
  }
  // --- Feedback ---
  async submitFeedback(feedbackText) {
    let userId = this._userLogin;
    if (!userId) {
      try {
        const sessions2 = await this.authenticationService.getSessions("github");
        userId = sessions2[0]?.account.label ?? "unknown";
      } catch {
        userId = "unknown";
      }
    }
    let transcriptHistory = [];
    try {
      const turns = await this.voiceTranscriptStore.loadTurns(userId);
      transcriptHistory = turns.map((t2) => ({
        role: t2.role,
        text: t2.text,
        timestamp: t2.timestamp
      }));
    } catch (err) {
      this.logService.warn("[voice] failed to load transcript history for feedback", err);
    }
    const sessions = this.agentSessionsService.model.sessions.filter((s) => !s.isArchived());
    const clientSessionState = {
      voiceState: this._voiceState.get(),
      isConnected: this._isConnected.get(),
      isConnecting: this._isConnecting.get(),
      isReconnecting: this._isReconnecting.get(),
      pendingToolConfirmations: this._pendingToolConfirmations.get().map((tc) => ({
        type: tc.type,
        sessionLabel: tc.sessionLabel,
        description: tc.description
      })),
      activeSessions: sessions.map((s) => ({
        id: s.resource.toString(),
        label: s.label,
        status: s.status
      }))
    };
    const clientEnvironment = {
      machineId: this._getMachineId()
    };
    const payload = {
      feedbackText,
      machineId: this._getMachineId(),
      userId,
      sessionId: this.voiceClientService.currentSessionId ?? "",
      submissionId: generateUuid(),
      transcriptHistory,
      clientSessionState,
      clientEnvironment,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    return this.voiceClientService.submitFeedback(payload);
  }
};

VoiceSessionController = __decorateClass([
  __decorateParam(0, IVoiceClientService),
  __decorateParam(1, IMicCaptureService),
  __decorateParam(2, ITtsPlaybackService),
  __decorateParam(3, IVoiceToolDispatchService),
  __decorateParam(4, IVoicePlaybackService),
  __decorateParam(5, IAgentSessionsService),
  __decorateParam(6, IChatService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IAuthenticationService),
  __decorateParam(9, IVoiceTranscriptStore),
  __decorateParam(10, ILogService),
  __decorateParam(11, IWorkbenchEnvironmentService),
  __decorateParam(12, ITelemetryService),
  __decorateParam(13, IConfigurationService),
  __decorateParam(14, IAccessibilitySignalService),
  __decorateParam(15, IAccessibilityService),
  __decorateParam(16, IChatWidgetService),
  __decorateParam(17, INotificationService),
  __decorateParam(18, IPromptsService),
  __decorateParam(19, IChatEntitlementService)
], VoiceSessionController);

registerSingleton(IVoiceSessionController, VoiceSessionController, 1 /* Delayed */);
export { isVoiceEntitled, hasOwn, IVoiceSessionController, VoiceSessionController };
