// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/diffEditorWidget.ts
import { DelegatingEditor } from "./module-0498.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { getWindow, h } from "./module-0075.mjs";
import { disposableObservableValue, observableValue } from "./module-0048.mjs";
import { derived, derivedDisposable } from "./module-0054.mjs";
import { Event2 } from "./module-0017.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ObservableElementSizeObserver, RefCounted, applyStyle, applyViewZones, translatePosition } from "./module-0478.mjs";
import { DiffEditorOptions } from "./module-0500.mjs";
import { autorun, autorunWithStore } from "./module-0052.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { bindContextKey } from "./module-0444.mjs";
import { DiffEditorEditors } from "./module-0495.mjs";
import { readHotReloadableExport } from "./module-0443.mjs";
import { OverviewRulerFeature } from "./module-0494.mjs";
import { DiffEditorSash, SashLayout } from "./module-0497.mjs";
import { HideUnchangedRegionsFeature } from "./module-0525.mjs";
import { DiffEditorDecorations } from "./module-0491.mjs";
import { DiffEditorViewZones } from "./module-0489.mjs";
import { StableEditorScrollState } from "./module-0447.mjs";
import { AccessibleDiffViewer, AccessibleDiffViewerModelFromEditors } from "./module-0480.mjs";
import { DiffEditorGutter } from "./module-0524.mjs";
import { recomputeInitiallyAndOnChange } from "./module-0059.mjs";
import { MovedBlocksLinesFeature } from "./module-0490.mjs";
import { RevertButtonsFeature } from "./module-0526.mjs";
import { BugIndicatingError, onUnexpectedError } from "./module-0004.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { EditorType } from "./module-0153.mjs";
import { DiffEditorViewModel } from "./module-0483.mjs";
import { subtransaction, transaction } from "./module-0045.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { LineRange } from "./module-0174.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { findLast } from "./module-0006.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IEditorProgressService } from "./module-0446.mjs";


