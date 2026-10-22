// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/editor/common/services/editorWebWorkerMain.js
// Original module marker: src/vs/editor/common/model/textModelSearch.ts
import { getNextCodePoint } from "./module-0020.mjs";


// src/vs/editor/common/model/textModelSearch.ts
function isMultilineRegexSource(searchString) {
  if (!searchString || searchString.length === 0) {
    return false;
  }
  for (let i = 0, len = searchString.length; i < len; i++) {
    const chCode = searchString.charCodeAt(i);
    if (chCode === 10 /* LineFeed */) {
      return true;
    }
    if (chCode === 92 /* Backslash */) {
      i++;
      if (i >= len) {
        break;
      }
      const nextChCode = searchString.charCodeAt(i);
      if (nextChCode === 110 /* n */ || nextChCode === 114 /* r */ || nextChCode === 87 /* W */) {
        return true;
      }
    }
  }
  return false;
}

function leftIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength) {
  if (matchStartIndex === 0) {
    return true;
  }
  const charBefore = text.charCodeAt(matchStartIndex - 1);
  if (wordSeparators.get(charBefore) !== 0 /* Regular */) {
    return true;
  }
  if (charBefore === 13 /* CarriageReturn */ || charBefore === 10 /* LineFeed */) {
    return true;
  }
  if (matchLength > 0) {
    const firstCharInMatch = text.charCodeAt(matchStartIndex);
    if (wordSeparators.get(firstCharInMatch) !== 0 /* Regular */) {
      return true;
    }
  }
  return false;
}

function rightIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength) {
  if (matchStartIndex + matchLength === textLength) {
    return true;
  }
  const charAfter = text.charCodeAt(matchStartIndex + matchLength);
  if (wordSeparators.get(charAfter) !== 0 /* Regular */) {
    return true;
  }
  if (charAfter === 13 /* CarriageReturn */ || charAfter === 10 /* LineFeed */) {
    return true;
  }
  if (matchLength > 0) {
    const lastCharInMatch = text.charCodeAt(matchStartIndex + matchLength - 1);
    if (wordSeparators.get(lastCharInMatch) !== 0 /* Regular */) {
      return true;
    }
  }
  return false;
}

function isValidMatch(wordSeparators, text, textLength, matchStartIndex, matchLength) {
  return leftIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength) && rightIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength);
}

var Searcher = class {
  constructor(wordSeparators, searchRegex) {
    this._wordSeparators = wordSeparators;
    this._searchRegex = searchRegex;
    this._prevMatchStartIndex = -1;
    this._prevMatchLength = 0;
  }
  reset(lastIndex) {
    this._searchRegex.lastIndex = lastIndex;
    this._prevMatchStartIndex = -1;
    this._prevMatchLength = 0;
  }
  next(text) {
    const textLength = text.length;
    let m;
    do {
      if (this._prevMatchStartIndex + this._prevMatchLength === textLength) {
        return null;
      }
      m = this._searchRegex.exec(text);
      if (!m) {
        return null;
      }
      const matchStartIndex = m.index;
      const matchLength = m[0].length;
      if (matchStartIndex === this._prevMatchStartIndex && matchLength === this._prevMatchLength) {
        if (matchLength === 0) {
          if (getNextCodePoint(text, textLength, this._searchRegex.lastIndex) > 65535) {
            this._searchRegex.lastIndex += 2;
          } else {
            this._searchRegex.lastIndex += 1;
          }
          continue;
        }
        return null;
      }
      this._prevMatchStartIndex = matchStartIndex;
      this._prevMatchLength = matchLength;
      if (!this._wordSeparators || isValidMatch(this._wordSeparators, text, textLength, matchStartIndex, matchLength)) {
        return m;
      }
    } while (m);
    return null;
  }
};
export { isMultilineRegexSource, leftIsWordBounday, rightIsWordBounday, isValidMatch, Searcher };
