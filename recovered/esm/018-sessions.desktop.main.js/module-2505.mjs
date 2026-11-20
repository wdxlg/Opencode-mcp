// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsActions.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, MenuId, MenuRegistry } from "./module-0092.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeyExprs, ChatContextKeys } from "./module-0966.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICommandService } from "./module-0087.mjs";
import { getChatSessionArchiveActionPresentation } from "./module-2468.mjs";
import { IAgentSessionsService } from "./module-1463.mjs";
import { IDialogService } from "./module-0267.mjs";
import { isAgentHostAgentSessionItem, isAgentSessionSection, isLocalAgentSessionItem, isMarshalledAgentSessionContext } from "./module-1462.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IViewsService } from "./module-1246.mjs";
import { coalesce } from "./module-0007.mjs";
import { ChatViewId, IChatWidgetService } from "./module-0982.mjs";
import { IChatService } from "./module-0973.mjs";
import { showClearEditingSessionConfirmation } from "./module-1112.mjs";
import { Codicon } from "./module-0085.mjs";
import { AGENT_SESSION_DELETE_ACTION_ID, AGENT_SESSION_RENAME_ACTION_ID, AgentSessionProviders } from "./module-0983.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { isAncestorOfActiveElement } from "./module-0075.mjs";
import { LocalChatSessionUri, getChatSessionType } from "./module-0962.mjs";
import { IChatSessionsService } from "./module-0961.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { ACTIVE_GROUP, AUX_WINDOW_GROUP, SIDE_GROUP } from "./module-0935.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";
import { ACTION_ID_NEW_CHAT } from "./module-1475.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsActions.ts
var AGENT_SESSIONS_CATEGORY = localize2(9100, "Chat Agent Sessions");

var ToggleShowAgentSessionsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.toggleShowAgentSessions",
      title: localize2(9099, "Show Sessions"),
      toggled: ContextKeyExpr.equals(`config.${"chat.viewSessions.enabled" /* ChatViewSessionsEnabled */}`, true),
      menu: {
        id: MenuId.ChatWelcomeContext,
        group: "0_sessions",
        order: 2,
        when: ChatContextKeys.inChatEditor.negate()
      }
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const currentValue = configurationService.getValue("chat.viewSessions.enabled" /* ChatViewSessionsEnabled */);
    await configurationService.updateValue("chat.viewSessions.enabled" /* ChatViewSessionsEnabled */, !currentValue);
  }
};

var agentSessionsOrientationSubmenu = new MenuId("chatAgentSessionsOrientationSubmenu");

MenuRegistry.appendMenuItem(MenuId.ChatWelcomeContext, {
  submenu: agentSessionsOrientationSubmenu,
  title: localize2(9096, "Sessions Orientation"),
  group: "0_sessions",
  order: 1,
  when: ChatContextKeys.inChatEditor.negate()
});

var SetAgentSessionsOrientationStackedAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.setAgentSessionsOrientationStacked",
      title: localize2(9098, "Stacked"),
      toggled: ContextKeyExpr.equals(`config.${"chat.viewSessions.orientation" /* ChatViewSessionsOrientation */}`, "stacked"),
      precondition: ContextKeyExpr.equals(`config.${"chat.viewSessions.enabled" /* ChatViewSessionsEnabled */}`, true),
      menu: {
        id: agentSessionsOrientationSubmenu,
        group: "navigation",
        order: 2
      }
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand(HideAgentSessionsSidebar.ID);
  }
};

var SetAgentSessionsOrientationSideBySideAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.setAgentSessionsOrientationSideBySide",
      title: localize2(9097, "Side by Side"),
      toggled: ContextKeyExpr.notEquals(`config.${"chat.viewSessions.orientation" /* ChatViewSessionsOrientation */}`, "stacked"),
      precondition: ContextKeyExpr.equals(`config.${"chat.viewSessions.enabled" /* ChatViewSessionsEnabled */}`, true),
      menu: {
        id: agentSessionsOrientationSubmenu,
        group: "navigation",
        order: 1
      }
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand(ShowAgentSessionsSidebar.ID);
  }
};

var BaseArchiveAllAgentSessionsAction = class extends Action2 {
  constructor(wording) {
    const action = getChatSessionArchiveActionPresentation(wording).archiveAll;
    super({
      id: "workbench.action.chat.archiveAllAgentSessions",
      title: action.title,
      icon: action.icon,
      precondition: ChatContextKeys.enabled,
      category: AGENT_SESSIONS_CATEGORY,
      f1: true
    });
    this.wording = wording;
  }
  async run(accessor) {
    const agentSessionsService = accessor.get(IAgentSessionsService);
    const dialogService = accessor.get(IDialogService);
    const sessionsToArchive = agentSessionsService.model.sessions.filter((session) => !session.isArchived());
    if (sessionsToArchive.length === 0) {
      return;
    }
    const confirmed = await dialogService.confirm({
      message: this.wording === "done" /* MarkAsDone */ ? sessionsToArchive.length === 1 ? localize(9117, null) : localize(9116, null, sessionsToArchive.length) : sessionsToArchive.length === 1 ? localize(9085, null) : localize(9084, null, sessionsToArchive.length),
      detail: this.wording === "done" /* MarkAsDone */ ? localize(9118, null) : localize(9086, null),
      primaryButton: getChatSessionArchiveActionPresentation(this.wording).archiveAll.title.value
    });
    if (!confirmed.confirmed) {
      return;
    }
    for (const session of sessionsToArchive) {
      session.setArchived(true);
    }
  }
};

