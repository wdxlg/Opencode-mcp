// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/view/cellParts/cellContextKeys.ts
import { CellContentPart } from "./module-1896.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { NOTEBOOK_CELL_EDITABLE, NOTEBOOK_CELL_EDITOR_FOCUSED, NOTEBOOK_CELL_EXECUTING, NOTEBOOK_CELL_EXECUTION_STATE, NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS, NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_CELL_INPUT_COLLAPSED, NOTEBOOK_CELL_LINE_NUMBERS, NOTEBOOK_CELL_MARKDOWN_EDIT_MODE, NOTEBOOK_CELL_OUTPUT_COLLAPSED, NOTEBOOK_CELL_RESOURCE, NOTEBOOK_CELL_TYPE } from "./module-1868.mjs";
import { CodeCellViewModel } from "./module-1900.mjs";
import { autorun } from "./module-0052.mjs";
import { MarkupCellViewModel } from "./module-1901.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { INotebookExecutionStateService } from "./module-1387.mjs";


// src/vs/workbench/contrib/notebook/browser/view/cellParts/cellContextKeys.ts
var CellContextKeyPart = class extends CellContentPart {
  constructor(notebookEditor, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.cellContextKeyManager = this._register(this.instantiationService.createInstance(CellContextKeyManager, notebookEditor, void 0));
  }
  didRenderCell(element) {
    this.cellContextKeyManager.updateForElement(element);
  }
};

CellContextKeyPart = __decorateClass([
  __decorateParam(1, IInstantiationService)
], CellContextKeyPart);

