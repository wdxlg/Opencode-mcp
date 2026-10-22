// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/services/completionsEnablement.ts
import { product_default } from "./module-0139.mjs";
import { isObject } from "./module-0010.mjs";


// src/vs/editor/common/services/completionsEnablement.ts
function getCompletionsEnablementSettingName() {
  return product_default.defaultChatAgent?.completionsEnablementSetting;
}

function isCompletionsEnabled(configurationService, modeId = "*") {
  const settingName = getCompletionsEnablementSettingName();
  if (!settingName) {
    return false;
  }
  return isCompletionsEnabledFromObject(
    configurationService.getValue(settingName),
    modeId
  );
}

function isCompletionsEnabledWithTextResourceConfig(configurationService, resource, modeId = "*") {
  const settingName = getCompletionsEnablementSettingName();
  if (!settingName) {
    return false;
  }
  return isCompletionsEnabledFromObject(
    configurationService.getValue(resource, settingName),
    modeId
  );
}

function isCompletionsEnabledFromObject(completionsEnablementObject, modeId = "*") {
  if (!isObject(completionsEnablementObject)) {
    return false;
  }
  if (typeof completionsEnablementObject[modeId] !== "undefined") {
    return Boolean(completionsEnablementObject[modeId]);
  }
  return Boolean(completionsEnablementObject["*"]);
}
export { getCompletionsEnablementSettingName, isCompletionsEnabled, isCompletionsEnabledWithTextResourceConfig, isCompletionsEnabledFromObject };
