// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/keybinding/common/windowsKeyboardMapper.ts
import { BaseResolvedKeybinding } from "./module-1833.mjs";
import { IMMUTABLE_CODE_TO_KEY_CODE, KeyCodeUtils, NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE, ScanCodeUtils } from "./module-0019.mjs";
import { UILabelProvider } from "./module-0504.mjs";
import { KeyCodeChord, ScanCodeChord } from "./module-0021.mjs";
import { toEmptyArrayIfContainsNull } from "./module-1585.mjs";


// src/vs/workbench/services/keybinding/common/windowsKeyboardMapper.ts
var LOG = false;

function log3(str) {
  if (LOG) {
    console.info(str);
  }
}

var WindowsNativeResolvedKeybinding = class extends BaseResolvedKeybinding {
  constructor(mapper, chords) {
    super(1 /* Windows */, chords);
    this._mapper = mapper;
  }
  _getLabel(chord) {
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    return this._mapper.getUILabelForKeyCode(chord.keyCode);
  }
  _getUSLabelForKeybinding(chord) {
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    return KeyCodeUtils.toString(chord.keyCode);
  }
  getUSLabel() {
    return UILabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getUSLabelForKeybinding(keybinding));
  }
  _getAriaLabel(chord) {
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    return this._mapper.getAriaLabelForKeyCode(chord.keyCode);
  }
  _getElectronAccelerator(chord) {
    return this._mapper.getElectronAcceleratorForKeyBinding(chord);
  }
  _getUserSettingsLabel(chord) {
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    const result = this._mapper.getUserSettingsLabelForKeyCode(chord.keyCode);
    return result ? result.toLowerCase() : result;
  }
  _isWYSIWYG(chord) {
    return this.__isWYSIWYG(chord.keyCode);
  }
  __isWYSIWYG(keyCode) {
    if (keyCode === 15 /* LeftArrow */ || keyCode === 16 /* UpArrow */ || keyCode === 17 /* RightArrow */ || keyCode === 18 /* DownArrow */) {
      return true;
    }
    const ariaLabel = this._mapper.getAriaLabelForKeyCode(keyCode);
    const userSettingsLabel = this._mapper.getUserSettingsLabelForKeyCode(keyCode);
    return ariaLabel === userSettingsLabel;
  }
  _getChordDispatch(chord) {
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
  _getSingleModifierChordDispatch(chord) {
    if (chord.keyCode === 5 /* Ctrl */ && !chord.shiftKey && !chord.altKey && !chord.metaKey) {
      return "ctrl";
    }
    if (chord.keyCode === 4 /* Shift */ && !chord.ctrlKey && !chord.altKey && !chord.metaKey) {
      return "shift";
    }
    if (chord.keyCode === 6 /* Alt */ && !chord.ctrlKey && !chord.shiftKey && !chord.metaKey) {
      return "alt";
    }
    if (chord.keyCode === 57 /* Meta */ && !chord.ctrlKey && !chord.shiftKey && !chord.altKey) {
      return "meta";
    }
    return null;
  }
  static getProducedCharCode(chord, mapping2) {
    if (!mapping2) {
      return null;
    }
    if (chord.ctrlKey && chord.shiftKey && chord.altKey) {
      return mapping2.withShiftAltGr;
    }
    if (chord.ctrlKey && chord.altKey) {
      return mapping2.withAltGr;
    }
    if (chord.shiftKey) {
      return mapping2.withShift;
    }
    return mapping2.value;
  }
  static getProducedChar(chord, mapping2) {
    const char = this.getProducedCharCode(chord, mapping2);
    if (char === null || char.length === 0) {
      return " --- ";
    }
    return "  " + char + "  ";
  }
};

