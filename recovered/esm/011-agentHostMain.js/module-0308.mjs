// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentCustomizationMeta.ts



// src/vs/platform/agentHost/common/meta/agentCustomizationMeta.ts
function toAgentCustomizationMeta(meta) {
  const result = {};
  for (const [key, value] of Object.entries(meta)) {
    if (value !== void 0) {
      result[key] = value;
    }
  }
  return Object.keys(result).length > 0 ? result : void 0;
}
export { toAgentCustomizationMeta };
