// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/platform/terminal/node/heartbeatService.ts
import { Disposable, toDisposable } from "./module-0011.mjs";
import { Emitter } from "./module-0021.mjs";


// src/vs/platform/terminal/node/heartbeatService.ts
var HeartbeatService = class extends Disposable {
  constructor() {
    super();
    this._onBeat = this._register(new Emitter());
    this.onBeat = this._onBeat.event;
    const interval = setInterval(() => {
      this._onBeat.fire();
    }, 5e3 /* BeatInterval */);
    this._register(toDisposable(() => clearInterval(interval)));
  }
};
export { HeartbeatService };
