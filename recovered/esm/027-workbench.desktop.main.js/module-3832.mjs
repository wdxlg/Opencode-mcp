// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/keybinding/common/macLinuxKeyboardMapper.ts
import { BaseResolvedKeybinding } from "./module-1857.mjs";
import { IMMUTABLE_CODE_TO_KEY_CODE, IMMUTABLE_KEY_CODE_TO_CODE, KeyCodeUtils, ScanCodeUtils, isModifierKey } from "./module-0019.mjs";
import { KeyCodeChord, ScanCodeChord } from "./module-0021.mjs";


// src/vs/workbench/services/keybinding/common/macLinuxKeyboardMapper.ts
var CHAR_CODE_TO_KEY_CODE = [];

var NativeResolvedKeybinding = class extends BaseResolvedKeybinding {
  constructor(mapper, os, chords) {
    super(os, chords);
    this._mapper = mapper;
  }
  _getLabel(chord) {
    return this._mapper.getUILabelForScanCodeChord(chord);
  }
  _getAriaLabel(chord) {
    return this._mapper.getAriaLabelForScanCodeChord(chord);
  }
  _getElectronAccelerator(chord) {
    return this._mapper.getElectronAcceleratorLabelForScanCodeChord(chord);
  }
  _getUserSettingsLabel(chord) {
    return this._mapper.getUserSettingsLabelForScanCodeChord(chord);
  }
  _isWYSIWYG(binding) {
    if (!binding) {
      return true;
    }
    if (IMMUTABLE_CODE_TO_KEY_CODE[binding.scanCode] !== -1 /* DependsOnKbLayout */) {
      return true;
    }
    const a = this._mapper.getAriaLabelForScanCodeChord(binding);
    const b = this._mapper.getUserSettingsLabelForScanCodeChord(binding);
    if (!a && !b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.toLowerCase() === b.toLowerCase();
  }
  _getChordDispatch(chord) {
    return this._mapper.getDispatchStrForScanCodeChord(chord);
  }
  _getSingleModifierChordDispatch(chord) {
    if ((chord.scanCode === 157 /* ControlLeft */ || chord.scanCode === 161 /* ControlRight */) && !chord.shiftKey && !chord.altKey && !chord.metaKey) {
      return "ctrl";
    }
    if ((chord.scanCode === 159 /* AltLeft */ || chord.scanCode === 163 /* AltRight */) && !chord.ctrlKey && !chord.shiftKey && !chord.metaKey) {
      return "alt";
    }
    if ((chord.scanCode === 158 /* ShiftLeft */ || chord.scanCode === 162 /* ShiftRight */) && !chord.ctrlKey && !chord.altKey && !chord.metaKey) {
      return "shift";
    }
    if ((chord.scanCode === 160 /* MetaLeft */ || chord.scanCode === 164 /* MetaRight */) && !chord.ctrlKey && !chord.shiftKey && !chord.altKey) {
      return "meta";
    }
    return null;
  }
};

var ScanCodeCombo = class {
  constructor(ctrlKey, shiftKey, altKey, scanCode) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.scanCode = scanCode;
  }
  toString() {
    return `${this.ctrlKey ? "Ctrl+" : ""}${this.shiftKey ? "Shift+" : ""}${this.altKey ? "Alt+" : ""}${ScanCodeUtils.toString(this.scanCode)}`;
  }
  equals(other) {
    return this.ctrlKey === other.ctrlKey && this.shiftKey === other.shiftKey && this.altKey === other.altKey && this.scanCode === other.scanCode;
  }
  getProducedCharCode(mapping2) {
    if (!mapping2) {
      return "";
    }
    if (this.ctrlKey && this.shiftKey && this.altKey) {
      return mapping2.withShiftAltGr;
    }
    if (this.ctrlKey && this.altKey) {
      return mapping2.withAltGr;
    }
    if (this.shiftKey) {
      return mapping2.withShift;
    }
    return mapping2.value;
  }
  getProducedChar(mapping2) {
    const charCode = MacLinuxKeyboardMapper.getCharCode(this.getProducedCharCode(mapping2));
    if (charCode === 0) {
      return " --- ";
    }
    if (charCode >= 768 /* U_Combining_Grave_Accent */ && charCode <= 879 /* U_Combining_Latin_Small_Letter_X */) {
      return "U+" + charCode.toString(16);
    }
    return "  " + String.fromCharCode(charCode) + "  ";
  }
};

var KeyCodeCombo = class {
  constructor(ctrlKey, shiftKey, altKey, keyCode) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.keyCode = keyCode;
  }
  toString() {
    return `${this.ctrlKey ? "Ctrl+" : ""}${this.shiftKey ? "Shift+" : ""}${this.altKey ? "Alt+" : ""}${KeyCodeUtils.toString(this.keyCode)}`;
  }
};

