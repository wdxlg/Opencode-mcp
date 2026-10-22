// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/banner/bannerPart.ts
import { Part } from "./module-1563.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, append, clearNode, isHTMLElement } from "./module-0075.mjs";
import { BannerFocused } from "./module-0950.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { URI } from "./module-0032.mjs";
import { asCSSUrl } from "./module-0449.mjs";
import { Link } from "./module-0550.mjs";
import { ActionBar } from "./module-0477.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Action } from "./module-0082.mjs";
import { widgetClose } from "./module-0479.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IBannerService } from "./module-1564.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";


// src/vs/workbench/browser/parts/banner/bannerPart.ts
var BannerPart = class extends Part {
  constructor(themeService, layoutService, storageService, contextKeyService, instantiationService, markdownRendererService) {
    super("workbench.parts.banner" /* BANNER_PART */, { hasTitle: false }, themeService, storageService, layoutService);
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.markdownRendererService = markdownRendererService;
    // #region IView
    this.height = 26;
    this.minimumWidth = 0;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this._onDidChangeSize = this._register(new Emitter());
    this.visible = false;
    this.focusedActionIndex = -1;
  }
  get minimumHeight() {
    return this.visible ? this.height : 0;
  }
  get maximumHeight() {
    return this.visible ? this.height : 0;
  }
  get onDidChange() {
    return this._onDidChangeSize.event;
  }
  createContentArea(parent) {
    this.element = parent;
    this.element.tabIndex = 0;
    this._register(addDisposableListener(this.element, EventType.FOCUS, () => {
      if (this.focusedActionIndex !== -1) {
        this.focusActionLink();
      }
    }));
    const scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.element));
    BannerFocused.bindTo(scopedContextKeyService).set(true);
    return this.element;
  }
  close(item) {
    this.setVisibility(false);
    clearNode(this.element);
    if (typeof item.onClose === "function") {
      item.onClose();
    }
    this.item = void 0;
  }
  focusActionLink() {
    const length = this.item?.actions?.length ?? 0;
    if (this.focusedActionIndex < length) {
      const actionLink = this.messageActionsContainer?.children[this.focusedActionIndex];
      if (isHTMLElement(actionLink)) {
        this.actionBar?.setFocusable(false);
        actionLink.focus();
      }
    } else {
      this.actionBar?.focus(0);
    }
  }
  getAriaLabel(item) {
    if (item.ariaLabel) {
      return item.ariaLabel;
    }
    if (typeof item.message === "string") {
      return item.message;
    }
    return void 0;
  }
  getBannerMessage(message) {
    if (typeof message === "string") {
      const element = $("span");
      element.textContent = message;
      return element;
    }
    return this.markdownRendererService.render(message).element;
  }
  setVisibility(visible) {
    if (visible !== this.visible) {
      this.visible = visible;
      this.focusedActionIndex = -1;
      this.layoutService.setPartHidden(!visible, "workbench.parts.banner" /* BANNER_PART */);
      this._onDidChangeSize.fire(void 0);
    }
  }
  focus() {
    this.focusedActionIndex = -1;
    this.element.focus();
  }
  focusNextAction() {
    const length = this.item?.actions?.length ?? 0;
    this.focusedActionIndex = this.focusedActionIndex < length ? this.focusedActionIndex + 1 : 0;
    this.focusActionLink();
  }
  focusPreviousAction() {
    const length = this.item?.actions?.length ?? 0;
    this.focusedActionIndex = this.focusedActionIndex > 0 ? this.focusedActionIndex - 1 : length;
    this.focusActionLink();
  }
  hide(id2) {
    if (this.item?.id !== id2) {
      return;
    }
    this.setVisibility(false);
  }
  show(item) {
    if (item.id === this.item?.id) {
      this.setVisibility(true);
      return;
    }
    clearNode(this.element);
    const ariaLabel = this.getAriaLabel(item);
    if (ariaLabel) {
      this.element.setAttribute("aria-label", ariaLabel);
    }
    const iconContainer = append(this.element, $("div.icon-container"));
    iconContainer.setAttribute("aria-hidden", "true");
    if (ThemeIcon.isThemeIcon(item.icon)) {
      iconContainer.appendChild($(`div${ThemeIcon.asCSSSelector(item.icon)}`));
    } else {
      iconContainer.classList.add("custom-icon");
      if (URI.isUri(item.icon)) {
        iconContainer.style.backgroundImage = asCSSUrl(item.icon);
      }
    }
    const messageContainer = append(this.element, $("div.message-container"));
    messageContainer.setAttribute("aria-hidden", "true");
    messageContainer.appendChild(this.getBannerMessage(item.message));
    this.messageActionsContainer = append(this.element, $("div.message-actions-container"));
    if (item.actions) {
      for (const action of item.actions) {
        this._register(this.instantiationService.createInstance(Link, this.messageActionsContainer, { ...action, tabIndex: -1 }, {}));
      }
    }
    const actionBarContainer = append(this.element, $("div.action-container"));
    this.actionBar = this._register(new ActionBar(actionBarContainer));
    const label3 = item.closeLabel ?? localize(6251, null);
    const closeAction = this._register(new Action("banner.close", label3, ThemeIcon.asClassName(widgetClose), true, () => this.close(item)));
    this.actionBar.push(closeAction, { icon: true, label: false });
    this.actionBar.setFocusable(false);
    this.setVisibility(true);
    this.item = item;
  }
  toJSON() {
    return {
      type: "workbench.parts.banner" /* BANNER_PART */
    };
  }
};

BannerPart = __decorateClass([
  __decorateParam(0, IThemeService),
  __decorateParam(1, IWorkbenchLayoutService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IMarkdownRendererService)
], BannerPart);

registerSingleton(IBannerService, BannerPart, 0 /* Eager */);

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.banner.focusBanner",
  weight: 200 /* WorkbenchContrib */,
  primary: 9 /* Escape */,
  when: BannerFocused,
  handler: (accessor) => {
    const bannerService = accessor.get(IBannerService);
    bannerService.focus();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.banner.focusNextAction",
  weight: 200 /* WorkbenchContrib */,
  primary: 17 /* RightArrow */,
  secondary: [18 /* DownArrow */],
  when: BannerFocused,
  handler: (accessor) => {
    const bannerService = accessor.get(IBannerService);
    bannerService.focusNextAction();
  }
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.banner.focusPreviousAction",
  weight: 200 /* WorkbenchContrib */,
  primary: 15 /* LeftArrow */,
  secondary: [16 /* UpArrow */],
  when: BannerFocused,
  handler: (accessor) => {
    const bannerService = accessor.get(IBannerService);
    bannerService.focusPreviousAction();
  }
});

var FocusBannerAction = class _FocusBannerAction extends Action2 {
  static {
    this.ID = "workbench.action.focusBanner";
  }
  static {
    this.LABEL = localize2(6252, "Focus Banner");
  }
  constructor() {
    super({
      id: _FocusBannerAction.ID,
      title: _FocusBannerAction.LABEL,
      category: Categories.View,
      f1: true
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    layoutService.focusPart("workbench.parts.banner" /* BANNER_PART */);
  }
};

registerAction2(FocusBannerAction);
export { BannerPart, FocusBannerAction };
