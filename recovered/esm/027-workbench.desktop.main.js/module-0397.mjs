// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { PieceTreeBase } from "./module-0396.mjs";
import { Range2 } from "./module-0106.mjs";
import { containsRTL, containsUnusualLineTerminators, firstNonWhitespaceIndex, isBasicASCII, isHighSurrogate, lastNonWhitespaceIndex } from "./module-0030.mjs";
import { countEOL } from "./module-0375.mjs";
import { TextChange } from "./module-0392.mjs";
import { ApplyEditsResult } from "./module-0117.mjs";


// src/vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer.ts
var PieceTreeTextBuffer = class _PieceTreeTextBuffer extends Disposable {
  constructor(chunks, BOM, eol, containsRTL2, containsUnusualLineTerminators2, isBasicASCII2, eolNormalized) {
    super();
    this._onDidChangeContent = this._register(new Emitter());
    this._BOM = BOM;
    this._mightContainNonBasicASCII = !isBasicASCII2;
    this._mightContainRTL = containsRTL2;
    this._mightContainUnusualLineTerminators = containsUnusualLineTerminators2;
    this._pieceTree = new PieceTreeBase(chunks, eol, eolNormalized);
  }
  get onDidChangeContent() {
    return this._onDidChangeContent.event;
  }
  // #region TextBuffer
  equals(other) {
    if (!(other instanceof _PieceTreeTextBuffer)) {
      return false;
    }
    if (this._BOM !== other._BOM) {
      return false;
    }
    if (this.getEOL() !== other.getEOL()) {
      return false;
    }
    return this._pieceTree.equal(other._pieceTree);
  }
  mightContainRTL() {
    return this._mightContainRTL;
  }
  mightContainUnusualLineTerminators() {
    return this._mightContainUnusualLineTerminators;
  }
  resetMightContainUnusualLineTerminators() {
    this._mightContainUnusualLineTerminators = false;
  }
  mightContainNonBasicASCII() {
    return this._mightContainNonBasicASCII;
  }
  getBOM() {
    return this._BOM;
  }
  getEOL() {
    return this._pieceTree.getEOL();
  }
  createSnapshot(preserveBOM) {
    return this._pieceTree.createSnapshot(preserveBOM ? this._BOM : "");
  }
  getOffsetAt(lineNumber, column) {
    return this._pieceTree.getOffsetAt(lineNumber, column);
  }
  getPositionAt(offset) {
    return this._pieceTree.getPositionAt(offset);
  }
  getRangeAt(start, length) {
    const end = start + length;
    const startPosition = this.getPositionAt(start);
    const endPosition = this.getPositionAt(end);
    return new Range2(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
  }
  getValueInRange(range2, eol = 0 /* TextDefined */) {
    if (range2.isEmpty()) {
      return "";
    }
    const lineEnding = this._getEndOfLine(eol);
    return this._pieceTree.getValueInRange(range2, lineEnding);
  }
  getValueLengthInRange(range2, eol = 0 /* TextDefined */) {
    if (range2.isEmpty()) {
      return 0;
    }
    if (range2.startLineNumber === range2.endLineNumber) {
      return range2.endColumn - range2.startColumn;
    }
    const startOffset = this.getOffsetAt(range2.startLineNumber, range2.startColumn);
    const endOffset = this.getOffsetAt(range2.endLineNumber, range2.endColumn);
    let eolOffsetCompensation = 0;
    const desiredEOL = this._getEndOfLine(eol);
    const actualEOL = this.getEOL();
    if (desiredEOL.length !== actualEOL.length) {
      const delta2 = desiredEOL.length - actualEOL.length;
      const eolCount = range2.endLineNumber - range2.startLineNumber;
      eolOffsetCompensation = delta2 * eolCount;
    }
    return endOffset - startOffset + eolOffsetCompensation;
  }
  getCharacterCountInRange(range2, eol = 0 /* TextDefined */) {
    if (this._mightContainNonBasicASCII) {
      let result = 0;
      const fromLineNumber = range2.startLineNumber;
      const toLineNumber = range2.endLineNumber;
      for (let lineNumber = fromLineNumber; lineNumber <= toLineNumber; lineNumber++) {
        const lineContent = this.getLineContent(lineNumber);
        const fromOffset = lineNumber === fromLineNumber ? range2.startColumn - 1 : 0;
        const toOffset = lineNumber === toLineNumber ? range2.endColumn - 1 : lineContent.length;
        for (let offset = fromOffset; offset < toOffset; offset++) {
          if (isHighSurrogate(lineContent.charCodeAt(offset))) {
            result = result + 1;
            offset = offset + 1;
          } else {
            result = result + 1;
          }
        }
      }
      result += this._getEndOfLine(eol).length * (toLineNumber - fromLineNumber);
      return result;
    }
    return this.getValueLengthInRange(range2, eol);
  }
  getNearestChunk(offset) {
    return this._pieceTree.getNearestChunk(offset);
  }
  getLength() {
    return this._pieceTree.getLength();
  }
  getLineCount() {
    return this._pieceTree.getLineCount();
  }
  getLinesContent() {
    return this._pieceTree.getLinesContent();
  }
  getLineContent(lineNumber) {
    return this._pieceTree.getLineContent(lineNumber);
  }
  getLineCharCode(lineNumber, index2) {
    return this._pieceTree.getLineCharCode(lineNumber, index2);
  }
  getCharCode(offset) {
    return this._pieceTree.getCharCode(offset);
  }
  getLineLength(lineNumber) {
    return this._pieceTree.getLineLength(lineNumber);
  }
  getLineMinColumn(lineNumber) {
    return 1;
  }
  getLineMaxColumn(lineNumber) {
    return this.getLineLength(lineNumber) + 1;
  }
  getLineFirstNonWhitespaceColumn(lineNumber) {
    const result = firstNonWhitespaceIndex(this.getLineContent(lineNumber));
    if (result === -1) {
      return 0;
    }
    return result + 1;
  }
  getLineLastNonWhitespaceColumn(lineNumber) {
    const result = lastNonWhitespaceIndex(this.getLineContent(lineNumber));
    if (result === -1) {
      return 0;
    }
    return result + 2;
  }
  _getEndOfLine(eol) {
    switch (eol) {
      case 1 /* LF */:
        return "\n";
      case 2 /* CRLF */:
        return "\r\n";
      case 0 /* TextDefined */:
        return this.getEOL();
      default:
        throw new Error("Unknown EOL preference");
    }
  }
  setEOL(newEOL) {
    this._pieceTree.setEOL(newEOL);
  }
  applyEdits(rawOperations, recordTrimAutoWhitespace, computeUndoEdits) {
    let mightContainRTL = this._mightContainRTL;
    let mightContainUnusualLineTerminators = this._mightContainUnusualLineTerminators;
    let mightContainNonBasicASCII = this._mightContainNonBasicASCII;
    let canReduceOperations = true;
    let operations = [];
    for (let i2 = 0; i2 < rawOperations.length; i2++) {
      const op = rawOperations[i2];
      if (canReduceOperations && op._isTracked) {
        canReduceOperations = false;
      }
      const validatedRange = op.range;
      if (op.text) {
        let textMightContainNonBasicASCII = true;
        if (!mightContainNonBasicASCII) {
          textMightContainNonBasicASCII = !isBasicASCII(op.text);
          mightContainNonBasicASCII = textMightContainNonBasicASCII;
        }
        if (!mightContainRTL && textMightContainNonBasicASCII) {
          mightContainRTL = containsRTL(op.text);
        }
        if (!mightContainUnusualLineTerminators && textMightContainNonBasicASCII) {
          mightContainUnusualLineTerminators = containsUnusualLineTerminators(op.text);
        }
      }
      let validText = "";
      let eolCount = 0;
      let firstLineLength = 0;
      let lastLineLength = 0;
      if (op.text) {
        let strEOL;
        [eolCount, firstLineLength, lastLineLength, strEOL] = countEOL(op.text);
        const bufferEOL = this.getEOL();
        const expectedStrEOL = bufferEOL === "\r\n" ? 2 /* CRLF */ : 1 /* LF */;
        if (strEOL === 0 /* Unknown */ || strEOL === expectedStrEOL) {
          validText = op.text;
        } else {
          validText = op.text.replace(/\r\n|\r|\n/g, bufferEOL);
        }
      }
      operations[i2] = {
        sortIndex: i2,
        identifier: op.identifier || null,
        range: validatedRange,
        rangeOffset: this.getOffsetAt(validatedRange.startLineNumber, validatedRange.startColumn),
        rangeLength: this.getValueLengthInRange(validatedRange),
        text: validText,
        eolCount,
        firstLineLength,
        lastLineLength,
        forceMoveMarkers: Boolean(op.forceMoveMarkers),
        isAutoWhitespaceEdit: op.isAutoWhitespaceEdit || false
      };
    }
    operations.sort(_PieceTreeTextBuffer._sortOpsAscending);
    let hasTouchingRanges = false;
    for (let i2 = 0, count2 = operations.length - 1; i2 < count2; i2++) {
      const rangeEnd = operations[i2].range.getEndPosition();
      const nextRangeStart = operations[i2 + 1].range.getStartPosition();
      if (nextRangeStart.isBeforeOrEqual(rangeEnd)) {
        if (nextRangeStart.isBefore(rangeEnd)) {
          throw new Error("Overlapping ranges are not allowed!");
        }
        hasTouchingRanges = true;
      }
    }
    if (canReduceOperations) {
      operations = this._reduceOperations(operations);
    }
    const reverseRanges = computeUndoEdits || recordTrimAutoWhitespace ? _PieceTreeTextBuffer._getInverseEditRanges(operations) : [];
    const newTrimAutoWhitespaceCandidates = [];
    if (recordTrimAutoWhitespace) {
      for (let i2 = 0; i2 < operations.length; i2++) {
        const op = operations[i2];
        const reverseRange = reverseRanges[i2];
        if (op.isAutoWhitespaceEdit && op.range.isEmpty()) {
          for (let lineNumber = reverseRange.startLineNumber; lineNumber <= reverseRange.endLineNumber; lineNumber++) {
            let currentLineContent = "";
            if (lineNumber === reverseRange.startLineNumber) {
              currentLineContent = this.getLineContent(op.range.startLineNumber);
              if (firstNonWhitespaceIndex(currentLineContent) !== -1) {
                continue;
              }
            }
            newTrimAutoWhitespaceCandidates.push({ lineNumber, oldContent: currentLineContent });
          }
        }
      }
    }
    let reverseOperations = null;
    if (computeUndoEdits) {
      let reverseRangeDeltaOffset = 0;
      reverseOperations = [];
      for (let i2 = 0; i2 < operations.length; i2++) {
        const op = operations[i2];
        const reverseRange = reverseRanges[i2];
        const bufferText = this.getValueInRange(op.range);
        const reverseRangeOffset = op.rangeOffset + reverseRangeDeltaOffset;
        reverseRangeDeltaOffset += op.text.length - bufferText.length;
        reverseOperations[i2] = {
          sortIndex: op.sortIndex,
          identifier: op.identifier,
          range: reverseRange,
          text: bufferText,
          textChange: new TextChange(op.rangeOffset, bufferText, reverseRangeOffset, op.text)
        };
      }
      if (!hasTouchingRanges) {
        reverseOperations.sort((a, b) => a.sortIndex - b.sortIndex);
      }
    }
    this._mightContainRTL = mightContainRTL;
    this._mightContainUnusualLineTerminators = mightContainUnusualLineTerminators;
    this._mightContainNonBasicASCII = mightContainNonBasicASCII;
    const contentChanges = this._doApplyEdits(operations);
    let trimAutoWhitespaceLineNumbers = null;
    if (recordTrimAutoWhitespace && newTrimAutoWhitespaceCandidates.length > 0) {
      newTrimAutoWhitespaceCandidates.sort((a, b) => b.lineNumber - a.lineNumber);
      trimAutoWhitespaceLineNumbers = [];
      for (let i2 = 0, len = newTrimAutoWhitespaceCandidates.length; i2 < len; i2++) {
        const lineNumber = newTrimAutoWhitespaceCandidates[i2].lineNumber;
        if (i2 > 0 && newTrimAutoWhitespaceCandidates[i2 - 1].lineNumber === lineNumber) {
          continue;
        }
        const prevContent = newTrimAutoWhitespaceCandidates[i2].oldContent;
        const lineContent = this.getLineContent(lineNumber);
        if (lineContent.length === 0 || lineContent === prevContent || firstNonWhitespaceIndex(lineContent) !== -1) {
          continue;
        }
        trimAutoWhitespaceLineNumbers.push(lineNumber);
      }
    }
    this._onDidChangeContent.fire();
    return new ApplyEditsResult(
      reverseOperations,
      contentChanges,
      trimAutoWhitespaceLineNumbers
    );
  }
  /**
   * Transform operations such that they represent the same logic edit,
   * but that they also do not cause OOM crashes.
   */
  _reduceOperations(operations) {
    if (operations.length < 1e3) {
      return operations;
    }
    return [this._toSingleEditOperation(operations)];
  }
  _toSingleEditOperation(operations) {
    let forceMoveMarkers = false;
    const firstEditRange = operations[0].range;
    const lastEditRange = operations[operations.length - 1].range;
    const entireEditRange = new Range2(firstEditRange.startLineNumber, firstEditRange.startColumn, lastEditRange.endLineNumber, lastEditRange.endColumn);
    let lastEndLineNumber = firstEditRange.startLineNumber;
    let lastEndColumn = firstEditRange.startColumn;
    const result = [];
    for (let i2 = 0, len = operations.length; i2 < len; i2++) {
      const operation = operations[i2];
      const range2 = operation.range;
      forceMoveMarkers = forceMoveMarkers || operation.forceMoveMarkers;
      result.push(this.getValueInRange(new Range2(lastEndLineNumber, lastEndColumn, range2.startLineNumber, range2.startColumn)));
      if (operation.text.length > 0) {
        result.push(operation.text);
      }
      lastEndLineNumber = range2.endLineNumber;
      lastEndColumn = range2.endColumn;
    }
    const text2 = result.join("");
    const [eolCount, firstLineLength, lastLineLength] = countEOL(text2);
    return {
      sortIndex: 0,
      identifier: operations[0].identifier,
      range: entireEditRange,
      rangeOffset: this.getOffsetAt(entireEditRange.startLineNumber, entireEditRange.startColumn),
      rangeLength: this.getValueLengthInRange(entireEditRange, 0 /* TextDefined */),
      text: text2,
      eolCount,
      firstLineLength,
      lastLineLength,
      forceMoveMarkers,
      isAutoWhitespaceEdit: false
    };
  }
  _doApplyEdits(operations) {
    operations.sort(_PieceTreeTextBuffer._sortOpsDescending);
    const contentChanges = [];
    for (let i2 = 0; i2 < operations.length; i2++) {
      const op = operations[i2];
      const startLineNumber = op.range.startLineNumber;
      const startColumn = op.range.startColumn;
      const endLineNumber = op.range.endLineNumber;
      const endColumn = op.range.endColumn;
      if (startLineNumber === endLineNumber && startColumn === endColumn && op.text.length === 0) {
        continue;
      }
      if (op.text) {
        this._pieceTree.delete(op.rangeOffset, op.rangeLength);
        this._pieceTree.insert(op.rangeOffset, op.text, true);
      } else {
        this._pieceTree.delete(op.rangeOffset, op.rangeLength);
      }
      const contentChangeRange = new Range2(startLineNumber, startColumn, endLineNumber, endColumn);
      contentChanges.push({
        range: contentChangeRange,
        rangeLength: op.rangeLength,
        text: op.text,
        rangeOffset: op.rangeOffset,
        forceMoveMarkers: op.forceMoveMarkers
      });
    }
    return contentChanges;
  }
  findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount) {
    return this._pieceTree.findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount);
  }
  // #endregion
  // #region helper
  // testing purpose.
  getPieceTree() {
    return this._pieceTree;
  }
  static _getInverseEditRange(range2, text2) {
    const startLineNumber = range2.startLineNumber;
    const startColumn = range2.startColumn;
    const [eolCount, firstLineLength, lastLineLength] = countEOL(text2);
    let resultRange;
    if (text2.length > 0) {
      const lineCount = eolCount + 1;
      if (lineCount === 1) {
        resultRange = new Range2(startLineNumber, startColumn, startLineNumber, startColumn + firstLineLength);
      } else {
        resultRange = new Range2(startLineNumber, startColumn, startLineNumber + lineCount - 1, lastLineLength + 1);
      }
    } else {
      resultRange = new Range2(startLineNumber, startColumn, startLineNumber, startColumn);
    }
    return resultRange;
  }
  /**
   * Assumes `operations` are validated and sorted ascending
   */
  static _getInverseEditRanges(operations) {
    const result = [];
    let prevOpEndLineNumber = 0;
    let prevOpEndColumn = 0;
    let prevOp = null;
    for (let i2 = 0, len = operations.length; i2 < len; i2++) {
      const op = operations[i2];
      let startLineNumber;
      let startColumn;
      if (prevOp) {
        if (prevOp.range.endLineNumber === op.range.startLineNumber) {
          startLineNumber = prevOpEndLineNumber;
          startColumn = prevOpEndColumn + (op.range.startColumn - prevOp.range.endColumn);
        } else {
          startLineNumber = prevOpEndLineNumber + (op.range.startLineNumber - prevOp.range.endLineNumber);
          startColumn = op.range.startColumn;
        }
      } else {
        startLineNumber = op.range.startLineNumber;
        startColumn = op.range.startColumn;
      }
      let resultRange;
      if (op.text.length > 0) {
        const lineCount = op.eolCount + 1;
        if (lineCount === 1) {
          resultRange = new Range2(startLineNumber, startColumn, startLineNumber, startColumn + op.firstLineLength);
        } else {
          resultRange = new Range2(startLineNumber, startColumn, startLineNumber + lineCount - 1, op.lastLineLength + 1);
        }
      } else {
        resultRange = new Range2(startLineNumber, startColumn, startLineNumber, startColumn);
      }
      prevOpEndLineNumber = resultRange.endLineNumber;
      prevOpEndColumn = resultRange.endColumn;
      result.push(resultRange);
      prevOp = op;
    }
    return result;
  }
  static _sortOpsAscending(a, b) {
    const r2 = Range2.compareRangesUsingEnds(a.range, b.range);
    if (r2 === 0) {
      return a.sortIndex - b.sortIndex;
    }
    return r2;
  }
  static _sortOpsDescending(a, b) {
    const r2 = Range2.compareRangesUsingEnds(a.range, b.range);
    if (r2 === 0) {
      return b.sortIndex - a.sortIndex;
    }
    return -r2;
  }
  // #endregion
};
export { PieceTreeTextBuffer };
