// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/state/sessionActions.ts



// src/vs/platform/agentHost/common/state/sessionActions.ts
var NotificationType = {
  SessionAdded: "root/sessionAdded",
  SessionRemoved: "root/sessionRemoved",
  SessionSummaryChanged: "root/sessionSummaryChanged",
  Progress: "root/progress",
  AuthRequired: "auth/required"
};

function isSessionAction(action) {
  return action.type.startsWith("session/");
}

function isChatAction(action) {
  return action.type.startsWith("chat/");
}

function isChangesetAction(action) {
  return action.type.startsWith("changeset/");
}

function isAnnotationsAction(action) {
  return action.type.startsWith("annotations/");
}
export { isSessionAction, isChatAction, isChangesetAction, isAnnotationsAction, NotificationType };
