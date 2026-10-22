// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/multicursor/notebookSelectionHighlight.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { Selection } from "./module-0107.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerNotebookContribution } from "./module-1870.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/multicursor/notebookSelectionHighlight.ts
var NotebookSelectionHighlighter = class extends Disposable {
  // right now this lets us mimic the more performant cache implementation of the text editor (doesn't need to be a delayer)
  // todo: in the future, implement caching and change to a 250ms delay upon recompute
  // private readonly runDelayer: Delayer<void> = this._register(new Delayer<void>(0));
  constructor(notebookEditor, configurationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.configurationService = configurationService;
    this.isEnabled = false;
    this.cellDecorationIds = /* @__PURE__ */ new Map();
    this.anchorDisposables = new DisposableStore();
    this.isEnabled = this.configurationService.getValue("editor.selectionHighlight");
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("editor.selectionHighlight")) {
        this.isEnabled = this.configurationService.getValue("editor.selectionHighlight");
      }
    }));
    this._register(this.notebookEditor.onDidChangeActiveCell(async () => {
      if (!this.isEnabled) {
        return;
      }
      this.anchorCell = this.notebookEditor.activeCellAndCodeEditor;
      if (!this.anchorCell) {
        return;
      }
      const activeCell = this.notebookEditor.getActiveCell();
      if (!activeCell) {
        return;
      }
      if (!activeCell.editorAttached) {
        await Event2.toPromise(activeCell.onDidChangeEditorAttachState);
      }
      this.clearNotebookSelectionDecorations();
      this.anchorDisposables.clear();
      this.anchorDisposables.add(this.anchorCell[1].onDidChangeCursorPosition((e4) => {
        if (e4.reason !== 3 /* Explicit */) {
          this.clearNotebookSelectionDecorations();
          return;
        }
        if (!this.anchorCell) {
          return;
        }
        if (this.notebookEditor.hasModel()) {
          this.clearNotebookSelectionDecorations();
          this._update(this.notebookEditor);
        }
      }));
      if (this.notebookEditor.getEditorViewState().editorFocused && this.notebookEditor.hasModel()) {
        this._update(this.notebookEditor);
      }
    }));
  }
  static {
    this.id = "notebook.selectionHighlighter";
  }
  _update(editor) {
    if (!this.anchorCell || !this.isEnabled) {
      return;
    }
    const textModel = this.anchorCell[0].textModel;
    if (!textModel || textModel.isTooLargeForTokenization()) {
      return;
    }
    const s = this.anchorCell[0].getSelections()[0];
    if (s.startLineNumber !== s.endLineNumber || s.isEmpty()) {
      return;
    }
    const searchText = this.getSearchText(s, textModel);
    if (!searchText) {
      return;
    }
    const results = editor.textModel.findMatches(
      searchText,
      false,
      true,
      null
    );
    for (const res of results) {
      const cell = editor.getCellByHandle(res.cell.handle);
      if (!cell) {
        continue;
      }
      this.updateCellDecorations(cell, res.matches);
    }
  }
  updateCellDecorations(cell, matches2) {
    const selections = matches2.map((m) => {
      return Selection.fromRange(m.range, 0 /* LTR */);
    });
    const newDecorations = [];
    selections?.map((selection) => {
      const isEmpty = selection.isEmpty();
      if (!isEmpty) {
        newDecorations.push({
          range: selection,
          options: {
            description: "",
            className: ".nb-selection-highlight"
          }
        });
      }
    });
    const oldDecorations = this.cellDecorationIds.get(cell) ?? [];
    this.cellDecorationIds.set(cell, cell.deltaModelDecorations(
      oldDecorations,
      newDecorations
    ));
  }
  clearNotebookSelectionDecorations() {
    this.cellDecorationIds.forEach((_, cell) => {
      const cellDecorations = this.cellDecorationIds.get(cell) ?? [];
      if (cellDecorations) {
        cell.deltaModelDecorations(cellDecorations, []);
        this.cellDecorationIds.delete(cell);
      }
    });
  }
  getSearchText(selection, model) {
    return model.getValueInRange(selection).replace(/\r\n/g, "\n");
  }
  dispose() {
    super.dispose();
    this.anchorDisposables.dispose();
  }
};

NotebookSelectionHighlighter = __decorateClass([
  __decorateParam(1, IConfigurationService)
], NotebookSelectionHighlighter);

registerNotebookContribution(NotebookSelectionHighlighter.id, NotebookSelectionHighlighter);
export { NotebookSelectionHighlighter };
