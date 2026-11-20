// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostUntitledProvisionalSessionService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { SequencerByKey } from "./module-0036.mjs";
import { Emitter } from "./module-0017.mjs";
import { isUntitledChatSession } from "./module-0961.mjs";
import { IAgentHostNewSessionFolderService, computeDesiredWorkingDirectories, computeWorkingDirectories, hasImmutablePrimaryWorkingDirectory, supportsMultipleWorkingDirectories } from "./module-2108.mjs";
import { URI } from "./module-0032.mjs";
import { withSessionMultiRootMetadata } from "./module-1007.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { areSessionWorkingDirectoriesEqual } from "./module-2109.mjs";
import { generateUuid } from "./module-0190.mjs";
import { equals4 } from "./module-0098.mjs";
import { KNOWN_MODE_VALUES } from "./module-2046.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { ILogService } from "./module-0095.mjs";
import { IChatService } from "./module-0972.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IAgentHostImportConversationStore } from "./module-1477.mjs";
import { IAgentHostActiveClientService } from "./module-2123.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostUntitledProvisionalSessionService.ts
var IAgentHostUntitledProvisionalSessionService = createDecorator("agentHostUntitledProvisionalSessionService");

var ActiveClientBinding = class extends Disposable {
  constructor(roots, scope, clientId, publish) {
    super();
    this.roots = roots;
    this.scope = scope;
    this._register(scope);
    this._register(autorun((reader) => {
      if (!scope.isResolved.read(reader)) {
        return;
      }
      scope.activeClient(clientId).read(reader);
      publish();
    }));
  }
};

