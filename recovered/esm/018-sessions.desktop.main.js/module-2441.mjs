// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/multiDiffEditor/multiDiffEditorWidget.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { readHotReloadableExport } from "./module-0443.mjs";
import { DiffEditorItemTemplate } from "./module-2436.mjs";
import { MultiDiffEditorWidgetImpl } from "./module-2440.mjs";
import { Event2 } from "./module-0017.mjs";
import { recomputeInitiallyAndOnChange } from "./module-0059.mjs";
import { MultiDiffEditorViewModel } from "./module-1146.mjs";
import { transaction } from "./module-0045.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/editor/browser/widget/multiDiffEditor/multiDiffEditorWidget.ts
var MultiDiffEditorWidget = class extends Disposable {
  constructor(_element, _workbenchUIElementFactory, _diffEditorOptions, _instantiationService) {
    super();
    this._element = _element;
    this._workbenchUIElementFactory = _workbenchUIElementFactory;
    this._diffEditorOptions = _diffEditorOptions;
    this._instantiationService = _instantiationService;
    this._dimension = observableValue(this, void 0);
    this._viewModel = observableValue(this, void 0);
    this._diffLayoutOptions = observableValue(this, void 0);
    this._widgetImpl = derived(this, (reader) => {
      readHotReloadableExport(DiffEditorItemTemplate, reader);
      return reader.store.add(this._instantiationService.createInstance(
        readHotReloadableExport(MultiDiffEditorWidgetImpl, reader),
        this._element,
        this._dimension,
        this._viewModel,
        this._workbenchUIElementFactory,
        this._diffLayoutOptions,
        this._diffEditorOptions
      ));
    });
    this._activeControl = derived(this, (reader) => this._widgetImpl.read(reader).activeControl.read(reader));
    this.onDidChangeActiveControl = Event2.fromObservableLight(this._activeControl);
    this._register(recomputeInitiallyAndOnChange(this._widgetImpl));
  }
  reveal(resource, options3) {
    this._widgetImpl.get().reveal(resource, options3);
  }
  createViewModel(model) {
    return new MultiDiffEditorViewModel(model, this._instantiationService);
  }
  setViewModel(viewModel, options3) {
    if (this._store.isDisposed) {
      return;
    }
    this._widgetImpl.get().setPreserveFocusOnLoad(!!options3?.preserveFocus);
    transaction((tx) => {
      this._viewModel.set(viewModel, tx);
      if (options3?.viewState) {
        this._widgetImpl.get().setViewState(options3.viewState, tx);
      } else {
        this._widgetImpl.get().clearPendingRestorationState();
      }
    });
  }
  layout(dimension) {
    this._dimension.set(dimension, void 0);
  }
  /**
   * Overrides whether the embedded diffs render side by side (`true`) or inline
   * (`false`) as editor-local state, independent of the
   * `diffEditor.renderSideBySide` setting. Responsive inline fallback is disabled
   * unless explicitly enabled.
   */
  setRenderSideBySide(renderSideBySide, options3) {
    this._diffLayoutOptions.set({
      renderSideBySide,
      useInlineViewWhenSpaceIsLimited: options3?.useInlineViewWhenSpaceIsLimited ?? false
    }, void 0);
  }
  toggleRenderSideBySide() {
    this.setRenderSideBySide(!(this._diffLayoutOptions.get()?.renderSideBySide ?? true));
  }
  getActiveControl() {
    return this._activeControl.get();
  }
  getViewState() {
    return this._widgetImpl.get().getViewState();
  }
  getLayoutDebugState() {
    return this._widgetImpl.get().layoutDebugState;
  }
  setViewState(viewState) {
    this._widgetImpl.get().setViewState(viewState);
  }
  tryGetCodeEditor(resource) {
    return this._widgetImpl.get().tryGetCodeEditor(resource);
  }
  getRootElement() {
    return this._widgetImpl.get().getRootElement();
  }
  getContextKeyService() {
    return this._widgetImpl.get().getContextKeyService();
  }
  getScopedInstantiationService() {
    return this._widgetImpl.get().getScopedInstantiationService();
  }
  findDocumentDiffItem(resource) {
    return this._widgetImpl.get().findDocumentDiffItem(resource);
  }
  goToNextChange() {
    this._widgetImpl.get().goToNextChange();
  }
  goToPreviousChange() {
    this._widgetImpl.get().goToPreviousChange();
  }
};

MultiDiffEditorWidget = __decorateClass([
  __decorateParam(3, IInstantiationService)
], MultiDiffEditorWidget);
export { MultiDiffEditorWidget };
