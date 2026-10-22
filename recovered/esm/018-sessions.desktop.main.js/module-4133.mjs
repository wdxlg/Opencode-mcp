// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/electron-browser/themes.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { COLOR_THEME_CONFIGURATION_SETTINGS_TAG, formatSettingAsLink } from "./module-1623.mjs";
import { isLinux } from "./module-0014.mjs";


// src/vs/workbench/services/themes/electron-browser/themes.contribution.ts
var configurationRegistry24 = Registry.as(Extensions4.Configuration);

configurationRegistry24.registerConfiguration({
  properties: {
    ["window.systemColorTheme" /* SYSTEM_COLOR_THEME */]: {
      type: "string",
      enum: ["default", "auto", "light", "dark"],
      enumDescriptions: [
        localize(23614, null),
        localize(23612, null),
        localize(23615, null),
        localize(23613, null)
      ],
      markdownDescription: localize(23611, null, formatSettingAsLink("workbench.colorTheme" /* COLOR_THEME */), formatSettingAsLink("window.autoDetectColorScheme" /* DETECT_COLOR_SCHEME */)),
      default: "default",
      included: !isLinux,
      scope: 1 /* APPLICATION */,
      tags: [COLOR_THEME_CONFIGURATION_SETTINGS_TAG]
    }
  }
});
export { configurationRegistry24 };
