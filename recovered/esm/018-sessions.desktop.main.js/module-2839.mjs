// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widgetHosts/chatQuick.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { $, append, isAncestorOfActiveElement, reset } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IChatService } from "./module-0973.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ChatWidget } from "./module-2369.mjs";
import { MenuId } from "./module-0092.mjs";
import { ChatMode } from "./module-1469.mjs";
import { quickInputBackground, quickInputForeground } from "./module-0235.mjs";
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from "./module-0868.mjs";
import { inputBackground } from "./module-0233.mjs";
import { editorBackground } from "./module-0229.mjs";
import { Sash } from "./module-0496.mjs";
import { autorun } from "./module-0052.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { product_default } from "./module-0139.mjs";
import { isCellTextEditOperationArray } from "./module-1193.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";


// src/vs/workbench/contrib/chat/browser/widgetHosts/chatQuick.ts
var QuickChatService = class extends Disposable {
  constructor(quickInputService, chatService, instantiationService) {
    super();
    this.quickInputService = quickInputService;
    this.chatService = chatService;
    this.instantiationService = instantiationService;
    this._onDidClose = this._register(new Emitter());
  }
  get onDidClose() {
    return this._onDidClose.event;
  }
  get enabled() {
    return !!this.chatService.isEnabled("panel" /* Chat */);
  }
  get focused() {
    const widget = this._input?.widget;
    if (!widget) {
      return false;
    }
    return isAncestorOfActiveElement(widget);
  }
  get sessionResource() {
    return this._input && this._currentChat?.sessionResource;
  }
  toggle(options3) {
    if (this.focused && !options3?.query) {
      this.close();
    } else {
      this.open(options3);
      if (options3?.isPartialQuery) {
        const disposable = this._store.add(Event2.once(this.onDidClose)(() => {
          this._currentChat?.clearValue();
          this._store.delete(disposable);
        }));
      }
    }
  }
  open(options3) {
    if (this._input) {
      if (this._currentChat && options3?.query) {
        this._currentChat.focus();
        this._currentChat.setValue(options3.query, options3.selection);
        if (!options3.isPartialQuery) {
          this._currentChat.acceptInput();
        }
        return;
      }
      return this.focus();
    }
    const disposableStore = new DisposableStore();
    this._input = this.quickInputService.createQuickWidget();
    this._input.contextKey = "chatInputVisible";
    this._input.ignoreFocusOut = true;
    disposableStore.add(this._input);
    this._container ??= $(".interactive-session");
    this._input.widget = this._container;
    this._input.show();
    if (!this._currentChat) {
      this._currentChat = this.instantiationService.createInstance(QuickChat);
      this._currentChat.render(this._container);
    } else {
      this._currentChat.show();
    }
    disposableStore.add(this._input.onDidHide(() => {
      disposableStore.dispose();
      this._currentChat.hide();
      this._input = void 0;
      this._onDidClose.fire();
    }));
    this._currentChat.focus();
    if (options3?.query) {
      this._currentChat.setValue(options3.query, options3.selection);
      if (!options3.isPartialQuery) {
        this._currentChat.acceptInput();
      }
    }
  }
  focus() {
    this._currentChat?.focus();
  }
  close() {
    this._input?.dispose();
    this._input = void 0;
  }
  async openInChatView() {
    await this._currentChat?.openChatView();
    this.close();
  }
};

QuickChatService = __decorateClass([
  __decorateParam(0, IQuickInputService),
  __decorateParam(1, IChatService),
  __decorateParam(2, IInstantiationService)
], QuickChatService);

