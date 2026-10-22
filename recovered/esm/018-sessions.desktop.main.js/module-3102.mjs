// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/chatAgentTools/common/sandboxSettingsReader.ts
import { sandboxSettingIdToAgentHostKey } from "./module-3101.mjs";


// src/vs/workbench/contrib/terminalContrib/chatAgentTools/common/sandboxSettingsReader.ts
var SANDBOX_SETTING_KEYS = [
  "chat.agent.sandbox.enabled" /* AgentSandboxEnabled */,
  "chat.agent.sandbox.enabledWindows" /* AgentSandboxWindowsEnabled */,
  "chat.agent.sandbox.allowNetwork" /* AgentSandboxAllowNetwork */,
  "chat.agent.sandbox.allowUnsandboxedCommands" /* AgentSandboxAllowUnsandboxedCommands */,
  "chat.agent.sandbox.fileSystem.linux" /* AgentSandboxLinuxFileSystem */,
  "chat.agent.sandbox.fileSystem.mac" /* AgentSandboxMacFileSystem */,
  "chat.agent.sandbox.fileSystem.windows" /* AgentSandboxWindowsFileSystem */,
  "chat.agent.sandbox.advanced.windows.schemaVersion" /* AgentSandboxWindowsSchemaVersion */,
  "chat.agent.sandbox.advanced.runtime" /* AgentSandboxAdvancedRuntime */,
  "chat.agent.allowedNetworkDomains" /* AllowedNetworkDomains */,
  "chat.agent.deniedNetworkDomains" /* DeniedNetworkDomains */
];

function readSandboxSetting(configurationService, _logService, settingId) {
  return normalizeSandboxSettingValue(settingId, configurationService.inspect(settingId).value);
}

function readAgentHostSandboxValues(configurationService, logService) {
  const values = {};
  for (const [settingId, sandboxKey] of Object.entries(sandboxSettingIdToAgentHostKey)) {
    const value2 = readSandboxSetting(configurationService, logService, settingId);
    if (value2 !== void 0) {
      values[sandboxKey] = value2;
    }
  }
  return values;
}

function normalizeSandboxSettingValue(settingId, value2) {
  if (settingId === "chat.agent.sandbox.enabled" /* AgentSandboxEnabled */ || settingId === "chat.agent.sandbox.enabledWindows" /* AgentSandboxWindowsEnabled */) {
    if (value2 === true) {
      return "on";
    }
    if (value2 === false) {
      return "off";
    }
  }
  return value2;
}
export { readSandboxSetting, readAgentHostSandboxValues, normalizeSandboxSettingValue, SANDBOX_SETTING_KEYS };
