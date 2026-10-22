// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/debugCompoundRoot.ts
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/debug/common/debugCompoundRoot.ts
var DebugCompoundRoot = class {
  constructor() {
    this.stopped = false;
    this.stopEmitter = new Emitter();
    this.onDidSessionStop = this.stopEmitter.event;
  }
  sessionStopped() {
    if (!this.stopped) {
      this.stopped = true;
      this.stopEmitter.fire();
    }
  }
};
export { DebugCompoundRoot };
