// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/interactive/browser/interactiveDocumentService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/interactive/browser/interactiveDocumentService.ts
var IInteractiveDocumentService = createDecorator("IInteractiveDocumentService");

var InteractiveDocumentService = class extends Disposable {
  constructor() {
    super();
    this._onWillAddInteractiveDocument = this._register(new Emitter());
    this.onWillAddInteractiveDocument = this._onWillAddInteractiveDocument.event;
    this._onWillRemoveInteractiveDocument = this._register(new Emitter());
    this.onWillRemoveInteractiveDocument = this._onWillRemoveInteractiveDocument.event;
  }
  willCreateInteractiveDocument(notebookUri, inputUri, languageId) {
    this._onWillAddInteractiveDocument.fire({
      notebookUri,
      inputUri,
      languageId
    });
  }
  willRemoveInteractiveDocument(notebookUri, inputUri) {
    this._onWillRemoveInteractiveDocument.fire({
      notebookUri,
      inputUri
    });
  }
};
export { IInteractiveDocumentService, InteractiveDocumentService };
