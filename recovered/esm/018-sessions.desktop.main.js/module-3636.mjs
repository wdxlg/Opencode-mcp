// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionsOpenerParticipant.ts
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { Disposable } from "./module-0012.mjs";
import { sessionOpenerRegistry } from "./module-2640.mjs";


// src/vs/sessions/contrib/chat/browser/sessionsOpenerParticipant.ts
var SessionsOpenerParticipant = class {
  async handleOpenSession(accessor, session, openOptions) {
    return this.handleOpenSessionResource(accessor, session.resource, openOptions);
  }
  async handleOpenSessionResource(accessor, resource, openOptions) {
    const sessionsManagementService = accessor.get(ISessionsManagementService);
    const sessionsService = accessor.get(ISessionsService);
    const target = sessionsManagementService.getSession(resource);
    if (!target) {
      return false;
    }
    await sessionsService.openSession(resource, { preserveFocus: openOptions?.editorOptions?.preserveFocus, source: "link" });
    return true;
  }
};

var SessionsOpenerParticipantContribution = class extends Disposable {
  static {
    this.ID = "sessions.sessionOpenerParticipant";
  }
  constructor() {
    super();
    this._register(sessionOpenerRegistry.registerParticipant(new SessionsOpenerParticipant()));
  }
};
export { SessionsOpenerParticipant, SessionsOpenerParticipantContribution };
