// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatService/chatService.ts
import { URI } from "./module-0032.mjs";
import { Range2 } from "./module-0106.mjs";
import { localize } from "./module-0001.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { autorun, autorunSelfDisposable } from "./module-0052.mjs";
import { hasKey } from "./module-0010.mjs";
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/common/chatService/chatService.ts
function isIDocumentContext(obj) {
  return !!obj && typeof obj === "object" && "uri" in obj && obj.uri instanceof URI && "version" in obj && typeof obj.version === "number" && "ranges" in obj && Array.isArray(obj.ranges) && obj.ranges.every(Range2.isIRange);
}

function isIUsedContext(obj) {
  return !!obj && typeof obj === "object" && "documents" in obj && Array.isArray(obj.documents) && obj.documents.every(isIDocumentContext);
}

function formatCopilotCredits(credits) {
  return parseFloat(credits.toFixed(1)).toString();
}

function formatCopilotCreditsLabel(credits) {
  const formatted = formatCopilotCredits(credits);
  return formatted === "1" ? localize(12932, null, formatted) : localize(12933, null, formatted);
}

function isLegacyChatTerminalToolInvocationData(data) {
  return !!data && typeof data === "object" && "command" in data && "language" in data;
}

var IChatToolInvocation;

((IChatToolInvocation4) => {
  let StateKind;
  ((StateKind2) => {
    StateKind2[StateKind2["Streaming"] = 0] = "Streaming";
    StateKind2[StateKind2["WaitingForConfirmation"] = 1] = "WaitingForConfirmation";
    StateKind2[StateKind2["Executing"] = 2] = "Executing";
    StateKind2[StateKind2["WaitingForPostApproval"] = 3] = "WaitingForPostApproval";
    StateKind2[StateKind2["Completed"] = 4] = "Completed";
    StateKind2[StateKind2["Cancelled"] = 5] = "Cancelled";
    StateKind2[StateKind2["WaitingForAuthentication"] = 6] = "WaitingForAuthentication";
  })(StateKind = IChatToolInvocation4.StateKind || (IChatToolInvocation4.StateKind = {}));
  function executionConfirmedOrDenied(invocation, reader) {
    if (invocation.kind === "toolInvocationSerialized") {
      if (invocation.isConfirmed === void 0 || typeof invocation.isConfirmed === "boolean") {
        return { type: invocation.isConfirmed ? 4 /* UserAction */ : 0 /* Denied */ };
      }
      return invocation.isConfirmed;
    }
    const state = invocation.state.read(reader);
    if (state.type === 0 /* Streaming */ || state.type === 1 /* WaitingForConfirmation */) {
      return void 0;
    }
    if (state.type === 5 /* Cancelled */) {
      return { type: state.reason };
    }
    return state.confirmed;
  }
  IChatToolInvocation4.executionConfirmedOrDenied = executionConfirmedOrDenied;
  function awaitConfirmation(invocation, token) {
    const reason = executionConfirmedOrDenied(invocation);
    if (reason) {
      return Promise.resolve(reason);
    }
    const store = new DisposableStore();
    return new Promise((resolve3) => {
      if (token) {
        store.add(token.onCancellationRequested(() => {
          resolve3({ type: 0 /* Denied */ });
        }));
      }
      store.add(autorun((reader) => {
        const reason2 = executionConfirmedOrDenied(invocation, reader);
        if (reason2) {
          store.dispose();
          resolve3(reason2);
        }
      }));
    }).finally(() => {
      store.dispose();
    });
  }
  IChatToolInvocation4.awaitConfirmation = awaitConfirmation;
  function postApprovalConfirmedOrDenied(invocation, reader) {
    const state = invocation.state.read(reader);
    if (state.type === 4 /* Completed */) {
      return state.postConfirmed || { type: 1 /* ConfirmationNotNeeded */ };
    }
    if (state.type === 5 /* Cancelled */) {
      return { type: state.reason };
    }
    return void 0;
  }
  function confirmWith(invocation, reason) {
    const state = invocation?.state.get();
    if (state?.type === 1 /* WaitingForConfirmation */ || state?.type === 3 /* WaitingForPostApproval */) {
      state.confirm(reason);
      return true;
    }
    return false;
  }
  IChatToolInvocation4.confirmWith = confirmWith;
  function awaitPostConfirmation(invocation, token) {
    const reason = postApprovalConfirmedOrDenied(invocation);
    if (reason) {
      return Promise.resolve(reason);
    }
    const store = new DisposableStore();
    return new Promise((resolve3) => {
      if (token) {
        store.add(token.onCancellationRequested(() => {
          resolve3({ type: 0 /* Denied */ });
        }));
      }
      store.add(autorun((reader) => {
        const reason2 = postApprovalConfirmedOrDenied(invocation, reader);
        if (reason2) {
          store.dispose();
          resolve3(reason2);
        }
      }));
    }).finally(() => {
      store.dispose();
    });
  }
  IChatToolInvocation4.awaitPostConfirmation = awaitPostConfirmation;
  function resultDetails(invocation, reader) {
    if (invocation.kind === "toolInvocationSerialized") {
      return invocation.resultDetails;
    }
    const state = invocation.state.read(reader);
    if (state.type === 4 /* Completed */ || state.type === 3 /* WaitingForPostApproval */) {
      return state.resultDetails;
    }
    return void 0;
  }
  IChatToolInvocation4.resultDetails = resultDetails;
  function isComplete(invocation, reader) {
    if (invocation.kind === "toolInvocationSerialized") {
      return true;
    }
    const state = invocation.state.read(reader);
    return state.type === 4 /* Completed */ || state.type === 5 /* Cancelled */;
  }
  IChatToolInvocation4.isComplete = isComplete;
  function isEffectivelyHidden(invocation, reader) {
    if (invocation.presentation === "hidden") {
      return true;
    }
    if (invocation.presentation === "hiddenAfterComplete" && isComplete(invocation, reader)) {
      return true;
    }
    return false;
  }
  IChatToolInvocation4.isEffectivelyHidden = isEffectivelyHidden;
  function isStreaming(invocation, reader) {
    if (invocation.kind === "toolInvocationSerialized") {
      return false;
    }
    const state = invocation.state.read(reader);
    return state.type === 0 /* Streaming */;
  }
  IChatToolInvocation4.isStreaming = isStreaming;
  function getParameters(invocation, reader) {
    if (invocation.kind === "toolInvocationSerialized") {
      return void 0;
    }
    const state = invocation.state.read(reader);
    if (state.type === 0 /* Streaming */) {
      return void 0;
    }
    return state.parameters;
  }
  IChatToolInvocation4.getParameters = getParameters;
  function getConfirmationMessages(invocation, reader) {
    if (invocation.kind === "toolInvocationSerialized") {
      return void 0;
    }
    const state = invocation.state.read(reader);
    if (state.type === 0 /* Streaming */) {
      return void 0;
    }
    return state.confirmationMessages;
  }
  IChatToolInvocation4.getConfirmationMessages = getConfirmationMessages;
})(IChatToolInvocation || (IChatToolInvocation = {}));

