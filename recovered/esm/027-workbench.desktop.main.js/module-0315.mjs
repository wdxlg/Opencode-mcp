// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/viewModel.ts
import { containsRTL, isBasicASCII } from "./module-0030.mjs";
import { equals } from "./module-0007.mjs";


// src/vs/editor/common/viewModel.ts
var Viewport = class {
  constructor(top2, left, width2, height) {
    this._viewportBrand = void 0;
    this.top = top2 | 0;
    this.left = left | 0;
    this.width = width2 | 0;
    this.height = height | 0;
  }
};

var MinimapLinesRenderingData = class {
  constructor(tabSize, data) {
    this.tabSize = tabSize;
    this.data = data;
  }
};

var ViewLineData = class {
  constructor(content2, continuesWithWrappedLine, minColumn, maxColumn, startVisibleColumn, tokens, inlineDecorations) {
    this._viewLineDataBrand = void 0;
    this.content = content2;
    this.continuesWithWrappedLine = continuesWithWrappedLine;
    this.minColumn = minColumn;
    this.maxColumn = maxColumn;
    this.startVisibleColumn = startVisibleColumn;
    this.tokens = tokens;
    this.inlineDecorations = inlineDecorations;
  }
};

var ViewLineRenderingData = class _ViewLineRenderingData {
  constructor(minColumn, maxColumn, content2, continuesWithWrappedLine, mightContainRTL, mightContainNonBasicASCII, tokens, inlineDecorations, tabSize, startVisibleColumn, textDirection, hasVariableFonts) {
    this.minColumn = minColumn;
    this.maxColumn = maxColumn;
    this.content = content2;
    this.continuesWithWrappedLine = continuesWithWrappedLine;
    this.isBasicASCII = _ViewLineRenderingData.isBasicASCII(content2, mightContainNonBasicASCII);
    this.containsRTL = _ViewLineRenderingData.containsRTL(content2, this.isBasicASCII, mightContainRTL);
    this.tokens = tokens;
    this.inlineDecorations = inlineDecorations;
    this.tabSize = tabSize;
    this.startVisibleColumn = startVisibleColumn;
    this.textDirection = textDirection;
    this.hasVariableFonts = hasVariableFonts;
  }
  static isBasicASCII(lineContent, mightContainNonBasicASCII) {
    if (mightContainNonBasicASCII) {
      return isBasicASCII(lineContent);
    }
    return true;
  }
  static containsRTL(lineContent, isBasicASCII2, mightContainRTL) {
    if (!isBasicASCII2 && mightContainRTL) {
      return containsRTL(lineContent);
    }
    return false;
  }
};

var OverviewRulerDecorationsGroup = class _OverviewRulerDecorationsGroup {
  constructor(color2, zIndex, data) {
    this.color = color2;
    this.zIndex = zIndex;
    this.data = data;
  }
  static compareByRenderingProps(a, b) {
    if (a.zIndex === b.zIndex) {
      if (a.color < b.color) {
        return -1;
      }
      if (a.color > b.color) {
        return 1;
      }
      return 0;
    }
    return a.zIndex - b.zIndex;
  }
  static equals(a, b) {
    return a.color === b.color && a.zIndex === b.zIndex && equals(a.data, b.data);
  }
  static equalsArr(a, b) {
    return equals(a, b, _OverviewRulerDecorationsGroup.equals);
  }
};
export { Viewport, MinimapLinesRenderingData, ViewLineData, ViewLineRenderingData, OverviewRulerDecorationsGroup };
