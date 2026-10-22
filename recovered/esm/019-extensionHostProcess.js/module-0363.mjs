// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostBulkEdits.ts
import { MainContext } from "./module-0054.mjs";
import { SerializableObjectWithBuffers } from "./module-0053.mjs";
import { WorkspaceEdit2 } from "./module-0245.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";


// src/vs/workbench/api/common/extHostBulkEdits.ts
var ExtHostBulkEdits = class {
  constructor(extHostRpc, extHostDocumentsAndEditors) {
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadBulkEdits);
    this._versionInformationProvider = {
      getTextDocumentVersion: (uri2) => extHostDocumentsAndEditors.getDocument(uri2)?.version,
      getNotebookDocumentVersion: () => void 0
    };
  }
  applyWorkspaceEdit(edit2, extension, metadata) {
    const dto = new SerializableObjectWithBuffers(WorkspaceEdit2.from(edit2, this._versionInformationProvider));
    return this._proxy.$tryApplyWorkspaceEdit(dto, void 0, metadata?.isRefactoring ?? false);
  }
};

ExtHostBulkEdits = __decorateClass([
  __decorateParam(0, IExtHostRpcService)
], ExtHostBulkEdits);
export { ExtHostBulkEdits };
