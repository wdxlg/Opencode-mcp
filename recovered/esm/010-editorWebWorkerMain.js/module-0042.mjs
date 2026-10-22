// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/editor/common/services/editorWebWorkerMain.js
// Original module marker: src/vs/editor/common/services/editorBaseApi.ts
import { KeyChord } from "./module-0032.mjs";
import { CancellationTokenSource } from "./module-0016.mjs";
import { Emitter } from "./module-0015.mjs";
import { KeyCode, MarkerSeverity, MarkerTag, SelectionDirection } from "./module-0041.mjs";
import { Position } from "./module-0027.mjs";
import { Range } from "./module-0028.mjs";
import { Selection } from "./module-0035.mjs";
import { URI } from "./module-0034.mjs";
import { Token } from "./module-0040.mjs";


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
    KeyCode,
    KeyMod: KeyMod2,
    Position,
    Range,
    Selection,
    SelectionDirection,
    MarkerSeverity,
    MarkerTag,
    Uri: URI,
    Token
  };
}
export { createMonacoBaseAPI, KeyMod2 };
