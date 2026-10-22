// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/accessibilitySignal/browser/accessibilitySignalService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { CachedFunction } from "./module-0027.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { getStructuralKey } from "./module-0042.mjs";
import { derived } from "./module-0054.mjs";
import { ValueWithChangeEventFromObservable } from "./module-0063.mjs";
import { FileAccess } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { addDisposableListener } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/platform/accessibilitySignal/browser/accessibilitySignalService.ts
var IAccessibilitySignalService = createDecorator("accessibilitySignalService");

var AcknowledgeDocCommentsToken = /* @__PURE__ */ Symbol("AcknowledgeDocCommentsToken");

var AccessibilitySignalService = class extends Disposable {
  constructor(configurationService, accessibilityService, telemetryService) {
    super();
    this.configurationService = configurationService;
    this.accessibilityService = accessibilityService;
    this.telemetryService = telemetryService;
    this.sounds = /* @__PURE__ */ new Map();
    this.screenReaderAttached = observableFromEvent(
      this,
      this.accessibilityService.onDidChangeScreenReaderOptimized,
      () => (
        /** @description accessibilityService.onDidChangeScreenReaderOptimized */
        this.accessibilityService.isScreenReaderOptimized()
      )
    );
    this.sentTelemetry = /* @__PURE__ */ new Set();
    this.playingSounds = /* @__PURE__ */ new Set();
    this._signalConfigValue = new CachedFunction((signal) => observableConfigValue(signal.settingsKey, { sound: "off", announcement: "off" }, this.configurationService));
    this._signalEnabledState = new CachedFunction(
      { getCacheKey: getStructuralKey },
      (arg) => {
        return derived((reader) => {
          const setting = this._signalConfigValue.get(arg.signal).read(reader);
          if (arg.modality === "sound" || arg.modality === void 0) {
            if (arg.signal.managesOwnEnablement || checkEnabledState(setting.sound, () => this.screenReaderAttached.read(reader), arg.userGesture)) {
              return true;
            }
          }
          if (arg.modality === "announcement" || arg.modality === void 0) {
            if (checkEnabledState(setting.announcement, () => this.screenReaderAttached.read(reader), arg.userGesture)) {
              return true;
            }
          }
          return false;
        }).recomputeInitiallyAndOnChange(this._store);
      }
    );
  }
  getEnabledState(signal, userGesture, modality) {
    return new ValueWithChangeEventFromObservable(this._signalEnabledState.get({ signal, userGesture, modality }));
  }
  async playSignal(signal, options3 = {}) {
    const shouldPlayAnnouncement = options3.modality === "announcement" || options3.modality === void 0;
    const announcementMessage = options3.customAlertMessage ?? signal.announcementMessage;
    if (shouldPlayAnnouncement && this.isAnnouncementEnabled(signal, options3.userGesture) && announcementMessage) {
      this.accessibilityService.status(announcementMessage);
    }
    const shouldPlaySound = options3.modality === "sound" || options3.modality === void 0;
    if (shouldPlaySound && this.isSoundEnabled(signal, options3.userGesture)) {
      this.sendSignalTelemetry(signal, options3.source);
      await this.playSound(signal.sound.getSound(), options3.allowManyInParallel);
    }
  }
  async playSignals(signals) {
    for (const signal of signals) {
      this.sendSignalTelemetry("signal" in signal ? signal.signal : signal, "source" in signal ? signal.source : void 0);
    }
    const signalArray = signals.map((s) => "signal" in s ? s.signal : s);
    const announcements = signalArray.filter((signal) => this.isAnnouncementEnabled(signal)).map((s) => s.announcementMessage);
    if (announcements.length) {
      this.accessibilityService.status(announcements.join(", "));
    }
    const sounds = new Set(signalArray.filter((signal) => this.isSoundEnabled(signal)).map((signal) => signal.sound.getSound()));
    await Promise.all(Array.from(sounds).map((sound) => this.playSound(sound, true)));
  }
  sendSignalTelemetry(signal, source) {
    const isScreenReaderOptimized = this.accessibilityService.isScreenReaderOptimized();
    const key3 = signal.name + (source ? `::${source}` : "") + (isScreenReaderOptimized ? "{screenReaderOptimized}" : "");
    if (this.sentTelemetry.has(key3) || this.getVolumeInPercent() === 0) {
      return;
    }
    this.sentTelemetry.add(key3);
    this.telemetryService.publicLog2("signal.played", {
      signal: signal.name,
      source: source ?? "",
      isScreenReaderOptimized
    });
  }
  getVolumeInPercent() {
    const volume = this.configurationService.getValue("accessibility.signalOptions.volume");
    if (typeof volume !== "number") {
      return 50;
    }
    return Math.max(Math.min(volume, 100), 0);
  }
  async playSound(sound, allowManyInParallel = false) {
    if (!allowManyInParallel && this.playingSounds.has(sound)) {
      return;
    }
    this.playingSounds.add(sound);
    const url = FileAccess.asBrowserUri(`vs/platform/accessibilitySignal/browser/media/${sound.fileName}`).toString(true);
    try {
      const sound2 = this.sounds.get(url);
      if (sound2) {
        sound2.volume = this.getVolumeInPercent() / 100;
        sound2.currentTime = 0;
        await sound2.play();
      } else {
        const playedSound = await playAudio(url, this.getVolumeInPercent() / 100);
        this.sounds.set(url, playedSound);
      }
    } catch (e) {
      if (!e.message.includes("play() can only be initiated by a user gesture")) {
        console.error("Error while playing sound", e);
      }
    } finally {
      this.playingSounds.delete(sound);
    }
  }
  playSignalLoop(signal, milliseconds) {
    let playing = true;
    const playSound = () => {
      if (playing) {
        this.playSignal(signal, { allowManyInParallel: true }).finally(() => {
          setTimeout(() => {
            if (playing) {
              playSound();
            }
          }, milliseconds);
        });
      }
    };
    playSound();
    return toDisposable(() => playing = false);
  }
  isAnnouncementEnabled(signal, userGesture) {
    if (!signal.announcementMessage) {
      return false;
    }
    return this._signalEnabledState.get({ signal, userGesture: !!userGesture, modality: "announcement" }).get();
  }
  isSoundEnabled(signal, userGesture) {
    return this._signalEnabledState.get({ signal, userGesture: !!userGesture, modality: "sound" }).get();
  }
  onSoundEnabledChanged(signal) {
    return this.getEnabledState(signal, false).onDidChange;
  }
  getDelayMs(signal, modality, mode) {
    if (!this.configurationService.getValue("accessibility.signalOptions.debouncePositionChanges")) {
      return 0;
    }
    let value2;
    if (signal.name === AccessibilitySignal.errorAtPosition.name && mode === "positional") {
      value2 = this.configurationService.getValue("accessibility.signalOptions.experimental.delays.errorAtPosition");
    } else if (signal.name === AccessibilitySignal.warningAtPosition.name && mode === "positional") {
      value2 = this.configurationService.getValue("accessibility.signalOptions.experimental.delays.warningAtPosition");
    } else {
      value2 = this.configurationService.getValue("accessibility.signalOptions.experimental.delays.general");
    }
    return modality === "sound" ? value2.sound : value2.announcement;
  }
};

