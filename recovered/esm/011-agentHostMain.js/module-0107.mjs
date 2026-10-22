// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/copilotCliConfig.ts
import { isObject } from "./module-0008.mjs";
import { createSchema, schemaProperty } from "./module-0057.mjs";
import { localize } from "./module-0012.mjs";
import { reasoningEffortLevels } from "./module-0106.mjs";


// src/vs/platform/agentHost/common/copilotCliConfig.ts
var CopilotCliVSCodeAssignmentContextKey = "copilotCliVSCodeAssignmentContext";

var copilotSdkLogLevelSettingValues = ["info", "trace"];

var DEFAULT_COPILOT_RUBBER_DUCK_ENABLED = true;

function normalizeToolSearchDeferThreshold(value) {
  return value !== void 0 && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 1;
}

var MODEL_CAPABILITY_OVERRIDE_WILDCARD = "*";

function resolveModelCapabilityOverrideField(overrides, modelId, field, isUsable, onInvalid) {
  const entryKeys = modelId === void 0 || modelId === MODEL_CAPABILITY_OVERRIDE_WILDCARD ? [MODEL_CAPABILITY_OVERRIDE_WILDCARD] : [modelId, MODEL_CAPABILITY_OVERRIDE_WILDCARD];
  for (const entryKey of entryKeys) {
    const entry = overrides?.[entryKey];
    const value = isObject(entry) ? entry[field] : void 0;
    if (value === void 0) {
      continue;
    }
    if (isUsable(value)) {
      return value;
    }
    onInvalid?.(value);
  }
  return void 0;
}

var copilotCliConfigSchema = createSchema({
  ["enableCustomTerminalTool" /* EnableCustomTerminalTool */]: schemaProperty({
    type: "boolean",
    title: localize(2076, null),
    description: localize(2075, null),
    default: false
  }),
  ["copilotSdkLogLevel" /* CopilotSdkLogLevel */]: schemaProperty({
    type: "string",
    title: localize(2073, null),
    description: localize(2071, null),
    enum: [...copilotSdkLogLevelSettingValues],
    enumLabels: [
      localize(2072, null),
      localize(2074, null)
    ],
    default: "info"
  }),
  ["rubberDuck" /* RubberDuck */]: schemaProperty({
    type: "boolean",
    title: localize(2100, null),
    description: localize(2099, null),
    default: DEFAULT_COPILOT_RUBBER_DUCK_ENABLED
  }),
  ["opus48Prompt" /* Opus48Prompt */]: schemaProperty({
    type: "boolean",
    title: localize(2096, null),
    description: localize(2095, null),
    default: false
  }),
  ["toolSearchEnabled" /* ToolSearchEnabled */]: schemaProperty({
    type: "boolean",
    title: localize(2106, null),
    description: localize(2105, null),
    default: true
  }),
  ["toolSearchDeferThreshold" /* ToolSearchDeferThreshold */]: schemaProperty({
    type: "number",
    title: localize(2104, null),
    description: localize(2103, null),
    default: 1
  }),
  ["reasoningSummary" /* ReasoningSummary */]: schemaProperty({
    type: "boolean",
    title: localize(2098, null),
    description: localize(2097, null),
    default: false
  }),
  ["multiTurnContextRouting" /* MultiTurnContextRouting */]: schemaProperty({
    type: "boolean",
    title: localize(2094, null),
    description: localize(2093, null),
    default: false
  }),
  ["subagentModelGuidance" /* SubagentModelGuidance */]: schemaProperty({
    type: "boolean",
    title: localize(2102, null),
    description: localize(2101, null),
    default: false
  }),
  ["modelCapabilityOverrides" /* ModelCapabilityOverrides */]: schemaProperty({
    type: "object",
    title: localize(2092, null),
    description: localize(2080, null),
    additionalProperties: {
      type: "object",
      title: localize(2082, null),
      description: localize(2081, null),
      properties: {
        family: {
          type: "string",
          title: localize(2087, null),
          description: localize(2086, null)
        },
        reasoningEffort: {
          type: "string",
          enum: [...reasoningEffortLevels],
          title: localize(2091, null),
          description: localize(2090, null)
        },
        availableTools: {
          type: "array",
          items: { type: "string", title: localize(2078, null) },
          title: localize(2079, null),
          description: localize(2077, null)
        },
        excludedTools: {
          type: "array",
          items: { type: "string", title: localize(2084, null) },
          title: localize(2085, null),
          description: localize(2083, null)
        },
        modelCapabilities: {
          type: "object",
          title: localize(2089, null),
          description: localize(2088, null)
        }
      }
    },
    default: {}
  })
});

var MODEL_FAMILY_MAX_LENGTH = 128;

var MODEL_FAMILY_CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

function normalizeModelFamilyAlias(value) {
  if (typeof value !== "string" || value.length === 0 || value.length > MODEL_FAMILY_MAX_LENGTH) {
    return void 0;
  }
  return value.trim() === value && !MODEL_FAMILY_CONTROL_CHARS.test(value) ? value : void 0;
}
export { normalizeToolSearchDeferThreshold, resolveModelCapabilityOverrideField, normalizeModelFamilyAlias, CopilotCliVSCodeAssignmentContextKey, copilotSdkLogLevelSettingValues, DEFAULT_COPILOT_RUBBER_DUCK_ENABLED, MODEL_CAPABILITY_OVERRIDE_WILDCARD, copilotCliConfigSchema, MODEL_FAMILY_MAX_LENGTH, MODEL_FAMILY_CONTROL_CHARS };
