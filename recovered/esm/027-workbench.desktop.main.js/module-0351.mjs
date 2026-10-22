// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/ime.ts
import { Emitter } from "./module-0017.mjs";


// src/vs/base/common/ime.ts
var IMEImpl = class {
  constructor() {
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this._enabled = true;
  }
  get enabled() {
    return this._enabled;
  }
  /**
   * Enable IME
   */
  enable() {
    this._enabled = true;
    this._onDidChange.fire();
  }
  /**
   * Disable IME
   */
  disable() {
    this._enabled = false;
    this._onDidChange.fire();
  }
};

var IME = new IMEImpl();
export { IMEImpl, IME };
