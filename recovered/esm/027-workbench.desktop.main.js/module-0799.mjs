// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/accessibility/browser/accessibleView.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";


// src/vs/platform/accessibility/browser/accessibleView.ts
var IAccessibleViewService = createDecorator("accessibleViewService");

var AccessibleContentProvider = class extends Disposable {
  constructor(id2, options3, provideContent, onClose, verbositySettingKey, onOpen, actions, provideNextContent, providePreviousContent, onDidChangeContent, onKeyDown, getSymbols, onDidRequestClearLastProvider) {
    super();
    this.id = id2;
    this.options = options3;
    this.provideContent = provideContent;
    this.onClose = onClose;
    this.verbositySettingKey = verbositySettingKey;
    this.onOpen = onOpen;
    this.actions = actions;
    this.provideNextContent = provideNextContent;
    this.providePreviousContent = providePreviousContent;
    this.onDidChangeContent = onDidChangeContent;
    this.onKeyDown = onKeyDown;
    this.getSymbols = getSymbols;
    this.onDidRequestClearLastProvider = onDidRequestClearLastProvider;
  }
};

function isIAccessibleViewContentProvider(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  const candidate = obj;
  return !!candidate.id && !!candidate.options && typeof candidate.provideContent === "function" && typeof candidate.onClose === "function" && typeof candidate.verbositySettingKey === "string";
}

var ExtensionContentProvider = class extends Disposable {
  constructor(id2, options3, provideContent, onClose, onOpen, provideNextContent, providePreviousContent, actions, onDidChangeContent) {
    super();
    this.id = id2;
    this.options = options3;
    this.provideContent = provideContent;
    this.onClose = onClose;
    this.onOpen = onOpen;
    this.provideNextContent = provideNextContent;
    this.providePreviousContent = providePreviousContent;
    this.actions = actions;
    this.onDidChangeContent = onDidChangeContent;
  }
};
export { isIAccessibleViewContentProvider, IAccessibleViewService, AccessibleContentProvider, ExtensionContentProvider };
