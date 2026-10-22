// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatNewActions.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { ACTION_ID_NEW_CHAT, ACTION_ID_NEW_EDIT_SESSION, CHAT_CATEGORY, clearChatSessionPreservingType, handleCurrentEditingSession } from "./module-1476.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeyExprs, ChatContextKeys } from "./module-0965.mjs";
import { EditingSessionAction, getEditingSessionContext } from "./module-2056.mjs";
import { ChatViewId, IChatWidgetService } from "./module-0981.mjs";
import { clearChatEditor } from "./module-2564.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { IViewsService } from "./module-1246.mjs";
import { AgentSessionProviders } from "./module-0982.mjs";
import { IChatService } from "./module-0972.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IVoiceSessionController } from "./module-2076.mjs";
import { IDialogService } from "./module-0267.mjs";
import { isEqual2 } from "./module-0034.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatNewActions.ts
function isNewEditSessionActionContext(arg) {
  if (arg && typeof arg === "object") {
    const obj = arg;
    if (obj.inputValue !== void 0 && typeof obj.inputValue !== "string") {
      return false;
    }
    if (obj.agentMode !== void 0 && typeof obj.agentMode !== "boolean") {
      return false;
    }
    if (obj.isPartialQuery !== void 0 && typeof obj.isPartialQuery !== "boolean") {
      return false;
    }
    return true;
  }
  return false;
}

var NewChatAction = class extends Action2 {
  constructor() {
    super({
      id: ACTION_ID_NEW_CHAT,
      title: localize2(8712, "New Chat"),
      category: CHAT_CATEGORY,
      icon: Codicon.plus,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.location.isEqualTo("panel" /* Chat */)),
      f1: true,
      menu: [
        {
          id: MenuId.ChatContext,
          group: "z_clear"
        },
        {
          id: MenuId.ChatNewMenu,
          group: "1_open",
          order: 1,
          when: ContextKeyExpr.and(
            ChatContextKeys.newChatButtonExperimentIcon.notEqualsTo("copilot"),
            ChatContextKeys.newChatButtonExperimentIcon.notEqualsTo("new-session"),
            ChatContextKeys.newChatButtonExperimentIcon.notEqualsTo("comment")
          )
        }
      ],
      keybinding: {
        weight: 200 /* WorkbenchContrib */ + 1,
        primary: 2048 /* CtrlCmd */ | 44 /* KeyN */,
        secondary: [2048 /* CtrlCmd */ | 42 /* KeyL */],
        mac: {
          primary: 2048 /* CtrlCmd */ | 44 /* KeyN */,
          secondary: [256 /* WinCtrl */ | 42 /* KeyL */]
        },
        when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.inChatEditor.negate())
      }
    });
  }
  async run(accessor, ...args2) {
    const executeCommandContext = isNewEditSessionActionContext(args2[0]) ? args2[0] : void 0;
    const context2 = getEditingSessionContext(accessor, args2);
    await runNewChatAction(accessor, context2, executeCommandContext);
  }
};

