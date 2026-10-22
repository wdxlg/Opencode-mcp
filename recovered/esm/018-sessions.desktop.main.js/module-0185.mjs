// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/diff/defaultLinesDiffComputer/linesSliceCharSequence.ts
import { OffsetRange } from "./module-0144.mjs";
import { findFirstMonotonous, findLastIdxMonotonous, findLastMonotonous } from "./module-0006.mjs";
import { Position } from "./module-0079.mjs";
import { Range2 } from "./module-0106.mjs";
import { isSpace } from "./module-0182.mjs";


// src/vs/editor/common/diff/defaultLinesDiffComputer/linesSliceCharSequence.ts
var LinesSliceCharSequence = class {
  constructor(lines, range2, considerWhitespaceChanges) {
    this.lines = lines;
    this.range = range2;
    this.considerWhitespaceChanges = considerWhitespaceChanges;
    this.elements = [];
    this.firstElementOffsetByLineIdx = [];
    this.lineStartOffsets = [];
    this.trimmedWsLengthsByLineIdx = [];
    this.firstElementOffsetByLineIdx.push(0);
    for (let lineNumber = this.range.startLineNumber; lineNumber <= this.range.endLineNumber; lineNumber++) {
      let line = lines[lineNumber - 1];
      let lineStartOffset = 0;
      if (lineNumber === this.range.startLineNumber && this.range.startColumn > 1) {
        lineStartOffset = this.range.startColumn - 1;
        line = line.substring(lineStartOffset);
      }
      this.lineStartOffsets.push(lineStartOffset);
      let trimmedWsLength = 0;
      if (!considerWhitespaceChanges) {
        const trimmedStartLine = line.trimStart();
        trimmedWsLength = line.length - trimmedStartLine.length;
        line = trimmedStartLine.trimEnd();
      }
      this.trimmedWsLengthsByLineIdx.push(trimmedWsLength);
      const lineLength = lineNumber === this.range.endLineNumber ? Math.min(this.range.endColumn - 1 - lineStartOffset - trimmedWsLength, line.length) : line.length;
      for (let i2 = 0; i2 < lineLength; i2++) {
        this.elements.push(line.charCodeAt(i2));
      }
      if (lineNumber < this.range.endLineNumber) {
        this.elements.push("\n".charCodeAt(0));
        this.firstElementOffsetByLineIdx.push(this.elements.length);
      }
    }
  }
  toString() {
    return `Slice: "${this.text}"`;
  }
  get text() {
    return this.getText(new OffsetRange(0, this.length));
  }
  getText(range2) {
    return this.elements.slice(range2.start, range2.endExclusive).map((e4) => String.fromCharCode(e4)).join("");
  }
  getElement(offset) {
    return this.elements[offset];
  }
  get length() {
    return this.elements.length;
  }
  getBoundaryScore(length) {
    const prevCategory = getCategory(length > 0 ? this.elements[length - 1] : -1);
    const nextCategory = getCategory(length < this.elements.length ? this.elements[length] : -1);
    if (prevCategory === 7 /* LineBreakCR */ && nextCategory === 8 /* LineBreakLF */) {
      return 0;
    }
    if (prevCategory === 8 /* LineBreakLF */) {
      return 150;
    }
    let score3 = 0;
    if (prevCategory !== nextCategory) {
      score3 += 10;
      if (prevCategory === 0 /* WordLower */ && nextCategory === 1 /* WordUpper */) {
        score3 += 1;
      }
    }
    score3 += getCategoryBoundaryScore(prevCategory);
    score3 += getCategoryBoundaryScore(nextCategory);
    return score3;
  }
  translateOffset(offset, preference = "right") {
    const i2 = findLastIdxMonotonous(this.firstElementOffsetByLineIdx, (value2) => value2 <= offset);
    const lineOffset = offset - this.firstElementOffsetByLineIdx[i2];
    return new Position(
      this.range.startLineNumber + i2,
      1 + this.lineStartOffsets[i2] + lineOffset + (lineOffset === 0 && preference === "left" ? 0 : this.trimmedWsLengthsByLineIdx[i2])
    );
  }
  translateRange(range2) {
    const pos1 = this.translateOffset(range2.start, "right");
    const pos2 = this.translateOffset(range2.endExclusive, "left");
    if (pos2.isBefore(pos1)) {
      return Range2.fromPositions(pos2, pos2);
    }
    return Range2.fromPositions(pos1, pos2);
  }
  /**
   * Finds the word that contains the character at the given offset
   */
  findWordContaining(offset) {
    if (offset < 0 || offset >= this.elements.length) {
      return void 0;
    }
    if (!isWordChar(this.elements[offset])) {
      return void 0;
    }
    let start = offset;
    while (start > 0 && isWordChar(this.elements[start - 1])) {
      start--;
    }
    let end = offset;
    while (end < this.elements.length && isWordChar(this.elements[end])) {
      end++;
    }
    return new OffsetRange(start, end);
  }
  /** fooBar has the two sub-words foo and bar */
  findSubWordContaining(offset) {
    if (offset < 0 || offset >= this.elements.length) {
      return void 0;
    }
    if (!isWordChar(this.elements[offset])) {
      return void 0;
    }
    let start = offset;
    while (start > 0 && isWordChar(this.elements[start - 1]) && !isUpperCase(this.elements[start])) {
      start--;
    }
    let end = offset;
    while (end < this.elements.length && isWordChar(this.elements[end]) && !isUpperCase(this.elements[end])) {
      end++;
    }
    return new OffsetRange(start, end);
  }
  countLinesIn(range2) {
    return this.translateOffset(range2.endExclusive).lineNumber - this.translateOffset(range2.start).lineNumber;
  }
  isStronglyEqual(offset1, offset2) {
    return this.elements[offset1] === this.elements[offset2];
  }
  extendToFullLines(range2) {
    const start = findLastMonotonous(this.firstElementOffsetByLineIdx, (x) => x <= range2.start) ?? 0;
    const end = findFirstMonotonous(this.firstElementOffsetByLineIdx, (x) => range2.endExclusive <= x) ?? this.elements.length;
    return new OffsetRange(start, end);
  }
};

