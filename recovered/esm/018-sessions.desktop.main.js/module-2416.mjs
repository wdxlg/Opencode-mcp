// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/editorStatusBar/editorStatusBar.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookKernelService } from "./module-1387.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ILogService } from "./module-0095.mjs";
import { getNotebookEditorFromEditorPane } from "./module-0942.mjs";
import { localize } from "./module-0001.mjs";
import { SELECT_KERNEL_ID } from "./module-1845.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IStatusbarService } from "./module-0895.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { CENTER_ACTIVE_CELL } from "./module-2410.mjs";
import { SELECT_NOTEBOOK_INDENTATION_ID } from "./module-2389.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Event2 } from "./module-0017.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/editorStatusBar/editorStatusBar.ts
var ImplictKernelSelector = class {
  constructor(notebook, suggested, notebookKernelService, languageFeaturesService, logService) {
    const disposables = new DisposableStore();
    this.dispose = disposables.dispose.bind(disposables);
    const selectKernel = () => {
      disposables.clear();
      notebookKernelService.selectKernelForNotebook(suggested, notebook);
    };
    disposables.add(notebook.onDidChangeContent((e4) => {
      for (const event of e4.rawEvents) {
        switch (event.kind) {
          case 10 /* ChangeCellContent */:
          case 1 /* ModelChange */:
          case 2 /* Move */:
          case 5 /* ChangeCellLanguage */:
            logService.trace("IMPLICIT kernel selection because of change event", event.kind);
            selectKernel();
            break;
        }
      }
    }));
    disposables.add(languageFeaturesService.hoverProvider.register({ scheme: Schemas.vscodeNotebookCell, pattern: notebook.uri.path }, {
      provideHover() {
        logService.trace("IMPLICIT kernel selection because of hover");
        selectKernel();
        return void 0;
      }
    }));
  }
};

ImplictKernelSelector = __decorateClass([
  __decorateParam(2, INotebookKernelService),
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, ILogService)
], ImplictKernelSelector);

var KernelStatus = class extends Disposable {
  constructor(_editorService, _statusbarService, _notebookKernelService, _instantiationService) {
    super();
    this._editorService = _editorService;
    this._statusbarService = _statusbarService;
    this._notebookKernelService = _notebookKernelService;
    this._instantiationService = _instantiationService;
    this._editorDisposables = this._register(new DisposableStore());
    this._kernelInfoElement = this._register(new DisposableStore());
    this._register(this._editorService.onDidActiveEditorChange(() => this._updateStatusbar()));
    this._updateStatusbar();
  }
  _updateStatusbar() {
    this._editorDisposables.clear();
    const activeEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
    if (!activeEditor) {
      this._kernelInfoElement.clear();
      return;
    }
    const updateStatus = () => {
      if (activeEditor.notebookOptions.getDisplayOptions().globalToolbar) {
        this._kernelInfoElement.clear();
        return;
      }
      const notebook = activeEditor.textModel;
      if (notebook) {
        this._showKernelStatus(notebook);
      } else {
        this._kernelInfoElement.clear();
      }
    };
    this._editorDisposables.add(this._notebookKernelService.onDidAddKernel(updateStatus));
    this._editorDisposables.add(this._notebookKernelService.onDidChangeSelectedNotebooks(updateStatus));
    this._editorDisposables.add(this._notebookKernelService.onDidChangeNotebookAffinity(updateStatus));
    this._editorDisposables.add(activeEditor.onDidChangeModel(updateStatus));
    this._editorDisposables.add(activeEditor.notebookOptions.onDidChangeOptions(updateStatus));
    updateStatus();
  }
  _showKernelStatus(notebook) {
    this._kernelInfoElement.clear();
    const { selected, suggestions, all } = this._notebookKernelService.getMatchingKernel(notebook);
    const suggested = (suggestions.length === 1 ? suggestions[0] : void 0) ?? all.length === 1 ? all[0] : void 0;
    let isSuggested = false;
    if (all.length === 0) {
      return;
    } else if (selected || suggested) {
      let kernel = selected;
      if (!kernel) {
        kernel = suggested;
        isSuggested = true;
        this._kernelInfoElement.add(this._instantiationService.createInstance(ImplictKernelSelector, notebook, kernel));
      }
      const tooltip = kernel.description ?? kernel.detail ?? kernel.label;
      this._kernelInfoElement.add(this._statusbarService.addEntry(
        {
          name: localize(17428, null),
          text: `$(notebook-kernel-select) ${kernel.label}`,
          ariaLabel: kernel.label,
          tooltip: isSuggested ? localize(17433, null, tooltip) : tooltip,
          command: SELECT_KERNEL_ID
        },
        SELECT_KERNEL_ID,
        1 /* RIGHT */,
        10
      ));
      this._kernelInfoElement.add(kernel.onDidChange(() => this._showKernelStatus(notebook)));
    } else {
      this._kernelInfoElement.add(this._statusbarService.addEntry(
        {
          name: localize(17430, null),
          text: localize(17425, null),
          ariaLabel: localize(17425, null),
          command: SELECT_KERNEL_ID,
          kind: "prominent"
        },
        SELECT_KERNEL_ID,
        1 /* RIGHT */,
        10
      ));
    }
  }
};

KernelStatus = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IStatusbarService),
  __decorateParam(2, INotebookKernelService),
  __decorateParam(3, IInstantiationService)
], KernelStatus);

