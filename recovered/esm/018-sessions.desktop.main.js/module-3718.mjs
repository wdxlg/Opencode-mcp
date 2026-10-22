// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/sessionsTitleBarWidget.ts
import { Disposable, DisposableStore, MutableDisposable, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { MenuRegistry, SubmenuItemAction } from "./module-0092.mjs";
import { Menus } from "./module-3437.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { SessionsBlockedSessionsVisibleContext, SessionsWelcomeVisibleContext } from "./module-1770.mjs";
import { autorun } from "./module-0052.mjs";
import { getSessionWorkspaceDisplayInfo } from "./module-3717.mjs";
import { $, EventType, addDisposableGenericMouseDownListener, addDisposableListener, getDomNodePagePosition, getWindow, isAncestor, reset } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { BlockedSessionsList, registerBlockedSessionsItemActions } from "./module-3712.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { SHOW_SESSIONS_PICKER_COMMAND_ID } from "./module-3711.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IHoverService } from "./module-0520.mjs";
import { SessionActionFeedback } from "./module-3713.mjs";
import { BlockedSessionsIndicatorModel } from "./module-3716.mjs";
import { IsAuxiliaryWindowContext } from "./module-0950.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { ILogService } from "./module-0095.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";


// src/vs/sessions/contrib/sessions/browser/sessionsTitleBarWidget.ts
var SHOW_ALL_SESSIONS_FROM_BLOCKED_LIST_COMMAND_ID = "sessions.blockedSessions.showAllSessions";

var IGNORE_ALL_INPUT_NEEDED_COMMAND_ID = "sessions.blockedSessions.ignoreAllInputNeeded";

var HIDE_BLOCKED_SESSIONS_COMMAND_ID = "sessions.blockedSessions.hide";

function registerBlockedSessionsHeaderActions() {
  return combinedDisposable(
    MenuRegistry.appendMenuItem(Menus.BlockedSessionsHeader, {
      command: {
        id: SHOW_ALL_SESSIONS_FROM_BLOCKED_LIST_COMMAND_ID,
        title: localize(5399, null),
        icon: Codicon.listSelection
      },
      group: "navigation",
      order: 1
    }),
    MenuRegistry.appendMenuItem(Menus.BlockedSessionsHeader, {
      command: {
        id: IGNORE_ALL_INPUT_NEEDED_COMMAND_ID,
        title: localize(5395, null),
        icon: Codicon.bellSlash
      },
      group: "navigation",
      order: 2
    }),
    MenuRegistry.appendMenuItem(Menus.BlockedSessionsHeader, {
      command: {
        id: HIDE_BLOCKED_SESSIONS_COMMAND_ID,
        title: localize(5394, null),
        icon: Codicon.close
      },
      group: "z_close",
      order: 1
    })
  );
}

function registerBlockedSessionsHeaderCommands() {
  return combinedDisposable(
    CommandsRegistry.registerCommand(SHOW_ALL_SESSIONS_FROM_BLOCKED_LIST_COMMAND_ID, (_accessor, context2) => {
      context2.showAllSessions();
    }),
    CommandsRegistry.registerCommand(IGNORE_ALL_INPUT_NEEDED_COMMAND_ID, (_accessor, context2) => {
      context2.ignoreAllSessions();
    })
  );
}

var openBlockedSessionsView;

var BLOCKED_DROPDOWN_MIN_WIDTH = 550;

var BLOCKED_DROPDOWN_MAX_WIDTH_RATIO = 0.9;

