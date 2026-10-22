// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/automations/automationsEnabled.ts
import { RawContextKey } from "./module-0089.mjs";


// src/vs/workbench/contrib/chat/common/automations/automationsEnabled.ts
var CHAT_AUTOMATIONS_ENABLED_SETTING = "chat.automations.enabled";

var CHAT_AUTOMATIONS_RUN_TIMEOUT_MINUTES_SETTING = "chat.automations.runTimeoutMinutes";

var DEFAULT_AUTOMATIONS_RUN_TIMEOUT_MINUTES = 30;

var ChatAutomationsEnabledContext = new RawContextKey("chatAutomationsEnabled", false, {
  type: "boolean",
  description: "True when the chat Automations feature is enabled via the chat.automations.enabled setting."
});
export { CHAT_AUTOMATIONS_ENABLED_SETTING, CHAT_AUTOMATIONS_RUN_TIMEOUT_MINUTES_SETTING, DEFAULT_AUTOMATIONS_RUN_TIMEOUT_MINUTES, ChatAutomationsEnabledContext };
