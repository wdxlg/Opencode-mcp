// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/debug/node/telemetryApp.js
// Original module marker: src/vs/platform/configuration/common/configuration.ts
import { createDecorator } from "./module-0038.mjs";


// src/vs/platform/configuration/common/configuration.ts
var IConfigurationService = createDecorator("configurationService");

function getLanguageTagSettingPlainKey(settingKey) {
  return settingKey.replace(/^\[/, "").replace(/]$/g, "").replace(/\]\[/g, ", ");
}
export { getLanguageTagSettingPlainKey, IConfigurationService };
