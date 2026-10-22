// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/agentHost/common/editorRemoteAgentHostTransport.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { createURITransformer } from "./module-2328.mjs";
import { isJsonRpcNotification, isJsonRpcRequest, isJsonRpcResponse } from "./module-1616.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { isEqualAuthority } from "./module-0034.mjs";
import { readSessionFolderPickerDecision, withSessionFolderPickerDecision } from "./module-1007.mjs";
import { hasKey } from "./module-0010.mjs";


// src/vs/workbench/services/agentHost/common/editorRemoteAgentHostTransport.ts
var EditorRemoteAgentHostTransport = class extends Disposable {
  /** Owns the underlying transport and translates incoming messages before exposing them to the protocol client. */
  constructor(_transport, _remoteAuthority) {
    super();
    this._transport = _transport;
    this._remoteAuthority = _remoteAuthority;
    this._requests = /* @__PURE__ */ new Map();
    this._onMessage = this._register(new Emitter());
    this.onMessage = this._onMessage.event;
    this._register(_transport);
    this._uriTransformer = createURITransformer(_remoteAuthority);
    this._register(_transport.onMessage((message) => this._onMessage.fire(this._fromHost(message))));
    this.onClose = _transport.onClose;
    this._register(this.onClose(() => this._requests.clear()));
  }
  /** Preserves the underlying connection's client-route classification. */
  get clientConnectionKind() {
    return this._transport.clientConnectionKind;
  }
  /** Reports the physical transport wrapped by this URI-mapping adapter. */
  get transportKind() {
    return this._transport.transportKind;
  }
  /** Opens the underlying connection; this adapter does not establish a separate connection. */
  connect() {
    return this._transport.connect();
  }
  /**
   * Maps outgoing working directories to host-local URIs before forwarding the message.
   * Records request methods when their responses may contain directories that need reverse mapping.
   */
  send(message) {
    if (isJsonRpcRequest(message)) {
      switch (message.method) {
        case "initialize":
        case "reconnect":
        case "subscribe":
        case "listSessions":
          this._requests.set(message.id, message.method);
          break;
        case "createSession":
          message = { ...message, params: this._mapDirectories(message.params, (value2) => this._toHostDirectory(value2)) };
          break;
        case "createChat":
          message = { ...message, params: this._mapDirectories(message.params, (value2) => this._toHostDirectory(value2)) };
          break;
        case "resolveSessionConfig":
          if (message.params.workingDirectory) {
            message = { ...message, params: { ...message.params, workingDirectory: this._toHostDirectory(message.params.workingDirectory) } };
          }
          break;
        case "sessionConfigCompletions":
          if (message.params.workingDirectory) {
            message = { ...message, params: { ...message.params, workingDirectory: this._toHostDirectory(message.params.workingDirectory) } };
          }
          break;
        case "createTerminal":
          if (message.params.cwd) {
            message = { ...message, params: { ...message.params, cwd: this._toHostDirectory(message.params.cwd) } };
          }
          break;
      }
    } else if (isJsonRpcNotification(message) && message.method === "dispatchAction") {
      message = { ...message, params: { ...message.params, action: this._mapAction(message.params.action, (value2) => this._toHostDirectory(value2)) } };
    }
    this._transport.send(message);
  }
  /** Converts a directory on the connected remote authority to a file URI, leaving other resources unchanged. */
  _toHostDirectory(value2) {
    const uri5 = URI.parse(value2);
    return uri5.scheme === Schemas.vscodeRemote && isEqualAuthority(uri5.authority, this._remoteAuthority) ? URI.revive(this._uriTransformer.transformIncoming(uri5)).toString() : value2;
  }
  /** Converts a host-local file URI to the workbench's remote URI so it matches the corresponding workspace folder. */
  _fromHostDirectory(value2) {
    const uri5 = URI.parse(value2);
    return uri5.scheme === Schemas.file ? URI.revive(this._uriTransformer.transformOutgoing(uri5)).toString() : value2;
  }
  /** Copies a payload with mapped working directories and folder-picker primary, preserving unrelated fields and metadata. */
  _mapDirectories(value2, map) {
    const decision = readSessionFolderPickerDecision(value2._meta);
    return {
      ...value2,
      ...value2.workingDirectories ? { workingDirectories: value2.workingDirectories.map(map) } : {},
      ...decision?.primary ? { _meta: withSessionFolderPickerDecision(value2._meta, { ...decision, primary: map(decision.primary) }) } : {}
    };
  }
  /** Maps directory-bearing action fields in either direction, leaving other action types untouched. */
  _mapAction(action, map) {
    switch (action.type) {
      case "session/workingDirectorySet" /* SessionWorkingDirectorySet */:
      case "session/workingDirectoryRemoved" /* SessionWorkingDirectoryRemoved */:
      case "chat/workingDirectorySet" /* ChatWorkingDirectorySet */:
      case "chat/workingDirectoryRemoved" /* ChatWorkingDirectoryRemoved */:
        return { ...action, directory: map(action.directory) };
      case "session/workingDirectoryReplaced" /* SessionWorkingDirectoryReplaced */:
        return { ...action, directory: map(action.directory), replacement: map(action.replacement) };
      case "session/chatAdded" /* SessionChatAdded */:
        return { ...action, summary: this._mapDirectories(action.summary, map) };
      case "session/chatUpdated" /* SessionChatUpdated */:
        return { ...action, changes: this._mapDirectories(action.changes, map) };
      case "session/metaChanged" /* SessionMetaChanged */:
        return this._mapDirectories(action, map);
      default:
        return action;
    }
  }
  /** Restores workbench directory identities in session and chat snapshots, including nested chat summaries. */
  _mapSnapshot(snapshot) {
    const map = (value2) => this._fromHostDirectory(value2);
    const state = snapshot.state;
    if (hasKey(state, { chats: true })) {
      return { ...snapshot, state: { ...this._mapDirectories(state, map), chats: state.chats.map((chat) => this._mapDirectories(chat, map)) } };
    }
    if (hasKey(state, { workingDirectories: true })) {
      return { ...snapshot, state: this._mapDirectories(state, map) };
    }
    return snapshot;
  }
  /**
   * Maps directories in host notifications and response payloads back to workbench URIs.
   * Correlates responses with recorded request methods because JSON-RPC responses contain only the request ID.
   */
  _fromHost(message) {
    const map = (value2) => this._fromHostDirectory(value2);
    if (isJsonRpcNotification(message)) {
      switch (message.method) {
        case "action":
          return { ...message, params: { ...message.params, action: this._mapAction(message.params.action, map) } };
        case "root/sessionAdded":
          return { ...message, params: { ...message.params, summary: this._mapDirectories(message.params.summary, map) } };
        case "root/sessionSummaryChanged":
          return { ...message, params: { ...message.params, changes: this._mapDirectories(message.params.changes, map) } };
      }
    } else if (isJsonRpcResponse(message)) {
      const method = this._requests.get(message.id);
      this._requests.delete(message.id);
      if (hasKey(message, { result: true })) {
        switch (method) {
          case "initialize": {
            const result = message.result;
            return { ...message, result: { ...result, snapshots: result.snapshots.map((snapshot) => this._mapSnapshot(snapshot)) } };
          }
          case "subscribe": {
            const result = message.result;
            return result.snapshot ? { ...message, result: { ...result, snapshot: this._mapSnapshot(result.snapshot) } } : message;
          }
          case "reconnect": {
            const result = message.result;
            return result.type === "snapshot" /* Snapshot */ ? { ...message, result: { ...result, snapshots: result.snapshots.map((snapshot) => this._mapSnapshot(snapshot)) } } : { ...message, result: { ...result, actions: result.actions.map((envelope) => ({ ...envelope, action: this._mapAction(envelope.action, map) })) } };
          }
          case "listSessions": {
            const result = message.result;
            return { ...message, result: { ...result, items: result.items.map((item) => this._mapDirectories(item, map)) } };
          }
        }
      }
    }
    return message;
  }
  /** Clears response-correlation state and disposes the owned transport and event listeners. */
  dispose() {
    this._requests.clear();
    super.dispose();
  }
};
export { EditorRemoteAgentHostTransport };
