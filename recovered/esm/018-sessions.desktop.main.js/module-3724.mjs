// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/views/sessionsViewActions.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IsNewChatSessionContext, SessionIsArchivedContext, SessionIsCreatedContext, SessionIsReadContext, SessionSupportsDeleteContext, SessionSupportsRenameContext } from "./module-1770.mjs";
import { EditorAreaFocusContext, EditorsVisibleContext, FocusedViewContext, IsSessionsWindowContext } from "./module-0950.mjs";
import { SessionsCategories } from "./module-3532.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IsWorkspaceGroupCappedContext, SessionsViewFilterOptionsSubMenu, SessionsViewFilterSubMenu, SessionsViewGroupingContext, SessionsViewId, SessionsViewSortingContext } from "./module-3529.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { Menus } from "./module-3437.mjs";
import { Codicon } from "./module-0085.mjs";
import { registerExternalSessionsFilterMenu } from "./module-2563.mjs";
import { IsSessionPinnedContext, NEW_SESSION_FOR_WORKSPACE_ACTION_ID, SessionGroupHasVisibleSessionsContext, SessionGroupIsEmptyContext, SessionGroupToolbarMenuId, SessionItemContextMenuId, SessionItemToolbarMenuId, SessionSectionHasNonCloudRepositoryContext, SessionSectionToolbarMenuId, SessionSectionTypeContext } from "./module-3523.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { isMobile, isWeb } from "./module-0014.mjs";
import { CLOSE_MOBILE_SIDEBAR_DRAWER_COMMAND_ID } from "./module-3474.mjs";
import { AGENT_HOST_ENABLED_CONTEXT_KEY } from "./module-0964.mjs";
import { KeyChord } from "./module-0019.mjs";
import { ChatSessionArchiveActionWordingSettingId, getChatSessionArchiveActionPresentation, getChatSessionArchiveActionWording } from "./module-2468.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ISessionGroupsService } from "./module-3518.mjs";
import { ARCHIVE_SESSION_COMMAND_ID, MARK_SESSION_READ_COMMAND_ID, MARK_SESSION_UNREAD_COMMAND_ID, RENAME_SESSION_COMMAND_ID, UNARCHIVE_SESSION_COMMAND_ID } from "./module-1800.mjs";
import { WorkbenchListFocusContextKey } from "./module-0636.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { ICustomViewService } from "./module-1776.mjs";
import { AUTOMATIONS_CUSTOM_VIEW_ID } from "./module-3522.mjs";
import { IAutomationService } from "./module-2218.mjs";


// src/vs/sessions/contrib/sessions/browser/views/sessionsViewActions.ts
var CLOSE_SESSION_COMMAND_ID = "sessionsViewPane.closeSession";

registerAction2(class CloseSessionAction2 extends Action2 {
  constructor() {
    super({
      id: CLOSE_SESSION_COMMAND_ID,
      title: localize2(5571, "Close Session"),
      f1: true,
      precondition: ContextKeyExpr.and(IsNewChatSessionContext.negate(), EditorsVisibleContext.negate()),
      category: SessionsCategories.Sessions
    });
  }
  async run(accessor) {
    const sessionsService = accessor.get(ISessionsService);
    sessionsService.openNewSession();
  }
});

KeybindingsRegistry.registerKeybindingRule({
  id: CLOSE_SESSION_COMMAND_ID,
  weight: 250 /* SessionsContrib */,
  when: ContextKeyExpr.and(IsNewChatSessionContext.negate(), EditorsVisibleContext.negate()),
  primary: 2048 /* CtrlCmd */ | 53 /* KeyW */,
  win: { primary: 2048 /* CtrlCmd */ | 62 /* F4 */, secondary: [2048 /* CtrlCmd */ | 53 /* KeyW */] }
});

var OPEN_SESSION_AT_INDEX_COMMAND_ID = "sessionsViewPane.openSessionAtIndex";

function digitToKeyCode(digit) {
  switch (digit) {
    case 1:
      return 22 /* Digit1 */;
    case 2:
      return 23 /* Digit2 */;
    case 3:
      return 24 /* Digit3 */;
    case 4:
      return 25 /* Digit4 */;
    case 5:
      return 26 /* Digit5 */;
    case 6:
      return 27 /* Digit6 */;
    case 7:
      return 28 /* Digit7 */;
    case 8:
      return 29 /* Digit8 */;
    case 9:
      return 30 /* Digit9 */;
    default:
      return 0 /* Unknown */;
  }
}

var openSessionAtIndex = async (accessor, sessionIndex) => {
  if (typeof sessionIndex !== "number") {
    return;
  }
  const viewsService = accessor.get(IViewsService);
  const sessionsService = accessor.get(ISessionsService);
  const view = viewsService.getViewWithId(SessionsViewId);
  const visible = view?.sessionsControl?.getVisibleSessions() ?? [];
  if (visible.length === 0) {
    return;
  }
  const target = sessionIndex === -1 ? visible[visible.length - 1] : visible[sessionIndex];
  if (!target) {
    return;
  }
  if (await sessionsService.canOpenSession(target)) {
    await sessionsService.openChat(target, target.mainChat.get().resource, { source: "sessionsList" });
  }
};

