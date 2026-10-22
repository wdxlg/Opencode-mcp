// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/inputMode.ts
import { Emitter } from "./module-0017.mjs";


// src/vs/editor/common/inputMode.ts
var InputModeImpl = class {
  constructor() {
    this._inputMode = "insert";
    this._onDidChangeInputMode = new Emitter();
    this.onDidChangeInputMode = this._onDidChangeInputMode.event;
  }
  getInputMode() {
    return this._inputMode;
  }
  setInputMode(inputMode) {
    this._inputMode = inputMode;
    this._onDidChangeInputMode.fire(this._inputMode);
  }
};

var InputMode = new InputModeImpl();
export { InputModeImpl, InputMode };
