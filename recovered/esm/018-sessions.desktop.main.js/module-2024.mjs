// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/openSessionLink.ts
import { localize } from "./module-0001.mjs";
import { AgentSession } from "./module-1107.mjs";
import { URI } from "./module-0032.mjs";
import { DEFAULT_CHAT_ID, isAhpChatChannel, parseChatUri } from "./module-1008.mjs";


// src/vs/platform/agentHost/common/openSessionLink.ts
var AGENT_HOST_SESSION_LINK_SCHEME = "agent-host-session";

var AGENT_HOST_SESSION_ONLY_LINK_PATTERN = /^(?![^#]*[?&]chat=)agent-host-session:\/\/[^/?#]+\/[^?#]+(?:\?[^#]*)?(?:#.*)?$/i;

var AGENT_HOST_CHAT_LINK_PATTERN = /^(?=[^#]*[?&]chat=)agent-host-session:\/\/[^/?#]+\/[^?#]+(?:\?[^#]*)?(?:#.*)?$/i;

function buildAgentSessionLinkPresentation(title, description, status2, kind = "session") {
  const presentationStatus = getAgentSessionLinkPresentationStatus(status2);
  return {
    kind,
    title,
    ...description ? { detail: description } : {},
    status: presentationStatus,
    tooltip: localize(2121, null, title, presentationStatus.label),
    ariaLabel: kind === "chat" ? localize(2115, null, title, presentationStatus.label) : localize(2116, null, title, presentationStatus.label)
  };
}

function getAgentSessionLinkPresentationStatus(status2) {
  switch (status2) {
    case "untitled":
      return { kind: "neutral", label: localize(2120, null) };
    case "inProgress":
      return { kind: "pending", label: localize(2122, null) };
    case "needsInput":
      return { kind: "warning", label: localize(2119, null) };
    case "completed":
      return { kind: "success", label: localize(2117, null) };
    case "error":
      return { kind: "error", label: localize(2118, null) };
  }
}

function matchesToolName(toolName, bareName) {
  return toolName === bareName || toolName.endsWith(`__${bareName}`);
}

function isCreateSessionTool(toolName) {
  return matchesToolName(toolName, "create_session" /* CreateSession */);
}

function isCreateChatTool(toolName) {
  return matchesToolName(toolName, "create_chat" /* CreateChat */);
}

function isSendMessageTool(toolName) {
  return matchesToolName(toolName, "send_message" /* SendMessage */);
}

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

function parseOpenSessionLinkUri(uri4) {
  const parsed = typeof uri4 === "string" ? URI.parse(uri4) : uri4;
  if (parsed.scheme !== AGENT_HOST_SESSION_LINK_SCHEME || !parsed.authority) {
    return void 0;
  }
  const rawId = parsed.path.replace(/^\//, "");
  if (!rawId) {
    return void 0;
  }
  return AgentSession.uri(parsed.authority, rawId);
}

function parseOpenSessionLinkChatId(uri4) {
  const chatId = readOpenSessionLinkQueryParam(uri4, "chat");
  return chatId === DEFAULT_CHAT_ID ? void 0 : chatId;
}

function readOpenSessionLinkQueryParam(uri4, name) {
  const parsed = typeof uri4 === "string" ? URI.parse(uri4) : uri4;
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
export { buildAgentSessionLinkPresentation, getAgentSessionLinkPresentationStatus, matchesToolName, isCreateSessionTool, isCreateChatTool, isSendMessageTool, buildOpenSessionLinkUri, parseOpenSessionLinkUri, parseOpenSessionLinkChatId, readOpenSessionLinkQueryParam, buildOpenSessionLinkForChatResource, AGENT_HOST_SESSION_LINK_SCHEME, AGENT_HOST_SESSION_ONLY_LINK_PATTERN, AGENT_HOST_CHAT_LINK_PATTERN };
