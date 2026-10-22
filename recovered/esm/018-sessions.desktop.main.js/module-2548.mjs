// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatQueueActions.ts
import { ChatContextKeys } from "./module-0966.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { URI } from "./module-0032.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IChatSideChatService } from "./module-2292.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ILogService } from "./module-0095.mjs";
import { captureSideChatSelection } from "./module-2547.mjs";
import { IChatService } from "./module-0973.mjs";
import { isRequestVM } from "./module-0979.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatQueueActions.ts
var editingQueue = ChatContextKeys.editingRequestType.isEqualTo(ChatContextKeys.EditingRequestType.Queue);

var editingSteer = ChatContextKeys.editingRequestType.isEqualTo(ChatContextKeys.EditingRequestType.Steer);

var editingQueueOrSteer = ContextKeyExpr.or(editingQueue, editingSteer);

var queuingActionsPresent = ContextKeyExpr.and(
  ContextKeyExpr.or(ChatContextKeys.requestInProgress, editingQueueOrSteer),
  ChatContextKeys.editingRequestType.notEqualsTo(ChatContextKeys.EditingRequestType.Sent)
);

var steerIsDefault = ContextKeyExpr.equals(`config.${"chat.requestQueuing.defaultAction" /* RequestQueueingDefaultAction */}`, "steer");

var queueIsDefault = steerIsDefault.negate();

var effectiveDefaultIsQueue = ContextKeyExpr.or(
  ContextKeyExpr.and(queueIsDefault, editingQueueOrSteer.negate()),
  editingQueue
);

var effectiveDefaultIsSteer = ContextKeyExpr.or(
  ContextKeyExpr.and(steerIsDefault, editingQueueOrSteer.negate()),
  editingSteer
);

function isRemovePendingRequestContext(context2) {
  return !!context2 && typeof context2 === "object" && "sessionResource" in context2 && "pendingRequestId" in context2 && URI.isUri(context2.sessionResource) && typeof context2.pendingRequestId === "string";
}

var ChatQueueMessageAction = class _ChatQueueMessageAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.queueMessage";
  }
  constructor() {
    super({
      id: _ChatQueueMessageAction.ID,
      title: localize2(8753, "Add to Queue"),
      tooltip: localize(8754, null),
      icon: Codicon.add,
      f1: false,
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.inputHasText,
      keybinding: [{
        when: ContextKeyExpr.and(
          ChatContextKeys.inChatInput,
          effectiveDefaultIsSteer
        ),
        primary: 512 /* Alt */ | 3 /* Enter */,
        weight: 100 /* EditorContrib */ + 1
      }, {
        when: ContextKeyExpr.and(
          ChatContextKeys.inChatInput,
          queuingActionsPresent,
          effectiveDefaultIsQueue
        ),
        primary: 3 /* Enter */,
        weight: 100 /* EditorContrib */ + 1
      }]
    });
  }
  run(accessor, ...args2) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (!widget?.viewModel) {
      return;
    }
    const inputValue = widget.getInput();
    if (!inputValue.trim()) {
      return;
    }
    if (!widget.viewModel.model.requestInProgress.get()) {
      widget.acceptInput();
      return;
    }
    widget.acceptInput(void 0, { queue: "queued" /* Queued */ });
  }
};

var ChatSteerWithMessageAction = class _ChatSteerWithMessageAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.steerWithMessage";
  }
  constructor() {
    super({
      id: _ChatSteerWithMessageAction.ID,
      title: localize2(8759, "Steer with Message"),
      tooltip: localize(8760, null),
      icon: Codicon.newLine,
      f1: false,
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.inputHasText,
      keybinding: [{
        when: ContextKeyExpr.and(
          ChatContextKeys.inChatInput,
          queuingActionsPresent,
          effectiveDefaultIsSteer
        ),
        primary: 3 /* Enter */,
        weight: 100 /* EditorContrib */ + 1
      }, {
        when: ContextKeyExpr.and(
          ChatContextKeys.inChatInput,
          effectiveDefaultIsQueue
        ),
        primary: 512 /* Alt */ | 3 /* Enter */,
        weight: 100 /* EditorContrib */ + 1
      }]
    });
  }
  run(accessor, ...args2) {
    const widgetService = accessor.get(IChatWidgetService);
    const widget = widgetService.lastFocusedWidget;
    if (!widget?.viewModel) {
      return;
    }
    const inputValue = widget.getInput();
    if (!inputValue.trim()) {
      return;
    }
    if (!widget.viewModel.model.requestInProgress.get()) {
      widget.acceptInput();
      return;
    }
    widget.acceptInput(void 0, {
      queue: widget.viewModel.model.lastRequest?.isHiddenFromTranscript ? "queued" /* Queued */ : "steering" /* Steering */
    });
  }
};

