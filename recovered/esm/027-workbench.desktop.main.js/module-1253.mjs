// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadSaveParticipant.ts
import { ExtHostContext } from "./module-0921.mjs";
import { shouldSynchronizeModel } from "./module-0117.mjs";
import { localize } from "./module-0001.mjs";
import { raceCancellationError } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostCustomer } from "./module-0919.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITextFileService } from "./module-1063.mjs";


// src/vs/workbench/api/browser/mainThreadSaveParticipant.ts
var ExtHostSaveParticipant = class {
  constructor(extHostContext) {
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDocumentSaveParticipant);
  }
  async participate(editorModel, context2, _progress, token) {
    if (!editorModel.textEditorModel || !shouldSynchronizeModel(editorModel.textEditorModel)) {
      return void 0;
    }
    const p = new Promise((resolve3, reject) => {
      setTimeout(
        () => reject(new Error(localize(5734, null))),
        1750
      );
      this._proxy.$participateInSave(editorModel.resource, context2.reason).then((values) => {
        if (!values.every((success) => success)) {
          return Promise.reject(new Error("listener failed"));
        }
        return void 0;
      }).then(resolve3, reject);
    });
    return raceCancellationError(p, token);
  }
};

var SaveParticipant = class {
  constructor(extHostContext, instantiationService, _textFileService) {
    this._textFileService = _textFileService;
    this._saveParticipantDisposable = this._textFileService.files.addSaveParticipant(instantiationService.createInstance(ExtHostSaveParticipant, extHostContext));
  }
  dispose() {
    this._saveParticipantDisposable.dispose();
  }
};

SaveParticipant = __decorateClass([
  extHostCustomer,
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITextFileService)
], SaveParticipant);
export { ExtHostSaveParticipant, SaveParticipant };
