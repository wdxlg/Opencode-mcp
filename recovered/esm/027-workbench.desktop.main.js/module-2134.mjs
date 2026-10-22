// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelProviderIcons.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { isAutoLanguageModel } from "./module-0967.mjs";
import { getCompactCodicon } from "./module-2040.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelProviderIcons.ts
var copilotModelProviderIcon = registerIcon("chat-model-provider-copilot", Codicon.copilotCompact, localize(12630, null));

var openAIModelProviderIcon = registerIcon("chat-model-provider-openai", Codicon.openai, localize(12636, null));

var claudeModelProviderIcon = registerIcon("chat-model-provider-claude", Codicon.claude, localize(12629, null));

var geminiModelProviderIcon = registerIcon("chat-model-provider-gemini", Codicon.googleGemini, localize(12631, null));

var kimiModelProviderIcon = registerIcon("chat-model-provider-kimi", Codicon.kimi, localize(12634, null));

var microsoftModelProviderIcon = registerIcon("chat-model-provider-microsoft", Codicon.microsoft, localize(12635, null));

var xAIModelProviderIcon = registerIcon("chat-model-provider-xai", Codicon.xai, localize(12637, null));

var genericModelProviderIcon = registerIcon("chat-model-provider-generic", Codicon.sparkle, localize(12633, null));

var genericModelProviderCompactIcon = registerIcon("chat-model-provider-generic-compact", Codicon.sparkleCompact, localize(12632, null));

function getModelProviderIcon(model) {
  const identity2 = `${model.metadata.vendor} ${model.metadata.family} ${model.metadata.id} ${model.metadata.name}`.toLowerCase();
  if (identity2.includes("grok") || identity2.includes("xai")) {
    return xAIModelProviderIcon;
  }
  if (model.metadata.isBYOK) {
    return genericModelProviderIcon;
  }
  if (isAutoLanguageModel(model)) {
    return copilotModelProviderIcon;
  }
  if (identity2.includes("claude") || identity2.includes("anthropic")) {
    return claudeModelProviderIcon;
  }
  if (identity2.includes("gemini") || identity2.includes("google")) {
    return geminiModelProviderIcon;
  }
  if (identity2.includes("kimi") || identity2.includes("moonshot")) {
    return kimiModelProviderIcon;
  }
  if (identity2.includes("microsoft") || /\bmai\b/.test(identity2)) {
    return microsoftModelProviderIcon;
  }
  if (identity2.includes("openai") || identity2.includes("gpt") || identity2.includes("codex") || /\bo[134]\b/.test(identity2)) {
    return openAIModelProviderIcon;
  }
  const modelIdentity = `${model.metadata.id} ${model.metadata.name}`.toLowerCase();
  if (modelIdentity.includes("copilot")) {
    return copilotModelProviderIcon;
  }
  return genericModelProviderIcon;
}

function getModelPickerIcon(model) {
  return model.metadata.statusIcon ?? getModelProviderIcon(model);
}

function getCompactModelPickerIcon(model) {
  const icon2 = getModelPickerIcon(model);
  return icon2.id === genericModelProviderIcon.id ? genericModelProviderCompactIcon : getCompactCodicon(icon2);
}
export { getModelProviderIcon, getModelPickerIcon, getCompactModelPickerIcon, copilotModelProviderIcon, openAIModelProviderIcon, claudeModelProviderIcon, geminiModelProviderIcon, kimiModelProviderIcon, microsoftModelProviderIcon, xAIModelProviderIcon, genericModelProviderIcon, genericModelProviderCompactIcon };
