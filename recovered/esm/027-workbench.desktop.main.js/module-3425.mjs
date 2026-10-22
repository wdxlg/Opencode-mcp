// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/quickAccess/browser/terminal.quickAccess.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions18 } from "./module-1560.mjs";
import { TerminalQuickAccessProvider } from "./module-3424.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { getQuickNavigateHandler } from "./module-1518.mjs";
import { registerTerminalAction } from "./module-3272.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/contrib/terminalContrib/quickAccess/browser/terminal.quickAccess.contribution.ts
var quickAccessRegistry5 = Registry.as(Extensions18.Quickaccess);

var inTerminalsPicker = "inTerminalPicker";

quickAccessRegistry5.registerQuickAccessProvider({
  ctor: TerminalQuickAccessProvider,
  prefix: TerminalQuickAccessProvider.PREFIX,
  contextKey: inTerminalsPicker,
  placeholder: localize(20808, null),
  helpEntries: [{ description: localize(20807, null), commandId: "workbench.action.quickOpenTerm" /* QuickOpenTerm */ }]
});

var quickAccessNavigateNextInTerminalPickerId = "workbench.action.quickOpenNavigateNextInTerminalPicker";

CommandsRegistry.registerCommand({ id: quickAccessNavigateNextInTerminalPickerId, handler: getQuickNavigateHandler(quickAccessNavigateNextInTerminalPickerId, true) });

var quickAccessNavigatePreviousInTerminalPickerId = "workbench.action.quickOpenNavigatePreviousInTerminalPicker";

CommandsRegistry.registerCommand({ id: quickAccessNavigatePreviousInTerminalPickerId, handler: getQuickNavigateHandler(quickAccessNavigatePreviousInTerminalPickerId, false) });

registerTerminalAction({
  id: "workbench.action.quickOpenTerm" /* QuickOpenTerm */,
  title: localize2(20806, "Switch Active Terminal"),
  precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
  run: (c, accessor) => accessor.get(IQuickInputService).quickAccess.show(TerminalQuickAccessProvider.PREFIX)
});
export { quickAccessRegistry5, inTerminalsPicker, quickAccessNavigateNextInTerminalPickerId, quickAccessNavigatePreviousInTerminalPickerId };
