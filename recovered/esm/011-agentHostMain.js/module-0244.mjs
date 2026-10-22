// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/toolSearchDeferral.ts
import { SEMANTIC_SEARCH_TOOL_NAME } from "./module-0185.mjs";


// src/vs/platform/agentHost/node/copilot/toolSearchDeferral.ts
var NON_DEFERRED_CLIENT_TOOL_NAMES = /* @__PURE__ */ new Set([
  "runTests",
  "rename",
  "usages",
  SEMANTIC_SEARCH_TOOL_NAME
]);

function agentHostModelSupportsToolSearch(modelId) {
  if (!modelId) {
    return false;
  }
  const id2 = modelId.toLowerCase();
  const normalizedId = id2.replace(/\./g, "-");
  if (!normalizedId.startsWith("claude")) {
    return false;
  }
  const isPre45 = normalizedId.startsWith("claude-1") || normalizedId.startsWith("claude-2") || normalizedId.startsWith("claude-3") || normalizedId === "claude-sonnet-4" || normalizedId.startsWith("claude-sonnet-4-2") || normalizedId === "claude-opus-4" || normalizedId.startsWith("claude-opus-4-1") || normalizedId.startsWith("claude-opus-4-2");
  return !isPre45;
}
export { agentHostModelSupportsToolSearch, NON_DEFERRED_CLIENT_TOOL_NAMES };
