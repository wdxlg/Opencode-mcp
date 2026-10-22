// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/terminal/browser/sessionsTerminalContribution.ts
import { AGENT_HOST_SCHEME, fromAgentHostUri } from "./module-1001.mjs";
import { Disposable } from "./module-0012.mjs";
import { derived } from "./module-0054.mjs";
import { LOCAL_AGENT_HOST_PROVIDER_ID, isAgentHostProvider } from "./module-1764.mjs";
import { autorun } from "./module-0052.mjs";
import { Schemas } from "./module-0033.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ITerminalService } from "./module-1150.mjs";
import { IAgentHostTerminalService } from "./module-3090.mjs";
import { ILogService } from "./module-0095.mjs";
import { IPathService } from "./module-0939.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITerminalProfileService } from "./module-1174.mjs";
import { WorkbenchPhase, getWorkbenchContribution, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { AgentHostSessionTaskRunner } from "./module-3773.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionTaskRunnerRegistry } from "./module-3533.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";


// src/vs/sessions/contrib/terminal/browser/sessionsTerminalContribution.ts
function getSessionTerminalInfo(session, reader) {
  if (!session) {
    return void 0;
  }
  const workspace = reader ? session.workspace.read(reader) : session.workspace.get();
  if (workspace?.isVirtualWorkspace !== false) {
    return void 0;
  }
  const folder = workspace.folders[0];
  const cwd2 = folder?.workingDirectory;
  if (!cwd2) {
    return void 0;
  }
  if (cwd2.scheme === AGENT_HOST_SCHEME) {
    return { cwd: fromAgentHostUri(cwd2), agentHostCwd: cwd2 };
  }
  return { cwd: cwd2 };
}

function getSessionWorktreeCwd(session) {
  const worktree = session.workspace.get()?.folders[0]?.gitRepository?.workTreeUri;
  return worktree?.scheme === AGENT_HOST_SCHEME ? void 0 : worktree;
}

var SessionsTerminalContribution = class extends Disposable {
  constructor(_sessionsManagementService, _sessionsService, _sessionsProvidersService, _terminalService, _agentHostTerminalService, _logService, _pathService, _fileService, _terminalProfileService) {
    super();
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsService = _sessionsService;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._terminalService = _terminalService;
    this._agentHostTerminalService = _agentHostTerminalService;
    this._logService = _logService;
    this._pathService = _pathService;
    this._fileService = _fileService;
    this._terminalProfileService = _terminalProfileService;
    this._sessionTerminals = /* @__PURE__ */ new Map();
    this._standaloneTerminalIds = /* @__PURE__ */ new Set();
    /** In-flight terminal work for drafts, retained only until each operation settles. */
    this._pendingTerminalOperations = /* @__PURE__ */ new Map();
    this._sessionTerminalGenerations = /* @__PURE__ */ new Map();
    /**
     * Session ids already processed as archived. The archive cleanup runs only
     * on the not-archived → archived transition: the provider keeps archived
     * sessions cached and re-emits them in `changed` on every sync, so acting on
     * the current archived state would re-run the cwd cleanup each time and sweep
     * terminals the user opened afterwards. See #313510, #318645.
     */
    this._archivedSessionIds = /* @__PURE__ */ new Set();
    for (const session of this._sessionsManagementService.getSessions()) {
      if (session.isArchived.get()) {
        this._archivedSessionIds.add(session.sessionId);
      }
    }
    const profileOverride = derived((reader) => {
      const session = this._sessionsService.activeSession.read(reader);
      if (!session || session.providerId === LOCAL_AGENT_HOST_PROVIDER_ID) {
        return;
      }
      const address = this._getSessionAgentHostAddress(session);
      if (!address) {
        return;
      }
      const profiles2 = this._agentHostTerminalService.profiles.read(reader);
      return profiles2.find((p) => p.address === address) ?? this._agentHostTerminalService.getProfileForConnection(address);
    });
    this._register(autorun((reader) => {
      const profile = profileOverride.read(reader);
      if (profile) {
        reader.store.add(this._terminalProfileService.overrideDefaultProfile(
          profile.extensionIdentifier,
          profile.profileId
        ));
      }
    }));
    this._register(autorun((reader) => {
      const session = this._sessionsService.activeSession.read(reader);
      if (session?.loading.read(reader) || session?.isArchived.read(reader) || session?.worktreePending?.read(reader)) {
        this._agentHostTerminalService.setDefaultCwd(void 0);
        return;
      }
      const info = getSessionTerminalInfo(session, reader);
      this._agentHostTerminalService.setDefaultCwd(info?.cwd);
    }));
    this._register(autorun((reader) => {
      const session = this._sessionsService.activeSession.read(reader);
      const isArchived = session?.isArchived.read(reader);
      const worktreePending = session?.worktreePending?.read(reader);
      if (session && !isArchived && this._archivedSessionIds.delete(session.sessionId)) {
        this._invalidateTerminalOperations(session.sessionId);
      }
      if (session?.loading.read(reader) || isArchived || worktreePending) {
        if (session && (isArchived || worktreePending)) {
          this._invalidateTerminalOperations(session.sessionId);
        }
        this._activeKey = void 0;
        this._activeSessionId = void 0;
        return;
      }
      this._onActiveSessionChanged(session);
    }));
    this._register(this._sessionsManagementService.onDidReplaceNewDraftSession(({ from, to }) => {
      this._onDidReplaceNewDraftSession(from, to);
    }));
    this._register(this._sessionsManagementService.onDidReplaceSession(({ from, to }) => {
      this._transferTerminals(from.sessionId, to.sessionId);
    }));
    this._register(this._terminalService.onDidDisposeInstance((instance2) => {
      this._removeTerminalFromTrackedSessions(instance2.instanceId);
      this._standaloneTerminalIds.delete(instance2.instanceId);
    }));
    this._register(this._terminalService.onDidCreateInstance((instance2) => {
      if (instance2.shellLaunchConfig.hideFromUser) {
        return;
      }
      if (instance2.shellLaunchConfig.attachPersistentProcess && this._activeKey) {
        instance2.getInitialCwd().then((cwd2) => {
          if (cwd2.toLowerCase() !== this._activeKey) {
            const availableInstance = this._getAvailableTerminal(instance2, `hide restored terminal for ${cwd2}`);
            if (!availableInstance) {
              return;
            }
            this._terminalService.moveToBackground(availableInstance);
            this._logService.trace(`[SessionsTerminal] Hid restored terminal ${availableInstance.instanceId} (cwd: ${cwd2})`);
          }
        });
      }
    }));
    this._register(this._sessionsManagementService.onDidChangeSessions((e4) => {
      for (const session of e4.added) {
        if (session.isArchived.get()) {
          this._archivedSessionIds.add(session.sessionId);
        }
      }
      const justArchived = [];
      for (const session of e4.changed) {
        if (session.isArchived.get()) {
          if (!this._archivedSessionIds.has(session.sessionId)) {
            this._archivedSessionIds.add(session.sessionId);
            this._invalidateTerminalOperations(session.sessionId);
            justArchived.push(session);
          }
        } else {
          if (this._archivedSessionIds.delete(session.sessionId)) {
            this._invalidateTerminalOperations(session.sessionId);
          }
        }
      }
      for (const session of e4.removed) {
        this._archivedSessionIds.delete(session.sessionId);
      }
      if (e4.removed.length === 0 && justArchived.length === 0) {
        return;
      }
      this._logService.trace(`[SessionsTerminal] onDidChangeSessions cleanup (removed: ${e4.removed.length}, justArchived: ${justArchived.length}, trackedSessions: ${this._sessionTerminals.size}, activeKey: ${this._activeKey ?? "<none>"})`);
      for (const session of e4.removed) {
        void this._closeTerminalsForSession(session.sessionId, `session removed (${session.sessionId})`).finally(() => this._sessionTerminals.delete(session.sessionId));
      }
      for (const session of justArchived) {
        void this._closeArchivedSessionTerminals(session);
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.sessionsTerminal";
  }
  /**
   * Ensures a terminal exists for the given cwd. When a session is provided,
   * tracked terminals for that session id are preferred; otherwise the method
   * falls back to matching untracked terminals by initial cwd for backward
   * compatibility before creating a new terminal. Sets newly created terminals
   * as active and optionally focuses them.
   *
   * When {@link session} is provided and the session is backed by an agent
   * host, the terminal is created on the agent host instead of locally.
   */
  async ensureTerminal(cwd2, focus, session) {
    if (!session) {
      return this._ensureTerminal(cwd2, focus, session);
    }
    const generation = this._getTerminalOperationGeneration(session.sessionId);
    this._beginTerminalOperation(session.sessionId);
    try {
      return await this._ensureTerminal(cwd2, focus, session, generation);
    } finally {
      this._endTerminalOperation(session.sessionId);
    }
  }
  async _ensureTerminal(cwd2, focus, session, generation) {
    if (session && this._isTerminalOperationCancelled(session, generation)) {
      return [];
    }
    const key3 = cwd2.fsPath.toLowerCase();
    let existing = session ? this._getTrackedTerminalsForSession(session.sessionId) : [];
    if (existing.length === 0) {
      existing = await this._findTerminalsForKey(key3, { excludeTracked: !!session });
      if (session && this._isTerminalOperationCancelled(session, generation)) {
        return [];
      }
    }
    if (existing.length === 0) {
      try {
        const instance2 = await this._createTerminalForSession(cwd2, session);
        const createdInstance = this._getAvailableTerminal(instance2, `activate created terminal for ${cwd2.fsPath}`);
        if (!createdInstance) {
          return [];
        }
        if (session && this._isTerminalOperationCancelled(session, generation)) {
          await this._terminalService.safeDisposeTerminal(createdInstance);
          if (!createdInstance.isDisposed) {
            this._trackTerminalsForSession(session.sessionId, [createdInstance]);
          }
          return [];
        }
        existing = [createdInstance];
        this._terminalService.setActiveInstance(createdInstance);
        this._logService.trace(`[SessionsTerminal] Created terminal ${createdInstance.instanceId} for ${cwd2.fsPath}`);
      } catch (e4) {
        this._logService.trace(`[SessionsTerminal] Cannot create terminal for ${cwd2.fsPath}: ${e4}`);
        return [];
      }
    }
    if (session) {
      this._trackTerminalsForSession(session.sessionId, existing);
    }
    if (focus) {
      await this._terminalService.focusActiveInstance();
    }
    return existing;
  }
  _isTerminalOperationCancelled(session, generation = this._getTerminalOperationGeneration(session.sessionId)) {
    return this._pendingTerminalOperations.get(session.sessionId)?.replaced === true || this._getTerminalOperationGeneration(session.sessionId) !== generation || this._archivedSessionIds.has(session.sessionId) || session.isArchived.get() || session.worktreePending?.get() === true;
  }
  _getTerminalOperationGeneration(sessionId) {
    return this._sessionTerminalGenerations.get(sessionId) ?? 0;
  }
  _invalidateTerminalOperations(sessionId) {
    this._sessionTerminalGenerations.set(sessionId, this._getTerminalOperationGeneration(sessionId) + 1);
  }
  /**
   * Creates a terminal for the given cwd. If the session is backed by an
   * agent host, creates an agent host terminal; otherwise creates a local one.
   */
  async _createTerminalForSession(cwd2, session) {
    const address = session && this._getSessionAgentHostAddress(session);
    if (address) {
      const instance2 = await this._agentHostTerminalService.createTerminalForEntry(address, { cwd: cwd2 });
      if (instance2) {
        return instance2;
      }
    }
    return this._terminalService.createTerminal({ config: { cwd: cwd2 } });
  }
  /**
   * Returns the agent host address for the given session's provider,
   * or `undefined` if the session is not backed by an agent host.
   */
  _getSessionAgentHostAddress(session) {
    if (!session) {
      return void 0;
    }
    const provider = this._sessionsProvidersService.getProvider(session.providerId);
    if (!provider || !isAgentHostProvider(provider)) {
      return void 0;
    }
    return provider.remoteAddress ?? "__local__";
  }
  async _onActiveSessionChanged(session) {
    if (!session) {
      return;
    }
    this._beginTerminalOperation(session.sessionId);
    try {
      const generation = this._getTerminalOperationGeneration(session.sessionId);
      const info = getSessionTerminalInfo(session);
      if (info?.cwd && !info.agentHostCwd && info.cwd.scheme === Schemas.file && !await this._fileService.exists(info.cwd)) {
        return;
      }
      const targetPath = info?.cwd ?? await this._pathService.userHome();
      const targetKey = targetPath.fsPath.toLowerCase();
      if (this._activeKey === targetKey && this._activeSessionId === session.sessionId) {
        return;
      }
      this._activeKey = targetKey;
      this._activeSessionId = session.sessionId;
      const instances = await this._ensureTerminal(targetPath, false, session, generation);
      if (this._activeKey !== targetKey || this._activeSessionId !== session.sessionId) {
        return;
      }
      await this._updateTerminalVisibility(session, targetKey, instances.map((instance2) => instance2.instanceId));
    } finally {
      this._endTerminalOperation(session.sessionId);
    }
  }
  /**
   * Finds all terminal instances whose initial cwd (lower-cased) matches
   * the given key.
   */
  async _findTerminalsForKey(key3, options3) {
    const result = [];
    for (const instance2 of this._terminalService.instances) {
      if (instance2.shellLaunchConfig.hideFromUser) {
        continue;
      }
      if (options3?.excludeTracked && (this._isTerminalTracked(instance2.instanceId) || this._standaloneTerminalIds.has(instance2.instanceId))) {
        continue;
      }
      try {
        const cwd2 = await instance2.getInitialCwd();
        if (cwd2.toLowerCase() === key3) {
          result.push(instance2);
        }
      } catch {
      }
    }
    return result;
  }
  _trackTerminalsForSession(sessionId, instances) {
    if (instances.length === 0) {
      return;
    }
    let terminalIds = this._sessionTerminals.get(sessionId);
    if (!terminalIds) {
      terminalIds = /* @__PURE__ */ new Set();
      this._sessionTerminals.set(sessionId, terminalIds);
    }
    for (const instance2 of instances) {
      terminalIds.add(instance2.instanceId);
    }
  }
  _beginTerminalOperation(sessionId) {
    const operation = this._pendingTerminalOperations.get(sessionId);
    if (operation) {
      operation.count++;
      return;
    }
    this._pendingTerminalOperations.set(sessionId, { count: 1, replaced: false });
  }
  _endTerminalOperation(sessionId) {
    const operation = this._pendingTerminalOperations.get(sessionId);
    if (!operation) {
      return;
    }
    operation.count--;
    if (operation.count > 0) {
      return;
    }
    this._pendingTerminalOperations.delete(sessionId);
  }
  _onDidReplaceNewDraftSession(from, to) {
    const pendingOperation = this._pendingTerminalOperations.get(from.sessionId);
    if (pendingOperation) {
      pendingOperation.replaced = true;
    }
    const fromCwd = getSessionTerminalInfo(from)?.cwd.fsPath.toLowerCase();
    const toCwd = getSessionTerminalInfo(to)?.cwd.fsPath.toLowerCase();
    const fromAgentHostAddress = this._getSessionAgentHostAddress(from);
    const toAgentHostAddress = this._getSessionAgentHostAddress(to);
    if (fromCwd === toCwd && fromAgentHostAddress === toAgentHostAddress) {
      this._transferTerminals(from.sessionId, to.sessionId);
    } else {
      this._rehomeTerminals(from.sessionId);
    }
  }
  _rehomeTerminals(sessionId) {
    const terminals = this._getTrackedTerminalsForSession(sessionId);
    for (const terminal2 of terminals) {
      this._standaloneTerminalIds.add(terminal2.instanceId);
    }
    if (terminals.length > 0) {
      this._logService.trace(`[SessionsTerminal] Rehomed ${terminals.length} terminal(s) from session ${sessionId}`);
    }
    this._sessionTerminals.delete(sessionId);
  }
  _transferTerminals(fromSessionId, toSessionId2) {
    const terminalIds = this._sessionTerminals.get(fromSessionId);
    if (terminalIds && terminalIds.size > 0) {
      let targetIds = this._sessionTerminals.get(toSessionId2);
      if (!targetIds) {
        targetIds = /* @__PURE__ */ new Set();
        this._sessionTerminals.set(toSessionId2, targetIds);
      }
      for (const id2 of terminalIds) {
        targetIds.add(id2);
      }
      this._logService.trace(`[SessionsTerminal] Transferred ${terminalIds.size} terminal(s) from session ${fromSessionId} to ${toSessionId2}`);
    }
    this._sessionTerminals.delete(fromSessionId);
  }
  _getTrackedTerminalsForSession(sessionId) {
    const terminalIds = this._sessionTerminals.get(sessionId);
    if (!terminalIds) {
      return [];
    }
    const result = [];
    for (const instanceId of [...terminalIds]) {
      const instance2 = this._terminalService.getInstanceFromId(instanceId);
      if (!instance2 || instance2.isDisposed || instance2.shellLaunchConfig.hideFromUser) {
        terminalIds.delete(instanceId);
        continue;
      }
      result.push(instance2);
    }
    if (terminalIds.size === 0) {
      this._sessionTerminals.delete(sessionId);
    }
    return result;
  }
  _isTerminalTracked(instanceId) {
    for (const [sessionId, terminalIds] of this._sessionTerminals) {
      if (terminalIds.has(instanceId)) {
        const instance2 = this._terminalService.getInstanceFromId(instanceId);
        if (!instance2 || instance2.isDisposed) {
          terminalIds.delete(instanceId);
          if (terminalIds.size === 0) {
            this._sessionTerminals.delete(sessionId);
          }
          continue;
        }
        return true;
      }
    }
    return false;
  }
  _removeTerminalFromTrackedSessions(instanceId) {
    for (const [sessionId, terminalIds] of this._sessionTerminals) {
      terminalIds.delete(instanceId);
      if (terminalIds.size === 0) {
        this._sessionTerminals.delete(sessionId);
      }
    }
  }
  _getAvailableTerminal(instance2, action) {
    const currentInstance = this._terminalService.getInstanceFromId(instance2.instanceId);
    if (!currentInstance || currentInstance.isDisposed) {
      this._logService.trace(`[SessionsTerminal] Cannot ${action}; terminal ${instance2.instanceId} is no longer available`);
      return void 0;
    }
    return currentInstance;
  }
  /**
   * Shows background terminals that belong to the active session and hides
   * foreground terminals that belong to other sessions. When the active
   * session has no tracked terminals yet, falls back to initial cwd matching
   * for compatibility with restored terminals from previous sessions.
   */
  async _updateTerminalVisibility(activeSession, activeKey, forceForegroundTerminalIds) {
    const toShow = [];
    const toHide = [];
    const trackedTerminalIds = new Set(this._getTrackedTerminalsForSession(activeSession.sessionId).map((instance2) => instance2.instanceId));
    for (const instance2 of [...this._terminalService.instances]) {
      if (instance2.shellLaunchConfig.hideFromUser || this._standaloneTerminalIds.has(instance2.instanceId)) {
        continue;
      }
      let cwd2;
      const currentInstance = this._getAvailableTerminal(instance2, "update terminal visibility");
      if (!currentInstance) {
        continue;
      }
      const isForeground = this._terminalService.foregroundInstances.includes(currentInstance);
      const isForceVisible = forceForegroundTerminalIds.includes(currentInstance.instanceId);
      let belongsToActiveSession = trackedTerminalIds.has(currentInstance.instanceId);
      if (!belongsToActiveSession && !this._isTerminalTracked(currentInstance.instanceId)) {
        try {
          cwd2 = (await currentInstance.getInitialCwd()).toLowerCase();
        } catch {
          continue;
        }
        belongsToActiveSession = cwd2 === activeKey;
      }
      if ((belongsToActiveSession || isForceVisible) && !isForeground) {
        toShow.push(currentInstance);
      } else if (!belongsToActiveSession && !isForceVisible && isForeground) {
        toHide.push(currentInstance);
      }
    }
    for (const instance2 of toShow) {
      const availableInstance = this._getAvailableTerminal(instance2, "show background terminal");
      if (availableInstance) {
        await this._terminalService.showBackgroundTerminal(availableInstance, true);
      }
    }
    for (const instance2 of toHide) {
      const availableInstance = this._getAvailableTerminal(instance2, "move terminal to background");
      if (availableInstance) {
        this._logService.debug(`[SessionsTerminal] Hiding terminal ${availableInstance.instanceId} (does not belong to active key ${activeKey})`);
        this._terminalService.moveToBackground(availableInstance);
      }
    }
    const foreground2 = this._terminalService.foregroundInstances;
    let mostRecent;
    let mostRecentTimestamp = -1;
    for (const instance2 of foreground2) {
      if (this._standaloneTerminalIds.has(instance2.instanceId)) {
        continue;
      }
      const cmdDetection = instance2.capabilities.get(2 /* CommandDetection */);
      const lastCmd = cmdDetection?.commands.at(-1);
      if (lastCmd && lastCmd.timestamp > mostRecentTimestamp) {
        mostRecentTimestamp = lastCmd.timestamp;
        mostRecent = instance2;
      }
    }
    if (mostRecent) {
      this._terminalService.setActiveInstance(mostRecent);
    }
  }
  /**
   * Disposes (kills) terminals associated with the given session id. Used
   * when a session is removed: removal is an explicit user action, so the pty
   * is torn down.
   *
   * Never disposes the terminal the user is currently working in. Removal also
   * covers session *graduation* (untitled → committed via `onDidReplaceSession`,
   * which surfaces the skeleton in `removed`): the focused (active) instance is
   * therefore always protected.
   *
   * {@link reason} is logged for each killed terminal so unexpected disposals in
   * the agents window can be diagnosed from the logs. See #313510, #318645.
   */
  async _closeTerminalsForSession(sessionId, reason) {
    const protectedInstanceId = this._terminalService.activeInstance?.instanceId;
    for (const instance2 of this._getTrackedTerminalsForSession(sessionId)) {
      if (protectedInstanceId !== void 0 && instance2.instanceId === protectedInstanceId) {
        this._logService.info(`[SessionsTerminal] Skipping active terminal ${instance2.instanceId} for session ${sessionId} (user is working in it)`);
        continue;
      }
      const availableInstance = this._getAvailableTerminal(instance2, `close removed session terminal for session ${sessionId}`);
      if (!availableInstance) {
        continue;
      }
      this._logService.info(`[SessionsTerminal] Killing terminal ${availableInstance.instanceId} (session: ${sessionId}, reason: ${reason})`);
      await this._terminalService.safeDisposeTerminal(availableInstance);
      this._removeTerminalFromTrackedSessions(availableInstance.instanceId);
    }
  }
  async _closeArchivedSessionTerminals(session) {
    const cleanupGeneration = this._getTerminalOperationGeneration(session.sessionId);
    const terminals = new Map(this._getTrackedTerminalsForSession(session.sessionId).map((instance2) => [instance2.instanceId, instance2]));
    const untrackedWorktreeTerminalIds = /* @__PURE__ */ new Set();
    const worktreeCwd = getSessionWorktreeCwd(session);
    const anotherLiveSessionSharesWorktree = worktreeCwd && this._sessionsManagementService.getSessions().some(
      (candidate) => candidate.sessionId !== session.sessionId && !candidate.isArchived.get() && isEqual2(getSessionWorktreeCwd(candidate), worktreeCwd)
    );
    if (worktreeCwd && !anotherLiveSessionSharesWorktree) {
      for (const instance2 of await this._findUntrackedTerminalsForResource(worktreeCwd)) {
        if (instance2.instanceId === this._terminalService.activeInstance?.instanceId) {
          continue;
        }
        terminals.set(instance2.instanceId, instance2);
        untrackedWorktreeTerminalIds.add(instance2.instanceId);
      }
    }
    if (!this._isArchiveCleanupCurrent(session.sessionId, cleanupGeneration)) {
      return;
    }
    for (const instance2 of terminals.values()) {
      if (!this._isArchiveCleanupCurrent(session.sessionId, cleanupGeneration)) {
        return;
      }
      if (untrackedWorktreeTerminalIds.has(instance2.instanceId) && (this._isTerminalTracked(instance2.instanceId) || this._standaloneTerminalIds.has(instance2.instanceId) || this._terminalService.activeInstance?.instanceId === instance2.instanceId)) {
        continue;
      }
      const availableInstance = this._getAvailableTerminal(instance2, `close archived session terminal for session ${session.sessionId}`);
      if (!availableInstance) {
        continue;
      }
      this._logService.info(`[SessionsTerminal] Killing terminal ${availableInstance.instanceId} (session archived: ${session.sessionId})`);
      await this._terminalService.safeDisposeTerminal(availableInstance);
      if (availableInstance.isDisposed) {
        this._removeTerminalFromTrackedSessions(availableInstance.instanceId);
      }
      if (!this._isArchiveCleanupCurrent(session.sessionId, cleanupGeneration)) {
        await this._ensureActiveSessionTerminalAfterLateArchiveCleanup(session.sessionId);
        return;
      }
    }
  }
  _isArchiveCleanupCurrent(sessionId, generation) {
    return this._archivedSessionIds.has(sessionId) && this._getTerminalOperationGeneration(sessionId) === generation;
  }
  async _ensureActiveSessionTerminalAfterLateArchiveCleanup(sessionId) {
    const activeSession = this._sessionsService.activeSession.get();
    if (!activeSession || activeSession.sessionId !== sessionId || activeSession.isArchived.get() || activeSession.loading.get() || activeSession.worktreePending?.get()) {
      return;
    }
    this._activeKey = void 0;
    this._activeSessionId = void 0;
    await this._onActiveSessionChanged(activeSession);
  }
  async _findUntrackedTerminalsForResource(resource) {
    const result = [];
    for (const instance2 of this._terminalService.instances) {
      if (!instance2.shellLaunchConfig.attachPersistentProcess || instance2.shellLaunchConfig.hideFromUser || this._isTerminalTracked(instance2.instanceId) || this._standaloneTerminalIds.has(instance2.instanceId)) {
        continue;
      }
      try {
        if (isEqual2(URI.file(await instance2.getInitialCwd()), resource) && !this._isTerminalTracked(instance2.instanceId) && !this._standaloneTerminalIds.has(instance2.instanceId)) {
          result.push(instance2);
        }
      } catch {
      }
    }
    return result;
  }
  async dumpTracking() {
    console.log(`[SessionsTerminal] Active key: ${this._activeKey ?? "<none>"}`);
    console.log(`[SessionsTerminal] Session terminals: ${JSON.stringify([...this._sessionTerminals.entries()].map(([sessionId, terminalIds]) => [sessionId, [...terminalIds]]))}`);
    console.log(`[SessionsTerminal] Standalone terminals: ${JSON.stringify([...this._standaloneTerminalIds])}`);
    console.log("[SessionsTerminal] === All Terminals ===");
    for (const instance2 of this._terminalService.instances) {
      let cwd2 = "<unknown>";
      try {
        cwd2 = await instance2.getInitialCwd();
      } catch {
      }
      const isForeground = this._terminalService.foregroundInstances.includes(instance2);
      console.log(`  ${instance2.instanceId} - ${cwd2} - ${isForeground ? "foreground" : "background"}`);
    }
  }
  async showAllTerminals() {
    for (const instance2 of this._terminalService.instances) {
      if (!this._terminalService.foregroundInstances.includes(instance2)) {
        await this._terminalService.showBackgroundTerminal(instance2, true);
        this._logService.trace(`[SessionsTerminal] Moved terminal ${instance2.instanceId} to foreground`);
      }
    }
  }
};

SessionsTerminalContribution = __decorateClass([
  __decorateParam(0, ISessionsManagementService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, ISessionsProvidersService),
  __decorateParam(3, ITerminalService),
  __decorateParam(4, IAgentHostTerminalService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IPathService),
  __decorateParam(7, IFileService),
  __decorateParam(8, ITerminalProfileService)
], SessionsTerminalContribution);

registerWorkbenchContribution2(SessionsTerminalContribution.ID, SessionsTerminalContribution, WorkbenchPhase.AfterRestored);

var RegisterAgentHostSessionTaskRunnerContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.sessions.registerAgentHostTaskRunner";
  }
  constructor(instantiationService, registry4) {
    super();
    const runner = instantiationService.createInstance(AgentHostSessionTaskRunner);
    this._register(registry4.register(runner));
  }
};

RegisterAgentHostSessionTaskRunnerContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ISessionTaskRunnerRegistry)
], RegisterAgentHostSessionTaskRunnerContribution);

registerWorkbenchContribution2(RegisterAgentHostSessionTaskRunnerContribution.ID, RegisterAgentHostSessionTaskRunnerContribution, WorkbenchPhase.BlockStartup);

var DumpTerminalTrackingAction = class extends Action2 {
  constructor() {
    super({
      id: "agentSession.dumpTerminalTracking",
      title: localize2(5622, "Dump Terminal Tracking"),
      f1: true
    });
  }
  async run() {
    const contribution = getWorkbenchContribution(SessionsTerminalContribution.ID);
    await contribution.dumpTracking();
  }
};

registerAction2(DumpTerminalTrackingAction);

var ShowAllTerminalsAction = class extends Action2 {
  constructor() {
    super({
      id: "agentSession.showAllTerminals",
      title: localize2(5623, "Show All Terminals"),
      f1: true
    });
  }
  async run() {
    const contribution = getWorkbenchContribution(SessionsTerminalContribution.ID);
    await contribution.showAllTerminals();
  }
};

registerAction2(ShowAllTerminalsAction);
export { getSessionTerminalInfo, getSessionWorktreeCwd, SessionsTerminalContribution, RegisterAgentHostSessionTaskRunnerContribution, DumpTerminalTrackingAction, ShowAllTerminalsAction };
