// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/view/mergeEditor.ts
import { AbstractTextEditor } from "./module-1092.mjs";
import { Disposable, DisposableStore, MutableDisposable, thenIfNotDisposed, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { InputCodeEditorView } from "./module-2984.mjs";
import { ResultCodeEditorView } from "./module-2985.mjs";
import { ctxIsMergeEditor, ctxMergeBaseUri, ctxMergeEditorLayout, ctxMergeEditorShowBase, ctxMergeEditorShowBaseAtTop, ctxMergeEditorShowNonConflictingChanges, ctxMergeResultUri } from "./module-1142.mjs";
import { ViewZoneComputer } from "./module-2983.mjs";
import { ScrollSynchronizer } from "./module-2978.mjs";
import { Emitter } from "./module-0017.mjs";
import { PersistentStore, deepMerge } from "./module-1139.mjs";
import { localize } from "./module-0001.mjs";
import { MergeEditorInput } from "./module-1145.mjs";
import { BugIndicatingError, onUnexpectedError } from "./module-0004.mjs";
import { transaction } from "./module-0045.mjs";
import { MergeEditorViewModel } from "./module-2979.mjs";
import { autorun, autorunWithStore } from "./module-0052.mjs";
import { readTransientState, writeTransientState } from "./module-1841.mjs";
import { applyTextEditorOptions } from "./module-1525.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { BaseCodeEditorView } from "./module-2977.mjs";
import { isDefined } from "./module-0010.mjs";
import { SerializableGrid } from "./module-1508.mjs";
import { settingsSashBorder } from "./module-1815.mjs";
import { Color } from "./module-0197.mjs";
import { reset } from "./module-0075.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IFileService } from "./module-0269.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { DEFAULT_EDITOR_ASSOCIATION } from "./module-0926.mjs";
import { IEditorResolverService } from "./module-1114.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/view/mergeEditor.ts
var MergeEditor = class extends AbstractTextEditor {
  constructor(group2, instantiation, contextKeyService, telemetryService, storageService, themeService, textResourceConfigurationService, editorService, editorGroupService, fileService, _codeEditorService) {
    super(MergeEditor.ID, group2, telemetryService, instantiation, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService);
    this.contextKeyService = contextKeyService;
    this._codeEditorService = _codeEditorService;
    this._sessionDisposables = new DisposableStore();
    this._viewModel = observableValue(this, void 0);
    this._grid = this._register(new MutableDisposable());
    this.input1View = this._register(this.instantiationService.createInstance(InputCodeEditorView, 1, this._viewModel));
    this.baseView = observableValue(this, void 0);
    this.baseViewOptions = observableValue(this, void 0);
    this.input2View = this._register(this.instantiationService.createInstance(InputCodeEditorView, 2, this._viewModel));
    this.inputResultView = this._register(this.instantiationService.createInstance(ResultCodeEditorView, this._viewModel));
    this._layoutMode = this.instantiationService.createInstance(MergeEditorLayoutStore);
    this._layoutModeObs = observableValue(this, this._layoutMode.value);
    this._ctxIsMergeEditor = ctxIsMergeEditor.bindTo(this.contextKeyService);
    this._ctxUsesColumnLayout = ctxMergeEditorLayout.bindTo(this.contextKeyService);
    this._ctxShowBase = ctxMergeEditorShowBase.bindTo(this.contextKeyService);
    this._ctxShowBaseAtTop = ctxMergeEditorShowBaseAtTop.bindTo(this.contextKeyService);
    this._ctxResultUri = ctxMergeResultUri.bindTo(this.contextKeyService);
    this._ctxBaseUri = ctxMergeBaseUri.bindTo(this.contextKeyService);
    this._ctxShowNonConflictingChanges = ctxMergeEditorShowNonConflictingChanges.bindTo(this.contextKeyService);
    this._inputModel = observableValue(this, void 0);
    this.viewZoneComputer = new ViewZoneComputer(
      this.input1View.editor,
      this.input2View.editor,
      this.inputResultView.editor
    );
    this.scrollSynchronizer = this._register(new ScrollSynchronizer(this._viewModel, this.input1View, this.input2View, this.baseView, this.inputResultView, this._layoutModeObs));
    this._onDidChangeSizeConstraints = this._register(new Emitter());
    this.onDidChangeSizeConstraints = this._onDidChangeSizeConstraints.event;
    this.baseViewDisposables = this._register(new DisposableStore());
    this.showNonConflictingChangesStore = this.instantiationService.createInstance(PersistentStore, "mergeEditor/showNonConflictingChanges");
    this.showNonConflictingChanges = observableValue(this, this.showNonConflictingChangesStore.get() ?? false);
  }
  static {
    this.ID = "mergeEditor";
  }
  get viewModel() {
    return this._viewModel;
  }
  get inputModel() {
    return this._inputModel;
  }
  get model() {
    return this.inputModel.get()?.model;
  }
  dispose() {
    this._sessionDisposables.dispose();
    this._ctxIsMergeEditor.reset();
    this._ctxUsesColumnLayout.reset();
    this._ctxShowNonConflictingChanges.reset();
    super.dispose();
  }
  get minimumWidth() {
    return this._layoutMode.value.kind === "mixed" ? this.input1View.view.minimumWidth + this.input2View.view.minimumWidth : this.input1View.view.minimumWidth + this.input2View.view.minimumWidth + this.inputResultView.view.minimumWidth;
  }
  // #endregion
  getTitle() {
    if (this.input) {
      return this.input.getName();
    }
    return localize(17341, null);
  }
  createEditorControl(parent, initialOptions) {
    this.rootHtmlElement = parent;
    parent.classList.add("merge-editor");
    this.applyLayout(this._layoutMode.value);
    this.applyOptions(initialOptions);
  }
  updateEditorControlOptions(options3) {
    this.applyOptions(options3);
  }
  applyOptions(options3) {
    const inputOptions = deepMerge(options3, {
      minimap: { enabled: false },
      glyphMargin: false,
      lineNumbersMinChars: 2
    });
    const readOnlyInputOptions = deepMerge(inputOptions, {
      readOnly: true,
      readOnlyMessage: void 0
    });
    this.input1View.updateOptions(readOnlyInputOptions);
    this.input2View.updateOptions(readOnlyInputOptions);
    this.baseViewOptions.set({ ...this.input2View.editor.getRawOptions() }, void 0);
    this.inputResultView.updateOptions(inputOptions);
  }
  getMainControl() {
    return this.inputResultView.editor;
  }
  layout(dimension) {
    this._grid.value?.layout(dimension.width, dimension.height);
  }
  async setInput(input, options3, context2, token) {
    if (!(input instanceof MergeEditorInput)) {
      throw new BugIndicatingError("ONLY MergeEditorInput is supported");
    }
    await super.setInput(input, options3, context2, token);
    this._sessionDisposables.clear();
    transaction((tx) => {
      this._viewModel.set(void 0, tx);
      this._inputModel.set(void 0, tx);
    });
    const inputModel = await input.resolve();
    const model = inputModel.model;
    const viewModel = this.instantiationService.createInstance(
      MergeEditorViewModel,
      model,
      this.input1View,
      this.input2View,
      this.inputResultView,
      this.baseView,
      this.showNonConflictingChanges
    );
    model.telemetry.reportMergeEditorOpened({
      combinableConflictCount: model.combinableConflictCount,
      conflictCount: model.conflictCount,
      baseTop: this._layoutModeObs.get().showBaseAtTop,
      baseVisible: this._layoutModeObs.get().showBase,
      isColumnView: this._layoutModeObs.get().kind === "columns"
    });
    transaction((tx) => {
      this._viewModel.set(viewModel, tx);
      this._inputModel.set(inputModel, tx);
    });
    this._sessionDisposables.add(viewModel);
    this._sessionDisposables.add(autorun((reader) => {
      const focusedType = viewModel.focusedEditorType.read(reader);
      if (!(input instanceof MergeEditorInput)) {
        return;
      }
      input.updateFocusedEditor(focusedType || "result");
    }));
    this._ctxResultUri.set(inputModel.resultUri.toString());
    this._ctxBaseUri.set(model.base.uri.toString());
    this._sessionDisposables.add(toDisposable(() => {
      this._ctxBaseUri.reset();
      this._ctxResultUri.reset();
    }));
    const viewZoneRegistrationStore = new DisposableStore();
    this._sessionDisposables.add(viewZoneRegistrationStore);
    this._sessionDisposables.add(autorunWithStore((reader) => {
      const baseView = this.baseView.read(reader);
      const resultScrollTop = this.inputResultView.editor.getScrollTop();
      this.scrollSynchronizer.stopSync();
      viewZoneRegistrationStore.clear();
      this.inputResultView.editor.changeViewZones((resultViewZoneAccessor) => {
        const layout2 = this._layoutModeObs.read(reader);
        const shouldAlignResult = layout2.kind === "columns";
        const shouldAlignBase = layout2.kind === "mixed" && !layout2.showBaseAtTop;
        this.input1View.editor.changeViewZones((input1ViewZoneAccessor) => {
          this.input2View.editor.changeViewZones((input2ViewZoneAccessor) => {
            if (baseView) {
              baseView.editor.changeViewZones((baseViewZoneAccessor) => {
                viewZoneRegistrationStore.add(this.setViewZones(
                  reader,
                  viewModel,
                  this.input1View.editor,
                  input1ViewZoneAccessor,
                  this.input2View.editor,
                  input2ViewZoneAccessor,
                  baseView.editor,
                  baseViewZoneAccessor,
                  shouldAlignBase,
                  this.inputResultView.editor,
                  resultViewZoneAccessor,
                  shouldAlignResult
                ));
              });
            } else {
              viewZoneRegistrationStore.add(this.setViewZones(
                reader,
                viewModel,
                this.input1View.editor,
                input1ViewZoneAccessor,
                this.input2View.editor,
                input2ViewZoneAccessor,
                void 0,
                void 0,
                false,
                this.inputResultView.editor,
                resultViewZoneAccessor,
                shouldAlignResult
              ));
            }
          });
        });
      });
      this.inputResultView.editor.setScrollTop(resultScrollTop, 0 /* Smooth */);
      this.scrollSynchronizer.startSync();
      this.scrollSynchronizer.updateScrolling();
    }));
    const viewState = this.loadEditorViewState(input, context2);
    if (viewState) {
      this._applyViewState(viewState);
    } else {
      this._sessionDisposables.add(thenIfNotDisposed(model.onInitialized, () => {
        const firstConflict = model.modifiedBaseRanges.get().find((r2) => r2.isConflicting);
        if (!firstConflict) {
          return;
        }
        this.input1View.editor.revealLineInCenter(firstConflict.input1Range.startLineNumber);
        transaction((tx) => {
          viewModel.setActiveModifiedBaseRange(firstConflict, tx);
        });
      }));
    }
    const mirrorWordWrapTransientState = (candidate) => {
      const candidateState = readTransientState(candidate, this._codeEditorService);
      writeTransientState(model.input2.textModel, candidateState, this._codeEditorService);
      writeTransientState(model.input1.textModel, candidateState, this._codeEditorService);
      writeTransientState(model.resultTextModel, candidateState, this._codeEditorService);
      const baseTextModel = this.baseView.get()?.editor.getModel();
      if (baseTextModel) {
        writeTransientState(baseTextModel, candidateState, this._codeEditorService);
      }
    };
    this._sessionDisposables.add(this._codeEditorService.onDidChangeTransientModelProperty((candidate) => {
      mirrorWordWrapTransientState(candidate);
    }));
    mirrorWordWrapTransientState(this.inputResultView.editor.getModel());
    const that = this;
    this._sessionDisposables.add(new class {
      constructor() {
        this._disposable = new DisposableStore();
        for (const model2 of this.baseInput1Input2()) {
          this._disposable.add(model2.onDidChangeContent(() => this._checkBaseInput1Input2AllEmpty()));
        }
      }
      dispose() {
        this._disposable.dispose();
      }
      *baseInput1Input2() {
        yield model.base;
        yield model.input1.textModel;
        yield model.input2.textModel;
      }
      _checkBaseInput1Input2AllEmpty() {
        for (const model2 of this.baseInput1Input2()) {
          if (model2.getValueLength() > 0) {
            return;
          }
        }
        that.editorService.replaceEditors(
          [{ editor: input, replacement: { resource: input.result, options: { preserveFocus: true } }, forceReplaceDirty: true }],
          that.group
        );
      }
    }());
  }
  setViewZones(reader, viewModel, input1Editor, input1ViewZoneAccessor, input2Editor, input2ViewZoneAccessor, baseEditor, baseViewZoneAccessor, shouldAlignBase, resultEditor, resultViewZoneAccessor, shouldAlignResult) {
    const input1ViewZoneIds = [];
    const input2ViewZoneIds = [];
    const baseViewZoneIds = [];
    const resultViewZoneIds = [];
    const viewZones = this.viewZoneComputer.computeViewZones(reader, viewModel, {
      codeLensesVisible: true,
      showNonConflictingChanges: this.showNonConflictingChanges.read(reader),
      shouldAlignBase,
      shouldAlignResult
    });
    const disposableStore = new DisposableStore();
    if (baseViewZoneAccessor) {
      for (const v2 of viewZones.baseViewZones) {
        v2.create(baseViewZoneAccessor, baseViewZoneIds, disposableStore);
      }
    }
    for (const v2 of viewZones.resultViewZones) {
      v2.create(resultViewZoneAccessor, resultViewZoneIds, disposableStore);
    }
    for (const v2 of viewZones.input1ViewZones) {
      v2.create(input1ViewZoneAccessor, input1ViewZoneIds, disposableStore);
    }
    for (const v2 of viewZones.input2ViewZones) {
      v2.create(input2ViewZoneAccessor, input2ViewZoneIds, disposableStore);
    }
    disposableStore.add({
      dispose: () => {
        input1Editor.changeViewZones((a) => {
          for (const zone of input1ViewZoneIds) {
            a.removeZone(zone);
          }
        });
        input2Editor.changeViewZones((a) => {
          for (const zone of input2ViewZoneIds) {
            a.removeZone(zone);
          }
        });
        baseEditor?.changeViewZones((a) => {
          for (const zone of baseViewZoneIds) {
            a.removeZone(zone);
          }
        });
        resultEditor.changeViewZones((a) => {
          for (const zone of resultViewZoneIds) {
            a.removeZone(zone);
          }
        });
      }
    });
    return disposableStore;
  }
  setOptions(options3) {
    super.setOptions(options3);
    if (options3) {
      applyTextEditorOptions(options3, this.inputResultView.editor, 0 /* Smooth */);
    }
  }
  clearInput() {
    super.clearInput();
    this._sessionDisposables.clear();
    for (const { editor } of [this.input1View, this.input2View, this.inputResultView]) {
      editor.setModel(null);
    }
  }
  focus() {
    super.focus();
    (this.getControl() ?? this.inputResultView.editor).focus();
  }
  hasFocus() {
    for (const { editor } of [this.input1View, this.input2View, this.inputResultView]) {
      if (editor.hasTextFocus()) {
        return true;
      }
    }
    return super.hasFocus();
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    for (const { editor } of [this.input1View, this.input2View, this.inputResultView]) {
      if (visible) {
        editor.onVisible();
      } else {
        editor.onHide();
      }
    }
    this._ctxIsMergeEditor.set(visible);
  }
  // ---- interact with "outside world" via`getControl`, `scopedContextKeyService`: we only expose the result-editor keep the others internal
  getControl() {
    return this.inputResultView.editor;
  }
  get scopedContextKeyService() {
    const control = this.getControl();
    return control?.invokeWithinContext((accessor) => accessor.get(IContextKeyService));
  }
  // --- layout
  toggleBase() {
    this.setLayout({
      ...this._layoutMode.value,
      showBase: !this._layoutMode.value.showBase
    });
  }
  toggleShowBaseTop() {
    const showBaseTop = this._layoutMode.value.showBase && this._layoutMode.value.showBaseAtTop;
    this.setLayout({
      ...this._layoutMode.value,
      showBaseAtTop: true,
      showBase: !showBaseTop
    });
  }
  toggleShowBaseCenter() {
    const showBaseCenter = this._layoutMode.value.showBase && !this._layoutMode.value.showBaseAtTop;
    this.setLayout({
      ...this._layoutMode.value,
      showBaseAtTop: false,
      showBase: !showBaseCenter
    });
  }
  setLayoutKind(kind) {
    this.setLayout({
      ...this._layoutMode.value,
      kind
    });
  }
  setLayout(newLayout) {
    const value2 = this._layoutMode.value;
    if (JSON.stringify(value2) === JSON.stringify(newLayout)) {
      return;
    }
    this.model?.telemetry.reportLayoutChange({
      baseTop: newLayout.showBaseAtTop,
      baseVisible: newLayout.showBase,
      isColumnView: newLayout.kind === "columns"
    });
    this.applyLayout(newLayout);
  }
  applyLayout(layout2) {
    transaction((tx) => {
      if (layout2.showBase && !this.baseView.get()) {
        this.baseViewDisposables.clear();
        const baseView = this.baseViewDisposables.add(
          this.instantiationService.createInstance(
            BaseCodeEditorView,
            this.viewModel
          )
        );
        this.baseViewDisposables.add(autorun((reader) => {
          const options3 = this.baseViewOptions.read(reader);
          if (options3) {
            baseView.updateOptions(options3);
          }
        }));
        this.baseView.set(baseView, tx);
      } else if (!layout2.showBase && this.baseView.get()) {
        this.baseView.set(void 0, tx);
        this.baseViewDisposables.clear();
      }
      if (layout2.kind === "mixed") {
        this.setGrid([
          layout2.showBaseAtTop && layout2.showBase ? {
            size: 38,
            data: this.baseView.get().view
          } : void 0,
          {
            size: 38,
            groups: [
              { data: this.input1View.view },
              !layout2.showBaseAtTop && layout2.showBase ? { data: this.baseView.get().view } : void 0,
              { data: this.input2View.view }
            ].filter(isDefined)
          },
          {
            size: 62,
            data: this.inputResultView.view
          }
        ].filter(isDefined));
      } else if (layout2.kind === "columns") {
        this.setGrid([
          layout2.showBase ? {
            size: 40,
            data: this.baseView.get().view
          } : void 0,
          {
            size: 60,
            groups: [{ data: this.input1View.view }, { data: this.inputResultView.view }, { data: this.input2View.view }]
          }
        ].filter(isDefined));
      }
      this._layoutMode.value = layout2;
      this._ctxUsesColumnLayout.set(layout2.kind);
      this._ctxShowBase.set(layout2.showBase);
      this._ctxShowBaseAtTop.set(layout2.showBaseAtTop);
      this._onDidChangeSizeConstraints.fire();
      this._layoutModeObs.set(layout2, tx);
    });
  }
  setGrid(descriptor) {
    let width2 = -1;
    let height = -1;
    if (this._grid.value) {
      width2 = this._grid.value.width;
      height = this._grid.value.height;
    }
    this._grid.value = SerializableGrid.from({
      orientation: 0 /* VERTICAL */,
      size: 100,
      groups: descriptor
    }, {
      styles: { separatorBorder: this.theme.getColor(settingsSashBorder) ?? Color.transparent },
      proportionalLayout: true
    });
    reset(this.rootHtmlElement, this._grid.value.element);
    if (width2 !== -1) {
      this._grid.value.layout(width2, height);
    }
  }
  _applyViewState(state) {
    if (!state) {
      return;
    }
    this.inputResultView.editor.restoreViewState(state);
    if (state.input1State) {
      this.input1View.editor.restoreViewState(state.input1State);
    }
    if (state.input2State) {
      this.input2View.editor.restoreViewState(state.input2State);
    }
    if (state.focusIndex >= 0) {
      [this.input1View.editor, this.input2View.editor, this.inputResultView.editor][state.focusIndex].focus();
    }
  }
  computeEditorViewState(resource) {
    if (!isEqual2(this.inputModel.get()?.resultUri, resource)) {
      return void 0;
    }
    const result = this.inputResultView.editor.saveViewState();
    if (!result) {
      return void 0;
    }
    const input1State = this.input1View.editor.saveViewState() ?? void 0;
    const input2State = this.input2View.editor.saveViewState() ?? void 0;
    const focusIndex = [this.input1View.editor, this.input2View.editor, this.inputResultView.editor].findIndex((editor) => editor.hasWidgetFocus());
    return { ...result, input1State, input2State, focusIndex };
  }
  tracksEditorViewState(input) {
    return input instanceof MergeEditorInput;
  }
  toggleShowNonConflictingChanges() {
    this.showNonConflictingChanges.set(!this.showNonConflictingChanges.get(), void 0);
    this.showNonConflictingChangesStore.set(this.showNonConflictingChanges.get());
    this._ctxShowNonConflictingChanges.set(this.showNonConflictingChanges.get());
  }
};

MergeEditor = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, ITextResourceConfigurationService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IEditorGroupsService),
  __decorateParam(9, IFileService),
  __decorateParam(10, ICodeEditorService)
], MergeEditor);

