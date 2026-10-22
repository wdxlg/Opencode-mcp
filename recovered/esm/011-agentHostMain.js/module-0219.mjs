// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/sandbox/common/terminalSandboxRuntimeConfigurationPerOperation.ts
import { matchesTerminalSandboxCommandRule } from "./module-0217.mjs";


// src/vs/platform/sandbox/common/terminalSandboxRuntimeConfigurationPerOperation.ts
var terminalSandboxRuntimeConfigurationCommandRules = [
  {
    keywords: ["node", "npm", "npx", "pnpm", "yarn", "corepack", "bun", "deno", "nvm", "volta", "fnm", "asdf", "mise"],
    value: "node" /* Node */
  },
  {
    keywords: ["git"],
    value: "gnupg" /* GnuPG */,
    condition: ({ os: os10 }) => os10 !== 1 /* Windows */
  }
];

function getTerminalSandboxRuntimeConfigurationForOperation(operation, os10) {
  switch (operation) {
    case "gnupg" /* GnuPG */:
      switch (os10) {
        case 1 /* Windows */:
          return {};
        case 2 /* Macintosh */:
        case 3 /* Linux */:
        default:
          return {
            network: {
              allowAllUnixSockets: true
            },
            filesystem: {
              allowRead: [
                "~/.gnupg"
              ],
              allowWrite: [
                "~/.gnupg"
              ]
            }
          };
      }
    case "node" /* Node */:
      switch (os10) {
        case 1 /* Windows */:
          return {};
        case 2 /* Macintosh */:
        case 3 /* Linux */:
        default:
          return {
            filesystem: {
              allowWrite: [
                "~/.volta/"
              ]
            }
          };
      }
  }
}

function getTerminalSandboxRuntimeConfigurationForCommands(os10, commandDetails) {
  const operations = /* @__PURE__ */ new Set();
  for (const command of commandDetails) {
    for (const rule of terminalSandboxRuntimeConfigurationCommandRules) {
      if (matchesTerminalSandboxCommandRule(command, rule, { os: os10 }) && shouldApplyRuntimeConfigurationOperation(rule.value, commandDetails)) {
        operations.add(rule.value);
      }
    }
  }
  const configuration = {};
  for (const operation of operations) {
    mergeAdditionalSandboxConfigProperties(configuration, getTerminalSandboxRuntimeConfigurationForOperation(operation, os10));
  }
  return configuration;
}

function shouldApplyRuntimeConfigurationOperation(operation, commandDetails) {
  switch (operation) {
    case "gnupg" /* GnuPG */:
      return commandDetails.every((command) => !command.keyword.toLowerCase().startsWith("docker"));
    case "node" /* Node */:
      return true;
  }
}

function mergeAdditionalSandboxConfigProperties(target, additional) {
  for (const [key, value] of Object.entries(additional)) {
    if (!Object.prototype.hasOwnProperty.call(target, key)) {
      target[key] = value;
      continue;
    }
    const existingValue = target[key];
    if (Array.isArray(existingValue) && Array.isArray(value)) {
      target[key] = [.../* @__PURE__ */ new Set([...existingValue, ...value])];
      continue;
    }
    if (isObjectForSandboxConfigMerge(existingValue) && isObjectForSandboxConfigMerge(value)) {
      mergeAdditionalSandboxConfigProperties(existingValue, value);
    }
  }
}

function isObjectForSandboxConfigMerge(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export { getTerminalSandboxRuntimeConfigurationForOperation, getTerminalSandboxRuntimeConfigurationForCommands, shouldApplyRuntimeConfigurationOperation, mergeAdditionalSandboxConfigProperties, isObjectForSandboxConfigMerge, terminalSandboxRuntimeConfigurationCommandRules };
