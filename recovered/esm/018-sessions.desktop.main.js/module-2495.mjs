// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/accessibility/chatResponseAccessibleView.ts
import { ChatContextKeys } from "./module-0966.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IStorageService } from "./module-0512.mjs";
import { isResponseVM } from "./module-0979.mjs";
import { IChatToolInvocation, isLegacyChatTerminalToolInvocationData } from "./module-0973.mjs";
import { migrateLegacyTerminalToolSpecificData } from "./module-1188.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { isToolResultInputOutputDetails, isToolResultOutputDetails, toolContentToA11yString } from "./module-0991.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { stripIcons } from "./module-0461.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { basename2 } from "./module-0034.mjs";
import { isLocation } from "./module-0164.mjs";
import { isMarkdownString } from "./module-0462.mjs";
import { autoModeRoutingTitle } from "./module-2229.mjs";


// src/vs/workbench/contrib/chat/browser/accessibility/chatResponseAccessibleView.ts
var ChatResponseAccessibleView = class {
  constructor() {
    this.priority = 100;
    this.name = "panelChat";
    this.type = "view" /* View */;
    this.when = ChatContextKeys.inChatSession;
  }
  getProvider(accessor) {
    const widgetService = accessor.get(IChatWidgetService);
    const storageService = accessor.get(IStorageService);
    const widget = widgetService.lastFocusedWidget;
    if (!widget) {
      return;
    }
    const chatInputFocused = widget.hasInputFocus();
    if (chatInputFocused) {
      widget.focusResponseItem();
    }
    const verifiedWidget = widget;
    let focusedItem = verifiedWidget.getFocus();
    if (!focusedItem || !isResponseVM(focusedItem)) {
      const responseItems = verifiedWidget.viewModel?.getItems().filter(isResponseVM);
      const lastResponse = responseItems?.at(-1);
      if (lastResponse) {
        focusedItem = lastResponse;
        verifiedWidget.focus(lastResponse);
      }
    }
    if (!focusedItem || !isResponseVM(focusedItem)) {
      return;
    }
    return new ChatResponseAccessibleProvider(verifiedWidget, focusedItem, chatInputFocused, storageService);
  }
};

var CHAT_ACCESSIBLE_VIEW_INCLUDE_THINKING_STORAGE_KEY = "chat.accessibleView.includeThinking";

var CHAT_ACCESSIBLE_VIEW_INCLUDE_THINKING_DEFAULT = true;

function isThinkingContentIncludedInAccessibleView(storageService) {
  return storageService.getBoolean(CHAT_ACCESSIBLE_VIEW_INCLUDE_THINKING_STORAGE_KEY, 0 /* PROFILE */, CHAT_ACCESSIBLE_VIEW_INCLUDE_THINKING_DEFAULT);
}

function isOutputDetailsSerialized(obj) {
  return typeof obj === "object" && obj !== null && "output" in obj && typeof obj.output === "object" && obj.output?.type === "data" && typeof obj.output?.base64Data === "string";
}

