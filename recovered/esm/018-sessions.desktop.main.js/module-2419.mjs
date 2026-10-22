// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/viewportWarmup/viewportWarmup.ts
import { Disposable } from "./module-0012.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { cellRangesToIndexes } from "./module-0941.mjs";
import { outputDisplayLimit } from "./module-1877.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookService } from "./module-0927.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { registerNotebookContribution } from "./module-1870.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/viewportWarmup/viewportWarmup.ts
var NotebookViewportContribution = class extends Disposable {
  constructor(_notebookEditor, _notebookService, accessibilityService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._notebookService = _notebookService;
    this._warmupDocument = null;
    this._warmupViewport = new RunOnceScheduler(() => this._warmupViewportNow(), 200);
    this._register(this._warmupViewport);
    this._register(this._notebookEditor.onDidScroll(() => {
      this._warmupViewport.schedule();
    }));
    this._warmupDocument = new RunOnceScheduler(() => this._warmupDocumentNow(), 200);
    this._register(this._warmupDocument);
    this._register(this._notebookEditor.onDidAttachViewModel(() => {
      if (this._notebookEditor.hasModel()) {
        this._warmupDocument?.schedule();
      }
    }));
    if (this._notebookEditor.hasModel()) {
      this._warmupDocument?.schedule();
    }
  }
  static {
    this.id = "workbench.notebook.viewportWarmup";
  }
  _warmupDocumentNow() {
    if (this._notebookEditor.hasModel()) {
      for (let i2 = 0; i2 < this._notebookEditor.getLength(); i2++) {
        const cell = this._notebookEditor.cellAt(i2);
        if (cell?.cellKind === 1 /* Markup */ && cell?.getEditState() === 0 /* Preview */ && !cell.isInputCollapsed) {
        } else if (cell?.cellKind === 2 /* Code */) {
          this._warmupCodeCell(cell);
        }
      }
    }
  }
  _warmupViewportNow() {
    if (this._notebookEditor.isDisposed) {
      return;
    }
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    const visibleRanges = this._notebookEditor.getVisibleRangesPlusViewportAboveAndBelow();
    cellRangesToIndexes(visibleRanges).forEach((index2) => {
      const cell = this._notebookEditor.cellAt(index2);
      if (cell?.cellKind === 1 /* Markup */ && cell?.getEditState() === 0 /* Preview */ && !cell.isInputCollapsed) {
        this._notebookEditor.createMarkupPreview(cell);
      } else if (cell?.cellKind === 2 /* Code */) {
        this._warmupCodeCell(cell);
      }
    });
  }
  _warmupCodeCell(viewCell) {
    if (viewCell.isOutputCollapsed) {
      return;
    }
    const outputs = viewCell.outputsViewModels;
    for (const output of outputs.slice(0, outputDisplayLimit)) {
      const [mimeTypes, pick] = output.resolveMimeTypes(this._notebookEditor.textModel, void 0);
      if (!mimeTypes.find((mimeType) => mimeType.isTrusted) || mimeTypes.length === 0) {
        continue;
      }
      const pickedMimeTypeRenderer = mimeTypes[pick];
      if (!pickedMimeTypeRenderer) {
        return;
      }
      if (!this._notebookEditor.hasModel()) {
        return;
      }
      const renderer = this._notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
      if (!renderer) {
        return;
      }
      const result = { type: 1 /* Extension */, renderer, source: output, mimeType: pickedMimeTypeRenderer.mimeType };
      this._notebookEditor.createOutput(viewCell, result, 0, true);
    }
  }
};

NotebookViewportContribution = __decorateClass([
  __decorateParam(1, INotebookService),
  __decorateParam(2, IAccessibilityService)
], NotebookViewportContribution);

registerNotebookContribution(NotebookViewportContribution.id, NotebookViewportContribution);
export { NotebookViewportContribution };
