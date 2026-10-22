// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/gpuMark/gpuMark.ts
import { DynamicViewOverlay } from "./module-0286.mjs";
import { ViewLineOptions } from "./module-0301.mjs";


// src/vs/editor/browser/viewParts/gpuMark/gpuMark.ts
var GpuMarkOverlay = class _GpuMarkOverlay extends DynamicViewOverlay {
  constructor(context2, _viewGpuContext) {
    super();
    this._viewGpuContext = _viewGpuContext;
    this._context = context2;
    this._renderResult = null;
    this._context.addEventHandler(this);
  }
  static {
    this.CLASS_NAME = "gpu-mark";
  }
  dispose() {
    this._context.removeEventHandler(this);
    this._renderResult = null;
    super.dispose();
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    return true;
  }
  onCursorStateChanged(e) {
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
  onDecorationsChanged(e) {
    return true;
  }
  // --- end event handlers
  prepareRender(ctx) {
    const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
    const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
    const viewportData = ctx.viewportData;
    const options3 = new ViewLineOptions(this._context.configuration, this._context.theme.type);
    const output = [];
    for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
      const lineIndex = lineNumber - visibleStartLineNumber;
      const cannotRenderReasons = this._viewGpuContext.canRenderDetailed(options3, viewportData, lineNumber);
      output[lineIndex] = cannotRenderReasons.length ? `<div class="${_GpuMarkOverlay.CLASS_NAME}" title="Cannot render on GPU: ${cannotRenderReasons.join(", ")}"></div>` : "";
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
export { GpuMarkOverlay };
