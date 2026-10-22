// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/prefixSumComputer.ts
import { toUint32 } from "./module-0029.mjs";
import { arrayInsert } from "./module-0007.mjs";


// src/vs/editor/common/model/prefixSumComputer.ts
var PrefixSumComputer = class {
  constructor(values) {
    this.values = values;
    this.prefixSum = new Uint32Array(values.length);
    this.prefixSumValidIndex = new Int32Array(1);
    this.prefixSumValidIndex[0] = -1;
  }
  getCount() {
    return this.values.length;
  }
  insertValues(insertIndex, insertValues) {
    insertIndex = toUint32(insertIndex);
    const oldValues = this.values;
    const oldPrefixSum = this.prefixSum;
    const insertValuesLen = insertValues.length;
    if (insertValuesLen === 0) {
      return false;
    }
    this.values = new Uint32Array(oldValues.length + insertValuesLen);
    this.values.set(oldValues.subarray(0, insertIndex), 0);
    this.values.set(oldValues.subarray(insertIndex), insertIndex + insertValuesLen);
    this.values.set(insertValues, insertIndex);
    if (insertIndex - 1 < this.prefixSumValidIndex[0]) {
      this.prefixSumValidIndex[0] = insertIndex - 1;
    }
    this.prefixSum = new Uint32Array(this.values.length);
    if (this.prefixSumValidIndex[0] >= 0) {
      this.prefixSum.set(oldPrefixSum.subarray(0, this.prefixSumValidIndex[0] + 1));
    }
    return true;
  }
  setValue(index2, value2) {
    index2 = toUint32(index2);
    value2 = toUint32(value2);
    if (this.values[index2] === value2) {
      return false;
    }
    this.values[index2] = value2;
    if (index2 - 1 < this.prefixSumValidIndex[0]) {
      this.prefixSumValidIndex[0] = index2 - 1;
    }
    return true;
  }
  removeValues(startIndex, count2) {
    startIndex = toUint32(startIndex);
    count2 = toUint32(count2);
    const oldValues = this.values;
    const oldPrefixSum = this.prefixSum;
    if (startIndex >= oldValues.length) {
      return false;
    }
    const maxCount = oldValues.length - startIndex;
    if (count2 >= maxCount) {
      count2 = maxCount;
    }
    if (count2 === 0) {
      return false;
    }
    this.values = new Uint32Array(oldValues.length - count2);
    this.values.set(oldValues.subarray(0, startIndex), 0);
    this.values.set(oldValues.subarray(startIndex + count2), startIndex);
    this.prefixSum = new Uint32Array(this.values.length);
    if (startIndex - 1 < this.prefixSumValidIndex[0]) {
      this.prefixSumValidIndex[0] = startIndex - 1;
    }
    if (this.prefixSumValidIndex[0] >= 0) {
      this.prefixSum.set(oldPrefixSum.subarray(0, this.prefixSumValidIndex[0] + 1));
    }
    return true;
  }
  getTotalSum() {
    if (this.values.length === 0) {
      return 0;
    }
    return this._getPrefixSum(this.values.length - 1);
  }
  /**
   * Returns the sum of the first `index + 1` many items.
   * @returns `SUM(0 <= j <= index, values[j])`.
   */
  getPrefixSum(index2) {
    if (index2 < 0) {
      return 0;
    }
    index2 = toUint32(index2);
    return this._getPrefixSum(index2);
  }
  _getPrefixSum(index2) {
    if (index2 <= this.prefixSumValidIndex[0]) {
      return this.prefixSum[index2];
    }
    let startIndex = this.prefixSumValidIndex[0] + 1;
    if (startIndex === 0) {
      this.prefixSum[0] = this.values[0];
      startIndex++;
    }
    if (index2 >= this.values.length) {
      index2 = this.values.length - 1;
    }
    for (let i2 = startIndex; i2 <= index2; i2++) {
      this.prefixSum[i2] = this.prefixSum[i2 - 1] + this.values[i2];
    }
    this.prefixSumValidIndex[0] = Math.max(this.prefixSumValidIndex[0], index2);
    return this.prefixSum[index2];
  }
  getIndexOf(sum2) {
    sum2 = Math.floor(sum2);
    this.getTotalSum();
    let low = 0;
    let high = this.values.length - 1;
    let mid = 0;
    let midStop = 0;
    let midStart = 0;
    while (low <= high) {
      mid = low + (high - low) / 2 | 0;
      midStop = this.prefixSum[mid];
      midStart = midStop - this.values[mid];
      if (sum2 < midStart) {
        high = mid - 1;
      } else if (sum2 >= midStop) {
        low = mid + 1;
      } else {
        break;
      }
    }
    return new PrefixSumIndexOfResult(mid, sum2 - midStart);
  }
};

