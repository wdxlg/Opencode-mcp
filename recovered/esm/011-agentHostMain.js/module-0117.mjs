// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/sandboxConfigSchema.ts
import { createSchema, schemaProperty } from "./module-0057.mjs";
import { localize } from "./module-0012.mjs";


// src/vs/platform/agentHost/common/sandboxConfigSchema.ts
var sandboxConfigSchema = createSchema({
  ["sandbox" /* Sandbox */]: schemaProperty({
    type: "object",
    title: localize(2157, null),
    properties: {
      ["enabled" /* Enabled */]: {
        type: "string",
        title: localize(2154, null),
        enum: ["off" /* Off */, "on" /* On */]
      },
      ["enabled.windows" /* WindowsEnabled */]: {
        type: "string",
        title: localize(2158, null),
        enum: ["off" /* Off */, "on" /* On */]
      },
      ["allowNetwork" /* AllowNetwork */]: {
        type: "boolean",
        title: localize(2150, null)
      },
      ["allowUnsandboxedCommands" /* AllowUnsandboxedCommands */]: {
        type: "boolean",
        title: localize(2151, null)
      },
      ["fileSystem.linux" /* LinuxFileSystem */]: {
        type: "object",
        title: localize(2155, null)
      },
      ["fileSystem.mac" /* MacFileSystem */]: {
        type: "object",
        title: localize(2156, null)
      },
      ["fileSystem.windows" /* WindowsFileSystem */]: {
        type: "object",
        title: localize(2159, null)
      },
      ["advanced.runtime" /* AdvancedRuntime */]: {
        type: "object",
        title: localize(2147, null)
      },
      ["allowedNetworkDomains" /* AllowedNetworkDomains */]: {
        type: "array",
        title: localize(2149, null),
        items: { type: "string", title: localize(2148, null) }
      },
      ["deniedNetworkDomains" /* DeniedNetworkDomains */]: {
        type: "array",
        title: localize(2153, null),
        items: { type: "string", title: localize(2152, null) }
      }
    }
  })
});

var sandboxSettingIdToAgentHostKey = {
  ["chat.agent.sandbox.enabled" /* AgentSandboxEnabled */]: "enabled" /* Enabled */,
  ["chat.agent.sandbox.enabledWindows" /* AgentSandboxWindowsEnabled */]: "enabled.windows" /* WindowsEnabled */,
  ["chat.agent.sandbox.allowNetwork" /* AgentSandboxAllowNetwork */]: "allowNetwork" /* AllowNetwork */,
  ["chat.agent.sandbox.allowUnsandboxedCommands" /* AgentSandboxAllowUnsandboxedCommands */]: "allowUnsandboxedCommands" /* AllowUnsandboxedCommands */,
  ["chat.agent.sandbox.fileSystem.linux" /* AgentSandboxLinuxFileSystem */]: "fileSystem.linux" /* LinuxFileSystem */,
  ["chat.agent.sandbox.fileSystem.mac" /* AgentSandboxMacFileSystem */]: "fileSystem.mac" /* MacFileSystem */,
  ["chat.agent.sandbox.fileSystem.windows" /* AgentSandboxWindowsFileSystem */]: "fileSystem.windows" /* WindowsFileSystem */,
  ["chat.agent.sandbox.advanced.runtime" /* AgentSandboxAdvancedRuntime */]: "advanced.runtime" /* AdvancedRuntime */,
  ["chat.agent.allowedNetworkDomains" /* AllowedNetworkDomains */]: "allowedNetworkDomains" /* AllowedNetworkDomains */,
  ["chat.agent.deniedNetworkDomains" /* DeniedNetworkDomains */]: "deniedNetworkDomains" /* DeniedNetworkDomains */
};
export { sandboxConfigSchema, sandboxSettingIdToAgentHostKey };
