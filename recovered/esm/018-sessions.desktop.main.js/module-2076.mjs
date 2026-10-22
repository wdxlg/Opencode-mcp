// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/voiceInputMode/voiceInputMode.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { Event2 } from "./module-0017.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { AGENTS_VOICE_ENTITLED } from "./module-1343.mjs";
import { autorun } from "./module-0052.mjs";
import { transaction } from "./module-0045.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatSpeechToTextService } from "./module-1347.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/voiceInputMode/voiceInputMode.ts
var CHAT_VOICE_INPUT_MODE = new RawContextKey("chatVoiceInputMode", "voice", { type: "string", description: localize(11844, null) });

var STORAGE_KEY3 = "chat.voiceInputMode.selected";

var IVoiceInputModeService = createDecorator("voiceInputModeService");

var VoiceInputModeService = class extends Disposable {
  constructor(storageService, configurationService, contextKeyService, chatSpeechToTextService) {
    super();
    this.storageService = storageService;
    this._simulatedVoiceState = observableValue(this, void 0);
    this.simulatedVoiceState = this._simulatedVoiceState;
    this._simulatedHandsFree = observableValue(this, void 0);
    this.simulatedHandsFree = this._simulatedHandsFree;
    this._simulatedVersion = observableValue(this, void 0);
    this.simulatedVersion = this._simulatedVersion;
    this._simulatedHover = observableValue(this, false);
    this.simulatedHover = this._simulatedHover;
    this._walkIndex = 0;
    const stored = this.storageService.get(STORAGE_KEY3, 0 /* PROFILE */);
    const initial = stored === "dictation" ? "dictation" : "voice";
    this._selectedMode = observableValue(this, initial);
    this.selectedMode = this._selectedMode;
    this.voiceAvailable = observableFromEvent(
      this,
      Event2.any(configurationService.onDidChangeConfiguration, contextKeyService.onDidChangeContext),
      () => configurationService.getValue("agents.voice.enabled") === true && ChatContextKeys.enabled.getValue(contextKeyService) === true && AGENTS_VOICE_ENTITLED.evaluate({ getValue: (key3) => contextKeyService.getContextKeyValue(key3) }) && configurationService.getValue("agents.voice.showButton" /* ShowButton */) !== false
    );
    this.dictationAvailable = observableFromEvent(
      this,
      Event2.any(configurationService.onDidChangeConfiguration, contextKeyService.onDidChangeContext),
      () => chatSpeechToTextService.isConfigured && configurationService.getValue("dictation.showButton" /* ShowButton */) !== false
    );
    this.handsFree = observableFromEvent(
      this,
      configurationService.onDidChangeConfiguration,
      () => configurationService.getValue("agents.voice.handsFree") !== false
    );
    this._contextKey = CHAT_VOICE_INPUT_MODE.bindTo(contextKeyService);
    this._register(autorun((reader) => {
      this._contextKey.set(this._selectedMode.read(reader));
    }));
  }
  setSelectedMode(mode) {
    if (this._selectedMode.get() === mode) {
      return;
    }
    this._selectedMode.set(mode, void 0);
    this.storageService.store(STORAGE_KEY3, mode, 0 /* PROFILE */, 0 /* USER */);
  }
  setSimulatedVoiceState(state) {
    this._simulatedVoiceState.set(state, void 0);
  }
  static {
    // Per-version walkthrough sequences. Each exercises the full lifecycle for one
    // push-to-talk design so the bars, colors, hover previews and input-box glow can be
    // watched exactly as a user would experience them. Sequences loop until cleared.
    this.WALKTHROUGHS = {
      // Hands-free: connects, then auto-listens and replies; a quick listening flash
      // during a reply represents barge-in.
      handsFree: {
        handsFree: true,
        steps: [
          { state: "off", ms: 1600 },
          { state: "connecting", ms: 1400 },
          { state: "idle", ms: 1400 },
          { state: "listening", ms: 2800 },
          { state: "speaking", ms: 2800 },
          { state: "listening", ms: 1600 },
          // barge-in
          { state: "speaking", ms: 2400 },
          { state: "idle", ms: 1600 },
          { state: "off", ms: 1600 }
        ]
      },
      // Keyboard hold-to-talk (walkie-talkie): hold the keybinding to talk; the button
      // only connects/disconnects.
      keyboardHold: {
        handsFree: false,
        steps: [
          { state: "off", ms: 1600 },
          { state: "connecting", ms: 1400 },
          { state: "idle", ms: 2400 },
          // "Hold ⌘⇧Space to talk"
          { state: "listening", ms: 2800 },
          // key held
          { state: "speaking", ms: 2800 },
          // reply
          { state: "idle", ms: 1800 },
          { state: "listening", ms: 2600 },
          { state: "speaking", ms: 2400 },
          { state: "idle", ms: 1600 },
          { state: "off", ms: 1600 }
        ]
      },
      // Button hold-to-talk: hold the voice button to talk; a quick tap disconnects. The
      // idle+hover step previews the tap-to-disconnect affordance.
      buttonHold: {
        handsFree: false,
        steps: [
          { state: "off", ms: 1600 },
          { state: "connecting", ms: 1400 },
          { state: "idle", ms: 2200 },
          { state: "idle", hover: true, ms: 1800 },
          // tap-to-disconnect preview
          { state: "listening", ms: 2800 },
          // button held
          { state: "speaking", ms: 2800 },
          { state: "idle", ms: 1800 },
          { state: "listening", ms: 2600 },
          { state: "speaking", ms: 2400 },
          { state: "idle", ms: 1600 },
          { state: "off", ms: 1600 }
        ]
      },
      // Click-to-toggle listening: tap to start listening, tap again to stop.
      clickToggle: {
        handsFree: false,
        steps: [
          { state: "off", ms: 1600 },
          { state: "connecting", ms: 1400 },
          { state: "idle", ms: 2e3 },
          { state: "listening", ms: 2800 },
          // tapped on
          { state: "idle", ms: 1800 },
          // tapped off
          { state: "listening", ms: 2600 },
          { state: "speaking", ms: 2800 },
          // reply
          { state: "listening", ms: 1800 },
          { state: "idle", ms: 1600 },
          { state: "off", ms: 1600 }
        ]
      }
    };
  }
  static {
    this.WALK_STEP_MS = 2400;
  }
  startVoiceStateWalkthrough(version2) {
    this.clearSimulation();
    const walkthrough = VoiceInputModeService.WALKTHROUGHS[version2];
    this._walkVersion = version2;
    this._simulatedHandsFree.set(walkthrough.handsFree, void 0);
    this._simulatedVersion.set(version2, void 0);
    this._walkIndex = 0;
    const advance = () => {
      const steps = walkthrough.steps;
      const step = steps[this._walkIndex % steps.length];
      transaction((tx) => {
        this._simulatedVoiceState.set(step.state, tx);
        this._simulatedHover.set(step.hover ?? false, tx);
      });
      this._walkIndex++;
      this._walkTimer = setTimeout(advance, step.ms ?? VoiceInputModeService.WALK_STEP_MS);
    };
    advance();
  }
  stepVoiceStateWalkthrough() {
    this._stopWalkTimer();
    const version2 = this._walkVersion ?? "keyboardHold";
    const steps = VoiceInputModeService.WALKTHROUGHS[version2].steps;
    this._walkIndex = this._walkIndex % steps.length;
    const step = steps[this._walkIndex];
    transaction((tx) => {
      this._simulatedVersion.set(version2, tx);
      this._simulatedHandsFree.set(VoiceInputModeService.WALKTHROUGHS[version2].handsFree, tx);
      this._simulatedVoiceState.set(step.state, tx);
      this._simulatedHover.set(step.hover ?? false, tx);
    });
    this._walkIndex++;
  }
  clearSimulation() {
    this._stopWalkTimer();
    this._walkIndex = 0;
    this._walkVersion = void 0;
    transaction((tx) => {
      this._simulatedVoiceState.set(void 0, tx);
      this._simulatedHandsFree.set(void 0, tx);
      this._simulatedVersion.set(void 0, tx);
      this._simulatedHover.set(false, tx);
    });
  }
  _stopWalkTimer() {
    if (this._walkTimer !== void 0) {
      clearTimeout(this._walkTimer);
      this._walkTimer = void 0;
    }
  }
  dispose() {
    this._stopWalkTimer();
    super.dispose();
  }
};

VoiceInputModeService = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IChatSpeechToTextService)
], VoiceInputModeService);

registerSingleton(IVoiceInputModeService, VoiceInputModeService, 1 /* Delayed */);
export { CHAT_VOICE_INPUT_MODE, STORAGE_KEY3, IVoiceInputModeService, VoiceInputModeService };
