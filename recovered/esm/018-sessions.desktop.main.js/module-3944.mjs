// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/keybinding/common/fallbackKeyboardMapper.ts
import { KeyCodeChord, Keybinding } from "./module-0021.mjs";
import { USLayoutResolvedKeybinding } from "./module-3943.mjs";


// src/vs/workbench/services/keybinding/common/fallbackKeyboardMapper.ts
var FallbackKeyboardMapper = class {
  constructor(_mapAltGrToCtrlAlt, _OS) {
    this._mapAltGrToCtrlAlt = _mapAltGrToCtrlAlt;
    this._OS = _OS;
  }
  dumpDebugInfo() {
    return "FallbackKeyboardMapper dispatching on keyCode";
  }
  resolveKeyboardEvent(keyboardEvent) {
    const ctrlKey = keyboardEvent.ctrlKey || this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey;
    const altKey = keyboardEvent.altKey || this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey;
    const chord = new KeyCodeChord(
      ctrlKey,
      keyboardEvent.shiftKey,
      altKey,
      keyboardEvent.metaKey,
      keyboardEvent.keyCode
    );
    const result = this.resolveKeybinding(new Keybinding([chord]));
    return result[0];
  }
  resolveKeybinding(keybinding) {
    return USLayoutResolvedKeybinding.resolveKeybinding(keybinding, this._OS);
  }
};
export { FallbackKeyboardMapper };
