// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/voiceClient/voiceClientService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { IVoiceClientService, isVoiceCheckpointId, normalizeAgentsVoiceId } from "./module-1342.mjs";
import { Language } from "./module-0014.mjs";
import { isTerminalCloseCode, voiceCloseCodeInfo } from "./module-2066.mjs";
import { mainWindow } from "./module-0002.mjs";
import { generateUuid } from "./module-0190.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { IProductService } from "./module-0873.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/voiceClient/voiceClientService.ts
var PING_INTERVAL_MS = 25e3;

var PONG_TIMEOUT_MS = 1e4;

var FAST_RETRY_COUNT = 3;

var FAST_RETRY_DELAY_MS = 2e3;

var SLOW_RETRY_DELAY_MS = 1e4;

var MAX_RECONNECT_DURATION_MS = 6e4;

var TTS_SUPPORTED_LANGUAGE_BASES = /* @__PURE__ */ new Set([
  "en",
  "de",
  "es",
  "fr",
  "it",
  "pt",
  "ja",
  "ko",
  "zh"
]);

var ASR_SUPPORTED_LANGUAGE_BASES = /* @__PURE__ */ new Set([
  "ar",
  "cs",
  "da",
  "de",
  "en",
  "es",
  "fi",
  "fr",
  "hi",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "nb",
  "nl",
  "pl",
  "pt",
  "ro",
  "ru",
  "sv",
  "th",
  "tr",
  "vi",
  "zh"
]);

var DEFAULT_LANGUAGE = "en-US";

function asOptionalString(value2) {
  return typeof value2 === "string" ? value2 : void 0;
}

function asOptionalNonEmptyString(value2) {
  const result = asOptionalString(value2);
  return result && result.length > 0 ? result : void 0;
}

function canonicalizeSupportedLanguage(value2, supportedBases) {
  const candidate = value2?.trim();
  if (!candidate || typeof Intl.getCanonicalLocales !== "function") {
    return void 0;
  }
  try {
    const canonical = Intl.getCanonicalLocales(candidate)[0];
    return supportedBases.has(canonical.split("-")[0]) ? canonical : void 0;
  } catch {
    return void 0;
  }
}

function resolveAutomaticVoiceLanguage(browserLanguage, displayLanguage) {
  return canonicalizeSupportedLanguage(displayLanguage, ASR_SUPPORTED_LANGUAGE_BASES) ?? canonicalizeSupportedLanguage(browserLanguage, ASR_SUPPORTED_LANGUAGE_BASES) ?? DEFAULT_LANGUAGE;
}

function asTranscriptionStatus(value2) {
  return value2 === "partial" || value2 === "final" ? value2 : void 0;
}

function asTranscriptionRevision(value2) {
  return typeof value2 === "number" && Number.isInteger(value2) && value2 >= 0 ? value2 : void 0;
}

