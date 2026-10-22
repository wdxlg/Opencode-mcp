// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostNotebookDocuments.ts
import { Emitter } from "./module-0019.mjs";
import { URI } from "./module-0023.mjs";


// src/vs/workbench/api/common/extHostNotebookDocuments.ts
var ExtHostNotebookDocuments = class {
  constructor(_notebooksAndEditors) {
    this._notebooksAndEditors = _notebooksAndEditors;
    this._onDidSaveNotebookDocument = new Emitter();
    this.onDidSaveNotebookDocument = this._onDidSaveNotebookDocument.event;
    this._onDidChangeNotebookDocument = new Emitter();
    this.onDidChangeNotebookDocument = this._onDidChangeNotebookDocument.event;
  }
  $acceptModelChanged(uri2, event, isDirty, newMetadata) {
    const document2 = this._notebooksAndEditors.getNotebookDocument(URI.revive(uri2));
    const e = document2.acceptModelChanged(event.value, isDirty, newMetadata);
    this._onDidChangeNotebookDocument.fire(e);
  }
  $acceptDirtyStateChanged(uri2, isDirty) {
    const document2 = this._notebooksAndEditors.getNotebookDocument(URI.revive(uri2));
    document2.acceptDirty(isDirty);
  }
  $acceptModelSaved(uri2) {
    const document2 = this._notebooksAndEditors.getNotebookDocument(URI.revive(uri2));
    this._onDidSaveNotebookDocument.fire(document2.apiNotebook);
  }
};
export { ExtHostNotebookDocuments };
