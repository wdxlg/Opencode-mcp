// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/agentsVoice/browser/voiceModeOnboarding.ts
import { localize } from "./module-0001.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { $, EventType, addDisposableListener, append, clearNode, getWindow, isAncestorOfActiveElement, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { Emitter } from "./module-0017.mjs";
import { FileAccess } from "./module-0033.mjs";
import { ILogService } from "./module-0095.mjs";
import { ChatInputNoticeWidget } from "./module-2041.mjs";
import { buildMicrophoneOptions, indexOfMicrophone } from "./module-2042.mjs";
import { Codicon } from "./module-0085.mjs";
import { SelectBox } from "./module-0475.mjs";
import { defaultSelectBoxStyles } from "./module-0513.mjs";
import { asCssVariable, asCssVariableWithDefault } from "./module-0226.mjs";
import { selectBackground, selectListBackground } from "./module-0233.mjs";
import { status } from "./module-0076.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { renderFormattedText } from "./module-0597.mjs";
import { CONFIGURE_VOICE_INSTRUCTIONS_ACTION_ID } from "./module-2037.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ChatInputOnboarding } from "./module-2039.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/agentsVoice/browser/voiceModeOnboarding.ts
var VOICE_SETTING = "agents.voice.voice";

var VOICE_LANGUAGE_SETTING = "agents.voice.language";

var VOICE_SETTINGS_COMMAND = "agentsVoice.openSettings";

var VOICES = [
  {
    id: "birch_neutral",
    sampleId: "maya_neutral",
    label: localize(7878, null),
    // Flowing mid-range: even spread, gentle drift.
    signature: [
      { frequency: 1, amplitude: 0.42, speed: 0.42, phase: 0 },
      { frequency: 1.7, amplitude: 0.26, speed: -0.31, phase: 1.1 },
      { frequency: 2.6, amplitude: 0.19, speed: 0.24, phase: 2.4 },
      { frequency: 4.1, amplitude: 0.13, speed: -0.18, phase: 0.7 }
    ]
  },
  {
    id: "harper_neutral",
    sampleId: "victoria_neutral",
    label: localize(7882, null),
    // Bright and quick: higher frequencies, tighter ripple.
    signature: [
      { frequency: 1.4, amplitude: 0.38, speed: 0.52, phase: 0 },
      { frequency: 2.3, amplitude: 0.27, speed: -0.38, phase: 1.1 },
      { frequency: 3.6, amplitude: 0.21, speed: 0.3, phase: 2.4 },
      { frequency: 5.2, amplitude: 0.14, speed: -0.22, phase: 0.7 }
    ]
  },
  {
    id: "oak_neutral",
    sampleId: "kevin_neutral",
    label: localize(7889, null),
    // Low and broad: long swells with little high-frequency detail.
    signature: [
      { frequency: 0.7, amplitude: 0.48, speed: 0.3, phase: 0.4 },
      { frequency: 1.2, amplitude: 0.28, speed: -0.22, phase: 1.7 },
      { frequency: 2, amplitude: 0.16, speed: 0.18, phase: 0.9 },
      { frequency: 3.1, amplitude: 0.09, speed: -0.14, phase: 2.2 }
    ]
  },
  {
    id: "junho_neutral",
    sampleId: "daniel_neutral",
    label: localize(7884, null),
    // Steady and measured: slow drift, calm regular crests.
    signature: [
      { frequency: 0.9, amplitude: 0.44, speed: 0.24, phase: 1.3 },
      { frequency: 1.5, amplitude: 0.3, speed: -0.18, phase: 0.2 },
      { frequency: 2.4, amplitude: 0.14, speed: 0.15, phase: 2 },
      { frequency: 3.4, amplitude: 0.1, speed: -0.12, phase: 1.5 }
    ]
  }
];

var LOCALIZED_VOICES = {
  de: { id: "de_marc_neutral", label: localize(7887, null) },
  es: { id: "es-ES_maria_neutral", label: localize(7888, null) },
  fr: { id: "fr_david_neutral", label: localize(7879, null) },
  it: { id: "it_eva_neutral", label: localize(7880, null) },
  ja: { id: "ja_aruha_neutral", label: localize(7877, null) },
  ko: { id: "ko_jiyon_neutral", label: localize(7883, null) },
  pt: { id: "pt-BR_gil_neutral", label: localize(7881, null) },
  zh: { id: "zh_wuzhi_neutral", label: localize(7894, null) }
};

