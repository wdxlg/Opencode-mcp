// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostChangesetTelemetry.ts
import { toInitiatorTelemetry } from "./module-0253.mjs";
import { URI } from "./module-0023.mjs";
import { AgentSession } from "./module-0048.mjs";


// src/vs/platform/agentHost/node/agentHostChangesetTelemetry.ts
function reportAgentHostStaticChangesetComputed(telemetryService, session, turnId, data, clientContext) {
  reportChangesetComputed(telemetryService, session, turnId, {
    kind: data.kind,
    outcome: data.outcome,
    durationMs: data.durationMs,
    isMultiRoot: data.isMultiRoot,
    folderCount: data.folderCount,
    ...data.fileCount !== void 0 ? { fileCount: data.fileCount } : {},
    ...data.incrementalUsed !== void 0 ? { incrementalUsed: data.incrementalUsed } : {},
    ...data.usedEditTrackerFallback !== void 0 ? { usedEditTrackerFallback: data.usedEditTrackerFallback } : {}
  }, clientContext);
}

function reportAgentHostTurnChangesetComputed(telemetryService, session, turnId, data, clientContext) {
  reportChangesetComputed(telemetryService, session, turnId, {
    kind: "turn",
    outcome: data.outcome,
    durationMs: data.durationMs,
    isMultiRoot: data.isMultiRoot,
    folderCount: data.folderCount,
    ...data.fileCount !== void 0 ? { fileCount: data.fileCount } : {},
    ...data.multiRoot ? {
      uniqueGitFolderCount: data.multiRoot.uniqueGitFolderCount,
      nonGitFolderCount: data.multiRoot.nonGitFolderCount,
      trackedEditFallbackFolderCount: data.multiRoot.trackedEditFallbackFolderCount
    } : {}
  }, clientContext);
}

function reportChangesetComputed(telemetryService, session, turnId, fields, clientContext) {
  telemetryService.publicLog2("agentHost.changesetComputed", {
    ...toInitiatorTelemetry(clientContext),
    provider: URI.parse(session).scheme,
    agentSessionId: AgentSession.id(session),
    ...turnId !== void 0 ? { turnId } : {},
    ...fields
  });
}
export { reportAgentHostStaticChangesetComputed, reportAgentHostTurnChangesetComputed, reportChangesetComputed };
