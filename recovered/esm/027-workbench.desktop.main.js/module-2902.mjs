// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionListStore.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { AgentSession } from "./module-1106.mjs";
import { readSessionMatchesByProjectRoot, readSessionMultiRootMetadata } from "./module-1007.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { extUriBiasedIgnorePathCase } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionListStore.ts
var AgentHostSessionListStore = class extends Disposable {
  constructor(_connection, _workspaceContextService, _logService) {
    super();
    this._connection = _connection;
    this._workspaceContextService = _workspaceContextService;
    this._logService = _logService;
    this._onDidChangeSessions = this._register(new Emitter());
    this.onDidChangeSessions = this._onDidChangeSessions.event;
    this._entries = /* @__PURE__ */ new Map();
    /**
     * Backend session keys for sessions a controller created locally (via
     * `newChatSessionItem`) that the backend has not yet announced. Tracked here
     * so per-provider controllers stay stateless; cleared once the backend
     * surfaces or removes the session.
     */
    this._pendingNewSessions = /* @__PURE__ */ new Set();
    this._cacheValid = false;
    /**
     * Incremented whenever the in-memory list is mutated outside of
     * {@link refresh}. Used to detect races where a `root/sessionAdded`,
     * `root/sessionRemoved`, or `root/sessionSummaryChanged` notification
     * arrives while a `listSessions()` round-trip is in flight.
     */
    this._mutationGeneration = 0;
    /** Sessions already reported as having an unusable (non-local) project root. */
    this._reportedNonLocalProjects = /* @__PURE__ */ new Set();
    this._register(this._connection.onDidNotification((n2) => this._onNotification(n2)));
    this._register(this._workspaceContextService.onDidChangeWorkspaceFolders(() => {
      this._cacheValid = false;
      this._filterEntriesToWorkspace();
      void this.refresh(CancellationToken.None);
    }));
  }
  getSessions(provider) {
    return [...this._entries.values()].filter((entry) => entry.provider === provider);
  }
  /** Record a session created locally before the backend has announced it. */
  addPendingNewSession(provider, rawId) {
    this._pendingNewSessions.add(this._key(provider, rawId));
  }
  /** Whether a session was created locally and the backend has not surfaced it yet. */
  isPendingNewSession(provider, rawId) {
    return this._pendingNewSessions.has(this._key(provider, rawId));
  }
  /** Stop treating a locally-created session as pending without adding it to the visible list. */
  clearPendingNewSession(provider, rawId) {
    this._pendingNewSessions.delete(this._key(provider, rawId));
  }
  resetCache() {
    this._cacheValid = false;
    this._mutationGeneration++;
  }
  async disposeSession(provider, rawId) {
    await this._connection.disposeSession(AgentSession.uri(provider, rawId));
  }
  setSessionArchived(provider, rawId, archived) {
    this._setSessionFlag(provider, rawId, 64 /* IsArchived */, archived, {
      type: "session/isArchivedChanged" /* SessionIsArchivedChanged */,
      isArchived: archived
    });
  }
  setSessionRead(provider, rawId, isRead) {
    this._setSessionFlag(provider, rawId, 32 /* IsRead */, isRead, {
      type: "session/isReadChanged" /* SessionIsReadChanged */,
      isRead
    });
  }
  /**
   * Optimistically flips a session-scoped status flag and dispatches the owning
   * action, so the host can fan the change out to other connected clients. An
   * uncached session still dispatches; the summary notification seeds the entry.
   */
  _setSessionFlag(provider, rawId, flag, set, action) {
    const session = AgentSession.uri(provider, rawId);
    const key3 = this._key(provider, rawId);
    const cached = this._entries.get(key3);
    let updated;
    if (cached) {
      const status2 = set ? cached.summary.status | flag : cached.summary.status & ~flag;
      if (status2 === cached.summary.status && cached.statusKnown) {
        return;
      }
      updated = { ...cached, statusKnown: true, summary: { ...cached.summary, status: status2 } };
    }
    this._mutationGeneration++;
    this._connection.dispatch(session.toString(), action);
    if (updated) {
      this._entries.set(key3, updated);
      this._onDidChangeSessions.fire({ addedOrUpdated: [updated] });
    }
  }
  removeSession(provider, rawId) {
    this._mutationGeneration++;
    this._removeSessionFromList(provider, rawId);
  }
  _removeSessionFromList(provider, rawId) {
    const key3 = this._key(provider, rawId);
    this._pendingNewSessions.delete(key3);
    const entry = this._entries.get(key3);
    if (!entry) {
      return;
    }
    this._entries.delete(key3);
    this._onDidChangeSessions.fire({ removed: [this._toRemoval(entry)] });
  }
  async refresh(token) {
    if (this._refreshInFlight) {
      return this._refreshInFlight;
    }
    this._refreshInFlight = this._doRefresh(token);
    try {
      await this._refreshInFlight;
    } finally {
      this._refreshInFlight = void 0;
    }
  }
  async _doRefresh(token) {
    if (this._cacheValid) {
      return;
    }
    const previousEntries = [...this._entries.values()];
    const startGeneration = this._mutationGeneration;
    let sessions;
    try {
      sessions = await this._connection.listSessions();
    } catch {
      return;
    }
    if (startGeneration !== this._mutationGeneration) {
      return this._doRefresh(token);
    }
    const nextEntries = [];
    for (const session of sessions) {
      const entry = this._makeEntryFromMetadata(session);
      if (entry) {
        if (this._isSessionInWorkspace(entry)) {
          nextEntries.push(entry);
        }
      }
    }
    this._entries.clear();
    for (const entry of nextEntries) {
      const key3 = this._key(entry.provider, entry.rawId);
      this._entries.set(key3, entry);
      this._pendingNewSessions.delete(key3);
    }
    this._cacheValid = true;
    const nextKeys = new Set(nextEntries.map((entry) => this._key(entry.provider, entry.rawId)));
    const removed = previousEntries.filter((entry) => !nextKeys.has(this._key(entry.provider, entry.rawId))).map((entry) => this._toRemoval(entry));
    if (nextEntries.length === 0 && removed.length === 0) {
      return;
    }
    this._onDidChangeSessions.fire({
      ...nextEntries.length > 0 ? { addedOrUpdated: nextEntries } : void 0,
      ...removed.length > 0 ? { removed } : void 0
    });
  }
  _onNotification(notification) {
    if (notification.type === "root/sessionAdded") {
      const entry = this._makeEntryFromSummary(notification.summary);
      if (!entry) {
        return;
      }
      const key3 = this._key(entry.provider, entry.rawId);
      if (!this._isSessionInWorkspace(entry)) {
        return;
      }
      this._mutationGeneration++;
      this._entries.set(key3, entry);
      this._pendingNewSessions.delete(key3);
      this._onDidChangeSessions.fire({ addedOrUpdated: [entry] });
    } else if (notification.type === "root/sessionRemoved") {
      const provider = AgentSession.provider(notification.session);
      if (!provider) {
        return;
      }
      this.removeSession(provider, AgentSession.id(notification.session));
    } else if (notification.type === "root/sessionSummaryChanged") {
      const provider = AgentSession.provider(notification.session);
      if (!provider) {
        return;
      }
      const rawId = AgentSession.id(notification.session);
      const key3 = this._key(provider, rawId);
      const cached = this._entries.get(key3);
      if (!cached) {
        return;
      }
      const updated = {
        provider,
        rawId,
        statusKnown: cached.statusKnown || notification.changes.status !== void 0,
        summary: { ...cached.summary, ...notification.changes }
      };
      if (!this._isSessionInWorkspace(updated)) {
        this._mutationGeneration++;
        this._removeSessionFromList(provider, rawId);
        return;
      }
      this._mutationGeneration++;
      this._entries.set(key3, updated);
      this._onDidChangeSessions.fire({ addedOrUpdated: [updated] });
    }
  }
  _makeEntryFromMetadata(session) {
    const provider = AgentSession.provider(session.session);
    if (!provider) {
      return void 0;
    }
    const rawId = AgentSession.id(session.session);
    return {
      provider,
      rawId,
      statusKnown: session.status !== void 0,
      summary: {
        resource: session.session.toString(),
        provider,
        title: session.summary ?? `Session ${rawId.substring(0, 8)}`,
        status: session.status ?? 1 /* Idle */,
        activity: session.activity,
        createdAt: new Date(session.startTime).toISOString(),
        modifiedAt: new Date(session.modifiedTime).toISOString(),
        changes: session.changes,
        workingDirectories: session.workingDirectories?.map((d) => d.toString()),
        // The repository root a worktree-isolated session belongs to; the
        // workspace filter matches on it because the worktree itself lives
        // outside the repository folder.
        ...session.project ? { project: { uri: session.project.uri.toString(), displayName: session.project.displayName } } : {},
        // Carry `_meta` so the adoptable-legacy marker survives into the list
        // item; consumers use it to avoid passively restoring (and thereby
        // migrating) an un-adopted legacy Copilot CLI session.
        ...session._meta !== void 0 ? { _meta: session._meta } : {}
      }
    };
  }
  _makeEntryFromSummary(summary) {
    const provider = summary.provider || AgentSession.provider(summary.resource);
    if (!provider) {
      return void 0;
    }
    return {
      provider,
      rawId: AgentSession.id(summary.resource),
      statusKnown: true,
      summary
    };
  }
  /** Uses workspace-file provenance for multi-root workspaces and path containment otherwise. */
  _isSessionInWorkspace(entry) {
    const inWorkspace = this._computeSessionInWorkspace(entry);
    if (!inWorkspace && readSessionMatchesByProjectRoot(entry.summary._meta) && entry.summary.project && URI.parse(entry.summary.project.uri).scheme !== Schemas.file && !this._reportedNonLocalProjects.has(entry.summary.resource)) {
      this._reportedNonLocalProjects.add(entry.summary.resource);
      this._logService.warn(`[AgentHost] legacy session ${entry.summary.resource} has a non-local project '${entry.summary.project.uri}' and cannot be matched to a workspace folder`);
    }
    return inWorkspace;
  }
  _computeSessionInWorkspace(entry) {
    const workingDirectories = this._containmentCandidates(entry.summary);
    const workspace = this._workspaceContextService.getWorkspace();
    const folders = workspace.folders;
    const configuration2 = workspace.configuration;
    const multiRoot = readSessionMultiRootMetadata(entry.summary._meta);
    if (multiRoot) {
      if (URI.isUri(configuration2)) {
        return extUriBiasedIgnorePathCase.isEqual(URI.parse(multiRoot.workspaceFile), configuration2);
      }
      return folders.length === 0 || this._matchesAnyFolder(workingDirectories, folders);
    }
    if (folders.length === 0) {
      return true;
    }
    return this._matchesAnyFolder(workingDirectories, folders);
  }
  _filterEntriesToWorkspace() {
    const removed = [];
    for (const [key3, entry] of this._entries) {
      if (!this._isSessionInWorkspace(entry)) {
        this._entries.delete(key3);
        this._pendingNewSessions.delete(key3);
        removed.push(this._toRemoval(entry));
      }
    }
    if (removed.length > 0) {
      this._mutationGeneration++;
      this._onDidChangeSessions.fire({ removed });
    }
  }
  _matchesAnyFolder(workingDirectories, folders) {
    return workingDirectories.some(
      (directory) => folders.some((folder) => extUriBiasedIgnorePathCase.isEqualOrParent(directory, folder.uri))
    );
  }
  /**
   * The directories a session may be matched against a workspace folder by: its
   * working directories plus - for legacy Copilot CLI sessions only - its
   * server-owned project (repository) root. Those legacy sessions run out of a
   * `copilot-worktrees/` directory outside the repository, so working
   * directories alone would hide them from a window opened on that repository.
   * The marker has to outlive adoption: a migrated session is still a legacy
   * session and must not drop out of the list the moment it migrates.
   */
  _containmentCandidates(summary) {
    const candidates = summary.workingDirectories?.map((directory) => URI.parse(directory)) ?? [];
    if (summary.project?.uri && readSessionMatchesByProjectRoot(summary._meta)) {
      const project = URI.parse(summary.project.uri);
      if (project.scheme === Schemas.file) {
        candidates.push(project);
      }
    }
    return candidates;
  }
  _toRemoval(entry) {
    return {
      provider: entry.provider,
      rawId: entry.rawId,
      session: AgentSession.uri(entry.provider, entry.rawId)
    };
  }
  _key(provider, rawId) {
    return `${provider}://${rawId}`;
  }
};

AgentHostSessionListStore = __decorateClass([
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, ILogService)
], AgentHostSessionListStore);
export { AgentHostSessionListStore };