function localizedVoiceForLanguage(language2) {
  try {
    const canonical = Intl.getCanonicalLocales(language2.trim())[0];
    const base = canonical?.split("-")[0].toLowerCase();
    return base ? LOCALIZED_VOICES[base] : void 0;
  } catch {
    return void 0;
  }
}

var RESTING_SIGNATURE = VOICES[0].signature.map((_, index2) => {
  const components = VOICES.map((voice) => voice.signature[index2]);
  const mean = (pick) => components.reduce((sum2, wave) => sum2 + pick(wave), 0) / components.length;
  return {
    frequency: mean((wave) => wave.frequency),
    amplitude: mean((wave) => wave.amplitude),
    speed: mean((wave) => wave.speed),
    phase: mean((wave) => wave.phase)
  };
});

var IDLE_CYCLE_SECONDS = 2.6;

var WAVE_TEMPO = 2 * Math.PI / IDLE_CYCLE_SECONDS / Math.abs(RESTING_SIGNATURE[0].speed);

var IDLE_GAIN2 = 0.5;

var SPEAKING_GAIN2 = 0.45;

var IDLE_MOTION = 0.2;

var SPEAKING_MOTION = 0.8;

var LEVEL_EASING2 = 0.08;

var SIGNATURE_EASING = 0.06;

var REFERENCE_FRAME_SECONDS = 1 / 60;

var BAR_WIDTH2 = 1;

var BAR_GAP2 = 2;

var BAR_MIN = 1;

function cloneSignature(signature) {
  return signature.map((wave) => ({ ...wave, oscillation: 0 }));
}

function easingFactor(perFrameEasing, dt) {
  return 1 - Math.pow(1 - perFrameEasing, dt / REFERENCE_FRAME_SECONDS);
}

function easeSignature(current, target, factor2) {
  for (let i2 = 0; i2 < current.length && i2 < target.length; i2++) {
    current[i2].frequency += (target[i2].frequency - current[i2].frequency) * factor2;
    current[i2].amplitude += (target[i2].amplitude - current[i2].amplitude) * factor2;
    current[i2].speed += (target[i2].speed - current[i2].speed) * factor2;
    current[i2].phase += (target[i2].phase - current[i2].phase) * factor2;
  }
}

function advanceOscillation(waves, dt) {
  const tau = 2 * Math.PI;
  for (const wave of waves) {
    wave.oscillation = (wave.oscillation + wave.speed * WAVE_TEMPO * dt) % tau;
  }
}

function drawBars(context2, width2, height, waves, gain) {
  const pitch = BAR_WIDTH2 + BAR_GAP2;
  const count2 = Math.max(1, Math.floor(width2 / pitch));
  const inset = (width2 - (count2 * pitch - BAR_GAP2)) / 2;
  const centerY = height / 2;
  const maxHalf = height / 2;
  for (let index2 = 0; index2 < count2; index2++) {
    const position2 = count2 > 1 ? index2 / (count2 - 1) : 0;
    const amount = bandFraction2(position2, waves) * gain;
    const half = Math.max(BAR_MIN / 2, Math.min(maxHalf, amount * maxHalf));
    context2.beginPath();
    context2.roundRect(inset + index2 * pitch, centerY - half, BAR_WIDTH2, half * 2, BAR_WIDTH2 / 2);
    context2.fill();
  }
}

function bandFraction2(position2, waves) {
  let amplitude = 0;
  let total = 0;
  for (const wave of waves) {
    const phase = position2 * wave.frequency * Math.PI * 2 + wave.oscillation + wave.phase;
    amplitude += (0.5 + 0.5 * Math.sin(phase)) * wave.amplitude;
    total += wave.amplitude;
  }
  if (total === 0) {
    return 0;
  }
  const taper = Math.sin(Math.PI * Math.min(1, Math.max(0, position2)));
  return amplitude / total * (0.35 + 0.65 * taper);
}

