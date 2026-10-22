// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/edits/stringEdit.ts
import { BaseEdit, BaseReplacement } from "./module-0192.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { StringText } from "./module-0177.mjs";
import { commonPrefixLength2, commonSuffixLength } from "./module-0030.mjs";


// src/vs/editor/common/core/edits/stringEdit.ts
var BaseStringEdit = class extends BaseEdit {
  get TReplacement() {
    throw new Error("TReplacement is not defined for BaseStringEdit");
  }
  static composeOrUndefined(edits) {
    if (edits.length === 0) {
      return void 0;
    }
    let result = edits[0];
    for (let i2 = 1; i2 < edits.length; i2++) {
      result = result.compose(edits[i2]);
    }
    return result;
  }
  /**
   * r := trySwap(e1, e2);
   * e1.compose(e2) === r.e1.compose(r.e2)
  */
  static trySwap(e1, e22) {
    const e1Inv = e1.inverseOnSlice((start, endEx) => " ".repeat(endEx - start));
    const e1_ = e22.tryRebase(e1Inv);
    if (!e1_) {
      return void 0;
    }
    const e2_ = e1.tryRebase(e1_);
    if (!e2_) {
      return void 0;
    }
    return { e1: e1_, e2: e2_ };
  }
  apply(base) {
    const resultText = [];
    let pos = 0;
    for (const edit3 of this.replacements) {
      resultText.push(base.substring(pos, edit3.replaceRange.start));
      resultText.push(edit3.newText);
      pos = edit3.replaceRange.endExclusive;
    }
    resultText.push(base.substring(pos));
    return resultText.join("");
  }
  /**
   * Creates an edit that reverts this edit.
   */
  inverseOnSlice(getOriginalSlice) {
    const edits = [];
    let offset = 0;
    for (const e4 of this.replacements) {
      edits.push(StringReplacement.replace(
        OffsetRange.ofStartAndLength(e4.replaceRange.start + offset, e4.newText.length),
        getOriginalSlice(e4.replaceRange.start, e4.replaceRange.endExclusive)
      ));
      offset += e4.newText.length - e4.replaceRange.length;
    }
    return new StringEdit(edits);
  }
  /**
   * Creates an edit that reverts this edit.
   */
  inverse(original) {
    return this.inverseOnSlice((start, endEx) => original.substring(start, endEx));
  }
  rebaseSkipConflicting(base) {
    return this._tryRebase(base, false);
  }
  tryRebase(base) {
    return this._tryRebase(base, true);
  }
  _tryRebase(base, noOverlap) {
    const newEdits = [];
    let baseIdx = 0;
    let ourIdx = 0;
    let offset = 0;
    while (ourIdx < this.replacements.length || baseIdx < base.replacements.length) {
      const baseEdit = base.replacements.at(baseIdx);
      const ourEdit = this.replacements.at(ourIdx);
      if (!ourEdit) {
        break;
      } else if (!baseEdit) {
        const transformedRange = ourEdit.replaceRange.delta(offset);
        newEdits.push(new StringReplacement(transformedRange, ourEdit.newText));
        ourIdx++;
      } else if (ourEdit.replaceRange.intersects(baseEdit.replaceRange) || areConcurrentInserts(ourEdit.replaceRange, baseEdit.replaceRange) || isInsertStrictlyInsideRange(ourEdit.replaceRange, baseEdit.replaceRange) || isInsertStrictlyInsideRange(baseEdit.replaceRange, ourEdit.replaceRange)) {
        ourIdx++;
        if (noOverlap) {
          return void 0;
        }
      } else if (ourEdit.replaceRange.start < baseEdit.replaceRange.start || ourEdit.replaceRange.isEmpty && ourEdit.replaceRange.start === baseEdit.replaceRange.start) {
        const transformedRange = ourEdit.replaceRange.delta(offset);
        newEdits.push(new StringReplacement(transformedRange, ourEdit.newText));
        ourIdx++;
      } else {
        baseIdx++;
        offset += baseEdit.newText.length - baseEdit.replaceRange.length;
      }
    }
    return new StringEdit(newEdits);
  }
  toJson() {
    return this.replacements.map((e4) => e4.toJson());
  }
  isNeutralOn(text2) {
    return this.replacements.every((e4) => e4.isNeutralOn(text2));
  }
  removeCommonSuffixPrefix(originalText) {
    const edits = [];
    for (const e4 of this.replacements) {
      const edit3 = e4.removeCommonSuffixPrefix(originalText);
      if (!edit3.isEmpty) {
        edits.push(edit3);
      }
    }
    return new StringEdit(edits);
  }
  normalizeEOL(eol) {
    return new StringEdit(this.replacements.map((edit3) => edit3.normalizeEOL(eol)));
  }
  /**
   * If `e1.apply(source) === e2.apply(source)`, then `e1.normalizeOnSource(source).equals(e2.normalizeOnSource(source))`.
  */
  normalizeOnSource(source) {
    const result = this.apply(source);
    const edit3 = StringReplacement.replace(OffsetRange.ofLength(source.length), result);
    const e4 = edit3.removeCommonSuffixAndPrefix(source);
    if (e4.isEmpty) {
      return StringEdit.empty;
    }
    return e4.toEdit();
  }
  removeCommonSuffixAndPrefix(source) {
    return this._createNew(this.replacements.map((e4) => e4.removeCommonSuffixAndPrefix(source))).normalize();
  }
  applyOnText(docContents) {
    return new StringText(this.apply(docContents.value));
  }
  mapData(f) {
    return new AnnotatedStringEdit(
      this.replacements.map((e4) => new AnnotatedStringReplacement(
        e4.replaceRange,
        e4.newText,
        f(e4)
      ))
    );
  }
};