function getToolSpecificDataDescription(toolSpecificData) {
  if (!toolSpecificData) {
    return "";
  }
  if (isLegacyChatTerminalToolInvocationData(toolSpecificData) || toolSpecificData.kind === "terminal") {
    const terminalData = migrateLegacyTerminalToolSpecificData(toolSpecificData);
    return terminalData.commandLine.userEdited ?? terminalData.commandLine.toolEdited ?? terminalData.commandLine.original;
  }
  switch (toolSpecificData.kind) {
    case "subagent": {
      const parts = [];
      const agentName = toolSpecificData.agentDisplayName ?? toolSpecificData.agentName;
      if (agentName) {
        parts.push(localize(8412, null, agentName));
      }
      if (toolSpecificData.description) {
        parts.push(toolSpecificData.description);
      }
      if (toolSpecificData.prompt) {
        parts.push(localize(8413, null, toolSpecificData.prompt));
      }
      return parts.join(". ") || "";
    }
    case "extensions":
      return toolSpecificData.extensions.length > 0 ? localize(8405, null, toolSpecificData.extensions.join(", ")) : "";
    case "todoList": {
      const todos = toolSpecificData.todoList;
      if (todos.length === 0) {
        return "";
      }
      const todoDescriptions = todos.map(
        (t2) => localize(8415, null, t2.title, t2.status)
      );
      return localize(8416, null, todos.length, todoDescriptions.join("; "));
    }
    case "pullRequest":
      return localize(8409, null, toolSpecificData.title, toolSpecificData.author);
    case "input":
      return typeof toolSpecificData.rawInput === "string" ? toolSpecificData.rawInput : JSON.stringify(toolSpecificData.rawInput);
    case "resources": {
      const values = toolSpecificData.values;
      if (values.length === 0) {
        return "";
      }
      const paths = values.map((v2) => {
        if ("uri" in v2 && "range" in v2) {
          return `${v2.uri.fsPath || v2.uri.path}:${v2.range.startLineNumber}`;
        } else {
          return v2.fsPath || v2.path;
        }
      }).join(", ");
      return localize(8410, null, paths);
    }
    case "simpleToolInvocation": {
      if (toolSpecificData.summary) {
        const items = toolSpecificData.items?.map((item) => [item.label, item.description].filter(Boolean).join(": ")).join("; ");
        return [toolSpecificData.summary, items].filter(Boolean).join(". ");
      }
      const inputText = toolSpecificData.input;
      const outputText = toolSpecificData.output;
      return localize(8411, null, inputText, outputText);
    }
    case "modifiedFilesConfirmation": {
      if (toolSpecificData.modifiedFiles.length === 0) {
        return "";
      }
      return localize(8408, null, toolSpecificData.modifiedFiles.map((file) => {
        const revivedUri = URI.revive(file.uri);
        return revivedUri.fsPath || revivedUri.path;
      }).join(", "));
    }
    case "automationConfigured":
      return toolSpecificData.operation === "created" ? localize(8401, null, toolSpecificData.automationName) : localize(8402, null, toolSpecificData.automationName);
    default:
      return "";
  }
}

function getResultDetailsDescription(resultDetails) {
  if (!resultDetails) {
    return {};
  }
  if (Array.isArray(resultDetails)) {
    const files = resultDetails.map((ref) => {
      if (URI.isUri(ref)) {
        return ref.fsPath || ref.path;
      }
      return ref.uri.fsPath || ref.uri.path;
    });
    return { files };
  }
  if (isToolResultInputOutputDetails(resultDetails)) {
    return {
      input: resultDetails.input,
      isError: resultDetails.isError
    };
  }
  if (isOutputDetailsSerialized(resultDetails)) {
    return {
      input: localize(8403, null, resultDetails.output.mimeType)
    };
  }
  if (isToolResultOutputDetails(resultDetails)) {
    return {
      input: localize(8403, null, resultDetails.output.mimeType)
    };
  }
  return {};
}

function getToolInvocationA11yDescription(invocationMessage, pastTenseMessage, toolSpecificData, resultDetails, isComplete) {
  const parts = [];
  const message = isComplete && pastTenseMessage ? pastTenseMessage : invocationMessage;
  if (message) {
    parts.push(message);
  }
  const toolDataDesc = getToolSpecificDataDescription(toolSpecificData);
  if (toolDataDesc) {
    parts.push(toolDataDesc);
  }
  if (isComplete && resultDetails) {
    const details = getResultDetailsDescription(resultDetails);
    if (details.isError) {
      parts.unshift(localize(8404, null));
    }
    if (details.input && !toolDataDesc) {
      parts.push(localize(8407, null, details.input));
    }
    if (details.files && details.files.length > 0) {
      parts.push(localize(8406, null, details.files.join(", ")));
    }
  }
  return parts.join(". ");
}

