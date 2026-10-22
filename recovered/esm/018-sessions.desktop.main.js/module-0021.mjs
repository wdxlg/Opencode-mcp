// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/keybindings.ts
import { illegalArgument } from "./module-0004.mjs";


// src/vs/base/common/keybindings.ts
function decodeKeybinding(keybinding, OS2) {
  if (typeof keybinding === "number") {
    if (keybinding === 0) {
      return null;
    }
    const firstChord = (keybinding & 65535) >>> 0;
    const secondChord = (keybinding & 4294901760) >>> 16;
    if (secondChord !== 0) {
      return new Keybinding([
        createSimpleKeybinding(firstChord, OS2),
        createSimpleKeybinding(secondChord, OS2)
      ]);
    }
    return new Keybinding([createSimpleKeybinding(firstChord, OS2)]);
  } else {
    const chords = [];
    for (let i2 = 0; i2 < keybinding.length; i2++) {
      chords.push(createSimpleKeybinding(keybinding[i2], OS2));
    }
    return new Keybinding(chords);
  }
}

function createSimpleKeybinding(keybinding, OS2) {
  const ctrlCmd = keybinding & 2048 /* CtrlCmd */ ? true : false;
  const winCtrl = keybinding & 256 /* WinCtrl */ ? true : false;
  const ctrlKey = OS2 === 2 /* Macintosh */ ? winCtrl : ctrlCmd;
  const shiftKey = keybinding & 1024 /* Shift */ ? true : false;
  const altKey = keybinding & 512 /* Alt */ ? true : false;
  const metaKey = OS2 === 2 /* Macintosh */ ? ctrlCmd : winCtrl;
  const keyCode = keybinding & 255 /* KeyCode */;
  return new KeyCodeChord(ctrlKey, shiftKey, altKey, metaKey, keyCode);
}

var KeyCodeChord = class _KeyCodeChord {
  constructor(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.keyCode = keyCode;
  }
  equals(other) {
    return other instanceof _KeyCodeChord && this.ctrlKey === other.ctrlKey && this.shiftKey === other.shiftKey && this.altKey === other.altKey && this.metaKey === other.metaKey && this.keyCode === other.keyCode;
  }
  getHashCode() {
    const ctrl = this.ctrlKey ? "1" : "0";
    const shift2 = this.shiftKey ? "1" : "0";
    const alt = this.altKey ? "1" : "0";
    const meta = this.metaKey ? "1" : "0";
    return `K${ctrl}${shift2}${alt}${meta}${this.keyCode}`;
  }
  isModifierKey() {
    return this.keyCode === 0 /* Unknown */ || this.keyCode === 5 /* Ctrl */ || this.keyCode === 57 /* Meta */ || this.keyCode === 6 /* Alt */ || this.keyCode === 4 /* Shift */;
  }
  toKeybinding() {
    return new Keybinding([this]);
  }
  /**
   * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
   */
  isDuplicateModifierCase() {
    return this.ctrlKey && this.keyCode === 5 /* Ctrl */ || this.shiftKey && this.keyCode === 4 /* Shift */ || this.altKey && this.keyCode === 6 /* Alt */ || this.metaKey && this.keyCode === 57 /* Meta */;
  }
};

var ScanCodeChord = class _ScanCodeChord {
  constructor(ctrlKey, shiftKey, altKey, metaKey, scanCode) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.scanCode = scanCode;
  }
  equals(other) {
    return other instanceof _ScanCodeChord && this.ctrlKey === other.ctrlKey && this.shiftKey === other.shiftKey && this.altKey === other.altKey && this.metaKey === other.metaKey && this.scanCode === other.scanCode;
  }
  getHashCode() {
    const ctrl = this.ctrlKey ? "1" : "0";
    const shift2 = this.shiftKey ? "1" : "0";
    const alt = this.altKey ? "1" : "0";
    const meta = this.metaKey ? "1" : "0";
    return `S${ctrl}${shift2}${alt}${meta}${this.scanCode}`;
  }
  /**
   * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
   */
  isDuplicateModifierCase() {
    return this.ctrlKey && (this.scanCode === 157 /* ControlLeft */ || this.scanCode === 161 /* ControlRight */) || this.shiftKey && (this.scanCode === 158 /* ShiftLeft */ || this.scanCode === 162 /* ShiftRight */) || this.altKey && (this.scanCode === 159 /* AltLeft */ || this.scanCode === 163 /* AltRight */) || this.metaKey && (this.scanCode === 160 /* MetaLeft */ || this.scanCode === 164 /* MetaRight */);
  }
};

var Keybinding = class {
  constructor(chords) {
    if (chords.length === 0) {
      throw illegalArgument(`chords`);
    }
    this.chords = chords;
  }
  getHashCode() {
    let result = "";
    for (let i2 = 0, len = this.chords.length; i2 < len; i2++) {
      if (i2 !== 0) {
        result += ";";
      }
      result += this.chords[i2].getHashCode();
    }
    return result;
  }
  equals(other) {
    if (other === null) {
      return false;
    }
    if (this.chords.length !== other.chords.length) {
      return false;
    }
    for (let i2 = 0; i2 < this.chords.length; i2++) {
      if (!this.chords[i2].equals(other.chords[i2])) {
        return false;
      }
    }
    return true;
  }
};

var ResolvedChord = class {
  constructor(ctrlKey, shiftKey, altKey, metaKey, keyLabel, keyAriaLabel) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.keyLabel = keyLabel;
    this.keyAriaLabel = keyAriaLabel;
  }
};

var ResolvedKeybinding = class {
};
export { decodeKeybinding, createSimpleKeybinding, KeyCodeChord, ScanCodeChord, Keybinding, ResolvedChord, ResolvedKeybinding };
