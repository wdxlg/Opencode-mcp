// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/agentHost/common/agent.ts
import { init_strings, truncate } from "./module-0027.mjs";
import { __esm } from "./module-0000.mjs";
import { init_resources } from "./module-0032.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { buildSubagentChatUri, init_sessionState, parseRequiredSessionUriFromChatUri } from "./module-0315.mjs";


// src/vs/platform/agentHost/common/agent.ts
function isInvalidUtilityProcessConfigurationMessage(message) {
  return /^Invalid value for (?:args|env|execArgv)$/.test(message);
}

function isFatalAgentHostStartError(error) {
  return error instanceof TypeError && isInvalidUtilityProcessConfigurationMessage(error.message);
}

function toFatalAgentHostStartError(error) {
  const startError = new AgentHostStartError(error.message, true);
  startError.name = error.name;
  startError.stack = error.stack;
  return startError;
}

function subagentChatTitle(taskDescription, agentDisplayName) {
  const task = taskDescription?.trim();
  if (task) {
    return truncate(task, SUBAGENT_CHAT_TITLE_MAX_LENGTH);
  }
  return agentDisplayName?.trim() || "Subagent";
}

var AgentHostStartError, SUBAGENT_CHAT_TITLE_MAX_LENGTH, SubagentChatSignal, AgentSession;

var init_agent = __esm({
  "src/vs/platform/agentHost/common/agent.ts"() {
    init_strings();
    init_resources();
    init_uri();
    init_sessionState();
    AgentHostStartError = class extends Error {
      constructor(message, fatal = false) {
        super(message);
        this.fatal = fatal;
      }
    };
    SUBAGENT_CHAT_TITLE_MAX_LENGTH = 60;
    ((SubagentChatSignal2) => {
      function toSpawnEvent(signal) {
        if (signal.kind !== "subagent_started") {
          return void 0;
        }
        let session4;
        try {
          session4 = parseRequiredSessionUriFromChatUri(signal.chat);
        } catch {
          return void 0;
        }
        return {
          session: URI.parse(session4),
          chat: URI.parse(buildSubagentChatUri(session4, signal.toolCallId)),
          parent: { chat: signal.chat, toolCallId: signal.toolCallId },
          title: subagentChatTitle(signal.taskDescription, signal.agentDisplayName)
        };
      }
      SubagentChatSignal2.toSpawnEvent = toSpawnEvent;
    })(SubagentChatSignal || (SubagentChatSignal = {}));
    ((AgentSession2) => {
      function uri(provider2, rawSessionId) {
        return URI.from({ scheme: provider2, path: `/${rawSessionId}` });
      }
      AgentSession2.uri = uri;
      function id2(session4) {
        const parsed = typeof session4 === "string" ? URI.parse(session4) : session4;
        return parsed.path.substring(1);
      }
      AgentSession2.id = id2;
      function provider(session4) {
        const parsed = typeof session4 === "string" ? URI.parse(session4) : session4;
        return parsed.scheme || void 0;
      }
      AgentSession2.provider = provider;
    })(AgentSession || (AgentSession = {}));
  }
});
export { isInvalidUtilityProcessConfigurationMessage, isFatalAgentHostStartError, toFatalAgentHostStartError, subagentChatTitle, AgentHostStartError, SUBAGENT_CHAT_TITLE_MAX_LENGTH, SubagentChatSignal, AgentSession, init_agent };
