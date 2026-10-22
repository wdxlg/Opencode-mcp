// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugSettingMigration.ts
import { Registry } from "./module-0090.mjs";
import { Extensions14 } from "./module-1112.mjs";


// src/vs/workbench/contrib/debug/browser/debugSettingMigration.ts
Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "debug.autoExpandLazyVariables",
  migrateFn: (value2) => {
    if (value2 === true) {
      return { value: "on" };
    } else if (value2 === false) {
      return { value: "off" };
    }
    return [];
  }
}]);
export {};
