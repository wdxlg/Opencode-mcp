// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/textDiffEditor.ts
import { AbstractTextEditor } from "./module-1091.mjs";
import { EditorExtensions, TEXT_DIFF_EDITOR_ID, createTooLargeFileError, isEditorInput, isEditorInputWithOptionsAndGroup, isTextEditorViewState } from "./module-0925.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { DiffEditorWidget } from "./module-0527.mjs";
import { TextDiffEditorModel } from "./module-1100.mjs";
import { assertReturnsDefined, isObject } from "./module-0010.mjs";
import { applyTextEditorOptions } from "./module-1533.mjs";
import { StopWatch } from "./module-0016.mjs";
import { ByteSize, IFileService, TooLargeFileOperationError } from "./module-0269.mjs";
import { DiffEditorInput } from "./module-1101.mjs";
import { Registry } from "./module-0090.mjs";
import { deepClone } from "./module-0098.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { multibyteAwareBtoa } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { IEditorResolverService } from "./module-1113.mjs";


// src/vs/workbench/browser/parts/editor/textDiffEditor.ts
var TextDiffEditor = class extends AbstractTextEditor {
  constructor(group2, telemetryService, instantiationService, storageService, configurationService, editorService, themeService, editorGroupService, fileService, preferencesService, editorResolverService) {
    super(TextDiffEditor.ID, group2, telemetryService, instantiationService, storageService, configurationService, themeService, editorService, editorGroupService, fileService);
    this.preferencesService = preferencesService;
    this.editorResolverService = editorResolverService;
    this.diffEditorControl = void 0;
    this.inputLifecycleStopWatch = void 0;
    this._previousViewModel = null;
  }
  static {
    this.ID = TEXT_DIFF_EDITOR_ID;
  }
  get scopedContextKeyService() {
    if (!this.diffEditorControl) {
      return void 0;
    }
    const originalEditor = this.diffEditorControl.getOriginalEditor();
    const modifiedEditor = this.diffEditorControl.getModifiedEditor();
    return (originalEditor.hasTextFocus() ? originalEditor : modifiedEditor).invokeWithinContext((accessor) => accessor.get(IContextKeyService));
  }
  getTitle() {
    if (this.input) {
      return this.input.getName();
    }
    return localize(6772, null);
  }
  createEditorControl(parent, configuration2) {
    this.diffEditorControl = this._register(this.instantiationService.createInstance(DiffEditorWidget, parent, configuration2, {}));
  }
  updateEditorControlOptions(options3) {
    this.diffEditorControl?.updateOptions(options3);
  }
  getMainControl() {
    return this.diffEditorControl?.getModifiedEditor();
  }
  async setInput(input, options3, context2, token) {
    if (this._previousViewModel) {
      this._previousViewModel.dispose();
      this._previousViewModel = null;
    }
    this.inputLifecycleStopWatch = void 0;
    await super.setInput(input, options3, context2, token);
    try {
      const resolvedModel = await input.resolve();
      if (token.isCancellationRequested) {
        return void 0;
      }
      if (!(resolvedModel instanceof TextDiffEditorModel)) {
        await this.openAsBinary(input, options3);
        return void 0;
      }
      const control = assertReturnsDefined(this.diffEditorControl);
      const resolvedDiffEditorModel = resolvedModel;
      const vm = resolvedDiffEditorModel.textDiffEditorModel ? control.createViewModel(resolvedDiffEditorModel.textDiffEditorModel) : null;
      this._previousViewModel = vm;
      await vm?.waitForDiff();
      control.setModel(vm);
      let hasPreviousViewState = false;
      if (!isTextEditorViewState(options3?.viewState)) {
        hasPreviousViewState = this.restoreTextDiffEditorViewState(input, options3, context2, control);
      }
      let optionsGotApplied = false;
      if (options3) {
        optionsGotApplied = applyTextEditorOptions(options3, control, 1 /* Immediate */);
      }
      if (!optionsGotApplied && !hasPreviousViewState) {
        control.revealFirstDiff();
      }
      control.updateOptions({
        ...this.getReadonlyConfiguration(resolvedDiffEditorModel.modifiedModel?.isReadonly()),
        originalEditable: !resolvedDiffEditorModel.originalModel?.isReadonly()
      });
      control.handleInitialized();
      this.inputLifecycleStopWatch = new StopWatch(false);
    } catch (error) {
      await this.handleSetInputError(error, input, options3);
    }
  }
  async handleSetInputError(error, input, options3) {
    if (this.isFileBinaryError(error)) {
      return this.openAsBinary(input, options3);
    }
    if (error.fileOperationResult === 7 /* FILE_TOO_LARGE */) {
      let message;
      if (error instanceof TooLargeFileOperationError) {
        message = localize(6771, null, ByteSize.formatSize(error.size));
      } else {
        message = localize(6770, null);
      }
      throw createTooLargeFileError(this.group, input, options3, message, this.preferencesService);
    }
    throw error;
  }
  restoreTextDiffEditorViewState(editor, options3, context2, control) {
    const editorViewState = this.loadEditorViewState(editor, context2);
    if (editorViewState) {
      if (options3?.selection && editorViewState.modified) {
        editorViewState.modified.cursorState = [];
      }
      control.restoreViewState(editorViewState);
      if (options3?.revealIfVisible) {
        control.revealFirstDiff();
      }
      return true;
    }
    return false;
  }
  async openAsBinary(input, options3) {
    const original = input.original;
    const modified = input.modified;
    const modifiedResource = modified.resource;
    if (modifiedResource) {
      const fallbackEditorId = this.editorResolverService.getBinaryDiffFallbackEditor(modifiedResource);
      const originalResource = original.resource;
      if (fallbackEditorId && originalResource) {
        const resolved = await this.editorResolverService.resolveEditor({
          original: { resource: originalResource },
          modified: { resource: modifiedResource },
          // Passing an explicit `override` bypasses the automatic `never` filtering and the diff
          // special-casing, so the resolver returns the custom diff editor directly.
          options: { ...options3, override: fallbackEditorId }
        }, this.group);
        if (isEditorInputWithOptionsAndGroup(resolved)) {
          this.group.replaceEditors([{
            editor: input,
            replacement: resolved.editor,
            options: {
              ...resolved.options,
              activation: 3 /* PRESERVE */,
              pinned: this.group.isPinned(input),
              sticky: this.group.isSticky(input)
            }
          }]);
          return;
        }
      }
    }
    const binaryDiffInput = this.instantiationService.createInstance(DiffEditorInput, input.getName(), input.getDescription(), original, modified, true);
    const fileEditorFactory = Registry.as(EditorExtensions.EditorFactory).getFileEditorFactory();
    if (fileEditorFactory.isFileEditor(original)) {
      original.setForceOpenAsBinary();
    }
    if (fileEditorFactory.isFileEditor(modified)) {
      modified.setForceOpenAsBinary();
    }
    this.group.replaceEditors([{
      editor: input,
      replacement: binaryDiffInput,
      options: {
        ...options3,
        // Make sure to not steal away the currently active group
        // because we are triggering another openEditor() call
        // and do not control the initial intent that resulted
        // in us now opening as binary.
        activation: 3 /* PRESERVE */,
        pinned: this.group.isPinned(input),
        sticky: this.group.isSticky(input)
      }
    }]);
  }
  setOptions(options3) {
    super.setOptions(options3);
    if (options3) {
      applyTextEditorOptions(options3, assertReturnsDefined(this.diffEditorControl), 0 /* Smooth */);
    }
  }
  shouldHandleConfigurationChangeEvent(e, resource) {
    if (super.shouldHandleConfigurationChangeEvent(e, resource)) {
      return true;
    }
    return e.affectsConfiguration(resource, "diffEditor") || e.affectsConfiguration(resource, "accessibility.verbosity.diffEditor");
  }
  computeConfiguration(configuration2) {
    const editorConfiguration4 = super.computeConfiguration(configuration2);
    if (isObject(configuration2.diffEditor)) {
      const diffEditorConfiguration = deepClone(configuration2.diffEditor);
      diffEditorConfiguration.diffCodeLens = diffEditorConfiguration.codeLens;
      delete diffEditorConfiguration.codeLens;
      diffEditorConfiguration.diffWordWrap = diffEditorConfiguration.wordWrap;
      delete diffEditorConfiguration.wordWrap;
      Object.assign(editorConfiguration4, diffEditorConfiguration);
    }
    const verbose = configuration2.accessibility?.verbosity?.diffEditor ?? false;
    editorConfiguration4.accessibilityVerbose = verbose;
    return editorConfiguration4;
  }
  getConfigurationOverrides(configuration2) {
    return {
      ...super.getConfigurationOverrides(configuration2),
      ...this.getReadonlyConfiguration(this.input?.isReadonly()),
      originalEditable: this.input instanceof DiffEditorInput && !this.input.original.isReadonly(),
      lineDecorationsWidth: "2ch"
    };
  }
  updateReadonly(input) {
    if (input instanceof DiffEditorInput) {
      this.diffEditorControl?.updateOptions({
        ...this.getReadonlyConfiguration(input.isReadonly()),
        originalEditable: !input.original.isReadonly()
      });
    } else {
      super.updateReadonly(input);
    }
  }
  isFileBinaryError(error) {
    if (Array.isArray(error)) {
      const errors = error;
      return errors.some((error2) => this.isFileBinaryError(error2));
    }
    return error.textFileOperationResult === 0 /* FILE_IS_BINARY */;
  }
  clearInput() {
    if (this._previousViewModel) {
      this._previousViewModel.dispose();
      this._previousViewModel = null;
    }
    super.clearInput();
    const inputLifecycleElapsed = this.inputLifecycleStopWatch?.elapsed();
    this.inputLifecycleStopWatch = void 0;
    if (typeof inputLifecycleElapsed === "number") {
      this.logInputLifecycleTelemetry(inputLifecycleElapsed, this.getControl()?.getModel()?.modified?.getLanguageId());
    }
    this.diffEditorControl?.setModel(null);
  }
  logInputLifecycleTelemetry(duration, languageId) {
    let collapseUnchangedRegions = false;
    if (this.diffEditorControl instanceof DiffEditorWidget) {
      collapseUnchangedRegions = this.diffEditorControl.collapseUnchangedRegions;
    }
    this.telemetryService.publicLog2("diffEditor.editorVisibleTime", {
      editorVisibleTimeMs: duration,
      languageId: languageId ?? "",
      collapseUnchangedRegions
    });
  }
  getControl() {
    return this.diffEditorControl;
  }
  focus() {
    super.focus();
    this.diffEditorControl?.focus();
  }
  hasFocus() {
    return this.diffEditorControl?.hasTextFocus() || super.hasFocus();
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    if (visible) {
      this.diffEditorControl?.onVisible();
    } else {
      this.diffEditorControl?.onHide();
    }
  }
  layout(dimension) {
    this.diffEditorControl?.layout(dimension);
  }
  setBoundarySashes(sashes) {
    this.diffEditorControl?.setBoundarySashes(sashes);
  }
  tracksEditorViewState(input) {
    return input instanceof DiffEditorInput;
  }
  computeEditorViewState(resource) {
    if (!this.diffEditorControl) {
      return void 0;
    }
    const model = this.diffEditorControl.getModel();
    if (!model?.modified || !model.original) {
      return void 0;
    }
    const modelUri = this.toEditorViewStateResource(model);
    if (!modelUri) {
      return void 0;
    }
    if (!isEqual2(modelUri, resource)) {
      return void 0;
    }
    return this.diffEditorControl.saveViewState() ?? void 0;
  }
  toEditorViewStateResource(modelOrInput) {
    let original;
    let modified;
    if (modelOrInput instanceof DiffEditorInput) {
      original = modelOrInput.original.resource;
      modified = modelOrInput.modified.resource;
    } else if (!isEditorInput(modelOrInput)) {
      original = modelOrInput.original.uri;
      modified = modelOrInput.modified.uri;
    }
    if (!original || !modified) {
      return void 0;
    }
    return URI.from({ scheme: "diff", path: `${multibyteAwareBtoa(original.toString())}${multibyteAwareBtoa(modified.toString())}` });
  }
};

TextDiffEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, ITextResourceConfigurationService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IEditorGroupsService),
  __decorateParam(8, IFileService),
  __decorateParam(9, IPreferencesService),
  __decorateParam(10, IEditorResolverService)
], TextDiffEditor);
export { TextDiffEditor };
