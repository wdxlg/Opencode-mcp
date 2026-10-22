// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/parts/storage/common/storage.ts
import { Disposable } from "./module-0012.mjs";
import { Event2, PauseableEmitter } from "./module-0017.mjs";
import { ThrottledDelayer } from "./module-0036.mjs";
import { isObject, isUndefined, isUndefinedOrNull } from "./module-0010.mjs";
import { parse2, stringify } from "./module-0265.mjs";


// src/vs/base/parts/storage/common/storage.ts
function isStorageItemsChangeEvent(thing) {
  const candidate = thing;
  return candidate?.changed instanceof Map || candidate?.deleted instanceof Set;
}

var Storage = class _Storage extends Disposable {
  constructor(database, options3 = /* @__PURE__ */ Object.create(null)) {
    super();
    this.database = database;
    this.options = options3;
    this._onDidChangeStorage = this._register(new PauseableEmitter());
    this.onDidChangeStorage = this._onDidChangeStorage.event;
    this.state = 0 /* None */;
    this.cache = /* @__PURE__ */ new Map();
    this.flushDelayer = this._register(new ThrottledDelayer(_Storage.DEFAULT_FLUSH_DELAY));
    this.pendingDeletes = /* @__PURE__ */ new Set();
    this.pendingInserts = /* @__PURE__ */ new Map();
    this.pendingClose = void 0;
    this.whenFlushedCallbacks = [];
    this.registerListeners();
  }
  static {
    this.DEFAULT_FLUSH_DELAY = 100;
  }
  registerListeners() {
    this._register(this.database.onDidChangeItemsExternal((e4) => this.onDidChangeItemsExternal(e4)));
  }
  onDidChangeItemsExternal(e4) {
    this._onDidChangeStorage.pause();
    try {
      e4.changed?.forEach((value2, key3) => this.acceptExternal(key3, value2));
      e4.deleted?.forEach((key3) => this.acceptExternal(key3, void 0));
    } finally {
      this._onDidChangeStorage.resume();
    }
  }
  acceptExternal(key3, value2) {
    if (this.state === 2 /* Closed */) {
      return;
    }
    let changed = false;
    if (isUndefinedOrNull(value2)) {
      changed = this.cache.delete(key3);
    } else {
      const currentValue = this.cache.get(key3);
      if (currentValue !== value2) {
        this.cache.set(key3, value2);
        changed = true;
      }
    }
    if (changed) {
      this._onDidChangeStorage.fire({ key: key3, external: true });
    }
  }
  get items() {
    return this.cache;
  }
  get size() {
    return this.cache.size;
  }
  async init() {
    if (this.state !== 0 /* None */) {
      return;
    }
    this.state = 1 /* Initialized */;
    if (this.options.hint === 0 /* STORAGE_DOES_NOT_EXIST */) {
      return;
    }
    this.cache = await this.database.getItems();
  }
  get(key3, fallbackValue) {
    const value2 = this.cache.get(key3);
    if (isUndefinedOrNull(value2)) {
      return fallbackValue;
    }
    return value2;
  }
  getBoolean(key3, fallbackValue) {
    const value2 = this.get(key3);
    if (isUndefinedOrNull(value2)) {
      return fallbackValue;
    }
    return value2 === "true";
  }
  getNumber(key3, fallbackValue) {
    const value2 = this.get(key3);
    if (isUndefinedOrNull(value2)) {
      return fallbackValue;
    }
    return parseInt(value2, 10);
  }
  getObject(key3, fallbackValue) {
    const value2 = this.get(key3);
    if (isUndefinedOrNull(value2)) {
      return fallbackValue;
    }
    return parse2(value2);
  }
  async set(key3, value2, external = false) {
    if (this.state === 2 /* Closed */) {
      return;
    }
    if (isUndefinedOrNull(value2)) {
      return this.delete(key3, external);
    }
    const valueStr = isObject(value2) || Array.isArray(value2) ? stringify(value2) : String(value2);
    const currentValue = this.cache.get(key3);
    if (currentValue === valueStr) {
      return;
    }
    this.cache.set(key3, valueStr);
    this.pendingInserts.set(key3, valueStr);
    this.pendingDeletes.delete(key3);
    this._onDidChangeStorage.fire({ key: key3, external });
    return this.doFlush();
  }
  async delete(key3, external = false) {
    if (this.state === 2 /* Closed */) {
      return;
    }
    const wasDeleted = this.cache.delete(key3);
    if (!wasDeleted) {
      return;
    }
    if (!this.pendingDeletes.has(key3)) {
      this.pendingDeletes.add(key3);
    }
    this.pendingInserts.delete(key3);
    this._onDidChangeStorage.fire({ key: key3, external });
    return this.doFlush();
  }
  async optimize() {
    if (this.state === 2 /* Closed */) {
      return;
    }
    await this.flush(0);
    return this.database.optimize();
  }
  async close() {
    if (!this.pendingClose) {
      this.pendingClose = this.doClose();
    }
    return this.pendingClose;
  }
  async doClose() {
    this.state = 2 /* Closed */;
    try {
      await this.doFlush(
        0
        /* as soon as possible */
      );
    } catch {
    }
    await this.database.close(() => this.cache);
  }
  get hasPending() {
    return this.pendingInserts.size > 0 || this.pendingDeletes.size > 0;
  }
  async flushPending() {
    if (!this.hasPending) {
      return;
    }
    const updateRequest = { insert: this.pendingInserts, delete: this.pendingDeletes };
    this.pendingDeletes = /* @__PURE__ */ new Set();
    this.pendingInserts = /* @__PURE__ */ new Map();
    return this.database.updateItems(updateRequest).finally(() => {
      if (!this.hasPending) {
        while (this.whenFlushedCallbacks.length) {
          this.whenFlushedCallbacks.pop()?.();
        }
      }
    });
  }
  async flush(delay) {
    if (this.state === 2 /* Closed */ || // Return early if we are already closed
    this.pendingClose) {
      return;
    }
    return this.doFlush(delay);
  }
  async doFlush(delay) {
    if (this.options.hint === 1 /* STORAGE_IN_MEMORY */) {
      return this.flushPending();
    }
    return this.flushDelayer.trigger(() => this.flushPending(), delay);
  }
  async whenFlushed() {
    if (!this.hasPending) {
      return;
    }
    return new Promise((resolve3) => this.whenFlushedCallbacks.push(resolve3));
  }
  isInMemory() {
    return this.options.hint === 1 /* STORAGE_IN_MEMORY */;
  }
};

