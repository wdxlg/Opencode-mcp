// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/keybinding/common/abstractKeybindingService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { IntervalTimer, TimeoutTimer } from "./module-0036.mjs";
import { coalesce } from "./module-0007.mjs";
import { NoMatchingKb } from "./module-0582.mjs";
import { illegalState } from "./module-0004.mjs";
import { localize } from "./module-0001.mjs";
import { IME } from "./module-0351.mjs";


// src/vs/platform/keybinding/common/abstractKeybindingService.ts
var HIGH_FREQ_COMMANDS = /^(cursor|delete|undo|redo|tab|editor\.action\.clipboard)/;

function isKeyInComposition(e4) {
  return e4.keyCode === 114 /* KEY_IN_COMPOSITION */;
}

var AbstractKeybindingService = class extends Disposable {
  constructor(_contextKeyService, _commandService, _telemetryService, _notificationService, _logService) {
    super();
    this._contextKeyService = _contextKeyService;
    this._commandService = _commandService;
    this._telemetryService = _telemetryService;
    this._notificationService = _notificationService;
    this._logService = _logService;
    this._onDidUpdateKeybindings = this._register(new Emitter());
    this._currentChords = [];
    this._currentChordChecker = new IntervalTimer();
    this._currentChordStatusMessage = null;
    this._ignoreSingleModifiers = KeybindingModifierSet.EMPTY;
    this._currentSingleModifier = null;
    this._currentSingleModifierClearTimeout = new TimeoutTimer();
    this._currentlyDispatchingCommandId = null;
    this._logging = false;
  }
  get onDidUpdateKeybindings() {
    return this._onDidUpdateKeybindings ? this._onDidUpdateKeybindings.event : Event2.None;
  }
  get inChordMode() {
    return this._currentChords.length > 0;
  }
  getDefaultKeybindingsContent() {
    return "";
  }
  toggleLogging() {
    this._logging = !this._logging;
    return this._logging;
  }
  _log(str) {
    if (this._logging) {
      this._logService.info(`[KeybindingService]: ${str}`);
    }
  }
  getDefaultKeybindings() {
    return this._getResolver().getDefaultKeybindings();
  }
  getKeybindings() {
    return this._getResolver().getKeybindings();
  }
  customKeybindingsCount() {
    return 0;
  }
  lookupKeybindings(commandId) {
    return coalesce(
      this._getResolver().lookupKeybindings(commandId).map((item) => item.resolvedKeybinding)
    );
  }
  lookupKeybinding(commandId, context2, enforceContextCheck = false) {
    const result = this._getResolver().lookupPrimaryKeybinding(commandId, context2 || this._contextKeyService, enforceContextCheck);
    if (!result) {
      return void 0;
    }
    return result.resolvedKeybinding;
  }
  dispatchEvent(e4, target) {
    return this._dispatch(e4, target);
  }
  // TODO@ulugbekna: update namings to align with `_doDispatch`
  // TODO@ulugbekna: this fn doesn't seem to take into account single-modifier keybindings, eg `shift shift`
  softDispatch(e4, target) {
    this._log(`/ Soft dispatching keyboard event`);
    if (isKeyInComposition(e4)) {
      this._log(`\\ Keyboard event is part of an IME composition`);
      return NoMatchingKb;
    }
    const keybinding = this.resolveKeyboardEvent(e4);
    if (keybinding.hasMultipleChords()) {
      console.warn("keyboard event should not be mapped to multiple chords");
      return NoMatchingKb;
    }
    const [firstChord] = keybinding.getDispatchChords();
    if (firstChord === null) {
      this._log(`\\ Keyboard event cannot be dispatched`);
      return NoMatchingKb;
    }
    const contextValue = this._contextKeyService.getContext(target);
    const currentChords = this._currentChords.map((({ keypress }) => keypress));
    return this._getResolver().resolve(contextValue, currentChords, firstChord);
  }
  _scheduleLeaveChordMode() {
    const chordLastInteractedTime = Date.now();
    this._currentChordChecker.cancelAndSet(() => {
      if (!this._documentHasFocus()) {
        this._leaveChordMode();
        return;
      }
      if (Date.now() - chordLastInteractedTime > 5e3) {
        this._leaveChordMode();
      }
    }, 500);
  }
  _expectAnotherChord(firstChord, keypressLabel) {
    this._currentChords.push({ keypress: firstChord, label: keypressLabel });
    switch (this._currentChords.length) {
      case 0:
        throw illegalState("impossible");
      case 1:
        this._currentChordStatusMessage = this._notificationService.status(localize(3061, null, keypressLabel));
        break;
      default: {
        const fullKeypressLabel = this._currentChords.map(({ label: label3 }) => label3).join(", ");
        this._currentChordStatusMessage = this._notificationService.status(localize(3064, null, fullKeypressLabel));
      }
    }
    this._scheduleLeaveChordMode();
    if (IME.enabled) {
      IME.disable();
    }
  }
  _leaveChordMode() {
    if (this._currentChordStatusMessage) {
      this._currentChordStatusMessage.close();
      this._currentChordStatusMessage = null;
    }
    this._currentChordChecker.cancel();
    this._currentChords = [];
    IME.enable();
  }
  dispatchByUserSettingsLabel(userSettingsLabel, target) {
    this._log(`/ Dispatching keybinding triggered via menu entry accelerator - ${userSettingsLabel}`);
    const keybindings = this.resolveUserBinding(userSettingsLabel);
    if (keybindings.length === 0) {
      this._log(`\\ Could not resolve - ${userSettingsLabel}`);
    } else {
      this._doDispatch(
        keybindings[0],
        target,
        /*isSingleModiferChord*/
        false
      );
    }
  }
  _dispatch(e4, target) {
    if (isKeyInComposition(e4)) {
      this._log(`+ Ignoring keybinding dispatch because an IME composition is in progress.`);
      return false;
    }
    return this._doDispatch(
      this.resolveKeyboardEvent(e4),
      target,
      /*isSingleModiferChord*/
      false
    );
  }
  _singleModifierDispatch(e4, target) {
    if (isKeyInComposition(e4)) {
      return false;
    }
    const keybinding = this.resolveKeyboardEvent(e4);
    const [singleModifier] = keybinding.getSingleModifierDispatchChords();
    if (singleModifier) {
      if (this._ignoreSingleModifiers.has(singleModifier)) {
        this._log(`+ Ignoring single modifier ${singleModifier} due to it being pressed together with other keys.`);
        this._ignoreSingleModifiers = KeybindingModifierSet.EMPTY;
        this._currentSingleModifierClearTimeout.cancel();
        this._currentSingleModifier = null;
        return false;
      }
      this._ignoreSingleModifiers = KeybindingModifierSet.EMPTY;
      if (this._currentSingleModifier === null) {
        this._log(`+ Storing single modifier for possible chord ${singleModifier}.`);
        this._currentSingleModifier = singleModifier;
        this._currentSingleModifierClearTimeout.cancelAndSet(() => {
          this._log(`+ Clearing single modifier due to 300ms elapsed.`);
          this._currentSingleModifier = null;
        }, 300);
        return false;
      }
      if (singleModifier === this._currentSingleModifier) {
        this._log(`/ Dispatching single modifier chord ${singleModifier} ${singleModifier}`);
        this._currentSingleModifierClearTimeout.cancel();
        this._currentSingleModifier = null;
        return this._doDispatch(
          keybinding,
          target,
          /*isSingleModiferChord*/
          true
        );
      }
      this._log(`+ Clearing single modifier due to modifier mismatch: ${this._currentSingleModifier} ${singleModifier}`);
      this._currentSingleModifierClearTimeout.cancel();
      this._currentSingleModifier = null;
      return false;
    }
    const [firstChord] = keybinding.getChords();
    this._ignoreSingleModifiers = new KeybindingModifierSet(firstChord);
    if (this._currentSingleModifier !== null) {
      this._log(`+ Clearing single modifier due to other key up.`);
    }
    this._currentSingleModifierClearTimeout.cancel();
    this._currentSingleModifier = null;
    return false;
  }
  _doDispatch(userKeypress, target, isSingleModiferChord = false) {
    let shouldPreventDefault = false;
    if (userKeypress.hasMultipleChords()) {
      console.warn("Unexpected keyboard event mapped to multiple chords");
      return false;
    }
    let userPressedChord = null;
    let currentChords = null;
    if (isSingleModiferChord) {
      const [dispatchKeyname] = userKeypress.getSingleModifierDispatchChords();
      userPressedChord = dispatchKeyname;
      currentChords = dispatchKeyname ? [dispatchKeyname] : [];
    } else {
      [userPressedChord] = userKeypress.getDispatchChords();
      currentChords = this._currentChords.map(({ keypress }) => keypress);
    }
    if (userPressedChord === null) {
      this._log(`\\ Keyboard event cannot be dispatched in keydown phase.`);
      return shouldPreventDefault;
    }
    const contextValue = this._contextKeyService.getContext(target);
    const keypressLabel = userKeypress.getLabel();
    const resolveResult = this._getResolver().resolve(contextValue, currentChords, userPressedChord);
    switch (resolveResult.kind) {
      case 0 /* NoMatchingKb */: {
        this._logService.trace("KeybindingService#dispatch", keypressLabel, `[ No matching keybinding ]`);
        if (this.inChordMode) {
          const currentChordsLabel = this._currentChords.map(({ label: label3 }) => label3).join(", ");
          this._log(`+ Leaving multi-chord mode: Nothing bound to "${currentChordsLabel}, ${keypressLabel}".`);
          this._notificationService.status(localize(3063, null, currentChordsLabel, keypressLabel), {
            hideAfter: 10 * 1e3
            /* 10s */
          });
          this._leaveChordMode();
          shouldPreventDefault = true;
        }
        return shouldPreventDefault;
      }
      case 1 /* MoreChordsNeeded */: {
        this._logService.trace("KeybindingService#dispatch", keypressLabel, `[ Several keybindings match - more chords needed ]`);
        shouldPreventDefault = true;
        this._expectAnotherChord(userPressedChord, keypressLabel);
        this._log(this._currentChords.length === 1 ? `+ Entering multi-chord mode...` : `+ Continuing multi-chord mode...`);
        return shouldPreventDefault;
      }
      case 2 /* KbFound */: {
        this._logService.trace("KeybindingService#dispatch", keypressLabel, `[ Will dispatch command ${resolveResult.commandId} ]`);
        if (resolveResult.commandId === null || resolveResult.commandId === "") {
          if (this.inChordMode) {
            const currentChordsLabel = this._currentChords.map(({ label: label3 }) => label3).join(", ");
            this._log(`+ Leaving chord mode: Nothing bound to "${currentChordsLabel}, ${keypressLabel}".`);
            this._notificationService.status(localize(3063, null, currentChordsLabel, keypressLabel), {
              hideAfter: 10 * 1e3
              /* 10s */
            });
            this._leaveChordMode();
            shouldPreventDefault = true;
          }
        } else {
          if (this.inChordMode) {
            this._leaveChordMode();
          }
          if (!resolveResult.isBubble) {
            shouldPreventDefault = true;
          }
          this._log(`+ Invoking command ${resolveResult.commandId}.`);
          this._currentlyDispatchingCommandId = resolveResult.commandId;
          try {
            if (typeof resolveResult.commandArgs === "undefined") {
              this._commandService.executeCommand(resolveResult.commandId).then(void 0, (err) => this._notificationService.warn(err));
            } else {
              this._commandService.executeCommand(resolveResult.commandId, resolveResult.commandArgs).then(void 0, (err) => this._notificationService.warn(err));
            }
          } finally {
            this._currentlyDispatchingCommandId = null;
          }
          if (!HIGH_FREQ_COMMANDS.test(resolveResult.commandId)) {
            this._telemetryService.publicLog2("workbenchActionExecuted", { id: resolveResult.commandId, from: "keybinding", detail: userKeypress.getUserSettingsLabel() ?? void 0 });
          }
        }
        return shouldPreventDefault;
      }
    }
  }
  mightProducePrintableCharacter(event) {
    if (event.ctrlKey || event.metaKey) {
      return false;
    }
    if (event.keyCode >= 31 /* KeyA */ && event.keyCode <= 56 /* KeyZ */ || event.keyCode >= 21 /* Digit0 */ && event.keyCode <= 30 /* Digit9 */) {
      return true;
    }
    return false;
  }
  appendKeybinding(label3, commandId, context2, enforceContextCheck) {
    if (commandId) {
      const keybindingLabel2 = this.lookupKeybinding(commandId, context2, enforceContextCheck)?.getLabel();
      if (keybindingLabel2) {
        return localize(
          3062,
          null,
          label3,
          keybindingLabel2
        );
      }
    }
    return label3;
  }
};

var KeybindingModifierSet = class _KeybindingModifierSet {
  static {
    this.EMPTY = new _KeybindingModifierSet(null);
  }
  constructor(source) {
    this._ctrlKey = source ? source.ctrlKey : false;
    this._shiftKey = source ? source.shiftKey : false;
    this._altKey = source ? source.altKey : false;
    this._metaKey = source ? source.metaKey : false;
  }
  has(modifier) {
    switch (modifier) {
      case "ctrl":
        return this._ctrlKey;
      case "shift":
        return this._shiftKey;
      case "alt":
        return this._altKey;
      case "meta":
        return this._metaKey;
    }
  }
};
export { isKeyInComposition, HIGH_FREQ_COMMANDS, AbstractKeybindingService, KeybindingModifierSet };
