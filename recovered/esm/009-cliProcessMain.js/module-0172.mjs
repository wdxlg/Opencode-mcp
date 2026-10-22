// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/policy/common/copilotManagedSettings.ts
import { createDecorator } from "./module-0030.mjs";


// src/vs/platform/policy/common/copilotManagedSettings.ts
var COPILOT_FORCE_REMOTE_SETTINGS_REFRESH_KEY = "forceRemoteSettingsRefresh";

var COPILOT_SANDBOX_ENABLED_KEY = "sandbox.enabled";

var MANAGED_SETTINGS_CONTROL_DEFINITIONS = {
  [COPILOT_FORCE_REMOTE_SETTINGS_REFRESH_KEY]: { type: "boolean" },
  [COPILOT_SANDBOX_ENABLED_KEY]: { type: "boolean" }
};

var COPILOT_ALLOW_MANAGED_MCP_SERVERS_ONLY_CONFIG = "chat.mcp.allowManagedServersOnly";

var IManagedSettingsService = createDecorator("managedSettingsService");

var INativeManagedSettingsService = createDecorator("nativeManagedSettingsService");

var IFileManagedSettingsService = createDecorator("fileManagedSettingsService");
export { COPILOT_FORCE_REMOTE_SETTINGS_REFRESH_KEY, COPILOT_SANDBOX_ENABLED_KEY, MANAGED_SETTINGS_CONTROL_DEFINITIONS, COPILOT_ALLOW_MANAGED_MCP_SERVERS_ONLY_CONFIG, IManagedSettingsService, INativeManagedSettingsService, IFileManagedSettingsService };
