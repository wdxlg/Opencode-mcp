// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/sessionsActions.ts
import { Action2, MenuId, MenuItemAction, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { SessionsCategories } from "./module-3532.mjs";
import { EditorAreaFocusContext, IsAuxiliaryWindowContext, IsSessionsWindowContext } from "./module-0950.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { ISessionsListModelService } from "./module-3496.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { getChatCapabilities, getGitHubPullRequestRefs, getHighestPriorityPullRequestIcon, getUntitledSessionTitle } from "./module-1767.mjs";
import { Codicon } from "./module-0085.mjs";
import { fromNow } from "./module-0120.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { autorun } from "./module-0052.mjs";
import { groupSessionsForPicker } from "./module-3710.mjs";
import { CanGoBackContext, CanGoForwardContext, IsQuickChatSessionContext, MultipleSessionsVisibleContext, SessionActiveChatIsClosableContext, SessionActiveChatIsDeletableContext, SessionChatsPickerVisibleContext, SessionHasMultipleCommittedChatsContext, SessionHasMultipleOpenChatsContext, SessionHasSideChatsContext, SessionIdContext, SessionIsArchivedContext, SessionIsCreatedContext, SessionIsMaximizedContext, SessionIsStickyContext, SessionProviderIdContext, SessionSupportsMultipleChatsContext, SessionSupportsRenameContext, SessionsEditorScopeContext, SessionsFocusContext, SessionsHasClosedItemContext, SessionsPickerVisibleContext, SessionsTitleBarNewSessionEnabledContext, SessionsWelcomeVisibleContext } from "./module-1770.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { getQuickNavigateHandler, inQuickPickContext } from "./module-1510.mjs";
import { Menus } from "./module-3437.mjs";
import { CLOSE_CHAT_COMMAND_ID, FOCUS_ACTIVE_SESSION_COMMAND_ID, FOCUS_NEXT_CHAT_GROUP_COMMAND_ID, FOCUS_PREVIOUS_CHAT_GROUP_COMMAND_ID, MOVE_CHAT_TO_NEXT_GROUP_COMMAND_ID, MOVE_CHAT_TO_PREVIOUS_GROUP_COMMAND_ID, RENAME_SESSION_COMMAND_ID, SPLIT_CHAT_GROUP_DOWN_COMMAND_ID, SPLIT_CHAT_GROUP_RIGHT_COMMAND_ID } from "./module-1800.mjs";
import { KeyChord } from "./module-0019.mjs";
import { SessionChatItemCanDeleteContext, SessionChatItemCanRenameContext, SessionChatItemIsUntitledContext } from "./module-3523.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { InputFocusedContext } from "./module-0635.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { agentsNewSessionButtonBackground, agentsNewSessionButtonBorder, agentsNewSessionButtonForeground, agentsNewSessionButtonHoverBackground } from "./module-1496.mjs";
import { markOnboardingTarget } from "./module-3542.mjs";
import { $, EventHelper, ModifierKeyEmitter, append, reset } from "./module-0075.mjs";
import { KeybindingLabel } from "./module-0547.mjs";
import { OS } from "./module-0014.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { NEW_SESSION_ACTION_ID } from "./module-3644.mjs";
import { logSessionsInteraction } from "./module-1781.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { SESSION_CONVERSATION_SIDE_CHATS_GROUP, getSessionConversationActionId, isSessionConversationSideChat } from "./module-3490.mjs";
import { ANY_AGENT_HOST_PROVIDER_RE } from "./module-1764.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";


// src/vs/sessions/contrib/sessions/browser/sessionsActions.ts
var SHOW_SESSIONS_PICKER_COMMAND_ID = "sessions.showSessionsPicker";

registerAction2(class ShowSessionsPickerAction extends Action2 {
  constructor() {
    super({
      id: SHOW_SESSIONS_PICKER_COMMAND_ID,
      title: localize2(5388, "Show Sessions Picker"),
      f1: true,
      category: SessionsCategories.Sessions,
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 48 /* KeyR */,
        mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 48 /* KeyR */ },
        weight: 250 /* SessionsContrib */,
        when: IsSessionsWindowContext
      }
    });
  }
  async run(accessor) {
    const sessionsService = accessor.get(ISessionsService);
    const quickInputService = accessor.get(IQuickInputService);
    const sessionsPartService = accessor.get(ISessionsPartService);
    const sessionsListModelService = accessor.get(ISessionsListModelService);
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const contextKeyService = accessor.get(IContextKeyService);
    const activeSessionId = sessionsService.activeSession.get()?.sessionId;
    const toPickItem = (session, reader) => {
      const title = session.title.read(reader) || getUntitledSessionTitle(session.isQuickChat?.read(reader) ?? false);
      const status2 = session.status.read(reader);
      const isRead = session.isRead.read(reader);
      const isArchived = session.isArchived.read(reader);
      const workspace = session.workspace.read(reader);
      const gitHubInfo = workspace?.folders[0]?.gitRepository?.gitHubInfo.read(reader);
      const pullRequestIcon = getHighestPriorityPullRequestIcon(getGitHubPullRequestRefs(gitHubInfo).map((pullRequest) => pullRequest.icon));
      const completedStateIcon = session.completedStateIcon?.read(reader) ?? pullRequestIcon;
      const icon2 = sessionsListModelService.getStatusIcon(status2, isRead, isArchived, completedStateIcon);
      const detailParts = [];
      if (workspace?.label) {
        const isWorkspaceFolder3 = workspace.folders.length > 0 && workspace.folders[0]?.gitRepository?.workTreeUri === void 0;
        const workspaceIcon2 = workspace.typeIcon ?? (workspace.isVirtualWorkspace ? Codicon.cloud : isWorkspaceFolder3 ? Codicon.folder : Codicon.worktree);
        detailParts.push(`$(${Codicon.blank.id}) $(${workspaceIcon2.id}) ${workspace.label}`);
      } else {
        detailParts.push(`$(${Codicon.blank.id})`);
      }
      detailParts.push(fromNow(session.updatedAt.read(reader), true, true));
      return {
        id: session.sessionId,
        label: title,
        detail: detailParts.join(" \xB7 "),
        iconClass: ThemeIcon.asClassName(icon2),
        iconColor: icon2.color,
        session
      };
    };
    const picker = quickInputService.createQuickPick({ useSeparators: true });
    picker.placeholder = localize(5380, null);
    picker.canAcceptInBackground = true;
    picker.matchOnDetail = true;
    const disposables = new DisposableStore();
    disposables.add(picker);
    const sessionsChanged = observableSignalFromEvent("sessionsPickerSessionsChanged", sessionsManagementService.onDidChangeSessions);
    disposables.add(autorun((reader) => {
      sessionsChanged.read(reader);
      const { recent, other } = sessionsService.getRecentlyOpenedSessions();
      const sessionGroups = groupSessionsForPicker(recent, other, reader);
      const items = [{
        id: "newSession",
        label: `$(add) ${localize(5363, null)}`,
        session: void 0
      }];
      let firstSessionItem;
      const appendSessions = (label3, sessions) => {
        if (sessions.length === 0) {
          return;
        }
        items.push({ type: "separator", label: label3 });
        for (const session of sessions) {
          const item = toPickItem(session, reader);
          firstSessionItem ??= item;
          items.push(item);
        }
      };
      appendSessions(localize(5385, null), sessionGroups.needsInput);
      appendSessions(localize(5386, null), sessionGroups.unread);
      appendSessions(localize(5373, null), sessionGroups.recent);
      appendSessions(localize(5370, null), sessionGroups.other);
      const activeItemId = picker.activeItems[0]?.id;
      picker.items = items;
      const activeItem = activeItemId ? items.find((item) => item.type !== "separator" && item.id === activeItemId) : firstSessionItem;
      if (activeItem) {
        picker.activeItems = [activeItem];
      }
    }));
    const pickerVisibleContext = SessionsPickerVisibleContext.bindTo(contextKeyService);
    pickerVisibleContext.set(true);
    disposables.add(toDisposable(() => pickerVisibleContext.reset()));
    const openSelected = (selected, inBackground, toSide) => {
      if (!selected.session) {
        sessionsService.openNewSession();
        sessionsPartService.focusSession(sessionsService.activeSession.get());
        return;
      }
      if (toSide && activeSessionId !== void 0 && selected.session.sessionId !== activeSessionId) {
        sessionsService.insertAt(selected.session, activeSessionId, "right", !inBackground);
      } else {
        sessionsService.openSession(selected.session.resource, { preserveFocus: inBackground, source: "sessionsList" });
      }
    };
    disposables.add(picker.onDidAccept((e4) => {
      const [selected] = picker.selectedItems;
      if (selected) {
        const toSide = picker.keyMods.ctrlCmd || picker.keyMods.alt;
        openSelected(selected, e4.inBackground, toSide);
      }
      if (!e4.inBackground) {
        picker.hide();
      }
    }));
    disposables.add(picker.onDidHide(() => disposables.dispose()));
    picker.show();
  }
});