var ArchiveAllAgentSessionsAction = class extends BaseArchiveAllAgentSessionsAction {
  constructor() {
    super("archive" /* Archive */);
  }
};

var MarkAllAgentSessionsDoneAction = class extends BaseArchiveAllAgentSessionsAction {
  constructor() {
    super("done" /* MarkAsDone */);
  }
};

var MarkAllAgentSessionsReadAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.markAllAgentSessionsRead",
      title: localize2(9115, "Mark All as Read"),
      precondition: ChatContextKeys.enabled,
      category: AGENT_SESSIONS_CATEGORY,
      f1: true,
      menu: {
        id: MenuId.AgentSessionsContext,
        group: "0_read",
        order: 2,
        when: ChatContextKeys.isArchivedAgentSession.negate()
        // no read state for archived sessions
      }
    });
  }
  async run(accessor) {
    const agentSessionsService = accessor.get(IAgentSessionsService);
    const sessionsToMarkRead = agentSessionsService.model.sessions.filter((session) => !session.isArchived() && !session.isRead());
    if (sessionsToMarkRead.length === 0) {
      return;
    }
    for (const session of sessionsToMarkRead) {
      session.setRead(true);
    }
  }
};

var ConfirmArchiveStorageKey = "chat.sessions.confirmArchive";

var BaseArchiveAgentSessionSectionAction = class extends Action2 {
  constructor(wording) {
    const action = getChatSessionArchiveActionPresentation(wording).archiveAll;
    super({
      id: "agentSessionSection.archive",
      title: action.title,
      icon: action.icon,
      menu: [{
        id: MenuId.AgentSessionSectionToolbar,
        group: "navigation",
        order: 1,
        when: ChatContextKeys.agentSessionSection.notEqualsTo("archived" /* Archived */)
      }, {
        id: MenuId.AgentSessionSectionContext,
        group: "1_edit",
        order: 2,
        when: ChatContextKeys.agentSessionSection.notEqualsTo("archived" /* Archived */)
      }]
    });
    this.wording = wording;
  }
  async run(accessor, context2) {
    if (!context2 || !isAgentSessionSection(context2)) {
      return;
    }
    const dialogService = accessor.get(IDialogService);
    const storageService = accessor.get(IStorageService);
    const skipConfirmation = storageService.getBoolean(ConfirmArchiveStorageKey, 0 /* PROFILE */, false);
    if (!skipConfirmation) {
      const confirmed = await dialogService.confirm({
        message: this.wording === "done" /* MarkAsDone */ ? context2.sessions.length === 1 ? localize(9122, null, context2.label) : localize(9121, null, context2.sessions.length, context2.label) : context2.sessions.length === 1 ? localize(9088, null, context2.label) : localize(9087, null, context2.sessions.length, context2.label),
        detail: this.wording === "done" /* MarkAsDone */ ? localize(9123, null) : localize(9089, null),
        primaryButton: getChatSessionArchiveActionPresentation(this.wording).archiveAll.title.value,
        checkbox: {
          label: localize(9112, null)
        }
      });
      if (!confirmed.confirmed) {
        return;
      }
      if (confirmed.checkboxChecked) {
        storageService.store(ConfirmArchiveStorageKey, true, 0 /* PROFILE */, 0 /* USER */);
      }
    }
    for (const session of context2.sessions) {
      session.setArchived(true);
    }
  }
};

var ArchiveAgentSessionSectionAction = class extends BaseArchiveAgentSessionSectionAction {
  constructor() {
    super("archive" /* Archive */);
  }
};

var MarkAgentSessionSectionDoneAction = class extends BaseArchiveAgentSessionSectionAction {
  constructor() {
    super("done" /* MarkAsDone */);
  }
};

