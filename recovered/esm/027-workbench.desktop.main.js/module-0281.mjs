// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/view/viewLayer.ts
import { BugIndicatingError } from "./module-0004.mjs";
import { createFastDomNode } from "./module-0212.mjs";
import { createTrustedTypesPolicy } from "./module-0280.mjs";
import { StringBuilder } from "./module-0127.mjs";


// src/vs/editor/browser/view/viewLayer.ts
var RenderedLinesCollection = class {
  constructor(_lineFactory) {
    this._lineFactory = _lineFactory;
    this._set(1, []);
  }
  flush() {
    this._set(1, []);
  }
  _set(rendLineNumberStart, lines) {
    this._lines = lines;
    this._rendLineNumberStart = rendLineNumberStart;
  }
  _get() {
    return {
      rendLineNumberStart: this._rendLineNumberStart,
      lines: this._lines
    };
  }
  /**
   * @returns Inclusive line number that is inside this collection
   */
  getStartLineNumber() {
    return this._rendLineNumberStart;
  }
  /**
   * @returns Inclusive line number that is inside this collection
   */
  getEndLineNumber() {
    return this._rendLineNumberStart + this._lines.length - 1;
  }
  getCount() {
    return this._lines.length;
  }
  getLine(lineNumber) {
    const lineIndex = lineNumber - this._rendLineNumberStart;
    if (lineIndex < 0 || lineIndex >= this._lines.length) {
      throw new BugIndicatingError("Illegal value for lineNumber");
    }
    return this._lines[lineIndex];
  }
  /**
   * @returns Lines that were removed from this collection
   */
  onLinesDeleted(deleteFromLineNumber, deleteToLineNumber) {
    if (this.getCount() === 0) {
      return null;
    }
    const startLineNumber = this.getStartLineNumber();
    const endLineNumber = this.getEndLineNumber();
    if (deleteToLineNumber < startLineNumber) {
      const deleteCnt = deleteToLineNumber - deleteFromLineNumber + 1;
      this._rendLineNumberStart -= deleteCnt;
      return null;
    }
    if (deleteFromLineNumber > endLineNumber) {
      return null;
    }
    let deleteStartIndex = 0;
    let deleteCount = 0;
    for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
      const lineIndex = lineNumber - this._rendLineNumberStart;
      if (deleteFromLineNumber <= lineNumber && lineNumber <= deleteToLineNumber) {
        if (deleteCount === 0) {
          deleteStartIndex = lineIndex;
          deleteCount = 1;
        } else {
          deleteCount++;
        }
      }
    }
    if (deleteFromLineNumber < startLineNumber) {
      let deleteAboveCount = 0;
      if (deleteToLineNumber < startLineNumber) {
        deleteAboveCount = deleteToLineNumber - deleteFromLineNumber + 1;
      } else {
        deleteAboveCount = startLineNumber - deleteFromLineNumber;
      }
      this._rendLineNumberStart -= deleteAboveCount;
    }
    const deleted = this._lines.splice(deleteStartIndex, deleteCount);
    return deleted;
  }
  onLinesChanged(changeFromLineNumber, changeCount) {
    const changeToLineNumber = changeFromLineNumber + changeCount - 1;
    if (this.getCount() === 0) {
      return false;
    }
    const startLineNumber = this.getStartLineNumber();
    const endLineNumber = this.getEndLineNumber();
    let someoneNotified = false;
    for (let changedLineNumber = changeFromLineNumber; changedLineNumber <= changeToLineNumber; changedLineNumber++) {
      if (changedLineNumber >= startLineNumber && changedLineNumber <= endLineNumber) {
        this._lines[changedLineNumber - this._rendLineNumberStart].onContentChanged();
        someoneNotified = true;
      }
    }
    return someoneNotified;
  }
  onLinesInserted(insertFromLineNumber, insertToLineNumber) {
    if (this.getCount() === 0) {
      return null;
    }
    const insertCnt = insertToLineNumber - insertFromLineNumber + 1;
    const startLineNumber = this.getStartLineNumber();
    const endLineNumber = this.getEndLineNumber();
    if (insertFromLineNumber <= startLineNumber) {
      this._rendLineNumberStart += insertCnt;
      return null;
    }
    if (insertFromLineNumber > endLineNumber) {
      return null;
    }
    if (insertCnt + insertFromLineNumber > endLineNumber) {
      const deleted = this._lines.splice(insertFromLineNumber - this._rendLineNumberStart, endLineNumber - insertFromLineNumber + 1);
      return deleted;
    }
    const newLines = [];
    for (let i2 = 0; i2 < insertCnt; i2++) {
      newLines[i2] = this._lineFactory.createLine();
    }
    const insertIndex = insertFromLineNumber - this._rendLineNumberStart;
    const beforeLines = this._lines.slice(0, insertIndex);
    const afterLines = this._lines.slice(insertIndex, this._lines.length - insertCnt);
    const deletedLines = this._lines.slice(this._lines.length - insertCnt, this._lines.length);
    this._lines = beforeLines.concat(newLines).concat(afterLines);
    return deletedLines;
  }
  onTokensChanged(ranges) {
    if (this.getCount() === 0) {
      return false;
    }
    const startLineNumber = this.getStartLineNumber();
    const endLineNumber = this.getEndLineNumber();
    let notifiedSomeone = false;
    for (let i2 = 0, len = ranges.length; i2 < len; i2++) {
      const rng = ranges[i2];
      if (rng.toLineNumber < startLineNumber || rng.fromLineNumber > endLineNumber) {
        continue;
      }
      const from = Math.max(startLineNumber, rng.fromLineNumber);
      const to = Math.min(endLineNumber, rng.toLineNumber);
      for (let lineNumber = from; lineNumber <= to; lineNumber++) {
        const lineIndex = lineNumber - this._rendLineNumberStart;
        this._lines[lineIndex].onTokensChanged();
        notifiedSomeone = true;
      }
    }
    return notifiedSomeone;
  }
};