CommandsRegistry.registerCommand({
  id: OPEN_SESSION_AT_INDEX_COMMAND_ID,
  handler: openSessionAtIndex
});

for (let visibleIndex = 1; visibleIndex <= 9; visibleIndex++) {
  const sessionIndex = visibleIndex === 9 ? -1 : visibleIndex - 1;
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: OPEN_SESSION_AT_INDEX_COMMAND_ID + visibleIndex,
    weight: 250 /* SessionsContrib */,
    when: IsSessionsWindowContext,
    primary: 512 /* Alt */ | digitToKeyCode(visibleIndex),
    mac: { primary: 256 /* WinCtrl */ | digitToKeyCode(visibleIndex) },
    handler: (accessor) => openSessionAtIndex(accessor, sessionIndex)
  });
}

var navigateSessionInList = async (accessor, direction) => {
  const viewsService = accessor.get(IViewsService);
  const sessionsService = accessor.get(ISessionsService);
  const view = viewsService.getViewWithId(SessionsViewId);
  const visible = view?.sessionsControl?.getVisibleSessions() ?? [];
  if (visible.length === 0) {
    return;
  }
  const activeResource = sessionsService.activeSession.get()?.resource.toString();
  const currentIndex = activeResource === void 0 ? -1 : visible.findIndex((session) => session.resource.toString() === activeResource);
  let targetIndex;
  if (currentIndex === -1) {
    targetIndex = direction === "next" ? 0 : visible.length - 1;
  } else {
    targetIndex = direction === "next" ? Math.min(currentIndex + 1, visible.length - 1) : Math.max(currentIndex - 1, 0);
  }
  if (targetIndex === currentIndex) {
    return;
  }
  const target = visible[targetIndex];
  if (target) {
    if (await sessionsService.canOpenSession(target)) {
      await sessionsService.openChat(target, target.mainChat.get().resource, { source: "navigation" });
    }
  }
};

registerAction2(class NavigatePreviousSessionAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.navigatePreviousSession",
      title: {
        value: localize(5602, null),
        original: "Go to Previous Session",
        mnemonicTitle: localize(5603, null)
      },
      f1: true,
      category: SessionsCategories.Sessions,
      keybinding: {
        // Mirror core "Previous Editor"; keep Alt+Up as a sessions-only alternate outside the editor area.
        weight: 250 /* SessionsContrib */,
        when: ContextKeyExpr.and(IsSessionsWindowContext, EditorAreaFocusContext.toNegated()),
        primary: 2048 /* CtrlCmd */ | 11 /* PageUp */,
        secondary: [512 /* Alt */ | 16 /* UpArrow */],
        mac: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 15 /* LeftArrow */,
          secondary: [512 /* Alt */ | 16 /* UpArrow */]
        }
      },
      menu: [{
        id: Menus.GoMenu,
        group: "2_list_nav",
        order: 1
      }]
    });
  }
  run(accessor) {
    return navigateSessionInList(accessor, "previous");
  }
});

registerAction2(class NavigateNextSessionAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.navigateNextSession",
      title: {
        value: localize(5600, null),
        original: "Go to Next Session",
        mnemonicTitle: localize(5601, null)
      },
      f1: true,
      category: SessionsCategories.Sessions,
      keybinding: {
        // Mirror core "Next Editor"; keep Alt+Down as a sessions-only alternate outside the editor area.
        weight: 250 /* SessionsContrib */,
        when: ContextKeyExpr.and(IsSessionsWindowContext, EditorAreaFocusContext.toNegated()),
        primary: 2048 /* CtrlCmd */ | 12 /* PageDown */,
        secondary: [512 /* Alt */ | 18 /* DownArrow */],
        mac: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 17 /* RightArrow */,
          secondary: [512 /* Alt */ | 18 /* DownArrow */]
        }
      },
      menu: [{
        id: Menus.GoMenu,
        group: "2_list_nav",
        order: 2
      }]
    });
  }
  run(accessor) {
    return navigateSessionInList(accessor, "next");
  }
});

MenuRegistry.appendMenuItem(Menus.SidebarSessionsHeader, {
  submenu: SessionsViewFilterSubMenu,
  title: localize2(5583, "Filter Sessions"),
  icon: Codicon.settings,
  group: "navigation",
  order: 10
});

MenuRegistry.appendMenuItem(Menus.SidebarSessionsHeader, {
  command: {
    id: "sessionsViewPane.find",
    title: localize2(5584, "Find Session"),
    icon: Codicon.search
  },
  group: "navigation",
  order: 20
});

MenuRegistry.appendMenuItem(SessionsViewFilterSubMenu, {
  submenu: SessionsViewFilterOptionsSubMenu,
  title: localize2(5582, "Filter"),
  group: "0_filter",
  order: 0
});

registerExternalSessionsFilterMenu(SessionsViewFilterOptionsSubMenu, Menus.SessionsViewExternalFilter, "2_external");

registerAction2(class SortByCreatedAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.sortByCreated",
      title: localize2(5615, "Sort by Created"),
      category: SessionsCategories.Sessions,
      toggled: ContextKeyExpr.equals(SessionsViewSortingContext.key, "created" /* Created */),
      menu: [{ id: SessionsViewFilterSubMenu, group: "1_sort", order: 0 }]
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    view?.setSorting("created" /* Created */);
  }
});

