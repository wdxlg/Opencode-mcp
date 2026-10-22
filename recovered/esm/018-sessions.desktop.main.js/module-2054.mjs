// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/importLocalConversationToAgentSession.ts
import { URI } from "./module-0032.mjs";
import { basename2 } from "./module-0034.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { isToolResultInputOutputDetails } from "./module-0991.mjs";
import { generateUuid } from "./module-0190.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/importLocalConversationToAgentSession.ts
function stringifyChatMessage(message) {
  if (message === void 0) {
    return "";
  }
  return typeof message === "string" ? message : message.value;
}

function stringifyToolInput(rawInput) {
  if (typeof rawInput === "string") {
    return rawInput;
  }
  try {
    return JSON.stringify(rawInput) ?? "";
  } catch {
    return "";
  }
}

function inlineReferenceToMarkdown(reference, name) {
  let uri4;
  let label3 = name;
  let isSymbol = false;
  if (URI.isUri(reference)) {
    uri4 = reference;
  } else {
    const location2 = reference;
    if (URI.isUri(location2.uri)) {
      uri4 = location2.uri;
    } else if (URI.isUri(location2.location?.uri)) {
      uri4 = location2.location.uri;
      label3 = label3 ?? location2.name;
      isSymbol = true;
    }
  }
  if (!uri4) {
    return label3 ?? "";
  }
  if (!label3 || !isSymbol && /[\\/]/.test(label3)) {
    label3 = basename2(uri4);
  }
  return `[${label3}](${uri4.toString()})`;
}

function toolCallResponsePart(part) {
  const invocationMessage = stringifyChatMessage(part.invocationMessage);
  const resultDetails = IChatToolInvocation.resultDetails(part);
  const subagentData = part.toolSpecificData?.kind === "subagent" ? part.toolSpecificData : void 0;
  let outputText = "";
  let isError = false;
  let resultInput;
  if (resultDetails && isToolResultInputOutputDetails(resultDetails)) {
    if (Array.isArray(resultDetails.output)) {
      for (const item of resultDetails.output) {
        if (item.type === "embed" && item.isText) {
          outputText += item.value;
        }
      }
    }
    isError = !!resultDetails.isError;
    resultInput = resultDetails.input;
  }
  if (!outputText && subagentData?.result) {
    outputText = subagentData.result;
  }
  const toolInput = part.toolSpecificData?.kind === "input" ? stringifyToolInput(part.toolSpecificData.rawInput) : resultInput ?? subagentData?.prompt ?? "";
  const toolCallId = part.toolCallId || generateUuid();
  const content = [];
  if (outputText) {
    content.push({ type: "text" /* Text */, text: outputText });
  }
  if (subagentData) {
    content.push({
      type: "subagent" /* Subagent */,
      resource: subagentData.chatResource ?? `agent-host-subagent:/${toolCallId}`,
      title: subagentData.agentName ?? localize(9035, null),
      ...subagentData.agentName ? { agentName: subagentData.agentName } : {},
      ...subagentData.description ? { description: subagentData.description } : {}
    });
  }
  const displayName = subagentData?.agentName || part.toolId;
  return {
    kind: "toolCall" /* ToolCall */,
    toolCall: {
      status: "completed" /* Completed */,
      toolCallId,
      toolName: part.toolId,
      displayName,
      invocationMessage: invocationMessage || stringifyChatMessage(subagentData?.description),
      toolInput,
      success: !isError,
      pastTenseMessage: stringifyChatMessage(part.pastTenseMessage) || invocationMessage,
      confirmed: "not-needed" /* NotNeeded */,
      ...content.length ? { content } : {},
      ...isError ? { error: { message: outputText || localize(9036, null) } } : {}
    }
  };
}

function responsePartsFromRequest(request2) {
  const responseParts = [];
  const response = request2.response;
  if (response) {
    for (const part of response.entireResponse.value) {
      if (part.kind === "markdownContent") {
        const content = part.content.value;
        if (content) {
          responseParts.push({ kind: "markdown" /* Markdown */, id: generateUuid(), content });
        }
      } else if (part.kind === "thinking") {
        const content = Array.isArray(part.value) ? part.value.join("") : part.value ?? "";
        if (content) {
          responseParts.push({ kind: "reasoning" /* Reasoning */, id: generateUuid(), content });
        }
      } else if (part.kind === "inlineReference") {
        const content = inlineReferenceToMarkdown(part.inlineReference, part.name);
        if (content) {
          responseParts.push({ kind: "markdown" /* Markdown */, id: generateUuid(), content });
        }
      } else if (part.kind === "toolInvocation" || part.kind === "toolInvocationSerialized") {
        responseParts.push(toolCallResponsePart(part));
      }
    }
  }
  return responseParts;
}

function turnOutcomeFromRequest(request2) {
  const response = request2.response;
  if (!response) {
    return { state: "complete" /* Complete */ };
  }
  if (response.isCanceled) {
    return { state: "cancelled" /* Cancelled */ };
  }
  const errorDetails = response.result?.errorDetails;
  if (errorDetails) {
    return {
      state: "error" /* Error */,
      error: { errorType: errorDetails.code ?? "error", message: errorDetails.message }
    };
  }
  return { state: "complete" /* Complete */ };
}

function importedTurnsFromChatModel(model) {
  const turns = [];
  for (const request2 of model.getRequests()) {
    const responseParts = responsePartsFromRequest(request2);
    const outcome = turnOutcomeFromRequest(request2);
    if (outcome.error) {
      responseParts.push({ kind: "error" /* Error */, error: outcome.error });
    }
    if (request2.isSystemInitiated) {
      const previous = turns[turns.length - 1];
      if (previous) {
        previous.responseParts.push(...responseParts);
        previous.state = outcome.state;
      }
      continue;
    }
    turns.push({
      id: generateUuid(),
      message: { text: request2.message.text, origin: { kind: "user" /* User */ } },
      responseParts,
      usage: void 0,
      state: outcome.state
    });
  }
  return turns;
}
export { stringifyChatMessage, stringifyToolInput, inlineReferenceToMarkdown, toolCallResponsePart, responsePartsFromRequest, turnOutcomeFromRequest, importedTurnsFromChatModel };
