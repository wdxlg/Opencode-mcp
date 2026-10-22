// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/renderLines.ts
import { createTrustedTypesPolicy } from "./module-0280.mjs";
import { applyFontInfo } from "./module-0213.mjs";
import { StringBuilder } from "./module-0127.mjs";
import { LineDecoration } from "./module-0245.mjs";
import { getColumnOfNodeOffset } from "./module-0248.mjs";
import { Position } from "./module-0079.mjs";
import { RenderLineInput, RenderLineOutput, renderViewLine } from "./module-0246.mjs";
import { ViewLineRenderingData } from "./module-0315.mjs";
import { EditorFontLigatures } from "./module-0105.mjs";


// src/vs/editor/browser/widget/diffEditor/components/diffEditorViewZones/renderLines.ts
var ttPolicy3 = createTrustedTypesPolicy("diffEditorWidget", { createHTML: (value2) => value2 });

function renderLines(source, options3, decorations, domNode, noExtra = false) {
  applyFontInfo(domNode, options3.fontInfo);
  const hasCharChanges = decorations.length > 0;
  const sb = new StringBuilder(1e4);
  let maxCharsPerLine = 0;
  let renderedLineCount = 0;
  const viewLineCounts = [];
  const renderOutputs = [];
  for (let lineIndex = 0; lineIndex < source.lineTokens.length; lineIndex++) {
    const lineNumber = lineIndex + 1;
    const lineTokens = source.lineTokens[lineIndex];
    const lineBreakData = source.lineBreakData[lineIndex];
    const actualDecorations = LineDecoration.filter(decorations, lineNumber, 1, Number.MAX_SAFE_INTEGER);
    if (lineBreakData) {
      let lastBreakOffset = 0;
      for (const breakOffset of lineBreakData.breakOffsets) {
        const viewLineTokens = lineTokens.sliceAndInflate(lastBreakOffset, breakOffset, 0);
        const result = renderOriginalLine(
          renderedLineCount,
          viewLineTokens,
          LineDecoration.extractWrapped(actualDecorations, lastBreakOffset, breakOffset),
          hasCharChanges,
          source.mightContainNonBasicASCII,
          source.mightContainRTL,
          options3,
          sb,
          noExtra
        );
        maxCharsPerLine = Math.max(maxCharsPerLine, result.maxCharWidth);
        renderOutputs.push(new RenderLineOutputWithOffset(result.output.characterMapping, result.output.containsForeignElements, lastBreakOffset));
        renderedLineCount++;
        lastBreakOffset = breakOffset;
      }
      viewLineCounts.push(lineBreakData.breakOffsets.length);
    } else {
      viewLineCounts.push(1);
      const result = renderOriginalLine(
        renderedLineCount,
        lineTokens,
        actualDecorations,
        hasCharChanges,
        source.mightContainNonBasicASCII,
        source.mightContainRTL,
        options3,
        sb,
        noExtra
      );
      maxCharsPerLine = Math.max(maxCharsPerLine, result.maxCharWidth);
      renderOutputs.push(new RenderLineOutputWithOffset(result.output.characterMapping, result.output.containsForeignElements, 0));
      renderedLineCount++;
    }
  }
  maxCharsPerLine += options3.scrollBeyondLastColumn;
  const html3 = sb.build();
  const trustedhtml = ttPolicy3 ? ttPolicy3.createHTML(html3) : html3;
  domNode.innerHTML = trustedhtml;
  const minWidthInPx = maxCharsPerLine * options3.typicalHalfwidthCharacterWidth;
  return new RenderLinesResult(
    renderedLineCount,
    minWidthInPx,
    viewLineCounts,
    renderOutputs,
    source
  );
}

var LineSource = class {
  constructor(lineTokens, lineBreakData = lineTokens.map((t2) => null), mightContainNonBasicASCII = true, mightContainRTL = true) {
    this.lineTokens = lineTokens;
    this.lineBreakData = lineBreakData;
    this.mightContainNonBasicASCII = mightContainNonBasicASCII;
    this.mightContainRTL = mightContainRTL;
  }
};

