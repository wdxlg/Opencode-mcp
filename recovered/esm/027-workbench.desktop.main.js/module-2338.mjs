// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatMcpAppSubPart.ts
import { BaseChatToolInvocationSubPart } from "./module-2323.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { $, addDisposableListener, append, clearNode, getWindow } from "./module-0075.mjs";
import { observableValue } from "./module-0048.mjs";
import { ChatMcpAppModel } from "./module-2337.mjs";
import { autorun } from "./module-0052.mjs";
import { ChatResourceGroupWidget } from "./module-2286.mjs";
import { localize } from "./module-0001.mjs";
import { ChatProgressSubPart } from "./module-2289.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { ChatErrorWidget } from "./module-2308.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatMcpAppSubPart.ts
var maxWebviewHeightPct = 0.75;

var ChatMcpAppSubPart = class extends BaseChatToolInvocationSubPart {
  constructor(toolInvocation, onDidRemount, context2, _renderData, _instantiationService, _markdownRendererService) {
    super(toolInvocation);
    this._renderData = _renderData;
    this._instantiationService = _instantiationService;
    this._markdownRendererService = _markdownRendererService;
    this.codeblocks = [];
    /** Current progress part for loading state */
    this._progressPart = this._register(new MutableDisposable());
    /** Current resource group widget for downloads */
    this._downloadWidget = this._register(new MutableDisposable());
    this.domNode = $("div.mcp-app-part");
    this._webviewContainer = $("div.mcp-app-webview");
    this._webviewContainer.style.maxHeight = `${maxWebviewHeightPct * 100}vh`;
    this._webviewContainer.style.minHeight = "100px";
    this._webviewContainer.style.height = "300px";
    this.domNode.appendChild(this._webviewContainer);
    this._downloadContainer = $("div.mcp-app-downloads");
    this.domNode.appendChild(this._downloadContainer);
    const targetWindow = getWindow(this.domNode);
    const getMaxHeight = () => maxWebviewHeightPct * targetWindow.innerHeight;
    const maxHeight = observableValue("mcpAppMaxHeight", getMaxHeight());
    addDisposableListener(targetWindow, "resize", () => maxHeight.set(getMaxHeight(), void 0));
    this._model = this._register(this._instantiationService.createInstance(
      ChatMcpAppModel,
      toolInvocation,
      this._renderData,
      this._webviewContainer,
      maxHeight,
      context2.currentWidth
    ));
    this._updateContainerHeight();
    this._register(autorun((reader) => {
      const loadState = this._model.loadState.read(reader);
      this._handleLoadStateChange(this._webviewContainer, loadState);
    }));
    this._register(this._model.onDidChangeHeight(() => {
      this._updateContainerHeight();
    }));
    this._register(autorun((reader) => {
      const parts = this._model.downloadParts.read(reader);
      if (parts.length === 0) {
        this._downloadWidget.clear();
        clearNode(this._downloadContainer);
        return;
      }
      clearNode(this._downloadContainer);
      const widget = this._instantiationService.createInstance(ChatResourceGroupWidget, parts, void 0);
      this._downloadWidget.value = widget;
      this._downloadContainer.appendChild(widget.domNode);
    }));
    this._register(onDidRemount(() => {
      this._model.remount();
    }));
    this._register(context2.onDidChangeVisibility((visible) => {
      if (visible) {
        this._model.remount();
      }
    }));
  }
  _handleLoadStateChange(container3, loadState) {
    if (this._progressPart.value) {
      this._progressPart.value.domNode.remove();
    }
    this._progressPart.clear();
    if (this._errorNode) {
      this._errorNode.remove();
      this._errorNode = void 0;
    }
    switch (loadState.status) {
      case "loading": {
        container3.style.display = "none";
        const progressMessage = $("span");
        progressMessage.textContent = localize(12217, null);
        const progressPart = this._instantiationService.createInstance(
          ChatProgressSubPart,
          progressMessage,
          ThemeIcon.modify(Codicon.loading, "spin"),
          void 0
        );
        this._progressPart.value = progressPart;
        this.domNode.appendChild(progressPart.domNode);
        break;
      }
      case "loaded": {
        container3.style.display = "";
        break;
      }
      case "error": {
        container3.style.display = "none";
        this._showError(this.domNode, loadState.error);
        break;
      }
    }
  }
  _updateContainerHeight() {
    this._webviewContainer.style.height = `${this._model.height}px`;
  }
  /**
   * Shows an error message in the container.
   */
  _showError(container3, error) {
    const errorNode = $(".mcp-app-error");
    const errorMessage = new MarkdownString();
    errorMessage.appendText(localize(12218, null, error.message || String(error)));
    const errorWidget = this._register(new ChatErrorWidget(2 /* Error */, errorMessage, this._markdownRendererService));
    errorNode.appendChild(errorWidget.domNode);
    const buttonContainer = append(errorNode, $(".chat-buttons-container"));
    const retryButton = this._register(new Button(buttonContainer, defaultButtonStyles));
    retryButton.label = localize(12219, null);
    this._register(retryButton.onDidClick(() => {
      this._model.retry();
    }));
    container3.appendChild(errorNode);
    this._errorNode = errorNode;
  }
};

ChatMcpAppSubPart = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IMarkdownRendererService)
], ChatMcpAppSubPart);
export { maxWebviewHeightPct, ChatMcpAppSubPart };
