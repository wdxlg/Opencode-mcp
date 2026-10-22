// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentPeerChats.ts



// src/vs/platform/agentHost/node/agentPeerChats.ts
function encodeProviderData(backing) {
  return JSON.stringify(backing);
}

function decodeProviderData(providerData) {
  try {
    const value = JSON.parse(providerData);
    if (!value || typeof value !== "object") {
      return void 0;
    }
    const { sdkSessionId } = value;
    if (typeof sdkSessionId !== "string" || !sdkSessionId) {
      return void 0;
    }
    const validModel = isModelSelection(value.model) ? value.model : void 0;
    const validAgent = isAgentSelection(value.agent) ? value.agent : void 0;
    return {
      sdkSessionId,
      ...validModel ? { model: validModel } : {},
      ...validAgent ? { agent: validAgent } : {}
    };
  } catch {
    return void 0;
  }
}

function isModelSelection(value) {
  return !!value && typeof value === "object" && typeof value.id === "string";
}

function isAgentSelection(value) {
  return !!value && typeof value === "object" && typeof value.uri === "string";
}
export { encodeProviderData, decodeProviderData, isModelSelection, isAgentSelection };