var CellContextKeyManager = class extends Disposable {
  constructor(notebookEditor, element, _contextKeyService, _notebookExecutionStateService) {
    super();
    this.notebookEditor = notebookEditor;
    this.element = element;
    this._contextKeyService = _contextKeyService;
    this._notebookExecutionStateService = _notebookExecutionStateService;
    this.elementDisposables = this._register(new DisposableStore());
    this._contextKeyService.bufferChangeEvents(() => {
      this.cellType = NOTEBOOK_CELL_TYPE.bindTo(this._contextKeyService);
      this.cellEditable = NOTEBOOK_CELL_EDITABLE.bindTo(this._contextKeyService);
      this.cellFocused = NOTEBOOK_CELL_FOCUSED.bindTo(this._contextKeyService);
      this.cellEditorFocused = NOTEBOOK_CELL_EDITOR_FOCUSED.bindTo(this._contextKeyService);
      this.markdownEditMode = NOTEBOOK_CELL_MARKDOWN_EDIT_MODE.bindTo(this._contextKeyService);
      this.cellRunState = NOTEBOOK_CELL_EXECUTION_STATE.bindTo(this._contextKeyService);
      this.cellExecuting = NOTEBOOK_CELL_EXECUTING.bindTo(this._contextKeyService);
      this.cellHasOutputs = NOTEBOOK_CELL_HAS_OUTPUTS.bindTo(this._contextKeyService);
      this.cellContentCollapsed = NOTEBOOK_CELL_INPUT_COLLAPSED.bindTo(this._contextKeyService);
      this.cellOutputCollapsed = NOTEBOOK_CELL_OUTPUT_COLLAPSED.bindTo(this._contextKeyService);
      this.cellLineNumbers = NOTEBOOK_CELL_LINE_NUMBERS.bindTo(this._contextKeyService);
      this.cellResource = NOTEBOOK_CELL_RESOURCE.bindTo(this._contextKeyService);
      this.cellHasErrorDiagnostics = NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS.bindTo(this._contextKeyService);
      if (element) {
        this.updateForElement(element);
      }
    });
    this._register(this._notebookExecutionStateService.onDidChangeExecution((e) => {
      if (e.type === 0 /* cell */ && this.element && e.affectsCell(this.element.uri)) {
        this.updateForExecutionState();
      }
    }));
  }
  updateForElement(element) {
    this.elementDisposables.clear();
    this.element = element;
    if (!element) {
      return;
    }
    this.elementDisposables.add(element.onDidChangeState((e) => this.onDidChangeState(e)));
    if (element instanceof CodeCellViewModel) {
      this.elementDisposables.add(element.onDidChangeOutputs(() => this.updateForOutputs()));
      this.elementDisposables.add(autorun((reader) => {
        this.cellHasErrorDiagnostics.set(!!reader.readObservable(element.executionErrorDiagnostic));
      }));
    }
    this.elementDisposables.add(this.notebookEditor.onDidChangeActiveCell(() => this.updateForFocusState()));
    if (this.element instanceof MarkupCellViewModel) {
      this.cellType.set("markup");
    } else if (this.element instanceof CodeCellViewModel) {
      this.cellType.set("code");
    }
    this._contextKeyService.bufferChangeEvents(() => {
      this.updateForFocusState();
      this.updateForExecutionState();
      this.updateForEditState();
      this.updateForCollapseState();
      this.updateForOutputs();
      this.cellLineNumbers.set(this.element.lineNumbers);
      this.cellResource.set(this.element.uri.toString());
    });
  }
  onDidChangeState(e) {
    this._contextKeyService.bufferChangeEvents(() => {
      if (e.internalMetadataChanged) {
        this.updateForExecutionState();
      }
      if (e.editStateChanged) {
        this.updateForEditState();
      }
      if (e.focusModeChanged) {
        this.updateForFocusState();
      }
      if (e.cellLineNumberChanged) {
        this.cellLineNumbers.set(this.element.lineNumbers);
      }
      if (e.inputCollapsedChanged || e.outputCollapsedChanged) {
        this.updateForCollapseState();
      }
    });
  }
  updateForFocusState() {
    if (!this.element) {
      return;
    }
    const activeCell = this.notebookEditor.getActiveCell();
    this.cellFocused.set(this.notebookEditor.getActiveCell() === this.element);
    if (activeCell === this.element) {
      this.cellEditorFocused.set(this.element.focusMode === 1 /* Editor */);
    } else {
      this.cellEditorFocused.set(false);
    }
  }
  updateForExecutionState() {
    if (!this.element) {
      return;
    }
    const internalMetadata = this.element.internalMetadata;
    this.cellEditable.set(!this.notebookEditor.isReadOnly);
    const exeState = this._notebookExecutionStateService.getCellExecution(this.element.uri);
    if (this.element instanceof MarkupCellViewModel) {
      this.cellRunState.reset();
      this.cellExecuting.reset();
    } else if (exeState?.state === 3 /* Executing */) {
      this.cellRunState.set("executing");
      this.cellExecuting.set(true);
    } else if (exeState?.state === 2 /* Pending */ || exeState?.state === 1 /* Unconfirmed */) {
      this.cellRunState.set("pending");
      this.cellExecuting.set(true);
    } else if (internalMetadata.lastRunSuccess === true) {
      this.cellRunState.set("succeeded");
      this.cellExecuting.set(false);
    } else if (internalMetadata.lastRunSuccess === false) {
      this.cellRunState.set("failed");
      this.cellExecuting.set(false);
    } else {
      this.cellRunState.set("idle");
      this.cellExecuting.set(false);
    }
  }
  updateForEditState() {
    if (!this.element) {
      return;
    }
    if (this.element instanceof MarkupCellViewModel) {
      this.markdownEditMode.set(this.element.getEditState() === 1 /* Editing */);
    } else {
      this.markdownEditMode.set(false);
    }
  }
  updateForCollapseState() {
    if (!this.element) {
      return;
    }
    this.cellContentCollapsed.set(!!this.element.isInputCollapsed);
    this.cellOutputCollapsed.set(!!this.element.isOutputCollapsed);
  }
  updateForOutputs() {
    if (this.element instanceof CodeCellViewModel) {
      this.cellHasOutputs.set(this.element.outputsViewModels.length > 0);
    } else {
      this.cellHasOutputs.set(false);
    }
  }
};

CellContextKeyManager = __decorateClass([
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, INotebookExecutionStateService)
], CellContextKeyManager);
export { CellContextKeyPart, CellContextKeyManager };
