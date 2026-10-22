// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugMessageContentRenderer.ts
import { $, append } from "./module-0075.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { renderSection, tokenizeContent } from "./module-2606.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugMessageContentRenderer.ts
var $74 = $;

async function renderUserMessageContent(event, languageService, clipboardService, scrollable) {
  const disposables = new DisposableStore();
  const container3 = $74("div.chat-debug-message-content");
  container3.tabIndex = 0;
  append(container3, $74("div.chat-debug-message-content-title", void 0, localize(10684, null)));
  append(container3, $74("div.chat-debug-message-content-summary", void 0, event.message));
  if (event.sections.length > 0) {
    const sectionsContainer = append(container3, $74("div.chat-debug-message-sections"));
    append(sectionsContainer, $74(
      "div.chat-debug-message-sections-label",
      void 0,
      localize(10682, null, event.sections.length)
    ));
    for (const section of event.sections) {
      const { plainText, tokenizedHtml } = await tokenizeContent(section.content, languageService);
      renderSection(sectionsContainer, section.name, plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
    }
  }
  return { element: container3, disposables };
}

async function renderAgentResponseContent(event, languageService, clipboardService, scrollable) {
  const disposables = new DisposableStore();
  const container3 = $74("div.chat-debug-message-content");
  container3.tabIndex = 0;
  append(container3, $74("div.chat-debug-message-content-title", void 0, localize(10681, null)));
  append(container3, $74("div.chat-debug-message-content-summary", void 0, event.message));
  if (event.sections.length > 0) {
    const sectionsContainer = append(container3, $74("div.chat-debug-message-sections"));
    append(sectionsContainer, $74(
      "div.chat-debug-message-sections-label",
      void 0,
      localize(10683, null, event.sections.length)
    ));
    for (const section of event.sections) {
      const { plainText, tokenizedHtml } = await tokenizeContent(section.content, languageService);
      renderSection(sectionsContainer, section.name, plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
    }
  }
  return { element: container3, disposables };
}

function messageEventToPlainText(event) {
  const lines = [];
  const label3 = event.kind === "userMessage" ? localize(10684, null) : localize(10681, null);
  lines.push(`${label3}: ${event.message}`);
  lines.push("");
  for (const section of event.sections) {
    lines.push(`--- ${section.name} ---`);
    lines.push(section.content);
    lines.push("");
  }
  return lines.join("\n");
}

async function renderResolvedMessageContent(content2, languageService, clipboardService, scrollable) {
  const disposables = new DisposableStore();
  const container3 = $74("div.chat-debug-message-content");
  container3.tabIndex = 0;
  const title = content2.type === "user" ? localize(10684, null) : localize(10681, null);
  append(container3, $74("div.chat-debug-message-content-title", void 0, title));
  append(container3, $74("div.chat-debug-message-content-summary", void 0, content2.message));
  if (content2.sections.length > 0) {
    const sectionsContainer = append(container3, $74("div.chat-debug-message-sections"));
    const label3 = content2.type === "user" ? localize(10682, null, content2.sections.length) : localize(10683, null, content2.sections.length);
    append(sectionsContainer, $74("div.chat-debug-message-sections-label", void 0, label3));
    for (const section of content2.sections) {
      const { plainText, tokenizedHtml } = await tokenizeContent(section.content, languageService);
      renderSection(sectionsContainer, section.name, plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
    }
  }
  return { element: container3, disposables };
}

function resolvedMessageToPlainText(content2) {
  const lines = [];
  const label3 = content2.type === "user" ? localize(10684, null) : localize(10681, null);
  lines.push(`${label3}: ${content2.message}`);
  lines.push("");
  for (const section of content2.sections) {
    lines.push(`--- ${section.name} ---`);
    lines.push(section.content);
    lines.push("");
  }
  return lines.join("\n");
}
export { renderUserMessageContent, renderAgentResponseContent, messageEventToPlainText, renderResolvedMessageContent, resolvedMessageToPlainText, $74 };
