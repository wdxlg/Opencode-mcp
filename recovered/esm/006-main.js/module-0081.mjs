// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/browserView/common/browserHistory.ts
import { __esm } from "./module-0000.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { StringSHA1, init_hash } from "./module-0067.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";


// src/vs/platform/browserView/common/browserHistory.ts
function isValidEntry(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  const e = value;
  return typeof e.id === "number" && typeof e.url === "string" && typeof e.time === "number" && typeof e.title === "string" && (e.icon === void 0 || typeof e.icon === "string") && (e.explicit === void 0 || e.explicit === true);
}

var NOOP_HANDLE, DEFAULT_MAX_ENTRIES, BrowserHistoryEntriesStore, BrowserFaviconsStore, BrowserHistoryStore;

var init_browserHistory = __esm({
  "src/vs/platform/browserView/common/browserHistory.ts"() {
    init_event();
    init_hash();
    init_lifecycle();
    NOOP_HANDLE = Object.freeze({
      id: -1,
      update: () => {
      },
      delete: () => {
      }
    });
    DEFAULT_MAX_ENTRIES = 200;
    BrowserHistoryEntriesStore = class extends Disposable {
      constructor(maxEntries = DEFAULT_MAX_ENTRIES) {
        super();
        this._nextId = 1;
        this._items = [];
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this._maxEntries = maxEntries;
      }
      get items() {
        return this._items;
      }
      get maxEntries() {
        return this._maxEntries;
      }
      setMaxEntries(max) {
        if (max < 0 || max === this._maxEntries) {
          return;
        }
        this._maxEntries = max;
        if (this._evictIfNeeded()) {
          this._onDidChange.fire();
        }
      }
      add(url, title, faviconHash, userInitiated) {
        const entry = userInitiated ? { id: this._nextId++, url, time: Date.now(), title, icon: faviconHash, explicit: true } : { id: this._nextId++, url, time: Date.now(), title, icon: faviconHash };
        this._items.push(entry);
        this._evictIfNeeded();
        this._onDidChange.fire();
        return entry;
      }
      update(id2, patch2) {
        const idx = this._indexOf(id2);
        if (idx === -1) {
          return false;
        }
        const existing = this._items[idx];
        const nextTitle = patch2.title && patch2.title.length > 0 ? patch2.title : existing.title;
        const nextUrl = patch2.url && patch2.url.length > 0 ? patch2.url : existing.url;
        const nextFaviconHash = patch2.faviconHash === void 0 ? existing.icon : patch2.faviconHash ?? void 0;
        const nextTime = patch2.url ? Date.now() : existing.time;
        if (nextUrl === existing.url && nextTitle === existing.title && nextFaviconHash === existing.icon && nextTime === existing.time) {
          return false;
        }
        this._items[idx] = { ...existing, url: nextUrl, title: nextTitle, icon: nextFaviconHash, time: nextTime };
        this._onDidChange.fire();
        return true;
      }
      delete(id2) {
        const idx = this._indexOf(id2);
        if (idx === -1) {
          return false;
        }
        this._items.splice(idx, 1);
        this._onDidChange.fire();
        return true;
      }
      clear() {
        if (this._items.length === 0 && this._nextId === 1) {
          return;
        }
        this._items = [];
        this._nextId = 1;
        this._onDidChange.fire();
      }
      serialize() {
        return { items: this._items.slice() };
      }
      hydrate(snapshot) {
        this._items = [];
        this._nextId = 1;
        if (snapshot && Array.isArray(snapshot.items)) {
          for (const e of snapshot.items) {
            if (isValidEntry(e)) {
              this._items.push(e);
            }
          }
          for (const e of this._items) {
            if (e.id >= this._nextId) {
              this._nextId = e.id + 1;
            }
          }
          this._evictIfNeeded();
        }
        this._onDidChange.fire();
      }
      _indexOf(id2) {
        for (let i = this._items.length - 1; i >= 0; i--) {
          if (this._items[i].id === id2) {
            return i;
          }
        }
        return -1;
      }
      _evictIfNeeded() {
        if (this._items.length > this._maxEntries) {
          this._items.splice(0, this._items.length - this._maxEntries);
          return true;
        }
        return false;
      }
    };
    BrowserFaviconsStore = class extends Disposable {
      constructor() {
        super(...arguments);
        this._byHash = /* @__PURE__ */ new Map();
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
      }
      get(hash2) {
        return this._byHash.get(hash2);
      }
      register(dataUri) {
        const sha = new StringSHA1();
        sha.update(dataUri);
        const hash2 = sha.digest();
        if (!this._byHash.has(hash2)) {
          this._byHash.set(hash2, dataUri);
          this._onDidChange.fire();
        }
        return hash2;
      }
      gc(referenced) {
        if (this._byHash.size === 0) {
          return;
        }
        let changed = false;
        for (const hash2 of this._byHash.keys()) {
          if (!referenced.has(hash2)) {
            this._byHash.delete(hash2);
            changed = true;
          }
        }
        if (changed) {
          this._onDidChange.fire();
        }
      }
      clear() {
        if (this._byHash.size === 0) {
          return;
        }
        this._byHash.clear();
        this._onDidChange.fire();
      }
      serialize() {
        return { map: Object.fromEntries(this._byHash) };
      }
      hydrate(snapshot) {
        this._byHash.clear();
        if (snapshot?.map && typeof snapshot.map === "object") {
          for (const [k, v] of Object.entries(snapshot.map)) {
            if (typeof v === "string") {
              this._byHash.set(k, v);
            }
          }
        }
        this._onDidChange.fire();
      }
    };
    BrowserHistoryStore = class extends Disposable {
      constructor(maxEntries) {
        super();
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this.entries = this._register(new BrowserHistoryEntriesStore(maxEntries));
        this.favicons = this._register(new BrowserFaviconsStore());
        this._register(this.entries.onDidChange(() => {
          this._gcFavicons();
          this._onDidChange.fire();
        }));
        this._register(this.favicons.onDidChange(() => this._onDidChange.fire()));
      }
      add(url, title, favicon, userInitiated = false) {
        if (this.entries.maxEntries === 0) {
          return NOOP_HANDLE;
        }
        const faviconHash = favicon ? this.favicons.register(favicon) : void 0;
        const entry = this.entries.add(url, title, faviconHash, userInitiated);
        return this._handleFor(entry.id);
      }
      setMaxEntries(max) {
        this.entries.setMaxEntries(max);
      }
      clear() {
        this.entries.clear();
        this.favicons.clear();
      }
      _handleFor(id2) {
        return {
          id: id2,
          update: (patch2) => {
            const next = {};
            if (patch2.url !== void 0) {
              next.url = patch2.url;
            }
            if (patch2.title !== void 0) {
              next.title = patch2.title;
            }
            if (patch2.favicon !== void 0) {
              next.faviconHash = patch2.favicon === null ? null : this.favicons.register(patch2.favicon);
            }
            this.entries.update(id2, next);
          },
          delete: () => {
            this.entries.delete(id2);
          }
        };
      }
      _gcFavicons() {
        const referenced = /* @__PURE__ */ new Set();
        for (const e of this.entries.items) {
          if (e.icon) {
            referenced.add(e.icon);
          }
        }
        this.favicons.gc(referenced);
      }
    };
  }
});
export { isValidEntry, NOOP_HANDLE, DEFAULT_MAX_ENTRIES, BrowserHistoryEntriesStore, BrowserFaviconsStore, BrowserHistoryStore, init_browserHistory };
