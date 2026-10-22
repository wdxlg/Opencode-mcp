// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/state/protocol/channels-chat/reducer.ts
import { addMillisecondsToTimestamp } from "./module-0091.mjs";
import { softAssertNever2 } from "./module-0088.mjs";


// src/vs/platform/agentHost/common/state/protocol/channels-chat/reducer.ts
function tcBase(tc) {
  return {
    toolCallId: tc.toolCallId,
    toolName: tc.toolName,
    displayName: tc.displayName,
    intention: tc.intention,
    contributor: tc.contributor,
    _meta: tc._meta
  };
}

function tcBaseWithMeta(tc, meta) {
  return {
    ...tcBase(tc),
    _meta: meta ?? tc._meta
  };
}

function refineToolCallContributor(current, next, log4) {
  if (!next) {
    return current;
  }
  if (current?.kind === "client" /* Client */) {
    if (next.kind === "client" /* Client */ && next.clientId === current.clientId) {
      return next;
    }
    log4?.(`Ignoring contributor change for client tool call from '${current.clientId}'`);
    return current;
  }
  if (next.kind === "client" /* Client */) {
    log4?.(`Ignoring late client contributor '${next.clientId}' because client execution ownership must be established at tool call start`);
    return current;
  }
  return next;
}

function resolveSelectedOption(options, id2) {
  if (!id2 || !options) {
    return void 0;
  }
  return options.find((o) => o.id === id2);
}

function hasBlockingToolCall(state) {
  if (!state.activeTurn) {
    return false;
  }
  return state.activeTurn.responseParts.some(
    (part) => part.kind === "toolCall" /* ToolCall */ && (part.toolCall.status === "pending-confirmation" /* PendingConfirmation */ || part.toolCall.status === "pending-result-confirmation" /* PendingResultConfirmation */ || part.toolCall.status === "auth-required" /* AuthRequired */)
  );
}

function hasOpenInputRequest(state) {
  return state.activeTurn?.responseParts.some(
    (part) => part.kind === "inputRequest" /* InputRequest */ && part.response === void 0
  ) ?? false;
}

function findOpenInputRequestPart(responseParts, requestId) {
  const index = responseParts.findIndex(
    (part2) => part2.kind === "inputRequest" /* InputRequest */ && part2.response === void 0 && part2.request.id === requestId
  );
  if (index < 0) {
    return void 0;
  }
  const part = responseParts[index];
  return part.kind === "inputRequest" /* InputRequest */ ? { index, part } : void 0;
}

function hasResumableError(turn) {
  const part = turn.responseParts[turn.responseParts.length - 1];
  return part?.kind === "error" /* Error */ && part.resumable === true;
}

function isErrorResponsePart(part) {
  return part.kind === "error" /* Error */;
}

var STATUS_ACTIVITY_MASK3 = (1 << 5) - 1;

function withStatusFlag2(status, flag, set) {
  return set ? status | flag : status & ~flag;
}

function summaryStatus(state, terminalStatus) {
  let activity;
  if (terminalStatus) {
    activity = terminalStatus;
  } else if (hasOpenInputRequest(state) || hasBlockingToolCall(state)) {
    activity = 24 /* InputNeeded */;
  } else if (state.activeTurn) {
    activity = 8 /* InProgress */;
  } else {
    activity = 1 /* Idle */;
  }
  return state.status & ~STATUS_ACTIVITY_MASK3 | activity;
}

function refreshSummaryStatus(state) {
  const status = summaryStatus(state);
  if (status === state.status) {
    return state;
  }
  return { ...state, status };
}

