// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/extensions/common/extensions.ts
import { __esm } from "./module-0000.mjs";
import { equalsIgnoreCase, init_strings } from "./module-0027.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { init_remoteHosts } from "./module-0127.mjs";


// src/vs/platform/extensions/common/extensions.ts
function parseEnabledApiProposalNames(enabledApiProposals) {
  return enabledApiProposals.map((proposal) => proposal.split("@")[0]);
}

var USER_MANIFEST_CACHE_FILE, BUILTIN_MANIFEST_CACHE_FILE, UNDEFINED_PUBLISHER, ExtensionIdentifier, ExtensionIdentifierMap, IBuiltinExtensionsScannerService;

var init_extensions = __esm({
  "src/vs/platform/extensions/common/extensions.ts"() {
    init_strings();
    init_instantiation();
    init_remoteHosts();
    USER_MANIFEST_CACHE_FILE = "extensions.user.cache";
    BUILTIN_MANIFEST_CACHE_FILE = "extensions.builtin.cache";
    UNDEFINED_PUBLISHER = "undefined_publisher";
    ExtensionIdentifier = class {
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
    ExtensionIdentifierMap = class {
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
    IBuiltinExtensionsScannerService = createDecorator("IBuiltinExtensionsScannerService");
  }
});
export { parseEnabledApiProposalNames, USER_MANIFEST_CACHE_FILE, BUILTIN_MANIFEST_CACHE_FILE, UNDEFINED_PUBLISHER, ExtensionIdentifier, ExtensionIdentifierMap, IBuiltinExtensionsScannerService, init_extensions };
