// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatCardListbox.ts



// src/vs/workbench/contrib/chat/browser/widget/chatCardListbox.ts
var ChatCardListbox = class {
  constructor(domNode, ariaLabel, activeClass) {
    this.domNode = domNode;
    this.activeClass = activeClass;
    this.options = [];
    this._activeIndex = -1;
    this.domNode.setAttribute("role", "listbox");
    this.domNode.setAttribute("aria-label", ariaLabel);
    this.domNode.tabIndex = 0;
  }
  get activeIndex() {
    return this._activeIndex;
  }
  get length() {
    return this.options.length;
  }
  /**
   * Registers a row as an option. The element is given an id, because
   * `aria-activedescendant` can only refer to one.
   */
  addOption(element, idPrefix) {
    element.id = `${idPrefix}-option-${this.options.length}`;
    element.setAttribute("role", "option");
    element.setAttribute("aria-selected", "false");
    this.options.push(element);
  }
  /** Moves the active option. Pass -1 to clear it, which some callers use for freeform input. */
  setActive(index2) {
    this._activeIndex = index2;
    this.options.forEach((option2, i2) => {
      const isActive2 = i2 === index2;
      option2.classList.toggle(this.activeClass, isActive2);
      option2.setAttribute("aria-selected", String(isActive2));
    });
    const active = this.options[index2];
    if (active) {
      this.domNode.setAttribute("aria-activedescendant", active.id);
    } else {
      this.domNode.removeAttribute("aria-activedescendant");
    }
  }
  /**
   * Focuses the container. `aria-activedescendant` is only honoured on the element that actually
   * has DOM focus, so focus must never move into an option or arrowing goes unannounced.
   */
  focus() {
    this.domNode.focus();
  }
  /** Clamps to the ends, matching the workbench lists. */
  clampedIndex(index2) {
    return Math.max(0, Math.min(index2, this.options.length - 1));
  }
  /** Wraps around the ends. */
  wrappedIndex(index2) {
    if (this.options.length === 0) {
      return -1;
    }
    return (index2 + this.options.length) % this.options.length;
  }
};
export { ChatCardListbox };
