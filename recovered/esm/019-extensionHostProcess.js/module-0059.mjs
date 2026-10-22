// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/extensions/common/extensions.ts
import { equalsIgnoreCase } from "./module-0023.mjs";
import { createDecorator2 } from "./module-0048.mjs";


// src/vs/platform/extensions/common/extensions.ts
var EXTENSION_CATEGORIES = [
  "AI",
  "Azure",
  "Chat",
  "Data Science",
  "Debuggers",
  "Extension Packs",
  "Education",
  "Formatters",
  "Keymaps",
  "Language Packs",
  "Linters",
  "Machine Learning",
  "Notebooks",
  "Programming Languages",
  "SCM Providers",
  "Snippets",
  "Testing",
  "Themes",
  "Visualization",
  "Other"
];

var ExtensionIdentifier = class {
  constructor(value) {
    this.value = value;
    this._lower = value.toLowerCase();
  }
  static equals(a, b) {
    if (typeof a === "undefined" || a === null) {
      return typeof b === "undefined" || b === null;
    }
    if (typeof b === "undefined" || b === null) {
      return false;
    }
    if (typeof a === "string" || typeof b === "string") {
      const aValue = typeof a === "string" ? a : a.value;
      const bValue = typeof b === "string" ? b : b.value;
      return equalsIgnoreCase(aValue, bValue);
    }
    return a._lower === b._lower;
  }
  /**
   * Gives the value by which to index (for equality).
   */
  static toKey(id2) {
    if (typeof id2 === "string") {
      return id2.toLowerCase();
    }
    return id2._lower;
  }
};

var ExtensionIdentifierSet = class {
  constructor(iterable) {
    this._set = /* @__PURE__ */ new Set();
    if (iterable) {
      for (const value of iterable) {
        this.add(value);
      }
    }
  }
  get size() {
    return this._set.size;
  }
  add(id2) {
    this._set.add(ExtensionIdentifier.toKey(id2));
  }
  delete(extensionId) {
    return this._set.delete(ExtensionIdentifier.toKey(extensionId));
  }
  has(id2) {
    return this._set.has(ExtensionIdentifier.toKey(id2));
  }
};

var ExtensionIdentifierMap = class {
  constructor() {
    this._map = /* @__PURE__ */ new Map();
  }
  clear() {
    this._map.clear();
  }
  delete(id2) {
    this._map.delete(ExtensionIdentifier.toKey(id2));
  }
  get(id2) {
    return this._map.get(ExtensionIdentifier.toKey(id2));
  }
  has(id2) {
    return this._map.has(ExtensionIdentifier.toKey(id2));
  }
  set(id2, value) {
    this._map.set(ExtensionIdentifier.toKey(id2), value);
  }
  values() {
    return this._map.values();
  }
  forEach(callbackfn) {
    this._map.forEach(callbackfn);
  }
  [Symbol.iterator]() {
    return this._map[Symbol.iterator]();
  }
};

var ExtensionError = class extends Error {
  constructor(extensionIdentifier, cause, message) {
    const detail = message && cause?.message ? `${message}: ${cause.message}` : message ?? cause?.message;
    super(`Error in extension ${ExtensionIdentifier.toKey(extensionIdentifier)}: ${detail}`, { cause });
    this.name = "ExtensionError";
    this.extension = extensionIdentifier;
    if (cause?.stack) {
      this.stack = cause.stack;
    }
  }
};

var IBuiltinExtensionsScannerService = createDecorator2("IBuiltinExtensionsScannerService");
export { EXTENSION_CATEGORIES, ExtensionIdentifier, ExtensionIdentifierSet, ExtensionIdentifierMap, ExtensionError, IBuiltinExtensionsScannerService };
