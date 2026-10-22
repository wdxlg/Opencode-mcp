// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatFindActions.ts
import { IChatWidgetService } from "./module-0982.mjs";
import { getWindow, isAncestor, isAncestorOfActiveElement } from "./module-0075.mjs";
import { NextMatchFindAction, PreviousMatchFindAction, StartFindAction, getSelectionSearchString } from "./module-0677.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { EditorContextKeys } from "./module-0154.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatFindActions.ts
function resolveFocusedChatWidget(widgets2, lastFocusedWidget2, isFocusAncestor) {
  return widgets2.find((w) => w.getFindController() && isFocusAncestor(w.domNode)) ?? lastFocusedWidget2;
}

function getFocusedFindWidget(accessor) {
  const widgetService = accessor.get(IChatWidgetService);
  return resolveFocusedChatWidget(widgetService.getAllWidgets(), widgetService.lastFocusedWidget, isAncestorOfActiveElement);
}

function getFocusedFindController(accessor) {
  return getFocusedFindWidget(accessor)?.getFindController();
}

function getSeedSearchText(targetWindow, codeEditor) {
  const domSelection = targetWindow.getSelection()?.toString();
  if (domSelection && domSelection.trim().length > 0) {
    return domSelection;
  }
  const editorSelection = codeEditor && getSelectionSearchString(codeEditor, "single", false);
  return editorSelection ?? void 0;
}

function findOwningChatWidget(accessor, codeEditor) {
  const editorDomNode = codeEditor.getDomNode();
  if (!editorDomNode) {
    return void 0;
  }
  return accessor.get(IChatWidgetService).getAllWidgets().find((widget) => widget.getFindController() && isAncestor(editorDomNode, widget.domNode));
}

function registerChatFindActions() {
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.find" /* Find */,
        title: localize2(8677, "Find in Chat"),
        category: CHAT_CATEGORY,
        f1: true,
        precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.findSupported),
        keybinding: {
          when: ContextKeyExpr.and(ChatContextKeys.findSupported, ChatContextKeys.inChatSession, EditorContextKeys.focus.toNegated()),
          primary: 2048 /* CtrlCmd */ | 36 /* KeyF */,
          weight: 200 /* WorkbenchContrib */
        }
      });
    }
    run(accessor) {
      const widget = getFocusedFindWidget(accessor);
      const controller = widget?.getFindController();
      if (!widget || !controller) {
        return;
      }
      controller.show(getSeedSearchText(getWindow(widget.domNode)));
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.hideFind" /* FindHide */,
        title: localize2(8680, "Hide Find in Chat"),
        keybinding: {
          when: ContextKeyExpr.and(ChatContextKeys.inChatSession, ChatContextKeys.findWidgetVisible, ContextKeyExpr.or(ChatContextKeys.findWidgetFocused, ChatContextKeys.findInputFocused)),
          primary: 9 /* Escape */,
          weight: 200 /* WorkbenchContrib */
        }
      });
    }
    run(accessor) {
      getFocusedFindController(accessor)?.hide();
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.findNext" /* FindNext */,
        title: localize2(8678, "Find Next in Chat"),
        keybinding: [
          {
            when: ContextKeyExpr.and(ChatContextKeys.findSupported, ChatContextKeys.inChatSession, EditorContextKeys.focus.toNegated()),
            primary: 61 /* F3 */,
            mac: { primary: 2048 /* CtrlCmd */ | 37 /* KeyG */, secondary: [61 /* F3 */] },
            weight: 200 /* WorkbenchContrib */
          },
          {
            when: ChatContextKeys.findInputFocused,
            primary: 3 /* Enter */,
            weight: 200 /* WorkbenchContrib */
          }
        ]
      });
    }
    run(accessor) {
      getFocusedFindController(accessor)?.next();
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.findPrevious" /* FindPrevious */,
        title: localize2(8679, "Find Previous in Chat"),
        keybinding: [
          {
            when: ContextKeyExpr.and(ChatContextKeys.findSupported, ChatContextKeys.inChatSession, EditorContextKeys.focus.toNegated()),
            primary: 1024 /* Shift */ | 61 /* F3 */,
            mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KeyG */, secondary: [1024 /* Shift */ | 61 /* F3 */] },
            weight: 200 /* WorkbenchContrib */
          },
          {
            when: ChatContextKeys.findInputFocused,
            primary: 1024 /* Shift */ | 3 /* Enter */,
            weight: 200 /* WorkbenchContrib */
          }
        ]
      });
    }
    run(accessor) {
      getFocusedFindController(accessor)?.previous();
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.toggleFindCaseSensitive" /* ToggleFindCaseSensitive */,
        title: localize2(8681, "Toggle Find Case Sensitive in Chat"),
        keybinding: {
          when: ChatContextKeys.findWidgetVisible,
          primary: 512 /* Alt */ | 33 /* KeyC */,
          mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 33 /* KeyC */ },
          weight: 200 /* WorkbenchContrib */
        }
      });
    }
    run(accessor) {
      getFocusedFindController(accessor)?.toggleCaseSensitive();
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.toggleFindRegex" /* ToggleFindRegex */,
        title: localize2(8682, "Toggle Find Using Regex in Chat"),
        keybinding: {
          when: ChatContextKeys.findWidgetVisible,
          primary: 512 /* Alt */ | 48 /* KeyR */,
          mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 48 /* KeyR */ },
          weight: 200 /* WorkbenchContrib */
        }
      });
    }
    run(accessor) {
      getFocusedFindController(accessor)?.toggleRegex();
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.toggleFindWholeWord" /* ToggleFindWholeWord */,
        title: localize2(8683, "Toggle Find Using Whole Word in Chat"),
        keybinding: {
          when: ChatContextKeys.findWidgetVisible,
          primary: 512 /* Alt */ | 53 /* KeyW */,
          mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 53 /* KeyW */ },
          weight: 200 /* WorkbenchContrib */
        }
      });
    }
    run(accessor) {
      getFocusedFindController(accessor)?.toggleWholeWord();
    }
  });
  StartFindAction.addImplementation(100, (accessor, codeEditor) => {
    const widget = findOwningChatWidget(accessor, codeEditor);
    const controller = widget?.getFindController();
    if (!widget || !controller) {
      return false;
    }
    controller.show(getSeedSearchText(getWindow(widget.domNode), codeEditor), true);
    return true;
  });
  NextMatchFindAction.addImplementation(100, (accessor, codeEditor) => {
    const widget = findOwningChatWidget(accessor, codeEditor);
    const controller = widget?.getFindController();
    if (!controller || !controller.visible) {
      return false;
    }
    controller.next();
    return true;
  });
  PreviousMatchFindAction.addImplementation(100, (accessor, codeEditor) => {
    const widget = findOwningChatWidget(accessor, codeEditor);
    const controller = widget?.getFindController();
    if (!controller || !controller.visible) {
      return false;
    }
    controller.previous();
    return true;
  });
}
export { resolveFocusedChatWidget, getFocusedFindWidget, getFocusedFindController, getSeedSearchText, findOwningChatWidget, registerChatFindActions };
