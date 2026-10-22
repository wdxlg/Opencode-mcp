// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/currentLineHighlight/currentLineHighlight.ts
import { DynamicViewOverlay } from "./module-0286.mjs";
import { Selection } from "./module-0107.mjs";
import { equals } from "./module-0007.mjs";
import { Position } from "./module-0079.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { editorInactiveLineHighlight, editorLineHighlight, editorLineHighlightBorder } from "./module-0288.mjs";
import { isHighContrast } from "./module-0247.mjs";


// src/vs/editor/browser/viewParts/currentLineHighlight/currentLineHighlight.ts
var AbstractLineHighlightOverlay = class extends DynamicViewOverlay {
  constructor(context2) {
    super();
    this._context = context2;
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._renderLineHighlight = options3.get(110 /* renderLineHighlight */);
    this._renderLineHighlightOnlyWhenFocus = options3.get(111 /* renderLineHighlightOnlyWhenFocus */);
    this._wordWrap = layoutInfo.isViewportWrapping;
    this._contentLeft = layoutInfo.contentLeft;
    this._contentWidth = layoutInfo.contentWidth;
    this._selectionIsEmpty = true;
    this._focused = false;
    this._cursorLineNumbers = [1];
    this._selections = [new Selection(1, 1, 1, 1)];
    this._renderData = null;
    this._context.addEventHandler(this);
  }
  dispose() {
    this._context.removeEventHandler(this);
    super.dispose();
  }
  _readFromSelections() {
    let hasChanged = false;
    const lineNumbers = /* @__PURE__ */ new Set();
    for (const selection of this._selections) {
      lineNumbers.add(selection.positionLineNumber);
    }
    const cursorsLineNumbers = Array.from(lineNumbers);
    cursorsLineNumbers.sort((a, b) => a - b);
    if (!equals(this._cursorLineNumbers, cursorsLineNumbers)) {
      this._cursorLineNumbers = cursorsLineNumbers;
      hasChanged = true;
    }
    const selectionIsEmpty = this._selections.every((s) => s.isEmpty());
    if (this._selectionIsEmpty !== selectionIsEmpty) {
      this._selectionIsEmpty = selectionIsEmpty;
      hasChanged = true;
    }
    return hasChanged;
  }
  // --- begin event handlers
  onThemeChanged(e) {
    return this._readFromSelections();
  }
  onConfigurationChanged(e) {
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._renderLineHighlight = options3.get(110 /* renderLineHighlight */);
    this._renderLineHighlightOnlyWhenFocus = options3.get(111 /* renderLineHighlightOnlyWhenFocus */);
    this._wordWrap = layoutInfo.isViewportWrapping;
    this._contentLeft = layoutInfo.contentLeft;
    this._contentWidth = layoutInfo.contentWidth;
    return true;
  }
  onCursorStateChanged(e) {
    this._selections = e.selections;
    return this._readFromSelections();
  }
  onFlushed(e) {
    return true;
  }
  onLinesDeleted(e) {
    return true;
  }
  onLinesInserted(e) {
    return true;
  }
  onScrollChanged(e) {
    return e.scrollWidthChanged || e.scrollTopChanged;
  }
  onZonesChanged(e) {
    return true;
  }
  onFocusChanged(e) {
    if (!this._renderLineHighlightOnlyWhenFocus) {
      return false;
    }
    this._focused = e.isFocused;
    return true;
  }
  // --- end event handlers
  prepareRender(ctx) {
    if (!this._shouldRenderThis()) {
      this._renderData = null;
      return;
    }
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    const renderData = [];
    for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
      const lineIndex = lineNumber - visibleStartLineNumber;
      renderData[lineIndex] = "";
    }
    if (this._wordWrap) {
      const renderedLineWrapped = this._renderOne(ctx, false);
      for (const cursorLineNumber of this._cursorLineNumbers) {
        const coordinatesConverter = this._context.viewModel.coordinatesConverter;
        const modelLineNumber = coordinatesConverter.convertViewPositionToModelPosition(new Position(cursorLineNumber, 1)).lineNumber;
        const firstViewLineNumber = coordinatesConverter.convertModelPositionToViewPosition(new Position(modelLineNumber, 1)).lineNumber;
        const lastViewLineNumber = coordinatesConverter.convertModelPositionToViewPosition(new Position(modelLineNumber, this._context.viewModel.model.getLineMaxColumn(modelLineNumber))).lineNumber;
        const firstLine3 = Math.max(firstViewLineNumber, visibleStartLineNumber);
        const lastLine = Math.min(lastViewLineNumber, visibleEndLineNumber);
        for (let lineNumber = firstLine3; lineNumber <= lastLine; lineNumber++) {
          const lineIndex = lineNumber - visibleStartLineNumber;
          renderData[lineIndex] = renderedLineWrapped;
        }
      }
    }
    const renderedLineExact = this._renderOne(ctx, true);
    for (const cursorLineNumber of this._cursorLineNumbers) {
      if (cursorLineNumber < visibleStartLineNumber || cursorLineNumber > visibleEndLineNumber) {
        continue;
      }
      const lineIndex = cursorLineNumber - visibleStartLineNumber;
      renderData[lineIndex] = renderedLineExact;
    }
    this._renderData = renderData;
  }
  render(startLineNumber, lineNumber) {
    if (!this._renderData) {
      return "";
    }
    const lineIndex = lineNumber - startLineNumber;
    if (lineIndex >= this._renderData.length) {
      return "";
    }
    return this._renderData[lineIndex];
  }
  _shouldRenderInMargin() {
    return (this._renderLineHighlight === "gutter" || this._renderLineHighlight === "all") && (!this._renderLineHighlightOnlyWhenFocus || this._focused);
  }
  _shouldRenderInContent() {
    return (this._renderLineHighlight === "line" || this._renderLineHighlight === "all") && this._selectionIsEmpty && (!this._renderLineHighlightOnlyWhenFocus || this._focused);
  }
};

