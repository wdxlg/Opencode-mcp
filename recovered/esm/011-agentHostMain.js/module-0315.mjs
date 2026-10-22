// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentSdkSetup.ts



// src/vs/platform/agentHost/common/agentSdkSetup.ts
var AGENT_SDK_SETUP_STATUS_KEY_PREFIX = "vscode.agentSdkSetup.status.";

var AGENT_SDK_SETUP_DOWNLOAD_REQUEST_KEY = "vscode.agentSdkSetup.downloadRequest";

var AGENT_SDK_SETUP_RELOAD_REQUEST_KEY = "vscode.agentSdkSetup.reloadRequest";

function agentSdkSetupStatusKey(agent) {
  return `${AGENT_SDK_SETUP_STATUS_KEY_PREFIX}${agent}`;
}

function isAgentSdkSetupRequestFor(value, agent) {
  if (!value || typeof value !== "object") {
    return false;
  }
  const request = value;
  return request.agent === agent && typeof request.request === "string" && request.request.length > 0;
}
export { agentSdkSetupStatusKey, isAgentSdkSetupRequestFor, AGENT_SDK_SETUP_STATUS_KEY_PREFIX, AGENT_SDK_SETUP_DOWNLOAD_REQUEST_KEY, AGENT_SDK_SETUP_RELOAD_REQUEST_KEY };
