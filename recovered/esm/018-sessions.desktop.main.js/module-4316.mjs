// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/localAgentHostSessionsProvider.ts
import { URI } from "./module-0032.mjs";
import { basename2, dirname2, isEqualOrParent2, joinPath, relativePath } from "./module-0034.mjs";
import { AgentHostSessionAdapter, BaseAgentHostSessionsProvider } from "./module-3672.mjs";
import { LOCAL_AGENT_HOST_PROVIDER_ID, isAgentHostProvider } from "./module-1764.mjs";
import { Codicon } from "./module-0085.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { ResourceLabelHomeStore } from "./module-3674.mjs";
import { AutomationStore } from "./module-3683.mjs";
import { providerAutomationStorageKey } from "./module-3680.mjs";
import { ReconnectableAgentHostAutomationStore } from "./module-3682.mjs";
import { localize } from "./module-0001.mjs";
import { buildLocalSessionStateUri, getCopilotCliSessionRawId, migratedCopilotCliResource } from "./module-1110.mjs";
import { AgentSession } from "./module-1107.mjs";
import { workspacelessScratchDir } from "./module-4315.mjs";
import { autorun } from "./module-0052.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { IAgentHostService, affectsAgentHostProviderPreference, shouldSurfaceLocalAgentHostProvider } from "./module-1108.mjs";
import { LEGACY_MIGRATION_RESTORE_TIMEOUT_MS, LEGACY_MIGRATION_TIMEOUT_MS, adoptLegacyCopilotCliResource, isLegacyMigrationEnabledAtStartup } from "./module-1111.mjs";
import { WorkspaceNotTrustedError } from "./module-1766.mjs";
import { CancellationError } from "./module-0004.mjs";
import { raceCancellationError } from "./module-0036.mjs";
import { Event2 } from "./module-0017.mjs";
import { buildAgentHostSessionWorkspace, readBranchProtectionPatterns } from "./module-3661.mjs";
import { LOCAL_AGENT_HOST_AUTHORITY, toAgentHostContentUri, toAgentHostUri } from "./module-1001.mjs";
import { SESSION_WORKSPACE_GROUP_LOCAL } from "./module-1767.mjs";
import { Schemas } from "./module-0033.mjs";
import { constObservable } from "./module-0061.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatSessionsService } from "./module-0961.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";
import { IGitHubService } from "./module-3607.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IAgentHostActiveClientService } from "./module-1759.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { IDevContainerAgentHostService } from "./module-4271.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IPathService } from "./module-0939.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/localAgentHostSessionsProvider.ts
var LOCAL_RESOURCE_SCHEME_PREFIX = "agent-host-";

function isSameLogicalModel(source, target) {
  if (source.byokModelIdentifier || target.byokModelIdentifier) {
    return source.byokModelIdentifier !== void 0 && source.byokModelIdentifier === target.byokModelIdentifier;
  }
  return source.id === target.id && source.family === target.family && source.version === target.version;
}

function findEquivalentAgent(selectedAgentUri, sourceWorkspace, targetWorkspace, targetAgents) {
  const exact = targetAgents.find((agent) => agent.uri === selectedAgentUri);
  if (exact) {
    return exact;
  }
  const sourceAgentUri = URI.parse(selectedAgentUri);
  if (!isEqualOrParent2(sourceAgentUri, sourceWorkspace)) {
    return void 0;
  }
  const relativeAgentPath = relativePath(sourceWorkspace, sourceAgentUri);
  if (!relativeAgentPath) {
    return void 0;
  }
  return targetAgents.find((agent) => {
    const candidate = URI.parse(agent.uri);
    const targetRoot = candidate.with({ path: targetWorkspace.path, query: null, fragment: null });
    return relativePath(targetRoot, candidate) === relativeAgentPath;
  });
}

var LOCAL_AGENT_HOST_CACHED_SESSIONS_STORAGE_KEY = "localAgentHost.cachedSessions.v2";

var LOCAL_AGENT_HOST_CACHED_SESSIONS_STORAGE_KEY_LEGACY = "localAgentHost.cachedSessions";

