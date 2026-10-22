// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/assignment/common/assignment.ts



// src/vs/platform/assignment/common/assignment.ts
var ASSIGNMENT_REFETCH_INTERVAL = 60 * 60 * 1e3;

function getInternalOrg(organisations) {
  const isVSCodeInternal = organisations?.includes("Visual-Studio-Code");
  const isGitHubInternal = organisations?.includes("github");
  const isMicrosoftInternal = organisations?.includes("microsoft") || organisations?.includes("ms-copilot") || organisations?.includes("MicrosoftCopilot");
  return isVSCodeInternal ? "vscode" : isGitHubInternal ? "github" : isMicrosoftInternal ? "microsoft" : void 0;
}

function isInternalAccount(isStaff, organisations) {
  return isStaff === true || getInternalOrg(organisations) !== void 0;
}
export { getInternalOrg, isInternalAccount, ASSIGNMENT_REFETCH_INTERVAL };
