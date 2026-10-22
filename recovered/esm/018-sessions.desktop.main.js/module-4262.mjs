// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostAgentPicker.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { IsPhoneLayoutContext, SessionProviderIdContext } from "./module-1770.mjs";
import { LOCAL_AGENT_HOST_PROVIDER_ID, REMOTE_AGENT_HOST_PROVIDER_RE, isAgentHostProvider } from "./module-1764.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Menus } from "./module-3437.mjs";
import { ChatContextKeyExprs, ChatContextKeys } from "./module-0966.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { ModePicker, ModePickerModel } from "./module-3706.mjs";
import { autorun } from "./module-0052.mjs";
import { ISessionContext } from "./module-3499.mjs";
import { ChatMode } from "./module-1469.mjs";
import { logChangesToStateModel } from "./module-1193.mjs";
import { agentHostAgentPickerStorageKey, resolveAgentHostAgent } from "./module-1743.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostAgentPicker.ts
var IsActiveSessionAgentHost = ContextKeyExpr.or(
  ContextKeyExpr.equals(SessionProviderIdContext.key, LOCAL_AGENT_HOST_PROVIDER_ID),
  ContextKeyExpr.regex(SessionProviderIdContext.key, REMOTE_AGENT_HOST_PROVIDER_RE)
);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "sessions.agentHost.agentPicker",
      title: localize2(4909, "Agent"),
      f1: false,
      menu: [{
        id: Menus.NewSessionConfig,
        group: "navigation",
        order: -1,
        when: ContextKeyExpr.and(IsActiveSessionAgentHost, IsPhoneLayoutContext.negate())
      }, {
        // Running-session input bar — only inside the dedicated
        // Agents Window. The regular VS Code chat editor uses the
        // built-in mode picker for Agent Host custom agents.
        id: MenuId.ChatInput,
        group: "navigation",
        order: 1,
        // Hide the agent picker while a delegation (continue in) target is pending.
        when: ContextKeyExpr.and(ChatContextKeyExprs.isAgentHostSession, IsSessionsWindowContext, IsPhoneLayoutContext.negate(), ChatContextKeys.hasPendingDelegationTarget.negate())
      }]
    });
  }
  async run() {
  }
});

var AgentHostModePickerActionViewItem = class extends BaseActionViewItem {
  constructor(picker, disposable) {
    super(void 0, { id: "", label: "", enabled: true, class: void 0, tooltip: "", run: () => {
    } });
    this.picker = picker;
    this._register(disposable);
  }
  render(container2) {
    container2.classList.add("chat-input-picker-item", "chat-agent-picker-item");
    this.picker.render(container2);
  }
  dispose() {
    this.picker.dispose();
    super.dispose();
  }
};

