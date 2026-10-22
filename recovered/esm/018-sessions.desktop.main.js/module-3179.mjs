// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatWidget.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { MENU_TERMINAL_CHAT_WIDGET_INPUT_SIDE_TOOLBAR, MENU_TERMINAL_CHAT_WIDGET_STATUS, TerminalChatContextKeys } from "./module-1154.mjs";
import { MENU_INLINE_CHAT_WIDGET_SECONDARY } from "./module-1978.mjs";
import { MenuId } from "./module-0092.mjs";
import { ChatMode } from "./module-1469.mjs";
import { MicrotaskDelay } from "./module-0035.mjs";
import { Dimension, getActiveWindow, trackFocus } from "./module-0075.mjs";
import { autorun } from "./module-0052.mjs";
import { localize } from "./module-0001.mjs";
import { TerminalStickyScrollContribution } from "./module-3176.mjs";
import { DeferredPromise, createCancelablePromise } from "./module-0036.mjs";
import { OS } from "./module-0014.mjs";
import { isCancellationError, onUnexpectedError } from "./module-0004.mjs";
import { ITerminalChatSessionResolver, getTerminalChatSessionMeta } from "./module-3178.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { isCellTextEditOperationArray } from "./module-1193.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatSessionsService } from "./module-0961.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatAgentService } from "./module-0975.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { InlineChatWidget } from "./module-2370.mjs";
import { Selection } from "./module-0107.mjs";
import { isResponseVM } from "./module-0979.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibleViewService } from "./module-0799.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IModelService } from "./module-0080.mjs";


