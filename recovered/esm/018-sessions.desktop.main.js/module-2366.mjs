// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatReadOnlyBanner.ts
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { $, append } from "./module-0075.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatReadOnlyBanner.ts
var CHAT_READ_ONLY_BANNER_HEIGHT = 26;

var ChatReadOnlyBanner = class extends Disposable {
  constructor(message = localize(12453, null), hoverService) {
    super();
    this._visible = false;
    this.domNode = $(".chat-readonly-banner");
    this.domNode.setAttribute("role", "status");
    const icon2 = append(this.domNode, $(".chat-readonly-banner-icon"));
    const renderedIcon = renderIcon(Codicon.lock);
    renderedIcon.setAttribute("aria-hidden", "true");
    icon2.appendChild(renderedIcon);
    const text2 = append(this.domNode, $("span.chat-readonly-banner-text"));
    text2.textContent = message;
    this._register(hoverService.setupDelayedHover(text2, { content: message }));
    this.setVisible(false);
  }
  get visible() {
    return this._visible;
  }
  setVisible(visible) {
    this._visible = visible;
    this.domNode.classList.toggle("hidden", !visible);
  }
};

ChatReadOnlyBanner = __decorateClass([
  __decorateParam(1, IHoverService)
], ChatReadOnlyBanner);
export { CHAT_READ_ONLY_BANNER_HEIGHT, ChatReadOnlyBanner };
