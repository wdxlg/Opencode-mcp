// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatSpeechToTextActions.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { cancelDictation, isDictating, startDictation, stopDictation } from "./module-1348.mjs";
import { getActiveWindow, getWindow } from "./module-0075.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { Codicon } from "./module-0085.mjs";
import { AGENTS_VOICE_CONNECTED, AGENTS_VOICE_ENABLED } from "./module-1343.mjs";
import { SegmentedVoiceInputModePillInactive } from "./module-2077.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { NOTEBOOK_EDITOR_FOCUSED } from "./module-1844.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IChatSpeechToTextService } from "./module-1347.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILogService } from "./module-0095.mjs";
import { IDictationOnboardingService, RESET_DICTATION_ONBOARDING_COMMAND, SHOW_DICTATION_ONBOARDING_COMMAND, buildMicrophoneOptions } from "./module-2037.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IStorageService } from "./module-0512.mjs";
import { INotificationService } from "./module-0336.mjs";
import { DisposableStore } from "./module-0012.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatSpeechToTextActions.ts
var ChatSpeechToTextConfigured = ContextKeyExpr.and(ChatContextKeys.enabled, ContextKeyExpr.has(ChatContextKeys.speechToTextConfigured.key));

var ChatSpeechToTextPreparing = ContextKeyExpr.has(ChatContextKeys.speechToTextPreparing.key);

var ChatSpeechToTextMaiBackend = ContextKeyExpr.equals("config.dictation.model", "mai");

var ChatSpeechToTextButtonShown = ContextKeyExpr.notEquals(`config.${"dictation.showButton" /* ShowButton */}`, false);

var HOLD_TO_TALK_THRESHOLD_MS = 500;

function getDictationShortcutOperation(dictating, state, preparingModel) {
  if (dictating) {
    return preparingModel ? "cancel" : "stop";
  }
  return state === "idle" /* Idle */ ? "start" : void 0;
}

async function runDictationShortcut(context2, commandId, editor, startDictationFn = startDictation) {
  const { speechService, keybindingService, logService } = context2;
  switch (getDictationShortcutOperation(isDictating(), speechService.state, speechService.isPreparingModel)) {
    case "cancel":
      cancelDictation();
      return;
    case "stop":
      await stopDictation();
      return;
    case void 0:
      return;
  }
  const window2 = getWindow(editor.getDomNode()) ?? getActiveWindow();
  context2.onboardingService?.showIfNeeded();
  const holdMode = keybindingService.enableKeybindingHoldMode(commandId);
  await startDictationFn(speechService, editor, window2, logService);
  if (speechService.state === "recording" /* Recording */) {
    context2.onboardingService?.refreshMicrophones(
      speechService.analyserNode,
      (deviceId) => speechService.switchMicrophone(window2, deviceId)
    );
  }
  if (!holdMode) {
    return;
  }
  const heldFrom = Date.now();
  await holdMode;
  const heldMs = Date.now() - heldFrom;
  if (heldMs < HOLD_TO_TALK_THRESHOLD_MS) {
    return;
  }
  await stopDictation();
}

var ToggleChatSpeechToTextAction = class _ToggleChatSpeechToTextAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.toggleSpeechToText";
  }
  constructor() {
    super({
      id: _ToggleChatSpeechToTextAction.ID,
      title: localize2(8775, "Dictate (Speech to Text)"),
      category: CHAT_CATEGORY,
      icon: Codicon.micCompact,
      f1: false,
      toggled: {
        condition: ChatContextKeys.speechToTextRecording,
        icon: Codicon.micFilled,
        title: localize2(8776, "Stop Dictation").value
      },
      menu: [{
        id: MenuId.ChatExecute,
        order: -11,
        when: ContextKeyExpr.and(ChatSpeechToTextConfigured, ChatSpeechToTextButtonShown, ChatSpeechToTextPreparing.negate(), AGENTS_VOICE_CONNECTED.negate(), SegmentedVoiceInputModePillInactive),
        group: "navigation"
      }],
      keybinding: {
        // Outrank the legacy "Start Voice Chat" action, which binds the
        // same Cmd+I in the chat input at WorkbenchContrib weight. When
        // dictation is configured it should win the chord.
        weight: 200 /* WorkbenchContrib */ + 1,
        // Dedicated chord scoped to the chat input. Kept distinct from
        // Voice Mode's Cmd+Shift+Space so the two never contend.
        when: ContextKeyExpr.and(
          ChatSpeechToTextConfigured,
          ChatContextKeys.inChatInput,
          EditorContextKeys.focus.negate(),
          NOTEBOOK_EDITOR_FOCUSED.negate()
        ),
        primary: 2048 /* CtrlCmd */ | 39 /* KeyI */
      }
    });
  }
  async run(accessor, ...args2) {
    const context2 = args2[0];
    const widgetService = accessor.get(IChatWidgetService);
    const widget = context2?.widget ?? widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    await runDictationShortcut({
      speechService: accessor.get(IChatSpeechToTextService),
      keybindingService: accessor.get(IKeybindingService),
      logService: accessor.get(ILogService),
      onboardingService: accessor.get(IDictationOnboardingService)
    }, _ToggleChatSpeechToTextAction.ID, widget.inputEditor);
  }
};