registerAction2(class SortByUpdatedAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.sortByUpdated",
      title: localize2(5616, "Sort by Updated"),
      category: SessionsCategories.Sessions,
      toggled: ContextKeyExpr.equals(SessionsViewSortingContext.key, "updated" /* Updated */),
      menu: [{ id: SessionsViewFilterSubMenu, group: "1_sort", order: 1 }]
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    view?.setSorting("updated" /* Updated */);
  }
});

registerAction2(class GroupByWorkspaceAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.groupByWorkspace",
      title: localize2(5586, "Group by Workspace"),
      category: SessionsCategories.Sessions,
      toggled: ContextKeyExpr.equals(SessionsViewGroupingContext.key, "workspace" /* Workspace */),
      menu: [{ id: SessionsViewFilterSubMenu, group: "2_group", order: 0 }]
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    view?.setGrouping("workspace" /* Workspace */);
  }
});

registerAction2(class GroupByTimeAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.groupByTime",
      title: localize2(5585, "Group by Time"),
      category: SessionsCategories.Sessions,
      toggled: ContextKeyExpr.equals(SessionsViewGroupingContext.key, "date" /* Date */),
      menu: [{ id: SessionsViewFilterSubMenu, group: "2_group", order: 1 }]
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    view?.setGrouping("date" /* Date */);
  }
});

registerAction2(class ShowRecentWorkspaceSessionsAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.showRecentSessions",
      title: localize2(5614, "Show Recent Sessions"),
      category: SessionsCategories.Sessions,
      toggled: IsWorkspaceGroupCappedContext,
      menu: [{
        id: SessionsViewFilterSubMenu,
        group: "3_cap",
        order: 0,
        when: ContextKeyExpr.equals(SessionsViewGroupingContext.key, "workspace" /* Workspace */)
      }]
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    view?.sessionsControl?.setWorkspaceGroupCapped(true);
    IsWorkspaceGroupCappedContext.bindTo(accessor.get(IContextKeyService)).set(true);
  }
});

registerAction2(class ShowAllWorkspaceSessionsAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.showAllSessions",
      title: localize2(5613, "Show All Sessions"),
      category: SessionsCategories.Sessions,
      toggled: IsWorkspaceGroupCappedContext.negate(),
      menu: [{
        id: SessionsViewFilterSubMenu,
        group: "3_cap",
        order: 1,
        when: ContextKeyExpr.equals(SessionsViewGroupingContext.key, "workspace" /* Workspace */)
      }]
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    view?.sessionsControl?.setWorkspaceGroupCapped(false);
    IsWorkspaceGroupCappedContext.bindTo(accessor.get(IContextKeyService)).set(false);
  }
});

registerAction2(class CollapseAllGroupsAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.collapseAllGroups",
      title: localize2(5572, "Collapse All Groups"),
      category: SessionsCategories.Sessions,
      menu: [{ id: SessionsViewFilterSubMenu, group: "4_collapse", order: 0 }]
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    view?.sessionsControl?.collapseAllSections();
  }
});

registerAction2(class RefreshSessionsAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.refresh",
      title: localize2(5609, "Refresh Sessions"),
      icon: Codicon.refresh,
      f1: true,
      category: SessionsCategories.Sessions
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    return view?.sessionsControl?.refresh();
  }
});

registerAction2(class FindSessionAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.find",
      title: localize2(5584, "Find Session"),
      icon: Codicon.search,
      category: SessionsCategories.Sessions
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    return view?.openFind();
  }
});

registerAction2(class NewSessionForWorkspaceAction extends Action2 {
  constructor() {
    super({
      id: NEW_SESSION_FOR_WORKSPACE_ACTION_ID,
      title: localize2(5605, "New Session"),
      icon: Codicon.plus,
      menu: [
        {
          id: SessionSectionToolbarMenuId,
          group: "navigation",
          order: 0,
          when: ContextKeyExpr.and(
            ChatContextKeys.enabled,
            SessionSectionHasNonCloudRepositoryContext,
            ContextKeyExpr.equals(SessionSectionTypeContext.key, "workspace")
          )
        },
        {
          id: SessionSectionToolbarMenuId,
          group: "navigation",
          order: 0,
          when: ContextKeyExpr.and(
            ContextKeyExpr.equals(SessionSectionTypeContext.key, "workspace"),
            ContextKeyExpr.or(
              ChatContextKeys.enabled.negate(),
              SessionSectionHasNonCloudRepositoryContext.negate()
            )
          )
        }
      ]
    });
  }
  async run(accessor, context2) {
    if (!context2 || !context2.sessions || context2.sessions.length === 0) {
      return;
    }
    const sessionsService = accessor.get(ISessionsService);
    const sessionsPartService = accessor.get(ISessionsPartService);
    const commandService = accessor.get(ICommandService);
    sessionsService.openNewSession();
    const session = context2.sessions[0];
    const workspace = session.workspace.get();
    const folderUri = workspace?.folders[0]?.root;
    const providerId = session.providerId;
    const newSession = sessionsService.activeSession.get();
    if (folderUri) {
      sessionsPartService.getSessionView(newSession?.sessionId)?.selectWorkspace(folderUri, providerId);
    }
    if (isWeb && isMobile) {
      commandService.executeCommand(CLOSE_MOBILE_SIDEBAR_DRAWER_COMMAND_ID);
    }
    sessionsPartService.focusSession(newSession);
  }
});