var QuickChat = class extends Disposable {
  constructor(instantiationService, contextKeyService, chatService, layoutService, chatWidgetService, chatEntitlementService, markdownRendererService) {
    super();
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.chatService = chatService;
    this.layoutService = layoutService;
    this.chatWidgetService = chatWidgetService;
    this.chatEntitlementService = chatEntitlementService;
    this.markdownRendererService = markdownRendererService;
    this.maintainScrollTimer = this._register(new MutableDisposable());
    this._deferUpdatingDynamicLayout = false;
  }
  static {
    // TODO@TylerLeonhardt: be responsive to window size
    this.DEFAULT_MIN_HEIGHT = 200;
  }
  static {
    this.DEFAULT_HEIGHT_OFFSET = 100;
  }
  get sessionResource() {
    return this.modelRef?.object.sessionResource;
  }
  clear() {
    this.modelRef?.dispose();
    this.modelRef = void 0;
    this.updateModel();
    this.widget.inputEditor.setValue("");
    return Promise.resolve();
  }
  focus(selection) {
    if (this.widget) {
      this.widget.focusInput();
      const value2 = this.widget.inputEditor.getValue();
      if (value2) {
        this.widget.inputEditor.setSelection(selection ?? {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: value2.length + 1
        });
      }
    }
  }
  hide() {
    this.widget.setVisible(false);
    this.maintainScrollTimer.value = disposableTimeout(() => {
      this.maintainScrollTimer.clear();
    }, 30 * 1e3);
  }
  show() {
    this.widget.setVisible(true);
    if (this._deferUpdatingDynamicLayout) {
      this._deferUpdatingDynamicLayout = false;
      this.widget.updateDynamicChatTreeItemLayout(2, this.maxHeight);
    }
    if (!this.maintainScrollTimer.value) {
      this.widget.layoutDynamicChatTreeItemMode();
    }
  }
  render(parent) {
    if (this.widget) {
      throw new Error("Cannot render quick chat twice");
    }
    const scopedInstantiationService = this._register(this.instantiationService.createChild(
      new ServiceCollection([
        IContextKeyService,
        this._register(this.contextKeyService.createScoped(parent))
      ])
    ));
    this.widget = this._register(
      scopedInstantiationService.createInstance(
        ChatWidget,
        "panel" /* Chat */,
        { isQuickChat: true },
        {
          autoScroll: true,
          renderInputOnTop: true,
          renderStyle: "compact",
          menus: { inputSideToolbar: MenuId.ChatInputSide, telemetrySource: "chatQuick" },
          enableImplicitContext: true,
          defaultMode: ChatMode.Ask,
          clear: () => this.clear()
        },
        {
          listForeground: quickInputForeground,
          listBackground: quickInputBackground,
          overlayBackground: EDITOR_DRAG_AND_DROP_BACKGROUND,
          inputEditorBackground: inputBackground,
          resultEditorBackground: editorBackground
        }
      )
    );
    this.widget.render(parent);
    this.widget.setVisible(true);
    this.widget.setDynamicChatTreeItemLayout(2, this.maxHeight);
    this.updateModel();
    this.sash = this._register(new Sash(parent, { getHorizontalSashTop: () => parent.offsetHeight }, { orientation: 1 /* HORIZONTAL */ }));
    this.setupDisclaimer(parent);
    this.registerListeners(parent);
  }
  setupDisclaimer(parent) {
    const disclaimerElement = append(parent, $(".disclaimer.hidden"));
    const disposables = this._store.add(new DisposableStore());
    this._register(autorun((reader) => {
      disposables.clear();
      reset(disclaimerElement);
      const sentiment = this.chatEntitlementService.sentimentObs.read(reader);
      const anonymous = this.chatEntitlementService.anonymousObs.read(reader);
      const requestInProgress = this.chatService.requestInProgressObs.read(reader);
      const showDisclaimer = !sentiment.completed && anonymous && !requestInProgress;
      disclaimerElement.classList.toggle("hidden", !showDisclaimer);
      if (showDisclaimer) {
        const renderedMarkdown = disposables.add(this.markdownRendererService.render(new MarkdownString(localize(12677, null, product_default.defaultChatAgent?.provider?.default?.name ?? "", product_default.defaultChatAgent?.provider?.default?.name ?? "", product_default.defaultChatAgent?.termsStatementUrl ?? "", product_default.defaultChatAgent?.privacyStatementUrl ?? ""), { isTrusted: true })));
        disclaimerElement.appendChild(renderedMarkdown.element);
      }
    }));
  }
  get maxHeight() {
    return this.layoutService.mainContainerDimension.height - QuickChat.DEFAULT_HEIGHT_OFFSET;
  }
  registerListeners(parent) {
    this._register(this.layoutService.onDidLayoutMainContainer(() => {
      if (this.widget.visible) {
        this.widget.updateDynamicChatTreeItemLayout(2, this.maxHeight);
      } else {
        this._deferUpdatingDynamicLayout = true;
      }
    }));
    this._register(this.widget.onDidChangeHeight((e4) => this.sash.layout()));
    const width2 = parent.offsetWidth;
    this._register(this.sash.onDidStart(() => {
      this.widget.isDynamicChatTreeItemLayoutEnabled = false;
    }));
    this._register(this.sash.onDidChange((e4) => {
      if (e4.currentY < QuickChat.DEFAULT_MIN_HEIGHT || e4.currentY > this.maxHeight) {
        return;
      }
      this.widget.layout(e4.currentY, width2);
      this.sash.layout();
    }));
    this._register(this.sash.onDidReset(() => {
      this.widget.isDynamicChatTreeItemLayoutEnabled = true;
      this.widget.layoutDynamicChatTreeItemMode();
    }));
  }
  async acceptInput() {
    return this.widget.acceptInput();
  }
  async openChatView() {
    const widget = await this.chatWidgetService.revealWidget();
    const model = this.modelRef?.object;
    if (!widget?.viewModel || !model) {
      return;
    }
    for (const request2 of model.getRequests()) {
      if (request2.response?.response.value || request2.response?.result) {
        const message = [];
        for (const item of request2.response.response.value) {
          if (item.kind === "textEditGroup") {
            for (const group2 of item.edits) {
              message.push({
                kind: "textEdit",
                edits: group2,
                uri: item.uri
              });
            }
          } else if (item.kind === "notebookEditGroup") {
            for (const group2 of item.edits) {
              if (isCellTextEditOperationArray(group2)) {
                message.push({
                  kind: "textEdit",
                  edits: group2.map((e4) => e4.edit),
                  uri: group2[0].uri
                });
              } else {
                message.push({
                  kind: "notebookEdit",
                  edits: group2,
                  uri: item.uri
                });
              }
            }
          } else {
            message.push(item);
          }
        }
        this.chatService.addCompleteRequest(
          widget.viewModel.sessionResource,
          request2.message,
          request2.variableData,
          request2.attempt,
          {
            message,
            result: request2.response.result,
            followups: request2.response.followups
          }
        );
      } else if (request2.message) {
      }
    }
    const value2 = this.widget.getInputState();
    if (value2) {
      widget.viewModel.model.inputModel.setState(value2);
    }
    widget.focusInput();
  }
  setValue(value2, selection) {
    this.widget.inputEditor.setValue(value2);
    this.focus(selection);
  }
  clearValue() {
    this.widget.inputEditor.setValue("");
  }
  updateModel() {
    this.modelRef ??= this.chatService.startNewLocalSession("panel" /* Chat */, { disableBackgroundKeepAlive: true, debugOwner: "ChatQuick#updateModel" });
    const model = this.modelRef?.object;
    if (!model) {
      throw new Error("Could not start chat session");
    }
    this.modelRef.object.inputModel.setState({ inputText: "", selections: [] });
    this.widget.setModel(model);
  }
  dispose() {
    this.modelRef?.dispose();
    this.modelRef = void 0;
    super.dispose();
  }
};

QuickChat = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IChatService),
  __decorateParam(3, IWorkbenchLayoutService),
  __decorateParam(4, IChatWidgetService),
  __decorateParam(5, IChatEntitlementService),
  __decorateParam(6, IMarkdownRendererService)
], QuickChat);
export { QuickChatService, QuickChat };
