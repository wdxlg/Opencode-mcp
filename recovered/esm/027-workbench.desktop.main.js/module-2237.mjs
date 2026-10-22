// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentMessageDelegationMeta.ts



// src/vs/platform/agentHost/common/meta/agentMessageDelegationMeta.ts
var MESSAGE_DELEGATION_META_KEY = "vscode.chat.delegation";

function parseAgentMessageDelegationMeta(value2) {
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const candidate = value2;
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
export { parseAgentMessageDelegationMeta, readAgentMessageDelegationMeta, MESSAGE_DELEGATION_META_KEY };
