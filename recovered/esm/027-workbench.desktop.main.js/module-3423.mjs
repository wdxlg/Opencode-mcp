// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/stickyScroll/browser/terminal.stickyScroll.contribution.ts
import { registerTerminalContribution } from "./module-2354.mjs";
import { TerminalStickyScrollContribution } from "./module-3387.mjs";
import { registerTerminalAction } from "./module-3272.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { MenuId } from "./module-0092.mjs";


// src/vs/workbench/contrib/terminalContrib/stickyScroll/browser/terminal.stickyScroll.contribution.ts
registerTerminalContribution(TerminalStickyScrollContribution.ID, TerminalStickyScrollContribution);

registerTerminalAction({
  id: "workbench.action.terminal.toggleStickyScroll" /* ToggleStickyScroll */,
  title: localize2(20844, "Toggle Sticky Scroll"),
  toggled: {
    condition: ContextKeyExpr.equals(`config.${"terminal.integrated.stickyScroll.enabled" /* Enabled */}`, true),
    title: localize(20843, null),
    mnemonicTitle: localize(20842, null)
  },
  run: (c, accessor) => {
    const configurationService = accessor.get(IConfigurationService);
    const newValue = !configurationService.getValue("terminal.integrated.stickyScroll.enabled" /* Enabled */);
    return configurationService.updateValue("terminal.integrated.stickyScroll.enabled" /* Enabled */, newValue);
  },
  menu: [
    { id: MenuId.TerminalStickyScrollContext }
  ]
});
export {};
