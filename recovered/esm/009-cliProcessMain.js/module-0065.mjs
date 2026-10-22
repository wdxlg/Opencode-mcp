// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/extensions/common/extensions.ts
import { equalsIgnoreCase } from "./module-0022.mjs";
import { createDecorator } from "./module-0030.mjs";


// src/vs/platform/extensions/common/extensions.ts
var USER_MANIFEST_CACHE_FILE = "extensions.user.cache";

var BUILTIN_MANIFEST_CACHE_FILE = "extensions.builtin.cache";

var UNDEFINED_PUBLISHER = "undefined_publisher";

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

function isApplicationScopedExtension(manifest) {
  return isLanguagePackExtension(manifest);
}

function isLanguagePackExtension(manifest) {
  return manifest.contributes && manifest.contributes.localizations ? manifest.contributes.localizations.length > 0 : false;
}

function parseEnabledApiProposalNames(enabledApiProposals) {
  return enabledApiProposals.map((proposal) => proposal.split("@")[0]);
}

var IBuiltinExtensionsScannerService = createDecorator("IBuiltinExtensionsScannerService");
export { isApplicationScopedExtension, isLanguagePackExtension, parseEnabledApiProposalNames, USER_MANIFEST_CACHE_FILE, BUILTIN_MANIFEST_CACHE_FILE, UNDEFINED_PUBLISHER, EXTENSION_CATEGORIES, ExtensionIdentifier, ExtensionIdentifierMap, IBuiltinExtensionsScannerService };
