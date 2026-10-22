// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeModelSelection.ts
import { CLAUDE_PROVIDER_ANTHROPIC, CLAUDE_PROVIDER_COPILOT } from "./module-0326.mjs";
import { toSdkModelId } from "./module-0327.mjs";
import { createAgentModelGroupMeta } from "./module-0325.mjs";


// src/vs/platform/agentHost/node/claude/claudeModelSelection.ts
var CLAUDE_MODEL_SELECTION_PREFIX = "@provider=";

function toClaudeModelSelectionId(provider, modelId) {
  return `${CLAUDE_MODEL_SELECTION_PREFIX}${encodeURIComponent(provider)}:${encodeURIComponent(modelId)}`;
}

function parseClaudeModelSelection(selection) {
  const { id: id2 } = selection;
  if (!id2.startsWith(CLAUDE_MODEL_SELECTION_PREFIX)) {
    return { provider: CLAUDE_PROVIDER_COPILOT, modelId: id2, explicitProvider: false };
  }
  const separator = id2.indexOf(":", CLAUDE_MODEL_SELECTION_PREFIX.length);
  if (separator < CLAUDE_MODEL_SELECTION_PREFIX.length) {
    return { provider: CLAUDE_PROVIDER_COPILOT, modelId: id2, explicitProvider: false };
  }
  try {
    return {
      provider: decodeURIComponent(id2.slice(CLAUDE_MODEL_SELECTION_PREFIX.length, separator)),
      modelId: decodeURIComponent(id2.slice(separator + 1)),
      explicitProvider: true
    };
  } catch {
    return { provider: CLAUDE_PROVIDER_COPILOT, modelId: id2, explicitProvider: false };
  }
}

function toClaudeSdkModelId(model) {
  if (!model) {
    return void 0;
  }
  return toSdkModelId(parseClaudeModelSelection(model).modelId);
}

function claudeTransportForProvider(provider) {
  return provider === CLAUDE_PROVIDER_ANTHROPIC ? "native" : "proxy";
}

function resolveClaudeSessionTransport(inputs) {
  const { model, defaultMode } = inputs;
  if (!model) {
    return defaultMode;
  }
  const parsed = parseClaudeModelSelection(model);
  if (!parsed.explicitProvider) {
    return defaultMode;
  }
  return claudeTransportForProvider(parsed.provider);
}

function mergeClaudeModelCatalogs(proxy, native) {
  return [
    ...withQualifiedProvider(proxy, CLAUDE_PROVIDER_COPILOT),
    ...withQualifiedProvider(native, CLAUDE_PROVIDER_ANTHROPIC)
  ];
}

function withQualifiedProvider(models, provider) {
  return models.map((model) => ({
    ...model,
    id: toClaudeModelSelectionId(provider, model.id),
    _meta: { ...model._meta, ...createAgentModelGroupMeta(provider) }
  }));
}
export { toClaudeModelSelectionId, parseClaudeModelSelection, toClaudeSdkModelId, claudeTransportForProvider, resolveClaudeSessionTransport, mergeClaudeModelCatalogs, withQualifiedProvider, CLAUDE_MODEL_SELECTION_PREFIX };
