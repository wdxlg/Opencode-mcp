// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/search.common.contribution.ts
import { registerContributions } from "./module-2946.mjs";
import { registerContributions2 } from "./module-2948.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ISearchHistoryService, SearchHistoryService } from "./module-2815.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { searchConfigurationNode } from "./module-1216.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/search/browser/search.common.contribution.ts
registerContributions();

registerContributions2();

registerSingleton(ISearchHistoryService, SearchHistoryService, 1 /* Delayed */);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...searchConfigurationNode,
  properties: {
    "search.searchOnType": {
      type: "boolean",
      default: true,
      description: localize(18983, null)
    },
    "search.searchOnTypeDebouncePeriod": {
      type: "number",
      default: 300,
      markdownDescription: localize(18984, null, "`#search.searchOnType#`")
    }
  }
});
export {};