var NEW_QUICK_CHAT_COMMAND_ID = "sessionsView.newQuickChat";

var QuickChatEnabledContext = ContextKeyExpr.and(
  ChatContextKeys.enabled,
  AGENT_HOST_ENABLED_CONTEXT_KEY
);

registerAction2(class NewQuickChatAction extends Action2 {
  constructor() {
    super({
      id: NEW_QUICK_CHAT_COMMAND_ID,
      title: localize2(5604, "New Quick Chat"),
      icon: Codicon.add,
      category: SessionsCategories.Sessions,
      f1: true,
      precondition: QuickChatEnabledContext,
      keybinding: {
        weight: 250 /* SessionsContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 44 /* KeyN */),
        when: ContextKeyExpr.and(QuickChatEnabledContext, IsSessionsWindowContext, EditorAreaFocusContext.negate())
      },
      menu: [
        {
          // Sole create affordance for quick chats: the "+" on the
          // always-visible in-list "Chats" section header. Opens the
          // composer; the session type is chosen via its inline picker.
          id: SessionSectionToolbarMenuId,
          group: "navigation",
          order: 0,
          when: ContextKeyExpr.and(QuickChatEnabledContext, ContextKeyExpr.equals(SessionSectionTypeContext.key, "quickchats"))
        }
      ]
    });
  }
  run(accessor) {
    const sessionsService = accessor.get(ISessionsService);
    const activeQuickChat = sessionsService.openQuickChat();
    if (isWeb && isMobile) {
      accessor.get(ICommandService).executeCommand(CLOSE_MOBILE_SIDEBAR_DRAWER_COMMAND_ID);
    }
    accessor.get(ISessionsPartService).focusSession(activeQuickChat);
  }
});

var ConfirmArchiveStorageKey2 = "sessions.confirmArchive";

function getArchiveSectionConfirmationMessage(context2, wording) {
  if (context2.id === "pinned") {
    if (context2.sessions.length === 1) {
      return wording === "done" /* MarkAsDone */ ? localize(5593, null) : localize(5566, null);
    }
    return wording === "done" /* MarkAsDone */ ? localize(5594, null, context2.sessions.length) : localize(5567, null, context2.sessions.length);
  }
  if (context2.sessions.length === 1) {
    return wording === "done" /* MarkAsDone */ ? localize(5596, null, context2.label) : localize(5568, null, context2.label);
  }
  return wording === "done" /* MarkAsDone */ ? localize(5597, null, context2.sessions.length, context2.label) : localize(5569, null, context2.sessions.length, context2.label);
}

var BaseArchiveSectionAction = class extends Action2 {
  constructor(wording) {
    const action = getChatSessionArchiveActionPresentation(wording).archiveAll;
    super({
      id: "sessionsView.sectionArchive",
      title: action.title,
      icon: action.icon,
      menu: [{
        id: SessionSectionToolbarMenuId,
        group: "navigation",
        order: 1,
        // Not on Done itself, and not on the "Chats" (quick chats) section.
        // Also not on Automations.
        when: ContextKeyExpr.and(
          ContextKeyExpr.notEquals(SessionSectionTypeContext.key, "archived"),
          ContextKeyExpr.notEquals(SessionSectionTypeContext.key, "quickchats"),
          ContextKeyExpr.notEquals(SessionSectionTypeContext.key, "automations")
        )
      }]
    });
    this.wording = wording;
  }
  async run(accessor, context2) {
    if (!context2 || !context2.sessions || context2.sessions.length === 0) {
      return;
    }
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const dialogService = accessor.get(IDialogService);
    const storageService = accessor.get(IStorageService);
    const skipConfirmation = storageService.getBoolean(ConfirmArchiveStorageKey2, 0 /* PROFILE */, false);
    if (!skipConfirmation) {
      const confirmed = await dialogService.confirm({
        message: getArchiveSectionConfirmationMessage(context2, this.wording),
        detail: this.wording === "done" /* MarkAsDone */ ? localize(5598, null) : localize(5570, null),
        primaryButton: getChatSessionArchiveActionPresentation(this.wording).archiveAll.title.value,
        checkbox: {
          label: localize(5581, null)
        }
      });
      if (!confirmed.confirmed) {
        return;
      }
      if (confirmed.checkboxChecked) {
        storageService.store(ConfirmArchiveStorageKey2, true, 0 /* PROFILE */, 0 /* USER */);
      }
    }
    for (const session of context2.sessions) {
      await sessionsManagementService.archiveSession(session);
    }
  }
};

var ArchiveSectionAction = class extends BaseArchiveSectionAction {
  constructor() {
    super("archive" /* Archive */);
  }
};

var MarkSectionSessionsDoneAction = class extends BaseArchiveSectionAction {
  constructor() {
    super("done" /* MarkAsDone */);
  }
};

function getArchiveGroupConfirmationMessage(context2, wording) {
  if (context2.sessions.length === 1) {
    return wording === "done" /* MarkAsDone */ ? localize(5590, null, context2.group.name) : localize(5563, null, context2.group.name);
  }
  return wording === "done" /* MarkAsDone */ ? localize(5591, null, context2.sessions.length, context2.group.name) : localize(5564, null, context2.sessions.length, context2.group.name);
}

