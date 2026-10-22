// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/keybinding/common/usLayoutResolvedKeybinding.ts
import { BaseResolvedKeybinding } from "./module-1833.mjs";
import { IMMUTABLE_CODE_TO_KEY_CODE, KeyCodeUtils } from "./module-0019.mjs";
import { KeyCodeChord } from "./module-0021.mjs";
import { toEmptyArrayIfContainsNull } from "./module-1585.mjs";


// src/vs/platform/keybinding/common/usLayoutResolvedKeybinding.ts
var USLayoutResolvedKeybinding = class _USLayoutResolvedKeybinding extends BaseResolvedKeybinding {
  constructor(chords, os) {
    super(os, chords);
  }
  _keyCodeToUILabel(keyCode) {
    if (this._os === 2 /* Macintosh */) {
      switch (keyCode) {
        case 15 /* LeftArrow */:
          return "\u2190";
        case 16 /* UpArrow */:
          return "\u2191";
        case 17 /* RightArrow */:
          return "\u2192";
        case 18 /* DownArrow */:
          return "\u2193";
      }
    }
    return KeyCodeUtils.toString(keyCode);
  }
  _getLabel(chord) {
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    return this._keyCodeToUILabel(chord.keyCode);
  }
  _getAriaLabel(chord) {
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    return KeyCodeUtils.toString(chord.keyCode);
  }
  _getElectronAccelerator(chord) {
    return KeyCodeUtils.toElectronAccelerator(chord.keyCode);
  }
  _getUserSettingsLabel(chord) {
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    const result = KeyCodeUtils.toUserSettingsUS(chord.keyCode);
    return result ? result.toLowerCase() : result;
  }
  _isWYSIWYG() {
    return true;
  }
  _getChordDispatch(chord) {
    return _USLayoutResolvedKeybinding.getDispatchStr(chord);
  }
  static getDispatchStr(chord) {
    if (chord.isModifierKey()) {
      return null;
    }
    let result = "";
    if (chord.ctrlKey) {
      result += "ctrl+";
    }
    if (chord.shiftKey) {
      result += "shift+";
    }
    if (chord.altKey) {
      result += "alt+";
    }
    if (chord.metaKey) {
      result += "meta+";
    }
    result += KeyCodeUtils.toString(chord.keyCode);
    return result;
  }
  _getSingleModifierChordDispatch(keybinding) {
    if (keybinding.keyCode === 5 /* Ctrl */ && !keybinding.shiftKey && !keybinding.altKey && !keybinding.metaKey) {
      return "ctrl";
    }
    if (keybinding.keyCode === 4 /* Shift */ && !keybinding.ctrlKey && !keybinding.altKey && !keybinding.metaKey) {
      return "shift";
    }
    if (keybinding.keyCode === 6 /* Alt */ && !keybinding.ctrlKey && !keybinding.shiftKey && !keybinding.metaKey) {
      return "alt";
    }
    if (keybinding.keyCode === 57 /* Meta */ && !keybinding.ctrlKey && !keybinding.shiftKey && !keybinding.altKey) {
      return "meta";
    }
    return null;
  }
  /**
   * *NOTE*: Check return value for `KeyCode.Unknown`.
   */
  static _scanCodeToKeyCode(scanCode) {
    const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
    if (immutableKeyCode !== -1 /* DependsOnKbLayout */) {
      return immutableKeyCode;
    }
    switch (scanCode) {
      case 10 /* KeyA */:
        return 31 /* KeyA */;
      case 11 /* KeyB */:
        return 32 /* KeyB */;
      case 12 /* KeyC */:
        return 33 /* KeyC */;
      case 13 /* KeyD */:
        return 34 /* KeyD */;
      case 14 /* KeyE */:
        return 35 /* KeyE */;
      case 15 /* KeyF */:
        return 36 /* KeyF */;
      case 16 /* KeyG */:
        return 37 /* KeyG */;
      case 17 /* KeyH */:
        return 38 /* KeyH */;
      case 18 /* KeyI */:
        return 39 /* KeyI */;
      case 19 /* KeyJ */:
        return 40 /* KeyJ */;
      case 20 /* KeyK */:
        return 41 /* KeyK */;
      case 21 /* KeyL */:
        return 42 /* KeyL */;
      case 22 /* KeyM */:
        return 43 /* KeyM */;
      case 23 /* KeyN */:
        return 44 /* KeyN */;
      case 24 /* KeyO */:
        return 45 /* KeyO */;
      case 25 /* KeyP */:
        return 46 /* KeyP */;
      case 26 /* KeyQ */:
        return 47 /* KeyQ */;
      case 27 /* KeyR */:
        return 48 /* KeyR */;
      case 28 /* KeyS */:
        return 49 /* KeyS */;
      case 29 /* KeyT */:
        return 50 /* KeyT */;
      case 30 /* KeyU */:
        return 51 /* KeyU */;
      case 31 /* KeyV */:
        return 52 /* KeyV */;
      case 32 /* KeyW */:
        return 53 /* KeyW */;
      case 33 /* KeyX */:
        return 54 /* KeyX */;
      case 34 /* KeyY */:
        return 55 /* KeyY */;
      case 35 /* KeyZ */:
        return 56 /* KeyZ */;
      case 36 /* Digit1 */:
        return 22 /* Digit1 */;
      case 37 /* Digit2 */:
        return 23 /* Digit2 */;
      case 38 /* Digit3 */:
        return 24 /* Digit3 */;
      case 39 /* Digit4 */:
        return 25 /* Digit4 */;
      case 40 /* Digit5 */:
        return 26 /* Digit5 */;
      case 41 /* Digit6 */:
        return 27 /* Digit6 */;
      case 42 /* Digit7 */:
        return 28 /* Digit7 */;
      case 43 /* Digit8 */:
        return 29 /* Digit8 */;
      case 44 /* Digit9 */:
        return 30 /* Digit9 */;
      case 45 /* Digit0 */:
        return 21 /* Digit0 */;
      case 51 /* Minus */:
        return 88 /* Minus */;
      case 52 /* Equal */:
        return 86 /* Equal */;
      case 53 /* BracketLeft */:
        return 92 /* BracketLeft */;
      case 54 /* BracketRight */:
        return 94 /* BracketRight */;
      case 55 /* Backslash */:
        return 93 /* Backslash */;
      case 56 /* IntlHash */:
        return 0 /* Unknown */;
      // missing
      case 57 /* Semicolon */:
        return 85 /* Semicolon */;
      case 58 /* Quote */:
        return 95 /* Quote */;
      case 59 /* Backquote */:
        return 91 /* Backquote */;
      case 60 /* Comma */:
        return 87 /* Comma */;
      case 61 /* Period */:
        return 89 /* Period */;
      case 62 /* Slash */:
        return 90 /* Slash */;
      case 106 /* IntlBackslash */:
        return 97 /* IntlBackslash */;
    }
    return 0 /* Unknown */;
  }
  static _toKeyCodeChord(chord) {
    if (!chord) {
      return null;
    }
    if (chord instanceof KeyCodeChord) {
      return chord;
    }
    const keyCode = this._scanCodeToKeyCode(chord.scanCode);
    if (keyCode === 0 /* Unknown */) {
      return null;
    }
    return new KeyCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, keyCode);
  }
  static resolveKeybinding(keybinding, os) {
    const chords = toEmptyArrayIfContainsNull(keybinding.chords.map((chord) => this._toKeyCodeChord(chord)));
    if (chords.length > 0) {
      return [new _USLayoutResolvedKeybinding(chords, os)];
    }
    return [];
  }
};
export { USLayoutResolvedKeybinding };
