// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/ui/iconLabel/simpleIconLabel.ts
import { reset } from "./module-0075.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";


// src/vs/base/browser/ui/iconLabel/simpleIconLabel.ts
var SimpleIconLabel = class {
  constructor(_container) {
    this._container = _container;
  }
  set text(text2) {
    reset(this._container, ...renderLabelWithIcons(text2 ?? ""));
  }
  set title(title) {
    if (!this.hover && title) {
      this.hover = getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate("mouse"), this._container, title);
    } else if (this.hover) {
      this.hover.update(title);
    }
  }
  dispose() {
    this.hover?.dispose();
  }
};
export { SimpleIconLabel };
