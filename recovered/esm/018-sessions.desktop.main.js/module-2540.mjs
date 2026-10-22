// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatMoveActions.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatViewId, IChatWidgetService } from "./module-0982.mjs";
import { isChatViewTitleActionContext } from "./module-2049.mjs";
import { ActiveEditorContext } from "./module-0950.mjs";
import { ChatEditorInput } from "./module-1112.mjs";
import { Codicon } from "./module-0085.mjs";
import { ACTIVE_GROUP, AUX_WINDOW_GROUP, IEditorService } from "./module-0935.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { ChatEditor } from "./module-2539.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatMoveActions.ts
function registerMoveActions() {
  registerAction2(class GlobalMoveToEditorAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.openInEditor",
        title: localize2(8704, "Move Chat into Editor Area"),
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled,
        f1: true,
        menu: {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals("view", ChatViewId),
          order: 0,
          group: "1_open"
        }
      });
    }
    async run(accessor, ...args2) {
      const context2 = args2[0];
      executeMoveToAction(accessor, "Editor" /* Editor */, isChatViewTitleActionContext(context2) ? context2.sessionResource : void 0);
    }
  });
  registerAction2(class GlobalMoveToNewWindowAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.openInNewWindow",
        title: localize2(8705, "Move Chat into New Window"),
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled,
        f1: true,
        menu: {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals("view", ChatViewId),
          order: 0,
          group: "1_open"
        }
      });
    }
    async run(accessor, ...args2) {
      const context2 = args2[0];
      executeMoveToAction(accessor, "Window" /* Window */, isChatViewTitleActionContext(context2) ? context2.sessionResource : void 0);
    }
  });
  registerAction2(class GlobalMoveToSidebarAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.openInSidebar",
        title: localize2(8709, "Move Chat into Side Bar"),
        category: CHAT_CATEGORY,
        precondition: ChatContextKeys.enabled,
        f1: true
      });
    }
    async run(accessor, ...args2) {
      return moveToSidebar(accessor);
    }
  });
  function appendOpenChatInViewMenuItem(menuId, title, icon2, locationContextKey) {
    MenuRegistry.appendMenuItem(menuId, {
      command: { id: "workbench.action.chat.openInSidebar", title, icon: icon2 },
      when: ContextKeyExpr.and(
        ActiveEditorContext.isEqualTo(ChatEditorInput.EditorID),
        locationContextKey
      ),
      group: menuId === MenuId.CompactWindowEditorTitle ? "navigation" : void 0,
      order: 0
    });
  }
  [MenuId.EditorTitle, MenuId.CompactWindowEditorTitle].forEach((id2) => {
    appendOpenChatInViewMenuItem(id2, localize(8708, null), Codicon.layoutSidebarRightDock, ChatContextKeys.panelLocation.isEqualTo(2 /* AuxiliaryBar */));
    appendOpenChatInViewMenuItem(id2, localize(8707, null), Codicon.layoutSidebarLeftDock, ChatContextKeys.panelLocation.isEqualTo(0 /* Sidebar */));
    appendOpenChatInViewMenuItem(id2, localize(8706, null), Codicon.layoutPanelDock, ChatContextKeys.panelLocation.isEqualTo(1 /* Panel */));
  });
}

async function executeMoveToAction(accessor, moveTo, sessionResource) {
  const widgetService = accessor.get(IChatWidgetService);
  const auxiliary = { compact: true, bounds: { width: 800, height: 640 } };
  const widget = (sessionResource ? widgetService.getWidgetBySessionResource(sessionResource) : void 0) ?? widgetService.lastFocusedWidget;
  if (!widget || !widget.viewModel || widget.location !== "panel" /* Chat */) {
    await widgetService.openSession(ChatEditorInput.getNewEditorUri(), moveTo === "Window" /* Window */ ? AUX_WINDOW_GROUP : ACTIVE_GROUP, { pinned: true, auxiliary });
    return;
  }
  const existingWidget = widgetService.getWidgetBySessionResource(widget.viewModel.sessionResource);
  if (!existingWidget) {
    await widgetService.openSession(ChatEditorInput.getNewEditorUri(), moveTo === "Window" /* Window */ ? AUX_WINDOW_GROUP : ACTIVE_GROUP, { pinned: true, auxiliary });
    return;
  }
  const resourceToOpen = widget.viewModel.sessionResource;
  const modelInputState = existingWidget.getInputState();
  await widget.clear();
  const options3 = { pinned: true, modelInputState, auxiliary };
  await widgetService.openSession(resourceToOpen, moveTo === "Window" /* Window */ ? AUX_WINDOW_GROUP : ACTIVE_GROUP, options3);
}

async function moveToSidebar(accessor) {
  const viewsService = accessor.get(IViewsService);
  const editorService = accessor.get(IEditorService);
  const editorGroupService = accessor.get(IEditorGroupsService);
  const chatEditor = editorService.activeEditorPane;
  const chatEditorInput = chatEditor?.input;
  let view;
  if (chatEditor instanceof ChatEditor && chatEditorInput instanceof ChatEditorInput && chatEditorInput.sessionResource) {
    const previousInputState = chatEditor.widget.getInputState();
    await editorService.closeEditor({ editor: chatEditor.input, groupId: editorGroupService.activeGroup.id });
    view = await viewsService.openView(ChatViewId);
    const newModel = await view.loadSession(chatEditorInput.sessionResource);
    if (previousInputState && newModel && !newModel.inputModel.state.get()) {
      newModel.inputModel.setState(previousInputState);
    }
  } else {
    view = await viewsService.openView(ChatViewId);
  }
  view.focus();
}
export { registerMoveActions, executeMoveToAction, moveToSidebar };
