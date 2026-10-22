// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugModelTurnContentRenderer.ts
import { $, append } from "./module-0075.mjs";
import { safeIntl } from "./module-0120.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { renderSection, tokenizeContent } from "./module-2606.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugModelTurnContentRenderer.ts
var $75 = $;

var numberFormatter4 = safeIntl.NumberFormat();

async function renderModelTurnContent(content2, languageService, clipboardService, scrollable) {
  const disposables = new DisposableStore();
  const container3 = $75("div.chat-debug-message-content");
  container3.tabIndex = 0;
  append(container3, $75("div.chat-debug-message-content-title", void 0, localize(10703, null)));
  const statusParts = [];
  if (content2.requestName) {
    statusParts.push(content2.requestName);
  }
  if (content2.model) {
    statusParts.push(content2.model);
  }
  if (content2.status && content2.status !== "unknown") {
    statusParts.push(content2.status);
  }
  if (content2.durationInMillis !== void 0) {
    statusParts.push(localize(10687, null, numberFormatter4.value.format(content2.durationInMillis)));
  }
  if (statusParts.length > 0) {
    append(container3, $75("div.chat-debug-message-content-summary", void 0, statusParts.join(" \xB7 ")));
  }
  const detailsContainer = append(container3, $75("div.chat-debug-model-turn-details"));
  if (content2.inputTokens !== void 0) {
    append(detailsContainer, $75("div", void 0, localize(10691, null, numberFormatter4.value.format(content2.inputTokens))));
  }
  if (content2.outputTokens !== void 0) {
    append(detailsContainer, $75("div", void 0, localize(10698, null, numberFormatter4.value.format(content2.outputTokens))));
  }
  if (content2.cachedTokens !== void 0) {
    append(detailsContainer, $75("div", void 0, localize(10685, null, numberFormatter4.value.format(content2.cachedTokens))));
  }
  if (content2.totalTokens !== void 0) {
    append(detailsContainer, $75("div", void 0, localize(10704, null, numberFormatter4.value.format(content2.totalTokens))));
  }
  if (content2.timeToFirstTokenInMillis !== void 0) {
    append(detailsContainer, $75("div", void 0, localize(10706, null, numberFormatter4.value.format(content2.timeToFirstTokenInMillis))));
  }
  if (content2.maxInputTokens !== void 0) {
    append(detailsContainer, $75("div", void 0, localize(10693, null, numberFormatter4.value.format(content2.maxInputTokens))));
  }
  if (content2.maxOutputTokens !== void 0) {
    append(detailsContainer, $75("div", void 0, localize(10695, null, numberFormatter4.value.format(content2.maxOutputTokens))));
  }
  if (content2.errorMessage) {
    append(detailsContainer, $75("div.chat-debug-model-turn-error", void 0, localize(10689, null, content2.errorMessage)));
  }
  if (content2.sections && content2.sections.length > 0) {
    const sectionsContainer = append(container3, $75("div.chat-debug-message-sections"));
    append(sectionsContainer, $75(
      "div.chat-debug-message-sections-label",
      void 0,
      localize(10701, null, content2.sections.length)
    ));
    for (const section of content2.sections) {
      const { plainText, tokenizedHtml } = await tokenizeContent(section.content, languageService);
      renderSection(sectionsContainer, section.name, plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
    }
  }
  return { element: container3, disposables };
}

function modelTurnContentToPlainText(content2) {
  const lines = [];
  lines.push(localize(10700, null, content2.requestName));
  if (content2.model) {
    lines.push(localize(10697, null, content2.model));
  }
  if (content2.status && content2.status !== "unknown") {
    lines.push(localize(10702, null, content2.status));
  }
  if (content2.durationInMillis !== void 0) {
    lines.push(localize(10688, null, numberFormatter4.value.format(content2.durationInMillis)));
  }
  if (content2.timeToFirstTokenInMillis !== void 0) {
    lines.push(localize(10707, null, numberFormatter4.value.format(content2.timeToFirstTokenInMillis)));
  }
  if (content2.inputTokens !== void 0) {
    lines.push(localize(10692, null, numberFormatter4.value.format(content2.inputTokens)));
  }
  if (content2.outputTokens !== void 0) {
    lines.push(localize(10699, null, numberFormatter4.value.format(content2.outputTokens)));
  }
  if (content2.cachedTokens !== void 0) {
    lines.push(localize(10686, null, numberFormatter4.value.format(content2.cachedTokens)));
  }
  if (content2.totalTokens !== void 0) {
    lines.push(localize(10705, null, numberFormatter4.value.format(content2.totalTokens)));
  }
  if (content2.maxInputTokens !== void 0) {
    lines.push(localize(10694, null, numberFormatter4.value.format(content2.maxInputTokens)));
  }
  if (content2.maxOutputTokens !== void 0) {
    lines.push(localize(10696, null, numberFormatter4.value.format(content2.maxOutputTokens)));
  }
  if (content2.errorMessage) {
    lines.push(localize(10690, null, content2.errorMessage));
  }
  if (content2.sections && content2.sections.length > 0) {
    lines.push("");
    for (const section of content2.sections) {
      lines.push(`--- ${section.name} ---`);
      lines.push(section.content);
      lines.push("");
    }
  }
  return lines.join("\n");
}
export { renderModelTurnContent, modelTurnContentToPlainText, $75, numberFormatter4 };
