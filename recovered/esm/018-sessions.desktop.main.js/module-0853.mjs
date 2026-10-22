// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/unicodeHighlighter/browser/bannerController.ts
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { $, append, clearNode } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Link } from "./module-0550.mjs";
import { ActionBar } from "./module-0477.mjs";
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { widgetClose } from "./module-0479.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";


// src/vs/editor/contrib/unicodeHighlighter/browser/bannerController.ts
var BANNER_ELEMENT_HEIGHT = 26;

var BannerController = class extends Disposable {
  constructor(_editor, instantiationService) {
    super();
    this._editor = _editor;
    this.instantiationService = instantiationService;
    this.banner = this._register(this.instantiationService.createInstance(Banner));
  }
  hide() {
    this._editor.setBanner(null, 0);
    this.banner.clear();
  }
  show(item) {
    this.banner.show({
      ...item,
      onClose: () => {
        this.hide();
        item.onClose?.();
      }
    });
    this._editor.setBanner(this.banner.element, BANNER_ELEMENT_HEIGHT);
  }
};

BannerController = __decorateClass([
  __decorateParam(1, IInstantiationService)
], BannerController);

var Banner = class extends Disposable {
  constructor(instantiationService, markdownRendererService) {
    super();
    this.instantiationService = instantiationService;
    this.markdownRendererService = markdownRendererService;
    this.element = $("div.editor-banner");
    this.element.tabIndex = 0;
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
      element.innerText = message;
      return element;
    }
    return this.markdownRendererService.render(message).element;
  }
  clear() {
    clearNode(this.element);
  }
  show(item) {
    clearNode(this.element);
    const ariaLabel = this.getAriaLabel(item);
    if (ariaLabel) {
      this.element.setAttribute("aria-label", ariaLabel);
    }
    const iconContainer = append(this.element, $("div.icon-container"));
    iconContainer.setAttribute("aria-hidden", "true");
    if (item.icon) {
      iconContainer.appendChild($(`div${ThemeIcon.asCSSSelector(item.icon)}`));
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
    this.actionBar.push(this._register(
      new Action(
        "banner.close",
        localize(1719, null),
        ThemeIcon.asClassName(widgetClose),
        true,
        () => {
          if (typeof item.onClose === "function") {
            item.onClose();
          }
        }
      )
    ), { icon: true, label: false });
    this.actionBar.setFocusable(false);
  }
};

Banner = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IMarkdownRendererService)
], Banner);
export { BANNER_ELEMENT_HEIGHT, BannerController, Banner };
