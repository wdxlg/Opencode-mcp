// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/terminalContribExports.ts
import { terminalAccessibilityConfiguration } from "./module-1151.mjs";
import { terminalAutoRepliesConfiguration } from "./module-1152.mjs";
import { terminalChatAgentToolsConfiguration } from "./module-1161.mjs";
import { terminalInitialHintConfiguration } from "./module-1155.mjs";
import { terminalCommandGuideConfiguration } from "./module-1162.mjs";
import { defaultTerminalHistoryCommandsToSkipShell, terminalHistoryConfiguration } from "./module-1164.mjs";
import { terminalOscNotificationsConfiguration } from "./module-1165.mjs";
import { terminalResizeDimensionsOverlayConfiguration } from "./module-1166.mjs";
import { terminalStickyScrollConfiguration } from "./module-1167.mjs";
import { terminalSuggestConfiguration } from "./module-1169.mjs";
import { terminalTypeAheadConfiguration } from "./module-1170.mjs";
import { terminalZoomConfiguration } from "./module-1171.mjs";
import { defaultTerminalAccessibilityCommandsToSkipShell } from "./module-1150.mjs";
import { defaultTerminalFindCommandToSkipShell } from "./module-1163.mjs";
import { defaultTerminalSuggestCommandsToSkipShell } from "./module-1168.mjs";


// src/vs/workbench/contrib/terminal/terminalContribExports.ts
var TerminalContribCommandId = ((TerminalContribCommandId2) => {
  TerminalContribCommandId2[TerminalContribCommandId2["A11yFocusAccessibleBuffer"] = "workbench.action.terminal.focusAccessibleBuffer" /* FocusAccessibleBuffer */] = "A11yFocusAccessibleBuffer";
  TerminalContribCommandId2[TerminalContribCommandId2["DeveloperRestartPtyHost"] = "workbench.action.terminal.restartPtyHost" /* RestartPtyHost */] = "DeveloperRestartPtyHost";
  TerminalContribCommandId2[TerminalContribCommandId2["OpenTerminalSettingsLink"] = "workbench.action.terminal.chat.openTerminalSettingsLink" /* OpenTerminalSettingsLink */] = "OpenTerminalSettingsLink";
  TerminalContribCommandId2[TerminalContribCommandId2["DisableSessionAutoApproval"] = "workbench.action.terminal.chat.disableSessionAutoApproval" /* DisableSessionAutoApproval */] = "DisableSessionAutoApproval";
  TerminalContribCommandId2[TerminalContribCommandId2["FocusMostRecentChatTerminalOutput"] = "workbench.action.terminal.chat.focusMostRecentChatTerminalOutput" /* FocusMostRecentChatTerminalOutput */] = "FocusMostRecentChatTerminalOutput";
  TerminalContribCommandId2[TerminalContribCommandId2["FocusMostRecentChatTerminal"] = "workbench.action.terminal.chat.focusMostRecentChatTerminal" /* FocusMostRecentChatTerminal */] = "FocusMostRecentChatTerminal";
  TerminalContribCommandId2[TerminalContribCommandId2["ToggleChatTerminalOutput"] = "workbench.action.terminal.chat.toggleChatTerminalOutput" /* ToggleChatTerminalOutput */] = "ToggleChatTerminalOutput";
  TerminalContribCommandId2[TerminalContribCommandId2["FocusChatInstanceAction"] = "workbench.action.terminal.chat.focusChatInstance" /* FocusChatInstanceAction */] = "FocusChatInstanceAction";
  TerminalContribCommandId2[TerminalContribCommandId2["ContinueInBackground"] = "workbench.action.terminal.chat.continueInBackground" /* ContinueInBackground */] = "ContinueInBackground";
  return TerminalContribCommandId2;
})(TerminalContribCommandId || {});

