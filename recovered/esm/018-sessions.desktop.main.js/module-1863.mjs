// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/notebookProvider.ts
import { isRelativePattern, match } from "./module-0857.mjs";
import { basename } from "./module-0026.mjs";
import { isDocumentExcludePattern } from "./module-0911.mjs";


// src/vs/workbench/contrib/notebook/common/notebookProvider.ts
var NotebookProviderInfo = class _NotebookProviderInfo {
  get selectors() {
    return this._selectors;
  }
  get options() {
    return this._options;
  }
  constructor(descriptor) {
    this.extension = descriptor.extension;
    this.id = descriptor.id;
    this.displayName = descriptor.displayName;
    this._selectors = descriptor.selectors?.map((selector) => ({
      include: selector.filenamePattern,
      exclude: selector.excludeFileNamePattern || ""
    })) || descriptor._selectors || [];
    this.priority = descriptor.priority;
    this.providerDisplayName = descriptor.providerDisplayName;
    this._options = {
      transientCellMetadata: {},
      transientDocumentMetadata: {},
      transientOutputs: false,
      cellContentMetadata: {}
    };
  }
  update(args2) {
    if (args2.selectors) {
      this._selectors = args2.selectors;
    }
    if (args2.options) {
      this._options = args2.options;
    }
  }
  matches(resource) {
    return this.selectors?.some((selector) => _NotebookProviderInfo.selectorMatches(selector, resource));
  }
  static selectorMatches(selector, resource) {
    if (typeof selector === "string" || isRelativePattern(selector)) {
      if (match(selector, basename(resource.fsPath), { ignoreCase: true })) {
        return true;
      }
    }
    if (!isDocumentExcludePattern(selector)) {
      return false;
    }
    const filenamePattern = selector.include;
    const excludeFilenamePattern = selector.exclude;
    if (match(filenamePattern, basename(resource.fsPath), { ignoreCase: true })) {
      if (excludeFilenamePattern) {
        if (match(excludeFilenamePattern, basename(resource.fsPath), { ignoreCase: true })) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  static possibleFileEnding(selectors) {
    for (const selector of selectors) {
      const ending = _NotebookProviderInfo._possibleFileEnding(selector);
      if (ending) {
        return ending;
      }
    }
    return void 0;
  }
  static _possibleFileEnding(selector) {
    const pattern = /^.*(\.[a-zA-Z0-9_-]+)$/;
    let candidate;
    if (typeof selector === "string") {
      candidate = selector;
    } else if (isRelativePattern(selector)) {
      candidate = selector.pattern;
    } else if (selector.include) {
      return _NotebookProviderInfo._possibleFileEnding(selector.include);
    }
    if (candidate) {
      const match2 = pattern.exec(candidate);
      if (match2) {
        return match2[1];
      }
    }
    return void 0;
  }
};
export { NotebookProviderInfo };
