// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/arraysFind.ts



// src/vs/base/common/arraysFind.ts
function findLast(array3, predicate, fromIndex = array3.length - 1) {
  const idx = findLastIdx(array3, predicate, fromIndex);
  if (idx === -1) {
    return void 0;
  }
  return array3[idx];
}

function findLastIdx(array3, predicate, fromIndex = array3.length - 1) {
  for (let i2 = fromIndex; i2 >= 0; i2--) {
    const element = array3[i2];
    if (predicate(element, i2)) {
      return i2;
    }
  }
  return -1;
}

function findFirst(array3, predicate, fromIndex = 0) {
  const idx = findFirstIdx(array3, predicate, fromIndex);
  if (idx === -1) {
    return void 0;
  }
  return array3[idx];
}

function findFirstIdx(array3, predicate, fromIndex = 0) {
  for (let i2 = fromIndex; i2 < array3.length; i2++) {
    const element = array3[i2];
    if (predicate(element, i2)) {
      return i2;
    }
  }
  return -1;
}

function findLastMonotonous(array3, predicate) {
  const idx = findLastIdxMonotonous(array3, predicate);
  return idx === -1 ? void 0 : array3[idx];
}

function findLastIdxMonotonous(array3, predicate, startIdx = 0, endIdxEx = array3.length) {
  let i2 = startIdx;
  let j = endIdxEx;
  while (i2 < j) {
    const k = Math.floor((i2 + j) / 2);
    if (predicate(array3[k])) {
      i2 = k + 1;
    } else {
      j = k;
    }
  }
  return i2 - 1;
}

function findFirstMonotonous(array3, predicate) {
  const idx = findFirstIdxMonotonousOrArrLen(array3, predicate);
  return idx === array3.length ? void 0 : array3[idx];
}

function findFirstIdxMonotonousOrArrLen(array3, predicate, startIdx = 0, endIdxEx = array3.length) {
  let i2 = startIdx;
  let j = endIdxEx;
  while (i2 < j) {
    const k = Math.floor((i2 + j) / 2);
    if (predicate(array3[k])) {
      j = k;
    } else {
      i2 = k + 1;
    }
  }
  return i2;
}

var MonotonousArray = class _MonotonousArray {
  constructor(_array) {
    this._array = _array;
    this._findLastMonotonousLastIdx = 0;
  }
  static {
    this.assertInvariants = false;
  }
  /**
   * The predicate must be monotonous, i.e. `arr.map(predicate)` must be like `[true, ..., true, false, ..., false]`!
   * For subsequent calls, current predicate must be weaker than (or equal to) the previous predicate, i.e. more entries must be `true`.
   */
  findLastMonotonous(predicate) {
    if (_MonotonousArray.assertInvariants) {
      if (this._prevFindLastPredicate) {
        for (const item of this._array) {
          if (this._prevFindLastPredicate(item) && !predicate(item)) {
            throw new Error("MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.");
          }
        }
      }
      this._prevFindLastPredicate = predicate;
    }
    const idx = findLastIdxMonotonous(this._array, predicate, this._findLastMonotonousLastIdx);
    this._findLastMonotonousLastIdx = idx + 1;
    return idx === -1 ? void 0 : this._array[idx];
  }
};

function findFirstMax(array3, comparator) {
  if (array3.length === 0) {
    return void 0;
  }
  let max = array3[0];
  for (let i2 = 1; i2 < array3.length; i2++) {
    const item = array3[i2];
    if (comparator(item, max) > 0) {
      max = item;
    }
  }
  return max;
}

function findLastMax(array3, comparator) {
  if (array3.length === 0) {
    return void 0;
  }
  let max = array3[0];
  for (let i2 = 1; i2 < array3.length; i2++) {
    const item = array3[i2];
    if (comparator(item, max) >= 0) {
      max = item;
    }
  }
  return max;
}

function findFirstMin(array3, comparator) {
  return findFirstMax(array3, (a, b) => -comparator(a, b));
}

function findMaxIdx(array3, comparator) {
  if (array3.length === 0) {
    return -1;
  }
  let maxIdx = 0;
  for (let i2 = 1; i2 < array3.length; i2++) {
    const item = array3[i2];
    if (comparator(item, array3[maxIdx]) > 0) {
      maxIdx = i2;
    }
  }
  return maxIdx;
}

function mapFindFirst(items, mapFn) {
  for (const value2 of items) {
    const mapped = mapFn(value2);
    if (mapped !== void 0) {
      return mapped;
    }
  }
  return void 0;
}
export { findLast, findLastIdx, findFirst, findFirstIdx, findLastMonotonous, findLastIdxMonotonous, findFirstMonotonous, findFirstIdxMonotonousOrArrLen, findFirstMax, findLastMax, findFirstMin, findMaxIdx, mapFindFirst, MonotonousArray };
