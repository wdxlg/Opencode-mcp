// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/viewModel/inlineDecorations.ts
import { Range2 } from "./module-0106.mjs";
import { ViewModelDecoration, isModelDecorationVisible } from "./module-0242.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/common/viewModel/inlineDecorations.ts
var InlineDecoration = class {
  constructor(range2, inlineClassName, type) {
    this.range = range2;
    this.inlineClassName = inlineClassName;
    this.type = type;
  }
};

var InlineModelDecorationsComputer = class {
  constructor(context2, model, coordinatesConverter) {
    this.context = context2;
    this.model = model;
    this.coordinatesConverter = coordinatesConverter;
    this._decorationsCache = /* @__PURE__ */ Object.create(null);
  }
  getInlineDecorations(modelLineNumber) {
    const modelRange = new Range2(modelLineNumber, 1, modelLineNumber, this.model.getLineMaxColumn(modelLineNumber));
    const viewRange = this.coordinatesConverter.convertModelRangeToViewRange(modelRange);
    const decorationsViewportData = this.getDecorations(viewRange, false, false);
    return decorationsViewportData.inlineDecorations;
  }
  getDecorations(viewRange, onlyMinimapDecorations, onlyMarginDecorations) {
    const modelDecorations = this.context.getModelDecorations(viewRange, onlyMinimapDecorations, onlyMarginDecorations);
    const startLineNumber = viewRange.startLineNumber;
    const endLineNumber = viewRange.endLineNumber;
    const decorationsInViewport = [];
    let decorationsInViewportLen = 0;
    const inlineDecorations = [];
    const hasVariableFonts = [];
    for (let j = startLineNumber; j <= endLineNumber; j++) {
      inlineDecorations[j - startLineNumber] = [];
      hasVariableFonts[j - startLineNumber] = false;
    }
    for (let i2 = 0, len = modelDecorations.length; i2 < len; i2++) {
      const modelDecoration = modelDecorations[i2];
      const decorationOptions = modelDecoration.options;
      if (!isModelDecorationVisible(this.model, modelDecoration)) {
        continue;
      }
      const viewModelDecoration = this._getOrCreateViewModelDecoration(modelDecoration);
      const viewRange2 = viewModelDecoration.range;
      decorationsInViewport[decorationsInViewportLen++] = viewModelDecoration;
      if (decorationOptions.inlineClassName) {
        const inlineDecoration = new InlineDecoration(viewRange2, decorationOptions.inlineClassName, decorationOptions.inlineClassNameAffectsLetterSpacing ? 3 /* RegularAffectingLetterSpacing */ : 0 /* Regular */);
        const intersectedStartLineNumber = Math.max(startLineNumber, viewRange2.startLineNumber);
        const intersectedEndLineNumber = Math.min(endLineNumber, viewRange2.endLineNumber);
        for (let j = intersectedStartLineNumber; j <= intersectedEndLineNumber; j++) {
          inlineDecorations[j - startLineNumber].push(inlineDecoration);
          if (decorationOptions.affectsFont) {
            hasVariableFonts[j - startLineNumber] = true;
          }
        }
      }
      if (decorationOptions.beforeContentClassName) {
        if (startLineNumber <= viewRange2.startLineNumber && viewRange2.startLineNumber <= endLineNumber) {
          const inlineDecoration = new InlineDecoration(
            new Range2(viewRange2.startLineNumber, viewRange2.startColumn, viewRange2.startLineNumber, viewRange2.startColumn),
            decorationOptions.beforeContentClassName,
            1 /* Before */
          );
          inlineDecorations[viewRange2.startLineNumber - startLineNumber].push(inlineDecoration);
          if (decorationOptions.affectsFont) {
            hasVariableFonts[viewRange2.startLineNumber - startLineNumber] = true;
          }
        }
      }
      if (decorationOptions.afterContentClassName) {
        if (startLineNumber <= viewRange2.endLineNumber && viewRange2.endLineNumber <= endLineNumber) {
          const inlineDecoration = new InlineDecoration(
            new Range2(viewRange2.endLineNumber, viewRange2.endColumn, viewRange2.endLineNumber, viewRange2.endColumn),
            decorationOptions.afterContentClassName,
            2 /* After */
          );
          inlineDecorations[viewRange2.endLineNumber - startLineNumber].push(inlineDecoration);
          if (decorationOptions.affectsFont) {
            hasVariableFonts[viewRange2.endLineNumber - startLineNumber] = true;
          }
        }
      }
    }
    return {
      decorations: decorationsInViewport,
      inlineDecorations,
      hasVariableFonts
    };
  }
  reset() {
    this._decorationsCache = /* @__PURE__ */ Object.create(null);
  }
  onModelDecorationsChanged() {
    this.reset();
  }
  onLineMappingChanged() {
    this.reset();
  }
  _getOrCreateViewModelDecoration(modelDecoration) {
    const id2 = modelDecoration.id;
    let r2 = this._decorationsCache[id2];
    if (!r2) {
      const modelRange = modelDecoration.range;
      const options3 = modelDecoration.options;
      let viewRange;
      if (options3.isWholeLine) {
        const start = this.coordinatesConverter.convertModelPositionToViewPosition(new Position(modelRange.startLineNumber, 1), 0 /* Left */, false, true);
        const end = this.coordinatesConverter.convertModelPositionToViewPosition(new Position(modelRange.endLineNumber, this.model.getLineMaxColumn(modelRange.endLineNumber)), 1 /* Right */);
        viewRange = new Range2(start.lineNumber, start.column, end.lineNumber, end.column);
      } else {
        viewRange = this.coordinatesConverter.convertModelRangeToViewRange(modelRange, 1 /* Right */);
      }
      r2 = new ViewModelDecoration(viewRange, options3);
      this._decorationsCache[id2] = r2;
    }
    return r2;
  }
};

