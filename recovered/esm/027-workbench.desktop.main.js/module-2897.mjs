// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostChatContribution.ts
import { languageModelSourcePresentationRegistry } from "./module-2187.mjs";
import { CHATGPT_SUBSCRIPTION_MODEL_SOURCE_ID } from "./module-2186.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { Registry } from "./module-0090.mjs";
import { IChatSessionsService, isLocalAgentHostTarget } from "./module-0960.mjs";
import { IAgentHostEnablementService } from "./module-0963.mjs";
import { IAgentHostService, affectsAgentHostProviderPreference, shouldSurfaceLocalAgentHostProvider } from "./module-1107.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { Event2 } from "./module-0017.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { AgentHostAuthTokenCache, AgentHostAuthenticationRecovery, authenticateProtectedResources, resolveAuthenticationInteractively } from "./module-2130.mjs";
import { autorun } from "./module-0052.mjs";
import { AgentHostPromptCacheNotification } from "./module-2895.mjs";
import { LOCAL_AGENT_HOST_AUTHORITY } from "./module-1000.mjs";
import { NotificationType } from "./module-1614.mjs";
import { AgentHostDownloadProgress } from "./module-2877.mjs";
import { AgentHostLanguageModelProvider, agentHostProviderSupportsAutoModel } from "./module-2879.mjs";
import { protectedResourcesRequireGitHubCopilotSignIn } from "./module-1106.mjs";
import { AgentCustomizationItemProvider } from "./module-2876.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { AICustomizationManagementSection } from "./module-0995.mjs";
import { COPILOT_CHAT_GITHUB_MCP_COLLECTION_ID, agentHostProviderHasBuiltInGitHubMcpServer } from "./module-2114.mjs";
import { AgentHostSessionHandler } from "./module-2894.mjs";
import { mark } from "./module-0506.mjs";
import { CancellationError, isCancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { ILogService } from "./module-0095.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAgentHostFileSystemService2 } from "./module-2121.mjs";
import { ICustomizationHarnessService } from "./module-1031.mjs";
import { IAgentHostActiveClientService } from "./module-2123.mjs";
import { IAgentHostProtectedResourcesService } from "./module-2896.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostChatContribution.ts
var LOCAL_AGENT_HOST_SESSION_TYPE_PREFIX2 = "agent-host-";

languageModelSourcePresentationRegistry.register({
  ownerVendor: "agent-host-codex",
  sourceId: CHATGPT_SUBSCRIPTION_MODEL_SOURCE_ID,
  label: localize(8932, null),
  icon: Codicon.openai,
  description: localize(8931, null)
});

Registry.as("workbench.contrib.chatSessions.asyncActivation" /* AsyncActivation */).register({
  matchSessionType: (sessionType) => isLocalAgentHostTarget(sessionType),
  waitForActivation: waitForLocalAgentHostActivation
});

async function waitForLocalAgentHostActivation(accessor, sessionType) {
  const agentHostEnablementService = accessor.get(IAgentHostEnablementService);
  const agentHostService = accessor.get(IAgentHostService);
  const configurationService = accessor.get(IConfigurationService);
  const environmentService = accessor.get(IWorkbenchEnvironmentService);
  if (!agentHostEnablementService.enabled.get()) {
    return false;
  }
  const provider = getLocalAgentHostProviderForSessionType(sessionType);
  if (!provider) {
    return false;
  }
  while (true) {
    const rootState = agentHostService.rootState.value;
    if (rootState instanceof Error) {
      return false;
    }
    if (rootState) {
      return rootState.agents.some((agent) => agent.provider === provider && shouldSurfaceLocalAgentHostProvider(agent.provider, configurationService, environmentService.isSessionsWindow));
    }
    const changed = await Promise.race([
      Event2.toPromise(agentHostService.rootState.onDidChange).then(() => true),
      Event2.toPromise(agentHostService.onAgentHostExit).then(() => false)
    ]);
    if (!changed) {
      return false;
    }
  }
}

function getLocalAgentHostProviderForSessionType(sessionType) {
  if (!isLocalAgentHostTarget(sessionType) || !sessionType.startsWith(LOCAL_AGENT_HOST_SESSION_TYPE_PREFIX2)) {
    return void 0;
  }
  return sessionType.slice(LOCAL_AGENT_HOST_SESSION_TYPE_PREFIX2.length) || void 0;
}

var AgentHostContribution = class extends Disposable {
  constructor(_agentHostService, _chatSessionsService, _defaultAccountService, _authenticationService, _logService, _languageModelsService, _instantiationService, _agentHostFileSystemService, _configurationService, _customizationHarnessService, environmentService, _activeClientService, _protectedResourcesService, _agentHostEnablementService) {
    super();
    this._agentHostService = _agentHostService;
    this._chatSessionsService = _chatSessionsService;
    this._defaultAccountService = _defaultAccountService;
    this._authenticationService = _authenticationService;
    this._logService = _logService;
    this._languageModelsService = _languageModelsService;
    this._instantiationService = _instantiationService;
    this._agentHostFileSystemService = _agentHostFileSystemService;
    this._configurationService = _configurationService;
    this._customizationHarnessService = _customizationHarnessService;
    this._activeClientService = _activeClientService;
    this._protectedResourcesService = _protectedResourcesService;
    this._agentHostEnablementService = _agentHostEnablementService;
    this._agentRegistrations = this._register(new DisposableMap());
    /** Model providers keyed by agent provider, for pushing model updates. */
    this._modelProviders = /* @__PURE__ */ new Map();
    /** Dedupes redundant `authenticate` RPCs when the resolved token hasn't changed. */
    this._authTokenCache = new AgentHostAuthTokenCache();
    this._authRecovery = new AgentHostAuthenticationRecovery();
    this._initialized = false;
    this._enablementStore = this._register(new MutableDisposable());
    this._authenticationGeneration = 0;
    this._didStartInitialAuthentication = false;
    this._isSessionsWindow = environmentService.isSessionsWindow;
    this._enableSmokeTestDriver = !!environmentService.enableSmokeTestDriver;
    this._register(autorun((reader) => {
      const enabled = this._agentHostEnablementService.enabled.read(reader);
      if (enabled) {
        const wasInitialized = this._initialized;
        this._initialize();
        this._enable();
        const current = this._agentHostService.rootState.value;
        if (wasInitialized && current && !(current instanceof Error)) {
          this._handleRootStateChange(current);
        }
      } else {
        this._authenticationGeneration++;
        this._authTokenCache.clear();
        this._authRecovery.clear();
        this._enablementStore.clear();
        this._agentHostService.setAuthenticationPending(false);
        this._agentRegistrations.clearAndDisposeAll();
        this._modelProviders.clear();
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.agentHostContribution";
  }
  _initialize() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    this._promptCacheNotification = this._register(this._instantiationService.createInstance(AgentHostPromptCacheNotification));
    this._register(this._agentHostFileSystemService.registerAuthority(LOCAL_AGENT_HOST_AUTHORITY, this._agentHostService));
    this._register(this._agentHostService.rootState.onDidChange((rootState) => {
      this._handleRootStateChange(rootState);
    }));
    const initialRootState = this._agentHostService.rootState.value;
    if (initialRootState && !(initialRootState instanceof Error)) {
      this._handleRootStateChange(initialRootState);
    }
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (!affectsAgentHostProviderPreference(e, this._isSessionsWindow)) {
        return;
      }
      const current = this._agentHostService.rootState.value;
      if (current && !(current instanceof Error)) {
        this._handleRootStateChange(current);
      }
    }));
  }
  _enable() {
    if (this._enablementStore.value) {
      return;
    }
    const store = new DisposableStore();
    store.add(this._agentHostService.onDidNotification((notification) => {
      if (notification.type !== NotificationType.AuthRequired) {
        return;
      }
      this._authenticateNotificationResource(notification.resource);
    }));
    if (!this._isSessionsWindow) {
      const downloadProgress = store.add(this._instantiationService.createInstance(AgentHostDownloadProgress));
      store.add(this._agentHostService.onDidNotification((n2) => {
        if (n2.type === NotificationType.Progress) {
          downloadProgress.handleProgress(n2);
        }
      }));
    }
    this._enablementStore.value = store;
  }
  _shouldRegisterAgent(provider) {
    return shouldSurfaceLocalAgentHostProvider(provider, this._configurationService, this._isSessionsWindow);
  }
  _handleRootStateChange(rootState) {
    if (!this._agentHostEnablementService.enabled.get()) {
      return;
    }
    const allowed = rootState.agents.filter((a) => this._shouldRegisterAgent(a.provider));
    const incoming = new Set(allowed.map((a) => a.provider));
    for (const [provider] of this._agentRegistrations) {
      if (!incoming.has(provider)) {
        this._agentRegistrations.deleteAndDispose(provider);
        this._modelProviders.delete(provider);
      }
    }
    this._authenticateWithServer(allowed).catch(() => {
    });
    for (const agent of allowed) {
      if (!this._agentRegistrations.has(agent.provider)) {
        this._registerAgent(agent);
      } else {
        const modelProvider = this._modelProviders.get(agent.provider);
        modelProvider?.updateModels(agent.models);
      }
    }
  }
  _registerAgent(agent) {
    const store = new DisposableStore();
    this._agentRegistrations.set(agent.provider, store);
    const sessionType = `agent-host-${agent.provider}`;
    const agentId = sessionType;
    const vendor = sessionType;
    const ahService = this._agentHostService;
    store.add(this._chatSessionsService.registerChatSessionContribution({
      type: sessionType,
      name: agentId,
      displayName: agent.displayName,
      description: agent.description,
      locations: agent.provider === "copilotcli" ? ["panel" /* Chat */, "terminal" /* Terminal */, "editor" /* EditorInline */] : void 0,
      customAgentTarget: this._isSessionsWindow ? void 0 : "github-copilot" /* GitHubCopilot */,
      canDelegate: true,
      requiresCustomModels: true,
      supportsAutoModel: agentHostProviderSupportsAutoModel(agent.provider),
      // Derived live from the agent's currently-advertised protected resources
      // (via the protected-resources service): an agent that marks the GitHub
      // Copilot resource `required: false` (Claude in native mode, Codex on
      // OpenAI) is usable without signing in. Falls back to "required" until the
      // agent host resolves. The paired `onDidChangeRequiresCopilotSignIn` lets
      // the sessions service re-evaluate this when the set changes.
      requiresCopilotSignIn: () => {
        const resources = this._protectedResourcesService.getProtectedResources(agent.provider);
        return resources !== void 0 ? protectedResourcesRequireGitHubCopilotSignIn(resources) : true;
      },
      onDidChangeRequiresCopilotSignIn: Event2.signal(Event2.filter(this._protectedResourcesService.onDidChange, (provider) => provider === agent.provider, store)),
      agentHostProviderId: agent.provider,
      supportsDelegation: true,
      capabilities: {
        supportsCheckpoints: true,
        supportsPromptAttachments: true,
        supportsImageAttachments: true,
        get terminalCommandPrefix() {
          return ahService.initializeResult.get()?.terminalCommandPrefix;
        }
      }
    }));
    const syncProvider = this._activeClientService.getSyncProvider(sessionType);
    const ambientScope = store.add(this._activeClientService.acquireScope(sessionType, []));
    const itemProvider = store.add(this._instantiationService.createInstance(
      AgentCustomizationItemProvider,
      "local",
      void 0,
      (syncedUri) => this._activeClientService.getOrigin(syncedUri)
    ));
    itemProvider.setDraftCustomAgents(ambientScope.customAgents);
    itemProvider.setDraftCustomizations(ambientScope.customizations);
    store.add(this._customizationHarnessService.registerExternalHarness({
      id: sessionType,
      label: agent.displayName,
      icon: ThemeIcon.fromId(Codicon.server.id),
      // The Tools section is surfaced for the Copilot CLI agent host only.
      hiddenSections: agent.provider === "copilotcli" ? [AICustomizationManagementSection.Prompts] : [AICustomizationManagementSection.Tools, AICustomizationManagementSection.Prompts],
      hideGenerateButton: true,
      syncProvider,
      itemProvider,
      hiddenMcpServerCollectionIds: agentHostProviderHasBuiltInGitHubMcpServer(agent.provider) ? [COPILOT_CHAT_GITHUB_MCP_COLLECTION_ID] : void 0
    }));
    const sessionHandler = store.add(this._instantiationService.createInstance(AgentHostSessionHandler, {
      provider: agent.provider,
      agentId,
      sessionType,
      fullName: agent.displayName,
      description: agent.description,
      connection: this._agentHostService,
      connectionAuthority: LOCAL_AGENT_HOST_AUTHORITY,
      onSessionMaterialized: (resource) => this._chatSessionsService.notifySessionMaterialized?.(resource),
      resolveAuthentication: (resources) => this._resolveAuthenticationInteractively(resources),
      promptCacheNotification: this._promptCacheNotification
    }));
    store.add(this._chatSessionsService.registerChatSessionContentProvider(sessionType, sessionHandler));
    const vendorDescriptor = { vendor, displayName: agent.displayName, configuration: void 0, managementCommand: void 0, when: void 0 };
    this._languageModelsService.deltaLanguageModelChatProviderDescriptors([vendorDescriptor], []);
    store.add(toDisposable(() => this._languageModelsService.deltaLanguageModelChatProviderDescriptors([], [vendorDescriptor])));
    const modelProvider = store.add(new AgentHostLanguageModelProvider(sessionType, vendor));
    this._modelProviders.set(agent.provider, modelProvider);
    store.add(toDisposable(() => this._modelProviders.delete(agent.provider)));
    store.add(this._languageModelsService.registerLanguageModelProvider(vendor, modelProvider));
    modelProvider.updateModels(agent.models);
    store.add(this._defaultAccountService.onDidChangeDefaultAccount(() => {
      const agents = this._getRootAgents();
      this._authenticateWithServer(agents).catch(() => {
      });
    }));
    store.add(this._authenticationService.onDidChangeSessions(() => {
      const agents = this._getRootAgents();
      this._authenticateWithServer(agents).catch(() => {
      });
    }));
  }
  _getRootAgents() {
    const rootState = this._agentHostService.rootState.value;
    const agents = rootState && !(rootState instanceof Error) ? rootState.agents : [];
    return agents.filter((a) => this._shouldRegisterAgent(a.provider));
  }
  /**
   * Authenticate using protectedResources from agent info in root state.
   * Resolves tokens via the standard VS Code authentication service.
   */
  async _authenticateWithServer(agents) {
    const generation = this._authenticationGeneration;
    if (!this._isAuthenticationCurrent(generation)) {
      return;
    }
    const isInitialAuthentication = agents.length > 0 && !this._didStartInitialAuthentication;
    if (isInitialAuthentication) {
      this._didStartInitialAuthentication = true;
      mark("code/agentHost/willAuthenticate");
    }
    this._agentHostService.setAuthenticationPending(true);
    try {
      const testToken = this._getScenarioAutomationToken();
      if (testToken !== void 0) {
        await this._seedTestToken(agents, testToken, generation);
        return;
      }
      await this._instantiationService.invokeFunction(authenticateProtectedResources, agents, {
        authTokenCache: this._authTokenCache,
        logPrefix: "[AgentHost]",
        isCurrent: () => this._isAuthenticationCurrent(generation),
        authenticate: (request2) => this._authenticateIfCurrent(request2, generation)
      });
    } catch (err) {
      if (!isCancellationError(err)) {
        this._logService.error("[AgentHost] Failed to authenticate with server", err);
      }
    } finally {
      if (this._isAuthenticationCurrent(generation)) {
        this._agentHostService.setAuthenticationPending(false);
      }
      if (isInitialAuthentication) {
        mark("code/agentHost/didAuthenticate");
      }
    }
  }
  _authenticateNotificationResource(protectedResource) {
    const generation = this._authenticationGeneration;
    if (!this._isAuthenticationCurrent(generation)) {
      return;
    }
    this._agentHostService.setAuthenticationPending(true);
    this._instantiationService.invokeFunction((accessor) => this._authRecovery.recover(accessor, protectedResource, {
      authTokenCache: this._authTokenCache,
      logPrefix: "[AgentHost]",
      isCurrent: () => this._isAuthenticationCurrent(generation),
      authenticate: (request2) => this._authenticateIfCurrent(request2, generation)
    })).catch((err) => {
      if (!isCancellationError(err)) {
        this._logService.error(`[AgentHost] Failed to authenticate notified resource ${protectedResource.resource}`, err);
      }
    }).finally(() => {
      if (this._isAuthenticationCurrent(generation)) {
        this._agentHostService.setAuthenticationPending(false);
      }
    });
  }
  /**
   * Interactively prompt the user to authenticate when the server requires it.
   * Uses protectedResources from root state, resolves the auth provider,
   * creates a session (which triggers the login UI), and pushes the token
   * to the server. Returns true if authentication succeeded.
   */
  async _resolveAuthenticationInteractively(protectedResources) {
    const generation = this._authenticationGeneration;
    if (!this._isAuthenticationCurrent(generation)) {
      return false;
    }
    const testToken = this._getScenarioAutomationToken();
    if (testToken !== void 0) {
      for (const resource of protectedResources) {
        await this._authTokenCache.authenticate(
          resource.resource,
          resource.scopes_supported,
          testToken,
          () => this._authenticateIfCurrent({ resource: resource.resource, token: testToken }, generation)
        );
      }
      return protectedResources.length > 0;
    }
    return this._instantiationService.invokeFunction(resolveAuthenticationInteractively, protectedResources, {
      authTokenCache: this._authTokenCache,
      logPrefix: "[AgentHost]",
      isCurrent: () => this._isAuthenticationCurrent(generation),
      authenticate: (request2) => this._authenticateIfCurrent(request2, generation)
    });
  }
  async _seedTestToken(agents, token, generation) {
    for (const agent of agents) {
      for (const resource of agent.protectedResources ?? []) {
        await this._authTokenCache.authenticate(
          resource.resource,
          resource.scopes_supported,
          token,
          () => this._authenticateIfCurrent({ resource: resource.resource, token }, generation)
        );
      }
    }
  }
  _getScenarioAutomationToken() {
    if (!this._enableSmokeTestDriver) {
      return void 0;
    }
    const token = this._configurationService.getValue("chat.agentHost.unsafeTestToken");
    return typeof token === "string" && token.length > 0 ? token : void 0;
  }
  _isAuthenticationCurrent(generation) {
    return generation === this._authenticationGeneration && this._agentHostEnablementService.enabled.get();
  }
  _authenticateIfCurrent(request2, generation) {
    if (!this._isAuthenticationCurrent(generation)) {
      return Promise.reject(new CancellationError());
    }
    return this._agentHostService.authenticate(request2);
  }
};

AgentHostContribution = __decorateClass([
  __decorateParam(0, IAgentHostService),
  __decorateParam(1, IChatSessionsService),
  __decorateParam(2, IDefaultAccountService),
  __decorateParam(3, IAuthenticationService),
  __decorateParam(4, ILogService),
  __decorateParam(5, ILanguageModelsService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IAgentHostFileSystemService2),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, ICustomizationHarnessService),
  __decorateParam(10, IWorkbenchEnvironmentService),
  __decorateParam(11, IAgentHostActiveClientService),
  __decorateParam(12, IAgentHostProtectedResourcesService),
  __decorateParam(13, IAgentHostEnablementService)
], AgentHostContribution);
export { waitForLocalAgentHostActivation, getLocalAgentHostProviderForSessionType, LOCAL_AGENT_HOST_SESSION_TYPE_PREFIX2, AgentHostContribution };
