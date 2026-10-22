// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/chat/notebookChatUtils.ts
import { CellUri } from "./module-0909.mjs";
import { normalizeDriveLetter } from "./module-0711.mjs";
import { basenameOrAuthority } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/chat/notebookChatUtils.ts
var NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST = [
  "text/plain",
  "text/html",
  "application/vnd.code.notebook.error",
  "application/vnd.code.notebook.stdout",
  "application/x.notebook.stdout",
  "application/x.notebook.stream",
  "application/vnd.code.notebook.stderr",
  "application/x.notebook.stderr",
  "image/png",
  "image/jpeg",
  "image/svg"
];

function createNotebookOutputVariableEntry(outputViewModel, mimeType, notebookEditor) {
  const cellFromViewModelHandle = outputViewModel.cellViewModel.handle;
  const notebookModel = notebookEditor.textModel;
  const cell = notebookEditor.getCellByHandle(cellFromViewModelHandle);
  if (!cell || cell.outputsViewModels.length === 0 || !notebookModel) {
    return;
  }
  const notebookUri = notebookModel.uri;
  const cellUri = cell.uri;
  const cellIndex = notebookModel.cells.indexOf(cell.model);
  const outputId = outputViewModel?.model.outputId;
  let outputIndex = 0;
  if (outputId !== void 0) {
    outputIndex = cell.outputsViewModels.findIndex((output) => {
      return output.model.outputId === outputId;
    });
  }
  const outputCellUri = CellUri.generateCellOutputUriWithIndex(notebookUri, cellUri, outputIndex);
  const fileName = normalizeDriveLetter(basenameOrAuthority(notebookUri));
  const l = {
    value: outputCellUri,
    id: outputCellUri.toString(),
    name: localize(17418, null, fileName, `${cellIndex + 1}`, `${outputIndex + 1}`),
    icon: mimeType === "application/vnd.code.notebook.error" ? ThemeIcon.fromId("error") : void 0,
    kind: "notebookOutput",
    outputIndex,
    mimeType
  };
  return l;
}
export { createNotebookOutputVariableEntry, NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT_CONST };
