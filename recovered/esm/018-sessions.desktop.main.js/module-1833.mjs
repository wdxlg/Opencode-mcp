// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/keybinding/common/baseResolvedKeybinding.ts
import { ResolvedChord, ResolvedKeybinding } from "./module-0021.mjs";
import { illegalArgument } from "./module-0004.mjs";
import { AriaLabelProvider, ElectronAcceleratorLabelProvider, UILabelProvider, UserSettingsLabelProvider } from "./module-0504.mjs";


// src/vs/platform/keybinding/common/baseResolvedKeybinding.ts
var BaseResolvedKeybinding = class extends ResolvedKeybinding {
  constructor(os, chords) {
    super();
    if (chords.length === 0) {
      throw illegalArgument(`chords`);
    }
    this._os = os;
    this._chords = chords;
  }
  getLabel() {
    return UILabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getLabel(keybinding));
  }
  getAriaLabel() {
    return AriaLabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getAriaLabel(keybinding));
  }
  getElectronAccelerator() {
    if (this._chords.length > 1) {
      return null;
    }
    if (this._chords[0].isDuplicateModifierCase()) {
      return null;
    }
    return ElectronAcceleratorLabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getElectronAccelerator(keybinding));
  }
  getUserSettingsLabel() {
    return UserSettingsLabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getUserSettingsLabel(keybinding));
  }
  isWYSIWYG() {
    return this._chords.every((keybinding) => this._isWYSIWYG(keybinding));
  }
  hasMultipleChords() {
    return this._chords.length > 1;
  }
  getChords() {
    return this._chords.map((keybinding) => this._getChord(keybinding));
  }
  _getChord(keybinding) {
    return new ResolvedChord(
      keybinding.ctrlKey,
      keybinding.shiftKey,
      keybinding.altKey,
      keybinding.metaKey,
      this._getLabel(keybinding),
      this._getAriaLabel(keybinding)
    );
  }
  getDispatchChords() {
    return this._chords.map((keybinding) => this._getChordDispatch(keybinding));
  }
  getSingleModifierDispatchChords() {
    return this._chords.map((keybinding) => this._getSingleModifierChordDispatch(keybinding));
  }
};
export { BaseResolvedKeybinding };