function endTurn(state, turnId, turnState, duration, terminalStatus, errorPart) {
  if (!state.activeTurn || state.activeTurn.id !== turnId) {
    return state;
  }
  const active = state.activeTurn;
  const responseParts = active.responseParts.map((part) => {
    if (part.kind !== "toolCall" /* ToolCall */) {
      return part;
    }
    const tc = part.toolCall;
    if (tc.status === "completed" /* Completed */ || tc.status === "cancelled" /* Cancelled */) {
      return part;
    }
    return {
      kind: "toolCall" /* ToolCall */,
      toolCall: {
        status: "cancelled" /* Cancelled */,
        ...tcBase(tc),
        invocationMessage: tc.status === "streaming" /* Streaming */ ? tc.invocationMessage ?? "" : tc.invocationMessage,
        toolInput: tc.status === "streaming" /* Streaming */ ? void 0 : tc.toolInput,
        reason: "skipped" /* Skipped */
      }
    };
  });
  if (errorPart) {
    responseParts.push(errorPart);
  }
  const turn = {
    id: active.id,
    startedAt: active.startedAt,
    // Defensive clamp: the duration is producer-supplied and opaque to this
    // reducer, but a negative value would be nonsensical to display.
    duration: Math.max(0, duration),
    message: active.message,
    responseParts,
    usage: active.usage,
    state: turnState
  };
  const next = {
    ...state,
    turns: [...state.turns, turn],
    activeTurn: void 0,
    modifiedAt: addMillisecondsToTimestamp(active.startedAt, turn.duration ?? 0)
  };
  return {
    ...next,
    status: summaryStatus(next, terminalStatus)
  };
}

function upsertInputRequestPart(state, request) {
  const activeTurn = state.activeTurn;
  if (!activeTurn) {
    return state;
  }
  const existing = findOpenInputRequestPart(activeTurn.responseParts, request.id);
  const responseParts = [...activeTurn.responseParts];
  const part = {
    kind: "inputRequest" /* InputRequest */,
    request
  };
  if (existing) {
    part.request = {
      ...request,
      answers: request.answers ?? existing.part.request.answers
    };
    responseParts[existing.index] = part;
  } else {
    responseParts.push(part);
  }
  const next = {
    ...state,
    activeTurn: {
      ...activeTurn,
      responseParts
    }
  };
  return { ...next, status: withStatusFlag2(summaryStatus(next), 32 /* IsRead */, false) };
}

function updateToolCallInParts(state, turnId, toolCallId, updater) {
  const activeTurn = state.activeTurn;
  if (!activeTurn || activeTurn.id !== turnId) {
    return state;
  }
  let found = false;
  const responseParts = activeTurn.responseParts.map((part) => {
    if (part.kind === "toolCall" /* ToolCall */ && part.toolCall.toolCallId === toolCallId) {
      const updated = updater(part.toolCall);
      if (updated === part.toolCall) {
        return part;
      }
      found = true;
      return { ...part, toolCall: updated };
    }
    return part;
  });
  if (!found) {
    return state;
  }
  return {
    ...state,
    activeTurn: { ...activeTurn, responseParts }
  };
}

function updateResponsePart(state, turnId, partId, updater) {
  const activeTurn = state.activeTurn;
  if (!activeTurn || activeTurn.id !== turnId) {
    return state;
  }
  let found = false;
  const responseParts = activeTurn.responseParts.map((part) => {
    if (!found) {
      const id2 = part.kind === "toolCall" /* ToolCall */ ? part.toolCall.toolCallId : "id" in part ? part.id : void 0;
      if (id2 === partId) {
        found = true;
        return updater(part);
      }
    }
    return part;
  });
  if (!found) {
    return state;
  }
  return {
    ...state,
    activeTurn: { ...activeTurn, responseParts }
  };
}

