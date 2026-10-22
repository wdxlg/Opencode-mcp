// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgePublicUrlField.ts
import { Disposable } from "./module-0012.mjs";
import { $, addDisposableListener, append } from "./module-0075.mjs";
import { localizeBridge } from "./module-2621.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgePublicUrlField.ts
var OPENCODE_BRIDGE_HIDDEN_URL_MASK = "\u2022".repeat(24);

function encodeMcpAddressForDisplay(url) {
  let bytes = "";
  for (const byte of new TextEncoder().encode(url)) {
    bytes += String.fromCharCode(byte);
  }
  return btoa(bytes);
}

var OpenCodeBridgePublicUrlField = class extends Disposable {
  constructor(container2, copyText) {
    super();
    this.copyText = copyText;
    this.currentUrl = "";
    this.revealed = false;
    this.element = append(container2, $(".opencode-bridge-url-section"));
    this.element.hidden = true;
    append(this.element, $(
      ".opencode-bridge-url-label",
      void 0,
      localizeBridge("opencodeBridge.publicUrl", "MCP address")
    ));
    const row = append(this.element, $(".opencode-bridge-url-row"));
    const valueContainer = append(row, $(".opencode-bridge-url-value-container"));
    this.input = append(valueContainer, $("input.opencode-bridge-url-value"));
    this.input.type = "text";
    this.input.readOnly = true;
    this.input.spellcheck = false;
    this._register(addDisposableListener(this.input, "focus", () => this.input.select()));
    this.visibilityButton = append(valueContainer, $("button.opencode-bridge-url-visibility"));
    this.visibilityButton.type = "button";
    this.visibilityIcon = append(this.visibilityButton, $("span"));
    this.visibilityIcon.setAttribute("aria-hidden", "true");
    this._register(addDisposableListener(this.visibilityButton, "click", () => {
      this.revealed = !this.revealed;
      this.renderValue();
    }));
    const copyButton = append(row, $("button.opencode-bridge-copy-url"));
    copyButton.type = "button";
    copyButton.textContent = localizeBridge("copy", "Copy");
    copyButton.title = localizeBridge("opencodeBridge.copyUrl", "Copy MCP address");
    copyButton.setAttribute("aria-label", localizeBridge("opencodeBridge.copyUrl", "Copy MCP address"));
    this._register(addDisposableListener(copyButton, "click", async () => {
      if (this.currentUrl) await this.copyText(this.currentUrl);
    }));
    this.notice = append(this.element, $(".opencode-bridge-address-notice"));
    this.notice.hidden = true;
    this.renderValue();
  }
  render(state) {
    this.currentUrl = state.url?.trim() ?? "";
    if (!this.currentUrl) this.revealed = false;
    this.element.hidden = !this.currentUrl;
    this.notice.textContent = state.notice ?? "";
    this.notice.hidden = !state.notice;
    this.renderValue();
  }
  renderValue() {
    const visibleUrl = this.revealed ? this.currentUrl : "";
    this.input.value = this.currentUrl && !this.revealed ? OPENCODE_BRIDGE_HIDDEN_URL_MASK : visibleUrl;
    if (visibleUrl) {
      this.input.title = visibleUrl;
      this.input.setAttribute("aria-label", localizeBridge("opencodeBridge.publicUrl", "MCP address"));
    } else {
      this.input.removeAttribute("title");
      this.input.setAttribute("aria-label", this.currentUrl ? localizeBridge("opencodeBridge.publicUrlHidden", "MCP address hidden") : localizeBridge("opencodeBridge.publicUrl", "MCP address"));
    }
    const actionLabel = this.revealed ? localizeBridge("opencodeBridge.hidePublicUrl", "Hide MCP address") : localizeBridge("opencodeBridge.showPublicUrl", "Show MCP address");
    this.visibilityButton.title = actionLabel;
    this.visibilityButton.setAttribute("aria-label", actionLabel);
    this.visibilityIcon.className = ThemeIcon.asClassName(this.revealed ? Codicon.eye : Codicon.eyeClosed);
  }
};
export { encodeMcpAddressForDisplay, OPENCODE_BRIDGE_HIDDEN_URL_MASK, OpenCodeBridgePublicUrlField };
