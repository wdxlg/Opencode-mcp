// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadBulkEdits.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { MainContext } from "./module-0922.mjs";
import { IBulkEditService, ResourceFileEdit, ResourceTextEdit } from "./module-0537.mjs";
import { ILogService } from "./module-0095.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { revive } from "./module-0265.mjs";
import { decodeBase64 } from "./module-0038.mjs";
import { ResourceNotebookCellEdit } from "./module-0943.mjs";


// src/vs/workbench/api/browser/mainThreadBulkEdits.ts
var MainThreadBulkEdits = class {
  constructor(_extHostContext, _bulkEditService, _logService, _uriIdentService) {
    this._bulkEditService = _bulkEditService;
    this._logService = _logService;
    this._uriIdentService = _uriIdentService;
  }
  dispose() {
  }
  $tryApplyWorkspaceEdit(dto, undoRedoGroupId, isRefactoring) {
    const edits = reviveWorkspaceEditDto(dto.value, this._uriIdentService);
    return this._bulkEditService.apply(edits, { undoRedoGroupId, respectAutoSaveConfig: isRefactoring }).then((res) => res.isApplied, (err) => {
      this._logService.warn(`IGNORING workspace edit: ${err}`);
      return false;
    });
  }
};

MainThreadBulkEdits = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadBulkEdits),
  __decorateParam(1, IBulkEditService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IUriIdentityService)
], MainThreadBulkEdits);

function reviveWorkspaceEditDto(data, uriIdentityService, resolveDataTransferFile) {
  if (!data || !data.edits) {
    return data;
  }
  const result = revive(data);
  for (const edit3 of result.edits) {
    if (ResourceTextEdit.is(edit3)) {
      edit3.resource = uriIdentityService.asCanonicalUri(edit3.resource);
    }
    if (ResourceFileEdit.is(edit3)) {
      if (edit3.options) {
        const inContents = edit3.options?.contents;
        if (inContents) {
          if (inContents.type === "base64") {
            edit3.options.contents = Promise.resolve(decodeBase64(inContents.value));
          } else {
            if (resolveDataTransferFile) {
              edit3.options.contents = resolveDataTransferFile(inContents.id);
            } else {
              throw new Error("Could not revive data transfer file");
            }
          }
        }
      }
      edit3.newResource = edit3.newResource && uriIdentityService.asCanonicalUri(edit3.newResource);
      edit3.oldResource = edit3.oldResource && uriIdentityService.asCanonicalUri(edit3.oldResource);
    }
    if (ResourceNotebookCellEdit.is(edit3)) {
      edit3.resource = uriIdentityService.asCanonicalUri(edit3.resource);
      const cellEdit = edit3.cellEdit;
      if (cellEdit.editType === 1 /* Replace */) {
        edit3.cellEdit = {
          ...cellEdit,
          cells: cellEdit.cells.map((cell) => ({
            ...cell,
            outputs: cell.outputs.map((output) => ({
              ...output,
              outputs: output.items.map((item) => {
                return {
                  mime: item.mime,
                  data: item.valueBytes
                };
              })
            }))
          }))
        };
      }
    }
  }
  return data;
}
export { reviveWorkspaceEditDto, MainThreadBulkEdits };
