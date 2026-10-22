// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/speechToText/dictationOnboarding.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, EventType, addDisposableListener, append, clearNode, getWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { localize } from "./module-0001.mjs";
import { ChatInputNoticeWidget } from "./module-2036.mjs";
import { renderFormattedText } from "./module-0597.mjs";
import { CONFIGURE_DICTATION_INSTRUCTIONS_ACTION_ID } from "./module-2032.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { Codicon } from "./module-0085.mjs";
import { SelectBox } from "./module-0475.mjs";
import { defaultSelectBoxStyles } from "./module-0513.mjs";
import { status } from "./module-0076.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ChatInputOnboarding } from "./module-2034.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/speechToText/dictationOnboarding.ts
var DICTATION_INTRO_SHOWN_KEY = "chat.dictation.introShown";

var SHOW_DICTATION_ONBOARDING_COMMAND = "workbench.action.chat.showSpeechToTextIntroduction";

var RESET_DICTATION_ONBOARDING_COMMAND = "workbench.action.chat.resetSpeechToTextIntroduction";

var OPEN_SETTINGS_COMMAND = "workbench.action.openSettings";

var DICTATION_SETTINGS_QUERY = "dictation";

var SYSTEM_DEFAULT_DEVICE_ID = "";

var BAR_WIDTH = 1;

var BAR_GAP = 2;

var IDLE_GAIN = 0.55;

var SPEAKING_GAIN = 0.45;

var LEVEL_EASING = 0.12;

var RESTING_OPACITY = 0.35;

var SPEAKING_OPACITY = 0.5;

var UNAVAILABLE_OPACITY = 0.2;

var REDUCED_MOTION_PAINT_INTERVAL_MS = 100;

function readMicrophoneLevel(analyser, waveform) {
  if (!analyser || !waveform) {
    return 0;
  }
  analyser.getByteTimeDomainData(waveform);
  let sum2 = 0;
  for (const sample of waveform) {
    const centered = (sample - 128) / 128;
    sum2 += centered * centered;
  }
  return Math.min(1, Math.sqrt(sum2 / waveform.length) * 4);
}

var WAVES = [
  { frequency: 1, amplitude: 0.42, speed: 0.42, phase: 0 },
  { frequency: 1.7, amplitude: 0.26, speed: -0.31, phase: 1.1 },
  { frequency: 2.6, amplitude: 0.19, speed: 0.24, phase: 2.4 },
  { frequency: 4.1, amplitude: 0.13, speed: -0.18, phase: 0.7 }
];

function bandFraction(position2, time) {
  let amplitude = 0;
  let total = 0;
  for (const wave of WAVES) {
    const phase = position2 * wave.frequency * Math.PI * 2 + time * wave.speed + wave.phase;
    amplitude += (0.5 + 0.5 * Math.sin(phase)) * wave.amplitude;
    total += wave.amplitude;
  }
  if (total === 0) {
    return 0;
  }
  const taper = Math.sin(Math.PI * Math.min(1, Math.max(0, position2)));
  return amplitude / total * (0.35 + 0.65 * taper);
}

