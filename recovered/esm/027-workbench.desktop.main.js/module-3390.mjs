// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatController.ts
import { Disposable } from "./module-0012.mjs";
import { Lazy } from "./module-0028.mjs";
import { TerminalChatWidget } from "./module-3389.mjs";
import { ITerminalService, isDetachedTerminalInstance } from "./module-1149.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatCodeBlockContextProviderService, IChatWidgetService } from "./module-0981.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatService } from "./module-0972.mjs";


// src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatController.ts
var TerminalChatController = class extends Disposable {
  constructor(_ctx, chatCodeBlockContextProviderService, chatEntitlementService, _contextKeyService, _instantiationService, _terminalService) {
    super();
    this._ctx = _ctx;
    this._contextKeyService = _contextKeyService;
    this._instantiationService = _instantiationService;
    this._terminalService = _terminalService;
    this._forcedPlaceholder = void 0;
    this._register(chatEntitlementService.onDidChangeSentiment(() => {
      if (chatEntitlementService.sentiment.hidden) {
        this._terminalChatWidget?.value.clear();
      }
    }));
    this._register(chatCodeBlockContextProviderService.registerProvider({
      getCodeBlockContext: (editor) => {
        if (!editor || !this._terminalChatWidget?.hasValue || !this.hasFocus()) {
          return;
        }
        return {
          element: editor,
          code: editor.getValue(),
          codeBlockIndex: 0,
          languageId: editor.getModel().getLanguageId(),
          chatSessionResource: this._terminalChatWidget.value.inlineChatWidget.chatWidget.viewModel?.sessionResource
        };
      }
    }, "terminal"));
  }
  static {
    this.ID = "terminal.chat";
  }
  static get(instance2) {
    return instance2.getContribution(TerminalChatController.ID);
  }
  /**
   * The terminal chat widget for the controller, this will be undefined if xterm is not ready yet (ie. the
   * terminal is still initializing). This wraps the inline chat widget.
   */
  get terminalChatWidget() {
    return this._terminalChatWidget?.value;
  }
  get lastResponseContent() {
    return this._lastResponseContent;
  }
  get scopedContextKeyService() {
    return this._terminalChatWidget?.value.inlineChatWidget.scopedContextKeyService ?? this._contextKeyService;
  }
  xtermReady(xterm) {
    this._terminalChatWidget = new Lazy(() => {
      const chatWidget = this._register(this._instantiationService.createInstance(TerminalChatWidget, this._ctx.instance.domElement, this._ctx.instance, xterm));
      this._register(chatWidget.focusTracker.onDidFocus(() => {
        TerminalChatController.activeChatController = this;
        if (!isDetachedTerminalInstance(this._ctx.instance)) {
          this._terminalService.setActiveInstance(this._ctx.instance);
        }
      }));
      this._register(chatWidget.focusTracker.onDidBlur(() => {
        TerminalChatController.activeChatController = void 0;
        this._ctx.instance.resetScrollbarVisibility();
      }));
      if (!this._ctx.instance.domElement) {
        throw new Error("FindWidget expected terminal DOM to be initialized");
      }
      return chatWidget;
    });
  }
  _updatePlaceholder() {
    const inlineChatWidget = this._terminalChatWidget?.value.inlineChatWidget;
    if (inlineChatWidget) {
      inlineChatWidget.placeholder = this._getPlaceholderText();
    }
  }
  _getPlaceholderText() {
    return this._forcedPlaceholder ?? "";
  }
  setPlaceholder(text2) {
    this._forcedPlaceholder = text2;
    this._updatePlaceholder();
  }
  resetPlaceholder() {
    this._forcedPlaceholder = void 0;
    this._updatePlaceholder();
  }
  updateInput(text2, selectAll = true) {
    const widget = this._terminalChatWidget?.value.inlineChatWidget;
    if (widget) {
      widget.value = text2;
      if (selectAll) {
        widget.selectAll();
      }
    }
  }
  focus() {
    this._terminalChatWidget?.value.focus();
  }
  hasFocus() {
    return this._terminalChatWidget?.rawValue?.hasFocus() ?? false;
  }
  async viewInChat() {
    const chatModel = this.terminalChatWidget?.inlineChatWidget.chatWidget.viewModel?.model;
    if (chatModel) {
      await this._instantiationService.invokeFunction(moveToPanelChat, chatModel);
    }
    this._terminalChatWidget?.rawValue?.hide();
  }
};

TerminalChatController = __decorateClass([
  __decorateParam(1, IChatCodeBlockContextProviderService),
  __decorateParam(2, IChatEntitlementService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ITerminalService)
], TerminalChatController);

async function moveToPanelChat(accessor, model) {
  const chatService = accessor.get(IChatService);
  const chatWidgetService = accessor.get(IChatWidgetService);
  const widget = await chatWidgetService.revealWidget();
  if (widget && widget.viewModel && model) {
    for (const request2 of model.getRequests().slice()) {
      await chatService.adoptRequest(widget.viewModel.model.sessionResource, request2);
    }
    widget.focusResponseItem();
  }
}
export { moveToPanelChat, TerminalChatController };
