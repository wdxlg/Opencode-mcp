// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentSdkSetup.ts



// src/vs/platform/agentHost/common/agentSdkSetup.ts
var AGENT_SDK_SETUP_STATUS_KEY_PREFIX = "vscode.agentSdkSetup.status.";

var AGENT_SDK_SETUP_DOWNLOAD_REQUEST_KEY = "vscode.agentSdkSetup.downloadRequest";

var AGENT_SDK_SETUP_RELOAD_REQUEST_KEY = "vscode.agentSdkSetup.reloadRequest";

function readOne(value2, agent) {
  if (!value2 || typeof value2 !== "object") {
    return void 0;
  }
  const info = value2;
  if (info.download !== "notDownloaded" && info.download !== "downloading" && info.download !== "ready") {
    return void 0;
  }
  return {
    agent,
    download: info.download,
    setupDocsUrl: typeof info.setupDocsUrl === "string" ? info.setupDocsUrl : void 0,
    signInProviderName: typeof info.signInProviderName === "string" && info.signInProviderName.length > 0 ? info.signInProviderName : void 0
  };
}

function readAgentSdkSetupInfos(state) {
  const meta = state?._meta;
  const values = state?.config?.values;
  const infos = [];
  const seen = /* @__PURE__ */ new Set();
  for (const bag of [values, meta]) {
    for (const key3 of Object.keys(bag ?? {})) {
      if (!key3.startsWith(AGENT_SDK_SETUP_STATUS_KEY_PREFIX)) {
        continue;
      }
      const agent = key3.slice(AGENT_SDK_SETUP_STATUS_KEY_PREFIX.length);
      if (!agent || seen.has(agent)) {
        continue;
      }
      const info = readOne(bag?.[key3], agent);
      if (info) {
        seen.add(agent);
        infos.push(info);
      }
    }
  }
  return infos;
}

function readConsentedSdkAgents(stored) {
  if (!stored) {
    return /* @__PURE__ */ new Set();
  }
  try {
    const parsed = JSON.parse(stored);
    return new Set(Array.isArray(parsed) ? parsed.filter((agent) => typeof agent === "string") : []);
  } catch {
    return /* @__PURE__ */ new Set();
  }
}

function writeConsentedSdkAgents(agents) {
  return JSON.stringify([...agents]);
}

function resolveConsentedSdkDownloads(consentedAgents, setups, alreadyRequested) {
  return setups.filter((setup2) => setup2.download === "notDownloaded" && consentedAgents.has(setup2.agent) && !alreadyRequested.has(setup2.agent)).map((setup2) => setup2.agent);
}
export { readOne, readAgentSdkSetupInfos, readConsentedSdkAgents, writeConsentedSdkAgents, resolveConsentedSdkDownloads, AGENT_SDK_SETUP_STATUS_KEY_PREFIX, AGENT_SDK_SETUP_DOWNLOAD_REQUEST_KEY, AGENT_SDK_SETUP_RELOAD_REQUEST_KEY };
