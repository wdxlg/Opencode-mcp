// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotPluginConverters.ts
import { resolveMcpServerWorkingDirectory } from "./module-0209.mjs";
import { parseFrontMatter } from "./module-0123.mjs";
import { Schemas } from "./module-0024.mjs";
import { dirname } from "./module-0018.mjs";
import { OS } from "./module-0013.mjs";


// src/vs/platform/agentHost/node/copilot/copilotPluginConverters.ts
import { spawn as spawn3 } from "child_process";


// src/vs/platform/agentHost/node/copilot/copilotPluginConverters.ts
function toSdkMcpServers(defs) {
  const result = {};
  for (const def of defs) {
    result[def.name] = toSdkMcpServer(def.name, def.configuration, def.defaultCwd);
  }
  return result;
}

function toSdkMcpServersFromConfigMap(servers) {
  const result = {};
  for (const [name, config] of Object.entries(servers)) {
    if (isSupportedMcpServerConfiguration(config)) {
      result[name] = toSdkMcpServer(name, config);
    }
  }
  return result;
}

function isSupportedMcpServerConfiguration(value) {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value;
  if (candidate.type === "stdio" /* LOCAL */) {
    return typeof candidate.command === "string";
  }
  if (candidate.type === "http" /* REMOTE */) {
    return typeof candidate.url === "string";
  }
  return false;
}

function toSdkMcpServer(_name, config, defaultCwd) {
  if (config.type === "stdio" /* LOCAL */) {
    const effectiveCwd = resolveMcpServerWorkingDirectory(config.cwd, defaultCwd);
    return {
      type: "local",
      command: config.command,
      args: config.args ? [...config.args] : [],
      tools: ["*"],
      ...config.env && { env: toStringEnv(config.env) },
      ...effectiveCwd ? { cwd: effectiveCwd } : {}
    };
  }
  return {
    type: config.transport === "sse" ? "sse" : "http",
    url: config.url,
    tools: ["*"],
    ...config.headers && { headers: { ...config.headers } }
  };
}

function toStringEnv(env2) {
  const result = {};
  for (const [key, value] of Object.entries(env2)) {
    if (value !== null) {
      result[key] = String(value);
    }
  }
  return result;
}

var customAgentReasoningEfforts = ["low", "medium", "high", "xhigh", "max"];

function isCustomAgentReasoningEffort(value) {
  return customAgentReasoningEfforts.some((reasoningEffort) => reasoningEffort === value);
}

async function toSdkCustomAgents(agents, fileService) {
  const configs = [];
  for (const agent of agents) {
    try {
      const content = await fileService.readFile(agent.uri);
      const raw = content.value.toString();
      const md3 = parseFrontMatter(raw);
      if (!md3) {
        configs.push({
          name: agent.name,
          prompt: raw
        });
      } else {
        const name = md3.getStringValue("name")?.trim() || agent.name;
        const description = md3.getStringValue("description");
        const tools = md3.getStringArrayValue("tools");
        const skills = md3.getStringArrayValue("skills");
        const reasoningEffort = md3.getStringValue("reasoning-effort");
        let infer = md3.getBooleanValue("infer");
        const disableModelInvocation = md3.getBooleanValue("disable-model-invocation");
        if (infer === void 0 && disableModelInvocation === true) {
          infer = false;
        }
        const prompt = md3.body ?? raw;
        let model = md3.getStringValue("model") ?? void 0;
        const models = md3.getStringArrayValue("model") ?? void 0;
        if (!model && models && Array.isArray(models) && models.length > 0) {
          model = models[0];
        }
        configs.push({
          name,
          ...description ? { description } : {},
          ...model ? { model } : {},
          ...isCustomAgentReasoningEffort(reasoningEffort) ? { reasoningEffort } : {},
          tools: tools && tools.length > 0 ? tools : null,
          ...skills !== void 0 ? { skills } : {},
          ...infer !== void 0 ? { infer } : {},
          prompt
        });
      }
    } catch {
    }
  }
  return configs;
}

