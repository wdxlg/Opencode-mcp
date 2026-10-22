// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/textMate/browser/textMateTokenizationFeature.contribution.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextMateTokenizationService } from "./module-1226.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { TextMateTokenizationFeature } from "./module-1774.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { StopWatch } from "./module-0016.mjs";


// src/vs/workbench/services/textMate/browser/textMateTokenizationFeature.contribution.ts
var TextMateTokenizationInstantiator = class {
  static {
    this.ID = "workbench.contrib.textMateTokenizationInstantiator";
  }
  constructor(_textMateTokenizationService) {
  }
};

TextMateTokenizationInstantiator = __decorateClass([
  __decorateParam(0, ITextMateTokenizationService)
], TextMateTokenizationInstantiator);

registerSingleton(ITextMateTokenizationService, TextMateTokenizationFeature, 0 /* Eager */);

registerWorkbenchContribution2(TextMateTokenizationInstantiator.ID, TextMateTokenizationInstantiator, WorkbenchPhase.BlockRestore);

CommandsRegistry.registerCommand("_workbench.colorizeTextMateTokens", async (accessor, resource) => {
  const textModelService = accessor.get(ITextFileService);
  const textModel = resource ? (await textModelService.files.resolve(resource)).textEditorModel : void 0;
  if (!textModel) {
    throw new Error(`Cannot resolve text model for resource ${resource}`);
  }
  const tokenizer = await TokenizationRegistry2.getOrCreate(textModel.getLanguageId());
  if (!tokenizer) {
    throw new Error(`Cannot resolve tokenizer for language ${textModel.getLanguageId()}`);
  }
  const stopwatch = new StopWatch();
  let state = tokenizer.getInitialState();
  for (let i2 = 1; i2 <= textModel.getLineCount(); i2++) {
    state = tokenizer.tokenizeEncoded(textModel.getLineContent(i2), true, state).endState;
  }
  stopwatch.stop();
  return { tokenizeTime: stopwatch.elapsed() };
});
export { TextMateTokenizationInstantiator };
