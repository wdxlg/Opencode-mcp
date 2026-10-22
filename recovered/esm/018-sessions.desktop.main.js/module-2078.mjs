// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/voiceInputMode/voiceInputModeActionViewItem.ts
import { URI } from "./module-0032.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { SegmentedVoiceInputModePillActive } from "./module-2077.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { AGENTS_VOICE_ENABLED } from "./module-1343.mjs";
import { IVoiceSessionController } from "./module-2070.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IChatSpeechToTextService, isDictationActiveOnSurface } from "./module-1347.mjs";
import { $, EventHelper, EventType, addDisposableGenericMouseDownListener, addDisposableGenericMouseUpListener, addDisposableListener, addStandardDisposableListener, append, getActiveWindow, getWindow } from "./module-0075.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IsDevelopmentContext } from "./module-0635.mjs";
import { IVoiceInputModeService } from "./module-2076.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { resolveVoiceGlowColors } from "./module-2058.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { DictationDownloadRing, getDictationDownloadHoverContent, getDictationPreparingLabel } from "./module-2073.mjs";
import { getDictationHoverContent, getVoiceModeHoverContent } from "./module-2074.mjs";
import { addMicButtonContextMenuListener, getDictationContextMenuActions, getVoiceModeContextMenuActions } from "./module-2075.mjs";
import { setupDictationMicGlow } from "./module-2072.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IMicCaptureService } from "./module-1345.mjs";
import { ITtsPlaybackService } from "./module-2063.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/workbench/contrib/chat/browser/voiceInputMode/voiceInputModeActionViewItem.ts
var DICTATION_TOGGLE_COMMAND_ID = "workbench.action.chat.toggleSpeechToText";

var VOICE_START_COMMAND_ID = "agentsVoice.startVoiceInChat";

async function retargetVoiceToCurrentSession(commandService, controller) {
  const currentSession = await commandService.executeCommand("_chat.voice.getCurrentSession");
  if (!currentSession) {
    return false;
  }
  try {
    const resource = URI.parse(currentSession);
    if (resource.scheme === "sessions-voice") {
      controller.setDraftTarget();
    } else {
      controller.setTargetSession(resource);
      controller.activateSession(resource);
    }
    return true;
  } catch {
    return false;
  }
}

var WAVEFORM_BAR_COUNT = 4;

var WAVEFORM_BAR_MIN_HEIGHT = 2;

var WAVEFORM_BAR_MAX_HEIGHT = 12;

var ChatVoiceInputModeAction = class _ChatVoiceInputModeAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.voiceInputMode";
  }
  constructor() {
    super({
      id: _ChatVoiceInputModeAction.ID,
      title: localize2(11845, "Voice Input Mode"),
      icon: Codicon.micCompact,
      precondition: SegmentedVoiceInputModePillActive,
      menu: {
        id: MenuId.ChatExecute,
        when: ContextKeyExpr.and(
          SegmentedVoiceInputModePillActive,
          ChatContextKeys.location.isEqualTo("panel" /* Chat */),
          ChatContextKeys.currentlyEditing.negate()
        ),
        group: "navigation",
        order: -11
      }
    });
  }
  run(_accessor) {
  }
};

