// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsOutline.ts
import { IOutlineModelService, OutlineElement, OutlineGroup, OutlineModel, TreeElement2 } from "./module-0691.mjs";
import { DocumentSymbolAccessibilityProvider, DocumentSymbolComparator, DocumentSymbolDragAndDrop, DocumentSymbolFilter, DocumentSymbolGroupRenderer, DocumentSymbolIdentityProvider, DocumentSymbolNavigationLabelProvider, DocumentSymbolRenderer, DocumentSymbolVirtualDelegate } from "./module-3337.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { Barrier, TimeoutTimer, raceCancellation, timeout } from "./module-0036.mjs";
import { Range2 } from "./module-0106.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IMarkerDecorationsService } from "./module-0209.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { isCodeEditor, isDiffEditor } from "./module-0223.mjs";
import { IOutlineService } from "./module-0972.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsOutline.ts
var DocumentSymbolBreadcrumbsSource = class {
  constructor(_editor, _textResourceConfigurationService) {
    this._editor = _editor;
    this._textResourceConfigurationService = _textResourceConfigurationService;
    this._breadcrumbs = [];
  }
  getBreadcrumbElements() {
    return this._breadcrumbs;
  }
  clear() {
    this._breadcrumbs = [];
  }
  update(model, position2) {
    const newElements = this._computeBreadcrumbs(model, position2);
    this._breadcrumbs = newElements.map((element) => ({
      element,
      label: element instanceof OutlineElement ? element.symbol.name : ""
    }));
  }
  _computeBreadcrumbs(model, position2) {
    let item = model.getItemEnclosingPosition(position2);
    if (!item) {
      return [];
    }
    const chain = [];
    while (item) {
      chain.push(item);
      const parent = item.parent;
      if (parent instanceof OutlineModel) {
        break;
      }
      if (parent instanceof OutlineGroup && parent.parent && parent.parent.children.size === 1) {
        break;
      }
      item = parent;
    }
    const result = [];
    for (let i2 = chain.length - 1; i2 >= 0; i2--) {
      const element = chain[i2];
      if (this._isFiltered(element)) {
        break;
      }
      result.push(element);
    }
    if (result.length === 0) {
      return [];
    }
    return result;
  }
  _isFiltered(element) {
    if (!(element instanceof OutlineElement)) {
      return false;
    }
    const key3 = `breadcrumbs.${DocumentSymbolFilter.kindToConfigName[element.symbol.kind]}`;
    let uri4;
    if (this._editor && this._editor.getModel()) {
      const model = this._editor.getModel();
      uri4 = model.uri;
    }
    return !this._textResourceConfigurationService.getValue(uri4, key3);
  }
};

DocumentSymbolBreadcrumbsSource = __decorateClass([
  __decorateParam(1, ITextResourceConfigurationService)
], DocumentSymbolBreadcrumbsSource);

