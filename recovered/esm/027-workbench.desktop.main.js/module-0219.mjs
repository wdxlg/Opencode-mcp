// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/config/tabFocus.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/editor/browser/config/tabFocus.ts
var TabFocusImpl = class extends Disposable {
  constructor() {
    super(...arguments);
    this._tabFocus = false;
    this._onDidChangeTabFocus = this._register(new Emitter());
    this.onDidChangeTabFocus = this._onDidChangeTabFocus.event;
  }
  getTabFocusMode() {
    return this._tabFocus;
  }
  setTabFocusMode(tabFocusMode) {
    this._tabFocus = tabFocusMode;
    this._onDidChangeTabFocus.fire(this._tabFocus);
  }
};

var TabFocus = new TabFocusImpl();
export { TabFocusImpl, TabFocus };