var MergeEditorLayoutStore = class {
  constructor(_storageService) {
    this._storageService = _storageService;
    this._value = { kind: "mixed", showBase: false, showBaseAtTop: true };
    const value2 = _storageService.get(MergeEditorLayoutStore._key, 0 /* PROFILE */, "mixed");
    if (value2 === "mixed" || value2 === "columns") {
      this._value = { kind: value2, showBase: false, showBaseAtTop: true };
    } else if (value2) {
      try {
        this._value = JSON.parse(value2);
      } catch (e4) {
        onUnexpectedError(e4);
      }
    }
  }
  static {
    this._key = "mergeEditor/layout";
  }
  get value() {
    return this._value;
  }
  set value(value2) {
    if (this._value !== value2) {
      this._value = value2;
      this._storageService.store(MergeEditorLayoutStore._key, JSON.stringify(this._value), 0 /* PROFILE */, 0 /* USER */);
    }
  }
};

MergeEditorLayoutStore = __decorateClass([
  __decorateParam(0, IStorageService)
], MergeEditorLayoutStore);

var MergeEditorOpenHandlerContribution = class extends Disposable {
  constructor(_editorService, codeEditorService) {
    super();
    this._editorService = _editorService;
    this._store.add(codeEditorService.registerCodeEditorOpenHandler(this.openCodeEditorFromMergeEditor.bind(this)));
  }
  async openCodeEditorFromMergeEditor(input, _source, sideBySide) {
    const activePane = this._editorService.activeEditorPane;
    if (!sideBySide && input.options && activePane instanceof MergeEditor && activePane.getControl() && activePane.input instanceof MergeEditorInput && isEqual2(input.resource, activePane.input.result)) {
      const targetEditor = activePane.getControl();
      applyTextEditorOptions(input.options, targetEditor, 0 /* Smooth */);
      return targetEditor;
    }
    return null;
  }
};

