// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/outputEditor/notebookOutputEditor.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { EditorPane } from "./module-1089.mjs";
import { getDefaultNotebookCreationOptions } from "./module-1964.mjs";
import { NotebookOptions } from "./module-1951.mjs";
import { CellUri, NOTEBOOK_OUTPUT_EDITOR_ID } from "./module-0909.mjs";
import { $, append, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { FontMeasurements } from "./module-0217.mjs";
import { createBareFontInfoFromRawSettings } from "./module-0220.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { BackLayerWebView } from "./module-1913.mjs";
import { localize } from "./module-0001.mjs";
import { generateUuid } from "./module-0190.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { NotebookEventDispatcher } from "./module-1941.mjs";
import { ViewContext2 } from "./module-1946.mjs";
import { NotebookViewModel } from "./module-1945.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INotebookService } from "./module-0926.mjs";
import { NotebookOutputEditorInput } from "./module-2483.mjs";
import { IEditorResolverService } from "./module-1113.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/notebook/browser/outputEditor/notebookOutputEditor.ts
var NoopCellEditorOptions = class _NoopCellEditorOptions extends Disposable {
  constructor() {
    super();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._value = Object.freeze({
      ..._NoopCellEditorOptions.fixedEditorOptions,
      padding: { top: 12, bottom: 12 },
      readOnly: true
    });
  }
  static {
    this.fixedEditorOptions = {
      scrollBeyondLastLine: false,
      scrollbar: {
        verticalScrollbarSize: 14,
        horizontal: "auto",
        useShadows: true,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        alwaysConsumeMouseWheel: false
      },
      renderLineHighlightOnlyWhenFocus: true,
      overviewRulerLanes: 0,
      lineDecorationsWidth: 0,
      folding: true,
      fixedOverflowWidgets: true,
      minimap: { enabled: false },
      renderValidationDecorations: "on",
      lineNumbersMinChars: 3
    };
  }
  get value() {
    return this._value;
  }
};

var NotebookOutputEditor = class extends EditorPane {
  constructor(group2, instantiationService, themeService, telemetryService, storageService, configurationService, notebookService) {
    super(NotebookOutputEditor.ID, group2, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.notebookService = notebookService;
    this.creationOptions = getDefaultNotebookCreationOptions();
    this._outputWebview = null;
    this._isDisposed = false;
    this._notebookOptions = this.instantiationService.createInstance(NotebookOptions, this.window, false, void 0);
    this._register(this._notebookOptions);
  }
  static {
    this.ID = NOTEBOOK_OUTPUT_EDITOR_ID;
  }
  get isDisposed() {
    return this._isDisposed;
  }
  createEditor(parent) {
    this._rootElement = append(parent, $(".notebook-output-editor"));
  }
  get fontInfo() {
    if (!this._fontInfo) {
      this._fontInfo = this.createFontInfo();
    }
    return this._fontInfo;
  }
  createFontInfo() {
    const editorOptions2 = this.configurationService.getValue("editor");
    return FontMeasurements.readFontInfo(this.window, createBareFontInfoFromRawSettings(editorOptions2, PixelRatio.getInstance(this.window).value));
  }
  async _createOriginalWebview(id2, viewType, resource) {
    this._outputWebview?.dispose();
    this._outputWebview = this.instantiationService.createInstance(BackLayerWebView, this, id2, viewType, resource, {
      ...this._notebookOptions.computeDiffWebviewOptions(),
      fontFamily: this._generateFontFamily()
    }, void 0);
    append(this._rootElement, this._outputWebview.element);
    this._outputWebview.createWebview(this.window);
    this._outputWebview.element.style.width = `calc(100% - 16px)`;
    this._outputWebview.element.style.left = `16px`;
  }
  _generateFontFamily() {
    return this.fontInfo.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
  }
  getTitle() {
    if (this.input) {
      return this.input.getName();
    }
    return localize(17858, null);
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    const model = await input.resolve();
    if (!model) {
      throw new Error("Invalid notebook output editor input");
    }
    const resolvedNotebookEditorModel = model.resolvedNotebookEditorModel;
    await this._createOriginalWebview(generateUuid(), resolvedNotebookEditorModel.viewType, URI.from({ scheme: Schemas.vscodeNotebookCellOutput, path: "", query: "openIn=notebookOutputEditor" }));
    const notebookTextModel = resolvedNotebookEditorModel.notebook;
    const eventDispatcher = this._register(new NotebookEventDispatcher());
    const editorOptions2 = this._register(new NoopCellEditorOptions());
    const viewContext = new ViewContext2(
      this._notebookOptions,
      eventDispatcher,
      (_language2) => editorOptions2
    );
    this._notebookViewModel = this.instantiationService.createInstance(NotebookViewModel, notebookTextModel.viewType, notebookTextModel, viewContext, null, { isReadOnly: true });
    const cellViewModel = this._notebookViewModel.getCellByHandle(model.cell.handle);
    if (!cellViewModel) {
      throw new Error("Invalid NotebookOutputEditorInput, no matching cell view model");
    }
    const cellOutputViewModel = cellViewModel.outputsViewModels.find((outputViewModel) => outputViewModel.model.outputId === model.outputId);
    if (!cellOutputViewModel) {
      throw new Error("Invalid NotebookOutputEditorInput, no matching cell output view model");
    }
    let result = void 0;
    const [mimeTypes, pick] = cellOutputViewModel.resolveMimeTypes(notebookTextModel, void 0);
    const pickedMimeTypeRenderer = cellOutputViewModel.pickedMimeType || mimeTypes[pick];
    if (mimeTypes.length !== 0) {
      const renderer = this.notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
      result = renderer ? { type: 1 /* Extension */, renderer, source: cellOutputViewModel, mimeType: pickedMimeTypeRenderer.mimeType } : this._renderMissingRenderer(cellOutputViewModel, pickedMimeTypeRenderer.mimeType);
    }
    if (!result) {
      throw new Error("No InsetRenderInfo for output");
    }
    const cellInfo = {
      cellId: cellViewModel.id,
      cellHandle: model.cell.handle,
      cellUri: model.cell.uri
    };
    this._outputWebview?.createOutput(cellInfo, result, 0, 0);
  }
  _renderMissingRenderer(viewModel, preferredMimeType) {
    if (!viewModel.model.outputs.length) {
      return this._renderMessage(viewModel, localize(17856, null));
    }
    if (!preferredMimeType) {
      const mimeTypes = viewModel.model.outputs.map((op) => op.mime);
      const mimeTypesMessage = mimeTypes.join(", ");
      return this._renderMessage(viewModel, localize(17857, null, mimeTypesMessage));
    }
    return this._renderSearchForMimetype(viewModel, preferredMimeType);
  }
  _renderMessage(viewModel, message) {
    const el = $("p", void 0, message);
    return { type: 0 /* Html */, source: viewModel, htmlContent: el.outerHTML };
  }
  _renderSearchForMimetype(viewModel, mimeType) {
    const query = `@tag:notebookRenderer ${mimeType}`;
    const p = $("p", void 0, `No renderer could be found for mimetype "${mimeType}", but one might be available on the Marketplace.`);
    const a = $("a", { href: `command:workbench.extensions.search?%22${query}%22`, class: "monaco-button monaco-text-button", tabindex: 0, role: "button", style: "padding: 8px; text-decoration: none; color: rgb(255, 255, 255); background-color: rgb(14, 99, 156); max-width: 200px;" }, `Search Marketplace`);
    return {
      type: 0 /* Html */,
      source: viewModel,
      htmlContent: p.outerHTML + a.outerHTML
    };
  }
  scheduleOutputHeightAck(cellInfo, outputId, height) {
    scheduleAtNextAnimationFrame(this.window, () => {
      this._outputWebview?.ackHeight([{ cellId: cellInfo.cellId, outputId, height }]);
    }, 10);
  }
  async focusNotebookCell(cell, focus) {
  }
  async focusNextNotebookCell(cell, focus) {
  }
  toggleNotebookCellSelection(cell) {
    throw new Error("Not implemented.");
  }
  getCellById(cellId) {
    throw new Error("Not implemented");
  }
  getCellByInfo(cellInfo) {
    return this._notebookViewModel?.getCellByHandle(cellInfo.cellHandle);
  }
  layout(dimension, position2) {
  }
  setScrollTop(scrollTop) {
  }
  triggerScroll(event) {
  }
  getOutputRenderer() {
  }
  updateOutputHeight(cellInfo, output, height, isInit, source) {
  }
  updateMarkupCellHeight(cellId, height, isInit) {
  }
  setMarkupCellEditState(cellId, editState) {
  }
  didResizeOutput(cellId) {
  }
  didStartDragMarkupCell(cellId, event) {
  }
  didDragMarkupCell(cellId, event) {
  }
  didDropMarkupCell(cellId, event) {
  }
  didEndDragMarkupCell(cellId) {
  }
  updatePerformanceMetadata(cellId, executionId, duration, rendererId) {
  }
  didFocusOutputInputChange(inputFocused) {
  }
  dispose() {
    this._isDisposed = true;
    super.dispose();
  }
};

NotebookOutputEditor = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, INotebookService)
], NotebookOutputEditor);

