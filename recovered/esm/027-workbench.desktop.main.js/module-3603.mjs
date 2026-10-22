// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/languageStatus/browser/languageStatus.ts
import { equals } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { Disposable, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { severity_default } from "./module-0266.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IStatusbarService, ShowTooltipCommand } from "./module-0893.mjs";
import { $, addDisposableListener, append, getWindow, isHTMLElement } from "./module-0075.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { Link } from "./module-0550.mjs";
import { URI } from "./module-0032.mjs";
import { IHoverService, nativeHoverDelegate } from "./module-0520.mjs";
import { ActionBar } from "./module-0477.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { parseLinkedText } from "./module-1329.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { ILanguageStatusService } from "./module-1225.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { Action2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { joinStrings } from "./module-0030.mjs";


// src/vs/workbench/contrib/languageStatus/browser/languageStatus.ts
var LanguageStatusViewModel = class {
  constructor(combined, dedicated) {
    this.combined = combined;
    this.dedicated = dedicated;
  }
  isEqual(other) {
    return equals(this.combined, other.combined) && equals(this.dedicated, other.dedicated);
  }
};

var StoredCounter = class {
  constructor(_storageService, _key) {
    this._storageService = _storageService;
    this._key = _key;
  }
  get value() {
    return this._storageService.getNumber(this._key, 0 /* PROFILE */, 0);
  }
  increment() {
    const n2 = this.value + 1;
    this._storageService.store(this._key, n2, 0 /* PROFILE */, 1 /* MACHINE */);
    return n2;
  }
};

StoredCounter = __decorateClass([
  __decorateParam(0, IStorageService)
], StoredCounter);

var LanguageStatusContribution = class extends Disposable {
  constructor(editorGroupService) {
    super();
    this.editorGroupService = editorGroupService;
    for (const part of editorGroupService.parts) {
      this.createLanguageStatus(part);
    }
    this._register(editorGroupService.onDidCreateAuxiliaryEditorPart((part) => this.createLanguageStatus(part)));
  }
  static {
    this.Id = "status.languageStatus";
  }
  createLanguageStatus(part) {
    const disposables = new DisposableStore();
    Event2.once(part.onWillDispose)(() => disposables.dispose());
    const scopedInstantiationService = this.editorGroupService.getScopedInstantiationService(part);
    disposables.add(scopedInstantiationService.createInstance(LanguageStatus));
  }
};

LanguageStatusContribution = __decorateClass([
  __decorateParam(0, IEditorGroupsService)
], LanguageStatusContribution);

var LanguageStatus = class {
  constructor(_languageStatusService, _statusBarService, _editorService, _hoverService, _openerService, _storageService) {
    this._languageStatusService = _languageStatusService;
    this._statusBarService = _statusBarService;
    this._editorService = _editorService;
    this._hoverService = _hoverService;
    this._openerService = _openerService;
    this._storageService = _storageService;
    this._disposables = new DisposableStore();
    this._dedicated = /* @__PURE__ */ new Set();
    this._dedicatedEntries = /* @__PURE__ */ new Map();
    this._renderDisposables = new DisposableStore();
    this._combinedEntryTooltip = document.createElement("div");
    _storageService.onDidChangeValue(0 /* PROFILE */, LanguageStatus._keyDedicatedItems, this._disposables)(this._handleStorageChange, this, this._disposables);
    this._restoreState();
    this._interactionCounter = new StoredCounter(_storageService, "languageStatus.interactCount");
    _languageStatusService.onDidChange(this._update, this, this._disposables);
    _editorService.onDidActiveEditorChange(this._update, this, this._disposables);
    this._update();
    _statusBarService.onDidChangeEntryVisibility((e) => {
      if (!e.visible && this._dedicated.has(e.id)) {
        this._dedicated.delete(e.id);
        this._update();
        this._storeState();
      }
    }, void 0, this._disposables);
  }
  static {
    this._id = "status.languageStatus";
  }
  static {
    this._keyDedicatedItems = "languageStatus.dedicated";
  }
  dispose() {
    this._disposables.dispose();
    this._combinedEntry?.dispose();
    dispose(this._dedicatedEntries.values());
    this._renderDisposables.dispose();
  }
  // --- persisting dedicated items
  _handleStorageChange() {
    this._restoreState();
    this._update();
  }
  _restoreState() {
    const raw = this._storageService.get(LanguageStatus._keyDedicatedItems, 0 /* PROFILE */, "[]");
    try {
      const ids = JSON.parse(raw);
      this._dedicated = new Set(ids);
    } catch {
      this._dedicated.clear();
    }
  }
  _storeState() {
    if (this._dedicated.size === 0) {
      this._storageService.remove(LanguageStatus._keyDedicatedItems, 0 /* PROFILE */);
    } else {
      const raw = JSON.stringify(Array.from(this._dedicated.keys()));
      this._storageService.store(LanguageStatus._keyDedicatedItems, raw, 0 /* PROFILE */, 0 /* USER */);
    }
  }
  // --- language status model and UI
  _createViewModel(editor) {
    if (!editor?.hasModel()) {
      return new LanguageStatusViewModel([], []);
    }
    const all = this._languageStatusService.getLanguageStatus(editor.getModel());
    const combined = [];
    const dedicated = [];
    for (const item of all) {
      if (this._dedicated.has(item.id)) {
        dedicated.push(item);
      }
      combined.push(item);
    }
    return new LanguageStatusViewModel(combined, dedicated);
  }
  _update() {
    const editor = getCodeEditor(this._editorService.activeTextEditorControl);
    const model = this._createViewModel(editor);
    if (this._model?.isEqual(model)) {
      return;
    }
    this._renderDisposables.clear();
    this._model = model;
    editor?.onDidChangeModelLanguage(this._update, this, this._renderDisposables);
    if (model.combined.length === 0) {
      this._combinedEntry?.dispose();
      this._combinedEntry = void 0;
    } else {
      const [first2] = model.combined;
      const showSeverity = first2.severity >= severity_default.Warning;
      const text2 = LanguageStatus._severityToComboCodicon(first2.severity);
      let isOneBusy = false;
      const ariaLabels = [];
      for (const status2 of model.combined) {
        const isPinned = model.dedicated.includes(status2);
        this._renderStatus(this._combinedEntryTooltip, status2, showSeverity, isPinned, this._renderDisposables);
        ariaLabels.push(LanguageStatus._accessibilityInformation(status2).label);
        isOneBusy = isOneBusy || !isPinned && status2.busy;
      }
      const props = {
        name: localize(16500, null),
        ariaLabel: localize(16499, null, ariaLabels.join(", next: ")),
        tooltip: this._combinedEntryTooltip,
        command: ShowTooltipCommand,
        text: isOneBusy ? "$(loading~spin)" : text2
      };
      if (!this._combinedEntry) {
        this._combinedEntry = this._statusBarService.addEntry(props, LanguageStatus._id, 1 /* RIGHT */, { location: { id: "status.editor.mode", priority: 100.1 }, alignment: 0 /* LEFT */, compact: true });
      } else {
        this._combinedEntry.update(props);
      }
      const userHasInteractedWithStatus = this._interactionCounter.value >= 3;
      const targetWindow = getWindow(editor?.getContainerDomNode());
      const node = targetWindow.document.querySelector(".monaco-workbench .statusbar DIV#status\\.languageStatus A>SPAN.codicon");
      const container3 = targetWindow.document.querySelector(".monaco-workbench .statusbar DIV#status\\.languageStatus");
      if (isHTMLElement(node) && container3) {
        const _wiggle = "wiggle";
        const _flash = "flash";
        if (!isOneBusy) {
          node.classList.toggle(_wiggle, showSeverity || !userHasInteractedWithStatus);
          this._renderDisposables.add(addDisposableListener(node, "animationend", (_e) => node.classList.remove(_wiggle)));
          container3.classList.toggle(_flash, showSeverity);
          this._renderDisposables.add(addDisposableListener(container3, "animationend", (_e) => container3.classList.remove(_flash)));
        } else {
          node.classList.remove(_wiggle);
          container3.classList.remove(_flash);
        }
      }
      if (!userHasInteractedWithStatus) {
        const hoverTarget = targetWindow.document.querySelector(".monaco-workbench .context-view");
        if (isHTMLElement(hoverTarget)) {
          const observer = new MutationObserver(() => {
            if (targetWindow.document.contains(this._combinedEntryTooltip)) {
              this._interactionCounter.increment();
              observer.disconnect();
            }
          });
          observer.observe(hoverTarget, { childList: true, subtree: true });
          this._renderDisposables.add(toDisposable(() => observer.disconnect()));
        }
      }
    }
    const newDedicatedEntries = /* @__PURE__ */ new Map();
    for (const status2 of model.dedicated) {
      const props = LanguageStatus._asStatusbarEntry(status2);
      let entry = newDedicatedEntries.get(status2.id) ?? this._dedicatedEntries.get(status2.id);
      if (!entry) {
        entry = this._statusBarService.addEntry(props, status2.id, 1 /* RIGHT */, { location: { id: "status.editor.mode", priority: 100.1 }, alignment: 1 /* RIGHT */ });
      } else {
        entry.update(props);
        this._dedicatedEntries.delete(status2.id);
      }
      newDedicatedEntries.set(status2.id, entry);
    }
    dispose(this._dedicatedEntries.values());
    this._dedicatedEntries = newDedicatedEntries;
  }
  _renderStatus(container3, status2, showSeverity, isPinned, store) {
    const parent = document.createElement("div");
    parent.classList.add("hover-language-status");
    container3.appendChild(parent);
    store.add(toDisposable(() => parent.remove()));
    const severity = document.createElement("div");
    severity.classList.add("severity", `sev${status2.severity}`);
    severity.classList.toggle("show", showSeverity);
    const severityText = LanguageStatus._severityToSingleCodicon(status2.severity);
    append(severity, ...renderLabelWithIcons(severityText));
    parent.appendChild(severity);
    const element = document.createElement("div");
    element.classList.add("element");
    parent.appendChild(element);
    const left = document.createElement("div");
    left.classList.add("left");
    element.appendChild(left);
    const label3 = typeof status2.label === "string" ? status2.label : status2.label.value;
    append(left, ...renderLabelWithIcons(computeText(label3, status2.busy)));
    this._renderTextPlus(left, status2.detail, store);
    const right = document.createElement("div");
    right.classList.add("right");
    element.appendChild(right);
    const { command: command4 } = status2;
    if (command4) {
      store.add(new Link(right, {
        label: command4.title,
        title: command4.tooltip,
        href: URI.from({
          scheme: "command",
          path: command4.id,
          query: command4.arguments && JSON.stringify(command4.arguments)
        }).toString()
      }, { hoverDelegate: nativeHoverDelegate }, this._hoverService, this._openerService));
    }
    const actionBar3 = new ActionBar(right, { hoverDelegate: nativeHoverDelegate });
    const actionLabel = isPinned ? localize(16504, null) : localize(16502, null);
    actionBar3.setAriaLabel(actionLabel);
    store.add(actionBar3);
    let action;
    if (!isPinned) {
      action = new Action("pin", actionLabel, ThemeIcon.asClassName(Codicon.pin), true, () => {
        this._dedicated.add(status2.id);
        this._statusBarService.updateEntryVisibility(status2.id, true);
        this._update();
        this._storeState();
      });
    } else {
      action = new Action("unpin", actionLabel, ThemeIcon.asClassName(Codicon.pinned), true, () => {
        this._dedicated.delete(status2.id);
        this._statusBarService.updateEntryVisibility(status2.id, false);
        this._update();
        this._storeState();
      });
    }
    actionBar3.push(action, { icon: true, label: false });
    store.add(action);
    return parent;
  }
  static _severityToComboCodicon(sev) {
    switch (sev) {
      case severity_default.Error:
        return "$(bracket-error)";
      case severity_default.Warning:
        return "$(bracket-dot)";
      default:
        return "$(bracket)";
    }
  }
  static _severityToSingleCodicon(sev) {
    switch (sev) {
      case severity_default.Error:
        return "$(error)";
      case severity_default.Warning:
        return "$(info)";
      default:
        return "$(check)";
    }
  }
  _renderTextPlus(target, text2, store) {
    let didRenderSeparator = false;
    for (const node of parseLinkedText(text2).nodes) {
      if (!didRenderSeparator) {
        append(target, $("span.separator"));
        didRenderSeparator = true;
      }
      if (typeof node === "string") {
        const parts = renderLabelWithIcons(node);
        append(target, ...parts);
      } else {
        store.add(new Link(target, node, void 0, this._hoverService, this._openerService));
      }
    }
  }
  static _accessibilityInformation(status2) {
    if (status2.accessibilityInfo) {
      return status2.accessibilityInfo;
    }
    const textValue = typeof status2.label === "string" ? status2.label : status2.label.value;
    if (status2.detail) {
      return { label: localize(16497, null, textValue, status2.detail) };
    } else {
      return { label: localize(16498, null, textValue) };
    }
  }
  // ---
  static _asStatusbarEntry(item) {
    let kind;
    if (item.severity === severity_default.Warning) {
      kind = "warning";
    } else if (item.severity === severity_default.Error) {
      kind = "error";
    }
    const textValue = typeof item.label === "string" ? item.label : item.label.shortValue;
    return {
      name: localize(16501, null, item.name),
      text: computeText(textValue, item.busy),
      ariaLabel: LanguageStatus._accessibilityInformation(item).label,
      role: item.accessibilityInfo?.role,
      tooltip: item.command?.tooltip || new MarkdownString(item.detail, { isTrusted: true, supportThemeIcons: true }),
      kind,
      command: item.command
    };
  }
};

LanguageStatus = __decorateClass([
  __decorateParam(0, ILanguageStatusService),
  __decorateParam(1, IStatusbarService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, IStorageService)
], LanguageStatus);

var ResetAction = class extends Action2 {
  constructor() {
    super({
      id: "editor.inlayHints.Reset",
      title: localize2(16503, "Reset Language Status Interaction Counter"),
      category: Categories.View,
      f1: true
    });
  }
  run(accessor) {
    accessor.get(IStorageService).remove("languageStatus.interactCount", 0 /* PROFILE */);
  }
};

function computeText(text2, loading) {
  return joinStrings([text2 !== "" && text2, loading && "$(loading~spin)"], "\xA0\xA0");
}
export { computeText, LanguageStatusViewModel, StoredCounter, LanguageStatusContribution, LanguageStatus, ResetAction };