function registerNewChatActions() {
  MenuRegistry.appendMenuItem(MenuId.ViewTitle, {
    submenu: MenuId.ChatNewMenu,
    title: localize2(8712, "New Chat"),
    icon: Codicon.plus,
    when: ContextKeyExpr.equals("view", ChatViewId),
    group: "navigation",
    order: -1,
    isSplitButton: true
  });
  registerAction2(class NewChatEditorAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chatEditor.newChat",
        title: localize2(8711, "New Chat"),
        icon: Codicon.plus,
        f1: false,
        precondition: ChatContextKeys.enabled
      });
    }
    async run(accessor, ...args2) {
      await clearChatEditor(accessor);
    }
  });
  registerAction2(NewChatAction);
  const iconVariants = [
    { idSuffix: ".copilotIcon", iconValue: "copilot", icon: Codicon.copilot },
    { idSuffix: ".newSessionIcon", iconValue: "new-session", icon: Codicon.newSession },
    { idSuffix: ".commentIcon", iconValue: "comment", icon: Codicon.comment }
  ];
  for (const variant of iconVariants) {
    registerAction2(class extends Action2 {
      constructor() {
        super({
          id: ACTION_ID_NEW_CHAT + variant.idSuffix,
          title: localize2(8712, "New Chat"),
          category: CHAT_CATEGORY,
          icon: variant.icon,
          precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.location.isEqualTo("panel" /* Chat */)),
          f1: false,
          menu: [{
            id: MenuId.ChatNewMenu,
            group: "1_open",
            order: 1,
            when: ChatContextKeys.newChatButtonExperimentIcon.isEqualTo(variant.iconValue)
          }]
        });
      }
      async run(accessor, ...args2) {
        const executeCommandContext = isNewEditSessionActionContext(args2[0]) ? args2[0] : void 0;
        const context2 = getEditingSessionContext(accessor, args2);
        await runNewChatAction(accessor, context2, executeCommandContext);
      }
    });
  }
  CommandsRegistry.registerCommandAlias(ACTION_ID_NEW_EDIT_SESSION, ACTION_ID_NEW_CHAT);
  registerAction2(class NewLocalChatAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.newLocalChat",
        title: localize2(8713, "New Local Chat"),
        category: CHAT_CATEGORY,
        icon: Codicon.plus,
        precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.location.isEqualTo("panel" /* Chat */)),
        f1: false
      });
    }
    async run(accessor, ...args2) {
      const executeCommandContext = isNewEditSessionActionContext(args2[0]) ? args2[0] : void 0;
      const context2 = getEditingSessionContext(accessor, args2);
      if (!context2?.chatWidget) {
        const view = await accessor.get(IViewsService).openView(ChatViewId, true);
        await view?.startNewLocalSession();
        view?.focusInput();
        return;
      }
      await runNewChatAction(accessor, context2, executeCommandContext, AgentSessionProviders.Local);
    }
  });
  MenuRegistry.appendMenuItem(MenuId.ChatViewSessionTitleNavigationToolbar, {
    command: {
      id: ACTION_ID_NEW_CHAT,
      title: localize2(8710, "Go Back"),
      icon: Codicon.arrowLeft
    },
    when: ChatContextKeys.agentSessionsViewerOrientation.notEqualsTo(2 /* SideBySide */),
    // when sessions show side by side, no need for a back button
    group: "navigation",
    order: 1
  });
  MenuRegistry.appendMenuItem(MenuId.ChatTitleBarMenu, {
    command: {
      id: ACTION_ID_NEW_CHAT,
      title: localize2(8712, "New Chat")
    },
    when: ChatContextKeys.enabled,
    group: "b_new",
    order: -1
  });
  registerAction2(class UndoChatEditInteractionAction extends EditingSessionAction {
    constructor() {
      super({
        id: "workbench.action.chat.undoEdit",
        title: localize2(8717, "Undo Last Edit"),
        category: CHAT_CATEGORY,
        icon: Codicon.discard,
        precondition: ContextKeyExpr.and(ChatContextKeys.chatEditingCanUndo, ChatContextKeys.enabled),
        f1: true,
        menu: [{
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals("view", ChatViewId),
          group: "navigation",
          order: -3,
          isHiddenByDefault: true
        }]
      });
    }
    async runEditingSessionAction(accessor, editingSession) {
      await editingSession.undoInteraction();
    }
  });
  registerAction2(class RedoChatEditInteractionAction extends EditingSessionAction {
    constructor() {
      super({
        id: "workbench.action.chat.redoEdit",
        title: localize2(8714, "Redo Last Edit"),
        category: CHAT_CATEGORY,
        icon: Codicon.redo,
        precondition: ContextKeyExpr.and(ChatContextKeys.chatEditingCanRedo, ChatContextKeys.enabled),
        f1: true,
        menu: [
          {
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.equals("view", ChatViewId),
            group: "navigation",
            order: -2,
            isHiddenByDefault: true
          }
        ]
      });
    }
    async runEditingSessionAction(accessor, editingSession) {
      const chatService = accessor.get(IChatService);
      await editingSession.redoInteraction();
      chatService.getSession(editingSession.chatSessionResource)?.setCheckpoint(void 0);
    }
  });
  registerAction2(class RedoChatCheckpoints extends EditingSessionAction {
    constructor() {
      super({
        id: "workbench.action.chat.redoEdit2",
        title: localize2(8715, "Redo"),
        tooltip: localize2(8716, "Reapply discarded workspace changes and chat"),
        category: CHAT_CATEGORY,
        precondition: ContextKeyExpr.and(ChatContextKeys.chatEditingCanRedo, ChatContextKeys.enabled),
        f1: true,
        menu: [{
          id: MenuId.ChatMessageRestoreCheckpoint,
          when: ContextKeyExpr.or(ChatContextKeys.lockedToCodingAgent.negate(), ChatContextKeyExprs.isAgentHostSession),
          group: "navigation",
          order: -1
        }]
      });
    }
    async runEditingSessionAction(accessor, editingSession) {
      const widget = accessor.get(IChatWidgetService);
      while (editingSession.canRedo.get()) {
        await editingSession.redoInteraction();
      }
      const currentWidget = widget.getWidgetBySessionResource(editingSession.chatSessionResource);
      const requestText = currentWidget?.viewModel?.model.checkpoint?.message.text;
      if (currentWidget?.inputEditor.getValue() === requestText) {
        currentWidget?.input.setValue("", false);
      }
      currentWidget?.viewModel?.model.setCheckpoint(void 0);
      currentWidget?.focusInput();
    }
  });
}

async function runNewChatAction(accessor, context2, executeCommandContext, sessionType) {
  const accessibilityService = accessor.get(IAccessibilityService);
  const instantiationService = accessor.get(IInstantiationService);
  const { editingSession, chatWidget: widget } = context2 ?? {};
  if (!widget) {
    return;
  }
  const voiceSessionController = accessor.get(IVoiceSessionController);
  const voiceTarget = voiceSessionController.targetSession.get();
  const currentSession = widget.viewModel?.sessionResource;
  const dialogService = accessor.get(IDialogService);
  const model = widget.viewModel?.model;
  if (model && !await handleCurrentEditingSession(model, void 0, dialogService)) {
    return;
  }
  await editingSession?.stop();
  await instantiationService.invokeFunction(clearChatSessionPreservingType, widget, sessionType);
  const newSession = widget.viewModel?.sessionResource;
  if ((voiceSessionController.isConnected.get() || voiceSessionController.isConnecting.get()) && (!voiceTarget || !!currentSession && isEqual2(voiceTarget, currentSession)) && newSession) {
    voiceSessionController.setTargetSession(newSession);
  }
  widget.attachmentModel.clear(true);
  widget.focusInput();
  accessibilityService.alert(localize(8718, null));
  if (!executeCommandContext) {
    return;
  }
  if (typeof executeCommandContext.agentMode === "boolean") {
    widget.input.setChatMode(executeCommandContext.agentMode ? "agent" /* Agent */ : "edit" /* Edit */);
  } else if (widget.input.currentModeKind === "edit" /* Edit */) {
    widget.input.setChatMode("agent" /* Agent */);
  }
  if (executeCommandContext.inputValue) {
    if (executeCommandContext.isPartialQuery) {
      widget.setInput(executeCommandContext.inputValue);
    } else {
      widget.acceptInput(executeCommandContext.inputValue);
    }
  }
}
export { isNewEditSessionActionContext, registerNewChatActions, runNewChatAction, NewChatAction };
