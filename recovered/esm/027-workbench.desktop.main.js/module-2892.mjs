// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/changesetUri.ts



// src/vs/platform/agentHost/common/changesetUri.ts
var TURN_CHANGESET_PREFIX = "turn/";

var CHANGESET_PATH_SEGMENT = "/changeset/";

function buildTurnChangesetUri(sessionUri, turnId) {
  if (!turnId || turnId.includes("/")) {
    throw new Error(`buildTurnChangesetUri: turnId must be non-empty and not contain '/' (got ${JSON.stringify(turnId)})`);
  }
  return `${sessionUri}${CHANGESET_PATH_SEGMENT}${TURN_CHANGESET_PREFIX}${turnId}`;
}
export { buildTurnChangesetUri, TURN_CHANGESET_PREFIX, CHANGESET_PATH_SEGMENT };
