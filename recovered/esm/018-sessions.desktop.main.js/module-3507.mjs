// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/customViewNode.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { $, isAncestorOfActiveElement } from "./module-0075.mjs";
import { AGENTS_CENTERED_CONTENT_MAX_WIDTH } from "./module-1498.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { activeSessionViewBackground, activeSessionViewForeground } from "./module-1496.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuItemAction } from "./module-0092.mjs";
import { ChatPillActionViewItem } from "./module-2235.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/sessions/browser/parts/customViewNode.ts
var CustomViewNode = class extends Disposable {
  constructor(descriptor, instantiationService) {
    super();
    this.element = $(".custom-view-node");
    this._view = this._register(instantiationService.createInstance(descriptor.ctor));
    this._maxWidth = this._view.maxWidth ?? AGENTS_CENTERED_CONTENT_MAX_WIDTH;
    this.element.style.setProperty("--session-view-background", asCssVariable(activeSessionViewBackground));
    this.element.style.setProperty("--session-view-foreground", asCssVariable(activeSessionViewForeground));
    this.element.setAttribute("role", "region");
    this.element.setAttribute("data-view-id", descriptor.id);
    this._headerEl = $(".custom-view-header");
    this.element.appendChild(this._headerEl);
    this._headerBandEl = $(".custom-view-header-band");
    this._headerEl.appendChild(this._headerBandEl);
    const titleRow = $(".custom-view-header-title-row");
    this._headerBandEl.appendChild(titleRow);
    this._titleEl = $(".custom-view-header-title");
    titleRow.appendChild(this._titleEl);
    this._descriptionEl = $(".custom-view-header-description");
    this._headerBandEl.appendChild(this._descriptionEl);
    if (descriptor.actions) {
      const buttonBar = descriptor.actions.style === "buttonBar";
      const actionsContainer = $(".custom-view-header-actions");
      actionsContainer.classList.toggle("custom-view-header-actions-buttons", buttonBar);
      titleRow.appendChild(actionsContainer);
      const toolbar = this._register(instantiationService.createInstance(MenuWorkbenchToolBar, actionsContainer, descriptor.actions.menuId, {
        hiddenItemStrategy: 0 /* Ignore */,
        menuOptions: { shouldForwardArgs: true },
        toolbarOptions: { primaryGroup: () => true },
        actionViewItemProvider: buttonBar ? (action, options3) => action instanceof MenuItemAction ? instantiationService.createInstance(ChatPillActionViewItem, void 0, action, options3) : void 0 : void 0
      }));
      this._register(toolbar.onDidChangeMenuItems(() => this._layoutChildren()));
    }
    const scrollContent = $(".custom-view-scroll-content");
    this._contentEl = $(".custom-view-content");
    this._contentEl.tabIndex = -1;
    scrollContent.appendChild(this._contentEl);
    this._scrollable = this._register(new DomScrollableElement(scrollContent, {
      horizontal: 2 /* Hidden */,
      vertical: 1 /* Auto */,
      useShadows: false
    }));
    this._scrollable.getDomNode().classList.add("custom-view-body");
    this.element.appendChild(this._scrollable.getDomNode());
    this._view.render(this._contentEl);
    const resizeObserver = new ResizeObserver(() => this._scrollable.scanDomNode());
    resizeObserver.observe(this._contentEl);
    this._register(toDisposable(() => resizeObserver.disconnect()));
    this._register(autorun((reader) => {
      const title = this._view.title.read(reader);
      this._titleEl.textContent = title;
      this.element.setAttribute("aria-label", title);
      this._layoutChildren();
    }));
    this._register(autorun((reader) => {
      const description = this._view.description.read(reader);
      this._descriptionEl.textContent = description ?? "";
      this._descriptionEl.classList.toggle("hidden", !description);
      this._layoutChildren();
    }));
    this._register(toDisposable(() => this.element.remove()));
  }
  layout(width2, height) {
    this._lastLayout = { width: width2, height };
    this._layoutChildren();
  }
  focus() {
    this._view.focus();
    if (!isAncestorOfActiveElement(this.element)) {
      this._contentEl.focus();
    }
  }
  _layoutChildren() {
    if (!this._lastLayout) {
      return;
    }
    const { width: width2, height } = this._lastLayout;
    const bandWidth = Math.min(width2, this._maxWidth);
    this._headerBandEl.style.width = `${bandWidth}px`;
    this._contentEl.style.width = `${bandWidth}px`;
    this._view.layout(bandWidth, Math.max(0, height - this._headerEl.offsetHeight));
    this._scrollable.scanDomNode();
  }
};

CustomViewNode = __decorateClass([
  __decorateParam(1, IInstantiationService)
], CustomViewNode);
export { CustomViewNode };
