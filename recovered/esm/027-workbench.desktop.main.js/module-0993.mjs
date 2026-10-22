// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/notebookExecutionService.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/notebook/common/notebookExecutionService.ts
var CellExecutionUpdateType = /* @__PURE__ */ ((CellExecutionUpdateType2) => {
  CellExecutionUpdateType2[CellExecutionUpdateType2["Output"] = 1] = "Output";
  CellExecutionUpdateType2[CellExecutionUpdateType2["OutputItems"] = 2] = "OutputItems";
  CellExecutionUpdateType2[CellExecutionUpdateType2["ExecutionState"] = 3] = "ExecutionState";
  return CellExecutionUpdateType2;
})(CellExecutionUpdateType || {});

var INotebookExecutionService = createDecorator("INotebookExecutionService");
export { CellExecutionUpdateType, INotebookExecutionService };
