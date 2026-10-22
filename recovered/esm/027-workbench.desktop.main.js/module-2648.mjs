// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagementSectionRegistry.ts
import { toDisposable } from "./module-0012.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationManagementSectionRegistry.ts
var AICustomizationManagementSectionRegistry = class {
  constructor() {
    this.contributions = /* @__PURE__ */ new Map();
  }
  register(contribution) {
    const contributions = this.contributions.get(contribution.id) ?? [];
    contributions.push(contribution);
    this.contributions.set(contribution.id, contributions);
    return toDisposable(() => {
      const index2 = contributions.indexOf(contribution);
      if (index2 !== -1) {
        contributions.splice(index2, 1);
      }
      if (contributions.length === 0) {
        this.contributions.delete(contribution.id);
      }
    });
  }
  has(id2) {
    return this.contributions.has(id2);
  }
  getDefault(id2) {
    return this.contributions.get(id2)?.[0];
  }
  get(id2, harnessId) {
    return this.contributions.get(id2)?.find((contribution) => contribution.supportsHarness(harnessId));
  }
};

var aiCustomizationManagementSectionRegistry = new AICustomizationManagementSectionRegistry();
export { AICustomizationManagementSectionRegistry, aiCustomizationManagementSectionRegistry };
