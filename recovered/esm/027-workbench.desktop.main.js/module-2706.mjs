// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditor.ts
import { AbstractEditorWithViewState } from "./module-1090.mjs";
import { MultiDiffEditorLogger } from "./module-2464.mjs";
import { MultiDiffEditorWidget } from "./module-2466.mjs";
import { Range2 } from "./module-0106.mjs";
import { MultiDiffEditorInput } from "./module-1148.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IEditorProgressService } from "./module-0446.mjs";
import { ILogService } from "./module-0095.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { FloatingEditorToolbarWidget } from "./module-0865.mjs";
import { MenuId } from "./module-0092.mjs";
import { derived } from "./module-0054.mjs";
import { autorun } from "./module-0052.mjs";
import { IsSessionsWindowContext } from "./module-0949.mjs";
import { ResourceLabel } from "./module-1323.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/multiDiffEditor/browser/multiDiffEditor.ts
var MultiDiffEditor = class extends AbstractEditorWithViewState {
  constructor(group2, instantiationService, telemetryService, themeService, storageService, editorService, editorGroupService, textResourceConfigurationService, editorProgressService, logService) {
    super(
      MultiDiffEditor.ID,
      group2,
      "multiDiffEditor",
      telemetryService,
      instantiationService,
      storageService,
      textResourceConfigurationService,
      themeService,
      editorService,
      editorGroupService
    );
    this.editorProgressService = editorProgressService;
    this._multiDiffEditorWidget = void 0;
    this._logger = this._register(new MultiDiffEditorLogger(logService));
  }
  static {
    this.ID = "multiDiffEditor";
  }
  get viewModel() {
    return this._viewModel;
  }
  createEditor(parent) {
    this._multiDiffEditorWidget = this._register(this.instantiationService.createInstance(
      MultiDiffEditorWidget,
      parent,
      this.instantiationService.createInstance(WorkbenchUIElementFactory2),
      void 0
    ));
    this._register(this._multiDiffEditorWidget.onDidChangeActiveControl(() => {
      this._onDidChangeControl.fire();
    }));
    this._contentOverlay = this._register(new MultiDiffEditorContentMenuOverlay(
      this._multiDiffEditorWidget.getRootElement(),
      this._multiDiffEditorWidget.getContextKeyService(),
      this._multiDiffEditorWidget.getScopedInstantiationService()
    ));
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    this._viewModel = await input.getViewModel();
    this._contentOverlay?.updateResource(input.resource);
    const viewState = this.loadEditorViewState(input, context2);
    this._logger.log("editor set input", {
      resource: input.resource,
      preserveFocus: !!options3?.preserveFocus,
      hasPersistedViewState: !!viewState,
      reveal: options3?.viewState?.revealData?.resource.modified ?? options3?.viewState?.revealData?.resource.original
    });
    this._multiDiffEditorWidget.setViewModel(this._viewModel, { preserveFocus: options3?.preserveFocus, viewState });
    this._applyOptions(options3);
  }
  setOptions(options3) {
    this._applyOptions(options3);
  }
  _applyOptions(options3) {
    const viewState = options3?.viewState;
    if (!viewState || !viewState.revealData) {
      return;
    }
    this._multiDiffEditorWidget?.reveal(viewState.revealData.resource, {
      range: viewState.revealData.range ? Range2.lift(viewState.revealData.range) : void 0,
      highlight: true
    });
  }
  async clearInput() {
    this._logger.log("editor clear input");
    await super.clearInput();
    this._contentOverlay?.updateResource(void 0);
    this._multiDiffEditorWidget.setViewModel(void 0);
  }
  layout(dimension) {
    this._multiDiffEditorWidget.layout(dimension);
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
  computeEditorViewState(resource) {
    return this._multiDiffEditorWidget.getViewState();
  }
  tracksEditorViewState(input) {
    return input instanceof MultiDiffEditorInput;
  }
  toEditorViewStateResource(input) {
    return input.resource;
  }
  tryGetCodeEditor(resource) {
    return this._multiDiffEditorWidget.tryGetCodeEditor(resource);
  }
  findDocumentDiffItem(resource) {
    const i2 = this._multiDiffEditorWidget.findDocumentDiffItem(resource);
    if (!i2) {
      return void 0;
    }
    const i22 = i2;
    return i22.multiDiffEditorItem;
  }
  goToNextChange() {
    this._multiDiffEditorWidget?.goToNextChange();
  }
  goToPreviousChange() {
    this._multiDiffEditorWidget?.goToPreviousChange();
  }
  getLayoutDebugState() {
    return this._multiDiffEditorWidget.getLayoutDebugState();
  }
  async showWhile(promise) {
    return this.editorProgressService.showWhile(promise);
  }
};

MultiDiffEditor = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IEditorGroupsService),
  __decorateParam(7, ITextResourceConfigurationService),
  __decorateParam(8, IEditorProgressService),
  __decorateParam(9, ILogService)
], MultiDiffEditor);

var MultiDiffEditorContentMenuOverlay = class extends Disposable {
  constructor(root, contextKeyService, instantiationService) {
    super();
    this.resourceObs = observableValue(this, void 0);
    const widget = instantiationService.createInstance(
      FloatingEditorToolbarWidget,
      MenuId.MultiDiffEditorContent,
      contextKeyService,
      this.resourceObs
    );
    widget.element.classList.add("multi-diff-root-floating-menu");
    this._register(widget);
    const showToolbarObs = derived((reader) => {
      const resource = this.resourceObs.read(reader);
      const hasActions = widget.hasActions.read(reader);
      return resource !== void 0 && hasActions;
    });
    this._register(autorun((reader) => {
      const showToolbar = showToolbarObs.read(reader);
      if (!showToolbar) {
        return;
      }
      root.appendChild(widget.element);
      reader.store.add(toDisposable(() => {
        widget.element.remove();
      }));
    }));
  }
  updateResource(resource) {
    this.resourceObs.set(resource, void 0);
  }
};

var WorkbenchUIElementFactory2 = class {
  constructor(_instantiationService, contextKeyService) {
    this._instantiationService = _instantiationService;
    this.headerClickToCollapse = IsSessionsWindowContext.getValue(contextKeyService) === true;
  }
  createResourceLabel(element, _kind) {
    const label3 = this._instantiationService.createInstance(ResourceLabel, element, {});
    return {
      setUri(uri5, options3 = {}) {
        if (!uri5) {
          label3.element.clear();
        } else {
          label3.element.setFile(uri5, { strikethrough: options3.strikethrough });
        }
      },
      dispose() {
        label3.dispose();
      }
    };
  }
};

WorkbenchUIElementFactory2 = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextKeyService)
], WorkbenchUIElementFactory2);
export { MultiDiffEditor, MultiDiffEditorContentMenuOverlay, WorkbenchUIElementFactory2 };
