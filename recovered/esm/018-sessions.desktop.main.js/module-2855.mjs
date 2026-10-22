// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/openCodeMcpLaunchOptions.ts



// src/vs/workbench/contrib/mcp/common/openCodeMcpLaunchOptions.ts
var OPENCODE_MANAGED_HTTP_HEADER = "x-opencode-managed-streamable-http";

var OPENCODE_MCP_TIMEOUT_HEADER = "x-opencode-mcp-timeout-ms";

var OPENCODE_MCP_TIMEOUT_ENV = "OPENCODE_MCP_TIMEOUT_MS";

function openCodeMcpLaunchOptions(launch) {
  const headers = [...launch.headers ?? []];
  const marker = headers.find(([name]) => name.toLowerCase() === OPENCODE_MANAGED_HTTP_HEADER)?.[1];
  const managed = marker !== void 0 || launch.env?.["OPENCODE_MCP_MANAGED"] === "1";
  const rawTimeout = marker !== void 0 ? headers.find(([name]) => name.toLowerCase() === OPENCODE_MCP_TIMEOUT_HEADER)?.[1] : launch.env?.[OPENCODE_MCP_TIMEOUT_ENV];
  const value2 = typeof rawTimeout === "string" || typeof rawTimeout === "number" ? Number(rawTimeout) : NaN;
  return {
    managed,
    httpTransport: marker === "auto" || marker === "sse" ? marker : "streamable-http",
    timeoutMs: managed && Number.isFinite(value2) && value2 >= 1e3 && value2 <= 36e5 ? Math.round(value2) : void 0
  };
}
export { openCodeMcpLaunchOptions, OPENCODE_MANAGED_HTTP_HEADER, OPENCODE_MCP_TIMEOUT_HEADER, OPENCODE_MCP_TIMEOUT_ENV };