var SESSIONS_PICKER_NAVIGATE_NEXT_ID = "sessions.showSessionsPicker.navigateNext";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: SESSIONS_PICKER_NAVIGATE_NEXT_ID,
  weight: 250 /* SessionsContrib */ + 50,
  handler: getQuickNavigateHandler(SESSIONS_PICKER_NAVIGATE_NEXT_ID, true),
  when: SessionsPickerVisibleContext,
  primary: 2048 /* CtrlCmd */ | 48 /* KeyR */,
  mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 48 /* KeyR */ }
});

var SESSIONS_PICKER_NAVIGATE_PREVIOUS_ID = "sessions.showSessionsPicker.navigatePrevious";

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: SESSIONS_PICKER_NAVIGATE_PREVIOUS_ID,
  weight: 250 /* SessionsContrib */ + 50,
  handler: getQuickNavigateHandler(SESSIONS_PICKER_NAVIGATE_PREVIOUS_ID, false),
  when: SessionsPickerVisibleContext,
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 48 /* KeyR */,
  mac: { primary: 256 /* WinCtrl */ | 512 /* Alt */ | 1024 /* Shift */ | 48 /* KeyR */ }
});

registerAction2(class GoBackAction extends Action2 {
  constructor() {
    super({
      id: "sessions.goBack",
      title: {
        ...localize2(5381, "Go Back"),
        mnemonicTitle: localize(5356, null)
      },
      f1: true,
      icon: Codicon.arrowLeft,
      tooltip: localize(5382, null),
      category: SessionsCategories.Sessions,
      precondition: CanGoBackContext,
      keybinding: {
        // Higher than `WorkbenchContrib` so the `Ctrl+Shift+Tab` secondary wins over the
        // editor quick-open actions (which bind the same chord at `WorkbenchContrib`).
        weight: 250 /* SessionsContrib */,
        win: { primary: 512 /* Alt */ | 15 /* LeftArrow */, secondary: [122 /* BrowserBack */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 2 /* Tab */] },
        mac: { primary: 256 /* WinCtrl */ | 88 /* Minus */, secondary: [122 /* BrowserBack */, 256 /* WinCtrl */ | 1024 /* Shift */ | 2 /* Tab */] },
        linux: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 88 /* Minus */, secondary: [122 /* BrowserBack */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 2 /* Tab */] },
        when: ContextKeyExpr.and(IsSessionsWindowContext, EditorAreaFocusContext.toNegated())
      },
      menu: [{
        id: Menus.TitleBarCenterLeft,
        group: "navigation",
        order: 1,
        when: ContextKeyExpr.and(IsAuxiliaryWindowContext.toNegated(), SessionsWelcomeVisibleContext.toNegated())
      }, {
        id: Menus.GoMenu,
        group: "1_history_nav",
        order: 1
      }]
    });
  }
  async run(accessor) {
    await accessor.get(ISessionsService).openPreviousSession();
  }
});

registerAction2(class GoForwardAction extends Action2 {
  constructor() {
    super({
      id: "sessions.goForward",
      title: {
        ...localize2(5383, "Go Forward"),
        mnemonicTitle: localize(5357, null)
      },
      f1: true,
      icon: Codicon.arrowRight,
      tooltip: localize(5384, null),
      category: SessionsCategories.Sessions,
      precondition: CanGoForwardContext,
      keybinding: {
        // Higher than `WorkbenchContrib` so the `Ctrl+Tab` secondary wins over the
        // editor quick-open actions (which bind the same chord at `WorkbenchContrib`).
        weight: 250 /* SessionsContrib */,
        win: { primary: 512 /* Alt */ | 17 /* RightArrow */, secondary: [123 /* BrowserForward */, 2048 /* CtrlCmd */ | 2 /* Tab */] },
        mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 88 /* Minus */, secondary: [123 /* BrowserForward */, 256 /* WinCtrl */ | 2 /* Tab */] },
        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 88 /* Minus */, secondary: [123 /* BrowserForward */, 2048 /* CtrlCmd */ | 2 /* Tab */] },
        when: ContextKeyExpr.and(IsSessionsWindowContext, EditorAreaFocusContext.toNegated())
      },
      menu: [{
        id: Menus.TitleBarCenterLeft,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(IsAuxiliaryWindowContext.toNegated(), SessionsWelcomeVisibleContext.toNegated())
      }, {
        id: Menus.GoMenu,
        group: "1_history_nav",
        order: 2
      }]
    });
  }
  async run(accessor) {
    await accessor.get(ISessionsService).openNextSession();
  }
});