// src/vs/editor/browser/widget/diffEditor/diffEditorWidget.ts
var DiffEditorWidget = class extends DelegatingEditor {
  constructor(_domElement, options3, codeEditorWidgetOptions, _parentContextKeyService, _parentInstantiationService, _codeEditorService, _accessibilitySignalService, _editorProgressService) {
    super();
    this._domElement = _domElement;
    this._parentContextKeyService = _parentContextKeyService;
    this._parentInstantiationService = _parentInstantiationService;
    this._codeEditorService = _codeEditorService;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._editorProgressService = _editorProgressService;
    this._deferredDiffModelRefDisposals = this._register(new DisposableStore());
    this.elements = h("div.monaco-diff-editor.side-by-side", { style: { position: "relative", height: "100%" } }, [
      h("div.editor.original@original", { style: { position: "absolute", height: "100%" } }),
      h("div.editor.modified@modified", { style: { position: "absolute", height: "100%" } }),
      h("div.accessibleDiffViewer@accessibleDiffViewer", { style: { position: "absolute", height: "100%" } })
    ]);
    this._diffModelSrc = this._register(disposableObservableValue(this, void 0));
    this._diffModel = derived(this, (reader) => this._diffModelSrc.read(reader)?.object);
    this.allUnchangedRegionsShown = derived(this, (reader) => {
      const regions = this._diffModel.read(reader)?.unchangedRegions.read(reader) ?? [];
      return regions.every((r2) => r2.visibleLineCountTop.read(reader) + r2.visibleLineCountBottom.read(reader) >= r2.lineCount);
    });
    this.onDidChangeModel = Event2.fromObservableLight(this._diffModel);
    this._contextKeyService = this._register(this._parentContextKeyService.createScoped(this._domElement));
    this._instantiationService = this._register(this._parentInstantiationService.createChild(
      new ServiceCollection([IContextKeyService, this._contextKeyService])
    ));
    this._boundarySashes = observableValue(this, void 0);
    this._accessibleDiffViewerShouldBeVisible = observableValue(this, false);
    this._accessibleDiffViewerVisible = derived(
      this,
      (reader) => this._options.onlyShowAccessibleDiffViewer.read(reader) ? true : this._accessibleDiffViewerShouldBeVisible.read(reader)
    );
    this._movedBlocksLinesPart = observableValue(this, void 0);
    this._layoutInfo = derived(this, (reader) => {
      const fullWidth = this._rootSizeObserver.width.read(reader);
      const fullHeight = this._rootSizeObserver.height.read(reader);
      if (this._rootSizeObserver.automaticLayout) {
        this.elements.root.style.height = "100%";
      } else {
        this.elements.root.style.height = fullHeight + "px";
      }
      const sash = this._sash.read(reader);
      const gutter = this._gutter.read(reader);
      const gutterWidth = gutter?.width.read(reader) ?? 0;
      const overviewRulerPartWidth = this._overviewRulerPart.read(reader)?.width ?? 0;
      let originalLeft, originalWidth, modifiedLeft, modifiedWidth, gutterLeft;
      const sideBySide = !!sash;
      if (sideBySide) {
        const sashLeft = sash.sashLeft.read(reader);
        const movedBlocksLinesWidth = this._movedBlocksLinesPart.read(reader)?.width.read(reader) ?? 0;
        originalLeft = 0;
        originalWidth = sashLeft - gutterWidth - movedBlocksLinesWidth;
        gutterLeft = sashLeft - gutterWidth;
        modifiedLeft = sashLeft;
        modifiedWidth = fullWidth - modifiedLeft - overviewRulerPartWidth;
      } else {
        gutterLeft = 0;
        const shouldHideOriginalLineNumbers = this._options.inlineViewHideOriginalLineNumbers.read(reader);
        originalLeft = gutterWidth;
        if (shouldHideOriginalLineNumbers) {
          originalWidth = 0;
        } else {
          originalWidth = Math.max(5, this._editors.originalObs.layoutInfoDecorationsLeft.read(reader));
        }
        modifiedLeft = gutterWidth + originalWidth;
        modifiedWidth = fullWidth - modifiedLeft - overviewRulerPartWidth;
      }
      this.elements.original.style.left = originalLeft + "px";
      this.elements.original.style.width = originalWidth + "px";
      this._editors.original.layout({ width: originalWidth, height: fullHeight }, true);
      gutter?.layout(gutterLeft);
      this.elements.modified.style.left = modifiedLeft + "px";
      this.elements.modified.style.width = modifiedWidth + "px";
      this._editors.modified.layout({ width: modifiedWidth, height: fullHeight }, true);
      return {
        modifiedEditor: this._editors.modified.getLayoutInfo(),
        originalEditor: this._editors.original.getLayoutInfo()
      };
    });
    this._diffValue = this._diffModel.map((m, r2) => m?.diff.read(r2));
    this.onDidUpdateDiff = Event2.fromObservableLight(this._diffValue);
    this._codeEditorService.willCreateDiffEditor();
    this._contextKeyService.createKey("isInDiffEditor", true);
    this._domElement.appendChild(this.elements.root);
    this._register(toDisposable(() => this.elements.root.remove()));
    this._rootSizeObserver = this._register(new ObservableElementSizeObserver(this.elements.root, options3.dimension));
    this._rootSizeObserver.setAutomaticLayout(options3.automaticLayout ?? false);
    this._options = this._instantiationService.createInstance(DiffEditorOptions, options3);
    this._register(autorun((reader) => {
      this._options.setWidth(this._rootSizeObserver.width.read(reader));
    }));
    this._contextKeyService.createKey(EditorContextKeys.isEmbeddedDiffEditor.key, false);
    this._register(bindContextKey(
      EditorContextKeys.isEmbeddedDiffEditor,
      this._contextKeyService,
      (reader) => this._options.isInEmbeddedEditor.read(reader)
    ));
    this._register(bindContextKey(
      EditorContextKeys.comparingMovedCode,
      this._contextKeyService,
      (reader) => !!this._diffModel.read(reader)?.movedTextToCompare.read(reader)
    ));
    this._register(bindContextKey(
      EditorContextKeys.diffEditorRenderSideBySideInlineBreakpointReached,
      this._contextKeyService,
      (reader) => this._options.couldShowInlineViewBecauseOfSize.read(reader)
    ));
    this._register(bindContextKey(
      EditorContextKeys.diffEditorInlineMode,
      this._contextKeyService,
      (reader) => !this._options.renderSideBySide.read(reader)
    ));
    this._register(bindContextKey(
      EditorContextKeys.hasChanges,
      this._contextKeyService,
      (reader) => (this._diffModel.read(reader)?.diff.read(reader)?.mappings.length ?? 0) > 0
    ));
    this._editors = this._register(this._instantiationService.createInstance(
      DiffEditorEditors,
      this.elements.original,
      this.elements.modified,
      this._options,
      codeEditorWidgetOptions,
      (i2, c, o, o2) => this._createInnerEditor(i2, c, o, o2)
    ));
    this._register(bindContextKey(
      EditorContextKeys.diffEditorOriginalWritable,
      this._contextKeyService,
      (reader) => this._options.originalEditable.read(reader)
    ));
    this._register(bindContextKey(
      EditorContextKeys.diffEditorModifiedWritable,
      this._contextKeyService,
      (reader) => !this._options.readOnly.read(reader)
    ));
    this._register(bindContextKey(
      EditorContextKeys.diffEditorOriginalUri,
      this._contextKeyService,
      (reader) => this._diffModel.read(reader)?.model.original.uri.toString() ?? ""
    ));
    this._register(bindContextKey(
      EditorContextKeys.diffEditorModifiedUri,
      this._contextKeyService,
      (reader) => this._diffModel.read(reader)?.model.modified.uri.toString() ?? ""
    ));
    this._overviewRulerPart = derivedDisposable(
      this,
      (reader) => !this._options.renderOverviewRuler.read(reader) ? void 0 : this._instantiationService.createInstance(
        readHotReloadableExport(OverviewRulerFeature, reader),
        this._editors,
        this.elements.root,
        this._diffModel,
        this._rootSizeObserver.width,
        this._rootSizeObserver.height,
        this._layoutInfo.map((i2) => i2.modifiedEditor)
      )
    ).recomputeInitiallyAndOnChange(this._store);
    const dimensions = {
      height: this._rootSizeObserver.height,
      width: this._rootSizeObserver.width.map((w, reader) => w - (this._overviewRulerPart.read(reader)?.width ?? 0))
    };
    this._sashLayout = new SashLayout(this._options, dimensions);
    this._sash = derivedDisposable(this, (reader) => {
      const showSash = this._options.renderSideBySide.read(reader);
      this.elements.root.classList.toggle("side-by-side", showSash);
      return !showSash ? void 0 : new DiffEditorSash(
        this.elements.root,
        dimensions,
        this._options.enableSplitViewResizing,
        this._boundarySashes,
        this._sashLayout.sashLeft,
        () => this._sashLayout.resetSash()
      );
    }).recomputeInitiallyAndOnChange(this._store);
    const unchangedRangesFeature = derivedDisposable(
      this,
      (reader) => (
        /** @description UnchangedRangesFeature */
        this._instantiationService.createInstance(
          readHotReloadableExport(HideUnchangedRegionsFeature, reader),
          this._editors,
          this._diffModel,
          this._options,
          codeEditorWidgetOptions.runWithOriginalEditorScrollAnchor,
          codeEditorWidgetOptions.runWithModifiedEditorScrollAnchor
        )
      )
    ).recomputeInitiallyAndOnChange(this._store);
    derivedDisposable(
      this,
      (reader) => (
        /** @description DiffEditorDecorations */
        this._instantiationService.createInstance(
          readHotReloadableExport(DiffEditorDecorations, reader),
          this._editors,
          this._diffModel,
          this._options,
          this
        )
      )
    ).recomputeInitiallyAndOnChange(this._store);
    const origViewZoneIdsToIgnore = /* @__PURE__ */ new Set();
    const modViewZoneIdsToIgnore = /* @__PURE__ */ new Set();
    let isUpdatingViewZones = false;
    const viewZoneManager = derivedDisposable(
      this,
      (reader) => (
        /** @description ViewZoneManager */
        this._instantiationService.createInstance(
          readHotReloadableExport(DiffEditorViewZones, reader),
          getWindow(this._domElement),
          this._editors,
          this._diffModel,
          this._options,
          this,
          () => isUpdatingViewZones || unchangedRangesFeature.read(void 0).isUpdatingHiddenAreas,
          origViewZoneIdsToIgnore,
          modViewZoneIdsToIgnore
        )
      )
    ).recomputeInitiallyAndOnChange(this._store);
    const originalViewZones = derived(this, (reader) => {
      const orig = viewZoneManager.read(reader).viewZones.read(reader).orig;
      const orig2 = unchangedRangesFeature.read(reader).viewZones.read(reader).origViewZones;
      return orig.concat(orig2);
    });
    const modifiedViewZones = derived(this, (reader) => {
      const mod = viewZoneManager.read(reader).viewZones.read(reader).mod;
      const mod2 = unchangedRangesFeature.read(reader).viewZones.read(reader).modViewZones;
      return mod.concat(mod2);
    });
    this._register(applyViewZones(this._editors.original, originalViewZones, (isUpdatingOrigViewZones) => {
      isUpdatingViewZones = isUpdatingOrigViewZones;
    }, origViewZoneIdsToIgnore));
    let scrollState;
    this._register(applyViewZones(this._editors.modified, modifiedViewZones, (isUpdatingModViewZones) => {
      isUpdatingViewZones = isUpdatingModViewZones;
      if (isUpdatingViewZones) {
        scrollState = StableEditorScrollState.capture(this._editors.modified);
      } else {
        scrollState?.restore(this._editors.modified);
        scrollState = void 0;
      }
    }, modViewZoneIdsToIgnore));
    this._accessibleDiffViewer = derivedDisposable(
      this,
      (reader) => this._instantiationService.createInstance(
        readHotReloadableExport(AccessibleDiffViewer, reader),
        this.elements.accessibleDiffViewer,
        this._accessibleDiffViewerVisible,
        (visible, tx) => this._accessibleDiffViewerShouldBeVisible.set(visible, tx),
        this._options.onlyShowAccessibleDiffViewer.map((v2) => !v2),
        this._rootSizeObserver.width,
        this._rootSizeObserver.height,
        this._diffModel.map((m, r2) => m?.diff.read(r2)?.mappings.map((m2) => m2.lineRangeMapping)),
        new AccessibleDiffViewerModelFromEditors(this._editors)
      )
    ).recomputeInitiallyAndOnChange(this._store);
    const visibility = this._accessibleDiffViewerVisible.map((v2) => v2 ? "hidden" : "visible");
    this._register(applyStyle(this.elements.modified, { visibility }));
    this._register(applyStyle(this.elements.original, { visibility }));
    this._createDiffEditorContributions();
    this._codeEditorService.addDiffEditor(this);
    this._register(toDisposable(() => {
      this._codeEditorService.removeDiffEditor(this);
    }));
    this._gutter = derivedDisposable(this, (reader) => {
      return this._options.shouldRenderGutterMenu.read(reader) ? this._instantiationService.createInstance(
        readHotReloadableExport(DiffEditorGutter, reader),
        this.elements.root,
        this._diffModel,
        this._editors,
        this._options,
        this._sashLayout,
        this._boundarySashes
      ) : void 0;
    });
    this._register(recomputeInitiallyAndOnChange(this._layoutInfo));
    derivedDisposable(
      this,
      (reader) => (
        /** @description MovedBlocksLinesPart */
        new (readHotReloadableExport(MovedBlocksLinesFeature, reader))(
          this.elements.root,
          this._diffModel,
          this._layoutInfo.map((i2) => i2.originalEditor),
          this._layoutInfo.map((i2) => i2.modifiedEditor),
          this._editors
        )
      )
    ).recomputeInitiallyAndOnChange(this._store, (value2) => {
      this._movedBlocksLinesPart.set(value2, void 0);
    });
    this._register(Event2.runAndSubscribe(this._editors.modified.onDidChangeCursorPosition, (e) => this._handleCursorPositionChange(e, true)));
    this._register(Event2.runAndSubscribe(this._editors.original.onDidChangeCursorPosition, (e) => this._handleCursorPositionChange(e, false)));
    const isInitializingDiff = this._diffModel.map(this, (m, reader) => {
      if (!m) {
        return void 0;
      }
      return m.diff.read(reader) === void 0 && !m.isDiffUpToDate.read(reader);
    });
    this._register(autorunWithStore((reader, store) => {
      if (isInitializingDiff.read(reader) === true) {
        const r2 = this._editorProgressService.show(true, 1e3);
        store.add(toDisposable(() => r2.done()));
      }
    }));
    this._register(autorunWithStore((reader, store) => {
      store.add(new (readHotReloadableExport(RevertButtonsFeature, reader))(this._editors, this._diffModel, this._options, this));
    }));
    this._register(autorunWithStore((reader, store) => {
      const model = this._diffModel.read(reader);
      if (!model) {
        return;
      }
      for (const m of [model.model.original, model.model.modified]) {
        store.add(m.onWillDispose((e) => {
          onUnexpectedError(new BugIndicatingError("TextModel got disposed before DiffEditorWidget model got reset"));
          this.setModel(null);
        }));
      }
    }));
    this._register(autorun((reader) => {
      this._options.setModel(this._diffModel.read(reader));
    }));
  }
  static {
    this.ENTIRE_DIFF_OVERVIEW_WIDTH = OverviewRulerFeature.ENTIRE_DIFF_OVERVIEW_WIDTH;
  }
  get onDidContentSizeChange() {
    return this._editors.onDidContentSizeChange;
  }
  get collapseUnchangedRegions() {
    return this._options.hideUnchangedRegions.get();
  }
  getViewWidth() {
    return this._rootSizeObserver.width.get();
  }
  getContentHeight() {
    return this._editors.getContentHeight();
  }
  _createInnerEditor(instantiationService, container3, options3, editorWidgetOptions) {
    const editor = instantiationService.createInstance(CodeEditorWidget, container3, options3, editorWidgetOptions);
    return editor;
  }
  _createDiffEditorContributions() {
    const contributions = EditorExtensionsRegistry.getDiffEditorContributions();
    for (const desc of contributions) {
      try {
        this._register(this._instantiationService.createInstance(desc.ctor, this));
      } catch (err) {
        onUnexpectedError(err);
      }
    }
  }
  get _targetEditor() {
    return this._editors.modified;
  }
  getEditorType() {
    return EditorType.IDiffEditor;
  }
  onVisible() {
    this._editors.original.onVisible();
    this._editors.modified.onVisible();
  }
  onHide() {
    this._editors.original.onHide();
    this._editors.modified.onHide();
  }
  layout(dimension) {
    this._rootSizeObserver.observe(dimension);
  }
  hasTextFocus() {
    return this._editors.original.hasTextFocus() || this._editors.modified.hasTextFocus();
  }
  saveViewState() {
    const originalViewState = this._editors.original.saveViewState();
    const modifiedViewState = this._editors.modified.saveViewState();
    return {
      original: originalViewState,
      modified: modifiedViewState,
      modelState: this._diffModel.get()?.serializeState()
    };
  }
  restoreViewState(s) {
    if (s && s.original && s.modified) {
      const diffEditorState = s;
      this._editors.original.restoreViewState(diffEditorState.original);
      this._editors.modified.restoreViewState(diffEditorState.modified);
      if (diffEditorState.modelState) {
        this._diffModel.get()?.restoreSerializedState(diffEditorState.modelState);
      }
    }
  }
  handleInitialized() {
    this._editors.original.handleInitialized();
    this._editors.modified.handleInitialized();
  }
  createViewModel(model) {
    return this._instantiationService.createInstance(DiffEditorViewModel, model, this._options);
  }
  getModel() {
    return this._diffModel.get()?.model ?? null;
  }
  setModel(model) {
    const vm = !model ? null : "model" in model ? RefCounted.create(model).createNewRef(this) : RefCounted.create(this.createViewModel(model), this);
    this.setDiffModel(vm);
  }
  setDiffModel(viewModel, tx) {
    const currentModel = this._diffModel.get();
    if (!viewModel && currentModel) {
      this._accessibleDiffViewer.get().close();
    }
    if (this._diffModel.get() !== viewModel?.object) {
      subtransaction(tx, (tx2) => {
        const vm = viewModel?.object;
        observableFromEvent.batchEventsGlobally(tx2, () => {
          this._editors.original.setModel(vm ? vm.model.original : null);
          this._editors.modified.setModel(vm ? vm.model.modified : null);
        });
        const prevValueRef = this._diffModelSrc.get()?.createNewRef(this);
        this._diffModelSrc.set(viewModel?.createNewRef(this), tx2);
        if (prevValueRef) {
          this._deferredDiffModelRefDisposals.add(prevValueRef);
          setTimeout(() => {
            this._deferredDiffModelRefDisposals.delete(prevValueRef);
          }, 0);
        }
      });
    }
  }
  /**
   * @param changedOptions Only has values for top-level options that have actually changed.
   */
  updateOptions(changedOptions) {
    this._options.updateOptions(changedOptions);
  }
  getDomNode() {
    return this.elements.root;
  }
  getContainerDomNode() {
    return this._domElement;
  }
  getOriginalEditor() {
    return this._editors.original;
  }
  getModifiedEditor() {
    return this._editors.modified;
  }
  setBoundarySashes(sashes) {
    this._boundarySashes.set(sashes, void 0);
  }
  get ignoreTrimWhitespace() {
    return this._options.ignoreTrimWhitespace.get();
  }
  get maxComputationTime() {
    return this._options.maxComputationTimeMs.get();
  }
  get renderSideBySide() {
    return this._options.renderSideBySide.get();
  }
  /**
   * @deprecated Use `this.getDiffComputationResult().changes2` instead.
   */
  getLineChanges() {
    const diffState = this._diffModel.get()?.diff.get();
    if (!diffState) {
      return null;
    }
    return toLineChanges(diffState);
  }
  getDiffComputationResult() {
    const diffState = this._diffModel.get()?.diff.get();
    if (!diffState) {
      return null;
    }
    return {
      changes: this.getLineChanges(),
      changes2: diffState.mappings.map((m) => m.lineRangeMapping),
      identical: diffState.identical,
      quitEarly: diffState.quitEarly
    };
  }
  revert(diff4) {
    const model = this._diffModel.get();
    if (!model || !model.isDiffUpToDate.get()) {
      return;
    }
    this._editors.modified.pushUndoStop();
    this._editors.modified.executeEdits("diffEditor", [
      {
        range: diff4.modified.toExclusiveRange(),
        text: model.model.original.getValueInRange(diff4.original.toExclusiveRange())
      }
    ]);
    this._editors.modified.pushUndoStop();
  }
  revertRangeMappings(diffs) {
    const model = this._diffModel.get();
    if (!model || !model.isDiffUpToDate.get()) {
      return;
    }
    const changes = diffs.map((c) => ({
      range: c.modifiedRange,
      text: model.model.original.getValueInRange(c.originalRange)
    }));
    this._editors.modified.pushUndoStop();
    this._editors.modified.executeEdits("diffEditor", changes);
    this._editors.modified.pushUndoStop();
  }
  revertFocusedRangeMappings() {
    const model = this._diffModel.get();
    if (!model || !model.isDiffUpToDate.get()) {
      return;
    }
    const diffs = this._diffModel.get()?.diff.get()?.mappings;
    if (!diffs || diffs.length === 0) {
      return;
    }
    const modifiedEditor = this._editors.modified;
    if (!modifiedEditor.hasTextFocus()) {
      return;
    }
    const curLineNumber = modifiedEditor.getPosition().lineNumber;
    const selection = modifiedEditor.getSelection();
    const selectedRange = LineRange.fromRange(selection || new Range2(curLineNumber, 0, curLineNumber, 0));
    const diffsToRevert = diffs.filter((d) => {
      return d.lineRangeMapping.modified.intersect(selectedRange);
    });
    modifiedEditor.pushUndoStop();
    modifiedEditor.executeEdits("diffEditor", diffsToRevert.map((d) => ({
      range: d.lineRangeMapping.modified.toExclusiveRange(),
      text: model.model.original.getValueInRange(d.lineRangeMapping.original.toExclusiveRange())
    })));
    modifiedEditor.pushUndoStop();
  }
  _goTo(diff4) {
    this._editors.modified.setPosition(new Position(diff4.lineRangeMapping.modified.startLineNumber, 1));
    this._editors.modified.revealRangeInCenter(diff4.lineRangeMapping.modified.toExclusiveRange());
  }
  goToDiff(target) {
    const diffs = this._diffModel.get()?.diff.get()?.mappings;
    if (!diffs || diffs.length === 0) {
      return;
    }
    const curLineNumber = this._editors.modified.getPosition().lineNumber;
    let diff4;
    if (target === "next") {
      const modifiedLineCount = this._editors.modified.getModel().getLineCount();
      if (modifiedLineCount === curLineNumber) {
        diff4 = diffs[0];
      } else {
        diff4 = diffs.find((d) => d.lineRangeMapping.modified.startLineNumber > curLineNumber) ?? diffs[0];
      }
    } else {
      diff4 = findLast(diffs, (d) => d.lineRangeMapping.modified.startLineNumber < curLineNumber) ?? diffs[diffs.length - 1];
    }
    this._goTo(diff4);
    if (diff4.lineRangeMapping.modified.isEmpty) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.diffLineDeleted, { source: "diffEditor.goToDiff" });
    } else if (diff4.lineRangeMapping.original.isEmpty) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.diffLineInserted, { source: "diffEditor.goToDiff" });
    } else if (diff4) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.diffLineModified, { source: "diffEditor.goToDiff" });
    }
  }
  revealFirstDiff() {
    const diffModel = this._diffModel.get();
    if (!diffModel) {
      return;
    }
    this.waitForDiff().then(() => {
      const diffs = diffModel.diff.get()?.mappings;
      if (!diffs || diffs.length === 0) {
        return;
      }
      this._goTo(diffs[0]);
    });
  }
  accessibleDiffViewerNext() {
    this._accessibleDiffViewer.get().next();
  }
  accessibleDiffViewerPrev() {
    this._accessibleDiffViewer.get().prev();
  }
  async waitForDiff() {
    const diffModel = this._diffModel.get();
    if (!diffModel) {
      return;
    }
    await diffModel.waitForDiff();
  }
  mapToOtherSide() {
    const isModifiedFocus = this._editors.modified.hasWidgetFocus();
    const source = isModifiedFocus ? this._editors.modified : this._editors.original;
    const destination = isModifiedFocus ? this._editors.original : this._editors.modified;
    let destinationSelection;
    const sourceSelection = source.getSelection();
    if (sourceSelection) {
      const mappings = this._diffModel.get()?.diff.get()?.mappings.map((m) => isModifiedFocus ? m.lineRangeMapping.flip() : m.lineRangeMapping);
      if (mappings) {
        const newRange1 = translatePosition(sourceSelection.getStartPosition(), mappings);
        const newRange2 = translatePosition(sourceSelection.getEndPosition(), mappings);
        destinationSelection = Range2.plusRange(newRange1, newRange2);
      }
    }
    return { destination, destinationSelection };
  }
  switchSide() {
    const { destination, destinationSelection } = this.mapToOtherSide();
    destination.focus();
    if (destinationSelection) {
      destination.setSelection(destinationSelection);
    }
  }
  exitCompareMove() {
    const model = this._diffModel.get();
    if (!model) {
      return;
    }
    model.movedTextToCompare.set(void 0, void 0);
  }
  collapseAllUnchangedRegions() {
    const unchangedRegions = this._diffModel.get()?.unchangedRegions.get();
    if (!unchangedRegions) {
      return;
    }
    transaction((tx) => {
      for (const region of unchangedRegions) {
        region.collapseAll(tx);
      }
    });
  }
  showAllUnchangedRegions() {
    const unchangedRegions = this._diffModel.get()?.unchangedRegions.get();
    if (!unchangedRegions) {
      return;
    }
    transaction((tx) => {
      for (const region of unchangedRegions) {
        region.showAll(tx);
      }
    });
  }
  _handleCursorPositionChange(e, isModifiedEditor) {
    if (e?.reason === 3 /* Explicit */) {
      const diff4 = this._diffModel.get()?.diff.get()?.mappings.find((m) => isModifiedEditor ? m.lineRangeMapping.modified.contains(e.position.lineNumber) : m.lineRangeMapping.original.contains(e.position.lineNumber));
      if (diff4?.lineRangeMapping.modified.isEmpty) {
        this._accessibilitySignalService.playSignal(AccessibilitySignal.diffLineDeleted, { source: "diffEditor.cursorPositionChanged" });
      } else if (diff4?.lineRangeMapping.original.isEmpty) {
        this._accessibilitySignalService.playSignal(AccessibilitySignal.diffLineInserted, { source: "diffEditor.cursorPositionChanged" });
      } else if (diff4) {
        this._accessibilitySignalService.playSignal(AccessibilitySignal.diffLineModified, { source: "diffEditor.cursorPositionChanged" });
      }
    }
  }
};