var BaseArchiveSessionsInGroupAction = class extends Action2 {
  constructor(wording) {
    const action = getChatSessionArchiveActionPresentation(wording).archiveAll;
    super({
      id: "sessionsView.markAllInGroupAsDone",
      title: action.title,
      icon: action.icon,
      menu: [{
        id: SessionGroupToolbarMenuId,
        group: "navigation",
        order: 0,
        when: SessionGroupHasVisibleSessionsContext
      }]
    });
    this.wording = wording;
  }
  async run(accessor, context2) {
    if (!context2 || !context2.sessions || context2.sessions.length === 0) {
      return;
    }
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const dialogService = accessor.get(IDialogService);
    const storageService = accessor.get(IStorageService);
    const skipConfirmation = storageService.getBoolean(ConfirmArchiveStorageKey2, 0 /* PROFILE */, false);
    if (!skipConfirmation) {
      const confirmed = await dialogService.confirm({
        message: getArchiveGroupConfirmationMessage(context2, this.wording),
        detail: this.wording === "done" /* MarkAsDone */ ? localize(5592, null) : localize(5565, null),
        primaryButton: getChatSessionArchiveActionPresentation(this.wording).archiveAll.title.value,
        checkbox: {
          label: localize(5581, null)
        }
      });
      if (!confirmed.confirmed) {
        return;
      }
      if (confirmed.checkboxChecked) {
        storageService.store(ConfirmArchiveStorageKey2, true, 0 /* PROFILE */, 0 /* USER */);
      }
    }
    for (const session of context2.sessions) {
      await sessionsManagementService.archiveSession(session);
    }
  }
};

var ArchiveSessionsInGroupAction = class extends BaseArchiveSessionsInGroupAction {
  constructor() {
    super("archive" /* Archive */);
  }
};

var MarkAllSessionsInGroupAsDoneAction = class extends BaseArchiveSessionsInGroupAction {
  constructor() {
    super("done" /* MarkAsDone */);
  }
};

registerAction2(class DeleteEmptySessionGroupAction extends Action2 {
  constructor() {
    super({
      id: "sessionsView.deleteEmptyGroup",
      title: localize2(5573, "Delete Group"),
      icon: Codicon.trash,
      menu: [{
        id: SessionGroupToolbarMenuId,
        group: "navigation",
        order: 0,
        when: SessionGroupIsEmptyContext
      }]
    });
  }
  run(accessor, context2) {
    if (!context2) {
      return;
    }
    const sessionGroupsService = accessor.get(ISessionGroupsService);
    if (sessionGroupsService.getSessionIdsInGroup(context2.group.id).length === 0) {
      sessionGroupsService.deleteGroup(context2.group.id);
    }
  }
});

registerAction2(class NewSessionInGroupAction extends Action2 {
  constructor() {
    super({
      id: "sessionsView.newSessionInGroup",
      title: localize2(5606, "New Session"),
      icon: Codicon.plus,
      menu: [{
        id: SessionGroupToolbarMenuId,
        group: "navigation",
        order: 1
      }]
    });
  }
  run(accessor, context2) {
    if (!context2) {
      return;
    }
    const sessionsService = accessor.get(ISessionsService);
    const sessionsPartService = accessor.get(ISessionsPartService);
    const sessionGroupsService = accessor.get(ISessionGroupsService);
    const commandService = accessor.get(ICommandService);
    sessionsService.openNewSession();
    sessionGroupsService.setPendingNewSessionGroup(context2.group.id);
    if (isWeb && isMobile) {
      commandService.executeCommand(CLOSE_MOBILE_SIDEBAR_DRAWER_COMMAND_ID);
    }
    sessionsPartService.focusSession(sessionsService.activeSession.get());
  }
});

registerAction2(class PinSessionAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.pinSession",
      title: localize2(5608, "Pin"),
      icon: Codicon.pin,
      menu: [{
        id: SessionItemToolbarMenuId,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals(IsSessionPinnedContext.key, false),
          ContextKeyExpr.equals(SessionIsArchivedContext.key, false)
        )
      }, {
        id: SessionItemContextMenuId,
        group: "0_pin",
        order: 0,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals(IsSessionPinnedContext.key, false),
          ContextKeyExpr.equals(SessionIsArchivedContext.key, false)
        )
      }]
    });
  }
  run(accessor, context2) {
    if (!context2) {
      return;
    }
    const sessions = Array.isArray(context2) ? context2 : [context2];
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    for (const session of sessions) {
      view?.sessionsControl?.pinSession(session);
    }
  }
});

registerAction2(class UnpinSessionAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.unpinSession",
      title: localize2(5617, "Unpin"),
      icon: Codicon.pinned,
      menu: [{
        id: SessionItemToolbarMenuId,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals(IsSessionPinnedContext.key, true),
          ContextKeyExpr.equals(SessionIsArchivedContext.key, false)
        )
      }, {
        id: SessionItemContextMenuId,
        group: "0_pin",
        order: 0,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals(IsSessionPinnedContext.key, true),
          ContextKeyExpr.equals(SessionIsArchivedContext.key, false)
        )
      }]
    });
  }
  run(accessor, context2) {
    if (!context2) {
      return;
    }
    const sessions = Array.isArray(context2) ? context2 : [context2];
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SessionsViewId);
    for (const session of sessions) {
      view?.sessionsControl?.unpinSession(session);
    }
  }
});

