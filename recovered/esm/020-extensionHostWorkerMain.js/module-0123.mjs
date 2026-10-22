// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatService/chatService.ts
import { URI } from "./module-0023.mjs";
import { Range } from "./module-0084.mjs";
import { DisposableStore } from "./module-0011.mjs";
import { autorun } from "./module-0108.mjs";
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/contrib/chat/common/chatService/chatService.ts
function isIDocumentContext(obj) {
  return !!obj && typeof obj === "object" && "uri" in obj && obj.uri instanceof URI && "version" in obj && typeof obj.version === "number" && "ranges" in obj && Array.isArray(obj.ranges) && obj.ranges.every(Range.isIRange);
}

function isIUsedContext(obj) {
  return !!obj && typeof obj === "object" && "documents" in obj && Array.isArray(obj.documents) && obj.documents.every(isIDocumentContext);
}

function isLegacyChatTerminalToolInvocationData(data2) {
  return !!data2 && typeof data2 === "object" && "command" in data2 && "language" in data2;
}

var IChatToolInvocation;

((IChatToolInvocation2) => {
  let StateKind;
  ((StateKind2) => {
    StateKind2[StateKind2["Streaming"] = 0] = "Streaming";
    StateKind2[StateKind2["WaitingForConfirmation"] = 1] = "WaitingForConfirmation";
    StateKind2[StateKind2["Executing"] = 2] = "Executing";
    StateKind2[StateKind2["WaitingForPostApproval"] = 3] = "WaitingForPostApproval";
    StateKind2[StateKind2["Completed"] = 4] = "Completed";
    StateKind2[StateKind2["Cancelled"] = 5] = "Cancelled";
    StateKind2[StateKind2["WaitingForAuthentication"] = 6] = "WaitingForAuthentication";
  })(StateKind = IChatToolInvocation2.StateKind || (IChatToolInvocation2.StateKind = {}));
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
  IChatToolInvocation2.executionConfirmedOrDenied = executionConfirmedOrDenied;
  function awaitConfirmation(invocation, token) {
    const reason = executionConfirmedOrDenied(invocation);
    if (reason) {
      return Promise.resolve(reason);
    }
    const store = new DisposableStore();
    return new Promise((resolve2) => {
      if (token) {
        store.add(token.onCancellationRequested(() => {
          resolve2({ type: 0 /* Denied */ });
        }));
      }
      store.add(autorun((reader) => {
        const reason2 = executionConfirmedOrDenied(invocation, reader);
        if (reason2) {
          store.dispose();
          resolve2(reason2);
        }
      }));
    }).finally(() => {
      store.dispose();
    });
  }
  IChatToolInvocation2.awaitConfirmation = awaitConfirmation;
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
  IChatToolInvocation2.confirmWith = confirmWith;
  function awaitPostConfirmation(invocation, token) {
    const reason = postApprovalConfirmedOrDenied(invocation);
    if (reason) {
      return Promise.resolve(reason);
    }
    const store = new DisposableStore();
    return new Promise((resolve2) => {
      if (token) {
        store.add(token.onCancellationRequested(() => {
          resolve2({ type: 0 /* Denied */ });
        }));
      }
      store.add(autorun((reader) => {
        const reason2 = postApprovalConfirmedOrDenied(invocation, reader);
        if (reason2) {
          store.dispose();
          resolve2(reason2);
        }
      }));
    }).finally(() => {
      store.dispose();
    });
  }
  IChatToolInvocation2.awaitPostConfirmation = awaitPostConfirmation;
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
  IChatToolInvocation2.resultDetails = resultDetails;
  function isComplete(invocation, reader) {
    if (invocation.kind === "toolInvocationSerialized") {
      return true;
    }
    const state = invocation.state.read(reader);
    return state.type === 4 /* Completed */ || state.type === 5 /* Cancelled */;
  }
  IChatToolInvocation2.isComplete = isComplete;
  function isEffectivelyHidden(invocation, reader) {
    if (invocation.presentation === "hidden") {
      return true;
    }
    if (invocation.presentation === "hiddenAfterComplete" && isComplete(invocation, reader)) {
      return true;
    }
    return false;
  }
  IChatToolInvocation2.isEffectivelyHidden = isEffectivelyHidden;
  function isStreaming(invocation, reader) {
    if (invocation.kind === "toolInvocationSerialized") {
      return false;
    }
    const state = invocation.state.read(reader);
    return state.type === 0 /* Streaming */;
  }
  IChatToolInvocation2.isStreaming = isStreaming;
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
  IChatToolInvocation2.getParameters = getParameters;
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
  IChatToolInvocation2.getConfirmationMessages = getConfirmationMessages;
})(IChatToolInvocation || (IChatToolInvocation = {}));

var ChatSendResult;

((ChatSendResult2) => {
  function isSent(result) {
    return result.kind === "sent";
  }
  ChatSendResult2.isSent = isSent;
  function isRejected(result) {
    return result.kind === "rejected";
  }
  ChatSendResult2.isRejected = isRejected;
  function isQueued(result) {
    return result.kind === "queued";
  }
  ChatSendResult2.isQueued = isQueued;
  function assertSent(result) {
    if (result.kind !== "sent") {
      throw new Error(`Expected ChatSendResult to be 'sent', but was '${result.kind}'`);
    }
  }
  ChatSendResult2.assertSent = assertSent;
})(ChatSendResult || (ChatSendResult = {}));

var IChatService = createDecorator("IChatService");
export { isIDocumentContext, isIUsedContext, isLegacyChatTerminalToolInvocationData, IChatToolInvocation, ChatSendResult, IChatService };
