// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatThinkingExternalResourcesWidget.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, clearNode, hide, show } from "./module-0075.mjs";
import { ChatResourceGroupWidget } from "./module-2286.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatThinkingExternalResourcesWidget.ts
var ChatThinkingExternalResourceWidget = class extends Disposable {
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this.resourcePartsByToolCallId = /* @__PURE__ */ new Map();
    this.resourceGroupWidget = this._register(new MutableDisposable());
    this.resourceGroupWidgetHeightListener = this._register(new MutableDisposable());
    this.isCollapsed = true;
    this.domNode = $(".chat-thinking-external-resources");
    hide(this.domNode);
  }
  setToolInvocationParts(toolCallId, parts) {
    if (parts.length === 0) {
      return;
    }
    this.resourcePartsByToolCallId.set(toolCallId, parts);
    this.rebuild();
  }
  removeToolInvocation(toolCallId) {
    if (!this.resourcePartsByToolCallId.delete(toolCallId)) {
      return;
    }
    this.rebuild();
  }
  setCollapsed(collapsed2) {
    this.isCollapsed = collapsed2;
    if (!this.resourceGroupWidget.value) {
      hide(this.domNode);
      return;
    }
    if (this.isCollapsed) {
      show(this.domNode);
    } else {
      hide(this.domNode);
    }
  }
  rebuild() {
    const allParts = [];
    for (const parts of this.resourcePartsByToolCallId.values()) {
      allParts.push(...parts);
    }
    this.resourceGroupWidgetHeightListener.clear();
    this.resourceGroupWidget.clear();
    clearNode(this.domNode);
    if (allParts.length === 0) {
      hide(this.domNode);
      this._onDidChangeHeight.fire();
      return;
    }
    const widget = this.instantiationService.createInstance(ChatResourceGroupWidget, allParts, void 0);
    this.resourceGroupWidgetHeightListener.value = widget.onDidChangeHeight(() => this._onDidChangeHeight.fire());
    this.resourceGroupWidget.value = widget;
    this.domNode.appendChild(widget.domNode);
    this.setCollapsed(this.isCollapsed);
    this._onDidChangeHeight.fire();
  }
};

ChatThinkingExternalResourceWidget = __decorateClass([
  __decorateParam(0, IInstantiationService)
], ChatThinkingExternalResourceWidget);
export { ChatThinkingExternalResourceWidget };
