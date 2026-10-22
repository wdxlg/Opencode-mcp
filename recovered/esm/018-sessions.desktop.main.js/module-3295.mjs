// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/editorSettingsMigration.ts
import { Registry } from "./module-0090.mjs";
import { Extensions14 } from "./module-1113.mjs";
import { EditorSettingMigration } from "./module-0218.mjs";


// src/vs/workbench/contrib/codeEditor/browser/editorSettingsMigration.ts
Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations(EditorSettingMigration.items.map((item) => ({
  key: `editor.${item.key}`,
  migrateFn: (value2, accessor) => {
    const configurationKeyValuePairs = [];
    const writer = (key3, value3) => configurationKeyValuePairs.push([`editor.${key3}`, { value: value3 }]);
    item.migrate(value2, (key3) => accessor(`editor.${key3}`), writer);
    return configurationKeyValuePairs;
  }
})));
export {};
