// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/branchChatSessionAction.ts
import { Action2, MenuId } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IChatService } from "./module-0973.mjs";
import { isRequestVM, isResponseVM } from "./module-0979.mjs";
import { revive } from "./module-0265.mjs";
import { generateUuid } from "./module-0190.mjs";


// src/vs/sessions/contrib/chat/browser/branchChatSessionAction.ts
var ACTION_ID_BRANCH_CHAT_SESSION = "workbench.action.chat.branchChatSession";

var BranchChatSessionAction = class _BranchChatSessionAction extends Action2 {
  static {
    this.ID = ACTION_ID_BRANCH_CHAT_SESSION;
  }
  constructor() {
    super({
      id: _BranchChatSessionAction.ID,
      title: localize2(4322, "Branch Chat"),
      tooltip: localize2(4323, "Branch to new session"),
      icon: Codicon.reply,
      f1: false,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ChatContextKeys.requestInProgress.negate()
      ),
      menu: [{
        id: MenuId.ChatMessageCheckpoint,
        group: "navigation",
        order: 3,
        when: ContextKeyExpr.and(
          ChatContextKeys.isRequest,
          ChatContextKeys.lockedToCodingAgent.negate(),
          ContextKeyExpr.false()
          // TODO: add support again for multi view scenario
        )
      }]
    });
  }
  async run(accessor, ...args2) {
    const item = args2[0];
    const widgetService = accessor.get(IChatWidgetService);
    const chatService = accessor.get(IChatService);
    if (!item || !isRequestVM(item) && !isResponseVM(item)) {
      return;
    }
    const widget = widgetService.getWidgetBySessionResource(item.sessionResource);
    if (!widget || !widget.viewModel) {
      return;
    }
    const chatModel = widget.viewModel.model;
    if (!chatModel) {
      return;
    }
    const checkpointRequestId = isRequestVM(item) ? item.id : item.requestId;
    const serializedData = revive(structuredClone(chatModel.toJSON()));
    serializedData.sessionId = generateUuid();
    delete serializedData.customTitle;
    const checkpointIndex = serializedData.requests.findIndex((r2) => r2.requestId === checkpointRequestId);
    if (checkpointIndex === -1) {
      return;
    }
    serializedData.requests = serializedData.requests.slice(0, checkpointIndex);
    for (const request2 of serializedData.requests) {
      delete request2.shouldBeRemovedOnSend;
      delete request2.isHidden;
    }
    if (serializedData.requests.length === 0) {
      return;
    }
    const modelRef = chatService.loadSessionFromData(serializedData);
    throw new Error("Branching chat sessions is not yet supported." + modelRef.object.title);
  }
};
export { ACTION_ID_BRANCH_CHAT_SESSION, BranchChatSessionAction };
