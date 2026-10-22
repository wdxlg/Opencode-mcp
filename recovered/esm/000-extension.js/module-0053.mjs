// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: src/custom-tools.ts
import { __toESM, init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { loadGlobalSkills } from "./module-0027.mjs";
import { CUSTOM_TOOLS_DIR_NAME } from "./module-0029.mjs";
import { readManifest } from "./module-0054.mjs";
import { migrateLegacySkillDirs } from "./module-0055.mjs";
import { loadSkillTools } from "./module-0028.mjs";


// src/custom-tools.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_fs16 = require("node:fs");

var import_node_path21 = __toESM(require("node:path"), 1);


// src/custom-tools.ts
var MAX_MANIFESTS_PER_ROOT = 64;

function loadCustomTools(workspaceRoots, log, options = {}) {
  const tools = /* @__PURE__ */ new Map();
  if (options.skillsEnabled !== false) for (const tool of loadGlobalSkills(log)) tools.set(tool.name, tool);
  for (const root of workspaceRoots) {
    let entries;
    try {
      entries = (0, import_node_fs16.readdirSync)(import_node_path21.default.join(root, CUSTOM_TOOLS_DIR_NAME));
    } catch {
      continue;
    }
    for (const file of entries.filter((entry) => entry.endsWith(".json")).sort().slice(0, MAX_MANIFESTS_PER_ROOT)) {
      const manifest = readManifest(import_node_path21.default.join(root, CUSTOM_TOOLS_DIR_NAME, file), log);
      if (!manifest) continue;
      if (tools.has(manifest.name)) {
        log?.(`[custom-tools] duplicate tool ${manifest.name}; keeping first.`);
        continue;
      }
      tools.set(manifest.name, manifest);
    }
  }
  // SHARED_SKILLS_ONLY_V1: retain JSON custom tools, but never migrate/load workspace Skills.
  return [...tools.values()];
}

function listEnabledCustomTools(workspaceRoots, log, options = {}) {
  return loadCustomTools(workspaceRoots, log, options).filter((tool) => tool.enabled && !tool.skillDir);
}

function findCustomTool(workspaceRoots, name, log, options = {}) {
  return listEnabledCustomTools(workspaceRoots, log, options).find((tool) => tool.name === name);
}

function toStatusEntries(tools) {
  return tools.map((tool) => ({ name: tool.name, title: tool.title, description: tool.description, enabled: tool.enabled, scope: tool.scope ?? "workspace", source: tool.skillDir ? "skill" : "manifest" }));
}

function customToolsFingerprint(tools) {
  return tools.map((tool) => JSON.stringify([tool.name, tool.title, tool.description, tool.enabled, tool.scope, tool.sourcePath, tool.command, tool.inputSchema, tool.timeoutMs])).sort().join(",");
}
export { loadCustomTools, listEnabledCustomTools, findCustomTool, toStatusEntries, customToolsFingerprint, import_node_fs16, import_node_path21, MAX_MANIFESTS_PER_ROOT };
