// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/gpu/renderStrategy/fullFileRenderStrategy.ts
import { BaseRenderStrategy } from "./module-0346.mjs";
import { fullFileRenderStrategyWgsl } from "./module-0347.mjs";
import { GPULifecycle } from "./module-0337.mjs";
import { getActiveWindow } from "./module-0075.mjs";
import { createContentSegmenter } from "./module-0345.mjs";
import { ViewGpuContext } from "./module-0344.mjs";
import { Color } from "./module-0197.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { CursorColumns } from "./module-0110.mjs";
import { quadVertices } from "./module-0329.mjs";


// src/vs/editor/browser/gpu/renderStrategy/fullFileRenderStrategy.ts
var FullFileRenderStrategy = class _FullFileRenderStrategy extends BaseRenderStrategy {
  constructor(context2, viewGpuContext, device, glyphRasterizer) {
    super(context2, viewGpuContext, device, glyphRasterizer);
    this.type = "fullfile";
    this.wgsl = fullFileRenderStrategyWgsl;
    this._activeDoubleBufferIndex = 0;
    this._upToDateLines = [/* @__PURE__ */ new Set(), /* @__PURE__ */ new Set()];
    this._visibleObjectCount = 0;
    this._finalRenderedLine = 0;
    this._scrollInitialized = false;
    this._queuedBufferUpdates = [[], []];
    const bufferSize = _FullFileRenderStrategy.maxSupportedLines * _FullFileRenderStrategy.maxSupportedColumns * 6 /* IndicesPerCell */ * Float32Array.BYTES_PER_ELEMENT;
    this._cellBindBuffer = this._register(GPULifecycle.createBuffer(this._device, {
      label: "Monaco full file cell buffer",
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    })).object;
    this._cellValueBuffers = [
      new ArrayBuffer(bufferSize),
      new ArrayBuffer(bufferSize)
    ];
    const scrollOffsetBufferSize = 2;
    this._scrollOffsetBindBuffer = this._register(GPULifecycle.createBuffer(this._device, {
      label: "Monaco scroll offset buffer",
      size: scrollOffsetBufferSize * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })).object;
    this._scrollOffsetValueBuffer = new Float32Array(scrollOffsetBufferSize);
  }
  static {
    /**
     * The hard cap for line count that can be rendered by the GPU renderer.
     */
    this.maxSupportedLines = 3e3;
  }
  static {
    /**
     * The hard cap for line columns that can be rendered by the GPU renderer.
     */
    this.maxSupportedColumns = 200;
  }
  get bindGroupEntries() {
    return [
      { binding: 1 /* Cells */, resource: { buffer: this._cellBindBuffer } },
      { binding: 6 /* ScrollOffset */, resource: { buffer: this._scrollOffsetBindBuffer } }
    ];
  }
  // #region Event handlers
  // The primary job of these handlers is to:
  // 1. Invalidate the up to date line cache, which will cause the line to be re-rendered when
  //    it's _within the viewport_.
  // 2. Pass relevant events on to the render function so it can force certain line ranges to be
  //    re-rendered even if they're not in the viewport. For example when a view zone is added,
  //    there are lines that used to be visible but are no longer, so those ranges must be
  //    cleared and uploaded to the GPU.
  onConfigurationChanged(e4) {
    this._invalidateAllLines();
    this._queueBufferUpdate(e4);
    return true;
  }
  onDecorationsChanged(e4) {
    this._invalidateAllLines();
    return true;
  }
  onTokensChanged(e4) {
    for (const range2 of e4.ranges) {
      this._invalidateLineRange(range2.fromLineNumber, range2.toLineNumber);
    }
    return true;
  }
  onLinesDeleted(e4) {
    this._invalidateLinesFrom(e4.fromLineNumber);
    this._queueBufferUpdate(e4);
    return true;
  }
  onLinesInserted(e4) {
    this._invalidateLinesFrom(e4.fromLineNumber);
    return true;
  }
  onLinesChanged(e4) {
    this._invalidateLineRange(e4.fromLineNumber, e4.fromLineNumber + e4.count);
    return true;
  }
  onScrollChanged(e4) {
    if (this._store.isDisposed) {
      return false;
    }
    const dpr = getActiveWindow().devicePixelRatio;
    this._scrollOffsetValueBuffer[0] = (e4?.scrollLeft ?? this._context.viewLayout.getCurrentScrollLeft()) * dpr;
    this._scrollOffsetValueBuffer[1] = (e4?.scrollTop ?? this._context.viewLayout.getCurrentScrollTop()) * dpr;
    this._device.queue.writeBuffer(this._scrollOffsetBindBuffer, 0, this._scrollOffsetValueBuffer);
    return true;
  }
  onThemeChanged(e4) {
    this._invalidateAllLines();
    return true;
  }
  onLineMappingChanged(e4) {
    this._invalidateAllLines();
    this._queueBufferUpdate(e4);
    return true;
  }
  onZonesChanged(e4) {
    this._invalidateAllLines();
    this._queueBufferUpdate(e4);
    return true;
  }
  // #endregion
  _invalidateAllLines() {
    this._upToDateLines[0].clear();
    this._upToDateLines[1].clear();
  }
  _invalidateLinesFrom(lineNumber) {
    for (const i2 of [0, 1]) {
      const upToDateLines = this._upToDateLines[i2];
      for (const upToDateLine of upToDateLines) {
        if (upToDateLine >= lineNumber) {
          upToDateLines.delete(upToDateLine);
        }
      }
    }
  }
  _invalidateLineRange(fromLineNumber, toLineNumber) {
    for (let i2 = fromLineNumber; i2 <= toLineNumber; i2++) {
      this._upToDateLines[0].delete(i2);
      this._upToDateLines[1].delete(i2);
    }
  }
  reset() {
    this._invalidateAllLines();
    for (const bufferIndex of [0, 1]) {
      const buffer = new Float32Array(this._cellValueBuffers[bufferIndex]);
      buffer.fill(0, 0, buffer.length);
      this._device.queue.writeBuffer(this._cellBindBuffer, 0, buffer.buffer, 0, buffer.byteLength);
    }
    this._finalRenderedLine = 0;
  }
  update(viewportData, viewLineOptions) {
    let chars = "";
    let segment;
    let charWidth = 0;
    let y = 0;
    let x = 0;
    let absoluteOffsetX = 0;
    let absoluteOffsetY = 0;
    let tabXOffset = 0;
    let glyph;
    let cellIndex = 0;
    let tokenStartIndex = 0;
    let tokenEndIndex = 0;
    let tokenMetadata = 0;
    let decorationStyleSetBold;
    let decorationStyleSetColor;
    let decorationStyleSetOpacity;
    let decorationStyleSetStrikethrough;
    let decorationStyleSetStrikethroughThickness;
    let decorationStyleSetStrikethroughColor;
    let lineData;
    let decoration3;
    let fillStartIndex = 0;
    let fillEndIndex = 0;
    let tokens;
    const dpr = getActiveWindow().devicePixelRatio;
    let contentSegmenter;
    if (!this._scrollInitialized) {
      this.onScrollChanged();
      this._scrollInitialized = true;
    }
    const cellBuffer = new Float32Array(this._cellValueBuffers[this._activeDoubleBufferIndex]);
    const lineIndexCount = _FullFileRenderStrategy.maxSupportedColumns * 6 /* IndicesPerCell */;
    const upToDateLines = this._upToDateLines[this._activeDoubleBufferIndex];
    let dirtyLineStart = 3e3;
    let dirtyLineEnd = 0;
    const queuedBufferUpdates = this._queuedBufferUpdates[this._activeDoubleBufferIndex];
    while (queuedBufferUpdates.length) {
      const e4 = queuedBufferUpdates.shift();
      switch (e4.type) {
        // TODO: Refine these cases so we're not throwing away everything
        case 2 /* ViewConfigurationChanged */:
        case 8 /* ViewLineMappingChanged */:
        case 17 /* ViewZonesChanged */: {
          cellBuffer.fill(0);
          dirtyLineStart = 1;
          dirtyLineEnd = Math.max(dirtyLineEnd, this._finalRenderedLine);
          this._finalRenderedLine = 0;
          break;
        }
        case 10 /* ViewLinesDeleted */: {
          const deletedLineContentStartIndex = (e4.fromLineNumber - 1) * _FullFileRenderStrategy.maxSupportedColumns * 6 /* IndicesPerCell */;
          const deletedLineContentEndIndex = e4.toLineNumber * _FullFileRenderStrategy.maxSupportedColumns * 6 /* IndicesPerCell */;
          const nullContentStartIndex = (this._finalRenderedLine - (e4.toLineNumber - e4.fromLineNumber + 1)) * _FullFileRenderStrategy.maxSupportedColumns * 6 /* IndicesPerCell */;
          cellBuffer.set(cellBuffer.subarray(deletedLineContentEndIndex), deletedLineContentStartIndex);
          cellBuffer.fill(0, nullContentStartIndex);
          dirtyLineStart = Math.min(dirtyLineStart, e4.fromLineNumber);
          dirtyLineEnd = Math.max(dirtyLineEnd, this._finalRenderedLine);
          this._finalRenderedLine -= e4.toLineNumber - e4.fromLineNumber + 1;
          break;
        }
      }
    }
    for (y = viewportData.startLineNumber; y <= viewportData.endLineNumber; y++) {
      if (!this._viewGpuContext.canRender(viewLineOptions, viewportData, y)) {
        fillStartIndex = (y - 1) * _FullFileRenderStrategy.maxSupportedColumns * 6 /* IndicesPerCell */;
        fillEndIndex = y * _FullFileRenderStrategy.maxSupportedColumns * 6 /* IndicesPerCell */;
        cellBuffer.fill(0, fillStartIndex, fillEndIndex);
        dirtyLineStart = Math.min(dirtyLineStart, y);
        dirtyLineEnd = Math.max(dirtyLineEnd, y);
        continue;
      }
      if (upToDateLines.has(y)) {
        continue;
      }
      dirtyLineStart = Math.min(dirtyLineStart, y);
      dirtyLineEnd = Math.max(dirtyLineEnd, y);
      lineData = viewportData.getViewLineRenderingData(y);
      tabXOffset = 0;
      contentSegmenter = createContentSegmenter(lineData, viewLineOptions);
      charWidth = viewLineOptions.spaceWidth * dpr;
      absoluteOffsetX = (lineData.minColumn - 1) * charWidth;
      tokens = lineData.tokens;
      tokenStartIndex = lineData.minColumn - 1;
      tokenEndIndex = 0;
      for (let tokenIndex = 0, tokensLen = tokens.getCount(); tokenIndex < tokensLen; tokenIndex++) {
        tokenEndIndex = tokens.getEndOffset(tokenIndex);
        if (tokenEndIndex <= tokenStartIndex) {
          continue;
        }
        tokenMetadata = tokens.getMetadata(tokenIndex);
        for (x = tokenStartIndex; x < tokenEndIndex; x++) {
          if (x > _FullFileRenderStrategy.maxSupportedColumns) {
            break;
          }
          segment = contentSegmenter.getSegmentAtIndex(x);
          if (segment === void 0) {
            continue;
          }
          chars = segment;
          if (!(lineData.isBasicASCII && viewLineOptions.useMonospaceOptimizations)) {
            charWidth = this.glyphRasterizer.getTextMetrics(chars).width;
          }
          decorationStyleSetColor = void 0;
          decorationStyleSetBold = void 0;
          decorationStyleSetOpacity = void 0;
          decorationStyleSetStrikethrough = void 0;
          decorationStyleSetStrikethroughThickness = void 0;
          decorationStyleSetStrikethroughColor = void 0;
          for (decoration3 of lineData.inlineDecorations) {
            if (y < decoration3.range.startLineNumber || y > decoration3.range.endLineNumber || y === decoration3.range.startLineNumber && x < decoration3.range.startColumn - 1 || y === decoration3.range.endLineNumber && x >= decoration3.range.endColumn - 1) {
              continue;
            }
            const rules = ViewGpuContext.decorationCssRuleExtractor.getStyleRules(this._viewGpuContext.canvas.domNode, decoration3.inlineClassName);
            for (const rule of rules) {
              for (const r2 of rule.style) {
                const value2 = rule.styleMap.get(r2)?.toString() ?? "";
                switch (r2) {
                  case "color": {
                    const parsedColor = Color.Format.CSS.parse(value2);
                    if (!parsedColor) {
                      throw new BugIndicatingError("Invalid color format " + value2);
                    }
                    decorationStyleSetColor = parsedColor.toNumber32Bit();
                    break;
                  }
                  case "font-weight": {
                    const parsedValue = parseCssFontWeight2(value2);
                    if (parsedValue >= 400) {
                      decorationStyleSetBold = true;
                    } else {
                      decorationStyleSetBold = false;
                    }
                    break;
                  }
                  case "opacity": {
                    const parsedValue = parseCssOpacity2(value2);
                    decorationStyleSetOpacity = parsedValue;
                    break;
                  }
                  case "text-decoration":
                  case "text-decoration-line": {
                    if (value2 === "line-through") {
                      decorationStyleSetStrikethrough = true;
                    }
                    break;
                  }
                  case "text-decoration-thickness": {
                    const match2 = value2.match(/^(\d+(?:\.\d+)?)px$/);
                    if (match2) {
                      decorationStyleSetStrikethroughThickness = parseFloat(match2[1]);
                    }
                    break;
                  }
                  case "text-decoration-color": {
                    let colorValue = value2;
                    const varMatch = value2.match(/^var\((--[^,]+),\s*(?:initial|inherit)\)$/);
                    if (varMatch) {
                      colorValue = ViewGpuContext.decorationCssRuleExtractor.resolveCssVariable(this._viewGpuContext.canvas.domNode, varMatch[1]);
                    }
                    const parsedColor = Color.Format.CSS.parse(colorValue);
                    if (parsedColor) {
                      decorationStyleSetStrikethroughColor = parsedColor.toNumber32Bit();
                    }
                    break;
                  }
                  case "text-decoration-style": {
                    break;
                  }
                  default:
                    throw new BugIndicatingError("Unexpected inline decoration style");
                }
              }
            }
          }
          if (chars === " " || chars === "	") {
            cellIndex = ((y - 1) * _FullFileRenderStrategy.maxSupportedColumns + x) * 6 /* IndicesPerCell */;
            cellBuffer.fill(0, cellIndex, cellIndex + 6 /* FloatsPerEntry */);
            if (chars === "	") {
              const offsetBefore = x + tabXOffset;
              tabXOffset = CursorColumns.nextRenderTabStop(x + tabXOffset, lineData.tabSize);
              absoluteOffsetX += charWidth * (tabXOffset - offsetBefore);
              tabXOffset -= x + 1;
            } else {
              absoluteOffsetX += charWidth;
            }
            continue;
          }
          const decorationStyleSetId = ViewGpuContext.decorationStyleCache.getOrCreateEntry(decorationStyleSetColor, decorationStyleSetBold, decorationStyleSetOpacity, decorationStyleSetStrikethrough, decorationStyleSetStrikethroughThickness, decorationStyleSetStrikethroughColor);
          glyph = this._viewGpuContext.atlas.getGlyph(this.glyphRasterizer, chars, tokenMetadata, decorationStyleSetId, absoluteOffsetX);
          absoluteOffsetY = Math.round(
            // Top of layout box (includes line height)
            viewportData.relativeVerticalOffset[y - viewportData.startLineNumber] * dpr + // Delta from top of layout box (includes line height) to top of the inline box (no line height)
            Math.floor((viewportData.lineHeight * dpr - (glyph.fontBoundingBoxAscent + glyph.fontBoundingBoxDescent)) / 2) + // Delta from top of inline box (no line height) to top of glyph origin. If the glyph was drawn
            // with a top baseline for example, this ends up drawing the glyph correctly using the alphabetical
            // baseline.
            glyph.fontBoundingBoxAscent
          );
          cellIndex = ((y - 1) * _FullFileRenderStrategy.maxSupportedColumns + x) * 6 /* IndicesPerCell */;
          cellBuffer[cellIndex + 0 /* Offset_X */] = Math.floor(absoluteOffsetX);
          cellBuffer[cellIndex + 1 /* Offset_Y */] = absoluteOffsetY;
          cellBuffer[cellIndex + 4 /* GlyphIndex */] = glyph.glyphIndex;
          cellBuffer[cellIndex + 5 /* TextureIndex */] = glyph.pageIndex;
          absoluteOffsetX += charWidth;
        }
        tokenStartIndex = tokenEndIndex;
      }
      fillStartIndex = ((y - 1) * _FullFileRenderStrategy.maxSupportedColumns + tokenEndIndex) * 6 /* IndicesPerCell */;
      fillEndIndex = y * _FullFileRenderStrategy.maxSupportedColumns * 6 /* IndicesPerCell */;
      cellBuffer.fill(0, fillStartIndex, fillEndIndex);
      upToDateLines.add(y);
    }
    const visibleObjectCount = (viewportData.endLineNumber - viewportData.startLineNumber + 1) * lineIndexCount;
    dirtyLineStart = Math.min(dirtyLineStart, _FullFileRenderStrategy.maxSupportedLines);
    dirtyLineEnd = Math.min(dirtyLineEnd, _FullFileRenderStrategy.maxSupportedLines);
    if (dirtyLineStart <= dirtyLineEnd) {
      this._device.queue.writeBuffer(
        this._cellBindBuffer,
        (dirtyLineStart - 1) * lineIndexCount * Float32Array.BYTES_PER_ELEMENT,
        cellBuffer.buffer,
        (dirtyLineStart - 1) * lineIndexCount * Float32Array.BYTES_PER_ELEMENT,
        (dirtyLineEnd - dirtyLineStart + 1) * lineIndexCount * Float32Array.BYTES_PER_ELEMENT
      );
    }
    this._finalRenderedLine = Math.max(this._finalRenderedLine, dirtyLineEnd);
    this._activeDoubleBufferIndex = this._activeDoubleBufferIndex ? 0 : 1;
    this._visibleObjectCount = visibleObjectCount;
    return visibleObjectCount;
  }
  draw(pass, viewportData) {
    if (this._visibleObjectCount <= 0) {
      throw new BugIndicatingError("Attempt to draw 0 objects");
    }
    pass.draw(
      quadVertices.length / 2,
      this._visibleObjectCount,
      void 0,
      (viewportData.startLineNumber - 1) * _FullFileRenderStrategy.maxSupportedColumns
    );
  }
  /**
   * Queue updates that need to happen on the active buffer, not just the cache. This will be
   * deferred to when the actual cell buffer is changed since the active buffer could be locked by
   * the GPU which would block the main thread.
   */
  _queueBufferUpdate(e4) {
    this._queuedBufferUpdates[0].push(e4);
    this._queuedBufferUpdates[1].push(e4);
  }
};

function parseCssFontWeight2(value2) {
  switch (value2) {
    case "lighter":
    case "normal":
      return 400;
    case "bolder":
    case "bold":
      return 700;
  }
  return parseInt(value2);
}

function parseCssOpacity2(value2) {
  if (value2.endsWith("%")) {
    return parseFloat(value2.substring(0, value2.length - 1)) / 100;
  }
  if (value2.match(/^\d+(?:\.\d*)/)) {
    return parseFloat(value2);
  }
  return 1;
}
export { parseCssFontWeight2, parseCssOpacity2, FullFileRenderStrategy };