var ChatMcpServersStarting = class {
  constructor(state) {
    this.state = state;
    this.kind = "mcpServersStarting";
    this.didStartServerIds = [];
  }
  get isEmpty() {
    const s = this.state.get();
    return !s.working && s.serversRequiringInteraction.length === 0;
  }
  wait() {
    return new Promise((resolve3) => {
      autorunSelfDisposable((reader) => {
        const s = this.state.read(reader);
        if (!s.working) {
          reader.dispose();
          resolve3(s);
        }
      });
    });
  }
  toJSON() {
    return { kind: "mcpServersStarting", didStartServerIds: this.didStartServerIds };
  }
};

function isChatFollowup(obj) {
  return !!obj && obj.kind === "reply" && typeof obj.message === "string" && typeof obj.agentId === "string";
}

function convertLegacyChatSessionTiming(timing) {
  if (hasKey(timing, { created: true })) {
    return timing;
  }
  return {
    created: timing.startTime,
    lastRequestStarted: timing.startTime,
    lastRequestEnded: timing.endTime
  };
}

var ChatSendResult;

((ChatSendResult3) => {
  function isSent(result) {
    return result.kind === "sent";
  }
  ChatSendResult3.isSent = isSent;
  function isRejected(result) {
    return result.kind === "rejected";
  }
  ChatSendResult3.isRejected = isRejected;
  function isQueued(result) {
    return result.kind === "queued";
  }
  ChatSendResult3.isQueued = isQueued;
  function assertSent(result) {
    if (result.kind !== "sent") {
      throw new Error(`Expected ChatSendResult to be 'sent', but was '${result.kind}'`);
    }
  }
  ChatSendResult3.assertSent = assertSent;
})(ChatSendResult || (ChatSendResult = {}));

var IChatService = createDecorator("IChatService");

var KEYWORD_ACTIVIATION_SETTING_ID = "accessibility.voice.keywordActivation";

var ChatStopCancellationNoopEventName = "chat.stopCancellationNoop";

var ChatPendingRequestChangeEventName = "chat.pendingRequestChange";
export { isIDocumentContext, isIUsedContext, formatCopilotCredits, formatCopilotCreditsLabel, isLegacyChatTerminalToolInvocationData, isChatFollowup, convertLegacyChatSessionTiming, IChatToolInvocation, ChatMcpServersStarting, ChatSendResult, IChatService, KEYWORD_ACTIVIATION_SETTING_ID, ChatStopCancellationNoopEventName, ChatPendingRequestChangeEventName };
