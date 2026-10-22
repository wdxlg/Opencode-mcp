// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugDetailPanel.ts
import { $, EventType, addDisposableListener, append, clearNode, getWindow, hide, show } from "./module-0075.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { Sash } from "./module-0496.mjs";
import { Button } from "./module-0546.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { customizationSummaryToPlainText, fileListToPlainText, renderCustomizationDiscoveryContent, renderCustomizationSummaryContent } from "./module-2605.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILabelService } from "./module-0641.mjs";
import { renderToolCallContent, toolCallContentToPlainText } from "./module-2606.mjs";
import { messageEventToPlainText, renderAgentResponseContent, renderResolvedMessageContent, renderUserMessageContent, resolvedMessageToPlainText } from "./module-2607.mjs";
import { modelTurnContentToPlainText, renderModelTurnContent } from "./module-2608.mjs";
import { hookContentToPlainText, renderHookContent } from "./module-2609.mjs";
import { formatEventDetail } from "./module-2603.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatDebugService } from "./module-1456.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugDetailPanel.ts
var $77 = $;

var DETAIL_PANEL_DEFAULT_WIDTH = 350;

var DETAIL_PANEL_MIN_WIDTH = 200;

var DETAIL_PANEL_MAX_WIDTH = 800;

var ChatDebugDetailPanel = class extends Disposable {
  constructor(parent, chatDebugService, instantiationService, editorService, clipboardService, hoverService, openerService, languageService) {
    super();
    this.chatDebugService = chatDebugService;
    this.instantiationService = instantiationService;
    this.editorService = editorService;
    this.clipboardService = clipboardService;
    this.hoverService = hoverService;
    this.openerService = openerService;
    this.languageService = languageService;
    this._onDidHide = this._register(new Emitter());
    this.onDidHide = this._onDidHide.event;
    this._onDidChangeWidth = this._register(new Emitter());
    this.onDidChangeWidth = this._onDidChangeWidth.event;
    this.detailDisposables = this._register(new DisposableStore());
    this.currentDetailText = "";
    this._width = DETAIL_PANEL_DEFAULT_WIDTH;
    this.element = append(parent, $77(".chat-debug-detail-panel"));
    this.contentContainer = $77(".chat-debug-detail-content");
    this.scrollable = this._register(new DomScrollableElement(this.contentContainer, {
      horizontal: 2 /* Hidden */,
      vertical: 1 /* Auto */
    }));
    this.element.style.width = `${this._width}px`;
    hide(this.element);
    this.sash = this._register(new Sash(parent, {
      getVerticalSashLeft: () => parent.offsetWidth - this._width
    }, { orientation: 0 /* VERTICAL */ }));
    this.sash.state = 0 /* Disabled */;
    let sashStartWidth;
    this._register(this.sash.onDidStart(() => sashStartWidth = this._width));
    this._register(this.sash.onDidEnd(() => {
      sashStartWidth = void 0;
      this.sash.layout();
    }));
    this._register(this.sash.onDidChange((e) => {
      if (sashStartWidth === void 0) {
        return;
      }
      const delta2 = e.startX - e.currentX;
      const newWidth = Math.max(DETAIL_PANEL_MIN_WIDTH, Math.min(DETAIL_PANEL_MAX_WIDTH, sashStartWidth + delta2));
      this._width = newWidth;
      this.element.style.width = `${newWidth}px`;
      this.sash.layout();
      this._onDidChangeWidth.fire(newWidth);
    }));
    this._register(addDisposableListener(this.element, EventType.KEY_DOWN, (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        const target = e.target;
        if (target && this.element.contains(target)) {
          e.preventDefault();
          const targetWindow = getWindow(target);
          const selection = targetWindow.getSelection();
          if (selection) {
            const range2 = targetWindow.document.createRange();
            range2.selectNodeContents(target);
            selection.removeAllRanges();
            selection.addRange(range2);
          }
        }
      }
    }));
  }
  get width() {
    return this._width;
  }
  async show(event) {
    if (event.id && event.id === this.currentDetailEventId) {
      return;
    }
    this.currentDetailEventId = event.id;
    const resolved = event.id ? await this.chatDebugService.resolveEvent(event.id) : void 0;
    show(this.element);
    this.sash.state = 3 /* Enabled */;
    this.sash.layout();
    clearNode(this.element);
    clearNode(this.contentContainer);
    this.detailDisposables.clear();
    const header2 = append(this.element, $77(".chat-debug-detail-header"));
    this.headerElement = header2;
    this.element.appendChild(this.scrollable.getDomNode());
    const fullScreenButton = this.detailDisposables.add(new Button(header2, { ariaLabel: localize(10562, null), title: localize(10562, null) }));
    fullScreenButton.element.classList.add("chat-debug-detail-button");
    fullScreenButton.icon = Codicon.goToFile;
    this.firstFocusableElement = fullScreenButton.element;
    this.detailDisposables.add(fullScreenButton.onDidClick(() => {
      this.editorService.openEditor({ contents: this.currentDetailText, resource: void 0 });
    }));
    const copyButton = this.detailDisposables.add(new Button(header2, { ariaLabel: localize(10561, null), title: localize(10561, null) }));
    copyButton.element.classList.add("chat-debug-detail-button");
    copyButton.icon = Codicon.copy;
    this.detailDisposables.add(copyButton.onDidClick(() => {
      this.clipboardService.writeText(this.currentDetailText);
    }));
    const closeButton = this.detailDisposables.add(new Button(header2, { ariaLabel: localize(10560, null), title: localize(10560, null) }));
    closeButton.element.classList.add("chat-debug-detail-button");
    closeButton.icon = Codicon.closeSmall;
    this.detailDisposables.add(closeButton.onDidClick(() => {
      this.hide();
    }));
    if (resolved && resolved.kind === "fileList") {
      this.currentDetailText = fileListToPlainText(resolved);
      const { element: contentEl, disposables: contentDisposables } = this.instantiationService.invokeFunction(
        (accessor) => renderCustomizationDiscoveryContent(resolved, this.openerService, accessor.get(IModelService), this.languageService, this.hoverService, accessor.get(ILabelService), this.scrollable)
      );
      this.detailDisposables.add(contentDisposables);
      this.contentContainer.appendChild(contentEl);
    } else if (resolved && resolved.kind === "customizationSummary") {
      this.currentDetailText = customizationSummaryToPlainText(resolved);
      const { element: contentEl, disposables: contentDisposables } = this.instantiationService.invokeFunction(
        (accessor) => renderCustomizationSummaryContent(resolved, this.openerService, accessor.get(IModelService), this.languageService, this.hoverService, accessor.get(ILabelService), this.scrollable)
      );
      this.detailDisposables.add(contentDisposables);
      this.contentContainer.appendChild(contentEl);
    } else if (resolved && resolved.kind === "toolCall") {
      this.currentDetailText = toolCallContentToPlainText(resolved);
      const { element: contentEl, disposables: contentDisposables } = await renderToolCallContent(resolved, this.languageService, this.clipboardService, this.scrollable);
      if (this.currentDetailEventId !== event.id) {
        contentDisposables.dispose();
        return;
      }
      this.detailDisposables.add(contentDisposables);
      this.contentContainer.appendChild(contentEl);
    } else if (resolved && resolved.kind === "message") {
      this.currentDetailText = resolvedMessageToPlainText(resolved);
      const { element: contentEl, disposables: contentDisposables } = await renderResolvedMessageContent(resolved, this.languageService, this.clipboardService, this.scrollable);
      if (this.currentDetailEventId !== event.id) {
        contentDisposables.dispose();
        return;
      }
      this.detailDisposables.add(contentDisposables);
      this.contentContainer.appendChild(contentEl);
    } else if (resolved && resolved.kind === "modelTurn") {
      this.currentDetailText = modelTurnContentToPlainText(resolved);
      const { element: contentEl, disposables: contentDisposables } = await renderModelTurnContent(resolved, this.languageService, this.clipboardService, this.scrollable);
      if (this.currentDetailEventId !== event.id) {
        contentDisposables.dispose();
        return;
      }
      this.detailDisposables.add(contentDisposables);
      this.contentContainer.appendChild(contentEl);
    } else if (resolved && resolved.kind === "hook") {
      this.currentDetailText = hookContentToPlainText(resolved);
      const { element: contentEl, disposables: contentDisposables } = await renderHookContent(resolved, this.languageService, this.clipboardService, this.scrollable);
      if (this.currentDetailEventId !== event.id) {
        contentDisposables.dispose();
        return;
      }
      this.detailDisposables.add(contentDisposables);
      this.contentContainer.appendChild(contentEl);
    } else if (event.kind === "userMessage") {
      this.currentDetailText = messageEventToPlainText(event);
      const { element: contentEl, disposables: contentDisposables } = await renderUserMessageContent(event, this.languageService, this.clipboardService, this.scrollable);
      if (this.currentDetailEventId !== event.id) {
        contentDisposables.dispose();
        return;
      }
      this.detailDisposables.add(contentDisposables);
      this.contentContainer.appendChild(contentEl);
    } else if (event.kind === "agentResponse") {
      this.currentDetailText = messageEventToPlainText(event);
      const { element: contentEl, disposables: contentDisposables } = await renderAgentResponseContent(event, this.languageService, this.clipboardService, this.scrollable);
      if (this.currentDetailEventId !== event.id) {
        contentDisposables.dispose();
        return;
      }
      this.detailDisposables.add(contentDisposables);
      this.contentContainer.appendChild(contentEl);
    } else {
      const pre = append(this.contentContainer, $77("pre"));
      pre.tabIndex = 0;
      if (resolved) {
        this.currentDetailText = resolved.value;
      } else {
        this.currentDetailText = formatEventDetail(event);
      }
      pre.textContent = this.currentDetailText;
    }
    const parentHeight = this.element.parentElement?.clientHeight ?? 0;
    if (parentHeight > 0) {
      this.layout(parentHeight);
    } else {
      this.scrollable.scanDomNode();
    }
  }
  get isVisible() {
    return this.element.style.display !== "none";
  }
  focus() {
    this.firstFocusableElement?.focus();
  }
  /**
   * Set explicit dimensions on the scrollable element so the scrollbar
   * can compute its size. Call after the panel is shown and whenever
   * the available space changes.
   */
  layout(height) {
    const headerHeight = this.headerElement?.offsetHeight ?? 0;
    const scrollableHeight = Math.max(0, height - headerHeight);
    const scrollPos = this.scrollable.getScrollPosition();
    this.contentContainer.style.height = `${scrollableHeight}px`;
    this.scrollable.scanDomNode();
    this.scrollable.setScrollPosition({ scrollTop: scrollPos.scrollTop });
    this.sash.layout();
  }
  layoutSash() {
    this.sash.layout();
  }
  hide() {
    this.currentDetailEventId = void 0;
    this.firstFocusableElement = void 0;
    this.headerElement = void 0;
    hide(this.element);
    this.sash.state = 0 /* Disabled */;
    clearNode(this.element);
    clearNode(this.contentContainer);
    this.detailDisposables.clear();
    this._onDidHide.fire();
  }
};

ChatDebugDetailPanel = __decorateClass([
  __decorateParam(1, IChatDebugService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IClipboardService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, ILanguageService)
], ChatDebugDetailPanel);
export { $77, DETAIL_PANEL_DEFAULT_WIDTH, DETAIL_PANEL_MIN_WIDTH, DETAIL_PANEL_MAX_WIDTH, ChatDebugDetailPanel };