var BaseUnarchiveAgentSessionSectionAction = class extends Action2 {
  constructor(wording) {
    const action = getChatSessionArchiveActionPresentation(wording).unarchiveAll;
    super({
      id: "agentSessionSection.unarchive",
      title: action.title,
      icon: action.icon,
      menu: [{
        id: MenuId.AgentSessionSectionToolbar,
        group: "navigation",
        order: 1,
        when: ChatContextKeys.agentSessionSection.isEqualTo("archived" /* Archived */)
      }, {
        id: MenuId.AgentSessionSectionContext,
        group: "1_edit",
        order: 2,
        when: ChatContextKeys.agentSessionSection.isEqualTo("archived" /* Archived */)
      }]
    });
    this.wording = wording;
  }
  async run(accessor, context2) {
    if (!context2 || !isAgentSessionSection(context2)) {
      return;
    }
    const dialogService = accessor.get(IDialogService);
    const storageService = accessor.get(IStorageService);
    if (context2.sessions.length > 1) {
      const skipConfirmation = storageService.getBoolean(ConfirmArchiveStorageKey, 0 /* PROFILE */, false);
      if (!skipConfirmation) {
        const confirmed = await dialogService.confirm({
          message: this.wording === "done" /* MarkAsDone */ ? localize(9130, null, context2.sessions.length) : localize(9133, null, context2.sessions.length),
          primaryButton: getChatSessionArchiveActionPresentation(this.wording).unarchiveAll.title.value,
          checkbox: {
            label: localize(9112, null)
          }
        });
        if (!confirmed.confirmed) {
          return;
        }
        if (confirmed.checkboxChecked) {
          storageService.store(ConfirmArchiveStorageKey, true, 0 /* PROFILE */, 0 /* USER */);
        }
      }
    }
    for (const session of context2.sessions) {
      session.setArchived(false);
    }
  }
};

var UnarchiveAgentSessionSectionAction = class extends BaseUnarchiveAgentSessionSectionAction {
  constructor() {
    super("archive" /* Archive */);
  }
};

var RestoreAgentSessionSectionAction = class extends BaseUnarchiveAgentSessionSectionAction {
  constructor() {
    super("done" /* MarkAsDone */);
  }
};

var MarkAgentSessionSectionReadAction = class extends Action2 {
  constructor() {
    super({
      id: "agentSessionSection.markRead",
      title: localize2(9120, "Mark All as Read"),
      menu: [{
        id: MenuId.AgentSessionSectionContext,
        group: "1_edit",
        order: 1,
        when: ChatContextKeys.agentSessionSection.notEqualsTo("archived" /* Archived */)
      }]
    });
  }
  async run(accessor, context2) {
    if (!context2 || !isAgentSessionSection(context2)) {
      return;
    }
    for (const session of context2.sessions) {
      session.setRead(true);
    }
  }
};

var CollapseAllAgentSessionSectionsAction = class extends Action2 {
  constructor() {
    super({
      id: "agentSessionSection.collapseAll",
      title: localize2(9101, "Collapse All"),
      menu: [{
        id: MenuId.AgentSessionSectionContext,
        group: "2_collapse",
        order: 1
      }]
    });
  }
  async run(accessor, _section, control) {
    control?.collapseAllSections();
  }
};

var BaseAgentSessionAction = class extends Action2 {
  async run(accessor, context2) {
    const agentSessionsService = accessor.get(IAgentSessionsService);
    const viewsService = accessor.get(IViewsService);
    let sessions = [];
    if (isMarshalledAgentSessionContext(context2)) {
      sessions = coalesce((context2.sessions ?? [context2.session]).map((session) => agentSessionsService.getSession(session.resource)));
    } else if (context2) {
      sessions = [context2];
    }
    if (sessions.length === 0) {
      const chatView = viewsService.getActiveViewWithId(ChatViewId);
      const focused = chatView?.getFocusedSessions().at(0);
      if (focused) {
        sessions = [focused];
      }
    }
    if (sessions.length > 0) {
      await this.runWithSessions(sessions, accessor);
    }
  }
};

var MarkAgentSessionUnreadAction = class extends BaseAgentSessionAction {
  constructor() {
    super({
      id: "agentSession.markUnread",
      title: localize2(9125, "Mark as Unread"),
      menu: {
        id: MenuId.AgentSessionsContext,
        group: "0_read",
        order: 1,
        when: ContextKeyExpr.and(
          ChatContextKeys.isReadAgentSession,
          ChatContextKeys.isArchivedAgentSession.negate()
          // no read state for archived sessions
        )
      }
    });
  }
  runWithSessions(sessions) {
    for (const session of sessions) {
      session.setRead(false);
    }
  }
};

var MarkAgentSessionReadAction = class extends BaseAgentSessionAction {
  constructor() {
    super({
      id: "agentSession.markRead",
      title: localize2(9119, "Mark as Read"),
      menu: {
        id: MenuId.AgentSessionsContext,
        group: "0_read",
        order: 1,
        when: ContextKeyExpr.and(
          ChatContextKeys.isReadAgentSession.negate(),
          ChatContextKeys.isArchivedAgentSession.negate()
          // no read state for archived sessions
        )
      }
    });
  }
  runWithSessions(sessions) {
    for (const session of sessions) {
      session.setRead(true);
    }
  }
};

