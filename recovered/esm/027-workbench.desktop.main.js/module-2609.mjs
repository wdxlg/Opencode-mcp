// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugHookContentRenderer.ts
import { $, append } from "./module-0075.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { renderSection, tokenizeContent } from "./module-2606.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugHookContentRenderer.ts
var $76 = $;

async function renderHookContent(content2, languageService, clipboardService, scrollable) {
  const disposables = new DisposableStore();
  const container3 = $76("div.chat-debug-message-content");
  container3.tabIndex = 0;
  append(container3, $76("div.chat-debug-message-content-title", void 0, content2.hookType));
  const statusParts = [];
  if (content2.result !== void 0) {
    statusParts.push(formatHookResult(content2.result));
  }
  if (content2.exitCode !== void 0) {
    statusParts.push(localize(10642, null, content2.exitCode));
  }
  if (content2.durationInMillis !== void 0) {
    statusParts.push(localize(10639, null, content2.durationInMillis));
  }
  if (statusParts.length > 0) {
    append(container3, $76("div.chat-debug-message-content-summary", void 0, statusParts.join(" \xB7 ")));
  }
  const sectionsContainer = append(container3, $76("div.chat-debug-message-sections"));
  if (content2.command) {
    const { plainText, tokenizedHtml } = await tokenizeContent(content2.command, languageService);
    renderSection(sectionsContainer, localize(10638, null), plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
  }
  if (content2.input) {
    const { plainText, tokenizedHtml } = await tokenizeContent(content2.input, languageService);
    renderSection(sectionsContainer, localize(10644, null), plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
  }
  if (content2.output) {
    const { plainText, tokenizedHtml } = await tokenizeContent(content2.output, languageService);
    renderSection(sectionsContainer, localize(10645, null), plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
  }
  if (content2.errorMessage) {
    const { plainText, tokenizedHtml } = await tokenizeContent(content2.errorMessage, languageService);
    renderSection(sectionsContainer, localize(10641, null), plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
  }
  return { element: container3, disposables };
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

function hookContentToPlainText(content2) {
  const lines = [];
  lines.push(localize(10650, null, content2.hookType));
  if (content2.result !== void 0) {
    lines.push(localize(10649, null, formatHookResult(content2.result)));
  }
  if (content2.exitCode !== void 0) {
    lines.push(localize(10643, null, content2.exitCode));
  }
  if (content2.durationInMillis !== void 0) {
    lines.push(localize(10640, null, content2.durationInMillis));
  }
  if (content2.command) {
    lines.push("");
    lines.push(`[${localize(10638, null)}]`);
    lines.push(content2.command);
  }
  if (content2.input) {
    lines.push("");
    lines.push(`[${localize(10644, null)}]`);
    try {
      const parsed = JSON.parse(content2.input);
      lines.push(JSON.stringify(parsed, null, 2));
    } catch {
      lines.push(content2.input);
    }
  }
  if (content2.output) {
    lines.push("");
    lines.push(`[${localize(10645, null)}]`);
    try {
      const parsed = JSON.parse(content2.output);
      lines.push(JSON.stringify(parsed, null, 2));
    } catch {
      lines.push(content2.output);
    }
  }
  if (content2.errorMessage) {
    lines.push("");
    lines.push(`[${localize(10641, null)}]`);
    lines.push(content2.errorMessage);
  }
  return lines.join("\n");
}
export { renderHookContent, formatHookResult, hookContentToPlainText, $76 };