var ChatResponseAccessibleProvider = class extends Disposable {
  constructor(_widget, item, _wasOpenedFromInput, _storageService) {
    super();
    this._widget = _widget;
    this._wasOpenedFromInput = _wasOpenedFromInput;
    this._storageService = _storageService;
    this._focusedItemDisposables = this._register(new DisposableStore());
    this._storageDisposables = this._register(new DisposableStore());
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this.id = "panelChat" /* PanelChat */;
    this.verbositySettingKey = "accessibility.verbosity.panelChat" /* Chat */;
    this.options = { type: "view" /* View */ };
    this._storageDisposables.add(this._storageService.onDidChangeValue(0 /* PROFILE */, CHAT_ACCESSIBLE_VIEW_INCLUDE_THINKING_STORAGE_KEY, this._storageDisposables)(() => {
      this._onDidChangeContent.fire();
    }));
    this._setFocusedItem(item);
  }
  provideContent() {
    return this._getContent(this._focusedItem);
  }
  _setFocusedItem(item) {
    this._focusedItem = item;
    this._focusedItemDisposables.clear();
    if (isResponseVM(item)) {
      this._focusedItemDisposables.add(item.model.onDidChange(() => this._onDidChangeContent.fire()));
    }
  }
  _getContent(item) {
    if (!isResponseVM(item)) {
      return "";
    }
    const parts = getChatResponsePlaintextParts(item, this._shouldIncludeThinkingContent());
    return this._normalizeWhitespace(parts.map((part) => part.text).join("\n"));
  }
  _normalizeWhitespace(content) {
    const lines = content.split(/\r?\n/);
    const normalized = [];
    for (const line of lines) {
      if (line.trim().length === 0) {
        continue;
      }
      normalized.push(line);
    }
    return normalized.join("\n");
  }
  _shouldIncludeThinkingContent() {
    return isThinkingContentIncludedInAccessibleView(this._storageService);
  }
  onClose() {
    this._widget.reveal(this._focusedItem);
    if (this._wasOpenedFromInput) {
      this._widget.focusInput();
    } else {
      this._widget.focus(this._focusedItem);
    }
  }
  provideNextContent() {
    const next = this._widget.getSibling(this._focusedItem, "next");
    if (next) {
      this._setFocusedItem(next);
      return this._getContent(next);
    }
    return;
  }
  providePreviousContent() {
    const previous = this._widget.getSibling(this._focusedItem, "previous");
    if (previous) {
      this._setFocusedItem(previous);
      return this._getContent(previous);
    }
    return;
  }
};

function renderChatMessageAsPlaintext(message) {
  return typeof message === "string" ? message : stripIcons(renderAsPlaintext(message, { useLinkFormatter: true }));
}

