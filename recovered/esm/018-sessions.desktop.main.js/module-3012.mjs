// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/customEditor/common/contributedCustomEditors.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Memento } from "./module-1042.mjs";
import { CustomEditorInfo } from "./module-1115.mjs";
import { customEditorsExtensionPoint } from "./module-3011.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/customEditor/common/contributedCustomEditors.ts
var ContributedCustomEditors = class _ContributedCustomEditors extends Disposable {
  constructor(storageService) {
    super();
    this._editors = /* @__PURE__ */ new Map();
    this._onChange = this._register(new Emitter());
    this.onChange = this._onChange.event;
    this._memento = new Memento(_ContributedCustomEditors.CUSTOM_EDITORS_STORAGE_ID, storageService);
    const mementoObject = this._memento.getMemento(0 /* PROFILE */, 1 /* MACHINE */);
    for (const info of mementoObject[_ContributedCustomEditors.CUSTOM_EDITORS_ENTRY_ID] || []) {
      this.add(new CustomEditorInfo(normalizeStoredCustomEditorDescriptor(info)));
    }
    this._register(customEditorsExtensionPoint.setHandler((extensions) => {
      this.update(extensions);
    }));
  }
  static {
    this.CUSTOM_EDITORS_STORAGE_ID = "customEditors";
  }
  static {
    this.CUSTOM_EDITORS_ENTRY_ID = "editors";
  }
  update(extensions) {
    this._editors.clear();
    for (const extension of extensions) {
      for (const webviewEditorContribution of extension.value) {
        const priority = getPriorityFromContribution(webviewEditorContribution.priority, extension.description);
        this.add(new CustomEditorInfo({
          id: webviewEditorContribution.viewType,
          displayName: webviewEditorContribution.displayName,
          providerDisplayName: extension.description.isBuiltin ? localize(14083, null) : extension.description.displayName || extension.description.identifier.value,
          selector: webviewEditorContribution.selector || [],
          priority
        }));
      }
    }
    const mementoObject = this._memento.getMemento(0 /* PROFILE */, 1 /* MACHINE */);
    mementoObject[_ContributedCustomEditors.CUSTOM_EDITORS_ENTRY_ID] = Array.from(this._editors.values());
    this._memento.saveMemento();
    this._onChange.fire();
  }
  [Symbol.iterator]() {
    return this._editors.values();
  }
  get(viewType) {
    return this._editors.get(viewType);
  }
  getContributedEditors(resource) {
    return Array.from(this._editors.values()).filter((customEditor) => customEditor.matches(resource));
  }
  add(info) {
    if (this._editors.has(info.id)) {
      console.error(`Custom editor with id '${info.id}' already registered`);
      return;
    }
    this._editors.set(info.id, info);
  }
};

function normalizeStoredCustomEditorDescriptor(descriptor) {
  return {
    id: descriptor.id,
    displayName: descriptor.displayName,
    providerDisplayName: descriptor.providerDisplayName,
    selector: descriptor.selector,
    priority: typeof descriptor.priority === "string" ? {
      editor: descriptor.priority,
      diff: "explicit" /* explicit */
    } : {
      editor: descriptor.priority.editor,
      diff: descriptor.priority.diff ?? "explicit" /* explicit */
    }
  };
}

function getPriorityFromContribution(contribution, extension) {
  const editorPriority = getSinglePriorityFromContribution(typeof contribution === "string" ? contribution : contribution?.textEditor, extension) ?? "default" /* default */;
  return {
    editor: editorPriority,
    diff: (typeof contribution === "string" ? void 0 : getSinglePriorityFromContribution(contribution?.diffEditor, extension)) ?? "explicit" /* explicit */
  };
}

function getSinglePriorityFromContribution(value2, extension) {
  switch (value2) {
    case "default" /* default */:
      return "default" /* default */;
    case "option" /* option */:
      return "option" /* option */;
    case "explicit" /* explicit */:
      return "explicit" /* explicit */;
    case "builtin" /* builtin */:
      return extension.isBuiltin ? "builtin" /* builtin */ : "default" /* default */;
    default:
      return void 0;
  }
}
export { normalizeStoredCustomEditorDescriptor, getPriorityFromContribution, getSinglePriorityFromContribution, ContributedCustomEditors };
