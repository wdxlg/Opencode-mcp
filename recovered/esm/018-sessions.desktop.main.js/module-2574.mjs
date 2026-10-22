// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugEnablement.ts
import { $, append } from "./module-0075.mjs";
import { isAgentHostSession } from "./module-2573.mjs";
import { AGENT_DEBUG_LOG_FILE_LOGGING_ENABLED_SETTING, AgentHostAgentDebugLogEnabledSettingId } from "./module-0986.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { localize } from "./module-0001.mjs";
import { AgentHostAhpJsonlLoggingSettingId } from "./module-1108.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugEnablement.ts
var $67 = $;

function getChatDebugLoggingSettingId(sessionResource) {
  return isAgentHostSession(sessionResource) ? AgentHostAgentDebugLogEnabledSettingId : AGENT_DEBUG_LOG_FILE_LOGGING_ENABLED_SETTING;
}

function isChatDebugLoggingEnabledForSession(configurationService, sessionResource) {
  return configurationService.getValue(getChatDebugLoggingSettingId(sessionResource));
}

function renderEnableSettingMessage(container2, settingId, message, preferencesService, disposables) {
  const wrapper = append(container2, $67(".chat-debug-logging-disabled"));
  append(wrapper, $67("p.chat-debug-logging-disabled-message", void 0, message));
  const enableButton = disposables.add(new Button(wrapper, { ...defaultButtonStyles, secondary: true }));
  enableButton.element.style.width = "auto";
  enableButton.label = localize(10566, null);
  disposables.add(enableButton.onDidClick(() => {
    preferencesService.openSettings({ jsonEditor: false, query: settingId });
  }));
}

function renderChatDebugLoggingDisabledMessage(container2, sessionResource, preferencesService, disposables) {
  renderEnableSettingMessage(
    container2,
    getChatDebugLoggingSettingId(sessionResource),
    localize(10565, null),
    preferencesService,
    disposables
  );
}

function isWireLogLoggingEnabled(configurationService) {
  return configurationService.getValue(AgentHostAhpJsonlLoggingSettingId);
}

function renderWireLogLoggingDisabledMessage(container2, preferencesService, disposables) {
  renderEnableSettingMessage(
    container2,
    AgentHostAhpJsonlLoggingSettingId,
    localize(10567, null),
    preferencesService,
    disposables
  );
}
export { getChatDebugLoggingSettingId, isChatDebugLoggingEnabledForSession, renderEnableSettingMessage, renderChatDebugLoggingDisabledMessage, isWireLogLoggingEnabled, renderWireLogLoggingDisabledMessage, $67 };
