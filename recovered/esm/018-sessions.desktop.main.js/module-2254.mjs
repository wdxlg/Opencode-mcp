// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatEditPillElement.ts
import { $, EventHelper, EventType, addDisposableListener, getWindow } from "./module-0075.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { registerOpenEditorListeners } from "./module-1993.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { getIconClasses } from "./module-0755.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getCompactCodicon } from "./module-2035.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatEditPillElement.ts
var $46 = $;

var ChatEditPillElement = class extends Disposable {
  constructor(labelService, modelService, languageService, hoverService) {
    super();
    this.labelService = labelService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.hoverService = hoverService;
    this._hover = this._register(new MutableDisposable());
    this._statusIconClasses = [];
    this._pillIconClasses = [];
    this._onDidClick = this._register(new Emitter());
    /** Fires when the pill is activated (click / keyboard). Carries the standard open-editor options. */
    this.onDidClick = this._onDidClick.event;
    this._onDidContextMenu = this._register(new Emitter());
    /** Fires on right-click. Subclasses can present a context menu. */
    this.onDidContextMenu = this._onDidContextMenu.event;
    this.element = $46("div.chat-codeblock-pill-container");
    this.statusIndicatorContainer = $46("div.status-indicator-container");
    this.statusIconEl = $46("span.status-icon");
    this.statusLabelEl = $46("span.status-label", {}, "");
    this.statusIndicatorContainer.append(this.statusIconEl, this.statusLabelEl);
    this.pillElement = $46(".chat-codeblock-pill-widget");
    this.pillElement.tabIndex = 0;
    this.pillElement.classList.add("show-file-icons");
    this.pillElement.role = "button";
    this.progressFillEl = $46("span.progress-fill");
    this.fileIconEl = $46("span.icon");
    this.fileIconLabelEl = $46("span.icon-label", {}, "");
    this.labelDetailEl = $46("span.label-detail", {}, "");
    this.pillElement.append(this.progressFillEl, this.fileIconEl, this.fileIconLabelEl, this.labelDetailEl);
    this.element.append(this.statusIndicatorContainer, this.pillElement);
    this._register(registerOpenEditorListeners(this.pillElement, (opts) => this._onDidClick.fire(opts)));
    this._register(addDisposableListener(this.pillElement, EventType.CONTEXT_MENU, (e4) => {
      const event = new StandardMouseEvent(getWindow(e4), e4);
      EventHelper.stop(e4, true);
      this._onDidContextMenu.fire(event);
    }));
  }
  get uri() {
    return this._uri;
  }
  /**
   * Renders or updates the file icon + name. Call this whenever the URI
   * changes; also resets the +added / -removed counters since they no
   * longer apply to the previous file.
   */
  setUri(uri4) {
    this._uri = uri4;
    const iconText = this.labelService.getUriBasenameLabel(uri4);
    this.fileIconLabelEl.textContent = iconText;
    const fileKind = uri4.path.endsWith("/") ? 1 /* FOLDER */ : 0 /* FILE */;
    this.fileIconEl.classList.remove(...this._pillIconClasses);
    this._pillIconClasses = getIconClasses(this.modelService, this.languageService, uri4, fileKind);
    this.fileIconEl.classList.add(...this._pillIconClasses);
    this.setTooltip(this.labelService.getUriLabel(uri4, { relative: true }));
  }
  /**
   * Updates the leading status indicator (icon + textual label). Pass
   * `undefined` to clear the icon.
   */
  setStatus(icon2, label3) {
    this.statusIconEl.classList.remove(...this._statusIconClasses);
    this._statusIconClasses = icon2 ? ThemeIcon.asClassNameArray(getCompactCodicon(icon2)) : [];
    if (this._statusIconClasses.length > 0) {
      this.statusIconEl.classList.add(...this._statusIconClasses);
    }
    this.statusLabelEl.textContent = label3;
  }
  /**
   * Sets the trailing detail label (e.g. "Generating edits...", "(35%)").
   * Pass an empty string to clear.
   */
  setLabelDetail(text2) {
    this.labelDetailEl.textContent = text2;
  }
  /**
   * Renders the progress-fill animation behind the pill. `percent` is in
   * the range [0, 100]. Pass `undefined` (or omit) to clear.
   */
  setProgressFill(percent) {
    if (typeof percent === "number") {
      this.progressFillEl.style.width = `${percent}%`;
      this.pillElement.classList.add("progress-filling");
    } else {
      this.progressFillEl.style.width = "0%";
      this.pillElement.classList.remove("progress-filling");
    }
  }
  /**
   * Renders the +added / -removed counters at the trailing end of the pill
   * and sets the aria label to a localized summary. Pass `undefined` to
   * hide the counters.
   */
  setDiff(diff4) {
    if (!diff4) {
      this._labelAddedEl?.remove();
      this._labelRemovedEl?.remove();
      this._labelAddedEl = void 0;
      this._labelRemovedEl = void 0;
      return;
    }
    if (!this._labelAddedEl) {
      this._labelAddedEl = this.pillElement.appendChild($46("span.label-added"));
    }
    if (!this._labelRemovedEl) {
      this._labelRemovedEl = this.pillElement.appendChild($46("span.label-removed"));
    }
    this._labelAddedEl.textContent = `+${diff4.added}`;
    this._labelRemovedEl.textContent = `-${diff4.removed}`;
  }
  /**
   * Sets the screen-reader announcement for the pill.
   */
  setAriaLabel(label3) {
    this.element.ariaLabel = label3;
  }
  /**
   * Sets the delayed hover tooltip text. Re-using the existing hover binding
   * so subsequent calls just swap the displayed text.
   */
  setTooltip(tooltip) {
    this._tooltip = tooltip;
    if (!this._hover.value) {
      this._hover.value = this.hoverService.setupDelayedHover(this.pillElement, () => ({
        content: this._tooltip,
        style: 1 /* Pointer */,
        position: { hoverPosition: 2 /* BELOW */ },
        persistence: { hideOnKeyDown: true }
      }));
    }
  }
};

ChatEditPillElement = __decorateClass([
  __decorateParam(0, ILabelService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IHoverService)
], ChatEditPillElement);

async function isResourceContentEmpty(textModelService, uri4) {
  try {
    const ref = await textModelService.createModelReference(uri4);
    try {
      return ref.object.textEditorModel.getValueLength() === 0;
    } finally {
      ref.dispose();
    }
  } catch {
    return false;
  }
}
export { isResourceContentEmpty, $46, ChatEditPillElement };
