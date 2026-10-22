// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/embeddedExtensionToolsDetail.ts
import { $, append, clearNode } from "./module-0075.mjs";
import { Disposable, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { status } from "./module-0076.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/embeddedExtensionToolsDetail.ts
var $93 = $;

var EmbeddedExtensionToolsDetail = class extends Disposable {
  constructor(parent) {
    super();
    this._manifestLoad = this._register(new MutableDisposable());
    this.root = append(parent, $93(".ai-customization-embedded-detail.embedded-tool-detail"));
    this.headerEl = append(this.root, $93(".embedded-detail-header"));
    this.leadingSlotEl = append(this.headerEl, $93(".embedded-detail-leading-slot"));
    const headerText = append(this.headerEl, $93(".embedded-detail-header-text"));
    this.nameEl = append(headerText, $93("h2.embedded-detail-name"));
    this.nameEl.setAttribute("role", "heading");
    this.publisherEl = append(headerText, $93(".embedded-detail-scope"));
    this.descriptionEl = append(this.root, $93(".embedded-detail-description"));
    const toolsEl = append(this.root, $93(".embedded-detail-tools"));
    this.toolsHeadingEl = append(toolsEl, $93("h3.embedded-detail-tools-heading"));
    this.toolsHeadingEl.setAttribute("role", "heading");
    this.toolsHeadingEl.textContent = localize(9645, null);
    this.toolsMessageEl = append(toolsEl, $93(".embedded-detail-tools-message"));
    this.toolsListEl = append(toolsEl, $93(".embedded-detail-tools-list"));
    this.toolsListEl.setAttribute("role", "list");
    this.emptyEl = append(this.root, $93(".embedded-detail-empty"));
    this.emptyEl.textContent = localize(9644, null);
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
  setInput(extension) {
    this.current = extension;
    this.renderItem();
  }
  clearInput() {
    this.current = void 0;
    this._manifestLoad.clear();
    this.renderItem();
  }
  renderItem() {
    const extension = this.current;
    const hasItem = !!extension;
    this.emptyEl.style.display = hasItem ? "none" : "";
    this.root.classList.toggle("is-empty", !hasItem);
    this.toolsHeadingEl.style.display = hasItem ? "" : "none";
    if (!extension) {
      this.nameEl.textContent = "";
      this.publisherEl.textContent = "";
      this.descriptionEl.textContent = "";
      clearNode(this.toolsListEl);
      return;
    }
    this.nameEl.textContent = extension.displayName;
    const publisher = extension.publisherDisplayName;
    if (publisher) {
      this.publisherEl.textContent = localize(9643, null, publisher);
      this.publisherEl.style.display = "";
    } else {
      this.publisherEl.textContent = "";
      this.publisherEl.style.display = "none";
    }
    const description = (extension.description || "").trim();
    this.descriptionEl.textContent = description;
    this.descriptionEl.style.display = description ? "" : "none";
    this.loadTools(extension);
  }
  /**
   * Reads the contributed tools from the extension manifest. The manifest may be fetched from
   * the gallery for not-yet-installed extensions, so this is async and cancellation-safe.
   */
  loadTools(extension) {
    const cts = new CancellationTokenSource();
    this._manifestLoad.value = toDisposable(() => cts.dispose(true));
    this.setToolsMessage(localize(9646, null));
    clearNode(this.toolsListEl);
    extension.getManifest(cts.token).then((manifest) => {
      if (cts.token.isCancellationRequested || this.current !== extension) {
        return;
      }
      const tools = manifest?.contributes?.languageModelTools ?? [];
      this.renderTools(tools);
    }, () => {
      if (cts.token.isCancellationRequested || this.current !== extension) {
        return;
      }
      const message = localize(9648, null);
      this.setToolsMessage(message);
      status(message);
    });
  }
  renderTools(tools) {
    clearNode(this.toolsListEl);
    if (tools.length === 0) {
      const message = localize(9647, null);
      this.setToolsMessage(message);
      status(message);
      return;
    }
    this.setToolsMessage(void 0);
    for (const tool of tools) {
      const row = append(this.toolsListEl, $93(".embedded-detail-tool"));
      row.setAttribute("role", "listitem");
      append(row, $93(".embedded-detail-tool-name")).textContent = resolveNls(tool.displayName) || tool.name;
      const description = resolveNls(tool.userDescription) || resolveNls(tool.modelDescription);
      if (description) {
        append(row, $93(".embedded-detail-tool-description")).textContent = description;
      }
    }
    status(tools.length === 1 ? localize(9650, null) : localize(9649, null, tools.length));
  }
  setToolsMessage(message) {
    this.toolsMessageEl.textContent = message ?? "";
    this.toolsMessageEl.style.display = message ? "" : "none";
  }
};

function resolveNls(value2) {
  const trimmed = value2?.trim();
  if (!trimmed || trimmed.startsWith("%") && trimmed.endsWith("%")) {
    return void 0;
  }
  return trimmed;
}
export { resolveNls, $93, EmbeddedExtensionToolsDetail };
