// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/beforeEditPositionMapper.ts
import { Range2 } from "./module-0106.mjs";
import { lengthAdd, lengthDiffNonNegative, lengthLessThanEqual, lengthOfString, lengthToObj, positionToLength, toLength } from "./module-0379.mjs";


// src/vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/beforeEditPositionMapper.ts
var TextEditInfo = class _TextEditInfo {
  constructor(startOffset, endOffset, newLength) {
    this.startOffset = startOffset;
    this.endOffset = endOffset;
    this.newLength = newLength;
  }
  static fromModelContentChanges(changes) {
    const edits = changes.map((c) => {
      const range2 = Range2.lift(c.range);
      return new _TextEditInfo(
        positionToLength(range2.getStartPosition()),
        positionToLength(range2.getEndPosition()),
        lengthOfString(c.text)
      );
    }).reverse();
    return edits;
  }
  toString() {
    return `[${lengthToObj(this.startOffset)}...${lengthToObj(this.endOffset)}) -> ${lengthToObj(this.newLength)}`;
  }
};

var BeforeEditPositionMapper = class {
  /**
   * @param edits Must be sorted by offset in ascending order.
  */
  constructor(edits) {
    this.nextEditIdx = 0;
    this.deltaOldToNewLineCount = 0;
    this.deltaOldToNewColumnCount = 0;
    this.deltaLineIdxInOld = -1;
    this.edits = edits.map((edit3) => TextEditInfoCache.from(edit3));
  }
  /**
   * @param offset Must be equal to or greater than the last offset this method has been called with.
  */
  getOffsetBeforeChange(offset) {
    this.adjustNextEdit(offset);
    return this.translateCurToOld(offset);
  }
  /**
   * @param offset Must be equal to or greater than the last offset this method has been called with.
   * Returns null if there is no edit anymore.
  */
  getDistanceToNextChange(offset) {
    this.adjustNextEdit(offset);
    const nextEdit = this.edits[this.nextEditIdx];
    const nextChangeOffset = nextEdit ? this.translateOldToCur(nextEdit.offsetObj) : null;
    if (nextChangeOffset === null) {
      return null;
    }
    return lengthDiffNonNegative(offset, nextChangeOffset);
  }
  translateOldToCur(oldOffsetObj) {
    if (oldOffsetObj.lineCount === this.deltaLineIdxInOld) {
      return toLength(oldOffsetObj.lineCount + this.deltaOldToNewLineCount, oldOffsetObj.columnCount + this.deltaOldToNewColumnCount);
    } else {
      return toLength(oldOffsetObj.lineCount + this.deltaOldToNewLineCount, oldOffsetObj.columnCount);
    }
  }
  translateCurToOld(newOffset) {
    const offsetObj = lengthToObj(newOffset);
    if (offsetObj.lineCount - this.deltaOldToNewLineCount === this.deltaLineIdxInOld) {
      return toLength(offsetObj.lineCount - this.deltaOldToNewLineCount, offsetObj.columnCount - this.deltaOldToNewColumnCount);
    } else {
      return toLength(offsetObj.lineCount - this.deltaOldToNewLineCount, offsetObj.columnCount);
    }
  }
  adjustNextEdit(offset) {
    while (this.nextEditIdx < this.edits.length) {
      const nextEdit = this.edits[this.nextEditIdx];
      const nextEditEndOffsetInCur = this.translateOldToCur(nextEdit.endOffsetAfterObj);
      if (lengthLessThanEqual(nextEditEndOffsetInCur, offset)) {
        this.nextEditIdx++;
        const nextEditEndOffsetInCurObj = lengthToObj(nextEditEndOffsetInCur);
        const nextEditEndOffsetBeforeInCurObj = lengthToObj(this.translateOldToCur(nextEdit.endOffsetBeforeObj));
        const lineDelta = nextEditEndOffsetInCurObj.lineCount - nextEditEndOffsetBeforeInCurObj.lineCount;
        this.deltaOldToNewLineCount += lineDelta;
        const previousColumnDelta = this.deltaLineIdxInOld === nextEdit.endOffsetBeforeObj.lineCount ? this.deltaOldToNewColumnCount : 0;
        const columnDelta = nextEditEndOffsetInCurObj.columnCount - nextEditEndOffsetBeforeInCurObj.columnCount;
        this.deltaOldToNewColumnCount = previousColumnDelta + columnDelta;
        this.deltaLineIdxInOld = nextEdit.endOffsetBeforeObj.lineCount;
      } else {
        break;
      }
    }
  }
};

var TextEditInfoCache = class _TextEditInfoCache {
  static from(edit3) {
    return new _TextEditInfoCache(edit3.startOffset, edit3.endOffset, edit3.newLength);
  }
  constructor(startOffset, endOffset, textLength) {
    this.endOffsetBeforeObj = lengthToObj(endOffset);
    this.endOffsetAfterObj = lengthToObj(lengthAdd(startOffset, textLength));
    this.offsetObj = lengthToObj(startOffset);
  }
};
export { TextEditInfo, BeforeEditPositionMapper, TextEditInfoCache };
