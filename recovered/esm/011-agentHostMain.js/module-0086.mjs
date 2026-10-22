// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/state/sessionActions.ts



// src/vs/platform/agentHost/common/state/sessionActions.ts
function isRootAction(action) {
  return action.type.startsWith("root/");
}

function isSessionAction(action) {
  return action.type.startsWith("session/");
}

function isChatAction(action) {
  return action.type.startsWith("chat/");
}

function isTerminalAction(action) {
  return action.type.startsWith("terminal/");
}

function isChangesetAction(action) {
  return action.type.startsWith("changeset/");
}

function isAnnotationsAction(action) {
  return action.type.startsWith("annotations/");
}

function isAutomationAction(action) {
  return action.type.startsWith("automation/");
}

function isAutomationRunAction(action) {
  return action.type.startsWith("automationRun/");
}

function isPassiveSessionMetadataAction(action) {
  return action.type === "session/isArchivedChanged" /* SessionIsArchivedChanged */ || action.type === "session/isReadChanged" /* SessionIsReadChanged */;
}
export { isRootAction, isSessionAction, isChatAction, isTerminalAction, isChangesetAction, isAnnotationsAction, isAutomationAction, isAutomationRunAction, isPassiveSessionMetadataAction };
