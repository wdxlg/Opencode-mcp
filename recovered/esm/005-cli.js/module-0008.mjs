// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/common/arraysFind.ts
import { __esm } from "./module-0000.mjs";


// src/vs/base/common/arraysFind.ts
function findLastIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
  let i = startIdx;
  let j = endIdxEx;
  while (i < j) {
    const k = Math.floor((i + j) / 2);
    if (predicate(array[k])) {
      i = k + 1;
    } else {
      j = k;
    }
  }
  return i - 1;
}

var MonotonousArray;

var init_arraysFind = __esm({
  "src/vs/base/common/arraysFind.ts"() {
    MonotonousArray = class _MonotonousArray {
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
  }
});
export { findLastIdxMonotonous, MonotonousArray, init_arraysFind };
