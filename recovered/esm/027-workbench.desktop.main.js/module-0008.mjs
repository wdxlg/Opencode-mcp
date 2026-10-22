// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/map.ts



// src/vs/base/common/map.ts
function getOrSet(map, key3, value2) {
  let result = map.get(key3);
  if (result === void 0) {
    result = value2;
    map.set(key3, result);
  }
  return result;
}

var ResourceMapEntry = class {
  constructor(uri5, value2) {
    this.uri = uri5;
    this.value = value2;
  }
};

function isEntries(arg) {
  return Array.isArray(arg);
}

var _a2;

var ResourceMap = class _ResourceMap {
  constructor(arg, toKey2) {
    this[_a2] = "ResourceMap";
    if (arg instanceof _ResourceMap) {
      this.map = new Map(arg.map);
      this.toKey = toKey2 ?? _ResourceMap.defaultToKey;
    } else if (isEntries(arg)) {
      this.map = /* @__PURE__ */ new Map();
      this.toKey = toKey2 ?? _ResourceMap.defaultToKey;
      for (const [resource, value2] of arg) {
        this.set(resource, value2);
      }
    } else {
      this.map = /* @__PURE__ */ new Map();
      this.toKey = arg ?? _ResourceMap.defaultToKey;
    }
  }
  static {
    this.defaultToKey = (resource) => resource.toString();
  }
  set(resource, value2) {
    this.map.set(this.toKey(resource), new ResourceMapEntry(resource, value2));
    return this;
  }
  get(resource) {
    return this.map.get(this.toKey(resource))?.value;
  }
  has(resource) {
    return this.map.has(this.toKey(resource));
  }
  get size() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  delete(resource) {
    return this.map.delete(this.toKey(resource));
  }
  forEach(clb, thisArg) {
    if (typeof thisArg !== "undefined") {
      clb = clb.bind(thisArg);
    }
    for (const [_, entry] of this.map) {
      clb(entry.value, entry.uri, this);
    }
  }
  *values() {
    for (const entry of this.map.values()) {
      yield entry.value;
    }
  }
  *keys() {
    for (const entry of this.map.values()) {
      yield entry.uri;
    }
  }
  *entries() {
    for (const entry of this.map.values()) {
      yield [entry.uri, entry.value];
    }
  }
  *[(_a2 = Symbol.toStringTag, Symbol.iterator)]() {
    for (const [, entry] of this.map) {
      yield [entry.uri, entry.value];
    }
  }
};

var _a3;

var ResourceSet = class {
  constructor(entriesOrKey, toKey2) {
    this[_a3] = "ResourceSet";
    if (!entriesOrKey || typeof entriesOrKey === "function") {
      this._map = new ResourceMap(entriesOrKey);
    } else {
      this._map = new ResourceMap(toKey2);
      entriesOrKey.forEach(this.add, this);
    }
  }
  get size() {
    return this._map.size;
  }
  add(value2) {
    this._map.set(value2, value2);
    return this;
  }
  clear() {
    this._map.clear();
  }
  delete(value2) {
    return this._map.delete(value2);
  }
  forEach(callbackfn, thisArg) {
    this._map.forEach((_value, key3) => callbackfn.call(thisArg, key3, key3, this));
  }
  has(value2) {
    return this._map.has(value2);
  }
  entries() {
    return this._map.entries();
  }
  keys() {
    return this._map.keys();
  }
  values() {
    return this._map.keys();
  }
  [(_a3 = Symbol.toStringTag, Symbol.iterator)]() {
    return this.keys();
  }
};

var _a4;