var RenderOptions = class _RenderOptions {
  constructor(tabSize, fontInfo, disableMonospaceOptimizations, typicalHalfwidthCharacterWidth, scrollBeyondLastColumn, lineHeight, lineDecorationsWidth, stopRenderingLineAfter, renderWhitespace, renderControlCharacters, fontLigatures, verticalScrollbarSize, setWidth = true) {
    this.tabSize = tabSize;
    this.fontInfo = fontInfo;
    this.disableMonospaceOptimizations = disableMonospaceOptimizations;
    this.typicalHalfwidthCharacterWidth = typicalHalfwidthCharacterWidth;
    this.scrollBeyondLastColumn = scrollBeyondLastColumn;
    this.lineHeight = lineHeight;
    this.lineDecorationsWidth = lineDecorationsWidth;
    this.stopRenderingLineAfter = stopRenderingLineAfter;
    this.renderWhitespace = renderWhitespace;
    this.renderControlCharacters = renderControlCharacters;
    this.fontLigatures = fontLigatures;
    this.verticalScrollbarSize = verticalScrollbarSize;
    this.setWidth = setWidth;
  }
  static fromEditor(editor) {
    const modifiedEditorOptions = editor.getOptions();
    const fontInfo = modifiedEditorOptions.get(59 /* fontInfo */);
    const layoutInfo = modifiedEditorOptions.get(165 /* layoutInfo */);
    return new _RenderOptions(
      editor.getModel()?.getOptions().tabSize || 0,
      fontInfo,
      modifiedEditorOptions.get(40 /* disableMonospaceOptimizations */),
      fontInfo.typicalHalfwidthCharacterWidth,
      modifiedEditorOptions.get(118 /* scrollBeyondLastColumn */),
      modifiedEditorOptions.get(75 /* lineHeight */),
      layoutInfo.decorationsWidth,
      modifiedEditorOptions.get(133 /* stopRenderingLineAfter */),
      modifiedEditorOptions.get(113 /* renderWhitespace */),
      modifiedEditorOptions.get(108 /* renderControlCharacters */),
      modifiedEditorOptions.get(60 /* fontLigatures */),
      modifiedEditorOptions.get(117 /* scrollbar */).verticalScrollbarSize
    );
  }
  withSetWidth(setWidth) {
    return new _RenderOptions(
      this.tabSize,
      this.fontInfo,
      this.disableMonospaceOptimizations,
      this.typicalHalfwidthCharacterWidth,
      this.scrollBeyondLastColumn,
      this.lineHeight,
      this.lineDecorationsWidth,
      this.stopRenderingLineAfter,
      this.renderWhitespace,
      this.renderControlCharacters,
      this.fontLigatures,
      this.verticalScrollbarSize,
      setWidth
    );
  }
  withScrollBeyondLastColumn(scrollBeyondLastColumn) {
    return new _RenderOptions(
      this.tabSize,
      this.fontInfo,
      this.disableMonospaceOptimizations,
      this.typicalHalfwidthCharacterWidth,
      scrollBeyondLastColumn,
      this.lineHeight,
      this.lineDecorationsWidth,
      this.stopRenderingLineAfter,
      this.renderWhitespace,
      this.renderControlCharacters,
      this.fontLigatures,
      this.verticalScrollbarSize,
      this.setWidth
    );
  }
};

