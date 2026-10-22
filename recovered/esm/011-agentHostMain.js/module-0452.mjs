// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostChangesetFileMonitorCoordinator.ts
import { Disposable, DisposableMap, ReferenceCollection } from "./module-0010.mjs";
import { SequencerByKey } from "./module-0027.mjs";
import { buildBranchChangesetUri, buildSessionChangesetUri, buildUncommittedChangesetUri } from "./module-0097.mjs";
import { getEffectiveWorkingDirectories, getEffectiveWorkingDirectory } from "./module-0104.mjs";
import { URI } from "./module-0023.mjs";
import { resolveSessionRepositories } from "./module-0451.mjs";
import { DEFAULT_AGENT_HOST_WATCH_EXCLUDES, IAgentHostFileMonitorService } from "./module-0450.mjs";
import { parseSubagentSessionUri } from "./module-0047.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IAgentHostGitService } from "./module-0162.mjs";
import { IAgentHostGitStateService } from "./module-0445.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostChangesetFileMonitorCoordinator.ts
var WatchInterestReferenceCollection = class extends ReferenceCollection {
  constructor(_create, _destroy) {
    super();
    this._create = _create;
    this._destroy = _destroy;
  }
  createReferencedObject(sessionStr) {
    this._create(sessionStr);
    return sessionStr;
  }
  destroyReferencedObject(sessionStr) {
    this._destroy(sessionStr);
  }
};

