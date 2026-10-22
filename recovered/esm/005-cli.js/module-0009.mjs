// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/common/arrays.ts
import { __esm } from "./module-0000.mjs";
import { init_arraysFind } from "./module-0008.mjs";
import { init_errors } from "./module-0006.mjs";


// src/vs/base/common/arrays.ts
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
        let first = true;
        this.iterate((item) => {
          if (first || CompareResult.isGreaterThan(comparator(item, result))) {
            first = false;
            result = item;
          }
          return true;
        });
        return result;
      }
    };
  }
});
export { shuffle, compareBy, CompareResult, numberComparator, CallbackIterable, init_arrays };