var ConstantTimePrefixSumComputer = class {
  constructor(values) {
    this._values = values;
    this._isValid = false;
    this._validEndIndex = -1;
    this._prefixSum = [];
    this._indexBySum = [];
  }
  /**
   * @returns SUM(0 <= j < values.length, values[j])
   */
  getTotalSum() {
    this._ensureValid();
    return this._indexBySum.length;
  }
  /**
   * Returns the sum of the first `count` many items.
   * @returns `SUM(0 <= j < count, values[j])`.
   */
  getPrefixSum(count2) {
    this._ensureValid();
    if (count2 === 0) {
      return 0;
    }
    return this._prefixSum[count2 - 1];
  }
  /**
   * @returns `result`, such that `getPrefixSum(result.index) + result.remainder = sum`
   */
  getIndexOf(sum2) {
    this._ensureValid();
    const idx = this._indexBySum[sum2];
    if (idx === void 0) {
      const lastIdx = Math.max(0, this._values.length - 1);
      const lastPrefixSum = lastIdx > 0 ? this._prefixSum[lastIdx - 1] : 0;
      return new PrefixSumIndexOfResult(lastIdx, sum2 - lastPrefixSum);
    }
    const viewLinesAbove = idx > 0 ? this._prefixSum[idx - 1] : 0;
    return new PrefixSumIndexOfResult(idx, sum2 - viewLinesAbove);
  }
  removeValues(start, deleteCount) {
    this._values.splice(start, deleteCount);
    this._invalidate(start);
  }
  insertValues(insertIndex, insertArr) {
    this._values = arrayInsert(this._values, insertIndex, insertArr);
    this._invalidate(insertIndex);
  }
  _invalidate(index2) {
    this._isValid = false;
    this._validEndIndex = Math.min(this._validEndIndex, index2 - 1);
  }
  _ensureValid() {
    if (this._isValid) {
      return;
    }
    for (let i2 = this._validEndIndex + 1, len = this._values.length; i2 < len; i2++) {
      const value2 = this._values[i2];
      const sumAbove = i2 > 0 ? this._prefixSum[i2 - 1] : 0;
      this._prefixSum[i2] = sumAbove + value2;
      for (let j = 0; j < value2; j++) {
        this._indexBySum[sumAbove + j] = i2;
      }
    }
    this._prefixSum.length = this._values.length;
    this._indexBySum.length = this._values.length > 0 ? this._prefixSum[this._values.length - 1] : 0;
    this._isValid = true;
    this._validEndIndex = this._values.length - 1;
  }
  setValue(index2, value2) {
    if (this._values[index2] === value2) {
      return;
    }
    this._values[index2] = value2;
    this._invalidate(index2);
  }
};

var PrefixSumIndexOfResult = class {
  constructor(index2, remainder) {
    this.index = index2;
    this.remainder = remainder;
    this._prefixSumIndexOfResultBrand = void 0;
    this.index = index2;
    this.remainder = remainder;
  }
};
export { PrefixSumComputer, ConstantTimePrefixSumComputer, PrefixSumIndexOfResult };
