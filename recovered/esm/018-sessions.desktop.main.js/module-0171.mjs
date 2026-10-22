// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/textModelSearch.ts
import { createRegExp, getNextCodePoint } from "./module-0030.mjs";
import { FindMatch, SearchData } from "./module-0117.mjs";
import { getMapForWordSeparators } from "./module-0122.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/common/model/textModelSearch.ts
var LIMIT_FIND_COUNT = 999;

var SearchParams = class {
  constructor(searchString, isRegex2, matchCase, wordSeparators2) {
    this.searchString = searchString;
    this.isRegex = isRegex2;
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
  for (let i2 = 0, len = searchString.length; i2 < len; i2++) {
    const chCode = searchString.charCodeAt(i2);
    if (chCode === 10 /* LineFeed */) {
      return true;
    }
    if (chCode === 92 /* Backslash */) {
      i2++;
      if (i2 >= len) {
        break;
      }
      const nextChCode = searchString.charCodeAt(i2);
      if (nextChCode === 110 /* n */ || nextChCode === 114 /* r */ || nextChCode === 87 /* W */) {
        return true;
      }
    }
  }
  return false;
}

function createFindMatch(range2, rawMatches, captureMatches) {
  if (!captureMatches) {
    return new FindMatch(range2, null);
  }
  const matches2 = [];
  for (let i2 = 0, len = rawMatches.length; i2 < len; i2++) {
    matches2[i2] = rawMatches[i2];
  }
  return new FindMatch(range2, matches2);
}

var LineFeedCounter = class {
  constructor(text2) {
    const lineFeedsOffsets = [];
    let lineFeedsOffsetsLen = 0;
    for (let i2 = 0, textLen = text2.length; i2 < textLen; i2++) {
      if (text2.charCodeAt(i2) === 10 /* LineFeed */) {
        lineFeedsOffsets[lineFeedsOffsetsLen++] = i2;
      }
    }
    this._lineFeedsOffsets = lineFeedsOffsets;
  }
  findLineFeedCountBeforeOffset(offset) {
    const lineFeedsOffsets = this._lineFeedsOffsets;
    let min = 0;
    let max = lineFeedsOffsets.length - 1;
    if (max === -1) {
      return 0;
    }
    if (offset <= lineFeedsOffsets[0]) {
      return 0;
    }
    while (min < max) {
      const mid = min + ((max - min) / 2 >> 0);
      if (lineFeedsOffsets[mid] >= offset) {
        max = mid - 1;
      } else {
        if (lineFeedsOffsets[mid + 1] >= offset) {
          min = mid;
          max = mid;
        } else {
          min = mid + 1;
        }
      }
    }
    return min + 1;
  }
};

var TextModelSearch = class {
  static findMatches(model, searchParams, searchRange, captureMatches, limitResultCount) {
    const searchData = searchParams.parseSearchRequest();
    if (!searchData) {
      return [];
    }
    if (searchData.regex.multiline) {
      return this._doFindMatchesMultiline(model, searchRange, new Searcher(searchData.wordSeparators, searchData.regex), captureMatches, limitResultCount);
    }
    return this._doFindMatchesLineByLine(model, searchRange, searchData, captureMatches, limitResultCount);
  }
  /**
   * Multiline search always executes on the lines concatenated with \n.
   * We must therefore compensate for the count of \n in case the model is CRLF
   */
  static _getMultilineMatchRange(model, deltaOffset, text2, lfCounter, matchIndex, match0) {
    let startOffset;
    let lineFeedCountBeforeMatch = 0;
    if (lfCounter) {
      lineFeedCountBeforeMatch = lfCounter.findLineFeedCountBeforeOffset(matchIndex);
      startOffset = deltaOffset + matchIndex + lineFeedCountBeforeMatch;
    } else {
      startOffset = deltaOffset + matchIndex;
    }
    let endOffset;
    if (lfCounter) {
      const lineFeedCountBeforeEndOfMatch = lfCounter.findLineFeedCountBeforeOffset(matchIndex + match0.length);
      const lineFeedCountInMatch = lineFeedCountBeforeEndOfMatch - lineFeedCountBeforeMatch;
      endOffset = startOffset + match0.length + lineFeedCountInMatch;
    } else {
      endOffset = startOffset + match0.length;
    }
    const startPosition = model.getPositionAt(startOffset);
    const endPosition = model.getPositionAt(endOffset);
    return new Range2(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
  }
  static _doFindMatchesMultiline(model, searchRange, searcher, captureMatches, limitResultCount) {
    const deltaOffset = model.getOffsetAt(searchRange.getStartPosition());
    const text2 = model.getValueInRange(searchRange, 1 /* LF */);
    const lfCounter = model.getEOL() === "\r\n" ? new LineFeedCounter(text2) : null;
    const result = [];
    let counter = 0;
    let m;
    searcher.reset(0);
    while (m = searcher.next(text2)) {
      result[counter++] = createFindMatch(this._getMultilineMatchRange(model, deltaOffset, text2, lfCounter, m.index, m[0]), m, captureMatches);
      if (counter >= limitResultCount) {
        return result;
      }
    }
    return result;
  }
  static _doFindMatchesLineByLine(model, searchRange, searchData, captureMatches, limitResultCount) {
    const result = [];
    let resultLen = 0;
    if (searchRange.startLineNumber === searchRange.endLineNumber) {
      const text3 = model.getLineContent(searchRange.startLineNumber).substring(searchRange.startColumn - 1, searchRange.endColumn - 1);
      resultLen = this._findMatchesInLine(searchData, text3, searchRange.startLineNumber, searchRange.startColumn - 1, resultLen, result, captureMatches, limitResultCount);
      return result;
    }
    const text2 = model.getLineContent(searchRange.startLineNumber).substring(searchRange.startColumn - 1);
    resultLen = this._findMatchesInLine(searchData, text2, searchRange.startLineNumber, searchRange.startColumn - 1, resultLen, result, captureMatches, limitResultCount);
    for (let lineNumber = searchRange.startLineNumber + 1; lineNumber < searchRange.endLineNumber && resultLen < limitResultCount; lineNumber++) {
      resultLen = this._findMatchesInLine(searchData, model.getLineContent(lineNumber), lineNumber, 0, resultLen, result, captureMatches, limitResultCount);
    }
    if (resultLen < limitResultCount) {
      const text3 = model.getLineContent(searchRange.endLineNumber).substring(0, searchRange.endColumn - 1);
      resultLen = this._findMatchesInLine(searchData, text3, searchRange.endLineNumber, 0, resultLen, result, captureMatches, limitResultCount);
    }
    return result;
  }
  static _findMatchesInLine(searchData, text2, lineNumber, deltaOffset, resultLen, result, captureMatches, limitResultCount) {
    const wordSeparators2 = searchData.wordSeparators;
    if (!captureMatches && searchData.simpleSearch) {
      const searchString = searchData.simpleSearch;
      const searchStringLen = searchString.length;
      const textLength = text2.length;
      let lastMatchIndex = -searchStringLen;
      while ((lastMatchIndex = text2.indexOf(searchString, lastMatchIndex + searchStringLen)) !== -1) {
        if (!wordSeparators2 || isValidMatch(wordSeparators2, text2, textLength, lastMatchIndex, searchStringLen)) {
          result[resultLen++] = new FindMatch(new Range2(lineNumber, lastMatchIndex + 1 + deltaOffset, lineNumber, lastMatchIndex + 1 + searchStringLen + deltaOffset), null);
          if (resultLen >= limitResultCount) {
            return resultLen;
          }
        }
      }
      return resultLen;
    }
    const searcher = new Searcher(searchData.wordSeparators, searchData.regex);
    let m;
    searcher.reset(0);
    do {
      m = searcher.next(text2);
      if (m) {
        result[resultLen++] = createFindMatch(new Range2(lineNumber, m.index + 1 + deltaOffset, lineNumber, m.index + 1 + m[0].length + deltaOffset), m, captureMatches);
        if (resultLen >= limitResultCount) {
          return resultLen;
        }
      }
    } while (m);
    return resultLen;
  }
  static findNextMatch(model, searchParams, searchStart, captureMatches) {
    const searchData = searchParams.parseSearchRequest();
    if (!searchData) {
      return null;
    }
    const searcher = new Searcher(searchData.wordSeparators, searchData.regex);
    if (searchData.regex.multiline) {
      return this._doFindNextMatchMultiline(model, searchStart, searcher, captureMatches);
    }
    return this._doFindNextMatchLineByLine(model, searchStart, searcher, captureMatches);
  }
  static _doFindNextMatchMultiline(model, searchStart, searcher, captureMatches) {
    const searchTextStart = new Position(searchStart.lineNumber, 1);
    const deltaOffset = model.getOffsetAt(searchTextStart);
    const lineCount = model.getLineCount();
    const text2 = model.getValueInRange(new Range2(searchTextStart.lineNumber, searchTextStart.column, lineCount, model.getLineMaxColumn(lineCount)), 1 /* LF */);
    const lfCounter = model.getEOL() === "\r\n" ? new LineFeedCounter(text2) : null;
    searcher.reset(searchStart.column - 1);
    const m = searcher.next(text2);
    if (m) {
      return createFindMatch(
        this._getMultilineMatchRange(model, deltaOffset, text2, lfCounter, m.index, m[0]),
        m,
        captureMatches
      );
    }
    if (searchStart.lineNumber !== 1 || searchStart.column !== 1) {
      return this._doFindNextMatchMultiline(model, new Position(1, 1), searcher, captureMatches);
    }
    return null;
  }
  static _doFindNextMatchLineByLine(model, searchStart, searcher, captureMatches) {
    const lineCount = model.getLineCount();
    const startLineNumber = searchStart.lineNumber;
    const text2 = model.getLineContent(startLineNumber);
    const r2 = this._findFirstMatchInLine(searcher, text2, startLineNumber, searchStart.column, captureMatches);
    if (r2) {
      return r2;
    }
    for (let i2 = 1; i2 <= lineCount; i2++) {
      const lineIndex = (startLineNumber + i2 - 1) % lineCount;
      const text3 = model.getLineContent(lineIndex + 1);
      const r3 = this._findFirstMatchInLine(searcher, text3, lineIndex + 1, 1, captureMatches);
      if (r3) {
        return r3;
      }
    }
    return null;
  }
  static _findFirstMatchInLine(searcher, text2, lineNumber, fromColumn, captureMatches) {
    searcher.reset(fromColumn - 1);
    const m = searcher.next(text2);
    if (m) {
      return createFindMatch(
        new Range2(lineNumber, m.index + 1, lineNumber, m.index + 1 + m[0].length),
        m,
        captureMatches
      );
    }
    return null;
  }
  static findPreviousMatch(model, searchParams, searchStart, captureMatches) {
    const searchData = searchParams.parseSearchRequest();
    if (!searchData) {
      return null;
    }
    const searcher = new Searcher(searchData.wordSeparators, searchData.regex);
    if (searchData.regex.multiline) {
      return this._doFindPreviousMatchMultiline(model, searchStart, searcher, captureMatches);
    }
    return this._doFindPreviousMatchLineByLine(model, searchStart, searcher, captureMatches);
  }
  static _doFindPreviousMatchMultiline(model, searchStart, searcher, captureMatches) {
    const matches2 = this._doFindMatchesMultiline(model, new Range2(1, 1, searchStart.lineNumber, searchStart.column), searcher, captureMatches, 10 * LIMIT_FIND_COUNT);
    if (matches2.length > 0) {
      return matches2[matches2.length - 1];
    }
    const lineCount = model.getLineCount();
    if (searchStart.lineNumber !== lineCount || searchStart.column !== model.getLineMaxColumn(lineCount)) {
      return this._doFindPreviousMatchMultiline(model, new Position(lineCount, model.getLineMaxColumn(lineCount)), searcher, captureMatches);
    }
    return null;
  }
  static _doFindPreviousMatchLineByLine(model, searchStart, searcher, captureMatches) {
    const lineCount = model.getLineCount();
    const startLineNumber = searchStart.lineNumber;
    const text2 = model.getLineContent(startLineNumber).substring(0, searchStart.column - 1);
    const r2 = this._findLastMatchInLine(searcher, text2, startLineNumber, captureMatches);
    if (r2) {
      return r2;
    }
    for (let i2 = 1; i2 <= lineCount; i2++) {
      const lineIndex = (lineCount + startLineNumber - i2 - 1) % lineCount;
      const text3 = model.getLineContent(lineIndex + 1);
      const r3 = this._findLastMatchInLine(searcher, text3, lineIndex + 1, captureMatches);
      if (r3) {
        return r3;
      }
    }
    return null;
  }
  static _findLastMatchInLine(searcher, text2, lineNumber, captureMatches) {
    let bestResult = null;
    let m;
    searcher.reset(0);
    while (m = searcher.next(text2)) {
      bestResult = createFindMatch(new Range2(lineNumber, m.index + 1, lineNumber, m.index + 1 + m[0].length), m, captureMatches);
    }
    return bestResult;
  }
};

function leftIsWordBounday(wordSeparators2, text2, textLength, matchStartIndex, matchLength) {
  if (matchStartIndex === 0) {
    return true;
  }
  const charBefore = text2.charCodeAt(matchStartIndex - 1);
  if (wordSeparators2.get(charBefore) !== 0 /* Regular */) {
    return true;
  }
  if (charBefore === 13 /* CarriageReturn */ || charBefore === 10 /* LineFeed */) {
    return true;
  }
  if (matchLength > 0) {
    const firstCharInMatch = text2.charCodeAt(matchStartIndex);
    if (wordSeparators2.get(firstCharInMatch) !== 0 /* Regular */) {
      return true;
    }
  }
  return false;
}

function rightIsWordBounday(wordSeparators2, text2, textLength, matchStartIndex, matchLength) {
  if (matchStartIndex + matchLength === textLength) {
    return true;
  }
  const charAfter = text2.charCodeAt(matchStartIndex + matchLength);
  if (wordSeparators2.get(charAfter) !== 0 /* Regular */) {
    return true;
  }
  if (charAfter === 13 /* CarriageReturn */ || charAfter === 10 /* LineFeed */) {
    return true;
  }
  if (matchLength > 0) {
    const lastCharInMatch = text2.charCodeAt(matchStartIndex + matchLength - 1);
    if (wordSeparators2.get(lastCharInMatch) !== 0 /* Regular */) {
      return true;
    }
  }
  return false;
}

function isValidMatch(wordSeparators2, text2, textLength, matchStartIndex, matchLength) {
  return leftIsWordBounday(wordSeparators2, text2, textLength, matchStartIndex, matchLength) && rightIsWordBounday(wordSeparators2, text2, textLength, matchStartIndex, matchLength);
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
  next(text2) {
    const textLength = text2.length;
    let m;
    do {
      if (this._prevMatchStartIndex + this._prevMatchLength === textLength) {
        return null;
      }
      m = this._searchRegex.exec(text2);
      if (!m) {
        return null;
      }
      const matchStartIndex = m.index;
      const matchLength = m[0].length;
      if (matchStartIndex === this._prevMatchStartIndex && matchLength === this._prevMatchLength) {
        if (matchLength === 0) {
          if (getNextCodePoint(text2, textLength, this._searchRegex.lastIndex) > 65535) {
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
      if (!this._wordSeparators || isValidMatch(this._wordSeparators, text2, textLength, matchStartIndex, matchLength)) {
        return m;
      }
    } while (m);
    return null;
  }
};
export { isMultilineRegexSource, createFindMatch, leftIsWordBounday, rightIsWordBounday, isValidMatch, LIMIT_FIND_COUNT, SearchParams, LineFeedCounter, TextModelSearch, Searcher };
