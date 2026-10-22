// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/agentHostUsageSidecar.ts
import { joinPath } from "./module-0034.mjs";
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { NotificationType } from "./module-1614.mjs";
import { getCopilotCliSessionRawId } from "./module-1109.mjs";
import { URI } from "./module-0032.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { agentHostAuthority } from "./module-1000.mjs";
import { isDefaultChatUri, parseChatUri, readUsageInfoMeta } from "./module-1007.mjs";
import { VSBuffer } from "./module-0038.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/agentHostUsageSidecar.ts
var USAGE_DIR = "agentHostUsage";

function buildAgentHostUsageUri(baseDir, rawSessionId) {
  return joinPath(baseDir, USAGE_DIR, `${sanitizeSessionId(rawSessionId)}.jsonl`);
}

function sanitizeSessionId(rawSessionId) {
  return rawSessionId.replace(/[^\w.-]/g, "_");
}

async function readAgentHostUsageRecords(fileService, uri5) {
  let text2;
  try {
    const content2 = await fileService.readFile(uri5);
    text2 = content2.value.toString();
  } catch {
    return [];
  }
  const records = [];
  for (const line of text2.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed.turnId === "string" && typeof parsed.ts === "string") {
        records.push(parsed);
      }
    } catch {
    }
  }
  return records;
}

var AgentHostActionRecorder = class extends Disposable {
  constructor(_baseDir, _isEnabled, _fileService, _logService, agentHostService, _remoteAgentHostService) {
    super();
    this._baseDir = _baseDir;
    this._isEnabled = _isEnabled;
    this._fileService = _fileService;
    this._logService = _logService;
    this._remoteAgentHostService = _remoteAgentHostService;
    /** Live per-remote-connection listeners (actions + notifications), keyed by agent-host authority. */
    this._remoteListeners = this._register(new DisposableMap());
    /**
     * Per-session serialized file-operation queue shared by writes and cleanup,
     * so a delete can never be overtaken by an in-flight write for the same
     * session. Owned by the base class because deletion is driven from here.
     */
    this._queues = /* @__PURE__ */ new Map();
    /**
     * The connection object currently subscribed for each authority. Tracked so
     * a reconnect (which replaces the connection object under the same
     * authority) is detected and the listener re-subscribed to the live object.
     */
    this._remoteConnections = /* @__PURE__ */ new Map();
    this._register(agentHostService.onDidAction((envelope) => this._dispatch(envelope)));
    this._register(agentHostService.onDidNotification((notification) => this._onNotification(notification)));
    this._register(this._remoteAgentHostService.onDidChangeConnections(() => this._syncRemoteListeners()));
    this._syncRemoteListeners();
  }
  /** Gate on the enable predicate before handing the action to the subclass. */
  _dispatch(envelope) {
    if (!this._isEnabled()) {
      return;
    }
    this._onAction(envelope);
  }
  /**
   * Deletes a session's sidecar when the host reports the session removed, so
   * these files don't accumulate indefinitely for sessions the user deleted
   * (the host's own per-session storage cascades away with the session
   * directory; without this the client-side copies would outlive it).
   *
   * Deliberately NOT gated on {@link _isEnabled}: toggling debug logging off
   * must not strand the files already written while it was on.
   */
  _onNotification(notification) {
    if (notification.type !== NotificationType.SessionRemoved) {
      return;
    }
    const rawId = getCopilotCliSessionRawId(URI.parse(notification.session));
    if (!rawId) {
      return;
    }
    const uri5 = this._sidecarUri(rawId);
    const pending = this.queued(rawId, () => this._fileService.del(uri5));
    void pending.finally(() => {
      if (this._queues.get(rawId) === pending) {
        this._queues.delete(rawId);
      }
    });
  }
  /**
   * Runs `operation` after any previously queued work for `rawSessionId`,
   * keeping per-session file operations in submission order. Failures are
   * swallowed (and traced) so one failed operation cannot break the chain.
   */
  queued(rawSessionId, operation) {
    const previous = this._queues.get(rawSessionId) ?? Promise.resolve();
    const next = previous.then(operation).then(() => void 0).catch((err) => {
      this._logService.trace(`[${this.constructor.name}] sidecar operation failed for ${rawSessionId}: ${toErrorMessage(err)}`);
    });
    this._queues.set(rawSessionId, next);
    return next;
  }
  /** Subscribes to each current remote connection's streams; drops stale ones. */
  _syncRemoteListeners() {
    const seen = /* @__PURE__ */ new Set();
    for (const info of this._remoteAgentHostService.connections) {
      const authority = agentHostAuthority(info.address);
      seen.add(authority);
      const connection = this._remoteAgentHostService.getConnectionByAuthority(authority);
      if (!connection) {
        continue;
      }
      if (this._remoteConnections.get(authority) === connection) {
        continue;
      }
      this._remoteConnections.set(authority, connection);
      const store = new DisposableStore();
      store.add(connection.onDidAction((envelope) => this._dispatch(envelope)));
      store.add(connection.onDidNotification((notification) => this._onNotification(notification)));
      this._remoteListeners.set(authority, store);
    }
    for (const authority of [...this._remoteListeners.keys()]) {
      if (!seen.has(authority)) {
        this._remoteListeners.deleteAndDispose(authority);
        this._remoteConnections.delete(authority);
      }
    }
  }
};

