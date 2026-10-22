// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentPlugins/common/pluginParsers.ts
import { basename2, dirname2, extname2, isEqual2, isEqualOrParent2, joinPath, normalizePath } from "./module-0025.mjs";
import { cloneAndChange, equals2 } from "./module-0035.mjs";
import { readAgentPluginManifest } from "./module-0125.mjs";
import { customizationId } from "./module-0047.mjs";
import { DEFAULT_MCP_APP } from "./module-0124.mjs";
import { escapeRegExpCharacters } from "./module-0021.mjs";
import { URI } from "./module-0023.mjs";
import { isAbsolute } from "./module-0018.mjs";
import { parse3 } from "./module-0122.mjs";
import { parseFrontMatter } from "./module-0123.mjs";
import { hasKey } from "./module-0008.mjs";


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
    return a.command === b.command && a.windows === b.windows && a.linux === b.linux && a.osx === b.osx && isEqual2(a.cwd, b.cwd) && equals2(a.env, b.env) && a.timeout === b.timeout && isEqual2(a.sourceUri, b.sourceUri);
  }
  IParsedHookCommand2.isEquals = isEquals;
})(IParsedHookCommand || (IParsedHookCommand = {}));

var COPILOT_FORMAT = {
  format: 0 /* Copilot */,
  manifestPath: "plugin.json",
  hookConfigPath: "hooks.json",
  pluginRootTokens: ["${PLUGIN_ROOT}", "${CLAUDE_PLUGIN_ROOT}"],
  pluginRootEnvVars: ["PLUGIN_ROOT", "CLAUDE_PLUGIN_ROOT"],
  parseHooks(hookUri, json, _pluginUri, workspaceRoot, userHome) {
    return parseHooksJson(hookUri, json, workspaceRoot, userHome);
  }
};

var CLAUDE_FORMAT = {
  format: 1 /* Claude */,
  manifestPath: ".claude-plugin/plugin.json",
  hookConfigPath: "hooks/hooks.json",
  pluginRootTokens: ["${PLUGIN_ROOT}", "${CLAUDE_PLUGIN_ROOT}"],
  pluginRootEnvVars: ["PLUGIN_ROOT", "CLAUDE_PLUGIN_ROOT"],
  parseHooks(hookUri, json, pluginUri, workspaceRoot, userHome) {
    return interpolateHookPluginRoot(hookUri, json, pluginUri, workspaceRoot, userHome, "${CLAUDE_PLUGIN_ROOT}", "CLAUDE_PLUGIN_ROOT");
  }
};

var OPEN_PLUGIN_FORMAT = {
  format: 2 /* OpenPlugin */,
  manifestPath: ".plugin/plugin.json",
  hookConfigPath: "hooks/hooks.json",
  pluginRootTokens: ["${PLUGIN_ROOT}", "${CLAUDE_PLUGIN_ROOT}"],
  pluginRootEnvVars: ["PLUGIN_ROOT", "CLAUDE_PLUGIN_ROOT"],
  parseHooks(hookUri, json, pluginUri, workspaceRoot, userHome) {
    return interpolateHookPluginRoot(hookUri, json, pluginUri, workspaceRoot, userHome, "${PLUGIN_ROOT}", "PLUGIN_ROOT");
  }
};

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

async function detectPluginFormat(pluginUri, fileService) {
  if (await readAgentPluginManifest(pluginUri, fileService)) {
    return AGENT_PLUGIN_FORMAT;
  }
  if (await pathExists(joinPath(pluginUri, ".plugin", "plugin.json"), fileService)) {
    return OPEN_PLUGIN_FORMAT;
  }
  const isInClaudeDirectory = pluginUri.path.split("/").includes(".claude");
  if (isInClaudeDirectory || await pathExists(joinPath(pluginUri, ".claude-plugin", "plugin.json"), fileService)) {
    return CLAUDE_FORMAT;
  }
  return COPILOT_FORMAT;
}

