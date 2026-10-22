// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/controller/editContext/editContext.ts
import { ViewPart } from "./module-0239.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/editor/browser/controller/editContext/editContext.ts
var AbstractEditContext = class extends ViewPart {
  constructor() {
    super(...arguments);
    // Clipboard events - emitted before the default clipboard handling
    this._onWillCopy = this._register(new Emitter());
    this.onWillCopy = this._onWillCopy.event;
    this._onWillCut = this._register(new Emitter());
    this.onWillCut = this._onWillCut.event;
    this._onWillPaste = this._register(new Emitter());
    this.onWillPaste = this._onWillPaste.event;
  }
};
export { AbstractEditContext };
