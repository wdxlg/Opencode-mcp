// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentChatContext.ts
import { URI } from "./module-0023.mjs";
import { buildDefaultChatUri, isDefaultChatUri } from "./module-0047.mjs";


// src/vs/platform/agentHost/node/agentChatContext.ts
function toKey(resource) {
  return typeof resource === "string" ? resource : resource.toString();
}

function toUri(resource) {
  return typeof resource === "string" ? URI.parse(resource) : resource;
}

function createAgentChatContext(stateManager, session, chat) {
  const sessionKey = toKey(session);
  const chatKey = toKey(chat);
  const origin = stateManager.getChatOrigin(chatKey);
  const customizations = stateManager.getSessionState(sessionKey)?.customizations;
  const sessionUri = toUri(session);
  return {
    resource: isDefaultChatUri(chatKey) ? sessionUri : toUri(chat),
    configurationResource: sessionUri,
    ...origin ? { origin } : {},
    ...customizations ? { customizations } : {}
  };
}

function getSessionChatsForFanOut(stateManager, session) {
  const sessionKey = toKey(session);
  const state = stateManager.getSessionState(sessionKey);
  if (!state) {
    return void 0;
  }
  const defaultChat = state.defaultChat ?? buildDefaultChatUri(sessionKey);
  const seen = /* @__PURE__ */ new Set();
  const chats = [];
  for (const summary of state.chats) {
    if (!seen.has(summary.resource)) {
      seen.add(summary.resource);
      chats.push(URI.parse(summary.resource));
    }
  }
  if (!seen.has(defaultChat)) {
    chats.unshift(URI.parse(defaultChat));
  }
  return chats;
}
export { toKey, toUri, createAgentChatContext, getSessionChatsForFanOut };
