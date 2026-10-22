// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/sessionsChangesAccessibilityHelp.ts
import { FocusedViewContext } from "./module-0950.mjs";
import { CHANGES_VIEW_ID } from "./module-3620.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { localize } from "./module-0001.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";


// src/vs/sessions/contrib/changes/browser/sessionsChangesAccessibilityHelp.ts
var SessionsChangesAccessibilityHelp = class {
  constructor() {
    this.priority = 115;
    this.name = "sessionsChanges";
    this.type = "help" /* Help */;
    this.when = FocusedViewContext.isEqualTo(CHANGES_VIEW_ID);
  }
  getProvider(accessor) {
    const viewsService = accessor.get(IViewsService);
    const layoutService = accessor.get(IAgentWorkbenchLayoutService);
    const content = [];
    content.push(localize(4308, null));
    content.push(localize(4309, null));
    content.push(localize(4304, null, "<keybinding:sessions.action.revealCIChecks>"));
    content.push(localize(4310, null));
    content.push(localize(4307, null));
    content.push(layoutService.isSinglePaneLayoutEnabled ? localize(4306, null, "<keybinding:toggle.diff.renderSideBySide>") : localize(4305, null, "<keybinding:toggle.diff.renderSideBySide>"));
    return new AccessibleContentProvider(
      "sessionsChanges" /* SessionsChanges */,
      { type: "help" /* Help */ },
      () => content.join("\n"),
      () => {
        const view = viewsService.getViewWithId(CHANGES_VIEW_ID);
        view?.focus();
      },
      "accessibility.verbosity.sessionsChanges" /* SessionsChanges */
    );
  }
};
export { SessionsChangesAccessibilityHelp };
