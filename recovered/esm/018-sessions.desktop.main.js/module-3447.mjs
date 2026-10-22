// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/mobileSidebarPart.ts
import { SidebarPart } from "./module-3443.mjs";
import { isPhoneLayout } from "./module-3445.mjs";
import { AbstractPaneCompositePart } from "./module-3441.mjs";


// src/vs/sessions/browser/parts/mobile/mobileSidebarPart.ts
var MobileSidebarPart = class extends SidebarPart {
  updateStyles() {
    super.updateStyles();
    if (!isPhoneLayout(this.layoutService)) {
      return;
    }
    AbstractPaneCompositePart.prototype.updateStyles.call(this);
    const container2 = this.getContainer();
    if (container2) {
      container2.style.backgroundColor = "";
      container2.style.color = "";
      container2.style.outlineColor = "";
    }
  }
};
export { MobileSidebarPart };