var ChatVoiceInputModeToggleListenAction = class _ChatVoiceInputModeToggleListenAction extends Action2 {
  constructor() {
    super({
      id: _ChatVoiceInputModeToggleListenAction.ID,
      title: localize2(11851, "Voice Mode: Hold to Talk"),
      // A hold-only action cannot be invoked safely from the Command Palette: a
      // mouse click produces no key-up (leaving the turn pending) and a keyboard
      // invocation creates an immediate empty turn. Keep it keybinding-only.
      f1: false,
      precondition: AGENTS_VOICE_ENABLED,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 10 /* Space */,
        when: ContextKeyExpr.and(
          AGENTS_VOICE_ENABLED,
          ChatContextKeys.inChatInput
        )
      }
    });
    this._holdActive = false;
  }
  static {
    this.ID = "workbench.action.chat.voiceInputMode.holdToTalk";
  }
  async run(accessor) {
    if (this._holdActive) {
      return;
    }
    const controller = accessor.get(IVoiceSessionController);
    const keybindingService = accessor.get(IKeybindingService);
    const speechToText = accessor.get(IChatSpeechToTextService);
    if (speechToText.state !== "idle" /* Idle */) {
      speechToText.cancel();
    }
    const holdMode = keybindingService.enableKeybindingHoldMode(_ChatVoiceInputModeToggleListenAction.ID);
    const win = getActiveWindow();
    let keyReleased = false;
    const releaseListener = addDisposableListener(win, EventType.KEY_UP, () => {
      keyReleased = true;
    });
    this._holdActive = true;
    try {
      await retargetVoiceToCurrentSession(accessor.get(ICommandService), controller);
      if (!controller.isConnected.get() && !controller.isConnecting.get()) {
        await controller.connect(win);
      }
      if (keyReleased) {
        return;
      }
      if (controller.isConnected.get()) {
        controller.pttDown("explicit", true);
        if (holdMode) {
          await holdMode;
        } else if (!keyReleased) {
          await new Promise((resolve3) => {
            const l = addDisposableListener(win, EventType.KEY_UP, () => {
              l.dispose();
              resolve3();
            });
          });
        }
        controller.pttUp("explicit", true);
      }
    } finally {
      releaseListener.dispose();
      this._holdActive = false;
    }
  }
};

var SIMULATE_STATES = [
  { id: "off", label: "Off (Disconnected)", state: "off" },
  { id: "connecting", label: "Connecting", state: "connecting" },
  { id: "idle", label: "Connected (Idle)", state: "idle" },
  { id: "listening", label: "Listening", state: "listening" },
  { id: "speaking", label: "Speaking", state: "speaking" },
  { id: "dictating", label: "Dictating", state: "dictating" }
];

function registerVoiceInputModeSimulateActions() {
  const VERSIONS = [
    { version: "handsFree", label: "v4 \u2014 Hands-Free (Auto-Listen)" },
    { version: "keyboardHold", label: "v1 \u2014 Keyboard Hold-to-Talk (Walkie-Talkie)" },
    { version: "buttonHold", label: "v2 \u2014 Button Hold-to-Talk" },
    { version: "clickToggle", label: "v3 \u2014 Button Click-to-Toggle Listening" }
  ];
  for (const { version: version2, label: label3 } of VERSIONS) {
    registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.action.chat.voiceInputMode.simulate.walkthrough.${version2}`,
          title: { value: `Voice Input Mode: Prototype Walkthrough \u2014 ${label3}`, original: `Voice Input Mode: Prototype Walkthrough \u2014 ${label3}` },
          category: { value: "Developer", original: "Developer" },
          precondition: IsDevelopmentContext,
          f1: true
        });
      }
      run(accessor) {
        accessor.get(IVoiceInputModeService).startVoiceStateWalkthrough(version2);
      }
    });
  }
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.voiceInputMode.simulate.step",
        title: { value: "Voice Input Mode: Prototype Step (Next State)", original: "Voice Input Mode: Prototype Step (Next State)" },
        category: { value: "Developer", original: "Developer" },
        precondition: IsDevelopmentContext,
        f1: true
      });
    }
    run(accessor) {
      accessor.get(IVoiceInputModeService).stepVoiceStateWalkthrough();
    }
  });
  registerAction2(class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.voiceInputMode.simulate.clear",
        title: { value: "Voice Input Mode: Simulate \u2014 Clear", original: "Voice Input Mode: Simulate \u2014 Clear" },
        category: { value: "Developer", original: "Developer" },
        precondition: IsDevelopmentContext,
        f1: true
      });
    }
    run(accessor) {
      accessor.get(IVoiceInputModeService).clearSimulation();
    }
  });
  for (const { id: id2, label: label3, state } of SIMULATE_STATES) {
    registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.action.chat.voiceInputMode.simulate.${id2}`,
          // Dev-only utility — not localized.
          title: { value: `Voice Input Mode: Simulate \u2014 ${label3}`, original: `Voice Input Mode: Simulate \u2014 ${label3}` },
          category: { value: "Developer", original: "Developer" },
          precondition: IsDevelopmentContext,
          f1: true
        });
      }
      run(accessor) {
        accessor.get(IVoiceInputModeService).setSimulatedVoiceState(state);
      }
    });
  }
}

