// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatCollapsibleContentPart.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { getCompactCodicon } from "./module-2040.mjs";
import { $ } from "./module-0075.mjs";
import { ButtonWithIcon } from "./module-0546.mjs";
import { autorun } from "./module-0052.mjs";
import { renderFileWidgets } from "./module-2142.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatCollapsibleContentPart.ts
var ChatCollapsibleContentPart = class extends Disposable {
  constructor(title, context2, hoverMessage, hoverService, configurationService) {
    super();
    this.title = title;
    this.hoverMessage = hoverMessage;
    this.hoverService = hoverService;
    this._renderedTitleWithWidgets = this._register(new MutableDisposable());
    this._titleFileWidgetStore = this._register(new DisposableStore());
    this._isExpanded = observableValue(this, false);
    this._overrideIcon = observableValue(this, void 0);
    this._contentInitialized = false;
    this._isExpandable = true;
    this.ariaLabel = typeof title === "string" ? title : title.value;
    this.element = context2.element;
    this.hasFollowingContent = context2.contentIndex + 1 < context2.content.length;
    this._showCheckmarks = observableConfigValue("accessibility.chat.showCheckmarks" /* ShowChatCheckmarks */, false, configurationService);
  }
  static {
    this.userToggleEvent = "chatCollapsibleUserToggle";
  }
  get icon() {
    return this._overrideIcon.get();
  }
  set icon(value2) {
    this._overrideIcon.set(value2 ? getCompactCodicon(value2) : void 0, void 0);
  }
  get domNode() {
    this._domNode ??= this.init();
    return this._domNode;
  }
  init() {
    const referencesLabel = this.title;
    const buttonElement = $(".chat-used-context-label", void 0);
    const collapseButton = this._register(new ButtonWithIcon(buttonElement, {
      buttonBackground: void 0,
      buttonBorder: void 0,
      buttonForeground: void 0,
      buttonHoverBackground: void 0,
      buttonSecondaryBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryHoverBackground: void 0,
      buttonSeparator: void 0
    }));
    this._collapseButton = collapseButton;
    this._domNode = $(".chat-used-context", void 0, buttonElement);
    collapseButton.label = referencesLabel;
    let animatedContent;
    if (this.shouldPrepareContentAnimation()) {
      this._domNode.classList.add("chat-collapsible-content-animatable");
      this._domNode.classList.toggle("chat-collapsible-content-animated", this.shouldAnimateContent());
      const animationContainer = $(".chat-collapsible-content-animation");
      this._animationContainer = animationContainer;
      animatedContent = $(".chat-collapsible-content-animation-inner");
      animationContainer.appendChild(animatedContent);
      this._domNode.appendChild(animationContainer);
    }
    const hoverChevron = $("span.chat-collapsible-hover-chevron.codicon.codicon-chevron-right-compact", { "aria-hidden": "true" });
    this._hoverChevron = hoverChevron;
    collapseButton.element.appendChild(hoverChevron);
    if (this.hoverMessage) {
      this._register(this.hoverService.setupDelayedHover(collapseButton.iconElement, {
        content: this.hoverMessage,
        style: 1 /* Pointer */
      }));
    }
    this._register(collapseButton.onDidClick(() => this.toggleExpanded()));
    this._isExpanded.set(this.isExpanded(), void 0);
    if (!this._isExpandable) {
      this.setExpandable(false);
    }
    this._register(autorun((r2) => {
      const expanded2 = this._isExpanded.read(r2);
      const overrideIcon = this._overrideIcon.read(r2);
      const showCheckmarks = this._showCheckmarks.read(r2);
      if (overrideIcon) {
        collapseButton.icon = overrideIcon;
      }
      this._domNode?.classList.toggle("show-checkmarks", showCheckmarks);
      hoverChevron.classList.toggle("expanded", expanded2);
      if ((expanded2 || this.shouldInitEarly()) && !this._contentInitialized) {
        this._contentInitialized = true;
        this._contentElement = this.initContent();
        (animatedContent ?? this._domNode)?.appendChild(this._contentElement);
        this.contentDidInitialize();
        if (expanded2 && animatedContent) {
          animatedContent.parentElement?.getBoundingClientRect();
        }
      }
      this._domNode?.classList.toggle("chat-used-context-collapsed", !expanded2);
      if (animatedContent) {
        animatedContent.inert = !expanded2;
      }
      this.updateAriaLabel(collapseButton.element, this.ariaLabel, expanded2);
      this.expansionDidChange(expanded2);
    }));
    return this._domNode;
  }
  toggleExpanded() {
    if (!this._isExpandable) {
      return;
    }
    const value2 = this._isExpanded.get();
    this._domNode?.dispatchEvent(new CustomEvent(ChatCollapsibleContentPart.userToggleEvent, { bubbles: true }));
    this._isExpanded.set(!value2, void 0);
  }
  /**
   * Turns the row into a plain status line: it no longer toggles, and it drops
   * the affordances that would otherwise promise expansion — including its
   * place in the tab order, so it is not a focusable dead control.
   */
  setExpandable(expandable) {
    this._isExpandable = expandable;
    this._domNode?.classList.toggle("chat-collapsible-not-expandable", !expandable);
    this._hoverChevron?.classList.toggle("hidden", !expandable);
    const button = this._collapseButton?.element;
    if (button) {
      button.tabIndex = expandable ? 0 : -1;
      if (expandable) {
        button.setAttribute("role", "button");
        button.removeAttribute("aria-disabled");
        button.ariaExpanded = String(this.isExpanded());
      } else {
        button.removeAttribute("role");
        button.removeAttribute("aria-disabled");
        button.removeAttribute("aria-expanded");
      }
    }
    if (!expandable) {
      this.setExpanded(false);
    }
  }
  shouldInitEarly() {
    return false;
  }
  shouldAnimateContent() {
    return true;
  }
  shouldPrepareContentAnimation() {
    return this.shouldAnimateContent();
  }
  setContentAnimationEnabled(enabled) {
    this.domNode.classList.toggle("chat-collapsible-content-animated", enabled);
  }
  get contentAnimationContainer() {
    return this._animationContainer;
  }
  contentDidInitialize() {
  }
  expansionDidChange(_expanded) {
  }
  updateAriaLabel(element, label3, expanded2) {
    element.ariaLabel = label3;
    element.ariaExpanded = this._isExpandable ? String(expanded2) : null;
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
  get expanded() {
    return this._isExpanded;
  }
  isExpanded() {
    return this._isExpanded.get();
  }
  setExpanded(value2) {
    this._isExpanded.set(value2, void 0);
  }
  setTitle(title) {
    this.title = title;
    if (this._collapseButton) {
      this._collapseButton.label = title;
    }
    this.setAriaLabel(title);
  }
  setAriaLabel(label3) {
    this.ariaLabel = label3;
    if (this._collapseButton) {
      this.updateAriaLabel(this._collapseButton.element, label3, this.isExpanded());
    }
  }
  // Render collapsible dropdown title with widgets
  setTitleWithWidgets(content2, instantiationService, chatMarkdownAnchorService, chatContentMarkdownRenderer) {
    if (this._store.isDisposed || !this._collapseButton) {
      return;
    }
    const result = chatContentMarkdownRenderer.render(content2);
    result.element.classList.add("collapsible-title-content");
    this._titleFileWidgetStore.clear();
    renderFileWidgets(result.element, instantiationService, chatMarkdownAnchorService, this._titleFileWidgetStore);
    const labelElement = this._collapseButton.labelElement;
    labelElement.textContent = "";
    labelElement.appendChild(result.element);
    const textContent = result.element.textContent || "";
    this.setAriaLabel(textContent);
    this._renderedTitleWithWidgets.value = result;
  }
};

ChatCollapsibleContentPart = __decorateClass([
  __decorateParam(3, IHoverService),
  __decorateParam(4, IConfigurationService)
], ChatCollapsibleContentPart);
export { ChatCollapsibleContentPart };
