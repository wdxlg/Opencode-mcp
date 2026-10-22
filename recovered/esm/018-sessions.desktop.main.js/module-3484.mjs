// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/singlePaneAuxiliaryBarPart.ts
import { AuxiliaryBarPart } from "./module-3444.mjs";
import { editorBackground } from "./module-0229.mjs";
import { AbstractPaneCompositePart } from "./module-3441.mjs";


// src/vs/sessions/browser/parts/singlePaneAuxiliaryBarPart.ts
var SinglePaneAuxiliaryBarPart = class extends AuxiliaryBarPart {
  create(parent) {
    this.options = { ...this.options, hasTitle: false };
    super.create(parent);
  }
  shouldShowCompositeBar() {
    return false;
  }
  getPartBackgroundColor() {
    return this.getColor(editorBackground) || "";
  }
  layout(width2, height, top2, left) {
    if (!this.layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
      return;
    }
    AbstractPaneCompositePart.prototype.layout.call(this, width2, height, top2, left);
  }
};
export { SinglePaneAuxiliaryBarPart };
