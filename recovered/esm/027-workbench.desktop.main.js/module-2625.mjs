// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/PromptHeaderDefinitionProvider.ts
import { getPromptsTypeForLanguageId } from "./module-0985.mjs";
import { PromptHeaderAttributes } from "./module-1003.mjs";
import { Range2 } from "./module-0106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { IChatModeService } from "./module-1470.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/PromptHeaderDefinitionProvider.ts
var PromptHeaderDefinitionProvider = class {
  constructor(promptsService, chatModeService) {
    this.promptsService = promptsService;
    this.chatModeService = chatModeService;
    /**
     * Debug display name for this provider.
     */
    this._debugDisplayName = "PromptHeaderDefinitionProvider";
  }
  async provideDefinition(model, position2, token) {
    const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
    if (!promptType) {
      return void 0;
    }
    const promptAST = this.promptsService.getParsedPromptFile(model);
    const header2 = promptAST.header;
    if (!header2) {
      return void 0;
    }
    const agentAttr = header2.getAttribute(PromptHeaderAttributes.agent) ?? header2.getAttribute(PromptHeaderAttributes.mode);
    if (agentAttr && agentAttr.value.type === "scalar" && agentAttr.range.containsPosition(position2)) {
      const agent = (await this.chatModeService.getLocalModes()).findModeByName(agentAttr.value.value);
      if (agent && agent.uri) {
        return {
          uri: agent.uri.get(),
          range: new Range2(1, 1, 1, 1)
        };
      }
    }
    return void 0;
  }
};

PromptHeaderDefinitionProvider = __decorateClass([
  __decorateParam(0, IPromptsService),
  __decorateParam(1, IChatModeService)
], PromptHeaderDefinitionProvider);
export { PromptHeaderDefinitionProvider };