async function readPluginManifest(pluginUri, format4, fileService) {
  if (format4.format === 3 /* AgentPlugin */) {
    const manifest = await readAgentPluginManifest(pluginUri, fileService);
    return manifest ? { ...manifest } : void 0;
  }
  const json = await readJsonFile(joinPath(pluginUri, format4.manifestPath), fileService);
  return json && typeof json === "object" && !Array.isArray(json) ? json : void 0;
}

function getPluginManifestComponent(format4, component, manifest) {
  if (format4.manifestExtensionNamespace) {
    const extensions = manifest?.["extensions"];
    if (!extensions || typeof extensions !== "object" || Array.isArray(extensions)) {
      return void 0;
    }
    const extension = extensions[format4.manifestExtensionNamespace];
    return extension && typeof extension === "object" && !Array.isArray(extension) ? extension[component] : void 0;
  }
  return format4.componentPaths && Object.hasOwn(format4.componentPaths, component) ? void 0 : manifest?.[component];
}

function resolvePluginComponentDirs(pluginUri, format4, component, fallbackPath, manifestSection, boundaryUri) {
  const componentPath = format4.componentPaths?.[component];
  if (format4.componentPaths && Object.hasOwn(format4.componentPaths, component)) {
    if (typeof componentPath !== "string") {
      return [];
    }
    if (!format4.manifestExtensionNamespace) {
      return resolveComponentDirs(pluginUri, componentPath, emptyComponentPathConfig, boundaryUri);
    }
    const config = parseComponentPathConfig(manifestSection);
    const defaultDirs = config.exclusive ? [] : resolveComponentDirs(pluginUri, componentPath, emptyComponentPathConfig, boundaryUri);
    const extensionRoot = joinPath(pluginUri, format4.manifestExtensionNamespace);
    const configuredDirs = resolveComponentDirs(extensionRoot, "", { paths: config.paths, exclusive: true }, extensionRoot);
    return [...defaultDirs, ...configuredDirs];
  }
  return resolveComponentDirs(
    pluginUri,
    fallbackPath,
    parseComponentPathConfig(manifestSection),
    boundaryUri
  );
}

function buildChildId(uri, disambiguator) {
  const base = customizationId(uri.toString());
  if (!disambiguator) {
    return base;
  }
  return `${base.replace(/#/g, "%23")}#${disambiguator}`;
}

function makeAgentCustomization(resource) {
  const uri = resource.uri.toString();
  return {
    type: "agent" /* Agent */,
    id: buildChildId(resource.uri),
    uri,
    name: resource.name,
    ...resource.description ? { description: resource.description } : {},
    ...resource.model ? { model: resource.model } : {},
    ...resource.tools?.length ? { tools: [...resource.tools] } : {},
    ...resource.disableModelInvocation ? { disableModelInvocation: true } : {},
    ...resource.disableUserInvocation ? { disableUserInvocation: true } : {}
  };
}

function makeSkillCustomization(resource) {
  const uri = resource.uri.toString();
  return {
    type: "skill" /* Skill */,
    id: buildChildId(resource.uri),
    uri,
    name: resource.name,
    ...resource.description ? { description: resource.description } : {}
  };
}

function makeRuleCustomization(resource) {
  const uri = resource.uri.toString();
  return {
    type: "rule" /* Rule */,
    id: buildChildId(resource.uri),
    uri,
    name: resource.name,
    ...resource.description ? { description: resource.description } : {}
  };
}

function makeHookCustomization(hookUri) {
  return {
    type: "hook" /* Hook */,
    id: buildChildId(hookUri),
    uri: hookUri.toString(),
    name: basename2(hookUri)
  };
}

function makeMcpServerCustomization(definitionUri, name) {
  return {
    type: "mcpServer" /* McpServer */,
    id: buildChildId(definitionUri, `mcp=${encodeURIComponent(name)}`),
    uri: definitionUri.toString(),
    name,
    state: { kind: "stopped" /* Stopped */ },
    mcpApp: DEFAULT_MCP_APP
  };
}

var emptyComponentPathConfig = { paths: [], exclusive: false };

