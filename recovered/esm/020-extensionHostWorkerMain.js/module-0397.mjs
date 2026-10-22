// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/keybindings.ts
import { illegalArgument } from "./module-0002.mjs";


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
    for (let i = 0; i < keybinding.length; i++) {
      chords.push(createSimpleKeybinding(keybinding[i], OS2));
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
    const shift = this.shiftKey ? "1" : "0";
    const alt = this.altKey ? "1" : "0";
    const meta = this.metaKey ? "1" : "0";
    return `K${ctrl}${shift}${alt}${meta}${this.keyCode}`;
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

var Keybinding = class {
  constructor(chords) {
    if (chords.length === 0) {
      throw illegalArgument(`chords`);
    }
    this.chords = chords;
  }
  getHashCode() {
    let result = "";
    for (let i = 0, len = this.chords.length; i < len; i++) {
      if (i !== 0) {
        result += ";";
      }
      result += this.chords[i].getHashCode();
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
    for (let i = 0; i < this.chords.length; i++) {
      if (!this.chords[i].equals(other.chords[i])) {
        return false;
      }
    }
    return true;
  }
};
export { decodeKeybinding, createSimpleKeybinding, KeyCodeChord, Keybinding };
