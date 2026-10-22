// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputNoticeWidget.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { $, EventType, addDisposableListener, isAncestorOfActiveElement, setVisibility } from "./module-0075.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { localize } from "./module-0001.mjs";
import { alert, status } from "./module-0076.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getCompactCodicon } from "./module-2040.mjs";
import { ActionBar } from "./module-0477.mjs";
import { Action } from "./module-0082.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputNoticeWidget.ts
var ChatInputNoticeWidget = class extends Disposable {
  constructor(options3) {
    super();
    this._visible = true;
    this._variant = options3.variant;
    this._ariaRoleDescription = options3.ariaRoleDescription;
    this.domNode = $("div");
    this.domNode.classList.add("chat-input-notice", `chat-input-notice-${options3.variant}`);
    if (options3.className) {
      this.domNode.classList.add(options3.className);
    }
    if (options3.ariaDescription) {
      this.domNode.setAttribute("aria-description", options3.ariaDescription);
    }
    this.setAriaLabel(options3.ariaLabel);
    options3.container?.appendChild(this.domNode);
    this._register(toDisposable(() => this.domNode.remove()));
    const onEscape = options3.onEscape;
    if (onEscape) {
      this._register(addDisposableListener(this.domNode, EventType.KEY_DOWN, (event) => {
        const keyboardEvent = new StandardKeyboardEvent(event);
        if (keyboardEvent.equals(9 /* Escape */)) {
          keyboardEvent.preventDefault();
          keyboardEvent.stopPropagation();
          onEscape();
        }
      }));
    }
  }
  /**
   * Names the region. Notices whose message is only known per-render - a
   * notification, a tip being navigated - set this as they build their content.
   */
  setAriaLabel(ariaLabel) {
    this._ariaLabel = ariaLabel;
    this._applyRegionAttributes();
  }
  /**
   * A notice is only a landmark and a tab stop while it is actually on screen.
   * Left in place while put away, it would be an unlabelled region the user can
   * still tab into and find nothing in.
   */
  _applyRegionAttributes() {
    if (this._visible) {
      this.domNode.setAttribute("role", "region");
      this.domNode.tabIndex = 0;
      if (this._ariaRoleDescription) {
        this.domNode.setAttribute("aria-roledescription", this._ariaRoleDescription);
      }
      if (this._ariaLabel) {
        this.domNode.setAttribute("aria-label", this._ariaLabel);
      } else {
        this.domNode.removeAttribute("aria-label");
      }
    } else {
      this.domNode.removeAttribute("role");
      this.domNode.removeAttribute("tabindex");
      this.domNode.removeAttribute("aria-roledescription");
      this.domNode.removeAttribute("aria-label");
    }
  }
  /**
   * Speak the notice as it reaches the screen. A tip is advisory - it is in the
   * lane that yields to everything else - so it is announced politely and waits
   * its turn; an introduction or a notification is why the user's attention was
   * wanted in the first place, so it interrupts.
   */
  announce() {
    if (!this._ariaLabel) {
      return;
    }
    const message = localize(12487, null, this._ariaLabel);
    if (this._variant === "tip" /* Tip */) {
      status(message);
    } else {
      alert(message);
    }
  }
  hasFocus() {
    return isAncestorOfActiveElement(this.domNode);
  }
  focus() {
    this.domNode.focus();
  }
  /**
   * Called when the notice is put away for higher-precedence content, and again
   * when it comes back. The notice is kept alive across this, so a producer with
   * live parts - microphone capture, audio, animation - calls this and stands
   * those down too rather than keep them going where the user cannot see them.
   */
  setVisible(visible) {
    if (this._visible === visible) {
      return;
    }
    this._visible = visible;
    setVisibility(visible, this.domNode);
    this._applyRegionAttributes();
  }
  /**
   * An icon button, in the shape every notice's actions share. Built on
   * `ActionBar` so keyboard handling, touch, focus and theming come from the
   * shared action infrastructure rather than being re-implemented per notice.
   */
  addAction(options3) {
    const register3 = (disposable) => options3.store ? options3.store.add(disposable) : this._register(disposable);
    const container3 = $("div");
    container3.classList.add("chat-input-notice-action");
    (options3.parent ?? this.domNode).appendChild(container3);
    register3(toDisposable(() => container3.remove()));
    const cssClass = [ThemeIcon.asClassName(getCompactCodicon(options3.icon)), options3.className].filter(Boolean).join(" ");
    const actionBar3 = register3(new ActionBar(container3));
    actionBar3.push(register3(new Action("chatInputNotice.action", options3.ariaLabel, cssClass, true, async () => options3.onActivate())), { icon: true, label: false });
    return container3;
  }
  /**
   * The standard way out of a notice. Kept separate from {@link addAction} so
   * every notice's dismiss reads and behaves the same, wherever it appears.
   */
  addDismissAction(options3) {
    return this.addAction({
      ...options3,
      ariaLabel: options3.ariaLabel ?? localize(12486, null),
      icon: Codicon.closeCompact,
      className: [options3.className, "chat-input-notice-dismiss"].filter(Boolean).join(" ")
    });
  }
};
export { ChatInputNoticeWidget };
