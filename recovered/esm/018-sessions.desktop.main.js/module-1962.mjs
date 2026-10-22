// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookInlineDiff.ts
import { Disposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { Event2 } from "./module-0017.mjs";
import { NotebookInsertedCellDecorator } from "./module-1960.mjs";
import { NotebookDeletedCellDecorator } from "./module-1959.mjs";
import { computeDiff2 } from "./module-1954.mjs";
import { NotebookCellDiffDecorator } from "./module-1958.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookEditorWorkerService } from "./module-1952.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INotebookLoggingService } from "./module-1394.mjs";
import { registerNotebookContribution } from "./module-1870.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { INotebookOriginalModelReferenceFactory, NotebookOriginalModelReferenceFactory } from "./module-1961.mjs";
import { INotebookOriginalCellModelFactory, OriginalNotebookCellModelFactory } from "./module-1957.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookInlineDiff.ts
var NotebookInlineDiffDecorationContribution = class extends Disposable {
  constructor(notebookEditor, notebookEditorWorkerService, instantiationService, logService) {
    super();
    this.notebookEditor = notebookEditor;
    this.notebookEditorWorkerService = notebookEditorWorkerService;
    this.instantiationService = instantiationService;
    this.logService = logService;
    this.cellDecorators = /* @__PURE__ */ new Map();
    this.listeners = [];
    this.logService.debug("inlineDiff", "Watching for previous model");
    this._register(autorun((reader) => {
      this.previous = this.notebookEditor.notebookOptions.previousModelToCompare.read(reader);
      if (this.previous) {
        this.logService.debug("inlineDiff", "Previous model set");
        if (this.notebookEditor.hasModel()) {
          this.initialize();
        } else {
          this.logService.debug("inlineDiff", "Waiting for model to attach");
          this.listeners.push(Event2.once(this.notebookEditor.onDidAttachViewModel)(() => this.initialize()));
        }
      }
    }));
  }
  static {
    this.ID = "workbench.notebook.inlineDiffDecoration";
  }
  clear() {
    this.listeners.forEach((l) => l.dispose());
    this.cellDecorators.forEach((v2, cell) => {
      v2.dispose();
      this.cellDecorators.delete(cell);
    });
    this.insertedCellDecorator?.dispose();
    this.deletedCellDecorator?.dispose();
    this.cachedNotebookDiff = void 0;
    this.listeners = [];
    this.logService.debug("inlineDiff", "Cleared decorations and listeners");
  }
  dispose() {
    this.logService.debug("inlineDiff", "Disposing");
    this.clear();
    super.dispose();
  }
  initialize() {
    this.clear();
    if (!this.previous) {
      return;
    }
    this.insertedCellDecorator = this.instantiationService.createInstance(NotebookInsertedCellDecorator, this.notebookEditor);
    this.deletedCellDecorator = this.instantiationService.createInstance(NotebookDeletedCellDecorator, this.notebookEditor, void 0);
    this._update();
    const onVisibleChange = Event2.debounce(this.notebookEditor.onDidChangeVisibleRanges, (e4) => e4, 100, void 0, void 0, void 0, this._store);
    this.listeners.push(onVisibleChange(() => this._update()));
    this.listeners.push(this.notebookEditor.onDidChangeModel(() => this._update()));
    if (this.notebookEditor.textModel) {
      const onContentChange = Event2.debounce(this.notebookEditor.textModel.onDidChangeContent, (_, event) => event, 100, void 0, void 0, void 0, this._store);
      const onOriginalContentChange = Event2.debounce(this.previous.onDidChangeContent, (_, event) => event, 100, void 0, void 0, void 0, this._store);
      this.listeners.push(onContentChange(() => this._update()));
      this.listeners.push(onOriginalContentChange(() => this._update()));
    }
    this.logService.debug("inlineDiff", "Initialized");
  }
  async _update() {
    const current = this.notebookEditor.getViewModel()?.notebookDocument;
    if (!this.previous || !current) {
      this.logService.debug("inlineDiff", "Update skipped - no original or current document");
      return;
    }
    if (!this.cachedNotebookDiff || this.cachedNotebookDiff.originalVersion !== this.previous.versionId || this.cachedNotebookDiff.version !== current.versionId) {
      let diffInfo = { cellDiffInfo: [] };
      try {
        const notebookDiff = await this.notebookEditorWorkerService.computeDiff(this.previous.uri, current.uri);
        diffInfo = computeDiff2(this.previous, current, notebookDiff);
      } catch (e4) {
        this.logService.error("inlineDiff", "Error computing diff:\n" + e4);
        return;
      }
      this.cachedNotebookDiff = { cellDiffInfo: diffInfo.cellDiffInfo, originalVersion: this.previous.versionId, version: current.versionId };
      this.insertedCellDecorator?.apply(diffInfo.cellDiffInfo);
      this.deletedCellDecorator?.apply(diffInfo.cellDiffInfo, this.previous);
    }
    await this.updateCells(this.previous, current, this.cachedNotebookDiff.cellDiffInfo);
  }
  async updateCells(original, modified, cellDiffs) {
    const validDiffDecorators = /* @__PURE__ */ new Set();
    cellDiffs.forEach((diff4) => {
      if (diff4.type === "modified") {
        const modifiedCell = modified.cells[diff4.modifiedCellIndex];
        const originalCell = original.cells[diff4.originalCellIndex];
        const editor = this.notebookEditor.codeEditors.find(([vm]) => vm.handle === modifiedCell.handle)?.[1];
        if (editor) {
          const currentDecorator = this.cellDecorators.get(modifiedCell);
          if (currentDecorator?.modifiedCell !== modifiedCell || currentDecorator?.originalCell !== originalCell) {
            currentDecorator?.dispose();
            const decorator = this.instantiationService.createInstance(NotebookCellDiffDecorator, this.notebookEditor, modifiedCell, originalCell, editor);
            this.cellDecorators.set(modifiedCell, decorator);
            validDiffDecorators.add(decorator);
            this._register(editor.onDidDispose(() => {
              decorator.dispose();
              if (this.cellDecorators.get(modifiedCell) === decorator) {
                this.cellDecorators.delete(modifiedCell);
              }
            }));
          } else if (currentDecorator) {
            validDiffDecorators.add(currentDecorator);
          }
        }
      }
    });
    this.cellDecorators.forEach((v2, cell) => {
      if (!validDiffDecorators.has(v2)) {
        v2.dispose();
        this.cellDecorators.delete(cell);
      }
    });
  }
};

NotebookInlineDiffDecorationContribution = __decorateClass([
  __decorateParam(1, INotebookEditorWorkerService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, INotebookLoggingService)
], NotebookInlineDiffDecorationContribution);

registerNotebookContribution(NotebookInlineDiffDecorationContribution.ID, NotebookInlineDiffDecorationContribution);

registerSingleton(INotebookOriginalModelReferenceFactory, NotebookOriginalModelReferenceFactory, 1 /* Delayed */);

registerSingleton(INotebookOriginalCellModelFactory, OriginalNotebookCellModelFactory, 1 /* Delayed */);
export { NotebookInlineDiffDecorationContribution };
