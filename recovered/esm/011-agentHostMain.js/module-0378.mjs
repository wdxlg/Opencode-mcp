// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentMessageDelegationMeta.ts



// src/vs/platform/agentHost/common/meta/agentMessageDelegationMeta.ts
var MESSAGE_DELEGATION_META_KEY = "vscode.chat.delegation";

function parseAgentMessageDelegationMeta(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const candidate = value;
  const sourceThreadId = candidate["sourceThreadId"];
  if (typeof sourceThreadId === "string" && sourceThreadId.length > 0) {
    return { sourceThreadId };
  }
  const sourceSession = candidate["sourceSession"];
  if (typeof sourceSession !== "string" || sourceSession.length === 0) {
    return void 0;
  }
  return {
    sourceSession,
    ...typeof candidate["sourceChat"] === "string" ? { sourceChat: candidate["sourceChat"] } : {},
    ...typeof candidate["sourceTurnId"] === "string" ? { sourceTurnId: candidate["sourceTurnId"] } : {}
  };
}

function readAgentMessageDelegationMeta(source) {
  return parseAgentMessageDelegationMeta(source._meta?.[MESSAGE_DELEGATION_META_KEY]);
}

function toAgentMessageDelegationMeta(meta) {
  return { [MESSAGE_DELEGATION_META_KEY]: meta };
}
export { parseAgentMessageDelegationMeta, readAgentMessageDelegationMeta, toAgentMessageDelegationMeta, MESSAGE_DELEGATION_META_KEY };