var ChangesetFileMonitorCoordinator = class extends Disposable {
  constructor(_stateManager, _fileMonitorService, _gitService, _gitStateService, _logService) {
    super();
    this._stateManager = _stateManager;
    this._fileMonitorService = _fileMonitorService;
    this._gitService = _gitService;
    this._gitStateService = _gitStateService;
    this._logService = _logService;
    /** Per-subscription references into the per-session watch-interest collection. */
    this._watchInterestReferences = this._register(new DisposableMap());
    this._watchInterestCollection = new WatchInterestReferenceCollection(
      (sessionStr) => this._attachWatcherIfPossible(sessionStr),
      (sessionStr) => this._destroyWatchInterest(sessionStr)
    );
    /** Sessions waiting for materialization before a root watcher can attach. */
    this._pendingWatchInterest = /* @__PURE__ */ new Set();
    /** Session URI string to a stable signature of the working-directory set that produced the current root attachments. */
    this._sessionWorkingDirectories = /* @__PURE__ */ new Map();
    /** Session URI string to the set of repository-root URI strings it is watching. */
    this._sessionRoots = /* @__PURE__ */ new Map();
    /** Repository-root URI string to sessions currently fanned out from that root. */
    this._rootSessions = /* @__PURE__ */ new Map();
    /** Repository-root URI string to the shared monitor acquisition. */
    this._rootWatchAcquisitions = this._register(new DisposableMap());
    /** Repository-root URI string to the canonical repository root URI. */
    this._rootUris = /* @__PURE__ */ new Map();
    /** Active session URI string to repository-root URI string. */
    this._activeSessionRoots = /* @__PURE__ */ new Map();
    /** Repository-root URI string to sessions currently active against that root. */
    this._rootActiveSessions = /* @__PURE__ */ new Map();
    /** Active sessions whose repository root cannot yet be resolved. */
    this._unresolvedActiveSessions = /* @__PURE__ */ new Set();
    this._watchAttachmentSequencer = new SequencerByKey();
    this._activeTurnSequencer = new SequencerByKey();
  }
  trackSessionChanges(subscriptionKey, sessionStr) {
    if (!this._watchInterestReferences.has(subscriptionKey)) {
      this._watchInterestReferences.set(subscriptionKey, this._watchInterestCollection.acquire(sessionStr));
    }
  }
  untrackSessionChanges(subscriptionKey) {
    this._watchInterestReferences.deleteAndDispose(subscriptionKey);
  }
  onSessionRestored(sessionStr) {
    this._retryWatchAttachment(sessionStr);
  }
  onSessionMaterialized(sessionStr) {
    this._retryWatchAttachment(sessionStr);
  }
  /**
   * Re-attach a session's root watchers when its effective working-directory
   * set changes (a folder added or removed, e.g. in the Editor Window). The
   * signature guard in `_attachWatcherIfPossible` makes an unchanged set a
   * no-op, so this is cheap; an active (mid-turn) session is instead re-attached
   * by the turn lifecycle on turn end.
   */
  onSessionWorkingDirectoriesChanged(sessionStr) {
    this._retryWatchAttachment(sessionStr);
  }
  onSessionDisposed(sessionStr) {
    this.untrackSessionChanges(buildUncommittedChangesetUri(sessionStr));
    this.untrackSessionChanges(buildSessionChangesetUri(sessionStr));
    this.untrackSessionChanges(buildBranchChangesetUri(sessionStr));
    this.untrackSessionChanges(sessionStr);
    this._removeActiveSession(sessionStr);
    this._destroyWatchInterest(sessionStr);
  }
  onSessionTurnActiveChanged(sessionStr, active) {
    this._activeTurnSequencer.queue(sessionStr, async () => {
      if (active) {
        await this._markSessionActive(sessionStr);
      } else {
        this._markSessionInactive(sessionStr);
      }
    });
  }
  _destroyWatchInterest(sessionStr) {
    this._pendingWatchInterest.delete(sessionStr);
    this._releaseSessionRoots(sessionStr);
  }
  _retryWatchAttachment(sessionStr) {
    if (this._shouldAttachSession(sessionStr) || this._pendingWatchInterest.has(sessionStr)) {
      this._attachWatcherIfPossible(sessionStr);
    }
  }
  _hasWatchInterest(sessionStr) {
    return this._watchInterestReferences.has(sessionStr) || this._watchInterestReferences.has(buildBranchChangesetUri(sessionStr)) || this._watchInterestReferences.has(buildUncommittedChangesetUri(sessionStr)) || this._watchInterestReferences.has(buildSessionChangesetUri(sessionStr));
  }
  _attachWatcherIfPossible(sessionStr) {
    this._watchAttachmentSequencer.queue(sessionStr, async () => {
      if (!this._shouldAttachSession(sessionStr)) {
        return;
      }
      const workingDirectories = getEffectiveWorkingDirectories(this._stateManager, sessionStr);
      if (!workingDirectories || workingDirectories.length === 0) {
        this._pendingWatchInterest.add(sessionStr);
        this._releaseSessionRoots(sessionStr);
        return;
      }
      const workingDirectoryUris = [];
      for (const workingDirectory of workingDirectories) {
        try {
          workingDirectoryUris.push(URI.parse(workingDirectory));
        } catch (err) {
          this._logService.warn(`[ChangesetFileMonitorCoordinator] Failed to parse working directory URI for ${sessionStr}: ${workingDirectory}`, err);
        }
      }
      if (workingDirectoryUris.length === 0) {
        this._pendingWatchInterest.add(sessionStr);
        this._releaseSessionRoots(sessionStr);
        return;
      }
      const signature = this._workingDirectoriesSignature(workingDirectories);
      if (this._sessionRoots.has(sessionStr) && this._sessionWorkingDirectories.get(sessionStr) === signature) {
        this._pendingWatchInterest.delete(sessionStr);
        return;
      }
      const { gitRepositories } = await resolveSessionRepositories(workingDirectoryUris, this._gitService);
      if (!this._shouldAttachSession(sessionStr)) {
        return;
      }
      if (gitRepositories.length === 0) {
        this._pendingWatchInterest.delete(sessionStr);
        this._releaseSessionRoots(sessionStr);
        return;
      }
      this._pendingWatchInterest.delete(sessionStr);
      this._attachSessionToRoots(sessionStr, gitRepositories, signature);
    });
  }
  _attachSessionToRoots(sessionStr, repositoryRoots, signature) {
    const desiredRoots = /* @__PURE__ */ new Map();
    for (const repositoryRoot of repositoryRoots) {
      desiredRoots.set(repositoryRoot.toString(), repositoryRoot);
    }
    const current = this._sessionRoots.get(sessionStr);
    if (current) {
      for (const rootStr of [...current]) {
        if (!desiredRoots.has(rootStr)) {
          current.delete(rootStr);
          this._detachRootSession(sessionStr, rootStr);
        }
      }
    }
    let sessionRoots = this._sessionRoots.get(sessionStr);
    if (!sessionRoots) {
      sessionRoots = /* @__PURE__ */ new Set();
      this._sessionRoots.set(sessionStr, sessionRoots);
    }
    let allRootsWatched = true;
    for (const [rootStr, repositoryRoot] of desiredRoots) {
      let sessions = this._rootSessions.get(rootStr);
      if (!sessions) {
        sessions = /* @__PURE__ */ new Set();
        this._rootSessions.set(rootStr, sessions);
        this._rootUris.set(rootStr, repositoryRoot);
      }
      sessions.add(sessionStr);
      sessionRoots.add(rootStr);
      if (!this._ensureRootWatcher(rootStr, repositoryRoot)) {
        allRootsWatched = false;
      }
    }
    if (allRootsWatched) {
      this._sessionWorkingDirectories.set(sessionStr, signature);
    } else {
      this._sessionWorkingDirectories.delete(sessionStr);
    }
  }
  _releaseSessionRoots(sessionStr) {
    this._sessionWorkingDirectories.delete(sessionStr);
    const rootStrs = this._sessionRoots.get(sessionStr);
    if (!rootStrs) {
      return;
    }
    this._sessionRoots.delete(sessionStr);
    for (const rootStr of rootStrs) {
      this._detachRootSession(sessionStr, rootStr);
    }
  }
  /**
   * Removes a session from one repository root's fan-out set, disposing the
   * shared root watcher once the last referencing session drops it.
   */
  _detachRootSession(sessionStr, rootStr) {
    const sessions = this._rootSessions.get(rootStr);
    if (!sessions) {
      return;
    }
    sessions.delete(sessionStr);
    if (sessions.size === 0) {
      this._rootSessions.delete(rootStr);
      this._rootUris.delete(rootStr);
      this._rootWatchAcquisitions.deleteAndDispose(rootStr);
    }
  }
  _workingDirectoriesSignature(workingDirectories) {
    return workingDirectories.join("\0");
  }
  _onRootChanged(rootStr) {
    if (this._isRootActive(rootStr)) {
      return;
    }
    const sessions = this._rootSessions.get(rootStr);
    if (!sessions || sessions.size === 0) {
      return;
    }
    const sessionsToRefresh = [...sessions].filter((session) => {
      return this._hasWatchInterest(session) && !!this._sessionRoots.get(session)?.has(rootStr) && !this._activeSessionRoots.has(session) && !this._unresolvedActiveSessions.has(session) && !!this._stateManager.getSessionState(session);
    });
    if (sessionsToRefresh.length === 0) {
      return;
    }
    for (const session of sessionsToRefresh) {
      const primaryWorkingDirectory = getEffectiveWorkingDirectory(this._stateManager, session);
      if (!primaryWorkingDirectory) {
        continue;
      }
      let primaryWorkingDirectoryUri;
      try {
        primaryWorkingDirectoryUri = URI.parse(primaryWorkingDirectory);
      } catch (err) {
        this._logService.warn(`[ChangesetFileMonitorCoordinator] Failed to parse primary working directory URI for ${session}: ${primaryWorkingDirectory}`, err);
        continue;
      }
      void this._gitStateService.refreshSessionGitState(session, primaryWorkingDirectoryUri);
    }
  }
  _shouldAttachSession(sessionStr) {
    return this._hasWatchInterest(sessionStr) && !this._activeSessionRoots.has(sessionStr) && !this._unresolvedActiveSessions.has(sessionStr);
  }
  _isRootActive(rootStr) {
    return (this._rootActiveSessions.get(rootStr)?.size ?? 0) > 0;
  }
  /**
   * Ensures a shared watcher exists for a root. Returns false only when
   * acquisition failed (the caller retries that root later); an
   * already-watched or turn-suspended active root counts as handled.
   */
  _ensureRootWatcher(rootStr, repositoryRoot) {
    if (this._isRootActive(rootStr) || this._rootWatchAcquisitions.has(rootStr)) {
      return true;
    }
    const sessions = this._rootSessions.get(rootStr);
    if (!sessions || sessions.size === 0) {
      return true;
    }
    const rootWatchAcquisition = this._fileMonitorService.acquire(repositoryRoot, () => this._onRootChanged(rootStr), {
      excludes: DEFAULT_AGENT_HOST_WATCH_EXCLUDES,
      debounceMs: 750
    });
    if (!rootWatchAcquisition) {
      for (const session of sessions) {
        this._pendingWatchInterest.add(session);
      }
      return false;
    }
    this._rootWatchAcquisitions.set(rootStr, rootWatchAcquisition);
    return true;
  }
  _suspendRootWatcher(rootStr) {
    this._rootWatchAcquisitions.deleteAndDispose(rootStr);
  }
  async _markSessionActive(sessionStr) {
    this._removeActiveSession(sessionStr);
    this._pendingWatchInterest.delete(sessionStr);
    const repositoryRoot = await this._resolveActivityRepositoryRoot(sessionStr);
    if (!repositoryRoot) {
      this._unresolvedActiveSessions.add(sessionStr);
      this._releaseSessionRoots(sessionStr);
      return;
    }
    const rootStr = repositoryRoot.toString();
    let activeSessions = this._rootActiveSessions.get(rootStr);
    if (!activeSessions) {
      activeSessions = /* @__PURE__ */ new Set();
      this._rootActiveSessions.set(rootStr, activeSessions);
    }
    activeSessions.add(sessionStr);
    this._activeSessionRoots.set(sessionStr, rootStr);
    this._rootUris.set(rootStr, repositoryRoot);
    this._suspendRootWatcher(rootStr);
    this._releaseSessionRoots(sessionStr);
  }
  _markSessionInactive(sessionStr) {
    const rootStr = this._removeActiveSession(sessionStr);
    if (rootStr) {
      const repositoryRoot = this._rootUris.get(rootStr);
      if (repositoryRoot) {
        this._ensureRootWatcher(rootStr, repositoryRoot);
      }
    }
    if (this._hasWatchInterest(sessionStr) || this._pendingWatchInterest.has(sessionStr)) {
      this._attachWatcherIfPossible(sessionStr);
    }
  }
  _removeActiveSession(sessionStr) {
    this._unresolvedActiveSessions.delete(sessionStr);
    const rootStr = this._activeSessionRoots.get(sessionStr);
    if (!rootStr) {
      return void 0;
    }
    this._activeSessionRoots.delete(sessionStr);
    const activeSessions = this._rootActiveSessions.get(rootStr);
    if (activeSessions) {
      activeSessions.delete(sessionStr);
      if (activeSessions.size === 0) {
        this._rootActiveSessions.delete(rootStr);
      }
    }
    return rootStr;
  }
  async _resolveActivityRepositoryRoot(sessionStr) {
    const workingDirectory = this._getActivityWorkingDirectory(sessionStr);
    if (!workingDirectory) {
      return void 0;
    }
    let workingDirectoryUri;
    try {
      workingDirectoryUri = URI.parse(workingDirectory);
    } catch (err) {
      this._logService.warn(`[ChangesetFileMonitorCoordinator] Failed to parse active working directory URI for ${sessionStr}: ${workingDirectory}`, err);
      return void 0;
    }
    return this._gitService.getRepositoryRoot(workingDirectoryUri);
  }
  _getActivityWorkingDirectory(sessionStr) {
    const workingDirectory = getEffectiveWorkingDirectory(this._stateManager, sessionStr);
    if (workingDirectory) {
      return workingDirectory;
    }
    const parsedSubagent = parseSubagentSessionUri(sessionStr);
    if (!parsedSubagent) {
      return void 0;
    }
    return getEffectiveWorkingDirectory(this._stateManager, parsedSubagent.parentSession.toString());
  }
};

ChangesetFileMonitorCoordinator = __decorateClass([
  __decorateParam(0, IAgentHostStateManager),
  __decorateParam(1, IAgentHostFileMonitorService),
  __decorateParam(2, IAgentHostGitService),
  __decorateParam(3, IAgentHostGitStateService),
  __decorateParam(4, ILogService)
], ChangesetFileMonitorCoordinator);
export { WatchInterestReferenceCollection, ChangesetFileMonitorCoordinator };