async function toSdkSessionCustomAgents(plugins, resolvedAgentName, fileService) {
  const pluginsWithoutDirs = plugins.filter((p) => !p.pluginDir || p.pluginDir.scheme !== Schemas.file);
  const customAgents = await toSdkCustomAgents(pluginsWithoutDirs.flatMap((p) => p.agents), fileService);
  if (resolvedAgentName && !customAgents.some((agent) => agent.name === resolvedAgentName)) {
    const selectedAgents = plugins.flatMap((p) => p.agents).filter((agent) => agent.name === resolvedAgentName);
    for (const config of await toSdkCustomAgents(selectedAgents, fileService)) {
      if (!customAgents.some((agent) => agent.name === config.name)) {
        customAgents.push(config);
      }
    }
  }
  return customAgents;
}

function toChildCustomizations(plugins) {
  const byId = /* @__PURE__ */ new Map();
  const add = (c) => {
    if (!byId.has(c.id)) {
      byId.set(c.id, c);
    }
  };
  for (const plugin of plugins) {
    for (const a of plugin.agents) {
      add(a.customization);
    }
    for (const s of plugin.skills) {
      add(s.customization);
    }
    for (const r of plugin.instructions) {
      add(r.customization);
    }
    for (const h of plugin.hooks) {
      add(h.customization);
    }
    for (const m of plugin.mcpServers) {
      add(m.customization);
    }
  }
  return [...byId.values()];
}

function toSdkSkillDirectories(skills) {
  return toSdkResourceDirectories(skills);
}

function toSdkInstructionDirectories(instructions) {
  return toSdkResourceDirectories(instructions);
}

function toSdkResourceDirectories(resources) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const resource of resources) {
    const dir = dirname(resource.uri.fsPath);
    if (!seen.has(dir)) {
      seen.add(dir);
      result.push(dir);
    }
  }
  return result;
}

function resolveEffectiveCommand(hook, os10) {
  if (os10 === 1 /* Windows */ && hook.windows) {
    return hook.windows;
  } else if (os10 === 2 /* Macintosh */ && hook.osx) {
    return hook.osx;
  } else if (os10 === 3 /* Linux */ && hook.linux) {
    return hook.linux;
  }
  return hook.command;
}

function executeHookCommand(hook, stdin) {
  const command = resolveEffectiveCommand(hook, OS);
  if (!command) {
    return Promise.resolve("");
  }
  const timeout2 = (hook.timeout ?? 30) * 1e3;
  const cwd3 = hook.cwd?.fsPath;
  return new Promise((resolve3, reject) => {
    const isWindows2 = OS === 1 /* Windows */;
    const shell = isWindows2 ? "cmd.exe" : "/bin/sh";
    const shellArgs = isWindows2 ? ["/c", command] : ["-c", command];
    const child = spawn3(shell, shellArgs, {
      cwd: cwd3,
      env: { ...process.env, ...hook.env },
      stdio: ["pipe", "pipe", "pipe"],
      timeout: timeout2
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    } else {
      child.stdin.end();
    }
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve3(stdout);
      } else {
        reject(new Error(`Hook command exited with code ${code}: ${stderr || stdout}`));
      }
    });
  });
}

async function runHookCommands(commands, input) {
  if (!commands) {
    return void 0;
  }
  const stdin = JSON.stringify(input);
  for (const cmd of commands) {
    try {
      const output = await executeHookCommand(cmd, stdin);
      if (output.trim()) {
        try {
          const parsed = JSON.parse(output);
          if (parsed && typeof parsed === "object") {
            return parsed;
          }
        } catch {
        }
      }
    } catch {
    }
  }
  return void 0;
}

var HOOK_TYPE_TO_SDK_KEY = {
  "PreToolUse": "onPreToolUse",
  "PostToolUse": "onPostToolUse",
  "UserPromptSubmit": "onUserPromptSubmitted",
  "SessionStart": "onSessionStart",
  "SessionEnd": "onSessionEnd",
  "ErrorOccurred": "onErrorOccurred"
};

