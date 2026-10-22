// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/agentPlugins/common/pluginParsers.ts
import { basename2, isEqual, joinPath } from "./module-0032.mjs";
import { equals3 } from "./module-0055.mjs";
import { customizationId } from "./module-0194.mjs";
import { URI } from "./module-0023.mjs";
import { isAbsolute } from "./module-0022.mjs";


// src/vs/platform/agentPlugins/common/pluginParsers.ts
var IParsedHookCommand;

((IParsedHookCommand2) => {
  function isEquals(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.command === b.command && a.windows === b.windows && a.linux === b.linux && a.osx === b.osx && isEqual(a.cwd, b.cwd) && equals3(a.env, b.env) && a.timeout === b.timeout && isEqual(a.sourceUri, b.sourceUri);
  }
  IParsedHookCommand2.isEquals = isEquals;
})(IParsedHookCommand || (IParsedHookCommand = {}));

var AGENT_PLUGIN_COPILOT_EXTENSION_NAMESPACE = "com.github.copilot";

var AGENT_PLUGIN_FORMAT = {
  format: 3 /* AgentPlugin */,
  manifestPath: "plugin.json",
  hookConfigPath: `${AGENT_PLUGIN_COPILOT_EXTENSION_NAMESPACE}/hooks/hooks.json`,
  componentPaths: {
    commands: `${AGENT_PLUGIN_COPILOT_EXTENSION_NAMESPACE}/commands`,
    skills: "skills",
    agents: `${AGENT_PLUGIN_COPILOT_EXTENSION_NAMESPACE}/agents`,
    rules: `${AGENT_PLUGIN_COPILOT_EXTENSION_NAMESPACE}/rules`,
    hooks: `${AGENT_PLUGIN_COPILOT_EXTENSION_NAMESPACE}/hooks/hooks.json`,
    mcpServers: "mcp.json"
  },
  manifestExtensionNamespace: AGENT_PLUGIN_COPILOT_EXTENSION_NAMESPACE,
  requiresManifest: true,
  pluginRootTokens: [],
  pluginRootEnvVars: [],
  parseHooks(hookUri, json, _pluginUri, workspaceRoot, userHome) {
    return parseHooksJson(hookUri, json, workspaceRoot, userHome);
  }
};

function buildChildId(uri2, disambiguator) {
  const base = customizationId(uri2.toString());
  if (!disambiguator) {
    return base;
  }
  return `${base.replace(/#/g, "%23")}#${disambiguator}`;
}

function makeHookCustomization(hookUri) {
  return {
    type: "hook" /* Hook */,
    id: buildChildId(hookUri),
    uri: hookUri.toString(),
    name: basename2(hookUri)
  };
}

var HOOK_TYPE_MAP = {
  // PascalCase (VS Code / Claude)
  "SessionStart": "SessionStart",
  "SessionEnd": "SessionEnd",
  "UserPromptSubmit": "UserPromptSubmit",
  "PreToolUse": "PreToolUse",
  "PostToolUse": "PostToolUse",
  "PreCompact": "PreCompact",
  "SubagentStart": "SubagentStart",
  "SubagentStop": "SubagentStop",
  "Stop": "Stop",
  "ErrorOccurred": "ErrorOccurred",
  // camelCase (GitHub Copilot CLI)
  "sessionStart": "SessionStart",
  "sessionEnd": "SessionEnd",
  "userPromptSubmitted": "UserPromptSubmit",
  "preToolUse": "PreToolUse",
  "postToolUse": "PostToolUse",
  "agentStop": "Stop",
  "subagentStop": "SubagentStop",
  "errorOccurred": "ErrorOccurred"
};

