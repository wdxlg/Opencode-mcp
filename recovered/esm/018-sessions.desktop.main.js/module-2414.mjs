// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/contributedStatusBarItemController.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { NotebookVisibleCellObserver } from "./module-2413.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookCellStatusBarService } from "./module-1383.mjs";
import { Throttler } from "./module-0036.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { registerNotebookContribution } from "./module-1870.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/contributedStatusBarItemController.ts
var ContributedStatusBarItemController = class extends Disposable {
  constructor(_notebookEditor, _notebookCellStatusBarService) {
    super();
    this._notebookEditor = _notebookEditor;
    this._notebookCellStatusBarService = _notebookCellStatusBarService;
    this._visibleCells = /* @__PURE__ */ new Map();
    this._observer = this._register(new NotebookVisibleCellObserver(this._notebookEditor));
    this._register(this._observer.onDidChangeVisibleCells(this._updateVisibleCells, this));
    this._updateEverything();
    this._register(this._notebookCellStatusBarService.onDidChangeProviders(this._updateEverything, this));
    this._register(this._notebookCellStatusBarService.onDidChangeItems(this._updateEverything, this));
  }
  static {
    this.id = "workbench.notebook.statusBar.contributed";
  }
  _updateEverything() {
    const newCells = this._observer.visibleCells.filter((cell) => !this._visibleCells.has(cell.handle));
    const visibleCellHandles = new Set(this._observer.visibleCells.map((item) => item.handle));
    const currentCellHandles = Array.from(this._visibleCells.keys());
    const removedCells = currentCellHandles.filter((handle2) => !visibleCellHandles.has(handle2));
    const itemsToUpdate = currentCellHandles.filter((handle2) => visibleCellHandles.has(handle2));
    this._updateVisibleCells({ added: newCells, removed: removedCells.map((handle2) => ({ handle: handle2 })) });
    itemsToUpdate.forEach((handle2) => this._visibleCells.get(handle2)?.update());
  }
  _updateVisibleCells(e4) {
    const vm = this._notebookEditor.getViewModel();
    if (!vm) {
      return;
    }
    for (const newCell of e4.added) {
      const helper = new CellStatusBarHelper(vm, newCell, this._notebookCellStatusBarService);
      this._visibleCells.set(newCell.handle, helper);
    }
    for (const oldCell of e4.removed) {
      this._visibleCells.get(oldCell.handle)?.dispose();
      this._visibleCells.delete(oldCell.handle);
    }
  }
  dispose() {
    super.dispose();
    this._visibleCells.forEach((cell) => cell.dispose());
    this._visibleCells.clear();
  }
};

ContributedStatusBarItemController = __decorateClass([
  __decorateParam(1, INotebookCellStatusBarService)
], ContributedStatusBarItemController);

var CellStatusBarHelper = class extends Disposable {
  constructor(_notebookViewModel, _cell, _notebookCellStatusBarService) {
    super();
    this._notebookViewModel = _notebookViewModel;
    this._cell = _cell;
    this._notebookCellStatusBarService = _notebookCellStatusBarService;
    this._currentItemIds = [];
    this._currentItemLists = [];
    this._isDisposed = false;
    this._updateThrottler = this._register(new Throttler());
    this._register(toDisposable(() => this._activeToken?.dispose(true)));
    this._updateSoon();
    this._register(this._cell.model.onDidChangeContent(() => this._updateSoon()));
    this._register(this._cell.model.onDidChangeLanguage(() => this._updateSoon()));
    this._register(this._cell.model.onDidChangeMetadata(() => this._updateSoon()));
    this._register(this._cell.model.onDidChangeInternalMetadata(() => this._updateSoon()));
    this._register(this._cell.model.onDidChangeOutputs(() => this._updateSoon()));
  }
  update() {
    this._updateSoon();
  }
  _updateSoon() {
    setTimeout(() => {
      if (!this._isDisposed) {
        this._updateThrottler.queue(() => this._update());
      }
    }, 0);
  }
  async _update() {
    const cellIndex = this._notebookViewModel.getCellIndex(this._cell);
    const docUri = this._notebookViewModel.notebookDocument.uri;
    const viewType = this._notebookViewModel.notebookDocument.viewType;
    this._activeToken?.dispose(true);
    const tokenSource = this._activeToken = new CancellationTokenSource();
    const itemLists = await this._notebookCellStatusBarService.getStatusBarItemsForCell(docUri, cellIndex, viewType, tokenSource.token);
    if (tokenSource.token.isCancellationRequested) {
      itemLists.forEach((itemList) => itemList.dispose && itemList.dispose());
      return;
    }
    const items = itemLists.map((itemList) => itemList.items).flat();
    const newIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
    this._currentItemLists.forEach((itemList) => itemList.dispose && itemList.dispose());
    this._currentItemLists = itemLists;
    this._currentItemIds = newIds;
  }
  dispose() {
    super.dispose();
    this._isDisposed = true;
    this._activeToken?.dispose(true);
    this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items: [] }]);
    this._currentItemLists.forEach((itemList) => itemList.dispose && itemList.dispose());
  }
};

registerNotebookContribution(ContributedStatusBarItemController.id, ContributedStatusBarItemController);
export { ContributedStatusBarItemController, CellStatusBarHelper };
