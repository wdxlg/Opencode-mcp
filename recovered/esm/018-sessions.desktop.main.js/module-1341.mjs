// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/voiceClient/voiceClientService.ts
import { observableValue } from "./module-0048.mjs";
import { IChatToolInvocation } from "./module-0973.mjs";
import { hasKey } from "./module-0010.mjs";
import { MutableDisposable, toDisposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/common/voiceClient/voiceClientService.ts
function normalizeAgentsVoiceId(value2) {
  const voiceId = typeof value2 === "string" ? value2.trim() : "";
  switch (voiceId) {
    case "harper_neutral":
    case "birch_neutral":
    case "junho_neutral":
    case "oak_neutral":
      return voiceId;
    case "victoria_neutral":
      return "harper_neutral";
    case "maya_neutral":
      return "birch_neutral";
    case "daniel_neutral":
      return "junho_neutral";
    case "kevin_neutral":
      return "oak_neutral";
    default:
      return "birch_neutral";
  }
}

var pendingOccurrenceTokens = /* @__PURE__ */ new WeakMap();

var pendingOccurrenceCounter = 0;

var activePendingToolOccurrences = /* @__PURE__ */ new Map();

var resolvedPendingToolOccurrences = /* @__PURE__ */ new Map();

var pendingToolOccurrenceByPart = /* @__PURE__ */ new WeakMap();

var pendingToolOccurrenceById = /* @__PURE__ */ new Map();

var pendingToolResolutionVersion = observableValue("pendingToolResolutionVersion", 0);

var MAX_RESOLVED_PENDING_TOOL_OCCURRENCES = 200;

function isPendingToolState(state) {
  return state.type === IChatToolInvocation.StateKind.WaitingForConfirmation || state.type === IChatToolInvocation.StateKind.WaitingForPostApproval || state.type === IChatToolInvocation.StateKind.WaitingForAuthentication;
}

function getVoiceToolApprovalCommand(invocation, includeParameters = true) {
  const terminalData = invocation.toolSpecificData;
  let command4;
  if (terminalData?.kind === "terminal") {
    command4 = hasKey(terminalData, { commandLine: true }) ? terminalData.commandLine.userEdited ?? terminalData.presentationOverrides?.commandLine ?? terminalData.confirmation?.commandLine ?? terminalData.commandLine.toolEdited ?? terminalData.commandLine.original : terminalData.command;
  }
  if (!command4 && includeParameters) {
    const state = invocation.state.get();
    const parameters = state.type === IChatToolInvocation.StateKind.Streaming ? void 0 : state.parameters;
    const parameterCommand = parameters?.["command"] ?? parameters?.["input"];
    command4 = typeof parameterCommand === "string" ? parameterCommand : void 0;
  }
  return command4?.trim() || void 0;
}

function pendingToolSemanticKey(requestId, invocation) {
  const state = invocation.state.get();
  if (!isPendingToolState(state) || !invocation.toolCallId) {
    return void 0;
  }
  const phase = state.type === IChatToolInvocation.StateKind.WaitingForPostApproval ? "post" : state.type === IChatToolInvocation.StateKind.WaitingForAuthentication ? "authentication" : "pre";
  const command4 = getVoiceToolApprovalCommand(invocation) ?? "";
  const authenticationResource = state.type === IChatToolInvocation.StateKind.WaitingForAuthentication ? state.server.resource : "";
  return JSON.stringify([requestId, invocation.toolCallId, phase, command4, authenticationResource]);
}

function releasePendingToolParticipant(invocation, occurrence) {
  occurrence.participants.get(invocation)?.dispose();
}

function pendingToolOccurrenceId(occurrence) {
  return `${occurrence.requestId}#${occurrence.token}`;
}

function pruneResolvedPendingToolOccurrences() {
  while (resolvedPendingToolOccurrences.size > MAX_RESOLVED_PENDING_TOOL_OCCURRENCES) {
    const oldest = resolvedPendingToolOccurrences.entries().next().value;
    if (!oldest) {
      return;
    }
    const [semanticKey, occurrence] = oldest;
    resolvedPendingToolOccurrences.delete(semanticKey);
    if (occurrence.participants.size === 0 && pendingToolOccurrenceById.get(pendingToolOccurrenceId(occurrence)) === occurrence) {
      pendingToolOccurrenceById.delete(pendingToolOccurrenceId(occurrence));
    }
  }
}

function resolvePendingToolOccurrence(occurrence) {
  if (occurrence.resolved) {
    return;
  }
  occurrence.resolved = true;
  if (activePendingToolOccurrences.get(occurrence.semanticKey) === occurrence) {
    activePendingToolOccurrences.delete(occurrence.semanticKey);
  }
  resolvedPendingToolOccurrences.delete(occurrence.semanticKey);
  resolvedPendingToolOccurrences.set(occurrence.semanticKey, occurrence);
  pruneResolvedPendingToolOccurrences();
  pendingToolResolutionVersion.set(pendingToolResolutionVersion.get() + 1, void 0);
}

function pendingToolOccurrence(requestId, invocation, mint, store, restoreResolved = false) {
  const semanticKey = pendingToolSemanticKey(requestId, invocation);
  const current = pendingToolOccurrenceByPart.get(invocation);
  if (!semanticKey) {
    if (current) {
      releasePendingToolParticipant(invocation, current);
    }
    return void 0;
  }
  if (current?.semanticKey === semanticKey) {
    return current;
  }
  if (current) {
    resolvePendingToolOccurrence(current);
    releasePendingToolParticipant(invocation, current);
  }
  let occurrence = activePendingToolOccurrences.get(semanticKey);
  if (!occurrence && restoreResolved) {
    occurrence = resolvedPendingToolOccurrences.get(semanticKey);
  }
  if (!occurrence) {
    if (!mint) {
      return void 0;
    }
    occurrence = {
      requestId,
      semanticKey,
      token: `t${Date.now().toString(36)}-${++pendingOccurrenceCounter}`,
      participants: /* @__PURE__ */ new Map(),
      resolved: false
    };
    activePendingToolOccurrences.set(semanticKey, occurrence);
    pendingToolOccurrenceById.set(pendingToolOccurrenceId(occurrence), occurrence);
  }
  pendingToolOccurrenceByPart.set(invocation, occurrence);
  const trackedOccurrence = occurrence;
  const observer = new MutableDisposable();
  const tracking = toDisposable(() => {
    if (pendingToolOccurrenceByPart.get(invocation) === trackedOccurrence) {
      pendingToolOccurrenceByPart.delete(invocation);
    }
    store?.deleteAndLeak(tracking);
    if (trackedOccurrence.participants.get(invocation) === tracking) {
      trackedOccurrence.participants.delete(invocation);
    }
    if (trackedOccurrence.participants.size === 0 && activePendingToolOccurrences.get(trackedOccurrence.semanticKey) === trackedOccurrence) {
      activePendingToolOccurrences.delete(trackedOccurrence.semanticKey);
    }
    if (trackedOccurrence.participants.size === 0 && (!trackedOccurrence.resolved || resolvedPendingToolOccurrences.get(trackedOccurrence.semanticKey) !== trackedOccurrence) && pendingToolOccurrenceById.get(pendingToolOccurrenceId(trackedOccurrence)) === trackedOccurrence) {
      pendingToolOccurrenceById.delete(pendingToolOccurrenceId(trackedOccurrence));
    }
    observer.dispose();
  });
  observer.value = autorun((reader) => {
    if (!isPendingToolState(invocation.state.read(reader))) {
      resolvePendingToolOccurrence(trackedOccurrence);
      tracking.dispose();
    }
  });
  occurrence.participants.set(invocation, tracking);
  store?.add(tracking);
  return occurrence;
}

function fallbackPendingOccurrenceIdentity(part) {
  const invocation = part;
  if (invocation.kind !== "toolInvocation" || !invocation.state) {
    return part;
  }
  const state = invocation.state.get();
  if (state.type === IChatToolInvocation.StateKind.WaitingForConfirmation || state.type === IChatToolInvocation.StateKind.WaitingForPostApproval) {
    return typeof state.confirm === "function" ? state.confirm : part;
  }
  if (state.type === IChatToolInvocation.StateKind.WaitingForAuthentication) {
    return typeof state.cancel === "function" ? state.cancel : part;
  }
  return part;
}

function derivePendingId(requestId, part, store) {
  const invocation = part;
  if (invocation.kind === "toolInvocation" && invocation.state) {
    const occurrence = pendingToolOccurrence(requestId, invocation, true, store);
    if (occurrence) {
      return `${requestId}#${occurrence.token}`;
    }
  }
  const fallbackIdentity = fallbackPendingOccurrenceIdentity(part);
  let token = pendingOccurrenceTokens.get(fallbackIdentity);
  if (token === void 0) {
    token = `p${++pendingOccurrenceCounter}`;
    pendingOccurrenceTokens.set(fallbackIdentity, token);
  }
  return `${requestId}#${token}`;
}

function markPendingIdResolved(pendingId) {
  const occurrence = pendingToolOccurrenceById.get(pendingId);
  if (!occurrence) {
    return false;
  }
  resolvePendingToolOccurrence(occurrence);
  return true;
}

function isPendingIdResolved(pendingId, reader) {
  pendingToolResolutionVersion.read(reader);
  return pendingToolOccurrenceById.get(pendingId)?.resolved === true;
}

function restoreResolvedPendingId(requestId, part, store) {
  const invocation = part;
  if (invocation.kind !== "toolInvocation" || !invocation.state) {
    return void 0;
  }
  const occurrence = pendingToolOccurrence(requestId, invocation, false, store, true);
  return occurrence?.resolved ? pendingToolOccurrenceId(occurrence) : void 0;
}

function peekPendingId(requestId, part) {
  const invocation = part;
  if (invocation.kind === "toolInvocation" && invocation.state) {
    const occurrence = pendingToolOccurrence(requestId, invocation, false);
    if (occurrence && !occurrence.resolved) {
      return `${requestId}#${occurrence.token}`;
    }
  }
  const token = pendingOccurrenceTokens.get(fallbackPendingOccurrenceIdentity(part));
  return token === void 0 ? void 0 : `${requestId}#${token}`;
}

function isVoiceCheckpointId(value2) {
  return value2 === "investigating" || value2 === "planning" || value2 === "editing" || value2 === "validating" || value2 === "recovering";
}

var IVoiceClientService = createDecorator("voiceClientService");

var VOICE_AGENT_PROGRESS_SETTING = "agents.voice.agentProgress";
export { normalizeAgentsVoiceId, isPendingToolState, getVoiceToolApprovalCommand, pendingToolSemanticKey, releasePendingToolParticipant, pendingToolOccurrenceId, pruneResolvedPendingToolOccurrences, resolvePendingToolOccurrence, pendingToolOccurrence, fallbackPendingOccurrenceIdentity, derivePendingId, markPendingIdResolved, isPendingIdResolved, restoreResolvedPendingId, peekPendingId, isVoiceCheckpointId, pendingOccurrenceTokens, pendingOccurrenceCounter, activePendingToolOccurrences, resolvedPendingToolOccurrences, pendingToolOccurrenceByPart, pendingToolOccurrenceById, pendingToolResolutionVersion, MAX_RESOLVED_PENDING_TOOL_OCCURRENCES, IVoiceClientService, VOICE_AGENT_PROGRESS_SETTING };
