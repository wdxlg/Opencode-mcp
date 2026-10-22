// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/lineNumbers/lineNumbers.ts
import { DynamicViewOverlay } from "./module-0286.mjs";
import { Position } from "./module-0079.mjs";
import { isLinux } from "./module-0014.mjs";
import { Range2 } from "./module-0106.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { editorDimmedLineNumber, editorLineNumbers } from "./module-0288.mjs";


// src/vs/editor/browser/viewParts/lineNumbers/lineNumbers.ts
var LineNumbersOverlay = class _LineNumbersOverlay extends DynamicViewOverlay {
  static {
    this.CLASS_NAME = "line-numbers";
  }
  constructor(context2) {
    super();
    this._context = context2;
    this._readConfig();
    this._lastCursorModelPosition = new Position(1, 1);
    this._renderResult = null;
    this._activeModelLineNumber = 1;
    this._context.addEventHandler(this);
  }
  _readConfig() {
    const options3 = this._context.configuration.options;
    this._lineHeight = options3.get(75 /* lineHeight */);
    const lineNumbers = options3.get(76 /* lineNumbers */);
    this._renderLineNumbers = lineNumbers.renderType;
    this._renderCustomLineNumbers = lineNumbers.renderFn;
    this._renderFinalNewline = options3.get(109 /* renderFinalNewline */);
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._lineNumbersLeft = layoutInfo.lineNumbersLeft;
    this._lineNumbersWidth = layoutInfo.lineNumbersWidth;
  }
  dispose() {
    this._context.removeEventHandler(this);
    this._renderResult = null;
    super.dispose();
  }
  // --- begin event handlers
  onConfigurationChanged(e4) {
    this._readConfig();
    return true;
  }
  onCursorStateChanged(e4) {
    const primaryViewPosition = e4.selections[0].getPosition();
    this._lastCursorModelPosition = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(primaryViewPosition);
    let shouldRender = false;
    if (this._activeModelLineNumber !== this._lastCursorModelPosition.lineNumber) {
      this._activeModelLineNumber = this._lastCursorModelPosition.lineNumber;
      shouldRender = true;
    }
    if (this._renderLineNumbers === 2 /* Relative */ || this._renderLineNumbers === 3 /* Interval */) {
      shouldRender = true;
    }
    return shouldRender;
  }
  onFlushed(e4) {
    return true;
  }
  onLinesChanged(e4) {
    return true;
  }
  onLinesDeleted(e4) {
    return true;
  }
  onLinesInserted(e4) {
    return true;
  }
  onScrollChanged(e4) {
    return e4.scrollTopChanged;
  }
  onZonesChanged(e4) {
    return true;
  }
  onDecorationsChanged(e4) {
    return e4.affectsLineNumber;
  }
  // --- end event handlers
  _getLineRenderLineNumber(viewLineNumber) {
    const modelPosition = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new Position(viewLineNumber, 1));
    if (modelPosition.column !== 1) {
      return "";
    }
    const modelLineNumber = modelPosition.lineNumber;
    if (this._renderCustomLineNumbers) {
      return this._renderCustomLineNumbers(modelLineNumber);
    }
    if (this._renderLineNumbers === 2 /* Relative */) {
      const diff4 = Math.abs(this._lastCursorModelPosition.lineNumber - modelLineNumber);
      if (diff4 === 0) {
        return '<span class="relative-current-line-number">' + modelLineNumber + "</span>";
      }
      return String(diff4);
    }
    if (this._renderLineNumbers === 3 /* Interval */) {
      if (this._lastCursorModelPosition.lineNumber === modelLineNumber) {
        return String(modelLineNumber);
      }
      if (modelLineNumber % 10 === 0) {
        return String(modelLineNumber);
      }
      const finalLineNumber = this._context.viewModel.getLineCount();
      if (modelLineNumber === finalLineNumber) {
        return String(modelLineNumber);
      }
      return "";
    }
    return String(modelLineNumber);
  }
  prepareRender(ctx) {
    if (this._renderLineNumbers === 0 /* Off */) {
      this._renderResult = null;
      return;
    }
    const lineHeightClassName = isLinux ? this._lineHeight % 2 === 0 ? " lh-even" : " lh-odd" : "";
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    const lineNoDecorations = this._context.viewModel.getDecorationsInViewport(ctx.visibleRange).filter((d) => !!d.options.lineNumberClassName);
    lineNoDecorations.sort((a, b) => Range2.compareRangesUsingEnds(a.range, b.range));
    let decorationStartIndex = 0;
    const lineCount = this._context.viewModel.getLineCount();
    const output = [];
    for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
      const lineIndex = lineNumber - visibleStartLineNumber;
      const modelLineNumber = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new Position(lineNumber, 1)).lineNumber;
      let renderLineNumber = this._getLineRenderLineNumber(lineNumber);
      let extraClassNames = "";
      while (decorationStartIndex < lineNoDecorations.length && lineNoDecorations[decorationStartIndex].range.endLineNumber < lineNumber) {
        decorationStartIndex++;
      }
      for (let i2 = decorationStartIndex; i2 < lineNoDecorations.length; i2++) {
        const { range: range2, options: options3 } = lineNoDecorations[i2];
        if (range2.startLineNumber <= lineNumber) {
          extraClassNames += " " + options3.lineNumberClassName;
        }
      }
      if (!renderLineNumber && !extraClassNames) {
        output[lineIndex] = "";
        continue;
      }
      if (lineNumber === lineCount && this._context.viewModel.getLineLength(lineNumber) === 0) {
        if (this._renderFinalNewline === "off") {
          renderLineNumber = "";
        }
        if (this._renderFinalNewline === "dimmed") {
          extraClassNames += " dimmed-line-number";
        }
      }
      if (modelLineNumber === this._activeModelLineNumber) {
        extraClassNames += " active-line-number";
      }
      output[lineIndex] = `<div class="${_LineNumbersOverlay.CLASS_NAME}${lineHeightClassName}${extraClassNames}" style="left:${this._lineNumbersLeft}px;width:${this._lineNumbersWidth}px;">${renderLineNumber}</div>`;
    }
    this._renderResult = output;
  }
  render(startLineNumber, lineNumber) {
    if (!this._renderResult) {
      return "";
    }
    const lineIndex = lineNumber - startLineNumber;
    if (lineIndex < 0 || lineIndex >= this._renderResult.length) {
      return "";
    }
    return this._renderResult[lineIndex];
  }
};

registerThemingParticipant((theme, collector) => {
  const editorLineNumbersColor = theme.getColor(editorLineNumbers);
  const editorDimmedLineNumberColor = theme.getColor(editorDimmedLineNumber);
  if (editorDimmedLineNumberColor) {
    collector.addRule(`.monaco-editor .line-numbers.dimmed-line-number { color: ${editorDimmedLineNumberColor}; }`);
  } else if (editorLineNumbersColor) {
    collector.addRule(`.monaco-editor .line-numbers.dimmed-line-number { color: ${editorLineNumbersColor.transparent(0.4)}; }`);
  }
});
export { LineNumbersOverlay };
