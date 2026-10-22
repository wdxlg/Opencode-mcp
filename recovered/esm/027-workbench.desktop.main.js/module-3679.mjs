// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineCompletions/browser/inlineCompletions.contribution.ts
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { InlineCompletionLanguageStatusBarContribution } from "./module-3678.mjs";
import { wrapInHotClass1 } from "./module-0694.mjs";
import { Disposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { inlineCompletionProviderGetMatcher, providerIdSchemaUri } from "./module-0797.mjs";
import { withoutDuplicates } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";


// src/vs/workbench/contrib/inlineCompletions/browser/inlineCompletions.contribution.ts
registerWorkbenchContribution2(InlineCompletionLanguageStatusBarContribution.Id, wrapInHotClass1(InlineCompletionLanguageStatusBarContribution.hot), WorkbenchPhase.Eventually);

var InlineCompletionSchemaContribution = class extends Disposable {
  constructor(_languageFeaturesService) {
    super();
    this._languageFeaturesService = _languageFeaturesService;
    const registry4 = Registry.as(Extensions3.JSONContribution);
    const inlineCompletionsProvider = observableFromEvent(
      this,
      this._languageFeaturesService.inlineCompletionsProvider.onDidChange,
      () => this._languageFeaturesService.inlineCompletionsProvider.allNoModel()
    );
    this._register(autorun((reader) => {
      const provider = inlineCompletionsProvider.read(reader);
      registry4.registerSchema(providerIdSchemaUri, {
        enum: withoutDuplicates(provider.flatMap((p) => inlineCompletionProviderGetMatcher(p)))
      }, reader.store);
    }));
  }
  static {
    this.Id = "vs.contrib.InlineCompletionSchemaContribution";
  }
};

InlineCompletionSchemaContribution = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService)
], InlineCompletionSchemaContribution);

registerWorkbenchContribution2(InlineCompletionSchemaContribution.Id, InlineCompletionSchemaContribution, WorkbenchPhase.Eventually);
export { InlineCompletionSchemaContribution };
