// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/promptToolsCodeLensProvider.ts
import { Disposable } from "./module-0012.mjs";
import { generateUuid } from "./module-0190.mjs";
import { ALL_PROMPTS_LANGUAGE_SELECTOR, getPromptsTypeForLanguageId } from "./module-0985.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { isITextModel } from "./module-0117.mjs";
import { Range2 } from "./module-0106.mjs";
import { isBoolean } from "./module-0010.mjs";
import { getTarget, isTarget, isVSCodeOrDefaultTarget } from "./module-1015.mjs";
import { PromptHeaderAttributes, parseCommaSeparatedList2 } from "./module-1003.mjs";
import { localize } from "./module-0001.mjs";
import { showToolsPicker } from "./module-2202.mjs";
import { PromptFileRewriter } from "./module-2163.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerEditorFeature } from "./module-0574.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/promptToolsCodeLensProvider.ts
var PromptToolsCodeLensProvider = class extends Disposable {
  constructor(promptsService, languageService, languageModelToolsService, instantiationService) {
    super();
    this.promptsService = promptsService;
    this.languageService = languageService;
    this.languageModelToolsService = languageModelToolsService;
    this.instantiationService = instantiationService;
    // `_`-prefix marks this as private command
    this.cmdId = `_configure/${generateUuid()}`;
    this._register(this.languageService.codeLensProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, this));
    this._register(CommandsRegistry.registerCommand(this.cmdId, (_accessor, ...args2) => {
      const [modelArg, rangeArg, isStringArg, toolsArg, targetArg] = args2;
      const model = modelArg;
      if (isITextModel(model) && Range2.isIRange(rangeArg) && isBoolean(isStringArg) && Array.isArray(toolsArg) && isTarget(targetArg)) {
        this.updateTools(model, Range2.lift(rangeArg), isStringArg, toolsArg, targetArg);
      }
    }));
  }
  async provideCodeLenses(model, token) {
    const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
    if (!promptType || promptType === "instructions" /* instructions */) {
      return void 0;
    }
    const promptAST = this.promptsService.getParsedPromptFile(model);
    const header2 = promptAST.header;
    if (!header2) {
      return void 0;
    }
    const target = getTarget(promptType, header2);
    if (!isVSCodeOrDefaultTarget(target)) {
      return void 0;
    }
    const toolsAttr = header2.getAttribute(PromptHeaderAttributes.tools);
    if (!toolsAttr) {
      return void 0;
    }
    let value2 = toolsAttr.value;
    if (value2.type === "scalar") {
      value2 = parseCommaSeparatedList2(value2);
    }
    if (value2.type !== "sequence") {
      return void 0;
    }
    const items = value2.items;
    const selectedTools = items.filter((item) => item.type === "scalar").map((item) => item.value);
    const codeLens = {
      range: toolsAttr.range.collapseToStart(),
      command: {
        title: localize(11544, null),
        id: this.cmdId,
        arguments: [model, toolsAttr.value.range, toolsAttr.value.type === "scalar", selectedTools, target]
      }
    };
    return { lenses: [codeLens] };
  }
  async updateTools(model, range2, isString2, selectedTools, target) {
    const selectedToolsNow = () => this.languageModelToolsService.toToolAndToolSetEnablementMap(selectedTools, void 0);
    const newSelectedAfter = await this.instantiationService.invokeFunction(showToolsPicker, localize(11545, null), "codeLens", void 0, selectedToolsNow);
    if (!newSelectedAfter) {
      return;
    }
    this.instantiationService.createInstance(PromptFileRewriter).rewriteTools(model, newSelectedAfter, range2, isString2);
  }
};

PromptToolsCodeLensProvider = __decorateClass([
  __decorateParam(0, IPromptsService),
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, ILanguageModelToolsService),
  __decorateParam(3, IInstantiationService)
], PromptToolsCodeLensProvider);

registerEditorFeature(PromptToolsCodeLensProvider);
export { PromptToolsCodeLensProvider };