var VoiceInputModeActionViewItem = class extends BaseActionViewItem {
  constructor(action, _options, voiceInputModeService, voiceSessionController, commandService, configurationService, keybindingService, contextMenuService, hoverService, micCaptureService, ttsPlaybackService, chatSpeechToTextService, accessibilityService, themeService) {
    super(void 0, action);
    this._options = _options;
    this.voiceInputModeService = voiceInputModeService;
    this.voiceSessionController = voiceSessionController;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.keybindingService = keybindingService;
    this.contextMenuService = contextMenuService;
    this.hoverService = hoverService;
    this.micCaptureService = micCaptureService;
    this.ttsPlaybackService = ttsPlaybackService;
    this.chatSpeechToTextService = chatSpeechToTextService;
    this.accessibilityService = accessibilityService;
    this.themeService = themeService;
    this._voiceBarEls = [];
    this._voiceHovering = false;
    this._voiceLive = false;
    this._listenHoldListening = false;
    this._listenHoldGesture = false;
    this._listenSuppressClick = false;
    this._listenPointerUp = this._register(new MutableDisposable());
    // Progress ring shown over the dictation glyph during an actual on-disk
    // model download (cache miss), mirroring the standalone toolbar button.
    this._dictationRing = this._register(new MutableDisposable());
  }
  _getLabelWithKeybinding(label3, commandId) {
    return this.keybindingService.appendKeybinding(label3, commandId);
  }
  _updateAriaLabels() {
    this._dictationCell?.setAttribute("aria-label", this._dictationCell.classList.contains("preparing") ? localize(11848, null) : this._getLabelWithKeybinding(localize(11847, null), DICTATION_TOGGLE_COMMAND_ID));
    this._voiceCell?.setAttribute("aria-label", this._voiceCell.classList.contains("connecting") ? localize(11846, null) : this._voiceCell.classList.contains("on") ? localize(11850, null) : this._getLabelWithKeybinding(localize(11857, null), VOICE_START_COMMAND_ID));
    this._listenCell?.setAttribute("aria-label", this._listenCell.classList.contains("active") ? this._getLabelWithKeybinding(localize(11855, null), ChatVoiceInputModeToggleListenAction.ID) : this._getLabelWithKeybinding(localize(11853, null), ChatVoiceInputModeToggleListenAction.ID));
    this._muteCell?.setAttribute("aria-label", this._muteCell.classList.contains("active") ? localize(11856, null) : localize(11852, null));
  }
  /** Set the per-state pill/waveform colors from the theme-derived voice accent. */
  _updateVoiceStateColors(container2) {
    const colors = resolveVoiceGlowColors(this.themeService.getColorTheme());
    container2.style.setProperty("--voice-color-listening", colors.listening.toString());
    container2.style.setProperty("--voice-color-speaking", colors.speaking.toString());
  }
  render(container2) {
    super.render(container2);
    container2.classList.add("monaco-segmented-icon-toggle-container", "chat-voice-input-mode-item");
    this._updateVoiceStateColors(container2);
    this._register(this.themeService.onDidColorThemeChange(() => this._updateVoiceStateColors(container2)));
    const pill = append(container2, $(".monaco-segmented-icon-toggle.chat-voice-input-mode"));
    this._reel = append(pill, $(".monaco-segmented-icon-toggle-reel.chat-voice-input-mode-reel"));
    this._dictationCell = append(this._reel, $("button.monaco-segmented-icon-toggle-cell.chat-voice-input-mode-cell.dictation"));
    this._dictationCell.setAttribute("type", "button");
    this._dictationCell.setAttribute("role", "button");
    this._dictationIcon = append(this._dictationCell, $("span.chat-voice-input-mode-icon"));
    this._register(this.hoverService.setupManagedHover(
      getDefaultHoverDelegate("element"),
      this._dictationCell,
      () => (this._options?.isDictationActive?.get() ?? this._options?.isActive?.get() ?? true) && this.chatSpeechToTextService.isPreparingModel ? getDictationDownloadHoverContent(this.chatSpeechToTextService) : getDictationHoverContent(this._getLabelWithKeybinding(localize(11847, null), DICTATION_TOGGLE_COMMAND_ID), this.configurationService)
    ));
    this._register(addDisposableListener(this._dictationCell, EventType.CLICK, (e4) => {
      EventHelper.stop(e4, true);
      this._onClickDictation();
    }));
    this._registerActivationKeys(this._dictationCell, () => this._onClickDictation());
    this._register(addMicButtonContextMenuListener(
      this._dictationCell,
      () => getDictationContextMenuActions(this.commandService, this.configurationService, this.keybindingService, DICTATION_TOGGLE_COMMAND_ID),
      this.contextMenuService
    ));
    this._register(setupDictationMicGlow(this._dictationCell, this.chatSpeechToTextService, this.accessibilityService, this._options?.isDictationActive ?? this._options?.isActive, this.themeService));
    this._voiceCell = append(this._reel, $("button.monaco-segmented-icon-toggle-cell.chat-voice-input-mode-cell.voice"));
    this._voiceCell.setAttribute("type", "button");
    this._voiceCell.setAttribute("role", "button");
    this._voiceBars = append(this._voiceCell, $("span.chat-voice-input-mode-bars"));
    append(this._voiceCell, $(`span.chat-voice-input-mode-icon.chat-voice-input-mode-spinner${ThemeIcon.asCSSSelector(Codicon.loadingCompact)}`));
    for (let i2 = 0; i2 < WAVEFORM_BAR_COUNT; i2++) {
      this._voiceBarEls.push(append(this._voiceBars, $("span.chat-voice-input-mode-bar")));
    }
    this._register(this.hoverService.setupManagedHover(
      getDefaultHoverDelegate("element"),
      this._voiceCell,
      () => {
        const ownsVoice = this._options?.isVoiceActive?.get() ?? this._options?.isActive?.get() ?? true;
        const connectedish = ownsVoice && (this.voiceSessionController.isConnected.get() || this.voiceSessionController.isConnecting.get()) || this.voiceInputModeService.simulatedVoiceState.get() === "idle" || this.voiceInputModeService.simulatedVoiceState.get() === "listening" || this.voiceInputModeService.simulatedVoiceState.get() === "speaking";
        return getVoiceModeHoverContent(connectedish ? localize(11850, null) : this._getLabelWithKeybinding(localize(11857, null), VOICE_START_COMMAND_ID));
      }
    ));
    this._register(addDisposableListener(this._voiceCell, EventType.CLICK, (e4) => {
      EventHelper.stop(e4, true);
      void this._onClickVoicePowerToggle();
    }));
    this._registerActivationKeys(this._voiceCell, () => this._onClickVoicePowerToggle());
    this._register(addMicButtonContextMenuListener(
      this._voiceCell,
      () => getVoiceModeContextMenuActions(this.commandService, this.configurationService, this.keybindingService, VOICE_START_COMMAND_ID),
      this.contextMenuService
    ));
    this._register(addDisposableListener(this._voiceCell, EventType.MOUSE_ENTER, () => {
      this._voiceHovering = true;
      this._stopBarAnimation();
    }));
    this._register(addDisposableListener(this._voiceCell, EventType.MOUSE_LEAVE, () => {
      this._voiceHovering = false;
      this._syncBarAnimation();
    }));
    this._listenCell = append(this._reel, $("button.monaco-segmented-icon-toggle-cell.chat-voice-input-mode-cell.listen"));
    this._listenCell.setAttribute("type", "button");
    this._listenCell.setAttribute("role", "button");
    this._listenIcon = append(this._listenCell, $("span.chat-voice-input-mode-icon"));
    this._updateAriaLabels();
    this._register(this.keybindingService.onDidUpdateKeybindings(() => this._updateAriaLabels()));
    this._register(addMicButtonContextMenuListener(
      this._listenCell,
      () => getVoiceModeContextMenuActions(this.commandService, this.configurationService, this.keybindingService, VOICE_START_COMMAND_ID),
      this.contextMenuService
    ));
    this._register(this.hoverService.setupManagedHover(
      getDefaultHoverDelegate("element"),
      this._listenCell,
      () => this.voiceSessionController.voiceState.get() === "listening" ? this._getLabelWithKeybinding(localize(11855, null), ChatVoiceInputModeToggleListenAction.ID) : this._getLabelWithKeybinding(localize(11854, null), ChatVoiceInputModeToggleListenAction.ID)
    ));
    this._register(addDisposableGenericMouseDownListener(this._listenCell, (e4) => {
      if (e4.button !== 0) {
        return;
      }
      this._onListenPointerDown();
    }));
    this._register(addDisposableListener(this._listenCell, EventType.CLICK, (e4) => {
      EventHelper.stop(e4, true);
      if (this._listenSuppressClick) {
        this._listenSuppressClick = false;
        return;
      }
      this._onClickListen();
    }));
    this._registerActivationKeys(this._listenCell, () => this._onClickListen());
    this._muteCell = append(this._reel, $("button.monaco-segmented-icon-toggle-cell.chat-voice-input-mode-cell.mute"));
    this._muteCell.setAttribute("type", "button");
    this._muteCell.setAttribute("role", "button");
    this._muteIcon = append(this._muteCell, $("span.chat-voice-input-mode-icon"));
    this._register(addMicButtonContextMenuListener(
      this._muteCell,
      () => getVoiceModeContextMenuActions(this.commandService, this.configurationService, this.keybindingService, VOICE_START_COMMAND_ID),
      this.contextMenuService
    ));
    this._register(this.hoverService.setupManagedHover(
      getDefaultHoverDelegate("element"),
      this._muteCell,
      () => this.voiceSessionController.isMuted.get() ? localize(11856, null) : localize(11852, null)
    ));
    this._register(addDisposableListener(this._muteCell, EventType.CLICK, (e4) => {
      EventHelper.stop(e4, true);
      this._onClickMute();
    }));
    this._registerActivationKeys(this._muteCell, () => this._onClickMute());
    const dictationActive = observableFromEvent(
      this,
      this.chatSpeechToTextService.onDidChangeState,
      () => isDictationActiveOnSurface(this.chatSpeechToTextService, "chat") && this.chatSpeechToTextService.state !== "idle" /* Idle */
    );
    const dictationPreparing = observableFromEvent(
      this,
      this.chatSpeechToTextService.onDidChangePreparingModel,
      () => this.chatSpeechToTextService.currentSurface === "chat" && this.chatSpeechToTextService.isPreparingModel
    );
    const dictationDownloading = observableFromEvent(
      this,
      this.chatSpeechToTextService.onDidChangeDownloadingModel,
      () => this.chatSpeechToTextService.isDownloadingModel
    );
    this._register(autorun((reader) => {
      const dictationAvailable = this.voiceInputModeService.dictationAvailable.read(reader);
      const voiceAvailable = this.voiceInputModeService.voiceAvailable.read(reader);
      const simHandsFree = this.voiceInputModeService.simulatedHandsFree.read(reader);
      const handsFree = simHandsFree ?? this.voiceInputModeService.handsFree.read(reader);
      const sim = this.voiceInputModeService.simulatedVoiceState.read(reader);
      const isActive2 = sim !== void 0 || (this._options?.isActive?.read(reader) ?? true);
      const isDictationActive = sim !== void 0 || (this._options?.isDictationActive?.read(reader) ?? isActive2);
      const isVoiceActive = sim !== void 0 || (this._options?.isVoiceActive?.read(reader) ?? isActive2);
      let isDictating2;
      let connected;
      let connecting;
      let listening;
      let speaking;
      if (sim !== void 0) {
        isDictating2 = sim === "dictating";
        connecting = sim === "connecting";
        connected = sim === "idle" || sim === "listening" || sim === "speaking";
        listening = sim === "listening";
        speaking = sim === "speaking";
      } else {
        isDictating2 = isDictationActive && dictationActive.read(reader);
        connected = isVoiceActive && this.voiceSessionController.isConnected.read(reader);
        connecting = isVoiceActive && (this.voiceSessionController.isConnecting.read(reader) || this.voiceSessionController.isReconnecting.read(reader));
        const voiceState = this.voiceSessionController.voiceState.read(reader);
        listening = connected && voiceState === "listening";
        speaking = connected && voiceState === "speaking";
      }
      const muted = sim === void 0 && connected && this.voiceSessionController.isMuted.read(reader);
      const micListening = listening && !muted;
      const voiceLive = micListening || speaking;
      const voiceOn = connected || connecting;
      this._voiceLive = voiceLive;
      const dictationBusy = sim === void 0 && isDictationActive && dictationPreparing.read(reader);
      const showListen = connected && !handsFree;
      const showMute = connected && handsFree;
      const dictationPresent = dictationAvailable && !voiceOn;
      const voicePresent = voiceAvailable && !isDictating2 && !dictationBusy;
      const listenPresent = showListen;
      const mutePresent = showMute;
      const presentCount = (dictationPresent ? 1 : 0) + (voicePresent ? 1 : 0) + (listenPresent ? 1 : 0) + (mutePresent ? 1 : 0);
      container2.classList.toggle("connected", voiceOn);
      container2.classList.toggle("single", presentCount === 1);
      this._dictationCell.classList.toggle("collapsed", !dictationPresent);
      this._dictationCell.classList.toggle("active", isDictating2 || dictationBusy);
      this._dictationCell.classList.toggle("preparing", dictationBusy);
      this._dictationCell.setAttribute("aria-pressed", String(isDictating2));
      this._dictationCell.setAttribute("aria-label", dictationBusy ? localize(11849, null, getDictationPreparingLabel(this.chatSpeechToTextService)) : localize(11847, null));
      const dictationIcon = dictationBusy ? dictationDownloading.read(reader) ? Codicon.micDownloadCompact : Codicon.loadingCompact : isDictating2 ? Codicon.micFilled : Codicon.micCompact;
      this._dictationIcon.className = `chat-voice-input-mode-icon ${ThemeIcon.asClassName(dictationIcon)}`;
      if (dictationBusy && dictationDownloading.read(reader)) {
        if (!this._dictationRing.value) {
          this._dictationRing.value = new DictationDownloadRing(this._dictationCell, this.chatSpeechToTextService);
        }
      } else {
        this._dictationRing.clear();
      }
      this._voiceCell.classList.toggle("collapsed", !voicePresent);
      this._voiceCell.classList.toggle("on", voiceOn);
      this._voiceCell.classList.toggle("connecting", connecting && !connected);
      this._voiceCell.classList.toggle("idle-on", voiceOn && !voiceLive);
      this._voiceCell.classList.toggle("listening", micListening);
      this._voiceCell.classList.toggle("speaking", speaking);
      this._voiceCell.setAttribute("aria-pressed", String(voiceOn));
      this._voiceCell.classList.toggle("sim-hover", this.voiceInputModeService.simulatedHover.read(reader));
      this._listenCell.classList.toggle("collapsed", !listenPresent);
      this._listenCell.classList.toggle("active", listening);
      this._listenCell.classList.toggle("muted", !listening);
      this._listenCell.setAttribute("aria-pressed", String(listening));
      this._listenIcon.className = `chat-voice-input-mode-icon ${ThemeIcon.asClassName(listening ? Codicon.personVoiceFilledCompact : Codicon.personVoiceCompact)}`;
      this._muteCell.classList.toggle("collapsed", !mutePresent);
      this._muteCell.classList.toggle("active", muted);
      this._muteCell.setAttribute("aria-pressed", String(muted));
      this._muteIcon.className = `chat-voice-input-mode-icon ${ThemeIcon.asClassName(muted ? Codicon.micCompact : Codicon.micOffCompact)}`;
      this._updateAriaLabels();
      this._syncBarAnimation();
    }));
    this._register({ dispose: () => this._stopBarAnimation() });
    this._register(this.accessibilityService.onDidChangeReducedMotion(() => {
      this._stopBarAnimation();
      this._syncBarAnimation();
    }));
  }
  /** Start or stop the audio-reactive bar loop based on live + hover state. */
  _syncBarAnimation() {
    if (this._voiceLive && !this._voiceHovering) {
      this._startBarAnimation();
    } else {
      this._stopBarAnimation();
    }
  }
  /**
   * Animate the waveform bars from live audio. Uses the mic analyser while listening
   * and the TTS analyser while the assistant speaks. When no analyser is available
   * (e.g. reduced motion or pre-capture), the CSS keyframe fallback drives the bars.
   */
  _startBarAnimation() {
    if (this._barAnimationFrame !== void 0) {
      return;
    }
    if (this.accessibilityService.isMotionReduced()) {
      for (const bar of this._voiceBarEls) {
        bar.style.animation = "none";
        bar.style.removeProperty("height");
      }
      return;
    }
    const win = getWindow(this._voiceCell);
    const tick = () => {
      this._barAnimationFrame = win.requestAnimationFrame(tick);
      const analyser = this.voiceSessionController.voiceState.get() === "speaking" ? this.ttsPlaybackService.analyserNode : this.micCaptureService.analyserNode;
      if (!analyser) {
        for (const bar of this._voiceBarEls) {
          bar.style.removeProperty("height");
          bar.style.removeProperty("animation");
        }
        return;
      }
      if (!this._barData || this._barData.length !== analyser.frequencyBinCount) {
        this._barData = new Uint8Array(analyser.frequencyBinCount);
      }
      analyser.getByteFrequencyData(this._barData);
      const bins = this._barData.length;
      const step = Math.max(1, Math.floor(bins / this._voiceBarEls.length));
      for (let i2 = 0; i2 < this._voiceBarEls.length; i2++) {
        let sum2 = 0;
        for (let j = 0; j < step; j++) {
          sum2 += this._barData[Math.min(bins - 1, i2 * step + j)];
        }
        const intensity = Math.min(1, sum2 / step / 180);
        const heightPx = WAVEFORM_BAR_MIN_HEIGHT + intensity * (WAVEFORM_BAR_MAX_HEIGHT - WAVEFORM_BAR_MIN_HEIGHT);
        this._voiceBarEls[i2].style.animation = "none";
        this._voiceBarEls[i2].style.height = `${heightPx}px`;
      }
    };
    this._barAnimationFrame = win.requestAnimationFrame(tick);
  }
  _stopBarAnimation() {
    if (this._barAnimationFrame !== void 0 && this._voiceCell) {
      getWindow(this._voiceCell).cancelAnimationFrame(this._barAnimationFrame);
    }
    this._barAnimationFrame = void 0;
    for (const bar of this._voiceBarEls) {
      bar.style.removeProperty("height");
      bar.style.removeProperty("animation");
    }
  }
  /**
   * Toggle built-in on-device dictation. By default this runs the shared
   * {@link DICTATION_TOGGLE_COMMAND_ID} command (which targets the last focused
   * chat widget); a host that isn't an `IChatWidget` (e.g. the agents-window
   * composer) can inject its own toggle via {@link IVoiceInputModePillOptions}.
   */
  _toggleDictation() {
    if (this._options?.toggleDictation) {
      this._options.toggleDictation();
    } else {
      this.commandService.executeCommand(DICTATION_TOGGLE_COMMAND_ID);
    }
  }
  /**
   * Activate a segmented cell from the keyboard. The cells live inside a toolbar's
   * `ActionBar`, whose key handler runs the (no-op) placeholder action on Enter/Space
   * and calls `preventDefault`/`stopPropagation`, which would otherwise swallow the
   * native button activation. Handle Enter/Space here and stop the event before it
   * bubbles to the ActionBar so the focused cell's own gesture runs.
   */
  _registerActivationKeys(cell, handler) {
    this._register(addStandardDisposableListener(cell, EventType.KEY_DOWN, (e4) => {
      if (e4.equals(3 /* Enter */) || e4.equals(10 /* Space */)) {
        e4.preventDefault();
        e4.stopPropagation();
      }
    }));
    this._register(addStandardDisposableListener(cell, EventType.KEY_UP, (e4) => {
      if (e4.equals(3 /* Enter */) || e4.equals(10 /* Space */)) {
        e4.preventDefault();
        e4.stopPropagation();
        handler();
      }
    }));
  }
  _onClickDictation() {
    this.voiceInputModeService.setSelectedMode("dictation");
    if (this.voiceSessionController.isConnected.get() || this.voiceSessionController.isConnecting.get()) {
      this.voiceSessionController.disconnect();
    }
    this._toggleDictation();
  }
  /** The voice button connects or disconnects; hands-free mode starts listening after connect. */
  async _onClickVoicePowerToggle() {
    this.voiceInputModeService.setSelectedMode("voice");
    if (this.chatSpeechToTextService.state !== "idle" /* Idle */) {
      this._toggleDictation();
    }
    const controller = this.voiceSessionController;
    const targetWindow = getWindow(this._voiceCell);
    if (controller.isConnected.get() || controller.isConnecting.get()) {
      if (this._options?.isVoiceActive?.get() === false) {
        await retargetVoiceToCurrentSession(this.commandService, controller);
        return;
      }
      controller.disconnect();
    } else {
      await retargetVoiceToCurrentSession(this.commandService, controller);
      controller.connect(targetWindow).catch(() => {
      });
    }
  }
  /** Tap the listen cell to toggle listening on and off. */
  _onClickListen() {
    const controller = this.voiceSessionController;
    if (!controller.isConnected.get()) {
      return;
    }
    if (controller.voiceState.get() === "listening") {
      controller.stopListening();
    } else {
      controller.pttDown();
      controller.pttUp();
    }
  }
  _onClickMute() {
    const controller = this.voiceSessionController;
    if (controller.isConnected.get()) {
      controller.setMuted(!controller.isMuted.get());
    }
  }
  static {
    /** Threshold (ms) separating a quick tap (toggle) from a press-and-hold (talk). */
    this.HOLD_THRESHOLD_MS = 180;
  }
  _onListenPointerDown() {
    const controller = this.voiceSessionController;
    if (!controller.isConnected.get() || controller.voiceState.get() === "listening") {
      return;
    }
    this._listenHoldGesture = true;
    this._listenHoldListening = false;
    this._listenSuppressClick = false;
    const win = getWindow(this._listenCell);
    this._listenHoldTimer = win.setTimeout(() => {
      this._listenHoldTimer = void 0;
      if (controller.isConnected.get()) {
        this._listenHoldListening = true;
        controller.pttDown("explicit", true);
      }
    }, VoiceInputModeActionViewItem.HOLD_THRESHOLD_MS);
    this._listenPointerUp.value = addDisposableGenericMouseUpListener(win, (e4) => this._endListenPointerHold(e4));
  }
  _endListenPointerHold(e4) {
    if (!this._listenHoldGesture) {
      return;
    }
    this._listenHoldGesture = false;
    this._listenPointerUp.clear();
    if (this._listenHoldTimer !== void 0) {
      getWindow(this._listenCell).clearTimeout(this._listenHoldTimer);
      this._listenHoldTimer = void 0;
      this._listenSuppressClick = false;
    } else if (this._listenHoldListening) {
      this._listenHoldListening = false;
      const releasedOnCell = !!e4?.target && this._listenCell.contains(e4.target);
      this._listenSuppressClick = releasedOnCell;
      this.voiceSessionController.pttUp("explicit", true);
    }
  }
  dispose() {
    if (this._listenHoldGesture || this._listenHoldTimer !== void 0) {
      this._endListenPointerHold();
    }
    super.dispose();
  }
};

VoiceInputModeActionViewItem = __decorateClass([
  __decorateParam(2, IVoiceInputModeService),
  __decorateParam(3, IVoiceSessionController),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IHoverService),
  __decorateParam(9, IMicCaptureService),
  __decorateParam(10, ITtsPlaybackService),
  __decorateParam(11, IChatSpeechToTextService),
  __decorateParam(12, IAccessibilityService),
  __decorateParam(13, IThemeService)
], VoiceInputModeActionViewItem);
export { retargetVoiceToCurrentSession, registerVoiceInputModeSimulateActions, DICTATION_TOGGLE_COMMAND_ID, VOICE_START_COMMAND_ID, WAVEFORM_BAR_COUNT, WAVEFORM_BAR_MIN_HEIGHT, WAVEFORM_BAR_MAX_HEIGHT, ChatVoiceInputModeAction, ChatVoiceInputModeToggleListenAction, SIMULATE_STATES, VoiceInputModeActionViewItem };
