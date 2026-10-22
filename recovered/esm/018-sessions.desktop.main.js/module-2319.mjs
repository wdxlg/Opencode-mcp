// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/openCodeChatToolProgressPart.ts
import { Codicon } from "./module-0085.mjs";
import { BaseChatToolInvocationSubPart } from "./module-2298.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { localize } from "./module-0001.mjs";
import { ChatCollapsibleContentPart } from "./module-2116.mjs";
import { URI, isUriComponents } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/openCodeChatToolProgressPart.ts
function messageText(message) {
  return typeof message === "string" ? message : message?.value ?? "";
}

function formatDuration(durationMs) {
  if (durationMs === void 0) return "";
  if (durationMs < 1e3) return `${durationMs} ms`;
  return `${(durationMs / 1e3).toFixed(durationMs < 1e4 ? 1 : 0)} s`;
}

function presentationIcon(kind) {
  switch (kind) {
    case "files":
      return Codicon.files;
    case "search":
      return Codicon.search;
    case "edit":
      return Codicon.edit;
    case "terminal":
      return Codicon.terminal;
    case "diagnostics":
      return Codicon.warning;
    case "lsp":
      return Codicon.symbolMethod;
    default:
      return Codicon.tools;
  }
}

var OpenCodeChatToolProgressPart = class extends BaseChatToolInvocationSubPart {
  constructor(toolInvocation, message, subtitle, data, openerService, commandService) {
    super(toolInvocation);
    this.openerService = openerService;
    this.commandService = commandService;
    this.codeblocks = [];
    const kind = data.presentationKind ?? "generic";
    const isComplete = IChatToolInvocation.isComplete(toolInvocation);
    const isError = data.isError === true;
    const state = isError ? "error" : isComplete ? "completed" : "running";
    const activity = $("details.opencode-chat-activity");
    activity.open = OpenCodeChatToolProgressPart.expandedState.get(toolInvocation.toolCallId) ?? false;
    activity.classList.add(`state-${state}`, `kind-${kind}`);
    const header2 = append(activity, $("summary.opencode-chat-activity-header"));
    const icon2 = append(header2, $("span.opencode-chat-activity-icon"));
    const iconValue = state === "running" ? ThemeIcon.modify(Codicon.loading, "spin") : isError ? Codicon.error : presentationIcon(kind);
    icon2.classList.add(...ThemeIcon.asClassNameArray(iconValue));
    const labels = append(header2, $(".opencode-chat-activity-labels"));
    const title = messageText(message) || localize(12329, null);
    append(labels, $("span.opencode-chat-activity-title", void 0, title));
    const secondary = data.summary || messageText(subtitle);
    if (secondary) append(labels, $("span.opencode-chat-activity-subtitle", void 0, secondary));
    const meta = append(header2, $("span.opencode-chat-activity-meta"));
    meta.textContent = state === "running" ? localize(12328, null) : state === "error" ? localize(12320, null) : formatDuration(data.durationMs) || localize(12319, null);
    const syncExpandedState = () => {
      header2.setAttribute("aria-expanded", String(activity.open));
      OpenCodeChatToolProgressPart.expandedState.set(toolInvocation.toolCallId, activity.open);
    };
    this._register(addDisposableListener(header2, EventType.CLICK, (event) => {
      event.preventDefault();
      activity.dispatchEvent(new CustomEvent(ChatCollapsibleContentPart.userToggleEvent, { bubbles: true }));
      activity.open = !activity.open;
      syncExpandedState();
    }));
    this._register(addDisposableListener(activity, "toggle", syncExpandedState));
    syncExpandedState();
    if (kind === "edit") this.renderEditSummary(header2, data);
    const body = append(activity, $(".opencode-chat-activity-body"));
    if (kind !== "edit") this.renderItems(body, data, kind);
    this.renderMiniDiff(body, data);
    this.renderActions(body, data);
    this.renderMetrics(body, data);
    this.renderCodeSection(body, localize(12321, null), data.input);
    this.renderCodeSection(body, localize(12327, null), data.output);
    this.domNode = activity;
  }
  static {
    this.expandedState = /* @__PURE__ */ new Map();
  }
  renderMetrics(parent, data) {
    if (!data.metrics?.length) return;
    const metrics = append(parent, $(".opencode-chat-activity-metrics"));
    metrics.textContent = data.metrics.map((metric) => `${metric.label} ${metric.value}`).join(" \xB7 ");
  }
  renderEditSummary(parent, data) {
    if (!data.items?.length) return;
    const items = append(parent, $(".opencode-chat-edit-files"));
    for (const item of data.items.slice(0, 12)) {
      const row = this.createResourceRow(items, item, "edit");
      row.classList.add("opencode-chat-edit-file");
    }
  }
  renderItems(parent, data, kind) {
    if (!data.items?.length) return;
    const items = append(parent, $(".opencode-chat-activity-items"));
    for (const item of data.items.slice(0, 40)) this.createResourceRow(items, item, kind);
    if (data.items.length > 40) {
      append(items, $("span.opencode-chat-activity-more", void 0, localize(12324, null, data.items.length - 40)));
    }
  }
  createResourceRow(parent, item, kind) {
    const row = append(parent, item.resource ? $("a.opencode-chat-activity-item") : $(".opencode-chat-activity-item"));
    const icon2 = append(row, $("span.opencode-chat-activity-item-icon"));
    const itemIcon = kind === "search" ? Codicon.search : kind === "diagnostics" ? Codicon.warning : kind === "lsp" ? Codicon.symbolMethod : Codicon.file;
    icon2.classList.add(...ThemeIcon.asClassNameArray(itemIcon));
    const labels = append(row, $(".opencode-chat-activity-item-labels"));
    append(labels, $("span.opencode-chat-activity-item-primary", void 0, item.label));
    if (item.description) append(labels, $("span.opencode-chat-activity-item-secondary", void 0, item.description));
    if (item.added !== void 0 || item.removed !== void 0) {
      const diff4 = append(row, $("span.opencode-chat-activity-item-diff"));
      if (item.added !== void 0) append(diff4, $("span.additions", void 0, `+${item.added}`));
      if (item.removed !== void 0) append(diff4, $("span.deletions", void 0, `\u2212${item.removed}`));
    }
    if (item.resource) {
      const resource = URI.isUri(item.resource) ? item.resource : isUriComponents(item.resource) ? URI.revive(item.resource) : URI.revive(item.resource.uri);
      row.href = resource.toString();
      this._register(addDisposableListener(row, EventType.CLICK, (event) => {
        event.stopPropagation();
        event.preventDefault();
        void this.openerService.open(resource, { fromUserGesture: true });
      }));
    }
    return row;
  }
  renderMiniDiff(parent, data) {
    if (!data.diffPreview?.length || !data.diff) return;
    const preview = append(parent, $(".opencode-chat-mini-diff"));
    for (const file of data.diffPreview) {
      const fileBlock = append(preview, $(".opencode-chat-mini-diff-file"));
      const header2 = append(fileBlock, $(".opencode-chat-mini-diff-header"));
      const fileButton = append(header2, $("button.opencode-chat-mini-diff-file-button"));
      fileButton.type = "button";
      const fileIcon = append(fileButton, $("span"));
      fileIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.file));
      append(fileButton, $("span.opencode-chat-mini-diff-path", void 0, file.path));
      this._register(addDisposableListener(fileButton, EventType.CLICK, () => void this.commandService.executeCommand("opencode.bridge.openResource", { path: file.path })));
      const openDiff = append(header2, $("button.opencode-chat-mini-diff-open"));
      openDiff.type = "button";
      openDiff.title = localize(12325, null);
      const diffIcon = append(openDiff, $("span"));
      diffIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.diff));
      this._register(addDisposableListener(openDiff, EventType.CLICK, () => void this.commandService.executeCommand("opencode.bridge.openDiff", { diff: data.diff, path: file.path })));
      for (let hunkIndex = 0; hunkIndex < file.hunks.length; hunkIndex += 1) {
        if (hunkIndex > 0) append(fileBlock, $(".opencode-chat-mini-diff-gap", void 0, "\xB7\xB7\xB7"));
        const code = append(fileBlock, $(".opencode-chat-mini-diff-code"));
        for (const line of file.hunks[hunkIndex].lines) {
          const row = append(code, $(`.opencode-chat-mini-diff-line.${line.kind}`));
          const lineNumber = line.kind === "delete" ? line.oldLine : line.newLine;
          append(row, $("span.opencode-chat-mini-diff-line-number", void 0, lineNumber === void 0 ? "" : String(lineNumber)));
          append(row, $("span.opencode-chat-mini-diff-marker", void 0, line.kind === "add" ? "+" : line.kind === "delete" ? "\u2212" : ""));
          const text2 = append(row, $("span.opencode-chat-mini-diff-text", void 0, line.text || " "));
          text2.title = line.text;
        }
        if (file.hunks[hunkIndex].truncated) append(code, $(".opencode-chat-mini-diff-truncated", void 0, localize(12322, null)));
      }
      if (file.truncated) append(fileBlock, $(".opencode-chat-mini-diff-truncated", void 0, localize(12323, null)));
    }
  }
  renderActions(parent, data) {
    if (!data.terminalId) return;
    const actions = append(parent, $(".opencode-chat-activity-actions"));
    const button = append(actions, $("button.opencode-chat-activity-action"));
    button.type = "button";
    const icon2 = append(button, $("span"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.terminal));
    append(button, $("span", void 0, localize(12326, null)));
    this._register(addDisposableListener(button, EventType.CLICK, () => void this.commandService.executeCommand("opencode.bridge.openTerminal", data.terminalId)));
  }
  renderCodeSection(parent, label3, value2) {
    if (!value2) return;
    const section = append(parent, $(".opencode-chat-activity-section"));
    append(section, $("span.opencode-chat-activity-section-label", void 0, label3));
    const pre = append(section, $("pre"));
    pre.textContent = value2;
  }
};

OpenCodeChatToolProgressPart = __decorateClass([
  __decorateParam(4, IOpenerService),
  __decorateParam(5, ICommandService)
], OpenCodeChatToolProgressPart);
export { messageText, formatDuration, presentationIcon, OpenCodeChatToolProgressPart };