AccessibilitySignalService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IAccessibilityService),
  __decorateParam(2, ITelemetryService)
], AccessibilitySignalService);

function checkEnabledState(state, getScreenReaderAttached, isTriggeredByUserGesture) {
  return state === "on" || state === "always" || state === "auto" && getScreenReaderAttached() || state === "userGesture" && isTriggeredByUserGesture;
}

async function playAudio(url, volume) {
  const disposables = new DisposableStore();
  try {
    return await doPlayAudio(url, volume, disposables);
  } finally {
    disposables.dispose();
  }
}

function doPlayAudio(url, volume, disposables) {
  return new Promise((resolve3, reject) => {
    const audio = new Audio(url);
    audio.volume = volume;
    disposables.add(addDisposableListener(audio, "ended", () => {
      resolve3(audio);
    }));
    disposables.add(addDisposableListener(audio, "error", (e) => {
      reject(e.error);
    }));
    audio.play().catch((e) => {
      reject(e);
    });
  });
}

var Sound = class _Sound {
  constructor(fileName) {
    this.fileName = fileName;
  }
  static register(options3) {
    const sound = new _Sound(options3.fileName);
    return sound;
  }
  static {
    this.error = _Sound.register({ fileName: "error.mp3" });
  }
  static {
    this.warning = _Sound.register({ fileName: "warning.mp3" });
  }
  static {
    this.success = _Sound.register({ fileName: "success.mp3" });
  }
  static {
    this.foldedArea = _Sound.register({ fileName: "foldedAreas.mp3" });
  }
  static {
    this.break = _Sound.register({ fileName: "break.mp3" });
  }
  static {
    this.quickFixes = _Sound.register({ fileName: "quickFixes.mp3" });
  }
  static {
    this.taskCompleted = _Sound.register({ fileName: "taskCompleted.mp3" });
  }
  static {
    this.taskFailed = _Sound.register({ fileName: "taskFailed.mp3" });
  }
  static {
    this.terminalBell = _Sound.register({ fileName: "terminalBell.mp3" });
  }
  static {
    this.diffLineInserted = _Sound.register({ fileName: "diffLineInserted.mp3" });
  }
  static {
    this.diffLineDeleted = _Sound.register({ fileName: "diffLineDeleted.mp3" });
  }
  static {
    this.diffLineModified = _Sound.register({ fileName: "diffLineModified.mp3" });
  }
  static {
    this.requestSent = _Sound.register({ fileName: "requestSent.mp3" });
  }
  static {
    this.responseReceived1 = _Sound.register({ fileName: "responseReceived1.mp3" });
  }
  static {
    this.responseReceived2 = _Sound.register({ fileName: "responseReceived2.mp3" });
  }
  static {
    this.responseReceived3 = _Sound.register({ fileName: "responseReceived3.mp3" });
  }
  static {
    this.responseReceived4 = _Sound.register({ fileName: "responseReceived4.mp3" });
  }
  static {
    this.clear = _Sound.register({ fileName: "clear.mp3" });
  }
  static {
    this.save = _Sound.register({ fileName: "save.mp3" });
  }
  static {
    this.format = _Sound.register({ fileName: "format.mp3" });
  }
  static {
    this.voiceRecordingStarted = _Sound.register({ fileName: "voiceRecordingStarted.mp3" });
  }
  static {
    this.voiceRecordingStopped = _Sound.register({ fileName: "voiceRecordingStopped.mp3" });
  }
  static {
    this.progress = _Sound.register({ fileName: "progress.mp3" });
  }
  static {
    this.chatEditModifiedFile = _Sound.register({ fileName: "chatEditModifiedFile.mp3" });
  }
  static {
    this.editsKept = _Sound.register({ fileName: "editsKept.mp3" });
  }
  static {
    this.editsUndone = _Sound.register({ fileName: "editsUndone.mp3" });
  }
  static {
    this.nextEditSuggestion = _Sound.register({ fileName: "nextEditSuggestion.mp3" });
  }
  static {
    this.terminalCommandSucceeded = _Sound.register({ fileName: "terminalCommandSucceeded.mp3" });
  }
  static {
    this.chatUserActionRequired = _Sound.register({ fileName: "chatUserActionRequired.mp3" });
  }
  static {
    this.codeActionTriggered = _Sound.register({ fileName: "codeActionTriggered.mp3" });
  }
  static {
    this.codeActionApplied = _Sound.register({ fileName: "codeActionApplied.mp3" });
  }
};

