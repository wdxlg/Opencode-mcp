// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/utils/utils.ts
import { observableSignalFromEvent } from "./module-0062.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { Position } from "./module-0079.mjs";
import { Size2D } from "./module-0764.mjs";
import { indentOfLine } from "./module-0423.mjs";
import { observableCodeEditor } from "./module-0493.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { Rect } from "./module-0765.mjs";
import { URI } from "./module-0032.mjs";
import { RangeMapping } from "./module-0179.mjs";
import { Range2 } from "./module-0106.mjs";
import { splitLines } from "./module-0030.mjs";
import { findFirstMin } from "./module-0006.mjs";
import { numberComparator } from "./module-0007.mjs";
import { TextEdit2, TextReplacement } from "./module-0178.mjs";
import { OffsetRange } from "./module-0144.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { DebugLocation } from "./module-0046.mjs";
import { observableValue } from "./module-0048.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/view/inlineEdits/utils/utils.ts
function maxContentWidthInRange(editor, range2, reader) {
  const model = editor.model.read(reader);
  if (!model) {
    return 0;
  }
  let maxContentWidth = 0;
  for (let i2 = range2.startLineNumber; i2 < range2.endLineNumberExclusive; i2++) {
    const lineContentWidth = editor.getWidthOfLine(i2, reader);
    maxContentWidth = Math.max(maxContentWidth, lineContentWidth);
  }
  const lines = range2.mapToLineArray((l) => model.getLineContent(l));
  if (maxContentWidth < 5 && lines.some((l) => l.length > 0) && model.uri.scheme !== "file") {
    console.log("unexpected width");
  }
  return maxContentWidth;
}

function getContentSizeOfLines(editor, range2, reader) {
  observableSignalFromEvent(editor, editor.editor.onDidChangeLineHeight).read(reader);
  const model = editor.model.read(reader);
  if (!model) {
    throw new BugIndicatingError("Model is required");
  }
  const sizes = [];
  for (let i2 = range2.startLineNumber; i2 < range2.endLineNumberExclusive; i2++) {
    let lineContentWidth = editor.getWidthOfLine(i2, reader);
    if (lineContentWidth === -1) {
      const column = model.getLineMaxColumn(i2);
      const typicalHalfwidthCharacterWidth = editor.editor.getOption(59 /* fontInfo */).typicalHalfwidthCharacterWidth;
      const approximation = column * typicalHalfwidthCharacterWidth;
      lineContentWidth = approximation;
    }
    const height = editor.editor.getLineHeightForPosition(new Position(i2, 1));
    sizes.push(new Size2D(lineContentWidth, height));
  }
  return sizes;
}

function getOffsetForPos(editor, pos, reader) {
  editor.layoutInfo.read(reader);
  editor.value.read(reader);
  const model = editor.model.read(reader);
  if (!model) {
    return 0;
  }
  editor.scrollTop.read(reader);
  const lineContentWidth = editor.editor.getOffsetForColumn(pos.lineNumber, pos.column);
  return lineContentWidth;
}

function getPrefixTrim(diffRanges, originalLinesRange, modifiedLines, editor, reader = void 0) {
  const textModel = editor.getModel();
  if (!textModel) {
    return { prefixTrim: 0, prefixLeftOffset: 0 };
  }
  const replacementStart = diffRanges.map((r2) => r2.isSingleLine() ? r2.startColumn - 1 : 0);
  const originalIndents = originalLinesRange.mapToLineArray((line) => indentOfLine(textModel.getLineContent(line)));
  const modifiedIndents = modifiedLines.filter((line) => line !== "").map((line) => indentOfLine(line));
  const prefixTrim = Math.min(...replacementStart, ...originalIndents, ...modifiedIndents);
  let prefixLeftOffset;
  const startLineIndent = textModel.getLineIndentColumn(originalLinesRange.startLineNumber);
  if (startLineIndent >= prefixTrim + 1) {
    observableCodeEditor(editor).scrollTop.read(reader);
    prefixLeftOffset = editor.getOffsetForColumn(originalLinesRange.startLineNumber, prefixTrim + 1);
  } else if (modifiedLines.length > 0) {
    prefixLeftOffset = getContentRenderWidth(modifiedLines[0].slice(0, prefixTrim), editor, textModel);
  } else {
    return { prefixTrim: 0, prefixLeftOffset: 0 };
  }
  return { prefixTrim, prefixLeftOffset };
}

function getContentRenderWidth(content2, editor, textModel) {
  const w = editor.getOption(59 /* fontInfo */).typicalHalfwidthCharacterWidth;
  const tabSize = textModel.getOptions().tabSize * w;
  const numTabs = content2.split("	").length - 1;
  const numNoneTabs = content2.length - numTabs;
  return numNoneTabs * w + numTabs * tabSize;
}

function getEditorValidOverlayRect(editor) {
  const contentLeft = editor.layoutInfoContentLeft;
  const width2 = derived({ name: "editor.validOverlay.width" }, (r2) => {
    const hasMinimapOnTheRight = editor.layoutInfoMinimap.read(r2).minimapLeft !== 0;
    const editorWidth = Math.max(0, editor.layoutInfoWidth.read(r2) - contentLeft.read(r2));
    if (hasMinimapOnTheRight) {
      const minimapAndScrollbarWidth = editor.layoutInfoMinimap.read(r2).minimapWidth + editor.layoutInfoVerticalScrollbarWidth.read(r2);
      return Math.max(0, editorWidth - minimapAndScrollbarWidth);
    }
    return editorWidth;
  });
  const height = derived({ name: "editor.validOverlay.height" }, (r2) => editor.layoutInfoHeight.read(r2) + editor.contentHeight.read(r2));
  return derived({ name: "editor.validOverlay" }, (r2) => Rect.fromLeftTopWidthHeight(contentLeft.read(r2), 0, width2.read(r2), height.read(r2)));
}

