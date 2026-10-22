// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/gotoSymbol/browser/peek/referencesWidget.ts
import { DisposableStore, dispose } from "./module-0012.mjs";
import { ModelDecorationOptions, TextModel } from "./module-0423.mjs";
import { Range2 } from "./module-0106.mjs";
import { WorkbenchAsyncDataTree } from "./module-0636.mjs";
import { FileReferences, OneReference } from "./module-0637.mjs";
import { withSelection } from "./module-0272.mjs";
import { DataTransfers } from "./module-0263.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IPeekViewService, PeekViewWidget, peekViewBorder, peekViewResultsBackground, peekViewTitleBackground, peekViewTitleForeground, peekViewTitleInfoForeground } from "./module-0623.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { $, Dimension, addStandardDisposableListener, append, hide, show } from "./module-0075.mjs";
import { Color } from "./module-0197.mjs";
import { Sizing, SplitView } from "./module-0625.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { localize } from "./module-0001.mjs";
import { PLAINTEXT_LANGUAGE_ID } from "./module-0141.mjs";
import { AccessibilityProvider, DataSource, Delegate, FileReferencesRenderer, IdentityProvider, OneReferenceRenderer, StringRepresentationProvider } from "./module-0642.mjs";
import { Schemas } from "./module-0033.mjs";
import { basenameOrAuthority, dirname2 } from "./module-0034.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";


// src/vs/editor/contrib/gotoSymbol/browser/peek/referencesWidget.ts
var DecorationsManager = class _DecorationsManager {
  constructor(_editor, _model) {
    this._editor = _editor;
    this._model = _model;
    this._decorations = /* @__PURE__ */ new Map();
    this._decorationIgnoreSet = /* @__PURE__ */ new Set();
    this._callOnDispose = new DisposableStore();
    this._callOnModelChange = new DisposableStore();
    this._callOnDispose.add(this._editor.onDidChangeModel(() => this._onModelChanged()));
    this._onModelChanged();
  }
  static {
    this.DecorationOptions = ModelDecorationOptions.register({
      description: "reference-decoration",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
      className: "reference-decoration"
    });
  }
  dispose() {
    this._callOnModelChange.dispose();
    this._callOnDispose.dispose();
    this.removeDecorations();
  }
  _onModelChanged() {
    this._callOnModelChange.clear();
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    for (const ref of this._model.references) {
      if (ref.uri.toString() === model.uri.toString()) {
        this._addDecorations(ref.parent);
        return;
      }
    }
  }
  _addDecorations(reference) {
    if (!this._editor.hasModel()) {
      return;
    }
    this._callOnModelChange.add(this._editor.getModel().onDidChangeDecorations(() => this._onDecorationChanged()));
    const newDecorations = [];
    const newDecorationsActualIndex = [];
    for (let i2 = 0, len = reference.children.length; i2 < len; i2++) {
      const oneReference = reference.children[i2];
      if (this._decorationIgnoreSet.has(oneReference.id)) {
        continue;
      }
      if (oneReference.uri.toString() !== this._editor.getModel().uri.toString()) {
        continue;
      }
      newDecorations.push({
        range: oneReference.range,
        options: _DecorationsManager.DecorationOptions
      });
      newDecorationsActualIndex.push(i2);
    }
    this._editor.changeDecorations((changeAccessor) => {
      const decorations = changeAccessor.deltaDecorations([], newDecorations);
      for (let i2 = 0; i2 < decorations.length; i2++) {
        this._decorations.set(decorations[i2], reference.children[newDecorationsActualIndex[i2]]);
      }
    });
  }
  _onDecorationChanged() {
    const toRemove = [];
    const model = this._editor.getModel();
    if (!model) {
      return;
    }
    for (const [decorationId, reference] of this._decorations) {
      const newRange = model.getDecorationRange(decorationId);
      if (!newRange) {
        continue;
      }
      let ignore = false;
      if (Range2.equalsRange(newRange, reference.range)) {
        continue;
      }
      if (Range2.spansMultipleLines(newRange)) {
        ignore = true;
      } else {
        const lineLength = reference.range.endColumn - reference.range.startColumn;
        const newLineLength = newRange.endColumn - newRange.startColumn;
        if (lineLength !== newLineLength) {
          ignore = true;
        }
      }
      if (ignore) {
        this._decorationIgnoreSet.add(reference.id);
        toRemove.push(decorationId);
      } else {
        reference.range = newRange;
      }
    }
    for (let i2 = 0, len = toRemove.length; i2 < len; i2++) {
      this._decorations.delete(toRemove[i2]);
    }
    this._editor.removeDecorations(toRemove);
  }
  removeDecorations() {
    this._editor.removeDecorations([...this._decorations.keys()]);
    this._decorations.clear();
  }
};