var VoiceModeOnboardingAnimator = class extends Disposable {
  constructor(canvas, container3, source, themeService, accessibilityService) {
    super();
    this.canvas = canvas;
    this.container = container3;
    this.source = source;
    this.themeService = themeService;
    this.accessibilityService = accessibilityService;
    this.animationFrame = this._register(new MutableDisposable());
    this.width = 0;
    this.height = 0;
    this.running = false;
    this.suspended = false;
    this.level = 0;
    /**
     * The stroke colour, taken from the canvas's own computed `color` so CSS
     * owns the tier and theme overrides work for free - the same `currentColor`
     * arrangement the toolbar waveform uses. Cached rather than read per frame:
     * `getComputedStyle` inside the animation loop forces a style recalculation
     * on every tick.
     */
    this.stroke = "";
    const context2 = canvas.getContext("2d");
    if (!context2) {
      throw new Error("Failed to create the Voice Mode onboarding canvas context");
    }
    this.context = context2;
    this.waves = cloneSignature(this.source.getSignature());
    const targetWindow = getWindow(container3);
    const observer = new targetWindow.ResizeObserver(() => this.resize());
    observer.observe(container3);
    this._register(toDisposable(() => observer.disconnect()));
    this._register(this.themeService.onDidColorThemeChange(() => {
      this.readStroke();
      this.draw(targetWindow.performance.now());
    }));
    this._register(this.accessibilityService.onDidChangeReducedMotion(() => this.updateMotion()));
    this._register(toDisposable(() => this.stop()));
    this.readStroke();
    this.resize();
    this.updateMotion();
  }
  readStroke() {
    this.stroke = getWindow(this.canvas).getComputedStyle(this.canvas).color;
  }
  updateMotion() {
    if (this.suspended || this.accessibilityService.isMotionReduced()) {
      this.stop();
      this.draw(getWindow(this.container).performance.now());
    } else {
      this.start();
    }
  }
  /**
   * Pause while the card is put away for higher-precedence content, so an
   * invisible introduction is not still painting every frame.
   */
  setSuspended(suspended) {
    if (this.suspended === suspended) {
      return;
    }
    this.suspended = suspended;
    this.updateMotion();
  }
  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    const targetWindow = getWindow(this.container);
    const tick = (time) => {
      if (!this.running) {
        return;
      }
      this.draw(time);
      this.animationFrame.value = scheduleAtNextAnimationFrame(targetWindow, () => tick(targetWindow.performance.now()));
    };
    this.animationFrame.value = scheduleAtNextAnimationFrame(targetWindow, () => tick(targetWindow.performance.now()));
  }
  stop() {
    this.running = false;
    this.animationFrame.clear();
  }
  resize() {
    const targetWindow = getWindow(this.container);
    const devicePixelRatio = targetWindow.devicePixelRatio || 1;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    if (!this.width || !this.height) {
      return;
    }
    this.canvas.width = this.width * devicePixelRatio;
    this.canvas.height = this.height * devicePixelRatio;
    this.context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    this.draw(targetWindow.performance.now());
  }
  draw(timestamp) {
    if (!this.width || !this.height) {
      return;
    }
    const dt = this.lastTimestamp === void 0 ? 0 : Math.max(0, (timestamp - this.lastTimestamp) * 1e-3);
    this.lastTimestamp = timestamp;
    this.level += (this.source.getLevel() - this.level) * easingFactor(LEVEL_EASING2, dt);
    easeSignature(this.waves, this.source.getSignature(), easingFactor(SIGNATURE_EASING, dt));
    advanceOscillation(this.waves, dt * (IDLE_MOTION + this.level * SPEAKING_MOTION));
    const gain = IDLE_GAIN2 + this.level * SPEAKING_GAIN2;
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.fillStyle = this.stroke;
    drawBars(this.context, this.width, this.height, this.waves, gain);
  }
};

VoiceModeOnboardingAnimator = __decorateClass([
  __decorateParam(3, IThemeService),
  __decorateParam(4, IAccessibilityService)
], VoiceModeOnboardingAnimator);

