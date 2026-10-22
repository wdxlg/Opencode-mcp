// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatSessionsService.ts
import { Registry } from "./module-0090.mjs";
import { createDecorator } from "./module-0038.mjs";


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

var localChatSessionType = SessionType.Local;

var ChatSessionOptionsMap;

((ChatSessionOptionsMap2) => {
  function fromRecord(obj) {
    return new Map(Object.entries(obj));
  }
  ChatSessionOptionsMap2.fromRecord = fromRecord;
  function toRecord(map) {
    const record = /* @__PURE__ */ Object.create(null);
    const entries = ensureIterable(map);
    for (const [key, value] of entries) {
      record[key] = value;
    }
    return record;
  }
  ChatSessionOptionsMap2.toRecord = toRecord;
  function toStrValueArray(map) {
    if (!map) {
      return void 0;
    }
    const entries = ensureIterable(map);
    return Array.from(entries, ([optionId, value]) => ({ optionId, value: typeof value === "string" ? value : value.id }));
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
export { AsyncChatSessionActivationRegistry, SessionType, localChatSessionType, ChatSessionOptionsMap, IChatSessionsService };
