// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostLocalCustomizations.ts
import { ResourceSet } from "./module-0008.mjs";
import { isUserToggleableCustomization, matchesSessionType } from "./module-0986.mjs";
import { PromptFileParser } from "./module-1003.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { AICustomizationSources } from "./module-0995.mjs";
import { basename2, isEqualOrParent2 } from "./module-0034.mjs";
import { resolveMcpServersForAgentHostDelivery } from "./module-2114.mjs";
import { withCustomizationEnablement } from "./module-2112.mjs";
import { customizationId } from "./module-1007.mjs";
import { isDefined } from "./module-0010.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostLocalCustomizations.ts
var SYNCABLE_PROMPT_TYPES = [
  "agent" /* agent */,
  "skill" /* skill */,
  "instructions" /* instructions */,
  "prompt" /* prompt */
];

var SYNCABLE_STORAGE_SOURCES = [
  "plugin" /* plugin */,
  "extension" /* extension */,
  "builtin" /* builtIn */
];

async function enumerateLocalCustomizationsForHarness(promptsService, syncProvider, sessionType, token, options3) {
  const result = [];
  const seenUris = new ResourceSet();
  const storageSources = options3?.includeUserStorage ? ["user" /* user */, ...SYNCABLE_STORAGE_SOURCES] : SYNCABLE_STORAGE_SOURCES;
  for (const type of SYNCABLE_PROMPT_TYPES) {
    const userDisabled = promptsService.getDisabledPromptFiles(type);
    const lists = await Promise.all(
      storageSources.map((storage) => promptsService.listPromptFilesForStorage(type, storage, token))
    );
    for (let i2 = 0; i2 < lists.length; i2++) {
      const source = storageSources[i2];
      const honourUserDisabled = isUserToggleableCustomization(type, source);
      for (const file of lists[i2]) {
        if (matchesSessionType(file.sessionTypes, sessionType) && !seenUris.has(file.uri)) {
          seenUris.add(file.uri);
          result.push({
            uri: file.uri,
            type,
            source,
            pluginUri: file.pluginUri,
            extensionId: file.extension?.identifier.value,
            disabled: syncProvider.isDisabled(file.uri) || honourUserDisabled && userDisabled.has(file.uri)
          });
        }
      }
    }
  }
  return result;
}

async function resolveLocalCustomAgents(fileService, promptsService, syncProvider, agentPluginService, sessionType, options3) {
  const plugins = agentPluginService.plugins.get();
  const result = [];
  const parser2 = new PromptFileParser();
  const pending = [];
  const enumerated = await enumerateLocalCustomizationsForHarness(promptsService, syncProvider, sessionType, CancellationToken.None, options3);
  for (const agent of enumerated) {
    if (agent.type !== "agent" /* agent */ || agent.disabled) {
      continue;
    }
    const plugin = agent.source === AICustomizationSources.plugin ? plugins.find((candidate) => isEqualOrParent2(agent.uri, candidate.uri)) : void 0;
    if (agent.source === AICustomizationSources.plugin && !plugin) {
      continue;
    }
    const pluginAgent = plugin?.agents.get().find((candidate) => candidate.uri.toString() === agent.uri.toString());
    pending.push((async () => {
      let name = pluginAgent?.name ?? basename2(agent.uri, ".agent.md");
      let description = pluginAgent?.description;
      let disableUserInvocation;
      try {
        const content2 = await fileService.readFile(agent.uri);
        const header2 = parser2.parse(agent.uri, content2.value.toString()).header;
        name = header2?.name ?? name;
        description = header2?.description ?? description;
        disableUserInvocation = header2?.userInvocable === false || void 0;
      } catch {
      }
      result.push({
        type: "agent" /* Agent */,
        id: agent.uri.toString(),
        uri: agent.uri.toString(),
        name,
        description,
        disableUserInvocation
      });
    })());
  }
  await Promise.all(pending);
  result.sort((a, b) => a.name.localeCompare(b.name) || a.uri.toString().localeCompare(b.uri.toString()));
  return result;
}