var InMemoryStorageDatabase = class {
  constructor() {
    this.onDidChangeItemsExternal = Event2.None;
    this.items = /* @__PURE__ */ new Map();
  }
  async getItems() {
    return this.items;
  }
  async updateItems(request2) {
    request2.insert?.forEach((value2, key3) => this.items.set(key3, value2));
    request2.delete?.forEach((key3) => this.items.delete(key3));
  }
  async optimize() {
  }
  async close() {
  }
};

var MIGRATED_KEY = "__$__migratedStorageMarker";

var MigratingStorage = class _MigratingStorage extends Storage {
  constructor() {
    super(...arguments);
    this.migratedKeys = /* @__PURE__ */ new Set();
    this.fallbackStorage = void 0;
    this.isFallbackStorageReadonly = false;
  }
  async init() {
    await super.init();
    this.migratedKeys = this.loadMigratedKeys();
  }
  setFallbackStorage(storage, isReadonly) {
    this.fallbackStorage = storage;
    this.isFallbackStorageReadonly = isReadonly;
  }
  static {
    this.INTERNAL_KEY_PREFIX = "__$__";
  }
  get(key3, fallbackValue) {
    if (!key3.startsWith(_MigratingStorage.INTERNAL_KEY_PREFIX) && !this.migratedKeys.has(key3) && isUndefined(super.get(key3))) {
      this.migratedKeys.add(key3);
      const value2 = this.fallbackStorage?.items.get(key3);
      if (!isUndefined(value2)) {
        this.set(key3, value2);
        if (!this.isFallbackStorageReadonly) {
          this.fallbackStorage?.delete(key3);
        }
        this.persistMigratedKeys();
      }
    }
    return super.get(key3, fallbackValue);
  }
  loadMigratedKeys() {
    const raw = super.get(MIGRATED_KEY);
    if (raw) {
      try {
        return new Set(JSON.parse(raw));
      } catch {
      }
    }
    return /* @__PURE__ */ new Set();
  }
  persistMigratedKeys() {
    this.set(MIGRATED_KEY, JSON.stringify([...this.migratedKeys]));
  }
};
export { isStorageItemsChangeEvent, Storage, InMemoryStorageDatabase, MIGRATED_KEY, MigratingStorage };
