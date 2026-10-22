// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostResponseFileChanges.ts
import { getComparisonKey, isEqual2, isEqualOrParent2 } from "./module-0034.mjs";
import { Disposable } from "./module-0012.mjs";
import { LRUCache } from "./module-0008.mjs";
import { constObservable } from "./module-0061.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { URI } from "./module-0032.mjs";
import { buildTurnChangesetUri } from "./module-2892.mjs";
import { derivedObservableWithCache, mapObservableArrayCached } from "./module-0059.mjs";
import { isDefined } from "./module-0010.mjs";
import { buildDefaultChatUri } from "./module-1007.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { normalizeFileEdit } from "./module-2242.mjs";
import { toAgentHostContentUri, toAgentHostUri } from "./module-1000.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostResponseFileChanges.ts
var SUBSCRIPTION_OWNER = "AgentHostResponseFileChangesProvider";

var REQUEST_CACHE_CAPACITY = 1e3;

function uriArrayEquals(a, b) {
  return a.length === b.length && a.every((uri5, index2) => isEqual2(uri5, b[index2]));
}

function getToolCallFileEdits(toolCall) {
  const edits = [];
  if (toolCall.status === "running" /* Running */ || toolCall.status === "completed" /* Completed */ || toolCall.status === "pending-result-confirmation" /* PendingResultConfirmation */) {
    for (const content2 of toolCall.content ?? []) {
      if (content2.type === "fileEdit" /* FileEdit */) {
        edits.push(content2);
      }
    }
  } else if (toolCall.status === "pending-confirmation" /* PendingConfirmation */) {
    edits.push(...toolCall.edits?.items ?? []);
  }
  return edits;
}

