// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/rulersGpu/rulersGpu.ts
import { ViewPart } from "./module-0239.mjs";
import { autorun } from "./module-0052.mjs";
import { Color } from "./module-0197.mjs";
import { editorRuler } from "./module-0288.mjs";


// src/vs/editor/browser/viewParts/rulersGpu/rulersGpu.ts
var RulersGpu = class extends ViewPart {
  constructor(context2, _viewGpuContext) {
    super(context2);
    this._viewGpuContext = _viewGpuContext;
    this._gpuShapes = [];
    this._register(autorun((reader) => this._updateEntries(reader)));
  }
  // --- begin event handlers
  onConfigurationChanged(e4) {
    this._updateEntries(void 0);
    return true;
  }
  // --- end event handlers
  prepareRender(ctx) {
  }
  render(ctx) {
  }
  _updateEntries(reader) {
    const options3 = this._context.configuration.options;
    const rulers = options3.get(116 /* rulers */);
    const typicalHalfwidthCharacterWidth = options3.get(59 /* fontInfo */).typicalHalfwidthCharacterWidth;
    const devicePixelRatio = this._viewGpuContext.devicePixelRatio.read(reader);
    for (let i2 = 0, len = rulers.length; i2 < len; i2++) {
      const ruler = rulers[i2];
      const shape = this._gpuShapes[i2];
      const color2 = ruler.color ? Color.fromHex(ruler.color) : this._context.theme.getColor(editorRuler) ?? Color.white;
      const rulerData = [
        ruler.column * typicalHalfwidthCharacterWidth * devicePixelRatio,
        0,
        Math.max(1, Math.ceil(devicePixelRatio)),
        Number.MAX_SAFE_INTEGER,
        color2.rgba.r / 255,
        color2.rgba.g / 255,
        color2.rgba.b / 255,
        color2.rgba.a
      ];
      if (!shape) {
        this._gpuShapes[i2] = this._viewGpuContext.rectangleRenderer.register(...rulerData);
      } else {
        shape.setRaw(rulerData);
      }
    }
    while (this._gpuShapes.length > rulers.length) {
      this._gpuShapes.splice(-1, 1)[0].dispose();
    }
  }
};
export { RulersGpu };
