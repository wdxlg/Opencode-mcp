// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatSessionsService.ts
import { Registry } from "./module-0090.mjs";
import { LOCAL_AGENT_HOST_SCHEME_PREFIX } from "./module-0960.mjs";
import { isRemoteAgentHostSessionType } from "./module-0959.mjs";
import { createDecorator } from "./module-0077.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/common/chatSessionsService.ts
var AsyncChatSessionActivationRegistry = class {
  constructor() {
    this._contributions = /* @__PURE__ */ new Set();
  }
  register(contribution) {
    this._contributions.add(contribution);
    return {
      dispose: () => this._contributions.delete(contribution)
    };
  }
  getActivators(sessionType) {
    return Array.from(this._contributions).filter((contribution) => contribution.matchSessionType(sessionType));
  }
};

Registry.add("workbench.contrib.chatSessions.asyncActivation" /* AsyncActivation */, new AsyncChatSessionActivationRegistry());

function isTerminalCommandPrompt(text2, prefix) {
  return !!prefix && text2.startsWith(prefix) && text2.slice(prefix.length).trim().length > 0;
}

var SessionType;

((SessionType2) => {
  SessionType2.CopilotCLI = "copilotcli";
  SessionType2.CopilotCloud = "copilot-cloud-agent";
  SessionType2.Local = "local";
  SessionType2.Codex = "openai-codex";
  SessionType2.Growth = "copilot-growth";
  SessionType2.AgentHostCopilot = "agent-host-copilotcli";
  SessionType2.AgentHostClaude = "agent-host-claude";
  SessionType2.AgentHostCodex = "agent-host-codex";
})(SessionType || (SessionType = {}));

function isLocalAgentHostTarget(target) {
  return target === SessionType.AgentHostCopilot || target.startsWith(LOCAL_AGENT_HOST_SCHEME_PREFIX);
}

function isRemoteAgentHostTarget(target) {
  return isRemoteAgentHostSessionType(target);
}

function isAgentHostTarget(target) {
  return isLocalAgentHostTarget(target) || isRemoteAgentHostTarget(target);
}

function isAgentHostSessionResource(resource) {
  return isAgentHostTarget(resource.scheme);
}

var localChatSessionType = SessionType.Local;

var ChatSessionOptionsMap;

((ChatSessionOptionsMap2) => {
  function fromRecord(obj) {
    return new Map(Object.entries(obj));
  }
  ChatSessionOptionsMap2.fromRecord = fromRecord;
  function toRecord(map) {
    const record = /* @__PURE__ */ Object.create(null);
    const entries2 = ensureIterable(map);
    for (const [key3, value2] of entries2) {
      record[key3] = value2;
    }
    return record;
  }
  ChatSessionOptionsMap2.toRecord = toRecord;
  function toStrValueArray(map) {
    if (!map) {
      return void 0;
    }
    const entries2 = ensureIterable(map);
    return Array.from(entries2, ([optionId, value2]) => ({ optionId, value: typeof value2 === "string" ? value2 : value2.id }));
  }
  ChatSessionOptionsMap2.toStrValueArray = toStrValueArray;
  function ensureIterable(map) {
    if (map instanceof Map) {
      return map;
    }
    return Object.entries(map);
  }
})(ChatSessionOptionsMap || (ChatSessionOptionsMap = {}));

var IChatSessionsService = createDecorator("chatSessionsService");

function isSessionInProgressStatus(state) {
  return state === 2 /* InProgress */ || state === 3 /* NeedsInput */;
}

function isIChatSessionFileChange2(obj) {
  const candidate = obj;
  return candidate && candidate.uri instanceof URI && typeof candidate.insertions === "number" && typeof candidate.deletions === "number";
}
export { isTerminalCommandPrompt, isLocalAgentHostTarget, isRemoteAgentHostTarget, isAgentHostTarget, isAgentHostSessionResource, isSessionInProgressStatus, isIChatSessionFileChange2, AsyncChatSessionActivationRegistry, SessionType, localChatSessionType, ChatSessionOptionsMap, IChatSessionsService };
