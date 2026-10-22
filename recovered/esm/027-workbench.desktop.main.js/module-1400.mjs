// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadNotebookSaveParticipant.ts
import { ExtHostContext } from "./module-0921.mjs";
import { NotebookFileWorkingCopyModel } from "./module-1399.mjs";
import { localize } from "./module-0001.mjs";
import { raceCancellationError } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostCustomer } from "./module-0919.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkingCopyFileService } from "./module-1075.mjs";


// src/vs/workbench/api/browser/mainThreadNotebookSaveParticipant.ts
var ExtHostNotebookDocumentSaveParticipant = class {
  constructor(extHostContext) {
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostNotebookDocumentSaveParticipant);
  }
  async participate(workingCopy, context2, _progress, token) {
    if (!workingCopy.model || !(workingCopy.model instanceof NotebookFileWorkingCopyModel)) {
      return void 0;
    }
    let _warningTimeout;
    const p = new Promise((resolve3, reject) => {
      _warningTimeout = setTimeout(
        () => reject(new Error(localize(5729, null))),
        1750
      );
      this._proxy.$participateInSave(workingCopy.resource, context2.reason, token).then((_) => {
        clearTimeout(_warningTimeout);
        return void 0;
      }).then(resolve3, reject);
    });
    return raceCancellationError(p, token);
  }
};

var SaveParticipant2 = class {
  constructor(extHostContext, instantiationService, workingCopyFileService) {
    this.workingCopyFileService = workingCopyFileService;
    this._saveParticipantDisposable = this.workingCopyFileService.addSaveParticipant(instantiationService.createInstance(ExtHostNotebookDocumentSaveParticipant, extHostContext));
  }
  dispose() {
    this._saveParticipantDisposable.dispose();
  }
};

SaveParticipant2 = __decorateClass([
  extHostCustomer,
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IWorkingCopyFileService)
], SaveParticipant2);
export { ExtHostNotebookDocumentSaveParticipant, SaveParticipant2 };