var TerminalContribSettingId = ((TerminalContribSettingId2) => {
  TerminalContribSettingId2[TerminalContribSettingId2["StickyScrollEnabled"] = "terminal.integrated.stickyScroll.enabled" /* Enabled */] = "StickyScrollEnabled";
  TerminalContribSettingId2[TerminalContribSettingId2["SuggestEnabled"] = "terminal.integrated.suggest.enabled" /* Enabled */] = "SuggestEnabled";
  TerminalContribSettingId2[TerminalContribSettingId2["AutoApprove"] = "chat.tools.terminal.autoApprove" /* AutoApprove */] = "AutoApprove";
  TerminalContribSettingId2[TerminalContribSettingId2["EnableAutoApprove"] = "chat.tools.terminal.enableAutoApprove" /* EnableAutoApprove */] = "EnableAutoApprove";
  TerminalContribSettingId2[TerminalContribSettingId2["ShellIntegrationTimeout"] = "chat.tools.terminal.shellIntegrationTimeout" /* ShellIntegrationTimeout */] = "ShellIntegrationTimeout";
  TerminalContribSettingId2[TerminalContribSettingId2["OutputLocation"] = "chat.tools.terminal.outputLocation" /* OutputLocation */] = "OutputLocation";
  TerminalContribSettingId2[TerminalContribSettingId2["AgentSandboxEnabled"] = "chat.agent.sandbox.enabled" /* AgentSandboxEnabled */] = "AgentSandboxEnabled";
  TerminalContribSettingId2[TerminalContribSettingId2["AgentSandboxWindowsEnabled"] = "chat.agent.sandbox.enabledWindows" /* AgentSandboxWindowsEnabled */] = "AgentSandboxWindowsEnabled";
  TerminalContribSettingId2[TerminalContribSettingId2["AgentSandboxAllowNetwork"] = "chat.agent.sandbox.allowNetwork" /* AgentSandboxAllowNetwork */] = "AgentSandboxAllowNetwork";
  TerminalContribSettingId2[TerminalContribSettingId2["AgentSandboxAllowUnsandboxedCommands"] = "chat.agent.sandbox.allowUnsandboxedCommands" /* AgentSandboxAllowUnsandboxedCommands */] = "AgentSandboxAllowUnsandboxedCommands";
  TerminalContribSettingId2[TerminalContribSettingId2["AgentSandboxRetryWithAllowNetworkRequests"] = "chat.agent.sandbox.retryWithAllowNetworkRequests" /* AgentSandboxRetryWithAllowNetworkRequests */] = "AgentSandboxRetryWithAllowNetworkRequests";
  TerminalContribSettingId2[TerminalContribSettingId2["AgentSandboxAllowAutoApprove"] = "chat.agent.sandbox.allowAutoApprove" /* AgentSandboxAllowAutoApprove */] = "AgentSandboxAllowAutoApprove";
  TerminalContribSettingId2[TerminalContribSettingId2["AgentSandboxLinuxFileSystem"] = "chat.agent.sandbox.fileSystem.linux" /* AgentSandboxLinuxFileSystem */] = "AgentSandboxLinuxFileSystem";
  TerminalContribSettingId2[TerminalContribSettingId2["AgentSandboxMacFileSystem"] = "chat.agent.sandbox.fileSystem.mac" /* AgentSandboxMacFileSystem */] = "AgentSandboxMacFileSystem";
  TerminalContribSettingId2[TerminalContribSettingId2["AgentSandboxWindowsFileSystem"] = "chat.agent.sandbox.fileSystem.windows" /* AgentSandboxWindowsFileSystem */] = "AgentSandboxWindowsFileSystem";
  return TerminalContribSettingId2;
})(TerminalContribSettingId || {});

var TerminalContribContextKeyStrings = ((TerminalContribContextKeyStrings2) => {
  TerminalContribContextKeyStrings2[TerminalContribContextKeyStrings2["ChatHasTerminals"] = "hasChatTerminals" /* ChatHasTerminals */] = "ChatHasTerminals";
  TerminalContribContextKeyStrings2[TerminalContribContextKeyStrings2["ChatHasHiddenTerminals"] = "hasHiddenChatTerminals" /* ChatHasHiddenTerminals */] = "ChatHasHiddenTerminals";
  return TerminalContribContextKeyStrings2;
})(TerminalContribContextKeyStrings || {});

var terminalContribConfiguration = {
  ...terminalAccessibilityConfiguration,
  ...terminalAutoRepliesConfiguration,
  ...terminalChatAgentToolsConfiguration,
  ...terminalInitialHintConfiguration,
  ...terminalCommandGuideConfiguration,
  ...terminalHistoryConfiguration,
  ...terminalOscNotificationsConfiguration,
  ...terminalResizeDimensionsOverlayConfiguration,
  ...terminalStickyScrollConfiguration,
  ...terminalSuggestConfiguration,
  ...terminalTypeAheadConfiguration,
  ...terminalZoomConfiguration
};

var defaultTerminalContribCommandsToSkipShell = [
  ...defaultTerminalAccessibilityCommandsToSkipShell,
  ...defaultTerminalFindCommandToSkipShell,
  ...defaultTerminalHistoryCommandsToSkipShell,
  ...defaultTerminalSuggestCommandsToSkipShell
];
export { TerminalContribCommandId, TerminalContribSettingId, TerminalContribContextKeyStrings, terminalContribConfiguration, defaultTerminalContribCommandsToSkipShell };