function getChatResponsePlaintextParts(item, includeThinking) {
  const contentParts = [];
  if ("errorDetails" in item && item.errorDetails) {
    contentParts.push({ partIndex: -1, text: item.errorDetails.message });
  }
  item.response.value.forEach((part, partIndex) => {
    switch (part.kind) {
      case "thinking": {
        if (!includeThinking) {
          break;
        }
        const thinkingValue = Array.isArray(part.value) ? part.value.join("") : part.value || "";
        const trimmed = thinkingValue.trim();
        if (trimmed) {
          contentParts.push({ partIndex, text: localize(8414, null, trimmed) });
        }
        break;
      }
      case "markdownContent": {
        const text2 = renderAsPlaintext(part.content, { includeCodeBlocksFences: true, useLinkFormatter: true });
        if (text2.trim()) {
          contentParts.push({ partIndex, text: text2 });
        }
        break;
      }
      case "inlineReference": {
        const ref = part.inlineReference;
        let text2;
        if (URI.isUri(ref)) {
          const name = part.name || basename2(ref);
          const path = ref.scheme === "file" ? ref.path : ref.toString(true);
          text2 = name !== path ? `${name} (${path})` : path;
        } else if (isLocation(ref)) {
          const name = part.name || basename2(ref.uri);
          const path = ref.uri.scheme === "file" ? ref.uri.path : ref.uri.toString(true);
          text2 = `${name} (${path}:${ref.range.startLineNumber})`;
        } else {
          const path = ref.location.uri.scheme === "file" ? ref.location.uri.fsPath || ref.location.uri.path : ref.location.uri.toString(true);
          text2 = `${ref.name} (${path}:${ref.location.range.startLineNumber})`;
        }
        contentParts.push({ partIndex, text: text2 });
        break;
      }
      case "elicitation2":
      case "elicitationSerialized": {
        const title = part.title;
        let elicitationContent = "";
        if (typeof title === "string") {
          elicitationContent += `${title}
`;
        } else if (isMarkdownString(title)) {
          elicitationContent += renderAsPlaintext(title, { includeCodeBlocksFences: true }) + "\n";
        }
        const message = part.message;
        if (isMarkdownString(message)) {
          elicitationContent += renderAsPlaintext(message, { includeCodeBlocksFences: true });
        } else {
          elicitationContent += message;
        }
        if (elicitationContent.trim()) {
          contentParts.push({ partIndex, text: elicitationContent });
        }
        break;
      }
      case "toolInvocation": {
        const state = part.state.get();
        if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation && state.confirmationMessages?.title) {
          const title = renderChatMessageAsPlaintext(state.confirmationMessages.title);
          const message = state.confirmationMessages.message ? renderChatMessageAsPlaintext(state.confirmationMessages.message) : "";
          const toolDataDesc = getToolSpecificDataDescription(part.toolSpecificData);
          let toolContent = title;
          if (toolDataDesc) {
            toolContent += `: ${toolDataDesc}`;
          }
          if (message) {
            toolContent += `
${message}`;
          }
          contentParts.push({ partIndex, text: toolContent });
        } else if (state.type === IChatToolInvocation.StateKind.WaitingForAuthentication) {
          contentParts.push({ partIndex, text: localize(8417, null, state.server.name, part.toolId) });
        } else if (state.type === IChatToolInvocation.StateKind.WaitingForPostApproval) {
          const postApprovalDetails = isToolResultInputOutputDetails(state.resultDetails) ? state.resultDetails.input : isToolResultOutputDetails(state.resultDetails) ? void 0 : toolContentToA11yString(state.contentForModel);
          contentParts.push({ partIndex, text: localize(8418, null, part.toolId) + (postApprovalDetails ?? "") });
        } else {
          const resultDetails = IChatToolInvocation.resultDetails(part);
          const isComplete = IChatToolInvocation.isComplete(part);
          const description = getToolInvocationA11yDescription(
            renderChatMessageAsPlaintext(part.invocationMessage),
            part.pastTenseMessage ? renderChatMessageAsPlaintext(part.pastTenseMessage) : void 0,
            part.toolSpecificData,
            resultDetails,
            isComplete
          );
          if (description) {
            contentParts.push({ partIndex, text: description });
          }
        }
        break;
      }
      case "toolInvocationSerialized": {
        const description = getToolInvocationA11yDescription(
          renderChatMessageAsPlaintext(part.invocationMessage),
          part.pastTenseMessage ? renderChatMessageAsPlaintext(part.pastTenseMessage) : void 0,
          part.toolSpecificData,
          part.resultDetails,
          part.isComplete
        );
        if (description) {
          contentParts.push({ partIndex, text: description });
        }
        break;
      }
      case "autoModeResolution": {
        if (!part.resolved && item.isComplete) {
          break;
        }
        contentParts.push({ partIndex, text: autoModeRoutingTitle(part) });
        break;
      }
    }
  });
  return contentParts;
}
export { isThinkingContentIncludedInAccessibleView, isOutputDetailsSerialized, getToolSpecificDataDescription, getResultDetailsDescription, getToolInvocationA11yDescription, renderChatMessageAsPlaintext, getChatResponsePlaintextParts, ChatResponseAccessibleView, CHAT_ACCESSIBLE_VIEW_INCLUDE_THINKING_STORAGE_KEY, CHAT_ACCESSIBLE_VIEW_INCLUDE_THINKING_DEFAULT, ChatResponseAccessibleProvider };
