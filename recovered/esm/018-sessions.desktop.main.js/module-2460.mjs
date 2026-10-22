// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/notebook.contribution.ts
import { Registry } from "./module-0090.mjs";
import { EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { NotebookEditor } from "./module-1855.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { NotebookEditorInput } from "./module-0940.mjs";
import { NotebookTextDiffEditor } from "./module-1964.mjs";
import { NotebookDiffEditorInput } from "./module-1857.mjs";
import { NotebookOutputEditor } from "./module-2459.mjs";
import { NotebookOutputEditorInput } from "./module-2458.mjs";
import { NotebookMultiTextDiffEditor } from "./module-2442.mjs";
import { NotebookMultiDiffEditorInput } from "./module-1864.mjs";
import { assertType } from "./module-0010.mjs";
import { parse2 } from "./module-0265.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Disposable, DisposableStore, dispose } from "./module-0012.mjs";
import { CellUri, NotebookMetadataUri, NotebookSetting, NotebookWorkingCopyTypeIdentifier } from "./module-0911.mjs";
import { COMMENTEDITOR_DECORATION_KEY } from "./module-1362.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { Event2 } from "./module-0017.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";
import { INotebookEditorModelResolverService } from "./module-0928.mjs";
import { Schemas } from "./module-0033.mjs";
import { getFormattedMetadataJSON } from "./module-1860.mjs";
import { getFormattedOutputJSON, getStreamOutputData } from "./module-1947.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { toFormattedString } from "./module-1376.mjs";
import { ILabelService } from "./module-0641.mjs";
import { getFormattedNotebookMetadataJSON } from "./module-1946.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { extname2, isEqual2 } from "./module-0034.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkingCopyEditorService } from "./module-1395.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { INotebookService } from "./module-0927.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { NotebookVariables } from "./module-2454.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { NotebookAccessibleView } from "./module-2456.mjs";
import { NotebookAccessibilityHelp } from "./module-2455.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { NotebookService } from "./module-1865.mjs";
import { INotebookEditorWorkerService } from "./module-1952.mjs";
import { NotebookEditorWorkerServiceImpl } from "./module-1965.mjs";
import { NotebookModelResolverServiceImpl } from "./module-1973.mjs";
import { INotebookCellStatusBarService } from "./module-1383.mjs";
import { NotebookCellStatusBarService } from "./module-1966.mjs";
import { INotebookEditorService } from "./module-1385.mjs";
import { NotebookEditorWidgetService } from "./module-1967.mjs";
import { INotebookKernelHistoryService, INotebookKernelService } from "./module-1387.mjs";
import { NotebookKernelService } from "./module-1974.mjs";
import { NotebookKernelHistoryService } from "./module-2449.mjs";
import { INotebookExecutionService } from "./module-0994.mjs";
import { NotebookExecutionService } from "./module-2445.mjs";
import { INotebookExecutionStateService } from "./module-1386.mjs";
import { NotebookExecutionStateService } from "./module-2444.mjs";
import { INotebookRendererMessagingService } from "./module-1392.mjs";
import { NotebookRendererMessagingService } from "./module-1975.mjs";
import { INotebookKeymapService } from "./module-2446.mjs";
import { NotebookKeymapService } from "./module-2448.mjs";
import { INotebookLoggingService } from "./module-1394.mjs";
import { NotebookLoggingService } from "./module-2450.mjs";
import { INotebookCellOutlineDataSourceFactory, NotebookCellOutlineDataSourceFactory } from "./module-1933.mjs";
import { INotebookOutlineEntryFactory, NotebookOutlineEntryFactory } from "./module-1931.mjs";
import { editorOptionsRegistry } from "./module-0105.mjs";
import { localize } from "./module-0001.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { product_default } from "./module-0139.mjs";
import { DefaultFormatter } from "./module-2457.mjs";


// src/vs/workbench/contrib/notebook/browser/notebook.contribution.ts
Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    NotebookEditor,
    NotebookEditor.ID,
    "Notebook Editor"
  ),
  [
    new SyncDescriptor(NotebookEditorInput)
  ]
);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    NotebookTextDiffEditor,
    NotebookTextDiffEditor.ID,
    "Notebook Diff Editor"
  ),
  [
    new SyncDescriptor(NotebookDiffEditorInput)
  ]
);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    NotebookOutputEditor,
    NotebookOutputEditor.ID,
    "Notebook Output Editor"
  ),
  [
    new SyncDescriptor(NotebookOutputEditorInput)
  ]
);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    NotebookMultiTextDiffEditor,
    NotebookMultiTextDiffEditor.ID,
    "Notebook Diff Editor"
  ),
  [
    new SyncDescriptor(NotebookMultiDiffEditorInput)
  ]
);