registerAction2(class FocusActiveSessionAction extends Action2 {
  constructor() {
    super({
      id: FOCUS_ACTIVE_SESSION_COMMAND_ID,
      title: localize2(5351, "Focus Active Session"),
      f1: true,
      category: SessionsCategories.Sessions,
      keybinding: {
        // Must outrank the workbench `workbench.action.chat.open` binding
        // (WorkbenchContrib) so that in the sessions window the chord
        // focuses the active session. Using the normal open chat action will not work for new session views.
        weight: 250 /* SessionsContrib */,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 39 /* KeyI */,
        secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 39 /* KeyI */],
        mac: {
          primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 39 /* KeyI */,
          secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 39 /* KeyI */]
        },
        linux: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 39 /* KeyI */,
          secondary: [2048 /* CtrlCmd */ | 512 /* Alt */ | 1024 /* Shift */ | 39 /* KeyI */]
        }
      }
    });
  }
  async run(accessor) {
    const sessionsPartService = accessor.get(ISessionsPartService);
    const sessionsService = accessor.get(ISessionsService);
    sessionsPartService.focusSession(sessionsService.activeSession.get());
  }
});

function withActiveSessionView(accessor, action) {
  const sessionsService = accessor.get(ISessionsService);
  const view = accessor.get(ISessionsPartService).getSessionView(sessionsService.activeSession.get()?.sessionId);
  if (view) {
    action(view);
  }
}

registerAction2(class FocusPreviousChatGroupAction extends Action2 {
  constructor() {
    super({
      id: FOCUS_PREVIOUS_CHAT_GROUP_COMMAND_ID,
      title: localize2(5354, "Focus Previous Chat Group"),
      f1: true,
      category: SessionsCategories.Sessions,
      keybinding: {
        weight: 250 /* SessionsContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 15 /* LeftArrow */),
        when: ContextKeyExpr.and(IsSessionsWindowContext, EditorAreaFocusContext.toNegated())
      }
    });
  }
  run(accessor) {
    withActiveSessionView(accessor, (view) => view.focusAdjacentChatGroup("previous"));
  }
});

registerAction2(class FocusNextChatGroupAction extends Action2 {
  constructor() {
    super({
      id: FOCUS_NEXT_CHAT_GROUP_COMMAND_ID,
      title: localize2(5353, "Focus Next Chat Group"),
      f1: true,
      category: SessionsCategories.Sessions,
      keybinding: {
        weight: 250 /* SessionsContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 17 /* RightArrow */),
        when: ContextKeyExpr.and(IsSessionsWindowContext, EditorAreaFocusContext.toNegated())
      }
    });
  }
  run(accessor) {
    withActiveSessionView(accessor, (view) => view.focusAdjacentChatGroup("next"));
  }
});

registerAction2(class SplitChatGroupRightAction extends Action2 {
  constructor() {
    super({
      id: SPLIT_CHAT_GROUP_RIGHT_COMMAND_ID,
      title: localize2(5390, "Split Chat Group Right"),
      f1: true,
      category: SessionsCategories.Sessions
    });
  }
  run(accessor) {
    withActiveSessionView(accessor, (view) => view.splitActiveChat("right"));
  }
});

registerAction2(class SplitChatGroupDownAction extends Action2 {
  constructor() {
    super({
      id: SPLIT_CHAT_GROUP_DOWN_COMMAND_ID,
      title: localize2(5389, "Split Chat Group Down"),
      f1: true,
      category: SessionsCategories.Sessions
    });
  }
  run(accessor) {
    withActiveSessionView(accessor, (view) => view.splitActiveChat("bottom"));
  }
});

registerAction2(class MoveChatToPreviousGroupAction extends Action2 {
  constructor() {
    super({
      id: MOVE_CHAT_TO_PREVIOUS_GROUP_COMMAND_ID,
      title: localize2(5359, "Move Chat to Previous Group"),
      f1: true,
      category: SessionsCategories.Sessions
    });
  }
  run(accessor) {
    withActiveSessionView(accessor, (view) => view.moveActiveChatToAdjacentGroup("previous"));
  }
});

registerAction2(class MoveChatToNextGroupAction extends Action2 {
  constructor() {
    super({
      id: MOVE_CHAT_TO_NEXT_GROUP_COMMAND_ID,
      title: localize2(5358, "Move Chat to Next Group"),
      f1: true,
      category: SessionsCategories.Sessions
    });
  }
  run(accessor) {
    withActiveSessionView(accessor, (view) => view.moveActiveChatToAdjacentGroup("next"));
  }
});

for (let index2 = 0; index2 < 9; index2++) {
  const position2 = index2 + 1;
  const isLast = position2 === 9;
  registerAction2(class FocusSessionByPositionAction extends Action2 {
    constructor() {
      super({
        id: `sessions.focusSessionInGrid${position2}`,
        title: isLast ? localize2(5352, "Focus Last Session in Grid") : localize2(5355, "Focus Session {0} in Grid", position2),
        f1: true,
        category: SessionsCategories.Sessions,
        keybinding: {
          weight: 250 /* SessionsContrib */,
          primary: 2048 /* CtrlCmd */ | 22 /* Digit1 */ + index2,
          when: IsSessionsWindowContext
        }
      });
    }
    async run(accessor) {
      const sessionsService = accessor.get(ISessionsService);
      const sessionsPartService = accessor.get(ISessionsPartService);
      const visible = sessionsService.visibleSessions.get();
      const targetIndex = isLast ? visible.length - 1 : index2;
      if (targetIndex < 0 || targetIndex >= visible.length) {
        return;
      }
      const session = visible[targetIndex];
      sessionsService.setActive(session);
      sessionsPartService.focusSession(session);
    }
  });
}

registerAction2(class CloseAllSessionsAction extends Action2 {
  constructor() {
    super({
      id: "sessions.closeAllSessions",
      title: localize2(5346, "Close All Sessions"),
      f1: true,
      category: SessionsCategories.Sessions,
      precondition: IsSessionsWindowContext,
      keybinding: {
        weight: 250 /* SessionsContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 53 /* KeyW */),
        // Only fire from the keyboard while a session (its chat view) has focus.
        when: ContextKeyExpr.and(IsSessionsWindowContext, SessionsFocusContext)
      }
    });
  }
  async run(accessor) {
    accessor.get(ISessionsService).closeAllSessions();
  }
});

var CHAT_TAB_KEYBINDING_WEIGHT = 250 /* SessionsContrib */ + 10;

registerAction2(class RenameSessionListChatAction extends Action2 {
  constructor() {
    super({
      id: "sessions.list.renameChat",
      title: localize2(5374, "Rename..."),
      f1: false,
      menu: {
        id: Menus.SessionChatItemContext,
        group: "1_chat",
        order: 1,
        when: ContextKeyExpr.and(SessionChatItemCanRenameContext, SessionChatItemIsUntitledContext.negate())
      }
    });
  }
  async run(accessor, context2) {
    if (!context2 || !getChatCapabilities(context2.chat, context2.session, void 0).canRename || context2.chat.status.get() === 0 /* Untitled */) {
      return;
    }
    const quickInputService = accessor.get(IQuickInputService);
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const currentTitle = context2.chat.title.get().trim() || localize(5391, null);
    const newTitle = await quickInputService.input({
      value: currentTitle,
      prompt: localize(5376, null),
      validateInput: async (value2) => value2.trim() ? void 0 : localize(5375, null)
    });
    const trimmedTitle = newTitle?.trim();
    if (trimmedTitle && trimmedTitle !== currentTitle) {
      await sessionsManagementService.renameChat(context2.session, context2.chat.resource, trimmedTitle);
    }
  }
});

