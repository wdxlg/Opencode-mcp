// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/notebook/chatEditingNotebookEditorIntegration.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0941.mjs";
import { assertType } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { observableValue } from "./module-0048.mjs";
import { PrefixSumComputer } from "./module-0200.mjs";
import { debouncedObservable } from "./module-0059.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { countChanges, sortCellChanges } from "./module-2724.mjs";
import { nullDocumentDiff } from "./module-2718.mjs";
import { ChatEditingCodeEditorIntegration } from "./module-2717.mjs";
import { NotebookInsertedCellDecorator } from "./module-1983.mjs";
import { NotebookModifiedCellDecorator } from "./module-2723.mjs";
import { OverlayToolbarDecorator } from "./module-2725.mjs";
import { NotebookDeletedCellDecorator } from "./module-1982.mjs";
import { MenuId } from "./module-0092.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { LineRange } from "./module-0174.mjs";
import { Range2 } from "./module-0106.mjs";
import { localize } from "./module-0001.mjs";
import { basename2 } from "./module-0034.mjs";
import { IEditorService } from "./module-0934.mjs";
import { INotebookEditorService } from "./module-1386.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/notebook/chatEditingNotebookEditorIntegration.ts
var ChatEditingNotebookEditorIntegration = class extends Disposable {
  constructor(_entry, editor, notebookModel, originalModel, cellChanges, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    const notebookEditor = getNotebookEditorFromEditorPane(editor);
    assertType(notebookEditor);
    this.notebookEditor = notebookEditor;
    this.integration = this.instantiationService.createInstance(ChatEditingNotebookEditorWidgetIntegration, _entry, notebookEditor, notebookModel, originalModel, cellChanges);
    this._register(editor.onDidChangeControl(() => {
      const notebookEditor2 = getNotebookEditorFromEditorPane(editor);
      if (notebookEditor2 && notebookEditor2 !== this.notebookEditor) {
        this.notebookEditor = notebookEditor2;
        this.integration.dispose();
        this.integration = this.instantiationService.createInstance(ChatEditingNotebookEditorWidgetIntegration, _entry, notebookEditor2, notebookModel, originalModel, cellChanges);
      }
    }));
  }
  get currentIndex() {
    return this.integration.currentIndex;
  }
  reveal(firstOrLast) {
    return this.integration.reveal(firstOrLast);
  }
  next(wrap) {
    return this.integration.next(wrap);
  }
  previous(wrap) {
    return this.integration.previous(wrap);
  }
  enableAccessibleDiffView() {
    this.integration.enableAccessibleDiffView();
  }
  acceptNearestChange(change) {
    return this.integration.acceptNearestChange(change);
  }
  rejectNearestChange(change) {
    return this.integration.rejectNearestChange(change);
  }
  toggleDiff(change, show3) {
    return this.integration.toggleDiff(change, show3);
  }
  dispose() {
    this.integration.dispose();
    super.dispose();
  }
};

ChatEditingNotebookEditorIntegration = __decorateClass([
  __decorateParam(5, IInstantiationService)
], ChatEditingNotebookEditorIntegration);

