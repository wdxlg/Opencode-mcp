// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadInteractive.ts
import { DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IInteractiveDocumentService } from "./module-1127.mjs";


// src/vs/workbench/api/browser/mainThreadInteractive.ts
var MainThreadInteractive = class {
  constructor(extHostContext, interactiveDocumentService) {
    this._disposables = new DisposableStore();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostInteractive);
    this._disposables.add(interactiveDocumentService.onWillAddInteractiveDocument((e) => {
      this._proxy.$willAddInteractiveDocument(e.inputUri, "\n", PLAINTEXT_LANGUAGE_ID, e.notebookUri);
    }));
    this._disposables.add(interactiveDocumentService.onWillRemoveInteractiveDocument((e) => {
      this._proxy.$willRemoveInteractiveDocument(e.inputUri, e.notebookUri);
    }));
  }
  dispose() {
    this._disposables.dispose();
  }
};

MainThreadInteractive = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadInteractive),
  __decorateParam(1, IInteractiveDocumentService)
], MainThreadInteractive);
export { MainThreadInteractive };