var ScanCodeKeyCodeMapper = class {
  constructor() {
    /**
     * ScanCode combination => KeyCode combination.
     * Only covers relevant modifiers ctrl, shift, alt (since meta does not influence the mappings).
     */
    this._scanCodeToKeyCode = [];
    /**
     * inverse of `_scanCodeToKeyCode`.
     * KeyCode combination => ScanCode combination.
     * Only covers relevant modifiers ctrl, shift, alt (since meta does not influence the mappings).
     */
    this._keyCodeToScanCode = [];
    this._scanCodeToKeyCode = [];
    this._keyCodeToScanCode = [];
  }
  registrationComplete() {
    this._moveToEnd(56 /* IntlHash */);
    this._moveToEnd(106 /* IntlBackslash */);
  }
  _moveToEnd(scanCode) {
    for (let mod = 0; mod < 8; mod++) {
      const encodedKeyCodeCombos = this._scanCodeToKeyCode[(scanCode << 3) + mod];
      if (!encodedKeyCodeCombos) {
        continue;
      }
      for (let i2 = 0, len = encodedKeyCodeCombos.length; i2 < len; i2++) {
        const encodedScanCodeCombos = this._keyCodeToScanCode[encodedKeyCodeCombos[i2]];
        if (encodedScanCodeCombos.length === 1) {
          continue;
        }
        for (let j = 0, len2 = encodedScanCodeCombos.length; j < len2; j++) {
          const entry = encodedScanCodeCombos[j];
          const entryScanCode = entry >>> 3;
          if (entryScanCode === scanCode) {
            for (let k = j + 1; k < len2; k++) {
              encodedScanCodeCombos[k - 1] = encodedScanCodeCombos[k];
            }
            encodedScanCodeCombos[len2 - 1] = entry;
          }
        }
      }
    }
  }
  registerIfUnknown(scanCodeCombo, keyCodeCombo) {
    if (keyCodeCombo.keyCode === 0 /* Unknown */) {
      return;
    }
    const scanCodeComboEncoded = this._encodeScanCodeCombo(scanCodeCombo);
    const keyCodeComboEncoded = this._encodeKeyCodeCombo(keyCodeCombo);
    const keyCodeIsDigit = keyCodeCombo.keyCode >= 21 /* Digit0 */ && keyCodeCombo.keyCode <= 30 /* Digit9 */;
    const keyCodeIsLetter = keyCodeCombo.keyCode >= 31 /* KeyA */ && keyCodeCombo.keyCode <= 56 /* KeyZ */;
    const existingKeyCodeCombos = this._scanCodeToKeyCode[scanCodeComboEncoded];
    if (keyCodeIsDigit || keyCodeIsLetter) {
      if (existingKeyCodeCombos) {
        for (let i2 = 0, len = existingKeyCodeCombos.length; i2 < len; i2++) {
          if (existingKeyCodeCombos[i2] === keyCodeComboEncoded) {
            return;
          }
        }
      }
    } else {
      if (existingKeyCodeCombos && existingKeyCodeCombos.length !== 0) {
        return;
      }
    }
    this._scanCodeToKeyCode[scanCodeComboEncoded] = this._scanCodeToKeyCode[scanCodeComboEncoded] || [];
    this._scanCodeToKeyCode[scanCodeComboEncoded].unshift(keyCodeComboEncoded);
    this._keyCodeToScanCode[keyCodeComboEncoded] = this._keyCodeToScanCode[keyCodeComboEncoded] || [];
    this._keyCodeToScanCode[keyCodeComboEncoded].unshift(scanCodeComboEncoded);
  }
  lookupKeyCodeCombo(keyCodeCombo) {
    const keyCodeComboEncoded = this._encodeKeyCodeCombo(keyCodeCombo);
    const scanCodeCombosEncoded = this._keyCodeToScanCode[keyCodeComboEncoded];
    if (!scanCodeCombosEncoded || scanCodeCombosEncoded.length === 0) {
      return [];
    }
    const result = [];
    for (let i2 = 0, len = scanCodeCombosEncoded.length; i2 < len; i2++) {
      const scanCodeComboEncoded = scanCodeCombosEncoded[i2];
      const ctrlKey = scanCodeComboEncoded & 1 ? true : false;
      const shiftKey = scanCodeComboEncoded & 2 ? true : false;
      const altKey = scanCodeComboEncoded & 4 ? true : false;
      const scanCode = scanCodeComboEncoded >>> 3;
      result[i2] = new ScanCodeCombo(ctrlKey, shiftKey, altKey, scanCode);
    }
    return result;
  }
  lookupScanCodeCombo(scanCodeCombo) {
    const scanCodeComboEncoded = this._encodeScanCodeCombo(scanCodeCombo);
    const keyCodeCombosEncoded = this._scanCodeToKeyCode[scanCodeComboEncoded];
    if (!keyCodeCombosEncoded || keyCodeCombosEncoded.length === 0) {
      return [];
    }
    const result = [];
    for (let i2 = 0, len = keyCodeCombosEncoded.length; i2 < len; i2++) {
      const keyCodeComboEncoded = keyCodeCombosEncoded[i2];
      const ctrlKey = keyCodeComboEncoded & 1 ? true : false;
      const shiftKey = keyCodeComboEncoded & 2 ? true : false;
      const altKey = keyCodeComboEncoded & 4 ? true : false;
      const keyCode = keyCodeComboEncoded >>> 3;
      result[i2] = new KeyCodeCombo(ctrlKey, shiftKey, altKey, keyCode);
    }
    return result;
  }
  guessStableKeyCode(scanCode) {
    if (scanCode >= 36 /* Digit1 */ && scanCode <= 45 /* Digit0 */) {
      switch (scanCode) {
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
      }
    }
    const keyCodeCombos1 = this.lookupScanCodeCombo(new ScanCodeCombo(false, false, false, scanCode));
    const keyCodeCombos2 = this.lookupScanCodeCombo(new ScanCodeCombo(false, true, false, scanCode));
    if (keyCodeCombos1.length === 1 && keyCodeCombos2.length === 1) {
      const shiftKey1 = keyCodeCombos1[0].shiftKey;
      const keyCode1 = keyCodeCombos1[0].keyCode;
      const shiftKey2 = keyCodeCombos2[0].shiftKey;
      const keyCode2 = keyCodeCombos2[0].keyCode;
      if (keyCode1 === keyCode2 && shiftKey1 !== shiftKey2) {
        return keyCode1;
      }
    }
    return -1 /* DependsOnKbLayout */;
  }
  _encodeScanCodeCombo(scanCodeCombo) {
    return this._encode(scanCodeCombo.ctrlKey, scanCodeCombo.shiftKey, scanCodeCombo.altKey, scanCodeCombo.scanCode);
  }
  _encodeKeyCodeCombo(keyCodeCombo) {
    return this._encode(keyCodeCombo.ctrlKey, keyCodeCombo.shiftKey, keyCodeCombo.altKey, keyCodeCombo.keyCode);
  }
  _encode(ctrlKey, shiftKey, altKey, principal) {
    return ((ctrlKey ? 1 : 0) << 0 | (shiftKey ? 1 : 0) << 1 | (altKey ? 1 : 0) << 2 | principal << 3) >>> 0;
  }
};

