// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentCustomizationSyncProvider.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentCustomizationSyncProvider.ts
var SYNC_STORAGE_KEY_PREFIX = "customizationSync.disabled.";

var AgentCustomizationSyncProvider = class extends Disposable {
  constructor(harnessId, _storageService) {
    super();
    this._storageService = _storageService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._storageKey = SYNC_STORAGE_KEY_PREFIX + harnessId;
    this._disabled = this._load();
  }
  isDisabled(uri5) {
    return this._disabled.has(uri5.toString());
  }
  setDisabled(uri5, disabled) {
    const key3 = uri5.toString();
    const had = this._disabled.has(key3);
    if (disabled && !had) {
      this._disabled.add(key3);
    } else if (!disabled && had) {
      this._disabled.delete(key3);
    } else {
      return;
    }
    this._persist();
    this._onDidChange.fire();
  }
  _load() {
    const stored = this._storageService.get(this._storageKey, 0 /* PROFILE */);
    if (!stored) {
      return /* @__PURE__ */ new Set();
    }
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return new Set(parsed.filter((v2) => typeof v2 === "string"));
      }
    } catch {
    }
    return /* @__PURE__ */ new Set();
  }
  _persist() {
    this._storageService.store(
      this._storageKey,
      JSON.stringify([...this._disabled]),
      0 /* PROFILE */,
      1 /* MACHINE */
    );
  }
};
export { SYNC_STORAGE_KEY_PREFIX, AgentCustomizationSyncProvider };
