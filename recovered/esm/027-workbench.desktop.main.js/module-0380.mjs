// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet.ts



// src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet.ts
var emptyArr = [];

var SmallImmutableSet = class _SmallImmutableSet {
  constructor(items, additionalItems) {
    this.items = items;
    this.additionalItems = additionalItems;
  }
  static {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.cache = new Array(129);
  }
  static create(items, additionalItems) {
    if (items <= 128 && additionalItems.length === 0) {
      let cached = _SmallImmutableSet.cache[items];
      if (!cached) {
        cached = new _SmallImmutableSet(items, additionalItems);
        _SmallImmutableSet.cache[items] = cached;
      }
      return cached;
    }
    return new _SmallImmutableSet(items, additionalItems);
  }
  static {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.empty = _SmallImmutableSet.create(0, emptyArr);
  }
  static getEmpty() {
    return this.empty;
  }
  add(value2, keyProvider) {
    const key3 = keyProvider.getKey(value2);
    let idx = key3 >> 5;
    if (idx === 0) {
      const newItem = 1 << key3 | this.items;
      if (newItem === this.items) {
        return this;
      }
      return _SmallImmutableSet.create(newItem, this.additionalItems);
    }
    idx--;
    const newItems = this.additionalItems.slice(0);
    while (newItems.length < idx) {
      newItems.push(0);
    }
    newItems[idx] |= 1 << (key3 & 31);
    return _SmallImmutableSet.create(this.items, newItems);
  }
  has(value2, keyProvider) {
    const key3 = keyProvider.getKey(value2);
    let idx = key3 >> 5;
    if (idx === 0) {
      return (this.items & 1 << key3) !== 0;
    }
    idx--;
    return ((this.additionalItems[idx] || 0) & 1 << (key3 & 31)) !== 0;
  }
  merge(other) {
    const merged = this.items | other.items;
    if (this.additionalItems === emptyArr && other.additionalItems === emptyArr) {
      if (merged === this.items) {
        return this;
      }
      if (merged === other.items) {
        return other;
      }
      return _SmallImmutableSet.create(merged, emptyArr);
    }
    const newItems = [];
    for (let i2 = 0; i2 < Math.max(this.additionalItems.length, other.additionalItems.length); i2++) {
      const item1 = this.additionalItems[i2] || 0;
      const item2 = other.additionalItems[i2] || 0;
      newItems.push(item1 | item2);
    }
    return _SmallImmutableSet.create(merged, newItems);
  }
  intersects(other) {
    if ((this.items & other.items) !== 0) {
      return true;
    }
    for (let i2 = 0; i2 < Math.min(this.additionalItems.length, other.additionalItems.length); i2++) {
      if ((this.additionalItems[i2] & other.additionalItems[i2]) !== 0) {
        return true;
      }
    }
    return false;
  }
  equals(other) {
    if (this.items !== other.items) {
      return false;
    }
    if (this.additionalItems.length !== other.additionalItems.length) {
      return false;
    }
    for (let i2 = 0; i2 < this.additionalItems.length; i2++) {
      if (this.additionalItems[i2] !== other.additionalItems[i2]) {
        return false;
      }
    }
    return true;
  }
};

var identityKeyProvider = {
  getKey(value2) {
    return value2;
  }
};

var DenseKeyProvider = class {
  constructor() {
    this.items = /* @__PURE__ */ new Map();
  }
  getKey(value2) {
    let existing = this.items.get(value2);
    if (existing === void 0) {
      existing = this.items.size;
      this.items.set(value2, existing);
    }
    return existing;
  }
  reverseLookup(value2) {
    return [...this.items].find(([_key, v2]) => v2 === value2)?.[0];
  }
  reverseLookupSet(set) {
    const result = [];
    for (const [key3] of this.items) {
      if (set.has(key3, this)) {
        result.push(key3);
      }
    }
    return result;
  }
  keys() {
    return this.items.keys();
  }
};
export { emptyArr, SmallImmutableSet, identityKeyProvider, DenseKeyProvider };
