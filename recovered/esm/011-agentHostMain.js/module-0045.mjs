// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/sandbox/common/settings.ts



// src/vs/platform/sandbox/common/settings.ts
function normalizeAgentSandboxEnabledValue(value) {
  if (value === true) {
    return "on" /* On */;
  }
  if (value === false) {
    return "off" /* Off */;
  }
  return value;
}

function isAgentSandboxEnabledValue(value) {
  return value !== void 0 && normalizeAgentSandboxEnabledValue(value) !== "off" /* Off */;
}
export { normalizeAgentSandboxEnabledValue, isAgentSandboxEnabledValue };
