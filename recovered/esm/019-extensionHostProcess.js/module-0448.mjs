// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostNotebookDocumentSaveParticipant.ts
import { AsyncEmitter } from "./module-0017.mjs";
import { URI } from "./module-0025.mjs";
import { TextDocumentSaveReason2, WorkspaceEdit2 } from "./module-0245.mjs";
import { WorkspaceEdit } from "./module-0243.mjs";
import { SerializableObjectWithBuffers } from "./module-0053.mjs";


// src/vs/workbench/api/common/extHostNotebookDocumentSaveParticipant.ts
var ExtHostNotebookDocumentSaveParticipant = class {
  constructor(_logService, _notebooksAndEditors, _mainThreadBulkEdits, _thresholds = { timeout: 1500, errors: 3 }) {
    this._logService = _logService;
    this._notebooksAndEditors = _notebooksAndEditors;
    this._mainThreadBulkEdits = _mainThreadBulkEdits;
    this._thresholds = _thresholds;
    this._onWillSaveNotebookDocumentEvent = new AsyncEmitter();
  }
  dispose() {
  }
  getOnWillSaveNotebookDocumentEvent(extension) {
    return (listener, thisArg, disposables) => {
      const wrappedListener = function wrapped(e) {
        listener.call(thisArg, e);
      };
      wrappedListener.extension = extension;
      return this._onWillSaveNotebookDocumentEvent.event(wrappedListener, void 0, disposables);
    };
  }
  async $participateInSave(resource, reason, token) {
    const revivedUri = URI.revive(resource);
    const document2 = this._notebooksAndEditors.getNotebookDocument(revivedUri);
    if (!document2) {
      throw new Error("Unable to resolve notebook document");
    }
    const edits = [];
    await this._onWillSaveNotebookDocumentEvent.fireAsync({ notebook: document2.apiNotebook, reason: TextDocumentSaveReason2.to(reason) }, token, async (thenable, listener) => {
      const now = Date.now();
      const data = await await Promise.resolve(thenable);
      if (Date.now() - now > this._thresholds.timeout) {
        this._logService.warn("onWillSaveNotebookDocument-listener from extension", listener.extension.identifier);
      }
      if (token.isCancellationRequested) {
        return;
      }
      if (data) {
        if (data instanceof WorkspaceEdit) {
          edits.push(data);
        } else {
          this._logService.warn("onWillSaveNotebookDocument-listener from extension", listener.extension.identifier, "ignored due to invalid data");
        }
      }
      return;
    });
    if (token.isCancellationRequested) {
      return false;
    }
    if (edits.length === 0) {
      return true;
    }
    const dto = { edits: [] };
    for (const edit2 of edits) {
      const { edits: edits2 } = WorkspaceEdit2.from(edit2);
      dto.edits = dto.edits.concat(edits2);
    }
    return this._mainThreadBulkEdits.$tryApplyWorkspaceEdit(new SerializableObjectWithBuffers(dto));
  }
};
export { ExtHostNotebookDocumentSaveParticipant };