registerAction2(class OpenSessionListChatToSideAction extends Action2 {
  constructor() {
    super({
      id: "sessions.list.openChatToSide",
      title: localize2(5369, "Open to the Side"),
      f1: false,
      menu: {
        id: Menus.SessionChatItemContext,
        group: "1_chat",
        order: 2
      }
    });
  }
  async run(accessor, context2) {
    if (!context2) {
      return;
    }
    const sessionsService = accessor.get(ISessionsService);
    if (!await sessionsService.canOpenSession(context2.session)) {
      return;
    }
    await sessionsService.openChatToSide(context2.session, context2.chat.resource);
  }
});

registerAction2(class DeleteSessionListChatAction extends Action2 {
  constructor() {
    super({
      id: "sessions.list.deleteChat",
      title: localize2(5350, "Delete Chat"),
      f1: false,
      menu: {
        id: Menus.SessionChatItemContext,
        group: "2_delete",
        order: 1,
        when: SessionChatItemCanDeleteContext
      }
    });
  }
  async run(accessor, context2) {
    if (!context2 || !getChatCapabilities(context2.chat, context2.session, void 0).canDelete) {
      return;
    }
    await accessor.get(ISessionsManagementService).deleteChat(context2.session, context2.chat.resource);
  }
});

var ADD_CHAT_TO_SESSION_ACTION_ID = "sessions.chatCompositeBar.addChat";

registerAction2(class AddChatToSessionAction extends Action2 {
  constructor() {
    super({
      id: ADD_CHAT_TO_SESSION_ACTION_ID,
      title: localize2(5334, "New Chat in This Session"),
      icon: Codicon.add,
      keybinding: {
        weight: CHAT_TAB_KEYBINDING_WEIGHT,
        // Like Cmd/Ctrl+T in a browser — opens a new chat tab within the
        // active session. Scoped so it does not steal the shortcut outside
        // the agents window or when the session does not support multiple chats.
        when: ContextKeyExpr.and(IsSessionsWindowContext, EditorAreaFocusContext.toNegated(), SessionIsCreatedContext, SessionSupportsMultipleChatsContext, IsQuickChatSessionContext.negate(), SessionIsArchivedContext.negate()),
        primary: 2048 /* CtrlCmd */ | 50 /* KeyT */
      },
      menu: [{
        id: Menus.SessionBarToolbar,
        // Keep New Chat visually separate from the Side Chats submenu.
        group: "secondary/3_newChat",
        order: 10,
        when: ContextKeyExpr.and(SessionIsCreatedContext, SessionSupportsMultipleChatsContext, IsQuickChatSessionContext.negate(), SessionIsArchivedContext.negate())
      }, {
        id: Menus.SessionItemContextMenu,
        group: "1_newChat",
        order: 0,
        when: ContextKeyExpr.and(SessionIsCreatedContext, SessionSupportsMultipleChatsContext, IsQuickChatSessionContext.negate(), SessionIsArchivedContext.negate())
      }]
    });
  }
  async run(accessor, context2) {
    const sessionsService = accessor.get(ISessionsService);
    const sessionsPartService = accessor.get(ISessionsPartService);
    const target = Array.isArray(context2) ? context2[0] : context2 ?? sessionsService.activeSession.get();
    if (!target) {
      return;
    }
    if (target.isQuickChat?.get()) {
      return;
    }
    await sessionsService.openNewChatInSession(target);
    const activeSession = sessionsService.activeSession.get();
    sessionsPartService.focusSession(activeSession?.sessionId === target.sessionId ? activeSession : void 0);
  }
});

function navigateChatTab(accessor, direction) {
  const sessionsService = accessor.get(ISessionsService);
  const sessionsPartService = accessor.get(ISessionsPartService);
  const extUri2 = accessor.get(IUriIdentityService).extUri;
  const session = sessionsService.activeSession.get();
  if (!session) {
    return;
  }
  const tabs = session.visibleChatTabs.get();
  if (tabs.length < 2) {
    return;
  }
  const activeChat = session.activeChat.get();
  const currentIndex = activeChat ? tabs.findIndex((chat) => extUri2.isEqual(chat.resource, activeChat.resource)) : -1;
  const from = currentIndex === -1 ? 0 : currentIndex;
  const delta2 = direction === "next" ? 1 : -1;
  const target = tabs[(from + delta2 + tabs.length) % tabs.length];
  sessionsService.openChat(session, target.resource);
  sessionsPartService.focusSession(session);
}

registerAction2(class NavigateNextChatAction extends Action2 {
  constructor() {
    super({
      id: "sessions.chatCompositeBar.navigateNextChat",
      title: localize2(5360, "Go to Next Chat"),
      f1: true,
      category: SessionsCategories.Sessions,
      precondition: SessionHasMultipleOpenChatsContext,
      keybinding: {
        weight: CHAT_TAB_KEYBINDING_WEIGHT,
        when: ContextKeyExpr.and(IsSessionsWindowContext, EditorAreaFocusContext.toNegated(), SessionHasMultipleOpenChatsContext),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 94 /* BracketRight */
      }
    });
  }
  run(accessor) {
    navigateChatTab(accessor, "next");
  }
});

registerAction2(class NavigatePreviousChatAction extends Action2 {
  constructor() {
    super({
      id: "sessions.chatCompositeBar.navigatePreviousChat",
      title: localize2(5361, "Go to Previous Chat"),
      f1: true,
      category: SessionsCategories.Sessions,
      precondition: SessionHasMultipleOpenChatsContext,
      keybinding: {
        weight: CHAT_TAB_KEYBINDING_WEIGHT,
        when: ContextKeyExpr.and(IsSessionsWindowContext, EditorAreaFocusContext.toNegated(), SessionHasMultipleOpenChatsContext),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 92 /* BracketLeft */
      }
    });
  }
  run(accessor) {
    navigateChatTab(accessor, "previous");
  }
});

