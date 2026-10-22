// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/notebookDiffViewModel.ts
import { Disposable, DisposableStore, dispose } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { raceCancellation } from "./module-0036.mjs";
import { computeDiff2 } from "./module-1977.mjs";
import { CellUri } from "./module-0909.mjs";
import { Schemas } from "./module-0033.mjs";
import { DiffElementPlaceholderViewModel, NotebookDocumentMetadataViewModel, SideBySideDiffElementViewModel, SingleSideDiffElementViewModel } from "./module-1970.mjs";
import { MultiDiffEditorItem } from "./module-1147.mjs";
import { NOTEBOOK_DIFF_ITEM_DIFF_STATE, NOTEBOOK_DIFF_ITEM_KIND } from "./module-1968.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/notebookDiffViewModel.ts
var NotebookDiffViewModel = class extends Disposable {
  constructor(model, notebookEditorWorkerService, configurationService, eventDispatcher, notebookService, diffEditorHeightCalculator, fontInfo, excludeUnchangedPlaceholder) {
    super();
    this.model = model;
    this.notebookEditorWorkerService = notebookEditorWorkerService;
    this.configurationService = configurationService;
    this.eventDispatcher = eventDispatcher;
    this.notebookService = notebookService;
    this.diffEditorHeightCalculator = diffEditorHeightCalculator;
    this.fontInfo = fontInfo;
    this.excludeUnchangedPlaceholder = excludeUnchangedPlaceholder;
    this.placeholderAndRelatedCells = /* @__PURE__ */ new Map();
    this._items = [];
    this._onDidChangeItems = this._register(new Emitter());
    this.onDidChangeItems = this._onDidChangeItems.event;
    this.disposables = this._register(new DisposableStore());
    this._onDidChange = this._register(new Emitter());
    this.diffEditorItems = [];
    this.onDidChange = this._onDidChange.event;
    this.originalCellViewModels = [];
    this.hideOutput = this.model.modified.notebook.transientOptions.transientOutputs || this.configurationService.getValue("notebook.diff.ignoreOutputs");
    this.ignoreMetadata = this.configurationService.getValue("notebook.diff.ignoreMetadata");
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      let triggerChange = false;
      let metadataChanged = false;
      if (e.affectsConfiguration("notebook.diff.ignoreMetadata")) {
        const newValue = this.configurationService.getValue("notebook.diff.ignoreMetadata");
        if (newValue !== void 0 && this.ignoreMetadata !== newValue) {
          this.ignoreMetadata = newValue;
          triggerChange = true;
          metadataChanged = true;
        }
      }
      if (e.affectsConfiguration("notebook.diff.ignoreOutputs")) {
        const newValue = this.configurationService.getValue("notebook.diff.ignoreOutputs");
        if (newValue !== void 0 && this.hideOutput !== (newValue || this.model.modified.notebook.transientOptions.transientOutputs)) {
          this.hideOutput = newValue || !!this.model.modified.notebook.transientOptions.transientOutputs;
          triggerChange = true;
        }
      }
      if (metadataChanged) {
        this.toggleNotebookMetadata();
      }
      if (triggerChange) {
        this._onDidChange.fire();
      }
    }));
  }
  get items() {
    return this._items;
  }
  get value() {
    return this.diffEditorItems.filter((item) => item.type !== "placeholder").filter((item) => {
      if (this._includeUnchanged) {
        return true;
      }
      if (item instanceof NotebookMultiDiffEditorCellItem) {
        return item.type === "unchanged" && item.containerType === "unchanged" ? false : true;
      }
      if (item instanceof NotebookMultiDiffEditorMetadataItem) {
        return item.type === "unchanged" && item.containerType === "unchanged" ? false : true;
      }
      if (item instanceof NotebookMultiDiffEditorOutputItem) {
        return item.type === "unchanged" && item.containerType === "unchanged" ? false : true;
      }
      return true;
    }).filter((item) => item instanceof NotebookMultiDiffEditorOutputItem ? !this.hideOutput : true).filter((item) => item instanceof NotebookMultiDiffEditorMetadataItem ? !this.ignoreMetadata : true);
  }
  get hasUnchangedCells() {
    return this._hasUnchangedCells === true;
  }
  get includeUnchanged() {
    return this._includeUnchanged === true;
  }
  set includeUnchanged(value2) {
    this._includeUnchanged = value2;
    this._onDidChange.fire();
  }
  dispose() {
    this.clear();
    super.dispose();
  }
  clear() {
    this.disposables.clear();
    dispose(Array.from(this.placeholderAndRelatedCells.keys()));
    this.placeholderAndRelatedCells.clear();
    dispose(this.originalCellViewModels);
    this.originalCellViewModels = [];
    dispose(this._items);
    this._items.splice(0, this._items.length);
  }
  async computeDiff(token) {
    const diffResult = await raceCancellation(this.notebookEditorWorkerService.computeDiff(this.model.original.resource, this.model.modified.resource), token);
    if (!diffResult || token.isCancellationRequested) {
      return;
    }
    prettyChanges(this.model.original.notebook, this.model.modified.notebook, diffResult.cellsDiff);
    const { cellDiffInfo, firstChangeIndex } = computeDiff2(this.model.original.notebook, this.model.modified.notebook, diffResult);
    if (isEqual3(cellDiffInfo, this.originalCellViewModels, this.model)) {
      return;
    } else {
      await raceCancellation(this.updateViewModels(cellDiffInfo, diffResult.metadataChanged, firstChangeIndex), token);
      if (token.isCancellationRequested) {
        return;
      }
      this.updateDiffEditorItems();
    }
  }
  toggleNotebookMetadata() {
    if (!this.notebookMetadataViewModel) {
      return;
    }
    if (this.ignoreMetadata) {
      if (this._items.length && this._items[0] === this.notebookMetadataViewModel) {
        this._items.splice(0, 1);
        this._onDidChangeItems.fire({ start: 0, deleteCount: 1, elements: [] });
      }
    } else {
      if (!this._items.length || this._items[0] !== this.notebookMetadataViewModel) {
        this._items.splice(0, 0, this.notebookMetadataViewModel);
        this._onDidChangeItems.fire({ start: 0, deleteCount: 0, elements: [this.notebookMetadataViewModel] });
      }
    }
  }
  updateDiffEditorItems() {
    this.diffEditorItems = [];
    const originalSourceUri = this.model.original.resource;
    const modifiedSourceUri = this.model.modified.resource;
    this._hasUnchangedCells = false;
    this.items.forEach((item) => {
      switch (item.type) {
        case "delete": {
          this.diffEditorItems.push(new NotebookMultiDiffEditorCellItem(item.original.uri, void 0, item.type, item.type));
          const originalMetadata = CellUri.generateCellPropertyUri(originalSourceUri, item.original.handle, Schemas.vscodeNotebookCellMetadata);
          this.diffEditorItems.push(new NotebookMultiDiffEditorMetadataItem(originalMetadata, void 0, item.type, item.type));
          const originalOutput = CellUri.generateCellPropertyUri(originalSourceUri, item.original.handle, Schemas.vscodeNotebookCellOutput);
          this.diffEditorItems.push(new NotebookMultiDiffEditorOutputItem(originalOutput, void 0, item.type, item.type));
          break;
        }
        case "insert": {
          this.diffEditorItems.push(new NotebookMultiDiffEditorCellItem(void 0, item.modified.uri, item.type, item.type));
          const modifiedMetadata = CellUri.generateCellPropertyUri(modifiedSourceUri, item.modified.handle, Schemas.vscodeNotebookCellMetadata);
          this.diffEditorItems.push(new NotebookMultiDiffEditorMetadataItem(void 0, modifiedMetadata, item.type, item.type));
          const modifiedOutput = CellUri.generateCellPropertyUri(modifiedSourceUri, item.modified.handle, Schemas.vscodeNotebookCellOutput);
          this.diffEditorItems.push(new NotebookMultiDiffEditorOutputItem(void 0, modifiedOutput, item.type, item.type));
          break;
        }
        case "modified": {
          const cellType = item.checkIfInputModified() ? item.type : "unchanged";
          const containerChanged = item.checkIfInputModified() || item.checkMetadataIfModified() || item.checkIfOutputsModified() ? item.type : "unchanged";
          this.diffEditorItems.push(new NotebookMultiDiffEditorCellItem(item.original.uri, item.modified.uri, cellType, containerChanged));
          const originalMetadata = CellUri.generateCellPropertyUri(originalSourceUri, item.original.handle, Schemas.vscodeNotebookCellMetadata);
          const modifiedMetadata = CellUri.generateCellPropertyUri(modifiedSourceUri, item.modified.handle, Schemas.vscodeNotebookCellMetadata);
          this.diffEditorItems.push(new NotebookMultiDiffEditorMetadataItem(originalMetadata, modifiedMetadata, item.checkMetadataIfModified() ? item.type : "unchanged", containerChanged));
          const originalOutput = CellUri.generateCellPropertyUri(originalSourceUri, item.original.handle, Schemas.vscodeNotebookCellOutput);
          const modifiedOutput = CellUri.generateCellPropertyUri(modifiedSourceUri, item.modified.handle, Schemas.vscodeNotebookCellOutput);
          this.diffEditorItems.push(new NotebookMultiDiffEditorOutputItem(originalOutput, modifiedOutput, item.checkIfOutputsModified() ? item.type : "unchanged", containerChanged));
          break;
        }
        case "unchanged": {
          this._hasUnchangedCells = true;
          this.diffEditorItems.push(new NotebookMultiDiffEditorCellItem(item.original.uri, item.modified.uri, item.type, item.type));
          const originalMetadata = CellUri.generateCellPropertyUri(originalSourceUri, item.original.handle, Schemas.vscodeNotebookCellMetadata);
          const modifiedMetadata = CellUri.generateCellPropertyUri(modifiedSourceUri, item.modified.handle, Schemas.vscodeNotebookCellMetadata);
          this.diffEditorItems.push(new NotebookMultiDiffEditorMetadataItem(originalMetadata, modifiedMetadata, item.type, item.type));
          const originalOutput = CellUri.generateCellPropertyUri(originalSourceUri, item.original.handle, Schemas.vscodeNotebookCellOutput);
          const modifiedOutput = CellUri.generateCellPropertyUri(modifiedSourceUri, item.modified.handle, Schemas.vscodeNotebookCellOutput);
          this.diffEditorItems.push(new NotebookMultiDiffEditorOutputItem(originalOutput, modifiedOutput, item.type, item.type));
          break;
        }
      }
    });
    this._onDidChange.fire();
  }
  async updateViewModels(cellDiffInfo, metadataChanged, firstChangeIndex) {
    const cellViewModels = await this.createDiffViewModels(cellDiffInfo, metadataChanged);
    const oldLength = this._items.length;
    this.clear();
    this._items.splice(0, oldLength);
    let placeholder = void 0;
    this.originalCellViewModels = cellViewModels;
    cellViewModels.forEach((vm, index2) => {
      if (vm.type === "unchanged" && !this.excludeUnchangedPlaceholder) {
        if (!placeholder) {
          vm.displayIconToHideUnmodifiedCells = true;
          placeholder = new DiffElementPlaceholderViewModel(vm.mainDocumentTextModel, vm.editorEventDispatcher, vm.initData);
          this._items.push(placeholder);
          const placeholderItem = placeholder;
          this.disposables.add(placeholderItem.onUnfoldHiddenCells(() => {
            const hiddenCellViewModels2 = this.placeholderAndRelatedCells.get(placeholderItem);
            if (!Array.isArray(hiddenCellViewModels2)) {
              return;
            }
            const start = this._items.indexOf(placeholderItem);
            this._items.splice(start, 1, ...hiddenCellViewModels2);
            this._onDidChangeItems.fire({ start, deleteCount: 1, elements: hiddenCellViewModels2 });
          }));
          this.disposables.add(vm.onHideUnchangedCells(() => {
            const hiddenCellViewModels2 = this.placeholderAndRelatedCells.get(placeholderItem);
            if (!Array.isArray(hiddenCellViewModels2)) {
              return;
            }
            const start = this._items.indexOf(vm);
            this._items.splice(start, hiddenCellViewModels2.length, placeholderItem);
            this._onDidChangeItems.fire({ start, deleteCount: hiddenCellViewModels2.length, elements: [placeholderItem] });
          }));
        }
        const hiddenCellViewModels = this.placeholderAndRelatedCells.get(placeholder) || [];
        hiddenCellViewModels.push(vm);
        this.placeholderAndRelatedCells.set(placeholder, hiddenCellViewModels);
        placeholder.hiddenCells.push(vm);
      } else {
        placeholder = void 0;
        this._items.push(vm);
      }
    });
    this._onDidChangeItems.fire({ start: 0, deleteCount: oldLength, elements: this._items, firstChangeIndex });
  }
  async createDiffViewModels(computedCellDiffs, metadataChanged) {
    const originalModel = this.model.original.notebook;
    const modifiedModel = this.model.modified.notebook;
    const initData = {
      metadataStatusHeight: this.configurationService.getValue("notebook.diff.ignoreMetadata") ? 0 : 25,
      outputStatusHeight: this.configurationService.getValue("notebook.diff.ignoreOutputs") || !!modifiedModel.transientOptions.transientOutputs ? 0 : 25,
      fontInfo: this.fontInfo
    };
    const viewModels = [];
    this.notebookMetadataViewModel = this._register(new NotebookDocumentMetadataViewModel(this.model.original.notebook, this.model.modified.notebook, metadataChanged ? "modifiedMetadata" : "unchangedMetadata", this.eventDispatcher, initData, this.notebookService, this.diffEditorHeightCalculator));
    if (!this.ignoreMetadata) {
      if (metadataChanged) {
        await this.notebookMetadataViewModel.computeHeights();
      }
      viewModels.push(this.notebookMetadataViewModel);
    }
    const cellViewModels = await Promise.all(computedCellDiffs.map(async (diff4) => {
      switch (diff4.type) {
        case "delete": {
          return new SingleSideDiffElementViewModel(
            originalModel,
            modifiedModel,
            originalModel.cells[diff4.originalCellIndex],
            void 0,
            "delete",
            this.eventDispatcher,
            initData,
            this.notebookService,
            this.configurationService,
            this.diffEditorHeightCalculator,
            diff4.originalCellIndex
          );
        }
        case "insert": {
          return new SingleSideDiffElementViewModel(
            modifiedModel,
            originalModel,
            void 0,
            modifiedModel.cells[diff4.modifiedCellIndex],
            "insert",
            this.eventDispatcher,
            initData,
            this.notebookService,
            this.configurationService,
            this.diffEditorHeightCalculator,
            diff4.modifiedCellIndex
          );
        }
        case "modified": {
          const viewModel = new SideBySideDiffElementViewModel(
            this.model.modified.notebook,
            this.model.original.notebook,
            originalModel.cells[diff4.originalCellIndex],
            modifiedModel.cells[diff4.modifiedCellIndex],
            "modified",
            this.eventDispatcher,
            initData,
            this.notebookService,
            this.configurationService,
            diff4.originalCellIndex,
            this.diffEditorHeightCalculator
          );
          await viewModel.computeEditorHeights();
          return viewModel;
        }
        case "unchanged": {
          return new SideBySideDiffElementViewModel(
            this.model.modified.notebook,
            this.model.original.notebook,
            originalModel.cells[diff4.originalCellIndex],
            modifiedModel.cells[diff4.modifiedCellIndex],
            "unchanged",
            this.eventDispatcher,
            initData,
            this.notebookService,
            this.configurationService,
            diff4.originalCellIndex,
            this.diffEditorHeightCalculator
          );
        }
      }
    }));
    cellViewModels.forEach((vm) => viewModels.push(vm));
    return viewModels;
  }
};