var LocalAgentHostSessionsProvider = class extends BaseAgentHostSessionsProvider {
  constructor(_agentHostService, chatSessionsService, chatService, chatWidgetService, languageModelsService, _labelService, _configurationService, _telemetryService, logService, gitHubService, instantiationService, sessionsService, activeClientService, storageService, dialogService, environmentService, workspaceTrustManagementService, _workspaceTrustRequestService, _devContainerAgentHostService, _sessionsProvidersService, pathService) {
    super(chatSessionsService, chatService, chatWidgetService, languageModelsService, _configurationService, logService, gitHubService, instantiationService, sessionsService, activeClientService, storageService, dialogService, workspaceTrustManagementService);
    this._agentHostService = _agentHostService;
    this._labelService = _labelService;
    this._configurationService = _configurationService;
    this._telemetryService = _telemetryService;
    this._workspaceTrustRequestService = _workspaceTrustRequestService;
    this._devContainerAgentHostService = _devContainerAgentHostService;
    this._sessionsProvidersService = _sessionsProvidersService;
    this.id = LOCAL_AGENT_HOST_PROVIDER_ID;
    this.icon = Codicon.vm;
    this.supportsLocalWorkspaces = true;
    this.supportsQuickChats = true;
    this._automationSessionResources = new ResourceSet();
    this._devContainerAvailableDrafts = /* @__PURE__ */ new Set();
    this._devContainerDrafts = /* @__PURE__ */ new Set();
    this._resourceLabelHomes = this._register(instantiationService.createInstance(ResourceLabelHomeStore));
    const legacyAutomations = this._register(instantiationService.createInstance(AutomationStore, providerAutomationStorageKey(this.id)));
    const automations = this._register(instantiationService.createInstance(ReconnectableAgentHostAutomationStore, this.id, legacyAutomations, {
      toHost: (resource) => resource,
      fromHost: (resource) => resource,
      resourceSchemeForProvider: (provider) => this.resourceSchemeForProvider(provider),
      providerForResourceScheme: (scheme) => scheme.startsWith(LOCAL_RESOURCE_SCHEME_PREFIX) ? scheme.slice(LOCAL_RESOURCE_SCHEME_PREFIX.length) : void 0
    }));
    this.automations = automations;
    this._isSessionsWindow = environmentService.isSessionsWindow;
    this.label = localize(5028, null);
    this.browseActions = [];
    this._enableSessionCachePersistence(LOCAL_AGENT_HOST_CACHED_SESSIONS_STORAGE_KEY, LOCAL_AGENT_HOST_CACHED_SESSIONS_STORAGE_KEY_LEGACY);
    const updateResourceLabelHomes = () => {
      const homes = this.getResourceLabelHomes();
      const userHome = pathService.userHome({ preferLocal: true });
      const sessionStateRoot = buildLocalSessionStateUri(userHome);
      for (const session of this.getKnownSessions()) {
        const rawId = AgentSession.id(session.resource);
        const label3 = this.getResourceLabelHomeLabel(session);
        if (session.isQuickChat?.get() && (session.sessionType === "copilotcli" || session.sessionType === "claude")) {
          homes.push({ uri: workspacelessScratchDir(userHome, rawId), label: label3 });
        }
        if (session.sessionType === "copilotcli") {
          homes.push({ uri: joinPath(sessionStateRoot, rawId), label: label3 });
          for (const artifact of session.artifacts?.get() ?? []) {
            if (!artifact.uri || !isEqualOrParent2(artifact.uri, sessionStateRoot)) {
              continue;
            }
            const artifactSessionId = relativePath(sessionStateRoot, artifact.uri)?.split("/")[0];
            if (artifactSessionId) {
              homes.push({ uri: joinPath(sessionStateRoot, artifactSessionId), label: label3 });
            }
          }
        }
      }
      this._resourceLabelHomes.set(homes);
    };
    this._register(this._onDidChangeSessionsImmediately(updateResourceLabelHomes));
    this._register(this._onDidChangeDraftSessions.event(updateResourceLabelHomes));
    updateResourceLabelHomes();
    this._register(autorun((reader) => {
      this._automationSessionResources = new ResourceSet(this.automations.runs.read(reader).flatMap((run) => run.sessionResource ? [run.sessionResource] : []));
      const changed = this.syncAutomationSessionMarkers(this._sessionCache.values());
      if (changed.length > 0) {
        this._onDidChangeSessions.fire({ added: [], removed: [], changed });
      }
    }));
    const connectionListeners = this._register(new DisposableStore());
    const bindConnection = () => {
      connectionListeners.clear();
      automations.setConnection(this._agentHostService);
      this._attachConnectionListeners(this._agentHostService, connectionListeners);
      const rootState = this._agentHostService.rootState;
      this._syncRootState(rootState.value);
      connectionListeners.add(rootState.onDidChange(() => this._syncRootState(rootState.value)));
      if (rootState.onDidError) {
        connectionListeners.add(rootState.onDidError((error) => this._syncRootState(error)));
      }
    };
    bindConnection();
    this._register(this._agentHostService.onAgentHostStart(bindConnection));
    this._register(autorun((reader) => {
      if (this._agentHostService.authenticationPending.read(reader)) {
        return;
      }
      this._refreshSessions();
      this._resumeNewSessionAfterAuthenticationSettles();
    }));
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("git.branchProtection")) {
        this._refreshSessionWorkspaces();
      }
      if (affectsAgentHostProviderPreference(e4, this._isSessionsWindow)) {
        this._syncRootState(this._agentHostService.rootState.value);
        this._onDidChangeSessions.fire({ added: [], removed: [], changed: [] });
      }
    }));
  }
  get order() {
    return -1;
  }
  /**
   * Redirects a legacy extension-host Copilot CLI resource to its agent-host
   * twin, adopting it on the way.
   *
   * Subscribing to the twin is what performs adoption: the host restores the
   * session, which runs its own provenance and working-directory checks. A
   * session that is not ours to adopt fails that subscribe, and the caller falls
   * back to the legacy resource, so an external session is never worse off.
   *
   * Local-only by definition: `copilotcli:` and `agent-host-copilotcli:` name
   * sessions on this machine, so a remote host must never claim or probe them.
   */
  async resolveSessionResource(resource, reason) {
    if (!isLegacyMigrationEnabledAtStartup(this._configurationService)) {
      return void 0;
    }
    const rawId = getCopilotCliSessionRawId(migratedCopilotCliResource(resource));
    if (rawId && this._sessionCache.has(rawId)) {
      return migratedCopilotCliResource(resource);
    }
    const timeoutMs = reason === "restore" ? LEGACY_MIGRATION_RESTORE_TIMEOUT_MS : LEGACY_MIGRATION_TIMEOUT_MS;
    return adoptLegacyCopilotCliResource(this.connection, resource, this._logService, this._configurationService, this._telemetryService, reason ?? "open", timeoutMs);
  }
  createNewSession(workspaceUri, sessionTypeId, options3) {
    const session = super.createNewSession(workspaceUri, sessionTypeId, options3);
    void this._resolveDevContainerAvailability(session.sessionId, workspaceUri);
    return session;
  }
  async _resolveDevContainerAvailability(sessionId, workspaceUri) {
    try {
      const available = await this._devContainerAgentHostService.isAvailable(workspaceUri);
      if (!available || !this._getNewSession(sessionId)) {
        return;
      }
      this._devContainerAvailableDrafts.add(sessionId);
      this._onDidChangeSessionConfig.fire(sessionId);
    } catch (error) {
      this._logService.warn(`[${this.id}] Failed to resolve Dev Container availability for ${workspaceUri.toString()}`, error);
    }
  }
  isDevContainerAvailable(sessionId) {
    return this._devContainerAvailableDrafts.has(sessionId);
  }
  isDevContainerEnabled(sessionId) {
    return this._devContainerDrafts.has(sessionId);
  }
  setDevContainerEnabled(sessionId, enabled) {
    if (!this._getNewSession(sessionId)) {
      throw new Error(`Cannot configure unknown new session '${sessionId}'.`);
    }
    if (enabled && !this._devContainerAvailableDrafts.has(sessionId)) {
      throw new Error(`Cannot enable Dev Container execution for unavailable session '${sessionId}'.`);
    }
    if (enabled) {
      this._devContainerDrafts.add(sessionId);
    } else {
      this._devContainerDrafts.delete(sessionId);
    }
    this._onDidChangeSessionConfig.fire(sessionId);
  }
  startNewSessionRequest(sessionId, activity) {
    return super.startNewSessionRequest(
      sessionId,
      activity ?? (this._devContainerDrafts.has(sessionId) ? localize(5025, null) : void 0)
    );
  }
  async prepareNewSession(sessionId, token) {
    const draft = this._getNewSession(sessionId);
    if (!draft) {
      throw new Error(`Cannot prepare unknown new session '${sessionId}'.`);
    }
    if (!this._devContainerDrafts.has(sessionId)) {
      return { session: draft.session };
    }
    const sourceWorkspace = draft.session.workspace.get()?.folders[0]?.root;
    if (!sourceWorkspace) {
      throw new Error(localize(5027, null));
    }
    const trusted = await this._workspaceTrustRequestService.requestResourcesTrust({
      uri: sourceWorkspace,
      message: localize(5026, null)
    });
    if (!trusted) {
      throw new WorkspaceNotTrustedError();
    }
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    await this._waitForSessionConfigResolution(this, sessionId, token);
    const target = await this._devContainerAgentHostService.connect(sourceWorkspace, token);
    let deleteReplacement;
    try {
      await this._workspaceTrustManagementService.setUrisTrust([target.workspaceUri], true);
      const targetProvider = this._sessionsProvidersService.getProvider(target.providerId);
      if (!targetProvider || !isAgentHostProvider(targetProvider)) {
        throw new Error(localize(5024, null, target.providerId));
      }
      const targetSessionType = targetProvider.getSessionTypes(target.workspaceUri).find((sessionType) => sessionType.id === draft.session.sessionType) ?? targetProvider.getSessionTypes(target.workspaceUri)[0];
      if (!targetSessionType) {
        throw new Error(localize(5023, null));
      }
      const replacement = targetProvider.createNewSession(target.workspaceUri, targetSessionType.id);
      const discardReplacement = () => targetProvider.deleteNewSession(replacement.sessionId);
      deleteReplacement = discardReplacement;
      await this._waitForSessionConfigResolution(targetProvider, replacement.sessionId, token);
      const sourceConfig = this.getSessionConfig(sessionId);
      const targetConfig = targetProvider.getSessionConfig(replacement.sessionId);
      if (sourceConfig) {
        for (const [property, value2] of Object.entries(sourceConfig.values)) {
          const targetProperty = targetConfig?.schema.properties[property];
          if (!targetProperty || targetProperty.readOnly) {
            continue;
          }
          await targetProvider.setSessionConfigValue(replacement.sessionId, property, value2);
        }
      }
      const sourceChat = draft.session.mainChat.get();
      const replacementChat = replacement.mainChat.get();
      const modelId = sourceChat.modelId.get();
      const sourceModelSnapshot = this.getModelsSnapshot(sessionId, modelId);
      const sourceModel = sourceModelSnapshot.models.find((model) => model.identifier === modelId) ?? (sourceModelSnapshot.desiredModelResolution.kind === "available" ? sourceModelSnapshot.desiredModelResolution.model : void 0);
      const targetModel = sourceModel ? targetProvider.getModelsSnapshot(replacement.sessionId).models.find((model) => isSameLogicalModel(sourceModel.metadata, model.metadata)) : void 0;
      if (targetModel) {
        targetProvider.setModel(
          replacement.sessionId,
          replacementChat.resource,
          targetModel.identifier,
          sourceChat.modelSource.get() ?? "carriedOver" /* CarriedOver */
        );
      }
      const selectedAgentUri = sourceChat.mode.get()?.id;
      const targetAgent = selectedAgentUri ? findEquivalentAgent(selectedAgentUri, sourceWorkspace, target.workspaceUri, targetProvider.getCustomAgents(replacement.sessionId)) : void 0;
      if (targetAgent) {
        targetProvider.setAgent?.(replacement.sessionId, { uri: targetAgent.uri, name: targetAgent.name });
      }
      return {
        session: replacement,
        discard: async () => {
          try {
            discardReplacement();
          } finally {
            await target.release();
          }
        }
      };
    } catch (error) {
      try {
        deleteReplacement?.();
      } finally {
        await target.release();
      }
      throw error;
    }
  }
  async _waitForSessionConfigResolution(provider, sessionId, token) {
    while (provider.isSessionConfigResolving(sessionId).get()) {
      await raceCancellationError(
        Event2.toPromise(Event2.filter(provider.onDidChangeSessionConfig, (changedSessionId) => changedSessionId === sessionId)),
        token
      );
    }
  }
  deleteNewSession(sessionId) {
    this._devContainerAvailableDrafts.delete(sessionId);
    this._devContainerDrafts.delete(sessionId);
    super.deleteNewSession(sessionId);
  }
  _disposeAllNewSessions() {
    this._devContainerAvailableDrafts.clear();
    this._devContainerDrafts.clear();
    super._disposeAllNewSessions();
  }
  getSessions() {
    const sessions = super.getSessions();
    this.syncAutomationSessionMarkers(sessions);
    return sessions;
  }
  syncAutomationSessionMarkers(sessions) {
    const changed = [];
    for (const session of sessions) {
      if (!(session instanceof AgentHostSessionAdapter)) {
        continue;
      }
      const isAutomation = this._automationSessionResources.has(session.resource);
      if (session.isAutomation.get() !== isAutomation) {
        session.setIsAutomation(isAutomation);
        changed.push(session);
      }
    }
    return changed;
  }
  // -- BaseAgentHostSessionsProvider hooks ---------------------------------
  get connection() {
    return this._agentHostService;
  }
  get authenticationPending() {
    return this._agentHostService.authenticationPending;
  }
  _shouldAdvertiseAgent(provider) {
    return shouldSurfaceLocalAgentHostProvider(provider, this._configurationService, this._isSessionsWindow);
  }
  /**
   * Local resource scheme: `agent-host-${provider}`. Must match the type
   * string registered by AgentHostContribution. Distinct from the logical
   * {@link ISession.sessionType}, which is the agent provider name itself
   * (e.g. `copilotcli`) so the same agent shares one session type across
   * local and remote hosts.
   */
  resourceSchemeForProvider(provider) {
    return `${LOCAL_RESOURCE_SCHEME_PREFIX}${provider}`;
  }
  _adapterOptions() {
    return {
      buildWorkspace: (project, workingDirectories, gitHubInfo, gitState) => {
        const primary = workingDirectories?.[0];
        const uriForDescription = project?.uri ?? primary;
        const description = uriForDescription ? this._labelService.getUriLabel(dirname2(uriForDescription), { relative: false }) : void 0;
        const branchProtectionPatterns = readBranchProtectionPatterns(this._configurationService, primary ?? project?.uri);
        return LocalAgentHostSessionsProvider.buildWorkspace(project, workingDirectories, gitHubInfo, gitState, description, branchProtectionPatterns);
      }
    };
  }
  _formatSessionTypeLabel(agentLabel) {
    return agentLabel;
  }
  _diffUriMapper() {
    return (uri4, options3) => options3?.contentRef ? toAgentHostContentUri(uri4, LOCAL_AGENT_HOST_AUTHORITY) : toAgentHostUri(uri4, LOCAL_AGENT_HOST_AUTHORITY);
  }
  // -- Workspaces ----------------------------------------------------------
  static buildWorkspace(project, workingDirectories, gitHubInfo, gitState, description, branchProtectionPatterns) {
    return buildAgentHostSessionWorkspace(project, workingDirectories, { providerLabel: void 0, fallbackIcon: Codicon.folder, requiresWorkspaceTrust: true, description, branchProtectionPatterns, group: SESSION_WORKSPACE_GROUP_LOCAL }, gitHubInfo, gitState);
  }
  resolveWorkspace(repositoryUri) {
    if (repositoryUri.scheme !== Schemas.file) {
      return void 0;
    }
    const folderName = basename2(repositoryUri) || repositoryUri.path;
    return {
      uri: repositoryUri,
      label: folderName,
      description: this._labelService.getUriLabel(dirname2(repositoryUri), { relative: false }),
      group: SESSION_WORKSPACE_GROUP_LOCAL,
      icon: Codicon.folder,
      folders: [{
        root: repositoryUri,
        workingDirectory: repositoryUri,
        name: folderName,
        description: void 0,
        gitRepository: { uri: repositoryUri, workTreeUri: void 0, baseBranchName: void 0, gitHubInfo: constObservable(void 0) }
      }],
      requiresWorkspaceTrust: true,
      isVirtualWorkspace: false
    };
  }
};

