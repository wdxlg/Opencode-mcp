// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatQuickInputActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { Codicon } from "./module-0085.mjs";
import { IQuickChatService } from "./module-0982.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { Selection } from "./module-0107.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatQuickInputActions.ts
var ASK_QUICK_QUESTION_ACTION_ID = "workbench.action.quickchat.toggle";

function registerQuickChatActions() {
  registerAction2(QuickChatGlobalAction);
  registerAction2(AskQuickChatAction);
  registerAction2(class OpenInChatViewAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.quickchat.openInChatView",
        title: localize2(8762, "Open in Chat View"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.chatSparkle,
        menu: {
          id: MenuId.ChatInputSide,
          group: "navigation",
          order: 10
        }
      });
    }
    run(accessor) {
      const quickChatService = accessor.get(IQuickChatService);
      quickChatService.openInChatView();
    }
  });
  registerAction2(class CloseQuickChatAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.quickchat.close",
        title: localize2(8761, "Close Quick Chat"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.closeSmall,
        menu: {
          id: MenuId.ChatInputSide,
          group: "navigation",
          order: 20
        }
      });
    }
    run(accessor) {
      const quickChatService = accessor.get(IQuickChatService);
      quickChatService.close();
    }
  });
}

var QuickChatGlobalAction = class extends Action2 {
  constructor() {
    super({
      id: ASK_QUICK_QUESTION_ACTION_ID,
      title: localize2(8764, "Open Quick Chat"),
      precondition: ChatContextKeys.enabled,
      icon: Codicon.chatSparkle,
      f1: false,
      category: CHAT_CATEGORY,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 42 /* KeyL */
      },
      menu: {
        id: MenuId.ChatTitleBarMenu,
        group: "a_open",
        order: 4
      },
      metadata: {
        description: localize(8765, null),
        args: [{
          name: "args",
          schema: {
            anyOf: [
              {
                type: "object",
                required: ["query"],
                properties: {
                  query: {
                    description: localize(8767, null),
                    type: "string"
                  },
                  isPartialQuery: {
                    description: localize(8766, null),
                    type: "boolean"
                  }
                }
              },
              {
                type: "string",
                description: localize(8767, null)
              }
            ]
          }
        }]
      }
    });
  }
  run(accessor, query) {
    const quickChatService = accessor.get(IQuickChatService);
    let options3;
    switch (typeof query) {
      case "string":
        options3 = { query };
        break;
      case "object":
        options3 = query;
        break;
    }
    if (options3?.query) {
      options3.selection = new Selection(1, options3.query.length + 1, 1, options3.query.length + 1);
    }
    quickChatService.toggle(options3);
  }
};

var AskQuickChatAction = class extends Action2 {
  constructor() {
    super({
      id: `workbench.action.openQuickChat`,
      category: CHAT_CATEGORY,
      title: localize2(8763, "Open Quick Chat"),
      precondition: ChatContextKeys.enabled,
      f1: true
    });
  }
  run(accessor, query) {
    const quickChatService = accessor.get(IQuickChatService);
    quickChatService.toggle(query ? {
      query,
      selection: new Selection(1, query.length + 1, 1, query.length + 1)
    } : void 0);
  }
};
export { registerQuickChatActions, ASK_QUICK_QUESTION_ACTION_ID, QuickChatGlobalAction, AskQuickChatAction };
