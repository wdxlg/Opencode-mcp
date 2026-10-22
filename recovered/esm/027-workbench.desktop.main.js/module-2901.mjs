// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionListController.ts
import { Disposable } from "./module-0012.mjs";
import { AgentSession } from "./module-1106.mjs";
import { Event2 } from "./module-0017.mjs";
import { generateUuid } from "./module-0190.mjs";
import { withEphemeralSessionMeta } from "./module-2900.mjs";
import { URI } from "./module-0032.mjs";
import { SESSION_META_EHCLI_ADOPTABLE_KEY, readSessionEhcliAdoptable } from "./module-1007.mjs";
import { getAgentSessionProviderIcon } from "./module-0982.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostUntitledProvisionalSessionService } from "./module-2124.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IAgentHostNewSessionFolderService } from "./module-2108.mjs";
import { IAgentHostImportConversationStore } from "./module-1477.mjs";
import { IChatService } from "./module-0972.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionListController.ts
function mapSessionStatus(status2) {
  if (status2 !== void 0 && (status2 & 24 /* InputNeeded */) === 24 /* InputNeeded */) {
    return 3 /* NeedsInput */;
  }
  if (status2 !== void 0 && status2 & 8 /* InProgress */) {
    return 2 /* InProgress */;
  }
  if (status2 !== void 0 && status2 & 2 /* Error */) {
    return 0 /* Failed */;
  }
  return 1 /* Completed */;
}