var WindowsKeyboardMapper = class {
  constructor(_isUSStandard, rawMappings, _mapAltGrToCtrlAlt) {
    this._isUSStandard = _isUSStandard;
    this._mapAltGrToCtrlAlt = _mapAltGrToCtrlAlt;
    this._keyCodeToLabel = [];
    this._scanCodeToKeyCode = [];
    this._keyCodeToLabel = [];
    this._keyCodeExists = [];
    this._keyCodeToLabel[0 /* Unknown */] = KeyCodeUtils.toString(0 /* Unknown */);
    for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
      const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
      if (immutableKeyCode !== -1 /* DependsOnKbLayout */) {
        this._scanCodeToKeyCode[scanCode] = immutableKeyCode;
        this._keyCodeToLabel[immutableKeyCode] = KeyCodeUtils.toString(immutableKeyCode);
        this._keyCodeExists[immutableKeyCode] = true;
      }
    }
    const producesLetter = [];
    let producesLetters = false;
    this._codeInfo = [];
    for (const strCode in rawMappings) {
      if (rawMappings.hasOwnProperty(strCode)) {
        const scanCode = ScanCodeUtils.toEnum(strCode);
        if (scanCode === 0 /* None */) {
          log3(`Unknown scanCode ${strCode} in mapping.`);
          continue;
        }
        const rawMapping = rawMappings[strCode];
        const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
        if (immutableKeyCode !== -1 /* DependsOnKbLayout */) {
          const keyCode2 = NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE[rawMapping.vkey] || 0 /* Unknown */;
          if (keyCode2 === 0 /* Unknown */ || immutableKeyCode === keyCode2) {
            continue;
          }
          if (scanCode !== 134 /* NumpadComma */) {
            continue;
          }
        }
        const value2 = rawMapping.value;
        const withShift = rawMapping.withShift;
        const withAltGr = rawMapping.withAltGr;
        const withShiftAltGr = rawMapping.withShiftAltGr;
        const keyCode = NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE[rawMapping.vkey] || 0 /* Unknown */;
        const mapping2 = {
          scanCode,
          keyCode,
          value: value2,
          withShift,
          withAltGr,
          withShiftAltGr
        };
        this._codeInfo[scanCode] = mapping2;
        this._scanCodeToKeyCode[scanCode] = keyCode;
        if (keyCode === 0 /* Unknown */) {
          continue;
        }
        this._keyCodeExists[keyCode] = true;
        if (value2.length === 0) {
          this._keyCodeToLabel[keyCode] = null;
        } else if (value2.length > 1) {
          this._keyCodeToLabel[keyCode] = value2;
        } else {
          const charCode = value2.charCodeAt(0);
          if (charCode >= 97 /* a */ && charCode <= 122 /* z */) {
            const upperCaseValue = 65 /* A */ + (charCode - 97 /* a */);
            producesLetter[upperCaseValue] = true;
            producesLetters = true;
            this._keyCodeToLabel[keyCode] = String.fromCharCode(65 /* A */ + (charCode - 97 /* a */));
          } else if (charCode >= 65 /* A */ && charCode <= 90 /* Z */) {
            producesLetter[charCode] = true;
            producesLetters = true;
            this._keyCodeToLabel[keyCode] = value2;
          } else {
            this._keyCodeToLabel[keyCode] = value2;
          }
        }
      }
    }
    const _registerLetterIfMissing = (charCode, keyCode) => {
      if (!producesLetter[charCode]) {
        this._keyCodeToLabel[keyCode] = String.fromCharCode(charCode);
      }
    };
    _registerLetterIfMissing(65 /* A */, 31 /* KeyA */);
    _registerLetterIfMissing(66 /* B */, 32 /* KeyB */);
    _registerLetterIfMissing(67 /* C */, 33 /* KeyC */);
    _registerLetterIfMissing(68 /* D */, 34 /* KeyD */);
    _registerLetterIfMissing(69 /* E */, 35 /* KeyE */);
    _registerLetterIfMissing(70 /* F */, 36 /* KeyF */);
    _registerLetterIfMissing(71 /* G */, 37 /* KeyG */);
    _registerLetterIfMissing(72 /* H */, 38 /* KeyH */);
    _registerLetterIfMissing(73 /* I */, 39 /* KeyI */);
    _registerLetterIfMissing(74 /* J */, 40 /* KeyJ */);
    _registerLetterIfMissing(75 /* K */, 41 /* KeyK */);
    _registerLetterIfMissing(76 /* L */, 42 /* KeyL */);
    _registerLetterIfMissing(77 /* M */, 43 /* KeyM */);
    _registerLetterIfMissing(78 /* N */, 44 /* KeyN */);
    _registerLetterIfMissing(79 /* O */, 45 /* KeyO */);
    _registerLetterIfMissing(80 /* P */, 46 /* KeyP */);
    _registerLetterIfMissing(81 /* Q */, 47 /* KeyQ */);
    _registerLetterIfMissing(82 /* R */, 48 /* KeyR */);
    _registerLetterIfMissing(83 /* S */, 49 /* KeyS */);
    _registerLetterIfMissing(84 /* T */, 50 /* KeyT */);
    _registerLetterIfMissing(85 /* U */, 51 /* KeyU */);
    _registerLetterIfMissing(86 /* V */, 52 /* KeyV */);
    _registerLetterIfMissing(87 /* W */, 53 /* KeyW */);
    _registerLetterIfMissing(88 /* X */, 54 /* KeyX */);
    _registerLetterIfMissing(89 /* Y */, 55 /* KeyY */);
    _registerLetterIfMissing(90 /* Z */, 56 /* KeyZ */);
    if (!producesLetters) {
      const _registerLabel = (keyCode, charCode) => {
        this._keyCodeToLabel[keyCode] = String.fromCharCode(charCode);
      };
      _registerLabel(85 /* Semicolon */, 59 /* Semicolon */);
      _registerLabel(86 /* Equal */, 61 /* Equals */);
      _registerLabel(87 /* Comma */, 44 /* Comma */);
      _registerLabel(88 /* Minus */, 45 /* Dash */);
      _registerLabel(89 /* Period */, 46 /* Period */);
      _registerLabel(90 /* Slash */, 47 /* Slash */);
      _registerLabel(91 /* Backquote */, 96 /* BackTick */);
      _registerLabel(92 /* BracketLeft */, 91 /* OpenSquareBracket */);
      _registerLabel(93 /* Backslash */, 92 /* Backslash */);
      _registerLabel(94 /* BracketRight */, 93 /* CloseSquareBracket */);
      _registerLabel(95 /* Quote */, 39 /* SingleQuote */);
    }
  }
  dumpDebugInfo() {
    const result = [];
    const immutableSamples = [
      88 /* ArrowUp */,
      104 /* Numpad0 */
    ];
    let cnt = 0;
    result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
    for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
      if (IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1 /* DependsOnKbLayout */) {
        if (immutableSamples.indexOf(scanCode) === -1) {
          continue;
        }
      }
      if (cnt % 6 === 0) {
        result.push(`|       HW Code combination      |  Key  |    KeyCode combination    |          UI label         |        User settings       | WYSIWYG |`);
        result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
      }
      cnt++;
      const mapping2 = this._codeInfo[scanCode];
      const strCode = ScanCodeUtils.toString(scanCode);
      const mods = [0, 2, 5, 7];
      for (const mod of mods) {
        const ctrlKey = mod & 1 ? true : false;
        const shiftKey = mod & 2 ? true : false;
        const altKey = mod & 4 ? true : false;
        const scanCodeChord = new ScanCodeChord(ctrlKey, shiftKey, altKey, false, scanCode);
        const keyCodeChord = this._resolveChord(scanCodeChord);
        const strKeyCode = keyCodeChord ? KeyCodeUtils.toString(keyCodeChord.keyCode) : null;
        const resolvedKb = keyCodeChord ? new WindowsNativeResolvedKeybinding(this, [keyCodeChord]) : null;
        const outScanCode = `${ctrlKey ? "Ctrl+" : ""}${shiftKey ? "Shift+" : ""}${altKey ? "Alt+" : ""}${strCode}`;
        const ariaLabel = resolvedKb ? resolvedKb.getAriaLabel() : null;
        const outUILabel = ariaLabel ? ariaLabel.replace(/Control\+/, "Ctrl+") : null;
        const outUserSettings = resolvedKb ? resolvedKb.getUserSettingsLabel() : null;
        const outKey = WindowsNativeResolvedKeybinding.getProducedChar(scanCodeChord, mapping2);
        const outKb = strKeyCode ? `${ctrlKey ? "Ctrl+" : ""}${shiftKey ? "Shift+" : ""}${altKey ? "Alt+" : ""}${strKeyCode}` : null;
        const isWYSIWYG = resolvedKb ? resolvedKb.isWYSIWYG() : false;
        const outWYSIWYG = isWYSIWYG ? "       " : "   NO  ";
        result.push(`| ${this._leftPad(outScanCode, 30)} | ${outKey} | ${this._leftPad(outKb, 25)} | ${this._leftPad(outUILabel, 25)} |  ${this._leftPad(outUserSettings, 25)} | ${outWYSIWYG} |`);
      }
      result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
    }
    return result.join("\n");
  }
  _leftPad(str, cnt) {
    if (str === null) {
      str = "null";
    }
    while (str.length < cnt) {
      str = " " + str;
    }
    return str;
  }
  getUILabelForKeyCode(keyCode) {
    return this._getLabelForKeyCode(keyCode);
  }
  getAriaLabelForKeyCode(keyCode) {
    return this._getLabelForKeyCode(keyCode);
  }
  getUserSettingsLabelForKeyCode(keyCode) {
    if (this._isUSStandard) {
      return KeyCodeUtils.toUserSettingsUS(keyCode);
    }
    return KeyCodeUtils.toUserSettingsGeneral(keyCode);
  }
  getElectronAcceleratorForKeyBinding(chord) {
    return KeyCodeUtils.toElectronAccelerator(chord.keyCode);
  }
  _getLabelForKeyCode(keyCode) {
    return this._keyCodeToLabel[keyCode] || KeyCodeUtils.toString(0 /* Unknown */);
  }
  resolveKeyboardEvent(keyboardEvent) {
    const ctrlKey = keyboardEvent.ctrlKey || this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey;
    const altKey = keyboardEvent.altKey || this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey;
    const chord = new KeyCodeChord(ctrlKey, keyboardEvent.shiftKey, altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
    return new WindowsNativeResolvedKeybinding(this, [chord]);
  }
  _resolveChord(chord) {
    if (!chord) {
      return null;
    }
    if (chord instanceof KeyCodeChord) {
      if (!this._keyCodeExists[chord.keyCode]) {
        return null;
      }
      return chord;
    }
    const keyCode = this._scanCodeToKeyCode[chord.scanCode] || 0 /* Unknown */;
    if (keyCode === 0 /* Unknown */ || !this._keyCodeExists[keyCode]) {
      return null;
    }
    return new KeyCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, keyCode);
  }
  resolveKeybinding(keybinding) {
    const chords = toEmptyArrayIfContainsNull(keybinding.chords.map((chord) => this._resolveChord(chord)));
    if (chords.length > 0) {
      return [new WindowsNativeResolvedKeybinding(this, chords)];
    }
    return [];
  }
};
export { log3, LOG, WindowsNativeResolvedKeybinding, WindowsKeyboardMapper };
