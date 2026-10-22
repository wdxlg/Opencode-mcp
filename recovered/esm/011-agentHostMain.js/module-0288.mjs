// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotFailureTelemetry.ts
import { toInitiatorTelemetry } from "./module-0253.mjs";
import { AgentSession } from "./module-0048.mjs";
import { getTelemetryChatSessionId } from "./module-0248.mjs";
import { packErrorForTelemetry } from "./module-0287.mjs";
import { getErrorCode } from "./module-0002.mjs";


// src/vs/platform/agentHost/node/copilot/copilotFailureTelemetry.ts
var CopilotClientStartupConfigChangedError = class extends Error {
  constructor() {
    super("Copilot startup config changed while the client was starting");
    this.name = "CopilotClientStartupConfigChangedError";
  }
};

var normalizedCopilotApiEndpointKinds = /* @__PURE__ */ new Map([
  ["/chat/completions", "chatCompletions"],
  ["/responses", "responses"],
  ["/v1/messages", "anthropicMessages"],
  ["ws:/responses", "responsesWebSocket"]
]);

function normalizeCopilotApiEndpoint(endpoint) {
  if (!endpoint) {
    return void 0;
  }
  const trimmedEndpoint = endpoint.trim();
  const directMatch = normalizedCopilotApiEndpointKinds.get(trimmedEndpoint.toLowerCase());
  if (directMatch) {
    return directMatch;
  }
  if (URL.canParse(trimmedEndpoint)) {
    const parsed = new URL(trimmedEndpoint);
    const normalizedPath = parsed.pathname.replace(/\/+$/, "") || "/";
    if ((parsed.protocol === "ws:" || parsed.protocol === "wss:") && normalizedPath === "/responses") {
      return "responsesWebSocket";
    }
    return normalizedCopilotApiEndpointKinds.get(normalizedPath.toLowerCase()) ?? "other";
  }
  return "other";
}

function createCopilotFailureCorrelation(sessionUri, chatUri, turnId, sdkSessionId, clientContext) {
  return {
    ...toInitiatorTelemetry(clientContext),
    agentSessionId: AgentSession.id(sessionUri),
    chatSessionId: getTelemetryChatSessionId(chatUri),
    turnId: turnId || void 0,
    sdkSessionId
  };
}

function classifyCopilotClientOperationFailure(error) {
  if (!(error instanceof Error)) {
    return void 0;
  }
  switch (error.message) {
    case "Client not connected":
      return "clientNotConnected";
    case "Connection is closed.":
      return "connectionClosed";
    case "Connection is disposed.":
      return "connectionDisposed";
    case "The in-process runtime connection is closed.":
      return "runtimeConnectionClosed";
  }
  return void 0;
}

function isRecognizedCopilotClientStartupFailure(error) {
  return error instanceof Error && getCopilotStartupFailureCause(error) !== void 0;
}

function getCopilotStartupFailureCause(error) {
  if (error instanceof CopilotClientStartupConfigChangedError) {
    return "configurationChanged";
  }
  const message = error.message;
  const normalizedMessage = message.toLowerCase();
  if (normalizedMessage.includes("specified procedure could not be found")) {
    return "nativeModuleProcedureNotFound";
  }
  if (normalizedMessage.includes("dynamic link library") && normalizedMessage.includes("initialization")) {
    return "nativeModuleInitializationFailed";
  }
  if (normalizedMessage.includes("permission denied") || /\b(?:eacces|eperm)\b/.test(normalizedMessage)) {
    return "permissionDenied";
  }
  if (normalizedMessage.includes("cannot find module")) {
    return "nativeModuleNotFound";
  }
  if (message === "Timeout waiting for CLI server to start") {
    return "timeout";
  }
  if (message.startsWith("Failed to start CLI server:")) {
    return "spawnFailed";
  }
  if (message.startsWith("CLI server exited unexpectedly with code ")) {
    return "processExitedUnexpectedly";
  }
  if (message.startsWith("CLI server exited with code ")) {
    return "processExited";
  }
  return void 0;
}

function getCopilotStartupFailureResource(message) {
  const normalizedMessage = message.toLowerCase();
  if (normalizedMessage.includes("cli-native")) {
    return "cliNative";
  }
  if (normalizedMessage.includes("conpty")) {
    return "conpty";
  }
  if (normalizedMessage.includes("runtime.node") || normalizedMessage.includes("runtime.win32") || normalizedMessage.includes('native addon "runtime"')) {
    return "runtime";
  }
  if (normalizedMessage.includes("sandbox") || normalizedMessage.includes("lxc-exec") || normalizedMessage.includes("mxc-exec-mac") || normalizedMessage.includes("wxc-exec.exe")) {
    return "sandbox";
  }
  return "other";
}