var AgentHostSessionListController = class extends Disposable {
  constructor(_sessionType, _provider, _sessionListStore, _description, _connectionAuthority, _provisional, _workspaceContextService, _newSessionFolderService, _importConversationStore, chatService) {
    super();
    this._sessionType = _sessionType;
    this._provider = _provider;
    this._sessionListStore = _sessionListStore;
    this._description = _description;
    this._provisional = _provisional;
    this._workspaceContextService = _workspaceContextService;
    this._newSessionFolderService = _newSessionFolderService;
    this._importConversationStore = _importConversationStore;
    void _connectionAuthority;
    this._register(chatService.onDidDisposeSession((event) => {
      for (const resource of event.sessionResources) {
        if (resource.scheme === this._sessionType) {
          this._sessionListStore.clearPendingNewSession(this._provider, AgentSession.id(resource));
        }
      }
    }));
    this.onDidChangeChatSessionItems = Event2.filter(
      Event2.map(this._sessionListStore.onDidChangeSessions, (delta2) => this._projectDelta(delta2), this._store),
      (delta2) => delta2 !== void 0,
      this._store
    );
  }
  get items() {
    return this._sessionListStore.getSessions(this._provider).map((entry) => this._makeItemFromSummary(entry.rawId, entry.summary, entry.statusKnown));
  }
  isNewSession(resource) {
    return resource.scheme === this._sessionType && this._sessionListStore.isPendingNewSession(this._provider, resource.path.substring(1));
  }
  notifySessionMaterialized(resource) {
    if (resource.scheme === this._sessionType) {
      this._sessionListStore.clearPendingNewSession(this._provider, AgentSession.id(resource));
    }
  }
  async newChatSessionItem(request2, token) {
    if (token.isCancellationRequested) {
      return void 0;
    }
    const rawId = generateUuid();
    this._sessionListStore.addPendingNewSession(this._provider, rawId);
    const now = Date.now();
    const item = this._makeItem(rawId, {
      title: request2.prompt.trim(),
      status: 8 /* InProgress */,
      createdAt: now,
      modifiedAt: now
    });
    const metadata = withEphemeralSessionMeta(request2._meta, request2.isEphemeral ? true : void 0);
    if (metadata) {
      this._provisional.setSessionCreationMetadata(item.resource, metadata);
    }
    if (request2.untitledResource) {
      const workingDirectory = this._newSessionFolderService.getFolder(request2.untitledResource) ?? this._newSessionFolderService.getDefaultFolder() ?? this._workspaceContextService.getWorkspace().folders[0]?.uri;
      if (workingDirectory) {
        this._newSessionFolderService.setFolder(item.resource, workingDirectory);
      }
      this._importConversationStore.rename(request2.untitledResource, item.resource);
      await this._provisional.tryRebind(request2.untitledResource, item.resource, this._provider);
    }
    return item;
  }
  async deleteChatSessionItem(resource, _token) {
    if (resource.scheme !== this._sessionType) {
      return;
    }
    const rawId = AgentSession.id(resource);
    await this._sessionListStore.disposeSession(this._provider, rawId);
    this._sessionListStore.removeSession(this._provider, rawId);
  }
  setChatSessionItemArchived(resource, archived) {
    if (resource.scheme !== this._sessionType) {
      return;
    }
    this._sessionListStore.setSessionArchived(this._provider, AgentSession.id(resource), archived);
  }
  setChatSessionItemRead(resource, isRead) {
    if (resource.scheme !== this._sessionType) {
      return;
    }
    this._sessionListStore.setSessionRead(this._provider, AgentSession.id(resource), isRead);
  }
  async refresh(token) {
    await this._sessionListStore.refresh(token);
  }
  _projectDelta(delta2) {
    let addedOrUpdated;
    for (const entry of delta2.addedOrUpdated ?? []) {
      if (entry.provider !== this._provider) {
        continue;
      }
      (addedOrUpdated ??= []).push(this._makeItemFromSummary(entry.rawId, entry.summary, entry.statusKnown));
    }
    let removed;
    for (const removal of delta2.removed ?? []) {
      if (removal.provider !== this._provider) {
        continue;
      }
      (removed ??= []).push(this._resource(removal.rawId));
    }
    if (!addedOrUpdated && !removed) {
      return void 0;
    }
    return { ...addedOrUpdated ? { addedOrUpdated } : void 0, ...removed ? { removed } : void 0 };
  }
  _makeItemFromSummary(rawId, summary, statusKnown) {
    const workingDir = typeof summary.workingDirectories?.[0] === "string" ? URI.parse(summary.workingDirectories?.[0]) : summary.workingDirectories?.[0];
    return this._makeItem(rawId, {
      title: summary.title,
      status: summary.status,
      statusKnown,
      activity: summary.activity,
      workingDirectory: workingDir,
      createdAt: Date.parse(summary.createdAt),
      modifiedAt: Date.parse(summary.modifiedAt),
      changesSummary: summary.changes,
      adoptable: readSessionEhcliAdoptable(summary._meta)
    });
  }
  _makeItem(rawId, opts) {
    const inProgress = opts.status !== void 0 && (opts.status & 8 /* InProgress */) !== 0;
    const description = inProgress && opts.activity ? opts.activity : this._description;
    const metadata = opts.adoptable ? { ...this._buildMetadata(opts.workingDirectory) ?? {}, [SESSION_META_EHCLI_ADOPTABLE_KEY]: true } : this._buildMetadata(opts.workingDirectory);
    return {
      resource: this._resource(rawId),
      label: opts.title || `Session ${rawId.substring(0, 8)}`,
      description,
      iconPath: getAgentSessionProviderIcon(this._sessionType),
      status: mapSessionStatus(opts.status),
      archived: opts.status !== void 0 && (opts.status & 64 /* IsArchived */) === 64 /* IsArchived */,
      // Without a host-provided status there is no opinion on read state —
      // a pending new session, or a cold one the host has no record for.
      // Leave it unset rather than reporting the synthesized bit as unread.
      isRead: opts.status !== void 0 && opts.statusKnown !== false ? (opts.status & 32 /* IsRead */) === 32 /* IsRead */ : void 0,
      metadata,
      timing: {
        created: opts.createdAt,
        lastRequestStarted: opts.modifiedAt,
        lastRequestEnded: opts.modifiedAt
      },
      changes: opts.changesSummary ? {
        files: opts.changesSummary.files ?? 0,
        insertions: opts.changesSummary.additions ?? 0,
        deletions: opts.changesSummary.deletions ?? 0
      } : void 0
    };
  }
  _resource(rawId) {
    return URI.from({ scheme: this._sessionType, path: `/${rawId}` });
  }
  _buildMetadata(workingDirectory) {
    if (!this._description && !workingDirectory) {
      return void 0;
    }
    const result = {};
    if (this._description) {
      result.remoteAgentHost = this._description;
    }
    if (workingDirectory) {
      result.workingDirectoryPath = workingDirectory.fsPath;
    }
    return Object.keys(result).length > 0 ? result : void 0;
  }
};

AgentHostSessionListController = __decorateClass([
  __decorateParam(5, IAgentHostUntitledProvisionalSessionService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, IAgentHostNewSessionFolderService),
  __decorateParam(8, IAgentHostImportConversationStore),
  __decorateParam(9, IChatService)
], AgentHostSessionListController);
export { mapSessionStatus, AgentHostSessionListController };