var NotebookDiffEditorSerializer = class {
  constructor(_configurationService) {
    this._configurationService = _configurationService;
  }
  canSerialize() {
    return true;
  }
  serialize(input) {
    assertType(input instanceof NotebookDiffEditorInput);
    return JSON.stringify({
      resource: input.resource,
      originalResource: input.original.resource,
      name: input.getName(),
      originalName: input.original.getName(),
      textDiffName: input.getName(),
      viewType: input.viewType
    });
  }
  deserialize(instantiationService, raw) {
    const data = parse2(raw);
    if (!data) {
      return void 0;
    }
    const { resource, originalResource, name, viewType } = data;
    if (!data || !URI.isUri(resource) || !URI.isUri(originalResource) || typeof name !== "string" || typeof viewType !== "string") {
      return void 0;
    }
    if (this._configurationService.getValue("notebook.experimental.enableNewDiffEditor")) {
      return NotebookMultiDiffEditorInput.create(instantiationService, resource, name, void 0, originalResource, viewType);
    } else {
      return NotebookDiffEditorInput.create(instantiationService, resource, name, void 0, originalResource, viewType);
    }
  }
  static canResolveBackup(editorInput, backupResource) {
    return false;
  }
};

NotebookDiffEditorSerializer = __decorateClass([
  __decorateParam(0, IConfigurationService)
], NotebookDiffEditorSerializer);

var NotebookEditorSerializer = class {
  canSerialize(input) {
    return input.typeId === NotebookEditorInput.ID;
  }
  serialize(input) {
    assertType(input instanceof NotebookEditorInput);
    const data = {
      resource: input.resource,
      preferredResource: input.preferredResource,
      viewType: input.viewType,
      options: input.options
    };
    return JSON.stringify(data);
  }
  deserialize(instantiationService, raw) {
    const data = parse2(raw);
    if (!data) {
      return void 0;
    }
    const { resource, preferredResource, viewType, options: options3 } = data;
    if (!data || !URI.isUri(resource) || typeof viewType !== "string") {
      return void 0;
    }
    const input = NotebookEditorInput.getOrCreate(instantiationService, resource, preferredResource, viewType, options3);
    return input;
  }
};

var NotebookOutputEditorSerializer = class {
  canSerialize(input) {
    return input.typeId === NotebookOutputEditorInput.ID;
  }
  serialize(input) {
    assertType(input instanceof NotebookOutputEditorInput);
    const data = input.getSerializedData();
    if (!data) {
      return void 0;
    }
    return JSON.stringify(data);
  }
  deserialize(instantiationService, raw) {
    const data = parse2(raw);
    if (!data) {
      return void 0;
    }
    const input = instantiationService.createInstance(NotebookOutputEditorInput, data.notebookUri, data.cellIndex, void 0, data.outputIndex);
    return input;
  }
};

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(
  NotebookEditorInput.ID,
  NotebookEditorSerializer
);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(
  NotebookDiffEditorInput.ID,
  NotebookDiffEditorSerializer
);

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(
  NotebookOutputEditorInput.ID,
  NotebookOutputEditorSerializer
);

var NotebookContribution = class extends Disposable {
  constructor(undoRedoService, configurationService, codeEditorService) {
    super();
    this.codeEditorService = codeEditorService;
    this.updateCellUndoRedoComparisonKey(configurationService, undoRedoService);
    this._register(configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(NotebookSetting.undoRedoPerCell)) {
        this.updateCellUndoRedoComparisonKey(configurationService, undoRedoService);
      }
    }));
    this._register(this.codeEditorService.registerDecorationType("comment-controller", COMMENTEDITOR_DECORATION_KEY, {}));
  }
  static {
    this.ID = "workbench.contrib.notebook";
  }
  // Add or remove the cell undo redo comparison key based on the user setting
  updateCellUndoRedoComparisonKey(configurationService, undoRedoService) {
    const undoRedoPerCell = configurationService.getValue(NotebookSetting.undoRedoPerCell);
    if (!undoRedoPerCell) {
      if (!this._uriComparisonKeyComputer) {
        this._uriComparisonKeyComputer = undoRedoService.registerUriComparisonKeyComputer(CellUri.scheme, {
          getComparisonKey: (uri4) => {
            if (undoRedoPerCell) {
              return uri4.toString();
            }
            return NotebookContribution._getCellUndoRedoComparisonKey(uri4);
          }
        });
      }
    } else {
      this._uriComparisonKeyComputer?.dispose();
      this._uriComparisonKeyComputer = void 0;
    }
  }
  static _getCellUndoRedoComparisonKey(uri4) {
    const data = CellUri.parse(uri4);
    if (!data) {
      return uri4.toString();
    }
    return data.notebook.toString();
  }
  dispose() {
    super.dispose();
    this._uriComparisonKeyComputer?.dispose();
  }
};