var LayoutData = class {
  constructor() {
    this.ratio = 0.7;
    this.heightInLines = 18;
  }
  static fromJSON(raw) {
    let ratio;
    let heightInLines;
    try {
      const data = JSON.parse(raw);
      ratio = data.ratio;
      heightInLines = data.heightInLines;
    } catch {
    }
    return {
      ratio: ratio || 0.7,
      heightInLines: heightInLines || 18
    };
  }
};

var ReferencesTree = class extends WorkbenchAsyncDataTree {
};

var ReferencesDragAndDrop = class {
  constructor(labelService) {
    this.labelService = labelService;
    this.disposables = new DisposableStore();
  }
  getDragURI(element) {
    if (element instanceof FileReferences) {
      return element.uri.toString();
    } else if (element instanceof OneReference) {
      return withSelection(element.uri, element.range).toString();
    }
    return null;
  }
  getDragLabel(elements) {
    if (elements.length === 0) {
      return void 0;
    }
    const labels2 = elements.map((e) => this.labelService.getUriBasenameLabel(e.uri));
    return labels2.join(", ");
  }
  onDragStart(data, originalEvent) {
    if (!originalEvent.dataTransfer) {
      return;
    }
    const elements = data.elements;
    const resources = elements.map((e) => this.getDragURI(e)).filter(Boolean);
    if (resources.length) {
      originalEvent.dataTransfer.setData(DataTransfers.RESOURCES, JSON.stringify(resources));
      originalEvent.dataTransfer.setData(DataTransfers.TEXT, resources.join("\n"));
    }
  }
  onDragOver() {
    return false;
  }
  drop() {
  }
  dispose() {
    this.disposables.dispose();
  }
};

ReferencesDragAndDrop = __decorateClass([
  __decorateParam(0, ILabelService)
], ReferencesDragAndDrop);

