// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/browser/sessionContext.ts
import { createDecorator } from "./module-0077.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/services/sessions/browser/sessionContext.ts
var ISessionContext = createDecorator("sessionContext");

var SessionContext = class {
  constructor(session) {
    this.session = session;
  }
};

var ActiveSessionContext = class {
  constructor(sessionsService) {
    this.session = sessionsService.activeSession;
  }
};

ActiveSessionContext = __decorateClass([
  __decorateParam(0, ISessionsService)
], ActiveSessionContext);

registerSingleton(ISessionContext, ActiveSessionContext, 1 /* Delayed */);
export { ISessionContext, SessionContext, ActiveSessionContext };
