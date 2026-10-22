// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatContentParts.ts
import { Disposable, ReferenceCollection } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatContentParts/chatContentParts.ts
var InlineTextModelCollection = class extends Disposable {
  constructor(modelService) {
    super();
    this._collection = new InlineTextModelReferenceCollection(modelService);
  }
  acquire(uri5, value2, languageSelection, isForSimpleWidget) {
    return this._collection.acquire(uri5.toString(), uri5, value2, languageSelection, isForSimpleWidget);
  }
};

InlineTextModelCollection = __decorateClass([
  __decorateParam(0, IModelService)
], InlineTextModelCollection);

var InlineTextModelReferenceCollection = class extends ReferenceCollection {
  constructor(modelService) {
    super();
    this.modelService = modelService;
  }
  createReferencedObject(key3, uri5, value2, languageSelection, isForSimpleWidget) {
    return this.modelService.createModel(value2, languageSelection, uri5, isForSimpleWidget);
  }
  destroyReferencedObject(_key, model) {
    model.dispose();
  }
};
export { InlineTextModelCollection, InlineTextModelReferenceCollection };