function prettyChanges(original, modified, diffResult) {
  const changes = diffResult.changes;
  for (let i2 = 0; i2 < diffResult.changes.length - 1; i2++) {
    const curr = changes[i2];
    const next = changes[i2 + 1];
    const x = curr.originalStart;
    const y = curr.modifiedStart;
    if (curr.originalLength === 1 && curr.modifiedLength === 0 && next.originalStart === x + 2 && next.originalLength === 0 && next.modifiedStart === y + 1 && next.modifiedLength === 1 && original.cells[x].getHashValue() === modified.cells[y + 1].getHashValue() && original.cells[x + 1].getHashValue() === modified.cells[y].getHashValue()) {
      curr.originalStart = x;
      curr.originalLength = 0;
      curr.modifiedStart = y;
      curr.modifiedLength = 1;
      next.originalStart = x + 1;
      next.originalLength = 1;
      next.modifiedStart = y + 2;
      next.modifiedLength = 0;
      i2++;
    }
  }
}

function isEqual3(cellDiffInfo, viewModels, model) {
  if (cellDiffInfo.length !== viewModels.length) {
    return false;
  }
  const originalModel = model.original.notebook;
  const modifiedModel = model.modified.notebook;
  for (let i2 = 0; i2 < viewModels.length; i2++) {
    const a = cellDiffInfo[i2];
    const b = viewModels[i2];
    if (a.type !== b.type) {
      return false;
    }
    switch (a.type) {
      case "delete": {
        if (originalModel.cells[a.originalCellIndex].handle !== b.original?.handle) {
          return false;
        }
        continue;
      }
      case "insert": {
        if (modifiedModel.cells[a.modifiedCellIndex].handle !== b.modified?.handle) {
          return false;
        }
        continue;
      }
      default: {
        if (originalModel.cells[a.originalCellIndex].handle !== b.original?.handle) {
          return false;
        }
        if (modifiedModel.cells[a.modifiedCellIndex].handle !== b.modified?.handle) {
          return false;
        }
        continue;
      }
    }
  }
  return true;
}