var AgentHostAgentPickerContribution = class extends Disposable {
  constructor(actionViewItemService, instantiationService, sessionsService, sessionsProvidersService, chatService, chatWidgetService, storageService, logService) {
    super();
    this.chatService = chatService;
    this.chatWidgetService = chatWidgetService;
    this.storageService = storageService;
    this.logService = logService;
    const modePickerModel = this._register(instantiationService.createInstance(ModePickerModel));
    let settingAgentInternally = false;
    const initAgentFromActiveSession = () => {
      const session = sessionsService.activeSession.get();
      this._initAgent(session, session?.mode.get()?.id, session?.status.get() === 0 /* Untitled */, sessionsProvidersService, () => settingAgentInternally = true, () => settingAgentInternally = false);
    };
    const syncChatInputModeFromActiveSession = () => {
      const session = sessionsService.activeSession.get();
      const selectedAgentUri = session?.mode.get()?.id;
      this._syncChatInputMode(session, selectedAgentUri, sessionsProvidersService);
    };
    this._register(autorun((reader) => {
      const session = sessionsService.activeSession.read(reader);
      const provider = this._getProvider(session, sessionsProvidersService);
      const selectedAgentUri = session?.mode.read(reader)?.id;
      modePickerModel.setSession(provider ? session : void 0, selectedAgentUri);
      const isUntitled = session?.status.read(reader) === 0 /* Untitled */;
      this._syncChatInputMode(session, selectedAgentUri, sessionsProvidersService);
      this._initAgent(session, selectedAgentUri, isUntitled, sessionsProvidersService, () => settingAgentInternally = true, () => settingAgentInternally = false);
    }));
    this._register(this.chatWidgetService.onDidAddWidget(() => {
      syncChatInputModeFromActiveSession();
    }));
    this._register(this.chatWidgetService.onDidChangeFocusedSession(() => {
      syncChatInputModeFromActiveSession();
    }));
    const customAgentsListener = this._register(new MutableDisposable());
    this._register(autorun((reader) => {
      const session = sessionsService.activeSession.read(reader);
      const provider = this._getProvider(session, sessionsProvidersService);
      customAgentsListener.value = provider?.onDidChangeCustomAgents(() => {
        if (!settingAgentInternally) {
          initAgentFromActiveSession();
        }
      });
    }));
    const factory = (_action, _options, scopedInstantiationService) => {
      const { session } = scopedInstantiationService.invokeFunction((accessor) => accessor.get(ISessionContext));
      const picker = scopedInstantiationService.createInstance(ModePicker, modePickerModel, session);
      const disposableStore = new DisposableStore();
      disposableStore.add(picker.onDidSelect((mode) => {
        this._selectMode(mode, session.get(), sessionsProvidersService);
      }));
      return scopedInstantiationService.createInstance(AgentHostModePickerActionViewItem, picker, disposableStore);
    };
    this._register(actionViewItemService.register(Menus.NewSessionConfig, "sessions.agentHost.agentPicker", factory));
    this._register(actionViewItemService.register(MenuId.ChatInput, "sessions.agentHost.agentPicker", factory));
  }
  static {
    this.ID = "sessions.contrib.agentHostAgentPicker";
  }
  _getProvider(session, sessionsProvidersService) {
    if (!session) {
      return void 0;
    }
    const provider = sessionsProvidersService.getProvider(session.providerId);
    return provider && isAgentHostProvider(provider) ? provider : void 0;
  }
  _syncChatInputMode(session, selectedAgentUri, sessionsProvidersService) {
    if (!session || !this._getProvider(session, sessionsProvidersService)) {
      return;
    }
    const chatModel = this.chatService.getSession(session.resource);
    const currentMode = chatModel?.inputModel.state.get()?.mode;
    const nextMode = selectedAgentUri ? { id: selectedAgentUri, kind: "agent" /* Agent */ } : { id: ChatMode.Agent.id, kind: "agent" /* Agent */ };
    if (currentMode?.id === nextMode.id && currentMode.kind === nextMode.kind) {
      this._syncVisibleChatInputMode(session, nextMode.id);
      return;
    }
    chatModel?.inputModel.setState({ mode: nextMode });
    this._syncVisibleChatInputMode(session, nextMode.id);
  }
  _syncVisibleChatInputMode(session, modeId) {
    const widget = this.chatWidgetService.getWidgetBySessionResource(session.resource);
    if (!widget) {
      return;
    }
    const currentMode = widget.input.currentModeObs.get();
    if (currentMode.id === modeId) {
      return;
    }
    const apply2 = async () => {
      await widget.input.currentChatModesObs.get().waitForPendingUpdates();
      if (widget.viewModel?.model.sessionResource.toString() !== session.resource.toString()) {
        return;
      }
      const mode = widget.input.currentChatModesObs.get().findModeById(modeId);
      if (!mode) {
        return;
      }
      const chatModel = this.chatService.getSession(session.resource);
      logChangesToStateModel(chatModel?.inputModel, `[AGPK] _syncVisibleChatInputMode -> widget.input.setChatMode(${modeId}) for ${session.resource.toString()}`, void 0, chatModel?.inputModel.state.get(), this.logService);
      widget.input.setChatMode(modeId, false);
    };
    apply2().catch((err) => this.logService.error("[AgentHostAgentPickerProbe] sync visible chat input mode failed", err));
  }
  _initAgent(session, selectedAgentUri, isUntitled, sessionsProvidersService, beginInternalSet, endInternalSet) {
    const provider = this._getProvider(session, sessionsProvidersService);
    if (!session || !provider) {
      return;
    }
    const agents = provider.getCustomAgents(session.sessionId);
    const storedUri = isUntitled ? this.storageService.get(agentHostAgentPickerStorageKey(session.resource.scheme), 0 /* PROFILE */) : void 0;
    const resolved = resolveAgentHostAgent(agents, selectedAgentUri, storedUri);
    if (!selectedAgentUri && isUntitled && resolved) {
      beginInternalSet();
      try {
        this._setAgent(session, provider, resolved);
      } finally {
        endInternalSet();
      }
    } else if (selectedAgentUri && !resolved && agents.length > 0 && !isUntitled) {
      beginInternalSet();
      try {
        this._setAgent(session, provider, void 0);
      } finally {
        endInternalSet();
      }
    }
  }
  _selectMode(mode, session, sessionsProvidersService) {
    if (!session) {
      return;
    }
    const provider = sessionsProvidersService.getProvider(session.providerId);
    if (!provider || !isAgentHostProvider(provider)) {
      return;
    }
    if (mode.id === ChatMode.Agent.id) {
      this._setAgent(session, provider, void 0);
    } else {
      const rawAgentUri = mode.id;
      this._setAgent(session, provider, { uri: rawAgentUri, name: mode.name.get() });
    }
  }
  _setAgent(session, provider, agent) {
    const key3 = agentHostAgentPickerStorageKey(session.resource.scheme);
    if (agent) {
      this.storageService.store(key3, agent.uri, 0 /* PROFILE */, 1 /* MACHINE */);
    } else {
      this.storageService.remove(key3, 0 /* PROFILE */);
    }
    provider.setAgent?.(session.sessionId, agent ? { uri: agent.uri, name: agent.name } : void 0);
  }
};

AgentHostAgentPickerContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, ISessionsProvidersService),
  __decorateParam(4, IChatService),
  __decorateParam(5, IChatWidgetService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, ILogService)
], AgentHostAgentPickerContribution);

registerWorkbenchContribution2(AgentHostAgentPickerContribution.ID, AgentHostAgentPickerContribution, WorkbenchPhase.AfterRestored);
export { IsActiveSessionAgentHost, AgentHostModePickerActionViewItem, AgentHostAgentPickerContribution };
