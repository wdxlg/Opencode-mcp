// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/browser/event.ts
import { Emitter } from "./module-0017.mjs";


// src/vs/base/browser/event.ts
var DomEmitter = class {
  get event() {
    return this.emitter.event;
  }
  constructor(element, type, useCapture) {
    const fn = (e) => this.emitter.fire(e);
    this.emitter = new Emitter({
      onWillAddFirstListener: () => element.addEventListener(type, fn, useCapture),
      onDidRemoveLastListener: () => element.removeEventListener(type, fn, useCapture)
    });
  }
  dispose() {
    this.emitter.dispose();
  }
};
export { DomEmitter };