var BaseArchiveAgentSessionAction = class extends BaseAgentSessionAction {
  constructor(wording) {
    const action = getChatSessionArchiveActionPresentation(wording).archive;
    super({
      id: "agentSession.archive",
      title: action.title,
      icon: action.icon,
      keybinding: {
        primary: 20 /* Delete */,
        mac: { primary: 2048 /* CtrlCmd */ | 1 /* Backspace */ },
        weight: 200 /* WorkbenchContrib */ + 1,
        when: ContextKeyExpr.and(
          ChatContextKeys.agentSessionsViewerFocused,
          ChatContextKeys.isArchivedAgentSession.negate()
        )
      },
      menu: [{
        id: MenuId.AgentSessionItemToolbar,
        group: "navigation",
        order: 1,
        when: ChatContextKeys.isArchivedAgentSession.negate()
      }, {
        id: MenuId.AgentSessionsContext,
        group: "1_edit",
        order: 2,
        when: ChatContextKeys.isArchivedAgentSession.negate()
      }]
    });
    this.wording = wording;
  }
  async runWithSessions(sessions, accessor) {
    const chatService = accessor.get(IChatService);
    const dialogService = accessor.get(IDialogService);
    for (const session of sessions) {
      const chatModel = chatService.getSession(session.resource);
      if (chatModel && !await showClearEditingSessionConfirmation(chatModel, dialogService, {
        isArchiveAction: true,
        titleOverride: this.wording === "done" /* MarkAsDone */ ? localize(9124, null) : localize(9090, null),
        messageOverride: localize(9091, null)
      })) {
        return;
      }
      session.setArchived(true);
    }
  }
};

var ArchiveAgentSessionAction = class extends BaseArchiveAgentSessionAction {
  constructor() {
    super("archive" /* Archive */);
  }
};

var MarkAgentSessionDoneAction = class extends BaseArchiveAgentSessionAction {
  constructor() {
    super("done" /* MarkAsDone */);
  }
};

var BaseUnarchiveAgentSessionAction = class extends BaseAgentSessionAction {
  constructor(wording) {
    const action = getChatSessionArchiveActionPresentation(wording).unarchive;
    super({
      id: "agentSession.unarchive",
      title: action.title,
      icon: action.icon,
      keybinding: {
        primary: 1024 /* Shift */ | 20 /* Delete */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 1 /* Backspace */
        },
        weight: 200 /* WorkbenchContrib */ + 1,
        when: ContextKeyExpr.and(
          ChatContextKeys.agentSessionsViewerFocused,
          ChatContextKeys.isArchivedAgentSession
        )
      },
      menu: [{
        id: MenuId.AgentSessionItemToolbar,
        group: "navigation",
        order: 1,
        when: ChatContextKeys.isArchivedAgentSession
      }, {
        id: MenuId.AgentSessionsContext,
        group: "1_edit",
        order: 2,
        when: ChatContextKeys.isArchivedAgentSession
      }]
    });
  }
  runWithSessions(sessions) {
    for (const session of sessions) {
      session.setArchived(false);
    }
  }
};

var UnarchiveAgentSessionAction = class extends BaseUnarchiveAgentSessionAction {
  constructor() {
    super("archive" /* Archive */);
  }
};

var RestoreAgentSessionAction = class extends BaseUnarchiveAgentSessionAction {
  constructor() {
    super("done" /* MarkAsDone */);
  }
};

function getAgentSessionArchiveActionConstructors(wording) {
  return wording === "done" /* MarkAsDone */ ? [
    MarkAllAgentSessionsDoneAction,
    MarkAgentSessionSectionDoneAction,
    RestoreAgentSessionSectionAction,
    MarkAgentSessionDoneAction,
    RestoreAgentSessionAction
  ] : [
    ArchiveAllAgentSessionsAction,
    ArchiveAgentSessionSectionAction,
    UnarchiveAgentSessionSectionAction,
    ArchiveAgentSessionAction,
    UnarchiveAgentSessionAction
  ];
}

var PinAgentSessionAction = class extends BaseAgentSessionAction {
  constructor() {
    super({
      id: "agentSession.pin",
      title: localize2(9127, "Pin"),
      icon: Codicon.pin,
      menu: [{
        id: MenuId.AgentSessionItemToolbar,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(
          ChatContextKeys.isPinnedAgentSession.negate(),
          ChatContextKeys.isArchivedAgentSession.negate()
        )
      }, {
        id: MenuId.AgentSessionsContext,
        group: "0_pin",
        order: 1,
        when: ContextKeyExpr.and(
          ChatContextKeys.isPinnedAgentSession.negate(),
          ChatContextKeys.isArchivedAgentSession.negate()
        )
      }]
    });
  }
  runWithSessions(sessions) {
    for (const session of sessions) {
      session.setPinned(true);
    }
  }
};

var UnpinAgentSessionAction = class extends BaseAgentSessionAction {
  constructor() {
    super({
      id: "agentSession.unpin",
      title: localize2(9134, "Unpin"),
      icon: Codicon.pinned,
      menu: [{
        id: MenuId.AgentSessionItemToolbar,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(
          ChatContextKeys.isPinnedAgentSession,
          ChatContextKeys.isArchivedAgentSession.negate()
        )
      }, {
        id: MenuId.AgentSessionsContext,
        group: "0_pin",
        order: 1,
        when: ContextKeyExpr.and(
          ChatContextKeys.isPinnedAgentSession,
          ChatContextKeys.isArchivedAgentSession.negate()
        )
      }]
    });
  }
  runWithSessions(sessions) {
    for (const session of sessions) {
      session.setPinned(false);
    }
  }
};

