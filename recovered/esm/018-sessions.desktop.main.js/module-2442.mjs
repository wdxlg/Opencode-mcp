// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/notebookMultiDiffEditor.ts
import { EditorPane } from "./module-1090.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { NOTEBOOK_DIFF_CELLS_COLLAPSED, NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS, NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN } from "./module-1945.mjs";
import { NotebookOptions } from "./module-1928.mjs";
import { CellUri, NOTEBOOK_MULTI_DIFF_EDITOR_ID } from "./module-0911.mjs";
import { FontMeasurements } from "./module-0217.mjs";
import { createBareFontInfoFromRawSettings } from "./module-0220.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { MultiDiffEditorWidget } from "./module-2441.mjs";
import { NotebookDiffEditorEventDispatcher } from "./module-1944.mjs";
import { DiffEditorHeightCalculatorService } from "./module-1956.mjs";
import { NotebookDiffViewModel } from "./module-1955.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { NotebookMultiDiffEditorWidgetInput } from "./module-1864.mjs";
import { autorun } from "./module-0052.mjs";
import { transaction } from "./module-0045.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { INotebookEditorWorkerService } from "./module-1952.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IStorageService } from "./module-0512.mjs";
import { INotebookService } from "./module-0927.mjs";
import { ResourceLabel } from "./module-1322.mjs";
import { localize } from "./module-0001.mjs";
import { getIconClassesForLanguageId } from "./module-0755.mjs";
import { INotebookDocumentService } from "./module-0910.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/notebookMultiDiffEditor.ts
var NotebookMultiTextDiffEditor = class extends EditorPane {
  constructor(group2, instantiationService, themeService, _parentContextKeyService, notebookEditorWorkerService, configurationService, telemetryService, storageService, notebookService) {
    super(NotebookMultiTextDiffEditor.ID, group2, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this._parentContextKeyService = _parentContextKeyService;
    this.notebookEditorWorkerService = notebookEditorWorkerService;
    this.configurationService = configurationService;
    this.notebookService = notebookService;
    this.modelSpecificResources = this._register(new DisposableStore());
    this.ctxAllCollapsed = this._parentContextKeyService.createKey(NOTEBOOK_DIFF_CELLS_COLLAPSED.key, false);
    this.ctxHasUnchangedCells = this._parentContextKeyService.createKey(NOTEBOOK_DIFF_HAS_UNCHANGED_CELLS.key, false);
    this.ctxHiddenUnchangedCells = this._parentContextKeyService.createKey(NOTEBOOK_DIFF_UNCHANGED_CELLS_HIDDEN.key, true);
    this._notebookOptions = instantiationService.createInstance(NotebookOptions, this.window, false, void 0);
    this._register(this._notebookOptions);
  }
  static {
    this.ID = NOTEBOOK_MULTI_DIFF_EDITOR_ID;
  }
  get textModel() {
    return this._model?.modified.notebook;
  }
  get notebookOptions() {
    return this._notebookOptions;
  }
  get fontInfo() {
    if (!this._fontInfo) {
      this._fontInfo = this.createFontInfo();
    }
    return this._fontInfo;
  }
  layout(dimension, position2) {
    this._multiDiffEditorWidget.layout(dimension);
  }
  createFontInfo() {
    const editorOptions = this.configurationService.getValue("editor");
    return FontMeasurements.readFontInfo(this.window, createBareFontInfoFromRawSettings(editorOptions, PixelRatio.getInstance(this.window).value));
  }
  createEditor(parent) {
    this._multiDiffEditorWidget = this._register(this.instantiationService.createInstance(
      MultiDiffEditorWidget,
      parent,
      this.instantiationService.createInstance(WorkbenchUIElementFactory),
      void 0
    ));
    this._register(this._multiDiffEditorWidget.onDidChangeActiveControl(() => {
      this._onDidChangeControl.fire();
    }));
  }
  async setInput(input, options3, context2, token) {
    super.setInput(input, options3, context2, token);
    const model = await input.resolve();
    if (this._model !== model) {
      this._detachModel();
      this._model = model;
    }
    const eventDispatcher = this.modelSpecificResources.add(new NotebookDiffEditorEventDispatcher());
    const diffEditorHeightCalculator = this.instantiationService.createInstance(DiffEditorHeightCalculatorService, this.fontInfo.lineHeight);
    this.viewModel = this.modelSpecificResources.add(new NotebookDiffViewModel(model, this.notebookEditorWorkerService, this.configurationService, eventDispatcher, this.notebookService, diffEditorHeightCalculator, void 0, true));
    await this.viewModel.computeDiff(this.modelSpecificResources.add(new CancellationTokenSource()).token);
    this.ctxHasUnchangedCells.set(this.viewModel.hasUnchangedCells);
    this.ctxHasUnchangedCells.set(this.viewModel.hasUnchangedCells);
    const widgetInput = this.modelSpecificResources.add(NotebookMultiDiffEditorWidgetInput.createInput(this.viewModel, this.instantiationService));
    this.widgetViewModel = this.modelSpecificResources.add(await widgetInput.getViewModel());
    const itemsWeHaveSeen = /* @__PURE__ */ new WeakSet();
    this.modelSpecificResources.add(autorun((reader) => {
      if (!this.widgetViewModel || !this.viewModel) {
        return;
      }
      const items = this.widgetViewModel.items.read(reader);
      const diffItems = this.viewModel.value;
      if (items.length !== diffItems.length) {
        return;
      }
      transaction((tx) => {
        items.forEach((item) => {
          if (itemsWeHaveSeen.has(item)) {
            return;
          }
          itemsWeHaveSeen.add(item);
          const diffItem = diffItems.find((d) => d.modifiedUri?.toString() === item.modifiedUri?.toString() && d.originalUri?.toString() === item.originalUri?.toString());
          if (diffItem && diffItem.type === "unchanged") {
            item.collapsed.set(true, tx);
          }
        });
      });
    }));
    this._multiDiffEditorWidget.setViewModel(this.widgetViewModel);
  }
  _detachModel() {
    this.viewModel = void 0;
    this.modelSpecificResources.clear();
  }
  _generateFontFamily() {
    return this.fontInfo.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
  }
  setOptions(options3) {
    super.setOptions(options3);
  }
  getControl() {
    return this._multiDiffEditorWidget.getActiveControl();
  }
  focus() {
    super.focus();
    this._multiDiffEditorWidget?.getActiveControl()?.focus();
  }
  hasFocus() {
    return this._multiDiffEditorWidget?.getActiveControl()?.hasTextFocus() || super.hasFocus();
  }
  clearInput() {
    super.clearInput();
    this._multiDiffEditorWidget.setViewModel(void 0);
    this.modelSpecificResources.clear();
    this.viewModel = void 0;
    this.widgetViewModel = void 0;
  }
  expandAll() {
    if (this.widgetViewModel) {
      this.widgetViewModel.expandAll();
      this.ctxAllCollapsed.set(false);
    }
  }
  collapseAll() {
    if (this.widgetViewModel) {
      this.widgetViewModel.collapseAll();
      this.ctxAllCollapsed.set(true);
    }
  }
  hideUnchanged() {
    if (this.viewModel) {
      this.viewModel.includeUnchanged = false;
      this.ctxHiddenUnchangedCells.set(true);
    }
  }
  showUnchanged() {
    if (this.viewModel) {
      this.viewModel.includeUnchanged = true;
      this.ctxHiddenUnchangedCells.set(false);
    }
  }
  getDiffElementViewModel(uri4) {
    if (uri4.scheme === Schemas.vscodeNotebookCellOutput || uri4.scheme === Schemas.vscodeNotebookCellOutputDiff || uri4.scheme === Schemas.vscodeNotebookCellMetadata || uri4.scheme === Schemas.vscodeNotebookCellMetadataDiff) {
      const data = CellUri.parseCellPropertyUri(uri4, uri4.scheme);
      if (data) {
        uri4 = CellUri.generate(data.notebook, data.handle);
      }
    }
    if (uri4.scheme === Schemas.vscodeNotebookMetadata) {
      return this.viewModel?.items.find(
        (item) => item.type === "modifiedMetadata" || item.type === "unchangedMetadata"
      );
    }
    return this.viewModel?.items.find((c) => {
      switch (c.type) {
        case "delete":
          return c.original?.uri.toString() === uri4.toString();
        case "insert":
          return c.modified?.uri.toString() === uri4.toString();
        case "modified":
        case "unchanged":
          return c.modified?.uri.toString() === uri4.toString() || c.original?.uri.toString() === uri4.toString();
        default:
          return;
      }
    });
  }
};

NotebookMultiTextDiffEditor = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, INotebookEditorWorkerService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, INotebookService)
], NotebookMultiTextDiffEditor);

