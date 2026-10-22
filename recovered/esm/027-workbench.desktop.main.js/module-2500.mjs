// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/model/chatSessionOperationLog.ts
import { ObjectMutationLog, array2, key, object, t, v, value } from "./module-2499.mjs";
import { isMarkdownString } from "./module-0462.mjs";
import { hasKey } from "./module-0010.mjs";
import { equals4 } from "./module-0098.mjs";
import { softAssertNever } from "./module-0009.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { IChatRequestVariableEntry } from "./module-0979.mjs";
import { serializeChatRequestOrigin } from "./module-1189.mjs";
import { serializeSendOptions } from "./module-1193.mjs";


// src/vs/workbench/contrib/chat/common/model/chatSessionOperationLog.ts
var toJson = (obj) => {
  const cast = obj;
  return cast && typeof cast.toJSON === "function" ? cast.toJSON() : obj;
};

var responsePartSchema = v(
  (obj) => obj.kind === "markdownContent" ? obj.content : toJson(obj),
  (a, b) => {
    if (isMarkdownString(a) && isMarkdownString(b)) {
      return a.value === b.value;
    }
    if (hasKey(a, { kind: true }) && hasKey(b, { kind: true })) {
      if (a.kind !== b.kind) {
        return false;
      }
      switch (a.kind) {
        case "markdownContent":
          return a.content === b.content;
        // Dynamic types that can change after initial push need deep equality
        // Note: these are the *serialized* kind names (e.g. toolInvocationSerialized not toolInvocation)
        case "toolInvocationSerialized":
        case "elicitationSerialized":
        case "progressTaskSerialized":
        case "textEditGroup":
        case "multiDiffData":
        case "mcpServersStarting":
        case "thinking":
        case "planReview":
        // Flips from routing to routed once the router answers.
        case "autoModeResolution":
          return equals4(a, b);
        // Static types that won't change after being pushed can use strict equality.
        case "clearToPreviousToolInvocation":
        case "codeblockUri":
        case "command":
        case "confirmation":
        case "extensions":
        case "hook":
        case "inlineReference":
        case "markdownVuln":
        case "notebookEditGroup":
        case "progressMessage":
        case "systemNotification":
        case "pullRequest":
        case "questionCarousel":
        case "undoStop":
        case "warning":
        case "info":
        case "treeData":
        case "workspaceEdit":
        case "externalEdit":
        case "disabledClaudeHooks":
          return a.kind === b.kind;
        default: {
          softAssertNever(a);
          return equals4(a, b);
        }
      }
    }
    return false;
  }
);

var urisEqual = (a, b) => {
  return isEqual2(URI.from(a), URI.from(b));
};

var messageSchema = object({
  text: v((m) => m.text),
  parts: v((m) => m.parts, (a, b) => a.length === b.length && a.every((part, i2) => part.text === b[i2].text))
});

var agentEditedFileEventSchema = object({
  uri: v((e) => e.uri, urisEqual),
  eventKind: v((e) => e.eventKind)
});

var chatVariableSchema = object({
  variables: t((v2) => v2.variables.map(IChatRequestVariableEntry.toExport), array2(value((a, b) => a.name === b.name)))
});

