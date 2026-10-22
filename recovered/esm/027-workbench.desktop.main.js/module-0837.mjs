// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/tokens/sparseMultilineTokens.ts
import { Range2 } from "./module-0106.mjs";
import { countEOL } from "./module-0375.mjs";
import { Position } from "./module-0079.mjs";
import { RateLimiter } from "./module-0836.mjs";


// src/vs/editor/common/tokens/sparseMultilineTokens.ts
var SparseMultilineTokens = class _SparseMultilineTokens {
  static create(startLineNumber, tokens) {
    return new _SparseMultilineTokens(startLineNumber, new SparseMultilineTokensStorage(tokens));
  }
  /**
   * (Inclusive) start line number for these tokens.
   */
  get startLineNumber() {
    return this._startLineNumber;
  }
  /**
   * (Inclusive) end line number for these tokens.
   */
  get endLineNumber() {
    return this._endLineNumber;
  }
  constructor(startLineNumber, tokens) {
    this._startLineNumber = startLineNumber;
    this._tokens = tokens;
    this._endLineNumber = this._startLineNumber + this._tokens.getMaxDeltaLine();
  }
  toString() {
    return this._tokens.toString(this._startLineNumber);
  }
  _updateEndLineNumber() {
    this._endLineNumber = this._startLineNumber + this._tokens.getMaxDeltaLine();
  }
  isEmpty() {
    return this._tokens.isEmpty();
  }
  getLineTokens(lineNumber) {
    if (this._startLineNumber <= lineNumber && lineNumber <= this._endLineNumber) {
      return this._tokens.getLineTokens(lineNumber - this._startLineNumber);
    }
    return null;
  }
  getRange() {
    const deltaRange = this._tokens.getRange();
    if (!deltaRange) {
      return deltaRange;
    }
    return new Range2(this._startLineNumber + deltaRange.startLineNumber, deltaRange.startColumn, this._startLineNumber + deltaRange.endLineNumber, deltaRange.endColumn);
  }
  removeTokens(range2) {
    const startLineIndex = range2.startLineNumber - this._startLineNumber;
    const endLineIndex = range2.endLineNumber - this._startLineNumber;
    this._startLineNumber += this._tokens.removeTokens(startLineIndex, range2.startColumn - 1, endLineIndex, range2.endColumn - 1);
    this._updateEndLineNumber();
  }
  split(range2) {
    const startLineIndex = range2.startLineNumber - this._startLineNumber;
    const endLineIndex = range2.endLineNumber - this._startLineNumber;
    const [a, b, bDeltaLine] = this._tokens.split(startLineIndex, range2.startColumn - 1, endLineIndex, range2.endColumn - 1);
    return [new _SparseMultilineTokens(this._startLineNumber, a), new _SparseMultilineTokens(this._startLineNumber + bDeltaLine, b)];
  }
  applyEdit(range2, text2) {
    const [eolCount, firstLineLength, lastLineLength] = countEOL(text2);
    this.acceptEdit(range2, eolCount, firstLineLength, lastLineLength, text2.length > 0 ? text2.charCodeAt(0) : 0 /* Null */);
  }
  acceptEdit(range2, eolCount, firstLineLength, lastLineLength, firstCharCode) {
    this._acceptDeleteRange(range2);
    this._acceptInsertText(new Position(range2.startLineNumber, range2.startColumn), eolCount, firstLineLength, lastLineLength, firstCharCode);
    this._updateEndLineNumber();
  }
  _acceptDeleteRange(range2) {
    if (range2.startLineNumber === range2.endLineNumber && range2.startColumn === range2.endColumn) {
      return;
    }
    const firstLineIndex = range2.startLineNumber - this._startLineNumber;
    const lastLineIndex = range2.endLineNumber - this._startLineNumber;
    if (lastLineIndex < 0) {
      const deletedLinesCount = lastLineIndex - firstLineIndex;
      this._startLineNumber -= deletedLinesCount;
      return;
    }
    const tokenMaxDeltaLine = this._tokens.getMaxDeltaLine();
    if (firstLineIndex >= tokenMaxDeltaLine + 1) {
      return;
    }
    if (firstLineIndex < 0 && lastLineIndex >= tokenMaxDeltaLine + 1) {
      this._startLineNumber = 0;
      this._tokens.clear();
      return;
    }
    if (firstLineIndex < 0) {
      const deletedBefore = -firstLineIndex;
      this._startLineNumber -= deletedBefore;
      this._tokens.acceptDeleteRange(range2.startColumn - 1, 0, 0, lastLineIndex, range2.endColumn - 1);
    } else {
      this._tokens.acceptDeleteRange(0, firstLineIndex, range2.startColumn - 1, lastLineIndex, range2.endColumn - 1);
    }
  }
  _acceptInsertText(position2, eolCount, firstLineLength, lastLineLength, firstCharCode) {
    if (eolCount === 0 && firstLineLength === 0) {
      return;
    }
    const lineIndex = position2.lineNumber - this._startLineNumber;
    if (lineIndex < 0) {
      this._startLineNumber += eolCount;
      return;
    }
    const tokenMaxDeltaLine = this._tokens.getMaxDeltaLine();
    if (lineIndex >= tokenMaxDeltaLine + 1) {
      return;
    }
    this._tokens.acceptInsertText(lineIndex, position2.column - 1, eolCount, firstLineLength, lastLineLength, firstCharCode);
  }
  reportIfInvalid(model) {
    this._tokens.reportIfInvalid(model, this._startLineNumber);
  }
};

