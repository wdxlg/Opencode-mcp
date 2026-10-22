// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/promptFileContributions.ts
import { Disposable, DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { ALL_PROMPTS_LANGUAGE_SELECTOR, getPromptsTypeForLanguageId } from "./module-0985.mjs";
import { PromptLinkProvider } from "./module-2621.mjs";
import { PromptBodyAutocompletion } from "./module-2622.mjs";
import { PromptHeaderAutocompletion } from "./module-2623.mjs";
import { PromptHoverProvider } from "./module-2624.mjs";
import { PromptHeaderDefinitionProvider } from "./module-2625.mjs";
import { PromptDocumentSemanticTokensProvider } from "./module-2627.mjs";
import { PromptCodeActionProvider } from "./module-2628.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { MARKERS_OWNER_ID, PromptValidator } from "./module-2626.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { IChatModeService } from "./module-1470.mjs";
import { Delayer } from "./module-0036.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/promptFileContributions.ts
var PromptLanguageFeaturesProvider = class extends Disposable {
  static {
    this.ID = "chat.promptLanguageFeatures";
  }
  constructor(languageService, instantiationService) {
    super();
    this._register(languageService.linkProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptLinkProvider)));
    this._register(languageService.completionProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptBodyAutocompletion)));
    this._register(languageService.completionProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptHeaderAutocompletion)));
    this._register(languageService.hoverProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptHoverProvider)));
    this._register(languageService.definitionProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptHeaderDefinitionProvider)));
    this._register(languageService.documentSemanticTokensProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptDocumentSemanticTokensProvider)));
    this._register(languageService.codeActionProvider.register(ALL_PROMPTS_LANGUAGE_SELECTOR, instantiationService.createInstance(PromptCodeActionProvider)));
    this._register(instantiationService.createInstance(PromptValidatorContribution));
  }
};

PromptLanguageFeaturesProvider = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IInstantiationService)
], PromptLanguageFeaturesProvider);

var PromptValidatorContribution = class extends Disposable {
  constructor(codeEditorService, instantiationService, markerService, promptsService, languageModelsService, languageModelToolsService, chatModeService) {
    super();
    this.codeEditorService = codeEditorService;
    this.markerService = markerService;
    this.promptsService = promptsService;
    this.languageModelsService = languageModelsService;
    this.languageModelToolsService = languageModelToolsService;
    this.chatModeService = chatModeService;
    this.localDisposables = this._register(new DisposableStore());
    this.validator = instantiationService.createInstance(PromptValidator);
    void this.updateRegistration();
  }
  async updateRegistration() {
    this.localDisposables.clear();
    const trackers = new ResourceMap();
    this.localDisposables.add(toDisposable(() => {
      trackers.forEach((tracker2) => tracker2.dispose());
      trackers.clear();
    }));
    const acquire = (editor) => {
      const model = editor.getModel();
      if (!model) {
        return;
      }
      const promptType = getPromptsTypeForLanguageId(model.getLanguageId());
      if (promptType) {
        const existing = trackers.get(model.uri);
        if (existing) {
          existing.refCount++;
          return;
        }
        trackers.set(model.uri, new ModelTracker2(model, promptType, this.validator, this.promptsService, this.markerService));
      }
    };
    const release = (uri5) => {
      const tracker2 = trackers.get(uri5);
      if (tracker2 && --tracker2.refCount === 0) {
        tracker2.dispose();
        trackers.delete(uri5);
      }
    };
    const perEditorDisposables = new DisposableMap();
    this.localDisposables.add(perEditorDisposables);
    const onCodeEditorAdd = (editor) => {
      acquire(editor);
      const store = new DisposableStore();
      store.add(editor.onDidChangeModel((e) => {
        if (e.oldModelUrl) {
          release(e.oldModelUrl);
        }
        acquire(editor);
      }));
      store.add(editor.onDidChangeModelLanguage((e) => {
        const model = editor.getModel();
        if (model) {
          release(model.uri);
          acquire(editor);
        }
      }));
      perEditorDisposables.set(editor.getId(), store);
    };
    for (const editor of this.codeEditorService.listCodeEditors()) {
      onCodeEditorAdd(editor);
    }
    this.localDisposables.add(this.codeEditorService.onCodeEditorAdd((editor) => {
      onCodeEditorAdd(editor);
    }));
    this.localDisposables.add(this.codeEditorService.onCodeEditorRemove((editor) => {
      perEditorDisposables.deleteAndDispose(editor.getId());
      const model = editor.getModel();
      if (model) {
        release(model.uri);
      }
    }));
    const validateAll = () => trackers.forEach((tracker2) => tracker2.validate());
    const localModes = await this.chatModeService.getLocalModes();
    this.localDisposables.add(this.languageModelToolsService.onDidChangeTools(() => validateAll()));
    this.localDisposables.add(localModes.onDidChange(() => validateAll()));
    this.localDisposables.add(this.languageModelsService.onDidChangeLanguageModels(() => validateAll()));
  }
};

PromptValidatorContribution = __decorateClass([
  __decorateParam(0, ICodeEditorService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IMarkerService),
  __decorateParam(3, IPromptsService),
  __decorateParam(4, ILanguageModelsService),
  __decorateParam(5, ILanguageModelToolsService),
  __decorateParam(6, IChatModeService)
], PromptValidatorContribution);

var ModelTracker2 = class extends Disposable {
  constructor(textModel, promptType, validator, promptsService, markerService) {
    super();
    this.textModel = textModel;
    this.promptType = promptType;
    this.validator = validator;
    this.promptsService = promptsService;
    this.markerService = markerService;
    this.refCount = 1;
    this.delayer = this._register(new Delayer(200));
    this._register(textModel.onDidChangeContent(() => this.validate()));
    this.validate();
  }
  validate() {
    this.delayer.trigger(async () => {
      const markers = [];
      const ast = this.promptsService.getParsedPromptFile(this.textModel);
      await this.validator.validate(ast, this.promptType, (m) => markers.push(m));
      if (!this._store.isDisposed) {
        this.markerService.changeOne(MARKERS_OWNER_ID, this.textModel.uri, markers);
      }
    });
  }
  dispose() {
    this.markerService.remove(MARKERS_OWNER_ID, [this.textModel.uri]);
    super.dispose();
  }
};
export { PromptLanguageFeaturesProvider, PromptValidatorContribution, ModelTracker2 };
