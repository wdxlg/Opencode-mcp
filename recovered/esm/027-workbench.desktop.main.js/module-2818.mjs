// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatWidgetService.ts
import { Disposable, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ChatViewId, ChatViewPaneTarget, IQuickChatService, isIChatViewViewContext } from "./module-0981.mjs";
import { ChatEditor } from "./module-2565.mjs";
import { getWindow } from "./module-0075.mjs";
import { ChatEditorInput } from "./module-1111.mjs";
import { ACTIVE_GROUP, IEditorService } from "./module-0934.mjs";
import { IEditorGroupsService, isEditorGroup } from "./module-0933.mjs";
import { timeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ILayoutService } from "./module-0551.mjs";
import { IChatService } from "./module-0972.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatWidgetService.ts
var ChatWidgetService = class extends Disposable {
  constructor(editorGroupsService, viewsService, quickChatService, layoutService, editorService, chatService, logService) {
    super();
    this.editorGroupsService = editorGroupsService;
    this.viewsService = viewsService;
    this.quickChatService = quickChatService;
    this.layoutService = layoutService;
    this.editorService = editorService;
    this.chatService = chatService;
    this.logService = logService;
    this._widgets = [];
    this._lastFocusedWidget = void 0;
    this._onDidAddWidget = this._register(new Emitter());
    this.onDidAddWidget = this._onDidAddWidget.event;
    this._onDidRemoveWidget = this._register(new Emitter());
    this.onDidRemoveWidget = this._onDidRemoveWidget.event;
    this._onDidChangeWidgetVisibility = this._register(new Emitter());
    this.onDidChangeWidgetVisibility = this._onDidChangeWidgetVisibility.event;
    this._onDidBackgroundSession = this._register(new Emitter());
    this.onDidBackgroundSession = this._onDidBackgroundSession.event;
    this._onDidChangeFocusedWidget = this._register(new Emitter());
    this.onDidChangeFocusedWidget = this._onDidChangeFocusedWidget.event;
    this._onDidChangeFocusedSession = this._register(new Emitter());
    this.onDidChangeFocusedSession = this._onDidChangeFocusedSession.event;
  }
  get lastFocusedWidget() {
    return this._lastFocusedWidget;
  }
  getAllWidgets() {
    return this._widgets;
  }
  getWidgetsByLocations(location2) {
    return this._widgets.filter((w) => w.location === location2);
  }
  getWidgetByInputUri(uri5) {
    return this._widgets.find((w) => isEqual2(w.input.inputUri, uri5));
  }
  getWidgetBySessionResource(sessionResource) {
    return this._widgets.find((w) => isEqual2(w.viewModel?.sessionResource, sessionResource));
  }
  async revealWidget(preserveFocus) {
    const last = this.lastFocusedWidget;
    if (last && await this.reveal(last, preserveFocus)) {
      return last;
    }
    return (await this.viewsService.openView(ChatViewId, !preserveFocus))?.widget;
  }
  async reveal(widget, preserveFocus) {
    if (widget.viewModel?.sessionResource) {
      const alreadyOpenWidget = await this.revealSessionIfAlreadyOpen(widget.viewModel.sessionResource, { preserveFocus });
      if (alreadyOpenWidget) {
        return true;
      }
    }
    if (isIChatViewViewContext(widget.viewContext)) {
      const view = await this.viewsService.openView(widget.viewContext.viewId, !preserveFocus);
      if (!preserveFocus) {
        view?.focus();
      }
      return !!view;
    }
    return false;
  }
  async openSession(sessionResource, target, options3) {
    const t0 = Date.now();
    const targetKind = target === ChatViewPaneTarget ? "view" : typeof target === "undefined" ? "undefined" : "editor";
    this.logService.trace(`[ChatWidgetService] openSession start uri=${sessionResource.toString()} target=${targetKind}`);
    if (typeof target === "undefined" || options3?.revealIfOpened) {
      const alreadyOpenWidget = await this.revealSessionIfAlreadyOpen(sessionResource, options3);
      if (alreadyOpenWidget) {
        this.logService.trace(`[ChatWidgetService] openSession done total=${Date.now() - t0}ms uri=${sessionResource.toString()} path=reveal`);
        return alreadyOpenWidget;
      }
    } else {
      await this.prepareSessionForMove(sessionResource, target);
    }
    if (target === ChatViewPaneTarget || typeof target === "undefined") {
      const chatView = await this.viewsService.openView(ChatViewId, !options3?.preserveFocus);
      if (chatView) {
        await chatView.loadSession(sessionResource, options3?.sessionTypeSelectionReason);
        if (!options3?.preserveFocus) {
          chatView.focusInput();
        }
      }
      this.logService.trace(`[ChatWidgetService] openSession done total=${Date.now() - t0}ms uri=${sessionResource.toString()} path=view`);
      return chatView?.widget;
    }
    const pane = await this.editorService.openEditor({
      resource: sessionResource,
      options: {
        ...options3,
        revealIfOpened: options3?.revealIfOpened ?? true
        // always try to reveal if already opened unless explicitly told not to
      }
    }, target);
    this.logService.trace(`[ChatWidgetService] openSession done total=${Date.now() - t0}ms uri=${sessionResource.toString()} path=editor`);
    return pane instanceof ChatEditor ? pane.widget : void 0;
  }
  async revealSessionIfAlreadyOpen(sessionResource, options3) {
    const chatView = this.viewsService.getViewWithId(ChatViewId);
    if (chatView?.widget.viewModel?.sessionResource && isEqual2(chatView.widget.viewModel.sessionResource, sessionResource)) {
      const view = await this.viewsService.openView(ChatViewId, !options3?.preserveFocus);
      if (!options3?.preserveFocus) {
        view?.focus();
      }
      return chatView.widget;
    }
    const existingEditor = this.findExistingChatEditorByUri(sessionResource);
    if (existingEditor) {
      const existingEditorWindowId = existingEditor.group.windowId;
      const isGroupActive = () => getWindow(this.layoutService.activeContainer).vscodeWindowId === existingEditorWindowId;
      let ensureFocusTransfer;
      if (!isGroupActive() && !options3?.preserveFocus) {
        ensureFocusTransfer = Event2.toPromise(Event2.once(Event2.filter(this.layoutService.onDidChangeActiveContainer, isGroupActive)));
      }
      const pane = await existingEditor.group.openEditor(existingEditor.editor, options3);
      await ensureFocusTransfer;
      return pane instanceof ChatEditor ? pane.widget : void 0;
    }
    if (isEqual2(sessionResource, this.quickChatService.sessionResource)) {
      this.quickChatService.focus();
      return void 0;
    }
    return void 0;
  }
  async prepareSessionForMove(sessionResource, target) {
    const existingWidget = this.getWidgetBySessionResource(sessionResource);
    if (existingWidget) {
      const existingEditor = isIChatViewViewContext(existingWidget.viewContext) ? void 0 : this.findExistingChatEditorByUri(sessionResource);
      if (isIChatViewViewContext(existingWidget.viewContext) && target === ChatViewPaneTarget) {
        return;
      }
      if (!isIChatViewViewContext(existingWidget.viewContext) && target !== ChatViewPaneTarget && existingEditor && this.isSameEditorTarget(existingEditor.group.id, target)) {
        return;
      }
      if (existingEditor) {
        await this.editorService.closeEditor({ editor: existingEditor.editor, groupId: existingEditor.group.id }, { preserveFocus: true });
      } else {
        await existingWidget.clear();
      }
    }
  }
  findExistingChatEditorByUri(sessionUri) {
    for (const group2 of this.editorGroupsService.groups) {
      for (const editor of group2.editors) {
        if (editor instanceof ChatEditorInput && isEqual2(editor.sessionResource, sessionUri)) {
          return { editor, group: group2 };
        }
      }
    }
    return void 0;
  }
  isSameEditorTarget(currentGroupId, target) {
    return typeof target === "number" && target === currentGroupId || target === ACTIVE_GROUP && this.editorGroupsService.activeGroup?.id === currentGroupId || isEditorGroup(target) && target.id === currentGroupId;
  }
  setLastFocusedWidget(widget) {
    if (widget === this._lastFocusedWidget) {
      return;
    }
    this._lastFocusedWidget = widget;
    this._onDidChangeFocusedWidget.fire(widget);
    this._onDidChangeFocusedSession.fire();
  }
  register(newWidget) {
    if (this._widgets.some((widget) => widget === newWidget)) {
      throw new Error("Cannot register the same widget multiple times");
    }
    this._widgets.push(newWidget);
    this._onDidAddWidget.fire(newWidget);
    if (!this._lastFocusedWidget) {
      this.setLastFocusedWidget(newWidget);
    }
    return combinedDisposable(
      newWidget.onDidFocus(() => this.setLastFocusedWidget(newWidget)),
      newWidget.onDidShow(() => this._onDidChangeWidgetVisibility.fire(newWidget)),
      newWidget.onDidHide(() => this._onDidChangeWidgetVisibility.fire(newWidget)),
      newWidget.onDidChangeViewModel(({ previousSessionResource, currentSessionResource }) => {
        if (this._lastFocusedWidget === newWidget && !isEqual2(previousSessionResource, currentSessionResource)) {
          this._onDidChangeFocusedSession.fire();
        }
        if (!previousSessionResource || currentSessionResource && isEqual2(previousSessionResource, currentSessionResource)) {
          return;
        }
        void timeout(200).then(() => {
          if (!this.getWidgetBySessionResource(previousSessionResource) && this.chatService.getSession(previousSessionResource)) {
            this._onDidBackgroundSession.fire(previousSessionResource);
          }
        });
      }),
      toDisposable(() => {
        this._widgets.splice(this._widgets.indexOf(newWidget), 1);
        if (this._lastFocusedWidget === newWidget) {
          this.setLastFocusedWidget(void 0);
        }
        this._onDidRemoveWidget.fire(newWidget);
      })
    );
  }
};

ChatWidgetService = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IViewsService),
  __decorateParam(2, IQuickChatService),
  __decorateParam(3, ILayoutService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, IChatService),
  __decorateParam(6, ILogService)
], ChatWidgetService);
export { ChatWidgetService };
