// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatOutline.ts
import { isChatFollowup } from "./module-0973.mjs";
import { getExplicitFileOrImageAttachmentSummary } from "./module-0980.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { IconLabel } from "./module-0640.mjs";
import { createMatches } from "./module-0453.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { escapeIcons } from "./module-0461.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { isRequestVM } from "./module-0979.mjs";


// src/vs/workbench/contrib/chat/browser/chatOutline.ts
function getChatRequestLabel(request2, index2) {
  const message = request2.message;
  let raw;
  if (isChatFollowup(message)) {
    raw = message.message ?? "";
  } else {
    raw = message.text || (Array.isArray(message.parts) ? message.parts.map((part) => part.text).join("") : "");
  }
  const text2 = typeof raw === "string" ? raw.replace(/\s+/g, " ").trim() : "";
  if (text2.length > 0) {
    return text2;
  }
  return getExplicitFileOrImageAttachmentSummary(request2.variables) ?? localize(10898, null, index2 + 1);
}

var ChatOutlineEntry = class {
  constructor(index2, element) {
    this.index = index2;
    this.element = element;
  }
  get id() {
    return this.element.id;
  }
  get icon() {
    return Codicon.commentDiscussion;
  }
  get label() {
    return getChatRequestLabel(this.element, this.index);
  }
};

var ChatOutlineVirtualDelegate = class {
  getHeight() {
    return 22;
  }
  getTemplateId() {
    return ChatOutlineRenderer.templateId;
  }
};

var ChatOutlineRenderer = class _ChatOutlineRenderer {
  constructor() {
    this.templateId = _ChatOutlineRenderer.templateId;
  }
  static {
    this.templateId = "ChatOutlineRenderer";
  }
  renderTemplate(container2) {
    container2.classList.add("chat-outline-element");
    const iconClass = document.createElement("div");
    container2.append(iconClass);
    const iconLabel = new IconLabel(container2, { supportHighlights: true });
    return { container: container2, iconClass, iconLabel };
  }
  renderElement(node, _index, template2) {
    const options3 = {
      matches: createMatches(node.filterData),
      labelEscapeNewLines: true
    };
    template2.iconClass.className = "element-icon " + ThemeIcon.asClassNameArray(node.element.icon).join(" ");
    template2.iconLabel.setLabel(node.element.label, void 0, options3);
  }
  disposeTemplate(template2) {
    template2.iconLabel.dispose();
  }
};

var ChatOutlineAccessibility = class {
  getAriaLabel(element) {
    return element.label;
  }
  getWidgetAriaLabel() {
    return localize(10897, null);
  }
};

var ChatOutlineComparator = class {
  compareByPosition(a, b) {
    return a.index - b.index;
  }
  compareByType(a, b) {
    return a.index - b.index;
  }
  compareByName(a, b) {
    return a.label.localeCompare(b.label);
  }
};

var ChatOutlineTreeDataSource = class {
  getChildren(element) {
    if (element instanceof ChatOutline) {
      return element.entries;
    }
    return [];
  }
};

var ChatOutlineQuickPickDataSource = class {
  constructor(_outline) {
    this._outline = _outline;
  }
  getQuickPickElements() {
    return this._outline.entries.map((entry) => ({
      element: entry,
      // Codicons cannot be passed via `iconClasses` in this quick pick (only
      // file icons can); embed the icon inline in the label instead and
      // escape only the request text so `$(...)` in it stays literal.
      label: `$(${entry.icon.id}) ${escapeIcons(entry.label)}`,
      ariaLabel: entry.label
    }));
  }
};

var ChatOutlineBreadcrumbsDataSource = class {
  constructor(_outline) {
    this._outline = _outline;
  }
  getBreadcrumbElements() {
    const active = this._outline.activeElement;
    return active ? [{ element: active, label: active.label }] : [];
  }
};

var ChatOutline = class {
  constructor(_widget, target) {
    this._widget = _widget;
    this.outlineKind = "chat";
    this._disposables = new DisposableStore();
    this._onDidChange = this._disposables.add(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._entries = [];
    this._viewModelDisposables = this._disposables.add(new DisposableStore());
    this._entriesSignature = "";
    this._recomputeEntries();
    this._disposables.add(this._widget.onDidChangeViewModel(() => {
      const changed = this._recomputeEntries();
      this._registerViewModelListener();
      if (changed) {
        this._onDidChange.fire({});
      }
    }));
    this._registerViewModelListener();
    const options3 = {
      collapseByDefault: target === 2 /* Breadcrumbs */,
      expandOnlyOnTwistieClick: true,
      multipleSelectionSupport: false,
      accessibilityProvider: new ChatOutlineAccessibility(),
      identityProvider: { getId: (element) => element.id },
      keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (element) => element.label }
    };
    this.config = {
      treeDataSource: new ChatOutlineTreeDataSource(),
      quickPickDataSource: new ChatOutlineQuickPickDataSource(this),
      breadcrumbsDataSource: new ChatOutlineBreadcrumbsDataSource(this),
      delegate: new ChatOutlineVirtualDelegate(),
      renderers: [new ChatOutlineRenderer()],
      comparator: new ChatOutlineComparator(),
      options: options3
    };
  }
  _registerViewModelListener() {
    this._viewModelDisposables.clear();
    const viewModel = this._widget.viewModel;
    if (viewModel) {
      this._viewModelDisposables.add(viewModel.onDidChange(() => {
        if (this._recomputeEntries()) {
          this._onDidChange.fire({});
        }
      }));
    }
  }
  _recomputeEntries() {
    const items = this._widget.viewModel?.getItems() ?? [];
    const entries2 = [];
    let index2 = 0;
    for (const item of items) {
      if (isRequestVM(item)) {
        entries2.push(new ChatOutlineEntry(index2++, item));
      }
    }
    const signature = entries2.map((entry) => `${entry.id}\0${entry.label}`).join("");
    if (signature === this._entriesSignature) {
      return false;
    }
    this._entries = entries2;
    this._entriesSignature = signature;
    return true;
  }
  get entries() {
    return this._entries;
  }
  get uri() {
    return this._widget.viewModel?.sessionResource;
  }
  get isEmpty() {
    return this._entries.length === 0;
  }
  get activeElement() {
    const focus = this._widget.getFocus();
    if (!focus) {
      return void 0;
    }
    return this._entries.find((entry) => entry.element === focus);
  }
  reveal(entry, _options, _sideBySide, _select) {
    const item = entry.element;
    this._widget.reveal(item);
    this._widget.focus(item);
  }
  preview(entry) {
    this._widget.reveal(entry.element);
    return Disposable.None;
  }
  captureViewState() {
    return Disposable.None;
  }
  dispose() {
    this._disposables.dispose();
  }
};
export { getChatRequestLabel, ChatOutlineEntry, ChatOutlineVirtualDelegate, ChatOutlineRenderer, ChatOutlineAccessibility, ChatOutlineComparator, ChatOutlineTreeDataSource, ChatOutlineQuickPickDataSource, ChatOutlineBreadcrumbsDataSource, ChatOutline };
