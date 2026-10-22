// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/agentSessions/agentSessionsActions.ts
import { localize, localize2 } from "./module-0001.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { Schemas } from "./module-0033.mjs";
import { isAgentsWindowOpenSource } from "./module-0515.mjs";
import { Action2, MenuId } from "./module-0092.mjs";
import { OPEN_AGENTS_WINDOW_COMMAND_ID, OPEN_AGENTS_WINDOW_PRECONDITION, OPEN_WORKSPACE_IN_AGENTS_WINDOW_COMMAND_ID } from "./module-0964.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { ToggleTitleBarConfigAction } from "./module-2579.mjs";
import { IsSessionsWindowContext } from "./module-0949.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { SessionType } from "./module-0960.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { URI } from "./module-0032.mjs";
import { getChatSessionType, isUntitledChatSession } from "./module-0961.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { $, append } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Disposable } from "./module-0012.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IProductService } from "./module-0873.mjs";
import { IChatInputNotificationService } from "./module-1461.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/electron-browser/agentSessions/agentSessionsActions.ts
var OPEN_WORKSPACE_IN_AGENTS_WINDOW_TITLE = localize2(13577, "Open in Agents");

var OPEN_WORKSPACE_IN_AGENTS_WINDOW_CHAT_TITLE_COMMAND_ID = "workbench.action.chat.openWorkspaceInAgentsWindow.chatTitle";

var OPEN_WORKSPACE_IN_AGENTS_WINDOW_TITLE_BAR_COMMAND_ID = "workbench.action.chat.openWorkspaceInAgentsWindow.titleBar";

async function openCurrentWorkspaceInAgentsWindow(accessor, source) {
  const nativeHostService = accessor.get(INativeHostService);
  const workspaceContextService = accessor.get(IWorkspaceContextService);
  const folderUri = workspaceContextService.getWorkspace().folders[0]?.uri;
  await nativeHostService.openAgentsWindow({ folderUri: folderUri?.scheme === Schemas.file ? folderUri : void 0, source });
}

function isOpenChatSessionInAgentsWindowOptions(value2) {
  return !!value2 && typeof value2 === "object" && isAgentsWindowOpenSource(value2.agentsWindowOpenSource);
}

var OpenWorkspaceInAgentsWindowAction = class extends Action2 {
  constructor() {
    super({
      id: OPEN_WORKSPACE_IN_AGENTS_WINDOW_COMMAND_ID,
      title: OPEN_WORKSPACE_IN_AGENTS_WINDOW_TITLE,
      category: CHAT_CATEGORY,
      precondition: OPEN_AGENTS_WINDOW_PRECONDITION,
      f1: true
    });
  }
  async run(accessor, options3) {
    await openCurrentWorkspaceInAgentsWindow(accessor, options3?.source ?? "commandPalette" /* CommandPalette */);
  }
};

var OpenWorkspaceInAgentsWindowChatTitleAction = class extends Action2 {
  constructor() {
    super({
      id: OPEN_WORKSPACE_IN_AGENTS_WINDOW_CHAT_TITLE_COMMAND_ID,
      title: OPEN_WORKSPACE_IN_AGENTS_WINDOW_TITLE,
      precondition: OPEN_AGENTS_WINDOW_PRECONDITION,
      f1: false,
      menu: {
        id: MenuId.ChatTitleBarMenu,
        group: "c_sessions",
        order: 1,
        when: OPEN_AGENTS_WINDOW_PRECONDITION
      }
    });
  }
  async run(accessor) {
    await accessor.get(ICommandService).executeCommand(OPEN_WORKSPACE_IN_AGENTS_WINDOW_COMMAND_ID, { source: "chatTitleBar" /* ChatTitleBar */ });
  }
};