var ChatAskInSideChatAction = class _ChatAskInSideChatAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.askInSideChat";
  }
  constructor() {
    super({
      id: _ChatAskInSideChatAction.ID,
      title: localize2(8748, "Ask in Side Chat"),
      tooltip: localize(8750, null),
      icon: Codicon.commentDiscussion,
      f1: false,
      category: CHAT_CATEGORY,
      precondition: ChatContextKeys.inputHasText
    });
  }
  async run(accessor, ...args2) {
    const widgetService = accessor.get(IChatWidgetService);
    const sideChatService = accessor.get(IChatSideChatService);
    const notificationService = accessor.get(INotificationService);
    const logService = accessor.get(ILogService);
    const widget = widgetService.lastFocusedWidget;
    const sessionResource = widget?.viewModel?.model.sessionResource;
    if (!widget || !sessionResource) {
      return;
    }
    const query = widget.getInput().trim();
    if (!query) {
      return;
    }
    if (!sideChatService.canAskInSideChat(sessionResource)) {
      notificationService.warn(localize(8751, null));
      return;
    }
    const selection = captureSideChatSelection(widget);
    widget.setInput("");
    try {
      await sideChatService.askInSideChat(sessionResource, query, selection);
    } catch (err) {
      logService.error("[askInSideChat] Failed to create side chat", err);
      notificationService.error(localize(8749, null));
      if (!widget.getInput()) {
        widget.setInput(query);
      }
    }
  }
};

var ChatRemovePendingRequestAction = class _ChatRemovePendingRequestAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.removePendingRequest";
  }
  constructor() {
    super({
      id: _ChatRemovePendingRequestAction.ID,
      title: localize2(8757, "Remove from Queue"),
      icon: Codicon.closeSmall,
      f1: false,
      category: CHAT_CATEGORY,
      menu: [{
        id: MenuId.ChatMessageTitle,
        group: "navigation",
        order: 4,
        when: ContextKeyExpr.and(
          ChatContextKeys.isRequest,
          ChatContextKeys.isPendingRequest
        )
      }]
    });
  }
  run(accessor, ...args2) {
    const chatService = accessor.get(IChatService);
    const [context2] = args2;
    if (isRequestVM(context2) && context2.pendingKind) {
      chatService.removePendingRequest(context2.sessionResource, context2.id);
      return;
    }
    if (isRemovePendingRequestContext(context2)) {
      chatService.removePendingRequest(context2.sessionResource, context2.pendingRequestId);
      return;
    }
  }
};

var ChatEditPendingRequestAction = class _ChatEditPendingRequestAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.editPendingRequest";
  }
  constructor() {
    super({
      id: _ChatEditPendingRequestAction.ID,
      title: localize2(8752, "Edit"),
      icon: Codicon.edit,
      f1: false,
      category: CHAT_CATEGORY,
      menu: [{
        id: MenuId.ChatMessageTitle,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(
          ChatContextKeys.isRequest,
          ChatContextKeys.isPendingRequest,
          ContextKeyExpr.notEquals(`config.${"chat.editRequests" /* EditRequests */}`, "hover"),
          ContextKeyExpr.notEquals(`config.${"chat.editRequests" /* EditRequests */}`, "input")
        )
      }]
    });
  }
  run(accessor, ...args2) {
    const widgetService = accessor.get(IChatWidgetService);
    const [context2] = args2;
    if (!isRequestVM(context2) || !context2.pendingKind) {
      return;
    }
    const widget = widgetService.getWidgetBySessionResource(context2.sessionResource);
    widget?.startEditing(context2.id);
  }
};

