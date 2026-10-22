// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentSdkDownloadTelemetry.ts



// src/vs/platform/agentHost/node/agentSdkDownloadTelemetry.ts
var FAILURE_HINTS = [
  ["notConfigured", ["no `product.agentSdks", "unknown placeholder"]],
  ["unsupportedTarget", ["no SDK target for this host"]],
  ["filesystem", ["ENOSPC", "EACCES", "EPERM", "EROFS", "EBUSY", "EMFILE", "ENAMETOOLONG", "EXDEV"]],
  ["network", ["HTTP ", "ENOTFOUND", "EAI_AGAIN", "ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EPROTO", "ECONNABORTED", "socket hang up", "certificate", "tunneling socket", "getaddrinfo"]],
  ["extract", ["TAR_", "zlib", "gzip", "unexpected end of file", "incorrect header check", "invalid entry"]]
];

function classifyAgentSdkDownloadFailure(error) {
  if (!error) {
    return "unknown";
  }
  if (error === "cancelled") {
    return "cancelled";
  }
  const haystack = error.toLowerCase();
  for (const [reason, hints] of FAILURE_HINTS) {
    if (hints.some((hint) => haystack.includes(hint.toLowerCase()))) {
      return reason;
    }
  }
  return "unknown";
}

function reportAgentSdkDownload(telemetryService, logService, progress, durationMs) {
  const failureReason = progress.phase === "failed" ? classifyAgentSdkDownloadFailure(progress.error) : "";
  telemetryService.publicLog2("agentHost.agentSdkDownload", {
    packageId: progress.packageId,
    phase: progress.phase,
    failureReason,
    explicitlyRequested: progress.explicitlyRequested,
    durationMs,
    receivedBytes: progress.receivedBytes,
    totalBytes: progress.totalBytes ?? 0
  });
  logService.info(
    `[AgentSdkDownloader] ${progress.packageId}: ${progress.phase} (explicit=${progress.explicitlyRequested}, bytes=${progress.receivedBytes}/${progress.totalBytes ?? "unknown"}, ms=${durationMs}${failureReason ? `, reason=${failureReason}` : ""})`
  );
}
export { classifyAgentSdkDownloadFailure, reportAgentSdkDownload, FAILURE_HINTS };
