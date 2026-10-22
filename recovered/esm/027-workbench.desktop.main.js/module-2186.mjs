// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentModelSource.ts



// src/vs/platform/agentHost/common/agentModelSource.ts
var CHATGPT_SUBSCRIPTION_MODEL_SOURCE_ID = "chatgptSubscription";

var AGENT_MODEL_SOURCE_ID_META_KEY = "modelSourceId";

function readAgentModelSourceId(model) {
  const meta = model._meta;
  if (!meta) {
    return void 0;
  }
  const value2 = meta[AGENT_MODEL_SOURCE_ID_META_KEY];
  return typeof value2 === "string" && value2.length > 0 ? value2 : void 0;
}

var AGENT_MODEL_GROUP_ID_META_KEY = "modelGroupId";

function readAgentModelGroupId(model) {
  const meta = model._meta;
  if (!meta) {
    return void 0;
  }
  const value2 = meta[AGENT_MODEL_GROUP_ID_META_KEY];
  return typeof value2 === "string" && value2.length > 0 ? value2 : void 0;
}
export { readAgentModelSourceId, readAgentModelGroupId, CHATGPT_SUBSCRIPTION_MODEL_SOURCE_ID, AGENT_MODEL_SOURCE_ID_META_KEY, AGENT_MODEL_GROUP_ID_META_KEY };
