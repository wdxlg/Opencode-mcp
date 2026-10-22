// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxReadOnlySessionHandler.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { AgentSession } from "./module-1107.mjs";
import { URI } from "./module-0032.mjs";
import { activeTurnToProgress, messageToRequestOrigin, messageToVariableData, turnsToHistory } from "./module-2221.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICloudSandboxApiService } from "./module-3675.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxReadOnlySessionHandler.ts
var LOG_PREFIX9 = "[CloudSandboxReadOnly]";

var ReadOnlyChatSession = class extends Disposable {
  constructor(sessionResource, history, title, isReadOnly2) {
    super();
    this.sessionResource = sessionResource;
    this.history = history;
    this.title = title;
    this.isReadOnly = isReadOnly2;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
  }
  dispose() {
    this._onWillDispose.fire();
    super.dispose();
  }
};

var CloudSandboxReadOnlySessionHandler = class extends Disposable {
  constructor(_config, _apiService, _logService) {
    super();
    this._config = _config;
    this._apiService = _apiService;
    this._logService = _logService;
    /**
     * Starts `false`: an environment that goes on to wake must not have been shown as read-only.
     * Observable so an already-rendered session can be settled in place by {@link markReadOnly}.
     */
    this._isReadOnly = observableValue("cloudSandboxReadOnly", false);
    this._prefetchedHistory = _config.prefetchedHistory;
  }
  /** Settle as read-only once the connect has failed; open sessions disable their composer. */
  markReadOnly() {
    this._isReadOnly.set(true, void 0);
  }
  /** Persisted history, preferring a prefetch already in flight over a fresh read. */
  async _readHistory(token) {
    const prefetched = this._prefetchedHistory;
    this._prefetchedHistory = void 0;
    if (prefetched) {
      const replayed = await prefetched;
      if (replayed) {
        return replayed;
      }
    }
    return this._apiService.getSessionHistory(this._config.taskId, token);
  }
  async provideChatSessionContent(sessionResource, token) {
    const sessionId = AgentSession.id(sessionResource);
    const replayed = await this._readHistory(token);
    const session = replayed?.sessions.find((s) => AgentSession.id(URI.parse(s.session)) === sessionId);
    if (!session) {
      this._logService.warn(`${LOG_PREFIX9} No persisted history for session ${sessionId} in task ${this._config.taskId} (replayed sessions: [${replayed?.sessions.map((s) => s.session).join(", ") ?? "none"}]); opening an empty read-only session.`);
      return new ReadOnlyChatSession(sessionResource, [], void 0, this._isReadOnly);
    }
    const chat = session.chats.get(session.defaultChat) ?? [...session.chats.values()][0];
    const history = chat ? turnsToHistory(URI.parse(session.session), chat.turns, this._config.agentId, this._config.connectionAuthority, void 0, void 0, void 0, void 0, this._config.agentId) : [];
    const active = chat?.activeTurn;
    if (active) {
      history.push({
        id: active.id,
        type: "request",
        prompt: active.message.text,
        participant: this._config.agentId,
        variableData: messageToVariableData(active.message, this._config.connectionAuthority),
        origin: messageToRequestOrigin(URI.parse(session.session), active.message, this._config.agentId, this._config.agentId)
      });
      history.push({
        type: "response",
        parts: activeTurnToProgress(
          URI.parse(session.session),
          active,
          this._config.connectionAuthority,
          sessionResource.authority
        ),
        participant: this._config.agentId
      });
    }
    if (replayed?.truncated) {
      this._logService.warn(`${LOG_PREFIX9} History for task ${this._config.taskId} is truncated; the final exchange may be incomplete.`);
      history.push({
        type: "response",
        parts: [{
          kind: "warning",
          content: new MarkdownString(localize(
            5087,
            null
          ))
        }],
        participant: this._config.agentId
      });
    }
    this._logService.info(`${LOG_PREFIX9} Opened ${sessionResource.toString()} read-only with ${history.length} history item(s) from ${chat?.turns.length ?? 0} turn(s); chats=[${[...session.chats.keys()].join(", ")}], default=${session.defaultChat}.`);
    return new ReadOnlyChatSession(sessionResource, history, session.state.title || void 0, this._isReadOnly);
  }
};

CloudSandboxReadOnlySessionHandler = __decorateClass([
  __decorateParam(1, ICloudSandboxApiService),
  __decorateParam(2, ILogService)
], CloudSandboxReadOnlySessionHandler);
export { LOG_PREFIX9, ReadOnlyChatSession, CloudSandboxReadOnlySessionHandler };