var WorkbenchUIElementFactory = class {
  constructor(_instantiationService, notebookDocumentService, notebookService) {
    this._instantiationService = _instantiationService;
    this.notebookDocumentService = notebookDocumentService;
    this.notebookService = notebookService;
  }
  createResourceLabel(element, _kind) {
    const label3 = this._instantiationService.createInstance(ResourceLabel, element, {});
    const that = this;
    return {
      setUri(uri4, options3 = {}) {
        if (!uri4) {
          label3.element.clear();
        } else {
          let name = "";
          let description = "";
          let extraClasses = void 0;
          if (uri4.scheme === Schemas.vscodeNotebookCell) {
            const notebookDocument = uri4.scheme === Schemas.vscodeNotebookCell ? that.notebookDocumentService.getNotebook(uri4) : void 0;
            const cellIndex = Schemas.vscodeNotebookCell ? that.notebookDocumentService.getNotebook(uri4)?.getCellIndex(uri4) : void 0;
            if (notebookDocument && cellIndex !== void 0) {
              name = localize(17674, null, `${cellIndex + 1}`);
              const nb = notebookDocument ? that.notebookService.getNotebookTextModel(notebookDocument?.uri) : void 0;
              const cellLanguage = nb && cellIndex !== void 0 ? nb.cells[cellIndex].language : void 0;
              extraClasses = cellLanguage ? getIconClassesForLanguageId(cellLanguage) : void 0;
            }
          } else if (uri4.scheme === Schemas.vscodeNotebookCellMetadata || uri4.scheme === Schemas.vscodeNotebookCellMetadataDiff) {
            description = localize(17675, null);
          } else if (uri4.scheme === Schemas.vscodeNotebookCellOutput || uri4.scheme === Schemas.vscodeNotebookCellOutputDiff) {
            description = localize(17676, null);
          }
          label3.element.setResource({ name, description }, { strikethrough: options3.strikethrough, forceLabel: true, hideIcon: !extraClasses, extraClasses });
        }
      },
      dispose() {
        label3.dispose();
      }
    };
  }
};

WorkbenchUIElementFactory = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, INotebookDocumentService),
  __decorateParam(2, INotebookService)
], WorkbenchUIElementFactory);
export { NotebookMultiTextDiffEditor, WorkbenchUIElementFactory };
