// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/hookSchema.ts
import { HOOKS_BY_TARGET, HOOK_METADATA, HookType } from "./module-0197.mjs";
import { IParsedHookCommand } from "./module-0195.mjs";
import { localize } from "./module-0015.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/hookSchema.ts
var ChatRequestHooks;

((ChatRequestHooks4) => {
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
        for (let i = 0; i < aArr.length; i++) {
          if (!IParsedHookCommand.isEquals(aArr[i], bArr[i])) {
            return false;
          }
        }
      }
    }
    return true;
  }
  ChatRequestHooks4.isEquals = isEquals;
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
    Object.entries(HOOKS_BY_TARGET[target]).map(([key, hookType]) => [
      key,
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
export { mergeHooks, buildHookProperties, resolveEffectiveCommand, ChatRequestHooks, HOOK_COMMAND_FIELD_DESCRIPTIONS, vscodeHookCommandSchema, hookArraySchema, vscodeHookProperties, copilotCliHookCommandSchema, copilotCliHookArraySchema, copilotCliHookProperties, hookFileSchema };
