// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/mobile/mobileChatPhoneInputTarget.ts



// src/vs/sessions/contrib/providers/agentHost/browser/mobile/mobileChatPhoneInputTarget.ts
function createChatPhoneInputSessionContext(session) {
  return session ? {
    providerId: session.providerId,
    sessionId: session.sessionId,
    sessionType: session.sessionType,
    chatResource: session.activeChat.get().resource,
    modelId: session.modelId.get()
  } : void 0;
}
export { createChatPhoneInputSessionContext };
