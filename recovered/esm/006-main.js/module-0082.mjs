// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/browserView/electron-main/browserSessionHistory.ts
import { __esm } from "./module-0000.mjs";
import { RunOnceScheduler, init_async } from "./module-0034.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { init_storage2 } from "./module-0079.mjs";
import { BrowserHistoryStore, init_browserHistory } from "./module-0081.mjs";
import { init_browserView } from "./module-0069.mjs";


// src/vs/platform/browserView/electron-main/browserSessionHistory.ts
function writeSnapshot(storage, key, snapshot, isEmpty) {
  if (isEmpty) {
    storage.remove(key, -1 /* APPLICATION */);
  } else {
    storage.store(key, JSON.stringify(snapshot), -1 /* APPLICATION */, 1 /* MACHINE */);
  }
}

function parseSnapshot(raw) {
  if (!raw) {
    return void 0;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return void 0;
    }
    return parsed;
  } catch {
    return void 0;
  }
}

var FLUSH_INTERVAL_MS, BrowserSessionHistory;

var init_browserSessionHistory = __esm({
  "src/vs/platform/browserView/electron-main/browserSessionHistory.ts"() {
    init_async();
    init_lifecycle();
    init_storage2();
    init_browserHistory();
    init_browserView();
    FLUSH_INTERVAL_MS = 2e3;
    BrowserSessionHistory = class extends Disposable {
      constructor(session4) {
        super();
        this._historyStore = this._register(new BrowserHistoryStore());
        this._persistable = false;
        this._entriesFlush = this._register(new RunOnceScheduler(() => this._flushEntries(), FLUSH_INTERVAL_MS));
        this._faviconsFlush = this._register(new RunOnceScheduler(() => this._flushFavicons(), FLUSH_INTERVAL_MS));
        this.storageKeys = session4.storageScope === "ephemeral" /* Ephemeral */ ? {} : {
          history: `browser.history.entries.${session4.id}`,
          favicons: `browser.history.favicons.${session4.id}`
        };
        this._register(this._historyStore.entries.onDidChange(() => {
          if (this._persistable && !this._entriesFlush.isScheduled()) {
            this._entriesFlush.schedule();
          }
        }));
        this._register(this._historyStore.favicons.onDidChange(() => {
          if (this._persistable && !this._faviconsFlush.isScheduled()) {
            this._faviconsFlush.schedule();
          }
        }));
      }
      connectStorage(storage) {
        if (this._storage || !this.storageKeys.history) {
          return;
        }
        this._storage = storage;
        this._load();
        this._persistable = true;
      }
      add(url, title, favicon, userInitiated) {
        return this._historyStore.add(url, title, favicon, userInitiated);
      }
      delete(entryIds) {
        if (entryIds === void 0) {
          this._historyStore.clear();
        } else {
          for (const id2 of entryIds) {
            this._historyStore.entries.delete(id2);
          }
        }
        this.flushNow();
      }
      setMaxEntries(max) {
        this._historyStore.setMaxEntries(max);
      }
      flushNow() {
        if (this._entriesFlush.isScheduled()) {
          this._entriesFlush.cancel();
          this._flushEntries();
        }
        if (this._faviconsFlush.isScheduled()) {
          this._faviconsFlush.cancel();
          this._flushFavicons();
        }
      }
      _load() {
        const storage = this._storage;
        const { history: historyKey, favicons: faviconsKey } = this.storageKeys;
        if (!storage || !historyKey || !faviconsKey) {
          return;
        }
        const entries = parseSnapshot(storage.get(historyKey, -1 /* APPLICATION */));
        const favicons = parseSnapshot(storage.get(faviconsKey, -1 /* APPLICATION */));
        this._persistable = false;
        try {
          this._historyStore.entries.hydrate(entries);
          this._historyStore.favicons.hydrate(favicons);
        } finally {
          this._persistable = true;
        }
      }
      _flushEntries() {
        const storage = this._storage;
        const key = this.storageKeys.history;
        if (!storage || !key) {
          return;
        }
        const snapshot = this._historyStore.entries.serialize();
        writeSnapshot(storage, key, snapshot, snapshot.items.length === 0);
      }
      _flushFavicons() {
        const storage = this._storage;
        const key = this.storageKeys.favicons;
        if (!storage || !key) {
          return;
        }
        const snapshot = this._historyStore.favicons.serialize();
        writeSnapshot(storage, key, snapshot, Object.keys(snapshot.map).length === 0);
      }
    };
  }
});
export { writeSnapshot, parseSnapshot, FLUSH_INTERVAL_MS, BrowserSessionHistory, init_browserSessionHistory };
