// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/services/languageFeaturesService.ts
import { LanguageFeatureRegistry } from "./module-1214.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";


// src/vs/editor/common/services/languageFeaturesService.ts
var LanguageFeaturesService = class {
  constructor() {
    this.referenceProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.renameProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.newSymbolNamesProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.codeActionProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.definitionProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.typeDefinitionProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.declarationProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.implementationProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.documentSymbolProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.inlayHintsProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.colorProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.codeLensProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.documentFormattingEditProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.documentRangeFormattingEditProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.onTypeFormattingEditProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.signatureHelpProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.hoverProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.documentHighlightProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.multiDocumentHighlightProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.selectionRangeProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.foldingRangeProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.linkProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.inlineCompletionsProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.completionProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.linkedEditingRangeProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.inlineValuesProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.evaluatableExpressionProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.documentRangeSemanticTokensProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.documentSemanticTokensProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.documentDropEditProvider = new LanguageFeatureRegistry(this._score.bind(this));
    this.documentPasteEditProvider = new LanguageFeatureRegistry(this._score.bind(this));
  }
  setNotebookTypeResolver(resolver) {
    this._notebookTypeResolver = resolver;
  }
  _score(uri5) {
    return this._notebookTypeResolver?.(uri5);
  }
};

registerSingleton(ILanguageFeaturesService, LanguageFeaturesService, 1 /* Delayed */);
export { LanguageFeaturesService };
