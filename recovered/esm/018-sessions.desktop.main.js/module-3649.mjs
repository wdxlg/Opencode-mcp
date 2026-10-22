// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/chat.contribution.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { EditorAreaFocusContext, IsSessionsWindowContext, SideBarVisibleContext } from "./module-0950.mjs";
import { SessionsChatBackgroundAvailableContext, SessionsChatBackgroundConfiguredContext, SessionsChatBackgroundImageConfiguredContext, SessionsTitleBarNewSessionEnabledContext, SessionsWelcomeVisibleContext } from "./module-1770.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { AGENT_SESSIONS_CHAT_BACKGROUND_CODICONS_PRESET, AGENT_SESSIONS_CHAT_BACKGROUND_IMAGE_LAYOUT_SETTING, AGENT_SESSIONS_PREFERRED_DARK_CHAT_BACKGROUND_IMAGE_SETTING, AGENT_SESSIONS_PREFERRED_LIGHT_CHAT_BACKGROUND_IMAGE_SETTING, ISessionsChatBackgroundService, SessionsChatBackgroundService, chatBackgroundImageLayoutValues } from "./module-3503.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { NEW_SESSION_ACTION_ID } from "./module-3644.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { Menus } from "./module-3437.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsManagementService, inheritableSessionTarget } from "./module-1766.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { status } from "./module-0076.mjs";
import { Schemas } from "./module-0033.mjs";
import { BranchChatSessionAction } from "./module-3531.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { RunScriptContribution } from "./module-3536.mjs";
import { SessionsOpenerParticipantContribution } from "./module-3636.mjs";
import { OpenSessionLinkOpenerContribution } from "./module-3637.mjs";
import { RegisterDefaultSessionTaskRunnersContribution } from "./module-3548.mjs";
import { AGENT_HOST_RUN_WORKTREE_CREATED_TASKS_SETTING, WorktreeCreatedTaskDispatcher } from "./module-3638.mjs";
import { SessionsChatPetAchievementContribution } from "./module-3648.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IPromptsService } from "./module-0987.mjs";
import { AgenticPromptsService } from "./module-3549.mjs";
import { ISessionTaskRunnerRegistry, SessionTaskRunnerRegistry } from "./module-3533.mjs";
import { ISessionsTasksService, SessionsTasksService } from "./module-3534.mjs";
import { IAICustomizationWorkspaceService } from "./module-0996.mjs";
import { SessionsAICustomizationWorkspaceService } from "./module-3550.mjs";
import { ICustomizationHarnessService } from "./module-1032.mjs";
import { SessionsCustomizationHarnessService } from "./module-3551.mjs";
import { IChatViewFactory } from "./module-3487.mjs";
import { ChatViewFactory } from "./module-3634.mjs";
import { ISessionsChatViewStateService, SessionsChatViewStateService } from "./module-3632.mjs";
import { IChatResponseFileChangesService } from "./module-2233.mjs";
import { SessionsChatResponseFileChangesService } from "./module-3647.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { SessionsChatAccessibilityHelp } from "./module-3635.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { AGENT_SESSIONS_SCOPED_INPUT_HISTORY_SETTING } from "./module-3577.mjs";


// src/vs/sessions/contrib/chat/browser/chat.contribution.ts
var CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_COMMAND_ID = "workbench.action.chat.changeAgentSessionsBackground";

var CLEAR_AGENT_SESSIONS_CHAT_BACKGROUND_COMMAND_ID = "workbench.action.chat.clearAgentSessionsBackground";

var CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_LAYOUT_COMMAND_ID = "workbench.action.chat.changeAgentSessionsBackgroundLayout";

var CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_WHEN = ContextKeyExpr.and(IsSessionsWindowContext, SessionsChatBackgroundAvailableContext);

var CLEAR_AGENT_SESSIONS_CHAT_BACKGROUND_WHEN = ContextKeyExpr.and(CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_WHEN, SessionsChatBackgroundConfiguredContext);

var CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_LAYOUT_WHEN = ContextKeyExpr.and(CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_WHEN, SessionsChatBackgroundImageConfiguredContext);

var chatBackgroundTypeItems = [{
  kind: "codicons",
  label: localize(4365, null),
  detail: localize(4364, null)
}, {
  kind: "image",
  label: localize(4367, null),
  detail: localize(4366, null)
}];

