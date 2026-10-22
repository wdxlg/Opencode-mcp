// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatElicitationActions.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { isResponseVM } from "./module-0979.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatElicitationActions.ts
var AcceptElicitationRequestActionId = "workbench.action.chat.acceptElicitation";

var AcceptElicitationRequestAction = class extends Action2 {
  constructor() {
    super({
      id: AcceptElicitationRequestActionId,
      title: localize2(8639, "Accept Request"),
      f1: false,
      category: CHAT_CATEGORY,
      keybinding: {
        when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.Editing.hasElicitationRequest),
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        weight: 200 /* WorkbenchContrib */ + 1
      }
    });
  }
  async run(accessor) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = chatWidgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const items = widget.viewModel?.getItems();
    if (!items?.length) {
      return;
    }
    for (let i2 = items.length - 1; i2 >= 0; i2--) {
      const item = items[i2];
      if (!isResponseVM(item)) {
        continue;
      }
      for (const content of item.response.value) {
        if (content.kind === "elicitation2" && content.state.get() === "pending" /* Pending */) {
          await content.accept(true);
          widget.focusInput();
          return;
        }
      }
    }
  }
};

function registerChatElicitationActions() {
  registerAction2(AcceptElicitationRequestAction);
}
export { registerChatElicitationActions, AcceptElicitationRequestActionId, AcceptElicitationRequestAction };
