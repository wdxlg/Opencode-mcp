// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/viewLayout/lineDecorations.ts
import { isHighSurrogate } from "./module-0030.mjs";


// src/vs/editor/common/viewLayout/lineDecorations.ts
var LineDecoration = class _LineDecoration {
  constructor(startColumn, endColumn, className2, type) {
    this.startColumn = startColumn;
    this.endColumn = endColumn;
    this.className = className2;
    this.type = type;
    this._lineDecorationBrand = void 0;
  }
  static _equals(a, b) {
    return a.startColumn === b.startColumn && a.endColumn === b.endColumn && a.className === b.className && a.type === b.type;
  }
  static equalsArr(a, b) {
    const aLen = a.length;
    const bLen = b.length;
    if (aLen !== bLen) {
      return false;
    }
    for (let i2 = 0; i2 < aLen; i2++) {
      if (!_LineDecoration._equals(a[i2], b[i2])) {
        return false;
      }
    }
    return true;
  }
  static extractWrapped(arr, startOffset, endOffset) {
    if (arr.length === 0) {
      return arr;
    }
    const startColumn = startOffset + 1;
    const endColumn = endOffset + 1;
    const lineLength = endOffset - startOffset;
    const r2 = [];
    let rLength = 0;
    for (const dec of arr) {
      if (dec.endColumn <= startColumn || dec.startColumn >= endColumn) {
        continue;
      }
      r2[rLength++] = new _LineDecoration(Math.max(1, dec.startColumn - startColumn + 1), Math.min(lineLength + 1, dec.endColumn - startColumn + 1), dec.className, dec.type);
    }
    return r2;
  }
  static filter(lineDecorations, lineNumber, minLineColumn, maxLineColumn) {
    if (lineDecorations.length === 0) {
      return [];
    }
    const result = [];
    let resultLen = 0;
    for (let i2 = 0, len = lineDecorations.length; i2 < len; i2++) {
      const d = lineDecorations[i2];
      const range2 = d.range;
      if (range2.endLineNumber < lineNumber || range2.startLineNumber > lineNumber) {
        continue;
      }
      if (range2.isEmpty() && (d.type === 0 /* Regular */ || d.type === 3 /* RegularAffectingLetterSpacing */)) {
        continue;
      }
      const startColumn = range2.startLineNumber === lineNumber ? range2.startColumn : minLineColumn;
      const endColumn = range2.endLineNumber === lineNumber ? range2.endColumn : maxLineColumn;
      result[resultLen++] = new _LineDecoration(startColumn, endColumn, d.inlineClassName, d.type);
    }
    return result;
  }
  static _typeCompare(a, b) {
    const ORDER = [3, 1, 2, 4, 0];
    return ORDER[a] - ORDER[b];
  }
  static compare(a, b) {
    if (a.startColumn !== b.startColumn) {
      return a.startColumn - b.startColumn;
    }
    if (a.endColumn !== b.endColumn) {
      return a.endColumn - b.endColumn;
    }
    const typeCmp = _LineDecoration._typeCompare(a.type, b.type);
    if (typeCmp !== 0) {
      return typeCmp;
    }
    if (a.className !== b.className) {
      return a.className < b.className ? -1 : 1;
    }
    return 0;
  }
};

var DecorationSegment = class {
  constructor(startOffset, endOffset, className2, metadata) {
    this.startOffset = startOffset;
    this.endOffset = endOffset;
    this.className = className2;
    this.metadata = metadata;
  }
};

var Stack = class _Stack {
  constructor() {
    this.stopOffsets = [];
    this.classNames = [];
    this.metadata = [];
    this.count = 0;
  }
  static _metadata(metadata) {
    let result = 0;
    for (let i2 = 0, len = metadata.length; i2 < len; i2++) {
      result |= metadata[i2];
    }
    return result;
  }
  consumeLowerThan(maxStopOffset, nextStartOffset, result) {
    while (this.count > 0 && this.stopOffsets[0] < maxStopOffset) {
      let i2 = 0;
      while (i2 + 1 < this.count && this.stopOffsets[i2] === this.stopOffsets[i2 + 1]) {
        i2++;
      }
      result.push(new DecorationSegment(nextStartOffset, this.stopOffsets[i2], this.classNames.join(" "), _Stack._metadata(this.metadata)));
      nextStartOffset = this.stopOffsets[i2] + 1;
      this.stopOffsets.splice(0, i2 + 1);
      this.classNames.splice(0, i2 + 1);
      this.metadata.splice(0, i2 + 1);
      this.count -= i2 + 1;
    }
    if (this.count > 0 && nextStartOffset < maxStopOffset) {
      result.push(new DecorationSegment(nextStartOffset, maxStopOffset - 1, this.classNames.join(" "), _Stack._metadata(this.metadata)));
      nextStartOffset = maxStopOffset;
    }
    return nextStartOffset;
  }
  insert(stopOffset, className2, metadata) {
    if (this.count === 0 || this.stopOffsets[this.count - 1] <= stopOffset) {
      this.stopOffsets.push(stopOffset);
      this.classNames.push(className2);
      this.metadata.push(metadata);
    } else {
      for (let i2 = 0; i2 < this.count; i2++) {
        if (this.stopOffsets[i2] >= stopOffset) {
          this.stopOffsets.splice(i2, 0, stopOffset);
          this.classNames.splice(i2, 0, className2);
          this.metadata.splice(i2, 0, metadata);
          break;
        }
      }
    }
    this.count++;
    return;
  }
};

var LineDecorationsNormalizer = class {
  /**
   * Normalize line decorations. Overlapping decorations will generate multiple segments
   */
  static normalize(lineContent, lineDecorations) {
    if (lineDecorations.length === 0) {
      return [];
    }
    const result = [];
    const stack = new Stack();
    let nextStartOffset = 0;
    for (let i2 = 0, len = lineDecorations.length; i2 < len; i2++) {
      const d = lineDecorations[i2];
      let startColumn = d.startColumn;
      let endColumn = d.endColumn;
      const className2 = d.className;
      const metadata = d.type === 1 /* Before */ ? 2 /* PSEUDO_BEFORE */ : d.type === 2 /* After */ ? 4 /* PSEUDO_AFTER */ : 0;
      if (startColumn > 1) {
        const charCodeBefore = lineContent.charCodeAt(startColumn - 2);
        if (isHighSurrogate(charCodeBefore)) {
          startColumn--;
        }
      }
      if (endColumn > 1) {
        const charCodeBefore = lineContent.charCodeAt(endColumn - 2);
        if (isHighSurrogate(charCodeBefore)) {
          endColumn--;
        }
      }
      const currentStartOffset = startColumn - 1;
      const currentEndOffset = endColumn - 2;
      nextStartOffset = stack.consumeLowerThan(currentStartOffset, nextStartOffset, result);
      if (stack.count === 0) {
        nextStartOffset = currentStartOffset;
      }
      stack.insert(currentEndOffset, className2, metadata);
    }
    stack.consumeLowerThan(1073741824 /* MAX_SAFE_SMALL_INTEGER */, nextStartOffset, result);
    return result;
  }
};
export { LineDecoration, DecorationSegment, Stack, LineDecorationsNormalizer };
