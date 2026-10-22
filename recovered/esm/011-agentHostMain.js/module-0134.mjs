// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentModelByokMeta.ts



// src/vs/platform/agentHost/common/agentModelByokMeta.ts
var BYOK_MODEL_IDENTIFIER_META_KEY = "byokModelIdentifier";

function createAgentModelByokMeta(modelIdentifier) {
  return modelIdentifier !== void 0 ? { [BYOK_MODEL_IDENTIFIER_META_KEY]: modelIdentifier } : void 0;
}

function readAgentModelByokIdentifier(model) {
  const meta = model._meta;
  if (!meta) {
    return void 0;
  }
  const value = meta[BYOK_MODEL_IDENTIFIER_META_KEY];
  return typeof value === "string" ? value : void 0;
}
export { createAgentModelByokMeta, readAgentModelByokIdentifier, BYOK_MODEL_IDENTIFIER_META_KEY };