function parseComponentPathConfig(raw) {
  if (raw === void 0 || raw === null) {
    return emptyComponentPathConfig;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed ? { paths: [trimmed], exclusive: false } : emptyComponentPathConfig;
  }
  if (Array.isArray(raw)) {
    const paths = raw.filter((v) => typeof v === "string").map((v) => v.trim()).filter((v) => v.length > 0);
    return { paths, exclusive: false };
  }
  if (typeof raw === "object") {
    const obj = raw;
    if (Array.isArray(obj["paths"])) {
      const paths = obj["paths"].filter((v) => typeof v === "string").map((v) => v.trim()).filter((v) => v.length > 0);
      const exclusive = obj["exclusive"] === true;
      return { paths, exclusive };
    }
  }
  return emptyComponentPathConfig;
}

function resolveComponentDirs(pluginUri, defaultDir, config, boundaryUri) {
  const boundary = boundaryUri && isEqualOrParent2(pluginUri, boundaryUri) ? boundaryUri : pluginUri;
  const dirs = [];
  if (!config.exclusive) {
    dirs.push(joinPath(pluginUri, defaultDir));
  }
  for (const p of config.paths) {
    const resolved = normalizePath(joinPath(pluginUri, p));
    if (isEqualOrParent2(resolved, boundary)) {
      dirs.push(resolved);
    }
  }
  return dirs;
}

function resolveMcpServersMap(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return void 0;
  }
  const obj = raw;
  return Object.hasOwn(obj, "mcpServers") ? obj.mcpServers : obj;
}

function normalizeMcpServerConfiguration(rawConfig) {
  if (!rawConfig || typeof rawConfig !== "object") {
    return void 0;
  }
  const candidate = rawConfig;
  const type = typeof candidate["type"] === "string" ? candidate["type"] : void 0;
  const transport = candidate["transport"] === "sse" || candidate["transport"] === "http" ? candidate["transport"] : void 0;
  const command = typeof candidate["command"] === "string" ? candidate["command"] : void 0;
  const url2 = typeof candidate["url"] === "string" ? candidate["url"] : void 0;
  const args = Array.isArray(candidate["args"]) ? candidate["args"].filter((value) => typeof value === "string") : void 0;
  const env2 = candidate["env"] && typeof candidate["env"] === "object" ? Object.fromEntries(Object.entries(candidate["env"]).filter(([, value]) => typeof value === "string" || typeof value === "number" || value === null).map(([key, value]) => [key, value])) : void 0;
  const envFile = typeof candidate["envFile"] === "string" ? candidate["envFile"] : void 0;
  const cwd3 = typeof candidate["cwd"] === "string" ? candidate["cwd"] : void 0;
  const headers = candidate["headers"] && typeof candidate["headers"] === "object" ? Object.fromEntries(Object.entries(candidate["headers"]).filter(([, value]) => typeof value === "string").map(([key, value]) => [key, value])) : void 0;
  const dev = candidate["dev"] && typeof candidate["dev"] === "object" ? candidate["dev"] : void 0;
  if (type === "ws") {
    return void 0;
  }
  if (type === "stdio" /* LOCAL */ || !type && command) {
    if (!command) {
      return void 0;
    }
    return { type: "stdio" /* LOCAL */, command, args, env: env2, envFile, cwd: cwd3, dev };
  }
  if (type === "http" /* REMOTE */ || type === "streamable-http" || type === "sse" || !type && url2) {
    if (!url2) {
      return void 0;
    }
    return { type: "http" /* REMOTE */, ...type === "sse" || transport === "sse" ? { transport: "sse" } : {}, url: url2, headers, dev };
  }
  return void 0;
}

