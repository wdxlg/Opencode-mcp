// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/debugContentProvider.ts
import { Disposable } from "./module-0012.mjs";
import { DEBUG_SCHEME, IDebugService } from "./module-1057.mjs";
import { Source } from "./module-1061.mjs";
import { ErrorNoTelemetry } from "./module-0004.mjs";
import { localize } from "./module-0001.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Range2 } from "./module-0106.mjs";
import { getMimeTypes } from "./module-1354.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";


// src/vs/workbench/contrib/debug/common/debugContentProvider.ts
var DebugContentProvider = class extends Disposable {
  constructor(textModelResolverService, debugService, modelService, languageService, editorWorkerService) {
    super();
    this.debugService = debugService;
    this.modelService = modelService;
    this.languageService = languageService;
    this.editorWorkerService = editorWorkerService;
    this.pendingUpdates = /* @__PURE__ */ new Map();
    this._store.add(textModelResolverService.registerTextModelContentProvider(DEBUG_SCHEME, this));
    DebugContentProvider.INSTANCE = this;
  }
  dispose() {
    this.pendingUpdates.forEach((cancellationSource) => cancellationSource.dispose());
    super.dispose();
  }
  provideTextContent(resource) {
    return this.createOrUpdateContentModel(resource, true);
  }
  /**
   * Reload the model content of the given resource.
   * If there is no model for the given resource, this method does nothing.
   */
  static refreshDebugContent(resource) {
    DebugContentProvider.INSTANCE?.createOrUpdateContentModel(resource, false);
  }
  /**
   * Create or reload the model content of the given resource.
   */
  createOrUpdateContentModel(resource, createIfNotExists) {
    const model = this.modelService.getModel(resource);
    if (!model && !createIfNotExists) {
      return null;
    }
    let session;
    if (resource.query) {
      const data = Source.getEncodedDebugData(resource);
      session = this.debugService.getModel().getSession(data.sessionId);
    }
    if (!session) {
      session = this.debugService.getViewModel().focusedSession;
    }
    if (!session) {
      return Promise.reject(new ErrorNoTelemetry(localize(14797, null)));
    }
    const createErrModel = (errMsg) => {
      this.debugService.sourceIsNotAvailable(resource);
      const languageSelection = this.languageService.createById(PLAINTEXT_LANGUAGE_ID);
      const message = errMsg ? localize(14796, null, resource.path, errMsg) : localize(14795, null, resource.path);
      return this.modelService.createModel(message, languageSelection, resource);
    };
    return session.loadSource(resource).then((response) => {
      if (response && response.body) {
        if (model) {
          const newContent = response.body.content;
          const cancellationSource = this.pendingUpdates.get(model.id);
          cancellationSource?.cancel();
          const myToken = new CancellationTokenSource();
          this.pendingUpdates.set(model.id, myToken);
          return this.editorWorkerService.computeMoreMinimalEdits(model.uri, [{ text: newContent, range: model.getFullModelRange() }]).then((edits) => {
            this.pendingUpdates.delete(model.id);
            if (!myToken.token.isCancellationRequested && edits && edits.length > 0) {
              model.applyEdits(edits.map((edit3) => EditOperation.replace(Range2.lift(edit3.range), edit3.text)));
            }
            return model;
          });
        } else {
          const mime = response.body.mimeType || getMimeTypes(resource)[0];
          const languageSelection = this.languageService.createByMimeType(mime);
          return this.modelService.createModel(response.body.content, languageSelection, resource);
        }
      }
      return createErrModel();
    }, (err) => createErrModel(err.message));
  }
};

DebugContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IDebugService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ILanguageService),
  __decorateParam(4, IEditorWorkerService)
], DebugContentProvider);
export { DebugContentProvider };