var OpenWorkspaceInAgentsWindowTitleBarAction = class extends Action2 {
  constructor() {
    super({
      id: OPEN_WORKSPACE_IN_AGENTS_WINDOW_TITLE_BAR_COMMAND_ID,
      title: OPEN_WORKSPACE_IN_AGENTS_WINDOW_TITLE,
      precondition: OPEN_AGENTS_WINDOW_PRECONDITION,
      f1: false,
      menu: {
        id: MenuId.TitleBarAdjacentCenter,
        order: -1e3,
        when: ContextKeyExpr.and(
          OPEN_AGENTS_WINDOW_PRECONDITION,
          ContextKeyExpr.notEquals(`config.${"chat.titleBar.openInAgentsWindow.enabled" /* TitleBarOpenInAgentsWindowEnabled */}`, false)
        )
      }
    });
  }
  async run(accessor) {
    await accessor.get(ICommandService).executeCommand(OPEN_WORKSPACE_IN_AGENTS_WINDOW_COMMAND_ID, { source: "titleBar" /* TitleBar */ });
  }
};

var ToggleOpenInAgentsWindowTitleBarAction = class extends ToggleTitleBarConfigAction {
  constructor() {
    super(
      "chat.titleBar.openInAgentsWindow.enabled" /* TitleBarOpenInAgentsWindowEnabled */,
      localize(13578, null),
      localize(13579, null),
      6,
      OPEN_AGENTS_WINDOW_PRECONDITION
    );
  }
};

var OpenAgentsWindowAction = class extends Action2 {
  constructor() {
    super({
      id: OPEN_AGENTS_WINDOW_COMMAND_ID,
      title: localize2(13574, "Open Agents Window"),
      category: CHAT_CATEGORY,
      precondition: OPEN_AGENTS_WINDOW_PRECONDITION,
      f1: true,
      keybinding: [{
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 31 /* KeyA */,
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(IsSessionsWindowContext.toNegated(), CONTEXT_ACCESSIBILITY_MODE_ENABLED.toNegated()),
        args: { source: "keyboardShortcut" /* KeyboardShortcut */ }
      }, {
        // In screen reader mode, Cmd/Ctrl+Shift+A conflicts with many screen reader keybindings,
        // so require an additional Alt modifier.
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 31 /* KeyA */,
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(IsSessionsWindowContext.toNegated(), CONTEXT_ACCESSIBILITY_MODE_ENABLED),
        args: { source: "keyboardShortcut" /* KeyboardShortcut */ }
      }]
    });
  }
  async run(accessor, args2) {
    const nativeHostService = accessor.get(INativeHostService);
    await nativeHostService.openAgentsWindow({ ...args2, source: args2?.source ?? "commandPalette" /* CommandPalette */ });
  }
};

var OpenChatSessionInAgentsWindowAction = class _OpenChatSessionInAgentsWindowAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.openSessionInAgentsWindow";
  }
  constructor() {
    super({
      id: _OpenChatSessionInAgentsWindowAction.ID,
      title: localize2(13576, "Open in Agents Window"),
      category: CHAT_CATEGORY,
      precondition: OPEN_AGENTS_WINDOW_PRECONDITION,
      f1: false,
      menu: [{
        id: MenuId.ChatTitleBarMenu,
        group: "c_sessions",
        order: 0,
        when: ContextKeyExpr.and(
          OPEN_AGENTS_WINDOW_PRECONDITION,
          ContextKeyExpr.or(
            ChatContextKeys.chatSessionType.isEqualTo(SessionType.CopilotCLI),
            ChatContextKeys.chatSessionType.isEqualTo(SessionType.AgentHostCopilot)
          )
        )
      }]
    });
  }
  async run(accessor, ...rest) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const nativeHostService = accessor.get(INativeHostService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const commandOptions = isOpenChatSessionInAgentsWindowOptions(rest[0]) ? rest[0] : void 0;
    const source = commandOptions?.agentsWindowOpenSource ?? "chatTitleBar" /* ChatTitleBar */;
    const args2 = commandOptions ? rest.slice(1) : rest;
    let sessionResource;
    const arg = args2[0];
    if (URI.isUri(arg)) {
      sessionResource = arg;
    } else if (arg && typeof arg === "object") {
      const ctx = arg;
      if (URI.isUri(ctx.sessionResource)) {
        sessionResource = ctx.sessionResource;
      }
    }
    if (!sessionResource) {
      sessionResource = chatWidgetService.lastFocusedWidget?.viewModel?.sessionResource;
    }
    const hasRealSession = sessionResource && !isUntitledChatSession(sessionResource);
    const folderUri = workspaceContextService.getWorkspace().folders[0]?.uri;
    await nativeHostService.openAgentsWindow({
      folderUri: !hasRealSession && folderUri?.scheme === Schemas.file ? folderUri.toJSON() : void 0,
      sessionResource: hasRealSession ? sessionResource?.toJSON() : void 0,
      source
    });
  }
};