DiffEditorWidget = __decorateClass([
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ICodeEditorService),
  __decorateParam(6, IAccessibilitySignalService),
  __decorateParam(7, IEditorProgressService)
], DiffEditorWidget);

function toLineChanges(state) {
  return state.mappings.map((x) => {
    const m = x.lineRangeMapping;
    let originalStartLineNumber;
    let originalEndLineNumber;
    let modifiedStartLineNumber;
    let modifiedEndLineNumber;
    let innerChanges = m.innerChanges;
    if (m.original.isEmpty) {
      originalStartLineNumber = m.original.startLineNumber - 1;
      originalEndLineNumber = 0;
      innerChanges = void 0;
    } else {
      originalStartLineNumber = m.original.startLineNumber;
      originalEndLineNumber = m.original.endLineNumberExclusive - 1;
    }
    if (m.modified.isEmpty) {
      modifiedStartLineNumber = m.modified.startLineNumber - 1;
      modifiedEndLineNumber = 0;
      innerChanges = void 0;
    } else {
      modifiedStartLineNumber = m.modified.startLineNumber;
      modifiedEndLineNumber = m.modified.endLineNumberExclusive - 1;
    }
    return {
      originalStartLineNumber,
      originalEndLineNumber,
      modifiedStartLineNumber,
      modifiedEndLineNumber,
      charChanges: innerChanges?.map((m2) => ({
        originalStartLineNumber: m2.originalRange.startLineNumber,
        originalStartColumn: m2.originalRange.startColumn,
        originalEndLineNumber: m2.originalRange.endLineNumber,
        originalEndColumn: m2.originalRange.endColumn,
        modifiedStartLineNumber: m2.modifiedRange.startLineNumber,
        modifiedStartColumn: m2.modifiedRange.startColumn,
        modifiedEndLineNumber: m2.modifiedRange.endLineNumber,
        modifiedEndColumn: m2.modifiedRange.endColumn
      }))
    };
  });
}
export { toLineChanges, DiffEditorWidget };
