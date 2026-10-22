// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibility/browser/accessibleViewContributions.ts
import { Disposable } from "./module-0012.mjs";
import { AccessibilityHelpAction, AccessibleViewAction } from "./module-1375.mjs";
import { IAccessibleViewService } from "./module-0799.mjs";
import { accessibleViewIsShown } from "./module-1370.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";


// src/vs/workbench/contrib/accessibility/browser/accessibleViewContributions.ts
var AccesibleViewHelpContribution = class extends Disposable {
  constructor() {
    super();
    this._register(AccessibilityHelpAction.addImplementation(115, "accessible-view-help", (accessor) => {
      accessor.get(IAccessibleViewService).showAccessibleViewHelp();
      return true;
    }, accessibleViewIsShown));
  }
};

var AccesibleViewContributions = class extends Disposable {
  constructor() {
    super();
    AccessibleViewRegistry.getImplementations().forEach((impl) => {
      const implementation = (accessor) => {
        const provider = impl.getProvider(accessor);
        if (!provider) {
          return false;
        }
        try {
          accessor.get(IAccessibleViewService).show(provider);
          return true;
        } catch {
          provider.dispose();
          return false;
        }
      };
      if (impl.type === "view" /* View */) {
        this._register(AccessibleViewAction.addImplementation(impl.priority, impl.name, implementation, impl.when));
      } else {
        this._register(AccessibilityHelpAction.addImplementation(impl.priority, impl.name, implementation, impl.when));
      }
    });
  }
};
export { AccesibleViewHelpContribution, AccesibleViewContributions };
