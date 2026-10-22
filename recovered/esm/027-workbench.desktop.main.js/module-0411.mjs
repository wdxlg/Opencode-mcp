// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/tokens/contiguousMultilineTokens.ts
import { readUInt32BE, writeUInt32BE } from "./module-0038.mjs";
import { LineRange } from "./module-0174.mjs";
import { countEOL } from "./module-0375.mjs";
import { Position } from "./module-0079.mjs";
import { ContiguousTokensEditing } from "./module-0410.mjs";
import { arrayInsert } from "./module-0007.mjs";


// src/vs/editor/common/tokens/contiguousMultilineTokens.ts
var ContiguousMultilineTokens = class _ContiguousMultilineTokens {
  static deserialize(buff, offset, result) {
    const view32 = new Uint32Array(buff.buffer);
    const startLineNumber = readUInt32BE(buff, offset);
    offset += 4;
    const count2 = readUInt32BE(buff, offset);
    offset += 4;
    const tokens = [];
    for (let i2 = 0; i2 < count2; i2++) {
      const byteCount = readUInt32BE(buff, offset);
      offset += 4;
      tokens.push(view32.subarray(offset / 4, offset / 4 + byteCount / 4));
      offset += byteCount;
    }
    result.push(new _ContiguousMultilineTokens(startLineNumber, tokens));
    return offset;
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
    return this._startLineNumber + this._tokens.length - 1;
  }
  constructor(startLineNumber, tokens) {
    this._startLineNumber = startLineNumber;
    this._tokens = tokens;
  }
  getLineRange() {
    return new LineRange(this._startLineNumber, this._startLineNumber + this._tokens.length);
  }
  /**
   * @see {@link _tokens}
   */
  getLineTokens(lineNumber) {
    return this._tokens[lineNumber - this._startLineNumber];
  }
  appendLineTokens(lineTokens) {
    this._tokens.push(lineTokens);
  }
  serializeSize() {
    let result = 0;
    result += 4;
    result += 4;
    for (let i2 = 0; i2 < this._tokens.length; i2++) {
      const lineTokens = this._tokens[i2];
      if (!(lineTokens instanceof Uint32Array)) {
        throw new Error(`Not supported!`);
      }
      result += 4;
      result += lineTokens.byteLength;
    }
    return result;
  }
  serialize(destination, offset) {
    writeUInt32BE(destination, this._startLineNumber, offset);
    offset += 4;
    writeUInt32BE(destination, this._tokens.length, offset);
    offset += 4;
    for (let i2 = 0; i2 < this._tokens.length; i2++) {
      const lineTokens = this._tokens[i2];
      if (!(lineTokens instanceof Uint32Array)) {
        throw new Error(`Not supported!`);
      }
      writeUInt32BE(destination, lineTokens.byteLength, offset);
      offset += 4;
      destination.set(new Uint8Array(lineTokens.buffer), offset);
      offset += lineTokens.byteLength;
    }
    return offset;
  }
  applyEdit(range2, text2) {
    const [eolCount, firstLineLength] = countEOL(text2);
    this._acceptDeleteRange(range2);
    this._acceptInsertText(new Position(range2.startLineNumber, range2.startColumn), eolCount, firstLineLength);
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
    if (firstLineIndex >= this._tokens.length) {
      return;
    }
    if (firstLineIndex < 0 && lastLineIndex >= this._tokens.length) {
      this._startLineNumber = 0;
      this._tokens = [];
      return;
    }
    if (firstLineIndex === lastLineIndex) {
      this._tokens[firstLineIndex] = ContiguousTokensEditing.delete(this._tokens[firstLineIndex], range2.startColumn - 1, range2.endColumn - 1);
      return;
    }
    if (firstLineIndex >= 0) {
      this._tokens[firstLineIndex] = ContiguousTokensEditing.deleteEnding(this._tokens[firstLineIndex], range2.startColumn - 1);
      if (lastLineIndex < this._tokens.length) {
        const lastLineTokens = ContiguousTokensEditing.deleteBeginning(this._tokens[lastLineIndex], range2.endColumn - 1);
        this._tokens[firstLineIndex] = ContiguousTokensEditing.append(this._tokens[firstLineIndex], lastLineTokens);
        this._tokens.splice(firstLineIndex + 1, lastLineIndex - firstLineIndex);
      } else {
        this._tokens[firstLineIndex] = ContiguousTokensEditing.append(this._tokens[firstLineIndex], null);
        this._tokens = this._tokens.slice(0, firstLineIndex + 1);
      }
    } else {
      const deletedBefore = -firstLineIndex;
      this._startLineNumber -= deletedBefore;
      this._tokens[lastLineIndex] = ContiguousTokensEditing.deleteBeginning(this._tokens[lastLineIndex], range2.endColumn - 1);
      this._tokens = this._tokens.slice(lastLineIndex);
    }
  }
  _acceptInsertText(position2, eolCount, firstLineLength) {
    if (eolCount === 0 && firstLineLength === 0) {
      return;
    }
    const lineIndex = position2.lineNumber - this._startLineNumber;
    if (lineIndex < 0) {
      this._startLineNumber += eolCount;
      return;
    }
    if (lineIndex >= this._tokens.length) {
      return;
    }
    if (eolCount === 0) {
      this._tokens[lineIndex] = ContiguousTokensEditing.insert(this._tokens[lineIndex], position2.column - 1, firstLineLength);
      return;
    }
    this._tokens[lineIndex] = ContiguousTokensEditing.deleteEnding(this._tokens[lineIndex], position2.column - 1);
    this._tokens[lineIndex] = ContiguousTokensEditing.insert(this._tokens[lineIndex], position2.column - 1, firstLineLength);
    this._insertLines(position2.lineNumber, eolCount);
  }
  _insertLines(insertIndex, insertCount) {
    if (insertCount === 0) {
      return;
    }
    const lineTokens = [];
    for (let i2 = 0; i2 < insertCount; i2++) {
      lineTokens[i2] = null;
    }
    this._tokens = arrayInsert(this._tokens, insertIndex, lineTokens);
  }
};
export { ContiguousMultilineTokens };
