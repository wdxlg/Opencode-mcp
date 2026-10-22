// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/viewModel/minimapTokensColorTracker.ts
import { Disposable, markAsSingleton } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { RGBA8 } from "./module-0306.mjs";
import { BugIndicatingError, onUnexpectedError } from "./module-0004.mjs";


// src/vs/editor/common/viewModel/minimapTokensColorTracker.ts
var MinimapTokensColorTracker = class _MinimapTokensColorTracker extends Disposable {
  constructor() {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._updateColorMap();
    this._register(TokenizationRegistry2.onDidChange((e4) => {
      if (e4.changedColorMap) {
        this._updateColorMap();
      }
    }));
  }
  static {
    this._INSTANCE = null;
  }
  static getInstance() {
    if (!this._INSTANCE) {
      this._INSTANCE = markAsSingleton(new _MinimapTokensColorTracker());
    }
    return this._INSTANCE;
  }
  _updateColorMap() {
    const colorMap = TokenizationRegistry2.getColorMap();
    if (!colorMap) {
      this._colors = [];
      for (let i2 = 0; i2 <= 2 /* DefaultBackground */; i2++) {
        this._colors[i2] = RGBA8.Empty;
      }
      this._backgroundIsLight = true;
      return;
    }
    this._colors = [RGBA8.Empty];
    for (let colorId = 1; colorId < colorMap.length; colorId++) {
      const source = colorMap[colorId].rgba;
      this._colors[colorId] = new RGBA8(source.r, source.g, source.b, Math.round(source.a * 255));
    }
    const backgroundLuminosity = colorMap[2 /* DefaultBackground */].getRelativeLuminance();
    this._backgroundIsLight = backgroundLuminosity >= 0.5;
    this._onDidChange.fire(void 0);
  }
  getColor(colorId) {
    if (colorId < 1 || colorId >= this._colors.length) {
      colorId = 2 /* DefaultBackground */;
    }
    let color2 = this._colors[colorId];
    if (!color2) {
      onUnexpectedError(new BugIndicatingError(`Missing color for colorId ${colorId}`));
      color2 = RGBA8.Empty;
    }
    return color2;
  }
  backgroundIsLight() {
    return this._backgroundIsLight;
  }
};
export { MinimapTokensColorTracker };
