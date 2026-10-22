// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/experiments/agentTitleBarStatusWidget.ts
import { InEditorZenModeContext } from "./module-0950.mjs";
import { ChatAIDisabledSettingId } from "./module-0951.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { IMenuService, MenuId, MenuItemAction, SubmenuItemAction } from "./module-0092.mjs";
import { Event2 } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { $, EventType, addDisposableListener, getWindow, isHTMLElement, reset } from "./module-0075.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { isSessionInProgressStatus } from "./module-0961.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { UNIFIED_QUICK_ACCESS_ACTION_ID } from "./module-2557.mjs";
import { EnterAgentSessionProjectionAction, ExitAgentSessionProjectionAction } from "./module-2554.mjs";
import { Separator, SubmenuAction, toAction } from "./module-0082.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { createActionViewItem } from "./module-0516.mjs";
import { DropdownWithPrimaryActionViewItem } from "./module-1909.mjs";
import { WORKBENCH_MENU_MOTION_CLASS, workbenchMenuCloseAnimation } from "./module-1853.mjs";
import { FocusAgentSessionsAction } from "./module-2505.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAgentTitleBarStatusService } from "./module-2550.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IAgentSessionsService } from "./module-1463.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { mainWindow } from "./module-0002.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { ITitleService } from "./module-2558.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/experiments/agentTitleBarStatusWidget.ts
var TOGGLE_CHAT_ACTION_ID2 = "workbench.action.chat.toggle";

var QUICK_OPEN_ACTION_ID = "workbench.action.quickOpenWithModes";

var FILTER_STORAGE_KEY = "agentSessions.filterExcludes.agentsessionsviewerfiltersubmenu";

var PREVIOUS_FILTER_STORAGE_KEY = "agentSessions.filterExcludes.previousUserFilter";

function shouldForceHiddenAgentStatus(configurationService, contextKeyService) {
  if (contextKeyService.getContextKeyValue(InEditorZenModeContext.key) === true) {
    return true;
  }
  const aiFeaturesDisabled = configurationService.getValue(ChatAIDisabledSettingId) === true;
  const aiCustomizationsDisabled = configurationService.getValue("disableAICustomizations") === true || configurationService.getValue("workbench.disableAICustomizations") === true;
  return aiFeaturesDisabled && aiCustomizationsDisabled;
}

function getAgentStatusSettingMode(configurationService, contextKeyService) {
  if (shouldForceHiddenAgentStatus(configurationService, contextKeyService)) {
    return "hidden";
  }
  const value2 = configurationService.getValue("chat.agentsControl.enabled" /* AgentStatusEnabled */);
  if (value2 === false || value2 === "hidden") {
    return "hidden";
  }
  if (value2 === "badge") {
    return "badge";
  }
  if (value2 === true || value2 === void 0 || value2 === "compact") {
    return "compact";
  }
  return "compact";
}

