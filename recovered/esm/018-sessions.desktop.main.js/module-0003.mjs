// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/collections.ts



// src/vs/base/common/collections.ts
function groupBy(data, groupFn) {
  const result = /* @__PURE__ */ Object.create(null);
  for (const element of data) {
    const key3 = groupFn(element);
    let target = result[key3];
    if (!target) {
      target = result[key3] = [];
    }
    target.push(element);
  }
  return result;
}

function groupByMap(data, groupFn) {
  const result = /* @__PURE__ */ new Map();
  for (const element of data) {
    const key3 = groupFn(element);
    let target = result.get(key3);
    if (!target) {
      target = [];
      result.set(key3, target);
    }
    target.push(element);
  }
  return result;
}

function diffSets(before, after2) {
  const removed = [];
  const added = [];
  for (const element of before) {
    if (!after2.has(element)) {
      removed.push(element);
    }
  }
  for (const element of after2) {
    if (!before.has(element)) {
      added.push(element);
    }
  }
  return { removed, added };
}

function equalSets(a, b) {
  if (a === b) {
    return true;
  }
  if (a.size !== b.size) {
    return false;
  }
  for (const element of a) {
    if (!b.has(element)) {
      return false;
    }
  }
  return true;
}

function diffMaps(before, after2) {
  const removed = [];
  const added = [];
  for (const [index2, value2] of before) {
    if (!after2.has(index2)) {
      removed.push(value2);
    }
  }
  for (const [index2, value2] of after2) {
    if (!before.has(index2)) {
      added.push(value2);
    }
  }
  return { removed, added };
}

function intersection(setA, setB) {
  const result = /* @__PURE__ */ new Set();
  for (const elem of setB) {
    if (setA.has(elem)) {
      result.add(elem);
    }
  }
  return result;
}

var _a, _b;

var SetWithKey = class {
  constructor(values, toKey3) {
    this.toKey = toKey3;
    this._map = /* @__PURE__ */ new Map();
    this[_a] = "SetWithKey";
    for (const value2 of values) {
      this.add(value2);
    }
  }
  get size() {
    return this._map.size;
  }
  add(value2) {
    const key3 = this.toKey(value2);
    this._map.set(key3, value2);
    return this;
  }
  delete(value2) {
    return this._map.delete(this.toKey(value2));
  }
  has(value2) {
    return this._map.has(this.toKey(value2));
  }
  *entries() {
    for (const entry of this._map.values()) {
      yield [entry, entry];
    }
  }
  keys() {
    return this.values();
  }
  *values() {
    for (const entry of this._map.values()) {
      yield entry;
    }
  }
  clear() {
    this._map.clear();
  }
  forEach(callbackfn, thisArg) {
    this._map.forEach((entry) => callbackfn.call(thisArg, entry, entry, this));
  }
  [(_b = Symbol.iterator, _a = Symbol.toStringTag, _b)]() {
    return this.values();
  }
};
export { groupBy, groupByMap, diffSets, equalSets, diffMaps, intersection, _a, _b, SetWithKey };
