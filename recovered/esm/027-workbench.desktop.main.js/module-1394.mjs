// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadNotebookRenderers.ts
import { Disposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { INotebookRendererMessagingService } from "./module-1393.mjs";


// src/vs/workbench/api/browser/mainThreadNotebookRenderers.ts
var MainThreadNotebookRenderers = class extends Disposable {
  constructor(extHostContext, messaging) {
    super();
    this.messaging = messaging;
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostNotebookRenderers);
    this._register(messaging.onShouldPostMessage((e) => {
      this.proxy.$postRendererMessage(e.editorId, e.rendererId, e.message);
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
