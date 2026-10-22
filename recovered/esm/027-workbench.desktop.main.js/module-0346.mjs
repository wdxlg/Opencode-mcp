// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/gpu/renderStrategy/baseRenderStrategy.ts
import { ViewEventHandler } from "./module-0238.mjs";


// src/vs/editor/browser/gpu/renderStrategy/baseRenderStrategy.ts
var BaseRenderStrategy = class extends ViewEventHandler {
  constructor(_context, _viewGpuContext, _device, _glyphRasterizer) {
    super();
    this._context = _context;
    this._viewGpuContext = _viewGpuContext;
    this._device = _device;
    this._glyphRasterizer = _glyphRasterizer;
    this._context.addEventHandler(this);
  }
  get glyphRasterizer() {
    return this._glyphRasterizer.value;
  }
};
export { BaseRenderStrategy };
