// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeMcpServerNames.ts
import { CLAUDE_CLIENT_MCP_SERVER_NAME } from "./module-0324.mjs";
import { CLAUDE_SERVER_TOOL_MCP_SERVER_NAME } from "./module-0335.mjs";


// src/vs/platform/agentHost/node/claude/claudeMcpServerNames.ts
var HOST_INJECTED_MCP_SERVER_NAMES = /* @__PURE__ */ new Set([
  CLAUDE_CLIENT_MCP_SERVER_NAME,
  CLAUDE_SERVER_TOOL_MCP_SERVER_NAME
]);

function isHostInjectedMcpServerName(name) {
  return HOST_INJECTED_MCP_SERVER_NAMES.has(name);
}
export { isHostInjectedMcpServerName, HOST_INJECTED_MCP_SERVER_NAMES };