NotebookContribution = __decorateClass([
  __decorateParam(0, IUndoRedoService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ICodeEditorService)
], NotebookContribution);

var CellContentProvider = class {
  constructor(textModelService, _modelService, _languageService, _notebookModelResolverService) {
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._notebookModelResolverService = _notebookModelResolverService;
    this._registration = textModelService.registerTextModelContentProvider(CellUri.scheme, this);
  }
  static {
    this.ID = "workbench.contrib.cellContentProvider";
  }
  dispose() {
    this._registration.dispose();
  }
  async provideTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    const data = CellUri.parse(resource);
    if (!data) {
      return null;
    }
    const ref = await this._notebookModelResolverService.resolve(data.notebook);
    let result = null;
    if (!ref.object.isResolved()) {
      return null;
    }
    for (const cell of ref.object.notebook.cells) {
      if (cell.uri.toString() === resource.toString()) {
        const bufferFactory = {
          create: (defaultEOL) => {
            return { textBuffer: cell.textBuffer, disposable: Disposable.None };
          },
          getFirstLineText: (limit) => {
            return cell.textBuffer.getLineContent(1).substring(0, limit);
          }
        };
        const languageId = this._languageService.getLanguageIdByLanguageName(cell.language);
        const languageSelection = languageId ? this._languageService.createById(languageId) : cell.cellKind === 1 /* Markup */ ? this._languageService.createById("markdown") : this._languageService.createByFilepathOrFirstLine(resource, cell.textBuffer.getLineContent(1));
        result = this._modelService.createModel(
          bufferFactory,
          languageSelection,
          resource
        );
        break;
      }
    }
    if (!result) {
      ref.dispose();
      return null;
    }
    const once = Event2.any(result.onWillDispose, ref.object.notebook.onWillDispose)(() => {
      once.dispose();
      ref.dispose();
    });
    return result;
  }
};

CellContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, INotebookEditorModelResolverService)
], CellContentProvider);

