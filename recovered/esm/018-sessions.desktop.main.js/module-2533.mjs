// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatFileTreeActions.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { isResponseVM } from "./module-0979.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatFileTreeActions.ts
function registerChatFileTreeActions() {
  registerAction2(class NextFileTreeAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.nextFileTree",
        title: localize2(8675, "Next File Tree"),
        keybinding: {
          primary: 2048 /* CtrlCmd */ | 67 /* F9 */,
          weight: 200 /* WorkbenchContrib */,
          when: ChatContextKeys.inChatSession
        },
        precondition: ChatContextKeys.enabled,
        f1: true,
        category: CHAT_CATEGORY
      });
    }
    run(accessor, ...args2) {
      navigateTrees(accessor, false);
    }
  });
  registerAction2(class PreviousFileTreeAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.previousFileTree",
        title: localize2(8676, "Previous File Tree"),
        keybinding: {
          primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 67 /* F9 */,
          weight: 200 /* WorkbenchContrib */,
          when: ChatContextKeys.inChatSession
        },
        precondition: ChatContextKeys.enabled,
        f1: true,
        category: CHAT_CATEGORY
      });
    }
    run(accessor, ...args2) {
      navigateTrees(accessor, true);
    }
  });
}

function navigateTrees(accessor, reverse) {
  const chatWidgetService = accessor.get(IChatWidgetService);
  const widget = chatWidgetService.lastFocusedWidget;
  if (!widget) {
    return;
  }
  const focused = !widget.inputEditor.hasWidgetFocus() && widget.getFocus();
  const focusedResponse = isResponseVM(focused) ? focused : void 0;
  const currentResponse = focusedResponse ?? widget.viewModel?.getItems().reverse().find((item) => isResponseVM(item));
  if (!currentResponse) {
    return;
  }
  widget.reveal(currentResponse);
  const responseFileTrees = widget.getFileTreeInfosForResponse(currentResponse);
  const lastFocusedFileTree = widget.getLastFocusedFileTreeForResponse(currentResponse);
  const focusIdx = lastFocusedFileTree ? (lastFocusedFileTree.treeIndex + (reverse ? -1 : 1) + responseFileTrees.length) % responseFileTrees.length : reverse ? responseFileTrees.length - 1 : 0;
  responseFileTrees[focusIdx]?.focus();
}
export { registerChatFileTreeActions, navigateTrees };
