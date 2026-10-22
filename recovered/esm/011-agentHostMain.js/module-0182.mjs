// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentChatInputRequestMeta.ts



// src/vs/platform/agentHost/common/meta/agentChatInputRequestMeta.ts
var PURPOSE_META_KEY = "purpose";

function isChatInputRequestPurpose(value) {
  return value === "askUser" /* AskUser */ || value === "elicitation" /* Elicitation */ || value === "planReview" /* PlanReview */;
}

function readChatInputRequestPurpose(request) {
  const meta = request._meta;
  if (!meta) {
    return void 0;
  }
  const purpose = meta[PURPOSE_META_KEY];
  return isChatInputRequestPurpose(purpose) ? purpose : void 0;
}

function withChatInputRequestPurpose(request, purpose) {
  const meta = request._meta;
  return {
    ...request,
    _meta: { ...meta, [PURPOSE_META_KEY]: purpose }
  };
}
export { isChatInputRequestPurpose, readChatInputRequestPurpose, withChatInputRequestPurpose, PURPOSE_META_KEY };