var NotebookOutputEditorContribution = class {
  constructor(editorResolverService, instantiationService, uriIdentityService) {
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    editorResolverService.registerEditor(
      `${Schemas.vscodeNotebookCellOutput}:/**`,
      {
        id: "notebookOutputEditor",
        label: "Notebook Output Editor",
        priority: "default" /* default */
      },
      {
        canSupportResource: (resource) => {
          if (resource.scheme === Schemas.vscodeNotebookCellOutput) {
            const params = new URLSearchParams(resource.query);
            return params.get("openIn") === "notebookOutputEditor";
          }
          return false;
        }
      },
      {
        createEditorInput: async ({ resource, options: options3 }) => {
          const outputUriData = CellUri.parseCellOutputUri(resource);
          if (!outputUriData || !outputUriData.notebook || outputUriData.cellIndex === void 0 || outputUriData.outputIndex === void 0 || !outputUriData.outputId) {
            throw new Error("Invalid output uri for notebook output editor");
          }
          const notebookUri = this.uriIdentityService.asCanonicalUri(outputUriData.notebook);
          const cellIndex = outputUriData.cellIndex;
          const outputId = outputUriData.outputId;
          const outputIndex = outputUriData.outputIndex;
          const editorInput = this.instantiationService.createInstance(NotebookOutputEditorInput, notebookUri, cellIndex, outputId, outputIndex);
          return {
            editor: editorInput,
            options: options3
          };
        }
      }
    );
  }
  static {
    this.ID = "workbench.contribution.notebookOutputEditorContribution";
  }
};

NotebookOutputEditorContribution = __decorateClass([
  __decorateParam(0, IEditorResolverService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IUriIdentityService)
], NotebookOutputEditorContribution);

registerWorkbenchContribution2(NotebookOutputEditorContribution.ID, NotebookOutputEditorContribution, WorkbenchPhase.BlockRestore);
export { NoopCellEditorOptions, NotebookOutputEditor, NotebookOutputEditorContribution };