var LinkedMap = class {
  constructor() {
    this[_a4] = "LinkedMap";
    this._map = /* @__PURE__ */ new Map();
    this._head = void 0;
    this._tail = void 0;
    this._size = 0;
    this._state = 0;
  }
  clear() {
    this._map.clear();
    this._head = void 0;
    this._tail = void 0;
    this._size = 0;
    this._state++;
  }
  isEmpty() {
    return !this._head && !this._tail;
  }
  get size() {
    return this._size;
  }
  get first() {
    return this._head?.value;
  }
  get last() {
    return this._tail?.value;
  }
  has(key3) {
    return this._map.has(key3);
  }
  get(key3, touch = 0 /* None */) {
    const item = this._map.get(key3);
    if (!item) {
      return void 0;
    }
    if (touch !== 0 /* None */) {
      this.touch(item, touch);
    }
    return item.value;
  }
  set(key3, value2, touch = 0 /* None */) {
    let item = this._map.get(key3);
    if (item) {
      item.value = value2;
      if (touch !== 0 /* None */) {
        this.touch(item, touch);
      }
    } else {
      item = { key: key3, value: value2, next: void 0, previous: void 0 };
      switch (touch) {
        case 0 /* None */:
          this.addItemLast(item);
          break;
        case 1 /* AsOld */:
          this.addItemFirst(item);
          break;
        case 2 /* AsNew */:
          this.addItemLast(item);
          break;
        default:
          this.addItemLast(item);
          break;
      }
      this._map.set(key3, item);
      this._size++;
    }
    return this;
  }
  delete(key3) {
    return !!this.remove(key3);
  }
  remove(key3) {
    const item = this._map.get(key3);
    if (!item) {
      return void 0;
    }
    this._map.delete(key3);
    this.removeItem(item);
    this._size--;
    return item.value;
  }
  shift() {
    if (!this._head && !this._tail) {
      return void 0;
    }
    if (!this._head || !this._tail) {
      throw new Error("Invalid list");
    }
    const item = this._head;
    this._map.delete(item.key);
    this.removeItem(item);
    this._size--;
    return item.value;
  }
  forEach(callbackfn, thisArg) {
    const state = this._state;
    let current = this._head;
    while (current) {
      if (thisArg) {
        callbackfn.bind(thisArg)(current.value, current.key, this);
      } else {
        callbackfn(current.value, current.key, this);
      }
      if (this._state !== state) {
        throw new Error(`LinkedMap got modified during iteration.`);
      }
      current = current.next;
    }
  }
  keys() {
    const map = this;
    const state = this._state;
    let current = this._head;
    const iterator = {
      [Symbol.iterator]() {
        return iterator;
      },
      [Symbol.dispose]() {
      },
      next() {
        if (map._state !== state) {
          throw new Error(`LinkedMap got modified during iteration.`);
        }
        if (current) {
          const result = { value: current.key, done: false };
          current = current.next;
          return result;
        } else {
          return { value: void 0, done: true };
        }
      }
    };
    return iterator;
  }
  values() {
    const map = this;
    const state = this._state;
    let current = this._head;
    const iterator = {
      [Symbol.iterator]() {
        return iterator;
      },
      [Symbol.dispose]() {
      },
      next() {
        if (map._state !== state) {
          throw new Error(`LinkedMap got modified during iteration.`);
        }
        if (current) {
          const result = { value: current.value, done: false };
          current = current.next;
          return result;
        } else {
          return { value: void 0, done: true };
        }
      }
    };
    return iterator;
  }
  entries() {
    const map = this;
    const state = this._state;
    let current = this._head;
    const iterator = {
      [Symbol.iterator]() {
        return iterator;
      },
      [Symbol.dispose]() {
      },
      next() {
        if (map._state !== state) {
          throw new Error(`LinkedMap got modified during iteration.`);
        }
        if (current) {
          const result = { value: [current.key, current.value], done: false };
          current = current.next;
          return result;
        } else {
          return { value: void 0, done: true };
        }
      }
    };
    return iterator;
  }
  [(_a4 = Symbol.toStringTag, Symbol.iterator)]() {
    return this.entries();
  }
  trimOld(newSize) {
    if (newSize >= this.size) {
      return;
    }
    if (newSize === 0) {
      this.clear();
      return;
    }
    let current = this._head;
    let currentSize = this.size;
    while (current && currentSize > newSize) {
      this._map.delete(current.key);
      current = current.next;
      currentSize--;
    }
    this._head = current;
    this._size = currentSize;
    if (current) {
      current.previous = void 0;
    }
    this._state++;
  }
  trimNew(newSize) {
    if (newSize >= this.size) {
      return;
    }
    if (newSize === 0) {
      this.clear();
      return;
    }
    let current = this._tail;
    let currentSize = this.size;
    while (current && currentSize > newSize) {
      this._map.delete(current.key);
      current = current.previous;
      currentSize--;
    }
    this._tail = current;
    this._size = currentSize;
    if (current) {
      current.next = void 0;
    }
    this._state++;
  }
  addItemFirst(item) {
    if (!this._head && !this._tail) {
      this._tail = item;
    } else if (!this._head) {
      throw new Error("Invalid list");
    } else {
      item.next = this._head;
      this._head.previous = item;
    }
    this._head = item;
    this._state++;
  }
  addItemLast(item) {
    if (!this._head && !this._tail) {
      this._head = item;
    } else if (!this._tail) {
      throw new Error("Invalid list");
    } else {
      item.previous = this._tail;
      this._tail.next = item;
    }
    this._tail = item;
    this._state++;
  }
  removeItem(item) {
    if (item === this._head && item === this._tail) {
      this._head = void 0;
      this._tail = void 0;
    } else if (item === this._head) {
      if (!item.next) {
        throw new Error("Invalid list");
      }
      item.next.previous = void 0;
      this._head = item.next;
    } else if (item === this._tail) {
      if (!item.previous) {
        throw new Error("Invalid list");
      }
      item.previous.next = void 0;
      this._tail = item.previous;
    } else {
      const next = item.next;
      const previous = item.previous;
      if (!next || !previous) {
        throw new Error("Invalid list");
      }
      next.previous = previous;
      previous.next = next;
    }
    item.next = void 0;
    item.previous = void 0;
    this._state++;
  }
  touch(item, touch) {
    if (!this._head || !this._tail) {
      throw new Error("Invalid list");
    }
    if (touch !== 1 /* AsOld */ && touch !== 2 /* AsNew */) {
      return;
    }
    if (touch === 1 /* AsOld */) {
      if (item === this._head) {
        return;
      }
      const next = item.next;
      const previous = item.previous;
      if (item === this._tail) {
        previous.next = void 0;
        this._tail = previous;
      } else {
        next.previous = previous;
        previous.next = next;
      }
      item.previous = void 0;
      item.next = this._head;
      this._head.previous = item;
      this._head = item;
      this._state++;
    } else if (touch === 2 /* AsNew */) {
      if (item === this._tail) {
        return;
      }
      const next = item.next;
      const previous = item.previous;
      if (item === this._head) {
        next.previous = void 0;
        this._head = next;
      } else {
        next.previous = previous;
        previous.next = next;
      }
      item.next = void 0;
      item.previous = this._tail;
      this._tail.next = item;
      this._tail = item;
      this._state++;
    }
  }
  toJSON() {
    const data = [];
    this.forEach((value2, key3) => {
      data.push([key3, value2]);
    });
    return data;
  }
  fromJSON(data) {
    this.clear();
    for (const [key3, value2] of data) {
      this.set(key3, value2);
    }
  }
};

