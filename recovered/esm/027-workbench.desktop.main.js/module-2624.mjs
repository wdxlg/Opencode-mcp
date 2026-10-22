// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptHovers.ts
import { MarkdownString } from "./module-0462.mjs";
import { getPromptsTypeForLanguageId } from "./module-0985.mjs";
import { ClaudeHeaderAttributes, getAttributeDefinition, getTarget, isVSCodeOrDefaultTarget, knownClaudeModels, knownClaudeTools } from "./module-1015.mjs";
import { PromptHeaderAttributes, parseCommaSeparatedList2 } from "./module-1003.mjs";
import { localize } from "./module-0001.mjs";
import { ILanguageModelToolsService, isToolSet } from "./module-0990.mjs";
import { IChatModeService, isBuiltinChatMode } from "./module-1470.mjs";
import { HOOKS_BY_TARGET, HOOK_METADATA } from "./module-1010.mjs";
import { HOOK_COMMAND_FIELD_DESCRIPTIONS } from "./module-1011.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptHovers.ts
var PromptHoverProvider = class {
  constructor(promptsService, languageModelToolsService, languageModelsService, chatModeService) {
    this.promptsService = promptsService;
    this.languageModelToolsService = languageModelToolsService;
    this.languageModelsService = languageModelsService;
    this.chatModeService = chatModeService;
    /**
     * Debug display name for this provider.
     */
    this._debugDisplayName = "PromptHoverProvider";
  }
  createHover(contents, range2) {
    return {
      contents: [new MarkdownString(contents)],
      range: range2
    };
  }
  async provideHover(model, position2, token, _context) {
    const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
    if (!promptType) {
      return void 0;
    }
    const promptAST = this.promptsService.getParsedPromptFile(model);
    const target = getTarget(promptType, promptAST.header ?? model.uri);
    if (promptAST.header?.range.containsPosition(position2)) {
      return this.provideHeaderHover(position2, promptType, promptAST.header, target);
    }
    if (promptAST.body?.range.containsPosition(position2)) {
      return this.provideBodyHover(position2, promptAST.body, target);
    }
    return void 0;
  }
  async provideBodyHover(position2, body, target) {
    for (const ref of body.variableReferences) {
      if (ref.range.containsPosition(position2)) {
        const toolName = ref.name;
        return this.getToolHoverByName(toolName, ref.range, target);
      }
    }
    return void 0;
  }
  async provideHeaderHover(position2, promptType, header2, target) {
    for (const attribute of header2.attributes) {
      if (attribute.range.containsPosition(position2)) {
        const description = getAttributeDefinition(attribute.key, promptType, target)?.description;
        if (description) {
          switch (attribute.key) {
            case PromptHeaderAttributes.model:
              return this.getModelHover(attribute, position2, description, target);
            case PromptHeaderAttributes.tools:
            case ClaudeHeaderAttributes.disallowedTools:
              return this.getToolHover(attribute, position2, description, target);
            case PromptHeaderAttributes.agent:
            case PromptHeaderAttributes.mode:
              return this.getAgentHover(attribute, position2, description);
            case PromptHeaderAttributes.handOffs:
              return this.getHandsOffHover(attribute, position2, target);
            case PromptHeaderAttributes.hooks:
              return this.getHooksHover(attribute, position2, description, target);
            case PromptHeaderAttributes.infer:
              return this.createHover(description + "\n\n" + localize(13187, null), attribute.range);
            default:
              return this.createHover(description, attribute.range);
          }
        }
      }
    }
    return void 0;
  }
  getToolHover(node, position2, baseMessage, target) {
    let value2 = node.value;
    if (value2.type === "scalar") {
      value2 = parseCommaSeparatedList2(value2);
    }
    if (value2.type === "sequence") {
      for (const toolName of value2.items) {
        if (toolName.type === "scalar" && toolName.range.containsPosition(position2)) {
          const description = this.getToolHoverByName(toolName.value, toolName.range, target);
          if (description) {
            return description;
          }
        }
      }
    }
    return this.createHover(baseMessage, node.range);
  }
  getToolHoverByName(toolName, range2, target) {
    if (target === "claude" /* Claude */) {
      const description = knownClaudeTools.find((tool2) => tool2.name === toolName)?.description;
      if (description) {
        return this.createHover(description, range2);
      }
      return void 0;
    }
    const tool = this.languageModelToolsService.getToolByFullReferenceName(toolName);
    if (tool !== void 0) {
      if (isToolSet(tool)) {
        return this.getToolsetHover(tool, range2);
      } else {
        return this.createHover(tool.userDescription ?? tool.modelDescription, range2);
      }
    }
    return void 0;
  }
  getToolsetHover(toolSet, range2) {
    const lines = [];
    lines.push(localize(13192, null, toolSet.referenceName));
    if (toolSet.description) {
      lines.push(toolSet.description);
    }
    for (const tool of toolSet.getTools()) {
      lines.push(`- ${tool.toolReferenceName ?? tool.displayName}`);
    }
    return this.createHover(lines.join("\n"), range2);
  }
  getModelHover(node, position2, baseMessage, target) {
    if (target === "github-copilot" /* GitHubCopilot */) {
      return this.createHover(baseMessage + "\n\n" + localize(13186, null), node.range);
    }
    const modelHoverContent = (modelName) => {
      const lines = [];
      lines.push(baseMessage + "\n");
      if (target === "claude" /* Claude */) {
        const claudeModel = knownClaudeModels.find((model) => model.name === modelName);
        if (!claudeModel) {
          return this.createHover(lines.join("\n"), node.range);
        }
        if (claudeModel.modelEquivalent) {
          lines.push(localize(13181, null, modelName));
          modelName = claudeModel.modelEquivalent;
        } else {
          lines.push(claudeModel.description);
          return this.createHover(lines.join("\n"), node.range);
        }
      }
      const result = this.languageModelsService.lookupLanguageModelByQualifiedName(modelName);
      if (result) {
        const meta = result.metadata;
        lines.push(localize(13183, null, meta.name));
        lines.push(localize(13182, null, meta.family));
        lines.push(localize(13184, null, meta.vendor));
        if (meta.tooltip) {
          lines.push("", "", meta.tooltip);
        }
        return this.createHover(lines.join("\n"), node.range);
      }
      return void 0;
    };
    if (node.value.type === "scalar") {
      const hover = modelHoverContent(node.value.value);
      if (hover) {
        return hover;
      }
    } else if (node.value.type === "sequence") {
      for (const item of node.value.items) {
        if (item.type === "scalar" && item.range.containsPosition(position2)) {
          const hover = modelHoverContent(item.value);
          if (hover) {
            return hover;
          }
        }
      }
    }
    return this.createHover(baseMessage, node.range);
  }
  async getAgentHover(agentAttribute, position2, baseMessage) {
    const lines = [];
    const value2 = agentAttribute.value;
    if (value2.type === "scalar" && value2.range.containsPosition(position2)) {
      const agent = (await this.chatModeService.getLocalModes()).findModeByName(value2.value);
      if (agent) {
        const description = agent.description.get() || (isBuiltinChatMode(agent) ? localize(13189, null) : localize(13191, null));
        lines.push(`\`${agent.name.get()}\`: ${description}`);
      }
    } else {
      const agents = await this.chatModeService.getLocalModes();
      lines.push(baseMessage);
      lines.push("");
      lines.push(localize(13188, null));
      for (const agent of agents.builtin) {
        lines.push(`- \`${agent.name.get()}\`: ${agent.description.get() || agent.label.get()}`);
      }
      if (agents.custom.length > 0) {
        lines.push("");
        lines.push(localize(13190, null));
        for (const agent of agents.custom) {
          const description = agent.description.get();
          lines.push(`- \`${agent.name.get()}\`: ${description || localize(13191, null)}`);
        }
      }
    }
    return this.createHover(lines.join("\n"), agentAttribute.range);
  }
  getHooksHover(attribute, position2, baseMessage, target) {
    const value2 = attribute.value;
    if (value2.type === "map") {
      const hooksByTarget = HOOKS_BY_TARGET[target] ?? HOOKS_BY_TARGET["undefined" /* Undefined */];
      for (const prop of value2.properties) {
        if (prop.key.range.containsPosition(position2)) {
          const hookType = hooksByTarget[prop.key.value];
          if (hookType) {
            const meta = HOOK_METADATA[hookType];
            return this.createHover(`**${meta.label}**

${meta.description}`, prop.key.range);
          }
        }
        if (prop.value.type === "sequence") {
          const hover = this.getHookCommandItemHover(prop.value, position2);
          if (hover) {
            return hover;
          }
        }
      }
    }
    return this.createHover(baseMessage, attribute.range);
  }
  /**
   * Recursively searches hook command items for hover information.
   * Handles both direct command objects and nested matcher format
   * (e.g., `{ matcher: "...", hooks: [{ type: command, ... }] }`).
   */
  getHookCommandItemHover(sequence2, position2) {
    for (const item of sequence2.items) {
      if (item.type !== "map" || !item.range.containsPosition(position2)) {
        continue;
      }
      const nestedHooks = item.properties.find((p) => p.key.value === "hooks");
      if (nestedHooks && nestedHooks.value.type === "sequence") {
        const hover = this.getHookCommandItemHover(nestedHooks.value, position2);
        if (hover) {
          return hover;
        }
      }
      for (const field of item.properties) {
        if (field.key.range.containsPosition(position2) || field.value.range.containsPosition(position2)) {
          const desc = HOOK_COMMAND_FIELD_DESCRIPTIONS[field.key.value];
          if (desc) {
            return this.createHover(desc, field.key.range);
          }
        }
      }
    }
    return void 0;
  }
  getHandsOffHover(attribute, position2, target) {
    const handoffsBaseMessage = getAttributeDefinition(PromptHeaderAttributes.handOffs, "agent" /* agent */, target)?.description;
    if (!isVSCodeOrDefaultTarget(target)) {
      return this.createHover(handoffsBaseMessage + "\n\n" + localize(13185, null), attribute.range);
    }
    return this.createHover(handoffsBaseMessage, attribute.range);
  }
};

PromptHoverProvider = __decorateClass([
  __decorateParam(0, IPromptsService),
  __decorateParam(1, ILanguageModelToolsService),
  __decorateParam(2, ILanguageModelsService),
  __decorateParam(3, IChatModeService)
], PromptHoverProvider);
export { PromptHoverProvider };