var ReferenceWidget = class extends PeekViewWidget {
  // whether or not a dispose is already in progress
  constructor(editor, _defaultTreeKeyboardSupport, layoutData, themeService, _textModelResolverService, _instantiationService, _peekViewService, _uriLabel, _keybindingService) {
    super(editor, { showFrame: false, showArrow: true, isResizeable: true, isAccessible: true, supportOnTitleClick: true }, _instantiationService);
    this._defaultTreeKeyboardSupport = _defaultTreeKeyboardSupport;
    this.layoutData = layoutData;
    this._textModelResolverService = _textModelResolverService;
    this._instantiationService = _instantiationService;
    this._peekViewService = _peekViewService;
    this._uriLabel = _uriLabel;
    this._keybindingService = _keybindingService;
    this._disposeOnNewModel = new DisposableStore();
    this._callOnDispose = new DisposableStore();
    this._onDidSelectReference = this._callOnDispose.add(new Emitter());
    this.onDidSelectReference = this._onDidSelectReference.event;
    this._dim = new Dimension(0, 0);
    this._isClosing = false;
    this._applyTheme(themeService.getColorTheme());
    this._callOnDispose.add(themeService.onDidColorThemeChange(this._applyTheme.bind(this)));
    this._peekViewService.addExclusiveWidget(editor, this);
    this.create();
  }
  get isClosing() {
    return this._isClosing;
  }
  dispose() {
    this._isClosing = true;
    this.setModel(void 0);
    this._callOnDispose.dispose();
    this._disposeOnNewModel.dispose();
    dispose(this._preview);
    dispose(this._previewNotAvailableMessage);
    dispose(this._tree);
    dispose(this._previewModelReference);
    this._splitView.dispose();
    super.dispose();
  }
  _applyTheme(theme) {
    const borderColor = theme.getColor(peekViewBorder) || Color.transparent;
    this.style({
      arrowColor: borderColor,
      frameColor: borderColor,
      headerBackgroundColor: theme.getColor(peekViewTitleBackground) || Color.transparent,
      primaryHeadingColor: theme.getColor(peekViewTitleForeground),
      secondaryHeadingColor: theme.getColor(peekViewTitleInfoForeground)
    });
  }
  show(where) {
    super.show(where, this.layoutData.heightInLines || 18);
  }
  focusOnReferenceTree() {
    this._tree.domFocus();
  }
  focusOnPreviewEditor() {
    this._preview.focus();
  }
  isPreviewEditorFocused() {
    return this._preview.hasTextFocus();
  }
  _onTitleClick(e) {
    if (this._preview && this._preview.getModel()) {
      this._onDidSelectReference.fire({
        element: this._getFocusedReference(),
        kind: e.ctrlKey || e.metaKey || e.altKey ? "side" : "open",
        source: "title"
      });
    }
  }
  _fillBody(containerElement) {
    this.setCssClass("reference-zone-widget");
    this._messageContainer = append(containerElement, $("div.messages"));
    hide(this._messageContainer);
    this._splitView = new SplitView(containerElement, { orientation: 1 /* HORIZONTAL */ });
    this._previewContainer = append(containerElement, $("div.preview.inline"));
    const options3 = {
      scrollBeyondLastLine: false,
      scrollbar: {
        verticalScrollbarSize: 14,
        horizontal: "auto",
        useShadows: true,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        alwaysConsumeMouseWheel: true
      },
      overviewRulerLanes: 2,
      fixedOverflowWidgets: true,
      minimap: {
        enabled: false
      }
    };
    this._preview = this._instantiationService.createInstance(EmbeddedCodeEditorWidget, this._previewContainer, options3, {}, this.editor);
    hide(this._previewContainer);
    this._previewNotAvailableMessage = this._instantiationService.createInstance(TextModel, localize(1259, null), PLAINTEXT_LANGUAGE_ID, TextModel.DEFAULT_CREATION_OPTIONS, null);
    this._treeContainer = append(containerElement, $("div.ref-tree.inline"));
    const treeOptions = {
      keyboardSupport: this._defaultTreeKeyboardSupport,
      accessibilityProvider: new AccessibilityProvider(),
      keyboardNavigationLabelProvider: this._instantiationService.createInstance(StringRepresentationProvider),
      identityProvider: new IdentityProvider(),
      openOnSingleClick: true,
      selectionNavigation: true,
      overrideStyles: {
        listBackground: peekViewResultsBackground
      },
      dnd: this._instantiationService.createInstance(ReferencesDragAndDrop)
    };
    if (this._defaultTreeKeyboardSupport) {
      this._callOnDispose.add(addStandardDisposableListener(this._treeContainer, "keydown", (e) => {
        if (e.equals(9 /* Escape */)) {
          this._keybindingService.dispatchEvent(e, e.target);
          e.stopPropagation();
        }
      }, true));
    }
    this._tree = this._instantiationService.createInstance(
      ReferencesTree,
      "ReferencesWidget",
      this._treeContainer,
      new Delegate(),
      [
        this._instantiationService.createInstance(FileReferencesRenderer),
        this._instantiationService.createInstance(OneReferenceRenderer)
      ],
      this._instantiationService.createInstance(DataSource),
      treeOptions
    );
    this._splitView.addView({
      onDidChange: Event2.None,
      element: this._previewContainer,
      minimumSize: 200,
      maximumSize: Number.MAX_VALUE,
      layout: (width2) => {
        this._preview.layout({ height: this._dim.height, width: width2 });
      }
    }, Sizing.Distribute);
    this._splitView.addView({
      onDidChange: Event2.None,
      element: this._treeContainer,
      minimumSize: 100,
      maximumSize: Number.MAX_VALUE,
      layout: (width2) => {
        this._treeContainer.style.height = `${this._dim.height}px`;
        this._treeContainer.style.width = `${width2}px`;
        this._tree.layout(this._dim.height, width2);
      }
    }, Sizing.Distribute);
    this._disposables.add(this._splitView.onDidSashChange(() => {
      if (this._dim.width) {
        this.layoutData.ratio = this._splitView.getViewSize(0) / this._dim.width;
      }
    }, void 0));
    const onEvent = (element, kind) => {
      if (element instanceof OneReference) {
        if (kind === "show") {
          this._revealReference(element, false);
        }
        this._onDidSelectReference.fire({ element, kind, source: "tree" });
      }
    };
    this._disposables.add(this._tree.onDidOpen((e) => {
      if (e.sideBySide) {
        onEvent(e.element, "side");
      } else if (e.editorOptions.pinned) {
        onEvent(e.element, "goto");
      } else {
        onEvent(e.element, "show");
      }
    }));
    hide(this._treeContainer);
  }
  _onWidth(width2) {
    if (this._dim) {
      this._doLayoutBody(this._dim.height, width2);
    }
  }
  _doLayoutBody(heightInPixel, widthInPixel) {
    super._doLayoutBody(heightInPixel, widthInPixel);
    this._dim = new Dimension(widthInPixel, heightInPixel);
    this.layoutData.heightInLines = this._viewZone ? this._viewZone.heightInLines : this.layoutData.heightInLines;
    this._splitView.layout(widthInPixel);
    this._splitView.resizeView(0, widthInPixel * this.layoutData.ratio);
  }
  setSelection(selection) {
    return this._revealReference(selection, true).then(() => {
      if (!this._model) {
        return;
      }
      this._tree.setSelection([selection]);
      this._tree.setFocus([selection]);
    });
  }
  setModel(newModel) {
    this._disposeOnNewModel.clear();
    this._model = newModel;
    if (this._model) {
      return this._onNewModel();
    }
    return Promise.resolve();
  }
  _onNewModel() {
    if (!this._model) {
      return Promise.resolve(void 0);
    }
    if (this._model.isEmpty) {
      this.setTitle("");
      this._messageContainer.innerText = localize(1260, null);
      show(this._messageContainer);
      return Promise.resolve(void 0);
    }
    hide(this._messageContainer);
    this._decorationsManager = new DecorationsManager(this._preview, this._model);
    this._disposeOnNewModel.add(this._decorationsManager);
    this._disposeOnNewModel.add(this._model.onDidChangeReferenceRange((reference) => this._tree.rerender(reference)));
    this._disposeOnNewModel.add(this._preview.onMouseDown((e) => {
      const { event, target } = e;
      if (event.detail !== 2) {
        return;
      }
      const element = this._getFocusedReference();
      if (!element) {
        return;
      }
      this._onDidSelectReference.fire({
        element: { uri: element.uri, range: target.range },
        kind: event.ctrlKey || event.metaKey || event.altKey ? "side" : "open",
        source: "editor"
      });
    }));
    this.container.classList.add("results-loaded");
    show(this._treeContainer);
    show(this._previewContainer);
    this._splitView.layout(this._dim.width);
    this.focusOnReferenceTree();
    return this._tree.setInput(this._model.groups.length === 1 ? this._model.groups[0] : this._model);
  }
  _getFocusedReference() {
    const [element] = this._tree.getFocus();
    if (element instanceof OneReference) {
      return element;
    } else if (element instanceof FileReferences) {
      if (element.children.length > 0) {
        return element.children[0];
      }
    }
    return void 0;
  }
  async revealReference(reference) {
    await this._revealReference(reference, false);
    this._onDidSelectReference.fire({ element: reference, kind: "goto", source: "tree" });
  }
  async _revealReference(reference, revealParent) {
    if (this._revealedReference === reference) {
      return;
    }
    this._revealedReference = reference;
    if (reference.uri.scheme !== Schemas.inMemory) {
      this.setTitle(basenameOrAuthority(reference.uri), this._uriLabel.getUriLabel(dirname2(reference.uri)));
    } else {
      this.setTitle(localize(1261, null));
    }
    const promise = this._textModelResolverService.createModelReference(reference.uri);
    if (this._tree.getInput() === reference.parent) {
      this._tree.reveal(reference);
    } else {
      if (revealParent) {
        this._tree.reveal(reference.parent);
      }
      await this._tree.expand(reference.parent);
      this._tree.reveal(reference);
    }
    const ref = await promise;
    if (!this._model) {
      ref.dispose();
      return;
    }
    dispose(this._previewModelReference);
    const model = ref.object;
    if (model) {
      const scrollType = this._preview.getModel() === model.textEditorModel ? 0 /* Smooth */ : 1 /* Immediate */;
      const sel = Range2.lift(reference.range).collapseToStart();
      this._previewModelReference = ref;
      this._preview.setModel(model.textEditorModel);
      this._preview.setSelection(sel);
      this._preview.revealRangeInCenter(sel, scrollType);
    } else {
      this._preview.setModel(this._previewNotAvailableMessage);
      ref.dispose();
    }
  }
};

ReferenceWidget = __decorateClass([
  __decorateParam(3, IThemeService),
  __decorateParam(4, ITextModelService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IPeekViewService),
  __decorateParam(7, ILabelService),
  __decorateParam(8, IKeybindingService)
], ReferenceWidget);
export { DecorationsManager, LayoutData, ReferencesTree, ReferencesDragAndDrop, ReferenceWidget };