var ChatEditingNotebookEditorWidgetIntegration = class extends Disposable {
  constructor(_entry, notebookEditor, notebookModel, originalModel, cellChanges, instantiationService, _editorService, notebookEditorService, accessibilitySignalService, logService) {
    super();
    this._entry = _entry;
    this.notebookEditor = notebookEditor;
    this.notebookModel = notebookModel;
    this.cellChanges = cellChanges;
    this.instantiationService = instantiationService;
    this._editorService = _editorService;
    this.accessibilitySignalService = accessibilitySignalService;
    this.logService = logService;
    this._currentIndex = observableValue(this, -1);
    this.currentIndex = this._currentIndex;
    this.cellEditorIntegrations = /* @__PURE__ */ new Map();
    this.markdownEditState = observableValue(this, "");
    this.markupCellListeners = /* @__PURE__ */ new Map();
    this.sortedCellChanges = [];
    this.changeIndexComputer = new PrefixSumComputer(new Uint32Array(0));
    const onDidChangeVisibleRanges = debouncedObservable(observableFromEvent(notebookEditor.onDidChangeVisibleRanges, () => notebookEditor.visibleRanges), 50);
    this._register(toDisposable(() => {
      this.markupCellListeners.forEach((v2) => v2.dispose());
    }));
    let originalReadonly = void 0;
    const shouldBeReadonly = _entry.isCurrentlyBeingModifiedBy.map((value2) => !!value2);
    this._register(autorun((r2) => {
      const isReadOnly2 = shouldBeReadonly.read(r2);
      const notebookEditor2 = notebookEditorService.retrieveExistingWidgetFromURI(_entry.modifiedURI)?.value;
      if (!notebookEditor2) {
        return;
      }
      if (isReadOnly2) {
        originalReadonly ??= notebookEditor2.isReadOnly;
        notebookEditor2.setOptions({ isReadOnly: true });
      } else if (originalReadonly === false) {
        notebookEditor2.setOptions({ isReadOnly: false });
        const timeout2 = setTimeout(() => {
          notebookEditor2.setOptions({ isReadOnly: true });
          notebookEditor2.setOptions({ isReadOnly: false });
          disposable.dispose();
        }, 100);
        const disposable = toDisposable(() => clearTimeout(timeout2));
        r2.store.add(disposable);
      }
    }));
    let lastModifyingRequestId;
    this._store.add(autorun((r2) => {
      if (!_entry.isCurrentlyBeingModifiedBy.read(r2) && !_entry.isProcessingResponse.read(r2) && lastModifyingRequestId !== _entry.lastModifyingRequestId && cellChanges.read(r2).some((c) => c.type !== "unchanged" && !c.diff.read(r2).identical)) {
        lastModifyingRequestId = _entry.lastModifyingRequestId;
        const visibleChange = this.sortedCellChanges.find((c) => {
          if (c.type === "unchanged") {
            return false;
          }
          const index2 = c.modifiedCellIndex ?? c.originalCellIndex;
          return this.notebookEditor.visibleRanges.some((range2) => index2 >= range2.start && index2 < range2.end);
        });
        if (!visibleChange) {
          this.reveal(true);
        }
      }
    }));
    this._register(autorun((r2) => {
      this.sortedCellChanges = sortCellChanges(cellChanges.read(r2));
      const indexes = [];
      for (const change of this.sortedCellChanges) {
        indexes.push(change.type === "insert" || change.type === "delete" ? 1 : change.type === "modified" ? change.diff.read(r2).changes.length : 0);
      }
      this.changeIndexComputer = new PrefixSumComputer(new Uint32Array(indexes));
      if (this.changeIndexComputer.getTotalSum() === 0) {
        this.revertMarkupCellState();
      }
    }));
    this._register(autorun((r2) => {
      if (this.notebookEditor.textModel !== this.notebookModel) {
        return;
      }
      const sortedCellChanges = sortCellChanges(cellChanges.read(r2));
      const changes = sortedCellChanges.filter((c) => c.type !== "delete");
      onDidChangeVisibleRanges.read(r2);
      if (!changes.length) {
        this.cellEditorIntegrations.forEach(({ diff: diff4 }) => {
          diff4.set({ ...diff4.read(void 0), ...nullDocumentDiff }, void 0);
        });
        return;
      }
      this.markdownEditState.read(r2);
      const validCells = /* @__PURE__ */ new Set();
      changes.forEach((change) => {
        if (change.modifiedCellIndex === void 0 || change.modifiedCellIndex >= notebookModel.cells.length) {
          return;
        }
        const cell = notebookModel.cells[change.modifiedCellIndex];
        const editor = notebookEditor.codeEditors.find(([vm]) => vm.handle === notebookModel.cells[change.modifiedCellIndex].handle)?.[1];
        const modifiedModel = change.modifiedModel.promiseResult.read(r2)?.data;
        const originalModel2 = change.originalModel.promiseResult.read(r2)?.data;
        if (!cell || !originalModel2 || !modifiedModel) {
          return;
        }
        if (cell.cellKind === 1 /* Markup */ && !this.markupCellListeners.has(cell.handle)) {
          const cellModel = this.notebookEditor.getViewModel()?.viewCells.find((c) => c.handle === cell.handle);
          if (cellModel) {
            const listener = cellModel.onDidChangeState((e) => {
              if (e.editStateChanged) {
                setTimeout(() => this.markdownEditState.set(cellModel.handle + "-" + cellModel.getEditState(), void 0), 0);
              }
            });
            this.markupCellListeners.set(cell.handle, listener);
          }
        }
        if (!editor) {
          return;
        }
        const diff4 = {
          ...change.diff.read(r2),
          modifiedModel,
          originalModel: originalModel2,
          keep: change.keep,
          undo: change.undo
        };
        validCells.add(cell);
        const currentDiff = this.cellEditorIntegrations.get(cell);
        if (currentDiff) {
          if (!areDocumentDiff2Equal(currentDiff.diff.read(void 0), diff4)) {
            currentDiff.diff.set(diff4, void 0);
          }
        } else {
          const diff22 = observableValue(`diff${cell.handle}`, diff4);
          const integration = this.instantiationService.createInstance(ChatEditingCodeEditorIntegration, _entry, editor, diff22, true);
          this.cellEditorIntegrations.set(cell, { integration, diff: diff22 });
          this._register(integration);
          this._register(editor.onDidDispose(() => {
            this.cellEditorIntegrations.get(cell)?.integration.dispose();
            this.cellEditorIntegrations.delete(cell);
          }));
          this._register(editor.onDidChangeModel(() => {
            if (editor.getModel() !== cell.textModel) {
              this.cellEditorIntegrations.get(cell)?.integration.dispose();
              this.cellEditorIntegrations.delete(cell);
            }
          }));
        }
      });
      this.cellEditorIntegrations.forEach((v2, cell) => {
        if (!validCells.has(cell)) {
          v2.integration.dispose();
          this.cellEditorIntegrations.delete(cell);
        }
      });
    }));
    const cellsAreVisible = onDidChangeVisibleRanges.map((v2) => v2.length > 0);
    const debouncedChanges = debouncedObservable(cellChanges, 10);
    this._register(autorun((r2) => {
      if (this.notebookEditor.textModel !== this.notebookModel || !cellsAreVisible.read(r2) || !this.notebookEditor.getViewModel()) {
        return;
      }
      const changes = debouncedChanges.read(r2).filter((c) => c.type === "insert" ? !c.diff.read(r2).identical : true);
      const modifiedChanges = changes.filter((c) => c.type === "modified");
      this.createDecorators();
      if (changes.every((c) => c.type === "insert")) {
        this.insertedCellDecorator?.apply([]);
        this.modifiedCellDecorator?.apply([]);
        this.deletedCellDecorator?.apply([], originalModel);
        this.overlayToolbarDecorator?.decorate([]);
      } else {
        this.insertedCellDecorator?.apply(changes);
        this.modifiedCellDecorator?.apply(modifiedChanges);
        this.deletedCellDecorator?.apply(changes, originalModel);
        this.overlayToolbarDecorator?.decorate(changes.filter((c) => c.type === "insert" || c.type === "modified"));
      }
    }));
  }
  getCurrentChange() {
    const currentIndex = Math.min(this._currentIndex.get(), this.changeIndexComputer.getTotalSum() - 1);
    const index2 = this.changeIndexComputer.getIndexOf(currentIndex);
    const change = this.sortedCellChanges[index2.index];
    return change ? { change, index: index2.remainder } : void 0;
  }
  updateCurrentIndex(change, indexInCell = 0) {
    const index2 = this.sortedCellChanges.indexOf(change);
    const changeIndex = this.changeIndexComputer.getPrefixSum(index2 - 1);
    const currentIndex = Math.min(changeIndex + indexInCell, this.changeIndexComputer.getTotalSum() - 1);
    this._currentIndex.set(currentIndex, void 0);
  }
  createDecorators() {
    const cellChanges = this.cellChanges.get();
    const accessibilitySignalService = this.accessibilitySignalService;
    this.insertedCellDecorator ??= this._register(this.instantiationService.createInstance(NotebookInsertedCellDecorator, this.notebookEditor));
    this.modifiedCellDecorator ??= this._register(this.instantiationService.createInstance(NotebookModifiedCellDecorator, this.notebookEditor));
    this.overlayToolbarDecorator ??= this._register(this.instantiationService.createInstance(OverlayToolbarDecorator, this.notebookEditor, this.notebookModel));
    if (this.deletedCellDecorator) {
      this._store.delete(this.deletedCellDecorator);
      this.deletedCellDecorator.dispose();
    }
    this.deletedCellDecorator = this._register(this.instantiationService.createInstance(NotebookDeletedCellDecorator, this.notebookEditor, {
      className: "chat-diff-change-content-widget",
      telemetrySource: "chatEditingNotebookHunk",
      menuId: MenuId.ChatEditingEditorHunk,
      actionViewItemProvider: (action, options3) => {
        if (!action.class) {
          return new class extends ActionViewItem {
            constructor() {
              super(void 0, action, { ...options3, keybindingNotRenderedWithLabel: true, icon: false, label: true });
            }
          }();
        }
        return void 0;
      },
      argFactory: (deletedCellIndex) => {
        return {
          accept() {
            const entry = cellChanges.find((c) => c.type === "delete" && c.originalCellIndex === deletedCellIndex);
            if (entry) {
              return entry.keep(entry.diff.get().changes[0]);
            }
            accessibilitySignalService.playSignal(AccessibilitySignal.editsKept, { allowManyInParallel: true });
            return Promise.resolve(true);
          },
          reject() {
            const entry = cellChanges.find((c) => c.type === "delete" && c.originalCellIndex === deletedCellIndex);
            if (entry) {
              return entry.undo(entry.diff.get().changes[0]);
            }
            accessibilitySignalService.playSignal(AccessibilitySignal.editsUndone, { allowManyInParallel: true });
            return Promise.resolve(true);
          }
        };
      }
    }));
  }
  getCell(modifiedCellIndex) {
    const cell = this.notebookModel.cells[modifiedCellIndex];
    const integration = this.cellEditorIntegrations.get(cell)?.integration;
    return integration;
  }
  reveal(firstOrLast) {
    const changes = this.sortedCellChanges.filter((c) => c.type !== "unchanged");
    if (!changes.length) {
      return;
    }
    const change = firstOrLast ? changes[0] : changes[changes.length - 1];
    this._revealFirstOrLast(change, firstOrLast);
  }
  _revealFirstOrLast(change, firstOrLast = true) {
    switch (change.type) {
      case "insert":
      case "modified": {
        this.blur(this.getCurrentChange()?.change);
        const index2 = firstOrLast || change.type === "insert" ? 0 : change.diff.get().changes.length - 1;
        return this._revealChange(change, index2);
      }
      case "delete":
        this.blur(this.getCurrentChange()?.change);
        this.deletedCellDecorator?.reveal(change.originalCellIndex);
        this.updateCurrentIndex(change);
        return true;
      default:
        break;
    }
    return false;
  }
  _revealChange(change, indexInCell) {
    switch (change.type) {
      case "insert":
      case "modified": {
        const textChange = change.diff.get().changes[indexInCell];
        const cellViewModel = this.getCellViewModel(change);
        if (cellViewModel) {
          this.updateCurrentIndex(change, indexInCell);
          this.revealChangeInView(cellViewModel, textChange?.modified, change).catch((err) => {
            this.logService.warn(`Error revealing change in view: ${err}`);
          });
          return true;
        }
        break;
      }
      case "delete":
        this.updateCurrentIndex(change);
        this.deletedCellDecorator?.reveal(change.originalCellIndex);
        return true;
      default:
        break;
    }
    return false;
  }
  getCellViewModel(change) {
    if (change.type === "delete" || change.modifiedCellIndex === void 0 || change.modifiedCellIndex >= this.notebookModel.cells.length) {
      return void 0;
    }
    const cell = this.notebookModel.cells[change.modifiedCellIndex];
    const cellViewModel = this.notebookEditor.getViewModel()?.viewCells.find((c) => c.handle === cell.handle);
    return cellViewModel;
  }
  async revealChangeInView(cell, lines, change) {
    const targetLines = lines ?? new LineRange(0, 0);
    if (change.type === "modified" && cell.cellKind === 1 /* Markup */ && cell.getEditState() === 0 /* Preview */) {
      cell.updateEditState(1 /* Editing */, "chatEditNavigation");
    }
    const focusTarget = cell.cellKind === 2 /* Code */ || change.type === "modified" ? "editor" : "container";
    await this.notebookEditor.focusNotebookCell(cell, focusTarget, { focusEditorLine: targetLines.startLineNumber });
    await this.notebookEditor.revealRangeInCenterAsync(cell, new Range2(targetLines.startLineNumber, 0, targetLines.endLineNumberExclusive, 0));
  }
  revertMarkupCellState() {
    for (const change of this.sortedCellChanges) {
      const cellViewModel = this.getCellViewModel(change);
      if (cellViewModel?.cellKind === 1 /* Markup */ && cellViewModel.getEditState() === 1 /* Editing */ && (cellViewModel.editStateSource === "chatEditNavigation" || cellViewModel.editStateSource === "chatEdit")) {
        cellViewModel.updateEditState(0 /* Preview */, "chatEdit");
      }
    }
  }
  blur(change) {
    if (!change) {
      return;
    }
    const cellViewModel = this.getCellViewModel(change);
    if (cellViewModel?.cellKind === 1 /* Markup */ && cellViewModel.getEditState() === 1 /* Editing */ && cellViewModel.editStateSource === "chatEditNavigation") {
      cellViewModel.updateEditState(0 /* Preview */, "chatEditNavigation");
    }
  }
  next(wrap) {
    const changes = this.sortedCellChanges.filter((c) => c.type !== "unchanged");
    const currentChange = this.getCurrentChange();
    if (!currentChange) {
      const firstChange = changes[0];
      if (firstChange) {
        return this._revealFirstOrLast(firstChange);
      }
      return false;
    }
    switch (currentChange.change.type) {
      case "modified":
        {
          const cellIntegration = this.getCell(currentChange.change.modifiedCellIndex);
          if (cellIntegration) {
            if (cellIntegration.next(false)) {
              this.updateCurrentIndex(currentChange.change, cellIntegration.currentIndex.get());
              return true;
            }
          }
          const isLastChangeInCell = currentChange.index >= lastChangeIndex(currentChange.change);
          const index2 = isLastChangeInCell ? 0 : currentChange.index + 1;
          const change = isLastChangeInCell ? changes[changes.indexOf(currentChange.change) + 1] : currentChange.change;
          if (change) {
            if (isLastChangeInCell) {
              this.blur(currentChange.change);
            }
            if (this._revealChange(change, index2)) {
              return true;
            }
          }
        }
        break;
      case "insert":
      case "delete":
        {
          this.blur(currentChange.change);
          const nextChange = changes[changes.indexOf(currentChange.change) + 1];
          if (nextChange && this._revealFirstOrLast(nextChange, true)) {
            return true;
          }
        }
        break;
      default:
        break;
    }
    if (wrap) {
      const firstChange = changes[0];
      if (firstChange) {
        return this._revealFirstOrLast(firstChange, true);
      }
    }
    return false;
  }
  previous(wrap) {
    const changes = this.sortedCellChanges.filter((c) => c.type !== "unchanged");
    const currentChange = this.getCurrentChange();
    if (!currentChange) {
      const lastChange = changes[changes.length - 1];
      if (lastChange) {
        return this._revealFirstOrLast(lastChange, false);
      }
      return false;
    }
    switch (currentChange.change.type) {
      case "modified":
        {
          const cellIntegration = this.getCell(currentChange.change.modifiedCellIndex);
          if (cellIntegration) {
            if (cellIntegration.previous(false)) {
              this.updateCurrentIndex(currentChange.change, cellIntegration.currentIndex.get());
              return true;
            }
          }
          const isFirstChangeInCell = currentChange.index <= 0;
          const change = isFirstChangeInCell ? changes[changes.indexOf(currentChange.change) - 1] : currentChange.change;
          if (change) {
            const index2 = isFirstChangeInCell ? lastChangeIndex(change) : currentChange.index - 1;
            if (isFirstChangeInCell) {
              this.blur(currentChange.change);
            }
            if (this._revealChange(change, index2)) {
              return true;
            }
          }
        }
        break;
      case "insert":
      case "delete":
        {
          this.blur(currentChange.change);
          const prevChange = changes[changes.indexOf(currentChange.change) - 1];
          if (prevChange && this._revealFirstOrLast(prevChange, false)) {
            return true;
          }
        }
        break;
      default:
        break;
    }
    if (wrap) {
      const lastChange = changes[changes.length - 1];
      if (lastChange) {
        return this._revealFirstOrLast(lastChange, false);
      }
    }
    return false;
  }
  enableAccessibleDiffView() {
    const cell = this.notebookEditor.getActiveCell()?.model;
    if (cell) {
      const integration = this.cellEditorIntegrations.get(cell)?.integration;
      integration?.enableAccessibleDiffView();
    }
  }
  getfocusedIntegration() {
    const first2 = this.notebookEditor.getSelectionViewModels()[0];
    if (first2) {
      return this.cellEditorIntegrations.get(first2.model)?.integration;
    }
    return void 0;
  }
  async acceptNearestChange(hunk) {
    if (hunk) {
      await hunk.accept();
    } else {
      const current = this.getCurrentChange();
      const focused = this.getfocusedIntegration();
      if (current && !focused || current?.change.type === "delete") {
        current.change.keep(current?.change.diff.get().changes[current.index]);
      } else if (focused) {
        await focused.acceptNearestChange();
      }
      this._currentIndex.set(this._currentIndex.get() - 1, void 0);
      this.next(true);
    }
  }
  async rejectNearestChange(hunk) {
    if (hunk) {
      await hunk.reject();
    } else {
      const current = this.getCurrentChange();
      const focused = this.getfocusedIntegration();
      if (current && !focused || current?.change.type === "delete") {
        current.change.undo(current.change.diff.get().changes[current.index]);
      } else if (focused) {
        await focused.rejectNearestChange();
      }
      this._currentIndex.set(this._currentIndex.get() - 1, void 0);
      this.next(true);
    }
  }
  async toggleDiff(_change, _show) {
    const diffInput = {
      original: { resource: this._entry.originalURI },
      modified: { resource: this._entry.modifiedURI },
      label: localize(10885, null, basename2(this._entry.modifiedURI))
    };
    await this._editorService.openEditor(diffInput);
  }
};