var VisibleLinesCollection = class {
  constructor(_viewContext, _lineFactory) {
    this._viewContext = _viewContext;
    this._lineFactory = _lineFactory;
    this.domNode = this._createDomNode();
    this._linesCollection = new RenderedLinesCollection(this._lineFactory);
  }
  _createDomNode() {
    const domNode = createFastDomNode(document.createElement("div"));
    domNode.setClassName("view-layer");
    domNode.setPosition("absolute");
    domNode.domNode.setAttribute("role", "presentation");
    domNode.domNode.setAttribute("aria-hidden", "true");
    return domNode;
  }
  // ---- begin view event handlers
  onConfigurationChanged(e) {
    if (e.hasChanged(165 /* layoutInfo */)) {
      return true;
    }
    return false;
  }
  onFlushed(e, flushDom) {
    if (flushDom) {
      const start = this._linesCollection.getStartLineNumber();
      const end = this._linesCollection.getEndLineNumber();
      for (let i2 = start; i2 <= end; i2++) {
        this._linesCollection.getLine(i2).getDomNode()?.remove();
      }
    }
    this._linesCollection.flush();
    return true;
  }
  onLinesChanged(e) {
    return this._linesCollection.onLinesChanged(e.fromLineNumber, e.count);
  }
  onLinesDeleted(e) {
    const deleted = this._linesCollection.onLinesDeleted(e.fromLineNumber, e.toLineNumber);
    if (deleted) {
      for (let i2 = 0, len = deleted.length; i2 < len; i2++) {
        const lineDomNode = deleted[i2].getDomNode();
        lineDomNode?.remove();
      }
    }
    return true;
  }
  onLinesInserted(e) {
    const deleted = this._linesCollection.onLinesInserted(e.fromLineNumber, e.toLineNumber);
    if (deleted) {
      for (let i2 = 0, len = deleted.length; i2 < len; i2++) {
        const lineDomNode = deleted[i2].getDomNode();
        lineDomNode?.remove();
      }
    }
    return true;
  }
  onScrollChanged(e) {
    return e.scrollTopChanged;
  }
  onTokensChanged(e) {
    return this._linesCollection.onTokensChanged(e.ranges);
  }
  onZonesChanged(e) {
    return true;
  }
  // ---- end view event handlers
  getStartLineNumber() {
    return this._linesCollection.getStartLineNumber();
  }
  getEndLineNumber() {
    return this._linesCollection.getEndLineNumber();
  }
  getVisibleLine(lineNumber) {
    return this._linesCollection.getLine(lineNumber);
  }
  renderLines(viewportData) {
    const inp = this._linesCollection._get();
    const renderer = new ViewLayerRenderer(this.domNode.domNode, this._lineFactory, viewportData, this._viewContext);
    const ctx = {
      rendLineNumberStart: inp.rendLineNumberStart,
      lines: inp.lines,
      linesLength: inp.lines.length
    };
    const resCtx = renderer.render(ctx, viewportData.startLineNumber, viewportData.endLineNumber, viewportData.relativeVerticalOffset);
    this._linesCollection._set(resCtx.rendLineNumberStart, resCtx.lines);
  }
};

