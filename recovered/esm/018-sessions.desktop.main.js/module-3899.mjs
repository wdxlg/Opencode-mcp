// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/layout/browser/sessions.layout.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { SinglePaneLayoutController } from "./module-3898.mjs";
import { isMobile, isWeb } from "./module-0014.mjs";
import { MobileLayoutController } from "./module-3889.mjs";
import { LayoutController2, RESPONSIVE_SIDEBAR_SETTING } from "./module-3888.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { product_default } from "./module-0139.mjs";
import { DOCK_DETAIL_PANEL_SETTING } from "./module-3662.mjs";


// src/vs/sessions/contrib/layout/browser/sessions.layout.contribution.ts
var SessionsLayoutContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.sessionsLayoutContribution";
  }
  constructor(instantiationService, layoutService) {
    super();
    if (layoutService.isSinglePaneLayoutEnabled) {
      this._register(instantiationService.createInstance(SinglePaneLayoutController));
      return;
    }
    if (isWeb && isMobile) {
      this._register(instantiationService.createInstance(MobileLayoutController));
      return;
    }
    this._register(instantiationService.createInstance(LayoutController2));
  }
};

SessionsLayoutContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IAgentWorkbenchLayoutService)
], SessionsLayoutContribution);

registerWorkbenchContribution2(SessionsLayoutContribution.ID, SessionsLayoutContribution, WorkbenchPhase.BlockRestore);

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "sessions",
  properties: {
    [RESPONSIVE_SIDEBAR_SETTING]: {
      type: "boolean",
      markdownDescription: localize(4844, null),
      default: product_default.quality !== "stable",
      tags: ["experimental"],
      experiment: { mode: "auto" }
    },
    [DOCK_DETAIL_PANEL_SETTING]: {
      type: "boolean",
      markdownDescription: localize(4845, null),
      default: true,
      tags: ["experimental"],
      experiment: { mode: "startup" }
    }
  }
});
export { SessionsLayoutContribution };