var ActiveCellStatus = class extends Disposable {
  constructor(_editorService, _statusbarService) {
    super();
    this._editorService = _editorService;
    this._statusbarService = _statusbarService;
    this._itemDisposables = this._register(new DisposableStore());
    this._accessor = this._register(new MutableDisposable());
    this._register(this._editorService.onDidActiveEditorChange(() => this._update()));
    this._update();
  }
  _update() {
    this._itemDisposables.clear();
    const activeEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
    if (activeEditor) {
      this._itemDisposables.add(activeEditor.onDidChangeSelection(() => this._show(activeEditor)));
      this._itemDisposables.add(activeEditor.onDidChangeActiveCell(() => this._show(activeEditor)));
      this._show(activeEditor);
    } else {
      this._accessor.clear();
    }
  }
  _show(editor) {
    if (!editor.hasModel()) {
      this._accessor.clear();
      return;
    }
    const newText = this._getSelectionsText(editor);
    if (!newText) {
      this._accessor.clear();
      return;
    }
    const entry = {
      name: localize(17426, null),
      text: newText,
      ariaLabel: newText,
      command: CENTER_ACTIVE_CELL
    };
    if (!this._accessor.value) {
      this._accessor.value = this._statusbarService.addEntry(
        entry,
        "notebook.activeCellStatus",
        1 /* RIGHT */,
        100
      );
    } else {
      this._accessor.value.update(entry);
    }
  }
  _getSelectionsText(editor) {
    if (!editor.hasModel()) {
      return void 0;
    }
    const activeCell = editor.getActiveCell();
    if (!activeCell) {
      return void 0;
    }
    const idxFocused = editor.getCellIndex(activeCell) + 1;
    const numSelected = editor.getSelections().reduce((prev, range2) => prev + (range2.end - range2.start), 0);
    const totalCells = editor.getLength();
    return numSelected > 1 ? localize(17429, null, idxFocused, numSelected) : localize(17431, null, idxFocused, totalCells);
  }
};

ActiveCellStatus = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IStatusbarService)
], ActiveCellStatus);

var NotebookIndentationStatus = class extends Disposable {
  constructor(_editorService, _statusbarService, _configurationService) {
    super();
    this._editorService = _editorService;
    this._statusbarService = _statusbarService;
    this._configurationService = _configurationService;
    this._itemDisposables = this._register(new DisposableStore());
    this._accessor = this._register(new MutableDisposable());
    this._register(this._editorService.onDidActiveEditorChange(() => this._update()));
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("editor") || e4.affectsConfiguration("notebook")) {
        this._update();
      }
    }));
    this._update();
  }
  static {
    this.ID = "selectNotebookIndentation";
  }
  _update() {
    this._itemDisposables.clear();
    const activeEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
    if (activeEditor) {
      this._show(activeEditor);
      this._itemDisposables.add(activeEditor.onDidChangeSelection(() => {
        this._accessor.clear();
        this._show(activeEditor);
      }));
    } else {
      this._accessor.clear();
    }
  }
  _show(editor) {
    if (!editor.hasModel()) {
      this._accessor.clear();
      return;
    }
    const cellOptions = editor.getActiveCell()?.textModel?.getOptions();
    if (!cellOptions) {
      this._accessor.clear();
      return;
    }
    const cellEditorOverridesRaw = editor.notebookOptions.getDisplayOptions().editorOptionsCustomizations;
    const indentSize = cellEditorOverridesRaw?.["editor.indentSize"] ?? cellOptions?.indentSize;
    const insertSpaces = cellEditorOverridesRaw?.["editor.insertSpaces"] ?? cellOptions?.insertSpaces;
    const tabSize = cellEditorOverridesRaw?.["editor.tabSize"] ?? cellOptions?.tabSize;
    const width2 = typeof indentSize === "number" ? indentSize : tabSize;
    const message = insertSpaces ? `Spaces: ${width2}` : `Tab Size: ${width2}`;
    const newText = message;
    if (!newText) {
      this._accessor.clear();
      return;
    }
    const entry = {
      name: localize(17427, null),
      text: newText,
      ariaLabel: newText,
      tooltip: localize(17432, null),
      command: SELECT_NOTEBOOK_INDENTATION_ID
    };
    if (!this._accessor.value) {
      this._accessor.value = this._statusbarService.addEntry(
        entry,
        "notebook.status.indentation",
        1 /* RIGHT */,
        100.4
      );
    } else {
      this._accessor.value.update(entry);
    }
  }
};

NotebookIndentationStatus = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IStatusbarService),
  __decorateParam(2, IConfigurationService)
], NotebookIndentationStatus);

var NotebookEditorStatusContribution = class extends Disposable {
  constructor(editorGroupService) {
    super();
    this.editorGroupService = editorGroupService;
    for (const part of editorGroupService.parts) {
      this.createNotebookStatus(part);
    }
    this._register(editorGroupService.onDidCreateAuxiliaryEditorPart((part) => this.createNotebookStatus(part)));
  }
  static {
    this.ID = "notebook.contrib.editorStatus";
  }
  createNotebookStatus(part) {
    const disposables = new DisposableStore();
    Event2.once(part.onWillDispose)(() => disposables.dispose());
    const scopedInstantiationService = this.editorGroupService.getScopedInstantiationService(part);
    disposables.add(scopedInstantiationService.createInstance(KernelStatus));
    disposables.add(scopedInstantiationService.createInstance(ActiveCellStatus));
    disposables.add(scopedInstantiationService.createInstance(NotebookIndentationStatus));
  }
};

NotebookEditorStatusContribution = __decorateClass([
  __decorateParam(0, IEditorGroupsService)
], NotebookEditorStatusContribution);

registerWorkbenchContribution2(NotebookEditorStatusContribution.ID, NotebookEditorStatusContribution, WorkbenchPhase.AfterRestored);
export { ImplictKernelSelector, KernelStatus, ActiveCellStatus, NotebookIndentationStatus, NotebookEditorStatusContribution };
