// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agent.ts
import { URI } from "./module-0023.mjs";
import { isEqual2 } from "./module-0025.mjs";
import { truncate } from "./module-0021.mjs";
import { buildSubagentChatUri, parseRequiredSessionUriFromChatUri } from "./module-0047.mjs";


// src/vs/platform/agentHost/common/agent.ts
var CLAUDE_AGENT_PROVIDER_ID = "claude";

var CODEX_AGENT_PROVIDER_ID = "codex";

function resolveAgentChatContext(configurationResourceOrContext, resource) {
  const context = URI.isUri(configurationResourceOrContext) ? { configurationResource: configurationResourceOrContext, resource } : configurationResourceOrContext;
  if (!isEqual2(context.resource, context.configurationResource) && !isEqual2(context.resource, resource)) {
    throw new Error(`Chat context resource must be the configuration resource or addressed chat: ${context.resource.toString()}`);
  }
  return context;
}

function resolveAgentChatOrigin(context) {
  return context && !URI.isUri(context) ? context.origin : void 0;
}

function resolveSubagentChatParent(context) {
  const origin = resolveAgentChatOrigin(context);
  return origin?.kind === "tool" /* Tool */ ? { chat: URI.parse(origin.chat), toolCallId: origin.toolCallId } : void 0;
}

function resolveAgentHostCustomizations(context) {
  return context && !URI.isUri(context) ? context.customizations : void 0;
}

function resolveAgentHostInstructions(context) {
  return context && !URI.isUri(context) ? context.hostInstructions : void 0;
}

var AgentChatMigrationDeferred = /* @__PURE__ */ Symbol("AgentChatMigrationDeferred");

var SUBAGENT_CHAT_TITLE_MAX_LENGTH = 60;

function subagentChatTitle(taskDescription, agentDisplayName) {
  const task = taskDescription?.trim();
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
  function uri(provider2, rawSessionId) {
    return URI.from({ scheme: provider2, path: `/${rawSessionId}` });
  }
  AgentSession2.uri = uri;
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
export { resolveAgentChatContext, resolveAgentChatOrigin, resolveSubagentChatParent, resolveAgentHostCustomizations, resolveAgentHostInstructions, subagentChatTitle, CLAUDE_AGENT_PROVIDER_ID, CODEX_AGENT_PROVIDER_ID, AgentChatMigrationDeferred, SUBAGENT_CHAT_TITLE_MAX_LENGTH, SubagentChatSignal, AgentSession };