var AgentHostUntitledProvisionalSessionService = class extends Disposable {
  constructor(_agentHostService, _logService, chatService, _configurationService, _environmentService, _newSessionFolderService, _workspaceContextService, _workspaceTrustManagementService, _importConversationStore, _activeClientService, _uriIdentityService) {
    super();
    this._agentHostService = _agentHostService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._environmentService = _environmentService;
    this._newSessionFolderService = _newSessionFolderService;
    this._workspaceContextService = _workspaceContextService;
    this._workspaceTrustManagementService = _workspaceTrustManagementService;
    this._importConversationStore = _importConversationStore;
    this._activeClientService = _activeClientService;
    this._uriIdentityService = _uriIdentityService;
    this._entries = new ResourceMap();
    this._pending = new ResourceMap();
    this._resolvedConfigs = new ResourceMap();
    this._resolvedConfigRequestSeq = new ResourceMap();
    this._sessionCreationMetadata = new ResourceMap();
    this._pendingBackendDisposals = new ResourceSet();
    // URIs that were the source of a successful `tryRebind`. The chat widget
    // briefly reattaches to the old untitled URI before its viewModel switches
    // to the new real URI; without this tombstone the picker would call
    // `getOrCreate` again and spin up an orphan provisional session on the agent.
    this._rebound = new ResourceSet();
    this._sequencer = new SequencerByKey();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._register(chatService.onDidDisposeSession((e) => {
      for (const sessionResource of e.sessionResources) {
        if (this._entries.has(sessionResource)) {
          void this.disposeSession(sessionResource);
        }
        this._resolvedConfigs.delete(sessionResource);
        this._resolvedConfigRequestSeq.delete(sessionResource);
        this._sessionCreationMetadata.delete(sessionResource);
        this._rebound.delete(sessionResource);
      }
    }));
    this._register(this._newSessionFolderService.onDidChangeFolder((sessionResource) => {
      const folder = this._newSessionFolderService.getFolder(sessionResource);
      if (folder && this._entries.has(sessionResource)) {
        void this._changeWorkingDirectory(sessionResource, folder);
      }
    }));
    this._register(this._workspaceContextService.onDidChangeWorkspaceFolders((e) => {
      for (const [sessionResource, entry] of this._entries) {
        if (entry.disposed) {
          continue;
        }
        if (isUntitledChatSession(sessionResource) && this._primaryWasRemoved(entry, e)) {
          void this._changeWorkingDirectory(sessionResource, this._newSessionFolderService.resolveNewSessionPrimary(sessionResource));
          continue;
        }
        this._reconcileWorkspaceRootSet(sessionResource, entry);
      }
    }));
    const rootStateListeners = this._register(new DisposableStore());
    const bindRootState = () => {
      rootStateListeners.clear();
      rootStateListeners.add(this._agentHostService.rootState.onDidChange(() => this._reconcileUntitledDraftsForRootSet()));
      this._reconcileUntitledDraftsForRootSet();
    };
    bindRootState();
    this._register(this._agentHostService.onAgentHostStart(bindRootState));
    this._register(this._agentHostService.onAgentHostStart(() => this._retryPendingBackendDisposals()));
  }
  get(sessionResource) {
    const entry = this._entries.get(sessionResource);
    if (!entry || entry.disposed) {
      return void 0;
    }
    return this._generationMatchingDesiredState(entry)?.backendSession;
  }
  _computeWorkingDirectories(primary, provider) {
    return computeWorkingDirectories(primary, this._workspaceContextService.getWorkspace().folders.map((folder) => folder.uri), this._agentHostService.rootState.value, provider);
  }
  _computeEntryWorkingDirectories(entry) {
    const primary = entry.workingDirectory;
    if (!primary || !entry.usesWorkspaceRootSet || !supportsMultipleWorkingDirectories(this._agentHostService.rootState.value, entry.provider)) {
      return primary ? [primary] : void 0;
    }
    const current = entry.generation?.workingDirectories ?? [primary];
    return computeDesiredWorkingDirectories(
      primary,
      current,
      this._workspaceContextService.getWorkspace().folders.map((folder) => folder.uri)
    );
  }
  _updateActiveClientScope(entry) {
    const roots = this._computeEntryWorkingDirectories(entry) ?? [];
    if (entry.activeClientBinding.value && this._activeClientService.areScopeRootsEqual(entry.activeClientBinding.value.roots, roots)) {
      return;
    }
    const scope = this._activeClientService.acquireScope(`agent-host-${entry.provider}`, roots);
    entry.activeClientBinding.value = new ActiveClientBinding(roots, scope, this._agentHostService.clientId, () => this._publishActiveClient(entry));
  }
  /**
   * Re-run {@link _reconcileWorkspaceRootSet} for every open not-yet-started
   * (untitled) draft. Started/rebound sessions are skipped: their working
   * directories are the agent's fixed process root once the session has
   * started, so recreating the backend would tear down the live conversation.
   */
  _reconcileUntitledDraftsForRootSet() {
    for (const [sessionResource, entry] of this._entries) {
      if (entry.disposed || !isUntitledChatSession(sessionResource)) {
        continue;
      }
      this._reconcileWorkspaceRootSet(sessionResource, entry);
    }
  }
  /**
   * Escalate a draft to the workspace root set when its desired directory set
   * has grown beyond its primary, refresh its active-client scope, and recreate
   * its backend generation when the published one no longer matches the desired
   * set. Shared by the workspace-folder and root-state (capability) change
   * reactions. Escalation is one-way (never back to single-root); a later
   * capability-off or folder shrink is still honored because
   * {@link _computeEntryWorkingDirectories} recomputes the desired set live.
   */
  _reconcileWorkspaceRootSet(sessionResource, entry) {
    if (!entry.usesWorkspaceRootSet && (this._computeWorkingDirectories(entry.workingDirectory, entry.provider)?.length ?? 0) > 1) {
      entry.usesWorkspaceRootSet = true;
    }
    this._updateActiveClientScope(entry);
    if (entry.usesWorkspaceRootSet && !this._generationMatchingDesiredState(entry)) {
      void this._queue(sessionResource, () => this._reconcileGeneration(sessionResource, entry));
    }
  }
  getInitialSessionMetadata(sessionResource) {
    const workspace = this._workspaceContextService.getWorkspace();
    const workspaceMetadata = this._environmentService.isSessionsWindow || this._workspaceContextService.getWorkbenchState() !== 3 /* WORKSPACE */ || !URI.isUri(workspace.configuration) ? void 0 : withSessionMultiRootMetadata(void 0, {
      workspaceFile: workspace.configuration.toString()
    });
    const sessionMetadata = sessionResource ? this._sessionCreationMetadata.get(sessionResource) : void 0;
    if (!sessionMetadata) {
      return workspaceMetadata;
    }
    return { ...workspaceMetadata ?? {}, ...sessionMetadata };
  }
  setSessionCreationMetadata(sessionResource, metadata) {
    this._sessionCreationMetadata.set(sessionResource, metadata);
  }
  clearSessionCreationMetadata(sessionResource) {
    this._sessionCreationMetadata.delete(sessionResource);
  }
  getInitialSessionConfig() {
    return this._getInitialConfig();
  }
  async waitForPending(sessionResource) {
    while (true) {
      const pending = this._pending.get(sessionResource);
      if (!pending) {
        return this.get(sessionResource);
      }
      try {
        await pending;
      } catch {
        return void 0;
      }
      if (this._pending.get(sessionResource) === pending) {
        return this.get(sessionResource);
      }
    }
  }
  getOrCreate(sessionResource, provider, workingDirectory) {
    const existing = this.get(sessionResource);
    if (existing) {
      return Promise.resolve(existing);
    }
    if (this._rebound.has(sessionResource)) {
      return Promise.resolve(void 0);
    }
    const inflight = this._pending.get(sessionResource);
    if (inflight) {
      return inflight.then(() => this.get(sessionResource));
    }
    const entry = this._ensureEntry(sessionResource, provider, workingDirectory);
    if (!entry) {
      return Promise.resolve(void 0);
    }
    return this._queue(sessionResource, async () => {
      const settled = this.get(sessionResource);
      if (settled) {
        return settled;
      }
      return this._reconcileGeneration(sessionResource, entry);
    });
  }
  _ensureEntry(sessionResource, provider, workingDirectory) {
    const existing = this._entries.get(sessionResource);
    if (existing) {
      return existing;
    }
    if (this._rebound.has(sessionResource)) {
      return void 0;
    }
    const entry = this._createEntry(provider, { ...this._getInitialConfig() ?? {} }, 0, workingDirectory);
    this._entries.set(sessionResource, entry);
    return entry;
  }
  _createEntry(provider, config, configVersion, workingDirectory, resolvedConfig) {
    const entry = {
      provider,
      activeClientBinding: new MutableDisposable(),
      generation: void 0,
      config,
      configVersion,
      workingDirectory,
      usesWorkspaceRootSet: (this._computeWorkingDirectories(workingDirectory, provider)?.length ?? 0) > 1,
      resolvedConfig,
      disposed: false
    };
    this._updateActiveClientScope(entry);
    return entry;
  }
  _publishActiveClient(entry) {
    if (entry.disposed || !entry.generation) {
      return;
    }
    const scope = entry.activeClientBinding.value?.scope;
    if (!scope || !scope.isResolved.get()) {
      return;
    }
    const activeClient = scope.activeClient(this._agentHostService.clientId).get();
    this._agentHostService.dispatch(entry.generation.backendSession.toString(), {
      type: "session/activeClientSet" /* SessionActiveClientSet */,
      activeClient
    });
  }
  /**
   * Serializes lifecycle work for one logical draft and records its latest tail
   * so external callers can wait for a stable current generation.
   */
  _queue(sessionResource, task) {
    const work = this._sequencer.queue(sessionResource.toString(), task);
    this._pending.set(sessionResource, work);
    void work.finally(() => {
      if (this._pending.get(sessionResource) === work) {
        this._pending.delete(sessionResource);
      }
    }).catch(() => {
    });
    return work;
  }
  _generationMatchingDesiredState(entry) {
    const generation = entry.generation;
    const desired = this._computeEntryWorkingDirectories(entry);
    return generation && this._sameUri(generation.workingDirectory, entry.workingDirectory) && this._sameWorkingDirectories(entry.provider, generation.workingDirectories, desired) ? generation : void 0;
  }
  _sameUri(first2, second) {
    return first2 === void 0 || second === void 0 ? first2 === second : isEqual2(first2, second);
  }
  /**
   * Whether a draft's primary working directory was just removed from the
   * workspace. Only folders present in `e.removed` and no longer among the
   * current workspace folders qualify, so a standalone folder outside the
   * workspace (never a member) is preserved, and a folder removed and re-added
   * in the same event is not treated as gone.
   */
  _primaryWasRemoved(entry, e) {
    const primary = entry.workingDirectory;
    if (!primary || e.removed.length === 0) {
      return false;
    }
    const extUri2 = this._uriIdentityService.extUri;
    const stillPresent = this._workspaceContextService.getWorkspace().folders.some((folder) => extUri2.isEqual(folder.uri, primary));
    return !stillPresent && e.removed.some((removed) => extUri2.isEqual(removed.uri, primary));
  }
  /** Provider-agnostic: only an agent advertising `immutablePrimary` pins index 0. */
  _sameWorkingDirectories(provider, first2, second) {
    return areSessionWorkingDirectoriesEqual(first2, second, hasImmutablePrimaryWorkingDirectory(this._agentHostService.rootState.value, provider));
  }
  _newProvisionalUri(provider) {
    return URI.from({ scheme: provider, path: `/${generateUuid()}` });
  }
  /**
   * Ensures the published generation realizes the draft's current folder and config.
   * It keeps the previous generation hidden until a valid candidate can replace it, discarding stale candidates along the way.
   */
  async _reconcileGeneration(sessionResource, entry) {
    while (this._entries.get(sessionResource) === entry && !entry.disposed) {
      const currentGeneration = this._generationMatchingDesiredState(entry);
      if (currentGeneration) {
        return currentGeneration.backendSession;
      }
      const workingDirectory = entry.workingDirectory;
      const workingDirectories = this._computeEntryWorkingDirectories(entry);
      const configVersion = entry.configVersion;
      const config = { ...entry.config };
      if (!await this._isTargetFolderTrusted(workingDirectory)) {
        await this._retireGeneration(sessionResource, entry);
        return void 0;
      }
      const candidate = this._newProvisionalUri(entry.provider);
      let created;
      try {
        created = await this._agentHostService.createSession({
          provider: entry.provider,
          session: candidate,
          _meta: this.getInitialSessionMetadata(),
          workingDirectories,
          config,
          progressToken: generateUuid()
        });
      } catch (err) {
        this._logService.warn(`[AgentHostProvisional] Failed to create provisional session for ${sessionResource.toString()}: ${err instanceof Error ? err.message : String(err)}`);
        await this._disposeBackend(candidate, "failed provisional candidate");
        await this._retireGeneration(sessionResource, entry);
        return void 0;
      }
      if (this._entries.get(sessionResource) !== entry || entry.disposed || entry.configVersion !== configVersion || !this._sameUri(entry.workingDirectory, workingDirectory) || !this._sameWorkingDirectories(entry.provider, this._computeEntryWorkingDirectories(entry), workingDirectories)) {
        await this._disposeBackend(created, "obsolete provisional candidate");
        continue;
      }
      const previous = entry.generation;
      entry.generation = { backendSession: created, workingDirectory, workingDirectories };
      this._publishActiveClient(entry);
      this._onDidChange.fire(sessionResource);
      if (previous) {
        await this._disposeBackend(previous.backendSession, "replaced provisional generation");
      }
      return created;
    }
    return void 0;
  }
  async _retireGeneration(sessionResource, entry) {
    const generation = entry.generation;
    if (!generation) {
      return;
    }
    entry.generation = void 0;
    if (this._entries.get(sessionResource) === entry) {
      this._onDidChange.fire(sessionResource);
    }
    await this._disposeBackend(generation.backendSession, "retired provisional generation");
  }
  async _disposeBackend(backendSession, reason) {
    this._pendingBackendDisposals.add(backendSession);
    try {
      await this._agentHostService.disposeSession(backendSession);
      this._pendingBackendDisposals.delete(backendSession);
      return true;
    } catch (err) {
      this._logService.warn(`[AgentHostProvisional] Failed to dispose ${reason} ${backendSession.toString()}: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }
  _retryPendingBackendDisposals() {
    for (const backendSession of this._pendingBackendDisposals) {
      void this._disposeBackend(backendSession, "pending provisional cleanup");
    }
  }
  /**
   * Whether the folder the provisional agent would run in is trusted. When a
   * working directory is known (it may be a standalone folder outside the
   * open workspace, e.g. a per-session folder), gate on that folder's trust;
   * otherwise fall back to whole-workspace trust.
   */
  async _isTargetFolderTrusted(workingDirectory) {
    if (workingDirectory) {
      const { trusted } = await this._workspaceTrustManagementService.getUriTrustInfo(workingDirectory);
      return trusted;
    }
    return this._workspaceTrustManagementService.isWorkspaceTrusted();
  }
  tryRebind(oldSessionResource, newSessionResource, provider) {
    return this._queue(oldSessionResource, async () => {
      const alreadyBound = this.get(newSessionResource);
      if (alreadyBound) {
        return alreadyBound;
      }
      const oldEntry = this._entries.get(oldSessionResource);
      if (!oldEntry || oldEntry.disposed) {
        return void 0;
      }
      const newBackendSession = this._toBackendUri(newSessionResource, provider);
      const imported = this._importConversationStore.take(newSessionResource);
      while (this._entries.get(oldSessionResource) === oldEntry && !oldEntry.disposed) {
        const config = { ...oldEntry.config };
        const configVersion = oldEntry.configVersion;
        const targetWorkingDirectory = oldEntry.workingDirectory;
        if (!oldEntry.usesWorkspaceRootSet && (this._computeWorkingDirectories(targetWorkingDirectory, provider)?.length ?? 0) > 1) {
          oldEntry.usesWorkspaceRootSet = true;
        }
        const targetWorkingDirectories = this._computeEntryWorkingDirectories(oldEntry);
        let created;
        try {
          created = await this._agentHostService.createSession({
            provider,
            session: newBackendSession,
            _meta: this.getInitialSessionMetadata(),
            workingDirectories: targetWorkingDirectories,
            config,
            ...imported ? { model: imported.model, importConversation: { turns: imported.turns, model: imported.model } } : {},
            progressToken: generateUuid()
          });
        } catch (err) {
          this._logService.warn(`[AgentHostProvisional] Failed to create rebound provisional: ${err instanceof Error ? err.message : String(err)}`);
          this._restoreImportedConversation(newSessionResource, imported);
          const disposed = await this._disposeBackend(newBackendSession, "failed rebound candidate");
          if (!disposed) {
            throw new Error(`Cannot safely recover rebound session ${newBackendSession.toString()} until its candidate is retired`);
          }
          return void 0;
        }
        if (this._entries.get(oldSessionResource) !== oldEntry || oldEntry.disposed) {
          const disposed = await this._disposeBackend(created, "retired rebound candidate");
          this._restoreImportedConversation(newSessionResource, imported);
          if (!disposed) {
            throw new Error(`Cannot safely recover rebound session ${newBackendSession.toString()} until its candidate is retired`);
          }
          return void 0;
        }
        if (oldEntry.configVersion !== configVersion || !this._sameUri(oldEntry.workingDirectory, targetWorkingDirectory) || !this._sameWorkingDirectories(oldEntry.provider, this._computeEntryWorkingDirectories(oldEntry), targetWorkingDirectories)) {
          const disposed = await this._disposeBackend(created, "obsolete rebound candidate");
          if (!disposed) {
            this._restoreImportedConversation(newSessionResource, imported);
            throw new Error(`Cannot safely retry rebound session ${newBackendSession.toString()} until its stale candidate is retired`);
          }
          continue;
        }
        const oldGeneration = oldEntry.generation;
        const newEntry = this._createEntry(provider, config, configVersion, targetWorkingDirectory, oldEntry.resolvedConfig);
        newEntry.usesWorkspaceRootSet = oldEntry.usesWorkspaceRootSet;
        this._updateActiveClientScope(newEntry);
        newEntry.generation = { backendSession: created, workingDirectory: targetWorkingDirectory, workingDirectories: targetWorkingDirectories };
        this._entries.set(newSessionResource, newEntry);
        this._publishActiveClient(newEntry);
        this._entries.delete(oldSessionResource);
        oldEntry.disposed = true;
        oldEntry.activeClientBinding.dispose();
        this._resolvedConfigs.delete(oldSessionResource);
        this._resolvedConfigRequestSeq.delete(oldSessionResource);
        this._rebound.add(oldSessionResource);
        this._onDidChange.fire(newSessionResource);
        if (oldGeneration) {
          await this._disposeBackend(oldGeneration.backendSession, "temporary provisional generation");
        }
        return created;
      }
      this._restoreImportedConversation(newSessionResource, imported);
      return void 0;
    });
  }
  _restoreImportedConversation(sessionResource, imported) {
    if (imported) {
      this._importConversationStore.set(sessionResource, imported);
    }
  }
  /**
   * Recreate the provisional backend session for `sessionResource` at a new
   * working directory, preserving the user's config choices. A created
   * session's cwd is immutable, so the only way to honor a folder change is to
   * dispose and recreate. The replacement uses a fresh backend URI so existing
   * subscribers acquire an authoritative snapshot for the new incarnation.
   *
   * `newWorkingDirectory` may be `undefined` when the workspace has no folders
   * left (e.g. the draft's only/primary folder was removed); the provisional is
   * then recreated with no working directory, letting the host choose — the same
   * as a draft first created in an empty workspace.
   */
  _changeWorkingDirectory(sessionResource, newWorkingDirectory) {
    const entry = this._entries.get(sessionResource);
    if (!entry || entry.disposed || this._sameUri(entry.workingDirectory, newWorkingDirectory)) {
      return Promise.resolve();
    }
    entry.workingDirectory = newWorkingDirectory;
    entry.usesWorkspaceRootSet = (this._computeWorkingDirectories(newWorkingDirectory, entry.provider)?.length ?? 0) > 1;
    this._updateActiveClientScope(entry);
    entry.configVersion++;
    entry.resolvedConfig = void 0;
    const work = this._queue(sessionResource, async () => {
      if (this._entries.get(sessionResource) !== entry || entry.disposed) {
        return;
      }
      const backend = await this._reconcileGeneration(sessionResource, entry);
      if (!backend) {
        return;
      }
      const configVersion = entry.configVersion;
      const workingDirectory = entry.workingDirectory;
      try {
        const resolved = await this._agentHostService.resolveSessionConfig({
          provider: entry.provider,
          workingDirectory,
          config: { ...entry.config }
        });
        if (this._entries.get(sessionResource) === entry && !entry.disposed && entry.configVersion === configVersion && this._sameUri(entry.workingDirectory, workingDirectory)) {
          entry.config = { ...entry.config, ...resolved.values };
          entry.resolvedConfig = resolved;
        }
      } catch (err) {
        this._logService.warn(`[AgentHostProvisional] schema re-resolve after cwd change failed: ${err instanceof Error ? err.message : String(err)}`);
      }
      this._onDidChange.fire(sessionResource);
    });
    this._onDidChange.fire(sessionResource);
    return work;
  }
  disposeSession(sessionResource) {
    const entry = this._entries.get(sessionResource);
    this._resolvedConfigs.delete(sessionResource);
    this._resolvedConfigRequestSeq.delete(sessionResource);
    this._sessionCreationMetadata.delete(sessionResource);
    if (!entry) {
      return Promise.resolve();
    }
    entry.disposed = true;
    entry.activeClientBinding.dispose();
    this._entries.delete(sessionResource);
    this._onDidChange.fire(sessionResource);
    return this._queue(sessionResource, async () => {
      if (entry.generation) {
        await this._disposeBackend(entry.generation.backendSession, "provisional generation");
        entry.generation = void 0;
      }
    });
  }
  dispose() {
    for (const [, entry] of this._entries) {
      entry.disposed = true;
      entry.activeClientBinding.dispose();
      if (entry.generation) {
        this._agentHostService.disposeSession(entry.generation.backendSession).catch(() => {
        });
      }
    }
    for (const backendSession of this._pendingBackendDisposals) {
      this._agentHostService.disposeSession(backendSession).catch(() => {
      });
    }
    this._entries.clear();
    this._pending.clear();
    this._pendingBackendDisposals.clear();
    this._resolvedConfigs.clear();
    this._resolvedConfigRequestSeq.clear();
    this._sessionCreationMetadata.clear();
    this._rebound.clear();
    super.dispose();
  }
  /**
   * Convert the chat-input UI session URI (`agent-host-PROVIDER:/<id>`)
   * to the agent-host backend URI (`PROVIDER:/<id>`).
   */
  _toBackendUri(sessionResource, provider) {
    const rawId = sessionResource.path.replace(/^\//, "");
    return URI.from({ scheme: provider, path: `/${rawId}` });
  }
  getResolvedConfig(sessionResource) {
    return this._entries.get(sessionResource)?.resolvedConfig ?? this._resolvedConfigs.get(sessionResource);
  }
  async refreshResolvedConfig(sessionResource, provider, workingDirectory, config) {
    const seq = (this._resolvedConfigRequestSeq.get(sessionResource) ?? 0) + 1;
    this._resolvedConfigRequestSeq.set(sessionResource, seq);
    try {
      const resolved = await this._agentHostService.resolveSessionConfig({
        provider,
        workingDirectory,
        config
      });
      if (this._resolvedConfigRequestSeq.get(sessionResource) !== seq) {
        return;
      }
      const entry = this._entries.get(sessionResource);
      if (entry) {
        entry.config = { ...entry.config, ...resolved.values };
        entry.resolvedConfig = resolved;
      } else {
        this._resolvedConfigs.set(sessionResource, resolved);
      }
      this._onDidChange.fire(sessionResource);
    } catch (err) {
      this._logService.warn(`[AgentHostProvisional] schema re-resolve failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  async applyConfigChange(sessionResource, provider, workingDirectory, partial) {
    const entry = this._ensureEntry(sessionResource, provider, workingDirectory);
    if (!entry) {
      return void 0;
    }
    Object.assign(entry.config, partial);
    entry.configVersion++;
    if (entry.resolvedConfig) {
      entry.resolvedConfig = {
        ...entry.resolvedConfig,
        values: { ...entry.resolvedConfig.values, ...partial }
      };
    }
    return this._queue(sessionResource, async () => {
      if (this._entries.get(sessionResource) !== entry || entry.disposed) {
        return void 0;
      }
      const backend = await this._reconcileGeneration(sessionResource, entry);
      if (!backend || this._entries.get(sessionResource) !== entry || entry.disposed) {
        return void 0;
      }
      this._agentHostService.dispatch(backend.toString(), {
        type: "session/configChanged" /* SessionConfigChanged */,
        config: partial
      });
      const configVersion = entry.configVersion;
      const resolvedWorkingDirectory = entry.workingDirectory;
      try {
        const resolved = await this._agentHostService.resolveSessionConfig({
          provider,
          workingDirectory: resolvedWorkingDirectory,
          config: { ...entry.config }
        });
        const stillCurrent = this._entries.get(sessionResource);
        if (stillCurrent === entry && !entry.disposed && entry.configVersion === configVersion && this._sameUri(entry.workingDirectory, resolvedWorkingDirectory)) {
          const resolvedValues = { ...resolved.values };
          const mergedConfig = { ...entry.config, ...resolvedValues };
          const configChanged = !equals4(entry.config, mergedConfig);
          const resolvedChanged = !equals4(entry.resolvedConfig, resolved);
          if (configChanged || resolvedChanged) {
            entry.config = mergedConfig;
            entry.resolvedConfig = resolved;
            this._onDidChange.fire(sessionResource);
          }
        }
      } catch (err) {
        this._logService.warn(`[AgentHostProvisional] schema re-resolve failed: ${err instanceof Error ? err.message : String(err)}`);
      }
      return backend;
    });
  }
  /**
   * Workbench-side initial config seed sent at `createSession` time so the
   * agent's own server-side defaults don't fill `state.config.values` for
   * keys the workbench wants to control. Without this, the merge filter in
   * `agentHostSessionHandler` sees those agent defaults as "user-set" and
   * drops the workbench defaults.
   *
   * - `isolation`: workbench has no isolation picker, so always `'folder'`.
   * - `mode`: seeded from the `chat.defaultConfiguration` object setting.
   *   OpenCode: the old approval levels (autoApprove / autopilot) were removed,
   *   so no approval seed is sent and an `autopilot` mode is ignored.
   *
   * Skipped entirely in the Agents window, where the sessions provider
   * supplies config via `request.agentHostSessionConfig` instead.
   */
  _getInitialConfig() {
    if (this._environmentService.isSessionsWindow) {
      return void 0;
    }
    const config = { ["isolation" /* Isolation */]: "folder" };
    const configuredDefaults = this._configurationService.getValue("chat.defaultConfiguration" /* DefaultConfiguration */);
    const configuredMode = configuredDefaults?.mode;
    if (typeof configuredMode === "string" && KNOWN_MODE_VALUES.has(configuredMode)) {
      config["mode" /* Mode */] = configuredMode;
    }
    return config;
  }
};

AgentHostUntitledProvisionalSessionService = __decorateClass([
  __decorateParam(0, IAgentHostService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IChatService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, IAgentHostNewSessionFolderService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, IWorkspaceTrustManagementService),
  __decorateParam(8, IAgentHostImportConversationStore),
  __decorateParam(9, IAgentHostActiveClientService),
  __decorateParam(10, IUriIdentityService)
], AgentHostUntitledProvisionalSessionService);

registerSingleton(
  IAgentHostUntitledProvisionalSessionService,
  AgentHostUntitledProvisionalSessionService,
  1 /* Delayed */
);
export { IAgentHostUntitledProvisionalSessionService, ActiveClientBinding, AgentHostUntitledProvisionalSessionService };
