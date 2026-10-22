// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/editor/common/model/textModelSearch.ts
import { createRegExp, getNextCodePoint } from "./module-0023.mjs";
import { FindMatch, SearchData } from "./module-0094.mjs";
import { getMapForWordSeparators } from "./module-0279.mjs";


// src/vs/editor/common/model/textModelSearch.ts
var SearchParams = class {
  constructor(searchString, isRegex, matchCase, wordSeparators2) {
    this.searchString = searchString;
    this.isRegex = isRegex;
    this.matchCase = matchCase;
    this.wordSeparators = wordSeparators2;
  }
  parseSearchRequest() {
    if (this.searchString === "") {
      return null;
    }
    let multiline;
    if (this.isRegex) {
      multiline = isMultilineRegexSource(this.searchString);
    } else {
      multiline = this.searchString.indexOf("\n") >= 0;
    }
    let regex = null;
    try {
      regex = createRegExp(this.searchString, this.isRegex, {
        matchCase: this.matchCase,
        wholeWord: false,
        multiline,
        global: true,
        unicode: true
      });
    } catch (err) {
      return null;
    }
    if (!regex) {
      return null;
    }
    let canUseSimpleSearch = !this.isRegex && !multiline;
    if (canUseSimpleSearch && this.searchString.toLowerCase() !== this.searchString.toUpperCase()) {
      canUseSimpleSearch = this.matchCase;
    }
    return new SearchData(regex, this.wordSeparators ? getMapForWordSeparators(this.wordSeparators, []) : null, canUseSimpleSearch ? this.searchString : null);
  }
};

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

function createFindMatch(range, rawMatches, captureMatches) {
  if (!captureMatches) {
    return new FindMatch(range, null);
  }
  const matches = [];
  for (let i = 0, len = rawMatches.length; i < len; i++) {
    matches[i] = rawMatches[i];
  }
  return new FindMatch(range, matches);
}

function leftIsWordBounday(wordSeparators2, text, textLength, matchStartIndex, matchLength) {
  if (matchStartIndex === 0) {
    return true;
  }
  const charBefore = text.charCodeAt(matchStartIndex - 1);
  if (wordSeparators2.get(charBefore) !== 0 /* Regular */) {
    return true;
  }
  if (charBefore === 13 /* CarriageReturn */ || charBefore === 10 /* LineFeed */) {
    return true;
  }
  if (matchLength > 0) {
    const firstCharInMatch = text.charCodeAt(matchStartIndex);
    if (wordSeparators2.get(firstCharInMatch) !== 0 /* Regular */) {
      return true;
    }
  }
  return false;
}

function rightIsWordBounday(wordSeparators2, text, textLength, matchStartIndex, matchLength) {
  if (matchStartIndex + matchLength === textLength) {
    return true;
  }
  const charAfter = text.charCodeAt(matchStartIndex + matchLength);
  if (wordSeparators2.get(charAfter) !== 0 /* Regular */) {
    return true;
  }
  if (charAfter === 13 /* CarriageReturn */ || charAfter === 10 /* LineFeed */) {
    return true;
  }
  if (matchLength > 0) {
    const lastCharInMatch = text.charCodeAt(matchStartIndex + matchLength - 1);
    if (wordSeparators2.get(lastCharInMatch) !== 0 /* Regular */) {
      return true;
    }
  }
  return false;
}

function isValidMatch(wordSeparators2, text, textLength, matchStartIndex, matchLength) {
  return leftIsWordBounday(wordSeparators2, text, textLength, matchStartIndex, matchLength) && rightIsWordBounday(wordSeparators2, text, textLength, matchStartIndex, matchLength);
}

var Searcher = class {
  constructor(wordSeparators2, searchRegex) {
    this._wordSeparators = wordSeparators2;
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
export { isMultilineRegexSource, createFindMatch, leftIsWordBounday, rightIsWordBounday, isValidMatch, SearchParams, Searcher };
