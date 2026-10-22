// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/meta/clientPluginCustomizationMeta.ts



// src/vs/platform/agentHost/common/meta/clientPluginCustomizationMeta.ts
var mcpDefaultCwdsKey = "mcpDefaultCwds";

function toClientPluginMcpDefaultCwdsMeta(defaultCwds) {
  return {
    [mcpDefaultCwdsKey]: Object.fromEntries(Object.entries(defaultCwds).map(([name, cwd2]) => [name, cwd2?.toString() ?? null]))
  };
}
export { toClientPluginMcpDefaultCwdsMeta, mcpDefaultCwdsKey };
