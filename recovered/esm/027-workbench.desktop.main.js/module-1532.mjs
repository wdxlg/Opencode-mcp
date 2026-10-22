// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/sideBySideEditor.ts
import { AbstractEditorWithViewState } from "./module-1090.mjs";
import { Emitter, Event2, Relay } from "./module-0017.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { $, Dimension, clearNode } from "./module-0075.mjs";
import { EditorExtensions, SIDE_BY_SIDE_EDITOR_ID, isEditorPaneWithSelection } from "./module-0925.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { Sizing, SplitView } from "./module-0625.mjs";
import { DEFAULT_EDITOR_MIN_DIMENSIONS } from "./module-1088.mjs";
import { localize } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { SideBySideEditorInput } from "./module-1095.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { multibyteAwareBtoa } from "./module-0030.mjs";
import { SIDE_BY_SIDE_EDITOR_HORIZONTAL_BORDER, SIDE_BY_SIDE_EDITOR_VERTICAL_BORDER } from "./module-0912.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";


// src/vs/workbench/browser/parts/editor/sideBySideEditor.ts
function isSideBySideEditorViewState(thing) {
  const candidate = thing;
  return typeof candidate?.primary === "object" && typeof candidate.secondary === "object";
}

var SideBySideEditor2 = class extends AbstractEditorWithViewState {
  constructor(group2, telemetryService, instantiationService, themeService, storageService, configurationService, textResourceConfigurationService, editorService, editorGroupService) {
    super(SideBySideEditor2.ID, group2, SideBySideEditor2.VIEW_STATE_PREFERENCE_KEY, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService);
    this.configurationService = configurationService;
    //#endregion
    //#region Events
    this.onDidCreateEditors = this._register(new Emitter());
    this._onDidChangeSizeConstraints = this._register(new Relay());
    this.onDidChangeSizeConstraints = Event2.any(this.onDidCreateEditors.event, this._onDidChangeSizeConstraints.event);
    this._onDidChangeSelection = this._register(new Emitter());
    this.onDidChangeSelection = this._onDidChangeSelection.event;
    //#endregion
    this.primaryEditorPane = void 0;
    this.secondaryEditorPane = void 0;
    this.splitviewDisposables = this._register(new DisposableStore());
    this.editorDisposables = this._register(new DisposableStore());
    this.dimension = new Dimension(0, 0);
    this.lastFocusedSide = void 0;
    this.orientation = this.configurationService.getValue(SideBySideEditor2.SIDE_BY_SIDE_LAYOUT_SETTING) === "vertical" ? 0 /* VERTICAL */ : 1 /* HORIZONTAL */;
    this.registerListeners();
  }
  static {
    this.ID = SIDE_BY_SIDE_EDITOR_ID;
  }
  static {
    this.SIDE_BY_SIDE_LAYOUT_SETTING = "workbench.editor.splitInGroupLayout";
  }
  static {
    this.VIEW_STATE_PREFERENCE_KEY = "sideBySideEditorViewState";
  }
  //#region Layout Constraints
  get minimumPrimaryWidth() {
    return this.primaryEditorPane ? this.primaryEditorPane.minimumWidth : 0;
  }
  get maximumPrimaryWidth() {
    return this.primaryEditorPane ? this.primaryEditorPane.maximumWidth : Number.POSITIVE_INFINITY;
  }
  get minimumPrimaryHeight() {
    return this.primaryEditorPane ? this.primaryEditorPane.minimumHeight : 0;
  }
  get maximumPrimaryHeight() {
    return this.primaryEditorPane ? this.primaryEditorPane.maximumHeight : Number.POSITIVE_INFINITY;
  }
  get minimumSecondaryWidth() {
    return this.secondaryEditorPane ? this.secondaryEditorPane.minimumWidth : 0;
  }
  get maximumSecondaryWidth() {
    return this.secondaryEditorPane ? this.secondaryEditorPane.maximumWidth : Number.POSITIVE_INFINITY;
  }
  get minimumSecondaryHeight() {
    return this.secondaryEditorPane ? this.secondaryEditorPane.minimumHeight : 0;
  }
  get maximumSecondaryHeight() {
    return this.secondaryEditorPane ? this.secondaryEditorPane.maximumHeight : Number.POSITIVE_INFINITY;
  }
  set minimumWidth(value2) {
  }
  set maximumWidth(value2) {
  }
  set minimumHeight(value2) {
  }
  set maximumHeight(value2) {
  }
  get minimumWidth() {
    return this.minimumPrimaryWidth + this.minimumSecondaryWidth;
  }
  get maximumWidth() {
    return this.maximumPrimaryWidth + this.maximumSecondaryWidth;
  }
  get minimumHeight() {
    return this.minimumPrimaryHeight + this.minimumSecondaryHeight;
  }
  get maximumHeight() {
    return this.maximumPrimaryHeight + this.maximumSecondaryHeight;
  }
  registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e) => this.onConfigurationUpdated(e)));
  }
  onConfigurationUpdated(event) {
    if (event.affectsConfiguration(SideBySideEditor2.SIDE_BY_SIDE_LAYOUT_SETTING)) {
      this.orientation = this.configurationService.getValue(SideBySideEditor2.SIDE_BY_SIDE_LAYOUT_SETTING) === "vertical" ? 0 /* VERTICAL */ : 1 /* HORIZONTAL */;
      if (this.splitview) {
        this.recreateSplitview();
      }
    }
  }
  recreateSplitview() {
    const container3 = assertReturnsDefined(this.getContainer());
    const ratio = this.getSplitViewRatio();
    if (this.splitview) {
      this.splitview.el.remove();
      this.splitviewDisposables.clear();
    }
    this.createSplitView(container3, ratio);
    this.layout(this.dimension);
  }
  getSplitViewRatio() {
    let ratio = void 0;
    if (this.splitview) {
      const leftViewSize = this.splitview.getViewSize(0);
      const rightViewSize = this.splitview.getViewSize(1);
      if (Math.abs(leftViewSize - rightViewSize) > 1) {
        const totalSize = this.splitview.orientation === 1 /* HORIZONTAL */ ? this.dimension.width : this.dimension.height;
        ratio = leftViewSize / totalSize;
      }
    }
    return ratio;
  }
  createEditor(parent) {
    parent.classList.add("side-by-side-editor");
    this.secondaryEditorContainer = $(".side-by-side-editor-container.editor-instance");
    this.primaryEditorContainer = $(".side-by-side-editor-container.editor-instance");
    this.createSplitView(parent);
  }
  createSplitView(parent, ratio) {
    this.splitview = this.splitviewDisposables.add(new SplitView(parent, { orientation: this.orientation }));
    this.splitviewDisposables.add(this.splitview.onDidSashReset(() => this.splitview?.distributeViewSizes()));
    if (this.orientation === 1 /* HORIZONTAL */) {
      this.splitview.orthogonalEndSash = this._boundarySashes?.bottom;
    } else {
      this.splitview.orthogonalStartSash = this._boundarySashes?.left;
      this.splitview.orthogonalEndSash = this._boundarySashes?.right;
    }
    let leftSizing = Sizing.Distribute;
    let rightSizing = Sizing.Distribute;
    if (ratio) {
      const totalSize = this.splitview.orientation === 1 /* HORIZONTAL */ ? this.dimension.width : this.dimension.height;
      leftSizing = Math.round(totalSize * ratio);
      rightSizing = totalSize - leftSizing;
      this.splitview.layout(this.orientation === 1 /* HORIZONTAL */ ? this.dimension.width : this.dimension.height);
    }
    const secondaryEditorContainer = assertReturnsDefined(this.secondaryEditorContainer);
    this.splitview.addView({
      element: secondaryEditorContainer,
      layout: (size3) => this.layoutPane(this.secondaryEditorPane, size3),
      minimumSize: this.orientation === 1 /* HORIZONTAL */ ? DEFAULT_EDITOR_MIN_DIMENSIONS.width : DEFAULT_EDITOR_MIN_DIMENSIONS.height,
      maximumSize: Number.POSITIVE_INFINITY,
      onDidChange: Event2.None
    }, leftSizing);
    const primaryEditorContainer = assertReturnsDefined(this.primaryEditorContainer);
    this.splitview.addView({
      element: primaryEditorContainer,
      layout: (size3) => this.layoutPane(this.primaryEditorPane, size3),
      minimumSize: this.orientation === 1 /* HORIZONTAL */ ? DEFAULT_EDITOR_MIN_DIMENSIONS.width : DEFAULT_EDITOR_MIN_DIMENSIONS.height,
      maximumSize: Number.POSITIVE_INFINITY,
      onDidChange: Event2.None
    }, rightSizing);
    this.updateStyles();
  }
  getTitle() {
    if (this.input) {
      return this.input.getName();
    }
    return localize(6768, null);
  }
  async setInput(input, options3, context2, token) {
    const oldInput = this.input;
    await super.setInput(input, options3, context2, token);
    if (!oldInput || !input.matches(oldInput)) {
      if (oldInput) {
        this.disposeEditors();
      }
      this.createEditors(input);
    }
    const { primary, secondary, viewState } = this.loadViewState(input, options3, context2);
    this.lastFocusedSide = viewState?.focus;
    if (typeof viewState?.ratio === "number" && this.splitview) {
      const totalSize = this.splitview.orientation === 1 /* HORIZONTAL */ ? this.dimension.width : this.dimension.height;
      this.splitview.resizeView(0, Math.round(totalSize * viewState.ratio));
    } else {
      this.splitview?.distributeViewSizes();
    }
    await Promise.all([
      this.secondaryEditorPane?.setInput(input.secondary, secondary, context2, token),
      this.primaryEditorPane?.setInput(input.primary, primary, context2, token)
    ]);
    if (typeof options3?.target === "number") {
      this.lastFocusedSide = options3.target;
    }
  }
  loadViewState(input, options3, context2) {
    const viewState = isSideBySideEditorViewState(options3?.viewState) ? options3?.viewState : this.loadEditorViewState(input, context2);
    let primaryOptions = /* @__PURE__ */ Object.create(null);
    let secondaryOptions = void 0;
    if (options3?.target === 2 /* SECONDARY */) {
      secondaryOptions = { ...options3 };
    } else {
      primaryOptions = { ...options3 };
    }
    primaryOptions.viewState = viewState?.primary;
    if (viewState?.secondary) {
      if (!secondaryOptions) {
        secondaryOptions = { viewState: viewState.secondary };
      } else {
        secondaryOptions.viewState = viewState?.secondary;
      }
    }
    return { primary: primaryOptions, secondary: secondaryOptions, viewState };
  }
  createEditors(newInput) {
    this.secondaryEditorPane = this.doCreateEditor(newInput.secondary, assertReturnsDefined(this.secondaryEditorContainer));
    this.primaryEditorPane = this.doCreateEditor(newInput.primary, assertReturnsDefined(this.primaryEditorContainer));
    this.layout(this.dimension);
    this._onDidChangeSizeConstraints.input = Event2.any(
      Event2.map(this.secondaryEditorPane.onDidChangeSizeConstraints, () => void 0),
      Event2.map(this.primaryEditorPane.onDidChangeSizeConstraints, () => void 0)
    );
    this.onDidCreateEditors.fire(void 0);
    this.editorDisposables.add(this.primaryEditorPane.onDidFocus(() => this.onDidFocusChange(1 /* PRIMARY */)));
    this.editorDisposables.add(this.secondaryEditorPane.onDidFocus(() => this.onDidFocusChange(2 /* SECONDARY */)));
  }
  doCreateEditor(editorInput, container3) {
    const editorPaneDescriptor = Registry.as(EditorExtensions.EditorPane).getEditorPane(editorInput);
    if (!editorPaneDescriptor) {
      throw new Error("No editor pane descriptor for editor found");
    }
    const editorPane = editorPaneDescriptor.instantiate(this.instantiationService, this.group);
    editorPane.create(container3);
    editorPane.setVisible(this.isVisible());
    if (isEditorPaneWithSelection(editorPane)) {
      this.editorDisposables.add(editorPane.onDidChangeSelection((e) => this._onDidChangeSelection.fire(e)));
    }
    this.editorDisposables.add(editorPane);
    return editorPane;
  }
  onDidFocusChange(side) {
    this.lastFocusedSide = side;
    this._onDidChangeControl.fire();
  }
  getSelection() {
    const lastFocusedEditorPane = this.getLastFocusedEditorPane();
    if (isEditorPaneWithSelection(lastFocusedEditorPane)) {
      const selection = lastFocusedEditorPane.getSelection();
      if (selection) {
        return new SideBySideAwareEditorPaneSelection(selection, lastFocusedEditorPane === this.primaryEditorPane ? 1 /* PRIMARY */ : 2 /* SECONDARY */);
      }
    }
    return void 0;
  }
  setOptions(options3) {
    super.setOptions(options3);
    if (typeof options3?.target === "number") {
      this.lastFocusedSide = options3.target;
    }
    this.getLastFocusedEditorPane()?.setOptions(options3);
  }
  setEditorVisible(visible) {
    this.primaryEditorPane?.setVisible(visible);
    this.secondaryEditorPane?.setVisible(visible);
    super.setEditorVisible(visible);
  }
  clearInput() {
    super.clearInput();
    this.primaryEditorPane?.clearInput();
    this.secondaryEditorPane?.clearInput();
    this.disposeEditors();
  }
  focus() {
    super.focus();
    this.getLastFocusedEditorPane()?.focus();
  }
  getLastFocusedEditorPane() {
    if (this.lastFocusedSide === 2 /* SECONDARY */) {
      return this.secondaryEditorPane;
    }
    return this.primaryEditorPane;
  }
  layout(dimension) {
    this.dimension = dimension;
    const splitview = assertReturnsDefined(this.splitview);
    splitview.layout(this.orientation === 1 /* HORIZONTAL */ ? dimension.width : dimension.height);
  }
  setBoundarySashes(sashes) {
    this._boundarySashes = sashes;
    if (this.splitview) {
      this.splitview.orthogonalEndSash = sashes.bottom;
    }
  }
  layoutPane(pane, size3) {
    pane?.layout(this.orientation === 1 /* HORIZONTAL */ ? new Dimension(size3, this.dimension.height) : new Dimension(this.dimension.width, size3));
  }
  getControl() {
    return this.getLastFocusedEditorPane()?.getControl();
  }
  getPrimaryEditorPane() {
    return this.primaryEditorPane;
  }
  getSecondaryEditorPane() {
    return this.secondaryEditorPane;
  }
  tracksEditorViewState(input) {
    return input instanceof SideBySideEditorInput;
  }
  computeEditorViewState(resource) {
    if (!this.input || !isEqual2(resource, this.toEditorViewStateResource(this.input))) {
      return;
    }
    const primarViewState = this.primaryEditorPane?.getViewState();
    const secondaryViewState = this.secondaryEditorPane?.getViewState();
    if (!primarViewState || !secondaryViewState) {
      return;
    }
    return {
      primary: primarViewState,
      secondary: secondaryViewState,
      focus: this.lastFocusedSide,
      ratio: this.getSplitViewRatio()
    };
  }
  toEditorViewStateResource(input) {
    let primary;
    let secondary;
    if (input instanceof SideBySideEditorInput) {
      primary = input.primary.resource;
      secondary = input.secondary.resource;
    }
    if (!secondary || !primary) {
      return void 0;
    }
    return URI.from({ scheme: "sideBySide", path: `${multibyteAwareBtoa(secondary.toString())}${multibyteAwareBtoa(primary.toString())}` });
  }
  updateStyles() {
    super.updateStyles();
    if (this.primaryEditorContainer) {
      if (this.orientation === 1 /* HORIZONTAL */) {
        this.primaryEditorContainer.style.borderLeftWidth = "1px";
        this.primaryEditorContainer.style.borderLeftStyle = "solid";
        this.primaryEditorContainer.style.borderLeftColor = this.getColor(SIDE_BY_SIDE_EDITOR_VERTICAL_BORDER) ?? "";
        this.primaryEditorContainer.style.borderTopWidth = "0";
      } else {
        this.primaryEditorContainer.style.borderTopWidth = "1px";
        this.primaryEditorContainer.style.borderTopStyle = "solid";
        this.primaryEditorContainer.style.borderTopColor = this.getColor(SIDE_BY_SIDE_EDITOR_HORIZONTAL_BORDER) ?? "";
        this.primaryEditorContainer.style.borderLeftWidth = "0";
      }
    }
  }
  dispose() {
    this.disposeEditors();
    super.dispose();
  }
  disposeEditors() {
    this.editorDisposables.clear();
    this.secondaryEditorPane = void 0;
    this.primaryEditorPane = void 0;
    this.lastFocusedSide = void 0;
    if (this.secondaryEditorContainer) {
      clearNode(this.secondaryEditorContainer);
    }
    if (this.primaryEditorContainer) {
      clearNode(this.primaryEditorContainer);
    }
  }
};

SideBySideEditor2 = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ITextResourceConfigurationService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IEditorGroupsService)
], SideBySideEditor2);

var SideBySideAwareEditorPaneSelection = class _SideBySideAwareEditorPaneSelection {
  constructor(selection, side) {
    this.selection = selection;
    this.side = side;
  }
  compare(other) {
    if (!(other instanceof _SideBySideAwareEditorPaneSelection)) {
      return 3 /* DIFFERENT */;
    }
    if (this.side !== other.side) {
      return 3 /* DIFFERENT */;
    }
    return this.selection.compare(other.selection);
  }
  restore(options3) {
    const sideBySideEditorOptions = {
      ...options3,
      target: this.side
    };
    return this.selection.restore(sideBySideEditorOptions);
  }
};
export { isSideBySideEditorViewState, SideBySideEditor2, SideBySideAwareEditorPaneSelection };
