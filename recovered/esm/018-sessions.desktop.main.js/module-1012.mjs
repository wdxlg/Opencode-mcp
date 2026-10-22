// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/hookSchema.ts
import { HOOKS_BY_TARGET, HOOK_METADATA, HookType } from "./module-1011.mjs";
import { IParsedHookCommand } from "./module-1010.mjs";
import { localize } from "./module-0001.mjs";
import { untildify } from "./module-0711.mjs";
import { isAbsolute } from "./module-0026.mjs";
import { URI } from "./module-0032.mjs";
import { joinPath } from "./module-0034.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/hookSchema.ts
var ChatRequestHooks;

((ChatRequestHooks7) => {
  function isEquals(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    for (const hookType of Object.values(HookType)) {
      const aArr = a[hookType];
      const bArr = b[hookType];
      if (aArr?.length !== bArr?.length) {
        return false;
      }
      if (aArr && bArr) {
        for (let i2 = 0; i2 < aArr.length; i2++) {
          if (!IParsedHookCommand.isEquals(aArr[i2], bArr[i2])) {
            return false;
          }
        }
      }
    }
    return true;
  }
  ChatRequestHooks7.isEquals = isEquals;
})(ChatRequestHooks || (ChatRequestHooks = {}));

function mergeHooks(base, additional) {
  if (!base) {
    return additional;
  }
  const result = { ...base };
  for (const hookType of Object.values(HookType)) {
    const baseArr = base[hookType];
    const additionalArr = additional[hookType];
    if (additionalArr && additionalArr.length > 0) {
      result[hookType] = baseArr ? [...baseArr, ...additionalArr] : additionalArr;
    }
  }
  return result;
}

var HOOK_COMMAND_FIELD_DESCRIPTIONS = {
  type: localize(13058, null),
  command: localize(13049, null),
  windows: localize(13059, null),
  linux: localize(13053, null),
  osx: localize(13054, null),
  bash: localize(13047, null),
  powershell: localize(13055, null),
  cwd: localize(13051, null),
  env: localize(13052, null),
  timeout: localize(13056, null),
  timeoutSec: localize(13057, null)
};

var vscodeHookCommandSchema = {
  type: "object",
  additionalProperties: true,
  required: ["type"],
  anyOf: [
    { required: ["command"] },
    { required: ["windows"] },
    { required: ["linux"] },
    { required: ["osx"] },
    { required: ["bash"] },
    { required: ["powershell"] }
  ],
  errorMessage: localize(13050, null),
  properties: {
    type: {
      type: "string",
      enum: ["command"],
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.type
    },
    command: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.command
    },
    windows: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.windows
    },
    linux: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.linux
    },
    osx: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.osx
    },
    cwd: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.cwd
    },
    env: {
      type: "object",
      additionalProperties: { type: "string" },
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.env
    },
    timeout: {
      type: "number",
      default: 30,
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.timeout
    }
  }
};

var hookArraySchema = {
  type: "array",
  items: vscodeHookCommandSchema
};

function buildHookProperties(target, arraySchema) {
  return Object.fromEntries(
    Object.entries(HOOKS_BY_TARGET[target]).map(([key3, hookType]) => [
      key3,
      { ...arraySchema, description: HOOK_METADATA[hookType]?.description }
    ])
  );
}

var vscodeHookProperties = buildHookProperties("vscode" /* VSCode */, hookArraySchema);

var copilotCliHookCommandSchema = {
  type: "object",
  additionalProperties: true,
  required: ["type"],
  anyOf: [
    { required: ["bash"] },
    { required: ["powershell"] }
  ],
  errorMessage: localize(13048, null),
  properties: {
    type: {
      type: "string",
      enum: ["command"],
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.type
    },
    bash: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.bash
    },
    powershell: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.powershell
    },
    cwd: {
      type: "string",
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.cwd
    },
    env: {
      type: "object",
      additionalProperties: { type: "string" },
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.env
    },
    timeoutSec: {
      type: "number",
      default: 10,
      description: HOOK_COMMAND_FIELD_DESCRIPTIONS.timeoutSec
    }
  }
};

var copilotCliHookArraySchema = {
  type: "array",
  items: copilotCliHookCommandSchema
};

var copilotCliHookProperties = buildHookProperties("github-copilot" /* GitHubCopilot */, copilotCliHookArraySchema);

var hookFileSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  description: localize(13060, null),
  additionalProperties: true,
  required: ["hooks"],
  properties: {
    hooks: {
      type: "object",
      description: localize(13061, null),
      additionalProperties: true
    }
  },
  // Conditionally apply PascalCase or camelCase hook properties based on
  // whether the file uses the Copilot CLI format (detected by the "version" field).
  if: {
    required: ["version"],
    properties: {
      version: { type: "number" }
    }
  },
  then: {
    // Copilot CLI format: camelCase hook names, bash/powershell/timeoutSec fields
    properties: {
      version: {
        type: "number",
        description: localize(13064, null)
      },
      hooks: {
        properties: copilotCliHookProperties
      }
    }
  },
  else: {
    // VS Code / PascalCase format
    properties: {
      hooks: {
        properties: vscodeHookProperties
      }
    }
  },
  defaultSnippets: [
    {
      label: localize(13062, null),
      description: localize(13063, null),
      body: {
        hooks: {
          SessionStart: [
            {
              type: "command",
              command: '${1:echo "Session started" >> session.log}'
            }
          ],
          PreToolUse: [
            {
              type: "command",
              command: "${2:./scripts/validate.sh}",
              timeout: 15
            }
          ]
        }
      }
    }
  ]
};

var HOOK_SCHEMA_URI = "vscode://schemas/hooks";

function toHookType(rawHookTypeId) {
  if (Object.values(HookType).includes(rawHookTypeId)) {
    return rawHookTypeId;
  }
  return void 0;
}

function normalizeHookCommand2(raw) {
  if (raw.type !== "command") {
    return void 0;
  }
  const hasCommand = typeof raw.command === "string" && raw.command.length > 0;
  const hasBash = typeof raw.bash === "string" && raw.bash.length > 0;
  const hasPowerShell = typeof raw.powershell === "string" && raw.powershell.length > 0;
  const hasWindows = typeof raw.windows === "string" && raw.windows.length > 0;
  const hasLinux = typeof raw.linux === "string" && raw.linux.length > 0;
  const hasOsx = typeof raw.osx === "string" && raw.osx.length > 0;
  const windows = hasWindows ? raw.windows : hasPowerShell ? raw.powershell : void 0;
  const linux = hasLinux ? raw.linux : hasBash ? raw.bash : void 0;
  const osx = hasOsx ? raw.osx : hasBash ? raw.bash : void 0;
  const windowsSource = hasWindows ? "windows" : hasPowerShell ? "powershell" : void 0;
  const linuxSource = hasLinux ? "linux" : hasBash ? "bash" : void 0;
  const osxSource = hasOsx ? "osx" : hasBash ? "bash" : void 0;
  return {
    ...hasCommand && { command: raw.command },
    ...windows && { windows },
    ...linux && { linux },
    ...osx && { osx },
    ...windowsSource && { windowsSource },
    ...linuxSource && { linuxSource },
    ...osxSource && { osxSource },
    ...typeof raw.cwd === "string" && { cwd: raw.cwd },
    ...typeof raw.env === "object" && raw.env !== null && { env: raw.env },
    ...typeof raw.timeout !== "number" && typeof raw.timeoutSec === "number" && { timeout: raw.timeoutSec },
    ...typeof raw.timeout === "number" && { timeout: raw.timeout }
  };
}

function resolveEffectiveCommand(hook, os) {
  if (os === 1 /* Windows */ && hook.windows) {
    return hook.windows;
  } else if (os === 2 /* Macintosh */ && hook.osx) {
    return hook.osx;
  } else if (os === 3 /* Linux */ && hook.linux) {
    return hook.linux;
  }
  return hook.command;
}

function getEffectiveCommandFieldKey(hook, os) {
  const h3 = hook;
  if (os === 1 /* Windows */ && hook.windows) {
    return h3.windowsSource ?? "windows";
  } else if (os === 2 /* Macintosh */ && hook.osx) {
    return h3.osxSource ?? "osx";
  } else if (os === 3 /* Linux */ && hook.linux) {
    return h3.linuxSource ?? "linux";
  }
  return "command";
}

function formatHookCommandLabel(hook, os) {
  const command4 = resolveEffectiveCommand(hook, os);
  if (!command4) {
    return "";
  }
  return command4;
}

