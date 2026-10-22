// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/toolRiskBadgeWidget.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventType, addDisposableListener } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/toolRiskBadgeWidget.ts
var RISK_BADGE_CLASS = "tool-risk-badge";

var ToolRiskBadgeWidget = class extends Disposable {
  constructor(_hoverService) {
    super();
    this._hoverService = _hoverService;
    this._hoverStore = this._register(new DisposableStore());
    this._detailsHoverStore = this._register(new DisposableStore());
    this._onDidHide = this._register(new Emitter());
    this.onDidHide = this._onDidHide.event;
    this.domNode = $(`span.${RISK_BADGE_CLASS}`);
    this._iconEl = $("span.tool-risk-icon");
    this._iconEl.setAttribute("aria-hidden", "true");
    this._textEl = $("span.tool-risk-text");
    this._detailsIconEl = $("span.tool-risk-details-icon");
    this._detailsIconEl.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));
    this._detailsIconEl.tabIndex = 0;
    this._detailsIconEl.setAttribute("role", "button");
    this._detailsIconEl.setAttribute("aria-label", localize(12333, null));
    this.domNode.append(this._iconEl, this._textEl, this._detailsIconEl);
    this._refreshDetailsHover();
    this.setLoading();
    this._register(addDisposableListener(this._detailsIconEl, EventType.CLICK, (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._hoverService.showManagedHover(this._detailsIconEl);
    }));
    this._register(addDisposableListener(this._detailsIconEl, EventType.KEY_DOWN, (e) => {
      const ev = new StandardKeyboardEvent(e);
      if (ev.keyCode === 3 /* Enter */ || ev.keyCode === 10 /* Space */) {
        ev.preventDefault();
        ev.stopPropagation();
        this._hoverService.showManagedHover(this._detailsIconEl);
      }
    }));
  }
  get isDisposed() {
    return this._store.isDisposed;
  }
  setLoading() {
    this._setVariant("loading");
    this._setIcon(ThemeIcon.modify(Codicon.loadingCompact, "spin"));
    const text2 = localize(12331, null);
    this._textEl.textContent = text2;
    this._setHover(localize(12332, null));
  }
  setHidden() {
    this.domNode.style.display = "none";
    this._onDidHide.fire();
  }
  setAssessment(assessment) {
    switch (assessment.risk) {
      case "green" /* Green */:
        this._setVariant("green");
        this._setIcon(Codicon.passCompact);
        break;
      case "orange" /* Orange */:
        this._setVariant("orange");
        this._setIcon(Codicon.warningCompact);
        break;
      case "red" /* Red */:
        this._setVariant("red");
        this._setIcon(Codicon.errorCompact);
        break;
    }
    this.domNode.style.display = "";
    this._textEl.textContent = assessment.explanation;
    this._setHover(assessment.explanation);
  }
  /**
   * Provide additional context to surface in the trailing info icon's hover.
   * The hover always notes that the assessment is AI-generated; any details
   * passed here are appended below that note.
   */
  setDetails(details) {
    this._details = details;
    this._refreshDetailsHover();
  }
  /**
   * The markdown content currently shown in the trailing info icon's hover.
   * Exposed so component fixtures can render a preview of the hover content.
   */
  getDetailsMarkdown() {
    return this._buildDetailsMarkdown();
  }
  _setVariant(variant) {
    this.domNode.classList.remove("green", "orange", "red", "loading");
    this.domNode.classList.add(variant);
  }
  _setIcon(icon2) {
    this._iconEl.textContent = "";
    this._iconEl.className = "tool-risk-icon " + ThemeIcon.asClassName(icon2);
  }
  _setHover(content2) {
    this._hoverStore.clear();
    this._hoverStore.add(this._hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.domNode, content2));
  }
  _refreshDetailsHover() {
    this._detailsHoverStore.clear();
    const md = this._buildDetailsMarkdown();
    const fallback2 = md.value.replace(/\$\([^)]+\)\s?/g, "");
    this._detailsHoverStore.add(this._hoverService.setupManagedHover(
      getDefaultHoverDelegate("element"),
      this._detailsIconEl,
      { markdown: md, markdownNotSupportedFallback: fallback2 }
    ));
  }
  _buildDetailsMarkdown() {
    const aiNote = localize(12330, null);
    const details = this._details;
    const md = new MarkdownString(void 0, {
      supportThemeIcons: true,
      isTrusted: typeof details === "object" && details ? details.isTrusted : void 0
    });
    md.appendText(aiNote);
    if (details) {
      md.appendMarkdown("\n\n");
      if (typeof details === "string") {
        md.appendText(details);
      } else {
        md.appendMarkdown(details.value);
      }
    }
    return md;
  }
};

ToolRiskBadgeWidget = __decorateClass([
  __decorateParam(0, IHoverService)
], ToolRiskBadgeWidget);
export { RISK_BADGE_CLASS, ToolRiskBadgeWidget };