var NotebookMultiDiffEditorItem = class extends MultiDiffEditorItem {
  constructor(originalUri, modifiedUri, goToFileUri, type, containerType, kind, contextKeys) {
    super(originalUri, modifiedUri, goToFileUri, void 0, contextKeys);
    this.type = type;
    this.containerType = containerType;
    this.kind = kind;
  }
};

var NotebookMultiDiffEditorCellItem = class extends NotebookMultiDiffEditorItem {
  constructor(originalUri, modifiedUri, type, containerType) {
    super(originalUri, modifiedUri, modifiedUri || originalUri, type, containerType, "Cell", {
      [NOTEBOOK_DIFF_ITEM_KIND.key]: "Cell",
      [NOTEBOOK_DIFF_ITEM_DIFF_STATE.key]: type
    });
  }
};

var NotebookMultiDiffEditorMetadataItem = class extends NotebookMultiDiffEditorItem {
  constructor(originalUri, modifiedUri, type, containerType) {
    super(originalUri, modifiedUri, modifiedUri || originalUri, type, containerType, "Metadata", {
      [NOTEBOOK_DIFF_ITEM_KIND.key]: "Metadata",
      [NOTEBOOK_DIFF_ITEM_DIFF_STATE.key]: type
    });
  }
};

var NotebookMultiDiffEditorOutputItem = class extends NotebookMultiDiffEditorItem {
  constructor(originalUri, modifiedUri, type, containerType) {
    super(originalUri, modifiedUri, modifiedUri || originalUri, type, containerType, "Output", {
      [NOTEBOOK_DIFF_ITEM_KIND.key]: "Output",
      [NOTEBOOK_DIFF_ITEM_DIFF_STATE.key]: type
    });
  }
};
export { prettyChanges, isEqual3, NotebookDiffViewModel, NotebookMultiDiffEditorItem, NotebookMultiDiffEditorCellItem, NotebookMultiDiffEditorMetadataItem, NotebookMultiDiffEditorOutputItem };