var renameSupportedSessionTypes = ContextKeyExpr.or(
  ChatContextKeys.agentSessionType.isEqualTo(AgentSessionProviders.Local),
  ChatContextKeyExprs.isAgentHostSessionItem
);

var renameFocusedChatSessionKeybindingWhen = ContextKeyExpr.and(
  ChatContextKeys.inChatSession,
  ChatContextKeys.inQuickChat.negate(),
  IsSessionsWindowContext.negate(),
  ChatContextKeys.chatSessionSupportsRename
);

var RenameAgentSessionAction = class extends BaseAgentSessionAction {
  constructor() {
    super({
      id: AGENT_SESSION_RENAME_ACTION_ID,
      title: localize2(9129, "Rename..."),
      keybinding: [{
        primary: 60 /* F2 */,
        mac: {
          primary: 3 /* Enter */
        },
        weight: 200 /* WorkbenchContrib */ + 1,
        when: ContextKeyExpr.and(
          ChatContextKeys.agentSessionsViewerFocused,
          renameSupportedSessionTypes,
          ChatContextKeys.hasMultipleAgentSessionsSelected.negate()
        )
      }, {
        primary: 60 /* F2 */,
        weight: 200 /* WorkbenchContrib */ + 1,
        when: renameFocusedChatSessionKeybindingWhen
      }],
      menu: {
        id: MenuId.AgentSessionsContext,
        group: "1_edit",
        order: 3,
        when: ContextKeyExpr.and(
          renameSupportedSessionTypes,
          ChatContextKeys.hasMultipleAgentSessionsSelected.negate()
        )
      }
    });
  }
  async run(accessor, context2) {
    const widget = accessor.get(IChatWidgetService).lastFocusedWidget;
    const viewModel = widget?.viewModel;
    if (!context2 && widget && viewModel && isAncestorOfActiveElement(widget.domNode)) {
      const sessionType = getChatSessionType(viewModel.sessionResource);
      const isLocalSession = sessionType === AgentSessionProviders.Local;
      if (!isLocalSession && !accessor.get(IChatSessionsService).sessionSupportsRename(viewModel.sessionResource)) {
        return;
      }
      await this.renameSession(viewModel.sessionResource, viewModel.model.title, !isLocalSession, accessor);
      return;
    }
    await super.run(accessor, context2);
  }
  async runWithSessions(sessions, accessor) {
    const session = sessions.at(0);
    if (!session) {
      return;
    }
    await this.renameSession(session.resource, session.label, isAgentHostAgentSessionItem(session), accessor);
  }
  async renameSession(sessionResource, currentTitle, isContributedSession, accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const renameTarget = isContributedSession ? { type: "contributed", service: accessor.get(IChatSessionsService) } : { type: "local", service: accessor.get(IChatService) };
    const title = await quickInputService.input({ prompt: localize(9126, null), value: currentTitle });
    if (title) {
      if (renameTarget.type === "contributed") {
        await renameTarget.service.renameChatSession(sessionResource, title, CancellationToken.None);
      } else {
        renameTarget.service.setChatSessionTitle(sessionResource, title);
      }
    }
  }
};

var DeleteAgentSessionAction = class extends BaseAgentSessionAction {
  constructor() {
    super({
      id: AGENT_SESSION_DELETE_ACTION_ID,
      title: localize2(9102, "Delete..."),
      menu: {
        id: MenuId.AgentSessionsContext,
        group: "1_edit",
        order: 4,
        when: ContextKeyExpr.or(
          ChatContextKeys.agentSessionType.isEqualTo(AgentSessionProviders.Local),
          ChatContextKeyExprs.isAgentHostSessionItem
        )
      }
    });
  }
  async runWithSessions(sessions, accessor) {
    if (sessions.length === 0) {
      return;
    }
    const chatService = accessor.get(IChatService);
    const chatSessionsService = accessor.get(IChatSessionsService);
    const dialogService = accessor.get(IDialogService);
    const widgetService = accessor.get(IChatWidgetService);
    const commandService = accessor.get(ICommandService);
    const confirmed = await dialogService.confirm({
      message: sessions.length === 1 ? localize(9107, null) : localize(9111, null, sessions.length),
      detail: localize(9109, null),
      primaryButton: localize(9108, null)
    });
    if (!confirmed.confirmed) {
      return;
    }
    const deletedSessionIds = [];
    for (const session of sessions) {
      if (isLocalAgentSessionItem(session)) {
        await widgetService.getWidgetBySessionResource(session.resource)?.clear();
        await chatService.removeHistoryEntry(session.resource);
        const sessionId = LocalChatSessionUri.parseLocalSessionId(session.resource);
        if (sessionId) {
          deletedSessionIds.push(sessionId);
        }
      } else if (isAgentHostAgentSessionItem(session)) {
        try {
          await chatSessionsService.deleteChatSessionItem(session.resource, CancellationToken.None);
          await widgetService.getWidgetBySessionResource(session.resource)?.clear();
        } catch (err) {
          dialogService.error(localize(9110, null, toErrorMessage(err)));
        }
      }
    }
    if (deletedSessionIds.length > 0) {
      commandService.executeCommand("github.copilot.sessionSync.deleteSessionFromCloud", deletedSessionIds).catch(() => {
      });
    }
  }
};

var DeleteAllLocalSessionsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.clearHistory",
      title: localize2(9083, "Delete All Local Workspace Chat Sessions"),
      precondition: ChatContextKeys.enabled,
      category: AGENT_SESSIONS_CATEGORY,
      f1: true
    });
  }
  async run(accessor, ...args2) {
    const chatService = accessor.get(IChatService);
    const widgetService = accessor.get(IChatWidgetService);
    const dialogService = accessor.get(IDialogService);
    const agentSessionsService = accessor.get(IAgentSessionsService);
    const localSessionsCount = agentSessionsService.model.sessions.filter((session) => isLocalAgentSessionItem(session)).length;
    if (localSessionsCount === 0) {
      return;
    }
    const confirmed = await dialogService.confirm({
      message: localSessionsCount === 1 ? localize(9105, null) : localize(9104, null, localSessionsCount),
      detail: localize(9106, null),
      primaryButton: localize(9103, null)
    });
    if (!confirmed.confirmed) {
      return;
    }
    await Promise.all(widgetService.getAllWidgets().map((widget) => widget.clear()));
    await chatService.clearAllHistoryEntries();
  }
};

var BaseOpenAgentSessionAction = class extends BaseAgentSessionAction {
  async runWithSessions(sessions, accessor) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const targetGroup = this.getTargetGroup();
    for (const session of sessions) {
      const uri4 = session.resource;
      await chatWidgetService.openSession(uri4, targetGroup, {
        ...this.getOptions(),
        pinned: true
      });
    }
  }
};

var OpenAgentSessionInEditorGroupAction = class _OpenAgentSessionInEditorGroupAction extends BaseOpenAgentSessionAction {
  static {
    this.id = "workbench.action.chat.openSessionInEditorGroup";
  }
  constructor() {
    super({
      id: _OpenAgentSessionInEditorGroupAction.id,
      title: localize2(9093, "Open as Editor"),
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        mac: {
          primary: 256 /* WinCtrl */ | 3 /* Enter */
        },
        weight: 200 /* WorkbenchContrib */ + 1,
        when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerFocused, IsSessionsWindowContext.negate())
      },
      menu: {
        id: MenuId.AgentSessionsContext,
        when: IsSessionsWindowContext.negate(),
        order: 1,
        group: "navigation"
      }
    });
  }
  getTargetGroup() {
    return ACTIVE_GROUP;
  }
  getOptions() {
    return {};
  }
};

var OpenAgentSessionInNewEditorGroupAction = class _OpenAgentSessionInNewEditorGroupAction extends BaseOpenAgentSessionAction {
  static {
    this.id = "workbench.action.chat.openSessionInNewEditorGroup";
  }
  constructor() {
    super({
      id: _OpenAgentSessionInNewEditorGroupAction.id,
      title: localize2(9094, "Open to the Side"),
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 3 /* Enter */,
        mac: {
          primary: 256 /* WinCtrl */ | 512 /* Alt */ | 3 /* Enter */
        },
        weight: 200 /* WorkbenchContrib */ + 1,
        when: ContextKeyExpr.and(ChatContextKeys.agentSessionsViewerFocused, IsSessionsWindowContext.negate())
      },
      menu: {
        id: MenuId.AgentSessionsContext,
        when: IsSessionsWindowContext.negate(),
        order: 2,
        group: "navigation"
      }
    });
  }
  getTargetGroup() {
    return SIDE_GROUP;
  }
  getOptions() {
    return {};
  }
};

var OpenAgentSessionInNewWindowAction = class _OpenAgentSessionInNewWindowAction extends BaseOpenAgentSessionAction {
  static {
    this.id = "workbench.action.chat.openSessionInNewWindow";
  }
  constructor() {
    super({
      id: _OpenAgentSessionInNewWindowAction.id,
      title: localize2(9095, "Open in New Window"),
      menu: {
        id: MenuId.AgentSessionsContext,
        order: 3,
        group: "navigation"
      }
    });
  }
  getTargetGroup() {
    return AUX_WINDOW_GROUP;
  }
  getOptions() {
    return {
      auxiliary: { compact: true, bounds: { width: 800, height: 640 } }
    };
  }
};

var RefreshAgentSessionsViewerAction = class extends Action2 {
  constructor() {
    super({
      id: "agentSessionsViewer.refresh",
      title: localize2(9128, "Refresh Agent Sessions"),
      icon: Codicon.refresh
      // OpenCode: 对话面板标题行不再显示刷新按钮（命令保留，窗口获得焦点时列表仍自动刷新）
    });
  }
  run(accessor, agentSessionsControl) {
    const control = agentSessionsControl ?? accessor.get(IViewsService).getActiveViewWithId(ChatViewId)?.agentSessionsControl;
    if (control) {
      control.refresh();
    } else {
      accessor.get(ICommandService).executeCommand("sessionsViewPane.refresh");
    }
  }
};