var chatBackgroundImageLayoutMetadata = {
  repeat: {
    label: localize(4353, null),
    detail: localize(4352, null)
  },
  stretch: {
    label: localize(4357, null),
    detail: localize(4356, null)
  },
  center: {
    label: localize(4349, null),
    detail: localize(4348, null)
  },
  top: {
    label: localize(4359, null),
    detail: localize(4358, null)
  },
  "top-right": {
    label: localize(4363, null),
    detail: localize(4362, null)
  },
  "top-left": {
    label: localize(4361, null),
    detail: localize(4360, null)
  },
  bottom: {
    label: localize(4343, null),
    detail: localize(4342, null)
  },
  "bottom-right": {
    label: localize(4347, null),
    detail: localize(4346, null)
  },
  "bottom-left": {
    label: localize(4345, null),
    detail: localize(4344, null)
  },
  left: {
    label: localize(4351, null),
    detail: localize(4350, null)
  },
  right: {
    label: localize(4355, null),
    detail: localize(4354, null)
  }
};

var chatBackgroundImageLayoutItems = chatBackgroundImageLayoutValues.map((layout2) => ({
  layout: layout2,
  ...chatBackgroundImageLayoutMetadata[layout2]
}));

var NewChatInSessionsWindowAction = class extends Action2 {
  constructor() {
    super({
      id: NEW_SESSION_ACTION_ID,
      title: localize2(4387, "New Session"),
      category: CHAT_CATEGORY,
      f1: true,
      keybinding: {
        weight: 250 /* SessionsContrib */,
        // Don't shadow Ctrl/Cmd+N (and Ctrl/Cmd+L) when focus is in the
        // editor area so the standard editor commands (new untitled file,
        // expand line selection) handle the shortcut instead.
        when: EditorAreaFocusContext.negate(),
        primary: 2048 /* CtrlCmd */ | 44 /* KeyN */,
        secondary: [2048 /* CtrlCmd */ | 42 /* KeyL */],
        mac: {
          primary: 2048 /* CtrlCmd */ | 44 /* KeyN */,
          secondary: [256 /* WinCtrl */ | 42 /* KeyL */]
        }
      },
      menu: [
        {
          id: Menus.SidebarSessionsHeader,
          group: "navigation",
          // Render before the filter (order 10) and find (order 20)
          // actions so the sessions sidebar header reads: New, Filter, Find.
          order: 0
        },
        {
          id: Menus.TitleBarLeftLayout,
          group: "navigation",
          order: 1,
          // Show in the titlebar only when the sidebar is hidden, gated behind an A/B experiment.
          when: ContextKeyExpr.and(SideBarVisibleContext.toNegated(), SessionsWelcomeVisibleContext.toNegated(), SessionsTitleBarNewSessionEnabledContext)
        }
      ]
    });
  }
  run(accessor) {
    const sessionsService = accessor.get(ISessionsService);
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const activeSession = sessionsService.activeSession.get();
    const isQuickChat2 = activeSession?.isQuickChat?.get() ?? false;
    const folderUri = isQuickChat2 ? void 0 : activeSession?.workspace.get()?.uri;
    sessionsService.openNewSession({
      folderUri,
      ...inheritableSessionTarget(sessionsManagementService, activeSession, folderUri)
    });
  }
};

registerAction2(NewChatInSessionsWindowAction);