function isWordChar(charCode) {
  return charCode >= 97 /* a */ && charCode <= 122 /* z */ || charCode >= 65 /* A */ && charCode <= 90 /* Z */ || charCode >= 48 /* Digit0 */ && charCode <= 57 /* Digit9 */;
}

function isUpperCase(charCode) {
  return charCode >= 65 /* A */ && charCode <= 90 /* Z */;
}

var score = {
  [0 /* WordLower */]: 0,
  [1 /* WordUpper */]: 0,
  [2 /* WordNumber */]: 0,
  [3 /* End */]: 10,
  [4 /* Other */]: 2,
  [5 /* Separator */]: 30,
  [6 /* Space */]: 3,
  [7 /* LineBreakCR */]: 10,
  [8 /* LineBreakLF */]: 10
};

function getCategoryBoundaryScore(category9) {
  return score[category9];
}

function getCategory(charCode) {
  if (charCode === 10 /* LineFeed */) {
    return 8 /* LineBreakLF */;
  } else if (charCode === 13 /* CarriageReturn */) {
    return 7 /* LineBreakCR */;
  } else if (isSpace(charCode)) {
    return 6 /* Space */;
  } else if (charCode >= 97 /* a */ && charCode <= 122 /* z */) {
    return 0 /* WordLower */;
  } else if (charCode >= 65 /* A */ && charCode <= 90 /* Z */) {
    return 1 /* WordUpper */;
  } else if (charCode >= 48 /* Digit0 */ && charCode <= 57 /* Digit9 */) {
    return 2 /* WordNumber */;
  } else if (charCode === -1) {
    return 3 /* End */;
  } else if (charCode === 44 /* Comma */ || charCode === 59 /* Semicolon */) {
    return 5 /* Separator */;
  } else {
    return 4 /* Other */;
  }
}
export { isWordChar, isUpperCase, getCategoryBoundaryScore, getCategory, LinesSliceCharSequence, score };
