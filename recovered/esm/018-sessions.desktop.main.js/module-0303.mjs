// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/linesDecorations/linesDecorations.ts
import { DecorationToRender, DedupOverlay } from "./module-0292.mjs";


// src/vs/editor/browser/viewParts/linesDecorations/linesDecorations.ts
var LinesDecorationsOverlay = class extends DedupOverlay {
  constructor(context2) {
    super();
    this._context = context2;
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._decorationsLeft = layoutInfo.decorationsLeft;
    this._decorationsWidth = layoutInfo.decorationsWidth;
    this._renderResult = null;
    this._context.addEventHandler(this);
  }
  dispose() {
    this._context.removeEventHandler(this);
    this._renderResult = null;
    super.dispose();
  }
  // --- begin event handlers
  onConfigurationChanged(e4) {
    const options3 = this._context.configuration.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    this._decorationsLeft = layoutInfo.decorationsLeft;
    this._decorationsWidth = layoutInfo.decorationsWidth;
    return true;
  }
  onDecorationsChanged(e4) {
    return true;
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
  // --- end event handlers
  _getDecorations(ctx) {
    const decorations = ctx.getDecorationsInViewport();
    const r2 = [];
    let rLen = 0;
    for (let i2 = 0, len = decorations.length; i2 < len; i2++) {
      const d = decorations[i2];
      const linesDecorationsClassName = d.options.linesDecorationsClassName;
      const zIndex = d.options.zIndex;
      if (linesDecorationsClassName) {
        r2[rLen++] = new DecorationToRender(d.range.startLineNumber, d.range.endLineNumber, linesDecorationsClassName, d.options.linesDecorationsTooltip ?? null, zIndex);
      }
      const firstLineDecorationClassName = d.options.firstLineDecorationClassName;
      if (firstLineDecorationClassName) {
        r2[rLen++] = new DecorationToRender(d.range.startLineNumber, d.range.startLineNumber, firstLineDecorationClassName, d.options.linesDecorationsTooltip ?? null, zIndex);
      }
    }
    return r2;
  }
  prepareRender(ctx) {
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    const toRender = this._render(visibleStartLineNumber, visibleEndLineNumber, this._getDecorations(ctx));
    const left = this._decorationsLeft.toString();
    const width2 = this._decorationsWidth.toString();
    const common = '" style="left:' + left + "px;width:" + width2 + 'px;"></div>';
    const output = [];
    for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
      const lineIndex = lineNumber - visibleStartLineNumber;
      const decorations = toRender[lineIndex].getDecorations();
      let lineOutput = "";
      for (const decoration3 of decorations) {
        let addition = '<div class="cldr ' + decoration3.className;
        if (decoration3.tooltip !== null) {
          addition += '" title="' + decoration3.tooltip;
        }
        addition += common;
        lineOutput += addition;
      }
      output[lineIndex] = lineOutput;
    }
    this._renderResult = output;
  }
  render(startLineNumber, lineNumber) {
    if (!this._renderResult) {
      return "";
    }
    return this._renderResult[lineNumber - startLineNumber];
  }
};
export { LinesDecorationsOverlay };