function getSessionActionTargets(accessor, context2) {
  if (context2) {
    return Array.isArray(context2) ? context2 : [context2];
  }
  const focusedSessions = getFocusedSessionListTargets(accessor);
  if (focusedSessions) {
    return focusedSessions;
  }
  const activeSession = accessor.get(ISessionsService).activeSession.get();
  return activeSession ? [activeSession] : [];
}

function getFocusedSessionListTargets(accessor) {
  return accessor.get(IViewsService).getViewWithId(SessionsViewId)?.sessionsControl?.getFocusedSessions();
}

KeybindingsRegistry.registerKeybindingRule({
  id: ARCHIVE_SESSION_COMMAND_ID,
  weight: 250 /* SessionsContrib */,
  when: ContextKeyExpr.and(
    IsSessionsWindowContext,
    FocusedViewContext.isEqualTo(SessionsViewId),
    WorkbenchListFocusContextKey
  ),
  primary: 20 /* Delete */,
  mac: { primary: 2048 /* CtrlCmd */ | 1 /* Backspace */ }
});

var BaseArchiveSessionAction = class extends Action2 {
  constructor(wording) {
    const action = getChatSessionArchiveActionPresentation(wording).archive;
    super({
      id: ARCHIVE_SESSION_COMMAND_ID,
      title: action.title,
      icon: action.icon,
      menu: [{
        id: SessionItemToolbarMenuId,
        group: "navigation",
        order: 1,
        when: ContextKeyExpr.equals(SessionIsArchivedContext.key, false)
      }, {
        id: Menus.AutomationsHistoryItem,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.equals(SessionIsArchivedContext.key, false)
      }, {
        id: SessionItemContextMenuId,
        group: "1_edit",
        order: 2,
        when: ContextKeyExpr.equals(SessionIsArchivedContext.key, false)
      }, {
        id: Menus.SessionBarToolbar,
        group: "secondary/1_session",
        order: 30,
        when: ContextKeyExpr.and(SessionIsCreatedContext, ContextKeyExpr.equals(SessionIsArchivedContext.key, false))
      }]
    });
  }
  async run(accessor, context2) {
    const targets = context2 ? Array.isArray(context2) ? context2 : [context2] : getFocusedSessionListTargets(accessor) ?? [];
    const sessions = targets.filter((session) => !session.isArchived.get());
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    for (const session of sessions) {
      await sessionsManagementService.archiveSession(session);
    }
  }
};

var ArchiveSessionAction = class extends BaseArchiveSessionAction {
  constructor() {
    super("archive" /* Archive */);
  }
};

var MarkSessionAsDoneAction = class extends BaseArchiveSessionAction {
  constructor() {
    super("done" /* MarkAsDone */);
  }
};

var BaseUnarchiveSessionAction = class extends Action2 {
  constructor(wording) {
    const action = getChatSessionArchiveActionPresentation(wording).unarchive;
    super({
      id: UNARCHIVE_SESSION_COMMAND_ID,
      title: action.title,
      icon: action.icon,
      menu: [{
        id: SessionItemToolbarMenuId,
        group: "navigation",
        order: 1,
        when: ContextKeyExpr.equals(SessionIsArchivedContext.key, true)
      }, {
        id: SessionItemContextMenuId,
        group: "1_edit",
        order: 2,
        when: ContextKeyExpr.equals(SessionIsArchivedContext.key, true)
      }, {
        id: Menus.SessionBarToolbar,
        group: "secondary/1_session",
        order: 5,
        when: ContextKeyExpr.equals(SessionIsArchivedContext.key, true)
      }]
    });
  }
  async run(accessor, context2) {
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const sessionsService = accessor.get(ISessionsService);
    if (!context2) {
      const activeSession = sessionsService.activeSession.get();
      if (activeSession) {
        await sessionsManagementService.unarchiveSession(activeSession);
      }
      return;
    }
    const sessions = Array.isArray(context2) ? context2 : [context2];
    for (const session of sessions) {
      await sessionsManagementService.unarchiveSession(session);
    }
  }
};

var UnarchiveSessionAction = class extends BaseUnarchiveSessionAction {
  constructor() {
    super("archive" /* Archive */);
  }
};

var RestoreArchivedSessionAction = class extends BaseUnarchiveSessionAction {
  constructor() {
    super("done" /* MarkAsDone */);
  }
};

registerAction2(class RenameSessionAction extends Action2 {
  constructor() {
    super({
      id: RENAME_SESSION_COMMAND_ID,
      title: localize2(5610, "Rename..."),
      icon: Codicon.edit,
      keybinding: {
        primary: 60 /* F2 */,
        weight: 250 /* SessionsContrib */,
        when: ContextKeyExpr.and(
          IsSessionsWindowContext,
          ContextKeyExpr.or(
            ContextKeyExpr.and(FocusedViewContext.isEqualTo(SessionsViewId), WorkbenchListFocusContextKey),
            ContextKeyExpr.and(ChatContextKeys.inChatSession, SessionSupportsRenameContext)
          )
        )
      },
      menu: [{
        id: SessionItemContextMenuId,
        group: "1_edit",
        order: 1,
        when: SessionSupportsRenameContext
      }]
    });
  }
  async run(accessor, context2) {
    const session = getSessionActionTargets(accessor, context2)[0];
    if (!session || !session.capabilities.get().supportsRename) {
      return;
    }
    const quickInputService = accessor.get(IQuickInputService);
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const newTitle = await quickInputService.input({
      value: session.title.get(),
      prompt: localize(5612, null),
      validateInput: async (value2) => {
        if (!value2.trim()) {
          return localize(5611, null);
        }
        return void 0;
      }
    });
    if (newTitle) {
      const trimmedTitle = newTitle.trim();
      if (trimmedTitle && trimmedTitle !== session.title.get().trim()) {
        await sessionsManagementService.renameSession(session, trimmedTitle);
      }
    }
  }
});

