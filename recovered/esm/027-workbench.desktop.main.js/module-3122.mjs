// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchQuickAccess.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions18 } from "./module-1560.mjs";
import { AnythingQuickAccessProvider } from "./module-2544.mjs";
import { localize } from "./module-0001.mjs";
import { AbstractGotoLineQuickAccessProvider } from "./module-3120.mjs";
import { GotoSymbolQuickAccessProvider } from "./module-2542.mjs";
import { defaultQuickAccessContextKeyValue } from "./module-1518.mjs";
import { SymbolsQuickAccessProvider } from "./module-2541.mjs";


// src/vs/workbench/contrib/search/browser/searchQuickAccess.contribution.ts
var quickAccessRegistry3 = Registry.as(Extensions18.Quickaccess);

quickAccessRegistry3.registerQuickAccessProvider({
  ctor: AnythingQuickAccessProvider,
  prefix: AnythingQuickAccessProvider.PREFIX,
  placeholder: localize(19172, null, AbstractGotoLineQuickAccessProvider.GO_TO_LINE_PREFIX, GotoSymbolQuickAccessProvider.PREFIX),
  contextKey: defaultQuickAccessContextKeyValue,
  helpEntries: [{
    description: localize(19171, null),
    commandId: "workbench.action.quickOpen",
    commandCenterOrder: 10
  }]
});

quickAccessRegistry3.registerQuickAccessProvider({
  ctor: SymbolsQuickAccessProvider,
  prefix: SymbolsQuickAccessProvider.PREFIX,
  placeholder: localize(19174, null),
  contextKey: "inWorkspaceSymbolsPicker",
  helpEntries: [{ description: localize(19173, null), commandId: "workbench.action.showAllSymbols" }]
});
export { quickAccessRegistry3 };
