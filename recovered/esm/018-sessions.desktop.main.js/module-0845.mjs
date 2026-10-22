// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/smartSelect/browser/wordSelections.ts
import { isLowerAsciiLetter, isUpperAsciiLetter } from "./module-0030.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/contrib/smartSelect/browser/wordSelections.ts
var WordSelectionRangeProvider = class {
  constructor(selectSubwords = true) {
    this.selectSubwords = selectSubwords;
  }
  provideSelectionRanges(model, positions) {
    const result = [];
    for (const position2 of positions) {
      const bucket = [];
      result.push(bucket);
      if (this.selectSubwords) {
        this._addInWordRanges(bucket, model, position2);
      }
      this._addWordRanges(bucket, model, position2);
      this._addWhitespaceLine(bucket, model, position2);
      bucket.push({ range: model.getFullModelRange() });
    }
    return result;
  }
  _addInWordRanges(bucket, model, pos) {
    const obj = model.getWordAtPosition(pos);
    if (!obj) {
      return;
    }
    const { word, startColumn } = obj;
    const offset = pos.column - startColumn;
    let start = offset;
    let end = offset;
    let lastCh = 0;
    for (; start >= 0; start--) {
      const ch = word.charCodeAt(start);
      if (start !== offset && (ch === 95 /* Underline */ || ch === 45 /* Dash */)) {
        break;
      } else if (isLowerAsciiLetter(ch) && isUpperAsciiLetter(lastCh)) {
        break;
      }
      lastCh = ch;
    }
    start += 1;
    for (; end < word.length; end++) {
      const ch = word.charCodeAt(end);
      if (isUpperAsciiLetter(ch) && isLowerAsciiLetter(lastCh)) {
        break;
      } else if (ch === 95 /* Underline */ || ch === 45 /* Dash */) {
        break;
      }
      lastCh = ch;
    }
    if (start < end) {
      bucket.push({ range: new Range2(pos.lineNumber, startColumn + start, pos.lineNumber, startColumn + end) });
    }
  }
  _addWordRanges(bucket, model, pos) {
    const word = model.getWordAtPosition(pos);
    if (word) {
      bucket.push({ range: new Range2(pos.lineNumber, word.startColumn, pos.lineNumber, word.endColumn) });
    }
  }
  _addWhitespaceLine(bucket, model, pos) {
    if (model.getLineLength(pos.lineNumber) > 0 && model.getLineFirstNonWhitespaceColumn(pos.lineNumber) === 0 && model.getLineLastNonWhitespaceColumn(pos.lineNumber) === 0) {
      bucket.push({ range: new Range2(pos.lineNumber, 1, pos.lineNumber, model.getLineMaxColumn(pos.lineNumber)) });
    }
  }
};
export { WordSelectionRangeProvider };
