// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/tree/quickInputTreeFilter.ts
import { matchesFuzzyIconAware, parseLabelWithIcons } from "./module-0461.mjs";


// src/vs/platform/quickinput/browser/tree/quickInputTreeFilter.ts
var QuickInputTreeFilter = class {
  constructor() {
    this.filterValue = "";
    this.matchOnLabel = true;
    this.matchOnDescription = false;
  }
  filter(element, parentVisibility) {
    if (!this.filterValue || !(this.matchOnLabel || this.matchOnDescription)) {
      return element.children ? { visibility: 2 /* Recurse */, data: {} } : { visibility: 1 /* Visible */, data: {} };
    }
    const labelHighlights = this.matchOnLabel ? matchesFuzzyIconAware(this.filterValue, parseLabelWithIcons(element.label)) ?? void 0 : void 0;
    const descriptionHighlights = this.matchOnDescription ? matchesFuzzyIconAware(this.filterValue, parseLabelWithIcons(element.description || "")) ?? void 0 : void 0;
    const visibility = parentVisibility === 1 /* Visible */ ? 1 /* Visible */ : labelHighlights || descriptionHighlights ? 1 /* Visible */ : element.children ? 2 /* Recurse */ : 0 /* Hidden */;
    return {
      visibility,
      data: {
        labelHighlights,
        descriptionHighlights
      }
    };
  }
};
export { QuickInputTreeFilter };
