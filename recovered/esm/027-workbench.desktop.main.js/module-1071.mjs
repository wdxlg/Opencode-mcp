// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadDocumentContentProviders.ts
import { DisposableMap, dispose } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { URI } from "./module-0032.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Range2 } from "./module-0106.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IModelService } from "./module-0080.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";


// src/vs/workbench/api/browser/mainThreadDocumentContentProviders.ts
var MainThreadDocumentContentProviders = class {
  constructor(extHostContext, _textModelResolverService, _languageService, _modelService, _editorWorkerService) {
    this._textModelResolverService = _textModelResolverService;
    this._languageService = _languageService;
    this._modelService = _modelService;
    this._editorWorkerService = _editorWorkerService;
    this._resourceContentProvider = new DisposableMap();
    this._pendingUpdate = /* @__PURE__ */ new Map();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDocumentContentProviders);
  }
  dispose() {
    this._resourceContentProvider.dispose();
    dispose(this._pendingUpdate.values());
  }
  $registerTextContentProvider(handle2, scheme) {
    const registration = this._textModelResolverService.registerTextModelContentProvider(scheme, {
      provideTextContent: (uri5) => {
        return this._proxy.$provideTextDocumentContent(handle2, uri5).then((value2) => {
          if (typeof value2 === "string") {
            const firstLineText = value2.substr(0, 1 + value2.search(/\r?\n/));
            const languageSelection = this._languageService.createByFilepathOrFirstLine(uri5, firstLineText);
            return this._modelService.createModel(value2, languageSelection, uri5);
          }
          return null;
        });
      }
    });
    this._resourceContentProvider.set(handle2, registration);
  }
  $unregisterTextContentProvider(handle2) {
    this._resourceContentProvider.deleteAndDispose(handle2);
  }
  async $onVirtualDocumentChange(uri5, value2) {
    const model = this._modelService.getModel(URI.revive(uri5));
    if (!model) {
      return;
    }
    const pending = this._pendingUpdate.get(model.id);
    pending?.cancel();
    const myToken = new CancellationTokenSource();
    this._pendingUpdate.set(model.id, myToken);
    try {
      const edits = await this._editorWorkerService.computeMoreMinimalEdits(model.uri, [{ text: value2, range: model.getFullModelRange() }]);
      this._pendingUpdate.delete(model.id);
      if (myToken.token.isCancellationRequested) {
        return;
      }
      if (model.isDisposed()) {
        return;
      }
      if (edits && edits.length > 0) {
        model.applyEdits(edits.map((edit3) => EditOperation.replace(Range2.lift(edit3.range), edit3.text)));
      }
    } catch (error) {
      onUnexpectedError(error);
    }
  }
};

MainThreadDocumentContentProviders = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadDocumentContentProviders),
  __decorateParam(1, ITextModelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, IModelService),
  __decorateParam(4, IEditorWorkerService)
], MainThreadDocumentContentProviders);
export { MainThreadDocumentContentProviders };
