// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatAccessibilityActions.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { alert } from "./module-0076.mjs";
import { isResponseVM } from "./module-0978.mjs";
import { accessibleViewCurrentProviderId, accessibleViewIsShown } from "./module-1370.mjs";
import { IStorageService } from "./module-0512.mjs";
import { CHAT_ACCESSIBLE_VIEW_INCLUDE_THINKING_STORAGE_KEY, isThinkingContentIncludedInAccessibleView } from "./module-2521.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatAccessibilityActions.ts
var ACTION_ID_FOCUS_CHAT_CONFIRMATION = "workbench.action.chat.focusConfirmation";

var ACTION_ID_TOGGLE_THINKING_CONTENT_ACCESSIBLE_VIEW = "workbench.action.chat.toggleThinkingContentAccessibleView";

var AnnounceChatConfirmationAction = class extends Action2 {
  constructor() {
    super({
      id: ACTION_ID_FOCUS_CHAT_CONFIRMATION,
      title: { value: localize(8421, null), original: "Focus Chat Confirmation" },
      category: { value: localize(8419, null), original: "Chat" },
      precondition: ChatContextKeys.enabled,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 31 /* KeyA */ | 1024 /* Shift */,
        when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, ChatContextKeys.Editing.hasQuestionCarousel.negate())
      }
    });
  }
  async run(accessor) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const pendingWidget = chatWidgetService.getAllWidgets().find((widget) => widget.viewModel?.model.requestNeedsInput.get());
    if (!pendingWidget) {
      alert(localize(8422, null));
      return;
    }
    const viewModel = pendingWidget.viewModel;
    if (!viewModel) {
      alert(localize(8420, null));
      return;
    }
    let firstConfirmationElement;
    const lastResponse = viewModel.getItems()[viewModel.getItems().length - 1];
    if (isResponseVM(lastResponse)) {
      pendingWidget.reveal(lastResponse);
      const confirmationWidgets = pendingWidget.domNode.querySelectorAll(".chat-confirmation-widget-container[tabindex]");
      if (confirmationWidgets.length > 0) {
        firstConfirmationElement = confirmationWidgets[confirmationWidgets.length - 1];
      }
    }
    if (firstConfirmationElement) {
      if (firstConfirmationElement.contains(pendingWidget.domNode.ownerDocument.activeElement)) {
        pendingWidget.focusInput();
      } else {
        firstConfirmationElement.scrollIntoView({ block: "nearest" });
        firstConfirmationElement.focus();
      }
    } else {
      alert(localize(8423, null));
    }
  }
};

var ToggleThinkingContentAccessibleViewAction = class extends Action2 {
  constructor() {
    super({
      id: ACTION_ID_TOGGLE_THINKING_CONTENT_ACCESSIBLE_VIEW,
      title: { value: localize(8426, null), original: "Toggle Thinking Content in Accessible View" },
      category: { value: localize(8419, null), original: "Chat" },
      precondition: ChatContextKeys.enabled,
      f1: true,
      keybinding: {
        primary: 512 /* Alt */ | 50 /* KeyT */,
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "panelChat" /* PanelChat */))
      }
    });
  }
  async run(accessor) {
    const storageService = accessor.get(IStorageService);
    const includeThinking = isThinkingContentIncludedInAccessibleView(storageService);
    const updatedValue = !includeThinking;
    storageService.store(CHAT_ACCESSIBLE_VIEW_INCLUDE_THINKING_STORAGE_KEY, updatedValue, 0 /* PROFILE */, 0 /* USER */);
    alert(
      updatedValue ? localize(8425, null) : localize(8424, null)
    );
  }
};

function registerChatAccessibilityActions() {
  registerAction2(AnnounceChatConfirmationAction);
  registerAction2(ToggleThinkingContentAccessibleViewAction);
}
export { registerChatAccessibilityActions, ACTION_ID_FOCUS_CHAT_CONFIRMATION, ACTION_ID_TOGGLE_THINKING_CONTENT_ACCESSIBLE_VIEW, AnnounceChatConfirmationAction, ToggleThinkingContentAccessibleViewAction };