var SessionsTitleBarWidget = class extends BaseActionViewItem {
  constructor(action, options3, _sessionActionFeedback, _blockedIndicator, sessionsManagementService, sessionsService, sessionsProvidersService, commandService, contextViewService, layoutService, instantiationService, contextKeyService, quickInputService, hoverService) {
    super(void 0, action, options3);
    this._sessionActionFeedback = _sessionActionFeedback;
    this._blockedIndicator = _blockedIndicator;
    this.sessionsManagementService = sessionsManagementService;
    this.sessionsService = sessionsService;
    this.sessionsProvidersService = sessionsProvidersService;
    this.commandService = commandService;
    this.contextViewService = contextViewService;
    this.layoutService = layoutService;
    this.instantiationService = instantiationService;
    this.quickInputService = quickInputService;
    this.hoverService = hoverService;
    this._dynamicDisposables = this._register(new DisposableStore());
    /** Owns the blink animation's `animationend` listener, kept across re-renders. */
    this._blinkListener = this._register(new MutableDisposable());
    /** Guard to prevent re-entrant rendering */
    this._isRendering = false;
    this._isQuickChat = false;
    this._blockedSessionsVisibleContext = SessionsBlockedSessionsVisibleContext.bindTo(contextKeyService);
    this._register(this._blockedIndicator.onDidRequestBlink(() => {
      this._lastRenderState = void 0;
      this._render();
    }));
    this._register(autorun((reader) => {
      const sessionData = this.sessionsService.activeSession.read(reader);
      this._workspaceInfo = getSessionWorkspaceDisplayInfo(sessionData, reader);
      this._isQuickChat = sessionData?.isQuickChat?.read(reader) ?? false;
      this._lastRenderState = void 0;
      this._render();
    }));
    this._register(autorun((reader) => {
      const blocked = this._blockedIndicator.blockedSessions.read(reader);
      this._sessionActionFeedback.approvedCount.read(reader);
      this._blockedIndicator.requiresInputKind.read(reader);
      if (this._openContextView && this._blockedList) {
        this._blockedList.setSessions(blocked.map((entry) => entry.session));
        this.contextViewService.layout();
      }
      this._render();
    }));
    this._register(this.sessionsManagementService.onDidChangeSessions(() => {
      this._lastRenderState = void 0;
      this._render();
    }));
    this._register(this.sessionsProvidersService.onDidChangeProviders(() => {
      this._lastRenderState = void 0;
      this._render();
    }));
    this._register(toDisposable(() => this._openContextView?.close()));
  }
  render(container2) {
    super.render(container2);
    this._container = container2;
    container2.classList.add("agent-sessions-titlebar-container");
    this._render();
  }
  setFocusable(_focusable) {
  }
  // Override onClick to prevent the base class from running the underlying
  // submenu action when the widget handles clicks itself.
  onClick() {
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
      const approvedCount = this._sessionActionFeedback.approvedCount.get();
      const blockedCount = this._blockedIndicator.blockedSessions.get().length;
      const requiresInput = blockedCount > 0;
      const showApproved = approvedCount > 0;
      const showRequiresInput = requiresInput && !showApproved;
      const shouldBlink = showRequiresInput && this._blockedIndicator.consumePendingBlink();
      const requiresInputKind = this._blockedIndicator.requiresInputKind.get();
      let renderState;
      if (showApproved) {
        renderState = `approved|${approvedCount}`;
      } else if (showRequiresInput) {
        renderState = `blocked|${blockedCount}|${requiresInputKind ?? "mixed"}`;
      } else {
        renderState = `normal|${this._workspaceInfo?.icon.id ?? ""}|${this._workspaceInfo?.label ?? ""}|${this._isQuickChat}`;
      }
      if (this._lastRenderState === renderState) {
        return;
      }
      this._lastRenderState = renderState;
      if (!requiresInput && this._openContextView) {
        this._openContextView.close();
      }
      reset(this._container);
      this._dynamicDisposables.clear();
      this._container.removeAttribute("aria-hidden");
      this._container.setAttribute("role", "button");
      this._container.tabIndex = 0;
      if (!(showRequiresInput && !shouldBlink)) {
        this._container.classList.remove("agent-sessions-titlebar-blink");
      }
      this._container.classList.toggle("agent-sessions-titlebar-requires-input", showRequiresInput);
      this._container.classList.toggle("agent-sessions-titlebar-approved", showApproved);
      if (showApproved) {
        this._renderApproved(approvedCount);
      } else if (showRequiresInput) {
        this._renderRequiresInput(blockedCount, requiresInputKind, shouldBlink);
      } else {
        this._renderActiveSession();
      }
    } finally {
      this._isRendering = false;
    }
  }
  /**
   * Render the active-session pill: workspace icon + folder. Clicking opens the
   * sessions picker.
   */
  _renderActiveSession() {
    const container2 = this._container;
    container2.setAttribute("aria-label", localize(5393, null));
    const workspaceInfo = this._workspaceInfo;
    const sessionPill = $("div.agent-sessions-titlebar-pill");
    const centerGroup = $("div.agent-sessions-titlebar-center");
    if (workspaceInfo) {
      const workspaceIconEl = $(`div.agent-sessions-titlebar-workspace-icon${ThemeIcon.asCSSSelector(workspaceInfo.icon)}`, { "aria-hidden": "true" });
      centerGroup.appendChild(workspaceIconEl);
      const workspaceEl = $("div.agent-sessions-titlebar-workspace");
      workspaceEl.textContent = workspaceInfo.label;
      centerGroup.appendChild(workspaceEl);
      this._dynamicDisposables.add(this.hoverService.setupDelayedHover(workspaceEl, { content: workspaceInfo.label }));
    } else if (this._isQuickChat) {
      const workspaceIconEl = $(`div.agent-sessions-titlebar-workspace-icon${ThemeIcon.asCSSSelector(Codicon.commentDiscussion)}`, { "aria-hidden": "true" });
      centerGroup.appendChild(workspaceIconEl);
      const workspaceEl = $("div.agent-sessions-titlebar-workspace");
      workspaceEl.textContent = localize(5396, null);
      centerGroup.appendChild(workspaceEl);
    }
    sessionPill.appendChild(centerGroup);
    this._dynamicDisposables.add(addDisposableGenericMouseDownListener(sessionPill, (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
    }));
    this._dynamicDisposables.add(addDisposableListener(sessionPill, EventType.CLICK, (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      this._showSessionsPicker();
    }));
    container2.appendChild(sessionPill);
    this._dynamicDisposables.add(addDisposableListener(container2, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        e4.stopPropagation();
        this._showSessionsPicker();
      }
    }));
  }
  /**
   * Render the requires-input pill. Clicking toggles a dropdown that lists the
   * blocked sessions below the command center box.
   */
  _renderRequiresInput(count2, kind, shouldBlink) {
    const container2 = this._container;
    const label3 = this._blockedIndicator.getRequiresInputLabel(count2, kind);
    container2.setAttribute("aria-label", label3);
    const pill = $("div.agent-sessions-titlebar-pill");
    const labelEl = $("div.agent-sessions-titlebar-requires-input-label");
    labelEl.textContent = label3;
    pill.appendChild(labelEl);
    this._dynamicDisposables.add(addDisposableGenericMouseDownListener(pill, (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
    }));
    this._dynamicDisposables.add(addDisposableListener(pill, EventType.CLICK, (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      this._toggleBlockedSessions();
    }));
    container2.appendChild(pill);
    this._dynamicDisposables.add(addDisposableListener(container2, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        e4.stopPropagation();
        this._toggleBlockedSessions();
      }
    }));
    if (shouldBlink) {
      this._triggerAttentionBlink();
    }
  }
  /**
   * Render the transient green "Approved N sessions" confirmation shown briefly
   * after the user approves one or more sessions' pending actions from the list.
   */
  _renderApproved(count2) {
    const container2 = this._container;
    const label3 = count2 === 1 ? localize(5398, null) : localize(5397, null, count2);
    container2.setAttribute("aria-label", label3);
    const pill = $("div.agent-sessions-titlebar-pill");
    const labelEl = $("div.agent-sessions-titlebar-approved-label");
    labelEl.textContent = label3;
    pill.appendChild(labelEl);
    this._dynamicDisposables.add(addDisposableGenericMouseDownListener(pill, (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
    }));
    this._dynamicDisposables.add(addDisposableListener(pill, EventType.CLICK, (e4) => {
      e4.preventDefault();
      e4.stopPropagation();
      this._activateDefaultAction();
    }));
    container2.appendChild(pill);
    this._dynamicDisposables.add(addDisposableListener(container2, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        e4.stopPropagation();
        this._activateDefaultAction();
      }
    }));
  }
  /**
   * Activate the widget as its non-approved state would: reveal the blocked
   * sessions when the requires-input state applies, otherwise the sessions picker.
   */
  _activateDefaultAction() {
    const requiresInput = this._blockedIndicator.blockedSessions.get().length > 0;
    if (requiresInput) {
      this._toggleBlockedSessions();
    } else {
      this._showSessionsPicker();
    }
  }
  /**
   * Restart the attention blink animation on the command center box. Re-adding
   * the class after a forced reflow guarantees the CSS animation replays even
   * when the container element persists across renders.
   */
  _triggerAttentionBlink() {
    const container2 = this._container;
    if (!container2) {
      return;
    }
    container2.classList.remove("agent-sessions-titlebar-blink");
    container2.getBoundingClientRect();
    container2.classList.add("agent-sessions-titlebar-blink");
    this._blinkListener.value = addDisposableListener(container2, "animationend", () => {
      container2.classList.remove("agent-sessions-titlebar-blink");
      this._blinkListener.clear();
    });
  }
  /**
   * Toggle the blocked-sessions dropdown open/closed.
   */
  _toggleBlockedSessions() {
    if (this._openContextView) {
      this._openContextView.close();
      return;
    }
    this._showBlockedSessions();
  }
  /**
   * Show the blocked sessions as a flat list in a dropdown anchored below the
   * command center box.
   */
  _showBlockedSessions() {
    const container2 = this._container;
    if (!container2) {
      return;
    }
    if (this._blockedIndicator.blockedSessions.get().length === 0) {
      return;
    }
    const width2 = this._computeBlockedDropdownWidth(container2);
    const store = new DisposableStore();
    this._openContextView = this.contextViewService.showContextView({
      getAnchor: () => this._getBlockedDropdownAnchor(container2),
      anchorAlignment: 0 /* LEFT */,
      anchorPosition: 0 /* BELOW */,
      render: (viewContainer) => {
        const list2 = store.add(this.instantiationService.createInstance(BlockedSessionsList, viewContainer, {
          width: width2,
          approvalModel: this._blockedIndicator.approvalModel,
          ciFixModel: this._blockedIndicator.ciFixModel,
          onSessionOpen: (resource, preserveFocus, sideBySide) => {
            this._openContextView?.close();
            this._openBlockedSession(resource, preserveFocus, sideBySide);
          },
          onIgnoreSession: (session) => this._blockedIndicator.ignoreSession(session),
          onShowAllSessions: () => {
            this._openContextView?.close();
            this._showSessionsPicker();
          },
          onIgnoreAllSessions: () => this._blockedIndicator.ignoreAllSessions(),
          onClose: () => this._openContextView?.close()
        }));
        list2.setSessions(this._blockedIndicator.blockedSessions.get().map((entry) => entry.session));
        store.add(list2.onDidChangeContentHeight(() => this.contextViewService.layout()));
        store.add(list2.onDidApproveSession((approved) => {
          this._blockedIndicator.dismissApproval(approved);
          this._sessionActionFeedback.notifyApproved();
        }));
        store.add(this.layoutService.onDidLayoutActiveContainer(() => {
          list2.setWidth(this._computeBlockedDropdownWidth(container2));
          this.contextViewService.layout();
        }));
        store.add(this.quickInputService.onShow(() => this._openContextView?.close()));
        this._blockedList = list2;
        return store;
      },
      focus: () => this._blockedList?.focus(),
      onDOMEvent: (e4) => {
        if (e4.type === EventType.CLICK) {
          const target = e4.target;
          if (target && !isAncestor(target, this.contextViewService.getContextViewElement()) && !isAncestor(target, container2)) {
            this._openContextView?.close();
          }
        }
      },
      onHide: () => {
        this._blockedSessionsVisibleContext.set(false);
        store.dispose();
        this._openContextView = void 0;
        openBlockedSessionsView = void 0;
        this._blockedList = void 0;
      }
    });
    openBlockedSessionsView = this._openContextView;
    this._blockedSessionsVisibleContext.set(true);
  }
  /**
   * Compute the width of the blocked-sessions dropdown: at least as wide as the
   * command center box (the anchor) and {@link BLOCKED_DROPDOWN_MIN_WIDTH}, but
   * never wider than {@link BLOCKED_DROPDOWN_MAX_WIDTH_RATIO} of the window so it
   * stays within the viewport on narrow layouts.
   */
  _computeBlockedDropdownWidth(container2) {
    const anchorWidth = getDomNodePagePosition(container2).width;
    const windowWidth = getWindow(container2).innerWidth;
    const minWidth = Math.max(anchorWidth, BLOCKED_DROPDOWN_MIN_WIDTH);
    const maxWidth = windowWidth * BLOCKED_DROPDOWN_MAX_WIDTH_RATIO;
    return Math.round(Math.min(minWidth, maxWidth));
  }
  /**
   * Anchor the blocked-sessions dropdown so it is horizontally centered on the
   * command center box. Because the dropdown can be wider than the box, we hand
   * the context view a zero-width anchor positioned at the dropdown's target
   * left edge (the box center minus half the dropdown width).
   */
  _getBlockedDropdownAnchor(container2) {
    const position2 = getDomNodePagePosition(container2);
    const width2 = this._computeBlockedDropdownWidth(container2);
    const centerX = position2.left + position2.width / 2;
    return {
      x: Math.round(centerX - width2 / 2),
      y: position2.top,
      width: 0,
      height: position2.height
    };
  }
  _openBlockedSession(resource, preserveFocus, sideBySide) {
    if (sideBySide) {
      const session = this.sessionsManagementService.getSession(resource);
      if (session) {
        this.sessionsService.openSessionToSide(session, { preserveFocus, source: "sessionsList" }).catch(onUnexpectedError);
        return;
      }
    }
    this.sessionsService.openSession(resource, { preserveFocus, source: "sessionsList" }).catch(onUnexpectedError);
  }
  _showSessionsPicker() {
    this.commandService.executeCommand(SHOW_SESSIONS_PICKER_COMMAND_ID);
  }
};