var MacLinuxKeyboardMapper = class _MacLinuxKeyboardMapper {
  constructor(_isUSStandard, rawMappings, _mapAltGrToCtrlAlt, _OS) {
    this._isUSStandard = _isUSStandard;
    this._mapAltGrToCtrlAlt = _mapAltGrToCtrlAlt;
    this._OS = _OS;
    /**
     * UI label for a ScanCode.
     */
    this._scanCodeToLabel = [];
    /**
     * Dispatching string for a ScanCode.
     */
    this._scanCodeToDispatch = [];
    this._codeInfo = [];
    this._scanCodeKeyCodeMapper = new ScanCodeKeyCodeMapper();
    this._scanCodeToLabel = [];
    this._scanCodeToDispatch = [];
    const _registerIfUnknown = (hwCtrlKey, hwShiftKey, hwAltKey, scanCode, kbCtrlKey, kbShiftKey, kbAltKey, keyCode) => {
      this._scanCodeKeyCodeMapper.registerIfUnknown(
        new ScanCodeCombo(hwCtrlKey ? true : false, hwShiftKey ? true : false, hwAltKey ? true : false, scanCode),
        new KeyCodeCombo(kbCtrlKey ? true : false, kbShiftKey ? true : false, kbAltKey ? true : false, keyCode)
      );
    };
    const _registerAllCombos = (_ctrlKey, _shiftKey, _altKey, scanCode, keyCode) => {
      for (let ctrlKey = _ctrlKey; ctrlKey <= 1; ctrlKey++) {
        for (let shiftKey = _shiftKey; shiftKey <= 1; shiftKey++) {
          for (let altKey = _altKey; altKey <= 1; altKey++) {
            _registerIfUnknown(
              ctrlKey,
              shiftKey,
              altKey,
              scanCode,
              ctrlKey,
              shiftKey,
              altKey,
              keyCode
            );
          }
        }
      }
    };
    for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
      this._scanCodeToLabel[scanCode] = null;
    }
    for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
      this._scanCodeToDispatch[scanCode] = null;
    }
    for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
      const keyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
      if (keyCode !== -1 /* DependsOnKbLayout */) {
        _registerAllCombos(0, 0, 0, scanCode, keyCode);
        this._scanCodeToLabel[scanCode] = KeyCodeUtils.toString(keyCode);
        if (keyCode === 0 /* Unknown */ || isModifierKey(keyCode)) {
          this._scanCodeToDispatch[scanCode] = null;
        } else {
          this._scanCodeToDispatch[scanCode] = `[${ScanCodeUtils.toString(scanCode)}]`;
        }
      }
    }
    const missingLatinLettersOverride = {};
    {
      const producesLatinLetter = [];
      for (const strScanCode in rawMappings) {
        if (rawMappings.hasOwnProperty(strScanCode)) {
          const scanCode = ScanCodeUtils.toEnum(strScanCode);
          if (scanCode === 0 /* None */) {
            continue;
          }
          if (IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1 /* DependsOnKbLayout */) {
            continue;
          }
          const rawMapping = rawMappings[strScanCode];
          const value2 = _MacLinuxKeyboardMapper.getCharCode(rawMapping.value);
          if (value2 >= 97 /* a */ && value2 <= 122 /* z */) {
            const upperCaseValue = 65 /* A */ + (value2 - 97 /* a */);
            producesLatinLetter[upperCaseValue] = true;
          }
        }
      }
      const _registerLetterIfMissing = (charCode, scanCode, value2, withShift) => {
        if (!producesLatinLetter[charCode]) {
          missingLatinLettersOverride[ScanCodeUtils.toString(scanCode)] = {
            value: value2,
            withShift,
            withAltGr: "",
            withShiftAltGr: ""
          };
        }
      };
      _registerLetterIfMissing(65 /* A */, 10 /* KeyA */, "a", "A");
      _registerLetterIfMissing(66 /* B */, 11 /* KeyB */, "b", "B");
      _registerLetterIfMissing(67 /* C */, 12 /* KeyC */, "c", "C");
      _registerLetterIfMissing(68 /* D */, 13 /* KeyD */, "d", "D");
      _registerLetterIfMissing(69 /* E */, 14 /* KeyE */, "e", "E");
      _registerLetterIfMissing(70 /* F */, 15 /* KeyF */, "f", "F");
      _registerLetterIfMissing(71 /* G */, 16 /* KeyG */, "g", "G");
      _registerLetterIfMissing(72 /* H */, 17 /* KeyH */, "h", "H");
      _registerLetterIfMissing(73 /* I */, 18 /* KeyI */, "i", "I");
      _registerLetterIfMissing(74 /* J */, 19 /* KeyJ */, "j", "J");
      _registerLetterIfMissing(75 /* K */, 20 /* KeyK */, "k", "K");
      _registerLetterIfMissing(76 /* L */, 21 /* KeyL */, "l", "L");
      _registerLetterIfMissing(77 /* M */, 22 /* KeyM */, "m", "M");
      _registerLetterIfMissing(78 /* N */, 23 /* KeyN */, "n", "N");
      _registerLetterIfMissing(79 /* O */, 24 /* KeyO */, "o", "O");
      _registerLetterIfMissing(80 /* P */, 25 /* KeyP */, "p", "P");
      _registerLetterIfMissing(81 /* Q */, 26 /* KeyQ */, "q", "Q");
      _registerLetterIfMissing(82 /* R */, 27 /* KeyR */, "r", "R");
      _registerLetterIfMissing(83 /* S */, 28 /* KeyS */, "s", "S");
      _registerLetterIfMissing(84 /* T */, 29 /* KeyT */, "t", "T");
      _registerLetterIfMissing(85 /* U */, 30 /* KeyU */, "u", "U");
      _registerLetterIfMissing(86 /* V */, 31 /* KeyV */, "v", "V");
      _registerLetterIfMissing(87 /* W */, 32 /* KeyW */, "w", "W");
      _registerLetterIfMissing(88 /* X */, 33 /* KeyX */, "x", "X");
      _registerLetterIfMissing(89 /* Y */, 34 /* KeyY */, "y", "Y");
      _registerLetterIfMissing(90 /* Z */, 35 /* KeyZ */, "z", "Z");
    }
    const mappings = [];
    let mappingsLen = 0;
    for (const strScanCode in rawMappings) {
      if (rawMappings.hasOwnProperty(strScanCode)) {
        const scanCode = ScanCodeUtils.toEnum(strScanCode);
        if (scanCode === 0 /* None */) {
          continue;
        }
        if (IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1 /* DependsOnKbLayout */) {
          continue;
        }
        this._codeInfo[scanCode] = rawMappings[strScanCode];
        const rawMapping = missingLatinLettersOverride[strScanCode] || rawMappings[strScanCode];
        const value2 = _MacLinuxKeyboardMapper.getCharCode(rawMapping.value);
        const withShift = _MacLinuxKeyboardMapper.getCharCode(rawMapping.withShift);
        const withAltGr = _MacLinuxKeyboardMapper.getCharCode(rawMapping.withAltGr);
        const withShiftAltGr = _MacLinuxKeyboardMapper.getCharCode(rawMapping.withShiftAltGr);
        const mapping2 = {
          scanCode,
          value: value2,
          withShift,
          withAltGr,
          withShiftAltGr
        };
        mappings[mappingsLen++] = mapping2;
        this._scanCodeToDispatch[scanCode] = `[${ScanCodeUtils.toString(scanCode)}]`;
        if (value2 >= 97 /* a */ && value2 <= 122 /* z */) {
          const upperCaseValue = 65 /* A */ + (value2 - 97 /* a */);
          this._scanCodeToLabel[scanCode] = String.fromCharCode(upperCaseValue);
        } else if (value2 >= 65 /* A */ && value2 <= 90 /* Z */) {
          this._scanCodeToLabel[scanCode] = String.fromCharCode(value2);
        } else if (value2) {
          this._scanCodeToLabel[scanCode] = String.fromCharCode(value2);
        } else {
          this._scanCodeToLabel[scanCode] = null;
        }
      }
    }
    for (let i2 = mappings.length - 1; i2 >= 0; i2--) {
      const mapping2 = mappings[i2];
      const scanCode = mapping2.scanCode;
      const withShiftAltGr = mapping2.withShiftAltGr;
      if (withShiftAltGr === mapping2.withAltGr || withShiftAltGr === mapping2.withShift || withShiftAltGr === mapping2.value) {
        continue;
      }
      const kb = _MacLinuxKeyboardMapper._charCodeToKb(withShiftAltGr);
      if (!kb) {
        continue;
      }
      const kbShiftKey = kb.shiftKey;
      const keyCode = kb.keyCode;
      if (kbShiftKey) {
        _registerIfUnknown(1, 1, 1, scanCode, 0, 1, 0, keyCode);
      } else {
        _registerIfUnknown(1, 1, 1, scanCode, 0, 0, 0, keyCode);
      }
    }
    for (let i2 = mappings.length - 1; i2 >= 0; i2--) {
      const mapping2 = mappings[i2];
      const scanCode = mapping2.scanCode;
      const withAltGr = mapping2.withAltGr;
      if (withAltGr === mapping2.withShift || withAltGr === mapping2.value) {
        continue;
      }
      const kb = _MacLinuxKeyboardMapper._charCodeToKb(withAltGr);
      if (!kb) {
        continue;
      }
      const kbShiftKey = kb.shiftKey;
      const keyCode = kb.keyCode;
      if (kbShiftKey) {
        _registerIfUnknown(1, 0, 1, scanCode, 0, 1, 0, keyCode);
      } else {
        _registerIfUnknown(1, 0, 1, scanCode, 0, 0, 0, keyCode);
      }
    }
    for (let i2 = mappings.length - 1; i2 >= 0; i2--) {
      const mapping2 = mappings[i2];
      const scanCode = mapping2.scanCode;
      const withShift = mapping2.withShift;
      if (withShift === mapping2.value) {
        continue;
      }
      const kb = _MacLinuxKeyboardMapper._charCodeToKb(withShift);
      if (!kb) {
        continue;
      }
      const kbShiftKey = kb.shiftKey;
      const keyCode = kb.keyCode;
      if (kbShiftKey) {
        _registerIfUnknown(0, 1, 0, scanCode, 0, 1, 0, keyCode);
        _registerIfUnknown(0, 1, 1, scanCode, 0, 1, 1, keyCode);
        _registerIfUnknown(1, 1, 0, scanCode, 1, 1, 0, keyCode);
        _registerIfUnknown(1, 1, 1, scanCode, 1, 1, 1, keyCode);
      } else {
        _registerIfUnknown(0, 1, 0, scanCode, 0, 0, 0, keyCode);
        _registerIfUnknown(0, 1, 0, scanCode, 0, 1, 0, keyCode);
        _registerIfUnknown(0, 1, 1, scanCode, 0, 0, 1, keyCode);
        _registerIfUnknown(0, 1, 1, scanCode, 0, 1, 1, keyCode);
        _registerIfUnknown(1, 1, 0, scanCode, 1, 0, 0, keyCode);
        _registerIfUnknown(1, 1, 0, scanCode, 1, 1, 0, keyCode);
        _registerIfUnknown(1, 1, 1, scanCode, 1, 0, 1, keyCode);
        _registerIfUnknown(1, 1, 1, scanCode, 1, 1, 1, keyCode);
      }
    }
    for (let i2 = mappings.length - 1; i2 >= 0; i2--) {
      const mapping2 = mappings[i2];
      const scanCode = mapping2.scanCode;
      const kb = _MacLinuxKeyboardMapper._charCodeToKb(mapping2.value);
      if (!kb) {
        continue;
      }
      const kbShiftKey = kb.shiftKey;
      const keyCode = kb.keyCode;
      if (kbShiftKey) {
        _registerIfUnknown(0, 0, 0, scanCode, 0, 1, 0, keyCode);
        _registerIfUnknown(0, 0, 1, scanCode, 0, 1, 1, keyCode);
        _registerIfUnknown(1, 0, 0, scanCode, 1, 1, 0, keyCode);
        _registerIfUnknown(1, 0, 1, scanCode, 1, 1, 1, keyCode);
      } else {
        _registerIfUnknown(0, 0, 0, scanCode, 0, 0, 0, keyCode);
        _registerIfUnknown(0, 0, 1, scanCode, 0, 0, 1, keyCode);
        _registerIfUnknown(0, 1, 0, scanCode, 0, 1, 0, keyCode);
        _registerIfUnknown(0, 1, 1, scanCode, 0, 1, 1, keyCode);
        _registerIfUnknown(1, 0, 0, scanCode, 1, 0, 0, keyCode);
        _registerIfUnknown(1, 0, 1, scanCode, 1, 0, 1, keyCode);
        _registerIfUnknown(1, 1, 0, scanCode, 1, 1, 0, keyCode);
        _registerIfUnknown(1, 1, 1, scanCode, 1, 1, 1, keyCode);
      }
    }
    _registerAllCombos(0, 0, 0, 36 /* Digit1 */, 22 /* Digit1 */);
    _registerAllCombos(0, 0, 0, 37 /* Digit2 */, 23 /* Digit2 */);
    _registerAllCombos(0, 0, 0, 38 /* Digit3 */, 24 /* Digit3 */);
    _registerAllCombos(0, 0, 0, 39 /* Digit4 */, 25 /* Digit4 */);
    _registerAllCombos(0, 0, 0, 40 /* Digit5 */, 26 /* Digit5 */);
    _registerAllCombos(0, 0, 0, 41 /* Digit6 */, 27 /* Digit6 */);
    _registerAllCombos(0, 0, 0, 42 /* Digit7 */, 28 /* Digit7 */);
    _registerAllCombos(0, 0, 0, 43 /* Digit8 */, 29 /* Digit8 */);
    _registerAllCombos(0, 0, 0, 44 /* Digit9 */, 30 /* Digit9 */);
    _registerAllCombos(0, 0, 0, 45 /* Digit0 */, 21 /* Digit0 */);
    this._scanCodeKeyCodeMapper.registrationComplete();
  }
  dumpDebugInfo() {
    const result = [];
    const immutableSamples = [
      88 /* ArrowUp */,
      104 /* Numpad0 */
    ];
    let cnt = 0;
    result.push(`isUSStandard: ${this._isUSStandard}`);
    result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
    for (let scanCode = 0 /* None */; scanCode < 193 /* MAX_VALUE */; scanCode++) {
      if (IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1 /* DependsOnKbLayout */) {
        if (immutableSamples.indexOf(scanCode) === -1) {
          continue;
        }
      }
      if (cnt % 4 === 0) {
        result.push(`|       HW Code combination      |  Key  |    KeyCode combination    | Pri |          UI label         |         User settings          |    Electron accelerator   |       Dispatching string       | WYSIWYG |`);
        result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
      }
      cnt++;
      const mapping2 = this._codeInfo[scanCode];
      for (let mod = 0; mod < 8; mod++) {
        const hwCtrlKey = mod & 1 ? true : false;
        const hwShiftKey = mod & 2 ? true : false;
        const hwAltKey = mod & 4 ? true : false;
        const scanCodeCombo = new ScanCodeCombo(hwCtrlKey, hwShiftKey, hwAltKey, scanCode);
        const resolvedKb = this.resolveKeyboardEvent({
          _standardKeyboardEventBrand: true,
          ctrlKey: scanCodeCombo.ctrlKey,
          shiftKey: scanCodeCombo.shiftKey,
          altKey: scanCodeCombo.altKey,
          metaKey: false,
          altGraphKey: false,
          keyCode: -1 /* DependsOnKbLayout */,
          code: ScanCodeUtils.toString(scanCode)
        });
        const outScanCodeCombo = scanCodeCombo.toString();
        const outKey = scanCodeCombo.getProducedChar(mapping2);
        const ariaLabel = resolvedKb.getAriaLabel();
        const outUILabel = ariaLabel ? ariaLabel.replace(/Control\+/, "Ctrl+") : null;
        const outUserSettings = resolvedKb.getUserSettingsLabel();
        const outElectronAccelerator = resolvedKb.getElectronAccelerator();
        const outDispatchStr = resolvedKb.getDispatchChords()[0];
        const isWYSIWYG = resolvedKb ? resolvedKb.isWYSIWYG() : false;
        const outWYSIWYG = isWYSIWYG ? "       " : "   NO  ";
        const kbCombos = this._scanCodeKeyCodeMapper.lookupScanCodeCombo(scanCodeCombo);
        if (kbCombos.length === 0) {
          result.push(`| ${this._leftPad(outScanCodeCombo, 30)} | ${outKey} | ${this._leftPad("", 25)} | ${this._leftPad("", 3)} | ${this._leftPad(outUILabel, 25)} | ${this._leftPad(outUserSettings, 30)} | ${this._leftPad(outElectronAccelerator, 25)} | ${this._leftPad(outDispatchStr, 30)} | ${outWYSIWYG} |`);
        } else {
          for (let i2 = 0, len = kbCombos.length; i2 < len; i2++) {
            const kbCombo = kbCombos[i2];
            let colPriority;
            const scanCodeCombos = this._scanCodeKeyCodeMapper.lookupKeyCodeCombo(kbCombo);
            if (scanCodeCombos.length === 1) {
              colPriority = "";
            } else {
              let priority = -1;
              for (let j = 0; j < scanCodeCombos.length; j++) {
                if (scanCodeCombos[j].equals(scanCodeCombo)) {
                  priority = j + 1;
                  break;
                }
              }
              colPriority = String(priority);
            }
            const outKeybinding = kbCombo.toString();
            if (i2 === 0) {
              result.push(`| ${this._leftPad(outScanCodeCombo, 30)} | ${outKey} | ${this._leftPad(outKeybinding, 25)} | ${this._leftPad(colPriority, 3)} | ${this._leftPad(outUILabel, 25)} | ${this._leftPad(outUserSettings, 30)} | ${this._leftPad(outElectronAccelerator, 25)} | ${this._leftPad(outDispatchStr, 30)} | ${outWYSIWYG} |`);
            } else {
              result.push(`| ${this._leftPad("", 30)} |       | ${this._leftPad(outKeybinding, 25)} | ${this._leftPad(colPriority, 3)} | ${this._leftPad("", 25)} | ${this._leftPad("", 30)} | ${this._leftPad("", 25)} | ${this._leftPad("", 30)} |         |`);
            }
          }
        }
      }
      result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
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
  keyCodeChordToScanCodeChord(chord) {
    if (chord.keyCode === 3 /* Enter */) {
      return [new ScanCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, 46 /* Enter */)];
    }
    const scanCodeCombos = this._scanCodeKeyCodeMapper.lookupKeyCodeCombo(
      new KeyCodeCombo(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.keyCode)
    );
    const result = [];
    for (let i2 = 0, len = scanCodeCombos.length; i2 < len; i2++) {
      const scanCodeCombo = scanCodeCombos[i2];
      result[i2] = new ScanCodeChord(scanCodeCombo.ctrlKey, scanCodeCombo.shiftKey, scanCodeCombo.altKey, chord.metaKey, scanCodeCombo.scanCode);
    }
    return result;
  }
  getUILabelForScanCodeChord(chord) {
    if (!chord) {
      return null;
    }
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    if (this._OS === 2 /* Macintosh */) {
      switch (chord.scanCode) {
        case 86 /* ArrowLeft */:
          return "\u2190";
        case 88 /* ArrowUp */:
          return "\u2191";
        case 85 /* ArrowRight */:
          return "\u2192";
        case 87 /* ArrowDown */:
          return "\u2193";
      }
    }
    return this._scanCodeToLabel[chord.scanCode];
  }
  getAriaLabelForScanCodeChord(chord) {
    if (!chord) {
      return null;
    }
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    return this._scanCodeToLabel[chord.scanCode];
  }
  getDispatchStrForScanCodeChord(chord) {
    const codeDispatch = this._scanCodeToDispatch[chord.scanCode];
    if (!codeDispatch) {
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
    result += codeDispatch;
    return result;
  }
  getUserSettingsLabelForScanCodeChord(chord) {
    if (!chord) {
      return null;
    }
    if (chord.isDuplicateModifierCase()) {
      return "";
    }
    const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[chord.scanCode];
    if (immutableKeyCode !== -1 /* DependsOnKbLayout */) {
      return KeyCodeUtils.toUserSettingsUS(immutableKeyCode).toLowerCase();
    }
    const constantKeyCode = this._scanCodeKeyCodeMapper.guessStableKeyCode(chord.scanCode);
    if (constantKeyCode !== -1 /* DependsOnKbLayout */) {
      const reverseChords = this.keyCodeChordToScanCodeChord(new KeyCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, constantKeyCode));
      for (let i2 = 0, len = reverseChords.length; i2 < len; i2++) {
        const reverseChord = reverseChords[i2];
        if (reverseChord.scanCode === chord.scanCode) {
          return KeyCodeUtils.toUserSettingsUS(constantKeyCode).toLowerCase();
        }
      }
    }
    return this._scanCodeToDispatch[chord.scanCode];
  }
  getElectronAcceleratorLabelForScanCodeChord(chord) {
    if (!chord) {
      return null;
    }
    const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[chord.scanCode];
    if (immutableKeyCode !== -1 /* DependsOnKbLayout */) {
      return KeyCodeUtils.toElectronAccelerator(immutableKeyCode);
    }
    const constantKeyCode = this._scanCodeKeyCodeMapper.guessStableKeyCode(chord.scanCode);
    if (this._OS === 3 /* Linux */ && !this._isUSStandard) {
      const isOEMKey = constantKeyCode === 85 /* Semicolon */ || constantKeyCode === 86 /* Equal */ || constantKeyCode === 87 /* Comma */ || constantKeyCode === 88 /* Minus */ || constantKeyCode === 89 /* Period */ || constantKeyCode === 90 /* Slash */ || constantKeyCode === 91 /* Backquote */ || constantKeyCode === 92 /* BracketLeft */ || constantKeyCode === 93 /* Backslash */ || constantKeyCode === 94 /* BracketRight */;
      if (isOEMKey) {
        return null;
      }
    }
    if (constantKeyCode !== -1 /* DependsOnKbLayout */) {
      return KeyCodeUtils.toElectronAccelerator(constantKeyCode);
    }
    return null;
  }
  _toResolvedKeybinding(chordParts) {
    if (chordParts.length === 0) {
      return [];
    }
    const result = [];
    this._generateResolvedKeybindings(chordParts, 0, [], result);
    return result;
  }
  _generateResolvedKeybindings(chordParts, currentIndex, previousParts, result) {
    const chordPart = chordParts[currentIndex];
    const isFinalIndex = currentIndex === chordParts.length - 1;
    for (let i2 = 0, len = chordPart.length; i2 < len; i2++) {
      const chords = [...previousParts, chordPart[i2]];
      if (isFinalIndex) {
        result.push(new NativeResolvedKeybinding(this, this._OS, chords));
      } else {
        this._generateResolvedKeybindings(chordParts, currentIndex + 1, chords, result);
      }
    }
  }
  resolveKeyboardEvent(keyboardEvent) {
    let code = ScanCodeUtils.toEnum(keyboardEvent.code);
    if (code === 94 /* NumpadEnter */) {
      code = 46 /* Enter */;
    }
    const keyCode = keyboardEvent.keyCode;
    if (keyCode === 15 /* LeftArrow */ || keyCode === 16 /* UpArrow */ || keyCode === 17 /* RightArrow */ || keyCode === 18 /* DownArrow */ || keyCode === 20 /* Delete */ || keyCode === 19 /* Insert */ || keyCode === 14 /* Home */ || keyCode === 13 /* End */ || keyCode === 12 /* PageDown */ || keyCode === 11 /* PageUp */ || keyCode === 1 /* Backspace */) {
      const immutableScanCode = IMMUTABLE_KEY_CODE_TO_CODE[keyCode];
      if (immutableScanCode !== -1 /* DependsOnKbLayout */) {
        code = immutableScanCode;
      }
    } else {
      if (code === 95 /* Numpad1 */ || code === 96 /* Numpad2 */ || code === 97 /* Numpad3 */ || code === 98 /* Numpad4 */ || code === 99 /* Numpad5 */ || code === 100 /* Numpad6 */ || code === 101 /* Numpad7 */ || code === 102 /* Numpad8 */ || code === 103 /* Numpad9 */ || code === 104 /* Numpad0 */ || code === 105 /* NumpadDecimal */) {
        if (keyCode >= 0) {
          const immutableScanCode = IMMUTABLE_KEY_CODE_TO_CODE[keyCode];
          if (immutableScanCode !== -1 /* DependsOnKbLayout */) {
            code = immutableScanCode;
          }
        }
      }
    }
    const ctrlKey = keyboardEvent.ctrlKey || this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey;
    const altKey = keyboardEvent.altKey || this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey;
    const chord = new ScanCodeChord(ctrlKey, keyboardEvent.shiftKey, altKey, keyboardEvent.metaKey, code);
    return new NativeResolvedKeybinding(this, this._OS, [chord]);
  }
  _resolveChord(chord) {
    if (!chord) {
      return [];
    }
    if (chord instanceof ScanCodeChord) {
      return [chord];
    }
    return this.keyCodeChordToScanCodeChord(chord);
  }
  resolveKeybinding(keybinding) {
    const chords = keybinding.chords.map((chord) => this._resolveChord(chord));
    return this._toResolvedKeybinding(chords);
  }
  static _redirectCharCode(charCode) {
    switch (charCode) {
      // allow-any-unicode-next-line
      // CJK: 。 「 」 【 】 ； ，
      // map: . [ ] [ ] ; ,
      case 12290 /* U_IDEOGRAPHIC_FULL_STOP */:
        return 46 /* Period */;
      case 12300 /* U_LEFT_CORNER_BRACKET */:
        return 91 /* OpenSquareBracket */;
      case 12301 /* U_RIGHT_CORNER_BRACKET */:
        return 93 /* CloseSquareBracket */;
      case 12304 /* U_LEFT_BLACK_LENTICULAR_BRACKET */:
        return 91 /* OpenSquareBracket */;
      case 12305 /* U_RIGHT_BLACK_LENTICULAR_BRACKET */:
        return 93 /* CloseSquareBracket */;
      case 65307 /* U_FULLWIDTH_SEMICOLON */:
        return 59 /* Semicolon */;
      case 65292 /* U_FULLWIDTH_COMMA */:
        return 44 /* Comma */;
    }
    return charCode;
  }
  static _charCodeToKb(charCode) {
    charCode = this._redirectCharCode(charCode);
    if (charCode < CHAR_CODE_TO_KEY_CODE.length) {
      return CHAR_CODE_TO_KEY_CODE[charCode];
    }
    return null;
  }
  /**
   * Attempt to map a combining character to a regular one that renders the same way.
   *
   * https://www.compart.com/en/unicode/bidiclass/NSM
   */
  static getCharCode(char) {
    if (char.length === 0) {
      return 0;
    }
    const charCode = char.charCodeAt(0);
    switch (charCode) {
      case 768 /* U_Combining_Grave_Accent */:
        return 96 /* U_GRAVE_ACCENT */;
      case 769 /* U_Combining_Acute_Accent */:
        return 180 /* U_ACUTE_ACCENT */;
      case 770 /* U_Combining_Circumflex_Accent */:
        return 94 /* U_CIRCUMFLEX */;
      case 771 /* U_Combining_Tilde */:
        return 732 /* U_SMALL_TILDE */;
      case 772 /* U_Combining_Macron */:
        return 175 /* U_MACRON */;
      case 773 /* U_Combining_Overline */:
        return 8254 /* U_OVERLINE */;
      case 774 /* U_Combining_Breve */:
        return 728 /* U_BREVE */;
      case 775 /* U_Combining_Dot_Above */:
        return 729 /* U_DOT_ABOVE */;
      case 776 /* U_Combining_Diaeresis */:
        return 168 /* U_DIAERESIS */;
      case 778 /* U_Combining_Ring_Above */:
        return 730 /* U_RING_ABOVE */;
      case 779 /* U_Combining_Double_Acute_Accent */:
        return 733 /* U_DOUBLE_ACUTE_ACCENT */;
    }
    return charCode;
  }
};

