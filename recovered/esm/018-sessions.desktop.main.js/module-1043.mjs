// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/webview/browser/webview.ts
import { RawContextKey } from "./module-0089.mjs";
import { createDecorator } from "./module-0077.mjs";
import { equals } from "./module-0007.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { Memento } from "./module-1042.mjs";
import { generateUuid } from "./module-0190.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/webview/browser/webview.ts
var KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE = new RawContextKey("webviewFindWidgetVisible", false);

var KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED = new RawContextKey("webviewFindWidgetFocused", false);

var KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED = new RawContextKey("webviewFindWidgetEnabled", false);

var IWebviewService = createDecorator("webviewService");

function areWebviewContentOptionsEqual(a, b) {
  return a.allowMultipleAPIAcquire === b.allowMultipleAPIAcquire && a.allowScripts === b.allowScripts && a.allowForms === b.allowForms && a.forwardUntrustedKeypressEvents === b.forwardUntrustedKeypressEvents && equals(a.localResourceRoots, b.localResourceRoots, isEqual2) && equals(a.portMapping, b.portMapping, (a2, b2) => a2.extensionHostPort === b2.extensionHostPort && a2.webviewPort === b2.webviewPort) && areEnableCommandUrisEqual(a, b);
}

function areEnableCommandUrisEqual(a, b) {
  if (a.enableCommandUris === b.enableCommandUris) {
    return true;
  }
  if (Array.isArray(a.enableCommandUris) && Array.isArray(b.enableCommandUris)) {
    return equals(a.enableCommandUris, b.enableCommandUris);
  }
  return false;
}

var WebviewOriginStore = class {
  constructor(rootStorageKey, storageService) {
    this._memento = new Memento(rootStorageKey, storageService);
    this._state = this._memento.getMemento(-1 /* APPLICATION */, 1 /* MACHINE */);
  }
  getOrigin(viewType, additionalKey) {
    const key3 = this._getKey(viewType, additionalKey);
    const existing = this._state[key3];
    if (existing && typeof existing === "string") {
      return existing;
    }
    const newOrigin = generateUuid();
    this._state[key3] = newOrigin;
    this._memento.saveMemento();
    return newOrigin;
  }
  _getKey(viewType, additionalKey) {
    return JSON.stringify({ viewType, key: additionalKey });
  }
};

WebviewOriginStore = __decorateClass([
  __decorateParam(1, IStorageService)
], WebviewOriginStore);

var ExtensionKeyedWebviewOriginStore = class {
  constructor(rootStorageKey, storageService) {
    this._store = new WebviewOriginStore(rootStorageKey, storageService);
  }
  getOrigin(viewType, extId) {
    return this._store.getOrigin(viewType, extId.value);
  }
};

ExtensionKeyedWebviewOriginStore = __decorateClass([
  __decorateParam(1, IStorageService)
], ExtensionKeyedWebviewOriginStore);
export { areWebviewContentOptionsEqual, areEnableCommandUrisEqual, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED, KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED, IWebviewService, WebviewOriginStore, ExtensionKeyedWebviewOriginStore };
