// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/accessibility/chatAccessibilityProvider.ts
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { AcceptToolConfirmationActionId } from "./module-2203.mjs";
import { CancelChatActionId } from "./module-2062.mjs";
import { IChatToolInvocation } from "./module-0972.mjs";
import { isToolResultInputOutputDetails, isToolResultOutputDetails, toolContentToA11yString } from "./module-0990.mjs";
import { localize } from "./module-0001.mjs";
import { migrateLegacyTerminalToolSpecificData } from "./module-1188.mjs";
import { isDefined } from "./module-0010.mjs";
import { isRequestVM, isResponseVM } from "./module-0978.mjs";
import { getChatRequestText } from "./module-2208.mjs";
import { getExplicitFileOrImageAttachmentSummary } from "./module-0979.mjs";
import { marked } from "./module-0464.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAccessibleViewService } from "./module-0799.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/accessibility/chatAccessibilityProvider.ts
var getToolConfirmationAlert = (accessor, toolInvocation) => {
  const keybindingService = accessor.get(IKeybindingService);
  const contextKeyService = accessor.get(IContextKeyService);
  const acceptKb = keybindingService.lookupKeybinding(AcceptToolConfirmationActionId, contextKeyService)?.getAriaLabel();
  const cancelKb = keybindingService.lookupKeybinding(CancelChatActionId, contextKeyService)?.getAriaLabel();
  const authenticationServers = toolInvocation.map((invocation) => invocation.state.get()).filter((state) => state.type === IChatToolInvocation.StateKind.WaitingForAuthentication).map((state) => state.server.name);
  const text2 = toolInvocation.map((v2) => {
    const state = v2.state.get();
    if (state.type === IChatToolInvocation.StateKind.WaitingForAuthentication) {
      return;
    }
    if (state.type === IChatToolInvocation.StateKind.WaitingForPostApproval) {
      const detail2 = isToolResultInputOutputDetails(state.resultDetails) ? state.resultDetails.input : isToolResultOutputDetails(state.resultDetails) ? void 0 : toolContentToA11yString(state.contentForModel);
      return {
        title: localize(8400, null),
        detail: detail2
      };
    }
    if (!(state.type === IChatToolInvocation.StateKind.WaitingForConfirmation && state.confirmationMessages?.message)) {
      return;
    }
    let input = "";
    if (v2.toolSpecificData) {
      if (v2.toolSpecificData.kind === "terminal") {
        const terminalData = migrateLegacyTerminalToolSpecificData(v2.toolSpecificData);
        input = terminalData.commandLine.toolEdited ?? terminalData.commandLine.original;
      } else if (v2.toolSpecificData.kind === "extensions") {
        input = JSON.stringify(v2.toolSpecificData.extensions);
      } else if (v2.toolSpecificData.kind === "input") {
        input = JSON.stringify(v2.toolSpecificData.rawInput);
      } else if (v2.toolSpecificData.kind === "modifiedFilesConfirmation") {
        input = localize(8385, null, v2.toolSpecificData.modifiedFiles.length);
      }
    }
    const titleObj = state.confirmationMessages?.title;
    const title = typeof titleObj === "string" ? titleObj : titleObj?.value || "";
    return {
      title: (title + (input ? ": " + input : "")).trim(),
      detail: void 0
    };
  }).filter(isDefined);
  const messages = [];
  if (text2.length > 0) {
    messages.push(acceptKb && cancelKb ? localize(8399, null, text2.map((t2) => t2.title).join(", "), acceptKb, cancelKb) : localize(8397, null, text2.map((t2) => t2.title).join(", ")));
  }
  if (text2.some((t2) => t2.detail)) {
    messages.push(localize(8398, null, text2.map((t2) => t2.detail ? t2.detail : "").join(" ")));
  }
  if (authenticationServers.length > 0) {
    messages.push(localize(8396, null, authenticationServers.join(", ")));
  }
  return messages.join(" ");
};