SessionsTitleBarWidget = __decorateClass([
  __decorateParam(4, ISessionsManagementService),
  __decorateParam(5, ISessionsService),
  __decorateParam(6, ISessionsProvidersService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IContextViewService),
  __decorateParam(9, IWorkbenchLayoutService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, IContextKeyService),
  __decorateParam(12, IQuickInputService),
  __decorateParam(13, IHoverService)
], SessionsTitleBarWidget);

var SessionsTitleBarContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.agentSessionsTitleBar";
  }
  constructor(actionViewItemService, instantiationService, logService) {
    super();
    const sessionActionFeedback = this._register(new SessionActionFeedback());
    const blockedIndicator = this._register(instantiationService.createInstance(
      BlockedSessionsIndicatorModel,
      void 0,
      void 0,
      void 0
      /* ciFixModel */
    ));
    this._register(MenuRegistry.appendMenuItem(Menus.CommandCenter, {
      submenu: Menus.TitleBarSessionTitle,
      title: localize(5392, null),
      order: 101,
      when: ContextKeyExpr.and(IsAuxiliaryWindowContext.negate(), SessionsWelcomeVisibleContext.negate())
    }));
    this._register(MenuRegistry.appendMenuItem(Menus.TitleBarSessionTitle, {
      command: {
        id: SHOW_SESSIONS_PICKER_COMMAND_ID,
        title: localize(5400, null)
      },
      group: "a_sessions",
      order: 1,
      when: IsAuxiliaryWindowContext.negate()
    }));
    this._register(registerBlockedSessionsHeaderCommands());
    this._register(registerBlockedSessionsHeaderActions());
    this._register(registerBlockedSessionsItemActions());
    this._register(actionViewItemService.register(Menus.CommandCenter, Menus.TitleBarSessionTitle, (action, options3) => {
      if (!(action instanceof SubmenuItemAction)) {
        return void 0;
      }
      logService.trace("[SessionsTitleBar] creating the title bar widget");
      return instantiationService.createInstance(SessionsTitleBarWidget, action, options3, sessionActionFeedback, blockedIndicator);
    }, void 0));
  }
};

SessionsTitleBarContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILogService)
], SessionsTitleBarContribution);

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: HIDE_BLOCKED_SESSIONS_COMMAND_ID,
  weight: 250 /* SessionsContrib */ + 100,
  when: SessionsBlockedSessionsVisibleContext,
  primary: 9 /* Escape */,
  handler: (_accessor, context2) => {
    if (context2) {
      context2.close();
    } else {
      openBlockedSessionsView?.close();
    }
  }
});
export { registerBlockedSessionsHeaderActions, registerBlockedSessionsHeaderCommands, SHOW_ALL_SESSIONS_FROM_BLOCKED_LIST_COMMAND_ID, IGNORE_ALL_INPUT_NEEDED_COMMAND_ID, HIDE_BLOCKED_SESSIONS_COMMAND_ID, openBlockedSessionsView, BLOCKED_DROPDOWN_MIN_WIDTH, BLOCKED_DROPDOWN_MAX_WIDTH_RATIO, SessionsTitleBarWidget, SessionsTitleBarContribution };