function resolveHookCommand2(raw, workspaceRootUri, userHome) {
  const normalized = normalizeHookCommand2(raw);
  if (!normalized) {
    return void 0;
  }
  let cwdUri;
  if (normalized.cwd) {
    const expandedCwd = untildify(normalized.cwd, userHome);
    if (isAbsolute(expandedCwd)) {
      cwdUri = URI.file(expandedCwd);
    } else if (workspaceRootUri) {
      cwdUri = joinPath(workspaceRootUri, expandedCwd);
    }
  } else {
    cwdUri = workspaceRootUri;
  }
  return {
    type: "command",
    ...normalized.command && { command: normalized.command },
    ...normalized.windows && { windows: normalized.windows },
    ...normalized.linux && { linux: normalized.linux },
    ...normalized.osx && { osx: normalized.osx },
    ...normalized.windowsSource && { windowsSource: normalized.windowsSource },
    ...normalized.linuxSource && { linuxSource: normalized.linuxSource },
    ...normalized.osxSource && { osxSource: normalized.osxSource },
    ...cwdUri && { cwd: cwdUri },
    ...normalized.env && { env: normalized.env },
    ...normalized.timeout !== void 0 && { timeout: normalized.timeout }
  };
}

function extractHookCommandsFromItem(item, workspaceRootUri, userHome) {
  if (!item || typeof item !== "object") {
    return [];
  }
  const itemObj = item;
  const commands = [];
  const nestedHooks = itemObj.hooks;
  if (nestedHooks !== void 0 && Array.isArray(nestedHooks)) {
    for (const nestedHook of nestedHooks) {
      if (!nestedHook || typeof nestedHook !== "object") {
        continue;
      }
      const normalized = normalizeForResolve(nestedHook);
      const resolved = resolveHookCommand2(normalized, workspaceRootUri, userHome);
      if (resolved) {
        commands.push(resolved);
      }
    }
  } else {
    const normalized = normalizeForResolve(itemObj);
    const resolved = resolveHookCommand2(normalized, workspaceRootUri, userHome);
    if (resolved) {
      commands.push(resolved);
    }
  }
  return commands;
}

function normalizeForResolve(raw) {
  if (raw.type === void 0 || raw.type === "command") {
    return { ...raw, type: "command" };
  }
  return raw;
}

function yamlValueToPlain(value2) {
  switch (value2.type) {
    case "scalar":
      return value2.value;
    case "sequence":
      return value2.items.map(yamlValueToPlain);
    case "map": {
      const obj = {};
      for (const prop of value2.properties) {
        obj[prop.key.value] = yamlValueToPlain(prop.value);
      }
      return obj;
    }
  }
}

function parseSubagentHooksFromYaml(hooksMap, workspaceRootUri, userHome, target = "undefined" /* Undefined */) {
  const result = {};
  const targetHookMap = HOOKS_BY_TARGET[target] ?? HOOKS_BY_TARGET["undefined" /* Undefined */];
  for (const prop of hooksMap.properties) {
    const hookTypeName = prop.key.value;
    const hookType = targetHookMap[hookTypeName] ?? toHookType(hookTypeName);
    if (!hookType) {
      continue;
    }
    if (prop.value.type !== "sequence") {
      continue;
    }
    const commands = [];
    for (const item of prop.value.items) {
      const plainItem = yamlValueToPlain(item);
      const extracted = extractHookCommandsFromItem(plainItem, workspaceRootUri, userHome);
      commands.push(...extracted);
    }
    if (commands.length > 0) {
      if (!result[hookType]) {
        result[hookType] = [];
      }
      result[hookType].push(...commands);
    }
  }
  return result;
}
export { mergeHooks, buildHookProperties, toHookType, normalizeHookCommand2, resolveEffectiveCommand, getEffectiveCommandFieldKey, formatHookCommandLabel, resolveHookCommand2, extractHookCommandsFromItem, normalizeForResolve, yamlValueToPlain, parseSubagentHooksFromYaml, ChatRequestHooks, HOOK_COMMAND_FIELD_DESCRIPTIONS, vscodeHookCommandSchema, hookArraySchema, vscodeHookProperties, copilotCliHookCommandSchema, copilotCliHookArraySchema, copilotCliHookProperties, hookFileSchema, HOOK_SCHEMA_URI };