// src/vs/workbench/contrib/terminalContrib/chat/browser/terminalChatWidget.ts
var TerminalChatWidget = class extends Disposable {
  constructor(_terminalElement, _instance, _xterm, contextKeyService, _chatService, _sessionResolver, _chatSessionsService, _storageService, instantiationService, _chatAgentService, _chatWidgetService) {
    super();
    this._terminalElement = _terminalElement;
    this._instance = _instance;
    this._xterm = _xterm;
    this._chatService = _chatService;
    this._sessionResolver = _sessionResolver;
    this._chatSessionsService = _chatSessionsService;
    this._storageService = _storageService;
    this._chatAgentService = _chatAgentService;
    this._chatWidgetService = _chatWidgetService;
    this._onDidHide = this._register(new Emitter());
    this.onDidHide = this._onDidHide.event;
    this._messages = this._store.add(new Emitter());
    this._viewStateStorageKey = "terminal-inline-chat-view-state";
    this._terminalAgentName = "terminal";
    this._model = this._register(new MutableDisposable());
    this._sessionDisposables = this._register(new MutableDisposable());
    this._requestInProgress = observableValue(this, false);
    this.requestInProgress = this._requestInProgress;
    this._focusedContextKey = TerminalChatContextKeys.focused.bindTo(contextKeyService);
    this._visibleContextKey = TerminalChatContextKeys.visible.bindTo(contextKeyService);
    this._requestActiveContextKey = TerminalChatContextKeys.requestActive.bindTo(contextKeyService);
    this._responseContainsCodeBlockContextKey = TerminalChatContextKeys.responseContainsCodeBlock.bindTo(contextKeyService);
    this._responseContainsMulitpleCodeBlocksContextKey = TerminalChatContextKeys.responseContainsMultipleCodeBlocks.bindTo(contextKeyService);
    this._usesAgentHostContextKey = TerminalChatContextKeys.usesAgentHost.bindTo(contextKeyService);
    this._container = document.createElement("div");
    this._container.classList.add("terminal-inline-chat");
    this._terminalElement.appendChild(this._container);
    this._inlineChatWidget = instantiationService.createInstance(
      TerminalInlineChatWidget,
      {
        location: "terminal" /* Terminal */,
        resolveData: () => {
          return void 0;
        }
      },
      {
        statusMenuId: {
          menu: MENU_TERMINAL_CHAT_WIDGET_STATUS,
          options: {
            buttonConfigProvider: (action) => ({
              showLabel: action.id !== "workbench.action.terminal.chat.rerunRequest" /* RerunRequest */,
              showIcon: action.id === "workbench.action.terminal.chat.rerunRequest" /* RerunRequest */,
              isSecondary: action.id !== "workbench.action.terminal.chat.runCommand" /* RunCommand */ && action.id !== "workbench.action.terminal.chat.runFirstCommand" /* RunFirstCommand */
            })
          }
        },
        secondaryMenuId: MENU_INLINE_CHAT_WIDGET_SECONDARY,
        chatWidgetViewOptions: {
          menus: {
            telemetrySource: "terminal-inline-chat",
            executeToolbar: MenuId.ChatExecute,
            inputSideToolbar: MENU_TERMINAL_CHAT_WIDGET_INPUT_SIDE_TOOLBAR
          },
          defaultMode: ChatMode.Ask
        }
      }
    );
    this._register(this._inlineChatWidget.chatWidget.onDidChangeViewModel(() => this._saveInputState()));
    this._register(Event2.any(
      this._inlineChatWidget.onDidChangeHeight,
      this._instance.onDimensionsChanged,
      this._inlineChatWidget.chatWidget.onDidChangeContentHeight,
      Event2.fromObservableLight(this._inlineChatWidget.chatWidget.input.selectedLanguageModel),
      Event2.debounce(this._xterm.raw.onCursorMove, () => void 0, MicrotaskDelay)
    )(() => this._relayout()));
    this._register(this._instance.onDidChangeShellType(() => this._refreshAgentHostSessionMetadata()));
    const observer = new ResizeObserver(() => this._relayout());
    observer.observe(this._terminalElement);
    this._register(toDisposable(() => observer.disconnect()));
    this._resetPlaceholder();
    this._container.appendChild(this._inlineChatWidget.domNode);
    this._focusTracker = this._register(trackFocus(this._container));
    this._register(this._focusTracker.onDidFocus(() => this._focusedContextKey.set(true)));
    this._register(this._focusTracker.onDidBlur(() => this._focusedContextKey.set(false)));
    this._register(autorun((r2) => {
      const isBusy = this._inlineChatWidget.requestInProgress.read(r2);
      this._container.classList.toggle("busy", isBusy);
      this._inlineChatWidget.toggleStatus(!!this._inlineChatWidget.responseContent);
      if (isBusy || !this._inlineChatWidget.responseContent) {
        this._responseContainsCodeBlockContextKey.set(false);
        this._responseContainsMulitpleCodeBlocksContextKey.set(false);
      } else {
        Promise.all([
          this._inlineChatWidget.getCodeBlockInfo(0),
          this._inlineChatWidget.getCodeBlockInfo(1)
        ]).then(([firstCodeBlock, secondCodeBlock]) => {
          this._responseContainsCodeBlockContextKey.set(!!firstCodeBlock);
          this._responseContainsMulitpleCodeBlocksContextKey.set(!!secondCodeBlock);
          this._inlineChatWidget.updateToolbar(true);
        });
      }
    }));
    this.hide();
  }
  get inlineChatWidget() {
    return this._inlineChatWidget;
  }
  get lastResponseContent() {
    return this._lastResponseContent;
  }
  _relayout() {
    if (this._dimension) {
      this._doLayout();
    }
  }
  _doLayout() {
    const xtermElement = this._xterm.raw.element;
    if (!xtermElement) {
      return;
    }
    const style = getActiveWindow().getComputedStyle(xtermElement);
    const xtermLeftPadding = parseInt(style.paddingLeft);
    const width2 = xtermElement.clientWidth - xtermLeftPadding - 12 /* RightPadding */;
    if (width2 === 0) {
      return;
    }
    const terminalViewportHeight = this._getTerminalViewportHeight();
    const widgetAllowedPercentBasedHeight = (terminalViewportHeight ?? 0) * 0.75 /* MaxHeightPercentageOfViewport */;
    const height = Math.max(Math.min(480 /* MaxHeight */, this._inlineChatWidget.contentHeight, widgetAllowedPercentBasedHeight), this._inlineChatWidget.minHeight);
    if (height === 0) {
      return;
    }
    this._dimension = new Dimension(width2, height);
    this._inlineChatWidget.layout(this._dimension);
    this._inlineChatWidget.domNode.style.paddingLeft = `${xtermLeftPadding}px`;
    this._updateXtermViewportPosition();
  }
  _resetPlaceholder() {
    const defaultAgent = this._chatAgentService.getDefaultAgent("terminal" /* Terminal */);
    this.inlineChatWidget.placeholder = defaultAgent?.description ?? localize(20449, null);
  }
  async reveal() {
    this._createSession();
    this._doLayout();
    this._container.classList.remove("hide");
    this._visibleContextKey.set(true);
    this._resetPlaceholder();
    this._inlineChatWidget.focus();
    this._instance.scrollToBottom();
  }
  _getTerminalCursorTop() {
    const font = this._instance.xterm?.getFont();
    if (!font?.charHeight) {
      return;
    }
    const terminalWrapperHeight = this._getTerminalViewportHeight() ?? 0;
    const cellHeight = font.charHeight * font.lineHeight;
    const topPadding = terminalWrapperHeight - this._instance.rows * cellHeight;
    const cursorY = (this._instance.xterm?.raw.buffer.active.cursorY ?? 0) + 1;
    return topPadding + cursorY * cellHeight;
  }
  _updateXtermViewportPosition() {
    const top2 = this._getTerminalCursorTop();
    if (!top2) {
      return;
    }
    this._container.style.top = `${top2}px`;
    const terminalViewportHeight = this._getTerminalViewportHeight();
    if (!terminalViewportHeight) {
      return;
    }
    const widgetAllowedPercentBasedHeight = terminalViewportHeight * 0.75 /* MaxHeightPercentageOfViewport */;
    const height = Math.max(Math.min(480 /* MaxHeight */, this._inlineChatWidget.contentHeight, widgetAllowedPercentBasedHeight), this._inlineChatWidget.minHeight);
    if (top2 > terminalViewportHeight - height && terminalViewportHeight - height > 0) {
      this._setTerminalViewportOffset(top2 - (terminalViewportHeight - height));
    } else {
      this._setTerminalViewportOffset(void 0);
    }
  }
  _getTerminalViewportHeight() {
    return this._terminalElement.clientHeight;
  }
  hide() {
    this._container.classList.add("hide");
    this._inlineChatWidget.reset();
    this._resetPlaceholder();
    this._inlineChatWidget.updateToolbar(false);
    this._visibleContextKey.set(false);
    this._inlineChatWidget.value = "";
    this._instance.focus();
    this._setTerminalViewportOffset(void 0);
    this._onDidHide.fire();
  }
  _setTerminalViewportOffset(offset) {
    if (offset === void 0 || this._container.classList.contains("hide")) {
      this._terminalElement.style.position = "";
      this._terminalElement.style.bottom = "";
      TerminalStickyScrollContribution.get(this._instance)?.hideUnlock();
    } else {
      this._terminalElement.style.position = "relative";
      this._terminalElement.style.bottom = `${offset}px`;
      TerminalStickyScrollContribution.get(this._instance)?.hideLock();
    }
  }
  focus() {
    this.inlineChatWidget.focus();
  }
  hasFocus() {
    return this._inlineChatWidget.hasFocus();
  }
  setValue(value2) {
    this._inlineChatWidget.value = value2 ?? "";
  }
  async acceptCommand(shouldExecute) {
    const code = await this.inlineChatWidget.getCodeBlockInfo(0);
    if (!code) {
      return;
    }
    const value2 = code.getValue();
    this._instance.runCommand(value2, shouldExecute);
    this.clear();
  }
  get focusTracker() {
    return this._focusTracker;
  }
  _createSession() {
    if (this._model.value || this._sessionCtor) {
      return;
    }
    const sessionCtor = createCancelablePromise(async (token) => {
      const resolution = await this._sessionResolver.resolve(token, this._instance.shellType ?? this._instance.processName, this._instance.os ?? OS);
      if (!resolution || token.isCancellationRequested) {
        resolution?.modelRef.dispose();
        return;
      }
      this._model.value = resolution.modelRef;
      const model = resolution.modelRef.object;
      this._inlineChatWidget.setChatModel(model);
      const lockToAgent = resolution.lockToAgent;
      if (lockToAgent) {
        this._inlineChatWidget.chatWidget.lockToCodingAgent(lockToAgent.name, lockToAgent.displayName, lockToAgent.type, lockToAgent.agentHostProviderId);
        this._agentHostSessionResource = model.sessionResource;
        this._usesAgentHostContextKey.set(true);
        this._refreshAgentHostSessionMetadata();
      } else {
        this._inlineChatWidget.chatWidget.unlockFromCodingAgent();
        this._agentHostSessionResource = void 0;
        this._usesAgentHostContextKey.set(false);
      }
      this._resetPlaceholder();
    });
    this._sessionCtor = sessionCtor;
    this._sessionDisposables.value = toDisposable(() => sessionCtor.cancel());
    void sessionCtor.catch((error) => {
      if (this._sessionCtor === sessionCtor) {
        this._sessionCtor = void 0;
      }
      if (!isCancellationError(error)) {
        onUnexpectedError(error);
      }
    });
  }
  _refreshAgentHostSessionMetadata() {
    if (this._agentHostSessionResource) {
      this._chatSessionsService.updateChatSessionMetadata(
        this._agentHostSessionResource,
        getTerminalChatSessionMeta(this._instance.shellType ?? this._instance.processName, this._instance.os ?? OS)
      );
    }
  }
  async _waitForSession() {
    if (this._model.value) {
      return true;
    }
    const sessionCtor = this._sessionCtor;
    if (!sessionCtor) {
      return false;
    }
    try {
      await sessionCtor;
      return !!this._model.value;
    } catch (error) {
      if (isCancellationError(error)) {
        return false;
      }
      throw error;
    }
  }
  _saveInputState() {
    const inputState = this._inlineChatWidget.chatWidget.getInputState();
    if (inputState) {
      this._storageService.store(this._viewStateStorageKey, JSON.stringify(inputState), 0 /* PROFILE */, 0 /* USER */);
    }
  }
  clear() {
    this.cancel();
    this._model.clear();
    this._agentHostSessionResource = void 0;
    this._usesAgentHostContextKey.reset();
    this._inlineChatWidget.chatWidget.unlockFromCodingAgent();
    this._responseContainsCodeBlockContextKey.reset();
    this._requestActiveContextKey.reset();
    this.hide();
    this.setValue(void 0);
  }
  async acceptInput(query, options3) {
    if (!this._model.value) {
      await this.reveal();
    }
    if (!await this._waitForSession()) {
      return void 0;
    }
    this._messages.fire(32 /* AcceptInput */);
    const lastInput = this._inlineChatWidget.value;
    if (!lastInput) {
      return;
    }
    this._activeRequestCts?.cancel();
    this._activeRequestCts = new CancellationTokenSource();
    const store = new DisposableStore();
    this._requestActiveContextKey.set(true);
    const response = await this._inlineChatWidget.chatWidget.acceptInput(lastInput, { isVoiceInput: options3?.isVoiceInput });
    this._currentRequestId = response?.requestId;
    const responsePromise = new DeferredPromise();
    try {
      this._requestActiveContextKey.set(true);
      if (response) {
        store.add(response.onDidChange(async () => {
          if (response.isCanceled) {
            this._requestActiveContextKey.set(false);
            responsePromise.complete(void 0);
            return;
          }
          if (response.isComplete) {
            this._requestActiveContextKey.set(false);
            this._requestActiveContextKey.set(false);
            const firstCodeBlock = await this._inlineChatWidget.getCodeBlockInfo(0);
            const secondCodeBlock = await this._inlineChatWidget.getCodeBlockInfo(1);
            this._responseContainsCodeBlockContextKey.set(!!firstCodeBlock);
            this._responseContainsMulitpleCodeBlocksContextKey.set(!!secondCodeBlock);
            this._inlineChatWidget.updateToolbar(true);
            responsePromise.complete(response);
          }
        }));
      }
      await responsePromise.p;
      this._lastResponseContent = response?.response.getMarkdown();
      return response;
    } catch {
      this._lastResponseContent = void 0;
      return;
    } finally {
      store.dispose();
    }
  }
  cancel() {
    this._sessionCtor?.cancel();
    this._sessionCtor = void 0;
    this._activeRequestCts?.cancel();
    this._requestActiveContextKey.set(false);
    const model = this._inlineChatWidget.getChatModel();
    if (!model?.sessionResource) {
      return;
    }
    void this._chatService.cancelCurrentRequestForSession(model?.sessionResource, "terminalChat");
  }
  async viewInChat() {
    const widget = await this._chatWidgetService.revealWidget();
    const currentRequest = this._inlineChatWidget.chatWidget.viewModel?.model.getRequests().find((r2) => r2.id === this._currentRequestId);
    if (!widget || !currentRequest?.response) {
      return;
    }
    const message = [];
    for (const item of currentRequest.response.response.value) {
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
    this._chatService.addCompleteRequest(
      widget.viewModel.sessionResource,
      `@${this._terminalAgentName} ${currentRequest.message.text}`,
      currentRequest.variableData,
      currentRequest.attempt,
      {
        message,
        result: currentRequest.response.result,
        followups: currentRequest.response.followups
      }
    );
    widget.focusResponseItem();
    this.hide();
  }
};

TerminalChatWidget = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IChatService),
  __decorateParam(5, ITerminalChatSessionResolver),
  __decorateParam(6, IChatSessionsService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IChatAgentService),
  __decorateParam(10, IChatWidgetService)
], TerminalChatWidget);

