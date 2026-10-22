// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/arrays.ts
import { findFirstIdxMonotonousOrArrLen } from "./module-0006.mjs";


// src/vs/base/common/arrays.ts
function tail(arr) {
  if (arr.length === 0) {
    throw new Error("Invalid tail call");
  }
  return [arr.slice(0, arr.length - 1), arr[arr.length - 1]];
}

function equals(one, other, itemEquals = (a, b) => a === b) {
  if (one === other) {
    return true;
  }
  if (!one || !other) {
    return false;
  }
  if (one.length !== other.length) {
    return false;
  }
  for (let i2 = 0, len = one.length; i2 < len; i2++) {
    if (!itemEquals(one[i2], other[i2])) {
      return false;
    }
  }
  return true;
}

function removeFastWithoutKeepingOrder(array3, index2) {
  const last = array3.length - 1;
  if (index2 < last) {
    array3[index2] = array3[last];
  }
  array3.pop();
}

function binarySearch(array3, key3, comparator) {
  return binarySearch2(array3.length, (i2) => comparator(array3[i2], key3));
}

function binarySearch2(length, compareToKey) {
  let low = 0, high = length - 1;
  while (low <= high) {
    const mid = (low + high) / 2 | 0;
    const comp = compareToKey(mid);
    if (comp < 0) {
      low = mid + 1;
    } else if (comp > 0) {
      high = mid - 1;
    } else {
      return mid;
    }
  }
  return -(low + 1);
}

function quickSelect(nth, data, compare6) {
  nth = nth | 0;
  if (nth >= data.length) {
    throw new TypeError("invalid index");
  }
  const pivotValue = data[Math.floor(data.length * Math.random())];
  const lower = [];
  const higher = [];
  const pivots = [];
  for (const value2 of data) {
    const val = compare6(value2, pivotValue);
    if (val < 0) {
      lower.push(value2);
    } else if (val > 0) {
      higher.push(value2);
    } else {
      pivots.push(value2);
    }
  }
  if (nth < lower.length) {
    return quickSelect(nth, lower, compare6);
  } else if (nth < lower.length + pivots.length) {
    return pivots[0];
  } else {
    return quickSelect(nth - (lower.length + pivots.length), higher, compare6);
  }
}

function groupBy2(data, compare6) {
  const result = [];
  let currentGroup = void 0;
  for (const element of data.slice(0).sort(compare6)) {
    if (!currentGroup || compare6(currentGroup[0], element) !== 0) {
      currentGroup = [element];
      result.push(currentGroup);
    } else {
      currentGroup.push(element);
    }
  }
  return result;
}

function* groupAdjacentBy(items, shouldBeGrouped) {
  let currentGroup;
  let last;
  for (const item of items) {
    if (last !== void 0 && shouldBeGrouped(last, item)) {
      currentGroup.push(item);
    } else {
      if (currentGroup) {
        yield currentGroup;
      }
      currentGroup = [item];
    }
    last = item;
  }
  if (currentGroup) {
    yield currentGroup;
  }
}

function forEachAdjacent(arr, f) {
  for (let i2 = 0; i2 <= arr.length; i2++) {
    f(i2 === 0 ? void 0 : arr[i2 - 1], i2 === arr.length ? void 0 : arr[i2]);
  }
}

function forEachWithNeighbors(arr, f) {
  for (let i2 = 0; i2 < arr.length; i2++) {
    f(i2 === 0 ? void 0 : arr[i2 - 1], arr[i2], i2 + 1 === arr.length ? void 0 : arr[i2 + 1]);
  }
}

function concatArrays(...arrays4) {
  return [].concat(...arrays4);
}

function sortedDiff(before, after2, compare6) {
  const result = [];
  function pushSplice(start, deleteCount, toInsert) {
    if (deleteCount === 0 && toInsert.length === 0) {
      return;
    }
    const latest = result[result.length - 1];
    if (latest && latest.start + latest.deleteCount === start) {
      latest.deleteCount += deleteCount;
      latest.toInsert.push(...toInsert);
    } else {
      result.push({ start, deleteCount, toInsert });
    }
  }
  let beforeIdx = 0;
  let afterIdx = 0;
  while (true) {
    if (beforeIdx === before.length) {
      pushSplice(beforeIdx, 0, after2.slice(afterIdx));
      break;
    }
    if (afterIdx === after2.length) {
      pushSplice(beforeIdx, before.length - beforeIdx, []);
      break;
    }
    const beforeElement = before[beforeIdx];
    const afterElement = after2[afterIdx];
    const n2 = compare6(beforeElement, afterElement);
    if (n2 === 0) {
      beforeIdx += 1;
      afterIdx += 1;
    } else if (n2 < 0) {
      pushSplice(beforeIdx, 1, []);
      beforeIdx += 1;
    } else if (n2 > 0) {
      pushSplice(beforeIdx, 0, [afterElement]);
      afterIdx += 1;
    }
  }
  return result;
}

