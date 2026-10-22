// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChatWidget.ts
import { $, getActiveElement, getTotalHeight, getWindow, h, reset, trackFocus } from "./module-0075.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ChatWidget } from "./module-2394.mjs";
import { isResponseVM } from "./module-0978.mjs";
import { ChatMode } from "./module-1470.mjs";
import { CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_RESPONSE_FOCUSED, inlineChatBackground, inlineChatForeground } from "./module-2001.mjs";
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from "./module-0912.mjs";
import { inputBackground } from "./module-0233.mjs";
import { editorBackground } from "./module-0229.mjs";
import { asCssVariable, asCssVariableName } from "./module-0226.mjs";
import { chatRequestBackground } from "./module-2063.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { MenuWorkbenchButtonBar } from "./module-2011.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuId } from "./module-0092.mjs";
import { createActionViewItem } from "./module-0516.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { autorun } from "./module-0052.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { product_default } from "./module-0139.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibleViewService } from "./module-0799.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IChatService } from "./module-0972.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { ILayoutService } from "./module-0551.mjs";


// src/vs/workbench/contrib/inlineChat/browser/inlineChatWidget.ts
var InlineChatWidget = class {
  constructor(location2, options3, _instantiationService, contextKeyService, keybindingService, accessibilityService, configurationService, accessibleViewService, _textModelResolverService, chatService, hoverService, chatEntitlementService, markdownRendererService) {
    this._instantiationService = _instantiationService;
    this._textModelResolverService = _textModelResolverService;
    this._elements = h(
      "div.inline-chat@root",
      [
        h("div.chat-widget@chatWidget"),
        h("div.accessibleViewer@accessibleViewer"),
        h("div.status@status", [
          h("div.label.info.hidden@infoLabel"),
          h("div.actions.hidden@toolbar1"),
          h("div.label.status.hidden@statusLabel"),
          h("div.actions.secondary.hidden@toolbar2"),
          h("div.label.disclaimer.hidden@disclaimerLabel")
        ])
      ]
    );
    this._store = new DisposableStore();
    this._onDidChangeHeight = this._store.add(new Emitter());
    this.onDidChangeHeight = Event2.filter(this._onDidChangeHeight.event, (_) => !this.#isLayouting);
    this.#requestInProgress = observableValue(this, false);
    this.requestInProgress = this.#requestInProgress;
    this.#isLayouting = false;
    this.#options = options3;
    this.#keybindingService = keybindingService;
    this.#accessibilityService = accessibilityService;
    this.#configurationService = configurationService;
    this.#accessibleViewService = accessibleViewService;
    this.#chatService = chatService;
    this.#chatEntitlementService = chatEntitlementService;
    this.#markdownRendererService = markdownRendererService;
    this.scopedContextKeyService = this._store.add(contextKeyService.createScoped(this._elements.chatWidget));
    const scopedInstaService = _instantiationService.createChild(
      new ServiceCollection([
        IContextKeyService,
        this.scopedContextKeyService
      ]),
      this._store
    );
    this.chatWidget = scopedInstaService.createInstance(
      ChatWidget,
      location2,
      { isInlineChat: true },
      {
        autoScroll: true,
        defaultElementHeight: 32,
        renderStyle: "minimal",
        renderInputOnTop: false,
        renderFollowups: true,
        supportsFileReferences: true,
        filter: (item) => {
          if (!isResponseVM(item) || item.errorDetails) {
            return true;
          }
          const emptyResponse = item.response.value.length === 0;
          if (emptyResponse) {
            return false;
          }
          if (item.response.value.every((item2) => item2.kind === "textEditGroup" && options3.chatWidgetViewOptions?.rendererOptions?.renderTextEditsAsSummary?.(item2.uri))) {
            return false;
          }
          return true;
        },
        dndContainer: this._elements.root,
        defaultMode: ChatMode.Ask,
        ...options3.chatWidgetViewOptions
      },
      {
        listForeground: inlineChatForeground,
        listBackground: inlineChatBackground,
        overlayBackground: EDITOR_DRAG_AND_DROP_BACKGROUND,
        inputEditorBackground: inputBackground,
        resultEditorBackground: editorBackground
      }
    );
    this._elements.root.classList.toggle("in-zone-widget", !!options3.inZoneWidget);
    this.chatWidget.render(this._elements.chatWidget);
    this._elements.chatWidget.style.setProperty(asCssVariableName(chatRequestBackground), asCssVariable(inlineChatBackground));
    this.chatWidget.setVisible(true);
    this._store.add(this.chatWidget);
    const ctxResponse = ChatContextKeys.isResponse.bindTo(this.scopedContextKeyService);
    const ctxResponseVote = ChatContextKeys.responseVote.bindTo(this.scopedContextKeyService);
    const ctxResponseSupportIssues = ChatContextKeys.responseSupportsIssueReporting.bindTo(this.scopedContextKeyService);
    const ctxResponseError = ChatContextKeys.responseHasError.bindTo(this.scopedContextKeyService);
    const ctxResponseErrorFiltered = ChatContextKeys.responseIsFiltered.bindTo(this.scopedContextKeyService);
    const viewModelStore = this._store.add(new DisposableStore());
    this._store.add(this.chatWidget.onDidChangeViewModel(() => {
      viewModelStore.clear();
      const viewModel = this.chatWidget.viewModel;
      if (!viewModel) {
        return;
      }
      viewModelStore.add(toDisposable(() => {
        toolbar2.context = void 0;
        ctxResponse.reset();
        ctxResponseVote.reset();
        ctxResponseError.reset();
        ctxResponseErrorFiltered.reset();
        ctxResponseSupportIssues.reset();
      }));
      viewModelStore.add(viewModel.onDidChange(() => {
        this.#requestInProgress.set(viewModel.model.requestInProgress.get(), void 0);
        const last = viewModel.getItems().at(-1);
        toolbar2.context = last;
        ctxResponse.set(isResponseVM(last));
        ctxResponseVote.set(isResponseVM(last) ? last.vote === 0 /* Down */ ? "down" : last.vote === 1 /* Up */ ? "up" : "" : "");
        ctxResponseError.set(isResponseVM(last) && last.errorDetails !== void 0);
        ctxResponseErrorFiltered.set(!!(isResponseVM(last) && last.errorDetails?.responseIsFiltered));
        ctxResponseSupportIssues.set(isResponseVM(last) && (last.agent?.metadata.supportIssueReporting ?? false));
        this._onDidChangeHeight.fire();
      }));
      this._onDidChangeHeight.fire();
    }));
    this._store.add(this.chatWidget.onDidChangeContentHeight(() => {
      this._onDidChangeHeight.fire();
    }));
    this.#ctxResponseFocused = CTX_INLINE_CHAT_RESPONSE_FOCUSED.bindTo(contextKeyService);
    const tracker2 = this._store.add(trackFocus(this.domNode));
    this._store.add(tracker2.onDidBlur(() => this.#ctxResponseFocused.set(false)));
    this._store.add(tracker2.onDidFocus(() => this.#ctxResponseFocused.set(true)));
    this.#ctxInputEditorFocused = CTX_INLINE_CHAT_FOCUSED.bindTo(contextKeyService);
    this._store.add(this.chatWidget.inputEditor.onDidFocusEditorWidget(() => this.#ctxInputEditorFocused.set(true)));
    this._store.add(this.chatWidget.inputEditor.onDidBlurEditorWidget(() => this.#ctxInputEditorFocused.set(false)));
    if (options3.statusMenuId) {
      const statusMenuOptions = options3.statusMenuId.options;
      const statusButtonBar = scopedInstaService.createInstance(MenuWorkbenchButtonBar, this._elements.toolbar1, options3.statusMenuId.menu, {
        toolbarOptions: { primaryGroup: "0_main" },
        telemetrySource: options3.chatWidgetViewOptions?.menus?.telemetrySource,
        menuOptions: { renderShortTitle: true },
        ...statusMenuOptions
      });
      this._store.add(statusButtonBar.onDidChange(() => this._onDidChangeHeight.fire()));
      this._store.add(statusButtonBar);
    }
    const toolbar2 = scopedInstaService.createInstance(MenuWorkbenchToolBar, this._elements.toolbar2, options3.secondaryMenuId ?? MenuId.for(""), {
      telemetrySource: options3.chatWidgetViewOptions?.menus?.telemetrySource,
      menuOptions: { renderShortTitle: true, shouldForwardArgs: true },
      actionViewItemProvider: (action, options4) => {
        return createActionViewItem(scopedInstaService, action, options4);
      }
    });
    this._store.add(toolbar2.onDidChangeMenuItems(() => this._onDidChangeHeight.fire()));
    this._store.add(toolbar2);
    this._store.add(this.#configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("accessibility.verbosity.inlineChat" /* InlineChat */)) {
        this.#updateAriaLabel();
      }
    }));
    this._elements.root.tabIndex = 0;
    this._elements.statusLabel.tabIndex = 0;
    this.#updateAriaLabel();
    this.#setupDisclaimer();
    this._store.add(hoverService.setupManagedHover(getDefaultHoverDelegate("element"), this._elements.statusLabel, () => {
      return this._elements.statusLabel.dataset["title"];
    }));
    this._store.add(this.#chatService.onDidPerformUserAction((e) => {
      if (isEqual2(e.sessionResource, this.chatWidget.viewModel?.model.sessionResource) && e.action.kind === "vote") {
        this.updateStatus(localize(16166, null), { resetAfter: 1250 });
      }
    }));
  }
  #ctxInputEditorFocused;
  #ctxResponseFocused;
  #requestInProgress;
  #isLayouting;
  #options;
  #keybindingService;
  #accessibilityService;
  #configurationService;
  #accessibleViewService;
  #chatService;
  #chatEntitlementService;
  #markdownRendererService;
  #updateAriaLabel() {
    this._elements.root.ariaLabel = this.#accessibleViewService.getOpenAriaHint("accessibility.verbosity.inlineChat" /* InlineChat */);
    if (this.#accessibilityService.isScreenReaderOptimized()) {
      let label3 = defaultAriaLabel;
      if (this.#configurationService.getValue("accessibility.verbosity.inlineChat" /* InlineChat */)) {
        const kbLabel = this.#keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* OpenAccessibilityHelp */)?.getLabel();
        label3 = kbLabel ? localize(16167, null, kbLabel) : localize(16168, null);
      }
      this.chatWidget.inputEditor.updateOptions({ ariaLabel: label3 });
    }
  }
  #setupDisclaimer() {
    const disposables = this._store.add(new DisposableStore());
    this._store.add(autorun((reader) => {
      disposables.clear();
      reset(this._elements.disclaimerLabel);
      const sentiment = this.#chatEntitlementService.sentimentObs.read(reader);
      const anonymous = this.#chatEntitlementService.anonymousObs.read(reader);
      const requestInProgress = this.#chatService.requestInProgressObs.read(reader);
      const showDisclaimer = !sentiment.completed && anonymous && !requestInProgress;
      this._elements.disclaimerLabel.classList.toggle("hidden", !showDisclaimer);
      if (showDisclaimer) {
        const renderedMarkdown = disposables.add(this.#markdownRendererService.render(new MarkdownString(localize(16169, null, product_default.defaultChatAgent?.provider?.default?.name ?? "", product_default.defaultChatAgent?.provider?.default?.name ?? "", product_default.defaultChatAgent?.termsStatementUrl ?? "", product_default.defaultChatAgent?.privacyStatementUrl ?? ""), { isTrusted: true })));
        this._elements.disclaimerLabel.appendChild(renderedMarkdown.element);
      }
      this._onDidChangeHeight.fire();
    }));
  }
  dispose() {
    this._store.dispose();
  }
  get domNode() {
    return this._elements.root;
  }
  layout(widgetDim) {
    const contentHeight = this.contentHeight;
    this.#isLayouting = true;
    try {
      this._doLayout(widgetDim);
    } finally {
      this.#isLayouting = false;
      if (this.contentHeight !== contentHeight) {
        this._onDidChangeHeight.fire();
      }
    }
  }
  _doLayout(dimension) {
    const extraHeight = this._getExtraHeight();
    const statusHeight = getTotalHeight(this._elements.status);
    this._elements.root.style.height = `${dimension.height - extraHeight}px`;
    this._elements.root.style.width = `${dimension.width}px`;
    this.chatWidget.layout(
      dimension.height - statusHeight - extraHeight,
      dimension.width
    );
  }
  /**
   * The content height of this widget is the size that would require no scrolling
   */
  get contentHeight() {
    const data = {
      chatWidgetContentHeight: this.chatWidget.contentHeight,
      statusHeight: getTotalHeight(this._elements.status),
      extraHeight: this._getExtraHeight()
    };
    const result = data.chatWidgetContentHeight + data.statusHeight + data.extraHeight;
    return result;
  }
  get minHeight() {
    let maxWidgetOutputHeight = 100;
    for (const item of this.chatWidget.viewModel?.getItems() ?? []) {
      if (isResponseVM(item) && item.response.value.some((r2) => r2.kind === "textEditGroup" && !r2.state?.applied)) {
        maxWidgetOutputHeight = 270;
        break;
      }
    }
    let value2 = this.contentHeight;
    value2 -= this.chatWidget.contentHeight;
    value2 += Math.min(this.chatWidget.input.height.get() + maxWidgetOutputHeight, this.chatWidget.contentHeight);
    return value2;
  }
  _getExtraHeight() {
    return this.#options.inZoneWidget ? 1 : 2 + 4;
  }
  updateInfo(message) {
    this._elements.infoLabel.classList.toggle("hidden", !message);
    const renderedMessage = renderLabelWithIcons(message);
    reset(this._elements.infoLabel, ...renderedMessage);
    this._onDidChangeHeight.fire();
  }
  updateStatus(message, ops = {}) {
    const isTempMessage = typeof ops.resetAfter === "number";
    if (isTempMessage && !this._elements.statusLabel.dataset["state"]) {
      const statusLabel = this._elements.statusLabel.innerText;
      const title = this._elements.statusLabel.dataset["title"];
      const classes2 = Array.from(this._elements.statusLabel.classList.values());
      setTimeout(() => {
        this.updateStatus(statusLabel, { classes: classes2, keepMessage: true, title });
      }, ops.resetAfter);
    }
    const renderedMessage = renderLabelWithIcons(message);
    reset(this._elements.statusLabel, ...renderedMessage);
    this._elements.statusLabel.className = `label status ${(ops.classes ?? []).join(" ")}`;
    this._elements.statusLabel.classList.toggle("hidden", !message);
    if (isTempMessage) {
      this._elements.statusLabel.dataset["state"] = "temp";
    } else {
      delete this._elements.statusLabel.dataset["state"];
    }
    if (ops.title) {
      this._elements.statusLabel.dataset["title"] = ops.title;
    } else {
      delete this._elements.statusLabel.dataset["title"];
    }
    this._onDidChangeHeight.fire();
  }
  reset() {
    this.chatWidget.attachmentModel.clear(true);
    this.chatWidget.saveState();
    reset(this._elements.statusLabel);
    this._elements.statusLabel.classList.toggle("hidden", true);
    this._elements.toolbar1.classList.add("hidden");
    this._elements.toolbar2.classList.add("hidden");
    this.updateInfo("");
    this._elements.accessibleViewer.classList.toggle("hidden", true);
    this._onDidChangeHeight.fire();
  }
  focus() {
    this.chatWidget.focusInput();
  }
  hasFocus() {
    return this.domNode.contains(getActiveElement());
  }
};

InlineChatWidget = __decorateClass([
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
  __decorateParam(12, IMarkdownRendererService)
], InlineChatWidget);

var defaultAriaLabel = localize(16165, null);

var EditorBasedInlineChatWidget = class extends InlineChatWidget {
  constructor(location2, parentEditor, options3, contextKeyService, keybindingService, instantiationService, accessibilityService, configurationService, accessibleViewService, textModelResolverService, chatService, hoverService, layoutService, chatEntitlementService, markdownRendererService) {
    const overflowWidgetsNode = layoutService.getContainer(getWindow(parentEditor.getContainerDomNode())).appendChild($(".inline-chat-overflow.monaco-editor"));
    super(location2, {
      ...options3,
      chatWidgetViewOptions: {
        ...options3.chatWidgetViewOptions,
        editorOverflowWidgetsDomNode: overflowWidgetsNode
      }
    }, instantiationService, contextKeyService, keybindingService, accessibilityService, configurationService, accessibleViewService, textModelResolverService, chatService, hoverService, chatEntitlementService, markdownRendererService);
    this._store.add(toDisposable(() => {
      overflowWidgetsNode.remove();
    }));
  }
  // --- layout
  _doLayout(dimension) {
    const newHeight = dimension.height;
    super._doLayout(dimension.with(void 0, newHeight));
    this._elements.root.style.height = `${dimension.height - this._getExtraHeight()}px`;
  }
  reset() {
    this.chatWidget.setInput();
    super.reset();
  }
};

EditorBasedInlineChatWidget = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IAccessibilityService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IAccessibleViewService),
  __decorateParam(9, ITextModelService),
  __decorateParam(10, IChatService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, ILayoutService),
  __decorateParam(13, IChatEntitlementService),
  __decorateParam(14, IMarkdownRendererService)
], EditorBasedInlineChatWidget);
export { InlineChatWidget, defaultAriaLabel, EditorBasedInlineChatWidget };