registerAction2(class CloseChatAction extends Action2 {
  constructor() {
    super({
      id: CLOSE_CHAT_COMMAND_ID,
      title: localize2(5344, "Close Chat"),
      icon: Codicon.close,
      // Hidden from the palette: closing a specific chat is contextual (the
      // keybinding targets the active chat; the menu targets a tab).
      f1: false,
      category: SessionsCategories.Sessions,
      keybinding: {
        weight: CHAT_TAB_KEYBINDING_WEIGHT,
        // Intercept Ctrl/Cmd+W (which otherwise closes the session) only
        // while the active chat is a closeable non-main chat, so it closes
        // the chat tab instead — like closing a tab vs the window.
        when: ContextKeyExpr.and(IsSessionsWindowContext, EditorAreaFocusContext.toNegated(), SessionActiveChatIsClosableContext),
        primary: 2048 /* CtrlCmd */ | 53 /* KeyW */,
        win: { primary: 2048 /* CtrlCmd */ | 62 /* F4 */, secondary: [2048 /* CtrlCmd */ | 53 /* KeyW */] }
      },
      // Rendered as the tab's close button by the chat tab strip; the main
      // chat's tab does not render this menu, so no per-tab gating is needed.
      menu: {
        id: Menus.SessionChatTab,
        group: "navigation",
        order: 10
      }
    });
  }
  async run(accessor, context2) {
    const sessionsService = accessor.get(ISessionsService);
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const extUri2 = accessor.get(IUriIdentityService).extUri;
    const session = context2?.session ?? sessionsService.activeSession.get();
    if (!session) {
      return;
    }
    const chat = context2?.chat ?? session.activeChat.get();
    if (!chat || extUri2.isEqual(chat.resource, session.mainChat.get().resource)) {
      return;
    }
    if (chat.status.get() === 0 /* Untitled */) {
      await sessionsManagementService.deleteChat(session, chat.resource, { skipConfirmation: true });
    } else {
      await sessionsService.closeChat(session, chat);
    }
  }
});

registerAction2(class CloseAllChatsAction extends Action2 {
  constructor() {
    super({
      id: "sessions.chatCompositeBar.closeAllChats",
      title: localize2(5345, "Close All Chats"),
      f1: true,
      category: SessionsCategories.Sessions,
      // Enabled (palette + keybinding) only while the active session has more
      // than one open chat, so the chord targets the focused session and
      // stays inert for single-chat sessions.
      precondition: SessionHasMultipleOpenChatsContext,
      keybinding: {
        weight: CHAT_TAB_KEYBINDING_WEIGHT,
        when: ContextKeyExpr.and(
          IsSessionsWindowContext,
          // While a modal editor has focus, let VS Code's own
          // closeEditorsInGroup (same chord) act on the editor group.
          EditorAreaFocusContext.toNegated(),
          SessionHasMultipleOpenChatsContext
        ),
        // Mirror VS Code's "Close All Editors in Group" chord (Ctrl/Cmd+K W):
        // a session is the Agents-window analogue of an editor group. Note
        // "Close All Sessions" already owns Ctrl/Cmd+K Ctrl/Cmd+W.
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 53 /* KeyW */)
      }
    });
  }
  async run(accessor) {
    const sessionsService = accessor.get(ISessionsService);
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const extUri2 = accessor.get(IUriIdentityService).extUri;
    const session = sessionsService.activeSession.get();
    if (!session) {
      return;
    }
    const mainResource = session.mainChat.get().resource;
    const chatsToClose = session.openChats.get().filter((chat) => !extUri2.isEqual(chat.resource, mainResource));
    for (const chat of chatsToClose) {
      if (chat.status.get() === 0 /* Untitled */) {
        await sessionsManagementService.deleteChat(session, chat.resource, { skipConfirmation: true });
      } else {
        await sessionsService.closeChat(session, chat, { skipHistory: true });
      }
    }
  }
});

registerAction2(class DeleteChatAction extends Action2 {
  constructor() {
    super({
      id: "sessions.chatCompositeBar.deleteChat",
      title: localize2(5349, "Delete Chat"),
      f1: true,
      category: SessionsCategories.Sessions,
      keybinding: {
        weight: CHAT_TAB_KEYBINDING_WEIGHT,
        // Delete / Cmd+Backspace (Mac) — mirrors the file-delete keybinding
        // in the Explorer. Scoped so it never fires while typing in an input
        // (chat composer, rename field, etc.) or on the session's main chat.
        when: ContextKeyExpr.and(IsSessionsWindowContext, SessionsFocusContext, EditorAreaFocusContext.toNegated(), InputFocusedContext.toNegated(), SessionActiveChatIsDeletableContext),
        primary: 20 /* Delete */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
          secondary: [20 /* Delete */]
        }
      }
    });
  }
  async run(accessor) {
    const sessionsService = accessor.get(ISessionsService);
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const session = sessionsService.activeSession.get();
    if (!session) {
      return;
    }
    const chat = session.activeChat.get();
    if (!chat || !getChatCapabilities(chat, session, void 0).canDelete) {
      return;
    }
    await sessionsManagementService.deleteChat(session, chat.resource);
  }
});

registerAction2(class ReopenLastClosedChatAction extends Action2 {
  constructor() {
    super({
      id: "sessions.chatCompositeBar.reopenLastClosedChat",
      title: localize2(5339, "Reopen Last Closed Chat"),
      f1: true,
      category: SessionsCategories.Sessions,
      precondition: SessionSupportsMultipleChatsContext
    });
  }
  async run(accessor) {
    const sessionsService = accessor.get(ISessionsService);
    const sessionsPartService = accessor.get(ISessionsPartService);
    const session = sessionsService.activeSession.get();
    if (!session) {
      return;
    }
    const lastClosed = session.lastClosedChat;
    if (!lastClosed) {
      return;
    }
    await sessionsService.openChat(session, lastClosed.resource);
    sessionsPartService.focusSession(session);
  }
});

registerAction2(class ReopenLastClosedItemAction extends Action2 {
  constructor() {
    super({
      id: "sessions.reopenLastClosedItem",
      title: localize2(5378, "Reopen Closed Chat or Session"),
      category: SessionsCategories.Sessions,
      keybinding: {
        weight: CHAT_TAB_KEYBINDING_WEIGHT,
        // Like Ctrl/Cmd+Shift+T in a browser. Outside the editor scope the
        // chord always belongs to the sessions area (it is a no-op when
        // nothing was closed); inside it, VS Code's own Reopen Closed
        // Editor takes over.
        when: ContextKeyExpr.and(IsSessionsWindowContext, SessionsEditorScopeContext.negate()),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 50 /* KeyT */
      },
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(IsSessionsWindowContext, SessionsHasClosedItemContext)
      }
    });
  }
  async run(accessor) {
    await accessor.get(ISessionsService).reopenLastClosedItem();
  }
});

var SHOW_CHATS_PICKER_COMMAND_ID = "sessions.showChatsPicker";

var QUICK_SWITCH_NEXT_CHAT_ID = "sessions.quickSwitchNextChat";

var QUICK_SWITCH_PREVIOUS_CHAT_ID = "sessions.quickSwitchPreviousChat";

var CHATS_PICKER_QUICK_NAVIGATE_NEXT_ID = "sessions.chatsPicker.quickNavigateNext";

var CHATS_PICKER_QUICK_NAVIGATE_PREVIOUS_ID = "sessions.chatsPicker.quickNavigatePrevious";

var ChatsPickerScopeContext = ContextKeyExpr.and(IsSessionsWindowContext, EditorAreaFocusContext.toNegated(), SessionHasMultipleOpenChatsContext, inQuickPickContext.negate());