var VoiceSamplePlayer = class extends Disposable {
  constructor(element, audioFactory, logService) {
    super();
    this.element = element;
    this.audioFactory = audioFactory;
    this.logService = logService;
    this.playback = this._register(new MutableDisposable());
    this._onDidChangePlayingVoice = this._register(new Emitter());
    /** Fires with the voice currently being heard, or `undefined` once it stops. */
    this.onDidChangePlayingVoice = this._onDidChangePlayingVoice.event;
    this._register(toDisposable(() => this.stop()));
  }
  get playingVoice() {
    return this._playingVoice;
  }
  /**
   * Current loudness of the sample being played, `0` when silent. The waveform
   * reads this so it moves to the voice the user is actually hearing.
   */
  getLevel() {
    if (!this.analyser || !this.levels || !this._playingVoice) {
      return 0;
    }
    this.analyser.getByteTimeDomainData(this.levels);
    let sum2 = 0;
    for (const sample of this.levels) {
      const centered = (sample - 128) / 128;
      sum2 += centered * centered;
    }
    return Math.min(1, Math.sqrt(sum2 / this.levels.length) * 3.2);
  }
  play(sampleId, playingVoice = sampleId) {
    this.stop();
    try {
      const audio = this.ensureAudio();
      audio.src = FileAccess.asBrowserUri(`vs/workbench/contrib/agentsVoice/browser/media/${sampleId}.mp3`).toString(true);
      const store = new DisposableStore();
      store.add(addDisposableListener(audio, "ended", () => this.stop()));
      store.add(addDisposableListener(audio, "error", () => this.stop()));
      store.add(toDisposable(() => audio.pause()));
      this.playback.value = store;
      this.setPlayingVoice(playingVoice);
      audio.play().catch((error) => {
        this.logService.trace(`[voice] Voice Mode onboarding preview failed: ${error}`);
        this.stop();
      });
    } catch (error) {
      this.logService.trace(`[voice] Voice Mode onboarding preview unavailable: ${error}`);
      this.stop();
    }
  }
  /**
   * Build the audio element and, best-effort, the analyser graph feeding the
   * waveform. Analysis is a nicety: if the Web Audio graph cannot be created
   * the sample still plays, the waveform just keeps its idle motion.
   */
  ensureAudio() {
    if (this.audio) {
      return this.audio;
    }
    const targetWindow = getWindow(this.element);
    const audio = this.audioFactory?.() ?? new targetWindow.Audio();
    this.audio = audio;
    this._register(toDisposable(() => {
      audio.pause();
      audio.src = "";
    }));
    try {
      const context2 = new targetWindow.AudioContext();
      this._register(toDisposable(() => void context2.close().catch(() => {
      })));
      const analyser = context2.createAnalyser();
      analyser.fftSize = 256;
      context2.createMediaElementSource(audio).connect(analyser);
      analyser.connect(context2.destination);
      this.analyser = analyser;
      this.levels = new Uint8Array(analyser.fftSize);
    } catch (error) {
      this.logService.trace(`[voice] Voice Mode onboarding analyser unavailable: ${error}`);
    }
    return audio;
  }
  stop() {
    this.playback.clear();
    this.setPlayingVoice(void 0);
  }
  setPlayingVoice(voiceId) {
    if (this._playingVoice === voiceId) {
      return;
    }
    this._playingVoice = voiceId;
    this._onDidChangePlayingVoice.fire(voiceId);
  }
};

VoiceSamplePlayer = __decorateClass([
  __decorateParam(2, ILogService)
], VoiceSamplePlayer);

