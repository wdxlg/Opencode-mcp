// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/openSessionLink.ts
import { AgentSession } from "./module-0048.mjs";
import { URI } from "./module-0023.mjs";
import { DEFAULT_CHAT_ID, isAhpChatChannel, parseChatUri } from "./module-0047.mjs";


// src/vs/platform/agentHost/common/openSessionLink.ts
var AGENT_HOST_SESSION_LINK_SCHEME = "agent-host-session";

function buildOpenSessionLinkUri(backendSession, chatId, turnId) {
  const provider = AgentSession.provider(backendSession);
  const rawId = AgentSession.id(backendSession);
  if (!provider) {
    throw new Error(`Cannot build open-session link: missing provider in ${backendSession.toString()}`);
  }
  const base = URI.from({ scheme: AGENT_HOST_SESSION_LINK_SCHEME, authority: provider, path: `/${rawId}` }).toString();
  const query = [];
  if (chatId && chatId !== DEFAULT_CHAT_ID) {
    query.push(`chat=${encodeURIComponent(chatId)}`);
  }
  if (turnId) {
    query.push(`turn=${encodeURIComponent(turnId)}`);
  }
  return query.length > 0 ? `${base}?${query.join("&")}` : base;
}

function parseOpenSessionLinkUri(uri) {
  const parsed = typeof uri === "string" ? URI.parse(uri) : uri;
  if (parsed.scheme !== AGENT_HOST_SESSION_LINK_SCHEME || !parsed.authority) {
    return void 0;
  }
  const rawId = parsed.path.replace(/^\//, "");
  if (!rawId) {
    return void 0;
  }
  return AgentSession.uri(parsed.authority, rawId);
}

function parseOpenSessionLinkChatId(uri) {
  const chatId = readOpenSessionLinkQueryParam(uri, "chat");
  return chatId === DEFAULT_CHAT_ID ? void 0 : chatId;
}

function readOpenSessionLinkQueryParam(uri, name) {
  const parsed = typeof uri === "string" ? URI.parse(uri) : uri;
  if (parsed.scheme !== AGENT_HOST_SESSION_LINK_SCHEME) {
    return void 0;
  }
  const match2 = new RegExp(`(?:^|&)${name}=([^&]+)`).exec(parsed.query);
  try {
    return match2 ? decodeURIComponent(match2[1]) : void 0;
  } catch {
    return void 0;
  }
}

function buildOpenSessionLinkForChatResource(chatResource) {
  try {
    const resourceStr = typeof chatResource === "string" ? chatResource : chatResource.toString();
    const parsedChat = isAhpChatChannel(resourceStr) ? parseChatUri(resourceStr) : void 0;
    const sourceSession = parsedChat ? parsedChat.session : URI.parse(resourceStr).toString();
    return buildOpenSessionLinkUri(sourceSession, parsedChat?.chatId);
  } catch {
    return void 0;
  }
}
export { buildOpenSessionLinkUri, parseOpenSessionLinkUri, parseOpenSessionLinkChatId, readOpenSessionLinkQueryParam, buildOpenSessionLinkForChatResource, AGENT_HOST_SESSION_LINK_SCHEME };
