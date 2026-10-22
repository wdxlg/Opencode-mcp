// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/indentGuides/indentGuides.ts
import { DynamicViewOverlay } from "./module-0286.mjs";
import { Position } from "./module-0079.mjs";
import { ArrayQueue } from "./module-0007.mjs";
import { IndentGuide } from "./module-0295.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { editorActiveIndentGuide1, editorActiveIndentGuide2, editorActiveIndentGuide3, editorActiveIndentGuide4, editorActiveIndentGuide5, editorActiveIndentGuide6, editorBracketHighlightingForeground1, editorBracketHighlightingForeground2, editorBracketHighlightingForeground3, editorBracketHighlightingForeground4, editorBracketHighlightingForeground5, editorBracketHighlightingForeground6, editorBracketPairGuideActiveBackground1, editorBracketPairGuideActiveBackground2, editorBracketPairGuideActiveBackground3, editorBracketPairGuideActiveBackground4, editorBracketPairGuideActiveBackground5, editorBracketPairGuideActiveBackground6, editorBracketPairGuideBackground1, editorBracketPairGuideBackground2, editorBracketPairGuideBackground3, editorBracketPairGuideBackground4, editorBracketPairGuideBackground5, editorBracketPairGuideBackground6, editorIndentGuide1, editorIndentGuide2, editorIndentGuide3, editorIndentGuide4, editorIndentGuide5, editorIndentGuide6 } from "./module-0288.mjs";
import { BracketPairGuidesClassNames } from "./module-0296.mjs";
import { isDefined } from "./module-0010.mjs";


