// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentModelByokMeta.ts



// src/vs/platform/agentHost/common/agentModelByokMeta.ts
var BYOK_MODEL_IDENTIFIER_META_KEY = "byokModelIdentifier";

function readAgentModelByokIdentifier(model) {
  const meta = model._meta;
  if (!meta) {
    return void 0;
  }
  const value2 = meta[BYOK_MODEL_IDENTIFIER_META_KEY];
  return typeof value2 === "string" ? value2 : void 0;
}
export { readAgentModelByokIdentifier, BYOK_MODEL_IDENTIFIER_META_KEY };