var CurrentLineHighlightOverlay = class extends AbstractLineHighlightOverlay {
  _renderOne(ctx, exact) {
    const className2 = "current-line" + (this._shouldRenderInMargin() ? " current-line-both" : "") + (exact ? " current-line-exact" : "");
    return `<div class="${className2}" style="width:${Math.max(ctx.scrollWidth, this._contentWidth)}px;"></div>`;
  }
  _shouldRenderThis() {
    return this._shouldRenderInContent();
  }
  _shouldRenderOther() {
    return this._shouldRenderInMargin();
  }
};

var CurrentLineMarginHighlightOverlay = class extends AbstractLineHighlightOverlay {
  _renderOne(ctx, exact) {
    const className2 = "current-line" + (this._shouldRenderInMargin() ? " current-line-margin" : "") + (this._shouldRenderOther() ? " current-line-margin-both" : "") + (this._shouldRenderInMargin() && exact ? " current-line-exact-margin" : "");
    return `<div class="${className2}" style="width:${this._contentLeft}px"></div>`;
  }
  _shouldRenderThis() {
    return true;
  }
  _shouldRenderOther() {
    return this._shouldRenderInContent();
  }
};

registerThemingParticipant((theme, collector) => {
  const lineHighlight = theme.getColor(editorLineHighlight);
  const inactiveLineHighlight = theme.getColor(editorInactiveLineHighlight);
  if (lineHighlight) {
    collector.addRule(`.monaco-editor.focused .view-overlays .current-line { background-color: ${lineHighlight}; }`);
    collector.addRule(`.monaco-editor.focused .margin-view-overlays .current-line-margin { background-color: ${lineHighlight}; border: none; }`);
  }
  if (inactiveLineHighlight) {
    collector.addRule(`.monaco-editor .view-overlays .current-line { background-color: ${inactiveLineHighlight}; }`);
    collector.addRule(`.monaco-editor .margin-view-overlays .current-line-margin { background-color: ${inactiveLineHighlight}; border: none; }`);
  }
  if (!lineHighlight || lineHighlight.isTransparent() || theme.defines(editorLineHighlightBorder)) {
    const lineHighlightBorder = theme.getColor(editorLineHighlightBorder);
    if (lineHighlightBorder) {
      collector.addRule(`.monaco-editor .view-overlays .current-line-exact { border: 2px solid ${lineHighlightBorder}; }`);
      collector.addRule(`.monaco-editor .margin-view-overlays .current-line-exact-margin { border: 2px solid ${lineHighlightBorder}; }`);
      if (isHighContrast(theme.type)) {
        collector.addRule(`.monaco-editor .view-overlays .current-line-exact { border-width: 1px; }`);
        collector.addRule(`.monaco-editor .margin-view-overlays .current-line-exact-margin { border-width: 1px; }`);
      }
    }
  }
});
export { AbstractLineHighlightOverlay, CurrentLineHighlightOverlay, CurrentLineMarginHighlightOverlay };
