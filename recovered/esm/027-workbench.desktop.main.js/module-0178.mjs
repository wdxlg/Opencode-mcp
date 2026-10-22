// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/core/edits/textEdit.ts
import { assertFn, checkAdjacentItems } from "./module-0009.mjs";
import { Range2 } from "./module-0106.mjs";
import { compareBy, equals } from "./module-0007.mjs";
import { TextLength } from "./module-0175.mjs";
import { Position } from "./module-0079.mjs";
import { StringText } from "./module-0177.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { commonPrefixLength2, commonSuffixLength } from "./module-0030.mjs";


// src/vs/editor/common/core/edits/textEdit.ts
var TextEdit2 = class _TextEdit {
  constructor(replacements) {
    this.replacements = replacements;
    assertFn(() => checkAdjacentItems(replacements, (a, b) => a.range.getEndPosition().isBeforeOrEqual(b.range.getStartPosition())));
  }
  static fromStringEdit(edit3, initialState) {
    const edits = edit3.replacements.map((e) => TextReplacement.fromStringReplacement(e, initialState));
    return new _TextEdit(edits);
  }
  static replace(originalRange, newText) {
    return new _TextEdit([new TextReplacement(originalRange, newText)]);
  }
  static delete(range2) {
    return new _TextEdit([new TextReplacement(range2, "")]);
  }
  static insert(position2, newText) {
    return new _TextEdit([new TextReplacement(Range2.fromPositions(position2, position2), newText)]);
  }
  static fromParallelReplacementsUnsorted(replacements) {
    const r2 = replacements.slice().sort(compareBy((i2) => i2.range, Range2.compareRangesUsingStarts));
    return new _TextEdit(r2);
  }
  /**
   * Joins touching edits and removes empty edits.
   */
  normalize() {
    const replacements = [];
    for (const r2 of this.replacements) {
      if (replacements.length > 0 && replacements[replacements.length - 1].range.getEndPosition().equals(r2.range.getStartPosition())) {
        const last = replacements[replacements.length - 1];
        replacements[replacements.length - 1] = new TextReplacement(last.range.plusRange(r2.range), last.text + r2.text);
      } else if (!r2.isEmpty) {
        replacements.push(r2);
      }
    }
    return new _TextEdit(replacements);
  }
  mapPosition(position2) {
    let lineDelta = 0;
    let curLine = 0;
    let columnDeltaInCurLine = 0;
    for (const replacement of this.replacements) {
      const start = replacement.range.getStartPosition();
      if (position2.isBeforeOrEqual(start)) {
        break;
      }
      const end = replacement.range.getEndPosition();
      const len = TextLength.ofText(replacement.text);
      if (position2.isBefore(end)) {
        const startPos = new Position(start.lineNumber + lineDelta, start.column + (start.lineNumber + lineDelta === curLine ? columnDeltaInCurLine : 0));
        const endPos = len.addToPosition(startPos);
        return rangeFromPositions(startPos, endPos);
      }
      if (start.lineNumber + lineDelta !== curLine) {
        columnDeltaInCurLine = 0;
      }
      lineDelta += len.lineCount - (replacement.range.endLineNumber - replacement.range.startLineNumber);
      if (len.lineCount === 0) {
        if (end.lineNumber !== start.lineNumber) {
          columnDeltaInCurLine += len.columnCount - (end.column - 1);
        } else {
          columnDeltaInCurLine += len.columnCount - (end.column - start.column);
        }
      } else {
        columnDeltaInCurLine = len.columnCount;
      }
      curLine = end.lineNumber + lineDelta;
    }
    return new Position(position2.lineNumber + lineDelta, position2.column + (position2.lineNumber + lineDelta === curLine ? columnDeltaInCurLine : 0));
  }
  mapRange(range2) {
    function getStart(p) {
      return p instanceof Position ? p : p.getStartPosition();
    }
    function getEnd(p) {
      return p instanceof Position ? p : p.getEndPosition();
    }
    const start = getStart(this.mapPosition(range2.getStartPosition()));
    const end = getEnd(this.mapPosition(range2.getEndPosition()));
    return rangeFromPositions(start, end);
  }
  // TODO: `doc` is not needed for this!
  inverseMapPosition(positionAfterEdit, doc) {
    const reversed = this.inverse(doc);
    return reversed.mapPosition(positionAfterEdit);
  }
  inverseMapRange(range2, doc) {
    const reversed = this.inverse(doc);
    return reversed.mapRange(range2);
  }
  apply(text2) {
    let result = "";
    let lastEditEnd = new Position(1, 1);
    for (const replacement of this.replacements) {
      const editRange = replacement.range;
      const editStart = editRange.getStartPosition();
      const editEnd = editRange.getEndPosition();
      const r3 = rangeFromPositions(lastEditEnd, editStart);
      if (!r3.isEmpty()) {
        result += text2.getValueOfRange(r3);
      }
      result += replacement.text;
      lastEditEnd = editEnd;
    }
    const r2 = rangeFromPositions(lastEditEnd, text2.endPositionExclusive);
    if (!r2.isEmpty()) {
      result += text2.getValueOfRange(r2);
    }
    return result;
  }
  applyToString(str) {
    const strText = new StringText(str);
    return this.apply(strText);
  }
  inverse(doc) {
    const ranges = this.getNewRanges();
    return new _TextEdit(this.replacements.map((e, idx) => new TextReplacement(ranges[idx], doc.getValueOfRange(e.range))));
  }
  getNewRanges() {
    const newRanges = [];
    let previousEditEndLineNumber = 0;
    let lineOffset = 0;
    let columnOffset = 0;
    for (const replacement of this.replacements) {
      const textLength = TextLength.ofText(replacement.text);
      const newRangeStart = Position.lift({
        lineNumber: replacement.range.startLineNumber + lineOffset,
        column: replacement.range.startColumn + (replacement.range.startLineNumber === previousEditEndLineNumber ? columnOffset : 0)
      });
      const newRange = textLength.createRange(newRangeStart);
      newRanges.push(newRange);
      lineOffset = newRange.endLineNumber - replacement.range.endLineNumber;
      columnOffset = newRange.endColumn - replacement.range.endColumn;
      previousEditEndLineNumber = replacement.range.endLineNumber;
    }
    return newRanges;
  }
  toReplacement(text2) {
    if (this.replacements.length === 0) {
      throw new BugIndicatingError();
    }
    if (this.replacements.length === 1) {
      return this.replacements[0];
    }
    const startPos = this.replacements[0].range.getStartPosition();
    const endPos = this.replacements[this.replacements.length - 1].range.getEndPosition();
    let newText = "";
    for (let i2 = 0; i2 < this.replacements.length; i2++) {
      const curEdit = this.replacements[i2];
      newText += curEdit.text;
      if (i2 < this.replacements.length - 1) {
        const nextEdit = this.replacements[i2 + 1];
        const gapRange = Range2.fromPositions(curEdit.range.getEndPosition(), nextEdit.range.getStartPosition());
        const gapText = text2.getValueOfRange(gapRange);
        newText += gapText;
      }
    }
    return new TextReplacement(Range2.fromPositions(startPos, endPos), newText);
  }
  equals(other) {
    return equals(this.replacements, other.replacements, (a, b) => a.equals(b));
  }
  /**
   * Combines two edits into one with the same effect.
   * WARNING: This is written by AI, but well tested. I do not understand the implementation myself.
   *
   * Invariant:
   * ```
   * other.applyToString(this.applyToString(s0)) = this.compose(other).applyToString(s0)
   * ```
   */
  compose(other) {
    const edits1 = this.normalize();
    const edits2 = other.normalize();
    if (edits1.replacements.length === 0) {
      return edits2;
    }
    if (edits2.replacements.length === 0) {
      return edits1;
    }
    const resultReplacements = [];
    let edit1Idx = 0;
    let lastEdit1EndS0Line = 1;
    let lastEdit1EndS0Col = 1;
    let headSrcRangeStartLine = 0;
    let headSrcRangeStartCol = 0;
    let headSrcRangeEndLine = 0;
    let headSrcRangeEndCol = 0;
    let headText = null;
    let headLengthLine = 0;
    let headLengthCol = 0;
    let headHasValue = false;
    let headIsInfinite = false;
    let currentPosInS1Line = 1;
    let currentPosInS1Col = 1;
    function ensureHead() {
      if (headHasValue) {
        return;
      }
      if (edit1Idx < edits1.replacements.length) {
        const nextEdit = edits1.replacements[edit1Idx];
        const nextEditStart = nextEdit.range.getStartPosition();
        const gapIsEmpty = lastEdit1EndS0Line === nextEditStart.lineNumber && lastEdit1EndS0Col === nextEditStart.column;
        if (!gapIsEmpty) {
          headSrcRangeStartLine = lastEdit1EndS0Line;
          headSrcRangeStartCol = lastEdit1EndS0Col;
          headSrcRangeEndLine = nextEditStart.lineNumber;
          headSrcRangeEndCol = nextEditStart.column;
          headText = null;
          if (lastEdit1EndS0Line === nextEditStart.lineNumber) {
            headLengthLine = 0;
            headLengthCol = nextEditStart.column - lastEdit1EndS0Col;
          } else {
            headLengthLine = nextEditStart.lineNumber - lastEdit1EndS0Line;
            headLengthCol = nextEditStart.column - 1;
          }
          headHasValue = true;
          lastEdit1EndS0Line = nextEditStart.lineNumber;
          lastEdit1EndS0Col = nextEditStart.column;
        } else {
          const nextEditEnd = nextEdit.range.getEndPosition();
          headSrcRangeStartLine = nextEditStart.lineNumber;
          headSrcRangeStartCol = nextEditStart.column;
          headSrcRangeEndLine = nextEditEnd.lineNumber;
          headSrcRangeEndCol = nextEditEnd.column;
          headText = nextEdit.text;
          let line = 0;
          let column = 0;
          const text2 = nextEdit.text;
          for (let i2 = 0; i2 < text2.length; i2++) {
            if (text2.charCodeAt(i2) === 10) {
              line++;
              column = 0;
            } else {
              column++;
            }
          }
          headLengthLine = line;
          headLengthCol = column;
          headHasValue = true;
          lastEdit1EndS0Line = nextEditEnd.lineNumber;
          lastEdit1EndS0Col = nextEditEnd.column;
          edit1Idx++;
        }
      } else {
        headIsInfinite = true;
        headSrcRangeStartLine = lastEdit1EndS0Line;
        headSrcRangeStartCol = lastEdit1EndS0Col;
        headHasValue = true;
      }
    }
    function splitText(text2, lenLine, lenCol) {
      if (lenLine === 0 && lenCol === 0) {
        return ["", text2];
      }
      let line = 0;
      let offset = 0;
      while (line < lenLine) {
        const idx = text2.indexOf("\n", offset);
        if (idx === -1) {
          throw new BugIndicatingError("Text length mismatch");
        }
        offset = idx + 1;
        line++;
      }
      offset += lenCol;
      return [text2.substring(0, offset), text2.substring(offset)];
    }
    for (const r2 of edits2.replacements) {
      const r2Start = r2.range.getStartPosition();
      const r2End = r2.range.getEndPosition();
      while (true) {
        if (currentPosInS1Line === r2Start.lineNumber && currentPosInS1Col === r2Start.column) {
          break;
        }
        ensureHead();
        if (headIsInfinite) {
          let distLine, distCol;
          if (currentPosInS1Line === r2Start.lineNumber) {
            distLine = 0;
            distCol = r2Start.column - currentPosInS1Col;
          } else {
            distLine = r2Start.lineNumber - currentPosInS1Line;
            distCol = r2Start.column - 1;
          }
          currentPosInS1Line = r2Start.lineNumber;
          currentPosInS1Col = r2Start.column;
          if (distLine === 0) {
            headSrcRangeStartCol += distCol;
          } else {
            headSrcRangeStartLine += distLine;
            headSrcRangeStartCol = distCol + 1;
          }
          break;
        }
        let headEndInS1Line, headEndInS1Col;
        if (headLengthLine === 0) {
          headEndInS1Line = currentPosInS1Line;
          headEndInS1Col = currentPosInS1Col + headLengthCol;
        } else {
          headEndInS1Line = currentPosInS1Line + headLengthLine;
          headEndInS1Col = headLengthCol + 1;
        }
        let r2StartIsBeforeHeadEnd = false;
        if (r2Start.lineNumber < headEndInS1Line) {
          r2StartIsBeforeHeadEnd = true;
        } else if (r2Start.lineNumber === headEndInS1Line) {
          r2StartIsBeforeHeadEnd = r2Start.column < headEndInS1Col;
        }
        if (r2StartIsBeforeHeadEnd) {
          let splitLenLine, splitLenCol;
          if (currentPosInS1Line === r2Start.lineNumber) {
            splitLenLine = 0;
            splitLenCol = r2Start.column - currentPosInS1Col;
          } else {
            splitLenLine = r2Start.lineNumber - currentPosInS1Line;
            splitLenCol = r2Start.column - 1;
          }
          let remainingLenLine, remainingLenCol;
          if (splitLenLine === headLengthLine) {
            remainingLenLine = 0;
            remainingLenCol = headLengthCol - splitLenCol;
          } else {
            remainingLenLine = headLengthLine - splitLenLine;
            remainingLenCol = headLengthCol;
          }
          if (headText !== null) {
            const [t1, t2] = splitText(headText, splitLenLine, splitLenCol);
            resultReplacements.push(new TextReplacement(new Range2(headSrcRangeStartLine, headSrcRangeStartCol, headSrcRangeEndLine, headSrcRangeEndCol), t1));
            headText = t2;
            headLengthLine = remainingLenLine;
            headLengthCol = remainingLenCol;
            headSrcRangeStartLine = headSrcRangeEndLine;
            headSrcRangeStartCol = headSrcRangeEndCol;
          } else {
            let splitPosLine, splitPosCol;
            if (splitLenLine === 0) {
              splitPosLine = headSrcRangeStartLine;
              splitPosCol = headSrcRangeStartCol + splitLenCol;
            } else {
              splitPosLine = headSrcRangeStartLine + splitLenLine;
              splitPosCol = splitLenCol + 1;
            }
            headSrcRangeStartLine = splitPosLine;
            headSrcRangeStartCol = splitPosCol;
            headLengthLine = remainingLenLine;
            headLengthCol = remainingLenCol;
          }
          currentPosInS1Line = r2Start.lineNumber;
          currentPosInS1Col = r2Start.column;
          break;
        }
        if (headText !== null) {
          resultReplacements.push(new TextReplacement(new Range2(headSrcRangeStartLine, headSrcRangeStartCol, headSrcRangeEndLine, headSrcRangeEndCol), headText));
        }
        currentPosInS1Line = headEndInS1Line;
        currentPosInS1Col = headEndInS1Col;
        headHasValue = false;
      }
      let consumedStartS0Line = null;
      let consumedStartS0Col = null;
      let consumedEndS0Line = null;
      let consumedEndS0Col = null;
      while (true) {
        if (currentPosInS1Line === r2End.lineNumber && currentPosInS1Col === r2End.column) {
          break;
        }
        ensureHead();
        if (headIsInfinite) {
          let distLine, distCol;
          if (currentPosInS1Line === r2End.lineNumber) {
            distLine = 0;
            distCol = r2End.column - currentPosInS1Col;
          } else {
            distLine = r2End.lineNumber - currentPosInS1Line;
            distCol = r2End.column - 1;
          }
          let rangeInS0EndLine, rangeInS0EndCol;
          if (distLine === 0) {
            rangeInS0EndLine = headSrcRangeStartLine;
            rangeInS0EndCol = headSrcRangeStartCol + distCol;
          } else {
            rangeInS0EndLine = headSrcRangeStartLine + distLine;
            rangeInS0EndCol = distCol + 1;
          }
          if (consumedStartS0Line === null) {
            consumedStartS0Line = headSrcRangeStartLine;
            consumedStartS0Col = headSrcRangeStartCol;
          }
          consumedEndS0Line = rangeInS0EndLine;
          consumedEndS0Col = rangeInS0EndCol;
          currentPosInS1Line = r2End.lineNumber;
          currentPosInS1Col = r2End.column;
          headSrcRangeStartLine = rangeInS0EndLine;
          headSrcRangeStartCol = rangeInS0EndCol;
          break;
        }
        let headEndInS1Line, headEndInS1Col;
        if (headLengthLine === 0) {
          headEndInS1Line = currentPosInS1Line;
          headEndInS1Col = currentPosInS1Col + headLengthCol;
        } else {
          headEndInS1Line = currentPosInS1Line + headLengthLine;
          headEndInS1Col = headLengthCol + 1;
        }
        let r2EndIsBeforeHeadEnd = false;
        if (r2End.lineNumber < headEndInS1Line) {
          r2EndIsBeforeHeadEnd = true;
        } else if (r2End.lineNumber === headEndInS1Line) {
          r2EndIsBeforeHeadEnd = r2End.column < headEndInS1Col;
        }
        if (r2EndIsBeforeHeadEnd) {
          let splitLenLine, splitLenCol;
          if (currentPosInS1Line === r2End.lineNumber) {
            splitLenLine = 0;
            splitLenCol = r2End.column - currentPosInS1Col;
          } else {
            splitLenLine = r2End.lineNumber - currentPosInS1Line;
            splitLenCol = r2End.column - 1;
          }
          let remainingLenLine, remainingLenCol;
          if (splitLenLine === headLengthLine) {
            remainingLenLine = 0;
            remainingLenCol = headLengthCol - splitLenCol;
          } else {
            remainingLenLine = headLengthLine - splitLenLine;
            remainingLenCol = headLengthCol;
          }
          if (headText !== null) {
            if (consumedStartS0Line === null) {
              consumedStartS0Line = headSrcRangeStartLine;
              consumedStartS0Col = headSrcRangeStartCol;
            }
            consumedEndS0Line = headSrcRangeEndLine;
            consumedEndS0Col = headSrcRangeEndCol;
            const [, t2] = splitText(headText, splitLenLine, splitLenCol);
            headText = t2;
            headLengthLine = remainingLenLine;
            headLengthCol = remainingLenCol;
            headSrcRangeStartLine = headSrcRangeEndLine;
            headSrcRangeStartCol = headSrcRangeEndCol;
          } else {
            let splitPosLine, splitPosCol;
            if (splitLenLine === 0) {
              splitPosLine = headSrcRangeStartLine;
              splitPosCol = headSrcRangeStartCol + splitLenCol;
            } else {
              splitPosLine = headSrcRangeStartLine + splitLenLine;
              splitPosCol = splitLenCol + 1;
            }
            if (consumedStartS0Line === null) {
              consumedStartS0Line = headSrcRangeStartLine;
              consumedStartS0Col = headSrcRangeStartCol;
            }
            consumedEndS0Line = splitPosLine;
            consumedEndS0Col = splitPosCol;
            headSrcRangeStartLine = splitPosLine;
            headSrcRangeStartCol = splitPosCol;
            headLengthLine = remainingLenLine;
            headLengthCol = remainingLenCol;
          }
          currentPosInS1Line = r2End.lineNumber;
          currentPosInS1Col = r2End.column;
          break;
        }
        if (consumedStartS0Line === null) {
          consumedStartS0Line = headSrcRangeStartLine;
          consumedStartS0Col = headSrcRangeStartCol;
        }
        consumedEndS0Line = headSrcRangeEndLine;
        consumedEndS0Col = headSrcRangeEndCol;
        currentPosInS1Line = headEndInS1Line;
        currentPosInS1Col = headEndInS1Col;
        headHasValue = false;
      }
      if (consumedStartS0Line !== null) {
        resultReplacements.push(new TextReplacement(new Range2(consumedStartS0Line, consumedStartS0Col, consumedEndS0Line, consumedEndS0Col), r2.text));
      } else {
        ensureHead();
        const insertPosS0Line = headSrcRangeStartLine;
        const insertPosS0Col = headSrcRangeStartCol;
        resultReplacements.push(new TextReplacement(new Range2(insertPosS0Line, insertPosS0Col, insertPosS0Line, insertPosS0Col), r2.text));
      }
    }
    while (true) {
      ensureHead();
      if (headIsInfinite) {
        break;
      }
      if (headText !== null) {
        resultReplacements.push(new TextReplacement(new Range2(headSrcRangeStartLine, headSrcRangeStartCol, headSrcRangeEndLine, headSrcRangeEndCol), headText));
      }
      headHasValue = false;
    }
    return new _TextEdit(resultReplacements).normalize();
  }
  toString(text2) {
    if (text2 === void 0) {
      return this.replacements.map((edit3) => edit3.toString()).join("\n");
    }
    if (typeof text2 === "string") {
      return this.toString(new StringText(text2));
    }
    if (this.replacements.length === 0) {
      return "";
    }
    return this.replacements.map((r2) => {
      const maxLength = 10;
      const originalText = text2.getValueOfRange(r2.range);
      const beforeRange = Range2.fromPositions(
        new Position(Math.max(1, r2.range.startLineNumber - 1), 1),
        r2.range.getStartPosition()
      );
      let beforeText = text2.getValueOfRange(beforeRange);
      if (beforeText.length > maxLength) {
        beforeText = "..." + beforeText.substring(beforeText.length - maxLength);
      }
      const afterRange = Range2.fromPositions(
        r2.range.getEndPosition(),
        new Position(r2.range.endLineNumber + 1, 1)
      );
      let afterText = text2.getValueOfRange(afterRange);
      if (afterText.length > maxLength) {
        afterText = afterText.substring(0, maxLength) + "...";
      }
      let replacedText = originalText;
      if (replacedText.length > maxLength) {
        const halfMax = Math.floor(maxLength / 2);
        replacedText = replacedText.substring(0, halfMax) + "..." + replacedText.substring(replacedText.length - halfMax);
      }
      let newText = r2.text;
      if (newText.length > maxLength) {
        const halfMax = Math.floor(maxLength / 2);
        newText = newText.substring(0, halfMax) + "..." + newText.substring(newText.length - halfMax);
      }
      if (replacedText.length === 0) {
        return `${beforeText}\u2770${newText}\u2771${afterText}`;
      }
      return `${beforeText}\u2770${replacedText}\u21A6${newText}\u2771${afterText}`;
    }).join("\n");
  }
};

