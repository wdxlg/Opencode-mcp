// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostTurnTelemetryContext.ts
import { URI } from "./module-0023.mjs";
import { readAgentModelByokIdentifier } from "./module-0134.mjs";


// src/vs/platform/agentHost/node/agentHostTurnTelemetryContext.ts
function getConfiguredSessionMode(config) {
  const value = config?.values["mode" /* Mode */] ?? config?.schema.properties["mode" /* Mode */]?.default;
  switch (value) {
    case "interactive":
    case "plan":
    case "autopilot":
      return value;
    default:
      return void 0;
  }
}

function getTurnTelemetryContext(agent, chat, context, state, modelId) {
  const permissionValue = state?.config?.values["autoApprove" /* AutoApprove */];
  const permissionLevel = typeof permissionValue === "string" ? permissionValue : void 0;
  const interactionMode = getConfiguredSessionMode(state?.config);
  const modelSelectionKind = modelId === void 0 ? "default" : modelId === "auto" ? "auto" : "explicit";
  const effectiveModelId = modelId ?? agent.chats.getModel?.(URI.parse(chat), context)?.id;
  const modelContext = effectiveModelId === void 0 || modelId === void 0 && effectiveModelId === "auto" ? { model: void 0, modelTelemetryKind: void 0 } : getModelTelemetryContext(agent, effectiveModelId);
  return { ...modelContext, modelSelectionKind, permissionLevel, interactionMode };
}

function getModelTelemetryContext(agent, modelId) {
  const model = agent.models.get().find((model2) => model2.id === modelId);
  let modelTelemetryKind;
  if (modelId === "auto") {
    modelTelemetryKind = "trusted";
  } else if (model === void 0) {
    modelTelemetryKind = "unknown";
  } else {
    modelTelemetryKind = readAgentModelByokIdentifier(model) === void 0 ? "trusted" : "byok";
  }
  return { model: modelId, modelTelemetryKind };
}
export { getConfiguredSessionMode, getTurnTelemetryContext, getModelTelemetryContext };
