// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/speechToText/micButtonHovers.ts
import { MarkdownString, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { DICTATION_MAI_MODEL_ID, DICTATION_MODEL_SETTING } from "./module-1348.mjs";
import { localize } from "./module-0001.mjs";
import { DEFAULT_LOCAL_TRANSCRIPTION_MODEL } from "./module-1341.mjs";


// src/vs/workbench/contrib/chat/browser/speechToText/micButtonHovers.ts
function createMicButtonHover(title, description) {
  const markdown = new MarkdownString("", { supportThemeIcons: true });
  markdown.appendMarkdown(`**${escapeMarkdownSyntaxTokens(title)}**`);
  markdown.appendMarkdown("\n\n");
  markdown.appendMarkdown(escapeMarkdownSyntaxTokens(description));
  return markdown;
}

function asHoverContent(title, description) {
  return { markdown: createMicButtonHover(title, description), markdownNotSupportedFallback: `${title}
${description}` };
}

function getDictationDescription(configurationService) {
  const modelId = configurationService.getValue(DICTATION_MODEL_SETTING)?.trim();
  if (modelId === DICTATION_MAI_MODEL_ID) {
    return localize(11641, null);
  }
  if (!modelId || modelId === DEFAULT_LOCAL_TRANSCRIPTION_MODEL) {
    return localize(11642, null);
  }
  return localize(11643, null, modelId);
}

function getVoiceModeDescription() {
  return localize(11644, null);
}

function getDictationHoverContent(title, configurationService) {
  return asHoverContent(title, getDictationDescription(configurationService));
}

function getVoiceModeHoverContent(title) {
  return asHoverContent(title, getVoiceModeDescription());
}
export { createMicButtonHover, asHoverContent, getDictationDescription, getVoiceModeDescription, getDictationHoverContent, getVoiceModeHoverContent };
