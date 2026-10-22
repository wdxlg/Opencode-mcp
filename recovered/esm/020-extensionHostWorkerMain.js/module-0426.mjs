// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostNotebookRenderers.ts
import { MainContext } from "./module-0025.mjs";
import { ExtHostNotebookEditor } from "./module-0407.mjs";
import { Emitter } from "./module-0019.mjs";


// src/vs/workbench/api/common/extHostNotebookRenderers.ts
var ExtHostNotebookRenderers = class {
  constructor(mainContext, _extHostNotebook) {
    this._extHostNotebook = _extHostNotebook;
    this._rendererMessageEmitters = /* @__PURE__ */ new Map();
    this.proxy = mainContext.getProxy(MainContext.MainThreadNotebookRenderers);
  }
  $postRendererMessage(editorId, rendererId, message) {
    const editor = this._extHostNotebook.getEditorById(editorId);
    this._rendererMessageEmitters.get(rendererId)?.fire({ editor: editor.apiEditor, message });
  }
  createRendererMessaging(manifest, rendererId) {
    if (!manifest.contributes?.notebookRenderer?.some((r2) => r2.id === rendererId)) {
      throw new Error(`Extensions may only call createRendererMessaging() for renderers they contribute (got ${rendererId})`);
    }
    const messaging = {
      onDidReceiveMessage: (listener, thisArg, disposables) => {
        return this.getOrCreateEmitterFor(rendererId).event(listener, thisArg, disposables);
      },
      postMessage: (message, editorOrAlias) => {
        if (ExtHostNotebookEditor.apiEditorsToExtHost.has(message)) {
          [message, editorOrAlias] = [editorOrAlias, message];
        }
        const extHostEditor = editorOrAlias && ExtHostNotebookEditor.apiEditorsToExtHost.get(editorOrAlias);
        return this.proxy.$postMessage(extHostEditor?.id, rendererId, message);
      }
    };
    return messaging;
  }
  getOrCreateEmitterFor(rendererId) {
    let emitter = this._rendererMessageEmitters.get(rendererId);
    if (emitter) {
      return emitter;
    }
    emitter = new Emitter({
      onDidRemoveLastListener: () => {
        emitter?.dispose();
        this._rendererMessageEmitters.delete(rendererId);
      }
    });
    this._rendererMessageEmitters.set(rendererId, emitter);
    return emitter;
  }
};
export { ExtHostNotebookRenderers };
