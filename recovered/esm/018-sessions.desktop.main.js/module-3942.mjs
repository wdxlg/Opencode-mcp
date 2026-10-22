// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/keyboardLayout/common/keyboardMapper.ts



// src/vs/platform/keyboardLayout/common/keyboardMapper.ts
var CachedKeyboardMapper = class {
  constructor(actual) {
    this._actual = actual;
    this._cache = /* @__PURE__ */ new Map();
  }
  dumpDebugInfo() {
    return this._actual.dumpDebugInfo();
  }
  resolveKeyboardEvent(keyboardEvent) {
    return this._actual.resolveKeyboardEvent(keyboardEvent);
  }
  resolveKeybinding(keybinding) {
    const hashCode = keybinding.getHashCode();
    const resolved = this._cache.get(hashCode);
    if (!resolved) {
      const r2 = this._actual.resolveKeybinding(keybinding);
      this._cache.set(hashCode, r2);
      return r2;
    }
    return resolved;
  }
};
export { CachedKeyboardMapper };
