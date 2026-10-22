// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/tokens/sparseTokensStore.ts
import { arrayInsert } from "./module-0007.mjs";
import { LineTokens } from "./module-0145.mjs";


// src/vs/editor/common/tokens/sparseTokensStore.ts
var SparseTokensStore = class _SparseTokensStore {
  constructor(languageIdCodec) {
    this._pieces = [];
    this._isComplete = false;
    this._languageIdCodec = languageIdCodec;
  }
  flush() {
    this._pieces = [];
    this._isComplete = false;
  }
  isEmpty() {
    return this._pieces.length === 0;
  }
  set(pieces, isComplete, textModel = void 0) {
    this._pieces = pieces || [];
    this._isComplete = isComplete;
    if (textModel) {
      for (const p of this._pieces) {
        p.reportIfInvalid(textModel);
      }
    }
  }
  setPartial(_range, pieces) {
    let range2 = _range;
    if (pieces.length > 0) {
      const _firstRange = pieces[0].getRange();
      const _lastRange = pieces[pieces.length - 1].getRange();
      if (!_firstRange || !_lastRange) {
        return _range;
      }
      range2 = _range.plusRange(_firstRange).plusRange(_lastRange);
    }
    let insertPosition = null;
    for (let i2 = 0, len = this._pieces.length; i2 < len; i2++) {
      const piece = this._pieces[i2];
      if (piece.endLineNumber < range2.startLineNumber) {
        continue;
      }
      if (piece.startLineNumber > range2.endLineNumber) {
        insertPosition = insertPosition || { index: i2 };
        break;
      }
      piece.removeTokens(range2);
      if (piece.isEmpty()) {
        this._pieces.splice(i2, 1);
        i2--;
        len--;
        continue;
      }
      if (piece.endLineNumber < range2.startLineNumber) {
        continue;
      }
      if (piece.startLineNumber > range2.endLineNumber) {
        insertPosition = insertPosition || { index: i2 };
        continue;
      }
      const [a, b] = piece.split(range2);
      if (a.isEmpty()) {
        insertPosition = insertPosition || { index: i2 };
        continue;
      }
      if (b.isEmpty()) {
        continue;
      }
      this._pieces.splice(i2, 1, a, b);
      i2++;
      len++;
      insertPosition = insertPosition || { index: i2 };
    }
    insertPosition = insertPosition || { index: this._pieces.length };
    if (pieces.length > 0) {
      this._pieces = arrayInsert(this._pieces, insertPosition.index, pieces);
    }
    return range2;
  }
  isComplete() {
    return this._isComplete;
  }
  addSparseTokens(lineNumber, aTokens) {
    if (aTokens.getTextLength() === 0) {
      return aTokens;
    }
    const pieces = this._pieces;
    if (pieces.length === 0) {
      return aTokens;
    }
    const pieceIndex = _SparseTokensStore._findFirstPieceWithLine(pieces, lineNumber);
    const bTokens = pieces[pieceIndex].getLineTokens(lineNumber);
    if (!bTokens) {
      return aTokens;
    }
    const aLen = aTokens.getCount();
    const bLen = bTokens.getCount();
    let aIndex = 0;
    const result = [];
    let resultLen = 0;
    let lastEndOffset = 0;
    const emitToken = (endOffset, metadata) => {
      if (endOffset <= lastEndOffset) {
        return;
      }
      lastEndOffset = endOffset;
      result[resultLen++] = endOffset;
      result[resultLen++] = metadata;
    };
    for (let bIndex = 0; bIndex < bLen; bIndex++) {
      const bStartCharacter = Math.min(bTokens.getStartCharacter(bIndex), aTokens.getTextLength());
      const bEndCharacter = Math.min(bTokens.getEndCharacter(bIndex), aTokens.getTextLength());
      const bMetadata = bTokens.getMetadata(bIndex);
      const bMask = ((bMetadata & 1 /* SEMANTIC_USE_ITALIC */ ? 2048 /* ITALIC_MASK */ : 0) | (bMetadata & 2 /* SEMANTIC_USE_BOLD */ ? 4096 /* BOLD_MASK */ : 0) | (bMetadata & 4 /* SEMANTIC_USE_UNDERLINE */ ? 8192 /* UNDERLINE_MASK */ : 0) | (bMetadata & 8 /* SEMANTIC_USE_STRIKETHROUGH */ ? 16384 /* STRIKETHROUGH_MASK */ : 0) | (bMetadata & 16 /* SEMANTIC_USE_FOREGROUND */ ? 16744448 /* FOREGROUND_MASK */ : 0) | (bMetadata & 32 /* SEMANTIC_USE_BACKGROUND */ ? 4278190080 /* BACKGROUND_MASK */ : 0)) >>> 0;
      const aMask = ~bMask >>> 0;
      while (aIndex < aLen && aTokens.getEndOffset(aIndex) <= bStartCharacter) {
        emitToken(aTokens.getEndOffset(aIndex), aTokens.getMetadata(aIndex));
        aIndex++;
      }
      if (aIndex < aLen && aTokens.getStartOffset(aIndex) < bStartCharacter) {
        emitToken(bStartCharacter, aTokens.getMetadata(aIndex));
      }
      while (aIndex < aLen && aTokens.getEndOffset(aIndex) < bEndCharacter) {
        emitToken(aTokens.getEndOffset(aIndex), aTokens.getMetadata(aIndex) & aMask | bMetadata & bMask);
        aIndex++;
      }
      if (aIndex < aLen) {
        emitToken(bEndCharacter, aTokens.getMetadata(aIndex) & aMask | bMetadata & bMask);
        if (aTokens.getEndOffset(aIndex) === bEndCharacter) {
          aIndex++;
        }
      } else {
        const aMergeIndex = Math.min(Math.max(0, aIndex - 1), aLen - 1);
        emitToken(bEndCharacter, aTokens.getMetadata(aMergeIndex) & aMask | bMetadata & bMask);
      }
    }
    while (aIndex < aLen) {
      emitToken(aTokens.getEndOffset(aIndex), aTokens.getMetadata(aIndex));
      aIndex++;
    }
    return new LineTokens(new Uint32Array(result), aTokens.getLineContent(), this._languageIdCodec);
  }
  static _findFirstPieceWithLine(pieces, lineNumber) {
    let low = 0;
    let high = pieces.length - 1;
    while (low < high) {
      let mid = low + Math.floor((high - low) / 2);
      if (pieces[mid].endLineNumber < lineNumber) {
        low = mid + 1;
      } else if (pieces[mid].startLineNumber > lineNumber) {
        high = mid - 1;
      } else {
        while (mid > low && pieces[mid - 1].startLineNumber <= lineNumber && lineNumber <= pieces[mid - 1].endLineNumber) {
          mid--;
        }
        return mid;
      }
    }
    return low;
  }
  acceptEdit(range2, eolCount, firstLineLength, lastLineLength, firstCharCode) {
    for (let i2 = 0; i2 < this._pieces.length; i2++) {
      const piece = this._pieces[i2];
      piece.acceptEdit(range2, eolCount, firstLineLength, lastLineLength, firstCharCode);
      if (piece.isEmpty()) {
        this._pieces.splice(i2, 1);
        i2--;
      }
    }
  }
};
export { SparseTokensStore };