var Cache = class extends LinkedMap {
  constructor(limit, ratio = 1) {
    super();
    this._limit = limit;
    this._ratio = Math.min(Math.max(0, ratio), 1);
  }
  get limit() {
    return this._limit;
  }
  set limit(limit) {
    this._limit = limit;
    this.checkTrim();
  }
  get ratio() {
    return this._ratio;
  }
  set ratio(ratio) {
    this._ratio = Math.min(Math.max(0, ratio), 1);
    this.checkTrim();
  }
  get(key3, touch = 2 /* AsNew */) {
    return super.get(key3, touch);
  }
  peek(key3) {
    return super.get(key3, 0 /* None */);
  }
  set(key3, value2) {
    super.set(key3, value2, 2 /* AsNew */);
    return this;
  }
  checkTrim() {
    if (this.size > this._limit) {
      this.trim(Math.round(this._limit * this._ratio));
    }
  }
};

var LRUCache = class extends Cache {
  constructor(limit, ratio = 1) {
    super(limit, ratio);
  }
  trim(newSize) {
    this.trimOld(newSize);
  }
  set(key3, value2) {
    super.set(key3, value2);
    this.checkTrim();
    return this;
  }
};

var MRUCache = class extends Cache {
  constructor(limit, ratio = 1) {
    super(limit, ratio);
  }
  trim(newSize) {
    this.trimNew(newSize);
  }
  set(key3, value2) {
    if (this._limit <= this.size && !this.has(key3)) {
      this.trim(Math.round(this._limit * this._ratio) - 1);
    }
    super.set(key3, value2);
    return this;
  }
};