var InjectedTextInlineDecorationsComputer = class {
  constructor(context2) {
    this.context = context2;
  }
  getInlineDecorations(modelLineNumber) {
    const injectionOffsets = this.context.getInjectionOffsets(modelLineNumber);
    if (!injectionOffsets) {
      return [];
    }
    const lineInlineDecorations = [];
    let totalInjectedTextLengthBefore = 0;
    let currentInjectedOffset = 0;
    const injectionOptions = this.context.getInjectionOptions(modelLineNumber);
    const breakOffsets = this.context.getBreakOffsets(modelLineNumber);
    for (let outputLineIndex = 0; outputLineIndex < breakOffsets.length; outputLineIndex++) {
      const inlineDecorations = new Array();
      lineInlineDecorations[outputLineIndex] = inlineDecorations;
      const lineStartOffsetInInputWithInjections = outputLineIndex > 0 ? breakOffsets[outputLineIndex - 1] : 0;
      const lineEndOffsetInInputWithInjections = breakOffsets[outputLineIndex];
      while (currentInjectedOffset < injectionOffsets.length) {
        const options3 = injectionOptions[currentInjectedOffset];
        const length = options3.content.length;
        const injectedTextStartOffsetInInputWithInjections = injectionOffsets[currentInjectedOffset] + totalInjectedTextLengthBefore;
        const injectedTextEndOffsetInInputWithInjections = injectedTextStartOffsetInInputWithInjections + length;
        const isWidthOnly = length === 0 && options3.widthInEm !== void 0;
        const isLastOutputLine = outputLineIndex === breakOffsets.length - 1;
        const isAtInternalWrapBoundary = injectedTextStartOffsetInInputWithInjections === lineEndOffsetInInputWithInjections && !isLastOutputLine;
        if (injectedTextStartOffsetInInputWithInjections > lineEndOffsetInInputWithInjections || isWidthOnly && isAtInternalWrapBoundary) {
          break;
        }
        const isInLine = isWidthOnly ? lineStartOffsetInInputWithInjections <= injectedTextStartOffsetInInputWithInjections && (injectedTextStartOffsetInInputWithInjections < lineEndOffsetInInputWithInjections || isLastOutputLine) : lineStartOffsetInInputWithInjections < injectedTextEndOffsetInInputWithInjections;
        if (isInLine) {
          if (options3.inlineClassName) {
            const wrappedTextIndentLength = this.context.getWrappedTextIndentLength(modelLineNumber);
            const offset = outputLineIndex > 0 ? wrappedTextIndentLength : 0;
            const start = offset + Math.max(injectedTextStartOffsetInInputWithInjections - lineStartOffsetInInputWithInjections, 0);
            const end = offset + Math.min(injectedTextEndOffsetInInputWithInjections - lineStartOffsetInInputWithInjections, lineEndOffsetInInputWithInjections - lineStartOffsetInInputWithInjections);
            if (start !== end || isWidthOnly) {
              const viewLineNumber = this.context.getBaseViewLineNumber(modelLineNumber) + outputLineIndex;
              const range2 = new Range2(viewLineNumber, start + 1, viewLineNumber, end + 1);
              const type = isWidthOnly ? 4 /* WidthOnly */ : options3.inlineClassNameAffectsLetterSpacing ? 3 /* RegularAffectingLetterSpacing */ : 0 /* Regular */;
              inlineDecorations.push(new InlineDecoration(range2, options3.inlineClassName, type));
            }
          }
        }
        if (injectedTextEndOffsetInInputWithInjections <= lineEndOffsetInInputWithInjections) {
          totalInjectedTextLengthBefore += length;
          currentInjectedOffset++;
        } else {
          break;
        }
      }
    }
    return lineInlineDecorations;
  }
};
export { InlineDecoration, InlineModelDecorationsComputer, InjectedTextInlineDecorationsComputer };
