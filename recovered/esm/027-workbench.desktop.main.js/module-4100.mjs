// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentCustomizationSettings.ts



// src/vs/platform/agentHost/common/agentCustomizationSettings.ts
var AGENT_CUSTOMIZATION_SETTINGS_META_KEY = "vscode.agentCustomizationSettings";

function isAgentCustomizationSettingDescriptor(value2) {
  if (!value2 || typeof value2 !== "object") {
    return false;
  }
  const setting = value2;
  return typeof setting.key === "string" && typeof setting.group === "string" && (setting.kind === void 0 || setting.kind === "multiline") && (setting.saveLabel === void 0 || typeof setting.saveLabel === "string");
}

function isAgentCustomizationSettingsDescriptor(value2) {
  if (!value2 || typeof value2 !== "object") {
    return false;
  }
  const entry = value2;
  if (typeof entry.provider !== "string" || typeof entry.title !== "string" || typeof entry.description !== "string" || !Array.isArray(entry.settings) || !entry.settings.every(isAgentCustomizationSettingDescriptor)) {
    return false;
  }
  const file = entry.configurationFile;
  return file === void 0 || !!file && typeof file.resource === "string" && typeof file.title === "string" && typeof file.description === "string" && typeof file.openLabel === "string" && (file.documentationUrl === void 0 || typeof file.documentationUrl === "string") && (file.documentationLabel === void 0 || typeof file.documentationLabel === "string");
}

function getAgentCustomizationSettingsEntries(state) {
  const meta = state?._meta;
  const value2 = meta?.[AGENT_CUSTOMIZATION_SETTINGS_META_KEY];
  return Array.isArray(value2) ? value2.filter(isAgentCustomizationSettingsDescriptor) : [];
}

function readAgentCustomizationSettings(state, provider) {
  return getAgentCustomizationSettingsEntries(state).find((entry) => entry.provider === provider);
}
export { isAgentCustomizationSettingDescriptor, isAgentCustomizationSettingsDescriptor, getAgentCustomizationSettingsEntries, readAgentCustomizationSettings, AGENT_CUSTOMIZATION_SETTINGS_META_KEY };