var shellUnsafeChars = /[\s&|<>()^;!`"']/;

function shellQuotePluginRootInCommand(command, fsPath, token) {
  if (!command.includes(token)) {
    return command;
  }
  if (!shellUnsafeChars.test(fsPath)) {
    return command.replaceAll(token, fsPath);
  }
  const escapedToken = escapeRegExpCharacters(token);
  const pattern = new RegExp(
    `(["']?)` + escapedToken + `([\\w./\\\\~:-]*)`,
    "g"
  );
  return command.replace(pattern, (_match, leadingQuote, suffix) => {
    const fullPath = fsPath + suffix;
    if (leadingQuote) {
      return leadingQuote + fullPath;
    }
    return '"' + fullPath.replace(/"/g, '\\"') + '"';
  });
}

function interpolateMcpPluginRoot(def, fsPath, tokens, envVars) {
  const replace = (s) => tokens.reduce((result, token) => result.replaceAll(token, fsPath), s);
  const config = def.configuration;
  let interpolated;
  if (config.type === "stdio" /* LOCAL */) {
    const local = { ...config };
    local.command = replace(local.command);
    if (local.args) {
      local.args = local.args.map(replace);
    }
    if (local.cwd) {
      local.cwd = replace(local.cwd);
    }
    local.env = { ...local.env };
    for (const [k, v] of Object.entries(local.env)) {
      if (typeof v === "string") {
        local.env[k] = replace(v);
      }
    }
    for (const envVar of envVars) {
      local.env[envVar] = fsPath;
    }
    if (local.envFile) {
      local.envFile = replace(local.envFile);
    }
    interpolated = local;
  } else {
    const remote = { ...config };
    remote.url = replace(remote.url);
    if (remote.headers) {
      remote.headers = Object.fromEntries(
        Object.entries(remote.headers).map(([k, v]) => [k, replace(v)])
      );
    }
    interpolated = remote;
  }
  return { ...def, configuration: interpolated };
}

var BARE_ENV_VAR_RE = /\$\{(?![A-Za-z]+:)([A-Z_][A-Z0-9_]*)\}/g;

function convertBareEnvVarsToVsCodeSyntax(def) {
  return cloneAndChange(def, (value) => {
    if (URI.isUri(value)) {
      return value;
    }
    if (typeof value === "string") {
      const replaced = value.replace(BARE_ENV_VAR_RE, "${env:$1}");
      return replaced !== value ? replaced : void 0;
    }
    return void 0;
  });
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

function interpolateHookPluginRoot(hookUri, json, pluginUri, workspaceRoot, userHome, token, envVar) {
  const fsPath = pluginUri.fsPath;
  const typedJson = json;
  const mutateHookCommand = (hook) => {
    for (const field of ["command", "windows", "linux", "osx"]) {
      if (typeof hook[field] === "string") {
        hook[field] = shellQuotePluginRootInCommand(hook[field], fsPath, token);
      }
    }
    if (!hook.env || typeof hook.env !== "object") {
      hook.env = {};
    }
    hook.env[envVar] = fsPath;
  };
  for (const lifecycle of Object.values(typedJson.hooks ?? {})) {
    if (!Array.isArray(lifecycle)) {
      continue;
    }
    for (const lifecycleEntry of lifecycle) {
      if (!lifecycleEntry || typeof lifecycleEntry !== "object") {
        continue;
      }
      const entry = lifecycleEntry;
      if (Array.isArray(entry.hooks)) {
        for (const hook of entry.hooks) {
          mutateHookCommand(hook);
        }
      } else {
        mutateHookCommand(entry);
      }
    }
  }
  const replacer = (v) => {
    return typeof v === "string" ? v.replaceAll(token, pluginUri.fsPath) : void 0;
  };
  return parseHooksJson(hookUri, cloneAndChange(json, replacer), workspaceRoot, userHome);
}

async function readJsonFile(uri, fileService) {
  try {
    const fileContents = await fileService.readFile(uri);
    return parse3(fileContents.value.toString());
  } catch {
    return void 0;
  }
}

async function pathExists(resource, fileService) {
  try {
    await fileService.resolve(resource);
    return true;
  } catch {
    return false;
  }
}

var COMMAND_FILE_SUFFIX = ".md";

var RULE_FILE_SUFFIX = ".mdc";

var INSTRUCTION_FILE_SUFFIX = ".instructions.md";

async function readSkills(pluginRoot, dirs, fileService, options) {
  const seen = /* @__PURE__ */ new Set();
  const skills = [];
  const addSkill = async (name, skillMd) => {
    if (options?.containmentRoot && !await isResolvedWithin(options.containmentRoot, skillMd, fileService)) {
      return;
    }
    let description;
    try {
      const parsedInfo = await parseSkillFile(skillMd, fileService);
      description = parsedInfo.description;
      name = parsedInfo.name || name;
    } catch {
    }
    if (seen.has(name)) {
      return;
    }
    seen.add(name);
    skills.push({ uri: skillMd, name, ...description ? { description } : {} });
  };
  await Promise.all(dirs.map(async (dir) => {
    if (!options?.childDirectoriesOnly) {
      const skillMd = URI.joinPath(dir, "SKILL.md");
      if (await pathExists(skillMd, fileService)) {
        await addSkill(basename2(dir), skillMd);
        return;
      }
    }
    let stat3;
    try {
      stat3 = await fileService.resolve(dir);
    } catch {
      return;
    }
    if (!stat3.isDirectory || !stat3.children) {
      return;
    }
    await Promise.all(stat3.children.map(async (child) => {
      const childSkillMd = URI.joinPath(child.resource, "SKILL.md");
      if (await pathExists(childSkillMd, fileService)) {
        await addSkill(basename2(child.resource), childSkillMd);
      }
    }));
  }));
  if (!options?.childDirectoriesOnly && skills.length === 0) {
    const rootSkillMd = URI.joinPath(pluginRoot, "SKILL.md");
    if (await pathExists(rootSkillMd, fileService)) {
      await addSkill(basename2(pluginRoot), rootSkillMd);
    }
  }
  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}

async function readPluginSkills(pluginRoot, dirs, format4, fileService) {
  return readSkills(pluginRoot, dirs, fileService, format4.format === 3 /* AgentPlugin */ ? { childDirectoriesOnly: true, containmentRoot: pluginRoot } : void 0);
}

async function isResolvedWithin(root, resource, fileService) {
  try {
    const [resolvedRoot, resolvedResource] = await Promise.all([
      fileService.realpath(root),
      fileService.realpath(resource)
    ]);
    return isEqualOrParent2(resolvedResource ?? normalizePath(resource), resolvedRoot ?? normalizePath(root));
  } catch {
    return false;
  }
}

async function readMarkdownComponents(dirs, fileService, options) {
  const seen = /* @__PURE__ */ new Set();
  const items = [];
  const addItem = async (name, uri) => {
    if (options?.containmentRoot && !await isResolvedWithin(options.containmentRoot, uri, fileService)) {
      return;
    }
    if (!seen.has(name)) {
      seen.add(name);
      items.push({ uri, name });
    }
  };
  for (const dir of dirs) {
    let stat3;
    try {
      stat3 = await fileService.resolve(dir);
    } catch {
      continue;
    }
    if (stat3.isFile && extname2(dir).toLowerCase() === COMMAND_FILE_SUFFIX) {
      await addItem(basename2(dir).slice(0, -COMMAND_FILE_SUFFIX.length), dir);
      continue;
    }
    if (!stat3.isDirectory || !stat3.children) {
      continue;
    }
    for (const child of stat3.children) {
      if (!child.isFile || extname2(child.resource).toLowerCase() !== COMMAND_FILE_SUFFIX) {
        continue;
      }
      await addItem(basename2(child.resource).slice(0, -COMMAND_FILE_SUFFIX.length), child.resource);
    }
  }
  items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}

function getInstructionFileName(resource) {
  const fileName = basename2(resource);
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(RULE_FILE_SUFFIX)) {
    return fileName.slice(0, -RULE_FILE_SUFFIX.length);
  }
  if (lowerName.endsWith(INSTRUCTION_FILE_SUFFIX)) {
    return fileName.slice(0, -INSTRUCTION_FILE_SUFFIX.length);
  }
  return void 0;
}

async function readInstructionComponents(dirs, fileService, options) {
  const seen = /* @__PURE__ */ new Set();
  const items = [];
  const addItem = async (name, uri) => {
    if (options?.containmentRoot && !await isResolvedWithin(options.containmentRoot, uri, fileService)) {
      return;
    }
    if (!seen.has(name)) {
      seen.add(name);
      items.push({ uri, name });
    }
  };
  for (const dir of dirs) {
    let stat3;
    try {
      stat3 = await fileService.resolve(dir);
    } catch {
      continue;
    }
    if (stat3.isFile) {
      const instructionName = getInstructionFileName(dir);
      if (instructionName) {
        await addItem(instructionName, dir);
      }
      continue;
    }
    if (!stat3.isDirectory || !stat3.children) {
      continue;
    }
    for (const child of stat3.children) {
      if (!child.isFile) {
        continue;
      }
      const instructionName = getInstructionFileName(child.resource);
      if (instructionName) {
        await addItem(instructionName, child.resource);
      }
    }
  }
  items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}

async function readAgentComponents(dirs, fileService, options) {
  const files = await readMarkdownComponents(dirs, fileService, options);
  if (files.length === 0) {
    return files;
  }
  const enriched = await Promise.all(files.map(async (file) => {
    try {
      const parsed = await parseAgentFile(file.uri, fileService);
      return {
        uri: file.uri,
        name: parsed.name || file.name,
        ...parsed.description ? { description: parsed.description } : {},
        ...parsed.model ? { model: parsed.model } : {},
        ...parsed.tools?.length ? { tools: parsed.tools } : {},
        ...parsed.disableModelInvocation ? { disableModelInvocation: true } : {},
        ...parsed.userInvocable === false ? { disableUserInvocation: true } : {}
      };
    } catch {
      return file;
    }
  }));
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const item of enriched) {
    if (seen.has(item.name)) {
      continue;
    }
    seen.add(item.name);
    result.push(item);
  }
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

async function parseAgentFile(uri, fileService) {
  const nameFromFile = basename2(uri).replace(/(\.agent)?\.md$/i, "");
  try {
    const content = await fileService.readFile(uri);
    const frontmatter = parseFrontMatter(content.value.toString());
    const name = frontmatter?.getStringValue("name")?.trim() || nameFromFile;
    const description = frontmatter?.getStringValue("description")?.trim();
    const userInvocable = frontmatter?.getBooleanValue("user-invocable");
    const model = frontmatter?.getStringArrayValue("model")?.map((value) => value.trim()).find(Boolean);
    const tools = frontmatter?.getStringArrayValue("tools")?.map((value) => value.trim()).filter(Boolean);
    const infer = frontmatter?.getBooleanValue("infer");
    const disableModelInvocation = resolveAgentDisableModelInvocation(infer, frontmatter?.getBooleanValue("disable-model-invocation"));
    return { name, description, userInvocable, model, tools, disableModelInvocation };
  } catch {
    return { name: nameFromFile };
  }
}

function resolveAgentDisableModelInvocation(infer, disableModelInvocation, fallback) {
  return infer !== void 0 ? !infer : disableModelInvocation ?? fallback;
}

async function parseSkillFile(uri, fileService) {
  try {
    const content = await fileService.readFile(uri);
    const frontmatter = parseFrontMatter(content.value.toString());
    const name = frontmatter?.getStringValue("name")?.trim() || basename2(dirname2(uri));
    const description = frontmatter?.getStringValue("description")?.trim();
    const userInvokable = frontmatter?.getBooleanValue("user-invocable");
    return { name, description, userInvokable };
  } catch {
    return { name: basename2(dirname2(uri)) };
  }
}

async function parseRuleFile(uri, fileService) {
  const nameFromFile = basename2(uri).replace(/(\.instructions)?\.md$/i, "");
  try {
    const content = await fileService.readFile(uri);
    const frontmatter = parseFrontMatter(content.value.toString());
    const name = frontmatter?.getStringValue("name")?.trim() || nameFromFile;
    const description = frontmatter?.getStringValue("description")?.trim();
    const globs = frontmatter?.getStringArrayValue("globs") ?? frontmatter?.getStringArrayValue("applyTo") ?? frontmatter?.getStringArrayValue("paths") ?? void 0;
    const alwaysApply = frontmatter?.getBooleanValue("alwaysApply");
    return { name, description, globs, alwaysApply };
  } catch {
    return { name: nameFromFile };
  }
}

async function readHooks(pluginUri, paths, formatConfig, fileService, workspaceRoot, userHome) {
  for (const hookPath of paths) {
    if (formatConfig.format === 3 /* AgentPlugin */ && !await isResolvedWithin(pluginUri, hookPath, fileService)) {
      continue;
    }
    const json = await readJsonFile(hookPath, fileService);
    if (!json) {
      continue;
    }
    return formatConfig.parseHooks(hookPath, json, pluginUri, workspaceRoot, userHome);
  }
  return [];
}

async function readMcpServers(pluginUri, paths, formatConfig, fileService) {
  const merged = /* @__PURE__ */ new Map();
  for (const mcpPath of paths) {
    if (formatConfig.format === 3 /* AgentPlugin */ && !await isResolvedWithin(pluginUri, mcpPath, fileService)) {
      continue;
    }
    const json = await readJsonFile(mcpPath, fileService);
    for (const def of parseMcpServerDefinitionMap(mcpPath, json, pluginUri, formatConfig)) {
      if (!merged.has(def.name)) {
        merged.set(def.name, def);
      }
    }
  }
  return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function readPluginMcpServers(pluginUri, paths, format4, fileService) {
  return readMcpServers(pluginUri, paths, format4, fileService);
}

function parseMcpServerDefinitionMap(definitionURI, raw, pluginRoot, formatConfig) {
  const mcpServers = resolveMcpServersMap(raw);
  if (!mcpServers) {
    return [];
  }
  const pluginFsPath = pluginRoot.fsPath;
  const definitions2 = [];
  for (const [name, configValue] of Object.entries(mcpServers)) {
    const configuration = normalizeMcpServerConfiguration(configValue);
    if (!configuration) {
      continue;
    }
    let def = {
      name,
      configuration,
      ...formatConfig.format !== 3 /* AgentPlugin */ && { defaultCwd: pluginRoot },
      uri: definitionURI,
      customization: makeMcpServerCustomization(definitionURI, name)
    };
    def = interpolateMcpPluginRoot(def, pluginFsPath, formatConfig.pluginRootTokens, formatConfig.pluginRootEnvVars);
    if (formatConfig.format !== 3 /* AgentPlugin */) {
      def = convertBareEnvVarsToVsCodeSyntax(def);
    }
    definitions2.push(def);
  }
  return definitions2;
}

async function parsePlugin(pluginUri, fileService, workspaceRoot, userHome, boundaryUri) {
  const formatConfig = await detectPluginFormat(pluginUri, fileService);
  const manifest = await readPluginManifest(pluginUri, formatConfig, fileService);
  if (formatConfig.requiresManifest && !manifest) {
    throw new Error(`Plugin manifest '${joinPath(pluginUri, formatConfig.manifestPath).toString()}' is missing`);
  }
  const hooksSection = getPluginManifestComponent(formatConfig, "hooks", manifest);
  const mcpSection = getPluginManifestComponent(formatConfig, "mcpServers", manifest);
  const skillsSection = getPluginManifestComponent(formatConfig, "skills", manifest);
  const agentsSection = getPluginManifestComponent(formatConfig, "agents", manifest);
  const rulesSection = getPluginManifestComponent(formatConfig, "rules", manifest);
  const hookDirs = resolvePluginComponentDirs(pluginUri, formatConfig, "hooks", formatConfig.hookConfigPath, hooksSection, boundaryUri);
  const mcpDirs = resolvePluginComponentDirs(pluginUri, formatConfig, "mcpServers", ".mcp.json", mcpSection, boundaryUri);
  const skillDirs = resolvePluginComponentDirs(pluginUri, formatConfig, "skills", "skills", skillsSection, boundaryUri);
  const agentDirs = resolvePluginComponentDirs(pluginUri, formatConfig, "agents", "agents", agentsSection, boundaryUri);
  const instructionDirs = resolvePluginComponentDirs(pluginUri, formatConfig, "rules", "rules", rulesSection, boundaryUri);
  let embeddedMcp = [];
  if (mcpSection && typeof mcpSection === "object" && !Array.isArray(mcpSection) && !hasKey(mcpSection, { paths: true })) {
    embeddedMcp = parseMcpServerDefinitionMap(
      joinPath(pluginUri, formatConfig.manifestPath),
      { mcpServers: mcpSection },
      pluginUri,
      formatConfig
    );
  }
  let embeddedHooks = [];
  if (hooksSection && typeof hooksSection === "object" && !Array.isArray(hooksSection) && !hasKey(hooksSection, { paths: true })) {
    const manifestUri = joinPath(pluginUri, formatConfig.manifestPath);
    embeddedHooks = formatConfig.parseHooks(manifestUri, hooksSection, pluginUri, workspaceRoot, userHome);
  }
  const [hooks, mcpServers, skills, agents, instructions] = await Promise.all([
    embeddedHooks.length > 0 ? Promise.resolve(embeddedHooks) : readHooks(pluginUri, hookDirs, formatConfig, fileService, workspaceRoot, userHome),
    embeddedMcp.length > 0 ? Promise.resolve(embeddedMcp) : readPluginMcpServers(pluginUri, mcpDirs, formatConfig, fileService),
    readPluginSkills(pluginUri, skillDirs, formatConfig, fileService),
    readAgentComponents(agentDirs, fileService, formatConfig.format === 3 /* AgentPlugin */ ? { containmentRoot: pluginUri } : void 0),
    readInstructionComponents(instructionDirs, fileService, formatConfig.format === 3 /* AgentPlugin */ ? { containmentRoot: pluginUri } : void 0)
  ]);
  return {
    format: formatConfig.format,
    hooks,
    mcpServers,
    skills: skills.map(toParsedSkill),
    agents: agents.map(toParsedAgent),
    instructions: instructions.map(toParsedRule)
  };
}

function toParsedAgent(resource) {
  return { ...resource, customization: makeAgentCustomization(resource) };
}

function toParsedSkill(resource) {
  return { ...resource, customization: makeSkillCustomization(resource) };
}

function toParsedRule(resource) {
  return { ...resource, customization: makeRuleCustomization(resource) };
}
export { detectPluginFormat, readPluginManifest, getPluginManifestComponent, resolvePluginComponentDirs, buildChildId, makeAgentCustomization, makeSkillCustomization, makeRuleCustomization, makeHookCustomization, makeMcpServerCustomization, parseComponentPathConfig, resolveComponentDirs, resolveMcpServersMap, normalizeMcpServerConfiguration, shellQuotePluginRootInCommand, interpolateMcpPluginRoot, convertBareEnvVarsToVsCodeSyntax, normalizeHookCommand, resolveHookCommand, extractHookCommands, parseHooksJson, interpolateHookPluginRoot, readJsonFile, pathExists, readSkills, readPluginSkills, isResolvedWithin, readMarkdownComponents, getInstructionFileName, readInstructionComponents, readAgentComponents, parseAgentFile, resolveAgentDisableModelInvocation, parseSkillFile, parseRuleFile, readHooks, readMcpServers, readPluginMcpServers, parseMcpServerDefinitionMap, parsePlugin, toParsedAgent, toParsedSkill, toParsedRule, IParsedHookCommand, COPILOT_FORMAT, CLAUDE_FORMAT, OPEN_PLUGIN_FORMAT, AGENT_PLUGIN_COPILOT_EXTENSION_NAMESPACE, AGENT_PLUGIN_FORMAT, emptyComponentPathConfig, shellUnsafeChars, BARE_ENV_VAR_RE, HOOK_TYPE_MAP, COMMAND_FILE_SUFFIX, RULE_FILE_SUFFIX, INSTRUCTION_FILE_SUFFIX };