ChatEditingNotebookEditorWidgetIntegration = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, INotebookEditorService),
  __decorateParam(8, IAccessibilitySignalService),
  __decorateParam(9, ILogService)
], ChatEditingNotebookEditorWidgetIntegration);

var ChatEditingNotebookDiffEditorIntegration = class extends Disposable {
  constructor(notebookDiffEditor, cellChanges) {
    super();
    this.notebookDiffEditor = notebookDiffEditor;
    this.cellChanges = cellChanges;
    this._currentIndex = observableValue(this, -1);
    this.currentIndex = this._currentIndex;
    this._store.add(autorun((r2) => {
      const index2 = notebookDiffEditor.currentChangedIndex.read(r2);
      const numberOfCellChanges = cellChanges.read(r2).filter((c) => !c.diff.read(r2).identical);
      if (numberOfCellChanges.length && index2 >= 0 && index2 < numberOfCellChanges.length) {
        const changesSoFar = countChanges(numberOfCellChanges.slice(0, index2 + 1));
        this._currentIndex.set(changesSoFar - 1, void 0);
      } else {
        this._currentIndex.set(-1, void 0);
      }
    }));
  }
  reveal(firstOrLast) {
    const changes = sortCellChanges(this.cellChanges.get().filter((c) => c.type !== "unchanged"));
    if (!changes.length) {
      return void 0;
    }
    if (firstOrLast) {
      this.notebookDiffEditor.firstChange();
    } else {
      this.notebookDiffEditor.lastChange();
    }
  }
  next(_wrap) {
    const changes = this.cellChanges.get().filter((c) => !c.diff.get().identical).length;
    if (this.notebookDiffEditor.currentChangedIndex.get() === changes - 1) {
      return false;
    }
    this.notebookDiffEditor.nextChange();
    return true;
  }
  previous(_wrap) {
    const changes = this.cellChanges.get().filter((c) => !c.diff.get().identical).length;
    if (this.notebookDiffEditor.currentChangedIndex.get() === changes - 1) {
      return false;
    }
    this.notebookDiffEditor.nextChange();
    return true;
  }
  enableAccessibleDiffView() {
  }
  async acceptNearestChange(change) {
    await change.accept();
    this.next(true);
  }
  async rejectNearestChange(change) {
    await change.reject();
    this.next(true);
  }
  async toggleDiff(_change, _show) {
  }
};

function areDocumentDiff2Equal(diff1, diff22) {
  if (diff1.changes !== diff22.changes) {
    return false;
  }
  if (diff1.identical !== diff22.identical) {
    return false;
  }
  if (diff1.moves !== diff22.moves) {
    return false;
  }
  if (diff1.originalModel !== diff22.originalModel) {
    return false;
  }
  if (diff1.modifiedModel !== diff22.modifiedModel) {
    return false;
  }
  if (diff1.keep !== diff22.keep) {
    return false;
  }
  if (diff1.undo !== diff22.undo) {
    return false;
  }
  if (diff1.quitEarly !== diff22.quitEarly) {
    return false;
  }
  return true;
}

function lastChangeIndex(change) {
  if (change.type === "modified") {
    return change.diff.get().changes.length - 1;
  }
  return 0;
}
export { areDocumentDiff2Equal, lastChangeIndex, ChatEditingNotebookEditorIntegration, ChatEditingNotebookEditorWidgetIntegration, ChatEditingNotebookDiffEditorIntegration };
