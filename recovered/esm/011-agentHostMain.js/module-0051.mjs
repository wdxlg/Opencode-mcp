// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/configuration/common/configuration.ts
import { createDecorator } from "./module-0044.mjs";


// src/vs/platform/configuration/common/configuration.ts
var IConfigurationService = createDecorator("configurationService");

function getLanguageTagSettingPlainKey(settingKey) {
  return settingKey.replace(/^\[/, "").replace(/]$/g, "").replace(/\]\[/g, ", ");
}
export { getLanguageTagSettingPlainKey, IConfigurationService };
