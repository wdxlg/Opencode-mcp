// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/claudeModelConfig.ts
import { localize } from "./module-0012.mjs";
import { getReasoningEffortDescription, getReasoningEffortLabel } from "./module-0106.mjs";


// src/vs/platform/agentHost/common/claudeModelConfig.ts
var CLAUDE_THINKING_LEVEL_KEY = "thinkingLevel";

function toRuntimeEffortLevel(effort) {
  return effort;
}

function resolveClaudeEffort(model) {
  const raw = model?.config?.[CLAUDE_THINKING_LEVEL_KEY];
  switch (raw) {
    case "low":
    case "medium":
    case "high":
    case "xhigh":
    case "max":
      return raw;
    default:
      return void 0;
  }
}

var CLAUDE_EFFORT_LEVELS = ["low", "medium", "high", "xhigh", "max"];

function isClaudeEffortLevel(value) {
  return CLAUDE_EFFORT_LEVELS.includes(value);
}

function createClaudeThinkingLevelSchema(supportedEfforts) {
  if (supportedEfforts.length === 0) {
    return void 0;
  }
  const defaultEffort = supportedEfforts.includes("high") ? "high" : void 0;
  return {
    type: "object",
    properties: {
      [CLAUDE_THINKING_LEVEL_KEY]: {
        type: "string",
        title: localize(2070, null),
        description: localize(2069, null),
        enum: [...supportedEfforts],
        enumLabels: supportedEfforts.map(getReasoningEffortLabel),
        enumDescriptions: supportedEfforts.map((effort) => getReasoningEffortDescription(effort) ?? ""),
        ...defaultEffort !== void 0 ? { default: defaultEffort } : {}
      }
    }
  };
}
export { toRuntimeEffortLevel, resolveClaudeEffort, isClaudeEffortLevel, createClaudeThinkingLevelSchema, CLAUDE_THINKING_LEVEL_KEY, CLAUDE_EFFORT_LEVELS };
