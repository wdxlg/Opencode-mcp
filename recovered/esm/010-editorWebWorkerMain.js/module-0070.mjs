// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/editor/common/services/editorWebWorkerMain.js
// Original module marker: src/vs/editor/common/core/edits/stringEdit.ts
import { BaseEdit, BaseReplacement } from "./module-0069.mjs";
import { OffsetRange } from "./module-0049.mjs";
import { StringText } from "./module-0053.mjs";
import { commonPrefixLength, commonSuffixLength } from "./module-0020.mjs";


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
    for (let i = 1; i < edits.length; i++) {
      result = result.compose(edits[i]);
    }
    return result;
  }
  /**
   * r := trySwap(e1, e2);
   * e1.compose(e2) === r.e1.compose(r.e2)
  */
  static trySwap(e1, e2) {
    const e1Inv = e1.inverseOnSlice((start, endEx) => " ".repeat(endEx - start));
    const e1_ = e2.tryRebase(e1Inv);
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
    for (const edit of this.replacements) {
      resultText.push(base.substring(pos, edit.replaceRange.start));
      resultText.push(edit.newText);
      pos = edit.replaceRange.endExclusive;
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
    for (const e of this.replacements) {
      edits.push(StringReplacement.replace(
        OffsetRange.ofStartAndLength(e.replaceRange.start + offset, e.newText.length),
        getOriginalSlice(e.replaceRange.start, e.replaceRange.endExclusive)
      ));
      offset += e.newText.length - e.replaceRange.length;
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
    return this.replacements.map((e) => e.toJson());
  }
  isNeutralOn(text) {
    return this.replacements.every((e) => e.isNeutralOn(text));
  }
  removeCommonSuffixPrefix(originalText) {
    const edits = [];
    for (const e of this.replacements) {
      const edit = e.removeCommonSuffixPrefix(originalText);
      if (!edit.isEmpty) {
        edits.push(edit);
      }
    }
    return new StringEdit(edits);
  }
  normalizeEOL(eol) {
    return new StringEdit(this.replacements.map((edit) => edit.normalizeEOL(eol)));
  }
  /**
   * If `e1.apply(source) === e2.apply(source)`, then `e1.normalizeOnSource(source).equals(e2.normalizeOnSource(source))`.
  */
  normalizeOnSource(source) {
    const result = this.apply(source);
    const edit = StringReplacement.replace(OffsetRange.ofLength(source.length), result);
    const e = edit.removeCommonSuffixAndPrefix(source);
    if (e.isEmpty) {
      return StringEdit.empty;
    }
    return e.toEdit();
  }
  removeCommonSuffixAndPrefix(source) {
    return this._createNew(this.replacements.map((e) => e.removeCommonSuffixAndPrefix(source))).normalize();
  }
  applyOnText(docContents) {
    return new StringText(this.apply(docContents.value));
  }
  mapData(f) {
    return new AnnotatedStringEdit(
      this.replacements.map((e) => new AnnotatedStringReplacement(
        e.replaceRange,
        e.newText,
        f(e)
      ))
    );
  }
};

var BaseStringReplacement = class extends BaseReplacement {
  constructor(range, newText) {
    super(range);
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
  isNeutralOn(text) {
    return this.newText === text.substring(this.replaceRange.start, this.replaceRange.endExclusive);
  }
  removeCommonSuffixPrefix(originalText) {
    const oldText = originalText.substring(this.replaceRange.start, this.replaceRange.endExclusive);
    const prefixLen = commonPrefixLength(oldText, this.newText);
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
    const prefixLen = commonPrefixLength(oldText, this.newText);
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
    let match;
    while ((match = regex.exec(toStringValue)) !== null) {
      const start = parseInt(match[1], 10);
      const endEx = parseInt(match[2], 10);
      const text = match[3].replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\\\/g, "\\");
      replacements.push(new StringReplacement(new OffsetRange(start, endEx), text));
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
  static replace(range, replacement) {
    return new _StringEdit([new StringReplacement(range, replacement)]);
  }
  static insert(offset, replacement) {
    return new _StringEdit([new StringReplacement(OffsetRange.emptyAt(offset), replacement)]);
  }
  static delete(range) {
    return new _StringEdit([new StringReplacement(range, "")]);
  }
  static fromJson(data) {
    return new _StringEdit(data.map(StringReplacement.fromJson));
  }
  static compose(edits) {
    if (edits.length === 0) {
      return _StringEdit.empty;
    }
    let result = edits[0];
    for (let i = 1; i < edits.length; i++) {
      result = result.compose(edits[i]);
    }
    return result;
  }
  /**
   * The replacements are applied in order!
   * Equals `StringEdit.compose(replacements.map(r => r.toEdit()))`, but is much more performant.
  */
  static composeSequentialReplacements(replacements) {
    let edit = _StringEdit.empty;
    let curEditReplacements = [];
    for (const r of replacements) {
      const last = curEditReplacements.at(-1);
      if (!last || r.replaceRange.isBefore(last.replaceRange)) {
        curEditReplacements.push(r);
      } else {
        edit = edit.compose(_StringEdit.create(curEditReplacements.reverse()));
        curEditReplacements = [r];
      }
    }
    edit = edit.compose(_StringEdit.create(curEditReplacements.reverse()));
    return edit;
  }
  constructor(replacements) {
    super(replacements);
  }
  _createNew(replacements) {
    return new _StringEdit(replacements);
  }
};

var StringReplacement = class _StringReplacement extends BaseStringReplacement {
  static insert(offset, text) {
    return new _StringReplacement(OffsetRange.emptyAt(offset), text);
  }
  static replace(range, text) {
    return new _StringReplacement(range, text);
  }
  static delete(range) {
    return new _StringReplacement(range, "");
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
  slice(range, rangeInReplacement) {
    return new _StringReplacement(range, rangeInReplacement ? rangeInReplacement.substring(this.newText) : this.newText);
  }
};

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
  static replace(range, replacement, data) {
    return new _AnnotatedStringEdit([new AnnotatedStringReplacement(range, replacement, data)]);
  }
  static insert(offset, replacement, data) {
    return new _AnnotatedStringEdit([new AnnotatedStringReplacement(OffsetRange.emptyAt(offset), replacement, data)]);
  }
  static delete(range, data) {
    return new _AnnotatedStringEdit([new AnnotatedStringReplacement(range, "", data)]);
  }
  static compose(edits) {
    if (edits.length === 0) {
      return _AnnotatedStringEdit.empty;
    }
    let result = edits[0];
    for (let i = 1; i < edits.length; i++) {
      result = result.compose(edits[i]);
    }
    return result;
  }
  constructor(replacements) {
    super(replacements);
  }
  _createNew(replacements) {
    return new _AnnotatedStringEdit(replacements);
  }
  toStringEdit(filter) {
    const newReplacements = [];
    for (const r of this.replacements) {
      if (!filter || filter(r)) {
        newReplacements.push(new StringReplacement(r.replaceRange, r.newText));
      }
    }
    return new StringEdit(newReplacements);
  }
};

var AnnotatedStringReplacement = class _AnnotatedStringReplacement extends BaseStringReplacement {
  constructor(range, newText, data) {
    super(range, newText);
    this.data = data;
  }
  static insert(offset, text, data) {
    return new _AnnotatedStringReplacement(OffsetRange.emptyAt(offset), text, data);
  }
  static replace(range, text, data) {
    return new _AnnotatedStringReplacement(range, text, data);
  }
  static delete(range, data) {
    return new _AnnotatedStringReplacement(range, "", data);
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
  slice(range, rangeInReplacement) {
    return new _AnnotatedStringReplacement(range, rangeInReplacement ? rangeInReplacement.substring(this.newText) : this.newText, this.data);
  }
};

function areConcurrentInserts(r1, r2) {
  return r1.isEmpty && r2.isEmpty && r1.start === r2.start;
}

function isInsertStrictlyInsideRange(insert, range) {
  return insert.isEmpty && range.start < insert.start && insert.start < range.endExclusive;
}
export { areConcurrentInserts, isInsertStrictlyInsideRange, BaseStringEdit, BaseStringReplacement, StringEdit, StringReplacement, AnnotatedStringEdit, AnnotatedStringReplacement };
