// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookOriginalCellModelFactory.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { ReferenceCollection } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookOriginalCellModelFactory.ts
var INotebookOriginalCellModelFactory = createDecorator("INotebookOriginalCellModelFactory");

var OriginalNotebookCellModelReferenceCollection = class extends ReferenceCollection {
  constructor(modelService, _languageService) {
    super();
    this.modelService = modelService;
    this._languageService = _languageService;
  }
  createReferencedObject(_key, uri4, cellValue, language2, cellKind) {
    const scheme = `${uri4.scheme}-chat-edit`;
    const originalCellUri = URI.from({ scheme, fragment: uri4.fragment, path: uri4.path });
    const languageSelection = this._languageService.getLanguageIdByLanguageName(language2) ? this._languageService.createById(language2) : cellKind === 1 /* Markup */ ? this._languageService.createById("markdown") : null;
    return this.modelService.createModel(cellValue, languageSelection, originalCellUri);
  }
  destroyReferencedObject(_key, model) {
    model.dispose();
  }
};

OriginalNotebookCellModelReferenceCollection = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, ILanguageService)
], OriginalNotebookCellModelReferenceCollection);

var OriginalNotebookCellModelFactory = class {
  constructor(instantiationService) {
    this._data = instantiationService.createInstance(OriginalNotebookCellModelReferenceCollection);
  }
  getOrCreate(uri4, cellValue, language2, cellKind) {
    return this._data.acquire(uri4.toString(), uri4, cellValue, language2, cellKind);
  }
};

OriginalNotebookCellModelFactory = __decorateClass([
  __decorateParam(0, IInstantiationService)
], OriginalNotebookCellModelFactory);
export { INotebookOriginalCellModelFactory, OriginalNotebookCellModelReferenceCollection, OriginalNotebookCellModelFactory };