var AgentTitleBarStatusWidget = class extends BaseActionViewItem {
  constructor(action, _windowTitle, options3, instantiationService, agentTitleBarStatusService, hoverService, commandService, keybindingService, agentSessionsService, workspaceContextService, editorGroupsService, editorService, menuService, contextKeyService, storageService, configurationService, chatEntitlementService, chatWidgetService, telemetryService) {
    super(void 0, action, options3);
    this._windowTitle = _windowTitle;
    this.instantiationService = instantiationService;
    this.agentTitleBarStatusService = agentTitleBarStatusService;
    this.hoverService = hoverService;
    this.commandService = commandService;
    this.keybindingService = keybindingService;
    this.agentSessionsService = agentSessionsService;
    this.workspaceContextService = workspaceContextService;
    this.editorGroupsService = editorGroupsService;
    this.editorService = editorService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.storageService = storageService;
    this.configurationService = configurationService;
    this.chatEntitlementService = chatEntitlementService;
    this.chatWidgetService = chatWidgetService;
    this.telemetryService = telemetryService;
    this._dynamicDisposables = this._register(new DisposableStore());
    /** Guard to prevent re-entrant rendering */
    this._isRendering = false;
    /** Roving tabindex elements for keyboard navigation */
    this._rovingElements = [];
    this._rovingIndex = 0;
    /** Tracks if this window applied a badge filter (unread/inProgress), so we only auto-clear our own filters */
    // TODO: This is imperfect. Targetted fix for vscode#290863. We should revisit storing filter state per-window to avoid this
    this._badgeFilterAppliedByThisWindow = null;
    this._commandCenterMenu = this._register(this.menuService.createMenu(MenuId.CommandCenterCenter, this.contextKeyService));
    this._chatTitleBarMenu = this._register(this.menuService.createMenu(MenuId.ChatTitleBarMenu, this.contextKeyService));
    this._register(this.agentTitleBarStatusService.onDidChangeMode(() => {
      this._render();
    }));
    this._register(this.agentTitleBarStatusService.onDidChangeSessionInfo(() => {
      this._render();
    }));
    this._register(this.agentSessionsService.model.onDidChangeSessions(() => {
      this._render();
    }));
    this._register(this._windowTitle.onDidChange(() => {
      this._render();
    }));
    this._register(this.editorService.onDidActiveEditorChange(() => {
      this._render();
    }));
    this._register(this.editorGroupsService.onDidChangeEditorPartOptions(({ newPartOptions, oldPartOptions }) => {
      if (newPartOptions.showTabs !== oldPartOptions.showTabs) {
        this._render();
      }
    }));
    this._register(this._commandCenterMenu.onDidChange(() => {
      this._lastRenderState = void 0;
      this._render();
    }));
    this._register(this.storageService.onDidChangeValue(0 /* PROFILE */, "agentSessions.filterExcludes.agentsessionsviewerfiltersubmenu", this._store)(() => {
      this._render();
    }));
    this._register(this.contextKeyService.onDidChangeContext((e4) => {
      if (e4.affectsSome(/* @__PURE__ */ new Set([InEditorZenModeContext.key]))) {
        this._lastRenderState = void 0;
        this._render();
      }
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("chat.agentsControl.enabled" /* AgentStatusEnabled */) || e4.affectsConfiguration("chat.unifiedAgentsBar.enabled" /* UnifiedAgentsBar */) || e4.affectsConfiguration("chat.viewSessions.enabled" /* ChatViewSessionsEnabled */) || e4.affectsConfiguration(ChatAIDisabledSettingId) || e4.affectsConfiguration("disableAICustomizations") || e4.affectsConfiguration("workbench.disableAICustomizations")) {
        this._lastRenderState = void 0;
        this._render();
      }
    }));
    this._register(Event2.any(
      this.chatEntitlementService.onDidChangeSentiment,
      this.chatEntitlementService.onDidChangeQuotaExceeded,
      this.chatEntitlementService.onDidChangeEntitlement,
      this.chatEntitlementService.onDidChangeAnonymous
    )(() => {
      this._lastRenderState = void 0;
      this._render();
    }));
    this._register(this.chatWidgetService.onDidAddWidget(() => {
      this._render();
    }));
    this._register(this.chatWidgetService.onDidBackgroundSession(() => {
      this._render();
    }));
  }
  render(container2) {
    super.render(container2);
    this._container = container2;
    container2.classList.add("agent-status-container");
    container2.setAttribute("role", "toolbar");
    container2.setAttribute("aria-label", localize(9204, null));
    container2.tabIndex = -1;
    this._render();
  }
  // Override focus methods - the container itself shouldn't be focusable,
  // focus is handled by the inner interactive elements (badge sections)
  setFocusable(_focusable) {
  }
  focus() {
    this._rovingElements[this._rovingIndex]?.focus();
  }
  blur() {
    if (!this._container) {
      return;
    }
    const activeElement = getWindow(this._container).document.activeElement;
    if (isHTMLElement(activeElement) && this._container.contains(activeElement)) {
      activeElement.blur();
    }
  }
  _render() {
    if (!this._container) {
      return;
    }
    if (this._isRendering) {
      return;
    }
    this._isRendering = true;
    try {
      const mode = this.agentTitleBarStatusService.mode;
      const sessionInfo = this.agentTitleBarStatusService.sessionInfo;
      const { activeSessions, unreadSessions, attentionNeededSessions } = this._getSessionStats();
      const attentionSession = attentionNeededSessions.length > 0 ? [...attentionNeededSessions].sort((a, b) => {
        const timeA = a.timing.lastRequestStarted ?? a.timing.created;
        const timeB = b.timing.lastRequestStarted ?? b.timing.created;
        return timeB - timeA;
      })[0] : void 0;
      const attentionText = attentionSession?.description ? typeof attentionSession.description === "string" ? attentionSession.description : renderAsPlaintext(attentionSession.description) : attentionSession?.label;
      const label3 = this._getLabel();
      const { isFilteredToUnread, isFilteredToInProgress, isFilteredToNeedsInput } = this._getCurrentFilterState();
      const statusMode = getAgentStatusSettingMode(this.configurationService, this.contextKeyService);
      const unifiedAgentsBarEnabled = this.configurationService.getValue("chat.unifiedAgentsBar.enabled" /* UnifiedAgentsBar */) === true;
      const viewSessionsEnabled = this.configurationService.getValue("chat.viewSessions.enabled" /* ChatViewSessionsEnabled */) !== false;
      const stateKey = JSON.stringify({
        mode,
        sessionTitle: sessionInfo?.title,
        activeCount: activeSessions.length,
        unreadCount: unreadSessions.length,
        attentionCount: attentionNeededSessions.length,
        attentionText,
        label: label3,
        isFilteredToUnread,
        isFilteredToInProgress,
        isFilteredToNeedsInput,
        statusMode,
        unifiedAgentsBarEnabled,
        viewSessionsEnabled
      });
      if (this._lastRenderState === stateKey) {
        return;
      }
      this._lastRenderState = stateKey;
      reset(this._container);
      this._dynamicDisposables.clear();
      this._rovingElements = [];
      if (this.agentTitleBarStatusService.mode === "session" /* Session */) {
        this._renderSessionMode(this._dynamicDisposables);
      } else if (this.agentTitleBarStatusService.mode === "sessionReady" /* SessionReady */) {
        this._renderSessionReadyMode(this._dynamicDisposables);
      } else if (statusMode === "compact") {
        this._renderChatInputMode(this._dynamicDisposables);
      } else if (statusMode === "badge") {
        this._renderStatusBadge(this._dynamicDisposables, activeSessions, unreadSessions, attentionNeededSessions);
      }
      this._setupRovingTabIndex(this._dynamicDisposables);
    } finally {
      this._isRendering = false;
    }
  }
  /**
   * Setup roving tabindex for arrow key navigation between interactive elements.
   * Uses the elements registered in `this._rovingElements` in their existing order.
   */
  _setupRovingTabIndex(disposables) {
    if (!this._container || this._rovingElements.length === 0) {
      return;
    }
    if (this._rovingIndex >= this._rovingElements.length) {
      this._rovingIndex = 0;
    }
    for (let i2 = 0; i2 < this._rovingElements.length; i2++) {
      this._rovingElements[i2].tabIndex = i2 === this._rovingIndex ? 0 : -1;
    }
    disposables.add(addDisposableListener(this._container, EventType.KEY_DOWN, (e4) => {
      const index2 = this._rovingElements.findIndex((el) => el === e4.target || el.contains(e4.target));
      if (index2 === -1) {
        return;
      }
      const nextIndex = this._getNextRovingIndex(index2, e4.key);
      if (nextIndex !== void 0 && nextIndex !== index2) {
        e4.preventDefault();
        e4.stopPropagation();
        this._moveRovingFocus(index2, nextIndex);
      }
    }));
  }
  /**
   * Moves roving focus from `currentIndex` to `nextIndex`, updating tabIndex and focusing the element.
   */
  _moveRovingFocus(currentIndex, nextIndex) {
    this._rovingElements[currentIndex].tabIndex = -1;
    this._rovingElements[nextIndex].tabIndex = 0;
    this._rovingElements[nextIndex].focus();
    this._rovingIndex = nextIndex;
  }
  /**
   * Returns the next roving index for the given key, or `undefined` if no navigation should occur.
   */
  _getNextRovingIndex(currentIndex, key3) {
    const len = this._rovingElements.length;
    switch (key3) {
      case "ArrowRight":
        return (currentIndex + 1) % len;
      case "ArrowLeft":
        return (currentIndex - 1 + len) % len;
      case "Home":
        return 0;
      case "End":
        return len - 1;
      default:
        return void 0;
    }
  }
  // #region Session Statistics
  /**
   * Get computed session statistics for rendering.
   * Respects the current provider (session type) filter when calculating counts.
   */
  _getSessionStats() {
    const sessions = this.agentSessionsService.model.sessions;
    const currentFilter = this._getStoredFilter();
    const excludedProviders = currentFilter?.providers ?? [];
    const filteredSessions = excludedProviders.length > 0 ? sessions.filter((s) => !excludedProviders.includes(s.providerType)) : sessions;
    const activeSessions = filteredSessions.filter((s) => isSessionInProgressStatus(s.status) && !s.isArchived());
    const unreadSessions = filteredSessions.filter((s) => !s.isRead());
    const attentionNeededSessions = filteredSessions.filter((s) => s.status === 3 /* NeedsInput */ && !this.chatWidgetService.getWidgetBySessionResource(s.resource));
    return {
      activeSessions,
      unreadSessions,
      attentionNeededSessions,
      hasActiveSessions: activeSessions.length > 0,
      hasUnreadSessions: unreadSessions.length > 0,
      hasAttentionNeeded: attentionNeededSessions.length > 0
    };
  }
  // #endregion
  // #region Mode Renderers
  _renderChatInputMode(disposables) {
    if (!this._container) {
      return;
    }
    const { activeSessions, unreadSessions, attentionNeededSessions, hasAttentionNeeded } = this._getSessionStats();
    const pill = $("div.agent-status-pill.chat-input-mode");
    if (hasAttentionNeeded) {
      pill.classList.add("needs-attention");
    }
    this._container.appendChild(pill);
    this._renderCommandCenterToolbar(disposables, pill);
    const isCompactMode = true;
    pill.classList.toggle("compact-mode", isCompactMode);
    const leftIcon = $("span.agent-status-left-icon");
    if (hasAttentionNeeded) {
      const reportIcon = renderIcon(Codicon.report);
      const countSpan = $("span.agent-status-attention-count");
      countSpan.textContent = String(attentionNeededSessions.length);
      reset(leftIcon, reportIcon, countSpan);
      leftIcon.classList.add("has-attention");
    } else {
      reset(leftIcon, renderIcon(Codicon.searchSparkle));
    }
    if (!isCompactMode) {
      pill.appendChild(leftIcon);
    }
    const inputArea = $("div.agent-status-input-area");
    inputArea.setAttribute("role", "button");
    inputArea.setAttribute("aria-label", localize(9218, null));
    inputArea.tabIndex = 0;
    this._rovingElements.push(inputArea);
    pill.appendChild(inputArea);
    const label3 = $("span.agent-status-label");
    const { progress: progressText } = this._getSessionNeedingAttention(attentionNeededSessions);
    const defaultLabel = isCompactMode ? this._getLabel() : progressText ?? this._getLabel();
    if (!isCompactMode && progressText) {
      label3.classList.add("has-progress");
    }
    const hoverLabel = localize(9206, null);
    label3.textContent = defaultLabel;
    inputArea.appendChild(label3);
    if (isCompactMode) {
      disposables.add(addDisposableListener(inputArea, EventType.MOUSE_ENTER, () => {
        reset(leftIcon, renderIcon(Codicon.searchSparkle));
        leftIcon.classList.remove("has-attention");
        label3.classList.remove("has-progress");
      }));
      disposables.add(addDisposableListener(inputArea, EventType.MOUSE_LEAVE, () => {
        reset(leftIcon, renderIcon(Codicon.searchSparkle));
      }));
    } else {
      const sendIcon = $("span.agent-status-send");
      reset(sendIcon, renderIcon(Codicon.send));
      sendIcon.classList.add("hidden");
      inputArea.appendChild(sendIcon);
      if (!progressText) {
        disposables.add(addDisposableListener(inputArea, EventType.MOUSE_ENTER, () => {
          reset(leftIcon, renderIcon(Codicon.searchSparkle));
          leftIcon.classList.remove("has-attention");
          label3.textContent = hoverLabel;
          label3.classList.remove("has-progress");
          sendIcon.classList.remove("hidden");
        }));
        disposables.add(addDisposableListener(inputArea, EventType.MOUSE_LEAVE, () => {
          reset(leftIcon, renderIcon(Codicon.searchSparkle));
          label3.textContent = defaultLabel;
          sendIcon.classList.add("hidden");
        }));
      }
    }
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, inputArea, () => {
      const kbForTooltip = this.keybindingService.lookupKeybinding(UNIFIED_QUICK_ACCESS_ACTION_ID)?.getLabel();
      return kbForTooltip ? localize(9207, null, kbForTooltip) : localize(9208, null);
    }));
    disposables.add(addDisposableListener(inputArea, EventType.CLICK, (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      this.telemetryService.publicLog2("agentStatusWidget.click", {
        source: "pill",
        action: "quickAccess"
      });
      const useUnifiedQuickAccess = this.configurationService.getValue("chat.unifiedAgentsBar.enabled" /* UnifiedAgentsBar */) === true;
      this.commandService.executeCommand(useUnifiedQuickAccess ? UNIFIED_QUICK_ACCESS_ACTION_ID : QUICK_OPEN_ACTION_ID);
    }));
    disposables.add(addDisposableListener(inputArea, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        e4.stopPropagation();
        this.telemetryService.publicLog2("agentStatusWidget.click", {
          source: "pill",
          action: "quickAccess"
        });
        const useUnifiedQuickAccess = this.configurationService.getValue("chat.unifiedAgentsBar.enabled" /* UnifiedAgentsBar */) === true;
        this.commandService.executeCommand(useUnifiedQuickAccess ? UNIFIED_QUICK_ACCESS_ACTION_ID : QUICK_OPEN_ACTION_ID);
      }
    }));
    this._renderStatusBadge(disposables, activeSessions, unreadSessions, attentionNeededSessions, pill);
  }
  _renderSessionMode(disposables) {
    if (!this._container) {
      return;
    }
    const { activeSessions, unreadSessions, attentionNeededSessions } = this._getSessionStats();
    this._renderCommandCenterToolbar(disposables);
    const pill = $("div.agent-status-pill.session-mode");
    this._container.appendChild(pill);
    this._renderSearchButton(disposables, pill);
    const titleLabel = $("span.agent-status-title");
    const sessionInfo = this.agentTitleBarStatusService.sessionInfo;
    titleLabel.textContent = sessionInfo?.title ?? localize(9198, null);
    pill.appendChild(titleLabel);
    this._renderEscapeButton(disposables, pill);
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, pill, () => {
      const sessionInfo2 = this.agentTitleBarStatusService.sessionInfo;
      return sessionInfo2 ? localize(9199, null, sessionInfo2.title) : localize(9198, null);
    }));
    const exitHandler = (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      this.commandService.executeCommand(ExitAgentSessionProjectionAction.ID);
    };
    disposables.add(addDisposableListener(pill, EventType.CLICK, exitHandler));
    disposables.add(addDisposableListener(pill, EventType.MOUSE_DOWN, exitHandler));
    this._renderStatusBadge(disposables, activeSessions, unreadSessions, attentionNeededSessions);
  }
  /**
   * Render session ready mode - shows session title + enter projection button.
   * Used when a projection-capable session is available but not yet entered.
   */
  _renderSessionReadyMode(disposables) {
    if (!this._container) {
      return;
    }
    const { activeSessions, unreadSessions, attentionNeededSessions } = this._getSessionStats();
    const pill = $("div.agent-status-pill.session-ready-mode");
    this._container.appendChild(pill);
    const titleLabel = $("span.agent-status-title");
    const sessionInfo = this.agentTitleBarStatusService.sessionInfo;
    titleLabel.textContent = sessionInfo?.title ?? localize(9200, null);
    pill.appendChild(titleLabel);
    this._renderEnterButton(disposables, pill);
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, pill, () => {
      const sessionInfo2 = this.agentTitleBarStatusService.sessionInfo;
      return sessionInfo2 ? localize(9202, null, sessionInfo2.title) : localize(9201, null);
    }));
    const enterHandler = (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      const sessionInfo2 = this.agentTitleBarStatusService.sessionInfo;
      if (sessionInfo2) {
        const session = this.agentSessionsService.getSession(sessionInfo2.sessionResource);
        if (session) {
          this.commandService.executeCommand(EnterAgentSessionProjectionAction.ID, session);
        }
      }
    };
    disposables.add(addDisposableListener(pill, EventType.CLICK, enterHandler));
    disposables.add(addDisposableListener(pill, EventType.MOUSE_DOWN, enterHandler));
    this._renderStatusBadge(disposables, activeSessions, unreadSessions, attentionNeededSessions);
  }
  // #endregion
  // #region Reusable Components
  /**
   * Render command center toolbar items (like debug toolbar) that are registered to CommandCenter
   * Filters out the quick open action since we provide our own search UI.
   * Adds a dot separator after the toolbar if content was rendered.
   */
  _renderCommandCenterToolbar(disposables, parent) {
    const container2 = parent ?? this._container;
    if (!container2) {
      return;
    }
    const allActions = [];
    for (const [, actions] of this._commandCenterMenu.getActions({ shouldForwardArgs: true })) {
      for (const action of actions) {
        if (action.id === QUICK_OPEN_ACTION_ID) {
          continue;
        }
        if (action instanceof SubmenuAction) {
          allActions.push(...action.actions);
        } else {
          allActions.push(action);
        }
      }
    }
    if (allActions.length === 0) {
      return;
    }
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    const toolbarContainer = $("div.agent-status-command-center-toolbar");
    container2.appendChild(toolbarContainer);
    const toolbar = this.instantiationService.createInstance(WorkbenchToolBar, toolbarContainer, {
      hiddenItemStrategy: -1 /* NoHide */,
      telemetrySource: "agentStatusCommandCenter",
      actionViewItemProvider: (action, options3) => {
        return createActionViewItem(this.instantiationService, action, { ...options3, hoverDelegate });
      }
    });
    disposables.add(toolbar);
    toolbar.setActions(allActions);
    if (parent) {
      const separator2 = $("span.agent-status-line-separator");
      container2.appendChild(separator2);
    } else {
      const separator2 = renderIcon(Codicon.circleSmallFilled);
      separator2.classList.add("agent-status-separator");
      container2.appendChild(separator2);
    }
  }
  /**
   * Render the search button. If parent is provided, appends to parent; otherwise appends to container.
   */
  _renderSearchButton(disposables, parent) {
    const container2 = parent ?? this._container;
    if (!container2) {
      return;
    }
    const searchButton = $("span.agent-status-search");
    reset(searchButton, renderIcon(Codicon.searchSparkle));
    searchButton.setAttribute("role", "button");
    searchButton.setAttribute("aria-label", localize(9219, null));
    searchButton.tabIndex = 0;
    this._rovingElements.push(searchButton);
    container2.appendChild(searchButton);
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    const searchKb = this.keybindingService.lookupKeybinding(QUICK_OPEN_ACTION_ID)?.getLabel();
    const searchTooltip = searchKb ? localize(9220, null, searchKb) : localize(9221, null);
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, searchButton, searchTooltip));
    disposables.add(addDisposableListener(searchButton, EventType.CLICK, (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      this.commandService.executeCommand(QUICK_OPEN_ACTION_ID);
    }));
    disposables.add(addDisposableListener(searchButton, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        e4.stopPropagation();
        this.commandService.executeCommand(QUICK_OPEN_ACTION_ID);
      }
    }));
  }
  /**
   * Render the status badge showing in-progress, needs-input, and/or unread session counts.
   * Shows split UI with sparkle icon on left, then unread, needs-input, and active indicators.
   * Always renders the sparkle icon section.
   */
  _renderStatusBadge(disposables, activeSessions, unreadSessions, attentionNeededSessions, inlineContainer) {
    if (!this._container) {
      return;
    }
    const hasActiveSessions = activeSessions.length > 0;
    const hasUnreadSessions = unreadSessions.length > 0;
    const hasAttentionNeeded = attentionNeededSessions.length > 0;
    this._clearFilterIfCategoryEmpty(hasUnreadSessions, hasActiveSessions, hasAttentionNeeded);
    let badge;
    if (inlineContainer) {
      badge = inlineContainer;
    } else {
      badge = $("div.agent-status-badge");
      this._container.appendChild(badge);
    }
    const sparkleContainer = $("span.agent-status-badge-section.sparkle");
    sparkleContainer.tabIndex = 0;
    const menuActions = Separator.join(...this._chatTitleBarMenu.getActions({ shouldForwardArgs: true }).map(([, actions]) => actions));
    const primaryActionId = TOGGLE_CHAT_ACTION_ID2;
    const primaryActionTitle = localize(9223, null);
    const primaryActionIcon = Codicon.chatSparkle;
    const primaryAction = this.instantiationService.createInstance(MenuItemAction, {
      id: primaryActionId,
      title: primaryActionTitle,
      icon: primaryActionIcon
    }, void 0, void 0, void 0, void 0);
    const dropdownAction = toAction({
      id: "agentStatus.sparkle.dropdown",
      label: localize(9203, null),
      run() {
      }
    });
    const sparkleDropdown = this.instantiationService.createInstance(
      DropdownWithPrimaryActionViewItem,
      primaryAction,
      dropdownAction,
      menuActions,
      "agent-status-sparkle-dropdown",
      { skipTelemetry: true, menuClassName: WORKBENCH_MENU_MOTION_CLASS, closeAnimation: workbenchMenuCloseAnimation }
    );
    sparkleDropdown.render(sparkleContainer);
    disposables.add(sparkleDropdown);
    disposables.add(addDisposableListener(
      sparkleContainer,
      EventType.KEY_DOWN,
      (e4) => {
        if (e4.key === "ArrowLeft" || e4.key === "ArrowRight" || e4.key === "Home" || e4.key === "End") {
          const idx = this._rovingElements.indexOf(sparkleContainer);
          if (idx === -1) {
            return;
          }
          const nextIndex = this._getNextRovingIndex(idx, e4.key);
          if (nextIndex !== void 0 && nextIndex !== idx) {
            e4.preventDefault();
            e4.stopImmediatePropagation();
            this._moveRovingFocus(idx, nextIndex);
          }
        }
      },
      true
      /* useCapture */
    ));
    disposables.add(addDisposableListener(sparkleContainer, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        e4.stopPropagation();
        this.commandService.executeCommand(primaryActionId);
      } else if (e4.key === "ArrowDown" || e4.key === "ArrowUp") {
        e4.preventDefault();
        e4.stopPropagation();
        sparkleDropdown.showDropdown();
      }
    }));
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    const viewSessionsEnabled = this.configurationService.getValue("chat.viewSessions.enabled" /* ChatViewSessionsEnabled */) !== false;
    const reverseOrder2 = !!inlineContainer;
    if (!reverseOrder2) {
      badge.appendChild(sparkleContainer);
    }
    let unreadSection;
    let activeSection;
    let needsInputSection;
    if (viewSessionsEnabled && hasUnreadSessions && this.workspaceContextService.getWorkbenchState() !== 1 /* EMPTY */) {
      const { isFilteredToUnread } = this._getCurrentFilterState();
      unreadSection = $("span.agent-status-badge-section.unread");
      if (isFilteredToUnread) {
        unreadSection.classList.add("filtered");
      }
      unreadSection.setAttribute("role", "button");
      unreadSection.tabIndex = 0;
      const unreadIcon = $("span.agent-status-icon");
      reset(unreadIcon, renderIcon(Codicon.circleFilled));
      unreadSection.appendChild(unreadIcon);
      const unreadCount = $("span.agent-status-text");
      unreadCount.textContent = String(unreadSessions.length);
      unreadSection.appendChild(unreadCount);
      disposables.add(addDisposableListener(unreadSection, EventType.CLICK, (e4) => {
        e4.preventDefault();
        e4.stopPropagation();
        this._openSessionsWithFilter("unread");
      }));
      disposables.add(addDisposableListener(unreadSection, EventType.KEY_DOWN, (e4) => {
        if (e4.key === "Enter" || e4.key === " ") {
          e4.preventDefault();
          e4.stopPropagation();
          this._openSessionsWithFilter("unread");
        }
      }));
      const unreadTooltip = unreadSessions.length === 1 ? localize(9225, null, unreadSessions.length) : localize(9224, null, unreadSessions.length);
      disposables.add(this.hoverService.setupManagedHover(hoverDelegate, unreadSection, unreadTooltip));
    }
    if (viewSessionsEnabled && hasAttentionNeeded) {
      const { isFilteredToNeedsInput } = this._getCurrentFilterState();
      needsInputSection = $("span.agent-status-badge-section.active.needs-input");
      if (isFilteredToNeedsInput) {
        needsInputSection.classList.add("filtered");
      }
      needsInputSection.setAttribute("role", "button");
      needsInputSection.tabIndex = 0;
      const needsInputIcon = $("span.agent-status-icon");
      reset(needsInputIcon, renderIcon(Codicon.report));
      needsInputSection.appendChild(needsInputIcon);
      const needsInputCount = $("span.agent-status-text");
      needsInputCount.textContent = String(attentionNeededSessions.length);
      needsInputSection.appendChild(needsInputCount);
      disposables.add(addDisposableListener(needsInputSection, EventType.CLICK, (e4) => {
        e4.preventDefault();
        e4.stopPropagation();
        this._openSessionsWithFilter("needsInput");
      }));
      disposables.add(addDisposableListener(needsInputSection, EventType.KEY_DOWN, (e4) => {
        if (e4.key === "Enter" || e4.key === " ") {
          e4.preventDefault();
          e4.stopPropagation();
          this._openSessionsWithFilter("needsInput");
        }
      }));
      const needsInputTooltip = attentionNeededSessions.length === 1 ? localize(9217, null, attentionNeededSessions.length) : localize(9216, null, attentionNeededSessions.length);
      disposables.add(this.hoverService.setupManagedHover(hoverDelegate, needsInputSection, needsInputTooltip));
    }
    const inProgressOnly = activeSessions.filter((s) => s.status !== 3 /* NeedsInput */);
    if (viewSessionsEnabled && inProgressOnly.length > 0) {
      const { isFilteredToInProgress } = this._getCurrentFilterState();
      activeSection = $("span.agent-status-badge-section.active");
      if (isFilteredToInProgress) {
        activeSection.classList.add("filtered");
      }
      activeSection.setAttribute("role", "button");
      activeSection.tabIndex = 0;
      const statusIcon = $("span.agent-status-icon");
      reset(statusIcon, renderIcon(Codicon.sessionInProgress));
      activeSection.appendChild(statusIcon);
      const statusCount = $("span.agent-status-text");
      statusCount.textContent = String(inProgressOnly.length);
      activeSection.appendChild(statusCount);
      disposables.add(addDisposableListener(activeSection, EventType.CLICK, (e4) => {
        e4.preventDefault();
        e4.stopPropagation();
        this._openSessionsWithFilter("inProgress");
      }));
      disposables.add(addDisposableListener(activeSection, EventType.KEY_DOWN, (e4) => {
        if (e4.key === "Enter" || e4.key === " ") {
          e4.preventDefault();
          e4.stopPropagation();
          this._openSessionsWithFilter("inProgress");
        }
      }));
      const activeTooltip = inProgressOnly.length === 1 ? localize(9197, null, inProgressOnly.length) : localize(9196, null, inProgressOnly.length);
      disposables.add(this.hoverService.setupManagedHover(hoverDelegate, activeSection, activeTooltip));
    }
    if (reverseOrder2) {
      if (needsInputSection) {
        badge.appendChild(needsInputSection);
        this._rovingElements.push(needsInputSection);
      }
      if (activeSection) {
        badge.appendChild(activeSection);
        this._rovingElements.push(activeSection);
      }
      if (unreadSection) {
        badge.appendChild(unreadSection);
        this._rovingElements.push(unreadSection);
      }
      badge.appendChild(sparkleContainer);
      this._rovingElements.push(sparkleContainer);
    } else {
      this._rovingElements.push(sparkleContainer);
      if (unreadSection) {
        badge.appendChild(unreadSection);
        this._rovingElements.push(unreadSection);
      }
      if (activeSection) {
        badge.appendChild(activeSection);
        this._rovingElements.push(activeSection);
      }
      if (needsInputSection) {
        badge.appendChild(needsInputSection);
        this._rovingElements.push(needsInputSection);
      }
    }
  }
  /**
   * Clear the filter if the currently filtered category becomes empty.
   * For example, if filtered to "unread" but no unread sessions exist, restore user's previous filter.
   * Only auto-clears if THIS window applied the badge filter to avoid cross-window interference.
   */
  _clearFilterIfCategoryEmpty(hasUnreadSessions, hasActiveSessions, hasAttentionNeeded) {
    if (this._badgeFilterAppliedByThisWindow === "unread" && !hasUnreadSessions) {
      this._restoreUserFilter();
    } else if (this._badgeFilterAppliedByThisWindow === "inProgress" && !hasActiveSessions) {
      this._restoreUserFilter();
    } else if (this._badgeFilterAppliedByThisWindow === "needsInput" && !hasAttentionNeeded) {
      this._restoreUserFilter();
    }
  }
  /**
   * Get the current filter state from storage.
   */
  _getCurrentFilterState() {
    const filter2 = this._getStoredFilter();
    if (!filter2) {
      return { isFilteredToUnread: false, isFilteredToInProgress: false, isFilteredToNeedsInput: false };
    }
    const isFilteredToUnread = filter2.read === true && filter2.states.length === 0;
    const isFilteredToInProgress = filter2.states?.length === 3 && filter2.states.includes(3 /* NeedsInput */) && filter2.read === false;
    const isFilteredToNeedsInput = filter2.states?.length === 3 && filter2.states.includes(2 /* InProgress */) && filter2.read === false;
    return { isFilteredToUnread, isFilteredToInProgress, isFilteredToNeedsInput };
  }
  /**
   * Get the stored filter object from storage.
   */
  _getStoredFilter() {
    const filterStr = this.storageService.get(FILTER_STORAGE_KEY, 0 /* PROFILE */);
    if (!filterStr) {
      return void 0;
    }
    try {
      return JSON.parse(filterStr);
    } catch {
      return void 0;
    }
  }
  /**
   * Store a filter object to storage.
   */
  _storeFilter(filter2) {
    this.storageService.store(FILTER_STORAGE_KEY, JSON.stringify(filter2), 0 /* PROFILE */, 0 /* USER */);
  }
  /**
   * Clear all filters (reset to default).
   */
  _clearFilter() {
    this._storeFilter({
      providers: [],
      states: [],
      archived: true,
      read: false
    });
  }
  /**
   * Save the current user filter before we override it with a badge filter.
   * Only saves if the current filter is NOT already a badge filter (unread or in-progress).
   * This preserves the original user filter when switching between badge filters.
   */
  _saveUserFilter() {
    const { isFilteredToUnread, isFilteredToInProgress, isFilteredToNeedsInput } = this._getCurrentFilterState();
    if (isFilteredToUnread || isFilteredToInProgress || isFilteredToNeedsInput) {
      return;
    }
    const currentFilter = this._getStoredFilter();
    if (currentFilter) {
      this.storageService.store(PREVIOUS_FILTER_STORAGE_KEY, JSON.stringify(currentFilter), 0 /* PROFILE */, 0 /* USER */);
    }
  }
  /**
   * Restore the user's previous filter (saved before we applied a badge filter).
   */
  _restoreUserFilter() {
    const previousFilterStr = this.storageService.get(PREVIOUS_FILTER_STORAGE_KEY, 0 /* PROFILE */);
    if (previousFilterStr) {
      try {
        const previousFilter = JSON.parse(previousFilterStr);
        this._storeFilter(previousFilter);
      } catch {
        this._clearFilter();
      }
    } else {
      this._clearFilter();
    }
    this.storageService.remove(PREVIOUS_FILTER_STORAGE_KEY, 0 /* PROFILE */);
    this._badgeFilterAppliedByThisWindow = null;
  }
  /**
   * Opens the agent sessions view with a specific filter applied, or restores previous filter if already applied.
   * Preserves session type (provider) filters while toggling only status filters.
   */
  _openSessionsWithFilter(filterType) {
    const { isFilteredToUnread, isFilteredToInProgress, isFilteredToNeedsInput } = this._getCurrentFilterState();
    const currentFilter = this._getStoredFilter();
    const preservedProviders = currentFilter?.providers ?? [];
    const isToggleOff = filterType === "unread" && isFilteredToUnread || filterType === "inProgress" && isFilteredToInProgress || filterType === "needsInput" && isFilteredToNeedsInput;
    this.telemetryService.publicLog2("agentStatusWidget.click", {
      source: filterType,
      action: isToggleOff ? "clearFilter" : "applyFilter"
    });
    if (isToggleOff) {
      this._restoreUserFilter();
    } else {
      this._saveUserFilter();
      if (filterType === "unread") {
        this._storeFilter({
          providers: preservedProviders,
          states: [],
          archived: true,
          read: true
        });
      } else if (filterType === "inProgress") {
        this._storeFilter({
          providers: preservedProviders,
          states: [1 /* Completed */, 0 /* Failed */, 3 /* NeedsInput */],
          archived: true,
          read: false
        });
      } else {
        this._storeFilter({
          providers: preservedProviders,
          states: [1 /* Completed */, 0 /* Failed */, 2 /* InProgress */],
          archived: true,
          read: false
        });
      }
      this._badgeFilterAppliedByThisWindow = filterType;
    }
    this.commandService.executeCommand(FocusAgentSessionsAction.id);
  }
  /**
   * Render the escape button for exiting session projection mode.
   */
  _renderEscapeButton(disposables, parent) {
    const escButton = $("span.agent-status-esc-button");
    escButton.textContent = "Esc";
    escButton.setAttribute("role", "button");
    escButton.setAttribute("aria-label", localize(9212, null));
    escButton.tabIndex = 0;
    this._rovingElements.push(escButton);
    parent.appendChild(escButton);
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, escButton, localize(9213, null)));
    disposables.add(addDisposableListener(escButton, EventType.MOUSE_DOWN, (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      this.commandService.executeCommand(ExitAgentSessionProjectionAction.ID);
    }));
    disposables.add(addDisposableListener(escButton, EventType.CLICK, (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      this.commandService.executeCommand(ExitAgentSessionProjectionAction.ID);
    }));
    disposables.add(addDisposableListener(escButton, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        e4.stopPropagation();
        this.commandService.executeCommand(ExitAgentSessionProjectionAction.ID);
      }
    }));
  }
  /**
   * Render the enter button for entering session projection mode.
   */
  _renderEnterButton(disposables, parent) {
    const enterButton = $("span.agent-status-enter-button");
    const keybinding = this.keybindingService.lookupKeybinding(EnterAgentSessionProjectionAction.ID);
    enterButton.textContent = keybinding?.getLabel() ?? localize(9222, null);
    enterButton.setAttribute("role", "button");
    enterButton.setAttribute("aria-label", localize(9209, null));
    enterButton.tabIndex = 0;
    this._rovingElements.push(enterButton);
    parent.appendChild(enterButton);
    const hoverDelegate = getDefaultHoverDelegate("mouse");
    const hoverText = keybinding ? localize(9210, null, keybinding.getLabel()) : localize(9211, null);
    disposables.add(this.hoverService.setupManagedHover(hoverDelegate, enterButton, hoverText));
    const enterProjection = (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      const sessionInfo = this.agentTitleBarStatusService.sessionInfo;
      if (sessionInfo) {
        const session = this.agentSessionsService.getSession(sessionInfo.sessionResource);
        if (session) {
          this.commandService.executeCommand(EnterAgentSessionProjectionAction.ID, session);
        }
      }
    };
    disposables.add(addDisposableListener(enterButton, EventType.MOUSE_DOWN, enterProjection));
    disposables.add(addDisposableListener(enterButton, EventType.CLICK, enterProjection));
    disposables.add(addDisposableListener(enterButton, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        enterProjection(e4);
      }
    }));
  }
  // #endregion
  // #region Session Helpers
  /**
   * Get the session most urgently needing user attention (approval/confirmation/input).
   * Returns undefined if no sessions need attention.
   */
  _getSessionNeedingAttention(attentionNeededSessions) {
    if (attentionNeededSessions.length === 0) {
      return { session: void 0, progress: void 0 };
    }
    const sorted = [...attentionNeededSessions].sort((a, b) => {
      const timeA = a.timing.lastRequestStarted ?? a.timing.created;
      const timeB = b.timing.lastRequestStarted ?? b.timing.created;
      return timeB - timeA;
    });
    const mostRecent = sorted[0];
    if (!mostRecent.description) {
      return { session: mostRecent, progress: mostRecent.label };
    }
    const progress = typeof mostRecent.description === "string" ? mostRecent.description : renderAsPlaintext(mostRecent.description);
    return { session: mostRecent, progress };
  }
  // #endregion
  // #region Label Helpers
  /**
   * Compute the label to display in the command center.
   * Uses the workspace name (folder name) with prefix/suffix decorations.
   * Falls back to file name when tabs are hidden, or "Search" when empty.
   */
  _getLabel() {
    const { prefix, suffix } = this._windowTitle.getTitleDecorations();
    let label3 = this._windowTitle.workspaceName;
    if (this._windowTitle.isCustomTitleFormat()) {
      label3 = this._windowTitle.getWindowTitle();
    } else if (!label3 && this.editorGroupsService.partOptions.showTabs === "none") {
      label3 = this._windowTitle.fileName ?? "";
    }
    if (!label3) {
      label3 = localize(9205, null);
    }
    if (prefix) {
      label3 = localize(9214, null, prefix, label3);
    }
    if (suffix) {
      label3 = localize(9215, null, label3, suffix);
    }
    return label3.replaceAll(/\r\n|\r|\n/g, "\u23CE");
  }
  // #endregion
};

