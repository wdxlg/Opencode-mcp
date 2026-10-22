// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/links/browser/terminal.links.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { ITerminalLinkProviderService } from "./module-1273.mjs";
import { TerminalLinkProviderService } from "./module-3209.mjs";
import { registerTerminalContribution } from "./module-2329.mjs";
import { TerminalLinkContribution } from "./module-3208.mjs";
import { terminalStrings } from "./module-3030.mjs";
import { registerActiveInstanceAction } from "./module-3043.mjs";
import { localize2 } from "./module-0001.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { accessibleViewCurrentProviderId, accessibleViewIsShown } from "./module-1369.mjs";


// src/vs/workbench/contrib/terminalContrib/links/browser/terminal.links.contribution.ts
registerSingleton(ITerminalLinkProviderService, TerminalLinkProviderService, 1 /* Delayed */);

registerTerminalContribution(TerminalLinkContribution.ID, TerminalLinkContribution, true);

var category6 = terminalStrings.actionCategory;

registerActiveInstanceAction({
  id: "workbench.action.terminal.openDetectedLink" /* OpenDetectedLink */,
  title: localize2(20779, "Open Detected Link..."),
  f1: true,
  category: category6,
  precondition: TerminalContextKeys.terminalHasBeenCreated,
  keybinding: [
    {
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 45 /* KeyO */,
      weight: 200 /* WorkbenchContrib */ + 1,
      when: TerminalContextKeys.focus
    },
    {
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KeyG */,
      weight: 200 /* WorkbenchContrib */ + 1,
      when: ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal" /* Terminal */))
    }
  ],
  run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.showLinkQuickpick()
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.openUrlLink" /* OpenWebLink */,
  title: localize2(20781, "Open Last URL Link"),
  metadata: {
    description: localize2(20782, "Opens the last detected URL/URI link in the terminal")
  },
  f1: true,
  category: category6,
  precondition: TerminalContextKeys.terminalHasBeenCreated,
  run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.openRecentLink("url")
});

registerActiveInstanceAction({
  id: "workbench.action.terminal.openFileLink" /* OpenFileLink */,
  title: localize2(20780, "Open Last Local File Link"),
  f1: true,
  category: category6,
  precondition: TerminalContextKeys.terminalHasBeenCreated,
  run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.openRecentLink("localFile")
});
export { category6 };