var CellInfoContentProvider = class {
  constructor(textModelService, _modelService, _languageService, _labelService, _notebookModelResolverService) {
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._labelService = _labelService;
    this._notebookModelResolverService = _notebookModelResolverService;
    this._disposables = [];
    this._disposables.push(textModelService.registerTextModelContentProvider(Schemas.vscodeNotebookCellMetadata, {
      provideTextContent: this.provideMetadataTextContent.bind(this)
    }));
    this._disposables.push(textModelService.registerTextModelContentProvider(Schemas.vscodeNotebookCellOutput, {
      provideTextContent: this.provideOutputTextContent.bind(this)
    }));
    this._disposables.push(this._labelService.registerFormatter({
      scheme: Schemas.vscodeNotebookCellMetadata,
      formatting: {
        label: "${path} (metadata)",
        separator: "/"
      }
    }));
    this._disposables.push(this._labelService.registerFormatter({
      scheme: Schemas.vscodeNotebookCellOutput,
      formatting: {
        label: "${path} (output)",
        separator: "/"
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.cellInfoContentProvider";
  }
  dispose() {
    dispose(this._disposables);
  }
  async provideMetadataTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    const data = CellUri.parseCellPropertyUri(resource, Schemas.vscodeNotebookCellMetadata);
    if (!data) {
      return null;
    }
    const ref = await this._notebookModelResolverService.resolve(data.notebook);
    let result = null;
    const mode = this._languageService.createById("json");
    const disposables = new DisposableStore();
    for (const cell of ref.object.notebook.cells) {
      if (cell.handle === data.handle) {
        const cellIndex = ref.object.notebook.cells.indexOf(cell);
        const metadataSource = getFormattedMetadataJSON(ref.object.notebook.transientOptions.transientCellMetadata, cell.metadata, cell.language, true);
        result = this._modelService.createModel(
          metadataSource,
          mode,
          resource
        );
        this._disposables.push(disposables.add(ref.object.notebook.onDidChangeContent((e4) => {
          if (result && e4.rawEvents.some((event) => (event.kind === 7 /* ChangeCellMetadata */ || event.kind === 5 /* ChangeCellLanguage */) && event.index === cellIndex)) {
            const value2 = getFormattedMetadataJSON(ref.object.notebook.transientOptions.transientCellMetadata, cell.metadata, cell.language, true);
            if (result.getValue() !== value2) {
              result.setValue(value2);
            }
          }
        })));
        break;
      }
    }
    if (!result) {
      ref.dispose();
      return null;
    }
    const once = result.onWillDispose(() => {
      disposables.dispose();
      once.dispose();
      ref.dispose();
    });
    return result;
  }
  parseStreamOutput(op) {
    if (!op) {
      return;
    }
    const streamOutputData = getStreamOutputData(op.outputs);
    if (streamOutputData) {
      return {
        content: streamOutputData,
        mode: this._languageService.createById(PLAINTEXT_LANGUAGE_ID)
      };
    }
    return;
  }
  _getResult(data, cell) {
    let result = void 0;
    const mode = this._languageService.createById("json");
    const op = cell.outputs.find((op2) => op2.outputId === data.outputId || op2.alternativeOutputId === data.outputId);
    const streamOutputData = this.parseStreamOutput(op);
    if (streamOutputData) {
      result = streamOutputData;
      return result;
    }
    const obj = cell.outputs.map((output) => ({
      metadata: output.metadata,
      outputItems: output.outputs.map((opit) => ({
        mimeType: opit.mime,
        data: opit.data.toString()
      }))
    }));
    const outputSource = toFormattedString(obj, {});
    result = {
      content: outputSource,
      mode
    };
    return result;
  }
  async provideOutputsTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    const data = CellUri.parseCellPropertyUri(resource, Schemas.vscodeNotebookCellOutput);
    if (!data) {
      return null;
    }
    const ref = await this._notebookModelResolverService.resolve(data.notebook);
    const cell = ref.object.notebook.cells.find((cell2) => cell2.handle === data.handle);
    if (!cell) {
      ref.dispose();
      return null;
    }
    const mode = this._languageService.createById("json");
    const model = this._modelService.createModel(getFormattedOutputJSON(cell.outputs || []), mode, resource, true);
    const cellModelListener = Event2.any(cell.onDidChangeOutputs ?? Event2.None, cell.onDidChangeOutputItems ?? Event2.None)(() => {
      model.setValue(getFormattedOutputJSON(cell.outputs || []));
    });
    const once = model.onWillDispose(() => {
      once.dispose();
      cellModelListener.dispose();
      ref.dispose();
    });
    return model;
  }
  async provideOutputTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    const data = CellUri.parseCellOutputUri(resource);
    if (!data) {
      return this.provideOutputsTextContent(resource);
    }
    const ref = await this._notebookModelResolverService.resolve(data.notebook);
    const cell = ref.object.notebook.cells.find((cell2) => !!cell2.outputs.find((op) => op.outputId === data.outputId || op.alternativeOutputId === data.outputId));
    if (!cell) {
      ref.dispose();
      return null;
    }
    const result = this._getResult(data, cell);
    if (!result) {
      ref.dispose();
      return null;
    }
    const model = this._modelService.createModel(result.content, result.mode, resource);
    const cellModelListener = Event2.any(cell.onDidChangeOutputs ?? Event2.None, cell.onDidChangeOutputItems ?? Event2.None)(() => {
      const newResult = this._getResult(data, cell);
      if (!newResult) {
        return;
      }
      model.setValue(newResult.content);
      model.setLanguage(newResult.mode.languageId);
    });
    const once = model.onWillDispose(() => {
      once.dispose();
      cellModelListener.dispose();
      ref.dispose();
    });
    return model;
  }
};

CellInfoContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, INotebookEditorModelResolverService)
], CellInfoContentProvider);

var NotebookMetadataContentProvider = class {
  constructor(textModelService, _modelService, _languageService, _labelService, _notebookModelResolverService) {
    this._modelService = _modelService;
    this._languageService = _languageService;
    this._labelService = _labelService;
    this._notebookModelResolverService = _notebookModelResolverService;
    this._disposables = [];
    this._disposables.push(textModelService.registerTextModelContentProvider(Schemas.vscodeNotebookMetadata, {
      provideTextContent: this.provideMetadataTextContent.bind(this)
    }));
    this._disposables.push(this._labelService.registerFormatter({
      scheme: Schemas.vscodeNotebookMetadata,
      formatting: {
        label: "${path} (metadata)",
        separator: "/"
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.notebookMetadataContentProvider";
  }
  dispose() {
    dispose(this._disposables);
  }
  async provideMetadataTextContent(resource) {
    const existing = this._modelService.getModel(resource);
    if (existing) {
      return existing;
    }
    const data = NotebookMetadataUri.parse(resource);
    if (!data) {
      return null;
    }
    const ref = await this._notebookModelResolverService.resolve(data);
    let result = null;
    const mode = this._languageService.createById("json");
    const disposables = new DisposableStore();
    const metadataSource = getFormattedNotebookMetadataJSON(ref.object.notebook.transientOptions.transientDocumentMetadata, ref.object.notebook.metadata);
    result = this._modelService.createModel(
      metadataSource,
      mode,
      resource
    );
    if (!result) {
      ref.dispose();
      return null;
    }
    this._disposables.push(disposables.add(ref.object.notebook.onDidChangeContent((e4) => {
      if (result && e4.rawEvents.some((event) => event.kind === 10 /* ChangeCellContent */ || event.kind === 11 /* ChangeDocumentMetadata */ || event.kind === 1 /* ModelChange */)) {
        const value2 = getFormattedNotebookMetadataJSON(ref.object.notebook.transientOptions.transientDocumentMetadata, ref.object.notebook.metadata);
        if (result.getValue() !== value2) {
          result.setValue(value2);
        }
      }
    })));
    const once = result.onWillDispose(() => {
      disposables.dispose();
      once.dispose();
      ref.dispose();
    });
    return result;
  }
};

NotebookMetadataContentProvider = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService),
  __decorateParam(3, ILabelService),
  __decorateParam(4, INotebookEditorModelResolverService)
], NotebookMetadataContentProvider);

var RegisterSchemasContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.registerCellSchemas";
  }
  constructor() {
    super();
    this.registerMetadataSchemas();
  }
  registerMetadataSchemas() {
    const jsonRegistry4 = Registry.as(Extensions3.JSONContribution);
    const metadataSchema = {
      properties: {
        ["language"]: {
          type: "string",
          description: "The language for the cell"
        }
      },
      // patternProperties: allSettings.patternProperties,
      additionalProperties: true,
      allowTrailingCommas: true,
      allowComments: true
    };
    jsonRegistry4.registerSchema("vscode://schemas/notebook/cellmetadata", metadataSchema);
  }
};