var ChatAccessibilityProvider = class {
  constructor(_accessibleViewService, _instantiationService) {
    this._accessibleViewService = _accessibleViewService;
    this._instantiationService = _instantiationService;
  }
  getWidgetRole() {
    return "list";
  }
  getRole(element) {
    return "listitem";
  }
  getWidgetAriaLabel() {
    return localize(8384, null);
  }
  getAriaLabel(element) {
    if (isRequestVM(element)) {
      return getChatRequestText(element).trim() || getExplicitFileOrImageAttachmentSummary(element.variables) || "";
    }
    if (isResponseVM(element)) {
      return this._getLabelWithInfo(element);
    }
    return "";
  }
  _getLabelWithInfo(element) {
    const accessibleViewHint = this._accessibleViewService.getOpenAriaHint("accessibility.verbosity.panelChat" /* Chat */);
    let label3 = "";
    const toolInvocation = element.response.value.filter((v2) => v2.kind === "toolInvocation");
    let toolInvocationHint = "";
    if (toolInvocation.length) {
      const waitingForConfirmation = toolInvocation.filter((v2) => {
        const state = v2.state.get().type;
        return state === IChatToolInvocation.StateKind.WaitingForConfirmation || state === IChatToolInvocation.StateKind.WaitingForPostApproval || state === IChatToolInvocation.StateKind.WaitingForAuthentication;
      });
      if (waitingForConfirmation.length) {
        toolInvocationHint = this._instantiationService.invokeFunction(getToolConfirmationAlert, toolInvocation);
      }
    }
    const tableCount = marked.lexer(element.response.toString()).filter((token) => token.type === "table")?.length ?? 0;
    let tableCountHint = "";
    switch (tableCount) {
      case 0:
        break;
      case 1:
        tableCountHint = localize(8395, null);
        break;
      default:
        tableCountHint = localize(8389, null, tableCount);
        break;
    }
    const fileTreeCount = element.response.value.filter((v2) => v2.kind === "treeData").length ?? 0;
    let fileTreeCountHint = "";
    switch (fileTreeCount) {
      case 0:
        break;
      case 1:
        fileTreeCountHint = localize(8394, null);
        break;
      default:
        fileTreeCountHint = localize(8388, null, fileTreeCount);
        break;
    }
    const elicitationCount = element.response.value.filter((v2) => v2.kind === "elicitation2" || v2.kind === "elicitationSerialized");
    let elicitationHint = "";
    for (const elicitation of elicitationCount) {
      const title = typeof elicitation.title === "string" ? elicitation.title : elicitation.title.value;
      const message = typeof elicitation.message === "string" ? elicitation.message : elicitation.message.value;
      elicitationHint += title + " " + message;
    }
    const codeBlockCount = marked.lexer(element.response.toString()).filter((token) => token.type === "code")?.length ?? 0;
    switch (codeBlockCount) {
      case 0:
        label3 = accessibleViewHint ? localize(8391, null, toolInvocationHint, fileTreeCountHint, elicitationHint, tableCountHint, element.response.toString(), accessibleViewHint) : localize(8390, null, fileTreeCountHint, elicitationHint, tableCountHint, element.response.toString());
        break;
      case 1:
        label3 = accessibleViewHint ? localize(8393, null, toolInvocationHint, fileTreeCountHint, elicitationHint, tableCountHint, element.response.toString(), accessibleViewHint) : localize(8392, null, fileTreeCountHint, elicitationHint, tableCountHint, element.response.toString());
        break;
      default:
        label3 = accessibleViewHint ? localize(8387, null, toolInvocationHint, fileTreeCountHint, elicitationHint, tableCountHint, codeBlockCount, element.response.toString(), accessibleViewHint) : localize(8386, null, fileTreeCountHint, elicitationHint, codeBlockCount, tableCountHint, element.response.toString());
        break;
    }
    return label3;
  }
};

ChatAccessibilityProvider = __decorateClass([
  __decorateParam(0, IAccessibleViewService),
  __decorateParam(1, IInstantiationService)
], ChatAccessibilityProvider);
export { getToolConfirmationAlert, ChatAccessibilityProvider };