var RenderLinesResult = class {
  constructor(heightInLines, minWidthInPx, viewLineCounts, _renderOutputs, _source) {
    this.heightInLines = heightInLines;
    this.minWidthInPx = minWidthInPx;
    this.viewLineCounts = viewLineCounts;
    this._renderOutputs = _renderOutputs;
    this._source = _source;
  }
  /**
   * Returns the model position for a given DOM node and offset within that node.
   * @param domNode The span node within a view-line where the offset is located
   * @param offset The offset within the span node
   * @returns The Position in the model, or undefined if the position cannot be determined
   */
  getModelPositionAt(domNode, offset) {
    let viewLineElement = domNode;
    while (viewLineElement && !viewLineElement.classList.contains("view-line")) {
      viewLineElement = viewLineElement.parentElement;
    }
    if (!viewLineElement) {
      return void 0;
    }
    const container3 = viewLineElement.parentElement;
    if (!container3) {
      return void 0;
    }
    const viewLines = container3.querySelectorAll(".view-line");
    let viewLineIndex = -1;
    for (let i2 = 0; i2 < viewLines.length; i2++) {
      if (viewLines[i2] === viewLineElement) {
        viewLineIndex = i2;
        break;
      }
    }
    if (viewLineIndex === -1 || viewLineIndex >= this._renderOutputs.length) {
      return void 0;
    }
    let modelLineNumber = 1;
    let remainingViewLines = viewLineIndex;
    for (let i2 = 0; i2 < this.viewLineCounts.length; i2++) {
      if (remainingViewLines < this.viewLineCounts[i2]) {
        modelLineNumber = i2 + 1;
        break;
      }
      remainingViewLines -= this.viewLineCounts[i2];
    }
    if (modelLineNumber > this._source.lineTokens.length) {
      return void 0;
    }
    const renderOutput = this._renderOutputs[viewLineIndex];
    if (!renderOutput) {
      return void 0;
    }
    const column = getColumnOfNodeOffset(renderOutput.characterMapping, domNode, offset) + renderOutput.offset;
    return new Position(modelLineNumber, column);
  }
};

var RenderLineOutputWithOffset = class extends RenderLineOutput {
  constructor(characterMapping, containsForeignElements, offset) {
    super(characterMapping, containsForeignElements);
    this.offset = offset;
  }
};

function renderOriginalLine(viewLineIdx, lineTokens, decorations, hasCharChanges, mightContainNonBasicASCII, mightContainRTL, options3, sb, noExtra) {
  sb.appendString('<div class="view-line');
  if (!noExtra && !hasCharChanges) {
    sb.appendString(" char-delete");
  }
  sb.appendString('" style="top:');
  sb.appendString(String(viewLineIdx * options3.lineHeight));
  if (options3.setWidth) {
    sb.appendString('px;width:1000000px;">');
  } else {
    sb.appendString('px;">');
  }
  const lineContent = lineTokens.getLineContent();
  const isBasicASCII2 = ViewLineRenderingData.isBasicASCII(lineContent, mightContainNonBasicASCII);
  const containsRTL2 = ViewLineRenderingData.containsRTL(lineContent, isBasicASCII2, mightContainRTL);
  const output = renderViewLine(new RenderLineInput(
    options3.fontInfo.isMonospace && !options3.disableMonospaceOptimizations,
    options3.fontInfo.canUseHalfwidthRightwardsArrow,
    lineContent,
    false,
    isBasicASCII2,
    containsRTL2,
    0,
    lineTokens,
    decorations,
    options3.tabSize,
    0,
    options3.fontInfo.spaceWidth,
    options3.fontInfo.middotWidth,
    options3.fontInfo.wsmiddotWidth,
    options3.stopRenderingLineAfter,
    options3.renderWhitespace,
    options3.renderControlCharacters,
    options3.fontLigatures !== EditorFontLigatures.OFF,
    null,
    // Send no selections, original line cannot be selected
    null,
    options3.verticalScrollbarSize
  ), sb);
  sb.appendString("</div>");
  const maxCharWidth = output.characterMapping.getHorizontalOffset(output.characterMapping.length);
  return { output, maxCharWidth };
}
export { renderLines, renderOriginalLine, ttPolicy3, LineSource, RenderOptions, RenderLinesResult, RenderLineOutputWithOffset };