// src/vs/editor/browser/viewParts/indentGuides/indentGuides.ts
var IndentGuidesOverlay = class extends DynamicViewOverlay {
  constructor(context2) {
    super();
    this._context = context2;
    this._primaryPosition = null;
    const options3 = this._context.configuration.options;
    const wrappingInfo = options3.get(166 /* wrappingInfo */);
    const fontInfo = options3.get(59 /* fontInfo */);
    this._spaceWidth = fontInfo.spaceWidth;
    this._maxIndentLeft = wrappingInfo.wrappingColumn === -1 ? -1 : wrappingInfo.wrappingColumn * fontInfo.typicalHalfwidthCharacterWidth;
    this._bracketPairGuideOptions = options3.get(22 /* guides */);
    this._renderResult = null;
    this._context.addEventHandler(this);
  }
  dispose() {
    this._context.removeEventHandler(this);
    this._renderResult = null;
    super.dispose();
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    const options3 = this._context.configuration.options;
    const wrappingInfo = options3.get(166 /* wrappingInfo */);
    const fontInfo = options3.get(59 /* fontInfo */);
    this._spaceWidth = fontInfo.spaceWidth;
    this._maxIndentLeft = wrappingInfo.wrappingColumn === -1 ? -1 : wrappingInfo.wrappingColumn * fontInfo.typicalHalfwidthCharacterWidth;
    this._bracketPairGuideOptions = options3.get(22 /* guides */);
    return true;
  }
  onCursorStateChanged(e) {
    const selection = e.selections[0];
    const newPosition = selection.getPosition();
    if (!this._primaryPosition?.equals(newPosition)) {
      this._primaryPosition = newPosition;
      return true;
    }
    return false;
  }
  onDecorationsChanged(e) {
    return true;
  }
  onFlushed(e) {
    return true;
  }
  onLinesChanged(e) {
    return true;
  }
  onLinesDeleted(e) {
    return true;
  }
  onLinesInserted(e) {
    return true;
  }
  onScrollChanged(e) {
    return e.scrollTopChanged;
  }
  onZonesChanged(e) {
    return true;
  }
  onLanguageConfigurationChanged(e) {
    return true;
  }
  // --- end event handlers
  prepareRender(ctx) {
    if (!this._bracketPairGuideOptions.indentation && this._bracketPairGuideOptions.bracketPairs === false) {
      this._renderResult = null;
      return;
    }
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    const scrollWidth = ctx.scrollWidth;
    const activeCursorPosition = this._primaryPosition;
    const indents = this.getGuidesByLine(
      visibleStartLineNumber,
      Math.min(visibleEndLineNumber + 1, this._context.viewModel.getLineCount()),
      activeCursorPosition
    );
    const output = [];
    for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
      const lineIndex = lineNumber - visibleStartLineNumber;
      const indent = indents[lineIndex];
      let result = "";
      const leftOffset = ctx.visibleRangeForPosition(new Position(lineNumber, 1))?.left ?? 0;
      for (const guide of indent) {
        const left = guide.column === -1 ? leftOffset + (guide.visibleColumn - 1) * this._spaceWidth : ctx.visibleRangeForPosition(
          new Position(lineNumber, guide.column)
        ).left;
        if (left > scrollWidth || this._maxIndentLeft > 0 && left > this._maxIndentLeft) {
          break;
        }
        const className2 = guide.horizontalLine ? guide.horizontalLine.top ? "horizontal-top" : "horizontal-bottom" : "vertical";
        const width2 = guide.horizontalLine ? (ctx.visibleRangeForPosition(
          new Position(lineNumber, guide.horizontalLine.endColumn)
        )?.left ?? left + this._spaceWidth) - left : this._spaceWidth;
        result += `<div class="core-guide ${guide.className} ${className2}" style="left:${left}px;width:${width2}px"></div>`;
      }
      output[lineIndex] = result;
    }
    this._renderResult = output;
  }
  getGuidesByLine(visibleStartLineNumber, visibleEndLineNumber, activeCursorPosition) {
    const bracketGuides = this._bracketPairGuideOptions.bracketPairs !== false ? this._context.viewModel.getBracketGuidesInRangeByLine(
      visibleStartLineNumber,
      visibleEndLineNumber,
      activeCursorPosition,
      {
        highlightActive: this._bracketPairGuideOptions.highlightActiveBracketPair,
        horizontalGuides: this._bracketPairGuideOptions.bracketPairsHorizontal === true ? 2 /* Enabled */ : this._bracketPairGuideOptions.bracketPairsHorizontal === "active" ? 1 /* EnabledForActive */ : 0 /* Disabled */,
        includeInactive: this._bracketPairGuideOptions.bracketPairs === true
      }
    ) : null;
    const indentGuides = this._bracketPairGuideOptions.indentation ? this._context.viewModel.getLinesIndentGuides(
      visibleStartLineNumber,
      visibleEndLineNumber
    ) : null;
    let activeIndentStartLineNumber = 0;
    let activeIndentEndLineNumber = 0;
    let activeIndentLevel = 0;
    if (this._bracketPairGuideOptions.highlightActiveIndentation !== false && activeCursorPosition) {
      const activeIndentInfo = this._context.viewModel.getActiveIndentGuide(activeCursorPosition.lineNumber, visibleStartLineNumber, visibleEndLineNumber);
      activeIndentStartLineNumber = activeIndentInfo.startLineNumber;
      activeIndentEndLineNumber = activeIndentInfo.endLineNumber;
      activeIndentLevel = activeIndentInfo.indent;
    }
    const { indentSize } = this._context.viewModel.model.getOptions();
    const result = [];
    for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
      const lineGuides = new Array();
      result.push(lineGuides);
      const bracketGuidesInLine = bracketGuides ? bracketGuides[lineNumber - visibleStartLineNumber] : [];
      const bracketGuidesInLineQueue = new ArrayQueue(bracketGuidesInLine);
      const indentGuidesInLine = indentGuides ? indentGuides[lineNumber - visibleStartLineNumber] : 0;
      for (let indentLvl = 1; indentLvl <= indentGuidesInLine; indentLvl++) {
        const indentGuide = (indentLvl - 1) * indentSize + 1;
        const isActive2 = (
          // Disable active indent guide if there are bracket guides.
          (this._bracketPairGuideOptions.highlightActiveIndentation === "always" || bracketGuidesInLine.length === 0) && activeIndentStartLineNumber <= lineNumber && lineNumber <= activeIndentEndLineNumber && indentLvl === activeIndentLevel
        );
        lineGuides.push(...bracketGuidesInLineQueue.takeWhile((g) => g.visibleColumn < indentGuide) || []);
        const peeked = bracketGuidesInLineQueue.peek();
        if (!peeked || peeked.visibleColumn !== indentGuide || peeked.horizontalLine) {
          lineGuides.push(
            new IndentGuide(
              indentGuide,
              -1,
              `core-guide-indent lvl-${(indentLvl - 1) % 30}` + (isActive2 ? " indent-active" : ""),
              null,
              -1,
              -1
            )
          );
        }
      }
      lineGuides.push(...bracketGuidesInLineQueue.takeWhile((g) => true) || []);
    }
    return result;
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

function transparentToUndefined(color2) {
  if (color2 && color2.isTransparent()) {
    return void 0;
  }
  return color2;
}