var SetChatBackgroundAction = class extends Action2 {
  constructor() {
    super({
      id: CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_COMMAND_ID,
      title: localize2(4379, "Set Background..."),
      category: CHAT_CATEGORY,
      precondition: CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_WHEN,
      menu: [{
        id: MenuId.CommandPalette,
        when: CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_WHEN
      }, {
        id: Menus.SessionChatBackgroundContext,
        group: "navigation",
        order: 1,
        when: SessionsChatBackgroundAvailableContext
      }]
    });
  }
  async run(accessor) {
    const backgroundService = accessor.get(ISessionsChatBackgroundService);
    const quickInputService = accessor.get(IQuickInputService);
    const fileDialogService = accessor.get(IFileDialogService);
    const backgroundKind = backgroundService.getBackground()?.kind;
    const recentImages = backgroundService.getRecentBackgroundImages();
    const recentItems = recentImages.map((image2) => ({
      kind: "recentImage",
      image: image2,
      label: basename2(image2) || image2.fsPath,
      detail: image2.fsPath
    }));
    const items = [...chatBackgroundTypeItems];
    if (recentItems.length > 0) {
      items.push({
        type: "separator",
        label: localize(4368, null)
      }, ...recentItems);
    }
    const currentImage = backgroundService.getConfiguredBackgroundImage();
    const backgroundType = await quickInputService.pick(items, {
      title: localize(4386, null),
      placeHolder: localize(4384, null),
      activeItem: backgroundKind === "image" ? recentItems.find((item) => currentImage && isEqual2(item.image, currentImage)) : chatBackgroundTypeItems.find((item) => item.kind === backgroundKind)
    });
    if (!backgroundType) {
      return;
    }
    if (backgroundType.kind === "codicons") {
      await backgroundService.setBackground(AGENT_SESSIONS_CHAT_BACKGROUND_CODICONS_PRESET);
      status(localize(4380, null));
      return;
    }
    if (backgroundType.kind === "recentImage") {
      await backgroundService.setBackground(backgroundType.image);
      status(localize(4385, null, backgroundType.label));
      return;
    }
    const selected = await fileDialogService.showOpenDialog({
      title: localize(4381, null),
      openLabel: localize(4383, null),
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: [{
        name: localize(4369, null),
        extensions: ["avif", "bmp", "gif", "ico", "jpeg", "jpg", "png", "svg", "webp"]
      }],
      availableFileSystems: [Schemas.file],
      defaultUri: backgroundService.getConfiguredBackgroundImage()
    });
    const image = selected?.[0];
    if (!image) {
      return;
    }
    await backgroundService.setBackground(image);
    status(localize(4382, null));
  }
};

registerAction2(SetChatBackgroundAction);

var ChangeChatBackgroundLayoutAction = class extends Action2 {
  constructor() {
    super({
      id: CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_LAYOUT_COMMAND_ID,
      title: localize2(4370, "Change Background Layout..."),
      category: CHAT_CATEGORY,
      precondition: CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_LAYOUT_WHEN,
      menu: [{
        id: MenuId.CommandPalette,
        when: CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_LAYOUT_WHEN
      }, {
        id: Menus.SessionChatBackgroundContext,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(SessionsChatBackgroundAvailableContext, SessionsChatBackgroundImageConfiguredContext)
      }]
    });
  }
  async run(accessor) {
    const backgroundService = accessor.get(ISessionsChatBackgroundService);
    const currentLayout = backgroundService.getBackgroundImageLayout();
    let selected;
    try {
      selected = await accessor.get(IQuickInputService).pick(chatBackgroundImageLayoutItems, {
        title: localize(4373, null),
        placeHolder: localize(4372, null),
        activeItem: chatBackgroundImageLayoutItems.find((item) => item.layout === currentLayout),
        onDidFocus: (item) => void backgroundService.setBackgroundImageLayout(item.layout, false)
      });
    } finally {
      await backgroundService.setBackgroundImageLayout(selected?.layout ?? currentLayout, selected !== void 0);
    }
    if (selected && selected.layout !== currentLayout) {
      status(localize(4371, null, selected.label));
    }
  }
};

registerAction2(ChangeChatBackgroundLayoutAction);

var ClearChatBackgroundAction = class extends Action2 {
  constructor() {
    super({
      id: CLEAR_AGENT_SESSIONS_CHAT_BACKGROUND_COMMAND_ID,
      title: localize2(4374, "Clear Background"),
      category: CHAT_CATEGORY,
      precondition: CLEAR_AGENT_SESSIONS_CHAT_BACKGROUND_WHEN,
      menu: [{
        id: MenuId.CommandPalette,
        when: CLEAR_AGENT_SESSIONS_CHAT_BACKGROUND_WHEN
      }, {
        id: Menus.SessionChatBackgroundContext,
        group: "navigation",
        order: 3,
        when: ContextKeyExpr.and(SessionsChatBackgroundAvailableContext, SessionsChatBackgroundConfiguredContext)
      }]
    });
  }
  async run(accessor) {
    await accessor.get(ISessionsChatBackgroundService).clearBackground();
    status(localize(4375, null));
  }
};