var BaseStringReplacement = class extends BaseReplacement {
  constructor(range2, newText) {
    super(range2);
    this.newText = newText;
  }
  getNewLength() {
    return this.newText.length;
  }
  toString() {
    return `${this.replaceRange} -> ${JSON.stringify(this.newText)}`;
  }
  replace(str) {
    return str.substring(0, this.replaceRange.start) + this.newText + str.substring(this.replaceRange.endExclusive);
  }
  /**
   * Checks if the edit would produce no changes when applied to the given text.
   */
  isNeutralOn(text2) {
    return this.newText === text2.substring(this.replaceRange.start, this.replaceRange.endExclusive);
  }
  removeCommonSuffixPrefix(originalText) {
    const oldText = originalText.substring(this.replaceRange.start, this.replaceRange.endExclusive);
    const prefixLen = commonPrefixLength2(oldText, this.newText);
    const suffixLen = Math.min(
      oldText.length - prefixLen,
      this.newText.length - prefixLen,
      commonSuffixLength(oldText, this.newText)
    );
    const replaceRange = new OffsetRange(
      this.replaceRange.start + prefixLen,
      this.replaceRange.endExclusive - suffixLen
    );
    const newText = this.newText.substring(prefixLen, this.newText.length - suffixLen);
    return new StringReplacement(replaceRange, newText);
  }
  normalizeEOL(eol) {
    const newText = this.newText.replace(/\r\n|\n/g, eol);
    return new StringReplacement(this.replaceRange, newText);
  }
  removeCommonSuffixAndPrefix(source) {
    return this.removeCommonSuffix(source).removeCommonPrefix(source);
  }
  removeCommonPrefix(source) {
    const oldText = this.replaceRange.substring(source);
    const prefixLen = commonPrefixLength2(oldText, this.newText);
    if (prefixLen === 0) {
      return this;
    }
    return this.slice(this.replaceRange.deltaStart(prefixLen), new OffsetRange(prefixLen, this.newText.length));
  }
  removeCommonSuffix(source) {
    const oldText = this.replaceRange.substring(source);
    const suffixLen = commonSuffixLength(oldText, this.newText);
    if (suffixLen === 0) {
      return this;
    }
    return this.slice(this.replaceRange.deltaEnd(-suffixLen), new OffsetRange(0, this.newText.length - suffixLen));
  }
  toEdit() {
    return new StringEdit([this]);
  }
  toJson() {
    return {
      txt: this.newText,
      pos: this.replaceRange.start,
      len: this.replaceRange.length
    };
  }
};