LocalAgentHostSessionsProvider = __decorateClass([
  __decorateParam(0, IAgentHostService),
  __decorateParam(1, IChatSessionsService),
  __decorateParam(2, IChatService),
  __decorateParam(3, IChatWidgetService),
  __decorateParam(4, ILanguageModelsService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, ILogService),
  __decorateParam(9, IGitHubService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, ISessionsService),
  __decorateParam(12, IAgentHostActiveClientService),
  __decorateParam(13, IStorageService),
  __decorateParam(14, IDialogService),
  __decorateParam(15, IWorkbenchEnvironmentService),
  __decorateParam(16, IWorkspaceTrustManagementService),
  __decorateParam(17, IWorkspaceTrustRequestService),
  __decorateParam(18, IDevContainerAgentHostService),
  __decorateParam(19, ISessionsProvidersService),
  __decorateParam(20, IPathService)
], LocalAgentHostSessionsProvider);
export { isSameLogicalModel, findEquivalentAgent, LOCAL_RESOURCE_SCHEME_PREFIX, LOCAL_AGENT_HOST_CACHED_SESSIONS_STORAGE_KEY, LOCAL_AGENT_HOST_CACHED_SESSIONS_STORAGE_KEY_LEGACY, LocalAgentHostSessionsProvider };
