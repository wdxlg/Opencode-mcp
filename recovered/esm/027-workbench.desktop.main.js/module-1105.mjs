// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/sandbox/common/settings.ts



// src/vs/platform/sandbox/common/settings.ts
function normalizeAgentSandboxEnabledValue(value2) {
  if (value2 === true) {
    return "on" /* On */;
  }
  if (value2 === false) {
    return "off" /* Off */;
  }
  return value2;
}

function isAgentSandboxEnabledValue(value2) {
  return value2 !== void 0 && normalizeAgentSandboxEnabledValue(value2) !== "off" /* Off */;
}
export { normalizeAgentSandboxEnabledValue, isAgentSandboxEnabledValue };
