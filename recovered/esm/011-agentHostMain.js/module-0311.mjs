// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/meta/clientPluginCustomizationMeta.ts
import { URI } from "./module-0023.mjs";


// src/vs/platform/agentHost/common/meta/clientPluginCustomizationMeta.ts
var mcpDefaultCwdsKey = "mcpDefaultCwds";

function readClientPluginMcpDefaultCwds(customization) {
  const value = customization._meta?.[mcpDefaultCwdsKey];
  return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}

function readClientPluginMcpDefaultCwdEntry(customization, serverName) {
  const value = readClientPluginMcpDefaultCwds(customization);
  if (!value || !Object.hasOwn(value, serverName)) {
    return void 0;
  }
  const cwd3 = value[serverName];
  if (cwd3 === null) {
    return { kind: "primary" };
  }
  if (typeof cwd3 !== "string") {
    return void 0;
  }
  try {
    return { kind: "uri", uri: URI.parse(cwd3, true) };
  } catch {
    return void 0;
  }
}

function hasClientPluginMcpDefaultCwds(customization) {
  return readClientPluginMcpDefaultCwds(customization) !== void 0;
}

function hasClientPluginMcpDefaultCwd(customization, serverName) {
  return readClientPluginMcpDefaultCwdEntry(customization, serverName) !== void 0;
}

function readClientPluginMcpDefaultCwd(customization, serverName, primaryCwd) {
  const value = readClientPluginMcpDefaultCwdEntry(customization, serverName);
  return value?.kind === "primary" ? primaryCwd : value?.uri;
}
export { readClientPluginMcpDefaultCwds, readClientPluginMcpDefaultCwdEntry, hasClientPluginMcpDefaultCwds, hasClientPluginMcpDefaultCwd, readClientPluginMcpDefaultCwd, mcpDefaultCwdsKey };
