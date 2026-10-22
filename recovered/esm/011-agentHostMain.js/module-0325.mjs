// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentModelSource.ts



// src/vs/platform/agentHost/common/agentModelSource.ts
var CHATGPT_SUBSCRIPTION_MODEL_SOURCE_ID = "chatgptSubscription";

var AGENT_MODEL_SOURCE_ID_META_KEY = "modelSourceId";

function createAgentModelSourceMeta(sourceId) {
  return sourceId !== void 0 ? { [AGENT_MODEL_SOURCE_ID_META_KEY]: sourceId } : void 0;
}

var AGENT_MODEL_GROUP_ID_META_KEY = "modelGroupId";

function createAgentModelGroupMeta(groupId) {
  return { [AGENT_MODEL_GROUP_ID_META_KEY]: groupId };
}
export { createAgentModelSourceMeta, createAgentModelGroupMeta, CHATGPT_SUBSCRIPTION_MODEL_SOURCE_ID, AGENT_MODEL_SOURCE_ID_META_KEY, AGENT_MODEL_GROUP_ID_META_KEY };
