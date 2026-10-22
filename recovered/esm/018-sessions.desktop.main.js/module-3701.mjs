// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostForkActions.ts
import { registerAction2 } from "./module-0092.mjs";
import { ForkConversationAction } from "./module-2187.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IChatService } from "./module-0973.mjs";
import { ILogService } from "./module-0095.mjs";
import { isAgentHostProviderId } from "./module-1764.mjs";
import { raceTimeout } from "./module-0036.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostForkActions.ts
registerAction2(class extends ForkConversationAction {
  async _tryForkAsChat(instantiationService, sourceSessionResource, request2) {
    return instantiationService.invokeFunction(async (accessor) => {
      const sessionsManagementService = accessor.get(ISessionsManagementService);
      const sessionsService = accessor.get(ISessionsService);
      const chatService = accessor.get(IChatService);
      const logService = accessor.get(ILogService);
      const session = sessionsManagementService.getSession(sourceSessionResource) ?? sessionsManagementService.getSessions().find((s) => s.chats.get().some((c) => c.resource.toString() === sourceSessionResource.toString()));
      if (!session?.capabilities.get().supportsMultipleChats || !isAgentHostProviderId(session.providerId)) {
        return false;
      }
      const requests = chatService.getSession(sourceSessionResource)?.getRequests();
      let turnId;
      if (request2) {
        const requestIdx = requests?.findIndex((r2) => r2.id === request2.id) ?? -1;
        if (requestIdx <= 0) {
          return false;
        }
        turnId = requests[requestIdx - 1].id;
      } else {
        turnId = requests?.at(-1)?.id;
      }
      if (!turnId) {
        return false;
      }
      const newChat = await sessionsManagementService.forkChatInSession(session, sourceSessionResource, turnId);
      await sessionsService.openChat(session, newChat.resource);
      logService.trace(`[AgentHostSessions] Forked conversation into new chat ${newChat.resource.toString()} in session ${session.sessionId}`);
      return true;
    });
  }
  _openForkedSession(instantiationService, parentSessionResource, forkedSessionResource) {
    return instantiationService.invokeFunction(async (accessor) => {
      const sessionsManagementService = accessor.get(ISessionsManagementService);
      const sessionsService = accessor.get(ISessionsService);
      const logService = accessor.get(ILogService);
      const parentSession = sessionsManagementService.getSession(parentSessionResource);
      if (!parentSession) {
        logService.error(`Parent session ${parentSessionResource.toString()} not found when forking conversation`);
        return super._openForkedSession(instantiationService, parentSessionResource, forkedSessionResource);
      }
      if (!sessionsManagementService.getSession(forkedSessionResource)) {
        let listener;
        const appeared = await raceTimeout(new Promise((resolve3) => {
          listener = sessionsManagementService.onDidChangeSessions(() => {
            if (sessionsManagementService.getSession(forkedSessionResource)) {
              resolve3(true);
            }
          });
        }), 3e4);
        listener?.dispose();
        if (!appeared) {
          logService.error(`Forked session ${forkedSessionResource.toString()} did not appear within timeout`);
          return;
        }
      }
      await sessionsService.openSession(forkedSessionResource, { source: "fork" });
    });
  }
});
export {};