var ChatSendPendingImmediatelyAction = class _ChatSendPendingImmediatelyAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.sendPendingImmediately";
  }
  constructor() {
    super({
      id: _ChatSendPendingImmediatelyAction.ID,
      title: localize2(8758, "Send Immediately"),
      icon: Codicon.newLine,
      f1: false,
      category: CHAT_CATEGORY,
      menu: [{
        id: MenuId.ChatMessageTitle,
        group: "navigation",
        order: 3,
        when: ContextKeyExpr.and(
          ChatContextKeys.isRequest,
          ChatContextKeys.isPendingRequest
        )
      }]
    });
  }
  async run(accessor, ...args2) {
    const chatService = accessor.get(IChatService);
    const [context2] = args2;
    if (!isRequestVM(context2) || !context2.pendingKind) {
      return;
    }
    await chatService.sendPendingRequestImmediately(context2.sessionResource, context2.id);
  }
};

var ChatRemoveAllPendingRequestsAction = class _ChatRemoveAllPendingRequestsAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.removeAllPendingRequests";
  }
  constructor() {
    super({
      id: _ChatRemoveAllPendingRequestsAction.ID,
      title: localize2(8756, "Remove All Queued"),
      icon: Codicon.clearAll,
      f1: false,
      category: CHAT_CATEGORY,
      menu: [{
        id: MenuId.ChatContext,
        group: "navigation",
        order: 3,
        when: ChatContextKeys.hasPendingRequests
      }]
    });
  }
  run(accessor, ...args2) {
    const chatService = accessor.get(IChatService);
    const widgetService = accessor.get(IChatWidgetService);
    const [context2] = args2;
    const widget = isRequestVM(context2) && widgetService.getWidgetBySessionResource(context2.sessionResource) || widgetService.lastFocusedWidget;
    const model = widget?.viewModel?.model;
    if (!model) {
      return;
    }
    for (const pendingRequest of [...model.getPendingRequests()]) {
      chatService.removePendingRequest(model.sessionResource, pendingRequest.request.id);
    }
  }
};

function registerChatQueueActions() {
  registerAction2(ChatQueueMessageAction);
  registerAction2(ChatSteerWithMessageAction);
  registerAction2(ChatAskInSideChatAction);
  registerAction2(ChatRemovePendingRequestAction);
  registerAction2(ChatEditPendingRequestAction);
  registerAction2(ChatSendPendingImmediatelyAction);
  registerAction2(ChatRemoveAllPendingRequestsAction);
  MenuRegistry.appendMenuItem(MenuId.ChatExecuteQueue, {
    command: { id: ChatQueueMessageAction.ID, title: localize2(8753, "Add to Queue"), icon: Codicon.add },
    group: "navigation",
    order: 1
  });
  MenuRegistry.appendMenuItem(MenuId.ChatExecuteQueue, {
    command: { id: ChatSteerWithMessageAction.ID, title: localize2(8759, "Steer with Message"), icon: Codicon.newLine },
    group: "navigation",
    order: 2
  });
  MenuRegistry.appendMenuItem(MenuId.ChatExecute, {
    submenu: MenuId.ChatExecuteQueue,
    title: localize2(8755, "Queue"),
    icon: Codicon.listOrdered,
    when: ContextKeyExpr.and(
      queuingActionsPresent,
      ChatContextKeys.inputHasText
    ),
    group: "navigation",
    order: 4
  });
}
export { isRemovePendingRequestContext, registerChatQueueActions, editingQueue, editingSteer, editingQueueOrSteer, queuingActionsPresent, steerIsDefault, queueIsDefault, effectiveDefaultIsQueue, effectiveDefaultIsSteer, ChatQueueMessageAction, ChatSteerWithMessageAction, ChatAskInSideChatAction, ChatRemovePendingRequestAction, ChatEditPendingRequestAction, ChatSendPendingImmediatelyAction, ChatRemoveAllPendingRequestsAction };
