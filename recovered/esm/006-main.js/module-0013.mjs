// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/arrays.ts
import { findFirstIdxMonotonousOrArrLen, init_arraysFind } from "./module-0012.mjs";
import { __esm } from "./module-0000.mjs";
import { init_errors } from "./module-0010.mjs";


// src/vs/base/common/arrays.ts
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
  for (let i = 0, len = one.length; i < len; i++) {
    if (!itemEquals(one[i], other[i])) {
      return false;
    }
  }
  return true;
}

function binarySearch(array, key, comparator) {
  return binarySearch2(array.length, (i) => comparator(array[i], key));
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

function quickSelect(nth, data, compare4) {
  nth = nth | 0;
  if (nth >= data.length) {
    throw new TypeError("invalid index");
  }
  const pivotValue = data[Math.floor(data.length * Math.random())];
  const lower = [];
  const higher = [];
  const pivots = [];
  for (const value of data) {
    const val = compare4(value, pivotValue);
    if (val < 0) {
      lower.push(value);
    } else if (val > 0) {
      higher.push(value);
    } else {
      pivots.push(value);
    }
  }
  if (nth < lower.length) {
    return quickSelect(nth, lower, compare4);
  } else if (nth < lower.length + pivots.length) {
    return pivots[0];
  } else {
    return quickSelect(nth - (lower.length + pivots.length), higher, compare4);
  }
}

function top(array, compare4, n) {
  if (n === 0) {
    return [];
  }
  const result = array.slice(0, n).sort(compare4);
  topStep(array, compare4, result, n, array.length);
  return result;
}

function topStep(array, compare4, result, i, m) {
  for (const n = result.length; i < m; i++) {
    const element = array[i];
    if (compare4(element, result[n - 1]) < 0) {
      result.pop();
      const j = findFirstIdxMonotonousOrArrLen(result, (e) => compare4(element, e) < 0);
      result.splice(j, 0, element);
    }
  }
}

function coalesce(array) {
  return array.filter((e) => !!e);
}

function distinct(array, keyFn = (value) => value) {
  const seen = /* @__PURE__ */ new Set();
  return array.filter((element) => {
    const key = keyFn(element);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function insert(array, element) {
  array.push(element);
  return () => remove(array, element);
}

function remove(array, element) {
  const index = array.indexOf(element);
  if (index > -1) {
    array.splice(index, 1);
    return element;
  }
  return void 0;
}

function shuffle(array, _seed) {
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
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function compareBy(selector, comparator) {
  return (a, b) => comparator(selector(a), selector(b));
}

var CompareResult, numberComparator, CallbackIterable;

var init_arrays = __esm({
  "src/vs/base/common/arrays.ts"() {
    init_arraysFind();
    init_errors();
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
    numberComparator = (a, b) => a - b;
    CallbackIterable = class _CallbackIterable {
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
  }
});
export { equals, binarySearch, binarySearch2, quickSelect, top, topStep, coalesce, distinct, insert, remove, shuffle, getRandomElement, compareBy, CompareResult, numberComparator, CallbackIterable, init_arrays };