var AgentHostResponseFileChangesProvider = class extends Disposable {
  constructor(_connection, _connectionAuthority, _resolveBackendSession, _resolveBackendChat, _logService) {
    super();
    this._connection = _connection;
    this._connectionAuthority = _connectionAuthority;
    this._resolveBackendSession = _resolveBackendSession;
    this._resolveBackendChat = _resolveBackendChat;
    this._logService = _logService;
    this._perRequest = new LRUCache(REQUEST_CACHE_CAPACITY);
    this._perRequestFileEdits = new LRUCache(REQUEST_CACHE_CAPACITY);
  }
  getChangesForRequest(sessionResource, requestId) {
    const backendSession = this._resolveBackendSession(sessionResource);
    if (!backendSession || !requestId) {
      return void 0;
    }
    const backendChat = this._resolveBackendChat?.(sessionResource);
    const key3 = `${backendSession.toString()}\0${backendChat?.toString() ?? ""}\0${requestId}`;
    let obs = this._perRequest.get(key3);
    if (!obs) {
      obs = this._createDiffsObservable(backendSession, backendChat, requestId);
      this._perRequest.set(key3, obs);
    }
    return obs;
  }
  getFileEditsForRequest(sessionResource, requestId) {
    const backendSession = this._resolveBackendSession(sessionResource);
    if (!backendSession || !requestId) {
      return void 0;
    }
    const backendChat = this._resolveBackendChat?.(sessionResource);
    const key3 = `${backendSession.toString()}\0${backendChat?.toString() ?? ""}\0${requestId}`;
    let obs = this._perRequestFileEdits.get(key3);
    if (!obs) {
      obs = this._createFileEditDiffsObservable(backendSession, backendChat, requestId);
      this._perRequestFileEdits.set(key3, obs);
    }
    return obs;
  }
  _createDiffsObservable(backendSession, backendChat, requestId) {
    const sessionStateObs = this._subscribe(1 /* Session */, constObservable(backendSession));
    const turnChangesetUriObs = derivedOpts({ equalsFn: isEqual2 }, (reader) => {
      const sessionState = sessionStateObs.read(reader).read(reader);
      if (!sessionState || sessionState instanceof Error) {
        return void 0;
      }
      const supportsTurnChangeset = sessionState.changesets?.some((c) => c.changeKind === "turn" /* Turn */);
      if (!supportsTurnChangeset) {
        return void 0;
      }
      return URI.parse(buildTurnChangesetUri(backendSession.toString(), requestId));
    });
    const changesetStateObs = this._subscribe(4 /* Changeset */, turnChangesetUriObs);
    const responseFileEditsObs = this._createFileEditDiffsObservable(backendSession, backendChat, requestId);
    let lastSource;
    const select = (source, diffs, status2) => {
      if (source !== lastSource) {
        lastSource = source;
        this._logService.trace(`[AgentHostResponseFileChanges] ${backendSession.toString()} turn ${requestId}: diffs from '${source}' (files=${diffs.length}, changesetStatus=${status2 ?? "none"})`);
      }
      return diffs;
    };
    return derivedObservableWithCache(this, (reader, lastValue) => {
      const retained = lastValue ?? [];
      if (!turnChangesetUriObs.read(reader)) {
        return select("unsupported", retained);
      }
      const changesetState = changesetStateObs.read(reader).read(reader);
      const changeset = changesetState instanceof Error ? void 0 : changesetState;
      const changesetDiffs = changeset?.files.map((file) => this._changesetFileToEntryDiff(file)).filter(isDefined);
      if (changesetDiffs?.length) {
        return select("changeset", changesetDiffs, changeset?.status);
      }
      if (changeset?.status === "ready" /* Ready */ && retained.length === 0) {
        return select("authoritativeEmpty", [], changeset.status);
      }
      const responseDiffs = responseFileEditsObs.read(reader);
      return responseDiffs.length ? select("response", responseDiffs, changeset?.status) : select("retained", retained, changeset?.status);
    });
  }
  _createFileEditDiffsObservable(backendSession, backendChat, requestId) {
    const sessionStateObs = this._subscribe(1 /* Session */, constObservable(backendSession));
    const defaultChatUri = URI.parse(buildDefaultChatUri(backendSession.toString()));
    const chatUrisObs = derivedOpts({ equalsFn: uriArrayEquals }, (reader) => {
      if (backendChat) {
        return [backendChat];
      }
      const sessionState = sessionStateObs.read(reader).read(reader);
      if (!sessionState || sessionState instanceof Error) {
        return [defaultChatUri];
      }
      const uris = /* @__PURE__ */ new Map();
      uris.set(defaultChatUri.toString(), defaultChatUri);
      for (const chat of sessionState.chats ?? []) {
        const uri5 = URI.parse(chat.resource);
        uris.set(uri5.toString(), uri5);
      }
      return [...uris.values()];
    });
    const chatStateObs = mapObservableArrayCached(this, chatUrisObs, (chatUri) => {
      const obs = this._subscribe(2 /* Chat */, constObservable(chatUri));
      return derived((reader) => obs.read(reader).read(reader));
    }, (chatUri) => chatUri.toString());
    return derived((reader) => {
      const sessionState = sessionStateObs.read(reader).read(reader);
      const workspaceRoots = [];
      if (sessionState && !(sessionState instanceof Error)) {
        const roots = /* @__PURE__ */ new Map();
        for (const root of [sessionState.project?.uri, ...sessionState.workingDirectories ?? []]) {
          if (root) {
            const uri5 = URI.parse(root);
            roots.set(uri5.toString(), uri5);
          }
        }
        workspaceRoots.push(...roots.values());
      }
      for (const obs of chatStateObs.read(reader)) {
        const chatState = obs.read(reader);
        if (!chatState || chatState instanceof Error) {
          continue;
        }
        const turn = chatState.activeTurn?.id === requestId ? chatState.activeTurn : chatState.turns.find((turn2) => turn2.id === requestId);
        if (turn) {
          return this._responsePartsToEntryDiffs(turn.responseParts, workspaceRoots);
        }
      }
      return [];
    });
  }
  /**
   * Builds a two-level observable that owns a refcounted subscription to
   * `component` at the (observable) resource. The outer observable acquires
   * the subscription against the current resource and releases it when the
   * resource changes or no one observes; the inner observable tracks the
   * subscription's value.
   */
  _subscribe(component, resourceObs) {
    return derived((reader) => {
      const resource = resourceObs.read(reader);
      if (!resource) {
        return constObservable(void 0);
      }
      const subscriptionRef = reader.store.add(this._connection.getSubscription(component, resource, SUBSCRIPTION_OWNER));
      return observableFromEvent(this, subscriptionRef.object.onDidChange, () => subscriptionRef.object.value);
    });
  }
  _responsePartsToEntryDiffs(responseParts, workspaceRoots) {
    const byUri = /* @__PURE__ */ new Map();
    for (const responsePart of responseParts) {
      if (responsePart.kind !== "toolCall" /* ToolCall */) {
        continue;
      }
      for (const fileEdit of getToolCallFileEdits(responsePart.toolCall)) {
        const diff4 = this._fileEditToEntryDiff(fileEdit, workspaceRoots);
        if (!diff4) {
          continue;
        }
        const key3 = getComparisonKey(diff4.modifiedURI);
        const existing = byUri.get(key3);
        if (existing) {
          existing.added += diff4.added;
          existing.removed += diff4.removed;
        } else {
          byUri.set(key3, diff4);
        }
      }
    }
    return [...byUri.values()];
  }
  _fileEditToEntryDiff(fileEdit, workspaceRoots) {
    const normalized = normalizeFileEdit(fileEdit);
    if (!normalized || !normalized.afterUri) {
      return void 0;
    }
    const afterUri = normalized.afterUri;
    const modifiedURI = toAgentHostUri(afterUri, this._connectionAuthority);
    const originalURI = normalized.kind === "create" /* Create */ || !normalized.beforeContentUri ? modifiedURI : toAgentHostContentUri(normalized.beforeContentUri, this._connectionAuthority);
    const modifiedSnapshotURI = normalized.afterContentUri ? toAgentHostContentUri(normalized.afterContentUri, this._connectionAuthority) : void 0;
    return {
      originalURI,
      modifiedURI,
      modifiedSnapshotURI,
      added: fileEdit.diff?.added ?? 0,
      removed: fileEdit.diff?.removed ?? 0,
      quitEarly: false,
      identical: false,
      isFinal: true,
      isBusy: false,
      isOutsideWorkspace: !workspaceRoots.some((root) => isEqualOrParent2(afterUri, root))
    };
  }
  _changesetFileToEntryDiff(file) {
    const normalized = normalizeFileEdit(file.edit);
    if (!normalized) {
      return void 0;
    }
    const modifiedURI = toAgentHostUri(normalized.resource, this._connectionAuthority);
    const originalURI = normalized.beforeContentUri ? toAgentHostContentUri(normalized.beforeContentUri, this._connectionAuthority) : modifiedURI;
    const modifiedSnapshotURI = normalized.afterContentUri ? toAgentHostContentUri(normalized.afterContentUri, this._connectionAuthority) : void 0;
    return {
      originalURI,
      modifiedURI,
      modifiedSnapshotURI,
      isDeleted: normalized.kind === "delete" /* Delete */,
      added: file.edit.diff?.added ?? 0,
      removed: file.edit.diff?.removed ?? 0,
      quitEarly: false,
      identical: false,
      isFinal: true,
      isBusy: false
    };
  }
};
export { uriArrayEquals, getToolCallFileEdits, SUBSCRIPTION_OWNER, REQUEST_CACHE_CAPACITY, AgentHostResponseFileChangesProvider };