registerAction2(class DeleteSessionAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.deleteSession",
      title: localize2(5574, "Delete..."),
      menu: [{
        id: SessionItemContextMenuId,
        group: "1_edit",
        order: 4,
        when: SessionSupportsDeleteContext
      }]
    });
  }
  async run(accessor, context2) {
    if (!context2) {
      return;
    }
    const sessions = (Array.isArray(context2) ? context2 : [context2]).filter((session) => session.capabilities.get().supportsDelete);
    if (sessions.length === 0) {
      return;
    }
    const dialogService = accessor.get(IDialogService);
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const confirmed = await dialogService.confirm({
      message: sessions.length === 1 ? localize(5575, null) : localize(5579, null, sessions.length),
      detail: localize(5577, null),
      primaryButton: localize(5576, null)
    });
    if (!confirmed.confirmed) {
      return;
    }
    try {
      await sessionsManagementService.deleteSessions(sessions);
    } catch (err) {
      dialogService.error(sessions.length === 1 ? localize(5578, null, toErrorMessage(err)) : localize(5580, null, toErrorMessage(err)));
    }
  }
});

registerAction2(class MarkSessionReadAction extends Action2 {
  constructor() {
    super({
      id: MARK_SESSION_READ_COMMAND_ID,
      title: localize2(5595, "Mark as Read"),
      menu: [{
        id: SessionItemContextMenuId,
        group: "0_read",
        order: 0,
        when: ContextKeyExpr.and(
          SessionIsReadContext.negate(),
          SessionIsArchivedContext.negate()
        )
      }, {
        id: Menus.SessionHeaderContext,
        group: "3_read",
        order: 0,
        when: ContextKeyExpr.and(
          SessionIsReadContext.negate(),
          SessionIsArchivedContext.negate()
        )
      }]
    });
  }
  run(accessor, context2) {
    if (!context2) {
      return;
    }
    const sessions = Array.isArray(context2) ? context2 : [context2];
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    sessionsManagementService.markAllRead(sessions);
  }
});

registerAction2(class MarkSessionUnreadAction extends Action2 {
  constructor() {
    super({
      id: MARK_SESSION_UNREAD_COMMAND_ID,
      title: localize2(5599, "Mark as Unread"),
      menu: [{
        id: SessionItemContextMenuId,
        group: "0_read",
        order: 0,
        when: ContextKeyExpr.and(
          SessionIsReadContext,
          SessionIsArchivedContext.negate()
        )
      }, {
        id: Menus.SessionHeaderContext,
        group: "3_read",
        order: 0,
        when: ContextKeyExpr.and(
          SessionIsReadContext,
          SessionIsArchivedContext.negate()
        )
      }]
    });
  }
  run(accessor, context2) {
    if (!context2) {
      return;
    }
    const sessions = Array.isArray(context2) ? context2 : [context2];
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    for (const session of sessions) {
      sessionsManagementService.markUnread(session);
    }
  }
});

registerAction2(class OpenSessionToTheSideAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.openToTheSide",
      title: localize2(5607, "Open to the Side"),
      menu: [{
        id: SessionItemContextMenuId,
        group: "navigation",
        order: -1,
        when: IsSessionsWindowContext
      }]
    });
  }
  async run(accessor, context2) {
    if (!context2) {
      return;
    }
    const sessions = Array.isArray(context2) ? context2 : [context2];
    const sessionsService = accessor.get(ISessionsService);
    const sessionsPartService = accessor.get(ISessionsPartService);
    for (let i2 = 0; i2 < sessions.length - 1; i2++) {
      const session = sessions[i2];
      const visible = sessionsService.visibleSessions.get();
      const lastVisible = visible[visible.length - 1];
      if (lastVisible && lastVisible.sessionId !== session.sessionId) {
        sessionsService.insertAt(session, lastVisible.sessionId, "right");
      }
    }
    const lastRequested = sessions[sessions.length - 1];
    await sessionsService.openSessionToSide(lastRequested, { source: "sessionsList" });
    const visibleAfterOpen = sessionsService.visibleSessions.get();
    const opened = visibleAfterOpen.find((s) => s?.sessionId === lastRequested.sessionId);
    if (opened) {
      sessionsPartService.focusSession(opened);
    }
  }
});

registerAction2(class MarkAllSessionsReadAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.markAllRead",
      title: localize2(5589, "Mark All as Read"),
      menu: [{
        id: SessionItemContextMenuId,
        group: "0_read",
        order: 1
      }]
    });
  }
  run(accessor) {
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const sessions = sessionsManagementService.getSessions().filter((s) => !s.isArchived.get() && !s.isRead.get());
    sessionsManagementService.markAllRead(sessions);
  }
});

