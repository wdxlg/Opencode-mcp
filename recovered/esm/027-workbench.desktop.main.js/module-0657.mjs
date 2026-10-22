// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/standaloneColorPicker/standaloneColorPickerWidget.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { StandaloneColorPickerParticipant } from "./module-0656.mjs";
import { trackFocus } from "./module-0075.mjs";
import { DefaultDocumentColorProvider } from "./module-0576.mjs";
import { EditorHoverStatusBar } from "./module-0590.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/editor/contrib/colorPicker/browser/standaloneColorPicker/standaloneColorPickerWidget.ts
var StandaloneColorPickerResult = class {
  // The color picker result consists of: an array of color results and a boolean indicating if the color was found in the editor
  constructor(value2, foundInEditor) {
    this.value = value2;
    this.foundInEditor = foundInEditor;
  }
};

var PADDING = 8;

var CLOSE_BUTTON_WIDTH = 22;

var StandaloneColorPickerWidget = class extends Disposable {
  constructor(_editor, _standaloneColorPickerVisible, _standaloneColorPickerFocused, _instantiationService, _keybindingService, _languageFeaturesService, _editorWorkerService, _hoverService) {
    super();
    this._editor = _editor;
    this._standaloneColorPickerVisible = _standaloneColorPickerVisible;
    this._standaloneColorPickerFocused = _standaloneColorPickerFocused;
    this._keybindingService = _keybindingService;
    this._languageFeaturesService = _languageFeaturesService;
    this._editorWorkerService = _editorWorkerService;
    this._hoverService = _hoverService;
    this.allowEditorOverflow = true;
    this._position = void 0;
    this._body = document.createElement("div");
    this._colorHover = null;
    this._selectionSetInEditor = false;
    this._onResult = this._register(new Emitter());
    this.onResult = this._onResult.event;
    this._renderedHoverParts = this._register(new MutableDisposable());
    this._renderedStatusBar = this._register(new MutableDisposable());
    this._standaloneColorPickerVisible.set(true);
    this._standaloneColorPickerParticipant = _instantiationService.createInstance(StandaloneColorPickerParticipant, this._editor);
    this._position = this._editor._getViewModel()?.getPrimaryCursorState().modelState.position;
    const editorSelection = this._editor.getSelection();
    this._selections = this._editor.getSelections() ?? [];
    const selection = editorSelection ? {
      startLineNumber: editorSelection.startLineNumber,
      startColumn: editorSelection.startColumn,
      endLineNumber: editorSelection.endLineNumber,
      endColumn: editorSelection.endColumn
    } : { startLineNumber: 0, endLineNumber: 0, endColumn: 0, startColumn: 0 };
    const focusTracker = this._register(trackFocus(this._body));
    this._register(focusTracker.onDidBlur((_) => {
      this.hide();
    }));
    this._register(focusTracker.onDidFocus((_) => {
      this.focus();
    }));
    this._register(this._editor.onDidChangeCursorPosition(() => {
      if (!this._selectionSetInEditor) {
        this.hide();
      } else {
        this._selectionSetInEditor = false;
      }
      this._selections = this._editor.getSelections() ?? [];
    }));
    this._register(this._editor.onMouseMove((e) => {
      const classList = e.target.element?.classList;
      if (classList && classList.contains("colorpicker-color-decoration")) {
        this.hide();
      }
    }));
    this._register(this.onResult((result) => {
      this._render(result.value, result.foundInEditor);
    }));
    this._start(selection);
    this._body.style.zIndex = "50";
    this._editor.addContentWidget(this);
  }
  static {
    this.ID = "editor.contrib.standaloneColorPickerWidget";
  }
  updateEditor() {
    if (this._colorHover) {
      this._standaloneColorPickerParticipant.updateEditorModel(this._colorHover, this._selections);
    }
  }
  getId() {
    return StandaloneColorPickerWidget.ID;
  }
  getDomNode() {
    return this._body;
  }
  getPosition() {
    if (!this._position) {
      return null;
    }
    const positionPreference = this._editor.getOption(69 /* hover */).above;
    return {
      position: this._position,
      secondaryPosition: this._position,
      preference: positionPreference ? [1 /* ABOVE */, 2 /* BELOW */] : [2 /* BELOW */, 1 /* ABOVE */],
      positionAffinity: 2 /* None */
    };
  }
  hide() {
    this.dispose();
    this._standaloneColorPickerVisible.set(false);
    this._standaloneColorPickerFocused.set(false);
    this._editor.removeContentWidget(this);
    this._editor.focus();
  }
  focus() {
    this._standaloneColorPickerFocused.set(true);
    this._body.focus();
  }
  async _start(selection) {
    const computeAsyncResult = await this._computeAsync(selection);
    if (!computeAsyncResult) {
      return;
    }
    this._onResult.fire(new StandaloneColorPickerResult(computeAsyncResult.result, computeAsyncResult.foundInEditor));
  }
  async _computeAsync(range2) {
    if (!this._editor.hasModel()) {
      return null;
    }
    const colorInfo = {
      range: range2,
      color: { red: 0, green: 0, blue: 0, alpha: 1 }
    };
    const colorHoverResult = await this._standaloneColorPickerParticipant.createColorHover(colorInfo, new DefaultDocumentColorProvider(this._editorWorkerService), this._languageFeaturesService.colorProvider);
    if (!colorHoverResult) {
      return null;
    }
    return { result: colorHoverResult.colorHover, foundInEditor: colorHoverResult.foundInEditor };
  }
  _render(colorHover, foundInEditor) {
    const fragment = document.createDocumentFragment();
    this._renderedStatusBar.value = this._register(new EditorHoverStatusBar(this._keybindingService, this._hoverService));
    const context2 = {
      fragment,
      statusBar: this._renderedStatusBar.value,
      onContentsChanged: () => {
      },
      setMinimumDimensions: () => {
      },
      hide: () => this.hide(),
      focus: () => this.focus()
    };
    this._colorHover = colorHover;
    this._renderedHoverParts.value = this._standaloneColorPickerParticipant.renderHoverParts(context2, [colorHover]);
    if (!this._renderedHoverParts.value) {
      this._renderedStatusBar.clear();
      this._renderedHoverParts.clear();
      return;
    }
    const colorPicker = this._renderedHoverParts.value.colorPicker;
    this._body.classList.add("standalone-colorpicker-body");
    this._body.style.maxHeight = Math.max(this._editor.getLayoutInfo().height / 4, 250) + "px";
    this._body.style.maxWidth = Math.max(this._editor.getLayoutInfo().width * 0.66, 500) + "px";
    this._body.tabIndex = 0;
    this._body.appendChild(fragment);
    colorPicker.layout();
    const colorPickerBody = colorPicker.body;
    const saturationBoxWidth = colorPickerBody.saturationBox.domNode.clientWidth;
    const widthOfOriginalColorBox = colorPickerBody.domNode.clientWidth - saturationBoxWidth - CLOSE_BUTTON_WIDTH - PADDING;
    const enterButton = colorPicker.body.enterButton;
    enterButton?.onClicked(() => {
      this.updateEditor();
      this.hide();
    });
    const colorPickerHeader = colorPicker.header;
    const pickedColorNode = colorPickerHeader.pickedColorNode;
    pickedColorNode.style.width = saturationBoxWidth + PADDING + "px";
    const originalColorNode = colorPickerHeader.originalColorNode;
    originalColorNode.style.width = widthOfOriginalColorBox + "px";
    const closeButton = colorPicker.header.closeButton;
    closeButton?.onClicked(() => {
      this.hide();
    });
    if (foundInEditor) {
      if (enterButton) {
        enterButton.button.textContent = "Replace";
      }
      this._selectionSetInEditor = true;
      this._editor.setSelection(colorHover.range);
    }
    this._editor.layoutContentWidget(this);
  }
};

StandaloneColorPickerWidget = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, ILanguageFeaturesService),
  __decorateParam(6, IEditorWorkerService),
  __decorateParam(7, IHoverService)
], StandaloneColorPickerWidget);
export { StandaloneColorPickerResult, PADDING, CLOSE_BUTTON_WIDTH, StandaloneColorPickerWidget };
