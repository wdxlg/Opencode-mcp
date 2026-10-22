// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/reasoningEffort.ts
import { localize } from "./module-0012.mjs";


// src/vs/platform/agentHost/common/reasoningEffort.ts
var reasoningEffortLevels = ["none", "minimal", "low", "medium", "high", "xhigh", "max", "ultra"];

function getReasoningEffortLabel(level) {
  switch (level) {
    case "none":
      return localize(2133, null);
    case "minimal":
      return localize(2131, null);
    case "low":
      return localize(2125, null);
    case "medium":
      return localize(2129, null);
    case "high":
      return localize(2123, null);
    case "xhigh":
      return localize(2137, null);
    case "max":
      return localize(2127, null);
    case "ultra":
      return localize(2135, null);
    default:
      return level.charAt(0).toUpperCase() + level.slice(1);
  }
}

function getReasoningEffortDescription(level) {
  switch (level) {
    case "none":
      return localize(2134, null);
    case "minimal":
      return localize(2132, null);
    case "low":
      return localize(2126, null);
    case "medium":
      return localize(2130, null);
    case "high":
      return localize(2124, null);
    case "xhigh":
      return localize(2138, null);
    case "max":
      return localize(2128, null);
    case "ultra":
      return localize(2136, null);
    default:
      return void 0;
  }
}

function resolveDefaultReasoningEffort(supportedEfforts, declaredDefault, modelId) {
  if (!supportedEfforts?.length) {
    return void 0;
  }
  if (declaredDefault && supportedEfforts.includes(declaredDefault)) {
    return declaredDefault;
  }
  const lowerId = modelId?.toLowerCase() ?? "";
  const preferred = lowerId.startsWith("claude") || lowerId.includes("kimi-k3") ? "high" : "medium";
  return supportedEfforts.includes(preferred) ? preferred : supportedEfforts[0];
}
export { getReasoningEffortLabel, getReasoningEffortDescription, resolveDefaultReasoningEffort, reasoningEffortLevels };
