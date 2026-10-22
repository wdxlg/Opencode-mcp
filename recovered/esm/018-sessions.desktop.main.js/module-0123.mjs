// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/cursor/cursorWordOperations.ts
import { Position } from "./module-0079.mjs";
import { isAsciiDigit, isLowerAsciiLetter, isUpperAsciiLetter, lastNonWhitespaceIndex } from "./module-0030.mjs";
import { Range2 } from "./module-0106.mjs";
import { DeleteOperations } from "./module-0119.mjs";
import { getMapForWordSeparators } from "./module-0122.mjs";
import { SingleCursorState } from "./module-0113.mjs";


// src/vs/editor/common/cursor/cursorWordOperations.ts
var WordOperations = class _WordOperations {
  static _createWord(lineContent, wordType, nextCharClass, start, end) {
    return { start, end, wordType, nextCharClass };
  }
  static _createIntlWord(intlWord, nextCharClass) {
    return { start: intlWord.index, end: intlWord.index + intlWord.segment.length, wordType: 1 /* Regular */, nextCharClass };
  }
  static _findPreviousWordOnLine(wordSeparators2, model, position2) {
    const lineContent = model.getLineContent(position2.lineNumber);
    return this._doFindPreviousWordOnLine(lineContent, wordSeparators2, position2);
  }
  static _doFindPreviousWordOnLine(lineContent, wordSeparators2, position2) {
    let wordType = 0 /* None */;
    const previousIntlWord = wordSeparators2.findPrevIntlWordBeforeOrAtOffset(lineContent, position2.column - 2);
    for (let chIndex = position2.column - 2; chIndex >= 0; chIndex--) {
      const chCode = lineContent.charCodeAt(chIndex);
      const chClass = wordSeparators2.get(chCode);
      if (previousIntlWord && chIndex === previousIntlWord.index) {
        return this._createIntlWord(previousIntlWord, chClass);
      }
      if (chClass === 0 /* Regular */) {
        if (wordType === 2 /* Separator */) {
          return this._createWord(lineContent, wordType, chClass, chIndex + 1, this._findEndOfWord(lineContent, wordSeparators2, wordType, chIndex + 1));
        }
        wordType = 1 /* Regular */;
      } else if (chClass === 2 /* WordSeparator */) {
        if (wordType === 1 /* Regular */) {
          return this._createWord(lineContent, wordType, chClass, chIndex + 1, this._findEndOfWord(lineContent, wordSeparators2, wordType, chIndex + 1));
        }
        wordType = 2 /* Separator */;
      } else if (chClass === 1 /* Whitespace */) {
        if (wordType !== 0 /* None */) {
          return this._createWord(lineContent, wordType, chClass, chIndex + 1, this._findEndOfWord(lineContent, wordSeparators2, wordType, chIndex + 1));
        }
      }
    }
    if (wordType !== 0 /* None */) {
      return this._createWord(lineContent, wordType, 1 /* Whitespace */, 0, this._findEndOfWord(lineContent, wordSeparators2, wordType, 0));
    }
    return null;
  }
  static _findEndOfWord(lineContent, wordSeparators2, wordType, startIndex) {
    const nextIntlWord = wordSeparators2.findNextIntlWordAtOrAfterOffset(lineContent, startIndex);
    const len = lineContent.length;
    for (let chIndex = startIndex; chIndex < len; chIndex++) {
      const chCode = lineContent.charCodeAt(chIndex);
      const chClass = wordSeparators2.get(chCode);
      if (nextIntlWord && chIndex === nextIntlWord.index + nextIntlWord.segment.length) {
        return chIndex;
      }
      if (chClass === 1 /* Whitespace */) {
        return chIndex;
      }
      if (wordType === 1 /* Regular */ && chClass === 2 /* WordSeparator */) {
        return chIndex;
      }
      if (wordType === 2 /* Separator */ && chClass === 0 /* Regular */) {
        return chIndex;
      }
    }
    return len;
  }
  static _findNextWordOnLine(wordSeparators2, model, position2) {
    const lineContent = model.getLineContent(position2.lineNumber);
    return this._doFindNextWordOnLine(lineContent, wordSeparators2, position2);
  }
  static _doFindNextWordOnLine(lineContent, wordSeparators2, position2) {
    let wordType = 0 /* None */;
    const len = lineContent.length;
    const nextIntlWord = wordSeparators2.findNextIntlWordAtOrAfterOffset(lineContent, position2.column - 1);
    for (let chIndex = position2.column - 1; chIndex < len; chIndex++) {
      const chCode = lineContent.charCodeAt(chIndex);
      const chClass = wordSeparators2.get(chCode);
      if (nextIntlWord && chIndex === nextIntlWord.index) {
        return this._createIntlWord(nextIntlWord, chClass);
      }
      if (chClass === 0 /* Regular */) {
        if (wordType === 2 /* Separator */) {
          return this._createWord(lineContent, wordType, chClass, this._findStartOfWord(lineContent, wordSeparators2, wordType, chIndex - 1), chIndex);
        }
        wordType = 1 /* Regular */;
      } else if (chClass === 2 /* WordSeparator */) {
        if (wordType === 1 /* Regular */) {
          return this._createWord(lineContent, wordType, chClass, this._findStartOfWord(lineContent, wordSeparators2, wordType, chIndex - 1), chIndex);
        }
        wordType = 2 /* Separator */;
      } else if (chClass === 1 /* Whitespace */) {
        if (wordType !== 0 /* None */) {
          return this._createWord(lineContent, wordType, chClass, this._findStartOfWord(lineContent, wordSeparators2, wordType, chIndex - 1), chIndex);
        }
      }
    }
    if (wordType !== 0 /* None */) {
      return this._createWord(lineContent, wordType, 1 /* Whitespace */, this._findStartOfWord(lineContent, wordSeparators2, wordType, len - 1), len);
    }
    return null;
  }
  static _findStartOfWord(lineContent, wordSeparators2, wordType, startIndex) {
    const previousIntlWord = wordSeparators2.findPrevIntlWordBeforeOrAtOffset(lineContent, startIndex);
    for (let chIndex = startIndex; chIndex >= 0; chIndex--) {
      const chCode = lineContent.charCodeAt(chIndex);
      const chClass = wordSeparators2.get(chCode);
      if (previousIntlWord && chIndex === previousIntlWord.index) {
        return chIndex;
      }
      if (chClass === 1 /* Whitespace */) {
        return chIndex + 1;
      }
      if (wordType === 1 /* Regular */ && chClass === 2 /* WordSeparator */) {
        return chIndex + 1;
      }
      if (wordType === 2 /* Separator */ && chClass === 0 /* Regular */) {
        return chIndex + 1;
      }
    }
    return 0;
  }
  static moveWordLeft(wordSeparators2, model, position2, wordNavigationType, hasMulticursor) {
    let lineNumber = position2.lineNumber;
    let column = position2.column;
    if (column === 1) {
      if (lineNumber > 1) {
        lineNumber = lineNumber - 1;
        column = model.getLineMaxColumn(lineNumber);
      }
    }
    let prevWordOnLine = _WordOperations._findPreviousWordOnLine(wordSeparators2, model, new Position(lineNumber, column));
    if (wordNavigationType === 0 /* WordStart */) {
      return new Position(lineNumber, prevWordOnLine ? prevWordOnLine.start + 1 : 1);
    }
    if (wordNavigationType === 1 /* WordStartFast */) {
      if (!hasMulticursor && prevWordOnLine && prevWordOnLine.wordType === 2 /* Separator */ && prevWordOnLine.end - prevWordOnLine.start === 1 && prevWordOnLine.nextCharClass === 0 /* Regular */) {
        prevWordOnLine = _WordOperations._findPreviousWordOnLine(wordSeparators2, model, new Position(lineNumber, prevWordOnLine.start + 1));
      }
      return new Position(lineNumber, prevWordOnLine ? prevWordOnLine.start + 1 : 1);
    }
    if (wordNavigationType === 3 /* WordAccessibility */) {
      while (prevWordOnLine && prevWordOnLine.wordType === 2 /* Separator */) {
        prevWordOnLine = _WordOperations._findPreviousWordOnLine(wordSeparators2, model, new Position(lineNumber, prevWordOnLine.start + 1));
      }
      return new Position(lineNumber, prevWordOnLine ? prevWordOnLine.start + 1 : 1);
    }
    if (prevWordOnLine && column <= prevWordOnLine.end + 1) {
      prevWordOnLine = _WordOperations._findPreviousWordOnLine(wordSeparators2, model, new Position(lineNumber, prevWordOnLine.start + 1));
    }
    return new Position(lineNumber, prevWordOnLine ? prevWordOnLine.end + 1 : 1);
  }
  static _moveWordPartLeft(model, position2) {
    const lineNumber = position2.lineNumber;
    const maxColumn = model.getLineMaxColumn(lineNumber);
    if (position2.column === 1) {
      return lineNumber > 1 ? new Position(lineNumber - 1, model.getLineMaxColumn(lineNumber - 1)) : position2;
    }
    const lineContent = model.getLineContent(lineNumber);
    for (let column = position2.column - 1; column > 1; column--) {
      const left = lineContent.charCodeAt(column - 2);
      const right = lineContent.charCodeAt(column - 1);
      if (left === 95 /* Underline */ && right !== 95 /* Underline */) {
        return new Position(lineNumber, column);
      }
      if (left === 45 /* Dash */ && right !== 45 /* Dash */) {
        return new Position(lineNumber, column);
      }
      if ((isLowerAsciiLetter(left) || isAsciiDigit(left)) && isUpperAsciiLetter(right)) {
        return new Position(lineNumber, column);
      }
      if (isUpperAsciiLetter(left) && isUpperAsciiLetter(right)) {
        if (column + 1 < maxColumn) {
          const rightRight = lineContent.charCodeAt(column);
          if (isLowerAsciiLetter(rightRight) || isAsciiDigit(rightRight)) {
            return new Position(lineNumber, column);
          }
        }
      }
    }
    return new Position(lineNumber, 1);
  }
  static moveWordRight(wordSeparators2, model, position2, wordNavigationType) {
    let lineNumber = position2.lineNumber;
    let column = position2.column;
    let movedDown = false;
    if (column === model.getLineMaxColumn(lineNumber)) {
      if (lineNumber < model.getLineCount()) {
        movedDown = true;
        lineNumber = lineNumber + 1;
        column = 1;
      }
    }
    let nextWordOnLine = _WordOperations._findNextWordOnLine(wordSeparators2, model, new Position(lineNumber, column));
    if (wordNavigationType === 2 /* WordEnd */) {
      if (nextWordOnLine && nextWordOnLine.wordType === 2 /* Separator */) {
        if (nextWordOnLine.end - nextWordOnLine.start === 1 && nextWordOnLine.nextCharClass === 0 /* Regular */) {
          nextWordOnLine = _WordOperations._findNextWordOnLine(wordSeparators2, model, new Position(lineNumber, nextWordOnLine.end + 1));
        }
      }
      if (nextWordOnLine) {
        column = nextWordOnLine.end + 1;
      } else {
        column = model.getLineMaxColumn(lineNumber);
      }
    } else if (wordNavigationType === 3 /* WordAccessibility */) {
      if (movedDown) {
        column = 0;
      }
      while (nextWordOnLine && (nextWordOnLine.wordType === 2 /* Separator */ || nextWordOnLine.start + 1 <= column)) {
        nextWordOnLine = _WordOperations._findNextWordOnLine(wordSeparators2, model, new Position(lineNumber, nextWordOnLine.end + 1));
      }
      if (nextWordOnLine) {
        column = nextWordOnLine.start + 1;
      } else {
        column = model.getLineMaxColumn(lineNumber);
      }
    } else {
      if (nextWordOnLine && !movedDown && column >= nextWordOnLine.start + 1) {
        nextWordOnLine = _WordOperations._findNextWordOnLine(wordSeparators2, model, new Position(lineNumber, nextWordOnLine.end + 1));
      }
      if (nextWordOnLine) {
        column = nextWordOnLine.start + 1;
      } else {
        column = model.getLineMaxColumn(lineNumber);
      }
    }
    return new Position(lineNumber, column);
  }
  static _moveWordPartRight(model, position2) {
    const lineNumber = position2.lineNumber;
    const maxColumn = model.getLineMaxColumn(lineNumber);
    if (position2.column === maxColumn) {
      return lineNumber < model.getLineCount() ? new Position(lineNumber + 1, 1) : position2;
    }
    const lineContent = model.getLineContent(lineNumber);
    for (let column = position2.column + 1; column < maxColumn; column++) {
      const left = lineContent.charCodeAt(column - 2);
      const right = lineContent.charCodeAt(column - 1);
      if (left !== 95 /* Underline */ && right === 95 /* Underline */) {
        return new Position(lineNumber, column);
      }
      if (left !== 45 /* Dash */ && right === 45 /* Dash */) {
        return new Position(lineNumber, column);
      }
      if ((isLowerAsciiLetter(left) || isAsciiDigit(left)) && isUpperAsciiLetter(right)) {
        return new Position(lineNumber, column);
      }
      if (isUpperAsciiLetter(left) && isUpperAsciiLetter(right)) {
        if (column + 1 < maxColumn) {
          const rightRight = lineContent.charCodeAt(column);
          if (isLowerAsciiLetter(rightRight) || isAsciiDigit(rightRight)) {
            return new Position(lineNumber, column);
          }
        }
      }
    }
    return new Position(lineNumber, maxColumn);
  }
  static _deleteWordLeftWhitespace(model, position2) {
    const lineContent = model.getLineContent(position2.lineNumber);
    const startIndex = position2.column - 2;
    const lastNonWhitespace = lastNonWhitespaceIndex(lineContent, startIndex);
    if (lastNonWhitespace + 1 < startIndex) {
      return new Range2(position2.lineNumber, lastNonWhitespace + 2, position2.lineNumber, position2.column);
    }
    return null;
  }
  static deleteWordLeft(ctx, wordNavigationType) {
    const wordSeparators2 = ctx.wordSeparators;
    const model = ctx.model;
    const selection = ctx.selection;
    const whitespaceHeuristics = ctx.whitespaceHeuristics;
    if (!selection.isEmpty()) {
      return selection;
    }
    if (DeleteOperations.isAutoClosingPairDelete(ctx.autoClosingDelete, ctx.autoClosingBrackets, ctx.autoClosingQuotes, ctx.autoClosingPairs.autoClosingPairsOpenByEnd, ctx.model, [ctx.selection], ctx.autoClosedCharacters)) {
      const position3 = ctx.selection.getPosition();
      return new Range2(position3.lineNumber, position3.column - 1, position3.lineNumber, position3.column + 1);
    }
    const position2 = new Position(selection.positionLineNumber, selection.positionColumn);
    let lineNumber = position2.lineNumber;
    let column = position2.column;
    if (lineNumber === 1 && column === 1) {
      return null;
    }
    if (whitespaceHeuristics) {
      const r2 = this._deleteWordLeftWhitespace(model, position2);
      if (r2) {
        return r2;
      }
    }
    let prevWordOnLine = _WordOperations._findPreviousWordOnLine(wordSeparators2, model, position2);
    if (wordNavigationType === 0 /* WordStart */) {
      if (prevWordOnLine) {
        column = prevWordOnLine.start + 1;
      } else {
        if (column > 1) {
          column = 1;
        } else {
          lineNumber--;
          column = model.getLineMaxColumn(lineNumber);
        }
      }
    } else {
      if (prevWordOnLine && column <= prevWordOnLine.end + 1) {
        prevWordOnLine = _WordOperations._findPreviousWordOnLine(wordSeparators2, model, new Position(lineNumber, prevWordOnLine.start + 1));
      }
      if (prevWordOnLine) {
        column = prevWordOnLine.end + 1;
      } else {
        if (column > 1) {
          column = 1;
        } else {
          lineNumber--;
          column = model.getLineMaxColumn(lineNumber);
        }
      }
    }
    return new Range2(lineNumber, column, position2.lineNumber, position2.column);
  }
  static deleteInsideWord(wordSeparators2, model, selection, onlyWord = false) {
    if (!selection.isEmpty()) {
      return selection;
    }
    const position2 = new Position(selection.positionLineNumber, selection.positionColumn);
    const r2 = this._deleteInsideWordWhitespace(model, position2);
    if (r2) {
      return r2;
    }
    return this._deleteInsideWordDetermineDeleteRange(wordSeparators2, model, position2, onlyWord);
  }
  static _charAtIsWhitespace(str, index2) {
    const charCode = str.charCodeAt(index2);
    return charCode === 32 /* Space */ || charCode === 9 /* Tab */;
  }
  static _deleteInsideWordWhitespace(model, position2) {
    const lineContent = model.getLineContent(position2.lineNumber);
    const lineContentLength = lineContent.length;
    if (lineContentLength === 0) {
      return null;
    }
    let leftIndex = Math.max(position2.column - 2, 0);
    if (!this._charAtIsWhitespace(lineContent, leftIndex)) {
      return null;
    }
    let rightIndex = Math.min(position2.column - 1, lineContentLength - 1);
    if (!this._charAtIsWhitespace(lineContent, rightIndex)) {
      return null;
    }
    while (leftIndex > 0 && this._charAtIsWhitespace(lineContent, leftIndex - 1)) {
      leftIndex--;
    }
    while (rightIndex + 1 < lineContentLength && this._charAtIsWhitespace(lineContent, rightIndex + 1)) {
      rightIndex++;
    }
    return new Range2(position2.lineNumber, leftIndex + 1, position2.lineNumber, rightIndex + 2);
  }
  static _deleteInsideWordDetermineDeleteRange(wordSeparators2, model, position2, onlyWord) {
    const lineContent = model.getLineContent(position2.lineNumber);
    const lineLength = lineContent.length;
    if (lineLength === 0) {
      if (position2.lineNumber > 1) {
        return new Range2(position2.lineNumber - 1, model.getLineMaxColumn(position2.lineNumber - 1), position2.lineNumber, 1);
      } else {
        if (position2.lineNumber < model.getLineCount()) {
          return new Range2(position2.lineNumber, 1, position2.lineNumber + 1, 1);
        } else {
          return new Range2(position2.lineNumber, 1, position2.lineNumber, 1);
        }
      }
    }
    const touchesWord = (word) => {
      return word.start + 1 <= position2.column && position2.column <= word.end + 1;
    };
    const createRangeWithPosition = (startColumn, endColumn) => {
      startColumn = Math.min(startColumn, position2.column);
      endColumn = Math.max(endColumn, position2.column);
      return new Range2(position2.lineNumber, startColumn, position2.lineNumber, endColumn);
    };
    const deleteWordAndAdjacentWhitespace = (word) => {
      let startColumn = word.start + 1;
      let endColumn = word.end + 1;
      if (onlyWord) {
        return createRangeWithPosition(startColumn, endColumn);
      }
      let expandedToTheRight = false;
      while (endColumn - 1 < lineLength && this._charAtIsWhitespace(lineContent, endColumn - 1)) {
        expandedToTheRight = true;
        endColumn++;
      }
      if (!expandedToTheRight) {
        while (startColumn > 1 && this._charAtIsWhitespace(lineContent, startColumn - 2)) {
          startColumn--;
        }
      }
      return createRangeWithPosition(startColumn, endColumn);
    };
    const prevWordOnLine = _WordOperations._findPreviousWordOnLine(wordSeparators2, model, position2);
    if (prevWordOnLine && touchesWord(prevWordOnLine)) {
      return deleteWordAndAdjacentWhitespace(prevWordOnLine);
    }
    const nextWordOnLine = _WordOperations._findNextWordOnLine(wordSeparators2, model, position2);
    if (nextWordOnLine && touchesWord(nextWordOnLine)) {
      return deleteWordAndAdjacentWhitespace(nextWordOnLine);
    }
    if (prevWordOnLine && nextWordOnLine) {
      return createRangeWithPosition(prevWordOnLine.end + 1, nextWordOnLine.start + 1);
    }
    if (prevWordOnLine) {
      return createRangeWithPosition(prevWordOnLine.start + 1, prevWordOnLine.end + 1);
    }
    if (nextWordOnLine) {
      return createRangeWithPosition(nextWordOnLine.start + 1, nextWordOnLine.end + 1);
    }
    return createRangeWithPosition(1, lineLength + 1);
  }
  static _deleteWordPartLeft(model, selection) {
    if (!selection.isEmpty()) {
      return selection;
    }
    const pos = selection.getPosition();
    const toPosition = _WordOperations._moveWordPartLeft(model, pos);
    return new Range2(pos.lineNumber, pos.column, toPosition.lineNumber, toPosition.column);
  }
  static _findFirstNonWhitespaceChar(str, startIndex) {
    const len = str.length;
    for (let chIndex = startIndex; chIndex < len; chIndex++) {
      const ch = str.charAt(chIndex);
      if (ch !== " " && ch !== "	") {
        return chIndex;
      }
    }
    return len;
  }
  static _deleteWordRightWhitespace(model, position2) {
    const lineContent = model.getLineContent(position2.lineNumber);
    const startIndex = position2.column - 1;
    const firstNonWhitespace = this._findFirstNonWhitespaceChar(lineContent, startIndex);
    if (startIndex < firstNonWhitespace) {
      return new Range2(position2.lineNumber, position2.column, position2.lineNumber, firstNonWhitespace + 1);
    }
    return null;
  }
  static deleteWordRight(ctx, wordNavigationType) {
    const wordSeparators2 = ctx.wordSeparators;
    const model = ctx.model;
    const selection = ctx.selection;
    const whitespaceHeuristics = ctx.whitespaceHeuristics;
    if (!selection.isEmpty()) {
      return selection;
    }
    const position2 = new Position(selection.positionLineNumber, selection.positionColumn);
    let lineNumber = position2.lineNumber;
    let column = position2.column;
    const lineCount = model.getLineCount();
    const maxColumn = model.getLineMaxColumn(lineNumber);
    if (lineNumber === lineCount && column === maxColumn) {
      return null;
    }
    if (whitespaceHeuristics) {
      const r2 = this._deleteWordRightWhitespace(model, position2);
      if (r2) {
        return r2;
      }
    }
    let nextWordOnLine = _WordOperations._findNextWordOnLine(wordSeparators2, model, position2);
    if (wordNavigationType === 2 /* WordEnd */) {
      if (nextWordOnLine) {
        column = nextWordOnLine.end + 1;
      } else {
        if (column < maxColumn || lineNumber === lineCount) {
          column = maxColumn;
        } else {
          lineNumber++;
          nextWordOnLine = _WordOperations._findNextWordOnLine(wordSeparators2, model, new Position(lineNumber, 1));
          if (nextWordOnLine) {
            column = nextWordOnLine.start + 1;
          } else {
            column = model.getLineMaxColumn(lineNumber);
          }
        }
      }
    } else {
      if (nextWordOnLine && column >= nextWordOnLine.start + 1) {
        nextWordOnLine = _WordOperations._findNextWordOnLine(wordSeparators2, model, new Position(lineNumber, nextWordOnLine.end + 1));
      }
      if (nextWordOnLine) {
        column = nextWordOnLine.start + 1;
      } else {
        if (column < maxColumn || lineNumber === lineCount) {
          column = maxColumn;
        } else {
          lineNumber++;
          nextWordOnLine = _WordOperations._findNextWordOnLine(wordSeparators2, model, new Position(lineNumber, 1));
          if (nextWordOnLine) {
            column = nextWordOnLine.start + 1;
          } else {
            column = model.getLineMaxColumn(lineNumber);
          }
        }
      }
    }
    return new Range2(lineNumber, column, position2.lineNumber, position2.column);
  }
  static _deleteWordPartRight(model, selection) {
    if (!selection.isEmpty()) {
      return selection;
    }
    const pos = selection.getPosition();
    const toPosition = _WordOperations._moveWordPartRight(model, pos);
    return new Range2(pos.lineNumber, pos.column, toPosition.lineNumber, toPosition.column);
  }
  static _createWordAtPosition(model, lineNumber, word) {
    const range2 = new Range2(lineNumber, word.start + 1, lineNumber, word.end + 1);
    return {
      word: model.getValueInRange(range2),
      startColumn: range2.startColumn,
      endColumn: range2.endColumn
    };
  }
  static getWordAtPosition(model, _wordSeparators, _intlSegmenterLocales, position2) {
    const wordSeparators2 = getMapForWordSeparators(_wordSeparators, _intlSegmenterLocales);
    const prevWord = _WordOperations._findPreviousWordOnLine(wordSeparators2, model, position2);
    if (prevWord && prevWord.wordType === 1 /* Regular */ && prevWord.start <= position2.column - 1 && position2.column - 1 <= prevWord.end) {
      return _WordOperations._createWordAtPosition(model, position2.lineNumber, prevWord);
    }
    const nextWord2 = _WordOperations._findNextWordOnLine(wordSeparators2, model, position2);
    if (nextWord2 && nextWord2.wordType === 1 /* Regular */ && nextWord2.start <= position2.column - 1 && position2.column - 1 <= nextWord2.end) {
      return _WordOperations._createWordAtPosition(model, position2.lineNumber, nextWord2);
    }
    return null;
  }
  static word(config, model, cursor, inSelectionMode, position2) {
    const wordSeparators2 = getMapForWordSeparators(config.wordSeparators, config.wordSegmenterLocales);
    const prevWord = _WordOperations._findPreviousWordOnLine(wordSeparators2, model, position2);
    const nextWord2 = _WordOperations._findNextWordOnLine(wordSeparators2, model, position2);
    if (!inSelectionMode) {
      let startColumn2;
      let endColumn2;
      if (prevWord && prevWord.wordType === 1 /* Regular */ && prevWord.start <= position2.column - 1 && position2.column - 1 <= prevWord.end) {
        startColumn2 = prevWord.start + 1;
        endColumn2 = prevWord.end + 1;
      } else if (prevWord && prevWord.wordType === 2 /* Separator */ && prevWord.start <= position2.column - 1 && position2.column - 1 < prevWord.end) {
        startColumn2 = prevWord.start + 1;
        endColumn2 = prevWord.end + 1;
      } else if (nextWord2 && nextWord2.wordType === 1 /* Regular */ && nextWord2.start <= position2.column - 1 && position2.column - 1 <= nextWord2.end) {
        startColumn2 = nextWord2.start + 1;
        endColumn2 = nextWord2.end + 1;
      } else if (nextWord2 && nextWord2.wordType === 2 /* Separator */ && nextWord2.start <= position2.column - 1 && position2.column - 1 < nextWord2.end) {
        startColumn2 = nextWord2.start + 1;
        endColumn2 = nextWord2.end + 1;
      } else {
        if (prevWord) {
          startColumn2 = prevWord.end + 1;
        } else {
          startColumn2 = 1;
        }
        if (nextWord2) {
          endColumn2 = nextWord2.start + 1;
        } else {
          endColumn2 = model.getLineMaxColumn(position2.lineNumber);
        }
      }
      return new SingleCursorState(
        new Range2(position2.lineNumber, startColumn2, position2.lineNumber, endColumn2),
        1 /* Word */,
        0,
        new Position(position2.lineNumber, endColumn2),
        0
      );
    }
    let startColumn;
    let endColumn;
    if (prevWord && prevWord.wordType === 1 /* Regular */ && prevWord.start < position2.column - 1 && position2.column - 1 < prevWord.end) {
      startColumn = prevWord.start + 1;
      endColumn = prevWord.end + 1;
    } else if (nextWord2 && nextWord2.wordType === 1 /* Regular */ && nextWord2.start < position2.column - 1 && position2.column - 1 < nextWord2.end) {
      startColumn = nextWord2.start + 1;
      endColumn = nextWord2.end + 1;
    } else {
      startColumn = position2.column;
      endColumn = position2.column;
    }
    const lineNumber = position2.lineNumber;
    let column;
    if (cursor.selectionStart.containsPosition(position2)) {
      column = cursor.selectionStart.endColumn;
    } else if (position2.isBeforeOrEqual(cursor.selectionStart.getStartPosition())) {
      column = startColumn;
      const possiblePosition = new Position(lineNumber, column);
      if (cursor.selectionStart.containsPosition(possiblePosition)) {
        column = cursor.selectionStart.endColumn;
      }
    } else {
      column = endColumn;
      const possiblePosition = new Position(lineNumber, column);
      if (cursor.selectionStart.containsPosition(possiblePosition)) {
        column = cursor.selectionStart.startColumn;
      }
    }
    return cursor.move(true, lineNumber, column, 0);
  }
};

