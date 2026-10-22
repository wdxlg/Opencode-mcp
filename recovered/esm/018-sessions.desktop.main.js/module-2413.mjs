// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/notebookVisibleCellObserver.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { cellRangesToIndexes } from "./module-0941.mjs";
import { isDefined } from "./module-0010.mjs";
import { diffSets } from "./module-0003.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/notebookVisibleCellObserver.ts
var NotebookVisibleCellObserver = class extends Disposable {
  constructor(_notebookEditor) {
    super();
    this._notebookEditor = _notebookEditor;
    this._onDidChangeVisibleCells = this._register(new Emitter());
    this.onDidChangeVisibleCells = this._onDidChangeVisibleCells.event;
    this._viewModelDisposables = this._register(new DisposableStore());
    this._visibleCells = [];
    this._register(this._notebookEditor.onDidChangeVisibleRanges(this._updateVisibleCells, this));
    this._register(this._notebookEditor.onDidChangeModel(this._onModelChange, this));
    this._updateVisibleCells();
  }
  get visibleCells() {
    return this._visibleCells;
  }
  _onModelChange() {
    this._viewModelDisposables.clear();
    if (this._notebookEditor.hasModel()) {
      this._viewModelDisposables.add(this._notebookEditor.onDidChangeViewCells(() => this.updateEverything()));
    }
    this.updateEverything();
  }
  updateEverything() {
    this._onDidChangeVisibleCells.fire({ added: [], removed: Array.from(this._visibleCells) });
    this._visibleCells = [];
    this._updateVisibleCells();
  }
  _updateVisibleCells() {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    const newVisibleCells = cellRangesToIndexes(this._notebookEditor.visibleRanges).map((index2) => this._notebookEditor.cellAt(index2)).filter(isDefined);
    const newVisibleHandles = new Set(newVisibleCells.map((cell) => cell.handle));
    const oldVisibleHandles = new Set(this._visibleCells.map((cell) => cell.handle));
    const diff4 = diffSets(oldVisibleHandles, newVisibleHandles);
    const added = diff4.added.map((handle2) => this._notebookEditor.getCellByHandle(handle2)).filter(isDefined);
    const removed = diff4.removed.map((handle2) => this._notebookEditor.getCellByHandle(handle2)).filter(isDefined);
    this._visibleCells = newVisibleCells;
    this._onDidChangeVisibleCells.fire({
      added,
      removed
    });
  }
};
export { NotebookVisibleCellObserver };