var VoiceModeOnboardingBanner = class extends ChatInputNoticeWidget {
  constructor(options3, commandService, configurationService, contextViewService, instantiationService, logService, storageService, telemetryService) {
    super({
      container: options3.container,
      variant: "onboarding" /* Onboarding */,
      className: "voice-mode-onboarding-banner",
      ariaLabel: localize(7872, null),
      ariaDescription: localize(7873, null),
      onEscape: () => {
        this.logAction("escape");
        this.options.onDismiss();
      }
    });
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.contextViewService = contextViewService;
    this.logService = logService;
    this.storageService = storageService;
    this.telemetryService = telemetryService;
    this.microphonePicker = this._register(new MutableDisposable());
    this.microphoneOptions = [];
    this.voiceElements = /* @__PURE__ */ new Map();
    /** Listeners for the current set of voice chips, cleared when they re-render. */
    this.voicesDisposables = this._register(new DisposableStore());
    this.options = options3;
    this.localizedVoice = localizedVoiceForLanguage(this.resolveSpokenLanguage());
    this.player = this._register(instantiationService.createInstance(VoiceSamplePlayer, this.domNode, options3.audioFactory));
    this._register(this.player.onDidChangePlayingVoice((voiceId) => this.updatePlaying(voiceId)));
    const copy = append(this.domNode, $(".voice-mode-onboarding-copy"));
    const title = append(copy, $(".chat-input-notice-title.voice-mode-onboarding-title"));
    title.textContent = localize(7875, null);
    this.renderDescription(copy);
    this.renderSharedWaveform(instantiationService);
    this.renderMicrophonePicker();
    const actions = append(this.domNode, $(".voice-mode-onboarding-actions"));
    this.voicesContainer = actions;
    this.renderVoices();
    this.renderClose();
    this.logAction("shown");
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(VOICE_LANGUAGE_SETTING)) {
        this.updateForLanguage();
      }
    }));
  }
  /**
   * The signature the shared trace should be showing: the selected voice's, or
   * {@link RESTING_SIGNATURE} before anything has been chosen.
   */
  currentSignature() {
    return this.selectedVoice?.signature ?? RESTING_SIGNATURE;
  }
  /** The single full-width trace the whole card shares. */
  renderSharedWaveform(instantiationService) {
    const wave = append(this.domNode, $(".voice-mode-onboarding-wave"));
    const canvas = append(wave, $("canvas.voice-mode-onboarding-canvas"));
    canvas.setAttribute("aria-hidden", "true");
    this.animator = this._register(instantiationService.createInstance(VoiceModeOnboardingAnimator, canvas, wave, {
      getLevel: () => this.player.getLevel(),
      getSignature: () => this.currentSignature()
    }));
  }
  renderMicrophonePicker() {
    this.microphonePickerContainer = append(this.domNode, $(".chat-input-notice-picker.voice-mode-onboarding-microphone-picker"));
    this.microphoneOptions = [{
      deviceId: "",
      label: localize(7874, null)
    }];
    this.updateMicrophonePicker();
    const mediaDevices = getWindow(this.domNode).navigator.mediaDevices;
    if (mediaDevices) {
      this._register(addDisposableListener(mediaDevices, "devicechange", () => void this.refreshMicrophones()));
      void this.refreshMicrophones();
    }
  }
  async refreshMicrophones() {
    const mediaDevices = getWindow(this.domNode).navigator.mediaDevices;
    if (!mediaDevices?.enumerateDevices) {
      return;
    }
    let devices;
    try {
      devices = await mediaDevices.enumerateDevices();
    } catch (error) {
      this.logService.trace(`[voice] could not enumerate microphones: ${error}`);
      return;
    }
    if (this._store.isDisposed) {
      return;
    }
    const options3 = buildMicrophoneOptions(devices);
    if (options3.length > 1 && !devices.some((device) => device.kind === "audioinput" && device.label)) {
      return;
    }
    this.microphoneOptions = options3;
    this.updateMicrophonePicker();
  }
  updateMicrophonePicker() {
    if (!this.microphonePickerContainer) {
      return;
    }
    this.microphonePicker.clear();
    clearNode(this.microphonePickerContainer);
    this.microphonePickerContainer.hidden = this.microphoneOptions.length <= 1;
    if (this.microphonePickerContainer.hidden) {
      return;
    }
    append(this.microphonePickerContainer, $(`span.codicon.codicon-${Codicon.mic.id}.voice-mode-onboarding-microphone-icon`)).setAttribute("aria-hidden", "true");
    const selected = indexOfMicrophone(this.microphoneOptions, this.currentMicrophoneId());
    const store = new DisposableStore();
    const selectBox = store.add(new SelectBox(
      this.microphoneOptions.map((option2) => ({ text: option2.label })),
      selected,
      this.contextViewService,
      {
        ...defaultSelectBoxStyles,
        selectBackground: void 0,
        selectBorder: void 0,
        selectForeground: void 0,
        selectListBackground: asCssVariableWithDefault(selectListBackground, asCssVariable(selectBackground))
      },
      { ariaLabel: localize(7870, null), useCustomDrawn: true }
    ));
    selectBox.render(this.microphonePickerContainer);
    store.add(selectBox.onDidSelect((event) => this.selectMicrophone(event.index)));
    this.microphonePicker.value = store;
  }
  currentMicrophoneId() {
    return this.storageService.get("agentsVoice.microphoneDevice" /* MicrophoneDevice */, -1 /* APPLICATION */, "");
  }
  selectMicrophone(index2) {
    const option2 = this.microphoneOptions[index2];
    if (!option2) {
      return;
    }
    this.logAction("selectMicrophone");
    if (option2.deviceId) {
      this.storageService.store("agentsVoice.microphoneDevice" /* MicrophoneDevice */, option2.deviceId, -1 /* APPLICATION */, 1 /* MACHINE */);
    } else {
      this.storageService.remove("agentsVoice.microphoneDevice" /* MicrophoneDevice */, -1 /* APPLICATION */);
    }
    status(localize(7871, null, option2.label));
  }
  /**
   * The voices as real buttons - border, hover lift, pressed feedback -
   * because bare text gave no sign it could be clicked at all. In a language
   * Voice Mode speaks natively there is only one voice, so the card previews
   * that voice instead of offering the English chooser.
   *
   * Re-entrant: clears any previously rendered chips so the card can rebuild
   * them when the spoken language changes.
   */
  renderVoices() {
    const container3 = this.voicesContainer;
    if (!container3) {
      return;
    }
    this.voicesDisposables.clear();
    this.voiceElements.clear();
    clearNode(container3);
    const labelText = localize(7895, null);
    const label3 = append(container3, $(".voice-mode-onboarding-voices-label"));
    label3.textContent = labelText;
    if (this.localizedVoice) {
      this.renderLocalizedVoice(container3, labelText, this.localizedVoice);
      return;
    }
    const group2 = append(container3, $(".voice-mode-onboarding-voices"));
    group2.setAttribute("role", "radiogroup");
    group2.setAttribute("aria-label", labelText);
    for (const voice of VOICES) {
      const option2 = append(group2, $(".voice-mode-onboarding-voice"));
      option2.setAttribute("role", "radio");
      const restingAria = localize(7876, null, voice.label);
      option2.setAttribute("aria-label", restingAria);
      this.appendVoiceIcon(option2);
      const label4 = append(option2, $("span.voice-mode-onboarding-voice-label"));
      label4.textContent = voice.label;
      this.voiceElements.set(voice.id, { element: option2, label: voice.label, restingAria });
      this.voicesDisposables.add(addDisposableListener(option2, EventType.CLICK, () => this.selectVoice(voice)));
      this.voicesDisposables.add(addDisposableListener(option2, EventType.KEY_DOWN, (event) => this.handleOptionKey(event, voice)));
    }
    this.updateSelection();
  }
  /**
   * The spoken language changed, so swap the chips: the four English voices
   * for a native language's single voice, or back again. Nothing is carried
   * over - a voice chosen for the old language means nothing for the new one.
   */
  updateForLanguage() {
    const localizedVoice = localizedVoiceForLanguage(this.resolveSpokenLanguage());
    if (localizedVoice?.id === this.localizedVoice?.id) {
      return;
    }
    const hadVoiceFocus = this.voicesContainer ? isAncestorOfActiveElement(this.voicesContainer) : false;
    this.player.stop();
    this.localizedVoice = localizedVoice;
    this.selectedVoice = void 0;
    this.renderVoices();
    if (hadVoiceFocus) {
      this.voiceElements.values().next().value?.element.focus();
    }
  }
  /**
   * The single native voice for the spoken language, as a preview button:
   * there is nothing to choose, so it only ever plays and stops.
   */
  renderLocalizedVoice(container3, ariaLabel, voice) {
    const group2 = append(container3, $(".voice-mode-onboarding-voices"));
    group2.setAttribute("aria-label", ariaLabel);
    const option2 = append(group2, $(".voice-mode-onboarding-voice"));
    option2.setAttribute("role", "button");
    option2.tabIndex = 0;
    const restingAria = localize(7890, null, voice.label);
    option2.setAttribute("aria-label", restingAria);
    this.appendVoiceIcon(option2);
    const label3 = append(option2, $("span.voice-mode-onboarding-voice-label"));
    label3.textContent = voice.label;
    this.voiceElements.set(voice.id, { element: option2, label: voice.label, restingAria });
    this.voicesDisposables.add(addDisposableListener(option2, EventType.CLICK, () => this.previewLocalizedVoice(voice)));
    this.voicesDisposables.add(addDisposableListener(option2, EventType.KEY_DOWN, (event) => {
      const keyboardEvent = new StandardKeyboardEvent(event);
      if (keyboardEvent.equals(3 /* Enter */) || keyboardEvent.equals(10 /* Space */)) {
        keyboardEvent.preventDefault();
        this.previewLocalizedVoice(voice);
      }
    }));
  }
  /**
   * The icon is the affordance: it says "this will speak" before the click,
   * animating bars while it speaks, then a check once a voice is chosen.
   */
  appendVoiceIcon(option2) {
    const icon2 = append(option2, $("span.voice-mode-onboarding-voice-icon"));
    append(icon2, $(`span.codicon.codicon-${Codicon.play.id}.voice-mode-onboarding-voice-idle`)).setAttribute("aria-hidden", "true");
    append(icon2, $(`span.codicon.codicon-${Codicon.checkCompact.id}.voice-mode-onboarding-voice-chosen`)).setAttribute("aria-hidden", "true");
    const bars = append(icon2, $("span.voice-mode-onboarding-voice-bars"));
    bars.setAttribute("aria-hidden", "true");
    for (let bar = 0; bar < 3; bar++) {
      append(bars, $("span.voice-mode-onboarding-voice-bar"));
    }
  }
  // --- Shared behaviour ---
  handleOptionKey(event, voice) {
    const keyboardEvent = new StandardKeyboardEvent(event);
    if (keyboardEvent.equals(3 /* Enter */) || keyboardEvent.equals(10 /* Space */)) {
      keyboardEvent.preventDefault();
      this.selectVoice(voice);
      return;
    }
    const forward = keyboardEvent.equals(17 /* RightArrow */) || keyboardEvent.equals(18 /* DownArrow */);
    const backward = keyboardEvent.equals(15 /* LeftArrow */) || keyboardEvent.equals(16 /* UpArrow */);
    if (forward || backward) {
      keyboardEvent.preventDefault();
      const index2 = VOICES.indexOf(voice);
      const next = VOICES[(index2 + (forward ? 1 : VOICES.length - 1)) % VOICES.length];
      this.selectVoice(next);
      this.voiceElements.get(next.id)?.element.focus();
    }
  }
  /**
   * One short paragraph: what Voice Mode does, and where to change its
   * settings or instructions.
   *
   * `[[...]]` marks each clause that becomes a link, so translators can place
   * it naturally in the sentence instead of receiving a fixed phrase
   * concatenated onto the end.
   */
  renderDescription(container3) {
    const description = append(container3, $(".chat-input-notice-description.voice-mode-onboarding-description"));
    const text2 = localize(7869, null);
    append(description, renderFormattedText(text2, {
      actionHandler: {
        callback: (index2) => {
          const commandId = index2 === "0" ? VOICE_SETTINGS_COMMAND : CONFIGURE_VOICE_INSTRUCTIONS_ACTION_ID;
          this.logAction(index2 === "0" ? "openSettings" : "openInstructions");
          this.commandService.executeCommand(commandId).catch((error) => this.logService.error(`[voice] Failed to run ${commandId}: ${error}`));
        },
        disposables: this._store
      }
    }, $("span")));
    for (const link2 of description.querySelectorAll("a")) {
      link2.tabIndex = 0;
      link2.setAttribute("role", "button");
      this._register(addDisposableListener(link2, EventType.KEY_DOWN, (event) => {
        const keyboardEvent = new StandardKeyboardEvent(event);
        if (keyboardEvent.equals(3 /* Enter */) || keyboardEvent.equals(10 /* Space */)) {
          keyboardEvent.preventDefault();
          link2.click();
        }
      }));
    }
  }
  /**
   * Dismissal is always available and never gated: a disabled close would trap
   * someone in the card. Choosing a voice already commits it, so this is only
   * ever "I am done here" - and closing is what hands the session back.
   */
  renderClose() {
    this.addDismissAction({
      className: "voice-mode-onboarding-close",
      ariaLabel: localize(7868, null),
      onActivate: () => this.finish()
    });
  }
  /**
   * Stops the sample and the waveform while the card is put away for a
   * notification, so an invisible introduction is not still playing audio or
   * painting every frame.
   */
  setVisible(visible) {
    super.setVisible(visible);
    this.animator?.setSuspended(!visible);
    if (!visible) {
      this.player.stop();
    }
  }
  selectVoice(voice) {
    if (this.player.playingVoice === voice.id) {
      this.player.stop();
      status(localize(7891, null, voice.label));
      return;
    }
    this.logAction("selectVoice");
    this.selectedVoice = voice;
    this.updateSelection();
    this.player.play(voice.sampleId, voice.id);
    status(localize(7892, null, voice.label));
    this.configurationService.updateValue(VOICE_SETTING, voice.id, 2 /* USER */).catch((error) => this.logService.error(`[voice] Failed to persist the Voice Mode voice: ${error}`));
  }
  /**
   * The localized voice is not a choice - it is the only voice for the
   * language - so previewing it just plays and stops, and never persists.
   */
  previewLocalizedVoice(voice) {
    if (this.player.playingVoice === voice.id) {
      this.player.stop();
      status(localize(7886, null, voice.label));
      return;
    }
    this.logAction("previewVoice");
    this.player.play(voice.id);
    status(localize(7885, null, voice.label));
  }
  /**
   * The spoken language, mirroring the resolution the voice client uses: an
   * explicit test override, then the configured language (unless `auto`), then
   * the window's language.
   */
  resolveSpokenLanguage() {
    if (this.options.voiceLanguage) {
      return this.options.voiceLanguage;
    }
    const configuredLanguage = this.configurationService.getValue(VOICE_LANGUAGE_SETTING)?.trim();
    if (configuredLanguage && configuredLanguage.toLowerCase() !== "auto") {
      return configuredLanguage;
    }
    return getWindow(this.domNode).navigator.language;
  }
  updateSelection() {
    for (const [id2, entry] of this.voiceElements) {
      const selected = id2 === this.selectedVoice?.id;
      entry.element.classList.toggle("selected", selected);
      entry.element.setAttribute("aria-checked", String(selected));
    }
    this.updateTabStop();
  }
  /**
   * Keeps a single tab stop on the group: the chosen voice, or the first one
   * when nothing has been chosen yet.
   */
  updateTabStop() {
    let first2 = true;
    for (const [id2, entry] of this.voiceElements) {
      const isTabStop = this.selectedVoice === void 0 ? first2 : id2 === this.selectedVoice.id;
      entry.element.tabIndex = isTabStop ? 0 : -1;
      first2 = false;
    }
  }
  updatePlaying(playingVoice) {
    for (const [id2, entry] of this.voiceElements) {
      const playing = id2 === playingVoice;
      entry.element.classList.toggle("playing", playing);
      entry.element.setAttribute("aria-label", playing ? localize(7893, null, entry.label) : entry.restingAria);
    }
    this.domNode.classList.toggle("playing", playingVoice !== void 0);
  }
  finish() {
    this.player.stop();
    this.logAction("close");
    this.options.onDismiss();
  }
  logAction(action) {
    this.telemetryService.publicLog2(
      "voiceModeOnboarding.action",
      { action, source: this.options.source }
    );
  }
};