function normalizeHookCommand(raw) {
  if (raw.type !== void 0 && raw.type !== "command") {
    return void 0;
  }
  const hasCommand = typeof raw.command === "string" && raw.command.length > 0;
  const hasBash = typeof raw.bash === "string" && raw.bash.length > 0;
  const hasPowerShell = typeof raw.powershell === "string" && raw.powershell.length > 0;
  const hasWindows = typeof raw.windows === "string" && raw.windows.length > 0;
  const hasLinux = typeof raw.linux === "string" && raw.linux.length > 0;
  const hasOsx = typeof raw.osx === "string" && raw.osx.length > 0;
  if (!hasCommand && !hasBash && !hasPowerShell && !hasWindows && !hasLinux && !hasOsx) {
    return void 0;
  }
  const windows = hasWindows ? raw.windows : hasPowerShell ? raw.powershell : void 0;
  const linux = hasLinux ? raw.linux : hasBash ? raw.bash : void 0;
  const osx = hasOsx ? raw.osx : hasBash ? raw.bash : void 0;
  const timeout2 = typeof raw.timeout === "number" ? raw.timeout : typeof raw.timeoutSec === "number" ? raw.timeoutSec : void 0;
  return {
    ...hasCommand && { command: raw.command },
    ...windows && { windows },
    ...linux && { linux },
    ...osx && { osx },
    ...typeof raw.env === "object" && raw.env !== null && { env: raw.env },
    ...timeout2 !== void 0 && { timeout: timeout2 }
  };
}

function resolveHookCommand(raw, workspaceRoot, userHome) {
  const normalized = normalizeHookCommand(raw);
  if (!normalized) {
    return void 0;
  }
  let cwdUri;
  const rawCwd = typeof raw.cwd === "string" ? raw.cwd : void 0;
  if (rawCwd) {
    if (rawCwd.startsWith("~/")) {
      cwdUri = URI.joinPath(userHome, rawCwd.substring(2));
    } else if (isAbsolute(rawCwd)) {
      cwdUri = URI.file(rawCwd);
    } else if (workspaceRoot) {
      cwdUri = joinPath(workspaceRoot, rawCwd);
    }
  } else {
    cwdUri = workspaceRoot;
  }
  return { ...normalized, cwd: cwdUri };
}

function extractHookCommands(item, workspaceRoot, userHome) {
  if (!item || typeof item !== "object") {
    return [];
  }
  const itemObj = item;
  const commands = [];
  const nestedHooks = itemObj.hooks;
  if (nestedHooks !== void 0 && Array.isArray(nestedHooks)) {
    for (const nested of nestedHooks) {
      if (!nested || typeof nested !== "object") {
        continue;
      }
      const resolved = resolveHookCommand(nested, workspaceRoot, userHome);
      if (resolved) {
        commands.push(resolved);
      }
    }
  } else {
    const resolved = resolveHookCommand(itemObj, workspaceRoot, userHome);
    if (resolved) {
      commands.push(resolved);
    }
  }
  return commands;
}

function parseHooksJson(hookUri, json, workspaceRoot, userHome) {
  if (!json || typeof json !== "object") {
    return [];
  }
  const root = json;
  if (root.disableAllHooks === true) {
    return [];
  }
  const hooks = root.hooks;
  const hooksObj = hooks && typeof hooks === "object" && !Array.isArray(hooks) ? hooks : root;
  const result = [];
  const customization = makeHookCustomization(hookUri);
  for (const originalId of Object.keys(hooksObj)) {
    const canonicalType = HOOK_TYPE_MAP[originalId];
    if (!canonicalType) {
      continue;
    }
    const hookArray = hooksObj[originalId];
    if (!Array.isArray(hookArray)) {
      continue;
    }
    const commands = [];
    for (const item of hookArray) {
      commands.push(...extractHookCommands(item, workspaceRoot, userHome));
    }
    if (commands.length > 0) {
      result.push({ type: canonicalType, commands, uri: hookUri, originalId, customization });
    }
  }
  return result;
}
export { buildChildId, makeHookCustomization, normalizeHookCommand, resolveHookCommand, extractHookCommands, parseHooksJson, IParsedHookCommand, AGENT_PLUGIN_COPILOT_EXTENSION_NAMESPACE, AGENT_PLUGIN_FORMAT, HOOK_TYPE_MAP };
