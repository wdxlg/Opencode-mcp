// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeContact.ts
import { Disposable } from "./module-0012.mjs";
import { $, append } from "./module-0075.mjs";
import { localizeBridge } from "./module-2646.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeContact.ts
var OPENCODE_CONTACT_QQ = "2998646435";

var OPENCODE_BILIBILI_NAME = "OpenCode";

var OPENCODE_BILIBILI_UID = "334369085";

var OPENCODE_BILIBILI_SPACE_URL = "https://space.bilibili.com/334369085";

var OpenCodeBridgeContactStrip = class extends Disposable {
  constructor(parent, actions) {
    super();
    this.element = append(parent, $(".opencode-bridge-card.opencode-bridge-contact"));
    this.element.setAttribute("role", "group");
    this.element.setAttribute("aria-label", localizeBridge("opencodeBridge.contactAria", "Contact OpenCode"));
    this.element.style.display = "none";
    append(this.element, $(
      "span.opencode-bridge-contact-thanks",
      void 0,
      localizeBridge("opencodeBridge.contactThanks", "Thanks for supporting OpenCode! Questions and feedback:")
    ));
    const qq = append(this.element, $("span.opencode-bridge-contact-item"));
    append(qq, $("span.opencode-bridge-contact-label", void 0, "QQ"));
    append(qq, $("span.opencode-bridge-contact-value", void 0, OPENCODE_CONTACT_QQ));
    const copyQq = this._register(new Button(qq, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    copyQq.label = `$(${Codicon.copy.id}) ${localizeBridge("opencodeBridge.copyQq", "Copy QQ number")}`;
    copyQq.setTitle(localizeBridge("opencodeBridge.copyQqTitle", "Copy QQ number {0}", OPENCODE_CONTACT_QQ));
    this._register(copyQq.onDidClick(() => {
      void actions.copyText(OPENCODE_CONTACT_QQ);
    }));
    const bilibili = append(this.element, $("span.opencode-bridge-contact-item"));
    append(bilibili, $(
      "span.opencode-bridge-contact-label",
      void 0,
      localizeBridge("opencodeBridge.contactBilibili", "Bilibili")
    ));
    append(bilibili, $(
      "span.opencode-bridge-contact-value",
      void 0,
      localizeBridge("opencodeBridge.contactBilibiliAccount", "{0} (UID {1})", OPENCODE_BILIBILI_NAME, OPENCODE_BILIBILI_UID)
    ));
    const openBilibili = this._register(new Button(bilibili, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    openBilibili.label = `$(${Codicon.linkExternal.id}) ${localizeBridge("opencodeBridge.openBilibili", "Open Bilibili page")}`;
    openBilibili.setTitle(OPENCODE_BILIBILI_SPACE_URL);
    this._register(openBilibili.onDidClick(() => {
      void actions.openExternal(OPENCODE_BILIBILI_SPACE_URL);
    }));
  }
  /** Visible only while Bridge access is active on this device. */
  update(licensed) {
    this.element.style.display = licensed ? "" : "none";
  }
};
export { OPENCODE_CONTACT_QQ, OPENCODE_BILIBILI_NAME, OPENCODE_BILIBILI_UID, OPENCODE_BILIBILI_SPACE_URL, OpenCodeBridgeContactStrip };
