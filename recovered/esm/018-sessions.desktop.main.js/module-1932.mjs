// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineDataSource.ts
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INotebookOutlineEntryFactory } from "./module-1931.mjs";


// src/vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineDataSource.ts
var NotebookCellOutlineDataSource = class {
  constructor(_editor, _markerService, _configurationService, _outlineEntryFactory) {
    this._editor = _editor;
    this._markerService = _markerService;
    this._configurationService = _configurationService;
    this._outlineEntryFactory = _outlineEntryFactory;
    this._disposables = new DisposableStore();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this._entries = [];
    this.recomputeState();
  }
  get activeElement() {
    return this._activeEntry;
  }
  get entries() {
    return this._entries;
  }
  get isEmpty() {
    return this._entries.length === 0;
  }
  get uri() {
    return this._uri;
  }
  async computeFullSymbols(cancelToken) {
    try {
      const notebookEditorWidget = this._editor;
      const notebookCells = notebookEditorWidget?.getViewModel()?.viewCells.filter((cell) => cell.cellKind === 2 /* Code */);
      if (notebookCells) {
        const promises = [];
        for (const cell of notebookCells.slice(0, 50)) {
          promises.push(this._outlineEntryFactory.cacheSymbols(cell, cancelToken));
        }
        await Promise.allSettled(promises);
      }
      this.recomputeState();
    } catch (err) {
      console.error("Failed to compute notebook outline symbols:", err);
      this.recomputeState();
    }
  }
  recomputeState() {
    this._disposables.clear();
    this._activeEntry = void 0;
    this._uri = void 0;
    if (!this._editor.hasModel()) {
      return;
    }
    this._uri = this._editor.textModel.uri;
    const notebookEditorWidget = this._editor;
    if (notebookEditorWidget.getLength() === 0) {
      return;
    }
    const notebookCells = notebookEditorWidget.getViewModel().viewCells;
    const entries2 = [];
    for (const cell of notebookCells) {
      entries2.push(...this._outlineEntryFactory.getOutlineEntries(cell, entries2.length));
    }
    if (entries2.length > 0) {
      const result = [entries2[0]];
      const parentStack = [entries2[0]];
      for (let i2 = 1; i2 < entries2.length; i2++) {
        const entry = entries2[i2];
        while (true) {
          const len = parentStack.length;
          if (len === 0) {
            result.push(entry);
            parentStack.push(entry);
            break;
          } else {
            const parentCandidate = parentStack[len - 1];
            if (parentCandidate.level < entry.level) {
              parentCandidate.addChild(entry);
              parentStack.push(entry);
              break;
            } else {
              parentStack.pop();
            }
          }
        }
      }
      this._entries = result;
    }
    const markerServiceListener = new MutableDisposable();
    this._disposables.add(markerServiceListener);
    const updateMarkerUpdater = () => {
      if (notebookEditorWidget.isDisposed) {
        return;
      }
      const doUpdateMarker = (clear) => {
        for (const entry of this._entries) {
          if (clear) {
            entry.clearMarkers();
          } else {
            entry.updateMarkers(this._markerService);
          }
        }
      };
      const problem = this._configurationService.getValue("problems.visibility");
      if (problem === void 0) {
        return;
      }
      const config = this._configurationService.getValue("outline.problems.enabled" /* problemsEnabled */);
      if (problem && config) {
        markerServiceListener.value = this._markerService.onMarkerChanged((e4) => {
          if (notebookEditorWidget.isDisposed) {
            console.error("notebook editor is disposed");
            return;
          }
          if (e4.some((uri4) => notebookEditorWidget.getCellsInRange().some((cell) => isEqual2(cell.uri, uri4)))) {
            doUpdateMarker(false);
            this._onDidChange.fire({});
          }
        });
        doUpdateMarker(false);
      } else {
        markerServiceListener.clear();
        doUpdateMarker(true);
      }
    };
    updateMarkerUpdater();
    this._disposables.add(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("problems.visibility") || e4.affectsConfiguration("outline.problems.enabled" /* problemsEnabled */)) {
        updateMarkerUpdater();
        this._onDidChange.fire({});
      }
    }));
    const { changeEventTriggered } = this.recomputeActive();
    if (!changeEventTriggered) {
      this._onDidChange.fire({});
    }
  }
  recomputeActive() {
    let newActive;
    const notebookEditorWidget = this._editor;
    if (notebookEditorWidget) {
      if (notebookEditorWidget.hasModel() && notebookEditorWidget.getLength() > 0) {
        const cell = notebookEditorWidget.cellAt(notebookEditorWidget.getFocus().start);
        if (cell) {
          for (const entry of this._entries) {
            newActive = entry.find(cell, []);
            if (newActive) {
              break;
            }
          }
        }
      }
    }
    if (newActive !== this._activeEntry) {
      this._activeEntry = newActive;
      this._onDidChange.fire({ affectOnlyActiveElement: true });
      return { changeEventTriggered: true };
    }
    return { changeEventTriggered: false };
  }
  dispose() {
    this._entries.length = 0;
    this._activeEntry = void 0;
    this._disposables.dispose();
    this._onDidChange.dispose();
  }
};

NotebookCellOutlineDataSource = __decorateClass([
  __decorateParam(1, IMarkerService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, INotebookOutlineEntryFactory)
], NotebookCellOutlineDataSource);
export { NotebookCellOutlineDataSource };
