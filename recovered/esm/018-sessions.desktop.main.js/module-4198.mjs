// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserSearchFeatures.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1113.mjs";
import { BROWSER_SEARCH_ENGINES, BROWSER_SEARCH_NONE, BrowserSearchEngineSettingId } from "./module-4167.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserSearchFeatures.ts
Registry.as(Extensions4.Configuration).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    [BrowserSearchEngineSettingId]: {
      type: "string",
      enum: [BROWSER_SEARCH_NONE, ...BROWSER_SEARCH_ENGINES.map((e4) => e4.id)],
      enumItemLabels: [localize(8169, null), ...BROWSER_SEARCH_ENGINES.map((e4) => e4.label)],
      default: "bing" /* Bing */,
      markdownDescription: localize(
        8170,
        null
      ),
      scope: 1 /* APPLICATION */,
      order: 110
    }
  }
});
export {};
