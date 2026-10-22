// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/embeddedAgentPluginDetail.ts
import { $, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/embeddedAgentPluginDetail.ts
var $91 = $;

var EmbeddedAgentPluginDetail = class extends Disposable {
  constructor(parent) {
    super();
    this.root = append(parent, $91(".ai-customization-embedded-detail.embedded-plugin-detail"));
    this.headerEl = append(this.root, $91(".embedded-detail-header"));
    this.leadingSlotEl = append(this.headerEl, $91(".embedded-detail-leading-slot"));
    const headerText = append(this.headerEl, $91(".embedded-detail-header-text"));
    this.nameEl = append(headerText, $91("h2.embedded-detail-name"));
    this.nameEl.setAttribute("role", "heading");
    this.sourceEl = append(headerText, $91(".embedded-detail-scope"));
    this.descriptionEl = append(this.root, $91(".embedded-detail-description"));
    this.emptyEl = append(this.root, $91(".embedded-detail-empty"));
    this.emptyEl.textContent = localize(9638, null);
    this.renderItem();
  }
  get element() {
    return this.root;
  }
  get headerElement() {
    return this.headerEl;
  }
  /**
   * Header slot reserved for leading chrome (e.g. a back button).
   * Prefer this over reaching into the header element directly.
   */
  get leadingSlot() {
    return this.leadingSlotEl;
  }
  setInput(item) {
    this.current = item;
    this.renderItem();
  }
  clearInput() {
    this.current = void 0;
    this.renderItem();
  }
  renderItem() {
    const item = this.current;
    const hasItem = !!item;
    this.emptyEl.style.display = hasItem ? "none" : "";
    this.root.classList.toggle("is-empty", !hasItem);
    if (!item) {
      this.nameEl.textContent = "";
      this.sourceEl.textContent = "";
      this.descriptionEl.textContent = "";
      return;
    }
    this.nameEl.textContent = item.name;
    const isMarketplace = item.kind === "marketplace" /* Marketplace */;
    const sourceLabel = item.marketplace ? isMarketplace ? localize(9641, null, item.marketplace) : localize(9639, null, item.marketplace) : isMarketplace ? localize(9642, null) : localize(9640, null);
    this.sourceEl.textContent = sourceLabel;
    const description = (item.description || "").trim();
    this.descriptionEl.textContent = description;
    this.descriptionEl.style.display = description ? "" : "none";
  }
};
export { $91, EmbeddedAgentPluginDetail };
