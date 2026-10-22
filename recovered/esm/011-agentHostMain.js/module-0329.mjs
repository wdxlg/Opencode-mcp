// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeTransportMode.ts



// src/vs/platform/agentHost/node/claude/claudeTransportMode.ts
function resolveClaudeTransportMode(inputs) {
  const { allowSignedOutWhenUsable, hasGitHubToken, hasExistingSetup } = inputs;
  if (!allowSignedOutWhenUsable) {
    return "proxy";
  }
  if (hasGitHubToken) {
    return "proxy";
  }
  if (hasExistingSetup) {
    return "native";
  }
  return "proxy";
}

function isClaudeAccountSetUp(account) {
  if (!account) {
    return false;
  }
  if (account.apiProvider !== void 0 && account.apiProvider !== "firstParty") {
    return true;
  }
  return account.tokenSource !== void 0 && account.tokenSource !== "none" || account.apiKeySource !== void 0;
}
export { resolveClaudeTransportMode, isClaudeAccountSetUp };