VoiceModeOnboardingBanner = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IContextViewService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, ITelemetryService)
], VoiceModeOnboardingBanner);

var IVoiceModeOnboardingService = createDecorator("voiceModeOnboardingService");

var VoiceModeOnboardingService = class extends Disposable {
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.onboarding = this._register(this.instantiationService.createInstance(ChatInputOnboarding, {
      storageKey: "agentsVoice.introBannerShown" /* IntroBannerShown */
    }));
  }
  get isVisible() {
    return this.onboarding.isVisible;
  }
  registerHost(options3) {
    return this.onboarding.registerHost(options3);
  }
  showIfNeeded() {
    this.onboarding.showIfNeeded((context2) => this.createBanner(context2, "automatic"));
  }
  show() {
    return this.onboarding.show((context2) => this.createBanner(context2, "manual"));
  }
  createBanner(context2, source) {
    return this.instantiationService.createInstance(VoiceModeOnboardingBanner, {
      container: context2.container,
      onDismiss: () => context2.dismiss(isAncestorOfActiveElement(context2.container)),
      source
    });
  }
};

VoiceModeOnboardingService = __decorateClass([
  __decorateParam(0, IInstantiationService)
], VoiceModeOnboardingService);

registerSingleton(IVoiceModeOnboardingService, VoiceModeOnboardingService, 1 /* Delayed */);
export { localizedVoiceForLanguage, cloneSignature, easingFactor, easeSignature, advanceOscillation, drawBars, bandFraction2, VOICE_SETTING, VOICE_LANGUAGE_SETTING, VOICE_SETTINGS_COMMAND, VOICES, LOCALIZED_VOICES, RESTING_SIGNATURE, IDLE_CYCLE_SECONDS, WAVE_TEMPO, IDLE_GAIN2, SPEAKING_GAIN2, IDLE_MOTION, SPEAKING_MOTION, LEVEL_EASING2, SIGNATURE_EASING, REFERENCE_FRAME_SECONDS, BAR_WIDTH2, BAR_GAP2, BAR_MIN, VoiceModeOnboardingAnimator, VoiceSamplePlayer, VoiceModeOnboardingBanner, IVoiceModeOnboardingService, VoiceModeOnboardingService };