async function collectNonPluginMcpServers(mcpService, configurationResolverService, sessionType, workingDirectories) {
  const resolved = await resolveMcpServersForAgentHostDelivery(mcpService.servers.get(), configurationResolverService, sessionType, workingDirectories);
  return resolved.flatMap(({ server, definition, delivery, projectedConfiguration }) => {
    if (delivery !== "clientForwarded" /* ClientForwarded */ || !definition || !projectedConfiguration) {
      return [];
    }
    return [{
      name: server.definition.label,
      configuration: projectedConfiguration,
      ...definition.defaultCwd && { defaultCwd: definition.defaultCwd },
      enablement: withCustomizationEnablement(void 0, "global" /* Global */, {
        kind: "global" /* Global */,
        enabled: mcpService.enablementModel.readProfileEnabled(server.definition.id)
      })
    }];
  });
}

async function resolveCustomizationRefs(fileService, promptsService, syncProvider, agentPluginService, mcpService, configurationResolverService, bundler, sessionType, options3, workingDirectories = []) {
  const enumerated = await enumerateLocalCustomizationsForHarness(promptsService, syncProvider, sessionType, CancellationToken.None, options3);
  const enabled = enumerated.filter((e) => !e.disabled);
  const plugins = agentPluginService.plugins.get();
  const pluginRefs = /* @__PURE__ */ new Map();
  const looseFiles = [];
  const addPluginRef = (plugin) => {
    const key3 = plugin.uri.toString();
    if (!pluginRefs.has(key3)) {
      const promise = (async () => {
        let nonce;
        try {
          nonce = (await fileService.stat(plugin.uri)).mtime;
        } catch {
        }
        const ref = {
          type: "plugin" /* Plugin */,
          id: customizationId(key3),
          uri: key3,
          name: plugin.label,
          enablement: withCustomizationEnablement(void 0, "global" /* Global */, {
            kind: "global" /* Global */,
            enabled: agentPluginService.enablementModel.readProfileEnabled(key3)
          })
        };
        if (nonce !== void 0) {
          ref.nonce = nonce.toString(16);
        }
        return ref;
      })();
      pluginRefs.set(key3, promise);
    }
  };
  for (const entry of enabled) {
    if (entry.source === AICustomizationSources.plugin) {
      const plugin = plugins.find((p) => isEqualOrParent2(entry.uri, p.uri));
      if (!plugin) {
        continue;
      }
      addPluginRef(plugin);
    } else {
      looseFiles.push({ uri: entry.uri, type: entry.type, source: entry.source, extensionId: entry.extensionId, pluginUri: entry.pluginUri });
    }
  }
  for (const plugin of plugins) {
    if (pluginRefs.has(plugin.uri.toString())) {
      continue;
    }
    if (plugin.hooks.get().length === 0 && plugin.commands.get().length === 0 && plugin.skills.get().length === 0 && plugin.agents.get().length === 0 && plugin.instructions.get().length === 0 && plugin.mcpServerDefinitions.get().length === 0) {
      continue;
    }
    addPluginRef(plugin);
  }
  const refs = [...pluginRefs.values()];
  const mcpServers = await collectNonPluginMcpServers(mcpService, configurationResolverService, sessionType, workingDirectories);
  if (looseFiles.length > 0 || mcpServers.length > 0) {
    refs.push(bundler.bundle(looseFiles, mcpServers).then((r2) => r2?.ref));
  }
  return await Promise.all(refs).then((r2) => r2.filter(isDefined));
}
export { enumerateLocalCustomizationsForHarness, resolveLocalCustomAgents, collectNonPluginMcpServers, resolveCustomizationRefs, SYNCABLE_PROMPT_TYPES, SYNCABLE_STORAGE_SOURCES };
