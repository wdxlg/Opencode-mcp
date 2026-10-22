// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/modelIdentifiers.ts



// src/vs/platform/agentHost/node/copilot/modelIdentifiers.ts
var GPT_56_MODEL_IDS = /* @__PURE__ */ new Set([
  "gpt-5.6-sol",
  "gpt-5.6-terra",
  "gpt-5.6-luna"
]);

function isGpt56Model(modelId) {
  return modelId !== void 0 && GPT_56_MODEL_IDS.has(modelId.toLowerCase());
}
export { isGpt56Model, GPT_56_MODEL_IDS };