var SparseMultilineTokensStorage = class _SparseMultilineTokensStorage {
  constructor(tokens) {
    this._tokens = tokens;
    this._tokenCount = tokens.length / 4;
  }
  toString(startLineNumber) {
    const pieces = [];
    for (let i2 = 0; i2 < this._tokenCount; i2++) {
      pieces.push(`(${this._getDeltaLine(i2) + startLineNumber},${this._getStartCharacter(i2)}-${this._getEndCharacter(i2)})`);
    }
    return `[${pieces.join(",")}]`;
  }
  getMaxDeltaLine() {
    const tokenCount = this._getTokenCount();
    if (tokenCount === 0) {
      return -1;
    }
    return this._getDeltaLine(tokenCount - 1);
  }
  getRange() {
    const tokenCount = this._getTokenCount();
    if (tokenCount === 0) {
      return null;
    }
    const startChar = this._getStartCharacter(0);
    const maxDeltaLine = this._getDeltaLine(tokenCount - 1);
    const endChar = this._getEndCharacter(tokenCount - 1);
    return new Range2(0, startChar + 1, maxDeltaLine, endChar + 1);
  }
  _getTokenCount() {
    return this._tokenCount;
  }
  _getDeltaLine(tokenIndex) {
    return this._tokens[4 * tokenIndex];
  }
  _getStartCharacter(tokenIndex) {
    return this._tokens[4 * tokenIndex + 1];
  }
  _getEndCharacter(tokenIndex) {
    return this._tokens[4 * tokenIndex + 2];
  }
  isEmpty() {
    return this._getTokenCount() === 0;
  }
  getLineTokens(deltaLine) {
    let low = 0;
    let high = this._getTokenCount() - 1;
    while (low < high) {
      const mid = low + Math.floor((high - low) / 2);
      const midDeltaLine = this._getDeltaLine(mid);
      if (midDeltaLine < deltaLine) {
        low = mid + 1;
      } else if (midDeltaLine > deltaLine) {
        high = mid - 1;
      } else {
        let min = mid;
        while (min > low && this._getDeltaLine(min - 1) === deltaLine) {
          min--;
        }
        let max = mid;
        while (max < high && this._getDeltaLine(max + 1) === deltaLine) {
          max++;
        }
        return new SparseLineTokens(this._tokens.subarray(4 * min, 4 * max + 4));
      }
    }
    if (this._getDeltaLine(low) === deltaLine) {
      return new SparseLineTokens(this._tokens.subarray(4 * low, 4 * low + 4));
    }
    return null;
  }
  clear() {
    this._tokenCount = 0;
  }
  removeTokens(startDeltaLine, startChar, endDeltaLine, endChar) {
    const tokens = this._tokens;
    const tokenCount = this._tokenCount;
    let newTokenCount = 0;
    let hasDeletedTokens = false;
    let firstDeltaLine = 0;
    for (let i2 = 0; i2 < tokenCount; i2++) {
      const srcOffset = 4 * i2;
      const tokenDeltaLine = tokens[srcOffset];
      const tokenStartCharacter = tokens[srcOffset + 1];
      const tokenEndCharacter = tokens[srcOffset + 2];
      const tokenMetadata = tokens[srcOffset + 3];
      if ((tokenDeltaLine > startDeltaLine || tokenDeltaLine === startDeltaLine && tokenEndCharacter >= startChar) && (tokenDeltaLine < endDeltaLine || tokenDeltaLine === endDeltaLine && tokenStartCharacter <= endChar)) {
        hasDeletedTokens = true;
      } else {
        if (newTokenCount === 0) {
          firstDeltaLine = tokenDeltaLine;
        }
        if (hasDeletedTokens) {
          const destOffset = 4 * newTokenCount;
          tokens[destOffset] = tokenDeltaLine - firstDeltaLine;
          tokens[destOffset + 1] = tokenStartCharacter;
          tokens[destOffset + 2] = tokenEndCharacter;
          tokens[destOffset + 3] = tokenMetadata;
        } else if (firstDeltaLine !== 0) {
          tokens[srcOffset] = tokenDeltaLine - firstDeltaLine;
        }
        newTokenCount++;
      }
    }
    this._tokenCount = newTokenCount;
    return firstDeltaLine;
  }
  split(startDeltaLine, startChar, endDeltaLine, endChar) {
    const tokens = this._tokens;
    const tokenCount = this._tokenCount;
    const aTokens = [];
    const bTokens = [];
    let destTokens = aTokens;
    let destOffset = 0;
    let destFirstDeltaLine = 0;
    for (let i2 = 0; i2 < tokenCount; i2++) {
      const srcOffset = 4 * i2;
      const tokenDeltaLine = tokens[srcOffset];
      const tokenStartCharacter = tokens[srcOffset + 1];
      const tokenEndCharacter = tokens[srcOffset + 2];
      const tokenMetadata = tokens[srcOffset + 3];
      if (tokenDeltaLine > startDeltaLine || tokenDeltaLine === startDeltaLine && tokenEndCharacter >= startChar) {
        if (tokenDeltaLine < endDeltaLine || tokenDeltaLine === endDeltaLine && tokenStartCharacter <= endChar) {
          continue;
        } else {
          if (destTokens !== bTokens) {
            destTokens = bTokens;
            destOffset = 0;
            destFirstDeltaLine = tokenDeltaLine;
          }
        }
      }
      destTokens[destOffset++] = tokenDeltaLine - destFirstDeltaLine;
      destTokens[destOffset++] = tokenStartCharacter;
      destTokens[destOffset++] = tokenEndCharacter;
      destTokens[destOffset++] = tokenMetadata;
    }
    return [new _SparseMultilineTokensStorage(new Uint32Array(aTokens)), new _SparseMultilineTokensStorage(new Uint32Array(bTokens)), destFirstDeltaLine];
  }
  acceptDeleteRange(horizontalShiftForFirstLineTokens, startDeltaLine, startCharacter, endDeltaLine, endCharacter) {
    const tokens = this._tokens;
    const tokenCount = this._tokenCount;
    const deletedLineCount = endDeltaLine - startDeltaLine;
    let newTokenCount = 0;
    let hasDeletedTokens = false;
    for (let i2 = 0; i2 < tokenCount; i2++) {
      const srcOffset = 4 * i2;
      let tokenDeltaLine = tokens[srcOffset];
      let tokenStartCharacter = tokens[srcOffset + 1];
      let tokenEndCharacter = tokens[srcOffset + 2];
      const tokenMetadata = tokens[srcOffset + 3];
      if (tokenDeltaLine < startDeltaLine || tokenDeltaLine === startDeltaLine && tokenEndCharacter <= startCharacter) {
        newTokenCount++;
        continue;
      } else if (tokenDeltaLine === startDeltaLine && tokenStartCharacter < startCharacter) {
        if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
          tokenEndCharacter -= endCharacter - startCharacter;
        } else {
          tokenEndCharacter = startCharacter;
        }
      } else if (tokenDeltaLine === startDeltaLine && tokenStartCharacter === startCharacter) {
        if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
          tokenEndCharacter -= endCharacter - startCharacter;
        } else {
          hasDeletedTokens = true;
          continue;
        }
      } else if (tokenDeltaLine < endDeltaLine || tokenDeltaLine === endDeltaLine && tokenStartCharacter < endCharacter) {
        if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
          tokenDeltaLine = startDeltaLine;
          tokenStartCharacter = startCharacter;
          tokenEndCharacter = tokenStartCharacter + (tokenEndCharacter - endCharacter);
        } else {
          hasDeletedTokens = true;
          continue;
        }
      } else if (tokenDeltaLine > endDeltaLine) {
        if (deletedLineCount === 0 && !hasDeletedTokens) {
          newTokenCount = tokenCount;
          break;
        }
        tokenDeltaLine -= deletedLineCount;
      } else if (tokenDeltaLine === endDeltaLine && tokenStartCharacter >= endCharacter) {
        if (horizontalShiftForFirstLineTokens && tokenDeltaLine === 0) {
          tokenStartCharacter += horizontalShiftForFirstLineTokens;
          tokenEndCharacter += horizontalShiftForFirstLineTokens;
        }
        tokenDeltaLine -= deletedLineCount;
        tokenStartCharacter -= endCharacter - startCharacter;
        tokenEndCharacter -= endCharacter - startCharacter;
      } else {
        throw new Error(`Not possible!`);
      }
      const destOffset = 4 * newTokenCount;
      tokens[destOffset] = tokenDeltaLine;
      tokens[destOffset + 1] = tokenStartCharacter;
      tokens[destOffset + 2] = tokenEndCharacter;
      tokens[destOffset + 3] = tokenMetadata;
      newTokenCount++;
    }
    this._tokenCount = newTokenCount;
  }
  acceptInsertText(deltaLine, character, eolCount, firstLineLength, lastLineLength, firstCharCode) {
    const isInsertingPreciselyOneWordCharacter = eolCount === 0 && firstLineLength === 1 && (firstCharCode >= 48 /* Digit0 */ && firstCharCode <= 57 /* Digit9 */ || firstCharCode >= 65 /* A */ && firstCharCode <= 90 /* Z */ || firstCharCode >= 97 /* a */ && firstCharCode <= 122 /* z */);
    const tokens = this._tokens;
    const tokenCount = this._tokenCount;
    for (let i2 = 0; i2 < tokenCount; i2++) {
      const offset = 4 * i2;
      let tokenDeltaLine = tokens[offset];
      let tokenStartCharacter = tokens[offset + 1];
      let tokenEndCharacter = tokens[offset + 2];
      if (tokenDeltaLine < deltaLine || tokenDeltaLine === deltaLine && tokenEndCharacter < character) {
        continue;
      } else if (tokenDeltaLine === deltaLine && tokenEndCharacter === character) {
        if (isInsertingPreciselyOneWordCharacter) {
          tokenEndCharacter += 1;
        } else {
          continue;
        }
      } else if (tokenDeltaLine === deltaLine && tokenStartCharacter < character && character < tokenEndCharacter) {
        if (eolCount === 0) {
          tokenEndCharacter += firstLineLength;
        } else {
          tokenEndCharacter = character;
        }
      } else {
        if (tokenDeltaLine === deltaLine && tokenStartCharacter === character) {
          if (isInsertingPreciselyOneWordCharacter) {
            continue;
          }
        }
        if (tokenDeltaLine === deltaLine) {
          tokenDeltaLine += eolCount;
          if (eolCount === 0) {
            tokenStartCharacter += firstLineLength;
            tokenEndCharacter += firstLineLength;
          } else {
            const tokenLength = tokenEndCharacter - tokenStartCharacter;
            tokenStartCharacter = lastLineLength + (tokenStartCharacter - character);
            tokenEndCharacter = tokenStartCharacter + tokenLength;
          }
        } else {
          tokenDeltaLine += eolCount;
        }
      }
      tokens[offset] = tokenDeltaLine;
      tokens[offset + 1] = tokenStartCharacter;
      tokens[offset + 2] = tokenEndCharacter;
    }
  }
  static {
    this._rateLimiter = new RateLimiter(10 / 60);
  }
  // limit to 10 times per minute
  reportIfInvalid(model, startLineNumber) {
    for (let i2 = 0; i2 < this._tokenCount; i2++) {
      const lineNumber = this._getDeltaLine(i2) + startLineNumber;
      if (lineNumber < 1) {
        _SparseMultilineTokensStorage._rateLimiter.runIfNotLimited(() => {
          console.error("Invalid Semantic Tokens Data From Extension: lineNumber < 1");
        });
      } else if (lineNumber > model.getLineCount()) {
        _SparseMultilineTokensStorage._rateLimiter.runIfNotLimited(() => {
          console.error("Invalid Semantic Tokens Data From Extension: lineNumber > model.getLineCount()");
        });
      } else if (this._getEndCharacter(i2) > model.getLineLength(lineNumber)) {
        _SparseMultilineTokensStorage._rateLimiter.runIfNotLimited(() => {
          console.error("Invalid Semantic Tokens Data From Extension: end character > model.getLineLength(lineNumber)");
        });
      }
    }
  }
};

var SparseLineTokens = class {
  constructor(tokens) {
    this._tokens = tokens;
  }
  getCount() {
    return this._tokens.length / 4;
  }
  getStartCharacter(tokenIndex) {
    return this._tokens[4 * tokenIndex + 1];
  }
  getEndCharacter(tokenIndex) {
    return this._tokens[4 * tokenIndex + 2];
  }
  getMetadata(tokenIndex) {
    return this._tokens[4 * tokenIndex + 3];
  }
};
export { SparseMultilineTokens, SparseMultilineTokensStorage, SparseLineTokens };