function toSdkHooks(hookGroups, editTrackingHooks) {
  const commandsByKey = /* @__PURE__ */ new Map();
  for (const group of hookGroups) {
    const sdkKey = HOOK_TYPE_TO_SDK_KEY[group.type];
    if (!sdkKey) {
      continue;
    }
    const existing = commandsByKey.get(sdkKey) ?? [];
    existing.push(...group.commands);
    commandsByKey.set(sdkKey, existing);
  }
  const hooks = {};
  const preToolCommands = commandsByKey.get("onPreToolUse");
  if (preToolCommands?.length || editTrackingHooks) {
    hooks.onPreToolUse = async (input) => {
      await editTrackingHooks?.onPreToolUse(input);
      return runHookCommands(preToolCommands, input);
    };
  }
  const postToolCommands = commandsByKey.get("onPostToolUse");
  if (postToolCommands?.length || editTrackingHooks) {
    hooks.onPostToolUse = async (input) => {
      await editTrackingHooks?.onPostToolUse(input);
      return runHookCommands(postToolCommands, input);
    };
  }
  const promptCommands = commandsByKey.get("onUserPromptSubmitted");
  if (promptCommands?.length || editTrackingHooks?.onUserPromptSubmitted) {
    hooks.onUserPromptSubmitted = async (input) => {
      const stdin = JSON.stringify(input);
      for (const cmd of promptCommands ?? []) {
        try {
          await executeHookCommand(cmd, stdin);
        } catch {
        }
      }
      return editTrackingHooks?.onUserPromptSubmitted?.();
    };
  }
  const startCommands = commandsByKey.get("onSessionStart");
  if (startCommands?.length) {
    hooks.onSessionStart = async (input) => {
      const stdin = JSON.stringify(input);
      for (const cmd of startCommands) {
        try {
          await executeHookCommand(cmd, stdin);
        } catch {
        }
      }
    };
  }
  const endCommands = commandsByKey.get("onSessionEnd");
  if (endCommands?.length) {
    hooks.onSessionEnd = async (input) => {
      const stdin = JSON.stringify(input);
      for (const cmd of endCommands) {
        try {
          await executeHookCommand(cmd, stdin);
        } catch {
        }
      }
    };
  }
  const errorCommands = commandsByKey.get("onErrorOccurred");
  if (errorCommands?.length) {
    hooks.onErrorOccurred = async (input) => {
      const stdin = JSON.stringify(input);
      for (const cmd of errorCommands) {
        try {
          await executeHookCommand(cmd, stdin);
        } catch {
        }
      }
    };
  }
  return hooks;
}

function parsedPluginsEqual(a, b) {
  const serialize2 = (plugins) => {
    return JSON.stringify(plugins.map((p) => ({
      format: p.format,
      hooks: p.hooks.map((h) => ({ type: h.type, commands: h.commands.map((c) => ({ command: c.command, windows: c.windows, linux: c.linux, osx: c.osx, cwd: c.cwd?.toString(), env: c.env, timeout: c.timeout })) })),
      mcpServers: p.mcpServers.map((m) => ({ name: m.name, configuration: m.configuration, defaultCwd: m.defaultCwd?.toString() })),
      skills: p.skills.map((s) => ({ uri: s.uri.toString(), name: s.name })),
      agents: p.agents.map((a2) => ({ uri: a2.uri.toString(), name: a2.name })),
      instructions: p.instructions.map((i) => ({ uri: i.uri.toString(), name: i.name }))
    })));
  };
  return serialize2(a) === serialize2(b);
}
export { toSdkMcpServers, toSdkMcpServersFromConfigMap, isSupportedMcpServerConfiguration, toSdkMcpServer, toStringEnv, isCustomAgentReasoningEffort, toSdkCustomAgents, toSdkSessionCustomAgents, toChildCustomizations, toSdkSkillDirectories, toSdkInstructionDirectories, toSdkResourceDirectories, resolveEffectiveCommand, executeHookCommand, runHookCommands, toSdkHooks, parsedPluginsEqual, spawn3, customAgentReasoningEfforts, HOOK_TYPE_TO_SDK_KEY };