AgentTitleBarStatusWidget = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IAgentTitleBarStatusService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, IAgentSessionsService),
  __decorateParam(9, IWorkspaceContextService),
  __decorateParam(10, IEditorGroupsService),
  __decorateParam(11, IEditorService),
  __decorateParam(12, IMenuService),
  __decorateParam(13, IContextKeyService),
  __decorateParam(14, IStorageService),
  __decorateParam(15, IConfigurationService),
  __decorateParam(16, IChatEntitlementService),
  __decorateParam(17, IChatWidgetService),
  __decorateParam(18, ITelemetryService)
], AgentTitleBarStatusWidget);

var AgentTitleBarStatusRendering = class extends Disposable {
  static {
    this.ID = "workbench.contrib.agentStatus.rendering";
  }
  constructor(actionViewItemService, instantiationService, configurationService, contextKeyService, titleService) {
    super();
    this._register(actionViewItemService.register(MenuId.CommandCenter, MenuId.AgentsTitleBarControlMenu, (action, options3) => {
      if (!(action instanceof SubmenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(AgentTitleBarStatusWidget, action, titleService.windowTitle, options3);
    }, void 0));
    const chatEnabledKey = contextKeyService.getContextKeyValue("chatIsEnabled");
    let chatEnabled = !!chatEnabledKey;
    const updateClass = () => {
      const commandCenterEnabled = configurationService.getValue("window.commandCenter" /* COMMAND_CENTER */) === true;
      const statusMode = getAgentStatusSettingMode(configurationService, contextKeyService);
      const enabled = commandCenterEnabled && chatEnabled && statusMode !== "hidden";
      const enhanced = enabled && statusMode === "compact";
      mainWindow.document.body.classList.toggle("agent-status-enabled", enabled);
      mainWindow.document.body.classList.toggle("unified-agents-bar", enhanced);
    };
    updateClass();
    this._register(configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("chat.agentsControl.enabled" /* AgentStatusEnabled */) || e4.affectsConfiguration("window.commandCenter" /* COMMAND_CENTER */) || e4.affectsConfiguration(ChatAIDisabledSettingId) || e4.affectsConfiguration("disableAICustomizations") || e4.affectsConfiguration("workbench.disableAICustomizations")) {
        updateClass();
      }
    }));
    this._register(contextKeyService.onDidChangeContext((e4) => {
      if (e4.affectsSome(/* @__PURE__ */ new Set(["chatIsEnabled", InEditorZenModeContext.key]))) {
        chatEnabled = !!contextKeyService.getContextKeyValue("chatIsEnabled");
        updateClass();
      }
    }));
  }
};

AgentTitleBarStatusRendering = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, ITitleService)
], AgentTitleBarStatusRendering);
export { shouldForceHiddenAgentStatus, getAgentStatusSettingMode, TOGGLE_CHAT_ACTION_ID2, QUICK_OPEN_ACTION_ID, FILTER_STORAGE_KEY, PREVIOUS_FILTER_STORAGE_KEY, AgentTitleBarStatusWidget, AgentTitleBarStatusRendering };