function delta(before, after2, compare6) {
  const splices = sortedDiff(before, after2, compare6);
  const removed = [];
  const added = [];
  for (const splice3 of splices) {
    removed.push(...before.slice(splice3.start, splice3.start + splice3.deleteCount));
    added.push(...splice3.toInsert);
  }
  return { removed, added };
}

function top(array3, compare6, n2) {
  if (n2 === 0) {
    return [];
  }
  const result = array3.slice(0, n2).sort(compare6);
  topStep(array3, compare6, result, n2, array3.length);
  return result;
}

function topStep(array3, compare6, result, i2, m) {
  for (const n2 = result.length; i2 < m; i2++) {
    const element = array3[i2];
    if (compare6(element, result[n2 - 1]) < 0) {
      result.pop();
      const j = findFirstIdxMonotonousOrArrLen(result, (e) => compare6(element, e) < 0);
      result.splice(j, 0, element);
    }
  }
}

function coalesce(array3) {
  return array3.filter((e) => !!e);
}

function coalesceInPlace(array3) {
  let to = 0;
  for (let i2 = 0; i2 < array3.length; i2++) {
    if (!!array3[i2]) {
      array3[to] = array3[i2];
      to += 1;
    }
  }
  array3.length = to;
}

function move(array3, from, to) {
  array3.splice(to, 0, array3.splice(from, 1)[0]);
}

function isFalsyOrEmpty(obj) {
  return !Array.isArray(obj) || obj.length === 0;
}

function isNonEmptyArray(obj) {
  return Array.isArray(obj) && obj.length > 0;
}

function distinct(array3, keyFn = (value2) => value2) {
  const seen = /* @__PURE__ */ new Set();
  return array3.filter((element) => {
    const key3 = keyFn(element);
    if (seen.has(key3)) {
      return false;
    }
    seen.add(key3);
    return true;
  });
}

function uniqueFilter(keyFn) {
  const seen = /* @__PURE__ */ new Set();
  return (element) => {
    const key3 = keyFn(element);
    if (seen.has(key3)) {
      return false;
    }
    seen.add(key3);
    return true;
  };
}

function commonPrefixLength(one, other, equals5 = (a, b) => a === b) {
  let result = 0;
  for (let i2 = 0, len = Math.min(one.length, other.length); i2 < len && equals5(one[i2], other[i2]); i2++) {
    result++;
  }
  return result;
}

function range(arg, to) {
  let from = typeof to === "number" ? arg : 0;
  if (typeof to === "number") {
    from = arg;
  } else {
    from = 0;
    to = arg;
  }
  const result = [];
  if (from <= to) {
    for (let i2 = from; i2 < to; i2++) {
      result.push(i2);
    }
  } else {
    for (let i2 = from; i2 > to; i2--) {
      result.push(i2);
    }
  }
  return result;
}

function index(array3, indexer, mapper) {
  return array3.reduce((r2, t2) => {
    r2[indexer(t2)] = mapper ? mapper(t2) : t2;
    return r2;
  }, /* @__PURE__ */ Object.create(null));
}

function insert(array3, element) {
  array3.push(element);
  return () => remove(array3, element);
}

function remove(array3, element) {
  const index2 = array3.indexOf(element);
  if (index2 > -1) {
    array3.splice(index2, 1);
    return element;
  }
  return void 0;
}

function arrayInsert(target, insertIndex, insertArr) {
  const before = target.slice(0, insertIndex);
  const after2 = target.slice(insertIndex);
  return before.concat(insertArr, after2);
}

function shuffle(array3, _seed) {
  let rand;
  if (typeof _seed === "number") {
    let seed = _seed;
    rand = () => {
      const x = Math.sin(seed++) * 179426549;
      return x - Math.floor(x);
    };
  } else {
    rand = Math.random;
  }
  for (let i2 = array3.length - 1; i2 > 0; i2 -= 1) {
    const j = Math.floor(rand() * (i2 + 1));
    const temp = array3[i2];
    array3[i2] = array3[j];
    array3[j] = temp;
  }
}

function pushToStart(arr, value2) {
  const index2 = arr.indexOf(value2);
  if (index2 > -1) {
    arr.splice(index2, 1);
    arr.unshift(value2);
  }
}

