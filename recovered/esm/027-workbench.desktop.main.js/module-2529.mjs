// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptTimeline/promptTimelineStickyHeader.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/contrib/chat/browser/promptTimeline/promptTimelineStickyHeader.ts
var PromptTimelineStickyHeader = class extends Disposable {
  constructor(container3, accessibilityService) {
    super();
    this.accessibilityService = accessibilityService;
    this._currentLabel = "";
    this._visible = false;
    this._onDidActivate = this._register(new Emitter());
    /** Fired when the label is clicked or activated by keyboard. */
    this.onDidActivate = this._onDidActivate.event;
    this._domNode = append(container3, $(".prompt-timeline-sticky"));
    const content2 = append(this._domNode, $(".prompt-timeline-sticky-content"));
    const band = append(content2, $(".prompt-timeline-sticky-band"));
    this._labelButton = append(band, $("button.prompt-timeline-sticky-label-button"));
    this._label = append(this._labelButton, $("span.prompt-timeline-sticky-label"));
    this._labelLine = this._createLine("");
    this._label.appendChild(this._labelLine);
    this._count = append(this._labelButton, $("span.prompt-timeline-sticky-count"));
    this._register(addDisposableListener(this._labelButton, EventType.CLICK, () => this._onDidActivate.fire()));
    this._setVisible(false);
  }
  get domNode() {
    return this._domNode;
  }
  /** Names the pinned prompt (1-based index within all prompts). */
  update(text2, index2, total) {
    const label3 = text2 || localize(11591, null);
    this._count.textContent = localize(11592, null, index2, total);
    this._labelButton.title = label3;
    this._labelButton.setAttribute("aria-label", localize(11593, null, index2, total, label3));
    if (label3 !== this._currentLabel || index2 !== this._lastIndex) {
      const direction = this._lastIndex !== void 0 && index2 !== this._lastIndex ? Math.sign(index2 - this._lastIndex) : 0;
      const newLine = this._createLine(label3);
      this._label.appendChild(newLine);
      const oldLine = this._labelLine;
      this._labelLine = newLine;
      if (this._visible && direction !== 0 && !this.accessibilityService.isMotionReduced()) {
        this._roll(oldLine, newLine, direction);
      } else {
        this._finalizeRoll();
        oldLine.remove();
      }
      this._currentLabel = label3;
    }
    this._lastIndex = index2;
  }
  _createLine(text2) {
    const line = $(".prompt-timeline-sticky-label-line");
    append(line, $("span.prompt-timeline-sticky-label-text")).textContent = text2;
    return line;
  }
  /** Rolls the outgoing label out and the incoming label in, following the scroll direction. */
  _roll(oldLine, newLine, direction) {
    this._finalizeRoll();
    const timing = { duration: 140, easing: "ease" };
    const outTo = direction > 0 ? -100 : 100;
    const inFrom = direction > 0 ? 100 : -100;
    const outAnim = oldLine.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: `translateY(${outTo}%)`, opacity: 0 }], timing);
    const inAnim = newLine.animate([{ transform: `translateY(${inFrom}%)`, opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], timing);
    this._rollOutgoing = oldLine;
    this._rollOutAnim = outAnim;
    this._rollInAnim = inAnim;
    outAnim.finished.then(() => oldLine.remove(), () => {
    });
    inAnim.finished.then(() => {
      if (this._rollInAnim === inAnim) {
        this._rollInAnim = this._rollOutAnim = this._rollOutgoing = void 0;
      }
    }, () => {
    });
  }
  /** Commits any in-flight roll immediately so a new one can start from a settled state. */
  _finalizeRoll() {
    this._rollInAnim?.finish();
    this._rollOutAnim?.finish();
    this._rollOutgoing?.remove();
    this._rollInAnim = this._rollOutAnim = this._rollOutgoing = void 0;
  }
  setVisible(visible) {
    this._setVisible(visible);
  }
  _setVisible(visible) {
    this._visible = visible;
    this._domNode.classList.toggle("hidden", !visible);
    this._domNode.toggleAttribute("inert", !visible);
    if (!visible) {
      this._finalizeRoll();
    }
  }
  dispose() {
    this._rollInAnim?.cancel();
    this._rollOutAnim?.cancel();
    this._domNode.remove();
    super.dispose();
  }
};

PromptTimelineStickyHeader = __decorateClass([
  __decorateParam(1, IAccessibilityService)
], PromptTimelineStickyHeader);
export { PromptTimelineStickyHeader };