var MicrophonePreview = class extends Disposable {
  constructor(element, mediaDevices, logService) {
    super();
    this.element = element;
    this.mediaDevices = mediaDevices;
    this.logService = logService;
    this.session = this._register(new MutableDisposable());
    this._onDidChangeError = this._register(new Emitter());
    /** Fires with the reason no level is available, or `undefined` once one is. */
    this.onDidChangeError = this._onDidChangeError.event;
  }
  get error() {
    return this._error;
  }
  /**
   * Current loudness, `0..1`, or `0` when nothing is being heard. Read every
   * frame, so it stays allocation-free.
   */
  getLevel() {
    return readMicrophoneLevel(this.analyser, this.waveform);
  }
  /**
   * Listen to `deviceId` (empty means the system default). Replaces any stream
   * already running, so switching devices never leaves two microphones open.
   */
  async listen(deviceId) {
    if (this._store.isDisposed) {
      return;
    }
    this.releaseMicrophone();
    const targetWindow = getWindow(this.element);
    if (!this.mediaDevices?.getUserMedia) {
      this.setError("unavailable" /* Unavailable */);
      return;
    }
    const constraints = { channelCount: 1, echoCancellation: true, noiseSuppression: true };
    if (deviceId) {
      constraints.deviceId = { exact: deviceId };
    }
    let stream;
    try {
      stream = await this.mediaDevices.getUserMedia({ audio: constraints });
    } catch (error) {
      this.setError(toPreviewError(error));
      this.logService.trace(`[chat-stt] microphone preview unavailable: ${error}`);
      return;
    }
    const store = new DisposableStore();
    store.add(toDisposable(() => stream.getTracks().forEach((track) => track.stop())));
    let analyser;
    try {
      const context2 = new targetWindow.AudioContext();
      store.add(toDisposable(() => void context2.close().catch(() => {
      })));
      if (context2.state === "suspended") {
        await context2.resume();
      }
      analyser = context2.createAnalyser();
      analyser.fftSize = 256;
      context2.createMediaStreamSource(stream).connect(analyser);
    } catch (error) {
      store.dispose();
      this.setError("unavailable" /* Unavailable */);
      this.logService.trace(`[chat-stt] microphone preview analyser unavailable: ${error}`);
      return;
    }
    if (this._store.isDisposed) {
      store.dispose();
      return;
    }
    this.session.value = store;
    this.analyser = analyser;
    this.waveform = new Uint8Array(analyser.fftSize);
    this.setError(void 0);
  }
  /**
   * Hand the microphone back. Called before dictation acquires its own stream:
   * two captures of one device is what makes the audio service drop the
   * capture, so the preview always lets go first.
   */
  releaseMicrophone() {
    this.analyser = void 0;
    this.waveform = void 0;
    this.session.clear();
  }
  setError(error) {
    if (this._error === error) {
      return;
    }
    this._error = error;
    this._onDidChangeError.fire(error);
  }
};

MicrophonePreview = __decorateClass([
  __decorateParam(2, ILogService)
], MicrophonePreview);

function toPreviewError(error) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "denied" /* Denied */;
    }
    if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
      return "noDevice" /* NoDevice */;
    }
  }
  return "unavailable" /* Unavailable */;
}

var MicrophoneWaveform = class extends Disposable {
  constructor(container2, source, observerCtor, accessibilityService) {
    super();
    this.container = container2;
    this.source = source;
    this.accessibilityService = accessibilityService;
    this.bars = [];
    this.animationFrame = this._register(new MutableDisposable());
    this.running = false;
    this.lastPaint = 0;
    this.level = 0;
    container2.setAttribute("aria-hidden", "true");
    const observer = new (observerCtor ?? getWindow(container2).ResizeObserver)(() => this.layout());
    observer.observe(container2);
    this._register(toDisposable(() => observer.disconnect()));
    this.layout();
    this._register(toDisposable(() => this.stop()));
  }
  /** Rebuild the row for the current width, if the count actually changed. */
  layout() {
    const width2 = this.container.clientWidth;
    if (!width2) {
      return;
    }
    const count2 = Math.max(1, Math.floor((width2 + BAR_GAP) / (BAR_WIDTH + BAR_GAP)));
    if (count2 === this.bars.length) {
      return;
    }
    clearNode(this.container);
    this.bars = [];
    for (let i2 = 0; i2 < count2; i2++) {
      this.bars.push(append(this.container, $("span.dictation-onboarding-bar")));
    }
  }
  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    const targetWindow = getWindow(this.container);
    const tick = () => {
      if (!this.running) {
        return;
      }
      this.update(targetWindow.performance.now());
      this.animationFrame.value = scheduleAtNextAnimationFrame(targetWindow, tick);
    };
    this.animationFrame.value = scheduleAtNextAnimationFrame(targetWindow, tick);
  }
  stop() {
    this.running = false;
    this.animationFrame.clear();
  }
  update(timestamp) {
    const interval = this.accessibilityService.isMotionReduced() ? REDUCED_MOTION_PAINT_INTERVAL_MS : 0;
    if (timestamp - this.lastPaint < interval) {
      return;
    }
    this.lastPaint = timestamp;
    this.level += (this.source.getLevel() - this.level) * LEVEL_EASING;
    const gain = IDLE_GAIN + this.level * SPEAKING_GAIN;
    const time = timestamp * 1e-3;
    this.container.style.opacity = (this.source.isAvailable() ? RESTING_OPACITY + this.level * SPEAKING_OPACITY : UNAVAILABLE_OPACITY).toFixed(3);
    const count2 = this.bars.length;
    for (let i2 = 0; i2 < count2; i2++) {
      const position2 = count2 > 1 ? i2 / (count2 - 1) : 0;
      const amount = Math.max(0.08, Math.min(1, bandFraction(position2, time) * gain));
      this.bars[i2].style.transform = `scaleY(${amount.toFixed(3)})`;
    }
  }
};