function pushToEnd(arr, value2) {
  const index2 = arr.indexOf(value2);
  if (index2 > -1) {
    arr.splice(index2, 1);
    arr.push(value2);
  }
}

function pushMany(arr, items) {
  for (const item of items) {
    arr.push(item);
  }
}

function mapArrayOrNot(items, fn) {
  return Array.isArray(items) ? items.map(fn) : fn(items);
}

function mapFilter(array3, fn) {
  const result = [];
  for (const item of array3) {
    const mapped = fn(item);
    if (mapped !== void 0) {
      result.push(mapped);
    }
  }
  return result;
}

function withoutDuplicates(array3) {
  const s = new Set(array3);
  return Array.from(s);
}

function asArray(x) {
  return Array.isArray(x) ? x : [x];
}

function insertInto(array3, start, newItems) {
  const startIdx = getActualStartIndex(array3, start);
  const originalLength = array3.length;
  const newItemsLength = newItems.length;
  array3.length = originalLength + newItemsLength;
  for (let i2 = originalLength - 1; i2 >= startIdx; i2--) {
    array3[i2 + newItemsLength] = array3[i2];
  }
  for (let i2 = 0; i2 < newItemsLength; i2++) {
    array3[i2 + startIdx] = newItems[i2];
  }
}

function splice(array3, start, deleteCount, newItems) {
  const index2 = getActualStartIndex(array3, start);
  let result = array3.splice(index2, deleteCount);
  if (result === void 0) {
    result = [];
  }
  insertInto(array3, index2, newItems);
  return result;
}

function getActualStartIndex(array3, start) {
  return start < 0 ? Math.max(start + array3.length, 0) : Math.min(start, array3.length);
}

var CompareResult;

((CompareResult2) => {
  function isLessThan(result) {
    return result < 0;
  }
  CompareResult2.isLessThan = isLessThan;
  function isLessThanOrEqual(result) {
    return result <= 0;
  }
  CompareResult2.isLessThanOrEqual = isLessThanOrEqual;
  function isGreaterThan(result) {
    return result > 0;
  }
  CompareResult2.isGreaterThan = isGreaterThan;
  function isNeitherLessOrGreaterThan(result) {
    return result === 0;
  }
  CompareResult2.isNeitherLessOrGreaterThan = isNeitherLessOrGreaterThan;
  CompareResult2.greaterThan = 1;
  CompareResult2.lessThan = -1;
  CompareResult2.neitherLessOrGreaterThan = 0;
})(CompareResult || (CompareResult = {}));

function compareBy(selector, comparator) {
  return (a, b) => comparator(selector(a), selector(b));
}

function tieBreakComparators(...comparators) {
  return (item1, item2) => {
    for (const comparator of comparators) {
      const result = comparator(item1, item2);
      if (!CompareResult.isNeitherLessOrGreaterThan(result)) {
        return result;
      }
    }
    return CompareResult.neitherLessOrGreaterThan;
  };
}

var numberComparator = (a, b) => a - b;

var booleanComparator = (a, b) => numberComparator(a ? 1 : 0, b ? 1 : 0);

function reverseOrder(comparator) {
  return (a, b) => -comparator(a, b);
}

function compareUndefinedSmallest(comparator) {
  return (a, b) => {
    if (a === void 0) {
      return b === void 0 ? CompareResult.neitherLessOrGreaterThan : CompareResult.lessThan;
    } else if (b === void 0) {
      return CompareResult.greaterThan;
    }
    return comparator(a, b);
  };
}

var ArrayQueue = class {
  /**
   * Constructs a queue that is backed by the given array. Runtime is O(1).
  */
  constructor(items) {
    this.firstIdx = 0;
    this.items = items;
    this.lastIdx = this.items.length - 1;
  }
  get length() {
    return this.lastIdx - this.firstIdx + 1;
  }
  /**
   * Consumes elements from the beginning of the queue as long as the predicate returns true.
   * If no elements were consumed, `null` is returned. Has a runtime of O(result.length).
  */
  takeWhile(predicate) {
    let startIdx = this.firstIdx;
    while (startIdx <= this.lastIdx && predicate(this.items[startIdx])) {
      startIdx++;
    }
    const result = startIdx === this.firstIdx ? null : this.items.slice(this.firstIdx, startIdx);
    this.firstIdx = startIdx;
    return result;
  }
  /**
   * Consumes elements from the end of the queue as long as the predicate returns true.
   * If no elements were consumed, `null` is returned.
   * The result has the same order as the underlying array!
  */
  takeFromEndWhile(predicate) {
    let endIdx = this.lastIdx;
    while (endIdx >= this.firstIdx && predicate(this.items[endIdx])) {
      endIdx--;
    }
    const result = endIdx === this.lastIdx ? null : this.items.slice(endIdx + 1, this.lastIdx + 1);
    this.lastIdx = endIdx;
    return result;
  }
  peek() {
    if (this.length === 0) {
      return void 0;
    }
    return this.items[this.firstIdx];
  }
  peekLast() {
    if (this.length === 0) {
      return void 0;
    }
    return this.items[this.lastIdx];
  }
  dequeue() {
    const result = this.items[this.firstIdx];
    this.firstIdx++;
    return result;
  }
  removeLast() {
    const result = this.items[this.lastIdx];
    this.lastIdx--;
    return result;
  }
  takeCount(count2) {
    const result = this.items.slice(this.firstIdx, this.firstIdx + count2);
    this.firstIdx += count2;
    return result;
  }
};