registerThemingParticipant((theme, collector) => {
  const colors = [
    { bracketColor: editorBracketHighlightingForeground1, guideColor: editorBracketPairGuideBackground1, guideColorActive: editorBracketPairGuideActiveBackground1 },
    { bracketColor: editorBracketHighlightingForeground2, guideColor: editorBracketPairGuideBackground2, guideColorActive: editorBracketPairGuideActiveBackground2 },
    { bracketColor: editorBracketHighlightingForeground3, guideColor: editorBracketPairGuideBackground3, guideColorActive: editorBracketPairGuideActiveBackground3 },
    { bracketColor: editorBracketHighlightingForeground4, guideColor: editorBracketPairGuideBackground4, guideColorActive: editorBracketPairGuideActiveBackground4 },
    { bracketColor: editorBracketHighlightingForeground5, guideColor: editorBracketPairGuideBackground5, guideColorActive: editorBracketPairGuideActiveBackground5 },
    { bracketColor: editorBracketHighlightingForeground6, guideColor: editorBracketPairGuideBackground6, guideColorActive: editorBracketPairGuideActiveBackground6 }
  ];
  const colorProvider = new BracketPairGuidesClassNames();
  const indentColors = [
    { indentColor: editorIndentGuide1, indentColorActive: editorActiveIndentGuide1 },
    { indentColor: editorIndentGuide2, indentColorActive: editorActiveIndentGuide2 },
    { indentColor: editorIndentGuide3, indentColorActive: editorActiveIndentGuide3 },
    { indentColor: editorIndentGuide4, indentColorActive: editorActiveIndentGuide4 },
    { indentColor: editorIndentGuide5, indentColorActive: editorActiveIndentGuide5 },
    { indentColor: editorIndentGuide6, indentColorActive: editorActiveIndentGuide6 }
  ];
  const colorValues = colors.map((c) => {
    const bracketColor = theme.getColor(c.bracketColor);
    const guideColor = theme.getColor(c.guideColor);
    const guideColorActive = theme.getColor(c.guideColorActive);
    const effectiveGuideColor = transparentToUndefined(transparentToUndefined(guideColor) ?? bracketColor?.transparent(0.3));
    const effectiveGuideColorActive = transparentToUndefined(transparentToUndefined(guideColorActive) ?? bracketColor);
    if (!effectiveGuideColor || !effectiveGuideColorActive) {
      return void 0;
    }
    return {
      guideColor: effectiveGuideColor,
      guideColorActive: effectiveGuideColorActive
    };
  }).filter(isDefined);
  const indentColorValues = indentColors.map((c) => {
    const indentColor = theme.getColor(c.indentColor);
    const indentColorActive = theme.getColor(c.indentColorActive);
    const effectiveIndentColor = transparentToUndefined(indentColor);
    const effectiveIndentColorActive = transparentToUndefined(indentColorActive);
    if (!effectiveIndentColor || !effectiveIndentColorActive) {
      return void 0;
    }
    return {
      indentColor: effectiveIndentColor,
      indentColorActive: effectiveIndentColorActive
    };
  }).filter(isDefined);
  if (colorValues.length > 0) {
    for (let level = 0; level < 30; level++) {
      const colors2 = colorValues[level % colorValues.length];
      collector.addRule(`.monaco-editor .${colorProvider.getInlineClassNameOfLevel(level).replace(/ /g, ".")} { --guide-color: ${colors2.guideColor}; --guide-color-active: ${colors2.guideColorActive}; }`);
    }
    collector.addRule(`.monaco-editor .vertical { box-shadow: 1px 0 0 0 var(--guide-color) inset; }`);
    collector.addRule(`.monaco-editor .horizontal-top { border-top: 1px solid var(--guide-color); }`);
    collector.addRule(`.monaco-editor .horizontal-bottom { border-bottom: 1px solid var(--guide-color); }`);
    collector.addRule(`.monaco-editor .vertical.${colorProvider.activeClassName} { box-shadow: 1px 0 0 0 var(--guide-color-active) inset; }`);
    collector.addRule(`.monaco-editor .horizontal-top.${colorProvider.activeClassName} { border-top: 1px solid var(--guide-color-active); }`);
    collector.addRule(`.monaco-editor .horizontal-bottom.${colorProvider.activeClassName} { border-bottom: 1px solid var(--guide-color-active); }`);
  }
  if (indentColorValues.length > 0) {
    for (let level = 0; level < 30; level++) {
      const colors2 = indentColorValues[level % indentColorValues.length];
      collector.addRule(`.monaco-editor .lines-content .core-guide-indent.lvl-${level} { --indent-color: ${colors2.indentColor}; --indent-color-active: ${colors2.indentColorActive}; }`);
    }
    collector.addRule(`.monaco-editor .lines-content .core-guide-indent { box-shadow: 1px 0 0 0 var(--indent-color) inset; }`);
    collector.addRule(`.monaco-editor .lines-content .core-guide-indent.indent-active { box-shadow: 1px 0 0 0 var(--indent-color-active) inset; }`);
  }
});
export { transparentToUndefined, IndentGuidesOverlay };