var FindAgentSessionInViewerAction = class extends Action2 {
  constructor() {
    super({
      id: "agentSessionsViewer.find",
      title: localize2(9113, "Find Agent Session"),
      icon: Codicon.search,
      menu: {
        id: MenuId.AgentSessionsToolbar,
        group: "navigation",
        order: 2
      }
    });
  }
  run(accessor, agentSessionsControl) {
    const control = agentSessionsControl ?? accessor.get(IViewsService).getActiveViewWithId(ChatViewId)?.agentSessionsControl;
    if (control) {
      return control.openFind();
    } else {
      return accessor.get(ICommandService).executeCommand("sessionsViewPane.find");
    }
  }
};

var UpdateChatViewWidthAction = class extends Action2 {
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const viewDescriptorService = accessor.get(IViewDescriptorService);
    const configurationService = accessor.get(IConfigurationService);
    const viewsService = accessor.get(IViewsService);
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const chatLocation = viewDescriptorService.getViewLocationById(ChatViewId);
    if (typeof chatLocation !== "number") {
      return;
    }
    const panelPosition = layoutService.getPanelPosition();
    const canResizeView = chatLocation !== 1 /* Panel */ || (panelPosition === 0 /* LEFT */ || panelPosition === 1 /* RIGHT */);
    const chatViewSessionsEnabled = configurationService.getValue("chat.viewSessions.enabled" /* ChatViewSessionsEnabled */);
    if (!chatViewSessionsEnabled) {
      await configurationService.updateValue("chat.viewSessions.enabled" /* ChatViewSessionsEnabled */, true);
    }
    let chatView = viewsService.getActiveViewWithId(ChatViewId);
    if (!chatView) {
      chatView = await viewsService.openView(ChatViewId, false);
    }
    if (!chatView) {
      return;
    }
    const configuredOrientation = configurationService.getValue("chat.viewSessions.orientation" /* ChatViewSessionsOrientation */);
    let validatedConfiguredOrientation;
    if (configuredOrientation === "stacked" || configuredOrientation === "sideBySide") {
      validatedConfiguredOrientation = configuredOrientation;
    } else {
      validatedConfiguredOrientation = "sideBySide";
    }
    const newOrientation = this.getOrientation();
    const lastWidthForOrientation = chatView?.getLastDimensions(newOrientation)?.width;
    if ((!canResizeView || validatedConfiguredOrientation === "sideBySide") && newOrientation === 1 /* Stacked */) {
      chatView.updateConfiguredSessionsViewerOrientation("stacked");
    } else if ((!canResizeView || validatedConfiguredOrientation === "stacked") && newOrientation === 2 /* SideBySide */) {
      chatView.updateConfiguredSessionsViewerOrientation("sideBySide");
    }
    if (!canResizeView) {
      return;
    }
    const part = paneCompositeService.getPartId(chatLocation);
    let currentSize = layoutService.getSize(part);
    const chatViewDefaultWidth = 300;
    const sessionsViewDefaultWidth = chatViewDefaultWidth;
    const sideBySideMinWidth = chatViewDefaultWidth + sessionsViewDefaultWidth + 1;
    if (newOrientation === 2 /* SideBySide */ && currentSize.width >= sideBySideMinWidth || // already wide enough to show side by side
    newOrientation === 1 /* Stacked */ && chatLocation === 2 /* AuxiliaryBar */ && layoutService.isAuxiliaryBarMaximized()) {
      return;
    }
    if (chatLocation === 2 /* AuxiliaryBar */) {
      layoutService.setAuxiliaryBarMaximized(false);
      currentSize = layoutService.getSize(part);
    }
    let newWidth;
    if (newOrientation === 2 /* SideBySide */) {
      newWidth = Math.max(sideBySideMinWidth, lastWidthForOrientation || Math.round(layoutService.mainContainerDimension.width / 2));
    } else {
      newWidth = lastWidthForOrientation || Math.max(chatViewDefaultWidth, currentSize.width - sessionsViewDefaultWidth);
    }
    layoutService.setSize(part, { width: newWidth, height: currentSize.height });
    const actualSize = layoutService.getSize(part);
    if (chatLocation === 2 /* AuxiliaryBar */ && // only applicable for auxiliary bar
    newOrientation === 2 /* SideBySide */ && // only applicable when going to side by side
    actualSize.width < sideBySideMinWidth) {
      layoutService.setAuxiliaryBarMaximized(true);
    }
  }
};

var ShowAgentSessionsSidebar = class _ShowAgentSessionsSidebar extends UpdateChatViewWidthAction {
  static {
    this.ID = "agentSessions.showAgentSessionsSidebar";
  }
  static {
    this.TITLE = localize2(9131, "Show Agent Sessions Sidebar");
  }
  constructor() {
    super({
      id: _ShowAgentSessionsSidebar.ID,
      title: _ShowAgentSessionsSidebar.TITLE,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(1 /* Stacked */)
      ),
      f1: true,
      category: AGENT_SESSIONS_CATEGORY
    });
  }
  getOrientation() {
    return 2 /* SideBySide */;
  }
};