(function() {
  function define2(charCode, keyCode, shiftKey) {
    for (let i2 = CHAR_CODE_TO_KEY_CODE.length; i2 < charCode; i2++) {
      CHAR_CODE_TO_KEY_CODE[i2] = null;
    }
    CHAR_CODE_TO_KEY_CODE[charCode] = { keyCode, shiftKey };
  }
  for (let chCode = 65 /* A */; chCode <= 90 /* Z */; chCode++) {
    define2(chCode, 31 /* KeyA */ + (chCode - 65 /* A */), true);
  }
  for (let chCode = 97 /* a */; chCode <= 122 /* z */; chCode++) {
    define2(chCode, 31 /* KeyA */ + (chCode - 97 /* a */), false);
  }
  define2(59 /* Semicolon */, 85 /* Semicolon */, false);
  define2(58 /* Colon */, 85 /* Semicolon */, true);
  define2(61 /* Equals */, 86 /* Equal */, false);
  define2(43 /* Plus */, 86 /* Equal */, true);
  define2(44 /* Comma */, 87 /* Comma */, false);
  define2(60 /* LessThan */, 87 /* Comma */, true);
  define2(45 /* Dash */, 88 /* Minus */, false);
  define2(95 /* Underline */, 88 /* Minus */, true);
  define2(46 /* Period */, 89 /* Period */, false);
  define2(62 /* GreaterThan */, 89 /* Period */, true);
  define2(47 /* Slash */, 90 /* Slash */, false);
  define2(63 /* QuestionMark */, 90 /* Slash */, true);
  define2(96 /* BackTick */, 91 /* Backquote */, false);
  define2(126 /* Tilde */, 91 /* Backquote */, true);
  define2(91 /* OpenSquareBracket */, 92 /* BracketLeft */, false);
  define2(123 /* OpenCurlyBrace */, 92 /* BracketLeft */, true);
  define2(92 /* Backslash */, 93 /* Backslash */, false);
  define2(124 /* Pipe */, 93 /* Backslash */, true);
  define2(93 /* CloseSquareBracket */, 94 /* BracketRight */, false);
  define2(125 /* CloseCurlyBrace */, 94 /* BracketRight */, true);
  define2(39 /* SingleQuote */, 95 /* Quote */, false);
  define2(34 /* DoubleQuote */, 95 /* Quote */, true);
})();
export { CHAR_CODE_TO_KEY_CODE, NativeResolvedKeybinding, ScanCodeCombo, KeyCodeCombo, ScanCodeKeyCodeMapper, MacLinuxKeyboardMapper };
