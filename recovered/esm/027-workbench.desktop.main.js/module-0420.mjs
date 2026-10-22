// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/tokens/contiguousTokensStore.ts
import { ContiguousTokensEditing, EMPTY_LINE_TOKENS, toUint32Array } from "./module-0410.mjs";
import { LineTokens } from "./module-0145.mjs";
import { TokenMetadata } from "./module-0108.mjs";
import { arrayInsert } from "./module-0007.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/common/tokens/contiguousTokensStore.ts
var ContiguousTokensStore = class _ContiguousTokensStore {
  constructor(languageIdCodec) {
    this._lineTokens = [];
    this._len = 0;
    this._languageIdCodec = languageIdCodec;
  }
  flush() {
    this._lineTokens = [];
    this._len = 0;
  }
  get hasTokens() {
    return this._lineTokens.length > 0;
  }
  getTokens(topLevelLanguageId, lineIndex, lineText) {
    let rawLineTokens = null;
    if (lineIndex < this._len) {
      rawLineTokens = this._lineTokens[lineIndex];
    }
    if (rawLineTokens !== null && rawLineTokens !== EMPTY_LINE_TOKENS) {
      return new LineTokens(toUint32Array(rawLineTokens), lineText, this._languageIdCodec);
    }
    const lineTokens = new Uint32Array(2);
    lineTokens[0] = lineText.length;
    lineTokens[1] = getDefaultMetadata(this._languageIdCodec.encodeLanguageId(topLevelLanguageId));
    return new LineTokens(lineTokens, lineText, this._languageIdCodec);
  }
  static _massageTokens(topLevelLanguageId, lineTextLength, _tokens) {
    const tokens = _tokens ? toUint32Array(_tokens) : null;
    if (lineTextLength === 0) {
      let hasDifferentLanguageId = false;
      if (tokens && tokens.length > 1) {
        hasDifferentLanguageId = TokenMetadata.getLanguageId(tokens[1]) !== topLevelLanguageId;
      }
      if (!hasDifferentLanguageId) {
        return EMPTY_LINE_TOKENS;
      }
    }
    if (!tokens || tokens.length === 0) {
      const tokens2 = new Uint32Array(2);
      tokens2[0] = lineTextLength;
      tokens2[1] = getDefaultMetadata(topLevelLanguageId);
      return tokens2.buffer;
    }
    tokens[tokens.length - 2] = lineTextLength;
    if (tokens.byteOffset === 0 && tokens.byteLength === tokens.buffer.byteLength) {
      return tokens.buffer;
    }
    return tokens;
  }
  _ensureLine(lineIndex) {
    while (lineIndex >= this._len) {
      this._lineTokens[this._len] = null;
      this._len++;
    }
  }
  _deleteLines(start, deleteCount) {
    if (deleteCount === 0) {
      return;
    }
    if (start + deleteCount > this._len) {
      deleteCount = this._len - start;
    }
    this._lineTokens.splice(start, deleteCount);
    this._len -= deleteCount;
  }
  _insertLines(insertIndex, insertCount) {
    if (insertCount === 0) {
      return;
    }
    const lineTokens = [];
    for (let i2 = 0; i2 < insertCount; i2++) {
      lineTokens[i2] = null;
    }
    this._lineTokens = arrayInsert(this._lineTokens, insertIndex, lineTokens);
    this._len += insertCount;
  }
  setTokens(topLevelLanguageId, lineIndex, lineTextLength, _tokens, checkEquality) {
    const tokens = _ContiguousTokensStore._massageTokens(this._languageIdCodec.encodeLanguageId(topLevelLanguageId), lineTextLength, _tokens);
    this._ensureLine(lineIndex);
    const oldTokens = this._lineTokens[lineIndex];
    this._lineTokens[lineIndex] = tokens;
    if (checkEquality) {
      return !_ContiguousTokensStore._equals(oldTokens, tokens);
    }
    return false;
  }
  static _equals(_a6, _b3) {
    if (!_a6 || !_b3) {
      return !_a6 && !_b3;
    }
    const a = toUint32Array(_a6);
    const b = toUint32Array(_b3);
    if (a.length !== b.length) {
      return false;
    }
    for (let i2 = 0, len = a.length; i2 < len; i2++) {
      if (a[i2] !== b[i2]) {
        return false;
      }
    }
    return true;
  }
  //#region Editing
  acceptEdit(range2, eolCount, firstLineLength) {
    this._acceptDeleteRange(range2);
    this._acceptInsertText(new Position(range2.startLineNumber, range2.startColumn), eolCount, firstLineLength);
  }
  _acceptDeleteRange(range2) {
    const firstLineIndex = range2.startLineNumber - 1;
    if (firstLineIndex >= this._len) {
      return;
    }
    if (range2.startLineNumber === range2.endLineNumber) {
      if (range2.startColumn === range2.endColumn) {
        return;
      }
      this._lineTokens[firstLineIndex] = ContiguousTokensEditing.delete(this._lineTokens[firstLineIndex], range2.startColumn - 1, range2.endColumn - 1);
      return;
    }
    this._lineTokens[firstLineIndex] = ContiguousTokensEditing.deleteEnding(this._lineTokens[firstLineIndex], range2.startColumn - 1);
    const lastLineIndex = range2.endLineNumber - 1;
    let lastLineTokens = null;
    if (lastLineIndex < this._len) {
      lastLineTokens = ContiguousTokensEditing.deleteBeginning(this._lineTokens[lastLineIndex], range2.endColumn - 1);
    }
    this._lineTokens[firstLineIndex] = ContiguousTokensEditing.append(this._lineTokens[firstLineIndex], lastLineTokens);
    this._deleteLines(range2.startLineNumber, range2.endLineNumber - range2.startLineNumber);
  }
  _acceptInsertText(position2, eolCount, firstLineLength) {
    if (eolCount === 0 && firstLineLength === 0) {
      return;
    }
    const lineIndex = position2.lineNumber - 1;
    if (lineIndex >= this._len) {
      return;
    }
    if (eolCount === 0) {
      this._lineTokens[lineIndex] = ContiguousTokensEditing.insert(this._lineTokens[lineIndex], position2.column - 1, firstLineLength);
      return;
    }
    this._lineTokens[lineIndex] = ContiguousTokensEditing.deleteEnding(this._lineTokens[lineIndex], position2.column - 1);
    this._lineTokens[lineIndex] = ContiguousTokensEditing.insert(this._lineTokens[lineIndex], position2.column - 1, firstLineLength);
    this._insertLines(position2.lineNumber, eolCount);
  }
  //#endregion
  setMultilineTokens(tokens, textModel) {
    if (tokens.length === 0) {
      return { changes: [] };
    }
    const ranges = [];
    for (let i2 = 0, len = tokens.length; i2 < len; i2++) {
      const element = tokens[i2];
      let minChangedLineNumber = 0;
      let maxChangedLineNumber = 0;
      let hasChange = false;
      for (let lineNumber = element.startLineNumber; lineNumber <= element.endLineNumber; lineNumber++) {
        if (hasChange) {
          this.setTokens(textModel.getLanguageId(), lineNumber - 1, textModel.getLineLength(lineNumber), element.getLineTokens(lineNumber), false);
          maxChangedLineNumber = lineNumber;
        } else {
          const lineHasChange = this.setTokens(textModel.getLanguageId(), lineNumber - 1, textModel.getLineLength(lineNumber), element.getLineTokens(lineNumber), true);
          if (lineHasChange) {
            hasChange = true;
            minChangedLineNumber = lineNumber;
            maxChangedLineNumber = lineNumber;
          }
        }
      }
      if (hasChange) {
        ranges.push({ fromLineNumber: minChangedLineNumber, toLineNumber: maxChangedLineNumber });
      }
    }
    return { changes: ranges };
  }
};

function getDefaultMetadata(topLevelLanguageId) {
  return (topLevelLanguageId << 0 /* LANGUAGEID_OFFSET */ | 0 /* Other */ << 8 /* TOKEN_TYPE_OFFSET */ | 0 /* None */ << 11 /* FONT_STYLE_OFFSET */ | 1 /* DefaultForeground */ << 15 /* FOREGROUND_OFFSET */ | 2 /* DefaultBackground */ << 24 /* BACKGROUND_OFFSET */ | 1024 /* BALANCED_BRACKETS_MASK */) >>> 0;
}
export { getDefaultMetadata, ContiguousTokensStore };
