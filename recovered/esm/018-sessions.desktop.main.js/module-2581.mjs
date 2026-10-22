// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugToolCallContentRenderer.ts
import { $, EventHelper, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { createTrustedTypesPolicy } from "./module-0280.mjs";
import { tokenizeToString } from "./module-0430.mjs";
import { Button } from "./module-0546.mjs";
import { localize } from "./module-0001.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { Codicon } from "./module-0085.mjs";
import { setupCollapsibleToggle } from "./module-2579.mjs";
import { DisposableStore } from "./module-0012.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugToolCallContentRenderer.ts
var $72 = $;

var _ttpPolicy = createTrustedTypesPolicy("chatDebugTokenizer", {
  createHTML(html3) {
    return html3;
  }
});

function tryParseJSON(text2) {
  try {
    return { parsed: JSON.parse(text2), isJSON: true };
  } catch {
    return { isJSON: false };
  }
}

async function tokenizeContent(text2, languageService) {
  const result = tryParseJSON(text2);
  const plainText = result.isJSON ? JSON.stringify(result.parsed, null, 2) : text2;
  const language2 = result.isJSON ? "json" : "markdown";
  const tokenizedHtml = await tokenizeToString(languageService, plainText, language2);
  return { plainText, tokenizedHtml };
}

function renderSection(parent, label3, plainText, tokenizedHtml, disposables, initiallyCollapsed = false, clipboardService, scrollable) {
  const sectionEl = append(parent, $72("div.chat-debug-message-section"));
  const header2 = append(sectionEl, $72("div.chat-debug-message-section-header"));
  const chevron = append(header2, $72("span.chat-debug-message-section-chevron"));
  append(header2, $72("span.chat-debug-message-section-title", void 0, label3));
  if (clipboardService) {
    const copyBtn = disposables.add(new Button(header2, {
      title: localize(10737, null),
      ariaLabel: localize(10737, null),
      hoverDelegate: getDefaultHoverDelegate("mouse")
    }));
    copyBtn.icon = Codicon.copy;
    copyBtn.element.classList.add("chat-debug-section-copy-btn");
    disposables.add(addDisposableListener(copyBtn.element, EventType.MOUSE_ENTER, () => {
      header2.classList.add("chat-debug-section-copy-header-passthrough");
    }));
    disposables.add(addDisposableListener(copyBtn.element, EventType.MOUSE_LEAVE, () => {
      header2.classList.remove("chat-debug-section-copy-header-passthrough");
    }));
    disposables.add(copyBtn.onDidClick((e4) => {
      if (e4) {
        EventHelper.stop(e4, true);
      }
      clipboardService.writeText(plainText);
    }));
  }
  const wrapper = append(sectionEl, $72("div.chat-debug-message-section-content-wrapper"));
  const contentEl = append(wrapper, $72("pre.chat-debug-message-section-content"));
  contentEl.tabIndex = 0;
  if (tokenizedHtml) {
    const trustedHtml = _ttpPolicy?.createHTML(tokenizedHtml) ?? tokenizedHtml;
    contentEl.innerHTML = trustedHtml;
  } else {
    contentEl.textContent = plainText;
  }
  setupCollapsibleToggle(chevron, header2, wrapper, disposables, initiallyCollapsed, scrollable);
}

async function renderToolCallContent(content, languageService, clipboardService, scrollable) {
  const disposables = new DisposableStore();
  const container2 = $72("div.chat-debug-message-content");
  container2.tabIndex = 0;
  append(container2, $72("div.chat-debug-message-content-title", void 0, content.toolName));
  const statusParts = [];
  if (content.result) {
    statusParts.push(content.result === "success" ? localize(10744, null) : localize(10741, null));
  }
  if (content.durationInMillis !== void 0) {
    statusParts.push(localize(10739, null, content.durationInMillis));
  }
  if (statusParts.length > 0) {
    append(container2, $72("div.chat-debug-message-content-summary", void 0, statusParts.join(" \xB7 ")));
  }
  const sectionsContainer = append(container2, $72("div.chat-debug-message-sections"));
  if (content.input) {
    const { plainText, tokenizedHtml } = await tokenizeContent(content.input, languageService);
    renderSection(sectionsContainer, localize(10738, null), plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
  }
  if (content.output) {
    const { plainText, tokenizedHtml } = await tokenizeContent(content.output, languageService);
    renderSection(sectionsContainer, localize(10742, null), plainText, tokenizedHtml, disposables, false, clipboardService, scrollable);
  }
  return { element: container2, disposables };
}

function toolCallContentToPlainText(content) {
  const lines = [];
  lines.push(localize(10745, null, content.toolName));
  if (content.result) {
    lines.push(localize(10743, null, content.result));
  }
  if (content.durationInMillis !== void 0) {
    lines.push(localize(10740, null, content.durationInMillis));
  }
  if (content.input) {
    lines.push("");
    lines.push(`[${localize(10738, null)}]`);
    try {
      const parsed = JSON.parse(content.input);
      lines.push(JSON.stringify(parsed, null, 2));
    } catch {
      lines.push(content.input);
    }
  }
  if (content.output) {
    lines.push("");
    lines.push(`[${localize(10742, null)}]`);
    try {
      const parsed = JSON.parse(content.output);
      lines.push(JSON.stringify(parsed, null, 2));
    } catch {
      lines.push(content.output);
    }
  }
  return lines.join("\n");
}
export { tryParseJSON, tokenizeContent, renderSection, renderToolCallContent, toolCallContentToPlainText, $72, _ttpPolicy };