function openChatsPicker(accessor, mru) {
  const sessionsService = accessor.get(ISessionsService);
  const quickInputService = accessor.get(IQuickInputService);
  const sessionsPartService = accessor.get(ISessionsPartService);
  const contextKeyService = accessor.get(IContextKeyService);
  const keybindingService = accessor.get(IKeybindingService);
  const session = sessionsService.activeSession.get();
  if (!session) {
    return;
  }
  const extUri2 = accessor.get(IUriIdentityService).extUri;
  const toItem = (chat) => ({
    label: chat.title.get()?.trim() || localize(5391, null),
    description: fromNow(chat.updatedAt.get(), true, true),
    iconClass: ThemeIcon.asClassName(Codicon.commentDiscussion),
    chat
  });
  const openItems = (mru ? session.visibleChatTabs.get() : session.visibleChatTabs.get().filter((chat) => chat.status.get() !== 0 /* Untitled */)).map(toItem);
  const closedItems = mru ? [] : session.closedChats.get().filter((chat) => chat.status.get() !== 0 /* Untitled */ && chat.origin?.kind !== "tool" /* Tool */).map(toItem);
  const pickItems = [...openItems, ...closedItems];
  if (pickItems.length === 0) {
    return;
  }
  const displayItems = closedItems.length === 0 ? openItems : [
    { type: "separator", label: localize(5368, null) },
    ...openItems,
    { type: "separator", label: localize(5347, null) },
    ...closedItems
  ];
  const activeChat = session.activeChat.get();
  const activeIndex = Math.max(0, activeChat ? pickItems.findIndex((item) => extUri2.isEqual(item.chat.resource, activeChat.resource)) : -1);
  const startIndex = mru ? (activeIndex + (mru.backward ? -1 : 1) + pickItems.length) % pickItems.length : activeIndex;
  const disposables = new DisposableStore();
  const picker = disposables.add(quickInputService.createQuickPick({ useSeparators: true }));
  picker.items = displayItems;
  picker.activeItems = [pickItems[startIndex]];
  if (mru) {
    picker.hideInput = true;
    picker.quickNavigate = { keybindings: keybindingService.lookupKeybindings(CHATS_PICKER_QUICK_NAVIGATE_NEXT_ID) };
  } else {
    picker.placeholder = localize(5379, null);
    picker.matchOnDescription = true;
  }
  const pickerVisibleContext = SessionChatsPickerVisibleContext.bindTo(contextKeyService);
  pickerVisibleContext.set(true);
  disposables.add(toDisposable(() => pickerVisibleContext.reset()));
  disposables.add(picker.onDidAccept(() => {
    const [selected] = picker.selectedItems;
    if (selected) {
      sessionsService.openChat(session, selected.chat.resource);
      sessionsPartService.focusSession(session);
    }
    picker.hide();
  }));
  disposables.add(picker.onDidHide(() => disposables.dispose()));
  picker.show();
}

registerAction2(class ShowChatsPickerAction extends Action2 {
  constructor() {
    super({
      id: SHOW_CHATS_PICKER_COMMAND_ID,
      title: localize2(5387, "Go to Chat in Session"),
      f1: true,
      category: SessionsCategories.Sessions,
      precondition: SessionHasMultipleCommittedChatsContext,
      keybinding: {
        weight: 250 /* SessionsContrib */,
        when: ContextKeyExpr.and(IsSessionsWindowContext, EditorAreaFocusContext.toNegated(), inQuickPickContext.negate()),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 45 /* KeyO */
      }
    });
  }
  run(accessor) {
    openChatsPicker(accessor);
  }
});

registerAction2(class QuickSwitchNextChatAction extends Action2 {
  constructor() {
    super({
      id: QUICK_SWITCH_NEXT_CHAT_ID,
      title: localize2(5371, "Quick Switch to Next Chat"),
      f1: false,
      category: SessionsCategories.Sessions,
      precondition: SessionHasMultipleOpenChatsContext,
      keybinding: {
        weight: 250 /* SessionsContrib */ + 1,
        when: ChatsPickerScopeContext,
        primary: 2048 /* CtrlCmd */ | 2 /* Tab */,
        mac: { primary: 256 /* WinCtrl */ | 2 /* Tab */ }
      }
    });
  }
  run(accessor) {
    openChatsPicker(accessor, { backward: false });
  }
});

registerAction2(class QuickSwitchPreviousChatAction extends Action2 {
  constructor() {
    super({
      id: QUICK_SWITCH_PREVIOUS_CHAT_ID,
      title: localize2(5372, "Quick Switch to Previous Chat"),
      f1: false,
      category: SessionsCategories.Sessions,
      precondition: SessionHasMultipleOpenChatsContext,
      keybinding: {
        weight: 250 /* SessionsContrib */ + 1,
        when: ChatsPickerScopeContext,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 2 /* Tab */,
        mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 2 /* Tab */ }
      }
    });
  }
  run(accessor) {
    openChatsPicker(accessor, { backward: true });
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: CHATS_PICKER_QUICK_NAVIGATE_NEXT_ID,
  weight: 250 /* SessionsContrib */ + 50,
  handler: getQuickNavigateHandler(CHATS_PICKER_QUICK_NAVIGATE_NEXT_ID, true),
  when: SessionChatsPickerVisibleContext,
  primary: 2048 /* CtrlCmd */ | 2 /* Tab */,
  mac: { primary: 256 /* WinCtrl */ | 2 /* Tab */ }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: CHATS_PICKER_QUICK_NAVIGATE_PREVIOUS_ID,
  weight: 250 /* SessionsContrib */ + 50,
  handler: getQuickNavigateHandler(CHATS_PICKER_QUICK_NAVIGATE_PREVIOUS_ID, false),
  when: SessionChatsPickerVisibleContext,
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 2 /* Tab */,
  mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 2 /* Tab */ }
});