var CounterSet = class {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  add(value2) {
    this.map.set(value2, (this.map.get(value2) || 0) + 1);
    return this;
  }
  delete(value2) {
    let counter = this.map.get(value2) || 0;
    if (counter === 0) {
      return false;
    }
    counter--;
    if (counter === 0) {
      this.map.delete(value2);
    } else {
      this.map.set(value2, counter);
    }
    return true;
  }
  has(value2) {
    return this.map.has(value2);
  }
};

var BidirectionalMap = class {
  constructor(entries2) {
    this._m1 = /* @__PURE__ */ new Map();
    this._m2 = /* @__PURE__ */ new Map();
    if (entries2) {
      for (const [key3, value2] of entries2) {
        this.set(key3, value2);
      }
    }
  }
  clear() {
    this._m1.clear();
    this._m2.clear();
  }
  set(key3, value2) {
    const previousValue = this._m1.get(key3);
    if (previousValue !== void 0) {
      this._m2.delete(previousValue);
    }
    this._m1.set(key3, value2);
    this._m2.set(value2, key3);
  }
  get(key3) {
    return this._m1.get(key3);
  }
  getKey(value2) {
    return this._m2.get(value2);
  }
  delete(key3) {
    const value2 = this._m1.get(key3);
    if (value2 === void 0) {
      return false;
    }
    this._m1.delete(key3);
    this._m2.delete(value2);
    return true;
  }
  forEach(callbackfn, thisArg) {
    this._m1.forEach((value2, key3) => {
      callbackfn.call(thisArg, value2, key3, this);
    });
  }
  keys() {
    return this._m1.keys();
  }
  values() {
    return this._m1.values();
  }
};

var SetMap = class {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  add(key3, value2) {
    let values = this.map.get(key3);
    if (!values) {
      values = /* @__PURE__ */ new Set();
      this.map.set(key3, values);
    }
    values.add(value2);
  }
  delete(key3, value2) {
    const values = this.map.get(key3);
    if (!values) {
      return;
    }
    values.delete(value2);
    if (values.size === 0) {
      this.map.delete(key3);
    }
  }
  forEach(key3, fn) {
    const values = this.map.get(key3);
    if (!values) {
      return;
    }
    values.forEach(fn);
  }
  get(key3) {
    const values = this.map.get(key3);
    if (!values) {
      return /* @__PURE__ */ new Set();
    }
    return values;
  }
};

function mapsStrictEqualIgnoreOrder(a, b) {
  if (a === b) {
    return true;
  }
  if (a.size !== b.size) {
    return false;
  }
  for (const [key3, value2] of a) {
    if (!b.has(key3) || b.get(key3) !== value2) {
      return false;
    }
  }
  for (const [key3] of b) {
    if (!a.has(key3)) {
      return false;
    }
  }
  return true;
}

