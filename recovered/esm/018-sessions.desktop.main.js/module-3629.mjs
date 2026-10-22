// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sideChatOrchestration.ts



// src/vs/sessions/contrib/chat/browser/sideChatOrchestration.ts
async function openAndSendSideChat(sessionsManagementService, sessionsService, sessionsPartService, session, sideChat, requestOptions) {
  await sessionsService.openChat(session, sideChat.resource);
  sessionsPartService.getSessionView(session.sessionId)?.splitChatToSide(sideChat.resource);
  await sessionsManagementService.sendRequest(session, sideChat, requestOptions);
}

async function createAndSendSideChat(sessionsManagementService, sessionsService, sessionsPartService, session, sourceChat, turnId, requestOptions, selection) {
  const sideChat = await sessionsManagementService.createSideChatInSession(session, sourceChat, turnId, selection);
  await openAndSendSideChat(sessionsManagementService, sessionsService, sessionsPartService, session, sideChat, requestOptions);
  return sideChat;
}
export { openAndSendSideChat, createAndSendSideChat };
