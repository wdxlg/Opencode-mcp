// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/telemetry/common/assignmentContext.ts



// src/vs/platform/telemetry/common/assignmentContext.ts
var MAX_ASSIGNMENT_CONTEXT_LENGTH = 8 * 1024;

var ASSIGNMENT_CONTEXT_ENTRY_PATTERN = /^[^:;\s\x00-\x1F\x7F]+:[^;\x00-\x1F\x7F]+$/;

function isValidAssignmentContext(value2) {
  if (value2.length === 0 || value2.length > MAX_ASSIGNMENT_CONTEXT_LENGTH) {
    return false;
  }
  const entries2 = value2.endsWith(";") ? value2.slice(0, -1).split(";") : value2.split(";");
  return entries2.length > 0 && entries2.every((entry) => ASSIGNMENT_CONTEXT_ENTRY_PATTERN.test(entry));
}
export { isValidAssignmentContext, MAX_ASSIGNMENT_CONTEXT_LENGTH, ASSIGNMENT_CONTEXT_ENTRY_PATTERN };