MicrophoneWaveform = __decorateClass([
  __decorateParam(3, IAccessibilityService)
], MicrophoneWaveform);

function buildMicrophoneOptions(devices) {
  const seen = /* @__PURE__ */ new Set();
  const microphones = [];
  for (const device of devices) {
    if (device.kind !== "audioinput" || device.deviceId === "default" || device.deviceId === "communications") {
      continue;
    }
    if (seen.has(device.deviceId)) {
      continue;
    }
    seen.add(device.deviceId);
    microphones.push(device);
  }
  if (microphones.length === 0) {
    return [{
      deviceId: SYSTEM_DEFAULT_DEVICE_ID,
      label: localize(11636, null)
    }];
  }
  const defaultDevice = devices.find((device) => device.kind === "audioinput" && device.deviceId === "default");
  const defaultLabel = defaultDevice?.label.replace(/^(?:default|system default)\s*-\s*/i, "").trim();
  const defaultMicrophone = defaultDevice ? microphones.find(
    (device) => defaultDevice.groupId && device.groupId === defaultDevice.groupId || defaultLabel && device.label === defaultLabel
  ) ?? microphones[0] : void 0;
  const options3 = [];
  if (defaultDevice) {
    const label3 = defaultMicrophone?.label || defaultLabel;
    options3.push({
      deviceId: SYSTEM_DEFAULT_DEVICE_ID,
      label: label3 ? localize(11627, null, label3) : localize(11636, null)
    });
  }
  for (const device of microphones) {
    if (device === defaultMicrophone) {
      continue;
    }
    options3.push({
      deviceId: device.deviceId,
      // Labels are empty until microphone permission has been granted at
      // least once; a truncated id is still better than a blank row.
      label: device.label || localize(11639, null, device.deviceId.slice(0, 8))
    });
  }
  return options3;
}

function indexOfMicrophone(options3, deviceId) {
  const index2 = options3.findIndex((option2) => option2.deviceId === deviceId);
  return index2 === -1 ? 0 : index2;
}

