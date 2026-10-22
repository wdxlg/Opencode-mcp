// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/telemetry/common/assignmentContext.ts



// src/vs/platform/telemetry/common/assignmentContext.ts
var MAX_ASSIGNMENT_CONTEXT_LENGTH = 8 * 1024;

var ASSIGNMENT_CONTEXT_ENTRY_PATTERN = /^[^:;\s\x00-\x1F\x7F]+:[^;\x00-\x1F\x7F]+$/;

function isValidAssignmentContext(value) {
  if (value.length === 0 || value.length > MAX_ASSIGNMENT_CONTEXT_LENGTH) {
    return false;
  }
  const entries = value.endsWith(";") ? value.slice(0, -1).split(";") : value.split(";");
  return entries.length > 0 && entries.every((entry) => ASSIGNMENT_CONTEXT_ENTRY_PATTERN.test(entry));
}
export { isValidAssignmentContext, MAX_ASSIGNMENT_CONTEXT_LENGTH, ASSIGNMENT_CONTEXT_ENTRY_PATTERN };
