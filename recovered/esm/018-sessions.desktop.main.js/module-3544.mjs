// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/agentHostDelegation.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { CHAT_DELEGATE_TO_AGENT_HOST_SESSION_COMMAND_ID } from "./module-0983.mjs";
import { ILogService } from "./module-0095.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { LOCAL_AGENT_HOST_PROVIDER_ID } from "./module-1764.mjs";


// src/vs/sessions/contrib/chat/browser/agentHostDelegation.ts
CommandsRegistry.registerCommand(CHAT_DELEGATE_TO_AGENT_HOST_SESSION_COMMAND_ID, async (accessor, request2) => {
  const logService = accessor.get(ILogService);
  if (!request2?.type || !request2.prompt) {
    logService.warn("[Sessions] Agent host delegation skipped: missing request payload");
    return;
  }
  const sessionsService = accessor.get(ISessionsService);
  const sessionsManagementService = accessor.get(ISessionsManagementService);
  const sourceSession = sessionsService.activeSession.get();
  if (!sourceSession) {
    logService.warn("[Sessions] Agent host delegation skipped: no active session");
    return;
  }
  const folderUri = sourceSession.workspace.get()?.folders.at(0)?.root;
  if (!folderUri) {
    logService.warn("[Sessions] Agent host delegation skipped: no active session workspace folder");
    return;
  }
  const isLocalAgentHostTarget2 = request2.type.startsWith("agent-host-");
  const sessionTypeId = isLocalAgentHostTarget2 ? request2.type.slice("agent-host-".length) : request2.type;
  const providerId = isLocalAgentHostTarget2 ? LOCAL_AGENT_HOST_PROVIDER_ID : void 0;
  try {
    const session = sessionsManagementService.createNewSession(folderUri, { providerId, sessionTypeId });
    sessionsService.insertAt(session, sourceSession.sessionId, "right", true);
    await sessionsManagementService.sendNewChatRequest(session, { query: request2.prompt, attachedContext: request2.attachedContext });
  } catch (e4) {
    logService.error(`[Sessions] Agent host delegation to '${sessionTypeId}' failed`, e4);
    throw e4;
  }
});
export {};
