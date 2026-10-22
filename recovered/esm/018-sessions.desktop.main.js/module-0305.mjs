// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/marginDecorations/marginDecorations.ts
import { DecorationToRender, DedupOverlay } from "./module-0292.mjs";


// src/vs/editor/browser/viewParts/marginDecorations/marginDecorations.ts
var MarginViewLineDecorationsOverlay = class extends DedupOverlay {
  constructor(context2) {
    super();
    this._context = context2;
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
      const marginClassName = d.options.marginClassName;
      const zIndex = d.options.zIndex;
      if (marginClassName) {
        r2[rLen++] = new DecorationToRender(d.range.startLineNumber, d.range.endLineNumber, marginClassName, null, zIndex);
      }
    }
    return r2;
  }
  prepareRender(ctx) {
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    const toRender = this._render(visibleStartLineNumber, visibleEndLineNumber, this._getDecorations(ctx));
    const output = [];
    for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
      const lineIndex = lineNumber - visibleStartLineNumber;
      const decorations = toRender[lineIndex].getDecorations();
      let lineOutput = "";
      for (const decoration3 of decorations) {
        lineOutput += '<div class="cmdr ' + decoration3.className + '" style=""></div>';
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
export { MarginViewLineDecorationsOverlay };
