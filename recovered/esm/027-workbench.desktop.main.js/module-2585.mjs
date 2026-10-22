// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/experiments/agentSessionsExperiments.contribution.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { AGENT_SESSION_PROJECTION_ENABLED_PROVIDERS, AgentSessionProjectionService, IAgentSessionProjectionService } from "./module-2578.mjs";
import { isSessionInProgressStatus } from "./module-0960.mjs";
import { AgentSessionProviders } from "./module-0982.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { AgentTitleBarStatusService, IAgentTitleBarStatusService } from "./module-2576.mjs";
import { IAgentSessionsService } from "./module-1464.mjs";
import { IChatEditingService } from "./module-1081.mjs";
import { MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { EnterAgentSessionProjectionAction, ExitAgentSessionProjectionAction, ToggleUnifiedAgentsBarAction } from "./module-2580.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { AgentTitleBarStatusRendering } from "./module-2584.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { InEditorZenModeContext } from "./module-0949.mjs";
import { ProductQualityContext } from "./module-0635.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/experiments/agentSessionsExperiments.contribution.ts
var AgentSessionReadyContribution = class extends Disposable {
  // Suppress re-showing session-ready after user explicitly exits projection
  constructor(chatWidgetService, configurationService, agentTitleBarStatusService, agentSessionsService, agentSessionProjectionService, chatEditingService) {
    super();
    this.chatWidgetService = chatWidgetService;
    this.configurationService = configurationService;
    this.agentTitleBarStatusService = agentTitleBarStatusService;
    this.agentSessionsService = agentSessionsService;
    this.agentSessionProjectionService = agentSessionProjectionService;
    this.chatEditingService = chatEditingService;
    this._widgetDisposables = this._register(new DisposableStore());
    this._suppressSessionReady = false;
    for (const widget of this.chatWidgetService.getAllWidgets()) {
      if (widget.location === "panel" /* Chat */) {
        this._watchWidget(widget);
      }
    }
    this._register(this.chatWidgetService.onDidAddWidget((widget) => {
      if (widget.location === "panel" /* Chat */) {
        this._watchWidget(widget);
      }
    }));
    this._register(this.agentSessionProjectionService.onDidChangeProjectionMode((isActive2) => {
      if (!isActive2) {
        this._suppressSessionReady = true;
        this._clearEntriesWatcher();
        this.agentTitleBarStatusService.exitSessionReadyMode();
      }
    }));
    this._register(autorun((reader) => {
      this.chatEditingService.editingSessionsObs.read(reader);
      const currentWidget = this.chatWidgetService.getAllWidgets().find((w) => w.location === "panel" /* Chat */);
      if (currentWidget) {
        this._checkSession(currentWidget.viewModel?.sessionResource);
      }
    }));
    this._register(this.agentSessionsService.model.onDidChangeSessions(() => {
      const currentWidget = this.chatWidgetService.getAllWidgets().find((w) => w.location === "panel" /* Chat */);
      if (currentWidget) {
        this._checkSession(currentWidget.viewModel?.sessionResource);
      }
    }));
  }
  static {
    this.ID = "chat.agentSessionReady";
  }
  _watchWidget(widget) {
    this._widgetDisposables.clear();
    this._checkSession(widget.viewModel?.sessionResource);
    this._widgetDisposables.add(widget.onDidChangeViewModel(() => {
      this._checkSession(widget.viewModel?.sessionResource);
    }));
  }
  _checkSession(sessionResource) {
    if (sessionResource?.toString() !== this._watchedSessionResource?.toString()) {
      this._suppressSessionReady = false;
    }
    if (this.agentSessionProjectionService.isActive) {
      const activeSession = this.agentSessionProjectionService.activeSession;
      if (sessionResource && activeSession && sessionResource.toString() !== activeSession.resource.toString()) {
        const newSession = this.agentSessionsService.getSession(sessionResource);
        if (newSession) {
          this.agentSessionProjectionService.enterProjection(newSession);
        }
      }
      return;
    }
    this._updateSessionReadyState(sessionResource);
  }
  _clearEntriesWatcher() {
    this._entriesWatcher?.dispose();
    this._entriesWatcher = void 0;
    this._watchedSessionResource = void 0;
  }
  _updateSessionReadyState(sessionResource) {
    const isEnabled = this.configurationService.getValue("chat.agentSessionProjection.enabled" /* AgentSessionProjectionEnabled */);
    if (!isEnabled) {
      this._clearEntriesWatcher();
      this.agentTitleBarStatusService.exitSessionReadyMode();
      return;
    }
    if (this.agentSessionProjectionService.isActive) {
      this._clearEntriesWatcher();
      return;
    }
    if (!sessionResource) {
      this._clearEntriesWatcher();
      this.agentTitleBarStatusService.exitSessionReadyMode();
      return;
    }
    const session = this.agentSessionsService.getSession(sessionResource);
    if (!session) {
      this._clearEntriesWatcher();
      this.agentTitleBarStatusService.exitSessionReadyMode();
      return;
    }
    this.agentSessionsService.model.observeSession(sessionResource);
    if (!AGENT_SESSION_PROJECTION_ENABLED_PROVIDERS.has(session.providerType)) {
      this._clearEntriesWatcher();
      this.agentTitleBarStatusService.exitSessionReadyMode();
      return;
    }
    if (isSessionInProgressStatus(session.status)) {
      this._clearEntriesWatcher();
      this.agentTitleBarStatusService.exitSessionReadyMode();
      return;
    }
    let hasPendingChanges = false;
    if (session.providerType === AgentSessionProviders.Local) {
      const editingSession = this.chatEditingService.getEditingSession(sessionResource);
      if (!editingSession) {
        this._clearEntriesWatcher();
        this.agentTitleBarStatusService.exitSessionReadyMode();
        return;
      }
      const entries2 = editingSession.entries.get();
      hasPendingChanges = entries2.some((entry) => entry.state.get() === 0 /* Modified */);
      if (hasPendingChanges && !this._suppressSessionReady) {
        this.agentTitleBarStatusService.enterSessionReadyMode(session.resource, session.label);
        if (!this._watchedSessionResource || this._watchedSessionResource.toString() !== sessionResource.toString()) {
          this._clearEntriesWatcher();
          this._watchedSessionResource = sessionResource;
          this._entriesWatcher = autorun((reader) => {
            const currentEntries = editingSession.entries.read(reader);
            const stillHasChanges = currentEntries.some((entry) => entry.state.read(reader) === 0 /* Modified */);
            if (!stillHasChanges) {
              this.agentTitleBarStatusService.exitSessionReadyMode();
            }
          });
        }
      } else {
        this._clearEntriesWatcher();
        this.agentTitleBarStatusService.exitSessionReadyMode();
      }
    } else {
      this._clearEntriesWatcher();
      const changeCount = Array.isArray(session.changes) ? session.changes.filter((change) => !!change.originalUri).length : 0;
      hasPendingChanges = changeCount > 0;
      if (hasPendingChanges && !this._suppressSessionReady) {
        this.agentTitleBarStatusService.enterSessionReadyMode(session.resource, session.label);
      } else {
        this.agentTitleBarStatusService.exitSessionReadyMode();
      }
    }
  }
};

AgentSessionReadyContribution = __decorateClass([
  __decorateParam(0, IChatWidgetService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IAgentTitleBarStatusService),
  __decorateParam(3, IAgentSessionsService),
  __decorateParam(4, IAgentSessionProjectionService),
  __decorateParam(5, IChatEditingService)
], AgentSessionReadyContribution);

registerAction2(EnterAgentSessionProjectionAction);

registerAction2(ExitAgentSessionProjectionAction);

registerAction2(ToggleUnifiedAgentsBarAction);

registerSingleton(IAgentSessionProjectionService, AgentSessionProjectionService, 1 /* Delayed */);

registerSingleton(IAgentTitleBarStatusService, AgentTitleBarStatusService, 1 /* Delayed */);

registerWorkbenchContribution2(AgentTitleBarStatusRendering.ID, AgentTitleBarStatusRendering, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentSessionReadyContribution.ID, AgentSessionReadyContribution, WorkbenchPhase.AfterRestored);

MenuRegistry.appendMenuItem(MenuId.CommandCenter, {
  submenu: MenuId.AgentsTitleBarControlMenu,
  title: localize(9192, null),
  icon: Codicon.chatSparkle,
  when: ContextKeyExpr.and(
    ChatContextKeys.enabled,
    ContextKeyExpr.notEquals(`config.${"chat.agentsControl.enabled" /* AgentStatusEnabled */}`, "hidden"),
    ContextKeyExpr.notEquals(`config.${"chat.agentsControl.enabled" /* AgentStatusEnabled */}`, false),
    InEditorZenModeContext.negate()
  ),
  order: 10002
  // to the right of the chat button
});

MenuRegistry.appendMenuItem(MenuId.TitleBar, {
  submenu: MenuId.ChatTitleBarMenu,
  title: localize(9194, null),
  group: "navigation",
  icon: Codicon.chatSparkle,
  when: ContextKeyExpr.and(
    ChatContextKeys.supported,
    ContextKeyExpr.and(
      ChatContextKeys.Setup.hidden.negate()
    ),
    ContextKeyExpr.has("config.window.commandCenter").negate()
  ),
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.AgentsTitleBarControlMenu, {
  command: {
    id: "workbench.action.chat.toggle",
    title: localize(9193, null)
  },
  when: ChatContextKeys.enabled,
  group: "a_open",
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.AgentsTitleBarControlMenu, {
  command: {
    id: `toggle.${"chat.unifiedAgentsBar.enabled" /* UnifiedAgentsBar */}`,
    title: localize(9195, null),
    toggled: ContextKeyExpr.has(`config.${"chat.unifiedAgentsBar.enabled" /* UnifiedAgentsBar */}`)
  },
  when: ContextKeyExpr.and(
    ChatContextKeys.enabled,
    ProductQualityContext.notEqualsTo("stable")
  ),
  group: "z_experimental",
  order: 10
});
export { AgentSessionReadyContribution };
