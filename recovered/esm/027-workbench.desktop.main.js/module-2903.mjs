// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionListContribution.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { AgentHostSessionListStore } from "./module-2902.mjs";
import { IAgentHostService, affectsAgentHostProviderPreference, shouldSurfaceLocalAgentHostProvider } from "./module-1107.mjs";
import { AgentHostSessionListController } from "./module-2901.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatSessionsService } from "./module-0960.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IAgentHostSessionWorkingDirectoryResolver } from "./module-2107.mjs";
import { IAgentHostEnablementService } from "./module-0963.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionListContribution.ts
var AgentHostSessionListContribution = class extends Disposable {
  constructor(_agentHostService, _chatSessionsService, _configurationService, _instantiationService, environmentService, _workingDirectoryResolver, _agentHostEnablementService) {
    super();
    this._agentHostService = _agentHostService;
    this._chatSessionsService = _chatSessionsService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._workingDirectoryResolver = _workingDirectoryResolver;
    this._agentHostEnablementService = _agentHostEnablementService;
    this._agentRegistrations = this._register(new DisposableMap());
    this._initialized = false;
    this._isSessionsWindow = environmentService.isSessionsWindow;
    if (this._isSessionsWindow) {
      return;
    }
    this._register(autorun((reader) => {
      if (this._agentHostEnablementService.enabled.read(reader)) {
        const wasInitialized = this._initialized;
        this._initialize();
        const current = this._agentHostService.rootState.value;
        if (wasInitialized && current && !(current instanceof Error) && this._sessionListStore) {
          this._handleRootStateChange(current, this._sessionListStore);
        }
      } else {
        this._agentRegistrations.clearAndDisposeAll();
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.agentHostSessionListContribution";
  }
  _initialize() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const sessionListStore = this._register(this._instantiationService.createInstance(AgentHostSessionListStore, this._agentHostService));
    this._sessionListStore = sessionListStore;
    this._register(this._agentHostService.rootState.onDidChange((rootState) => {
      this._handleRootStateChange(rootState, sessionListStore);
    }));
    this._register(this._agentHostService.onAgentHostStart(() => {
      sessionListStore.resetCache();
    }));
    const initialRootState = this._agentHostService.rootState.value;
    if (initialRootState && !(initialRootState instanceof Error)) {
      this._handleRootStateChange(initialRootState, sessionListStore);
    }
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (!affectsAgentHostProviderPreference(e, this._isSessionsWindow)) {
        return;
      }
      const current = this._agentHostService.rootState.value;
      if (current && !(current instanceof Error)) {
        this._handleRootStateChange(current, sessionListStore);
      }
    }));
  }
  _shouldRegisterAgent(provider) {
    return shouldSurfaceLocalAgentHostProvider(provider, this._configurationService, this._isSessionsWindow);
  }
  _handleRootStateChange(rootState, sessionListStore) {
    if (!this._agentHostEnablementService.enabled.get()) {
      return;
    }
    const allowed = rootState.agents.filter((agent) => this._shouldRegisterAgent(agent.provider));
    const incoming = new Set(allowed.map((agent) => agent.provider));
    for (const [provider] of this._agentRegistrations) {
      if (!incoming.has(provider)) {
        this._agentRegistrations.deleteAndDispose(provider);
      }
    }
    for (const agent of allowed) {
      if (!this._agentRegistrations.has(agent.provider)) {
        this._registerAgent(agent, sessionListStore);
      }
    }
  }
  _registerAgent(agent, sessionListStore) {
    const store = new DisposableStore();
    this._agentRegistrations.set(agent.provider, store);
    const sessionType = `agent-host-${agent.provider}`;
    const listController = store.add(this._instantiationService.createInstance(AgentHostSessionListController, sessionType, agent.provider, sessionListStore, void 0, "local"));
    store.add(this._chatSessionsService.registerChatSessionItemController(sessionType, listController));
    store.add(this._workingDirectoryResolver.registerResolver(sessionType, (_sessionResource) => void 0, (sessionResource) => listController.isNewSession(sessionResource)));
  }
};

AgentHostSessionListContribution = __decorateClass([
  __decorateParam(0, IAgentHostService),
  __decorateParam(1, IChatSessionsService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, IAgentHostSessionWorkingDirectoryResolver),
  __decorateParam(6, IAgentHostEnablementService)
], AgentHostSessionListContribution);
export { AgentHostSessionListContribution };
