// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolConfirmationCarouselPart.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { AnimationFrameScheduler, DisposableResizeObserver, addDisposableListener, clearNode, getWindow, h, hide, isHTMLElement, setVisibility, show } from "./module-0075.mjs";
import { CHAT_CARD_HEADER_ACTIONS_CLASS, CHAT_CARD_LARGE_CLASS, chatCardButtonStyles } from "./module-2136.mjs";
import { localize } from "./module-0001.mjs";
import { generateUuid } from "./module-0190.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { Codicon } from "./module-0085.mjs";
import { autorun } from "./module-0052.mjs";
import { IChatToolInvocation } from "./module-0972.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolConfirmationCarouselPart.ts
var COLLAPSED_CAROUSEL_MAX_HEIGHT = 300;

var COLLAPSED_MESSAGE_MAX_HEIGHT = 200;

var COLLAPSED_CODE_BLOCK_MAX_HEIGHT = 150;

var MIN_CAROUSEL_MAX_HEIGHT = 80;

var EXPANDABLE_CONTENT_SELECTOR = ".interactive-result-editor, .chat-markdown-part.rendered-markdown";

var ChatToolConfirmationCarouselPart = class extends Disposable {
  constructor(toolPartFactory, initialTools, revealSubagent, initialRevealSubagentLabel, initialSubAgentInvocationId, initialSubagentTitle) {
    super();
    this.toolPartFactory = toolPartFactory;
    this.revealSubagent = revealSubagent;
    this.initialRevealSubagentLabel = initialRevealSubagentLabel;
    this.initialSubAgentInvocationId = initialSubAgentInvocationId;
    this.initialSubagentTitle = initialSubagentTitle;
    this._onDidEmpty = this._register(new Emitter());
    this.onDidEmpty = this._onDidEmpty.event;
    this._onDidChangeActiveSubagent = this._register(new Emitter());
    this.onDidChangeActiveSubagent = this._onDidChangeActiveSubagent.event;
    this.items = [];
    this.toolCallIds = /* @__PURE__ */ new Set();
    this.activeIndex = 0;
    this._isContentExpanded = false;
    this.canExpandContent = false;
    const elements = h(`.chat-tool-confirmation-carousel.${CHAT_CARD_LARGE_CLASS}@root`, [
      h(".chat-tool-carousel-overlay@overlay", [
        h(".chat-tool-carousel-title-group@titleGroup", [
          h("span.chat-tool-carousel-collapsed-title@collapsedTitle"),
          h("button.chat-tool-carousel-agent-label@agentLabel")
        ]),
        h(`.chat-tool-carousel-overlay-actions.${CHAT_CARD_HEADER_ACTIONS_CLASS}@overlayActions`, [
          h(".chat-tool-carousel-step-indicator@stepIndicator"),
          h(".chat-tool-carousel-nav-arrows@navArrows")
        ])
      ]),
      h(".chat-tool-carousel-content@content")
    ]);
    this.domNode = elements.root;
    this.domNode.tabIndex = -1;
    this.domNode.setAttribute("role", "group");
    this.domNode.setAttribute("aria-label", localize(12297, null));
    this.collapsedTitle = elements.collapsedTitle;
    this.agentLabel = elements.agentLabel;
    this.contentContainer = elements.content;
    this.contentContainer.id = generateUuid();
    this.stepIndicator = elements.stepIndicator;
    this.activeContentDisposables = this._register(new DisposableStore());
    this.updateContentExpansionStateScheduler = this._register(new AnimationFrameScheduler(this.domNode, () => this.updateContentExpansionState()));
    this.contentResizeObserver = this._register(new DisposableResizeObserver("ChatToolConfirmationCarouselPart.contentExpansion", () => this.updateContentExpansionStateScheduler.schedule()));
    this._register(this.contentResizeObserver.observe(this.contentContainer));
    this.allowAllButton = this._register(new Button(elements.overlayActions, { ...defaultButtonStyles, small: true }));
    this.allowAllButton.element.classList.add("chat-tool-carousel-allow-all-button");
    this.allowAllButton.label = localize(12289, null);
    this._register(this.allowAllButton.onDidClick(() => this.allowAll()));
    this.expandContentButton = this._register(new Button(elements.overlayActions, { ...chatCardButtonStyles, secondary: true, supportIcons: true }));
    this.expandContentButton.element.classList.add("chat-card-icon-button", "chat-tool-carousel-header-button", "chat-tool-carousel-expand-content-button");
    this.expandContentButton.element.setAttribute("aria-controls", this.contentContainer.id);
    this.updateExpandContentButton();
    hide(this.expandContentButton.element);
    this._register(this.expandContentButton.onDidClick(() => this.toggleContentExpanded()));
    this.dismissButton = this._register(new Button(elements.overlayActions, { ...chatCardButtonStyles, secondary: true, supportIcons: true }));
    this.dismissButton.element.classList.add("chat-card-icon-button", "chat-tool-carousel-dismiss-button");
    this.dismissButton.label = `$(${Codicon.closeSmall.id})`;
    const dismissButtonLabel = this.items.length === 1 ? localize(12295, null) : localize(12296, null);
    this.dismissButton.element.setAttribute("aria-label", dismissButtonLabel);
    this.dismissButton.element.title = dismissButtonLabel;
    this._register(this.dismissButton.onDidClick(() => this.skipAll()));
    this.prevButton = this._register(new Button(elements.navArrows, {
      ...chatCardButtonStyles,
      secondary: true,
      supportIcons: true
    }));
    this.prevButton.element.classList.add("chat-card-icon-button", "chat-card-icon-button-strong", "chat-tool-carousel-nav-arrow");
    this.prevButton.label = `$(${Codicon.chevronLeft.id})`;
    this.prevButton.element.setAttribute("aria-label", localize(12292, null));
    this._register(this.prevButton.onDidClick(() => this.navigateRelative(-1)));
    this.nextButton = this._register(new Button(elements.navArrows, {
      ...chatCardButtonStyles,
      secondary: true,
      supportIcons: true
    }));
    this.nextButton.element.classList.add("chat-card-icon-button", "chat-card-icon-button-strong", "chat-tool-carousel-nav-arrow");
    this.nextButton.label = `$(${Codicon.chevronRight.id})`;
    this.nextButton.element.setAttribute("aria-label", localize(12291, null));
    this._register(this.nextButton.onDidClick(() => this.navigateRelative(1)));
    this._register(addDisposableListener(this.agentLabel, "click", (e) => {
      e.preventDefault();
      this.revealActiveSubagent();
    }));
    this._register(addDisposableListener(this.domNode, "keydown", (e) => this.onKeydown(e)));
    for (const tool of initialTools) {
      this.addToolInvocation(tool, this.initialSubAgentInvocationId, this.initialSubagentTitle, this.revealSubagent, this.initialRevealSubagentLabel);
    }
  }
  get pendingCount() {
    return this.items.length;
  }
  get activeSubAgentInvocationId() {
    return this.items[this.activeIndex]?.subAgentInvocationId;
  }
  setMaxHeight(maxHeight) {
    this.maxHeight = maxHeight;
    this.updateContentExpansionState();
  }
  hasToolInvocation(toolCallId) {
    return this.toolCallIds.has(toolCallId);
  }
  addToolInvocation(tool, subAgentInvocationId, subagentTitle, revealSubagent, revealSubagentLabel, toolPart) {
    if (this.toolCallIds.has(tool.toolCallId)) {
      const existing = this.items.find((item2) => item2.toolCallId === tool.toolCallId);
      if (existing && toolPart && !existing.toolPart) {
        this.replaceExternalToolPart(existing, toolPart);
      }
      return;
    }
    this.toolCallIds.add(tool.toolCallId);
    const disposables = new DisposableStore();
    const item = {
      tool,
      toolCallId: tool.toolCallId,
      disposables,
      subAgentInvocationId,
      subagentTitle,
      revealSubagent,
      revealSubagentLabel,
      ownsToolPart: !toolPart,
      toolPart
    };
    this.items.push(item);
    if (toolPart) {
      this.watchExternalToolPart(item, toolPart);
    }
    disposables.add(autorun((reader) => {
      const currentState = tool.state.read(reader);
      if (currentState.type !== IChatToolInvocation.StateKind.WaitingForConfirmation) {
        this.removeItem(tool.toolCallId);
      }
    }));
    this.updateUI();
    if (this.items.length === 1) {
      this.setActiveIndex(0);
    }
  }
  replaceExternalToolPart(item, toolPart) {
    if (item.toolPart === toolPart) {
      return;
    }
    if (item.toolPart && item.ownsToolPart) {
      item.toolPart.dispose();
    }
    item.toolPart = toolPart;
    item.ownsToolPart = false;
    this.watchExternalToolPart(item, toolPart);
    if (this.items[this.activeIndex] === item) {
      this.renderActiveContent();
    }
  }
  watchExternalToolPart(item, toolPart) {
    let isItemAlive = true;
    item.disposables.add(toDisposable(() => isItemAlive = false));
    const externalPartDisposeWatcher = new MutableDisposable();
    externalPartDisposeWatcher.value = toDisposable(() => {
      if (!isItemAlive || item.toolPart !== toolPart) {
        return;
      }
      item.toolPart = void 0;
      item.ownsToolPart = true;
      if (this.items[this.activeIndex] === item) {
        this.renderActiveContent();
      }
    });
    toolPart.addDisposable(externalPartDisposeWatcher);
    item.disposables.add(toDisposable(() => externalPartDisposeWatcher.clear()));
  }
  dispose() {
    for (const item of this.items) {
      if (item.toolPart && item.ownsToolPart) {
        item.toolPart.dispose();
      }
      item.disposables.dispose();
    }
    this.items.splice(0);
    this.toolCallIds.clear();
    super.dispose();
  }
  removeItem(toolCallId) {
    const index2 = this.items.findIndex((i2) => i2.toolCallId === toolCallId);
    if (index2 < 0) {
      return;
    }
    const [removed] = this.items.splice(index2, 1);
    this.toolCallIds.delete(toolCallId);
    if (removed.toolPart && removed.ownsToolPart) {
      removed.toolPart.dispose();
    }
    removed.disposables.dispose();
    if (this.items.length === 0) {
      hide(this.domNode);
      this._onDidChangeActiveSubagent.fire(void 0);
      this._onDidEmpty.fire();
      return;
    }
    if (this.activeIndex >= this.items.length) {
      this.activeIndex = this.items.length - 1;
    }
    this.updateUI();
    this.renderActiveContent();
    this._onDidChangeActiveSubagent.fire(this.activeSubAgentInvocationId);
  }
  setActiveIndex(index2) {
    this.activeIndex = index2;
    this.updateUI();
    this.renderActiveContent();
    this._onDidChangeActiveSubagent.fire(this.activeSubAgentInvocationId);
  }
  navigateRelative(delta2) {
    if (this.items.length <= 1) {
      return;
    }
    const newIndex = (this.activeIndex + delta2 + this.items.length) % this.items.length;
    this.setActiveIndex(newIndex);
  }
  onKeydown(e) {
    if (this.items.length === 0) {
      return;
    }
    if (this.shouldIgnoreNavigationKeydown(e.target)) {
      return;
    }
    const event = new StandardKeyboardEvent(e);
    const focusContentAfterNavigation = isHTMLElement(e.target) && this.contentContainer.contains(e.target);
    let didNavigate = false;
    switch (event.keyCode) {
      case 15 /* LeftArrow */:
        this.navigateRelative(-1);
        didNavigate = true;
        break;
      case 17 /* RightArrow */:
        this.navigateRelative(1);
        didNavigate = true;
        break;
      case 14 /* Home */:
        this.setActiveIndex(0);
        didNavigate = true;
        break;
      case 13 /* End */:
        this.setActiveIndex(this.items.length - 1);
        didNavigate = true;
        break;
    }
    if (!didNavigate) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (focusContentAfterNavigation) {
      this.focusActiveContent();
    }
  }
  shouldIgnoreNavigationKeydown(target) {
    if (!isHTMLElement(target)) {
      return false;
    }
    return !!target.closest('.monaco-editor, .interactive-result-editor, .chat-confirmation-widget-message, input, textarea, select, [contenteditable="true"]');
  }
  focusActiveContent() {
    this.domNode.focus();
  }
  updateUI() {
    const item = this.items[this.activeIndex];
    this.collapsedTitle.textContent = this.getToolTitle(item) ?? "";
    setVisibility(!!this.collapsedTitle.textContent, this.collapsedTitle);
    if (item?.subagentTitle) {
      this.agentLabel.textContent = `\u2014 ${item.subagentTitle}`;
      this.agentLabel.disabled = !item.subAgentInvocationId || !item.revealSubagent;
      this.agentLabel.title = item.revealSubagentLabel ?? localize(12294, null, item.subagentTitle);
      this.agentLabel.setAttribute("aria-label", this.agentLabel.title);
      show(this.agentLabel);
    } else {
      this.agentLabel.textContent = "";
      this.agentLabel.title = "";
      this.agentLabel.removeAttribute("aria-label");
      hide(this.agentLabel);
    }
    this.stepIndicator.textContent = `${this.activeIndex + 1}/${this.items.length}`;
    const multi = this.items.length > 1;
    this.prevButton.enabled = multi;
    this.nextButton.enabled = multi;
    setVisibility(multi, this.stepIndicator);
    setVisibility(multi, this.prevButton.element);
    setVisibility(multi, this.nextButton.element);
    setVisibility(multi, this.allowAllButton.element);
    setVisibility(this.canExpandContent, this.expandContentButton.element);
    this.allowAllButton.label = multi ? localize(12289, null) : localize(12288, null);
    this.updateExpandContentButton();
  }
  renderActiveContent() {
    clearNode(this.contentContainer);
    this.activeContentDisposables.clear();
    this._isContentExpanded = false;
    this.canExpandContent = false;
    const item = this.items[this.activeIndex];
    if (!item) {
      this.updateContentExpansionState();
      return;
    }
    if (!item.toolPart) {
      item.toolPart = this.toolPartFactory(item.tool);
      if (item.ownsToolPart) {
        item.disposables.add(item.toolPart);
      }
    }
    this.contentContainer.appendChild(item.toolPart.domNode);
    this.activeContentDisposables.add(this.contentResizeObserver.observe(item.toolPart.domNode));
    this.observeExpandableContentElements(item.toolPart.domNode);
    this.updateContentExpansionStateScheduler.schedule();
  }
  toggleContentExpanded() {
    if (!this.canExpandContent) {
      return;
    }
    this._isContentExpanded = !this._isContentExpanded;
    this.updateContentExpansionState();
  }
  updateContentExpansionState() {
    this.canExpandContent = this.items.length > 0 && this.isActiveContentLargerThanCollapsedLimit();
    if (!this.canExpandContent) {
      this._isContentExpanded = false;
    }
    this.domNode.classList.toggle("chat-tool-carousel-content-expanded", this.canExpandContent && this._isContentExpanded);
    this.updateMaxHeightStyle();
    setVisibility(this.canExpandContent, this.expandContentButton.element);
    this.updateExpandContentButton();
  }
  updateMaxHeightStyle() {
    if (this.maxHeight === void 0) {
      this.domNode.style.removeProperty("max-height");
      return;
    }
    const expanded2 = this.canExpandContent && this._isContentExpanded;
    const maxHeight = expanded2 ? Math.max(MIN_CAROUSEL_MAX_HEIGHT, this.maxHeight) : this.getCollapsedMaxHeight();
    this.domNode.style.maxHeight = `${Math.floor(maxHeight)}px`;
  }
  updateExpandContentButton() {
    const expanded2 = this.canExpandContent && this._isContentExpanded;
    const label3 = expanded2 ? localize(12293, null) : localize(12290, null);
    this.expandContentButton.label = expanded2 ? `$(${Codicon.screenNormal.id})` : `$(${Codicon.screenFull.id})`;
    this.expandContentButton.element.setAttribute("aria-label", label3);
    this.expandContentButton.element.setAttribute("aria-expanded", String(expanded2));
    this.expandContentButton.setTitle(label3);
  }
  isActiveContentLargerThanCollapsedLimit() {
    const activeContent = this.contentContainer.firstElementChild;
    if (!isHTMLElement(activeContent)) {
      return false;
    }
    return this.hasInnerContentLargerThanCollapsedLimit(activeContent);
  }
  hasInnerContentLargerThanCollapsedLimit(element) {
    if (this.isExpandableContentElement(element) && this.getElementHeight(element) > this.getExpandableContentHeightLimit(element) + 1) {
      return true;
    }
    for (const child of element.children) {
      if (!isHTMLElement(child)) {
        continue;
      }
      if (this.hasInnerContentLargerThanCollapsedLimit(child)) {
        return true;
      }
    }
    return false;
  }
  isExpandableContentElement(element) {
    return element.matches(EXPANDABLE_CONTENT_SELECTOR);
  }
  observeExpandableContentElements(element) {
    if (this.isExpandableContentElement(element)) {
      this.activeContentDisposables.add(this.contentResizeObserver.observe(element));
    }
    for (const child of element.children) {
      if (isHTMLElement(child)) {
        this.observeExpandableContentElements(child);
      }
    }
  }
  getElementHeight(element) {
    return Math.max(element.offsetHeight, element.scrollHeight);
  }
  getExpandableContentHeightLimit(element) {
    const window2 = getWindow(this.domNode);
    if (element.classList.contains("interactive-result-editor")) {
      return Math.min(COLLAPSED_CODE_BLOCK_MAX_HEIGHT, window2.innerHeight * 0.25);
    }
    return Math.min(COLLAPSED_MESSAGE_MAX_HEIGHT, window2.innerHeight * 0.3);
  }
  getCollapsedMaxHeight() {
    const configuredMaxHeight = this.maxHeight === void 0 ? Number.POSITIVE_INFINITY : Math.max(MIN_CAROUSEL_MAX_HEIGHT, this.maxHeight);
    return Math.min(configuredMaxHeight, COLLAPSED_CAROUSEL_MAX_HEIGHT, getWindow(this.domNode).innerHeight * 0.45);
  }
  allowAll() {
    for (const item of [...this.items]) {
      IChatToolInvocation.confirmWith(item.tool, { type: 4 /* UserAction */ });
    }
  }
  skipAll() {
    for (const item of [...this.items]) {
      IChatToolInvocation.confirmWith(item.tool, { type: 5 /* Skipped */ });
    }
  }
  getToolTitle(item) {
    if (!item) {
      return void 0;
    }
    const messages = IChatToolInvocation.getConfirmationMessages(item.tool);
    if (!messages?.title) {
      return void 0;
    }
    return this.truncateTitle(this.toPlainText(messages.title));
  }
  truncateTitle(text2) {
    text2 = text2.replace(/\s+/g, " ").trim();
    const maxLength = 100;
    return text2.length > maxLength ? `${text2.substring(0, maxLength)}\u2026` : text2;
  }
  toPlainText(message) {
    const markdown = typeof message === "string" ? message : message.value;
    return markdown.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (_match, text2, url) => text2 || this.basename(url)).replace(/\*\*([^*]+)\*\*/g, "$1").replace(/__([^_]+)__/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/[\\*_#>]/g, "");
  }
  basename(url) {
    try {
      const path = decodeURIComponent(url.split("?")[0].split("#")[0]);
      const segments = path.split("/").filter(Boolean);
      return segments.at(-1) ?? url;
    } catch {
      return url;
    }
  }
  revealActiveSubagent() {
    const item = this.items[this.activeIndex];
    if (item?.subAgentInvocationId) {
      item.revealSubagent?.(item.subAgentInvocationId);
    }
  }
  activateFirstToolForSubagent(subAgentInvocationId) {
    const index2 = this.items.findIndex((i2) => i2.subAgentInvocationId === subAgentInvocationId);
    if (index2 >= 0) {
      this.setActiveIndex(index2);
    }
  }
};
export { COLLAPSED_CAROUSEL_MAX_HEIGHT, COLLAPSED_MESSAGE_MAX_HEIGHT, COLLAPSED_CODE_BLOCK_MAX_HEIGHT, MIN_CAROUSEL_MAX_HEIGHT, EXPANDABLE_CONTENT_SELECTOR, ChatToolConfirmationCarouselPart };