var VoiceClientService = class extends Disposable {
  constructor(_configurationService, _logService, _productService) {
    super();
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._productService = _productService;
    this._reconnectAttempts = 0;
    this._isConnected = false;
    this._isResuming = false;
    // Set once start_session/resume_session (which carries session_context) has
    // been sent on the current connection; reset per connection. Gates
    // `_sendSetLanguage` and `requestNarration` so the backend has the session
    // before those follow-up messages are sent.
    this._sessionStartedOnSocket = false;
    this._lastSentById = /* @__PURE__ */ new Map();
    // session id → last-sent field values
    this._invalidatedSessionIds = /* @__PURE__ */ new Set();
    // --- Events ---
    this._onTranscription = this._register(new Emitter());
    this.onTranscription = this._onTranscription.event;
    this._onAudioResponse = this._register(new Emitter());
    this.onAudioResponse = this._onAudioResponse.event;
    this._onBargeIn = this._register(new Emitter());
    this.onBargeIn = this._onBargeIn.event;
    this._onNarrationAck = this._register(new Emitter());
    this.onNarrationAck = this._onNarrationAck.event;
    this._onNarrationUnblocked = this._register(new Emitter());
    this.onNarrationUnblocked = this._onNarrationUnblocked.event;
    this._onNarrationInterrupted = this._register(new Emitter());
    this.onNarrationInterrupted = this._onNarrationInterrupted.event;
    this._onToolCall = this._register(new Emitter());
    this.onToolCall = this._onToolCall.event;
    this._onSpeechStarted = this._register(new Emitter());
    this.onSpeechStarted = this._onSpeechStarted.event;
    this._onSessionInit = this._register(new Emitter());
    this.onSessionInit = this._onSessionInit.event;
    this._onError = this._register(new Emitter());
    this.onError = this._onError.event;
    this._onDidChangeConnectionState = this._register(new Emitter());
    this.onDidChangeConnectionState = this._onDidChangeConnectionState.event;
    this._onFatalDisconnect = this._register(new Emitter());
    this.onFatalDisconnect = this._onFatalDisconnect.event;
    this._onConnectionIssue = this._register(new Emitter());
    this.onConnectionIssue = this._onConnectionIssue.event;
    this._onTurnAutoEnded = this._register(new Emitter());
    this.onTurnAutoEnded = this._onTurnAutoEnded.event;
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("agents.voice.turn.silenceMs") || e.affectsConfiguration("agents.voice.turn.stopPhrases") || e.affectsConfiguration("agents.voice.handsFree")) {
        this._sendSetTurnConfig();
      }
      if (e.affectsConfiguration("agents.voice.voice")) {
        this._sendSetVoice();
      }
      if (e.affectsConfiguration("agents.voice.language")) {
        this._sendSetLanguage();
      }
    }));
  }
  get isConnected() {
    return this._isConnected;
  }
  get isResuming() {
    return this._isResuming;
  }
  get willReconnect() {
    return this._reconnectTimer !== void 0;
  }
  get currentSessionId() {
    return this._lastSessionId;
  }
  _getVoice() {
    return normalizeAgentsVoiceId(this._configurationService.getValue("agents.voice.voice"));
  }
  _sendSetVoice() {
    if (this._ws?.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: "set_voice", voice: this._getVoice() }));
    }
  }
  _getLanguage() {
    const configured = this._configurationService.getValue("agents.voice.language");
    if (typeof configured === "string" && configured.trim().toLowerCase() !== "auto") {
      const language2 = canonicalizeSupportedLanguage(configured, TTS_SUPPORTED_LANGUAGE_BASES);
      if (language2) {
        return language2;
      }
      this._logService.warn(`[voice] Unsupported agents.voice.language value '${configured}', falling back to ${DEFAULT_LANGUAGE}`);
      return DEFAULT_LANGUAGE;
    }
    return resolveAutomaticVoiceLanguage(this._window?.navigator.language, Language.value());
  }
  _sendSetLanguage() {
    if (this._ws?.readyState === WebSocket.OPEN && this._sessionStartedOnSocket) {
      this._ws.send(JSON.stringify({ type: "set_language", language: this._getLanguage() }));
    }
  }
  /**
   * Whether a configuration setting has an explicit user/workspace/application
   * value, as opposed to falling back to its registered default.
   */
  _isExplicitlyConfigured(key3) {
    const inspected = this._configurationService.inspect(key3);
    return inspected.userValue !== void 0 || inspected.userLocalValue !== void 0 || inspected.userRemoteValue !== void 0 || inspected.workspaceValue !== void 0 || inspected.workspaceFolderValue !== void 0 || inspected.applicationValue !== void 0;
  }
  /**
   * Assemble the ``turn_config`` wire object from the ``agents.voice.turn.*``
   * settings, normalizing each into the shape the backend expects. The
   * ``auto_end_mode`` is derived from the other two settings: trailing-silence
   * ending is enabled unless ``silenceMs`` is ``-1`` (or otherwise non-positive),
   * and stop-phrase ending is enabled when at least one phrase is configured.
   *
   * When hands-free mode (``agents.voice.handsFree``) is disabled, the turn is
   * not sent automatically by default: trailing-silence and stop-phrase ending
   * are each suppressed unless the corresponding setting has been explicitly
   * configured, so a user who opts out of the hands-free loop keeps manual
   * control over when a turn is sent.
   */
  _getTurnConfig() {
    const cfg = this._configurationService;
    const handsFree = cfg.getValue("agents.voice.handsFree") === true;
    const silenceRaw = cfg.getValue("agents.voice.turn.silenceMs");
    let silenceEnabled = typeof silenceRaw === "number" && silenceRaw > 0;
    if (!handsFree && !this._isExplicitlyConfigured("agents.voice.turn.silenceMs")) {
      silenceEnabled = false;
    }
    const silence_ms = silenceEnabled ? Math.round(silenceRaw) : 800;
    const phrasesRaw = cfg.getValue("agents.voice.turn.stopPhrases");
    const stop_phrases = Array.isArray(phrasesRaw) ? phrasesRaw.map((p) => String(p).trim()).filter((p) => p.length > 0) : [];
    let phrasesEnabled = stop_phrases.length > 0;
    if (!handsFree && !this._isExplicitlyConfigured("agents.voice.turn.stopPhrases")) {
      phrasesEnabled = false;
    }
    const auto_end_mode = silenceEnabled && phrasesEnabled ? "both" : silenceEnabled ? "vad" : phrasesEnabled ? "phrase" : "off";
    return { auto_end_mode, silence_ms, stop_phrases: phrasesEnabled ? stop_phrases : [], vad_gate_asr: true };
  }
  _sendSetTurnConfig() {
    if (this._ws?.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: "set_turn_config", turn_config: this._getTurnConfig() }));
    }
  }
  _getWsUrl() {
    const configured = this._configurationService.getValue("agents.voice.backendUrl");
    const url = typeof configured === "string" ? configured.trim() : "";
    return url || this._productService.voiceWsUrl || "";
  }
  async connect(window2, authToken) {
    this._window = window2;
    this._authToken = authToken;
    this._resetReconnectBudget();
    this._connectWebSocket();
  }
  _connectWebSocket() {
    const win = this._window;
    if (!win) {
      return;
    }
    const baseUrl = this._getWsUrl();
    if (!baseUrl) {
      this._logService.error("[voice] No voice WebSocket URL configured (set voiceWsUrl in product.json or agents.voice.backendUrl in settings)");
      this._onFatalDisconnect.fire({ code: 0, reason: "", kind: "fatal", clientSide: true });
      this._cleanup();
      return;
    }
    const url = this._authToken ? `${baseUrl}?token=${encodeURIComponent(this._authToken)}` : baseUrl;
    const ws = new win.WebSocket(url);
    this._ws = ws;
    this._sessionStartedOnSocket = false;
    ws.onopen = () => {
      this._isResuming = !!this._lastSessionId;
      this._sessionStartedOnSocket = false;
      this._setConnected(true);
      this._startPing();
      if (this._lastSessionId) {
      }
    };
    ws.onmessage = (evt) => {
      let msg;
      try {
        msg = JSON.parse(evt.data);
      } catch {
        return;
      }
      switch (msg.type) {
        case "pong":
          this._clearPongTimeout();
          break;
        case "session_init":
          this._resetReconnectBudget();
          this._lastSessionId = msg.session_id;
          this._isResuming = false;
          this._onSessionInit.fire({ sessionId: msg.session_id ?? "" });
          break;
        case "session_resumed":
          this._resetReconnectBudget();
          this._lastSessionId = msg.session_id;
          this._isResuming = false;
          this._onSessionInit.fire({ sessionId: msg.session_id ?? "" });
          break;
        case "speech_started":
          this._onSpeechStarted.fire({ turnId: asOptionalString(msg.turn_id) });
          break;
        case "barge_in":
          this._onBargeIn.fire({
            turnId: asOptionalString(msg.turn_id) ?? "",
            interruptedTurnId: msg.interrupted_turn_id ?? ""
          });
          break;
        case "narration_ack": {
          const disposition = msg.disposition === "busy" || msg.disposition === "invalid" || msg.disposition === "suppressed" ? msg.disposition : "accepted";
          this._onNarrationAck.fire({
            narrationId: msg.narration_id ?? "",
            codingSessionId: msg.coding_session_id ?? "",
            disposition,
            reason: msg.reason
          });
          break;
        }
        case "narration_unblocked":
          this._onNarrationUnblocked.fire({
            narrationId: msg.narration_id ?? "",
            codingSessionId: msg.coding_session_id ?? ""
          });
          break;
        case "narration_interrupted":
          this._onNarrationInterrupted.fire({
            narrationId: msg.narration_id ?? "",
            codingSessionId: msg.coding_session_id ?? "",
            ...typeof msg.retryable === "boolean" ? { retryable: msg.retryable } : {},
            ...msg.reason ? { reason: msg.reason } : {}
          });
          break;
        case "transcription": {
          const status2 = msg.status === void 0 ? "final" : asTranscriptionStatus(msg.status);
          const turnId = msg.turn_id === void 0 ? void 0 : asOptionalNonEmptyString(msg.turn_id);
          const revision = msg.revision === void 0 ? void 0 : asTranscriptionRevision(msg.revision);
          if (!status2 || msg.turn_id !== void 0 && !turnId || msg.revision !== void 0 && (!turnId || revision === void 0)) {
            break;
          }
          this._onTranscription.fire({
            text: asOptionalString(msg.text) ?? "",
            status: status2,
            committed: asOptionalString(msg.committed) ?? "",
            turnId,
            revision
          });
          break;
        }
        case "audio_response": {
          const requestId = asOptionalString(msg.request_id);
          const checkpointId = isVoiceCheckpointId(msg.checkpoint_id) ? msg.checkpoint_id : void 0;
          const sequence2 = typeof msg.sequence === "number" && Number.isSafeInteger(msg.sequence) && msg.sequence > 0 ? msg.sequence : void 0;
          const narrationKind = msg.narration_kind === "response" || msg.narration_kind === "confirmation" || msg.narration_kind === "checkpoint" ? msg.narration_kind : void 0;
          const playbackId = asOptionalString(msg.playback_id);
          if (narrationKind === "checkpoint") {
            this._logService.info(`[voice] checkpoint audio request=${requestId ?? "none"} stage=${checkpointId ?? "none"} sequence=${sequence2 ?? "none"} first=${msg.is_first_chunk === void 0 ? true : Boolean(msg.is_first_chunk)} final=${Boolean(msg.is_final)}`);
          }
          this._onAudioResponse.fire({
            audio: msg.audio ?? "",
            isFirstChunk: msg.is_first_chunk === void 0 ? true : Boolean(msg.is_first_chunk),
            isFinal: msg.is_final ?? false,
            codingSessionId: msg.coding_session_id,
            transcript: msg.transcript,
            turnId: asOptionalString(msg.turn_id),
            responseId: msg.narration_id ?? asOptionalString(msg.turn_id),
            ...requestId ? { requestId } : {},
            ...checkpointId ? { checkpointId } : {},
            ...sequence2 !== void 0 ? { sequence: sequence2 } : {},
            ...narrationKind ? { narrationKind } : {},
            ...playbackId ? { playbackId } : {}
          });
          break;
        }
        case "tool_call":
          this._onToolCall.fire({
            callId: msg.call_id ?? "",
            name: msg.name ?? "",
            args: msg.args ?? {}
          });
          break;
        case "turn_auto_ended": {
          const reason = msg.reason === "stop_phrase" ? "stop_phrase" : "vad_silence";
          this._onTurnAutoEnded.fire({ reason, turnId: asOptionalString(msg.turn_id) ?? "" });
          break;
        }
        case "error":
          this._onError.fire(msg.detail ?? "Unknown error");
          break;
      }
    };
    ws.onerror = () => {
      this._onError.fire("WebSocket error");
    };
    ws.onclose = (evt) => {
      this._logService.trace(`[voice] ws.onclose code=${evt.code} reason=${evt.reason ?? ""} wasClean=${evt.wasClean}`);
      if (this._ws === ws) {
        if (isTerminalCloseCode(evt.code)) {
          const kind = voiceCloseCodeInfo(evt.code)?.kind ?? "fatal";
          this._logService.warn(`[voice] terminal close ${evt.code} (${kind}): ${evt.reason}, not reconnecting`);
          this._onFatalDisconnect.fire({ code: evt.code, reason: evt.reason ?? "", kind });
          this._cleanup();
          return;
        }
        if (!this._reconnectStartedAt) {
          this._reconnectStartedAt = Date.now();
        }
        const elapsed = Date.now() - this._reconnectStartedAt;
        if (elapsed >= MAX_RECONNECT_DURATION_MS) {
          this._logService.warn(`[voice] reconnect budget of ${MAX_RECONNECT_DURATION_MS}ms exhausted, giving up`);
          this._onFatalDisconnect.fire({ code: evt.code, reason: evt.reason ?? "", kind: "fatal" });
          this._cleanup();
          return;
        }
        this._reconnectAttempts++;
        this._stopPing();
        this._ws = void 0;
        const delay = this._reconnectAttempts <= FAST_RETRY_COUNT ? FAST_RETRY_DELAY_MS : SLOW_RETRY_DELAY_MS;
        this._logService.warn(`[voice] ws closed abnormally (code=${evt.code} reason=${evt.reason || "none"} wasClean=${evt.wasClean}); reconnecting in ${delay}ms (attempt ${this._reconnectAttempts})`);
        this._reconnectTimer = setTimeout(() => {
          this._reconnectTimer = void 0;
          this._connectWebSocket();
        }, delay);
        this._setConnected(false);
        this._onConnectionIssue.fire({ code: evt.code, reason: evt.reason ?? "" });
      }
    };
  }
  disconnect() {
    this._logService.trace("[voice] disconnect() called");
    if (this._ws && this._ws.readyState < WebSocket.CLOSING) {
      this._ws.close();
    }
    this._cleanup();
  }
  _cleanup() {
    this._resetReconnectBudget();
    this._stopPing();
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = void 0;
    }
    if (this._contextSendTimer) {
      clearTimeout(this._contextSendTimer);
      this._contextSendTimer = void 0;
    }
    this._pendingContext = void 0;
    this._ws = void 0;
    this._sessionStartedOnSocket = false;
    this._window = void 0;
    this._lastSessionId = void 0;
    this._isResuming = false;
    this._lastSentById.clear();
    this._invalidatedSessionIds.clear();
    this._setConnected(false);
  }
  _resetReconnectBudget() {
    this._reconnectAttempts = 0;
    this._reconnectStartedAt = void 0;
  }
  _startPing() {
    this._stopPing();
    const win = this._window ?? mainWindow;
    this._pingTimer = win.setInterval(() => {
      if (this._ws?.readyState === WebSocket.OPEN) {
        this._ws.send(JSON.stringify({ type: "ping" }));
        this._pongTimer = setTimeout(() => {
          this._logService.warn("[voice] pong timeout \u2014 server unreachable, reconnecting");
          this._ws?.close(4e3, "pong timeout");
        }, PONG_TIMEOUT_MS);
      }
    }, PING_INTERVAL_MS);
  }
  _stopPing() {
    if (this._pingTimer) {
      (this._window ?? mainWindow).clearInterval(this._pingTimer);
      this._pingTimer = void 0;
    }
    this._clearPongTimeout();
  }
  _clearPongTimeout() {
    if (this._pongTimer) {
      clearTimeout(this._pongTimer);
      this._pongTimer = void 0;
    }
  }
  _setConnected(connected) {
    if (this._isConnected !== connected) {
      this._isConnected = connected;
      this._onDidChangeConnectionState.fire(connected);
    }
  }
  sendPttStart(turnId, options3) {
    if (this._ws?.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: "ptt_start", turn_id: turnId, has_active_session: options3.hasActiveSession, ...options3.passive ? { passive: true } : {} }));
    }
  }
  sendPttAudioChunk(audio) {
    if (this._ws?.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: "ptt_audio_chunk", audio }));
    }
  }
  sendPttEnd() {
    if (this._ws?.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: "ptt_end" }));
    }
  }
  sendPttDiagnostic(turnId, metrics) {
    if (this._ws?.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: "ptt_diagnostic", turn_id: turnId, metrics }));
    }
  }
  sendSessionContext(context2) {
    if (!this._isConnected) {
      return;
    }
    this._pendingContext = context2;
    if (this._contextSendTimer) {
      clearTimeout(this._contextSendTimer);
    }
    this._contextSendTimer = setTimeout(() => {
      this._contextSendTimer = void 0;
      const pending = this._pendingContext;
      this._pendingContext = void 0;
      if (pending && this._ws?.readyState === WebSocket.OPEN) {
        this._sendDelta(pending);
      }
    }, 500);
  }
  flushSessionContext() {
    if (!this._contextSendTimer) {
      return;
    }
    clearTimeout(this._contextSendTimer);
    this._contextSendTimer = void 0;
    const pending = this._pendingContext;
    this._pendingContext = void 0;
    if (pending && this._ws?.readyState === WebSocket.OPEN) {
      this._sendDelta(pending);
    }
  }
  invalidateSessionCache(sessionId) {
    this._invalidatedSessionIds.add(sessionId);
  }
  _sendDelta(context2) {
    const currentIds = new Set(context2.sessions.map((s) => s.id));
    const removes = [...this._lastSentById.keys()].filter((id2) => !currentIds.has(id2));
    const upserts = [];
    for (const session of context2.sessions) {
      const current = session;
      const prev = this._lastSentById.get(session.id);
      if (!prev) {
        upserts.push(current);
      } else {
        const patch2 = { id: session.id };
        let hasChanges = false;
        if (this._invalidatedSessionIds.has(session.id)) {
          for (const key3 of Object.keys(current)) {
            if (key3 !== "id") {
              patch2[key3] = current[key3] ?? null;
              hasChanges = true;
            }
          }
          for (const key3 of Object.keys(prev)) {
            if (key3 !== "id" && (!Object.prototype.hasOwnProperty.call(current, key3) || current[key3] === void 0)) {
              patch2[key3] = null;
              hasChanges = true;
            }
          }
        } else {
          for (const key3 of Object.keys(current)) {
            if (key3 === "id") {
              continue;
            }
            if (stableStringify3(current[key3]) !== stableStringify3(prev[key3])) {
              patch2[key3] = current[key3];
              hasChanges = true;
            }
          }
          for (const key3 of Object.keys(prev)) {
            if (key3 === "id") {
              continue;
            }
            if (!Object.prototype.hasOwnProperty.call(current, key3) || current[key3] === void 0) {
              patch2[key3] = null;
              hasChanges = true;
            }
          }
        }
        if (!Object.prototype.hasOwnProperty.call(patch2, "agent_state")) {
          if (Object.prototype.hasOwnProperty.call(patch2, "agent_state_detail")) {
            delete patch2.agent_state_detail;
          }
          if (Object.prototype.hasOwnProperty.call(patch2, "last_response_summary")) {
            delete patch2.last_response_summary;
          }
          hasChanges = Object.keys(patch2).some((k) => k !== "id");
        }
        if (hasChanges) {
          upserts.push(patch2);
        }
      }
    }
    if (upserts.length === 0 && removes.length === 0) {
      return;
    }
    for (const session of context2.sessions) {
      const obj = {};
      for (const [k, v2] of Object.entries(session)) {
        if (v2 !== void 0) {
          obj[k] = v2;
        }
      }
      this._lastSentById.set(session.id, obj);
      this._invalidatedSessionIds.delete(session.id);
    }
    for (const id2 of removes) {
      this._lastSentById.delete(id2);
      this._invalidatedSessionIds.delete(id2);
    }
    this._ws.send(JSON.stringify({
      type: "session_context",
      mode: "delta",
      upserts,
      removes
    }));
    this._logService.trace(`[voice] _sendDelta upserts=[${upserts.map((u) => `${String(u.id).slice(-8)}:${u.agent_state ?? "(no-state)"}${Object.prototype.hasOwnProperty.call(u, "agent_state_detail") ? "+detail" : ""}${Object.prototype.hasOwnProperty.call(u, "last_response_summary") && u.last_response_summary ? "+summary" : ""}`).join(", ")}] removes=${removes.length}`);
  }
  _seedTracking(context2) {
    this._lastSentById.clear();
    this._invalidatedSessionIds.clear();
    for (const session of context2.sessions) {
      const obj = {};
      for (const [k, v2] of Object.entries(session)) {
        if (v2 !== void 0) {
          obj[k] = v2;
        }
      }
      this._lastSentById.set(session.id, obj);
    }
  }
  sendToolResult(callId, result) {
    if (this._ws?.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: "tool_result", call_id: callId, result }));
    }
  }
  sendNarrationPlaybackComplete(codingSessionId, narrationId, playbackId) {
    if (this._ws?.readyState === WebSocket.OPEN && this._sessionStartedOnSocket) {
      this._ws.send(JSON.stringify({
        type: "narration_playback_complete",
        coding_session_id: codingSessionId,
        narration_id: narrationId,
        playback_id: playbackId
      }));
    }
  }
  requestNarration(codingSessionId, kind, text2, narrationId, checkpoint, confirmationType, pending) {
    if (this._ws?.readyState === WebSocket.OPEN && this._sessionStartedOnSocket) {
      const id2 = narrationId ?? generateUuid();
      this._ws.send(JSON.stringify({
        type: "request_narration",
        coding_session_id: codingSessionId,
        kind,
        text: text2,
        narration_id: id2,
        ...checkpoint ? {
          request_id: checkpoint.requestId,
          checkpoint_id: checkpoint.checkpointId,
          sequence: checkpoint.sequence
        } : {},
        ...kind === "confirmation" && confirmationType ? { confirmation_type: confirmationType } : {},
        ...pending ? { pending_id: pending.pendingId } : {}
      }));
      this._logService.trace(`[voice] request_narration kind=${kind} id=${codingSessionId.slice(-32)} narration_id=${id2.slice(0, 8)}${narrationId ? " (retry)" : ""}`);
      if (checkpoint) {
        this._logService.info(`[voice] checkpoint sent request=${checkpoint.requestId} stage=${checkpoint.checkpointId} sequence=${checkpoint.sequence}`);
      }
      return id2;
    }
    return void 0;
  }
  sendSessionStateChange(sessionId, newState, _label, detail2, lastResponseSummary) {
    if (this._ws?.readyState === WebSocket.OPEN) {
      const payload = { type: "session_state_change", session_id: sessionId, new_state: newState };
      if (detail2) {
        payload.detail = detail2;
      }
      if (lastResponseSummary) {
        payload.last_response_summary = lastResponseSummary;
      }
      this._ws.send(JSON.stringify(payload));
    }
  }
  stopSpeaking() {
  }
  /**
   * Send the start_session message with the given context.
   * Called by the consumer after connect() resolves and AudioContext is ready.
   *
   * ``priorTimeline`` carries an ordered slice of cross-session entries
   * (voice turns, voice tool calls, coding-session events, and a synthesized
   * coding-agent-reply summary per active session) from the previous voice
   * session. The BE consumes it once on the first command turn so the model
   * can answer recall questions across reconnects without backend
   * persistence. See ``IVoicePriorTimelineEntry``.
   */
  sendStartSession(context2, machineId, priorTimeline, turnConfigOverride, voiceInstructions) {
    if (this._ws?.readyState === WebSocket.OPEN) {
      const sessionContext = { ...context2, display_locale: this._getLanguage() };
      this._seedTracking(sessionContext);
      const payload = { type: "start_session", session_context: sessionContext, machine_id: machineId, turn_config: turnConfigOverride ?? this._getTurnConfig(), voice: this._getVoice(), auto_narrate: false };
      if (priorTimeline && priorTimeline.length > 0) {
        payload.prior_timeline = priorTimeline;
      }
      if (voiceInstructions) {
        payload.voice_instructions = voiceInstructions;
      }
      this._ws.send(JSON.stringify(payload));
      this._sessionStartedOnSocket = true;
    }
  }
  sendResumeSession(context2, machineId, voiceInstructions) {
    if (this._ws?.readyState === WebSocket.OPEN && this._lastSessionId) {
      const sessionContext = { ...context2, display_locale: this._getLanguage() };
      this._seedTracking(sessionContext);
      const payload = { type: "resume_session", session_id: this._lastSessionId, session_context: sessionContext, machine_id: machineId, turn_config: this._getTurnConfig(), voice: this._getVoice(), auto_narrate: false };
      if (voiceInstructions) {
        payload.voice_instructions = voiceInstructions;
      }
      this._ws.send(JSON.stringify(payload));
      this._sessionStartedOnSocket = true;
    }
  }
  async submitFeedback(payload) {
    const httpUrl = this._getWsUrl().replace("wss://", "https://").replace("ws://", "http://").replace(/\/realtime\/voice$/, "/feedback");
    const headers = { "Content-Type": "application/json" };
    if (this._authToken) {
      headers["Authorization"] = `Bearer ${this._authToken}`;
    }
    try {
      const response = await fetch(httpUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          feedback_text: payload.feedbackText,
          machine_id: payload.machineId,
          user_id: payload.userId,
          session_id: payload.sessionId,
          submission_id: payload.submissionId,
          transcript_history: payload.transcriptHistory.map((t2) => ({
            role: t2.role,
            text: t2.text,
            timestamp: t2.timestamp
          })),
          client_session_state: payload.clientSessionState,
          client_environment: payload.clientEnvironment,
          timestamp: payload.timestamp
        })
      });
      if (!response.ok) {
        const text2 = await response.text();
        return { ok: false, error: `HTTP ${response.status}: ${text2}` };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
  dispose() {
    this.disconnect();
    super.dispose();
  }
};

VoiceClientService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IProductService)
], VoiceClientService);

function stableStringify3(value2) {
  if (value2 === null || typeof value2 !== "object") {
    return JSON.stringify(value2);
  }
  if (Array.isArray(value2)) {
    return "[" + value2.map(stableStringify3).join(",") + "]";
  }
  const keys = Object.keys(value2).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + stableStringify3(value2[k])).join(",") + "}";
}

registerSingleton(IVoiceClientService, VoiceClientService, 1 /* Delayed */);
export { asOptionalString, asOptionalNonEmptyString, canonicalizeSupportedLanguage, resolveAutomaticVoiceLanguage, asTranscriptionStatus, asTranscriptionRevision, stableStringify3, PING_INTERVAL_MS, PONG_TIMEOUT_MS, FAST_RETRY_COUNT, FAST_RETRY_DELAY_MS, SLOW_RETRY_DELAY_MS, MAX_RECONNECT_DURATION_MS, TTS_SUPPORTED_LANGUAGE_BASES, ASR_SUPPORTED_LANGUAGE_BASES, DEFAULT_LANGUAGE, VoiceClientService };