var NKeyMap = class {
  constructor() {
    this._data = /* @__PURE__ */ new Map();
  }
  /**
   * Sets a value on the map. Note that unlike a standard `Map`, the first argument is the value.
   * This is because the spread operator is used for the keys and must be last..
   * @param value The value to set.
   * @param keys The keys for the value.
   */
  set(value2, ...keys) {
    let currentMap = this._data;
    for (let i2 = 0; i2 < keys.length - 1; i2++) {
      let nextMap = currentMap.get(keys[i2]);
      if (nextMap === void 0) {
        nextMap = /* @__PURE__ */ new Map();
        currentMap.set(keys[i2], nextMap);
      }
      currentMap = nextMap;
    }
    currentMap.set(keys[keys.length - 1], value2);
  }
  get(...keys) {
    let currentMap = this._data;
    for (let i2 = 0; i2 < keys.length - 1; i2++) {
      const nextMap = currentMap.get(keys[i2]);
      if (nextMap === void 0) {
        return void 0;
      }
      currentMap = nextMap;
    }
    return currentMap.get(keys[keys.length - 1]);
  }
  delete(...keys) {
    const maps = [this._data];
    let currentMap = this._data;
    for (let i2 = 0; i2 < keys.length - 1; i2++) {
      const nextMap = currentMap.get(keys[i2]);
      if (nextMap === void 0) {
        return false;
      }
      currentMap = nextMap;
      maps.push(currentMap);
    }
    const deleted = currentMap.delete(keys[keys.length - 1]);
    for (let i2 = keys.length - 2; deleted && i2 >= 0; i2--) {
      if (maps[i2 + 1].size === 0) {
        maps[i2].delete(keys[i2]);
      }
    }
    return deleted;
  }
  deleteAll(...keys) {
    if (keys.length === 0) {
      const hadData = this._data.size > 0;
      this._data.clear();
      return hadData;
    }
    const maps = [this._data];
    let currentMap = this._data;
    for (let i2 = 0; i2 < keys.length - 1; i2++) {
      const nextMap = currentMap.get(keys[i2]);
      if (nextMap === void 0) {
        return false;
      }
      currentMap = nextMap;
      maps.push(currentMap);
    }
    const deleted = currentMap.delete(keys[keys.length - 1]);
    for (let i2 = keys.length - 2; deleted && i2 >= 0; i2--) {
      if (maps[i2 + 1].size === 0) {
        maps[i2].delete(keys[i2]);
      }
    }
    return deleted;
  }
  clear() {
    this._data.clear();
  }
  *getAll(...keys) {
    let currentMap = this._data;
    for (const key3 of keys) {
      const nextMap = currentMap.get(key3);
      if (nextMap === void 0) {
        return;
      }
      currentMap = nextMap;
    }
    yield* this._values(currentMap);
  }
  *values() {
    yield* this._values(this._data);
  }
  *_values(map) {
    for (const value2 of map.values()) {
      if (value2 instanceof Map) {
        yield* this._values(value2);
      } else {
        yield value2;
      }
    }
  }
  /**
   * Get a textual representation of the map for debugging purposes.
   */
  toString() {
    const printMap = (map, depth) => {
      let result = "";
      for (const [key3, value2] of map) {
        result += `${"  ".repeat(depth)}${key3}: `;
        if (value2 instanceof Map) {
          result += "\n" + printMap(value2, depth + 1);
        } else {
          result += `${value2}
`;
        }
      }
      return result;
    };
    return printMap(this._data, 0);
  }
};
export { getOrSet, isEntries, mapsStrictEqualIgnoreOrder, ResourceMapEntry, _a2, ResourceMap, _a3, ResourceSet, _a4, LinkedMap, Cache, LRUCache, MRUCache, CounterSet, BidirectionalMap, SetMap, NKeyMap };
