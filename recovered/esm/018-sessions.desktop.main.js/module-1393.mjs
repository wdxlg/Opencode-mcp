// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadNotebookRenderers.ts
import { Disposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { INotebookRendererMessagingService } from "./module-1392.mjs";


// src/vs/workbench/api/browser/mainThreadNotebookRenderers.ts
var MainThreadNotebookRenderers = class extends Disposable {
  constructor(extHostContext, messaging) {
    super();
    this.messaging = messaging;
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostNotebookRenderers);
    this._register(messaging.onShouldPostMessage((e4) => {
      this.proxy.$postRendererMessage(e4.editorId, e4.rendererId, e4.message);
    }));
  }
  $postMessage(editorId, rendererId, message) {
    return this.messaging.receiveMessage(editorId, rendererId, message);
  }
};

MainThreadNotebookRenderers = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadNotebookRenderers),
  __decorateParam(1, INotebookRendererMessagingService)
], MainThreadNotebookRenderers);
export { MainThreadNotebookRenderers };
