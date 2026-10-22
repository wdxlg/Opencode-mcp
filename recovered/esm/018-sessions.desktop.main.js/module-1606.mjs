// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/keybindingParser.ts
import { KeyCodeUtils, ScanCodeUtils } from "./module-0019.mjs";
import { KeyCodeChord, Keybinding, ScanCodeChord } from "./module-0021.mjs";


// src/vs/base/common/keybindingParser.ts
var KeybindingParser = class {
  static _readModifiers(input) {
    input = input.toLowerCase().trim();
    let ctrl = false;
    let shift2 = false;
    let alt = false;
    let meta = false;
    let matchedModifier;
    do {
      matchedModifier = false;
      if (/^ctrl(\+|\-)/.test(input)) {
        ctrl = true;
        input = input.substr("ctrl-".length);
        matchedModifier = true;
      }
      if (/^shift(\+|\-)/.test(input)) {
        shift2 = true;
        input = input.substr("shift-".length);
        matchedModifier = true;
      }
      if (/^alt(\+|\-)/.test(input)) {
        alt = true;
        input = input.substr("alt-".length);
        matchedModifier = true;
      }
      if (/^meta(\+|\-)/.test(input)) {
        meta = true;
        input = input.substr("meta-".length);
        matchedModifier = true;
      }
      if (/^win(\+|\-)/.test(input)) {
        meta = true;
        input = input.substr("win-".length);
        matchedModifier = true;
      }
      if (/^cmd(\+|\-)/.test(input)) {
        meta = true;
        input = input.substr("cmd-".length);
        matchedModifier = true;
      }
    } while (matchedModifier);
    let key3;
    const firstSpaceIdx = input.indexOf(" ");
    if (firstSpaceIdx > 0) {
      key3 = input.substring(0, firstSpaceIdx);
      input = input.substring(firstSpaceIdx);
    } else {
      key3 = input;
      input = "";
    }
    return {
      remains: input,
      ctrl,
      shift: shift2,
      alt,
      meta,
      key: key3
    };
  }
  static parseChord(input) {
    const mods = this._readModifiers(input);
    const scanCodeMatch = mods.key.match(/^\[([^\]]+)\]$/);
    if (scanCodeMatch) {
      const strScanCode = scanCodeMatch[1];
      const scanCode = ScanCodeUtils.lowerCaseToEnum(strScanCode);
      return [new ScanCodeChord(mods.ctrl, mods.shift, mods.alt, mods.meta, scanCode), mods.remains];
    }
    const keyCode = KeyCodeUtils.fromUserSettings(mods.key);
    return [new KeyCodeChord(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode), mods.remains];
  }
  static parseKeybinding(input) {
    if (!input) {
      return null;
    }
    const chords = [];
    let chord;
    while (input.length > 0) {
      [chord, input] = this.parseChord(input);
      chords.push(chord);
    }
    return chords.length > 0 ? new Keybinding(chords) : null;
  }
};
export { KeybindingParser };