MergeEditorOpenHandlerContribution = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, ICodeEditorService)
], MergeEditorOpenHandlerContribution);

var MergeEditorResolverContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.mergeEditorResolver";
  }
  constructor(editorResolverService, instantiationService) {
    super();
    const mergeEditorInputFactory = (mergeEditor) => {
      return {
        editor: instantiationService.createInstance(
          MergeEditorInput,
          mergeEditor.base.resource,
          {
            uri: mergeEditor.input1.resource,
            title: mergeEditor.input1.label ?? basename2(mergeEditor.input1.resource),
            description: mergeEditor.input1.description ?? "",
            detail: mergeEditor.input1.detail
          },
          {
            uri: mergeEditor.input2.resource,
            title: mergeEditor.input2.label ?? basename2(mergeEditor.input2.resource),
            description: mergeEditor.input2.description ?? "",
            detail: mergeEditor.input2.detail
          },
          mergeEditor.result.resource
        )
      };
    };
    this._register(editorResolverService.registerEditor(
      `*`,
      {
        id: DEFAULT_EDITOR_ASSOCIATION.id,
        label: DEFAULT_EDITOR_ASSOCIATION.displayName,
        detail: DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
        priority: "builtin" /* builtin */
      },
      {},
      {
        createMergeEditorInput: mergeEditorInputFactory
      }
    ));
  }
};

MergeEditorResolverContribution = __decorateClass([
  __decorateParam(0, IEditorResolverService),
  __decorateParam(1, IInstantiationService)
], MergeEditorResolverContribution);
export { MergeEditor, MergeEditorLayoutStore, MergeEditorOpenHandlerContribution, MergeEditorResolverContribution };
