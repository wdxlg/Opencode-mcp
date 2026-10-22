// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/tree/quickInputTreeAccessibilityProvider.ts
import { localize } from "./module-0001.mjs";
import { getCodiconAriaLabel } from "./module-0461.mjs";
import { Event2 } from "./module-0017.mjs";


// src/vs/platform/quickinput/browser/tree/quickInputTreeAccessibilityProvider.ts
var QuickTreeAccessibilityProvider = class {
  constructor(onCheckedEvent) {
    this.onCheckedEvent = onCheckedEvent;
  }
  getWidgetAriaLabel() {
    return localize(3217, null);
  }
  getAriaLabel(element) {
    return element.ariaLabel || [element.label, element.description].map((s) => getCodiconAriaLabel(s)).filter((s) => !!s).join(", ");
  }
  getWidgetRole() {
    return "tree";
  }
  getRole(_element) {
    return "checkbox";
  }
  isChecked(element) {
    return {
      get value() {
        return element.checked === "mixed" ? "mixed" : !!element.checked;
      },
      onDidChange: (e4) => Event2.filter(this.onCheckedEvent, (e5) => e5.item === element)((_) => e4())
    };
  }
};
export { QuickTreeAccessibilityProvider };
