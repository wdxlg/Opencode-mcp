// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineDataSourceFactory.ts
import { ReferenceCollection } from "./module-0012.mjs";
import { NotebookCellOutlineDataSource } from "./module-1932.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService, createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineDataSourceFactory.ts
var NotebookCellOutlineDataSourceReferenceCollection = class extends ReferenceCollection {
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
  }
  createReferencedObject(_key, editor) {
    return this.instantiationService.createInstance(NotebookCellOutlineDataSource, editor);
  }
  destroyReferencedObject(_key, object2) {
    object2.dispose();
  }
};

NotebookCellOutlineDataSourceReferenceCollection = __decorateClass([
  __decorateParam(0, IInstantiationService)
], NotebookCellOutlineDataSourceReferenceCollection);

var INotebookCellOutlineDataSourceFactory = createDecorator("INotebookCellOutlineDataSourceFactory");

var NotebookCellOutlineDataSourceFactory = class {
  constructor(instantiationService) {
    this._data = instantiationService.createInstance(NotebookCellOutlineDataSourceReferenceCollection);
  }
  getOrCreate(editor) {
    return this._data.acquire(editor.getId(), editor);
  }
};

NotebookCellOutlineDataSourceFactory = __decorateClass([
  __decorateParam(0, IInstantiationService)
], NotebookCellOutlineDataSourceFactory);
export { NotebookCellOutlineDataSourceReferenceCollection, INotebookCellOutlineDataSourceFactory, NotebookCellOutlineDataSourceFactory };
