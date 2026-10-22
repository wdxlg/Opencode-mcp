// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatNotification.ts



// src/vs/workbench/contrib/chat/common/chatNotification.ts
function getChatNotificationDedupeKey(sessionResource, kind) {
  return `chat-session:${sessionResource.toString()}:${kind}`;
}
export { getChatNotificationDedupeKey };
