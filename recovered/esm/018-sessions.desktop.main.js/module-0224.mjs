// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/browser/domStylesheets.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { mainWindow } from "./module-0002.mjs";
import { getWindows, sharedMutationObserver } from "./module-0075.mjs";
import { isFirefox2 } from "./module-0018.mjs";
import { autorun } from "./module-0052.mjs";


// src/vs/base/browser/domStylesheets.ts
var globalStylesheets = /* @__PURE__ */ new Map();

function isGlobalStylesheet(node) {
  return globalStylesheets.has(node);
}

var WrappedStyleElement = class extends Disposable {
  constructor() {
    super(...arguments);
    this._currentCssStyle = "";
    this._styleSheet = void 0;
  }
  setStyle(cssStyle) {
    if (cssStyle === this._currentCssStyle) {
      return;
    }
    this._currentCssStyle = cssStyle;
    if (!this._styleSheet) {
      this._styleSheet = createStyleSheet(mainWindow.document.head, (s) => s.textContent = cssStyle, this._store);
    } else {
      this._styleSheet.textContent = cssStyle;
    }
  }
  dispose() {
    super.dispose();
    this._styleSheet = void 0;
  }
};

function createStyleSheet(container2 = mainWindow.document.head, beforeAppend, disposableStore) {
  const style = document.createElement("style");
  style.type = "text/css";
  style.media = "screen";
  beforeAppend?.(style);
  container2.appendChild(style);
  if (disposableStore) {
    disposableStore.add(toDisposable(() => style.remove()));
  }
  if (container2 === mainWindow.document.head) {
    const globalStylesheetClones = /* @__PURE__ */ new Set();
    globalStylesheets.set(style, globalStylesheetClones);
    if (disposableStore) {
      disposableStore.add(toDisposable(() => globalStylesheets.delete(style)));
    }
    for (const { window: targetWindow, disposables } of getWindows()) {
      if (targetWindow === mainWindow) {
        continue;
      }
      const cloneDisposable = disposables.add(cloneGlobalStyleSheet(style, globalStylesheetClones, targetWindow));
      disposableStore?.add(cloneDisposable);
    }
  }
  return style;
}

function cloneGlobalStylesheets(targetWindow) {
  const disposables = new DisposableStore();
  for (const [globalStylesheet, clonedGlobalStylesheets] of globalStylesheets) {
    disposables.add(cloneGlobalStyleSheet(globalStylesheet, clonedGlobalStylesheets, targetWindow));
  }
  return disposables;
}

function cloneGlobalStyleSheet(globalStylesheet, globalStylesheetClones, targetWindow) {
  const disposables = new DisposableStore();
  const clone2 = globalStylesheet.cloneNode(true);
  targetWindow.document.head.appendChild(clone2);
  disposables.add(toDisposable(() => clone2.remove()));
  for (const rule of globalStylesheet.sheet?.cssRules ?? []) {
    clone2.sheet?.insertRule(rule.cssText, clone2.sheet?.cssRules.length);
  }
  disposables.add(sharedMutationObserver.observe(globalStylesheet, disposables, { childList: true, subtree: isFirefox2, characterData: isFirefox2 })(() => {
    clone2.textContent = globalStylesheet.textContent;
  }));
  globalStylesheetClones.add(clone2);
  disposables.add(toDisposable(() => globalStylesheetClones.delete(clone2)));
  return disposables;
}

var _sharedStyleSheet = null;

function getSharedStyleSheet() {
  if (!_sharedStyleSheet) {
    _sharedStyleSheet = createStyleSheet();
  }
  return _sharedStyleSheet;
}

function createCSSRule(selector, cssText, style = getSharedStyleSheet()) {
  if (!style || !cssText) {
    return;
  }
  style.sheet?.insertRule(`${selector} {${cssText}}`, 0);
  for (const clonedGlobalStylesheet of globalStylesheets.get(style) ?? []) {
    createCSSRule(selector, cssText, clonedGlobalStylesheet);
  }
}

function removeCSSRulesContainingSelector(ruleName, style = getSharedStyleSheet()) {
  if (!style) {
    return;
  }
  const rules = style.sheet?.cssRules ?? [];
  const toDelete = [];
  for (let i2 = 0; i2 < rules.length; i2++) {
    const rule = rules[i2];
    if (isCSSStyleRule(rule) && rule.selectorText.indexOf(ruleName) !== -1) {
      toDelete.push(i2);
    }
  }
  for (let i2 = toDelete.length - 1; i2 >= 0; i2--) {
    style.sheet?.deleteRule(toDelete[i2]);
  }
  for (const clonedGlobalStylesheet of globalStylesheets.get(style) ?? []) {
    removeCSSRulesContainingSelector(ruleName, clonedGlobalStylesheet);
  }
}

function isCSSStyleRule(rule) {
  return typeof rule.selectorText === "string";
}

function createStyleSheetFromObservable(css) {
  const store = new DisposableStore();
  const w = store.add(new WrappedStyleElement());
  store.add(autorun((reader) => {
    w.setStyle(css.read(reader));
  }));
  return store;
}
export { isGlobalStylesheet, createStyleSheet, cloneGlobalStylesheets, cloneGlobalStyleSheet, getSharedStyleSheet, createCSSRule, removeCSSRulesContainingSelector, isCSSStyleRule, createStyleSheetFromObservable, globalStylesheets, WrappedStyleElement, _sharedStyleSheet };
