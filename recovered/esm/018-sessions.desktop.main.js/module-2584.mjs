// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugHookContentRenderer.ts
import { $, append } from "./module-0075.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { renderSection, tokenizeContent } from "./module-2581.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugHookContentRenderer.ts
var $75 = $;

async function renderHookContent(content, languageService, clipboardService, scrollable) {
  const disposables = new DisposableStore();
  const container2 = $75("div.chat-debug-message-content");
  container2.tabIndex = 0;
  append(container2, $75("div.chat-debug-message-content-title", void 0, content.hookType));
  const statusParts = [];
  if (content.result !== void 0) {
    statusParts.push(formatHookResult(content.result));
  }
  if (content.exitCode !== void 0) {
    statusParts.push(localize(10642, null, content.exitCode));
  }
  if (content.durationInMillis !== void 0) {
    statusParts.push(localize(10639, null, content.durationInMillis));
  }
  if (statusParts.length > 0) {
    append(container2, $75("div.chat-debug-message-content-summary", void 0, statusParts.join(" \xB7 ")));
  }
  const sectionsContainer = append(container2, $75("div.chat-debug-message-sections"));
  if (content.command) {
    const { plainText, tokenizedHtml } = await tokenizeContent(content.command, languageService);
    renderSection(sectionsContainer, localize(10638, null), plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
  }
  if (content.input) {
    const { plainText, tokenizedHtml } = await tokenizeContent(content.input, languageService);
    renderSection(sectionsContainer, localize(10644, null), plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
  }
  if (content.output) {
    const { plainText, tokenizedHtml } = await tokenizeContent(content.output, languageService);
    renderSection(sectionsContainer, localize(10645, null), plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
  }
  if (content.errorMessage) {
    const { plainText, tokenizedHtml } = await tokenizeContent(content.errorMessage, languageService);
    renderSection(sectionsContainer, localize(10641, null), plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
  }
  return { element: container2, disposables };
}

function formatHookResult(result) {
  switch (result) {
    case 0 /* Success */:
      return localize(10648, null);
    case 1 /* Error */:
      return localize(10646, null);
    case 2 /* NonBlockingError */:
      return localize(10647, null);
    default:
      return String(result);
  }
}

function hookContentToPlainText(content) {
  const lines = [];
  lines.push(localize(10650, null, content.hookType));
  if (content.result !== void 0) {
    lines.push(localize(10649, null, formatHookResult(content.result)));
  }
  if (content.exitCode !== void 0) {
    lines.push(localize(10643, null, content.exitCode));
  }
  if (content.durationInMillis !== void 0) {
    lines.push(localize(10640, null, content.durationInMillis));
  }
  if (content.command) {
    lines.push("");
    lines.push(`[${localize(10638, null)}]`);
    lines.push(content.command);
  }
  if (content.input) {
    lines.push("");
    lines.push(`[${localize(10644, null)}]`);
    try {
      const parsed = JSON.parse(content.input);
      lines.push(JSON.stringify(parsed, null, 2));
    } catch {
      lines.push(content.input);
    }
  }
  if (content.output) {
    lines.push("");
    lines.push(`[${localize(10645, null)}]`);
    try {
      const parsed = JSON.parse(content.output);
      lines.push(JSON.stringify(parsed, null, 2));
    } catch {
      lines.push(content.output);
    }
  }
  if (content.errorMessage) {
    lines.push("");
    lines.push(`[${localize(10641, null)}]`);
    lines.push(content.errorMessage);
  }
  return lines.join("\n");
}
export { renderHookContent, formatHookResult, hookContentToPlainText, $75 };