var DictationOnboardingBanner = class extends ChatInputNoticeWidget {
  constructor(bannerOptions, mediaDevices, commandService, contextViewService, instantiationService, logService, storageService, telemetryService) {
    super({
      container: bannerOptions.container,
      variant: "onboarding" /* Onboarding */,
      className: "dictation-onboarding-banner",
      ariaLabel: localize(11633, null),
      ariaDescription: bannerOptions.previewMicrophone ? localize(11635, null) : localize(11634, null),
      onEscape: () => this.dismiss("escape")
    });
    this.bannerOptions = bannerOptions;
    this.mediaDevices = mediaDevices;
    this.commandService = commandService;
    this.contextViewService = contextViewService;
    this.logService = logService;
    this.storageService = storageService;
    this.telemetryService = telemetryService;
    this.picker = this._register(new MutableDisposable());
    this.options = [];
    const header2 = append(this.domNode, $(".dictation-onboarding-header"));
    const title = append(header2, $(".chat-input-notice-title.dictation-onboarding-title"));
    title.textContent = localize(11637, null);
    this.renderDescription(header2);
    this.renderClose();
    const device = append(this.domNode, $(".dictation-onboarding-device"));
    this.pickerContainer = append(device, $(".chat-input-notice-picker.dictation-onboarding-picker"));
    this.options = [{
      deviceId: SYSTEM_DEFAULT_DEVICE_ID,
      label: localize(11636, null)
    }];
    this.renderPicker();
    if (this.mediaDevices) {
      this._register(addDisposableListener(this.mediaDevices, "devicechange", () => void this.refreshMicrophones()));
    }
    const waveformContainer = append(device, $(".dictation-onboarding-waveform"));
    if (this.bannerOptions.previewMicrophone) {
      const preview = this.preview = this._register(instantiationService.createInstance(MicrophonePreview, this.domNode, this.mediaDevices));
      this.waveform = this._register(instantiationService.createInstance(MicrophoneWaveform, waveformContainer, {
        getLevel: () => preview.getLevel(),
        isAvailable: () => preview.error === void 0
      }, void 0));
      this._register(preview.onDidChangeError(() => this.updateHint()));
      this.hint = append(this.domNode, $(".dictation-onboarding-hint"));
      this.hint.setAttribute("aria-live", "polite");
      this.updateHint();
      void this.startPreview();
    } else {
      this.waveform = this._register(instantiationService.createInstance(MicrophoneWaveform, waveformContainer, {
        getLevel: () => readMicrophoneLevel(this.dictationAnalyser, this.dictationWaveform),
        isAvailable: () => this.dictationAnalyser !== void 0
      }, void 0));
      void this.refreshMicrophones();
    }
    this.waveform.start();
    this.logAction("shown");
  }
  /**
   * Stops the waveform and releases the microphone while the card is put away
   * for a notification, so an invisible introduction never holds the microphone
   * open or keeps painting.
   */
  setVisible(visible) {
    super.setVisible(visible);
    if (visible) {
      this.waveform.start();
      if (this.preview) {
        void this.startPreview();
      }
    } else {
      this.waveform.stop();
      this.preview?.releaseMicrophone();
    }
  }
  /**
   * What dictation is, and that none of it is fixed. The card is shown once, so
   * the two things a user might want to change afterwards - whether dictation
   * runs at all, and how it writes what they say - have to be reachable from
   * here rather than left to a command nobody knows to look for.
   *
   * `[[...]]` marks the clauses that become links, so translators can keep the
   * sentence natural instead of having fixed phrases concatenated on.
   */
  renderDescription(container2) {
    const description = append(container2, $(".chat-input-notice-description.dictation-onboarding-description"));
    const text2 = localize(11629, null);
    append(description, renderFormattedText(text2, {
      actionHandler: {
        // The handler is given the link's index, so the two are told apart
        // by position - hence the ordering note to translators above.
        callback: (index2) => {
          const [commandId, ...args2] = index2 === "0" ? [OPEN_SETTINGS_COMMAND, { query: DICTATION_SETTINGS_QUERY }] : [CONFIGURE_DICTATION_INSTRUCTIONS_ACTION_ID];
          this.logAction(index2 === "0" ? "openSettings" : "openInstructions");
          this.commandService.executeCommand(commandId, ...args2).catch((error) => this.logService.error(`[chat-stt] failed to open dictation customization: ${error}`));
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
   * Bring the card to life. The device list and the microphone are started
   * together rather than in sequence: `getUserMedia` can take a second or more
   * to return, and waiting for it would leave the picker empty for that whole
   * time. Enumeration is repeated once the microphone is live, because device
   * labels stay blank until permission has been granted at least once.
   */
  async startPreview() {
    if (!this.preview) {
      return;
    }
    const listening = this.preview.listen(this.currentDeviceId());
    await Promise.all([listening, this.refreshMicrophones()]);
    await this.refreshMicrophones();
  }
  currentDeviceId() {
    return this.storageService.get("agentsVoice.microphoneDevice" /* MicrophoneDevice */, -1 /* APPLICATION */, SYSTEM_DEFAULT_DEVICE_ID);
  }
  async refreshMicrophones(analyserNode, switchMicrophone) {
    if (this._store.isDisposed) {
      return;
    }
    this.switchMicrophone = switchMicrophone ?? this.switchMicrophone;
    if (!this.preview && analyserNode) {
      this.dictationAnalyser = analyserNode;
      this.dictationWaveform = new Uint8Array(analyserNode.fftSize);
    }
    if (!this.preview && !this.dictationAnalyser) {
      return;
    }
    if (!this.mediaDevices?.enumerateDevices) {
      return;
    }
    let devices;
    try {
      devices = await this.mediaDevices.enumerateDevices();
    } catch (error) {
      this.logService.trace(`[chat-stt] could not enumerate microphones: ${error}`);
      return;
    }
    if (this._store.isDisposed) {
      return;
    }
    const options3 = buildMicrophoneOptions(devices);
    if (options3.length > 1 && !devices.some((device) => device.kind === "audioinput" && device.label)) {
      return;
    }
    this.options = options3;
    this.renderPicker();
  }
  /** A picker with one entry is not a choice, so only show this row for multiple microphones. */
  renderPicker() {
    if (!this.pickerContainer) {
      return;
    }
    this.picker.clear();
    clearNode(this.pickerContainer);
    this.pickerContainer.hidden = this.options.length <= 1;
    if (this.pickerContainer.hidden) {
      return;
    }
    append(this.pickerContainer, $(`span.codicon.codicon-${Codicon.micCompact.id}.dictation-onboarding-picker-icon`)).setAttribute("aria-hidden", "true");
    const selected = indexOfMicrophone(this.options, this.currentDeviceId());
    const store = new DisposableStore();
    const selectBox = store.add(new SelectBox(
      this.options.map((option2) => ({ text: option2.label })),
      selected,
      this.contextViewService,
      { ...defaultSelectBoxStyles, selectBackground: void 0, selectBorder: void 0, selectForeground: void 0 },
      { ariaLabel: localize(11630, null), useCustomDrawn: true }
    ));
    selectBox.render(this.pickerContainer);
    store.add(selectBox.onDidSelect((event) => this.selectMicrophone(event.index)));
    this.picker.value = store;
  }
  selectMicrophone(index2) {
    const option2 = this.options[index2];
    if (!option2) {
      return;
    }
    this.logAction("selectMicrophone");
    if (option2.deviceId) {
      this.storageService.store("agentsVoice.microphoneDevice" /* MicrophoneDevice */, option2.deviceId, -1 /* APPLICATION */, 1 /* MACHINE */);
    } else {
      this.storageService.remove("agentsVoice.microphoneDevice" /* MicrophoneDevice */, -1 /* APPLICATION */);
    }
    status(localize(11631, null, option2.label));
    if (this.preview) {
      void this.preview.listen(option2.deviceId).then(() => this.updateHint());
    } else if (this.switchMicrophone) {
      void this.switchMicrophone(option2.deviceId).then((analyser) => this.refreshMicrophones(analyser)).catch((error) => this.logService.error(`[chat-stt] failed to switch dictation microphone: ${error}`));
    }
  }
  /**
   * The hint only speaks when the microphone cannot be read. At rest the
   * moving waveform is the instruction - a line of text telling you to talk is
   * one the card can do without.
   */
  updateHint() {
    if (!this.preview || !this.hint) {
      return;
    }
    const error = this.preview.error;
    this.domNode.classList.toggle("has-error", error !== void 0);
    this.hint.textContent = error === void 0 ? "" : hintForError(error);
  }
  renderClose() {
    this.addDismissAction({
      className: "dictation-onboarding-close",
      ariaLabel: localize(11626, null),
      onActivate: () => this.dismiss("close")
    });
  }
  dismiss(action) {
    this.logAction(action);
    this.waveform.stop();
    this.preview?.releaseMicrophone();
    this.bannerOptions.onDismiss();
  }
  logAction(action) {
    this.telemetryService.publicLog2(
      "dictationOnboarding.action",
      { action, source: this.bannerOptions.source }
    );
  }
};

DictationOnboardingBanner = __decorateClass([
  __decorateParam(2, ICommandService),
  __decorateParam(3, IContextViewService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, ITelemetryService)
], DictationOnboardingBanner);

function hintForError(error) {
  switch (error) {
    case "denied" /* Denied */:
      return localize(11628, null);
    case "noDevice" /* NoDevice */:
      return localize(11632, null);
    default:
      return localize(11638, null);
  }
}

var IDictationOnboardingService = createDecorator("dictationOnboardingService");

var DictationOnboardingService = class extends Disposable {
  constructor(instantiationService, storageService) {
    super();
    this.instantiationService = instantiationService;
    this.storageService = storageService;
    this.onboarding = this._register(this.instantiationService.createInstance(ChatInputOnboarding, {
      storageKey: DICTATION_INTRO_SHOWN_KEY
    }));
  }
  get isVisible() {
    return this.onboarding.isVisible;
  }
  registerHost(options3) {
    return this.onboarding.registerHost(options3);
  }
  showIfNeeded() {
    return this.onboarding.showIfNeeded((context2) => this.createBanner(context2.container, context2.dismiss, "automatic", false));
  }
  show() {
    return this.onboarding.show((context2) => this.createBanner(context2.container, context2.dismiss, "manual", true));
  }
  refreshMicrophones(analyserNode, switchMicrophone) {
    if (this.onboarding.isVisible) {
      void this.currentBanner?.refreshMicrophones(analyserNode, switchMicrophone);
    }
  }
  reset() {
    this.storageService.remove(DICTATION_INTRO_SHOWN_KEY, -1 /* APPLICATION */);
  }
  createBanner(container2, dismiss, source, previewMicrophone) {
    const banner = this.instantiationService.createInstance(DictationOnboardingBanner, {
      container: container2,
      onDismiss: dismiss,
      previewMicrophone,
      source
    }, getWindow(container2).navigator.mediaDevices);
    this.currentBanner = banner;
    return banner;
  }
};

DictationOnboardingService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IStorageService)
], DictationOnboardingService);

registerSingleton(IDictationOnboardingService, DictationOnboardingService, 1 /* Delayed */);
export { readMicrophoneLevel, bandFraction, toPreviewError, buildMicrophoneOptions, indexOfMicrophone, hintForError, DICTATION_INTRO_SHOWN_KEY, SHOW_DICTATION_ONBOARDING_COMMAND, RESET_DICTATION_ONBOARDING_COMMAND, OPEN_SETTINGS_COMMAND, DICTATION_SETTINGS_QUERY, SYSTEM_DEFAULT_DEVICE_ID, BAR_WIDTH, BAR_GAP, IDLE_GAIN, SPEAKING_GAIN, LEVEL_EASING, RESTING_OPACITY, SPEAKING_OPACITY, UNAVAILABLE_OPACITY, REDUCED_MOTION_PAINT_INTERVAL_MS, WAVES, MicrophonePreview, MicrophoneWaveform, DictationOnboardingBanner, IDictationOnboardingService, DictationOnboardingService };
