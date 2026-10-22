// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/speechToText/micButtonMenuActions.ts
import { Separator, toAction } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { SHOW_DICTATION_ONBOARDING_COMMAND } from "./module-2037.mjs";
import { createConfigureKeybindingAction } from "./module-0517.mjs";
import { CONFIGURE_DICTATION_INSTRUCTIONS_ACTION_ID, CONFIGURE_VOICE_INSTRUCTIONS_ACTION_ID } from "./module-2032.mjs";
import { addDisposableListener, getWindow } from "./module-0075.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";


// src/vs/workbench/contrib/chat/browser/speechToText/micButtonMenuActions.ts
var SELECT_MICROPHONE_COMMAND = "workbench.action.chat.selectSpeechToTextMicrophone";

var CANCEL_DICTATION_COMMAND = "workbench.action.chat.cancelSpeechToText";

var VOICE_DISCONNECT_COMMAND = "agentsVoice.disconnect";

var VOICE_OPEN_SETTINGS_COMMAND = "agentsVoice.openSettings";

var OPEN_SETTINGS_COMMAND2 = "workbench.action.openSettings";

var DICTATION_SETTINGS_QUERY2 = "dictation";

var SHOW_VOICE_MODE_ONBOARDING_COMMAND = "agentsVoice.showOnboarding";

var DICTATION_ENABLED_SETTING = "dictation.enabled";

var VOICE_ENABLED_SETTING = "agents.voice.enabled";

var VOICE_SHOW_TRANSCRIPT_SETTING = "agents.voice.showTranscript";

function createSelectMicrophoneAction(commandService) {
  return toAction({
    id: SELECT_MICROPHONE_COMMAND,
    label: localize(11650, null),
    run: () => commandService.executeCommand(SELECT_MICROPHONE_COMMAND)
  });
}

function createDisableDictationAction(commandService, configurationService) {
  return toAction({
    id: "chat.dictation.disable",
    label: localize(11646, null),
    run: async () => {
      await commandService.executeCommand(CANCEL_DICTATION_COMMAND);
      await configurationService.updateValue(DICTATION_ENABLED_SETTING, false);
    }
  });
}

function createShowDictationOnboardingAction(commandService) {
  return toAction({
    id: SHOW_DICTATION_ONBOARDING_COMMAND,
    label: localize(11649, null),
    run: () => commandService.executeCommand(SHOW_DICTATION_ONBOARDING_COMMAND)
  });
}

function createToggleButtonAction(configurationService, settingId, id2, label3) {
  const shown = configurationService.getValue(settingId) !== false;
  return toAction({
    id: id2,
    label: label3,
    checked: shown,
    run: () => configurationService.updateValue(settingId, !shown)
  });
}

function createDisableVoiceModeAction(commandService, configurationService) {
  return toAction({
    id: "chat.voiceMode.disable",
    label: localize(11653, null),
    run: async () => {
      await commandService.executeCommand(VOICE_DISCONNECT_COMMAND);
      await configurationService.updateValue(VOICE_ENABLED_SETTING, false);
    }
  });
}

function getDictationContextMenuActions(commandService, configurationService, keybindingService, keybindingCommandId) {
  return Separator.join(
    [
      createConfigureKeybindingAction(commandService, keybindingService, keybindingCommandId),
      createToggleButtonAction(configurationService, "dictation.showButton" /* ShowButton */, "chat.dictation.toggleButton", localize(11647, null)),
      createDisableDictationAction(commandService, configurationService)
    ],
    [
      createDictationSettingsAction(commandService),
      createConfigureInstructionsAction(commandService, CONFIGURE_DICTATION_INSTRUCTIONS_ACTION_ID, localize(11645, null)),
      createShowDictationOnboardingAction(commandService),
      createSelectMicrophoneAction(commandService)
    ]
  );
}

function createVoiceModeSettingsAction(commandService) {
  return toAction({
    id: VOICE_OPEN_SETTINGS_COMMAND,
    label: localize(11654, null),
    run: () => commandService.executeCommand(VOICE_OPEN_SETTINGS_COMMAND)
  });
}

function createDictationSettingsAction(commandService) {
  return toAction({
    id: "chat.dictation.openSettings",
    label: localize(11648, null),
    run: () => commandService.executeCommand(OPEN_SETTINGS_COMMAND2, { query: DICTATION_SETTINGS_QUERY2 })
  });
}

function createShowVoiceModeOnboardingAction(commandService) {
  return toAction({
    id: SHOW_VOICE_MODE_ONBOARDING_COMMAND,
    label: localize(11655, null),
    run: () => commandService.executeCommand(SHOW_VOICE_MODE_ONBOARDING_COMMAND)
  });
}

function createConfigureInstructionsAction(commandService, commandId, label3) {
  return toAction({
    id: commandId,
    label: label3,
    run: () => commandService.executeCommand(commandId)
  });
}

function createToggleTranscriptAction(configurationService) {
  const shown = configurationService.getValue(VOICE_SHOW_TRANSCRIPT_SETTING) === true;
  return toAction({
    id: "chat.voiceMode.toggleTranscript",
    label: localize(11656, null),
    checked: shown,
    run: () => configurationService.updateValue(VOICE_SHOW_TRANSCRIPT_SETTING, !shown)
  });
}

function getVoiceModeContextMenuActions(commandService, configurationService, keybindingService, keybindingCommandId) {
  return Separator.join(
    [
      createConfigureKeybindingAction(commandService, keybindingService, keybindingCommandId),
      createToggleButtonAction(configurationService, "agents.voice.showButton" /* ShowButton */, "chat.voiceMode.toggleButton", localize(11651, null)),
      createToggleTranscriptAction(configurationService),
      createDisableVoiceModeAction(commandService, configurationService)
    ],
    [
      createVoiceModeSettingsAction(commandService),
      createConfigureInstructionsAction(commandService, CONFIGURE_VOICE_INSTRUCTIONS_ACTION_ID, localize(11652, null)),
      createShowVoiceModeOnboardingAction(commandService),
      createSelectMicrophoneAction(commandService)
    ]
  );
}

function addMicButtonContextMenuListener(container2, getActions, contextMenuService) {
  return addDisposableListener(container2, "contextmenu", (e4) => {
    e4.preventDefault();
    e4.stopPropagation();
    const event = new StandardMouseEvent(getWindow(container2), e4);
    contextMenuService.showContextMenu({
      getAnchor: () => event,
      getActions
    });
  });
}
export { createSelectMicrophoneAction, createDisableDictationAction, createShowDictationOnboardingAction, createToggleButtonAction, createDisableVoiceModeAction, getDictationContextMenuActions, createVoiceModeSettingsAction, createDictationSettingsAction, createShowVoiceModeOnboardingAction, createConfigureInstructionsAction, createToggleTranscriptAction, getVoiceModeContextMenuActions, addMicButtonContextMenuListener, SELECT_MICROPHONE_COMMAND, CANCEL_DICTATION_COMMAND, VOICE_DISCONNECT_COMMAND, VOICE_OPEN_SETTINGS_COMMAND, OPEN_SETTINGS_COMMAND2, DICTATION_SETTINGS_QUERY2, SHOW_VOICE_MODE_ONBOARDING_COMMAND, DICTATION_ENABLED_SETTING, VOICE_ENABLED_SETTING, VOICE_SHOW_TRANSCRIPT_SETTING };