var requestSchema = object({
  // request parts
  requestId: t((m) => m.id, key()),
  timestamp: v((m) => m.requestTimestamp),
  confirmation: v((m) => m.confirmation),
  message: t((m) => m.message, messageSchema),
  shouldBeRemovedOnSend: v((m) => m.shouldBeRemovedOnSend, equals4),
  agent: v((m) => m.response?.agent, (a, b) => a?.id === b?.id),
  modelId: v((m) => m.modelId),
  editedFileEvents: t((m) => m.editedFileEvents, array2(agentEditedFileEventSchema)),
  variableData: t((m) => m.variableData, chatVariableSchema),
  isHidden: v(() => void 0),
  // deprecated, always undefined for new data
  hiddenFromTranscript: v((m) => m.isHiddenFromTranscript),
  isCanceled: v(() => void 0),
  // deprecated, modelState is used instead
  response: t((m) => m.response?.entireResponse.value.filter((p) => p.kind !== "mcpAuthenticationRequired" && p.kind !== "mcpServersStartingSlow" && p.kind !== "voiceProgress"), array2(responsePartSchema)),
  responseId: v((m) => m.response?.id),
  responseTimestamp: v((m) => m.response?.timestamp),
  result: v((m) => m.response?.result, equals4),
  responseMarkdownInfo: v(
    (m) => m.response?.codeBlockInfos?.map((info) => ({ suggestionId: info.suggestionId })),
    equals4
  ),
  followups: v((m) => m.response?.followups, equals4),
  modelState: v((m) => m.response?.stateT, equals4),
  vote: v((m) => m.response?.vote),
  slashCommand: t((m) => m.response?.slashCommand, value((a, b) => a?.name === b?.name)),
  usedContext: v((m) => m.response?.usedContext, equals4),
  contentReferences: v((m) => m.response?.contentReferences, equals4),
  codeCitations: v((m) => m.response?.codeCitations, equals4),
  timeSpentWaiting: v((m) => m.response?.timestamp),
  // based on response timestamp
  completionTokens: v((m) => m.response?.completionTokenCount),
  promptTokens: v((m) => m.response?.usage?.promptTokens),
  outputBuffer: v((m) => m.response?.usage?.outputBuffer),
  promptTokenDetails: v((m) => m.response?.usage?.promptTokenDetails, equals4),
  copilotCredits: v((m) => m.response?.usage?.copilotCredits),
  modelTotals: v((m) => m.response?.usage?.modelTotals, equals4),
  sessionCopilotCredits: v((m) => m.response?.usage?.sessionCopilotCredits),
  elapsedMs: v((m) => m.response?.elapsedMs ?? (m.response?.completedAt ? Math.max(0, m.response.completedAt - m.response.confirmationAdjustedTimestamp.get()) : void 0)),
  modeInfo: v((m) => m.modeInfo, equals4),
  isSystemInitiated: v((m) => m.isSystemInitiated),
  systemInitiatedLabel: v((m) => m.systemInitiatedLabel),
  terminalExecutionId: v((m) => m.terminalExecutionId),
  origin: v((m) => m.origin ? serializeChatRequestOrigin(m.origin) : void 0, equals4)
}, {
  sealed: (o) => o.modelState?.value === 2 /* Cancelled */ || o.modelState?.value === 3 /* Failed */ || o.modelState?.value === 1 /* Complete */
});

var inputStateSchema = object({
  attachments: v((i2) => i2.attachments.map(IChatRequestVariableEntry.toExport), equals4),
  mode: v((i2) => i2.mode, (a, b) => a.id === b.id),
  selectedModel: v((i2) => i2.selectedModel, (a, b) => a?.identifier === b?.identifier && equals4(a?.modelConfiguration, b?.modelConfiguration)),
  inputText: v((i2) => i2.inputText),
  selections: v((i2) => i2.selections, equals4),
  permissionLevel: v((i2) => i2.permissionLevel),
  contrib: v((i2) => i2.contrib, equals4)
});

var pendingRequestSchema = object({
  id: t((p) => p.request.id, key()),
  request: t((p) => p.request, requestSchema),
  kind: v((p) => p.kind),
  sendOptions: v((p) => serializeSendOptions(p.sendOptions), equals4)
});

var storageSchema = object({
  version: v(() => 3),
  creationDate: v((m) => m.timestamp),
  customTitle: v((m) => m.hasCustomTitle ? m.title : void 0),
  initialLocation: v((m) => m.initialLocation),
  inputState: t((m) => m.inputModel.toJSON(), inputStateSchema),
  responderUsername: v((m) => m.responderUsername),
  sessionId: v((m) => m.sessionId),
  requests: t((m) => m.getRequests(), array2(requestSchema)),
  hasPendingEdits: v((m) => m.editingSession?.entries.get().some((e) => e.state.get() === 0 /* Modified */)),
  repoData: v((m) => m.repoData, equals4),
  pendingRequests: t((m) => m.getPendingRequests(), array2(pendingRequestSchema)),
  workingDirectory: v((m) => m.workingDirectory?.toString())
});

var ChatSessionOperationLog = class extends ObjectMutationLog {
  constructor() {
    super(storageSchema, 1024);
  }
};
export { toJson, responsePartSchema, urisEqual, messageSchema, agentEditedFileEventSchema, chatVariableSchema, requestSchema, inputStateSchema, pendingRequestSchema, storageSchema, ChatSessionOperationLog };