function chatReducer(state, action, log4) {
  switch (action.type) {
    // ── Turn Lifecycle ────────────────────────────────────────────────────
    case "chat/turnStarted" /* ChatTurnStarted */: {
      let next = {
        ...state,
        activeTurn: {
          id: action.turnId,
          startedAt: action.startedAt,
          message: action.message,
          responseParts: [],
          usage: void 0
        }
      };
      next = {
        ...next,
        status: withStatusFlag2(summaryStatus(next), 32 /* IsRead */, false),
        modifiedAt: action.startedAt
      };
      if (action.queuedMessageId) {
        if (next.steeringMessage?.id === action.queuedMessageId) {
          next = { ...next, steeringMessage: void 0 };
        }
        if (next.queuedMessages) {
          const filtered = next.queuedMessages.filter((m) => m.id !== action.queuedMessageId);
          next = { ...next, queuedMessages: filtered.length > 0 ? filtered : void 0 };
        }
      }
      return next;
    }
    case "chat/delta" /* ChatDelta */:
      return updateResponsePart(state, action.turnId, action.partId, (part) => {
        if (part.kind === "markdown" /* Markdown */) {
          return { ...part, content: part.content + action.content };
        }
        return part;
      });
    case "chat/responsePart" /* ChatResponsePart */:
      if (!state.activeTurn || state.activeTurn.id !== action.turnId) {
        return state;
      }
      if (isErrorResponsePart(action.part)) {
        return state;
      }
      return {
        ...state,
        activeTurn: {
          ...state.activeTurn,
          responseParts: [...state.activeTurn.responseParts, action.part]
        }
      };
    case "chat/turnComplete" /* ChatTurnComplete */:
      return endTurn(state, action.turnId, "complete" /* Complete */, action.duration);
    case "chat/turnCancelled" /* ChatTurnCancelled */:
      return endTurn(state, action.turnId, "cancelled" /* Cancelled */, action.duration);
    case "chat/error" /* ChatError */:
      return endTurn(state, action.turnId, "error" /* Error */, action.duration, 2 /* Error */, action.part);
    case "chat/turnResume" /* ChatTurnResume */: {
      if (state.activeTurn) {
        return state;
      }
      const turnIndex = state.turns.length - 1;
      const turn = state.turns[turnIndex];
      if (!turn || turn.id !== action.turnId || turn.state !== "error" /* Error */ || !hasResumableError(turn)) {
        return state;
      }
      const turns = state.turns.slice();
      turns.splice(turnIndex, 1);
      const next = {
        ...state,
        turns,
        activeTurn: {
          id: turn.id,
          startedAt: turn.startedAt ?? state.modifiedAt,
          message: turn.message,
          responseParts: turn.responseParts,
          usage: turn.usage
        }
      };
      return {
        ...next,
        status: withStatusFlag2(summaryStatus(next), 32 /* IsRead */, false)
      };
    }
    case "chat/activityChanged" /* ChatActivityChanged */:
      return { ...state, activity: action.activity };
    // ── Working Directories ───────────────────────────────────────────────
    case "chat/workingDirectorySet" /* ChatWorkingDirectorySet */: {
      const list = state.workingDirectories ?? [];
      if (list.includes(action.directory)) {
        return state;
      }
      return { ...state, workingDirectories: [...list, action.directory] };
    }
    case "chat/workingDirectoryRemoved" /* ChatWorkingDirectoryRemoved */: {
      const list = state.workingDirectories;
      if (!list) {
        return state;
      }
      const idx = list.indexOf(action.directory);
      if (idx < 0) {
        return state;
      }
      const updated = list.slice();
      updated.splice(idx, 1);
      return { ...state, workingDirectories: updated };
    }
    // ── Tool Call State Machine ───────────────────────────────────────────
    case "chat/toolCallStart" /* ChatToolCallStart */:
      if (!state.activeTurn || state.activeTurn.id !== action.turnId) {
        return state;
      }
      return {
        ...state,
        activeTurn: {
          ...state.activeTurn,
          responseParts: [
            ...state.activeTurn.responseParts,
            {
              kind: "toolCall" /* ToolCall */,
              toolCall: {
                toolCallId: action.toolCallId,
                toolName: action.toolName,
                displayName: action.displayName,
                intention: action.intention,
                contributor: action.contributor,
                _meta: action._meta,
                status: "streaming" /* Streaming */
              }
            }
          ]
        }
      };
    case "chat/toolCallDelta" /* ChatToolCallDelta */:
      return updateToolCallInParts(state, action.turnId, action.toolCallId, (tc) => {
        if (tc.status !== "streaming" /* Streaming */) {
          return tc;
        }
        return {
          ...tc,
          ...action._meta !== void 0 ? { _meta: action._meta } : {},
          ...action.content !== void 0 ? { partialInput: (tc.partialInput ?? "") + action.content } : {},
          invocationMessage: action.invocationMessage ?? tc.invocationMessage
        };
      });
    case "chat/toolCallReady" /* ChatToolCallReady */:
      return refreshSummaryStatus(updateToolCallInParts(state, action.turnId, action.toolCallId, (tc) => {
        if (tc.status !== "streaming" /* Streaming */ && tc.status !== "running" /* Running */ && tc.status !== "pending-confirmation" /* PendingConfirmation */) {
          return tc;
        }
        const base = {
          ...tcBaseWithMeta(tc, action._meta),
          contributor: refineToolCallContributor(tc.contributor, action.contributor, log4),
          intention: action.intention ?? tc.intention
        };
        const toolInput = action.toolInput ?? (tc.status === "streaming" /* Streaming */ ? void 0 : tc.toolInput);
        if (action.confirmed) {
          return {
            status: "running" /* Running */,
            ...base,
            invocationMessage: action.invocationMessage,
            toolInput,
            confirmed: action.confirmed
          };
        }
        const pending = tc.status === "pending-confirmation" /* PendingConfirmation */ ? tc : void 0;
        const options = action.options ?? pending?.options;
        return {
          status: "pending-confirmation" /* PendingConfirmation */,
          ...base,
          invocationMessage: action.invocationMessage,
          toolInput,
          confirmationTitle: action.confirmationTitle ?? pending?.confirmationTitle,
          riskAssessment: action.riskAssessment ?? pending?.riskAssessment,
          edits: action.edits ?? pending?.edits,
          editable: action.editable ?? pending?.editable,
          ...options ? { options } : {}
        };
      }));
    case "chat/toolCallConfirmed" /* ChatToolCallConfirmed */:
      return refreshSummaryStatus(updateToolCallInParts(state, action.turnId, action.toolCallId, (tc) => {
        if (tc.status !== "pending-confirmation" /* PendingConfirmation */) {
          return tc;
        }
        const base = tcBaseWithMeta(tc, action._meta);
        const selectedOption = resolveSelectedOption(tc.options, action.selectedOptionId);
        if (action.approved) {
          const toolInput = action.editedToolInput !== void 0 && typeof tc.toolInput === "string" ? action.editedToolInput : tc.toolInput;
          return {
            status: "running" /* Running */,
            ...base,
            invocationMessage: tc.invocationMessage,
            toolInput,
            confirmed: action.confirmed,
            ...selectedOption ? { selectedOption } : {}
          };
        }
        return {
          status: "cancelled" /* Cancelled */,
          ...base,
          invocationMessage: tc.invocationMessage,
          toolInput: tc.toolInput,
          reason: action.reason,
          reasonMessage: action.reasonMessage,
          userSuggestion: action.userSuggestion,
          ...selectedOption ? { selectedOption } : {}
        };
      }));
    case "chat/toolCallComplete" /* ChatToolCallComplete */:
      return refreshSummaryStatus(updateToolCallInParts(state, action.turnId, action.toolCallId, (tc) => {
        if (tc.status !== "running" /* Running */ && tc.status !== "pending-confirmation" /* PendingConfirmation */ && tc.status !== "auth-required" /* AuthRequired */) {
          return tc;
        }
        if (tc.status === "auth-required" /* AuthRequired */ && action.result.success) {
          return tc;
        }
        const base = tcBaseWithMeta(tc, action._meta);
        const confirmed = tc.status === "running" /* Running */ || tc.status === "auth-required" /* AuthRequired */ ? tc.confirmed : "not-needed" /* NotNeeded */;
        const selectedOption = tc.status === "running" /* Running */ || tc.status === "auth-required" /* AuthRequired */ ? tc.selectedOption : void 0;
        const preAuthContent = tc.status === "auth-required" /* AuthRequired */ ? tc.content : void 0;
        if (action.requiresResultConfirmation && tc.status !== "auth-required" /* AuthRequired */) {
          return {
            status: "pending-result-confirmation" /* PendingResultConfirmation */,
            ...base,
            invocationMessage: tc.invocationMessage,
            toolInput: tc.toolInput,
            confirmed,
            ...selectedOption ? { selectedOption } : {},
            ...preAuthContent ? { content: preAuthContent } : {},
            ...action.result
          };
        }
        return {
          status: "completed" /* Completed */,
          ...base,
          invocationMessage: tc.invocationMessage,
          toolInput: tc.toolInput,
          confirmed,
          ...selectedOption ? { selectedOption } : {},
          ...preAuthContent ? { content: preAuthContent } : {},
          ...action.result
        };
      }));
    case "chat/toolCallResultConfirmed" /* ChatToolCallResultConfirmed */:
      return refreshSummaryStatus(updateToolCallInParts(state, action.turnId, action.toolCallId, (tc) => {
        if (tc.status !== "pending-result-confirmation" /* PendingResultConfirmation */) {
          return tc;
        }
        const base = tcBaseWithMeta(tc, action._meta);
        if (action.approved) {
          return {
            status: "completed" /* Completed */,
            ...base,
            invocationMessage: tc.invocationMessage,
            toolInput: tc.toolInput,
            confirmed: tc.confirmed,
            ...tc.selectedOption ? { selectedOption: tc.selectedOption } : {},
            success: tc.success,
            pastTenseMessage: tc.pastTenseMessage,
            content: tc.content,
            structuredContent: tc.structuredContent,
            error: tc.error
          };
        }
        return {
          status: "cancelled" /* Cancelled */,
          ...base,
          invocationMessage: tc.invocationMessage,
          toolInput: tc.toolInput,
          reason: "result-denied" /* ResultDenied */,
          ...tc.selectedOption ? { selectedOption: tc.selectedOption } : {}
        };
      }));
    case "chat/toolCallContentChanged" /* ChatToolCallContentChanged */:
      return updateToolCallInParts(state, action.turnId, action.toolCallId, (tc) => {
        if (tc.status !== "running" /* Running */) {
          return tc;
        }
        return {
          ...tc,
          ...action._meta !== void 0 ? { _meta: action._meta } : {},
          content: action.content
        };
      });
    case "chat/toolCallAuthRequired" /* ChatToolCallAuthRequired */:
      return refreshSummaryStatus(updateToolCallInParts(state, action.turnId, action.toolCallId, (tc) => {
        if (tc.status !== "running" /* Running */) {
          return tc;
        }
        if (!tc.contributor || tc.contributor.kind !== "mcp" /* MCP */) {
          return tc;
        }
        const base = tcBaseWithMeta(tc, action._meta);
        return {
          status: "auth-required" /* AuthRequired */,
          ...base,
          contributor: tc.contributor,
          invocationMessage: tc.invocationMessage,
          toolInput: tc.toolInput,
          confirmed: tc.confirmed,
          ...tc.selectedOption ? { selectedOption: tc.selectedOption } : {},
          ...tc.content ? { content: tc.content } : {},
          auth: action.auth
        };
      }));
    case "chat/toolCallAuthResolved" /* ChatToolCallAuthResolved */:
      return refreshSummaryStatus(updateToolCallInParts(state, action.turnId, action.toolCallId, (tc) => {
        if (tc.status !== "auth-required" /* AuthRequired */) {
          return tc;
        }
        const base = tcBaseWithMeta(tc, action._meta);
        return {
          status: "running" /* Running */,
          ...base,
          invocationMessage: tc.invocationMessage,
          toolInput: tc.toolInput,
          confirmed: tc.confirmed,
          ...tc.selectedOption ? { selectedOption: tc.selectedOption } : {},
          ...tc.content ? { content: tc.content } : {}
        };
      }));
    case "chat/usage" /* ChatUsage */:
      if (!state.activeTurn || state.activeTurn.id !== action.turnId) {
        return state;
      }
      return {
        ...state,
        activeTurn: { ...state.activeTurn, usage: action.usage }
      };
    case "chat/reasoning" /* ChatReasoning */:
      return updateResponsePart(state, action.turnId, action.partId, (part) => {
        if (part.kind === "reasoning" /* Reasoning */) {
          return { ...part, content: part.content + action.content };
        }
        return part;
      });
    // ── Truncation ────────────────────────────────────────────────────────
    case "chat/truncated" /* ChatTruncated */: {
      let turns;
      if (action.turnId === void 0) {
        turns = [];
      } else {
        const idx = state.turns.findIndex((t) => t.id === action.turnId);
        if (idx < 0) {
          return state;
        }
        turns = state.turns.slice(0, idx + 1);
      }
      const next = {
        ...state,
        turns,
        activeTurn: void 0
      };
      if (action.turnId === void 0) {
        delete next.turnsNextCursor;
      }
      return {
        ...next,
        status: summaryStatus(next)
      };
    }
    case "chat/turnsLoaded" /* ChatTurnsLoaded */: {
      const existingIds = new Set(state.turns.map((turn) => turn.id));
      const olderTurns = action.turns.filter((turn) => !existingIds.has(turn.id));
      return {
        ...state,
        turns: [...olderTurns, ...state.turns],
        turnsNextCursor: action.turnsNextCursor
      };
    }
    // ── Session Input Requests ─────────────────────────────────────────────
    case "chat/inputRequested" /* ChatInputRequested */:
      return upsertInputRequestPart(state, action.request);
    case "chat/inputAnswerChanged" /* ChatInputAnswerChanged */: {
      const activeTurn = state.activeTurn;
      const existing = activeTurn ? findOpenInputRequestPart(activeTurn.responseParts, action.requestId) : void 0;
      if (!activeTurn || !existing) {
        return state;
      }
      const { index, part } = existing;
      const request = part.request;
      const answers = { ...request.answers ?? {} };
      if (action.answer === void 0) {
        delete answers[action.questionId];
      } else {
        answers[action.questionId] = action.answer;
      }
      const responseParts = [...activeTurn.responseParts];
      responseParts[index] = {
        ...part,
        request: {
          ...request,
          answers: Object.keys(answers).length > 0 ? answers : void 0
        }
      };
      return {
        ...state,
        activeTurn: {
          ...activeTurn,
          responseParts
        }
      };
    }
    case "chat/inputCompleted" /* ChatInputCompleted */: {
      const activeTurn = state.activeTurn;
      const existing = activeTurn ? findOpenInputRequestPart(activeTurn.responseParts, action.requestId) : void 0;
      if (!activeTurn || !existing) {
        return state;
      }
      const { index, part } = existing;
      const finalAnswers = { ...part.request.answers ?? {}, ...action.answers ?? {} };
      const responseParts = [...activeTurn.responseParts];
      responseParts[index] = {
        ...part,
        request: {
          ...part.request,
          answers: Object.keys(finalAnswers).length > 0 ? finalAnswers : void 0
        },
        response: action.response
      };
      const next = {
        ...state,
        activeTurn: {
          ...activeTurn,
          responseParts
        }
      };
      return {
        ...next,
        status: summaryStatus(next)
      };
    }
    // ── Pending Messages ──────────────────────────────────────────────────
    case "chat/pendingMessageSet" /* ChatPendingMessageSet */: {
      const entry = { id: action.id, message: action.message };
      if (action.kind === "steering" /* Steering */) {
        return { ...state, steeringMessage: entry };
      }
      const existing = state.queuedMessages ?? [];
      const idx = existing.findIndex((m) => m.id === action.id);
      if (idx >= 0) {
        const updated = [...existing];
        updated[idx] = entry;
        return { ...state, queuedMessages: updated };
      }
      return { ...state, queuedMessages: [...existing, entry] };
    }
    case "chat/pendingMessageRemoved" /* ChatPendingMessageRemoved */: {
      if (action.kind === "steering" /* Steering */) {
        if (!state.steeringMessage || state.steeringMessage.id !== action.id) {
          return state;
        }
        return { ...state, steeringMessage: void 0 };
      }
      const existing = state.queuedMessages;
      if (!existing) {
        return state;
      }
      const filtered = existing.filter((m) => m.id !== action.id);
      return filtered.length === existing.length ? state : { ...state, queuedMessages: filtered.length > 0 ? filtered : void 0 };
    }
    case "chat/queuedMessagesReordered" /* ChatQueuedMessagesReordered */: {
      const existing = state.queuedMessages;
      if (!existing) {
        return state;
      }
      const byId = new Map(existing.map((m) => [m.id, m]));
      const ordered = /* @__PURE__ */ new Set();
      const reordered = action.order.filter((id2) => {
        if (byId.has(id2) && !ordered.has(id2)) {
          ordered.add(id2);
          return true;
        }
        return false;
      }).map((id2) => byId.get(id2));
      for (const m of existing) {
        if (!ordered.has(m.id)) {
          reordered.push(m);
        }
      }
      return { ...state, queuedMessages: reordered };
    }
    // ── Draft ─────────────────────────────────────────────────────────────
    case "chat/draftChanged" /* ChatDraftChanged */:
      return { ...state, draft: action.draft };
    default:
      softAssertNever2(action, log4);
      return state;
  }
}
export { tcBase, tcBaseWithMeta, refineToolCallContributor, resolveSelectedOption, hasBlockingToolCall, hasOpenInputRequest, findOpenInputRequestPart, hasResumableError, isErrorResponsePart, withStatusFlag2, summaryStatus, refreshSummaryStatus, endTurn, upsertInputRequestPart, updateToolCallInParts, updateResponsePart, chatReducer, STATUS_ACTIVITY_MASK3 };
