// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/mobileAuxiliaryBarPart.ts
import { AuxiliaryBarPart } from "./module-3444.mjs";
import { isPhoneLayout } from "./module-3445.mjs";
import { AbstractPaneCompositePart } from "./module-3441.mjs";


// src/vs/sessions/browser/parts/mobile/mobileAuxiliaryBarPart.ts
var MobileAuxiliaryBarPart = class extends AuxiliaryBarPart {
  updateStyles() {
    super.updateStyles();
    if (!isPhoneLayout(this.layoutService)) {
      return;
    }
    const container2 = this.getContainer();
    if (container2) {
      container2.style.backgroundColor = "";
      container2.style.removeProperty("--part-background");
      container2.style.removeProperty("--part-border-color");
    }
  }
  layout(width2, height, top2, left) {
    if (!isPhoneLayout(this.layoutService)) {
      super.layout(width2, height, top2, left);
      return;
    }
    if (!this.layoutService.isVisible("workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */)) {
      return;
    }
    AbstractPaneCompositePart.prototype.layout.call(this, width2, height, top2, left);
  }
};
export { MobileAuxiliaryBarPart };
