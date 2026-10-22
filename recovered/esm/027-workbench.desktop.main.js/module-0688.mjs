// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/extensions/common/extensions.ts
import { equalsIgnoreCase } from "./module-0030.mjs";
import { getRemoteName } from "./module-0687.mjs";
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/extensions/common/extensions.ts
var USER_MANIFEST_CACHE_FILE = "extensions.user.cache";

var BUILTIN_MANIFEST_CACHE_FILE = "extensions.builtin.cache";

var UNDEFINED_PUBLISHER = "undefined_publisher";

var ALL_EXTENSION_KINDS = ["ui", "workspace", "web"];

function getWorkspaceSupportTypeMessage(supportType) {
  if (typeof supportType === "object" && supportType !== null) {
    if (supportType.supported !== true) {
      return supportType.description;
    }
  }
  return void 0;
}

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
  constructor(value2) {
    this.value = value2;
    this._lower = value2.toLowerCase();
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
      for (const value2 of iterable) {
        this.add(value2);
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
  set(id2, value2) {
    this._map.set(ExtensionIdentifier.toKey(id2), value2);
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

function isAuthenticationProviderExtension(manifest) {
  return manifest.contributes && manifest.contributes.authentication ? manifest.contributes.authentication.length > 0 : false;
}

function isResolverExtension(manifest, remoteAuthority) {
  if (remoteAuthority) {
    const activationEvent = `onResolveRemoteAuthority:${getRemoteName(remoteAuthority)}`;
    return !!manifest.activationEvents?.includes(activationEvent);
  }
  return false;
}

function parseEnabledApiProposalNames(enabledApiProposals) {
  return enabledApiProposals.map((proposal) => proposal.split("@")[0]);
}

var IBuiltinExtensionsScannerService = createDecorator("IBuiltinExtensionsScannerService");
export { getWorkspaceSupportTypeMessage, isApplicationScopedExtension, isLanguagePackExtension, isAuthenticationProviderExtension, isResolverExtension, parseEnabledApiProposalNames, USER_MANIFEST_CACHE_FILE, BUILTIN_MANIFEST_CACHE_FILE, UNDEFINED_PUBLISHER, ALL_EXTENSION_KINDS, EXTENSION_CATEGORIES, ExtensionIdentifier, ExtensionIdentifierSet, ExtensionIdentifierMap, IBuiltinExtensionsScannerService };
