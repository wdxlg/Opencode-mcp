// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/common/sessionsTelemetry.ts
import { LOCAL_AGENT_HOST_PROVIDER_ID, REMOTE_AGENT_HOST_PROVIDER_PREFIX } from "./module-1764.mjs";
import { StringSHA1 } from "./module-0039.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { isSSHHostKeyDeniedError } from "./module-1779.mjs";
import { RemoteAgentHostConnectionStatus } from "./module-1736.mjs";
import { PROTOCOL_VERSION } from "./module-1780.mjs";


// src/vs/sessions/common/sessionsTelemetry.ts
function getSessionsTelemetryProviderId(providerId) {
  if (providerId === "default-copilot" || providerId === LOCAL_AGENT_HOST_PROVIDER_ID) {
    return providerId;
  }
  if (providerId === "remote-agent-host" || providerId.startsWith(REMOTE_AGENT_HOST_PROVIDER_PREFIX)) {
    return "remote-agent-host";
  }
  return "other";
}

function hashSessionIdForTelemetry(sessionId) {
  const sha1 = new StringSHA1();
  sha1.update(sessionId);
  return sha1.digest();
}

function logSessionsInteraction(telemetryService, button, source) {
  telemetryService.publicLog2("vscodeAgents.interaction", source ? { button, source } : { button });
}

function logSidePanelToggle(telemetryService, visible) {
  telemetryService.publicLog2("vscodeAgents.layout/toggleSidePanel", { visible });
}

function logChangesViewVersionModeChange(telemetryService, mode) {
  telemetryService.publicLog2("vscodeAgents.changesView/versionModeChange", { mode });
}

function logChangesViewFileSelect(telemetryService, changeType) {
  telemetryService.publicLog2("vscodeAgents.changesView/fileSelect", { changeType });
}

function logChangesViewViewModeChange(telemetryService, mode) {
  telemetryService.publicLog2("vscodeAgents.changesView/viewModeChange", { mode });
}

function classifySessionWorkspaceTopology(folderCount, gitFolderCount) {
  return {
    folderCount,
    gitFolderCount,
    nonGitFolderCount: folderCount - gitFolderCount,
    isMultiRoot: folderCount > 1
  };
}

function logTunnelDiscoveryResult(telemetryService, data) {
  telemetryService.publicLog2("vscodeAgents.tunnelDiscovery/result", {
    trigger: data.trigger,
    totalFound: data.totalFound,
    withActiveHost: data.withActiveHost,
    cachedBefore: data.cachedBefore,
    autoConnectEnabled: data.autoConnectEnabled,
    hostsEnabled: data.hostsEnabled,
    success: data.success
  });
}

function logTunnelConnectAttempt(telemetryService, data) {
  telemetryService.publicLog2("vscodeAgents.tunnelConnect/attempt", {
    isReconnect: data.isReconnect,
    attempt: data.attempt,
    durationMs: data.durationMs,
    success: data.success,
    errorCategory: data.errorCategory ?? ""
  });
}

function logTunnelConnectResolved(telemetryService, data) {
  telemetryService.publicLog2("vscodeAgents.tunnelConnect/resolved", {
    isReconnect: data.isReconnect,
    totalAttempts: data.totalAttempts,
    totalDurationMs: data.totalDurationMs,
    success: data.success,
    failureReason: data.failureReason ?? ""
  });
}

function categorizeSSHConnectError(err) {
  if (isCancellationError(err)) {
    return "cancelled";
  }
  if (isSSHHostKeyDeniedError(err)) {
    return "hostKeyDenied";
  }
  if (RemoteAgentHostConnectionStatus.fromConnectError(err, [PROTOCOL_VERSION])) {
    return "incompatible";
  }
  const message = err instanceof Error ? err.message : String(err);
  if (/authenticat|permission denied|no supported authentication methods|all configured authentication methods failed/i.test(message)) {
    return "authentication";
  }
  if (/ECONN|ENETUNREACH|EHOSTUNREACH|ENOTFOUND|ETIMEDOUT|network|handshake.*timed out|closed before the handshake completed/i.test(message)) {
    return "network";
  }
  return "other";
}

function logSSHConnectAttempt(telemetryService, data) {
  telemetryService.publicLog2("vscodeAgents.sshConnect/attempt", {
    ...data,
    errorCategory: data.errorCategory ?? ""
  });
}

function logTerminalRecovery(telemetryService, data) {
  telemetryService.publicLog2("vscodeAgents.terminal/recovery", data);
}
export { getSessionsTelemetryProviderId, hashSessionIdForTelemetry, logSessionsInteraction, logSidePanelToggle, logChangesViewVersionModeChange, logChangesViewFileSelect, logChangesViewViewModeChange, classifySessionWorkspaceTopology, logTunnelDiscoveryResult, logTunnelConnectAttempt, logTunnelConnectResolved, categorizeSSHConnectError, logSSHConnectAttempt, logTerminalRecovery };