var ChatSpeechToTextPreparingAction = class _ChatSpeechToTextPreparingAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.speechToTextPreparing";
  }
  constructor() {
    super({
      id: _ChatSpeechToTextPreparingAction.ID,
      title: localize2(8771, "Preparing Speech to Text Model\u2026"),
      category: CHAT_CATEGORY,
      f1: false,
      icon: Codicon.micDownloadCompact,
      precondition: ChatSpeechToTextPreparing,
      menu: [{
        id: MenuId.ChatExecute,
        order: -11,
        when: ContextKeyExpr.and(ChatSpeechToTextConfigured, ChatSpeechToTextButtonShown, ChatSpeechToTextPreparing, ChatSpeechToTextMaiBackend.negate(), AGENTS_VOICE_CONNECTED.negate(), SegmentedVoiceInputModePillInactive),
        group: "navigation"
      }]
    });
  }
  async run() {
    if (isDictating()) {
      cancelDictation();
    }
  }
};

var ChatSpeechToTextConnectingAction = class _ChatSpeechToTextConnectingAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.speechToTextConnecting";
  }
  constructor() {
    super({
      id: _ChatSpeechToTextConnectingAction.ID,
      title: localize2(8769, "Connecting to Speech to Text\u2026"),
      category: CHAT_CATEGORY,
      f1: false,
      icon: Codicon.loadingCompact,
      precondition: ChatSpeechToTextPreparing,
      menu: [{
        id: MenuId.ChatExecute,
        order: -11,
        when: ContextKeyExpr.and(ChatSpeechToTextConfigured, ChatSpeechToTextButtonShown, ChatSpeechToTextPreparing, ChatSpeechToTextMaiBackend, AGENTS_VOICE_CONNECTED.negate(), SegmentedVoiceInputModePillInactive),
        group: "navigation"
      }]
    });
  }
  async run() {
    if (isDictating()) {
      cancelDictation();
    }
  }
};

var HoldToSpeechToTextAction = class _HoldToSpeechToTextAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.holdToSpeechToText";
  }
  constructor() {
    super({
      id: _HoldToSpeechToTextAction.ID,
      title: localize2(8770, "Hold to Dictate (Speech to Text)"),
      category: CHAT_CATEGORY,
      f1: false
    });
  }
  async run(accessor, ...args2) {
    const context2 = args2[0];
    const widgetService = accessor.get(IChatWidgetService);
    const speechService = accessor.get(IChatSpeechToTextService);
    const keybindingService = accessor.get(IKeybindingService);
    const widget = context2?.widget ?? widgetService.lastFocusedWidget;
    if (!widget || speechService.state !== "idle" /* Idle */) {
      return;
    }
    const holdMode = keybindingService.enableKeybindingHoldMode(_HoldToSpeechToTextAction.ID);
    if (!holdMode) {
      return;
    }
    const window2 = getWindow(widget.domNode) ?? getActiveWindow();
    const heldFrom = Date.now();
    await startDictation(speechService, widget.inputEditor, window2, accessor.get(ILogService));
    await holdMode;
    if (Date.now() - heldFrom < HOLD_TO_TALK_THRESHOLD_MS) {
      cancelDictation();
      return;
    }
    await stopDictation();
  }
};