var OpenWorkspaceInAgentsTitleBarWidget = class extends BaseActionViewItem {
  constructor(action, options3, hoverService, keybindingService) {
    super(void 0, action, options3);
    this.hoverService = hoverService;
    this.keybindingService = keybindingService;
  }
  render(container3) {
    super.render(container3);
    container3.classList.add("open-in-agents-titlebar-widget");
    container3.setAttribute("role", "button");
    const label3 = this.action.label;
    const hoverText = this.keybindingService.appendKeybinding(localize(13575, null), OPEN_AGENTS_WINDOW_COMMAND_ID);
    container3.setAttribute("aria-label", hoverText);
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), container3, hoverText));
    const icon2 = append(container3, $("span.open-in-agents-titlebar-widget-icon"));
    icon2.setAttribute("aria-hidden", "true");
    const labelEl = append(container3, $("span.open-in-agents-titlebar-widget-label"));
    labelEl.textContent = label3;
  }
};

OpenWorkspaceInAgentsTitleBarWidget = __decorateClass([
  __decorateParam(2, IHoverService),
  __decorateParam(3, IKeybindingService)
], OpenWorkspaceInAgentsTitleBarWidget);

var OpenWorkspaceInAgentsContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.openWorkspaceInAgents.desktop";
  }
  constructor(actionViewItemService, instantiationService, contextKeyService, productService) {
    super();
    this._register(actionViewItemService.register(MenuId.TitleBarAdjacentCenter, OPEN_WORKSPACE_IN_AGENTS_WINDOW_TITLE_BAR_COMMAND_ID, (action, options3) => {
      return instantiationService.createInstance(OpenWorkspaceInAgentsTitleBarWidget, action, options3);
    }, void 0));
  }
};

OpenWorkspaceInAgentsContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IProductService)
], OpenWorkspaceInAgentsContribution);