var TextReplacement = class _TextReplacement {
  constructor(range2, text2) {
    this.range = range2;
    this.text = text2;
  }
  static joinReplacements(replacements, initialValue) {
    if (replacements.length === 0) {
      throw new BugIndicatingError();
    }
    if (replacements.length === 1) {
      return replacements[0];
    }
    const startPos = replacements[0].range.getStartPosition();
    const endPos = replacements[replacements.length - 1].range.getEndPosition();
    let newText = "";
    for (let i2 = 0; i2 < replacements.length; i2++) {
      const curEdit = replacements[i2];
      newText += curEdit.text;
      if (i2 < replacements.length - 1) {
        const nextEdit = replacements[i2 + 1];
        const gapRange = Range2.fromPositions(curEdit.range.getEndPosition(), nextEdit.range.getStartPosition());
        const gapText = initialValue.getValueOfRange(gapRange);
        newText += gapText;
      }
    }
    return new _TextReplacement(Range2.fromPositions(startPos, endPos), newText);
  }
  static fromStringReplacement(replacement, initialState) {
    return new _TextReplacement(initialState.getTransformer().getRange(replacement.replaceRange), replacement.newText);
  }
  static delete(range2) {
    return new _TextReplacement(range2, "");
  }
  get isEmpty() {
    return this.range.isEmpty() && this.text.length === 0;
  }
  static equals(first2, second) {
    return first2.range.equalsRange(second.range) && first2.text === second.text;
  }
  toSingleEditOperation() {
    return {
      range: this.range,
      text: this.text
    };
  }
  toEdit() {
    return new TextEdit2([this]);
  }
  equals(other) {
    return _TextReplacement.equals(this, other);
  }
  extendToCoverRange(range2, initialValue) {
    if (this.range.containsRange(range2)) {
      return this;
    }
    const newRange = this.range.plusRange(range2);
    const textBefore = initialValue.getValueOfRange(Range2.fromPositions(newRange.getStartPosition(), this.range.getStartPosition()));
    const textAfter = initialValue.getValueOfRange(Range2.fromPositions(this.range.getEndPosition(), newRange.getEndPosition()));
    const newText = textBefore + this.text + textAfter;
    return new _TextReplacement(newRange, newText);
  }
  extendToFullLine(initialValue) {
    const newRange = new Range2(
      this.range.startLineNumber,
      1,
      this.range.endLineNumber,
      initialValue.getTransformer().getLineLength(this.range.endLineNumber) + 1
    );
    return this.extendToCoverRange(newRange, initialValue);
  }
  removeCommonPrefixAndSuffix(text2) {
    const prefix = this.removeCommonPrefix(text2);
    const suffix = prefix.removeCommonSuffix(text2);
    return suffix;
  }
  removeCommonPrefix(text2) {
    const normalizedOriginalText = text2.getValueOfRange(this.range).replaceAll("\r\n", "\n");
    const normalizedModifiedText = this.text.replaceAll("\r\n", "\n");
    const commonPrefixLen = commonPrefixLength2(normalizedOriginalText, normalizedModifiedText);
    const start = TextLength.ofText(normalizedOriginalText.substring(0, commonPrefixLen)).addToPosition(this.range.getStartPosition());
    const newText = normalizedModifiedText.substring(commonPrefixLen);
    const range2 = Range2.fromPositions(start, this.range.getEndPosition());
    return new _TextReplacement(range2, newText);
  }
  removeCommonSuffix(text2) {
    const normalizedOriginalText = text2.getValueOfRange(this.range).replaceAll("\r\n", "\n");
    const normalizedModifiedText = this.text.replaceAll("\r\n", "\n");
    const commonSuffixLen = commonSuffixLength(normalizedOriginalText, normalizedModifiedText);
    const end = TextLength.ofText(normalizedOriginalText.substring(0, normalizedOriginalText.length - commonSuffixLen)).addToPosition(this.range.getStartPosition());
    const newText = normalizedModifiedText.substring(0, normalizedModifiedText.length - commonSuffixLen);
    const range2 = Range2.fromPositions(this.range.getStartPosition(), end);
    return new _TextReplacement(range2, newText);
  }
  isEffectiveDeletion(text2) {
    let newText = this.text.replaceAll("\r\n", "\n");
    let existingText = text2.getValueOfRange(this.range).replaceAll("\r\n", "\n");
    const l = commonPrefixLength2(newText, existingText);
    newText = newText.substring(l);
    existingText = existingText.substring(l);
    const r2 = commonSuffixLength(newText, existingText);
    newText = newText.substring(0, newText.length - r2);
    existingText = existingText.substring(0, existingText.length - r2);
    return newText === "";
  }
  toString() {
    const start = this.range.getStartPosition();
    const end = this.range.getEndPosition();
    return `(${start.lineNumber},${start.column} -> ${end.lineNumber},${end.column}): "${this.text}"`;
  }
};

function rangeFromPositions(start, end) {
  if (start.lineNumber === end.lineNumber && start.column === Number.MAX_SAFE_INTEGER) {
    return Range2.fromPositions(end, end);
  } else if (!start.isBeforeOrEqual(end)) {
    throw new BugIndicatingError("start must be before end");
  }
  return new Range2(start.lineNumber, start.column, end.lineNumber, end.column);
}
export { rangeFromPositions, TextEdit2, TextReplacement };
