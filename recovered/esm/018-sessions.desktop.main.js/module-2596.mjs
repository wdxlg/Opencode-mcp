// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptLinkProvider.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPromptsService } from "./module-0987.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/languageProviders/promptLinkProvider.ts
var PromptLinkProvider = class {
  constructor(promptsService) {
    this.promptsService = promptsService;
  }
  /**
   * Provide list of links for the provided text model.
   */
  async provideLinks(model, token) {
    const promptAST = this.promptsService.getParsedPromptFile(model);
    if (!promptAST.body) {
      return;
    }
    const links = [];
    for (const ref of promptAST.body.fileReferences) {
      if (!ref.isMarkdownLink) {
        const url = promptAST.body.resolveFilePath(ref.content);
        if (url) {
          links.push({ range: ref.range, url });
        }
      }
    }
    return { links };
  }
};

PromptLinkProvider = __decorateClass([
  __decorateParam(0, IPromptsService)
], PromptLinkProvider);
export { PromptLinkProvider };
