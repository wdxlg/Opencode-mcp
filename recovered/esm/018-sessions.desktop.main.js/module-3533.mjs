// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionTaskRunner.ts
import { createDecorator } from "./module-0077.mjs";
import { toDisposable } from "./module-0012.mjs";


// src/vs/sessions/contrib/chat/browser/sessionTaskRunner.ts
var ISessionTaskRunnerRegistry = createDecorator("sessionTaskRunnerRegistry");

var SessionTaskRunnerRegistry = class {
  constructor() {
    this._runners = [];
  }
  register(runner) {
    this._runners.push(runner);
    return toDisposable(() => {
      const idx = this._runners.indexOf(runner);
      if (idx >= 0) {
        this._runners.splice(idx, 1);
      }
    });
  }
  getRunner(session) {
    let best;
    for (const runner of this._runners) {
      if (!runner.canRun(session)) {
        continue;
      }
      if (!best || runner.priority >= best.priority) {
        best = runner;
      }
    }
    return best;
  }
};
export { ISessionTaskRunnerRegistry, SessionTaskRunnerRegistry };
