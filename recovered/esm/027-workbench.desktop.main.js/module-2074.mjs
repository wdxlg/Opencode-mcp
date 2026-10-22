// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionUri.ts
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSessionUri.ts
function toAgentHostBackendSessionUri(sessionResource) {
  const scheme = sessionResource.scheme;
  const prefix = "agent-host-";
  if (!scheme.startsWith(prefix)) {
    return void 0;
  }
  const provider = scheme.substring(prefix.length);
  if (!provider) {
    return void 0;
  }
  const rawId = sessionResource.path.replace(/^\//, "");
  return URI.from({ scheme: provider, path: `/${rawId}` });
}
export { toAgentHostBackendSessionUri };
