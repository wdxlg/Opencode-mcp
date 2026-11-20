// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentSessions.contribution.ts
import { MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { CollapseAllAgentSessionSectionsAction, DeleteAgentSessionAction, DeleteAllLocalSessionsAction, FindAgentSessionInViewerAction, FocusAgentSessionsAction, HideAgentSessionsSidebar, MarkAgentSessionReadAction, MarkAgentSessionSectionReadAction, MarkAgentSessionUnreadAction, MarkAllAgentSessionsReadAction, OpenAgentSessionInEditorGroupAction, OpenAgentSessionInNewEditorGroupAction, OpenAgentSessionInNewWindowAction, PinAgentSessionAction, RefreshAgentSessionsViewerAction, RenameAgentSessionAction, SetAgentSessionsOrientationSideBySideAction, SetAgentSessionsOrientationStackedAction, ShowAgentSessionsSidebar, ToggleAgentSessionsSidebar, ToggleShowAgentSessionsAction, UnpinAgentSessionAction, getAgentSessionArchiveActionConstructors } from "./module-2531.mjs";
import { registerExternalSessionsFilterMenu } from "./module-2588.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ChatSessionArchiveActionWordingSettingId, getChatSessionArchiveActionWording } from "./module-2494.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { LocalAgentsSessionsController } from "./module-2586.mjs";
import { AgentHostPermissionUiContribution } from "./module-2587.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { AgentSessionsService, IAgentSessionsService } from "./module-1464.mjs";
import "./opencode-chat-taskbar-badge.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentSessions.contribution.ts
registerAction2(FocusAgentSessionsAction);

registerAction2(MarkAllAgentSessionsReadAction);

registerAction2(MarkAgentSessionSectionReadAction);

registerAction2(CollapseAllAgentSessionSectionsAction);

registerAction2(PinAgentSessionAction);

registerAction2(UnpinAgentSessionAction);

registerAction2(RenameAgentSessionAction);

registerAction2(DeleteAgentSessionAction);

registerAction2(DeleteAllLocalSessionsAction);

registerAction2(MarkAgentSessionUnreadAction);

registerAction2(MarkAgentSessionReadAction);

registerAction2(OpenAgentSessionInNewWindowAction);

registerAction2(OpenAgentSessionInEditorGroupAction);

registerAction2(OpenAgentSessionInNewEditorGroupAction);

registerAction2(RefreshAgentSessionsViewerAction);

registerAction2(FindAgentSessionInViewerAction);

registerExternalSessionsFilterMenu(MenuId.AgentSessionsViewerFilterSubMenu, MenuId.AgentSessionsExternalFilterSubMenu, "2_external");

registerAction2(ShowAgentSessionsSidebar);

registerAction2(HideAgentSessionsSidebar);

var AgentSessionArchiveActionsContribution = class extends Disposable {
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
    this.ID = "workbench.contrib.agentSessionArchiveActions";
  }
  registerActions() {
    this.actionRegistrations.clear();
    const wording = getChatSessionArchiveActionWording(this.configurationService);
    for (const action of getAgentSessionArchiveActionConstructors(wording)) {
      this.actionRegistrations.add(registerAction2(action));
    }
  }
};

AgentSessionArchiveActionsContribution = __decorateClass([
  __decorateParam(0, IConfigurationService)
], AgentSessionArchiveActionsContribution);

registerWorkbenchContribution2(AgentSessionArchiveActionsContribution.ID, AgentSessionArchiveActionsContribution, WorkbenchPhase.BlockStartup);

registerAction2(ToggleAgentSessionsSidebar);

registerAction2(ToggleShowAgentSessionsAction);

registerAction2(SetAgentSessionsOrientationStackedAction);

registerAction2(SetAgentSessionsOrientationSideBySideAction);

MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  submenu: MenuId.AgentSessionsViewerFilterSubMenu,
  title: localize2(9082, "Filter Agent Sessions"),
  group: "navigation",
  order: 3,
  icon: Codicon.filter
});

MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  command: {
    id: ShowAgentSessionsSidebar.ID,
    title: ShowAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarRightOff
  },
  group: "navigation",
  order: 5,
  when: ContextKeyExpr.and(
    ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(1 /* Stacked */),
    ChatContextKeys.agentSessionsViewerPosition.isEqualTo(2 /* Right */)
  )
});

MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  command: {
    id: ShowAgentSessionsSidebar.ID,
    title: ShowAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarLeftOff
  },
  group: "navigation",
  order: 5,
  when: ContextKeyExpr.and(
    ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(1 /* Stacked */),
    ChatContextKeys.agentSessionsViewerPosition.isEqualTo(1 /* Left */)
  )
});

MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  command: {
    id: HideAgentSessionsSidebar.ID,
    title: HideAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarRight
  },
  group: "navigation",
  order: 5,
  when: ContextKeyExpr.and(
    ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(2 /* SideBySide */),
    ChatContextKeys.agentSessionsViewerPosition.isEqualTo(2 /* Right */)
  )
});

MenuRegistry.appendMenuItem(MenuId.AgentSessionsToolbar, {
  command: {
    id: HideAgentSessionsSidebar.ID,
    title: HideAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarLeft
  },
  group: "navigation",
  order: 5,
  when: ContextKeyExpr.and(
    ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(2 /* SideBySide */),
    ChatContextKeys.agentSessionsViewerPosition.isEqualTo(1 /* Left */)
  )
});

MenuRegistry.appendMenuItem(MenuId.ChatViewSessionTitleToolbar, {
  command: {
    id: ShowAgentSessionsSidebar.ID,
    title: ShowAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarLeftOff
  },
  group: "navigation",
  order: 1,
  when: ContextKeyExpr.and(
    ContextKeyExpr.or(
      ChatContextKeys.agentSessionsViewerVisible.negate(),
      ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(1 /* Stacked */)
    ),
    ChatContextKeys.agentSessionsViewerPosition.isEqualTo(1 /* Left */)
  )
});

MenuRegistry.appendMenuItem(MenuId.ChatViewSessionTitleToolbar, {
  command: {
    id: ShowAgentSessionsSidebar.ID,
    title: ShowAgentSessionsSidebar.TITLE,
    icon: Codicon.layoutSidebarRightOff
  },
  group: "navigation",
  order: 1,
  when: ContextKeyExpr.and(
    ContextKeyExpr.or(
      ChatContextKeys.agentSessionsViewerVisible.negate(),
      ChatContextKeys.agentSessionsViewerOrientation.isEqualTo(1 /* Stacked */)
    ),
    ChatContextKeys.agentSessionsViewerPosition.isEqualTo(2 /* Right */)
  )
});

registerWorkbenchContribution2(LocalAgentsSessionsController.ID, LocalAgentsSessionsController, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(AgentHostPermissionUiContribution.ID, AgentHostPermissionUiContribution, WorkbenchPhase.BlockRestore);

registerSingleton(IAgentSessionsService, AgentSessionsService, 1 /* Delayed */);
export { AgentSessionArchiveActionsContribution };
