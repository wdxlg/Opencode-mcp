// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/services/editorBaseApi.ts
import { KeyChord } from "./module-0019.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { Emitter } from "./module-0017.mjs";
import { KeyCode2, MarkerSeverity, MarkerTag, SelectionDirection2 } from "./module-0169.mjs";
import { Position } from "./module-0079.mjs";
import { Range2 } from "./module-0106.mjs";
import { Selection } from "./module-0107.mjs";
import { URI } from "./module-0032.mjs";
import { Token2 } from "./module-0164.mjs";


// src/vs/editor/common/services/editorBaseApi.ts
var KeyMod2 = class {
  static {
    this.CtrlCmd = 2048 /* CtrlCmd */;
  }
  static {
    this.Shift = 1024 /* Shift */;
  }
  static {
    this.Alt = 512 /* Alt */;
  }
  static {
    this.WinCtrl = 256 /* WinCtrl */;
  }
  static chord(firstPart, secondPart) {
    return KeyChord(firstPart, secondPart);
  }
};

function createMonacoBaseAPI() {
  return {
    editor: void 0,
    // undefined override expected here
    languages: void 0,
    // undefined override expected here
    CancellationTokenSource,
    Emitter,
    KeyCode: KeyCode2,
    KeyMod: KeyMod2,
    Position,
    Range: Range2,
    Selection,
    SelectionDirection: SelectionDirection2,
    MarkerSeverity,
    MarkerTag,
    Uri: URI,
    Token: Token2
  };
}
export { createMonacoBaseAPI, KeyMod2 };
