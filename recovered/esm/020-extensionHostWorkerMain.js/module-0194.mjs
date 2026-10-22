// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/agentHost/common/state/sessionState.ts



// src/vs/platform/agentHost/common/state/sessionState.ts
function customizationId(uri2, range) {
  if (!range) {
    return uri2;
  }
  const safeUri = uri2.replace(/#/g, "%23");
  return `${safeUri}#range=${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`;
}

var SUBAGENT_URI_SEGMENT = "subagent";

var SUBAGENT_URI_MARKER = `/${SUBAGENT_URI_SEGMENT}/`;

var STATUS_ACTIVITY_MASK = (1 << 5) - 1;
export { customizationId, SUBAGENT_URI_SEGMENT, SUBAGENT_URI_MARKER, STATUS_ACTIVITY_MASK };