var WordPartOperations = class extends WordOperations {
  static deleteWordPartLeft(ctx) {
    const candidates = enforceDefined([
      WordOperations.deleteWordLeft(ctx, 0 /* WordStart */),
      WordOperations.deleteWordLeft(ctx, 2 /* WordEnd */),
      WordOperations._deleteWordPartLeft(ctx.model, ctx.selection)
    ]);
    candidates.sort(Range2.compareRangesUsingEnds);
    return candidates[2];
  }
  static deleteWordPartRight(ctx) {
    const candidates = enforceDefined([
      WordOperations.deleteWordRight(ctx, 0 /* WordStart */),
      WordOperations.deleteWordRight(ctx, 2 /* WordEnd */),
      WordOperations._deleteWordPartRight(ctx.model, ctx.selection)
    ]);
    candidates.sort(Range2.compareRangesUsingStarts);
    return candidates[0];
  }
  static moveWordPartLeft(wordSeparators2, model, position2, hasMulticursor) {
    const candidates = enforceDefined([
      WordOperations.moveWordLeft(wordSeparators2, model, position2, 0 /* WordStart */, hasMulticursor),
      WordOperations.moveWordLeft(wordSeparators2, model, position2, 2 /* WordEnd */, hasMulticursor),
      WordOperations._moveWordPartLeft(model, position2)
    ]);
    candidates.sort(Position.compare);
    return candidates[2];
  }
  static moveWordPartRight(wordSeparators2, model, position2) {
    const candidates = enforceDefined([
      WordOperations.moveWordRight(wordSeparators2, model, position2, 0 /* WordStart */),
      WordOperations.moveWordRight(wordSeparators2, model, position2, 2 /* WordEnd */),
      WordOperations._moveWordPartRight(model, position2)
    ]);
    candidates.sort(Position.compare);
    return candidates[0];
  }
};

function enforceDefined(arr) {
  return arr.filter((el) => Boolean(el));
}
export { enforceDefined, WordOperations, WordPartOperations };
