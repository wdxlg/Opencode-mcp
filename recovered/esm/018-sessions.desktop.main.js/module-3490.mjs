// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/sessionConversationGroups.ts
import { hash } from "./module-0039.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/sessions/browser/sessionConversationGroups.ts
var SESSION_CONVERSATION_SIDE_CHATS_GROUP = "1_sidechats";

function getSessionConversationActionId(sessionId, chatResource) {
  return `sessions.openChat.${sessionId}.${hash(chatResource.toString())}`;
}

function getSessionConversationStatusLabel(status2) {
  switch (status2) {
    case 0 /* Untitled */:
      return localize(3851, null);
    case 1 /* InProgress */:
      return localize(3849, null);
    case 2 /* NeedsInput */:
      return localize(3850, null);
    case 3 /* Completed */:
      return localize(3847, null);
    case 4 /* Error */:
      return localize(3848, null);
  }
}

function getSessionConversationStatusAriaLabel(status2) {
  return localize(3846, null, getSessionConversationStatusLabel(status2));
}

function isSessionConversationSideChat(chat) {
  return chat.origin?.kind === "sideChat" /* SideChat */;
}
export { getSessionConversationActionId, getSessionConversationStatusLabel, getSessionConversationStatusAriaLabel, isSessionConversationSideChat, SESSION_CONVERSATION_SIDE_CHATS_GROUP };
