// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/remoteAgentHostLocationPreference.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/agentHost/common/remoteAgentHostLocationPreference.ts
function isRemoteAgentHostLocationPreference(value2) {
  return value2 === "dedicated" || value2 === "editor";
}

var IRemoteAgentHostLocationPreferenceService = createDecorator("remoteAgentHostLocationPreferenceService");
export { isRemoteAgentHostLocationPreference, IRemoteAgentHostLocationPreferenceService };
