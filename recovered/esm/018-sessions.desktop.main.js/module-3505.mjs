// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/mobile/mobileSessionsPart.ts
import { SessionsPart } from "./module-3504.mjs";
import { isPhoneLayout } from "./module-3445.mjs";
import { clearAgentsPartCardStyles } from "./module-3465.mjs";
import { Part } from "./module-1563.mjs";


// src/vs/sessions/browser/parts/mobile/mobileSessionsPart.ts
var MobileSessionsPart = class extends SessionsPart {
  updateStyles() {
    super.updateStyles();
    if (!isPhoneLayout(this.layoutService)) {
      return;
    }
    const container2 = this.getContainer();
    if (container2) {
      clearAgentsPartCardStyles(container2);
    }
  }
  layout(width2, height, top2, left) {
    if (!isPhoneLayout(this.layoutService)) {
      super.layout(width2, height, top2, left);
      return;
    }
    if (!this.layoutService.isVisible("workbench.parts.sessions" /* SESSIONS_PART */)) {
      return;
    }
    this._lastLayout = { width: width2, height, top: top2, left };
    const { contentSize } = this.layoutContents(width2, height);
    this._gridWidget?.layout(contentSize.width, contentSize.height, top2, left);
    Part.prototype.layout.call(this, width2, height, top2, left);
  }
};
export { MobileSessionsPart };