var SoundSource = class {
  constructor(randomOneOf) {
    this.randomOneOf = randomOneOf;
  }
  getSound(deterministic = false) {
    if (deterministic || this.randomOneOf.length === 1) {
      return this.randomOneOf[0];
    } else {
      const index2 = Math.floor(Math.random() * this.randomOneOf.length);
      return this.randomOneOf[index2];
    }
  }
};

var AccessibilitySignal = class _AccessibilitySignal {
  constructor(sound, name, legacySoundSettingsKey, settingsKey, legacyAnnouncementSettingsKey, announcementMessage, managesOwnEnablement = false) {
    this.sound = sound;
    this.name = name;
    this.legacySoundSettingsKey = legacySoundSettingsKey;
    this.settingsKey = settingsKey;
    this.legacyAnnouncementSettingsKey = legacyAnnouncementSettingsKey;
    this.announcementMessage = announcementMessage;
    this.managesOwnEnablement = managesOwnEnablement;
  }
  static {
    this._signals = /* @__PURE__ */ new Set();
  }
  static register(options3) {
    const soundSource = new SoundSource("randomOneOf" in options3.sound ? options3.sound.randomOneOf : [options3.sound]);
    const signal = new _AccessibilitySignal(
      soundSource,
      options3.name,
      options3.legacySoundSettingsKey,
      options3.settingsKey,
      options3.legacyAnnouncementSettingsKey,
      options3.announcementMessage,
      options3.managesOwnEnablement
    );
    _AccessibilitySignal._signals.add(signal);
    return signal;
  }
  static get allAccessibilitySignals() {
    return [...this._signals];
  }
  static {
    this.errorAtPosition = _AccessibilitySignal.register({
      name: localize(1816, null),
      sound: Sound.error,
      announcementMessage: localize(1781, null),
      settingsKey: "accessibility.signals.positionHasError",
      delaySettingsKey: "accessibility.signalOptions.delays.errorAtPosition"
    });
  }
  static {
    this.warningAtPosition = _AccessibilitySignal.register({
      name: localize(1817, null),
      sound: Sound.warning,
      announcementMessage: localize(1782, null),
      settingsKey: "accessibility.signals.positionHasWarning",
      delaySettingsKey: "accessibility.signalOptions.delays.warningAtPosition"
    });
  }
  static {
    this.errorOnLine = _AccessibilitySignal.register({
      name: localize(1807, null),
      sound: Sound.error,
      legacySoundSettingsKey: "audioCues.lineHasError",
      legacyAnnouncementSettingsKey: "accessibility.alert.error",
      announcementMessage: localize(1773, null),
      settingsKey: "accessibility.signals.lineHasError"
    });
  }
  static {
    this.warningOnLine = _AccessibilitySignal.register({
      name: localize(1810, null),
      sound: Sound.warning,
      legacySoundSettingsKey: "audioCues.lineHasWarning",
      legacyAnnouncementSettingsKey: "accessibility.alert.warning",
      announcementMessage: localize(1775, null),
      settingsKey: "accessibility.signals.lineHasWarning"
    });
  }
  static {
    this.foldedArea = _AccessibilitySignal.register({
      name: localize(1808, null),
      sound: Sound.foldedArea,
      legacySoundSettingsKey: "audioCues.lineHasFoldedArea",
      legacyAnnouncementSettingsKey: "accessibility.alert.foldedArea",
      announcementMessage: localize(1774, null),
      settingsKey: "accessibility.signals.lineHasFoldedArea"
    });
  }
  static {
    this.break = _AccessibilitySignal.register({
      name: localize(1806, null),
      sound: Sound.break,
      legacySoundSettingsKey: "audioCues.lineHasBreakpoint",
      legacyAnnouncementSettingsKey: "accessibility.alert.breakpoint",
      announcementMessage: localize(1772, null),
      settingsKey: "accessibility.signals.lineHasBreakpoint"
    });
  }
  static {
    this.inlineSuggestion = _AccessibilitySignal.register({
      name: localize(1809, null),
      sound: Sound.quickFixes,
      legacySoundSettingsKey: "audioCues.lineHasInlineSuggestion",
      settingsKey: "accessibility.signals.lineHasInlineSuggestion"
    });
  }
  static {
    this.nextEditSuggestion = _AccessibilitySignal.register({
      name: localize(1811, null),
      sound: Sound.nextEditSuggestion,
      legacySoundSettingsKey: "audioCues.nextEditSuggestion",
      settingsKey: "accessibility.signals.nextEditSuggestion",
      announcementMessage: localize(1776, null)
    });
  }
  static {
    this.terminalQuickFix = _AccessibilitySignal.register({
      name: localize(1825, null),
      sound: Sound.quickFixes,
      legacySoundSettingsKey: "audioCues.terminalQuickFix",
      legacyAnnouncementSettingsKey: "accessibility.alert.terminalQuickFix",
      announcementMessage: localize(1790, null),
      settingsKey: "accessibility.signals.terminalQuickFix"
    });
  }
  static {
    this.onDebugBreak = _AccessibilitySignal.register({
      name: localize(1815, null),
      sound: Sound.break,
      legacySoundSettingsKey: "audioCues.onDebugBreak",
      legacyAnnouncementSettingsKey: "accessibility.alert.onDebugBreak",
      announcementMessage: localize(1780, null),
      settingsKey: "accessibility.signals.onDebugBreak"
    });
  }
  static {
    this.noInlayHints = _AccessibilitySignal.register({
      name: localize(1812, null),
      sound: Sound.error,
      legacySoundSettingsKey: "audioCues.noInlayHints",
      legacyAnnouncementSettingsKey: "accessibility.alert.noInlayHints",
      announcementMessage: localize(1777, null),
      settingsKey: "accessibility.signals.noInlayHints"
    });
  }
  static {
    this.taskCompleted = _AccessibilitySignal.register({
      name: localize(1820, null),
      sound: Sound.taskCompleted,
      legacySoundSettingsKey: "audioCues.taskCompleted",
      legacyAnnouncementSettingsKey: "accessibility.alert.taskCompleted",
      announcementMessage: localize(1785, null),
      settingsKey: "accessibility.signals.taskCompleted"
    });
  }
  static {
    this.taskFailed = _AccessibilitySignal.register({
      name: localize(1821, null),
      sound: Sound.taskFailed,
      legacySoundSettingsKey: "audioCues.taskFailed",
      legacyAnnouncementSettingsKey: "accessibility.alert.taskFailed",
      announcementMessage: localize(1786, null),
      settingsKey: "accessibility.signals.taskFailed"
    });
  }
  static {
    this.terminalCommandFailed = _AccessibilitySignal.register({
      name: localize(1823, null),
      sound: Sound.error,
      legacySoundSettingsKey: "audioCues.terminalCommandFailed",
      legacyAnnouncementSettingsKey: "accessibility.alert.terminalCommandFailed",
      announcementMessage: localize(1788, null),
      settingsKey: "accessibility.signals.terminalCommandFailed"
    });
  }
  static {
    this.terminalCommandSucceeded = _AccessibilitySignal.register({
      name: localize(1824, null),
      sound: Sound.terminalCommandSucceeded,
      announcementMessage: localize(1789, null),
      settingsKey: "accessibility.signals.terminalCommandSucceeded"
    });
  }
  static {
    this.terminalBell = _AccessibilitySignal.register({
      name: localize(1822, null),
      sound: Sound.terminalBell,
      legacySoundSettingsKey: "audioCues.terminalBell",
      legacyAnnouncementSettingsKey: "accessibility.alert.terminalBell",
      announcementMessage: localize(1787, null),
      settingsKey: "accessibility.signals.terminalBell"
    });
  }
  static {
    this.notebookCellCompleted = _AccessibilitySignal.register({
      name: localize(1813, null),
      sound: Sound.taskCompleted,
      legacySoundSettingsKey: "audioCues.notebookCellCompleted",
      legacyAnnouncementSettingsKey: "accessibility.alert.notebookCellCompleted",
      announcementMessage: localize(1778, null),
      settingsKey: "accessibility.signals.notebookCellCompleted"
    });
  }
  static {
    this.notebookCellFailed = _AccessibilitySignal.register({
      name: localize(1814, null),
      sound: Sound.taskFailed,
      legacySoundSettingsKey: "audioCues.notebookCellFailed",
      legacyAnnouncementSettingsKey: "accessibility.alert.notebookCellFailed",
      announcementMessage: localize(1779, null),
      settingsKey: "accessibility.signals.notebookCellFailed"
    });
  }
  static {
    this.diffLineInserted = _AccessibilitySignal.register({
      name: localize(1801, null),
      sound: Sound.diffLineInserted,
      legacySoundSettingsKey: "audioCues.diffLineInserted",
      settingsKey: "accessibility.signals.diffLineInserted"
    });
  }
  static {
    this.diffLineDeleted = _AccessibilitySignal.register({
      name: localize(1800, null),
      sound: Sound.diffLineDeleted,
      legacySoundSettingsKey: "audioCues.diffLineDeleted",
      settingsKey: "accessibility.signals.diffLineDeleted"
    });
  }
  static {
    this.diffLineModified = _AccessibilitySignal.register({
      name: localize(1802, null),
      sound: Sound.diffLineModified,
      legacySoundSettingsKey: "audioCues.diffLineModified",
      settingsKey: "accessibility.signals.diffLineModified"
    });
  }
  static {
    this.chatEditModifiedFile = _AccessibilitySignal.register({
      name: localize(1793, null),
      sound: Sound.chatEditModifiedFile,
      announcementMessage: localize(1764, null),
      settingsKey: "accessibility.signals.chatEditModifiedFile"
    });
  }
  static {
    this.chatRequestSent = _AccessibilitySignal.register({
      name: localize(1794, null),
      sound: Sound.requestSent,
      legacySoundSettingsKey: "audioCues.chatRequestSent",
      legacyAnnouncementSettingsKey: "accessibility.alert.chatRequestSent",
      announcementMessage: localize(1765, null),
      settingsKey: "accessibility.signals.chatRequestSent"
    });
  }
  static {
    this.chatResponseReceived = _AccessibilitySignal.register({
      name: localize(1795, null),
      legacySoundSettingsKey: "audioCues.chatResponseReceived",
      sound: {
        randomOneOf: [
          Sound.responseReceived1,
          Sound.responseReceived2,
          Sound.responseReceived3,
          Sound.responseReceived4
        ]
      },
      settingsKey: "accessibility.signals.chatResponseReceived"
    });
  }
  static {
    this.codeActionTriggered = _AccessibilitySignal.register({
      name: localize(1799, null),
      sound: Sound.codeActionTriggered,
      legacySoundSettingsKey: "audioCues.codeActionRequestTriggered",
      legacyAnnouncementSettingsKey: "accessibility.alert.codeActionRequestTriggered",
      announcementMessage: localize(1768, null),
      settingsKey: "accessibility.signals.codeActionTriggered"
    });
  }
  static {
    this.codeActionApplied = _AccessibilitySignal.register({
      name: localize(1798, null),
      legacySoundSettingsKey: "audioCues.codeActionApplied",
      sound: Sound.codeActionApplied,
      settingsKey: "accessibility.signals.codeActionApplied"
    });
  }
  static {
    this.progress = _AccessibilitySignal.register({
      name: localize(1818, null),
      sound: Sound.progress,
      legacySoundSettingsKey: "audioCues.chatResponsePending",
      legacyAnnouncementSettingsKey: "accessibility.alert.progress",
      announcementMessage: localize(1783, null),
      settingsKey: "accessibility.signals.progress"
    });
  }
  static {
    this.clear = _AccessibilitySignal.register({
      name: localize(1797, null),
      sound: Sound.clear,
      legacySoundSettingsKey: "audioCues.clear",
      legacyAnnouncementSettingsKey: "accessibility.alert.clear",
      announcementMessage: localize(1767, null),
      settingsKey: "accessibility.signals.clear"
    });
  }
  static {
    this.save = _AccessibilitySignal.register({
      name: localize(1819, null),
      sound: Sound.save,
      legacySoundSettingsKey: "audioCues.save",
      legacyAnnouncementSettingsKey: "accessibility.alert.save",
      announcementMessage: localize(1784, null),
      settingsKey: "accessibility.signals.save"
    });
  }
  static {
    this.format = _AccessibilitySignal.register({
      name: localize(1805, null),
      sound: Sound.format,
      legacySoundSettingsKey: "audioCues.format",
      legacyAnnouncementSettingsKey: "accessibility.alert.format",
      announcementMessage: localize(1771, null),
      settingsKey: "accessibility.signals.format"
    });
  }
  static {
    this.voiceRecordingStarted = _AccessibilitySignal.register({
      name: localize(1828, null),
      sound: Sound.voiceRecordingStarted,
      legacySoundSettingsKey: "audioCues.voiceRecordingStarted",
      settingsKey: "accessibility.signals.voiceRecordingStarted"
    });
  }
  static {
    this.voiceModeStarted = _AccessibilitySignal.register({
      name: localize(1826, null),
      sound: Sound.voiceRecordingStarted,
      announcementMessage: localize(1791, null),
      settingsKey: "accessibility.signals.voiceModeStarted"
    });
  }
  static {
    this.voiceRecordingStopped = _AccessibilitySignal.register({
      name: localize(1829, null),
      sound: Sound.voiceRecordingStopped,
      legacySoundSettingsKey: "audioCues.voiceRecordingStopped",
      settingsKey: "accessibility.signals.voiceRecordingStopped"
    });
  }
  static {
    this.voiceModeStopped = _AccessibilitySignal.register({
      name: localize(1827, null),
      sound: Sound.voiceRecordingStopped,
      announcementMessage: localize(1792, null),
      settingsKey: "accessibility.signals.voiceModeStopped"
    });
  }
  static {
    this.editsKept = _AccessibilitySignal.register({
      name: localize(1803, null),
      sound: Sound.editsKept,
      announcementMessage: localize(1769, null),
      settingsKey: "accessibility.signals.editsKept"
    });
  }
  static {
    this.editsUndone = _AccessibilitySignal.register({
      name: localize(1804, null),
      sound: Sound.editsUndone,
      announcementMessage: localize(1770, null),
      settingsKey: "accessibility.signals.editsUndone"
    });
  }
  static {
    this.chatUserActionRequired = _AccessibilitySignal.register({
      name: localize(1796, null),
      sound: Sound.chatUserActionRequired,
      announcementMessage: localize(1766, null),
      settingsKey: "accessibility.signals.chatUserActionRequired"
    });
  }
};
export { checkEnabledState, playAudio, doPlayAudio, IAccessibilitySignalService, AcknowledgeDocCommentsToken, AccessibilitySignalService, Sound, SoundSource, AccessibilitySignal };
