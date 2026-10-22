// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/services/modelUndoRedoParticipant.ts
import { Disposable, dispose } from "./module-0012.mjs";
import { MultiModelEditStackElement } from "./module-0393.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IUndoRedoService } from "./module-0374.mjs";


// src/vs/editor/common/services/modelUndoRedoParticipant.ts
var ModelUndoRedoParticipant = class extends Disposable {
  constructor(_modelService, _textModelService, _undoRedoService) {
    super();
    this._modelService = _modelService;
    this._textModelService = _textModelService;
    this._undoRedoService = _undoRedoService;
    this._register(this._modelService.onModelRemoved((model) => {
      const elements = this._undoRedoService.getElements(model.uri);
      if (elements.past.length === 0 && elements.future.length === 0) {
        return;
      }
      for (const element of elements.past) {
        if (element instanceof MultiModelEditStackElement) {
          element.setDelegate(this);
        }
      }
      for (const element of elements.future) {
        if (element instanceof MultiModelEditStackElement) {
          element.setDelegate(this);
        }
      }
    }));
  }
  prepareUndoRedo(element) {
    const missingModels = element.getMissingModels();
    if (missingModels.length === 0) {
      return Disposable.None;
    }
    const disposablesPromises = missingModels.map(async (uri4) => {
      try {
        const reference = await this._textModelService.createModelReference(uri4);
        return reference;
      } catch (err) {
        return Disposable.None;
      }
    });
    return Promise.all(disposablesPromises).then((disposables) => {
      return {
        dispose: () => dispose(disposables)
      };
    });
  }
};

ModelUndoRedoParticipant = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, ITextModelService),
  __decorateParam(2, IUndoRedoService)
], ModelUndoRedoParticipant);
export { ModelUndoRedoParticipant };
