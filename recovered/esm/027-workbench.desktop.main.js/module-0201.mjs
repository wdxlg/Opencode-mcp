// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/mirrorTextModel.ts
import { Position } from "./module-0079.mjs";
import { PrefixSumComputer } from "./module-0200.mjs";
import { splitLines } from "./module-0030.mjs";


// src/vs/editor/common/model/mirrorTextModel.ts
var MirrorTextModel = class {
  constructor(uri5, lines, eol, versionId) {
    this._uri = uri5;
    this._lines = lines;
    this._eol = eol;
    this._versionId = versionId;
    this._lineStarts = null;
    this._cachedTextValue = null;
  }
  dispose() {
    this._lines.length = 0;
  }
  get version() {
    return this._versionId;
  }
  getText() {
    if (this._cachedTextValue === null) {
      this._cachedTextValue = this._lines.join(this._eol);
    }
    return this._cachedTextValue;
  }
  onEvents(e) {
    if (e.eol && e.eol !== this._eol) {
      this._eol = e.eol;
      this._lineStarts = null;
    }
    const changes = e.changes;
    for (const change of changes) {
      this._acceptDeleteRange(change.range);
      this._acceptInsertText(new Position(change.range.startLineNumber, change.range.startColumn), change.text);
    }
    this._versionId = e.versionId;
    this._cachedTextValue = null;
  }
  _ensureLineStarts() {
    if (!this._lineStarts) {
      const eolLength = this._eol.length;
      const linesLength = this._lines.length;
      const lineStartValues = new Uint32Array(linesLength);
      for (let i2 = 0; i2 < linesLength; i2++) {
        lineStartValues[i2] = this._lines[i2].length + eolLength;
      }
      this._lineStarts = new PrefixSumComputer(lineStartValues);
    }
  }
  /**
   * All changes to a line's text go through this method
   */
  _setLineText(lineIndex, newValue) {
    this._lines[lineIndex] = newValue;
    if (this._lineStarts) {
      this._lineStarts.setValue(lineIndex, this._lines[lineIndex].length + this._eol.length);
    }
  }
  _acceptDeleteRange(range2) {
    if (range2.startLineNumber === range2.endLineNumber) {
      if (range2.startColumn === range2.endColumn) {
        return;
      }
      this._setLineText(
        range2.startLineNumber - 1,
        this._lines[range2.startLineNumber - 1].substring(0, range2.startColumn - 1) + this._lines[range2.startLineNumber - 1].substring(range2.endColumn - 1)
      );
      return;
    }
    this._setLineText(
      range2.startLineNumber - 1,
      this._lines[range2.startLineNumber - 1].substring(0, range2.startColumn - 1) + this._lines[range2.endLineNumber - 1].substring(range2.endColumn - 1)
    );
    this._lines.splice(range2.startLineNumber, range2.endLineNumber - range2.startLineNumber);
    if (this._lineStarts) {
      this._lineStarts.removeValues(range2.startLineNumber, range2.endLineNumber - range2.startLineNumber);
    }
  }
  _acceptInsertText(position2, insertText) {
    if (insertText.length === 0) {
      return;
    }
    const insertLines = splitLines(insertText);
    if (insertLines.length === 1) {
      this._setLineText(
        position2.lineNumber - 1,
        this._lines[position2.lineNumber - 1].substring(0, position2.column - 1) + insertLines[0] + this._lines[position2.lineNumber - 1].substring(position2.column - 1)
      );
      return;
    }
    insertLines[insertLines.length - 1] += this._lines[position2.lineNumber - 1].substring(position2.column - 1);
    this._setLineText(
      position2.lineNumber - 1,
      this._lines[position2.lineNumber - 1].substring(0, position2.column - 1) + insertLines[0]
    );
    const newLengths = new Uint32Array(insertLines.length - 1);
    for (let i2 = 1; i2 < insertLines.length; i2++) {
      this._lines.splice(position2.lineNumber + i2 - 1, 0, insertLines[i2]);
      newLengths[i2 - 1] = insertLines[i2].length + this._eol.length;
    }
    if (this._lineStarts) {
      this._lineStarts.insertValues(position2.lineNumber, newLengths);
    }
  }
};
export { MirrorTextModel };
