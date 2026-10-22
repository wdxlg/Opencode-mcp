// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostChatCompletionProvider.ts
import { buildDefaultChatUri, isAhpChatChannel, isDefaultChatUri, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";
import { URI } from "./module-0023.mjs";
import { resolveChatStateForUri } from "./module-0103.mjs";


// src/vs/platform/agentHost/node/agentHostChatCompletionProvider.ts
var MAX_RESULTS2 = 20;

var CHAT_PREFIX = "chat:";

function extractChatToken(text, offset) {
  if (offset < 0 || offset > text.length) {
    return void 0;
  }
  for (let i = offset - 1; i >= 0; i--) {
    const ch = text.charCodeAt(i);
    if (ch === 32 || ch === 9 || ch === 10 || ch === 13) {
      return void 0;
    }
    if (text[i] === "#" /* Hash */) {
      if (i > 0) {
        const prev = text.charCodeAt(i - 1);
        const prevIsWs = prev === 32 || prev === 9 || prev === 10 || prev === 13;
        if (!prevIsWs) {
          return void 0;
        }
      }
      const raw = text.slice(i + 1, offset);
      const lower = raw.toLowerCase();
      if (lower.startsWith(CHAT_PREFIX)) {
        return { typed: raw.slice(CHAT_PREFIX.length), rangeStart: i, rangeEnd: offset };
      }
      if (CHAT_PREFIX.startsWith(lower)) {
        return { typed: "", rangeStart: i, rangeEnd: offset };
      }
      return void 0;
    }
  }
  return void 0;
}

function sanitizeChatTitle(title) {
  return title.replace(/\s+/g, " ").trim();
}

var AgentHostChatCompletionProvider = class {
  constructor(_stateManager) {
    this._stateManager = _stateManager;
    this.kinds = /* @__PURE__ */ new Set(["userMessage" /* UserMessage */]);
    this.triggerCharacters = ["#" /* Hash */];
  }
  async provideCompletionItems(params, token) {
    const chatToken = extractChatToken(params.text, params.offset);
    if (!chatToken) {
      return [];
    }
    const session = this._stateManager.getSessionState(params.channel);
    if (!session) {
      return [];
    }
    const sessionUri = isAhpChatChannel(params.channel) ? parseRequiredSessionUriFromChatUri(params.channel) : params.channel;
    const defaultChatUri = session.defaultChat ?? buildDefaultChatUri(sessionUri);
    const currentChatId = this._canonicalChatId(params.channel, sessionUri, defaultChatUri);
    const filter = sanitizeChatTitle(chatToken.typed).toLowerCase();
    const candidates = session.chats.filter((chat) => {
      if (this._canonicalChatId(chat.resource, sessionUri, defaultChatUri) === currentChatId) {
        return false;
      }
      if (chat.origin?.kind === "tool" /* Tool */) {
        return false;
      }
      if (chat.interactivity === "hidden" /* Hidden */) {
        return false;
      }
      if (filter && !sanitizeChatTitle(chat.title).toLowerCase().includes(filter)) {
        return false;
      }
      return true;
    }).sort((a, b) => Date.parse(b.modifiedAt) - Date.parse(a.modifiedAt));
    const items = [];
    for (const chat of candidates) {
      if (token.isCancellationRequested || items.length >= MAX_RESULTS2) {
        break;
      }
      const endTurn2 = this._lastCompletedTurnId(chat.resource);
      if (!endTurn2) {
        continue;
      }
      const sanitizedTitle = sanitizeChatTitle(chat.title);
      items.push({
        insertText: `#chat:${sanitizedTitle} `,
        rangeStart: chatToken.rangeStart,
        rangeEnd: chatToken.rangeEnd,
        attachment: {
          type: "chat" /* Chat */,
          resource: chat.resource,
          endTurn: endTurn2,
          label: sanitizedTitle
        }
      });
    }
    return items;
  }
  /**
   * Normalize a session/chat URI to a single identity string, collapsing every
   * alias of the session's default chat (the session URI, the default chat
   * URI, and the session's `defaultChat` field) onto one value.
   */
  _canonicalChatId(uri, sessionUri, defaultChatUri) {
    const normalizedDefault = URI.parse(defaultChatUri).toString();
    const normalized = URI.parse(uri).toString();
    if (normalized === URI.parse(sessionUri).toString() || isDefaultChatUri(uri)) {
      return normalizedDefault;
    }
    return normalized;
  }
  /**
   * The id of the chat's last completed turn, or `undefined` when it has none.
   * Uses the shared {@link resolveChatStateForUri} so it derives turns the same
   * way as the server-side chat-attachment resolver.
   */
  _lastCompletedTurnId(chatUri) {
    const turns = resolveChatStateForUri(this._stateManager, chatUri)?.turns;
    return turns && turns.length > 0 ? turns[turns.length - 1].id : void 0;
  }
};
export { extractChatToken, sanitizeChatTitle, MAX_RESULTS2, CHAT_PREFIX, AgentHostChatCompletionProvider };
