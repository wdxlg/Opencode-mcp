// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugEnablement.ts
import { $, append } from "./module-0075.mjs";
import { isAgentHostSession } from "./module-2598.mjs";
import { AGENT_DEBUG_LOG_FILE_LOGGING_ENABLED_SETTING, AgentHostAgentDebugLogEnabledSettingId } from "./module-0985.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { localize } from "./module-0001.mjs";
import { AgentHostAhpJsonlLoggingSettingId } from "./module-1107.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugEnablement.ts
var $68 = $;

function getChatDebugLoggingSettingId(sessionResource) {
  return isAgentHostSession(sessionResource) ? AgentHostAgentDebugLogEnabledSettingId : AGENT_DEBUG_LOG_FILE_LOGGING_ENABLED_SETTING;
}

function isChatDebugLoggingEnabledForSession(configurationService, sessionResource) {
  return configurationService.getValue(getChatDebugLoggingSettingId(sessionResource));
}

function renderEnableSettingMessage(container3, settingId, message, preferencesService, disposables) {
  const wrapper = append(container3, $68(".chat-debug-logging-disabled"));
  append(wrapper, $68("p.chat-debug-logging-disabled-message", void 0, message));
  const enableButton = disposables.add(new Button(wrapper, { ...defaultButtonStyles, secondary: true }));
  enableButton.element.style.width = "auto";
  enableButton.label = localize(10566, null);
  disposables.add(enableButton.onDidClick(() => {
    preferencesService.openSettings({ jsonEditor: false, query: settingId });
  }));
}

function renderChatDebugLoggingDisabledMessage(container3, sessionResource, preferencesService, disposables) {
  renderEnableSettingMessage(
    container3,
    getChatDebugLoggingSettingId(sessionResource),
    localize(10565, null),
    preferencesService,
    disposables
  );
}

function isWireLogLoggingEnabled(configurationService) {
  return configurationService.getValue(AgentHostAhpJsonlLoggingSettingId);
}

function renderWireLogLoggingDisabledMessage(container3, preferencesService, disposables) {
  renderEnableSettingMessage(
    container3,
    AgentHostAhpJsonlLoggingSettingId,
    localize(10567, null),
    preferencesService,
    disposables
  );
}
export { getChatDebugLoggingSettingId, isChatDebugLoggingEnabledForSession, renderEnableSettingMessage, renderChatDebugLoggingDisabledMessage, isWireLogLoggingEnabled, renderWireLogLoggingDisabledMessage, $68 };