var StringEdit = class _StringEdit extends BaseStringEdit {
  /**
   * Parses an edit from its string representation.
   * E.g. [[2, 12) -> "fgh", [14, 20) -> "qrst", [22, 22) -> "de\n"]
  */
  static parse(toStringValue) {
    const replacements = [];
    const regex = /\[(\d+),\s*(\d+)\)\s*->\s*"([^"]*)"/g;
    let match2;
    while ((match2 = regex.exec(toStringValue)) !== null) {
      const start = parseInt(match2[1], 10);
      const endEx = parseInt(match2[2], 10);
      const text2 = match2[3].replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\\\/g, "\\");
      replacements.push(new StringReplacement(new OffsetRange(start, endEx), text2));
    }
    return new _StringEdit(replacements);
  }
  static {
    this.empty = new _StringEdit([]);
  }
  static create(replacements) {
    return new _StringEdit(replacements);
  }
  static single(replacement) {
    return new _StringEdit([replacement]);
  }
  static replace(range2, replacement) {
    return new _StringEdit([new StringReplacement(range2, replacement)]);
  }
  static insert(offset, replacement) {
    return new _StringEdit([new StringReplacement(OffsetRange.emptyAt(offset), replacement)]);
  }
  static delete(range2) {
    return new _StringEdit([new StringReplacement(range2, "")]);
  }
  static fromJson(data) {
    return new _StringEdit(data.map(StringReplacement.fromJson));
  }
  static compose(edits) {
    if (edits.length === 0) {
      return _StringEdit.empty;
    }
    let result = edits[0];
    for (let i2 = 1; i2 < edits.length; i2++) {
      result = result.compose(edits[i2]);
    }
    return result;
  }
  /**
   * The replacements are applied in order!
   * Equals `StringEdit.compose(replacements.map(r => r.toEdit()))`, but is much more performant.
  */
  static composeSequentialReplacements(replacements) {
    let edit3 = _StringEdit.empty;
    let curEditReplacements = [];
    for (const r2 of replacements) {
      const last = curEditReplacements.at(-1);
      if (!last || r2.replaceRange.isBefore(last.replaceRange)) {
        curEditReplacements.push(r2);
      } else {
        edit3 = edit3.compose(_StringEdit.create(curEditReplacements.reverse()));
        curEditReplacements = [r2];
      }
    }
    edit3 = edit3.compose(_StringEdit.create(curEditReplacements.reverse()));
    return edit3;
  }
  constructor(replacements) {
    super(replacements);
  }
  _createNew(replacements) {
    return new _StringEdit(replacements);
  }
};

var StringReplacement = class _StringReplacement extends BaseStringReplacement {
  static insert(offset, text2) {
    return new _StringReplacement(OffsetRange.emptyAt(offset), text2);
  }
  static replace(range2, text2) {
    return new _StringReplacement(range2, text2);
  }
  static delete(range2) {
    return new _StringReplacement(range2, "");
  }
  static fromJson(data) {
    return new _StringReplacement(OffsetRange.ofStartAndLength(data.pos, data.len), data.txt);
  }
  equals(other) {
    return this.replaceRange.equals(other.replaceRange) && this.newText === other.newText;
  }
  tryJoinTouching(other) {
    return new _StringReplacement(this.replaceRange.joinRightTouching(other.replaceRange), this.newText + other.newText);
  }
  slice(range2, rangeInReplacement) {
    return new _StringReplacement(range2, rangeInReplacement ? rangeInReplacement.substring(this.newText) : this.newText);
  }
};

