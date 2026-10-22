// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionTurnChanges.ts
import { AbstractChatResponseFileChangesService } from "./module-2233.mjs";
import { extUriBiasedIgnorePathCase, isEqual2 } from "./module-0034.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { TURN_CHANGES_CHANGESET_ID } from "./module-1767.mjs";
import { isAgentHostProviderId } from "./module-1764.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { derived } from "./module-0054.mjs";
import { constObservable } from "./module-0061.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionChangesService } from "./module-3646.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { IChangesViewService } from "./module-3645.mjs";


// src/vs/sessions/contrib/chat/browser/sessionTurnChanges.ts
function changeStatsEqual(a, b) {
  return a.files === b.files && a.insertions === b.insertions && a.deletions === b.deletions;
}

var SessionsChatResponseFileChangesService = class extends AbstractChatResponseFileChangesService {
  constructor(_editorService, _sessionsManagementService, _sessionsService, _sessionChangesService, _layoutService, _changesViewService) {
    super();
    this._editorService = _editorService;
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsService = _sessionsService;
    this._sessionChangesService = _sessionChangesService;
    this._layoutService = _layoutService;
    this._changesViewService = _changesViewService;
  }
  getChangeStatsForRequest(sessionResource, requestId, context2) {
    if (!context2.isLastTurn) {
      return void 0;
    }
    const owner = this._sessionsManagementService.getSessionForChatResource(sessionResource);
    if (!owner || !isEqual2(this._changesViewService.activeSessionResourceObs.get(), owner.session.resource)) {
      return void 0;
    }
    const requestChanges = this.getChangesForRequest(sessionResource, requestId);
    return derivedObservableWithCache(this, (reader, lastValue) => {
      const readRequestStats = () => {
        const changes = requestChanges?.read(reader) ?? [];
        let insertions = 0, deletions = 0;
        for (const change of changes) {
          insertions += change.added;
          deletions += change.removed;
        }
        return { files: changes.length, insertions, deletions };
      };
      let stats;
      if (!isEqual2(this._changesViewService.activeSessionResourceObs.read(reader), owner.session.resource) || !this._isMostRecentChat(owner.session, owner.chat, reader)) {
        stats = readRequestStats();
      } else {
        const changeset = this._changesViewService.activeSessionChangesetsObs.read(reader)?.find((candidate) => candidate.id === TURN_CHANGES_CHANGESET_ID && candidate.isEnabled.read(reader));
        if (!changeset) {
          stats = readRequestStats();
        } else if (changeset.isLoadingChanges.read(reader)) {
          return lastValue ?? readRequestStats();
        } else {
          const changes = changeset.changes.read(reader);
          let insertions = 0, deletions = 0;
          for (const change of changes) {
            insertions += change.insertions;
            deletions += change.deletions;
          }
          stats = { files: changes.length, insertions, deletions };
        }
      }
      return lastValue && changeStatsEqual(lastValue, stats) ? lastValue : stats;
    });
  }
  openChangesForRequest(chatResource, requestId, context2) {
    const owner = this._sessionsManagementService.getSessionForChatResource(chatResource);
    if (!owner) {
      this._openStandaloneChanges(chatResource, requestId);
      return;
    }
    if (context2.isLastTurn) {
      if (requestId === void 0) {
        if (isAgentHostProviderId(owner.session.providerId)) {
          void this._openSessionTurnChanges(owner.session);
        } else {
          const changes3 = owner.chat.lastTurnChanges;
          if (changes3) {
            this._openTransientLastTurnChanges(owner.session, owner.chat.resource.toString(), changes3);
          }
        }
        return;
      }
      if (this._isMostRecentChat(owner.session, owner.chat)) {
        void this._openSessionTurnChanges(owner.session);
        return;
      }
      const changes2 = this._getSessionFileChanges(owner.session, chatResource, requestId);
      if (changes2) {
        this._openTransientLastTurnChanges(owner.session, requestId, changes2);
      }
      return;
    }
    if (requestId === void 0) {
      return;
    }
    const changes = this.getChangesForRequest(chatResource, requestId);
    if (!changes) {
      this._openStandaloneChanges(chatResource, requestId);
      return;
    }
    void this._openSessionTurnChanges(owner.session, {
      id: `${TURN_CHANGES_CHANGESET_ID}:${requestId}`,
      label: localize(4707, null),
      description: localize(4706, null),
      changes: this._toSessionFileChanges(owner.session, changes)
    });
  }
  _openStandaloneChanges(chatResource, requestId) {
    if (requestId === void 0) {
      return;
    }
    const diffs = this.getChangesForRequest(chatResource, requestId)?.get();
    if (!diffs?.length) {
      return;
    }
    const source = URI.parse(`multi-diff-editor:${Date.now().toString()}-${Math.random().toString(36).slice(2)}`);
    this._editorService.openEditor({
      multiDiffSource: source,
      label: localize(4705, null),
      resources: diffs.map((diff4) => ({
        original: { resource: diff4.originalURI },
        modified: { resource: diff4.modifiedURI }
      }))
    });
  }
  _isMostRecentChat(session, chat, reader) {
    const mostRecentChat = session.chats.read(reader).reduce(
      (latest, candidate) => !latest || candidate.updatedAt.read(reader).getTime() > latest.updatedAt.read(reader).getTime() ? candidate : latest,
      void 0
    );
    return isEqual2(mostRecentChat?.resource ?? session.mainChat.read(reader).resource, chat.resource);
  }
  _getSessionFileChanges(session, chatResource, requestId) {
    const changes = this.getChangesForRequest(chatResource, requestId);
    return changes ? this._toSessionFileChanges(session, changes) : void 0;
  }
  _toSessionFileChanges(session, changes) {
    return derived((reader) => {
      const workspace = session.workspace?.read(reader);
      const workspaceFolders = workspace?.folders.flatMap((folder) => [folder.root, folder.workingDirectory]) ?? [];
      return changes.read(reader).filter((diff4) => workspaceFolders.some((folder) => extUriBiasedIgnorePathCase.isEqualOrParent(folder.with({ path: diff4.modifiedURI.path }), folder))).map((diff4) => ({
        uri: diff4.modifiedURI,
        originalUri: isEqual2(diff4.originalURI, diff4.modifiedURI) ? void 0 : diff4.originalURI,
        modifiedUri: diff4.isDeleted ? void 0 : diff4.modifiedSnapshotURI ?? diff4.modifiedURI,
        insertions: diff4.added,
        deletions: diff4.removed
      }));
    });
  }
  _openTransientLastTurnChanges(session, id2, changes) {
    void this._openSessionTurnChanges(session, {
      id: `${TURN_CHANGES_CHANGESET_ID}:${id2}`,
      label: localize(4709, null),
      description: localize(4708, null),
      changes
    });
  }
  async _openSessionTurnChanges(session, transientTurn) {
    if (!isEqual2(this._sessionsService.activeSession.get()?.resource, session.resource)) {
      this._sessionsService.showSession(session.resource, { preserveFocus: true });
    }
    this._layoutService.revealEditorPartExplicitly();
    const changesetSelection = transientTurn ? {
      kind: "transient",
      changeset: {
        id: transientTurn.id,
        label: transientTurn.label,
        description: transientTurn.description,
        isEnabled: constObservable(true),
        isDefault: constObservable(false),
        isLoadingChanges: constObservable(false),
        changes: transientTurn.changes,
        operations: constObservable([]),
        originalCheckpointRef: constObservable(void 0),
        modifiedCheckpointRef: constObservable(void 0),
        async invokeOperation(operationId) {
          throw new Error(`Historical turn changes do not support operation '${operationId}'`);
        }
      }
    } : { kind: "id", id: TURN_CHANGES_CHANGESET_ID };
    await this._sessionChangesService.openChangesEditor(session.resource, { changesetSelection });
  }
};

SessionsChatResponseFileChangesService = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, ISessionsManagementService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, ISessionChangesService),
  __decorateParam(4, IAgentWorkbenchLayoutService),
  __decorateParam(5, IChangesViewService)
], SessionsChatResponseFileChangesService);
export { changeStatsEqual, SessionsChatResponseFileChangesService };
