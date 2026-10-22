// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/edits/lengthEdit.ts
import { BaseEdit, BaseReplacement } from "./module-0192.mjs";
import { OffsetRange } from "./module-0144.mjs";


// src/vs/editor/common/core/edits/lengthEdit.ts
var LengthEdit = class _LengthEdit extends BaseEdit {
  static {
    this.empty = new _LengthEdit([]);
  }
  static fromEdit(edit3) {
    return new _LengthEdit(edit3.replacements.map((r2) => new LengthReplacement(r2.replaceRange, r2.getNewLength())));
  }
  static create(replacements) {
    return new _LengthEdit(replacements);
  }
  static single(replacement) {
    return new _LengthEdit([replacement]);
  }
  static replace(range2, newLength) {
    return new _LengthEdit([new LengthReplacement(range2, newLength)]);
  }
  static insert(offset, newLength) {
    return new _LengthEdit([new LengthReplacement(OffsetRange.emptyAt(offset), newLength)]);
  }
  static delete(range2) {
    return new _LengthEdit([new LengthReplacement(range2, 0)]);
  }
  static compose(edits) {
    let e4 = _LengthEdit.empty;
    for (const edit3 of edits) {
      e4 = e4.compose(edit3);
    }
    return e4;
  }
  /**
   * Creates an edit that reverts this edit.
   */
  inverse() {
    const edits = [];
    let offset = 0;
    for (const e4 of this.replacements) {
      edits.push(new LengthReplacement(
        OffsetRange.ofStartAndLength(e4.replaceRange.start + offset, e4.newLength),
        e4.replaceRange.length
      ));
      offset += e4.newLength - e4.replaceRange.length;
    }
    return new _LengthEdit(edits);
  }
  _createNew(replacements) {
    return new _LengthEdit(replacements);
  }
  applyArray(arr, fillItem) {
    const newArr = new Array(this.getNewDataLength(arr.length));
    let srcPos = 0;
    let dstPos = 0;
    for (const replacement of this.replacements) {
      for (let i2 = srcPos; i2 < replacement.replaceRange.start; i2++) {
        newArr[dstPos++] = arr[i2];
      }
      srcPos = replacement.replaceRange.endExclusive;
      for (let i2 = 0; i2 < replacement.newLength; i2++) {
        newArr[dstPos++] = fillItem;
      }
    }
    while (srcPos < arr.length) {
      newArr[dstPos++] = arr[srcPos++];
    }
    return newArr;
  }
};

var LengthReplacement = class _LengthReplacement extends BaseReplacement {
  constructor(range2, newLength) {
    super(range2);
    this.newLength = newLength;
  }
  static create(startOffset, endOffsetExclusive, newLength) {
    return new _LengthReplacement(new OffsetRange(startOffset, endOffsetExclusive), newLength);
  }
  equals(other) {
    return this.replaceRange.equals(other.replaceRange) && this.newLength === other.newLength;
  }
  getNewLength() {
    return this.newLength;
  }
  tryJoinTouching(other) {
    return new _LengthReplacement(this.replaceRange.joinRightTouching(other.replaceRange), this.newLength + other.newLength);
  }
  slice(range2, rangeInReplacement) {
    return new _LengthReplacement(range2, rangeInReplacement.length);
  }
  toString() {
    return `[${this.replaceRange.start}, +${this.replaceRange.length}) -> +${this.newLength}}`;
  }
};
export { LengthEdit, LengthReplacement };
