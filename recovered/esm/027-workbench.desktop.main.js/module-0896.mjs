// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/markdownString.ts
import { __decorateClass, __privateAdd, __privateGet, __privateSet } from "./module-0000.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { es5ClassCompat } from "./module-0895.mjs";


// src/vs/workbench/api/common/extHostTypes/markdownString.ts
var _delegate;

var MarkdownString2 = class {
  constructor(value2, supportThemeIcons = false) {
    __privateAdd(this, _delegate);
    __privateSet(this, _delegate, new MarkdownString(value2, { supportThemeIcons }));
  }
  static isMarkdownString(thing) {
    if (thing instanceof MarkdownString2) {
      return true;
    }
    if (!thing || typeof thing !== "object") {
      return false;
    }
    return thing.appendCodeblock && thing.appendMarkdown && thing.appendText && thing.value !== void 0;
  }
  get value() {
    return __privateGet(this, _delegate).value;
  }
  set value(value2) {
    __privateGet(this, _delegate).value = value2;
  }
  get isTrusted() {
    return __privateGet(this, _delegate).isTrusted;
  }
  set isTrusted(value2) {
    __privateGet(this, _delegate).isTrusted = value2;
  }
  get supportThemeIcons() {
    return __privateGet(this, _delegate).supportThemeIcons;
  }
  set supportThemeIcons(value2) {
    __privateGet(this, _delegate).supportThemeIcons = value2;
  }
  get supportHtml() {
    return __privateGet(this, _delegate).supportHtml;
  }
  set supportHtml(value2) {
    __privateGet(this, _delegate).supportHtml = value2;
  }
  get supportAlertSyntax() {
    return __privateGet(this, _delegate).supportAlertSyntax;
  }
  set supportAlertSyntax(value2) {
    __privateGet(this, _delegate).supportAlertSyntax = value2;
  }
  get baseUri() {
    return __privateGet(this, _delegate).baseUri;
  }
  set baseUri(value2) {
    __privateGet(this, _delegate).baseUri = value2;
  }
  appendText(value2) {
    __privateGet(this, _delegate).appendText(value2);
    return this;
  }
  appendMarkdown(value2) {
    __privateGet(this, _delegate).appendMarkdown(value2);
    return this;
  }
  appendCodeblock(value2, language2) {
    __privateGet(this, _delegate).appendCodeblock(language2 ?? "", value2);
    return this;
  }
};

_delegate = new WeakMap();

MarkdownString2 = __decorateClass([
  es5ClassCompat
], MarkdownString2);
export { _delegate, MarkdownString2 };
