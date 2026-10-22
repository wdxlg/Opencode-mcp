// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatGoalBannerWidget.ts
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { setChatInputStackSlot } from "./module-2033.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatGoalBannerWidget.ts
var $38 = $;

var ChatGoalBannerWidget = class extends Disposable {
  constructor() {
    super();
    this._onDismissEmitter = this._register(new Emitter());
    this.onDismiss = this._onDismissEmitter.event;
    this._visible = false;
    this.domNode = $38(".chat-goal-banner-widget");
    this._bannerEl = append(this.domNode, $38(".chat-goal-banner"));
    const iconEl = append(this._bannerEl, $38(".chat-goal-banner-icon"));
    iconEl.appendChild($38(ThemeIcon.asCSSSelector(Codicon.target)));
    const labelEl = append(this._bannerEl, $38(".chat-goal-banner-label"));
    labelEl.textContent = localize(12484, null);
    this._textEl = append(this._bannerEl, $38(".chat-goal-banner-text"));
    const dismissBtn = append(this._bannerEl, $38("button.chat-goal-banner-dismiss"));
    dismissBtn.title = localize(12483, null);
    dismissBtn.setAttribute("aria-label", localize(12483, null));
    dismissBtn.appendChild($38(ThemeIcon.asCSSSelector(Codicon.closeSmall)));
    this._register(addDisposableListener(dismissBtn, EventType.CLICK, () => {
      this.clear();
      this._onDismissEmitter.fire();
    }));
    this.clear();
  }
  /** Add the banner to its slot in the chat input stack. */
  attachTo(slot) {
    this._slot = slot;
    slot.appendChild(this.domNode);
    setChatInputStackSlot(slot, this._visible ? 1 /* Docked */ : 0 /* Empty */);
  }
  setLoading() {
    this._textEl.textContent = localize(12485, null);
    this._textEl.classList.add("loading");
    this._show();
  }
  setGoal(summary) {
    const trimmed = summary.trim();
    if (!trimmed) {
      this.clear();
      return;
    }
    this._textEl.textContent = trimmed;
    this._textEl.classList.remove("loading");
    this._bannerEl.title = trimmed;
    this._show();
  }
  clear() {
    this._textEl.textContent = "";
    this._textEl.classList.remove("loading");
    this._bannerEl.removeAttribute("title");
    this._setVisible(false);
  }
  _show() {
    this._setVisible(true);
  }
  _setVisible(visible) {
    this._visible = visible;
    this.domNode.style.display = visible ? "" : "none";
    setChatInputStackSlot(this._slot, visible ? 1 /* Docked */ : 0 /* Empty */);
  }
};
export { $38, ChatGoalBannerWidget };