var BaseUnarchiveActiveSessionAction = class extends Action2 {
  constructor(wording) {
    const action = getChatSessionArchiveActionPresentation(wording).unarchive;
    super({
      id: "agentSession.restore",
      title: action.title,
      icon: action.icon,
      menu: [{
        id: MenuId.AgentsChangesToolbar,
        group: "navigation",
        order: 1,
        when: ContextKeyExpr.and(
          IsSessionsWindowContext,
          SessionIsArchivedContext
        )
      }]
    });
  }
  async run(accessor) {
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const sessionsService = accessor.get(ISessionsService);
    const activeSession = sessionsService.activeSession.get();
    if (!activeSession || activeSession.status.get() === 0 /* Untitled */) {
      return;
    }
    await sessionsManagementService.unarchiveSession(activeSession);
  }
};

var UnarchiveActiveSessionAction = class extends BaseUnarchiveActiveSessionAction {
  constructor() {
    super("archive" /* Archive */);
  }
};

var RestoreActiveSessionAction = class extends BaseUnarchiveActiveSessionAction {
  constructor() {
    super("done" /* MarkAsDone */);
  }
};

function getSessionsArchiveActionConstructors(wording) {
  return wording === "done" /* MarkAsDone */ ? [
    MarkSectionSessionsDoneAction,
    MarkAllSessionsInGroupAsDoneAction,
    MarkSessionAsDoneAction,
    RestoreArchivedSessionAction,
    RestoreActiveSessionAction
  ] : [
    ArchiveSectionAction,
    ArchiveSessionsInGroupAction,
    ArchiveSessionAction,
    UnarchiveSessionAction,
    UnarchiveActiveSessionAction
  ];
}

var SessionsArchiveActionsContribution = class extends Disposable {
  constructor(configurationService) {
    super();
    this.configurationService = configurationService;
    this.actionRegistrations = this._register(new DisposableStore());
    this.registerActions();
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(ChatSessionArchiveActionWordingSettingId)) {
        this.registerActions();
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.sessionsArchiveActions";
  }
  registerActions() {
    this.actionRegistrations.clear();
    const wording = getChatSessionArchiveActionWording(this.configurationService);
    for (const action of getSessionsArchiveActionConstructors(wording)) {
      this.actionRegistrations.add(registerAction2(action));
    }
  }
};

SessionsArchiveActionsContribution = __decorateClass([
  __decorateParam(0, IConfigurationService)
], SessionsArchiveActionsContribution);

registerWorkbenchContribution2(SessionsArchiveActionsContribution.ID, SessionsArchiveActionsContribution, WorkbenchPhase.BlockStartup);

registerAction2(class ManageAutomationsAction extends Action2 {
  constructor() {
    super({
      id: "sessionsView.manageAutomations",
      title: localize2(5587, "Manage Automations"),
      menu: []
    });
  }
  run(accessor) {
    accessor.get(ICustomViewService).showCustomView(AUTOMATIONS_CUSTOM_VIEW_ID);
  }
});

var MARK_ALL_AUTOMATION_RUNS_READ_COMMAND_ID = "sessionsView.markAllAutomationRunsRead";

registerAction2(class MarkAllAutomationRunsReadAction extends Action2 {
  constructor() {
    super({
      id: MARK_ALL_AUTOMATION_RUNS_READ_COMMAND_ID,
      title: localize2(5588, "Mark All as Read")
    });
  }
  async run(accessor) {
    const automationService = accessor.get(IAutomationService);
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const runs = automationService.runs.get();
    const sessions = /* @__PURE__ */ new Map();
    for (const run of runs) {
      if ((run.status === "completed" || run.status === "failed") && run.sessionResource) {
        const session = sessionsManagementService.getSession(run.sessionResource);
        if (session && !session.isRead.get()) {
          sessions.set(session.resource.toString(), session);
        }
      }
    }
    await sessionsManagementService.markAllRead([...sessions.values()]);
  }
});
export { digitToKeyCode, getArchiveSectionConfirmationMessage, getArchiveGroupConfirmationMessage, getSessionActionTargets, getFocusedSessionListTargets, getSessionsArchiveActionConstructors, CLOSE_SESSION_COMMAND_ID, OPEN_SESSION_AT_INDEX_COMMAND_ID, openSessionAtIndex, navigateSessionInList, NEW_QUICK_CHAT_COMMAND_ID, QuickChatEnabledContext, ConfirmArchiveStorageKey2, BaseArchiveSectionAction, ArchiveSectionAction, MarkSectionSessionsDoneAction, BaseArchiveSessionsInGroupAction, ArchiveSessionsInGroupAction, MarkAllSessionsInGroupAsDoneAction, BaseArchiveSessionAction, ArchiveSessionAction, MarkSessionAsDoneAction, BaseUnarchiveSessionAction, UnarchiveSessionAction, RestoreArchivedSessionAction, BaseUnarchiveActiveSessionAction, UnarchiveActiveSessionAction, RestoreActiveSessionAction, SessionsArchiveActionsContribution, MARK_ALL_AUTOMATION_RUNS_READ_COMMAND_ID };