var CompactButtonActionViewItem = class extends BaseActionViewItem {
  constructor(action, keybindingService, hoverService, contextKeyService) {
    super(void 0, action);
    this.keybindingService = keybindingService;
    this.hoverService = hoverService;
    this.contextKeyService = contextKeyService;
  }
  /** Optional onboarding spotlight target id for the pill. */
  get onboardingTargetId() {
    return void 0;
  }
  /** Whether to render the trailing keybinding hint chip in the label. */
  get showKeybindingHint() {
    return true;
  }
  /** Hook invoked right before the action runs (e.g. for telemetry). */
  onRun() {
  }
  render(container2) {
    super.render(container2);
    if (!this.element) {
      return;
    }
    const button = this._register(new Button(this.element, {
      ...defaultButtonStyles,
      buttonSecondaryBackground: asCssVariable(agentsNewSessionButtonBackground),
      buttonSecondaryForeground: asCssVariable(agentsNewSessionButtonForeground),
      buttonSecondaryHoverBackground: asCssVariable(agentsNewSessionButtonHoverBackground),
      buttonSecondaryBorder: asCssVariable(agentsNewSessionButtonBorder),
      secondary: true,
      supportIcons: true
    }));
    button.element.classList.add("agent-sessions-compact-new-button");
    const onboardingTargetId = this.onboardingTargetId;
    if (onboardingTargetId) {
      this._register(markOnboardingTarget(button.element, onboardingTargetId));
    }
    this._register(button.onDidClick((e4) => {
      EventHelper.stop(e4, true);
      if (!this.action.enabled) {
        return;
      }
      this.onRun();
      this.actionRunner.run(this.action, this._context);
    }));
    const buttonLabel = $("span.new-session-button-label", void 0, this.label);
    const keybindingHint = $("span.new-session-keybinding-hint");
    const keybindingHintLabel = this.showKeybindingHint ? this._register(new KeybindingLabel(keybindingHint, OS, {
      disableTitle: true,
      keybindingLabelBackground: "transparent",
      keybindingLabelForeground: "inherit",
      keybindingLabelBorder: "transparent",
      keybindingLabelBottomBorder: void 0,
      keybindingLabelShadow: void 0
    })) : void 0;
    reset(button.element, buttonLabel);
    const getKeybinding = () => {
      const primaryKeybinding = this.keybindingService.lookupKeybinding(this.commandId, this.contextKeyService, true);
      const resolvedKeybindings = this.keybindingService.lookupKeybindings(this.commandId);
      return primaryKeybinding ?? resolvedKeybindings[0];
    };
    this._register(this.hoverService.setupDelayedHover(button.element, () => ({
      content: this.getHoverContent(getKeybinding()?.getLabel() ?? void 0),
      appearance: { compact: true },
      position: { hoverPosition: 2 /* BELOW */ }
    })));
    let lastRenderedKeybindingLabel = null;
    let lastRenderedKeybindingAriaLabel = null;
    const updateButton = () => {
      const keybinding = getKeybinding();
      const keybindingLabel2 = keybinding?.getLabel() ?? void 0;
      const keybindingAriaLabel = keybinding?.getAriaLabel() ?? void 0;
      if (lastRenderedKeybindingLabel === keybindingLabel2 && lastRenderedKeybindingAriaLabel === keybindingAriaLabel) {
        return;
      }
      lastRenderedKeybindingLabel = keybindingLabel2;
      lastRenderedKeybindingAriaLabel = keybindingAriaLabel;
      keybindingHintLabel?.set(keybinding);
      if (keybindingHintLabel && keybinding) {
        if (keybindingHint.parentElement !== button.element) {
          append(button.element, keybindingHint);
        }
      } else {
        keybindingHint.remove();
      }
      button.element.setAttribute("aria-label", this.getAriaLabel(keybindingAriaLabel));
    };
    this._register(Event2.runAndSubscribe(this.keybindingService.onDidUpdateKeybindings, updateButton));
  }
};

CompactButtonActionViewItem = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IHoverService),
  __decorateParam(3, IContextKeyService)
], CompactButtonActionViewItem);

var NewSessionActionViewItem = class extends CompactButtonActionViewItem {
  constructor(action, telemetrySource, keybindingService, hoverService, telemetryService, contextKeyService) {
    super(action, keybindingService, hoverService, contextKeyService);
    this.telemetrySource = telemetrySource;
    this.telemetryService = telemetryService;
  }
  get commandId() {
    return NEW_SESSION_ACTION_ID;
  }
  get label() {
    return localize(5362, null);
  }
  get onboardingTargetId() {
    return "sessions.newSession.button";
  }
  getHoverContent(keybindingLabel2) {
    return keybindingLabel2 ? localize(5366, null, keybindingLabel2) : localize(5367, null);
  }
  getAriaLabel(keybindingAriaLabel) {
    return keybindingAriaLabel ? localize(5364, null, keybindingAriaLabel) : localize(5365, null);
  }
  onRun() {
    logSessionsInteraction(this.telemetryService, "newSession", this.telemetrySource);
  }
};

NewSessionActionViewItem = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IContextKeyService)
], NewSessionActionViewItem);

var NewSessionActionViewItemContribution = class extends Disposable {
  constructor(actionViewItemService, contextKeyService, assignmentService, environmentService) {
    super();
    this.assignmentService = assignmentService;
    this.environmentService = environmentService;
    this.titleBarEnabledContext = SessionsTitleBarNewSessionEnabledContext.bindTo(contextKeyService);
    const onDidRegister = this._register(new Emitter());
    const menus = [Menus.SidebarSessionsHeader, Menus.TitleBarLeftLayout];
    for (const menu of menus) {
      const source = menu === Menus.TitleBarLeftLayout ? "titleBar" : "sidebar";
      this._register(actionViewItemService.register(menu, NEW_SESSION_ACTION_ID, (action, _options, instantiationService) => {
        if (!(action instanceof MenuItemAction)) {
          return void 0;
        }
        return instantiationService.createInstance(NewSessionActionViewItem, action, source);
      }, onDidRegister.event));
    }
    onDidRegister.fire();
    this._register(this.assignmentService.onDidRefetchAssignments(() => this.updateTitleBarTreatment()));
    this.updateTitleBarTreatment();
  }
  static {
    this.ID = "workbench.contrib.sessions.newSessionActionViewItem";
  }
  static {
    /** ExP treatment that shows the new-session button in the titlebar. */
    this.NEW_SESSION_TITLEBAR_TREATMENT = "agentSessionsTitleBarNewSession";
  }
  async updateTitleBarTreatment() {
    if (!this.environmentService.isBuilt) {
      this.titleBarEnabledContext.set(true);
      return;
    }
    const enabled = await this.assignmentService.getTreatment(NewSessionActionViewItemContribution.NEW_SESSION_TITLEBAR_TREATMENT);
    this.titleBarEnabledContext.set(enabled === true);
  }
};

NewSessionActionViewItemContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IWorkbenchAssignmentService),
  __decorateParam(3, IEnvironmentService)
], NewSessionActionViewItemContribution);