var AgentHostUsageRecorder = class extends AgentHostActionRecorder {
  _sidecarUri(rawSessionId) {
    return buildAgentHostUsageUri(this._baseDir, rawSessionId);
  }
  _onAction(envelope) {
    const action = envelope.action;
    if (action.type !== "chat/usage" /* ChatUsage */) {
      return;
    }
    if (!isDefaultChatUri(envelope.channel)) {
      return;
    }
    const usage = action.usage;
    const meta = readUsageInfoMeta(usage);
    if (meta.contextAttribution) {
      return;
    }
    const session = parseChatUri(envelope.channel)?.session;
    if (!session) {
      return;
    }
    const rawId = getCopilotCliSessionRawId(URI.parse(session));
    if (!rawId) {
      return;
    }
    const record = {
      turnId: action.turnId,
      model: usage.model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cacheReadTokens: usage.cacheReadTokens,
      totalNanoAiu: meta.copilotUsage?.totalNanoAiu,
      ts: (/* @__PURE__ */ new Date()).toISOString()
    };
    this._append(rawId, record);
  }
  /**
   * Appends a record to the session's sidecar. Uses the file system's append
   * capability so each record is a single small write (no read-modify-write of
   * the whole file, and no in-memory copy of the growing file) — writes are
   * still serialized per session to keep records ordered. Records written
   * before a restart are preserved because we append to the existing file.
   */
  _append(rawId, record) {
    const uri5 = this._sidecarUri(rawId);
    const line = JSON.stringify(record) + "\n";
    void this.queued(rawId, () => this._fileService.writeFile(uri5, VSBuffer.fromString(line), { append: true }));
  }
};

var CUSTOMIZATIONS_DIR = "agentHostCustomizations";

function buildAgentHostCustomizationsUri(baseDir, rawSessionId) {
  return joinPath(baseDir, CUSTOMIZATIONS_DIR, `${sanitizeSessionId(rawSessionId)}.json`);
}

async function readAgentHostCustomizationsSnapshot(fileService, uri5) {
  let text2;
  try {
    const content2 = await fileService.readFile(uri5);
    text2 = content2.value.toString();
  } catch {
    return void 0;
  }
  try {
    const parsed = JSON.parse(text2);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
  }
  return void 0;
}

var AgentHostCustomizationRecorder = class extends AgentHostActionRecorder {
  _sidecarUri(rawSessionId) {
    return buildAgentHostCustomizationsUri(this._baseDir, rawSessionId);
  }
  _onAction(envelope) {
    if (envelope.action.type !== "session/customizationsChanged" /* SessionCustomizationsChanged */) {
      return;
    }
    const rawId = getCopilotCliSessionRawId(URI.parse(envelope.channel));
    if (!rawId) {
      return;
    }
    this._write(rawId, envelope.action.customizations);
  }
  /** Overwrites the session's snapshot, serializing writes per session. */
  _write(rawId, customizations) {
    const uri5 = this._sidecarUri(rawId);
    const content2 = JSON.stringify(customizations);
    void this.queued(rawId, () => this._fileService.writeFile(uri5, VSBuffer.fromString(content2)));
  }
};
export { buildAgentHostUsageUri, sanitizeSessionId, readAgentHostUsageRecords, buildAgentHostCustomizationsUri, readAgentHostCustomizationsSnapshot, USAGE_DIR, AgentHostActionRecorder, AgentHostUsageRecorder, CUSTOMIZATIONS_DIR, AgentHostCustomizationRecorder };
