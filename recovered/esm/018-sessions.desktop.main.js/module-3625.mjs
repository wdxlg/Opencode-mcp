// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/sessionActionRunner.ts
import { ActionRunner } from "./module-0082.mjs";


// src/vs/sessions/browser/sessionActionRunner.ts
var SessionActivatingActionRunner = class extends ActionRunner {
  constructor(_getSession, _sessionsService) {
    super();
    this._getSession = _getSession;
    this._sessionsService = _sessionsService;
  }
  async runAction(action, context2) {
    const session = this._getSession();
    if (session) {
      this._sessionsService.setActive(session);
    }
    await super.runAction(action, context2);
  }
};
export { SessionActivatingActionRunner };
