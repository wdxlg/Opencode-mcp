// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/folding/browser/foldingRanges.ts



// src/vs/editor/contrib/folding/browser/foldingRanges.ts
var foldSourceAbbr = {
  [0 /* provider */]: " ",
  [1 /* userDefined */]: "u",
  [2 /* recovered */]: "r"
};

var MAX_FOLDING_REGIONS = 65535;

var MAX_LINE_NUMBER = 16777215;

var MASK_INDENT = 4278190080;

var BitField = class {
  constructor(size3) {
    const numWords = Math.ceil(size3 / 32);
    this._states = new Uint32Array(numWords);
  }
  get(index2) {
    const arrayIndex = index2 / 32 | 0;
    const bit = index2 % 32;
    return (this._states[arrayIndex] & 1 << bit) !== 0;
  }
  set(index2, newState) {
    const arrayIndex = index2 / 32 | 0;
    const bit = index2 % 32;
    const value2 = this._states[arrayIndex];
    if (newState) {
      this._states[arrayIndex] = value2 | 1 << bit;
    } else {
      this._states[arrayIndex] = value2 & ~(1 << bit);
    }
  }
};

var FoldingRegions = class _FoldingRegions {
  constructor(startIndexes, endIndexes, types) {
    if (startIndexes.length !== endIndexes.length || startIndexes.length > MAX_FOLDING_REGIONS) {
      throw new Error("invalid startIndexes or endIndexes size");
    }
    this._startIndexes = startIndexes;
    this._endIndexes = endIndexes;
    this._collapseStates = new BitField(startIndexes.length);
    this._userDefinedStates = new BitField(startIndexes.length);
    this._recoveredStates = new BitField(startIndexes.length);
    this._types = types;
    this._parentsComputed = false;
  }
  ensureParentIndices() {
    if (!this._parentsComputed) {
      this._parentsComputed = true;
      const parentIndexes = [];
      const isInsideLast = (startLineNumber, endLineNumber) => {
        const index2 = parentIndexes[parentIndexes.length - 1];
        return this.getStartLineNumber(index2) <= startLineNumber && this.getEndLineNumber(index2) >= endLineNumber;
      };
      for (let i2 = 0, len = this._startIndexes.length; i2 < len; i2++) {
        const startLineNumber = this._startIndexes[i2];
        const endLineNumber = this._endIndexes[i2];
        if (startLineNumber > MAX_LINE_NUMBER || endLineNumber > MAX_LINE_NUMBER) {
          throw new Error("startLineNumber or endLineNumber must not exceed " + MAX_LINE_NUMBER);
        }
        while (parentIndexes.length > 0 && !isInsideLast(startLineNumber, endLineNumber)) {
          parentIndexes.pop();
        }
        const parentIndex = parentIndexes.length > 0 ? parentIndexes[parentIndexes.length - 1] : -1;
        parentIndexes.push(i2);
        this._startIndexes[i2] = startLineNumber + ((parentIndex & 255) << 24);
        this._endIndexes[i2] = endLineNumber + ((parentIndex & 65280) << 16);
      }
    }
  }
  get length() {
    return this._startIndexes.length;
  }
  getStartLineNumber(index2) {
    return this._startIndexes[index2] & MAX_LINE_NUMBER;
  }
  getEndLineNumber(index2) {
    return this._endIndexes[index2] & MAX_LINE_NUMBER;
  }
  getType(index2) {
    return this._types ? this._types[index2] : void 0;
  }
  hasTypes() {
    return !!this._types;
  }
  isCollapsed(index2) {
    return this._collapseStates.get(index2);
  }
  setCollapsed(index2, newState) {
    this._collapseStates.set(index2, newState);
  }
  isUserDefined(index2) {
    return this._userDefinedStates.get(index2);
  }
  setUserDefined(index2, newState) {
    return this._userDefinedStates.set(index2, newState);
  }
  isRecovered(index2) {
    return this._recoveredStates.get(index2);
  }
  setRecovered(index2, newState) {
    return this._recoveredStates.set(index2, newState);
  }
  getSource(index2) {
    if (this.isUserDefined(index2)) {
      return 1 /* userDefined */;
    } else if (this.isRecovered(index2)) {
      return 2 /* recovered */;
    }
    return 0 /* provider */;
  }
  setSource(index2, source) {
    if (source === 1 /* userDefined */) {
      this.setUserDefined(index2, true);
      this.setRecovered(index2, false);
    } else if (source === 2 /* recovered */) {
      this.setUserDefined(index2, false);
      this.setRecovered(index2, true);
    } else {
      this.setUserDefined(index2, false);
      this.setRecovered(index2, false);
    }
  }
  setCollapsedAllOfType(type, newState) {
    let hasChanged = false;
    if (this._types) {
      for (let i2 = 0; i2 < this._types.length; i2++) {
        if (this._types[i2] === type) {
          this.setCollapsed(i2, newState);
          hasChanged = true;
        }
      }
    }
    return hasChanged;
  }
  toRegion(index2) {
    return new FoldingRegion(this, index2);
  }
  getParentIndex(index2) {
    this.ensureParentIndices();
    const parent = ((this._startIndexes[index2] & MASK_INDENT) >>> 24) + ((this._endIndexes[index2] & MASK_INDENT) >>> 16);
    if (parent === MAX_FOLDING_REGIONS) {
      return -1;
    }
    return parent;
  }
  contains(index2, line) {
    return this.getStartLineNumber(index2) <= line && this.getEndLineNumber(index2) >= line;
  }
  findIndex(line) {
    let low = 0, high = this._startIndexes.length;
    if (high === 0) {
      return -1;
    }
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (line < this.getStartLineNumber(mid)) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    return low - 1;
  }
  findRange(line) {
    let index2 = this.findIndex(line);
    if (index2 >= 0) {
      const endLineNumber = this.getEndLineNumber(index2);
      if (endLineNumber >= line) {
        return index2;
      }
      index2 = this.getParentIndex(index2);
      while (index2 !== -1) {
        if (this.contains(index2, line)) {
          return index2;
        }
        index2 = this.getParentIndex(index2);
      }
    }
    return -1;
  }
  toString() {
    const res = [];
    for (let i2 = 0; i2 < this.length; i2++) {
      res[i2] = `[${foldSourceAbbr[this.getSource(i2)]}${this.isCollapsed(i2) ? "+" : "-"}] ${this.getStartLineNumber(i2)}/${this.getEndLineNumber(i2)}`;
    }
    return res.join(", ");
  }
  toFoldRange(index2) {
    return {
      startLineNumber: this._startIndexes[index2] & MAX_LINE_NUMBER,
      endLineNumber: this._endIndexes[index2] & MAX_LINE_NUMBER,
      type: this._types ? this._types[index2] : void 0,
      isCollapsed: this.isCollapsed(index2),
      source: this.getSource(index2)
    };
  }
  static fromFoldRanges(ranges) {
    const rangesLength = ranges.length;
    const startIndexes = new Uint32Array(rangesLength);
    const endIndexes = new Uint32Array(rangesLength);
    let types = [];
    let gotTypes = false;
    for (let i2 = 0; i2 < rangesLength; i2++) {
      const range2 = ranges[i2];
      startIndexes[i2] = range2.startLineNumber;
      endIndexes[i2] = range2.endLineNumber;
      types.push(range2.type);
      if (range2.type) {
        gotTypes = true;
      }
    }
    if (!gotTypes) {
      types = void 0;
    }
    const regions = new _FoldingRegions(startIndexes, endIndexes, types);
    for (let i2 = 0; i2 < rangesLength; i2++) {
      if (ranges[i2].isCollapsed) {
        regions.setCollapsed(i2, true);
      }
      regions.setSource(i2, ranges[i2].source);
    }
    return regions;
  }
  /**
   * Two inputs, each a FoldingRegions or a FoldRange[], are merged.
   * Each input must be pre-sorted on startLineNumber.
   * The first list is assumed to always include all regions currently defined by range providers.
   * The second list only contains the previously collapsed and all manual ranges.
   * If the line position matches, the range of the new range is taken, and the range is no longer manual
   * When an entry in one list overlaps an entry in the other, the second list's entry "wins" and
   * overlapping entries in the first list are discarded.
   * Invalid entries are discarded. An entry is invalid if:
   * 		the start and end line numbers aren't a valid range of line numbers,
   * 		it is out of sequence or has the same start line as a preceding entry,
   * 		it overlaps a preceding entry and is not fully contained by that entry.
   */
  static sanitizeAndMerge(rangesA, rangesB, maxLineNumber, selection) {
    maxLineNumber = maxLineNumber ?? Number.MAX_VALUE;
    const getIndexedFunction = (r2, limit) => {
      return Array.isArray(r2) ? ((i2) => {
        return i2 < limit ? r2[i2] : void 0;
      }) : ((i2) => {
        return i2 < limit ? r2.toFoldRange(i2) : void 0;
      });
    };
    const getA = getIndexedFunction(rangesA, rangesA.length);
    const getB = getIndexedFunction(rangesB, rangesB.length);
    let indexA = 0;
    let indexB = 0;
    let nextA = getA(0);
    let nextB = getB(0);
    const stackedRanges = [];
    let topStackedRange;
    let prevLineNumber = 0;
    const resultRanges = [];
    while (nextA || nextB) {
      let useRange = void 0;
      if (nextB && (!nextA || nextA.startLineNumber >= nextB.startLineNumber)) {
        if (nextA && nextA.startLineNumber === nextB.startLineNumber) {
          if (nextB.source === 1 /* userDefined */) {
            useRange = nextB;
          } else {
            useRange = nextA;
            useRange.isCollapsed = nextB.isCollapsed && (nextA.endLineNumber === nextB.endLineNumber || !selection?.startsInside(nextA.startLineNumber + 1, nextA.endLineNumber + 1));
            useRange.source = 0 /* provider */;
          }
          nextA = getA(++indexA);
        } else {
          useRange = nextB;
          if (nextB.isCollapsed && nextB.source === 0 /* provider */) {
            useRange.source = 2 /* recovered */;
          }
        }
        nextB = getB(++indexB);
      } else {
        let scanIndex = indexB;
        let prescanB = nextB;
        while (true) {
          if (!prescanB || prescanB.startLineNumber > nextA.endLineNumber) {
            useRange = nextA;
            break;
          }
          if (prescanB.source === 1 /* userDefined */ && prescanB.endLineNumber > nextA.endLineNumber) {
            break;
          }
          prescanB = getB(++scanIndex);
        }
        nextA = getA(++indexA);
      }
      if (useRange) {
        while (topStackedRange && topStackedRange.endLineNumber < useRange.startLineNumber) {
          topStackedRange = stackedRanges.pop();
        }
        if (useRange.endLineNumber > useRange.startLineNumber && useRange.startLineNumber > prevLineNumber && useRange.endLineNumber <= maxLineNumber && (!topStackedRange || topStackedRange.endLineNumber >= useRange.endLineNumber)) {
          resultRanges.push(useRange);
          prevLineNumber = useRange.startLineNumber;
          if (topStackedRange) {
            stackedRanges.push(topStackedRange);
          }
          topStackedRange = useRange;
        }
      }
    }
    return resultRanges;
  }
};

var FoldingRegion = class {
  constructor(ranges, index2) {
    this.ranges = ranges;
    this.index = index2;
  }
  get startLineNumber() {
    return this.ranges.getStartLineNumber(this.index);
  }
  get endLineNumber() {
    return this.ranges.getEndLineNumber(this.index);
  }
  get regionIndex() {
    return this.index;
  }
  get parentIndex() {
    return this.ranges.getParentIndex(this.index);
  }
  get isCollapsed() {
    return this.ranges.isCollapsed(this.index);
  }
  containedBy(range2) {
    return range2.startLineNumber <= this.startLineNumber && range2.endLineNumber >= this.endLineNumber;
  }
  containsLine(lineNumber) {
    return this.startLineNumber <= lineNumber && lineNumber <= this.endLineNumber;
  }
  hidesLine(lineNumber) {
    return this.startLineNumber < lineNumber && lineNumber <= this.endLineNumber;
  }
};
export { foldSourceAbbr, MAX_FOLDING_REGIONS, MAX_LINE_NUMBER, MASK_INDENT, BitField, FoldingRegions, FoldingRegion };