var SessionConversationActionsContribution = class extends Disposable {
  constructor(_sessionsService, _uriIdentityService) {
    super();
    this._sessionsService = _sessionsService;
    this._uriIdentityService = _uriIdentityService;
    this._register(autorun((reader) => {
      for (const session of this._sessionsService.visibleSessions.read(reader)) {
        if (session) {
          reader.store.add(this._registerSessionConversationActions(session, reader));
        }
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.sessions.conversationActions";
  }
  _registerSessionConversationActions(session, reader) {
    const store = new DisposableStore();
    const that = this;
    const extUri2 = this._uriIdentityService.extUri;
    const scopedToSession = ContextKeyExpr.equals(SessionIdContext.key, session.sessionId);
    const conversationsVisible = ContextKeyExpr.and(
      scopedToSession,
      SessionIsCreatedContext,
      SessionIsArchivedContext.negate(),
      SessionHasSideChatsContext
    );
    const allChats = session.chats.read(reader);
    const registerOpen = (chat, order) => {
      const chatResource = chat.resource;
      const title = chat.title.read(reader) || localize(5391, null);
      store.add(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: getSessionConversationActionId(session.sessionId, chatResource),
            title,
            menu: { id: Menus.SessionConversations, group: SESSION_CONVERSATION_SIDE_CHATS_GROUP, order, when: conversationsVisible }
          });
        }
        async run(accessor, forwardedSession) {
          const target = forwardedSession ?? session;
          const targetChat = target.chats.get().find((c) => extUri2.isEqual(c.resource, chatResource));
          if (!targetChat) {
            return;
          }
          if (ModifierKeyEmitter.getInstance().keyStatus.altKey) {
            const view = accessor.get(ISessionsPartService).getSessionView(target.sessionId);
            if (view) {
              await view.openChatToSide(targetChat.resource);
              return;
            }
          }
          await that._sessionsService.openChat(target, targetChat.resource);
        }
      }));
    };
    allChats.forEach((chat, index2) => {
      if (chat.status.read(reader) === 0 /* Untitled */) {
        return;
      }
      if (isSessionConversationSideChat(chat)) {
        registerOpen(chat, index2);
      }
    });
    return store;
  }
};

SessionConversationActionsContribution = __decorateClass([
  __decorateParam(0, ISessionsService),
  __decorateParam(1, IUriIdentityService)
], SessionConversationActionsContribution);

MenuRegistry.appendMenuItem(Menus.SessionBarToolbar, {
  submenu: Menus.SessionConversations,
  title: localize2(5340, "Side Chats"),
  icon: Codicon.commentDiscussion,
  group: "secondary/2_chats",
  order: 10,
  when: ContextKeyExpr.and(
    SessionIsCreatedContext,
    SessionIsArchivedContext.negate(),
    SessionHasSideChatsContext
  )
});

registerAction2(class TogglePinSessionAction extends Action2 {
  constructor() {
    super({
      id: "sessions.chatCompositeBar.togglePin",
      title: localize2(5337, "Pin"),
      icon: Codicon.pin,
      toggled: {
        condition: SessionIsStickyContext,
        icon: Codicon.pinned,
        title: localize(5342, null)
      },
      menu: {
        id: Menus.SessionBarToolbar,
        group: "secondary/4_pin",
        order: 10,
        when: ContextKeyExpr.and(SessionIsCreatedContext, SessionIsArchivedContext.negate())
      }
    });
  }
  async run(accessor, session) {
    if (!session) {
      return;
    }
    accessor.get(ISessionsService).toggleSessionStickiness(session);
  }
});

MenuRegistry.appendMenuItem(Menus.SessionHeaderContext, {
  command: {
    id: "sessions.chatCompositeBar.togglePin",
    title: localize(5338, null),
    toggled: {
      condition: SessionIsStickyContext,
      title: localize(5343, null)
    }
  },
  group: "1_view",
  order: 1,
  when: SessionIsCreatedContext
});

registerAction2(class RenameSessionHeaderAction extends Action2 {
  constructor() {
    super({
      id: "sessions.sessionHeader.rename",
      title: localize2(5377, "Rename..."),
      icon: Codicon.edit,
      menu: [{
        id: Menus.SessionHeaderContext,
        group: "2_edit",
        order: 1,
        when: ContextKeyExpr.regex(SessionProviderIdContext.key, ANY_AGENT_HOST_PROVIDER_RE)
      }, {
        id: Menus.SessionBarToolbar,
        group: "secondary/1_session",
        order: 20,
        when: ContextKeyExpr.and(SessionIsCreatedContext, SessionSupportsRenameContext, SessionIsArchivedContext.negate())
      }]
    });
  }
  async run(accessor, session) {
    if (!session) {
      return;
    }
    if (accessor.get(ISessionsPartService).getSessionView(session.sessionId)?.startTitleEditing()) {
      return;
    }
    await accessor.get(ICommandService).executeCommand(RENAME_SESSION_COMMAND_ID, session);
  }
});

registerAction2(class CloseSessionAction extends Action2 {
  constructor() {
    super({
      id: "sessions.chatCompositeBar.close",
      title: localize2(5335, "Close"),
      icon: Codicon.close,
      menu: [{
        id: Menus.SessionBarToolbar,
        when: ContextKeyExpr.or(SessionIsCreatedContext, MultipleSessionsVisibleContext),
        group: "secondary/4_pin",
        order: 30
      }, {
        id: Menus.SessionHeaderContext,
        when: ContextKeyExpr.or(SessionIsCreatedContext, MultipleSessionsVisibleContext),
        group: "1_view",
        order: 2
      }]
    });
  }
  async run(accessor, session) {
    const sessionsService = accessor.get(ISessionsService);
    const sessionsPartService = accessor.get(ISessionsPartService);
    sessionsService.closeSession(session);
    sessionsPartService.focusSession(sessionsService.activeSession.get());
  }
});

registerAction2(class ToggleMaximizeSessionViewAction extends Action2 {
  constructor() {
    super({
      id: "sessions.chatCompositeBar.toggleMaximize",
      title: localize2(5336, "Maximize"),
      icon: Codicon.screenFull,
      toggled: {
        condition: SessionIsMaximizedContext,
        icon: Codicon.screenNormal,
        title: localize(5341, null)
      },
      menu: {
        id: Menus.SessionBarToolbar,
        when: MultipleSessionsVisibleContext,
        group: "secondary/4_pin",
        order: 20
      }
    });
  }
  async run(accessor, session) {
    accessor.get(ISessionsPartService).toggleMaximizeSession(session);
    accessor.get(ISessionsService).setActive(session);
  }
});

registerAction2(class CloseEditorAreaAction extends Action2 {
  constructor() {
    super({
      id: "sessions.closeEditorArea",
      title: localize2(5348, "Close Editor Area"),
      icon: Codicon.close,
      category: SessionsCategories.Sessions,
      menu: {
        id: MenuId.EditorGroupWatermarkToolbar,
        group: "navigation",
        order: 10,
        when: IsSessionsWindowContext
      }
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    layoutService.setPartHidden(true, "workbench.parts.editor" /* EDITOR_PART */);
  }
});
export { withActiveSessionView, navigateChatTab, openChatsPicker, SHOW_SESSIONS_PICKER_COMMAND_ID, SESSIONS_PICKER_NAVIGATE_NEXT_ID, SESSIONS_PICKER_NAVIGATE_PREVIOUS_ID, CHAT_TAB_KEYBINDING_WEIGHT, ADD_CHAT_TO_SESSION_ACTION_ID, SHOW_CHATS_PICKER_COMMAND_ID, QUICK_SWITCH_NEXT_CHAT_ID, QUICK_SWITCH_PREVIOUS_CHAT_ID, CHATS_PICKER_QUICK_NAVIGATE_NEXT_ID, CHATS_PICKER_QUICK_NAVIGATE_PREVIOUS_ID, ChatsPickerScopeContext, CompactButtonActionViewItem, NewSessionActionViewItem, NewSessionActionViewItemContribution, SessionConversationActionsContribution };