registerAction2(ClearChatBackgroundAction);

registerAction2(BranchChatSessionAction);

registerWorkbenchContribution2(RunScriptContribution.ID, RunScriptContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(SessionsOpenerParticipantContribution.ID, SessionsOpenerParticipantContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(OpenSessionLinkOpenerContribution.ID, OpenSessionLinkOpenerContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(RegisterDefaultSessionTaskRunnersContribution.ID, RegisterDefaultSessionTaskRunnersContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(WorktreeCreatedTaskDispatcher.ID, WorktreeCreatedTaskDispatcher, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(SessionsChatPetAchievementContribution.ID, SessionsChatPetAchievementContribution, WorkbenchPhase.AfterRestored);

registerSingleton(IPromptsService, AgenticPromptsService, 1 /* Delayed */);

registerSingleton(ISessionTaskRunnerRegistry, SessionTaskRunnerRegistry, 1 /* Delayed */);

registerSingleton(ISessionsTasksService, SessionsTasksService, 1 /* Delayed */);

registerSingleton(IAICustomizationWorkspaceService, SessionsAICustomizationWorkspaceService, 1 /* Delayed */);

registerSingleton(ICustomizationHarnessService, SessionsCustomizationHarnessService, 1 /* Delayed */);

registerSingleton(IChatViewFactory, ChatViewFactory, 1 /* Delayed */);

registerSingleton(ISessionsChatViewStateService, SessionsChatViewStateService, 1 /* Delayed */);

registerSingleton(IChatResponseFileChangesService, SessionsChatResponseFileChangesService, 1 /* Delayed */);

registerSingleton(ISessionsChatBackgroundService, SessionsChatBackgroundService, 1 /* Delayed */);

AccessibleViewRegistry.register(new SessionsChatAccessibilityHelp());

Registry.as(Extensions4.Configuration).registerConfiguration({
  properties: {
    [AGENT_HOST_RUN_WORKTREE_CREATED_TASKS_SETTING]: {
      type: "boolean",
      default: true,
      scope: 1 /* APPLICATION */,
      description: localize(4340, null)
    },
    [AGENT_SESSIONS_SCOPED_INPUT_HISTORY_SETTING]: {
      type: "boolean",
      default: true,
      scope: 1 /* APPLICATION */,
      description: localize(4378, null)
    },
    [AGENT_SESSIONS_PREFERRED_DARK_CHAT_BACKGROUND_IMAGE_SETTING]: {
      type: "string",
      default: "",
      scope: 2 /* MACHINE */,
      markdownDescription: localize(4376, null),
      examples: ["codicons"],
      tags: ["experimental"],
      ignoreSync: true
    },
    [AGENT_SESSIONS_PREFERRED_LIGHT_CHAT_BACKGROUND_IMAGE_SETTING]: {
      type: "string",
      default: "",
      scope: 2 /* MACHINE */,
      markdownDescription: localize(4377, null),
      examples: ["codicons"],
      tags: ["experimental"],
      ignoreSync: true
    },
    [AGENT_SESSIONS_CHAT_BACKGROUND_IMAGE_LAYOUT_SETTING]: {
      type: "string",
      enum: [...chatBackgroundImageLayoutValues],
      enumItemLabels: chatBackgroundImageLayoutItems.map((item) => item.label),
      enumDescriptions: chatBackgroundImageLayoutItems.map((item) => item.detail),
      default: "repeat",
      scope: 1 /* APPLICATION */,
      markdownDescription: localize(4341, null),
      tags: ["experimental"]
    }
  }
});
export { CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_COMMAND_ID, CLEAR_AGENT_SESSIONS_CHAT_BACKGROUND_COMMAND_ID, CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_LAYOUT_COMMAND_ID, CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_WHEN, CLEAR_AGENT_SESSIONS_CHAT_BACKGROUND_WHEN, CHANGE_AGENT_SESSIONS_CHAT_BACKGROUND_LAYOUT_WHEN, chatBackgroundTypeItems, chatBackgroundImageLayoutMetadata, chatBackgroundImageLayoutItems, NewChatInSessionsWindowAction, SetChatBackgroundAction, ChangeChatBackgroundLayoutAction, ClearChatBackgroundAction };
