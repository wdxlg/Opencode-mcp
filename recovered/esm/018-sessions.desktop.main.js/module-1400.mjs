// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadInteractive.ts
import { DisposableStore } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IInteractiveDocumentService } from "./module-1128.mjs";


// src/vs/workbench/api/browser/mainThreadInteractive.ts
var MainThreadInteractive = class {
  constructor(extHostContext, interactiveDocumentService) {
    this._disposables = new DisposableStore();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostInteractive);
    this._disposables.add(interactiveDocumentService.onWillAddInteractiveDocument((e4) => {
      this._proxy.$willAddInteractiveDocument(e4.inputUri, "\n", PLAINTEXT_LANGUAGE_ID, e4.notebookUri);
    }));
    this._disposables.add(interactiveDocumentService.onWillRemoveInteractiveDocument((e4) => {
      this._proxy.$willRemoveInteractiveDocument(e4.inputUri, e4.notebookUri);
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
