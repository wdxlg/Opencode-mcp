// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/promptsServiceCustomizationItemProvider.ts
import { Event2 } from "./module-0017.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { IPromptsService, matchesSessionType } from "./module-0987.mjs";
import { getSourceDescription } from "./module-0986.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { basename2, dirname2 } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { getFriendlyName, isChatExtensionItem } from "./module-2616.mjs";
import { HOOK_METADATA, HookType } from "./module-1011.mjs";
import { formatHookCommandLabel } from "./module-1012.mjs";
import { OS } from "./module-0014.mjs";
import { AICustomizationSources, BUILTIN_STORAGE, IAICustomizationWorkspaceService } from "./module-0996.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/promptsServiceCustomizationItemProvider.ts
var PromptsServiceCustomizationItemProvider = class {
  constructor(promptsService, workspaceService, productService) {
    this.promptsService = promptsService;
    this.workspaceService = workspaceService;
    this.productService = productService;
    this.onDidChange = Event2.any(
      this.promptsService.onDidChangeCustomAgents,
      this.promptsService.onDidChangeSlashCommands,
      this.promptsService.onDidChangeSkills,
      this.promptsService.onDidChangeHooks,
      this.promptsService.onDidChangeInstructions,
      this.promptsService.onDidChangeAgentInstructions
    );
  }
  async provideChatSessionCustomizations(_sessionResource, token) {
    const itemSets = await Promise.all([
      this.provideCustomizations("agent" /* agent */, token),
      this.provideCustomizations("skill" /* skill */, token),
      this.provideCustomizations("instructions" /* instructions */, token),
      this.provideCustomizations("hook" /* hook */, token),
      this.provideCustomizations("prompt" /* prompt */, token)
    ]);
    return itemSets.flat();
  }
  async provideCustomAgents(sessionResource, token) {
    const sessionType = getChatSessionType(sessionResource);
    const agents = await this.promptsService.getCustomAgents(token);
    return agents.filter((agent) => matchesSessionType(agent.sessionTypes, sessionType));
  }
  async provideSourceFolders(_sessionResource, type, _token) {
    const folders = await this.promptsService.getSourceFolders(type);
    return folders.map((folder) => ({
      uri: folder.uri,
      // Prefer the source-specific description (e.g. "Global (only used by
      // Copilot agents)") over the generic "User Data" label so personal
      // folders like ~/.copilot/skills read naturally. Only folders that
      // carry a source (currently skills) use this; others fall back.
      label: (folder.source !== void 0 ? getSourceDescription(folder.source) : void 0) ?? this.promptsService.getPromptLocationLabel(folder),
      source: folder.storage
    }));
  }
  async provideCustomizations(promptType, token = CancellationToken.None) {
    const items = [];
    const disabledUris = this.promptsService.getDisabledPromptFiles(promptType);
    const extensionInfoByUri = new ResourceMap();
    if (promptType === "agent" /* agent */) {
      const agents = await this.promptsService.getCustomAgents(token);
      const allAgentFiles = await this.promptsService.listPromptFiles("agent" /* agent */, token);
      for (const file of allAgentFiles) {
        if (file.extension) {
          extensionInfoByUri.set(file.uri, { id: file.extension.identifier, displayName: file.extension.displayName });
        }
      }
      for (const agent of agents) {
        items.push({
          uri: agent.uri,
          type: promptType,
          name: agent.name,
          description: agent.description,
          source: agent.source.storage,
          enabled: agent.enabled,
          extensionId: agent.source.storage === "extension" /* extension */ ? agent.source.extensionId.value : void 0,
          pluginUri: agent.source.storage === "plugin" /* plugin */ ? agent.source.pluginUri : void 0,
          userInvocable: agent.visibility.userInvocable
        });
        if (agent.source.storage === "extension" /* extension */ && !extensionInfoByUri.has(agent.uri)) {
          extensionInfoByUri.set(agent.uri, { id: agent.source.extensionId });
        }
      }
    } else if (promptType === "skill" /* skill */) {
      const skills = await this.promptsService.findAgentSkills(token);
      const allSkillFiles = await this.promptsService.listPromptFiles("skill" /* skill */, token);
      for (const file of allSkillFiles) {
        if (file.extension) {
          extensionInfoByUri.set(file.uri, { id: file.extension.identifier, displayName: file.extension.displayName });
        }
      }
      const uiIntegrations = this.workspaceService.getSkillUIIntegrations();
      const seenUris = new ResourceSet();
      for (const skill of skills || []) {
        const skillName = skill.name || basename2(dirname2(skill.uri)) || basename2(skill.uri);
        seenUris.add(skill.uri);
        const skillFolderName = basename2(dirname2(skill.uri));
        const uiTooltip = uiIntegrations.get(skillFolderName);
        items.push({
          uri: skill.uri,
          type: promptType,
          name: skillName,
          description: skill.description,
          source: skill.storage,
          enabled: true,
          badge: uiTooltip ? localize(9806, null) : void 0,
          badgeTooltip: uiTooltip,
          extensionId: skill.extension?.identifier.value,
          pluginUri: skill.pluginUri,
          pluginLabel: skill.pluginLabel,
          userInvocable: skill.userInvocable
        });
      }
      if (disabledUris.size > 0) {
        for (const file of allSkillFiles) {
          if (!seenUris.has(file.uri) && disabledUris.has(file.uri)) {
            const disabledName = file.name || basename2(dirname2(file.uri)) || basename2(file.uri);
            const disabledFolderName = basename2(dirname2(file.uri));
            const uiTooltip = uiIntegrations.get(disabledFolderName);
            items.push({
              uri: file.uri,
              type: promptType,
              name: disabledName,
              description: file.description,
              source: file.storage,
              enabled: false,
              badge: uiTooltip ? localize(9806, null) : void 0,
              badgeTooltip: uiTooltip,
              extensionId: file.extension?.identifier.value,
              pluginUri: file.pluginUri,
              pluginLabel: file.pluginLabel,
              userInvocable: false
            });
          }
        }
      }
    } else if (promptType === "prompt" /* prompt */) {
      const commands = await this.promptsService.getPromptSlashCommands(token);
      for (const command4 of commands) {
        if (command4.type === "skill" /* skill */) {
          continue;
        }
        items.push({
          uri: command4.uri,
          type: promptType,
          name: command4.name,
          description: command4.description,
          source: command4.storage,
          enabled: !disabledUris.has(command4.uri),
          extensionId: command4.extension?.identifier.value,
          pluginUri: command4.pluginUri,
          pluginLabel: command4.pluginLabel,
          userInvocable: command4.userInvocable
        });
        if (command4.extension) {
          extensionInfoByUri.set(command4.uri, { id: command4.extension.identifier, displayName: command4.extension.displayName });
        }
      }
    } else if (promptType === "hook" /* hook */) {
      await this.fetchPromptServiceHooks(items, disabledUris, promptType);
    } else {
      await this.fetchPromptServiceInstructions(items, extensionInfoByUri, disabledUris, promptType);
    }
    return this.applyBuiltinGroupKeys(items, extensionInfoByUri);
  }
  async fetchPromptServiceHooks(items, disabledUris, promptType) {
    const hookFiles = await this.promptsService.listPromptFiles("hook" /* hook */, CancellationToken.None);
    for (const f of hookFiles) {
      items.push({
        uri: f.uri,
        type: promptType,
        name: f.name || getFriendlyName(basename2(f.uri)),
        source: f.storage,
        enabled: !disabledUris.has(f.uri),
        extensionId: f.extension?.identifier.value,
        pluginUri: f.pluginUri,
        userInvocable: void 0
      });
    }
    const agents = !this.workspaceService.isSessionsWindow ? await this.promptsService.getCustomAgents(CancellationToken.None) : [];
    for (const agent of agents) {
      if (!agent.hooks || !agent.enabled) {
        continue;
      }
      for (const hookType of Object.values(HookType)) {
        const hookCommands = agent.hooks[hookType];
        if (!hookCommands || hookCommands.length === 0) {
          continue;
        }
        const hookMeta = HOOK_METADATA[hookType];
        for (let i2 = 0; i2 < hookCommands.length; i2++) {
          const hook = hookCommands[i2];
          const cmdLabel = formatHookCommandLabel(hook, OS);
          const truncatedCmd = cmdLabel.length > 60 ? cmdLabel.substring(0, 57) + "..." : cmdLabel;
          items.push({
            uri: agent.uri,
            type: promptType,
            name: hookMeta?.label ?? hookType,
            description: `${agent.name}: ${truncatedCmd || localize(9804, null)}`,
            source: agent.source.storage,
            groupKey: "agents",
            enabled: !disabledUris.has(agent.uri),
            extensionId: agent.source.storage === "extension" /* extension */ ? agent.source.extensionId.value : void 0,
            pluginUri: agent.source.storage === "plugin" /* plugin */ ? agent.source.pluginUri : void 0,
            userInvocable: void 0
          });
        }
      }
    }
  }
  async fetchPromptServiceInstructions(items, extensionInfoByUri, disabledUris, promptType) {
    const instructionFiles = await this.promptsService.getInstructionFiles(CancellationToken.None);
    for (const file of instructionFiles) {
      if (file.extension) {
        extensionInfoByUri.set(file.uri, { id: file.extension.identifier, displayName: file.extension.displayName });
      }
    }
    const agentInstructionFiles = await this.promptsService.listAgentInstructions(CancellationToken.None, void 0);
    const agentInstructionUris = new ResourceSet(agentInstructionFiles.map((f) => f.uri));
    for (const file of agentInstructionFiles) {
      const storage = "local" /* local */;
      const filename = basename2(file.uri);
      items.push({
        uri: file.uri,
        type: promptType,
        name: filename,
        source: storage,
        groupKey: "agent-instructions",
        enabled: !disabledUris.has(file.uri),
        extensionId: void 0,
        pluginUri: void 0,
        userInvocable: void 0
      });
    }
    for (const { uri: uri4, pattern, name, description, storage, extension, pluginUri } of instructionFiles) {
      if (agentInstructionUris.has(uri4)) {
        continue;
      }
      const friendlyName = getFriendlyName(name);
      if (pattern !== void 0) {
        const badge = pattern === "**" ? localize(9802, null) : pattern;
        const badgeTooltip = pattern === "**" ? localize(9803, null) : localize(9805, null, pattern);
        items.push({
          uri: uri4,
          type: promptType,
          name: friendlyName,
          badge,
          badgeTooltip,
          description,
          source: storage,
          groupKey: "context-instructions",
          enabled: !disabledUris.has(uri4),
          extensionId: extension?.identifier.value,
          pluginUri,
          userInvocable: void 0
        });
      } else {
        items.push({
          uri: uri4,
          type: promptType,
          name: friendlyName,
          description,
          source: storage,
          groupKey: "on-demand-instructions",
          enabled: !disabledUris.has(uri4),
          extensionId: extension?.identifier.value,
          pluginUri,
          userInvocable: void 0
        });
      }
    }
  }
  applyBuiltinGroupKeys(items, extensionInfoByUri) {
    return items.map((item) => {
      if (item.source !== AICustomizationSources.extension) {
        return item;
      }
      const extInfo = extensionInfoByUri.get(item.uri);
      if (!extInfo) {
        return item;
      }
      if (isChatExtensionItem(extInfo.id, this.productService)) {
        return {
          ...item,
          groupKey: item.groupKey ?? BUILTIN_STORAGE
        };
      }
      return {
        ...item,
        extensionLabel: extInfo.displayName || extInfo.id.value
      };
    });
  }
};

PromptsServiceCustomizationItemProvider = __decorateClass([
  __decorateParam(0, IPromptsService),
  __decorateParam(1, IAICustomizationWorkspaceService),
  __decorateParam(2, IProductService)
], PromptsServiceCustomizationItemProvider);
export { PromptsServiceCustomizationItemProvider };