function getCopilotStartupFailureDetails(error) {
  if (!(error instanceof Error)) {
    return {};
  }
  const startupFailureCause = getCopilotStartupFailureCause(error);
  if (!startupFailureCause) {
    return {};
  }
  const message = error.message;
  const exitCodeMatch = /^CLI server exited(?: unexpectedly)? with code (?<exitCode>\d+)/.exec(message);
  const parsedExitCode = exitCodeMatch?.groups?.exitCode === void 0 ? void 0 : Number(exitCodeMatch.groups.exitCode);
  return {
    startupFailureCause,
    startupFailureResource: getCopilotStartupFailureResource(message),
    startupExitCode: parsedExitCode !== void 0 && Number.isSafeInteger(parsedExitCode) ? parsedExitCode : void 0
  };
}

function reportCopilotClientStartup(telemetryService, data, error) {
  let failureDetails = {};
  if (data.outcome === "failure") {
    failureDetails = getCopilotStartupFailureDetails(error);
    if (!failureDetails.startupFailureCause) {
      failureDetails = {
        startupFailureCause: "other",
        startupFailureResource: "other"
      };
    }
  }
  telemetryService.publicLog2("agentHost.copilotClientStartup", {
    ...data,
    ...failureDetails
  });
}

function reportCopilotClientOperationFailure(telemetryService, clientFailureId, failureKind, operation, activeTurnCount, recoveryStarted, error, correlation) {
  const packed = packErrorForTelemetry(error);
  telemetryService.publicLogError2("agentHost.copilotClientFailure", {
    clientFailureId,
    failureKind,
    operation,
    ...correlation,
    activeTurnCount,
    recoveryStarted,
    errorName: error instanceof Error ? error.name : void 0,
    errorCode: getErrorCode(error),
    msg: packed.msg,
    callstack: packed.callstack
  });
}

function reportCopilotClientRecovery(telemetryService, event) {
  telemetryService.publicLog2("agentHost.copilotClientRecovery", event);
}

function reportCopilotClientRecoveryTurn(telemetryService, clientFailureId, correlation) {
  telemetryService.publicLogError2("agentHost.copilotClientRecoveryTurnFailed", {
    clientFailureId,
    ...correlation
  });
}

function reportCopilotSdkSessionError(telemetryService, event, correlation) {
  telemetryService.publicLogError2("agentHost.copilotSdkSessionError", {
    ...correlation,
    sdkEventId: event.id,
    sdkParentEventId: event.parentId ?? void 0,
    sdkAgentId: event.agentId,
    errorType: event.data.errorType,
    errorCode: event.data.errorCode,
    statusCode: event.data.statusCode,
    providerCallId: event.data.providerCallId,
    serviceRequestId: event.data.serviceRequestId,
    eligibleForAutoSwitch: event.data.eligibleForAutoSwitch,
    msg: event.data.message,
    callstack: event.data.stack
  });
}

function reportCopilotModelCallFailure(telemetryService, event, correlation) {
  const fingerprint = event.data.requestFingerprint;
  telemetryService.publicLogError2("agentHost.copilotModelCallFailure", {
    ...correlation,
    sdkEventId: event.id,
    sdkParentEventId: event.parentId ?? void 0,
    sdkAgentId: event.agentId,
    failureKind: event.data.failureKind,
    source: event.data.source,
    transport: event.data.transport,
    apiEndpoint: normalizeCopilotApiEndpoint(event.data.apiEndpoint),
    statusCode: event.data.statusCode,
    durationMs: event.data.durationMs,
    model: event.data.isByok ? "byokModel" : event.data.model,
    reasoningEffort: event.data.reasoningEffort,
    isAuto: event.data.isAuto,
    isByok: event.data.isByok,
    rte: event.data.rte,
    badRequestKind: event.data.badRequestKind,
    apiCallId: event.data.apiCallId,
    providerCallId: event.data.providerCallId,
    serviceRequestId: event.data.serviceRequestId,
    messageCount: fingerprint?.messageCount,
    toolCallCount: fingerprint?.toolCallCount,
    toolResultMessageCount: fingerprint?.toolResultMessageCount,
    namelessToolCallCount: fingerprint?.namelessToolCallCount,
    imagePartCount: fingerprint?.imagePartCount,
    imagePartsMissingMediaType: fingerprint?.imagePartsMissingMediaType
  });
}
export { normalizeCopilotApiEndpoint, createCopilotFailureCorrelation, classifyCopilotClientOperationFailure, isRecognizedCopilotClientStartupFailure, getCopilotStartupFailureCause, getCopilotStartupFailureResource, getCopilotStartupFailureDetails, reportCopilotClientStartup, reportCopilotClientOperationFailure, reportCopilotClientRecovery, reportCopilotClientRecoveryTurn, reportCopilotSdkSessionError, reportCopilotModelCallFailure, CopilotClientStartupConfigChangedError, normalizedCopilotApiEndpointKinds };