var ViewLayerRenderer = class _ViewLayerRenderer {
  constructor(_domNode, _lineFactory, _viewportData, _viewContext) {
    this._domNode = _domNode;
    this._lineFactory = _lineFactory;
    this._viewportData = _viewportData;
    this._viewContext = _viewContext;
  }
  static {
    this._ttPolicy = createTrustedTypesPolicy("editorViewLayer", { createHTML: (value2) => value2 });
  }
  render(inContext, startLineNumber, stopLineNumber, deltaTop) {
    const ctx = {
      rendLineNumberStart: inContext.rendLineNumberStart,
      lines: inContext.lines.slice(0),
      linesLength: inContext.linesLength
    };
    if (ctx.rendLineNumberStart + ctx.linesLength - 1 < startLineNumber || stopLineNumber < ctx.rendLineNumberStart) {
      ctx.rendLineNumberStart = startLineNumber;
      ctx.linesLength = stopLineNumber - startLineNumber + 1;
      ctx.lines = [];
      for (let x = startLineNumber; x <= stopLineNumber; x++) {
        ctx.lines[x - startLineNumber] = this._lineFactory.createLine();
      }
      this._finishRendering(ctx, true, deltaTop);
      return ctx;
    }
    this._renderUntouchedLines(
      ctx,
      Math.max(startLineNumber - ctx.rendLineNumberStart, 0),
      Math.min(stopLineNumber - ctx.rendLineNumberStart, ctx.linesLength - 1),
      deltaTop,
      startLineNumber
    );
    if (ctx.rendLineNumberStart > startLineNumber) {
      const fromLineNumber = startLineNumber;
      const toLineNumber = Math.min(stopLineNumber, ctx.rendLineNumberStart - 1);
      if (fromLineNumber <= toLineNumber) {
        this._insertLinesBefore(ctx, fromLineNumber, toLineNumber, deltaTop, startLineNumber);
        ctx.linesLength += toLineNumber - fromLineNumber + 1;
      }
    } else if (ctx.rendLineNumberStart < startLineNumber) {
      const removeCnt = Math.min(ctx.linesLength, startLineNumber - ctx.rendLineNumberStart);
      if (removeCnt > 0) {
        this._removeLinesBefore(ctx, removeCnt);
        ctx.linesLength -= removeCnt;
      }
    }
    ctx.rendLineNumberStart = startLineNumber;
    if (ctx.rendLineNumberStart + ctx.linesLength - 1 < stopLineNumber) {
      const fromLineNumber = ctx.rendLineNumberStart + ctx.linesLength;
      const toLineNumber = stopLineNumber;
      if (fromLineNumber <= toLineNumber) {
        this._insertLinesAfter(ctx, fromLineNumber, toLineNumber, deltaTop, startLineNumber);
        ctx.linesLength += toLineNumber - fromLineNumber + 1;
      }
    } else if (ctx.rendLineNumberStart + ctx.linesLength - 1 > stopLineNumber) {
      const fromLineNumber = Math.max(0, stopLineNumber - ctx.rendLineNumberStart + 1);
      const toLineNumber = ctx.linesLength - 1;
      const removeCnt = toLineNumber - fromLineNumber + 1;
      if (removeCnt > 0) {
        this._removeLinesAfter(ctx, removeCnt);
        ctx.linesLength -= removeCnt;
      }
    }
    this._finishRendering(ctx, false, deltaTop);
    return ctx;
  }
  _renderUntouchedLines(ctx, startIndex, endIndex, deltaTop, deltaLN) {
    const rendLineNumberStart = ctx.rendLineNumberStart;
    const lines = ctx.lines;
    for (let i2 = startIndex; i2 <= endIndex; i2++) {
      const lineNumber = rendLineNumberStart + i2;
      lines[i2].layoutLine(lineNumber, deltaTop[lineNumber - deltaLN], this._lineHeightForLineNumber(lineNumber));
    }
  }
  _insertLinesBefore(ctx, fromLineNumber, toLineNumber, deltaTop, deltaLN) {
    const newLines = [];
    let newLinesLen = 0;
    for (let lineNumber = fromLineNumber; lineNumber <= toLineNumber; lineNumber++) {
      newLines[newLinesLen++] = this._lineFactory.createLine();
    }
    ctx.lines = newLines.concat(ctx.lines);
  }
  _removeLinesBefore(ctx, removeCount) {
    for (let i2 = 0; i2 < removeCount; i2++) {
      const lineDomNode = ctx.lines[i2].getDomNode();
      lineDomNode?.remove();
    }
    ctx.lines.splice(0, removeCount);
  }
  _insertLinesAfter(ctx, fromLineNumber, toLineNumber, deltaTop, deltaLN) {
    const newLines = [];
    let newLinesLen = 0;
    for (let lineNumber = fromLineNumber; lineNumber <= toLineNumber; lineNumber++) {
      newLines[newLinesLen++] = this._lineFactory.createLine();
    }
    ctx.lines = ctx.lines.concat(newLines);
  }
  _removeLinesAfter(ctx, removeCount) {
    const removeIndex = ctx.linesLength - removeCount;
    for (let i2 = 0; i2 < removeCount; i2++) {
      const lineDomNode = ctx.lines[removeIndex + i2].getDomNode();
      lineDomNode?.remove();
    }
    ctx.lines.splice(removeIndex, removeCount);
  }
  _finishRenderingNewLines(ctx, domNodeIsEmpty, newLinesHTML, wasNew) {
    if (_ViewLayerRenderer._ttPolicy) {
      newLinesHTML = _ViewLayerRenderer._ttPolicy.createHTML(newLinesHTML);
    }
    const lastChild = this._domNode.lastChild;
    if (domNodeIsEmpty || !lastChild) {
      this._domNode.innerHTML = newLinesHTML;
    } else {
      lastChild.insertAdjacentHTML("afterend", newLinesHTML);
    }
    let currChild = this._domNode.lastChild;
    for (let i2 = ctx.linesLength - 1; i2 >= 0; i2--) {
      const line = ctx.lines[i2];
      if (wasNew[i2]) {
        line.setDomNode(currChild);
        currChild = currChild.previousSibling;
      }
    }
  }
  _finishRenderingInvalidLines(ctx, invalidLinesHTML, wasInvalid) {
    const hugeDomNode = document.createElement("div");
    if (_ViewLayerRenderer._ttPolicy) {
      invalidLinesHTML = _ViewLayerRenderer._ttPolicy.createHTML(invalidLinesHTML);
    }
    hugeDomNode.innerHTML = invalidLinesHTML;
    for (let i2 = 0; i2 < ctx.linesLength; i2++) {
      const line = ctx.lines[i2];
      if (wasInvalid[i2]) {
        const source = hugeDomNode.firstChild;
        const lineDomNode = line.getDomNode();
        lineDomNode.replaceWith(source);
        line.setDomNode(source);
      }
    }
  }
  static {
    this._sb = new StringBuilder(1e5);
  }
  _finishRendering(ctx, domNodeIsEmpty, deltaTop) {
    const sb = _ViewLayerRenderer._sb;
    const linesLength = ctx.linesLength;
    const lines = ctx.lines;
    const rendLineNumberStart = ctx.rendLineNumberStart;
    const wasNew = [];
    {
      sb.reset();
      let hadNewLine = false;
      for (let i2 = 0; i2 < linesLength; i2++) {
        const line = lines[i2];
        wasNew[i2] = false;
        const lineDomNode = line.getDomNode();
        if (lineDomNode) {
          continue;
        }
        const renderedLineNumber = i2 + rendLineNumberStart;
        const renderResult = line.renderLine(renderedLineNumber, deltaTop[i2], this._lineHeightForLineNumber(renderedLineNumber), this._viewportData, sb);
        if (!renderResult) {
          continue;
        }
        wasNew[i2] = true;
        hadNewLine = true;
      }
      if (hadNewLine) {
        this._finishRenderingNewLines(ctx, domNodeIsEmpty, sb.build(), wasNew);
      }
    }
    {
      sb.reset();
      let hadInvalidLine = false;
      const wasInvalid = [];
      for (let i2 = 0; i2 < linesLength; i2++) {
        const line = lines[i2];
        wasInvalid[i2] = false;
        if (wasNew[i2]) {
          continue;
        }
        const renderedLineNumber = i2 + rendLineNumberStart;
        const renderResult = line.renderLine(renderedLineNumber, deltaTop[i2], this._lineHeightForLineNumber(renderedLineNumber), this._viewportData, sb);
        if (!renderResult) {
          continue;
        }
        wasInvalid[i2] = true;
        hadInvalidLine = true;
      }
      if (hadInvalidLine) {
        this._finishRenderingInvalidLines(ctx, sb.build(), wasInvalid);
      }
    }
  }
  _lineHeightForLineNumber(lineNumber) {
    return this._viewContext.viewLayout.getLineHeightForLineNumber(lineNumber);
  }
};
export { RenderedLinesCollection, VisibleLinesCollection, ViewLayerRenderer };
