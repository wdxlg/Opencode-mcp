// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpEditorAffordanceState.ts
import { isAgentHostTarget } from "./module-0961.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { isEqual2 } from "./module-0034.mjs";


// src/vs/workbench/contrib/mcp/common/mcpEditorAffordanceState.ts
function getActiveAgentHostMcpSessionResource(sessionResource) {
  return sessionResource && isAgentHostTarget(getChatSessionType(sessionResource)) ? sessionResource : void 0;
}

function countRunningMcpServersInOtherSessions(currentSession, sessions) {
  const counts = /* @__PURE__ */ new Map();
  for (const session of sessions) {
    if (isEqual2(session.resource, currentSession)) {
      continue;
    }
    const running = /* @__PURE__ */ new Set();
    for (const server of session.servers) {
      if (server.enabled && server.status === "ready" /* Ready */) {
        running.add(server.name);
      }
    }
    for (const name of running) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return counts;
}
export { getActiveAgentHostMcpSessionResource, countRunningMcpServersInOtherSessions };
