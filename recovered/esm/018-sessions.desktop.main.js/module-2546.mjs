// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatPromptNavigationActions.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { isRequestVM, isResponseVM } from "./module-0979.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatPromptNavigationActions.ts
function registerChatPromptNavigationActions() {
  registerAction2(class NextUserPromptAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.nextUserPrompt",
        title: localize2(8746, "Next User Prompt"),
        keybinding: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 18 /* DownArrow */,
          weight: 200 /* WorkbenchContrib */,
          when: ChatContextKeys.inChatSession
        },
        precondition: ChatContextKeys.enabled,
        f1: true,
        category: CHAT_CATEGORY
      });
    }
    run(accessor, ...args2) {
      navigateUserPrompts(accessor, false);
    }
  });
  registerAction2(class PreviousUserPromptAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.previousUserPrompt",
        title: localize2(8747, "Previous User Prompt"),
        keybinding: {
          primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 16 /* UpArrow */,
          weight: 200 /* WorkbenchContrib */,
          when: ChatContextKeys.inChatSession
        },
        precondition: ChatContextKeys.enabled,
        f1: true,
        category: CHAT_CATEGORY
      });
    }
    run(accessor, ...args2) {
      navigateUserPrompts(accessor, true);
    }
  });
}

function navigateUserPrompts(accessor, reverse) {
  const chatWidgetService = accessor.get(IChatWidgetService);
  const widget = chatWidgetService.lastFocusedWidget;
  if (!widget) {
    return;
  }
  const items = widget.viewModel?.getItems();
  if (!items || items.length === 0) {
    return;
  }
  const userPrompts = items.filter((item) => isRequestVM(item));
  if (userPrompts.length === 0) {
    return;
  }
  const focused = widget.getFocus();
  let currentIndex = -1;
  if (focused) {
    if (isRequestVM(focused)) {
      currentIndex = userPrompts.findIndex((prompt) => prompt.id === focused.id);
    } else if (isResponseVM(focused)) {
      currentIndex = userPrompts.findIndex((prompt) => prompt.id === focused.requestId);
    }
  }
  let nextIndex;
  if (currentIndex === -1) {
    nextIndex = reverse ? userPrompts.length - 1 : 0;
  } else {
    nextIndex = reverse ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0) {
      nextIndex = 0;
    } else if (nextIndex >= userPrompts.length) {
      nextIndex = userPrompts.length - 1;
    }
    if (nextIndex === currentIndex) {
      return;
    }
  }
  const targetPrompt = userPrompts[nextIndex];
  if (targetPrompt) {
    widget.focus(targetPrompt);
    widget.reveal(targetPrompt);
  }
}
export { registerChatPromptNavigationActions, navigateUserPrompts };