function applyEditsToRanges(sortedRanges, edit3) {
  sortedRanges = sortedRanges.slice();
  const result = [];
  let offset = 0;
  for (const e4 of edit3.replacements) {
    while (true) {
      const r2 = sortedRanges[0];
      if (!r2 || r2.endExclusive >= e4.replaceRange.start) {
        break;
      }
      sortedRanges.shift();
      result.push(r2.delta(offset));
    }
    const intersecting = [];
    while (true) {
      const r2 = sortedRanges[0];
      if (!r2 || !r2.intersectsOrTouches(e4.replaceRange)) {
        break;
      }
      sortedRanges.shift();
      intersecting.push(r2);
    }
    for (let i2 = intersecting.length - 1; i2 >= 0; i2--) {
      let r2 = intersecting[i2];
      const overlap = r2.intersect(e4.replaceRange).length;
      r2 = r2.deltaEnd(-overlap + (i2 === 0 ? e4.newText.length : 0));
      const rangeAheadOfReplaceRange = r2.start - e4.replaceRange.start;
      if (rangeAheadOfReplaceRange > 0) {
        r2 = r2.delta(-rangeAheadOfReplaceRange);
      }
      if (i2 !== 0) {
        r2 = r2.delta(e4.newText.length);
      }
      r2 = r2.delta(-(e4.newText.length - e4.replaceRange.length));
      sortedRanges.unshift(r2);
    }
    offset += e4.newText.length - e4.replaceRange.length;
  }
  while (true) {
    const r2 = sortedRanges[0];
    if (!r2) {
      break;
    }
    sortedRanges.shift();
    result.push(r2.delta(offset));
  }
  return result;
}

var AnnotatedStringEdit = class _AnnotatedStringEdit extends BaseStringEdit {
  static {
    this.empty = new _AnnotatedStringEdit([]);
  }
  static create(replacements) {
    return new _AnnotatedStringEdit(replacements);
  }
  static single(replacement) {
    return new _AnnotatedStringEdit([replacement]);
  }
  static replace(range2, replacement, data) {
    return new _AnnotatedStringEdit([new AnnotatedStringReplacement(range2, replacement, data)]);
  }
  static insert(offset, replacement, data) {
    return new _AnnotatedStringEdit([new AnnotatedStringReplacement(OffsetRange.emptyAt(offset), replacement, data)]);
  }
  static delete(range2, data) {
    return new _AnnotatedStringEdit([new AnnotatedStringReplacement(range2, "", data)]);
  }
  static compose(edits) {
    if (edits.length === 0) {
      return _AnnotatedStringEdit.empty;
    }
    let result = edits[0];
    for (let i2 = 1; i2 < edits.length; i2++) {
      result = result.compose(edits[i2]);
    }
    return result;
  }
  constructor(replacements) {
    super(replacements);
  }
  _createNew(replacements) {
    return new _AnnotatedStringEdit(replacements);
  }
  toStringEdit(filter2) {
    const newReplacements = [];
    for (const r2 of this.replacements) {
      if (!filter2 || filter2(r2)) {
        newReplacements.push(new StringReplacement(r2.replaceRange, r2.newText));
      }
    }
    return new StringEdit(newReplacements);
  }
};

var AnnotatedStringReplacement = class _AnnotatedStringReplacement extends BaseStringReplacement {
  constructor(range2, newText, data) {
    super(range2, newText);
    this.data = data;
  }
  static insert(offset, text2, data) {
    return new _AnnotatedStringReplacement(OffsetRange.emptyAt(offset), text2, data);
  }
  static replace(range2, text2, data) {
    return new _AnnotatedStringReplacement(range2, text2, data);
  }
  static delete(range2, data) {
    return new _AnnotatedStringReplacement(range2, "", data);
  }
  equals(other) {
    return this.replaceRange.equals(other.replaceRange) && this.newText === other.newText && this.data === other.data;
  }
  tryJoinTouching(other) {
    const joined = this.data.join(other.data);
    if (joined === void 0) {
      return void 0;
    }
    return new _AnnotatedStringReplacement(this.replaceRange.joinRightTouching(other.replaceRange), this.newText + other.newText, joined);
  }
  slice(range2, rangeInReplacement) {
    return new _AnnotatedStringReplacement(range2, rangeInReplacement ? rangeInReplacement.substring(this.newText) : this.newText, this.data);
  }
};

function areConcurrentInserts(r1, r2) {
  return r1.isEmpty && r2.isEmpty && r1.start === r2.start;
}

function isInsertStrictlyInsideRange(insert2, range2) {
  return insert2.isEmpty && range2.start < insert2.start && insert2.start < range2.endExclusive;
}
export { applyEditsToRanges, areConcurrentInserts, isInsertStrictlyInsideRange, BaseStringEdit, BaseStringReplacement, StringEdit, StringReplacement, AnnotatedStringEdit, AnnotatedStringReplacement };
