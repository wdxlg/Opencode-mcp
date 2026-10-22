// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentMergeMessageMeta.ts



// src/vs/platform/agentHost/common/meta/agentMergeMessageMeta.ts
var AGENT_MERGE_MESSAGE_META_KEY = "vscode.chat.agentMerge";

function isAgentMergeMessage(source) {
  return source._meta?.[AGENT_MERGE_MESSAGE_META_KEY] === true;
}

function toAgentMergeMessageMeta() {
  return { [AGENT_MERGE_MESSAGE_META_KEY]: true };
}
export { isAgentMergeMessage, toAgentMergeMessageMeta, AGENT_MERGE_MESSAGE_META_KEY };