var SelectSpeechToTextMicrophoneAction = class _SelectSpeechToTextMicrophoneAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.selectSpeechToTextMicrophone";
  }
  constructor() {
    super({
      id: _SelectSpeechToTextMicrophoneAction.ID,
      title: localize2(8773, "Select Microphone"),
      category: CHAT_CATEGORY,
      f1: true,
      // Shared by dictation and Voice Mode (both persist to the same
      // device), so stay available whenever either feature is enabled.
      precondition: ContextKeyExpr.or(ChatSpeechToTextConfigured, AGENTS_VOICE_ENABLED)
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const storageService = accessor.get(IStorageService);
    const devices = await navigator.mediaDevices.enumerateDevices();
    if (!devices.some((device) => device.kind === "audioinput")) {
      quickInputService.pick([{ label: localize(8779, null) }]);
      return;
    }
    const currentDeviceId = storageService.get("agentsVoice.microphoneDevice" /* MicrophoneDevice */, -1 /* APPLICATION */, "");
    const items = buildMicrophoneOptions(devices).map((device) => ({
      label: device.label,
      description: device.deviceId === currentDeviceId ? localize(8777, null) : void 0,
      deviceId: device.deviceId
    }));
    const picked = await quickInputService.pick(items, {
      placeHolder: localize(8780, null)
    });
    if (picked) {
      const selection = picked;
      if (selection.deviceId) {
        storageService.store("agentsVoice.microphoneDevice" /* MicrophoneDevice */, selection.deviceId, -1 /* APPLICATION */, 1 /* MACHINE */);
      } else {
        storageService.remove("agentsVoice.microphoneDevice" /* MicrophoneDevice */, -1 /* APPLICATION */);
      }
    }
  }
};

var ShowChatSpeechToTextIntroductionAction = class _ShowChatSpeechToTextIntroductionAction extends Action2 {
  static {
    this.ID = SHOW_DICTATION_ONBOARDING_COMMAND;
  }
  constructor() {
    super({
      id: _ShowChatSpeechToTextIntroductionAction.ID,
      title: localize2(8774, "Dictate: Show Introduction"),
      category: CHAT_CATEGORY,
      f1: true,
      precondition: ChatSpeechToTextConfigured
    });
  }
  async run(accessor) {
    const onboardingService = accessor.get(IDictationOnboardingService);
    if (onboardingService.show()) {
      return;
    }
    accessor.get(INotificationService).info(localize(8778, null));
  }
};

var ResetChatSpeechToTextIntroductionAction = class extends Action2 {
  constructor() {
    super({
      id: RESET_DICTATION_ONBOARDING_COMMAND,
      title: localize2(8772, "Dictate: Reset Onboarding"),
      category: CHAT_CATEGORY,
      f1: true,
      precondition: ChatSpeechToTextConfigured
    });
  }
  run(accessor) {
    accessor.get(IDictationOnboardingService).reset();
  }
};

var CancelChatSpeechToTextAction = class _CancelChatSpeechToTextAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.cancelSpeechToText";
  }
  constructor() {
    super({
      id: _CancelChatSpeechToTextAction.ID,
      title: localize2(8768, "Cancel Dictation (Speech to Text)"),
      category: CHAT_CATEGORY,
      f1: false,
      keybinding: {
        // Escape aborts an in-progress dictation, discarding what was
        // recorded. Scoped to the chat input while recording and ranked
        // above the input's other Escape handlers so it wins the chord.
        weight: 200 /* WorkbenchContrib */ + 1,
        when: ContextKeyExpr.and(
          ChatContextKeys.speechToTextRecording,
          ChatContextKeys.inChatInput
        ),
        primary: 9 /* Escape */
      }
    });
  }
  async run() {
    if (isDictating()) {
      cancelDictation();
    }
  }
};

function registerChatSpeechToTextActions() {
  const store = new DisposableStore();
  store.add(registerAction2(ToggleChatSpeechToTextAction));
  store.add(registerAction2(ChatSpeechToTextPreparingAction));
  store.add(registerAction2(ChatSpeechToTextConnectingAction));
  store.add(registerAction2(HoldToSpeechToTextAction));
  store.add(registerAction2(CancelChatSpeechToTextAction));
  store.add(registerAction2(ShowChatSpeechToTextIntroductionAction));
  store.add(registerAction2(ResetChatSpeechToTextIntroductionAction));
  store.add(registerAction2(SelectSpeechToTextMicrophoneAction));
  return store;
}
export { getDictationShortcutOperation, runDictationShortcut, registerChatSpeechToTextActions, ChatSpeechToTextConfigured, ChatSpeechToTextPreparing, ChatSpeechToTextMaiBackend, ChatSpeechToTextButtonShown, HOLD_TO_TALK_THRESHOLD_MS, ToggleChatSpeechToTextAction, ChatSpeechToTextPreparingAction, ChatSpeechToTextConnectingAction, HoldToSpeechToTextAction, SelectSpeechToTextMicrophoneAction, ShowChatSpeechToTextIntroductionAction, ResetChatSpeechToTextIntroductionAction, CancelChatSpeechToTextAction };