var NotebookEditorManager = class {
  constructor(_editorService, _notebookEditorModelService, editorGroups) {
    this._editorService = _editorService;
    this._notebookEditorModelService = _notebookEditorModelService;
    this._disposables = new DisposableStore();
    this._disposables.add(Event2.debounce(
      this._notebookEditorModelService.onDidChangeDirty,
      (last, current) => !last ? [current] : [...last, current],
      100
    )(this._openMissingDirtyNotebookEditors, this));
    this._disposables.add(_notebookEditorModelService.onWillFailWithConflict((e4) => {
      for (const group2 of editorGroups.groups) {
        const conflictInputs = group2.editors.filter((input) => input instanceof NotebookEditorInput && input.viewType !== e4.viewType && isEqual2(input.resource, e4.resource));
        const p = group2.closeEditors(conflictInputs);
        e4.waitUntil(p);
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.notebookEditorManager";
  }
  dispose() {
    this._disposables.dispose();
  }
  _openMissingDirtyNotebookEditors(models) {
    const result = [];
    for (const model of models) {
      if (model.isDirty() && !this._editorService.isOpened({ resource: model.resource, typeId: NotebookEditorInput.ID, editorId: model.viewType }) && extname2(model.resource) !== ".interactive") {
        result.push({
          resource: model.resource,
          options: { inactive: true, preserveFocus: true, pinned: true, override: model.viewType }
        });
      }
    }
    if (result.length > 0) {
      this._editorService.openEditors(result);
    }
  }
};

NotebookEditorManager = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, INotebookEditorModelResolverService),
  __decorateParam(2, IEditorGroupsService)
], NotebookEditorManager);

var SimpleNotebookWorkingCopyEditorHandler = class extends Disposable {
  constructor(_instantiationService, _workingCopyEditorService, _extensionService, _notebookService) {
    super();
    this._instantiationService = _instantiationService;
    this._workingCopyEditorService = _workingCopyEditorService;
    this._extensionService = _extensionService;
    this._notebookService = _notebookService;
    this._installHandler();
  }
  static {
    this.ID = "workbench.contrib.simpleNotebookWorkingCopyEditorHandler";
  }
  async handles(workingCopy) {
    const viewType = this.handlesSync(workingCopy);
    if (!viewType) {
      return false;
    }
    return this._notebookService.canResolve(viewType);
  }
  handlesSync(workingCopy) {
    const viewType = this._getViewType(workingCopy);
    if (!viewType || viewType === "interactive") {
      return void 0;
    }
    return viewType;
  }
  isOpen(workingCopy, editor) {
    if (!this.handlesSync(workingCopy)) {
      return false;
    }
    return editor instanceof NotebookEditorInput && editor.viewType === this._getViewType(workingCopy) && isEqual2(workingCopy.resource, editor.resource);
  }
  createEditor(workingCopy) {
    return NotebookEditorInput.getOrCreate(this._instantiationService, workingCopy.resource, void 0, this._getViewType(workingCopy));
  }
  async _installHandler() {
    await this._extensionService.whenInstalledExtensionsRegistered();
    this._register(this._workingCopyEditorService.registerHandler(this));
  }
  _getViewType(workingCopy) {
    const notebookType = NotebookWorkingCopyTypeIdentifier.parse(workingCopy.typeId);
    if (notebookType && notebookType.viewType === notebookType.notebookType) {
      return notebookType?.viewType;
    }
    return void 0;
  }
};

SimpleNotebookWorkingCopyEditorHandler = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IWorkingCopyEditorService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, INotebookService)
], SimpleNotebookWorkingCopyEditorHandler);

