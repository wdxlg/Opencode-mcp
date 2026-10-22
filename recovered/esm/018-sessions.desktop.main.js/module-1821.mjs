// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/codeeditor.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { isCodeEditor, isCompositeEditor } from "./module-0223.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { AbstractFloatingClickMenu, FloatingClickWidget } from "./module-1820.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/browser/codeeditor.ts
var RangeHighlightDecorations = class extends Disposable {
  constructor(editorService) {
    super();
    this.editorService = editorService;
    this._onHighlightRemoved = this._register(new Emitter());
    this.onHighlightRemoved = this._onHighlightRemoved.event;
    this.rangeHighlightDecorationId = null;
    this.editor = null;
    this.editorDisposables = this._register(new DisposableStore());
  }
  removeHighlightRange() {
    if (this.editor && this.rangeHighlightDecorationId) {
      const decorationId = this.rangeHighlightDecorationId;
      this.editor.changeDecorations((accessor) => {
        accessor.removeDecoration(decorationId);
      });
      this._onHighlightRemoved.fire();
    }
    this.rangeHighlightDecorationId = null;
  }
  highlightRange(range2, editor) {
    editor = editor ?? this.getEditor(range2);
    if (isCodeEditor(editor)) {
      this.doHighlightRange(editor, range2);
    } else if (isCompositeEditor(editor) && isCodeEditor(editor.activeCodeEditor)) {
      this.doHighlightRange(editor.activeCodeEditor, range2);
    }
  }
  doHighlightRange(editor, selectionRange) {
    this.removeHighlightRange();
    editor.changeDecorations((changeAccessor) => {
      this.rangeHighlightDecorationId = changeAccessor.addDecoration(selectionRange.range, this.createRangeHighlightDecoration(selectionRange.isWholeLine));
    });
    this.setEditor(editor);
  }
  getEditor(resourceRange) {
    const resource = this.editorService.activeEditor?.resource;
    if (resource && isEqual2(resource, resourceRange.resource) && isCodeEditor(this.editorService.activeTextEditorControl)) {
      return this.editorService.activeTextEditorControl;
    }
    return void 0;
  }
  setEditor(editor) {
    if (this.editor !== editor) {
      this.editorDisposables.clear();
      this.editor = editor;
      this.editorDisposables.add(this.editor.onDidChangeCursorPosition((e4) => {
        if (e4.reason === 0 /* NotSet */ || e4.reason === 3 /* Explicit */ || e4.reason === 5 /* Undo */ || e4.reason === 6 /* Redo */) {
          this.removeHighlightRange();
        }
      }));
      this.editorDisposables.add(this.editor.onDidChangeModel(() => {
        this.removeHighlightRange();
      }));
      this.editorDisposables.add(this.editor.onDidDispose(() => {
        this.removeHighlightRange();
        this.editor = null;
      }));
    }
  }
  static {
    this._WHOLE_LINE_RANGE_HIGHLIGHT = ModelDecorationOptions.register({
      description: "codeeditor-range-highlight-whole",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
      className: "rangeHighlight",
      isWholeLine: true
    });
  }
  static {
    this._RANGE_HIGHLIGHT = ModelDecorationOptions.register({
      description: "codeeditor-range-highlight",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
      className: "rangeHighlight"
    });
  }
  createRangeHighlightDecoration(isWholeLine = true) {
    return isWholeLine ? RangeHighlightDecorations._WHOLE_LINE_RANGE_HIGHLIGHT : RangeHighlightDecorations._RANGE_HIGHLIGHT;
  }
  dispose() {
    super.dispose();
    if (this.editor?.getModel()) {
      this.removeHighlightRange();
      this.editor = null;
    }
  }
};

RangeHighlightDecorations = __decorateClass([
  __decorateParam(0, IEditorService)
], RangeHighlightDecorations);

var FloatingEditorClickWidget = class extends FloatingClickWidget {
  constructor(editor, label3, keyBindingAction, keybindingService) {
    super(keybindingService.appendKeybinding(label3, keyBindingAction));
    this.editor = editor;
  }
  getId() {
    return "editor.overlayWidget.floatingClickWidget";
  }
  getPosition() {
    return {
      preference: 1 /* BOTTOM_RIGHT_CORNER */
    };
  }
  render() {
    super.render();
    this.editor.addOverlayWidget(this);
  }
  dispose() {
    this.editor.removeOverlayWidget(this);
    super.dispose();
  }
};

FloatingEditorClickWidget = __decorateClass([
  __decorateParam(3, IKeybindingService)
], FloatingEditorClickWidget);

var FloatingEditorClickMenu = class extends AbstractFloatingClickMenu {
  constructor(editor, instantiationService, menuService, contextKeyService) {
    super(MenuId.EditorContent, menuService, contextKeyService);
    this.editor = editor;
    this.instantiationService = instantiationService;
    this.render();
  }
  static {
    this.ID = "editor.contrib.floatingClickMenu";
  }
  createWidget(action) {
    return this.instantiationService.createInstance(FloatingEditorClickWidget, this.editor, action.label, action.id);
  }
  isVisible() {
    return !(this.editor instanceof EmbeddedCodeEditorWidget) && this.editor?.hasModel() && !this.editor.getOption(70 /* inDiffEditor */);
  }
  getActionArg() {
    return this.editor.getModel()?.uri;
  }
};

FloatingEditorClickMenu = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IMenuService),
  __decorateParam(3, IContextKeyService)
], FloatingEditorClickMenu);
export { RangeHighlightDecorations, FloatingEditorClickWidget, FloatingEditorClickMenu };
