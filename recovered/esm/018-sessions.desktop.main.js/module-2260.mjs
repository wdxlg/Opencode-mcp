// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolPartUtilities.ts
import { IChatToolInvocation } from "./module-0973.mjs";
import { localize } from "./module-0001.mjs";
import { MarkdownString, createMarkdownCommandLink } from "./module-0462.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/toolInvocationParts/chatToolPartUtilities.ts
function isMcpToolInvocation(toolInvocation) {
  return toolInvocation.source?.type === "mcp" || toolInvocation.toolId.toLowerCase().includes("mcp");
}

function isAskQuestionsToolInvocation(toolInvocation) {
  return toolInvocation.toolId === "copilot_askQuestions" || toolInvocation.toolId === "vscode_askQuestions" || toolInvocation.toolId === "ask_user" || toolInvocation.toolId === "AskUserQuestion" || toolInvocation.toolId === "request_user_input";
}

function shouldShimmerForTool(toolInvocation, content) {
  if (!isAskQuestionsToolInvocation(toolInvocation) || IChatToolInvocation.isComplete(toolInvocation)) {
    return false;
  }
  return getMarkdownValue(content) === getMarkdownValue(toolInvocation.invocationMessage);
}

function getMarkdownValue(content) {
  return (typeof content === "string" ? content : content?.value)?.replaceAll("&nbsp;", " ").replace(/\\[\\`*_{}\[\]()#+\-!~]/g, (escaped) => escaped.slice(1));
}

function getToolApprovalMessage(toolInvocation) {
  const reason = IChatToolInvocation.executionConfirmedOrDenied(toolInvocation);
  if (!reason || typeof reason === "boolean") {
    return void 0;
  }
  return getApprovalMessageFromReason(reason);
}

function getApprovalMessageFromReason(reason) {
  let md;
  switch (reason.type) {
    case 2 /* Setting */:
      md = localize(12310, null, createMarkdownCommandLink({ text: "`" + reason.id + "`", id: "workbench.action.openSettings", arguments: [reason.id], tooltip: localize(12313, null) }, false));
      break;
    case 3 /* LmServicePerTool */:
      md = reason.scope === "session" ? localize(12308, null) : reason.scope === "workspace" ? localize(12309, null) : localize(12307, null);
      md += " (" + createMarkdownCommandLink({ text: localize(12311, null), id: "workbench.action.chat.editToolApproval", arguments: [reason.scope], tooltip: localize(12312, null) }) + ")";
      break;
    case 1 /* ConfirmationNotNeeded */:
      if (reason.reason) {
        return typeof reason.reason === "string" ? new MarkdownString(reason.reason, { isTrusted: true }) : reason.reason;
      }
      return void 0;
    case 4 /* UserAction */:
    case 0 /* Denied */:
    default:
      return void 0;
  }
  return new MarkdownString(md, { isTrusted: true });
}
export { isMcpToolInvocation, isAskQuestionsToolInvocation, shouldShimmerForTool, getMarkdownValue, getToolApprovalMessage, getApprovalMessageFromReason };
