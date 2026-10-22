// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/markdownString.ts
import { __decorateClass, __privateAdd, __privateGet, __privateSet } from "./module-0000.mjs";
import { MarkdownString } from "./module-0086.mjs";
import { es5ClassCompat } from "./module-0230.mjs";


// src/vs/workbench/api/common/extHostTypes/markdownString.ts
var _delegate;

var MarkdownString2 = class {
  constructor(value, supportThemeIcons = false) {
    __privateAdd(this, _delegate);
    __privateSet(this, _delegate, new MarkdownString(value, { supportThemeIcons }));
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
  set value(value) {
    __privateGet(this, _delegate).value = value;
  }
  get isTrusted() {
    return __privateGet(this, _delegate).isTrusted;
  }
  set isTrusted(value) {
    __privateGet(this, _delegate).isTrusted = value;
  }
  get supportThemeIcons() {
    return __privateGet(this, _delegate).supportThemeIcons;
  }
  set supportThemeIcons(value) {
    __privateGet(this, _delegate).supportThemeIcons = value;
  }
  get supportHtml() {
    return __privateGet(this, _delegate).supportHtml;
  }
  set supportHtml(value) {
    __privateGet(this, _delegate).supportHtml = value;
  }
  get supportAlertSyntax() {
    return __privateGet(this, _delegate).supportAlertSyntax;
  }
  set supportAlertSyntax(value) {
    __privateGet(this, _delegate).supportAlertSyntax = value;
  }
  get baseUri() {
    return __privateGet(this, _delegate).baseUri;
  }
  set baseUri(value) {
    __privateGet(this, _delegate).baseUri = value;
  }
  appendText(value) {
    __privateGet(this, _delegate).appendText(value);
    return this;
  }
  appendMarkdown(value) {
    __privateGet(this, _delegate).appendMarkdown(value);
    return this;
  }
  appendCodeblock(value, language2) {
    __privateGet(this, _delegate).appendCodeblock(language2 ?? "", value);
    return this;
  }
};

_delegate = new WeakMap();

MarkdownString2 = __decorateClass([
  es5ClassCompat
], MarkdownString2);
export { _delegate, MarkdownString2 };