var HideAgentSessionsSidebar = class _HideAgentSessionsSidebar extends UpdateChatViewWidthAction {
  static {
    this.ID = "agentSessions.hideAgentSessionsSidebar";
  }
  static {
    this.TITLE = localize2(9114, "Hide Agent Sessions Sidebar");
  }
  constructor() {
    super({
      id: _HideAgentSessionsSidebar.ID,
      title: _HideAgentSessionsSidebar.TITLE,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(2 /* SideBySide */)
      ),
      f1: true,
      category: AGENT_SESSIONS_CATEGORY
    });
  }
  getOrientation() {
    return 1 /* Stacked */;
  }
};

var ToggleAgentSessionsSidebar = class _ToggleAgentSessionsSidebar extends Action2 {
  static {
    this.ID = "agentSessions.toggleAgentSessionsSidebar";
  }
  static {
    this.TITLE = localize2(9132, "Toggle Agent Sessions Sidebar");
  }
  constructor() {
    super({
      id: _ToggleAgentSessionsSidebar.ID,
      title: _ToggleAgentSessionsSidebar.TITLE,
      precondition: ChatContextKeys.enabled,
      f1: true,
      category: AGENT_SESSIONS_CATEGORY
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    const viewsService = accessor.get(IViewsService);
    const chatView = viewsService.getActiveViewWithId(ChatViewId);
    const currentOrientation = chatView?.getSessionsViewerOrientation();
    if (currentOrientation === 2 /* SideBySide */) {
      await commandService.executeCommand(HideAgentSessionsSidebar.ID);
    } else {
      await commandService.executeCommand(ShowAgentSessionsSidebar.ID);
    }
  }
};

var FocusAgentSessionsAction = class _FocusAgentSessionsAction extends Action2 {
  static {
    this.id = "workbench.action.chat.focusAgentSessionsViewer";
  }
  constructor() {
    super({
      id: _FocusAgentSessionsAction.id,
      title: localize2(9092, "Focus Agent Sessions"),
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ContextKeyExpr.equals(`config.${"chat.viewSessions.enabled" /* ChatViewSessionsEnabled */}`, true)
      ),
      category: AGENT_SESSIONS_CATEGORY,
      f1: true
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const configurationService = accessor.get(IConfigurationService);
    const commandService = accessor.get(ICommandService);
    const chatView = await viewsService.openView(ChatViewId, true);
    const focused = chatView?.focusSessions();
    if (focused) {
      return;
    }
    const configuredSessionsViewerOrientation = configurationService.getValue("chat.viewSessions.orientation" /* ChatViewSessionsOrientation */);
    if (configuredSessionsViewerOrientation === "stacked") {
      await commandService.executeCommand(ACTION_ID_NEW_CHAT);
    } else {
      await commandService.executeCommand(ShowAgentSessionsSidebar.ID);
    }
    chatView?.focusSessions();
  }
};
export { getAgentSessionArchiveActionConstructors, AGENT_SESSIONS_CATEGORY, ToggleShowAgentSessionsAction, agentSessionsOrientationSubmenu, SetAgentSessionsOrientationStackedAction, SetAgentSessionsOrientationSideBySideAction, BaseArchiveAllAgentSessionsAction, ArchiveAllAgentSessionsAction, MarkAllAgentSessionsDoneAction, MarkAllAgentSessionsReadAction, ConfirmArchiveStorageKey, BaseArchiveAgentSessionSectionAction, ArchiveAgentSessionSectionAction, MarkAgentSessionSectionDoneAction, BaseUnarchiveAgentSessionSectionAction, UnarchiveAgentSessionSectionAction, RestoreAgentSessionSectionAction, MarkAgentSessionSectionReadAction, CollapseAllAgentSessionSectionsAction, BaseAgentSessionAction, MarkAgentSessionUnreadAction, MarkAgentSessionReadAction, BaseArchiveAgentSessionAction, ArchiveAgentSessionAction, MarkAgentSessionDoneAction, BaseUnarchiveAgentSessionAction, UnarchiveAgentSessionAction, RestoreAgentSessionAction, PinAgentSessionAction, UnpinAgentSessionAction, renameSupportedSessionTypes, renameFocusedChatSessionKeybindingWhen, RenameAgentSessionAction, DeleteAgentSessionAction, DeleteAllLocalSessionsAction, BaseOpenAgentSessionAction, OpenAgentSessionInEditorGroupAction, OpenAgentSessionInNewEditorGroupAction, OpenAgentSessionInNewWindowAction, RefreshAgentSessionsViewerAction, FindAgentSessionInViewerAction, UpdateChatViewWidthAction, ShowAgentSessionsSidebar, HideAgentSessionsSidebar, ToggleAgentSessionsSidebar, FocusAgentSessionsAction };
