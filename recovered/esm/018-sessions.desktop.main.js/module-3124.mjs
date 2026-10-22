// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/sandbox/common/terminalSandboxRuntimeConfigurationPerOperation.ts
import { matchesTerminalSandboxCommandRule } from "./module-3122.mjs";


// src/vs/platform/sandbox/common/terminalSandboxRuntimeConfigurationPerOperation.ts
var terminalSandboxRuntimeConfigurationCommandRules = [
  {
    keywords: ["node", "npm", "npx", "pnpm", "yarn", "corepack", "bun", "deno", "nvm", "volta", "fnm", "asdf", "mise"],
    value: "node" /* Node */
  },
  {
    keywords: ["git"],
    value: "gnupg" /* GnuPG */,
    condition: ({ os }) => os !== 1 /* Windows */
  }
];

function getTerminalSandboxRuntimeConfigurationForOperation(operation, os) {
  switch (operation) {
    case "gnupg" /* GnuPG */:
      switch (os) {
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
      switch (os) {
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

function getTerminalSandboxRuntimeConfigurationForCommands(os, commandDetails) {
  const operations = /* @__PURE__ */ new Set();
  for (const command4 of commandDetails) {
    for (const rule of terminalSandboxRuntimeConfigurationCommandRules) {
      if (matchesTerminalSandboxCommandRule(command4, rule, { os }) && shouldApplyRuntimeConfigurationOperation(rule.value, commandDetails)) {
        operations.add(rule.value);
      }
    }
  }
  const configuration2 = {};
  for (const operation of operations) {
    mergeAdditionalSandboxConfigProperties(configuration2, getTerminalSandboxRuntimeConfigurationForOperation(operation, os));
  }
  return configuration2;
}

function shouldApplyRuntimeConfigurationOperation(operation, commandDetails) {
  switch (operation) {
    case "gnupg" /* GnuPG */:
      return commandDetails.every((command4) => !command4.keyword.toLowerCase().startsWith("docker"));
    case "node" /* Node */:
      return true;
  }
}

function mergeAdditionalSandboxConfigProperties(target, additional) {
  for (const [key3, value2] of Object.entries(additional)) {
    if (!Object.prototype.hasOwnProperty.call(target, key3)) {
      target[key3] = value2;
      continue;
    }
    const existingValue = target[key3];
    if (Array.isArray(existingValue) && Array.isArray(value2)) {
      target[key3] = [.../* @__PURE__ */ new Set([...existingValue, ...value2])];
      continue;
    }
    if (isObjectForSandboxConfigMerge(existingValue) && isObjectForSandboxConfigMerge(value2)) {
      mergeAdditionalSandboxConfigProperties(existingValue, value2);
    }
  }
}

function isObjectForSandboxConfigMerge(value2) {
  return typeof value2 === "object" && value2 !== null && !Array.isArray(value2);
}
export { getTerminalSandboxRuntimeConfigurationForOperation, getTerminalSandboxRuntimeConfigurationForCommands, shouldApplyRuntimeConfigurationOperation, mergeAdditionalSandboxConfigProperties, isObjectForSandboxConfigMerge, terminalSandboxRuntimeConfigurationCommandRules };
