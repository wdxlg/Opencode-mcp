// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeServerToolMcpServer.ts
import { jsonSchemaToZodRawShape } from "./module-0323.mjs";


// src/vs/platform/agentHost/node/claude/claudeServerToolMcpServer.ts
var CLAUDE_SERVER_TOOL_MCP_SERVER_NAME = "host";

function serverToolAllowList(toolNames) {
  return toolNames.map((name) => `mcp__${CLAUDE_SERVER_TOOL_MCP_SERVER_NAME}__${name}`);
}

function extractServerToolName(toolName) {
  const prefix = `mcp__${CLAUDE_SERVER_TOOL_MCP_SERVER_NAME}__`;
  return toolName.startsWith(prefix) ? toolName.slice(prefix.length) : void 0;
}

async function buildServerToolMcpServer(host, chatUri, sdk, definitions2 = host.definitions) {
  const tools = await Promise.all(definitions2.map((def) => sdk.tool(
    def.name,
    def.description ?? "",
    jsonSchemaToZodRawShape(def.inputSchema),
    async (args) => {
      try {
        const text = await host.executeTool(chatUri, def.name, args);
        return { content: [{ type: "text", text }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: message }], isError: true };
      }
    }
  )));
  return sdk.createSdkMcpServer({ name: CLAUDE_SERVER_TOOL_MCP_SERVER_NAME, tools });
}
export { serverToolAllowList, extractServerToolName, buildServerToolMcpServer, CLAUDE_SERVER_TOOL_MCP_SERVER_NAME };