var NotebookLanguageSelectorScoreRefine = class {
  constructor(_notebookService, languageFeaturesService) {
    this._notebookService = _notebookService;
    languageFeaturesService.setNotebookTypeResolver(this._getNotebookInfo.bind(this));
  }
  static {
    this.ID = "workbench.contrib.notebookLanguageSelectorScoreRefine";
  }
  _getNotebookInfo(uri4) {
    const cellUri = CellUri.parse(uri4);
    if (!cellUri) {
      return void 0;
    }
    const notebook = this._notebookService.getNotebookTextModel(cellUri.notebook);
    if (!notebook) {
      return void 0;
    }
    return {
      uri: notebook.uri,
      type: notebook.viewType
    };
  }
};

NotebookLanguageSelectorScoreRefine = __decorateClass([
  __decorateParam(0, INotebookService),
  __decorateParam(1, ILanguageFeaturesService)
], NotebookLanguageSelectorScoreRefine);

var workbenchContributionsRegistry3 = Registry.as(Extensions10.Workbench);

registerWorkbenchContribution2(NotebookContribution.ID, NotebookContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(CellContentProvider.ID, CellContentProvider, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(CellInfoContentProvider.ID, CellInfoContentProvider, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(NotebookMetadataContentProvider.ID, NotebookMetadataContentProvider, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(RegisterSchemasContribution.ID, RegisterSchemasContribution, WorkbenchPhase.BlockStartup);

registerWorkbenchContribution2(NotebookEditorManager.ID, NotebookEditorManager, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(NotebookLanguageSelectorScoreRefine.ID, NotebookLanguageSelectorScoreRefine, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(SimpleNotebookWorkingCopyEditorHandler.ID, SimpleNotebookWorkingCopyEditorHandler, WorkbenchPhase.BlockRestore);

workbenchContributionsRegistry3.registerWorkbenchContribution(NotebookVariables, 4 /* Eventually */);

AccessibleViewRegistry.register(new NotebookAccessibleView());

AccessibleViewRegistry.register(new NotebookAccessibilityHelp());

registerSingleton(INotebookService, NotebookService, 1 /* Delayed */);

registerSingleton(INotebookEditorWorkerService, NotebookEditorWorkerServiceImpl, 1 /* Delayed */);

registerSingleton(INotebookEditorModelResolverService, NotebookModelResolverServiceImpl, 1 /* Delayed */);

registerSingleton(INotebookCellStatusBarService, NotebookCellStatusBarService, 1 /* Delayed */);

registerSingleton(INotebookEditorService, NotebookEditorWidgetService, 1 /* Delayed */);

registerSingleton(INotebookKernelService, NotebookKernelService, 1 /* Delayed */);

registerSingleton(INotebookKernelHistoryService, NotebookKernelHistoryService, 1 /* Delayed */);

registerSingleton(INotebookExecutionService, NotebookExecutionService, 1 /* Delayed */);

registerSingleton(INotebookExecutionStateService, NotebookExecutionStateService, 1 /* Delayed */);

registerSingleton(INotebookRendererMessagingService, NotebookRendererMessagingService, 1 /* Delayed */);

registerSingleton(INotebookKeymapService, NotebookKeymapService, 1 /* Delayed */);

registerSingleton(INotebookLoggingService, NotebookLoggingService, 1 /* Delayed */);

registerSingleton(INotebookCellOutlineDataSourceFactory, NotebookCellOutlineDataSourceFactory, 1 /* Delayed */);

registerSingleton(INotebookOutlineEntryFactory, NotebookOutlineEntryFactory, 1 /* Delayed */);

var schemas = {};

function isConfigurationPropertySchema2(x) {
  return typeof x.type !== "undefined" || typeof x.anyOf !== "undefined";
}

for (const editorOption of editorOptionsRegistry) {
  const schema10 = editorOption.schema;
  if (schema10) {
    if (isConfigurationPropertySchema2(schema10)) {
      schemas[`editor.${editorOption.name}`] = schema10;
    } else {
      for (const key3 in schema10) {
        if (Object.hasOwnProperty.call(schema10, key3)) {
          schemas[key3] = schema10[key3];
        }
      }
    }
  }
}

var editorOptionsCustomizationSchema = {
  description: localize(17699, null),
  default: {},
  allOf: [
    {
      properties: schemas
    }
    // , {
    // 	patternProperties: {
    // 		'^\\[.*\\]$': {
    // 			type: 'object',
    // 			default: {},
    // 			properties: schemas
    // 		}
    // 	}
    // }
  ],
  tags: ["notebookLayout"]
};

var configurationRegistry9 = Registry.as(Extensions4.Configuration);

configurationRegistry9.registerConfiguration({
  id: "notebook",
  order: 100,
  title: localize(17740, null),
  type: "object",
  properties: {
    [NotebookSetting.displayOrder]: {
      description: localize(17697, null),
      type: "array",
      items: {
        type: "string"
      },
      default: []
    },
    [NotebookSetting.cellToolbarLocation]: {
      description: localize(17687, null),
      type: "object",
      additionalProperties: {
        markdownDescription: localize(17688, null),
        type: "string",
        enum: ["left", "right", "hidden"]
      },
      default: {
        "default": "right"
      },
      tags: ["notebookLayout"]
    },
    [NotebookSetting.showCellStatusBar]: {
      description: localize(17728, null),
      type: "string",
      enum: ["hidden", "visible", "visibleAfterExecute"],
      enumDescriptions: [
        localize(17729, null),
        localize(17730, null),
        localize(17731, null)
      ],
      default: "visible",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.cellExecutionTimeVerbosity]: {
      description: localize(17683, null),
      type: "string",
      enum: ["default", "verbose"],
      enumDescriptions: [
        localize(17682, null),
        localize(17684, null)
      ],
      default: "default",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.textDiffEditorPreview]: {
      description: localize(17695, null),
      type: "boolean",
      default: true,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.diffOverviewRuler]: {
      description: localize(17694, null),
      type: "boolean",
      default: false,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.cellToolbarVisibility]: {
      markdownDescription: localize(17689, null),
      type: "string",
      enum: ["hover", "click"],
      default: "click",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.undoRedoPerCell]: {
      description: localize(17738, null),
      type: "boolean",
      default: true,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.compactView]: {
      description: localize(17690, null),
      type: "boolean",
      default: true,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.focusIndicator]: {
      description: localize(17701, null),
      type: "string",
      enum: ["border", "gutter"],
      default: "gutter",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.insertToolbarLocation]: {
      description: localize(17711, null),
      type: "string",
      enum: ["betweenCells", "notebookToolbar", "both", "hidden"],
      enumDescriptions: [
        localize(17677, null),
        localize(17680, null),
        localize(17678, null),
        localize(17679, null)
      ],
      default: "both",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.globalToolbar]: {
      description: localize(17704, null),
      type: "boolean",
      default: true,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.stickyScrollEnabled]: {
      description: localize(17733, null),
      type: "boolean",
      default: false,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.stickyScrollMode]: {
      description: localize(17734, null),
      type: "string",
      enum: ["flat", "indented"],
      enumDescriptions: [
        localize(17735, null),
        localize(17736, null)
      ],
      default: "indented",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.consolidatedOutputButton]: {
      description: localize(17692, null),
      type: "boolean",
      default: true,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.showFoldingControls]: {
      description: localize(17732, null),
      type: "string",
      enum: ["always", "never", "mouseover"],
      enumDescriptions: [
        localize(17742, null),
        localize(17744, null),
        localize(17743, null)
      ],
      default: "mouseover",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.dragAndDropEnabled]: {
      description: localize(17698, null),
      type: "boolean",
      default: true,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.consolidatedRunButton]: {
      description: localize(17693, null),
      type: "boolean",
      default: false,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.globalToolbarShowLabel]: {
      description: localize(17705, null),
      type: "string",
      enum: ["always", "never", "dynamic"],
      default: "always",
      tags: ["notebookLayout"]
    },
    [NotebookSetting.textOutputLineLimit]: {
      markdownDescription: localize(17737, null, "`#notebook.output.scrolling#`"),
      type: "number",
      default: 30,
      tags: ["notebookLayout", "notebookOutputLayout"],
      minimum: 1
    },
    [NotebookSetting.LinkifyOutputFilePaths]: {
      description: localize(17696, null),
      type: "boolean",
      default: true,
      tags: ["notebookOutputLayout"]
    },
    [NotebookSetting.minimalErrorRendering]: {
      description: localize(17716, null),
      type: "boolean",
      default: false,
      tags: ["notebookOutputLayout"]
    },
    [NotebookSetting.markupFontSize]: {
      markdownDescription: localize(17715, null, "`0`", "`#editor.fontSize#`"),
      type: "number",
      default: 0,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.markdownLineHeight]: {
      markdownDescription: localize(17713, null, "`0`", "`normal`"),
      type: "number",
      default: 0,
      tags: ["notebookLayout"]
    },
    [NotebookSetting.cellEditorOptionsCustomizations]: editorOptionsCustomizationSchema,
    [NotebookSetting.interactiveWindowCollapseCodeCells]: {
      markdownDescription: localize(17712, null),
      type: "string",
      enum: ["always", "never", "fromEditor"],
      default: "fromEditor"
    },
    [NotebookSetting.outputLineHeight]: {
      markdownDescription: localize(17720, null),
      type: "number",
      default: 0,
      tags: ["notebookLayout", "notebookOutputLayout"]
    },
    [NotebookSetting.outputFontSize]: {
      markdownDescription: localize(17719, null, "`#editor.fontSize#`"),
      type: "number",
      default: 0,
      tags: ["notebookLayout", "notebookOutputLayout"]
    },
    [NotebookSetting.outputFontFamily]: {
      markdownDescription: localize(17718, null, "`#editor.fontFamily#`"),
      type: "string",
      tags: ["notebookLayout", "notebookOutputLayout"]
    },
    [NotebookSetting.outputScrolling]: {
      markdownDescription: localize(17721, null),
      type: "boolean",
      tags: ["notebookLayout", "notebookOutputLayout"],
      default: typeof product_default.quality === "string" && product_default.quality !== "stable"
      // only enable as default in insiders
    },
    [NotebookSetting.outputWordWrap]: {
      markdownDescription: localize(17722, null),
      type: "boolean",
      tags: ["notebookLayout", "notebookOutputLayout"],
      default: false
    },
    [NotebookSetting.defaultFormatter]: {
      description: localize(17741, null),
      type: ["string", "null"],
      default: null,
      enum: DefaultFormatter.extensionIds,
      enumItemLabels: DefaultFormatter.extensionItemLabels,
      markdownEnumDescriptions: DefaultFormatter.extensionDescriptions
    },
    [NotebookSetting.formatOnSave]: {
      markdownDescription: localize(17703, null, "`#files.autoSave#`"),
      type: "boolean",
      tags: ["notebookLayout"],
      default: false
    },
    [NotebookSetting.insertFinalNewline]: {
      markdownDescription: localize(17710, null),
      type: "boolean",
      tags: ["notebookLayout"],
      default: false
    },
    [NotebookSetting.formatOnCellExecution]: {
      markdownDescription: localize(17702, null),
      type: "boolean",
      default: false
    },
    [NotebookSetting.confirmDeleteRunningCell]: {
      markdownDescription: localize(17691, null),
      type: "boolean",
      default: true
    },
    [NotebookSetting.findFilters]: {
      markdownDescription: localize(17700, null),
      type: "object",
      properties: {
        markupSource: {
          type: "boolean",
          default: true
        },
        markupPreview: {
          type: "boolean",
          default: true
        },
        codeSource: {
          type: "boolean",
          default: true
        },
        codeOutput: {
          type: "boolean",
          default: true
        }
      },
      default: {
        markupSource: true,
        markupPreview: true,
        codeSource: true,
        codeOutput: true
      },
      tags: ["notebookLayout"]
    },
    [NotebookSetting.remoteSaving]: {
      markdownDescription: localize(17723, null),
      type: "boolean",
      default: typeof product_default.quality === "string" && product_default.quality !== "stable",
      // only enable as default in insiders
      tags: ["experimental"]
    },
    [NotebookSetting.scrollToRevealCell]: {
      markdownDescription: localize(17724, null, "notebook.cell.executeAndSelectBelow"),
      type: "string",
      enum: ["fullCell", "firstLine", "none"],
      markdownEnumDescriptions: [
        localize(17726, null),
        localize(17725, null),
        localize(17727, null)
      ],
      default: "fullCell"
    },
    [NotebookSetting.cellGenerate]: {
      markdownDescription: localize(17686, null),
      type: "boolean",
      default: true
    },
    [NotebookSetting.notebookVariablesView]: {
      markdownDescription: localize(17739, null),
      type: "boolean",
      default: false
    },
    [NotebookSetting.notebookInlineValues]: {
      markdownDescription: localize(17707, null),
      type: "string",
      enum: ["on", "auto", "off"],
      enumDescriptions: [
        localize(17709, null),
        localize(17706, null),
        localize(17708, null)
      ],
      default: "off"
    },
    [NotebookSetting.cellFailureDiagnostics]: {
      markdownDescription: localize(17685, null),
      type: "boolean",
      default: true
    },
    [NotebookSetting.outputBackupSizeLimit]: {
      markdownDescription: localize(17681, null),
      type: "number",
      default: 1e4
    },
    [NotebookSetting.multiCursor]: {
      markdownDescription: localize(17717, null),
      type: "boolean",
      default: false
    },
    [NotebookSetting.markupFontFamily]: {
      markdownDescription: localize(17714, null),
      type: "string",
      default: "",
      tags: ["notebookLayout"]
    }
  }
});
export { isConfigurationPropertySchema2, NotebookDiffEditorSerializer, NotebookEditorSerializer, NotebookOutputEditorSerializer, NotebookContribution, CellContentProvider, CellInfoContentProvider, NotebookMetadataContentProvider, RegisterSchemasContribution, NotebookEditorManager, SimpleNotebookWorkingCopyEditorHandler, NotebookLanguageSelectorScoreRefine, workbenchContributionsRegistry3, schemas, editorOptionsCustomizationSchema, configurationRegistry9 };
