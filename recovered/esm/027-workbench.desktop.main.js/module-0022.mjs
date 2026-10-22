// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/keyboardEvent.ts
import { EVENT_KEY_CODE_MAP, KeyCodeUtils, isModifierKey } from "./module-0019.mjs";
import { isFirefox2, isWebKit } from "./module-0018.mjs";
import { isLinux, isMacintosh } from "./module-0014.mjs";
import { KeyCodeChord } from "./module-0021.mjs";


// src/vs/base/browser/keyboardEvent.ts
function extractKeyCode(e) {
  if (e.charCode) {
    const char = String.fromCharCode(e.charCode).toUpperCase();
    return KeyCodeUtils.fromString(char);
  }
  const keyCode = e.keyCode;
  if (keyCode === 3) {
    return 7 /* PauseBreak */;
  } else if (isFirefox2) {
    switch (keyCode) {
      case 59:
        return 85 /* Semicolon */;
      case 60:
        if (isLinux) {
          return 97 /* IntlBackslash */;
        }
        break;
      case 61:
        return 86 /* Equal */;
      // based on: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#numpad_keys
      case 107:
        return 109 /* NumpadAdd */;
      case 109:
        return 111 /* NumpadSubtract */;
      case 173:
        return 88 /* Minus */;
      case 224:
        if (isMacintosh) {
          return 57 /* Meta */;
        }
        break;
    }
  } else if (isWebKit) {
    if (isMacintosh && keyCode === 93) {
      return 57 /* Meta */;
    } else if (!isMacintosh && keyCode === 92) {
      return 57 /* Meta */;
    }
  }
  return EVENT_KEY_CODE_MAP[keyCode] || 0 /* Unknown */;
}

var ctrlKeyMod = isMacintosh ? 256 /* WinCtrl */ : 2048 /* CtrlCmd */;

var altKeyMod = 512 /* Alt */;

var shiftKeyMod = 1024 /* Shift */;

var metaKeyMod = isMacintosh ? 2048 /* CtrlCmd */ : 256 /* WinCtrl */;

function printKeyboardEvent(e) {
  const modifiers = [];
  if (e.ctrlKey) {
    modifiers.push(`ctrl`);
  }
  if (e.shiftKey) {
    modifiers.push(`shift`);
  }
  if (e.altKey) {
    modifiers.push(`alt`);
  }
  if (e.metaKey) {
    modifiers.push(`meta`);
  }
  return `modifiers: [${modifiers.join(",")}], code: ${e.code}, keyCode: ${e.keyCode}, key: ${e.key}`;
}

function printStandardKeyboardEvent(e) {
  const modifiers = [];
  if (e.ctrlKey) {
    modifiers.push(`ctrl`);
  }
  if (e.shiftKey) {
    modifiers.push(`shift`);
  }
  if (e.altKey) {
    modifiers.push(`alt`);
  }
  if (e.metaKey) {
    modifiers.push(`meta`);
  }
  return `modifiers: [${modifiers.join(",")}], code: ${e.code}, keyCode: ${e.keyCode} ('${KeyCodeUtils.toString(e.keyCode)}')`;
}

function hasModifierKeys(keyStatus) {
  return keyStatus.ctrlKey || keyStatus.shiftKey || keyStatus.altKey || keyStatus.metaKey;
}

var StandardKeyboardEvent = class {
  constructor(source) {
    this._standardKeyboardEventBrand = true;
    const e = source;
    this.browserEvent = e;
    this.target = e.target;
    this.ctrlKey = e.ctrlKey;
    this.shiftKey = e.shiftKey;
    this.altKey = e.altKey;
    this.metaKey = e.metaKey;
    this.altGraphKey = e.getModifierState?.("AltGraph");
    this.code = e.code;
    this.keyCode = e.isComposing ? 114 /* KEY_IN_COMPOSITION */ : extractKeyCode(e);
    this.ctrlKey = this.ctrlKey || this.keyCode === 5 /* Ctrl */;
    this.altKey = this.altKey || this.keyCode === 6 /* Alt */;
    this.shiftKey = this.shiftKey || this.keyCode === 4 /* Shift */;
    this.metaKey = this.metaKey || this.keyCode === 57 /* Meta */;
    this._asKeybinding = this._computeKeybinding();
    this._asKeyCodeChord = this._computeKeyCodeChord();
  }
  preventDefault() {
    if (this.browserEvent && this.browserEvent.preventDefault) {
      this.browserEvent.preventDefault();
    }
  }
  stopPropagation() {
    if (this.browserEvent && this.browserEvent.stopPropagation) {
      this.browserEvent.stopPropagation();
    }
  }
  toKeyCodeChord() {
    return this._asKeyCodeChord;
  }
  equals(other) {
    return this._asKeybinding === other;
  }
  _computeKeybinding() {
    let key3 = 0 /* Unknown */;
    if (!isModifierKey(this.keyCode)) {
      key3 = this.keyCode;
    }
    let result = 0;
    if (this.ctrlKey) {
      result |= ctrlKeyMod;
    }
    if (this.altKey) {
      result |= altKeyMod;
    }
    if (this.shiftKey) {
      result |= shiftKeyMod;
    }
    if (this.metaKey) {
      result |= metaKeyMod;
    }
    result |= key3;
    return result;
  }
  _computeKeyCodeChord() {
    let key3 = 0 /* Unknown */;
    if (!isModifierKey(this.keyCode)) {
      key3 = this.keyCode;
    }
    return new KeyCodeChord(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, key3);
  }
};
export { extractKeyCode, printKeyboardEvent, printStandardKeyboardEvent, hasModifierKeys, ctrlKeyMod, altKeyMod, shiftKeyMod, metaKeyMod, StandardKeyboardEvent };
