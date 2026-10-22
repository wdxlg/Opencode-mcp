// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/browser/sessionsRecencyHistory.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/sessions/services/sessions/browser/sessionsRecencyHistory.ts
function entryKey2(sessionResource, chatResource) {
  return `${sessionResource.toString()}::${chatResource?.toString() ?? ""}`;
}

var SessionsRecencyHistory = class _SessionsRecencyHistory extends Disposable {
  constructor(_storageService, _logService) {
    super();
    this._storageService = _storageService;
    this._logService = _logService;
    this._entries = [];
    this._version = observableValue(this, 0);
    this._entries = this._load();
  }
  static {
    this.STORAGE_KEY = "agentSessions.recencyHistory";
  }
  static {
    this.MAX_RECENCY_ENTRIES = 50;
  }
  /** Bumped whenever {@link entries} changes, so observers can react. */
  get version() {
    return this._version;
  }
  /** The recency entries in MRU order (index 0 is the most recently opened). */
  get entries() {
    return this._entries;
  }
  /**
   * Record that the given session (optionally a specific chat within it) was
   * explicitly opened, promoting it to the front of the MRU list.
   */
  markOpened(sessionResource, chatResource) {
    const key3 = entryKey2(sessionResource, chatResource);
    const existingIndex = this._entries.findIndex((e4) => entryKey2(e4.sessionResource, e4.chatResource) === key3);
    if (existingIndex === 0) {
      return;
    }
    if (existingIndex > 0) {
      this._entries.splice(existingIndex, 1);
    }
    this._entries.unshift({ sessionResource, chatResource });
    if (this._entries.length > _SessionsRecencyHistory.MAX_RECENCY_ENTRIES) {
      this._entries.length = _SessionsRecencyHistory.MAX_RECENCY_ENTRIES;
    }
    this._save();
    this._bumpVersion();
  }
  /** Remove every entry matching the given predicate. */
  remove(predicate) {
    const next = this._entries.filter((e4) => !predicate(e4));
    if (next.length === this._entries.length) {
      return;
    }
    this._entries = next;
    this._save();
    this._bumpVersion();
  }
  _bumpVersion() {
    this._version.set(this._version.get() + 1, void 0);
  }
  _load() {
    const raw = this._storageService.get(_SessionsRecencyHistory.STORAGE_KEY, 1 /* WORKSPACE */);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter((e4) => e4 && typeof e4.session === "string").map((e4) => ({
        sessionResource: URI.parse(e4.session),
        chatResource: e4.chat ? URI.parse(e4.chat) : void 0
      }));
    } catch (error) {
      this._logService.warn("[SessionsRecencyHistory] failed to parse persisted recency history", error);
      return [];
    }
  }
  _save() {
    if (this._entries.length === 0) {
      this._storageService.remove(_SessionsRecencyHistory.STORAGE_KEY, 1 /* WORKSPACE */);
      return;
    }
    const serialized = this._entries.map((e4) => ({
      session: e4.sessionResource.toString(),
      chat: e4.chatResource?.toString()
    }));
    this._storageService.store(_SessionsRecencyHistory.STORAGE_KEY, JSON.stringify(serialized), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
};
export { entryKey2, SessionsRecencyHistory };
