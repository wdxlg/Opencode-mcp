// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/customizations/scan/claudeMcpScan.ts
import { URI } from "./module-0023.mjs";
import { makeMcpServerCustomization, readJsonFile } from "./module-0126.mjs";


// src/vs/platform/agentHost/node/claude/customizations/scan/claudeMcpScan.ts
function claudeMcpFiles(workingDirectory, userHome) {
  const files = [];
  if (workingDirectory) {
    files.push(URI.joinPath(workingDirectory, ".claude", "settings.json"));
    files.push(URI.joinPath(workingDirectory, ".mcp.json"));
  }
  files.push(URI.joinPath(userHome, ".claude", "settings.json"));
  return files;
}

function extractMcpServerMap(uri, raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return void 0;
  }
  const obj = raw;
  if (Object.hasOwn(obj, "mcpServers")) {
    const servers = obj.mcpServers;
    return servers && typeof servers === "object" && !Array.isArray(servers) ? servers : void 0;
  }
  return uri.path.endsWith(".mcp.json") ? obj : void 0;
}

async function scanClaudeMcpServers(workingDirectory, userHome, fileService) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const uri of claudeMcpFiles(workingDirectory, userHome)) {
    const raw = await readJsonFile(uri, fileService);
    const servers = extractMcpServerMap(uri, raw);
    if (!servers) {
      continue;
    }
    for (const [name, config] of Object.entries(servers)) {
      if (!config || typeof config !== "object" || Array.isArray(config) || seen.has(name)) {
        continue;
      }
      seen.add(name);
      result.push(makeMcpServerCustomization(uri, name));
    }
  }
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

function deriveMcpState(status) {
  switch (status) {
    case "connected":
      return { kind: "ready" /* Ready */ };
    case "disabled":
      return { kind: "stopped" /* Stopped */ };
    default:
      return { kind: "starting" /* Starting */ };
  }
}
export { claudeMcpFiles, extractMcpServerMap, scanClaudeMcpServers, deriveMcpState };
