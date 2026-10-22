// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeStatusMessage.ts
import { localizeBridge } from "./module-2621.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { $, addDisposableListener, append } from "./module-0075.mjs";
import { OpenCodeBridgeStartupFailureCard } from "./module-2663.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeStatusMessage.ts
var privateMcpAddressPattern = /\bhttps?:\/\/[^\s<>"']+\/mcp\/[^\s<>"']+/giu;

var statusMessageIdPool = 0;

function redactOpenCodeBridgeMcpAddresses(message) {
  return message.replace(
    privateMcpAddressPattern,
    localizeBridge("opencodeBridge.privateMcpAddress", "[private MCP address]")
  );
}

var OpenCodeBridgeStatusMessage = class extends Disposable {
  constructor(container2, onFailureAction = () => {
  }) {
    super();
    this.sourceMessage = "";
    this.error = false;
    this.expanded = false;
    this.overflows = false;
    this.observedWidth = -1;
    /** "Collapse" on a failure card folds it to its heading; reset whenever a different failure arrives. */
    this.cardCollapsed = false;
    this.element = append(container2, $(".opencode-bridge-status-details.opencode-bridge-status-message"));
    this.element.setAttribute("aria-live", "polite");
    this.messageElement = append(this.element, $(".opencode-bridge-status-message-text"));
    this.messageElement.id = "opencode-bridge-status-message-" + String(++statusMessageIdPool);
    this.failureCard = this._register(new OpenCodeBridgeStartupFailureCard(this.element, onFailureAction));
    this.toggleButton = append(this.element, $("button.opencode-bridge-status-message-toggle"));
    this.toggleButton.type = "button";
    this.toggleButton.hidden = true;
    this.toggleButton.setAttribute("aria-controls", this.messageElement.id);
    this.toggleIcon = append(this.toggleButton, $("span"));
    this.toggleIcon.setAttribute("aria-hidden", "true");
    this.toggleLabel = append(this.toggleButton, $("span"));
    this._register(addDisposableListener(this.toggleButton, "click", () => {
      if (this.failureCard.visible) {
        this.cardCollapsed = !this.cardCollapsed;
      } else {
        this.expanded = !this.expanded;
      }
      this.updatePresentation();
    }));
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver((entries2) => {
        const width2 = entries2[0]?.contentRect.width ?? this.element.clientWidth;
        if (width2 === this.observedWidth) return;
        this.observedWidth = width2;
        this.layout();
      });
      resizeObserver.observe(this.element);
      this._register(toDisposable(() => resizeObserver.disconnect()));
    }
  }
  render(state) {
    const changed = state.message !== this.sourceMessage || state.error !== this.error;
    this.sourceMessage = state.message;
    this.error = state.error;
    if (changed || !this.error) this.expanded = false;
    if (this.failureCard.render(state.failure)) this.cardCollapsed = false;
    this.messageElement.hidden = this.failureCard.visible;
    this.messageElement.textContent = redactOpenCodeBridgeMcpAddresses(state.message);
    this.element.setAttribute("role", this.error ? "alert" : "status");
    this.layout();
  }
  /** Brings a failure card into view after a manual start; focus stays put and role="alert" announces it. */
  revealFailure() {
    if (this.failureCard.visible) this.element.scrollIntoView({ block: "nearest" });
  }
  layout() {
    if (this.failureCard.visible) {
      this.overflows = false;
      this.updatePresentation();
      return;
    }
    if (!this.error || !this.messageElement.textContent) {
      this.overflows = false;
      this.expanded = false;
      this.updatePresentation();
      return;
    }
    this.messageElement.classList.add("collapsed");
    this.overflows = this.messageElement.scrollHeight > this.messageElement.clientHeight + 1;
    if (!this.overflows) this.expanded = false;
    this.updatePresentation();
  }
  updatePresentation() {
    const card = this.failureCard.visible;
    const collapsed2 = !card && this.error && this.overflows && !this.expanded;
    this.messageElement.classList.toggle("collapsed", collapsed2);
    this.failureCard.setCollapsed(card && this.cardCollapsed);
    const expanded2 = card ? !this.cardCollapsed : this.expanded;
    this.toggleButton.hidden = !card && !this.overflows;
    this.toggleButton.setAttribute("aria-controls", card ? this.failureCard.element.id : this.messageElement.id);
    this.toggleButton.setAttribute("aria-expanded", String(expanded2));
    const label3 = expanded2 ? localizeBridge("opencodeBridge.collapseError", "Collapse error") : localizeBridge("opencodeBridge.expandError", "Expand full error");
    this.toggleButton.title = label3;
    this.toggleButton.setAttribute("aria-label", label3);
    this.toggleLabel.textContent = label3;
    this.toggleIcon.className = ThemeIcon.asClassName(expanded2 ? Codicon.chevronUp : Codicon.chevronDown);
  }
};
export { redactOpenCodeBridgeMcpAddresses, privateMcpAddressPattern, statusMessageIdPool, OpenCodeBridgeStatusMessage };
