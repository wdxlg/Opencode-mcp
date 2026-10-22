// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookOriginalModelRefFactory.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { AsyncReferenceCollection, ReferenceCollection } from "./module-0012.mjs";
import { VSBuffer, bufferToStream } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookService } from "./module-0927.mjs";
import { ITextModelService } from "./module-0081.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookOriginalModelRefFactory.ts
var INotebookOriginalModelReferenceFactory = createDecorator("INotebookOriginalModelReferenceFactory");

var OriginalNotebookModelReferenceCollection = class extends ReferenceCollection {
  constructor(notebookService, modelService) {
    super();
    this.notebookService = notebookService;
    this.modelService = modelService;
    this.modelsToDispose = /* @__PURE__ */ new Set();
  }
  async createReferencedObject(key3, fileEntry, viewType) {
    this.modelsToDispose.delete(key3);
    const uri4 = fileEntry.originalURI;
    const model = this.notebookService.getNotebookTextModel(uri4);
    if (model) {
      return model;
    }
    const modelRef = await this.modelService.createModelReference(uri4);
    const bytes = VSBuffer.fromString(modelRef.object.textEditorModel.getValue());
    const stream = bufferToStream(bytes);
    modelRef.dispose();
    return this.notebookService.createNotebookTextModel(viewType, uri4, stream);
  }
  destroyReferencedObject(key3, modelPromise) {
    this.modelsToDispose.add(key3);
    (async () => {
      try {
        const model = await modelPromise;
        if (!this.modelsToDispose.has(key3)) {
          return;
        }
        model.dispose();
      } catch (error) {
      } finally {
        this.modelsToDispose.delete(key3);
      }
    })();
  }
};

OriginalNotebookModelReferenceCollection = __decorateClass([
  __decorateParam(0, INotebookService),
  __decorateParam(1, ITextModelService)
], OriginalNotebookModelReferenceCollection);

var NotebookOriginalModelReferenceFactory = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
    this._resourceModelCollection = void 0;
    this._asyncModelCollection = void 0;
  }
  get resourceModelCollection() {
    if (!this._resourceModelCollection) {
      this._resourceModelCollection = this.instantiationService.createInstance(OriginalNotebookModelReferenceCollection);
    }
    return this._resourceModelCollection;
  }
  get asyncModelCollection() {
    if (!this._asyncModelCollection) {
      this._asyncModelCollection = new AsyncReferenceCollection(this.resourceModelCollection);
    }
    return this._asyncModelCollection;
  }
  getOrCreate(fileEntry, viewType) {
    return this.asyncModelCollection.acquire(fileEntry.originalURI.toString(), fileEntry, viewType);
  }
};

NotebookOriginalModelReferenceFactory = __decorateClass([
  __decorateParam(0, IInstantiationService)
], NotebookOriginalModelReferenceFactory);
export { INotebookOriginalModelReferenceFactory, OriginalNotebookModelReferenceCollection, NotebookOriginalModelReferenceFactory };