var DocumentSymbolsOutline = class {
  constructor(_editor, target, firstLoadBarrier, _languageFeaturesService, _codeEditorService, _outlineModelService, _configurationService, _markerDecorationsService, textResourceConfigurationService, instantiationService) {
    this._editor = _editor;
    this._languageFeaturesService = _languageFeaturesService;
    this._codeEditorService = _codeEditorService;
    this._outlineModelService = _outlineModelService;
    this._configurationService = _configurationService;
    this._markerDecorationsService = _markerDecorationsService;
    this._disposables = new DisposableStore();
    this._onDidChange = this._disposables.add(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._outlineDisposables = new DisposableStore();
    this.outlineKind = "documentSymbols";
    this._breadcrumbsDataSource = new DocumentSymbolBreadcrumbsSource(_editor, textResourceConfigurationService);
    const delegate = new DocumentSymbolVirtualDelegate();
    const renderers = [new DocumentSymbolGroupRenderer(), instantiationService.createInstance(DocumentSymbolRenderer, true, target)];
    const treeDataSource = {
      getChildren: (parent) => {
        if (parent instanceof OutlineElement || parent instanceof OutlineGroup) {
          return parent.children.values();
        }
        if (parent === this && this._outlineModel) {
          return this._outlineModel.children.values();
        }
        return [];
      }
    };
    const comparator = new DocumentSymbolComparator();
    const initialState = textResourceConfigurationService.getValue(_editor.getModel()?.uri, "outline.collapseItems" /* collapseItems */);
    const options3 = {
      collapseByDefault: target === 2 /* Breadcrumbs */ || target === 1 /* OutlinePane */ && initialState === "alwaysCollapse" /* Collapsed */,
      expandOnlyOnTwistieClick: true,
      multipleSelectionSupport: false,
      identityProvider: new DocumentSymbolIdentityProvider(),
      keyboardNavigationLabelProvider: new DocumentSymbolNavigationLabelProvider(),
      accessibilityProvider: new DocumentSymbolAccessibilityProvider(localize(13807, null)),
      filter: target === 1 /* OutlinePane */ ? instantiationService.createInstance(DocumentSymbolFilter, "outline") : target === 2 /* Breadcrumbs */ ? instantiationService.createInstance(DocumentSymbolFilter, "breadcrumbs") : void 0,
      dnd: instantiationService.createInstance(DocumentSymbolDragAndDrop)
    };
    this.config = {
      breadcrumbsDataSource: this._breadcrumbsDataSource,
      delegate,
      renderers,
      treeDataSource,
      comparator,
      options: options3,
      quickPickDataSource: { getQuickPickElements: () => {
        throw new Error("not implemented");
      } }
    };
    this._disposables.add(_languageFeaturesService.documentSymbolProvider.onDidChange((_) => this._createOutline()));
    this._disposables.add(this._editor.onDidChangeModel((_) => this._createOutline()));
    this._disposables.add(this._editor.onDidChangeModelLanguage((_) => this._createOutline()));
    const updateSoon = new TimeoutTimer();
    this._disposables.add(updateSoon);
    this._disposables.add(this._editor.onDidChangeModelContent((event) => {
      const model = this._editor.getModel();
      if (model) {
        const timeout2 = _outlineModelService.getDebounceValue(model);
        updateSoon.cancelAndSet(() => this._createOutline(event), timeout2);
      }
    }));
    this._disposables.add(this._editor.onDidDispose(() => this._outlineDisposables.clear()));
    this._createOutline().finally(() => firstLoadBarrier.open());
  }
  get activeElement() {
    const posistion = this._editor.getPosition();
    if (!posistion || !this._outlineModel) {
      return void 0;
    } else {
      return this._outlineModel.getItemEnclosingPosition(posistion);
    }
  }
  dispose() {
    this._disposables.dispose();
    this._outlineDisposables.dispose();
  }
  get isEmpty() {
    return !this._outlineModel || TreeElement2.empty(this._outlineModel);
  }
  get uri() {
    return this._outlineModel?.uri;
  }
  async reveal(entry, options3, sideBySide, select) {
    const model = OutlineModel.get(entry);
    if (!model || !(entry instanceof OutlineElement)) {
      return;
    }
    await this._codeEditorService.openCodeEditor({
      resource: model.uri,
      options: {
        ...options3,
        selection: select ? entry.symbol.range : Range2.collapseToStart(entry.symbol.selectionRange),
        selectionRevealType: 3 /* NearTopIfOutsideViewport */
      }
    }, this._editor, sideBySide);
  }
  preview(entry) {
    if (!(entry instanceof OutlineElement)) {
      return Disposable.None;
    }
    const { symbol } = entry;
    this._editor.revealRangeInCenterIfOutsideViewport(symbol.range, 0 /* Smooth */);
    const decorationsCollection = this._editor.createDecorationsCollection([{
      range: symbol.range,
      options: {
        description: "document-symbols-outline-range-highlight",
        className: "rangeHighlight",
        isWholeLine: true
      }
    }]);
    return toDisposable(() => decorationsCollection.clear());
  }
  captureViewState() {
    const viewState = this._editor.saveViewState();
    return toDisposable(() => {
      if (viewState) {
        this._editor.restoreViewState(viewState);
      }
    });
  }
  async _createOutline(contentChangeEvent) {
    this._outlineDisposables.clear();
    if (!contentChangeEvent) {
      this._setOutlineModel(void 0);
    }
    if (!this._editor.hasModel()) {
      return;
    }
    const buffer = this._editor.getModel();
    if (!this._languageFeaturesService.documentSymbolProvider.has(buffer)) {
      return;
    }
    const cts = new CancellationTokenSource();
    const versionIdThen = buffer.getVersionId();
    const timeoutTimer = new TimeoutTimer();
    this._outlineDisposables.add(timeoutTimer);
    this._outlineDisposables.add(toDisposable(() => cts.dispose(true)));
    try {
      const model = await this._outlineModelService.getOrCreate(buffer, cts.token);
      if (cts.token.isCancellationRequested) {
        return;
      }
      if (TreeElement2.empty(model) || !this._editor.hasModel()) {
        this._setOutlineModel(model);
        return;
      }
      if (contentChangeEvent && this._outlineModel && buffer.getLineCount() >= 25) {
        const newSize = TreeElement2.size(model);
        const newLength = buffer.getValueLength();
        const newRatio = newSize / newLength;
        const oldSize = TreeElement2.size(this._outlineModel);
        const oldLength = newLength - contentChangeEvent.changes.reduce((prev, value2) => prev + value2.rangeLength, 0);
        const oldRatio = oldSize / oldLength;
        if (newRatio <= oldRatio * 0.5 || newRatio >= oldRatio * 1.5) {
          const value2 = await raceCancellation(timeout(2e3).then(() => true), cts.token, false);
          if (!value2) {
            return;
          }
        }
      }
      this._applyMarkersToOutline(model);
      this._outlineDisposables.add(this._markerDecorationsService.onDidChangeMarker((textModel) => {
        if (isEqual2(model.uri, textModel.uri)) {
          this._applyMarkersToOutline(model);
          this._onDidChange.fire({});
        }
      }));
      this._outlineDisposables.add(this._configurationService.onDidChangeConfiguration((e4) => {
        if (e4.affectsConfiguration("outline.problems.enabled" /* problemsEnabled */) || e4.affectsConfiguration("problems.visibility")) {
          const problem = this._configurationService.getValue("problems.visibility");
          const config = this._configurationService.getValue("outline.problems.enabled" /* problemsEnabled */);
          if (!problem || !config) {
            model.updateMarker([]);
          } else {
            this._applyMarkersToOutline(model);
          }
          this._onDidChange.fire({});
        }
        if (e4.affectsConfiguration("outline")) {
          this._onDidChange.fire({});
        }
        if (e4.affectsConfiguration("breadcrumbs") && this._editor.hasModel()) {
          this._breadcrumbsDataSource.update(model, this._editor.getPosition());
          this._onDidChange.fire({});
        }
      }));
      this._outlineDisposables.add(this._configurationService.onDidChangeConfiguration((e4) => {
        if (e4.affectsConfiguration("outline.icons" /* icons */)) {
          this._onDidChange.fire({});
        }
        if (e4.affectsConfiguration("outline")) {
          this._onDidChange.fire({});
        }
      }));
      this._outlineDisposables.add(this._editor.onDidChangeCursorPosition((_) => {
        timeoutTimer.cancelAndSet(() => {
          if (!buffer.isDisposed() && versionIdThen === buffer.getVersionId() && this._editor.hasModel()) {
            this._breadcrumbsDataSource.update(model, this._editor.getPosition());
            this._onDidChange.fire({ affectOnlyActiveElement: true });
          }
        }, 150);
      }));
      this._setOutlineModel(model);
    } catch (err) {
      this._setOutlineModel(void 0);
      onUnexpectedError(err);
    }
  }
  _applyMarkersToOutline(model) {
    const problem = this._configurationService.getValue("problems.visibility");
    const config = this._configurationService.getValue("outline.problems.enabled" /* problemsEnabled */);
    if (!model || !problem || !config) {
      return;
    }
    const markers = [];
    for (const [range2, marker] of this._markerDecorationsService.getLiveMarkers(model.uri)) {
      if (marker.severity === 8 /* Error */ || marker.severity === 4 /* Warning */) {
        markers.push({ ...range2, severity: marker.severity });
      }
    }
    model.updateMarker(markers);
  }
  _setOutlineModel(model) {
    const position2 = this._editor.getPosition();
    if (!position2 || !model) {
      this._outlineModel = void 0;
      this._breadcrumbsDataSource.clear();
    } else {
      if (!this._outlineModel?.merge(model)) {
        this._outlineModel = model;
      }
      this._breadcrumbsDataSource.update(model, position2);
    }
    this._onDidChange.fire({});
  }
};

DocumentSymbolsOutline = __decorateClass([
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, ICodeEditorService),
  __decorateParam(5, IOutlineModelService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IMarkerDecorationsService),
  __decorateParam(8, ITextResourceConfigurationService),
  __decorateParam(9, IInstantiationService)
], DocumentSymbolsOutline);

var DocumentSymbolsOutlineCreator = class {
  constructor(outlineService) {
    const reg2 = outlineService.registerOutlineCreator(this);
    this.dispose = () => reg2.dispose();
  }
  matches(candidate) {
    const ctrl = candidate.getControl();
    return isCodeEditor(ctrl) || isDiffEditor(ctrl);
  }
  async createOutline(pane, target, _token) {
    const control = pane.getControl();
    let editor;
    if (isCodeEditor(control)) {
      editor = control;
    } else if (isDiffEditor(control)) {
      editor = control.getModifiedEditor();
    }
    if (!editor) {
      return void 0;
    }
    const firstLoadBarrier = new Barrier();
    const result = editor.invokeWithinContext((accessor) => accessor.get(IInstantiationService).createInstance(DocumentSymbolsOutline, editor, target, firstLoadBarrier));
    await firstLoadBarrier.wait();
    return result;
  }
};

DocumentSymbolsOutlineCreator = __decorateClass([
  __decorateParam(0, IOutlineService)
], DocumentSymbolsOutlineCreator);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(DocumentSymbolsOutlineCreator, 4 /* Eventually */);
export { DocumentSymbolBreadcrumbsSource, DocumentSymbolsOutline, DocumentSymbolsOutlineCreator };
