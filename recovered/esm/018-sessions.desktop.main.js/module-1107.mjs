// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agent.ts
import { truncate } from "./module-0030.mjs";
import { buildSubagentChatUri, parseRequiredSessionUriFromChatUri } from "./module-1008.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/platform/agentHost/common/agent.ts
var CLAUDE_AGENT_PROVIDER_ID = "claude";

var CODEX_AGENT_PROVIDER_ID = "codex";

var GITHUB_COPILOT_PROTECTED_RESOURCE = {
  resource: "https://api.github.com",
  resource_name: "GitHub Copilot",
  authorization_servers: ["https://github.com/login/oauth"],
  scopes_supported: ["read:user", "user:email"],
  required: true
};

function protectedResourcesRequireGitHubCopilotSignIn(resources) {
  return resources.some((resource) => resource.resource === GITHUB_COPILOT_PROTECTED_RESOURCE.resource && resource.required !== false);
}

var SUBAGENT_CHAT_TITLE_MAX_LENGTH = 60;

function subagentChatTitle(taskDescription2, agentDisplayName) {
  const task = taskDescription2?.trim();
  if (task) {
    return truncate(task, SUBAGENT_CHAT_TITLE_MAX_LENGTH);
  }
  return agentDisplayName?.trim() || "Subagent";
}

var SubagentChatSignal;

((SubagentChatSignal2) => {
  function toSpawnEvent(signal) {
    if (signal.kind !== "subagent_started") {
      return void 0;
    }
    let session;
    try {
      session = parseRequiredSessionUriFromChatUri(signal.chat);
    } catch {
      return void 0;
    }
    return {
      session: URI.parse(session),
      chat: URI.parse(buildSubagentChatUri(session, signal.toolCallId)),
      parent: { chat: signal.chat, toolCallId: signal.toolCallId },
      title: subagentChatTitle(signal.taskDescription, signal.agentDisplayName)
    };
  }
  SubagentChatSignal2.toSpawnEvent = toSpawnEvent;
})(SubagentChatSignal || (SubagentChatSignal = {}));

var AgentSession;

((AgentSession2) => {
  function uri4(provider2, rawSessionId) {
    return URI.from({ scheme: provider2, path: `/${rawSessionId}` });
  }
  AgentSession2.uri = uri4;
  function id2(session) {
    const parsed = typeof session === "string" ? URI.parse(session) : session;
    return parsed.path.substring(1);
  }
  AgentSession2.id = id2;
  function provider(session) {
    const parsed = typeof session === "string" ? URI.parse(session) : session;
    return parsed.scheme || void 0;
  }
  AgentSession2.provider = provider;
})(AgentSession || (AgentSession = {}));
export { protectedResourcesRequireGitHubCopilotSignIn, subagentChatTitle, CLAUDE_AGENT_PROVIDER_ID, CODEX_AGENT_PROVIDER_ID, GITHUB_COPILOT_PROTECTED_RESOURCE, SUBAGENT_CHAT_TITLE_MAX_LENGTH, SubagentChatSignal, AgentSession };
