// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugModelTurnContentRenderer.ts
import { $, append } from "./module-0075.mjs";
import { safeIntl } from "./module-0120.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { renderSection, tokenizeContent } from "./module-2581.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugModelTurnContentRenderer.ts
var $74 = $;

var numberFormatter4 = safeIntl.NumberFormat();

async function renderModelTurnContent(content, languageService, clipboardService, scrollable) {
  const disposables = new DisposableStore();
  const container2 = $74("div.chat-debug-message-content");
  container2.tabIndex = 0;
  append(container2, $74("div.chat-debug-message-content-title", void 0, localize(10703, null)));
  const statusParts = [];
  if (content.requestName) {
    statusParts.push(content.requestName);
  }
  if (content.model) {
    statusParts.push(content.model);
  }
  if (content.status && content.status !== "unknown") {
    statusParts.push(content.status);
  }
  if (content.durationInMillis !== void 0) {
    statusParts.push(localize(10687, null, numberFormatter4.value.format(content.durationInMillis)));
  }
  if (statusParts.length > 0) {
    append(container2, $74("div.chat-debug-message-content-summary", void 0, statusParts.join(" \xB7 ")));
  }
  const detailsContainer = append(container2, $74("div.chat-debug-model-turn-details"));
  if (content.inputTokens !== void 0) {
    append(detailsContainer, $74("div", void 0, localize(10691, null, numberFormatter4.value.format(content.inputTokens))));
  }
  if (content.outputTokens !== void 0) {
    append(detailsContainer, $74("div", void 0, localize(10698, null, numberFormatter4.value.format(content.outputTokens))));
  }
  if (content.cachedTokens !== void 0) {
    append(detailsContainer, $74("div", void 0, localize(10685, null, numberFormatter4.value.format(content.cachedTokens))));
  }
  if (content.totalTokens !== void 0) {
    append(detailsContainer, $74("div", void 0, localize(10704, null, numberFormatter4.value.format(content.totalTokens))));
  }
  if (content.timeToFirstTokenInMillis !== void 0) {
    append(detailsContainer, $74("div", void 0, localize(10706, null, numberFormatter4.value.format(content.timeToFirstTokenInMillis))));
  }
  if (content.maxInputTokens !== void 0) {
    append(detailsContainer, $74("div", void 0, localize(10693, null, numberFormatter4.value.format(content.maxInputTokens))));
  }
  if (content.maxOutputTokens !== void 0) {
    append(detailsContainer, $74("div", void 0, localize(10695, null, numberFormatter4.value.format(content.maxOutputTokens))));
  }
  if (content.errorMessage) {
    append(detailsContainer, $74("div.chat-debug-model-turn-error", void 0, localize(10689, null, content.errorMessage)));
  }
  if (content.sections && content.sections.length > 0) {
    const sectionsContainer = append(container2, $74("div.chat-debug-message-sections"));
    append(sectionsContainer, $74(
      "div.chat-debug-message-sections-label",
      void 0,
      localize(10701, null, content.sections.length)
    ));
    for (const section of content.sections) {
      const { plainText, tokenizedHtml } = await tokenizeContent(section.content, languageService);
      renderSection(sectionsContainer, section.name, plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
    }
  }
  return { element: container2, disposables };
}

function modelTurnContentToPlainText(content) {
  const lines = [];
  lines.push(localize(10700, null, content.requestName));
  if (content.model) {
    lines.push(localize(10697, null, content.model));
  }
  if (content.status && content.status !== "unknown") {
    lines.push(localize(10702, null, content.status));
  }
  if (content.durationInMillis !== void 0) {
    lines.push(localize(10688, null, numberFormatter4.value.format(content.durationInMillis)));
  }
  if (content.timeToFirstTokenInMillis !== void 0) {
    lines.push(localize(10707, null, numberFormatter4.value.format(content.timeToFirstTokenInMillis)));
  }
  if (content.inputTokens !== void 0) {
    lines.push(localize(10692, null, numberFormatter4.value.format(content.inputTokens)));
  }
  if (content.outputTokens !== void 0) {
    lines.push(localize(10699, null, numberFormatter4.value.format(content.outputTokens)));
  }
  if (content.cachedTokens !== void 0) {
    lines.push(localize(10686, null, numberFormatter4.value.format(content.cachedTokens)));
  }
  if (content.totalTokens !== void 0) {
    lines.push(localize(10705, null, numberFormatter4.value.format(content.totalTokens)));
  }
  if (content.maxInputTokens !== void 0) {
    lines.push(localize(10694, null, numberFormatter4.value.format(content.maxInputTokens)));
  }
  if (content.maxOutputTokens !== void 0) {
    lines.push(localize(10696, null, numberFormatter4.value.format(content.maxOutputTokens)));
  }
  if (content.errorMessage) {
    lines.push(localize(10690, null, content.errorMessage));
  }
  if (content.sections && content.sections.length > 0) {
    lines.push("");
    for (const section of content.sections) {
      lines.push(`--- ${section.name} ---`);
      lines.push(section.content);
      lines.push("");
    }
  }
  return lines.join("\n");
}
export { renderModelTurnContent, modelTurnContentToPlainText, $74, numberFormatter4 };
