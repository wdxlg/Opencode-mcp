// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/notebook/common/services/notebookWebWorkerMain.js
// Original module marker: src/vs/editor/common/services/textModelSync/textModelSync.impl.ts
import { MirrorTextModel } from "./module-0058.mjs";
import { Position } from "./module-0030.mjs";
import { ensureValidWordDefinition, getWordAtText } from "./module-0056.mjs";
import { Range } from "./module-0031.mjs";


// src/vs/editor/common/services/textModelSync/textModelSync.impl.ts
var STOP_SYNC_MODEL_DELTA_TIME_MS = 60 * 1e3;

var MirrorModel = class extends MirrorTextModel {
  get uri() {
    return this._uri;
  }
  get eol() {
    return this._eol;
  }
  getValue() {
    return this.getText();
  }
  findMatches(regex) {
    const matches = [];
    for (let i = 0; i < this._lines.length; i++) {
      const line = this._lines[i];
      const offsetToAdd = this.offsetAt(new Position(i + 1, 1));
      const iteratorOverMatches = line.matchAll(regex);
      for (const match of iteratorOverMatches) {
        if (match.index || match.index === 0) {
          match.index = match.index + offsetToAdd;
        }
        matches.push(match);
      }
    }
    return matches;
  }
  getLinesContent() {
    return this._lines.slice(0);
  }
  getLineCount() {
    return this._lines.length;
  }
  getLineContent(lineNumber) {
    return this._lines[lineNumber - 1];
  }
  getWordAtPosition(position, wordDefinition) {
    const wordAtText = getWordAtText(
      position.column,
      ensureValidWordDefinition(wordDefinition),
      this._lines[position.lineNumber - 1],
      0
    );
    if (wordAtText) {
      return new Range(position.lineNumber, wordAtText.startColumn, position.lineNumber, wordAtText.endColumn);
    }
    return null;
  }
  getWordUntilPosition(position, wordDefinition) {
    const wordAtPosition = this.getWordAtPosition(position, wordDefinition);
    if (!wordAtPosition) {
      return {
        word: "",
        startColumn: position.column,
        endColumn: position.column
      };
    }
    return {
      word: this._lines[position.lineNumber - 1].substring(wordAtPosition.startColumn - 1, position.column - 1),
      startColumn: wordAtPosition.startColumn,
      endColumn: position.column
    };
  }
  words(wordDefinition) {
    const lines = this._lines;
    const wordenize = this._wordenize.bind(this);
    let lineNumber = 0;
    let lineText = "";
    let wordRangesIdx = 0;
    let wordRanges = [];
    return {
      *[Symbol.iterator]() {
        while (true) {
          if (wordRangesIdx < wordRanges.length) {
            const value = lineText.substring(wordRanges[wordRangesIdx].start, wordRanges[wordRangesIdx].end);
            wordRangesIdx += 1;
            yield value;
          } else {
            if (lineNumber < lines.length) {
              lineText = lines[lineNumber];
              wordRanges = wordenize(lineText, wordDefinition);
              wordRangesIdx = 0;
              lineNumber += 1;
            } else {
              break;
            }
          }
        }
      }
    };
  }
  getLineWords(lineNumber, wordDefinition) {
    const content = this._lines[lineNumber - 1];
    const ranges = this._wordenize(content, wordDefinition);
    const words = [];
    for (const range of ranges) {
      words.push({
        word: content.substring(range.start, range.end),
        startColumn: range.start + 1,
        endColumn: range.end + 1
      });
    }
    return words;
  }
  _wordenize(content, wordDefinition) {
    const result = [];
    let match;
    wordDefinition.lastIndex = 0;
    while (match = wordDefinition.exec(content)) {
      if (match[0].length === 0) {
        break;
      }
      result.push({ start: match.index, end: match.index + match[0].length });
    }
    return result;
  }
  getValueInRange(range) {
    range = this._validateRange(range);
    if (range.startLineNumber === range.endLineNumber) {
      return this._lines[range.startLineNumber - 1].substring(range.startColumn - 1, range.endColumn - 1);
    }
    const lineEnding = this._eol;
    const startLineIndex = range.startLineNumber - 1;
    const endLineIndex = range.endLineNumber - 1;
    const resultLines = [];
    resultLines.push(this._lines[startLineIndex].substring(range.startColumn - 1));
    for (let i = startLineIndex + 1; i < endLineIndex; i++) {
      resultLines.push(this._lines[i]);
    }
    resultLines.push(this._lines[endLineIndex].substring(0, range.endColumn - 1));
    return resultLines.join(lineEnding);
  }
  offsetAt(position) {
    position = this._validatePosition(position);
    this._ensureLineStarts();
    return this._lineStarts.getPrefixSum(position.lineNumber - 2) + (position.column - 1);
  }
  positionAt(offset) {
    offset = Math.floor(offset);
    offset = Math.max(0, offset);
    this._ensureLineStarts();
    const out = this._lineStarts.getIndexOf(offset);
    const lineLength = this._lines[out.index].length;
    return {
      lineNumber: 1 + out.index,
      column: 1 + Math.min(out.remainder, lineLength)
    };
  }
  _validateRange(range) {
    const start = this._validatePosition({ lineNumber: range.startLineNumber, column: range.startColumn });
    const end = this._validatePosition({ lineNumber: range.endLineNumber, column: range.endColumn });
    if (start.lineNumber !== range.startLineNumber || start.column !== range.startColumn || end.lineNumber !== range.endLineNumber || end.column !== range.endColumn) {
      return {
        startLineNumber: start.lineNumber,
        startColumn: start.column,
        endLineNumber: end.lineNumber,
        endColumn: end.column
      };
    }
    return range;
  }
  _validatePosition(position) {
    if (!Position.isIPosition(position)) {
      throw new Error("bad position");
    }
    let { lineNumber, column } = position;
    let hasChanged = false;
    if (lineNumber < 1) {
      lineNumber = 1;
      column = 1;
      hasChanged = true;
    } else if (lineNumber > this._lines.length) {
      lineNumber = this._lines.length;
      column = this._lines[lineNumber - 1].length + 1;
      hasChanged = true;
    } else {
      const maxCharacter = this._lines[lineNumber - 1].length + 1;
      if (column < 1) {
        column = 1;
        hasChanged = true;
      } else if (column > maxCharacter) {
        column = maxCharacter;
        hasChanged = true;
      }
    }
    if (!hasChanged) {
      return position;
    } else {
      return { lineNumber, column };
    }
  }
};
export { STOP_SYNC_MODEL_DELTA_TIME_MS, MirrorModel };
