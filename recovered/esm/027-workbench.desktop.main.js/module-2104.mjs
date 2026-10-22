// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/copilotCliConfig.ts
import { createSchema, schemaProperty } from "./module-2102.mjs";
import { localize } from "./module-0001.mjs";
import { reasoningEffortLevels } from "./module-2103.mjs";


// src/vs/platform/agentHost/common/copilotCliConfig.ts
var CopilotCliVSCodeAssignmentContextKey = "copilotCliVSCodeAssignmentContext";

var AgentHostCustomTerminalToolEnabledSettingId = "chat.agentHost.customTerminalTool.enabled";

var AgentHostCopilotSdkLogLevelSettingId = "chat.agentHost.copilotSdk.logLevel";

var AgentHostOpus48PromptEnabledSettingId = "chat.agentHost.opus48Prompt.enabled";

var AgentHostToolSearchEnabledSettingId = "chat.agentHost.copilot.toolSearch.enabled";

var AgentHostToolSearchDeferThresholdSettingId = "chat.agentHost.copilot.toolSearch.deferThreshold";

var AgentHostReasoningEffortOverrideSettingId = "chat.agentHost.copilot.reasoningEffortOverride";

var AgentHostReasoningSummaryEnabledSettingId = "chat.agentHost.copilot.reasoningSummary.enabled";

var AgentHostMultiTurnContextRoutingEnabledSettingId = "chat.agentHost.copilot.multiTurnContextRouting.enabled";

var CopilotSubagentModelGuidanceEnabledSettingId = "chat.copilot.subagentModelGuidance.enabled";

var AgentHostCopilotModelCapabilityOverridesSettingId = "chat.agentHost.copilot.modelCapabilityOverrides";

var copilotSdkLogLevelSettingValues = ["info", "trace"];

var DEFAULT_COPILOT_RUBBER_DUCK_ENABLED = true;

function normalizeToolSearchDeferThreshold(value2) {
  return value2 !== void 0 && Number.isFinite(value2) && value2 >= 0 ? Math.floor(value2) : 1;
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
export { normalizeToolSearchDeferThreshold, CopilotCliVSCodeAssignmentContextKey, AgentHostCustomTerminalToolEnabledSettingId, AgentHostCopilotSdkLogLevelSettingId, AgentHostOpus48PromptEnabledSettingId, AgentHostToolSearchEnabledSettingId, AgentHostToolSearchDeferThresholdSettingId, AgentHostReasoningEffortOverrideSettingId, AgentHostReasoningSummaryEnabledSettingId, AgentHostMultiTurnContextRoutingEnabledSettingId, CopilotSubagentModelGuidanceEnabledSettingId, AgentHostCopilotModelCapabilityOverridesSettingId, copilotSdkLogLevelSettingValues, DEFAULT_COPILOT_RUBBER_DUCK_ENABLED, copilotCliConfigSchema };
