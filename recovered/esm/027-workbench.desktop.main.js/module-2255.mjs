// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatThinkingStyleContentPart.ts
import { ChatCollapsibleContentPart } from "./module-2143.mjs";
import { autorun } from "./module-0052.mjs";
import { Codicon } from "./module-0085.mjs";
import { $ } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getCompactCodicon } from "./module-2040.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatThinkingStyleContentPart.ts
var ChatThinkingStyleContentPart = class extends ChatCollapsibleContentPart {
  constructor() {
    super(...arguments);
    this._thinkingActive = false;
  }
  /** Whether the row is still working. */
  get thinkingActive() {
    return this._thinkingActive;
  }
  init() {
    const node = super.init();
    node.classList.add("chat-thinking-box");
    node.classList.toggle("chat-thinking-active", this._thinkingActive);
    this._register(autorun((reader) => {
      const expanded2 = this.expanded.read(reader);
      if (this._collapseButton) {
        this._collapseButton.icon = this.getThinkingIcon(this._thinkingActive, expanded2);
      }
    }));
    return node;
  }
  /**
   * Marks the row as working or settled, updating the status class and icon.
   * Safe to call before the row is rendered.
   */
  setThinkingActive(active) {
    this._thinkingActive = active;
    this.domNode.classList.toggle("chat-thinking-active", active);
    if (this._collapseButton) {
      this._collapseButton.icon = this.getThinkingIcon(active, this.isExpanded());
    }
  }
  /**
   * The header icon for a given state. The default settles to a checkmark and
   * shows a status dot while working; override to vary while working.
   */
  getThinkingIcon(active, _expanded) {
    return active ? Codicon.circleFilledCompact : Codicon.checkCompact;
  }
  /**
   * Renders the title as a shimmering span, reusing the existing one so the
   * animation does not restart on every update.
   */
  setShimmerTitle(text2) {
    const labelElement = this._collapseButton?.labelElement;
    if (!labelElement) {
      return;
    }
    if (!this._shimmerSpan?.parentElement) {
      labelElement.textContent = "";
      this._shimmerSpan = $("span.chat-thinking-title-shimmer");
      labelElement.appendChild(this._shimmerSpan);
    }
    this._shimmerSpan.textContent = text2;
  }
  /**
   * Drops the reference to the shimmering title, for callers that rebuild the
   * label as static content. Does not touch the DOM.
   */
  forgetShimmerTitle() {
    this._shimmerSpan = void 0;
  }
  /** The indented list that thinking-style rows put their items in. */
  createThinkingBody() {
    return $(".chat-used-context-list.chat-thinking-collapsible");
  }
  /** A single body row, prefixed with the chain-of-thought dot. */
  createThinkingRow(icon2 = Codicon.circleFilled) {
    const row = $(".chat-thinking-item.markdown-content");
    row.appendChild(createThinkingIcon(icon2));
    return row;
  }
  /**
   * The shimmering "still working" row that tails the body. The label is
   * returned so callers can cycle its message while the row lives.
   */
  createThinkingSpinnerRow(message) {
    const row = $(".chat-thinking-item.chat-thinking-spinner-item");
    row.appendChild(createThinkingIcon(Codicon.circleFilled));
    const label3 = $("span.chat-thinking-spinner-label");
    label3.textContent = message;
    row.appendChild(label3);
    return { row, label: label3 };
  }
};

function createThinkingIcon(icon2) {
  const iconElement = $("span.chat-thinking-icon");
  iconElement.classList.add(...ThemeIcon.asClassNameArray(getCompactCodicon(icon2)));
  return iconElement;
}
export { createThinkingIcon, ChatThinkingStyleContentPart };