var UniqueUriGenerator = class _UniqueUriGenerator {
  constructor(scheme) {
    this.scheme = scheme;
  }
  static {
    this._modelId = 0;
  }
  getUniqueUri() {
    return URI.from({ scheme: this.scheme, path: (/* @__PURE__ */ new Date()).toString() + String(_UniqueUriGenerator._modelId++) });
  }
};

function applyEditToModifiedRangeMappings(rangeMapping, edit3) {
  const updatedMappings = [];
  for (const m of rangeMapping) {
    const updatedRange = edit3.mapRange(m.modifiedRange);
    updatedMappings.push(new RangeMapping(m.originalRange, updatedRange));
  }
  return updatedMappings;
}

function classNames(...classes2) {
  return classes2.filter((c) => typeof c === "string").join(" ");
}

function offsetRangeToRange(columnOffsetRange, startPos) {
  return new Range2(
    startPos.lineNumber,
    startPos.column + columnOffsetRange.start,
    startPos.lineNumber,
    startPos.column + columnOffsetRange.endExclusive
  );
}

function getIndentationSize(line, tabSize) {
  let currentSize = 0;
  loop: for (let i2 = 0, len = line.length; i2 < len; i2++) {
    switch (line.charCodeAt(i2)) {
      case 9 /* Tab */:
        currentSize += tabSize;
        break;
      case 32 /* Space */:
        currentSize++;
        break;
      default:
        break loop;
    }
  }
  return currentSize - currentSize % tabSize;
}

function indentSizeToIndentLength(line, indentSize, tabSize) {
  let remainingSize = indentSize - indentSize % tabSize;
  let i2 = 0;
  for (; i2 < line.length; i2++) {
    if (remainingSize === 0) {
      break;
    }
    switch (line.charCodeAt(i2)) {
      case 9 /* Tab */:
        remainingSize -= tabSize;
        break;
      case 32 /* Space */:
        remainingSize--;
        break;
      default:
        throw new BugIndicatingError("Unexpected character found while calculating indent length");
    }
  }
  return i2;
}

function createReindentEdit(text2, range2, tabSize) {
  const newLines = splitLines(text2);
  const edits = [];
  const minIndentSize = findFirstMin(range2.mapToLineArray((l) => getIndentationSize(newLines[l - 1], tabSize)), numberComparator);
  range2.forEach((lineNumber) => {
    const indentLength = indentSizeToIndentLength(newLines[lineNumber - 1], minIndentSize, tabSize);
    edits.push(new TextReplacement(offsetRangeToRange(new OffsetRange(0, indentLength), new Position(lineNumber, 1)), ""));
  });
  return new TextEdit2(edits);
}

var PathBuilder = class {
  constructor() {
    this._data = "";
  }
  moveTo(point) {
    this._data += `M ${point.x} ${point.y} `;
    return this;
  }
  lineTo(point) {
    this._data += `L ${point.x} ${point.y} `;
    return this;
  }
  curveTo(cp, to) {
    this._data += `Q ${cp.x} ${cp.y} ${to.x} ${to.y} `;
    return this;
  }
  curveTo2(cp1, cp2, to) {
    this._data += `C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${to.x} ${to.y} `;
    return this;
  }
  build() {
    return this._data;
  }
};

function mapOutFalsy(obs) {
  const nonUndefinedObs = derivedObservableWithCache(void 0, (reader, lastValue) => obs.read(reader) || lastValue);
  return derivedOpts({
    debugName: () => `${obs.debugName}.mapOutFalsy`
  }, (reader) => {
    nonUndefinedObs.read(reader);
    const val = obs.read(reader);
    if (!val) {
      return void 0;
    }
    return nonUndefinedObs;
  });
}

function rectToProps(fn, debugLocation = DebugLocation.ofCaller()) {
  return {
    left: derived({ name: "editor.validOverlay.left" }, (reader) => (
      /** @description left */
      fn(reader)?.left
    ), debugLocation),
    top: derived({ name: "editor.validOverlay.top" }, (reader) => (
      /** @description top */
      fn(reader)?.top
    ), debugLocation),
    width: derived({ name: "editor.validOverlay.width" }, (reader) => {
      const val = fn(reader);
      if (!val) {
        return void 0;
      }
      return val.width;
    }, debugLocation),
    height: derived({ name: "editor.validOverlay.height" }, (reader) => {
      const val = fn(reader);
      if (!val) {
        return void 0;
      }
      return val.height;
    }, debugLocation)
  };
}

function observeEditorBoundingClientRect(editor, store) {
  const dom = editor.getContainerDomNode();
  const initialDomRect = observableValue("domRect", dom.getBoundingClientRect());
  store.add(editor.onDidLayoutChange((e) => {
    initialDomRect.set(dom.getBoundingClientRect(), void 0);
  }));
  return initialDomRect;
}
export { maxContentWidthInRange, getContentSizeOfLines, getOffsetForPos, getPrefixTrim, getContentRenderWidth, getEditorValidOverlayRect, applyEditToModifiedRangeMappings, classNames, offsetRangeToRange, getIndentationSize, indentSizeToIndentLength, createReindentEdit, mapOutFalsy, rectToProps, observeEditorBoundingClientRect, UniqueUriGenerator, PathBuilder };