var AgentsHandoffInputTipContribution = class extends Disposable {
  constructor(_chatWidgetService, _notificationService, contextKeyService, _workspaceContextService, _telemetryService, _configurationService) {
    super();
    this._chatWidgetService = _chatWidgetService;
    this._notificationService = _notificationService;
    this._workspaceContextService = _workspaceContextService;
    this._telemetryService = _telemetryService;
    this._configurationService = _configurationService;
    /**
     * Set once the user dismisses (X) or opens the tip. Suppresses the tip for
     * the rest of this window's lifetime — intentionally in-memory only, so it
     * shows again the next time VS Code is reopened.
     */
    this._dismissedForWindow = false;
    this._register(CommandsRegistry.registerCommand(AgentsHandoffInputTipContribution.TIP_OPEN_COMMAND_ID, (accessor, ...args2) => {
      this._logTipAction("open");
      this._dismissForWindow();
      return accessor.get(ICommandService).executeCommand(OpenChatSessionInAgentsWindowAction.ID, { agentsWindowOpenSource: "chatHandoff" /* ChatHandoff */ }, ...args2);
    }));
    this._register(CommandsRegistry.registerCommand(AgentsHandoffInputTipContribution.TIP_MUTE_COMMAND_ID, () => {
      this._logTipAction("mute");
      this._dismissForWindow();
      return this._configurationService.updateValue("chat.agentsHandoffTip.mode" /* AgentsHandoffTipMode */, "hidden" /* Hidden */);
    }));
    this._register(this._chatWidgetService.onDidChangeFocusedSession(() => this._update()));
    this._register(this._chatWidgetService.onDidAddWidget(() => this._update()));
    this._register(contextKeyService.onDidChangeContext(() => this._update()));
    this._register(this._workspaceContextService.onDidChangeWorkbenchState(() => this._update()));
    this._register(this._configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("chat.agentsHandoffTip.mode" /* AgentsHandoffTipMode */)) {
        this._lastPostedFor = void 0;
        this._update();
      }
    }));
    this._register(this._notificationService.onDidDismiss((id2) => {
      if (id2 !== AgentsHandoffInputTipContribution.NOTIFICATION_ID) {
        return;
      }
      this._logTipAction("dismiss");
      this._dismissForWindow();
    }));
    this._update();
  }
  static {
    this.ID = "workbench.contrib.agentsHandoffInputTip";
  }
  static {
    this.NOTIFICATION_ID = "chat.agentsHandoff.openInAgentsWindow";
  }
  static {
    /**
     * Dedicated command backing the tip's action button. Lets us attach
     * mode + harness telemetry to the exact tip click (the title-bar menu
     * entry runs {@link OpenChatSessionInAgentsWindowAction} directly and is
     * intentionally not tracked here).
     */
    this.TIP_OPEN_COMMAND_ID = "workbench.action.chat.agentsHandoffTip.open";
  }
  static {
    /**
     * Dedicated command backing the tip's "Don't Show Again" button. Closes the
     * tip and flips {@link ChatConfiguration.AgentsHandoffTipMode} to `hidden`
     * so it never shows again.
     */
    this.TIP_MUTE_COMMAND_ID = "workbench.action.chat.agentsHandoffTip.mute";
  }
  static {
    /** Session types eligible for the handoff tip — the same set the Agents window can render directly. */
    this.ELIGIBLE_SESSION_TYPES = /* @__PURE__ */ new Set([SessionType.CopilotCLI, SessionType.AgentHostCopilot]);
  }
  static {
    /** Pseudo-key used as the {@link _lastPostedFor} value for the empty-workspace tip (no real session URI exists). */
    this.EMPTY_WORKSPACE_KEY = "__empty-workspace__";
  }
  /** Log a user interaction (open, dismiss, mute) with the handoff tip. */
  _logTipAction(action) {
    this._telemetryService.publicLog2("chat.agentsHandoffTip.action", {
      action,
      mode: this._getMode(),
      sessionType: this._lastPostedSessionType ?? ""
    });
  }
  _getMode() {
    const value2 = this._configurationService.getValue("chat.agentsHandoffTip.mode" /* AgentsHandoffTipMode */);
    switch (value2) {
      case "hidden" /* Hidden */:
      case "custom" /* Custom */:
        return value2;
      default:
        return "default" /* Default */;
    }
  }
  _update() {
    const mode = this._getMode();
    if (mode === "hidden" /* Hidden */ || this._dismissedForWindow) {
      if (this._lastPostedFor) {
        this._notificationService.deleteNotification(AgentsHandoffInputTipContribution.NOTIFICATION_ID);
        this._lastPostedFor = void 0;
      }
      return;
    }
    const widget = this._chatWidgetService.lastFocusedWidget;
    const sessionResource = widget?.viewModel?.sessionResource;
    const resourceSessionType = sessionResource ? getChatSessionType(sessionResource) : void 0;
    const preconditionMet = widget?.scopedContextKeyService.contextMatchesRules(OPEN_AGENTS_WINDOW_PRECONDITION) ?? false;
    const eligible = preconditionMet && !!sessionResource && !!resourceSessionType && AgentsHandoffInputTipContribution.ELIGIBLE_SESSION_TYPES.has(resourceSessionType) && !isUntitledChatSession(sessionResource);
    const widgetSessionType = widget?.scopedContextKeyService.getContextKeyValue(ChatContextKeys.chatSessionType.key);
    const isEmptyWorkspace = this._workspaceContextService.getWorkbenchState() === 1 /* EMPTY */;
    const emptyWorkspaceEligible = preconditionMet && isEmptyWorkspace && (!sessionResource || isUntitledChatSession(sessionResource)) && widgetSessionType === SessionType.AgentHostCopilot;
    if (!eligible && !emptyWorkspaceEligible) {
      if (this._lastPostedFor) {
        this._notificationService.deleteNotification(AgentsHandoffInputTipContribution.NOTIFICATION_ID);
        this._lastPostedFor = void 0;
      }
      return;
    }
    const key3 = eligible && sessionResource ? sessionResource.toString() : AgentsHandoffInputTipContribution.EMPTY_WORKSPACE_KEY;
    if (this._lastPostedFor === key3) {
      return;
    }
    this._lastPostedFor = key3;
    this._lastPostedSessionType = eligible ? resourceSessionType : widgetSessionType;
    const commandArgs = eligible && sessionResource ? [sessionResource] : [];
    const useEmptyWorkspaceCopy = emptyWorkspaceEligible && !eligible;
    const message = useEmptyWorkspaceCopy ? localize(13571, null) : localize(13572, null);
    const description = useEmptyWorkspaceCopy ? localize(13570, null) : mode === "custom" /* Custom */ ? localize(13569, null) : localize(13568, null);
    const actionLabel = useEmptyWorkspaceCopy ? localize(13565, null) : mode === "custom" /* Custom */ ? localize(13566, null) : localize(13567, null);
    this._notificationService.setNotification({
      id: AgentsHandoffInputTipContribution.NOTIFICATION_ID,
      severity: 0 /* Info */,
      message,
      description,
      actions: [
        {
          kind: "command" /* Command */,
          label: actionLabel,
          commandId: AgentsHandoffInputTipContribution.TIP_OPEN_COMMAND_ID,
          commandArgs
        }
      ],
      dismissible: true,
      autoDismissOnMessage: false,
      mute: {
        commandId: AgentsHandoffInputTipContribution.TIP_MUTE_COMMAND_ID,
        tooltip: localize(13573, null)
      },
      sessionTypes: useEmptyWorkspaceCopy ? [SessionType.AgentHostCopilot] : Array.from(AgentsHandoffInputTipContribution.ELIGIBLE_SESSION_TYPES)
    });
  }
  /**
   * Mark the tip as handled (dismissed or opened) for the rest of this
   * window's lifetime and tear down any currently posted notification.
   */
  _dismissForWindow() {
    if (this._dismissedForWindow) {
      return;
    }
    this._dismissedForWindow = true;
    this._update();
  }
};

AgentsHandoffInputTipContribution = __decorateClass([
  __decorateParam(0, IChatWidgetService),
  __decorateParam(1, IChatInputNotificationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IConfigurationService)
], AgentsHandoffInputTipContribution);
export { openCurrentWorkspaceInAgentsWindow, isOpenChatSessionInAgentsWindowOptions, OPEN_WORKSPACE_IN_AGENTS_WINDOW_TITLE, OPEN_WORKSPACE_IN_AGENTS_WINDOW_CHAT_TITLE_COMMAND_ID, OPEN_WORKSPACE_IN_AGENTS_WINDOW_TITLE_BAR_COMMAND_ID, OpenWorkspaceInAgentsWindowAction, OpenWorkspaceInAgentsWindowChatTitleAction, OpenWorkspaceInAgentsWindowTitleBarAction, ToggleOpenInAgentsWindowTitleBarAction, OpenAgentsWindowAction, OpenChatSessionInAgentsWindowAction, OpenWorkspaceInAgentsTitleBarWidget, OpenWorkspaceInAgentsContribution, AgentsHandoffInputTipContribution };
