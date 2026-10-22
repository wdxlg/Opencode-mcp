// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatCollections.ts



// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatCollections.ts
var ResourcePool = class {
  constructor(_itemFactory, _options) {
    this._itemFactory = _itemFactory;
    this._options = _options;
    this.pool = [];
    this._inUse = /* @__PURE__ */ new Set();
  }
  get inUse() {
    return this._inUse;
  }
  get() {
    if (this.pool.length > 0) {
      const item2 = this.pool.pop();
      this._inUse.add(item2);
      return item2;
    }
    const item = this._itemFactory();
    this._inUse.add(item);
    return item;
  }
  release(item) {
    this._inUse.delete(item);
    this.pool.push(item);
    this._scheduleTrim();
  }
  _scheduleTrim() {
    const maxIdle = this._options?.maxIdleSize;
    if (maxIdle === void 0 || this.pool.length <= maxIdle) {
      return;
    }
    if (this._trimTimer !== void 0) {
      clearTimeout(this._trimTimer);
    }
    const delay = this._options?.trimIdleDelay ?? 1e4;
    this._trimTimer = setTimeout(() => {
      this._trimTimer = void 0;
      this._trimIdle();
    }, delay);
  }
  _trimIdle() {
    const maxIdle = this._options?.maxIdleSize;
    if (maxIdle === void 0) {
      return;
    }
    while (this.pool.length > maxIdle) {
      const item = this.pool.pop();
      item.dispose();
    }
  }
  /**
   * Clear and dispose the items in the pool that are not in use.
   */
  clear() {
    if (this._trimTimer !== void 0) {
      clearTimeout(this._trimTimer);
      this._trimTimer = void 0;
    }
    for (const item of this.pool) {
      item.dispose();
    }
    this.pool.length = 0;
  }
  dispose() {
    this.clear();
    for (const item of this._inUse) {
      item.dispose();
    }
    this._inUse.clear();
  }
};

var KeyedResourcePool = class {
  constructor(_itemFactory, _options) {
    this._itemFactory = _itemFactory;
    this._options = _options;
    this._idle = [];
    this._inUse = /* @__PURE__ */ new Set();
    this._keyToItems = /* @__PURE__ */ new Map();
    this._itemToKey = /* @__PURE__ */ new Map();
  }
  get inUse() {
    return this._inUse;
  }
  get(key3) {
    const candidates = this._keyToItems.get(key3);
    if (candidates) {
      for (const item2 of candidates) {
        if (!this._inUse.has(item2)) {
          const idx = this._idle.indexOf(item2);
          if (idx !== -1) {
            this._idle.splice(idx, 1);
            this._inUse.add(item2);
            return item2;
          }
        }
      }
    }
    if (this._idle.length > 0) {
      const item2 = this._idle.pop();
      this._inUse.add(item2);
      return item2;
    }
    const item = this._itemFactory();
    this._inUse.add(item);
    return item;
  }
  release(item, key3) {
    this._inUse.delete(item);
    this._idle.push(item);
    const oldKey = this._itemToKey.get(item);
    if (oldKey !== void 0 && oldKey !== key3) {
      const oldSet = this._keyToItems.get(oldKey);
      if (oldSet) {
        oldSet.delete(item);
        if (oldSet.size === 0) {
          this._keyToItems.delete(oldKey);
        }
      }
    }
    this._itemToKey.set(item, key3);
    let keySet = this._keyToItems.get(key3);
    if (!keySet) {
      keySet = /* @__PURE__ */ new Set();
      this._keyToItems.set(key3, keySet);
    }
    keySet.add(item);
    this._scheduleTrim();
  }
  _scheduleTrim() {
    const maxIdle = this._options?.maxIdleSize;
    if (maxIdle === void 0 || this._idle.length <= maxIdle) {
      return;
    }
    if (this._trimTimer !== void 0) {
      clearTimeout(this._trimTimer);
    }
    const delay = this._options?.trimIdleDelay ?? 1e4;
    this._trimTimer = setTimeout(() => {
      this._trimTimer = void 0;
      this._trimIdle();
    }, delay);
  }
  _trimIdle() {
    const maxIdle = this._options?.maxIdleSize;
    if (maxIdle === void 0) {
      return;
    }
    while (this._idle.length > maxIdle) {
      const item = this._idle.pop();
      this._removeFromMaps(item);
      item.dispose();
    }
  }
  _removeFromMaps(item) {
    const key3 = this._itemToKey.get(item);
    if (key3 !== void 0) {
      const keySet = this._keyToItems.get(key3);
      if (keySet) {
        keySet.delete(item);
        if (keySet.size === 0) {
          this._keyToItems.delete(key3);
        }
      }
      this._itemToKey.delete(item);
    }
  }
  clear() {
    if (this._trimTimer !== void 0) {
      clearTimeout(this._trimTimer);
      this._trimTimer = void 0;
    }
    for (const item of this._idle) {
      item.dispose();
    }
    this._idle.length = 0;
    this._keyToItems.clear();
    this._itemToKey.clear();
  }
  dispose() {
    this.clear();
    for (const item of this._inUse) {
      item.dispose();
    }
    this._inUse.clear();
  }
};
export { ResourcePool, KeyedResourcePool };