var CallbackIterable = class _CallbackIterable {
  constructor(iterate) {
    this.iterate = iterate;
  }
  static {
    this.empty = new _CallbackIterable((_callback) => {
    });
  }
  forEach(handler) {
    this.iterate((item) => {
      handler(item);
      return true;
    });
  }
  toArray() {
    const result = [];
    this.iterate((item) => {
      result.push(item);
      return true;
    });
    return result;
  }
  filter(predicate) {
    return new _CallbackIterable((cb) => this.iterate((item) => predicate(item) ? cb(item) : true));
  }
  map(mapFn) {
    return new _CallbackIterable((cb) => this.iterate((item) => cb(mapFn(item))));
  }
  some(predicate) {
    let result = false;
    this.iterate((item) => {
      result = predicate(item);
      return !result;
    });
    return result;
  }
  findFirst(predicate) {
    let result;
    this.iterate((item) => {
      if (predicate(item)) {
        result = item;
        return false;
      }
      return true;
    });
    return result;
  }
  findLast(predicate) {
    let result;
    this.iterate((item) => {
      if (predicate(item)) {
        result = item;
      }
      return true;
    });
    return result;
  }
  findLastMaxBy(comparator) {
    let result;
    let first2 = true;
    this.iterate((item) => {
      if (first2 || CompareResult.isGreaterThan(comparator(item, result))) {
        first2 = false;
        result = item;
      }
      return true;
    });
    return result;
  }
};

var Permutation = class _Permutation {
  constructor(_indexMap) {
    this._indexMap = _indexMap;
  }
  /**
   * Returns a permutation that sorts the given array according to the given compare function.
   */
  static createSortPermutation(arr, compareFn) {
    const sortIndices = Array.from(arr.keys()).sort((index1, index2) => compareFn(arr[index1], arr[index2]));
    return new _Permutation(sortIndices);
  }
  /**
   * Returns a new array with the elements of the given array re-arranged according to this permutation.
   */
  apply(arr) {
    return arr.map((_, index2) => arr[this._indexMap[index2]]);
  }
  /**
   * Returns a new permutation that undoes the re-arrangement of this permutation.
  */
  inverse() {
    const inverseIndexMap = this._indexMap.slice();
    for (let i2 = 0; i2 < this._indexMap.length; i2++) {
      inverseIndexMap[this._indexMap[i2]] = i2;
    }
    return new _Permutation(inverseIndexMap);
  }
};

async function findAsync(array3, predicate) {
  const results = await Promise.all(array3.map(
    async (element, index2) => ({ element, ok: await predicate(element, index2) })
  ));
  return results.find((r2) => r2.ok)?.element;
}

function sum(array3) {
  return array3.reduce((acc, value2) => acc + value2, 0);
}

function sumBy(array3, selector) {
  return array3.reduce((acc, value2) => acc + selector(value2), 0);
}
export { tail, equals, removeFastWithoutKeepingOrder, binarySearch, binarySearch2, quickSelect, groupBy2, groupAdjacentBy, forEachAdjacent, forEachWithNeighbors, concatArrays, sortedDiff, delta, top, topStep, coalesce, coalesceInPlace, move, isFalsyOrEmpty, isNonEmptyArray, distinct, uniqueFilter, commonPrefixLength, range, index, insert, remove, arrayInsert, shuffle, pushToStart, pushToEnd, pushMany, mapArrayOrNot, mapFilter, withoutDuplicates, asArray, insertInto, splice, getActualStartIndex, compareBy, tieBreakComparators, reverseOrder, compareUndefinedSmallest, findAsync, sum, sumBy, CompareResult, numberComparator, booleanComparator, ArrayQueue, CallbackIterable, Permutation };
