// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/requestOriginProvider.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { AGENT_HOST_SESSION_LINK_SCHEME } from "./module-2024.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatRequestOriginService } from "./module-1189.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/chat/browser/requestOriginProvider.contribution.ts
var SessionsChatRequestOriginProviderContribution = class extends Disposable {
  static {
    this.ID = "sessions.contrib.chatRequestOriginProvider";
  }
  constructor(requestOriginService, sessionsService, openerService) {
    super();
    this._register(requestOriginService.registerOpener({
      open: async (origin) => {
        if (origin.sourceSessionResource.scheme === AGENT_HOST_SESSION_LINK_SCHEME) {
          return openerService.open(origin.sourceSessionResource);
        }
        await sessionsService.openSession(origin.sourceSessionResource, { source: "chat" });
        return true;
      }
    }));
  }
};

SessionsChatRequestOriginProviderContribution = __decorateClass([
  __decorateParam(0, IChatRequestOriginService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, IOpenerService)
], SessionsChatRequestOriginProviderContribution);

registerWorkbenchContribution2(SessionsChatRequestOriginProviderContribution.ID, SessionsChatRequestOriginProviderContribution, WorkbenchPhase.BlockRestore);
export { SessionsChatRequestOriginProviderContribution };