var TerminalInlineChatWidget = class extends InlineChatWidget {
  constructor(location2, options3, instantiationService, contextKeyService, keybindingService, accessibilityService, configurationService, accessibleViewService, textModelResolverService, chatService, hoverService, chatEntitlementService, markdownRendererService, _modelService) {
    super(location2, options3, instantiationService, contextKeyService, keybindingService, accessibilityService, configurationService, accessibleViewService, textModelResolverService, chatService, hoverService, chatEntitlementService, markdownRendererService);
    this._modelService = _modelService;
  }
  get value() {
    return this.chatWidget.getInput();
  }
  set value(value2) {
    this.chatWidget.setInput(value2);
  }
  selectAll() {
    this.chatWidget.inputEditor.setSelection(new Selection(1, 1, Number.MAX_SAFE_INTEGER, 1));
  }
  set placeholder(value2) {
    this.chatWidget.setInputPlaceholder(value2);
  }
  toggleStatus(show3) {
    this._elements.toolbar1.classList.toggle("hidden", !show3);
    this._elements.toolbar2.classList.toggle("hidden", !show3);
    this._elements.status.classList.toggle("hidden", !show3);
    this._elements.infoLabel.classList.toggle("hidden", !show3);
    this._onDidChangeHeight.fire();
  }
  updateToolbar(show3) {
    this._elements.root.classList.toggle("toolbar", show3);
    this._elements.toolbar1.classList.toggle("hidden", !show3);
    this._elements.toolbar2.classList.toggle("hidden", !show3);
    this._elements.status.classList.toggle("actions", show3);
    this._elements.infoLabel.classList.toggle("hidden", show3);
    this._onDidChangeHeight.fire();
  }
  get responseContent() {
    const requests = this.chatWidget.viewModel?.model.getRequests();
    return requests?.at(-1)?.response?.response.toString();
  }
  getChatModel() {
    return this.chatWidget.viewModel?.model;
  }
  setChatModel(chatModel) {
    chatModel.inputModel.setState({ inputText: "", selections: [] });
    this.chatWidget.setModel(chatModel);
  }
  async getCodeBlockInfo(codeBlockIndex) {
    const { viewModel } = this.chatWidget;
    if (!viewModel) {
      return void 0;
    }
    const items = viewModel.getItems().filter((i2) => isResponseVM(i2));
    const item = items.at(-1);
    if (!item) {
      return;
    }
    const codeBlocks = this.chatWidget.getCodeBlockInfosForResponse(item);
    const info = codeBlocks[codeBlockIndex];
    if (info?.uri) {
      return this._modelService.getModel(info.uri) ?? void 0;
    }
    const markdown = item.response.getMarkdown();
    let currentCodeBlockIndex = 0;
    let foundText;
    for (const line of markdown.split("\n")) {
      if (line.startsWith("```") && foundText === void 0) {
        foundText = "";
      } else if (line.startsWith("```") && foundText !== void 0) {
        if (currentCodeBlockIndex === codeBlockIndex) {
          break;
        }
        currentCodeBlockIndex++;
        foundText = void 0;
      } else if (foundText !== void 0) {
        foundText += (foundText ? "\n" : "") + line;
      }
    }
    if (foundText !== void 0 && currentCodeBlockIndex === codeBlockIndex) {
      return this._modelService.createModel(foundText, null, void 0, true);
    }
    return void 0;
  }
};

TerminalInlineChatWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IAccessibilityService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IAccessibleViewService),
  __decorateParam(8, ITextModelService),
  __decorateParam(9, IChatService),
  __decorateParam(10, IHoverService),
  __decorateParam(11, IChatEntitlementService),
  __decorateParam(12, IMarkdownRendererService),
  __decorateParam(13, IModelService)
], TerminalInlineChatWidget);
export { TerminalChatWidget, TerminalInlineChatWidget };
