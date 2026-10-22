// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/anchorSelect/browser/anchorSelect.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Selection } from "./module-0107.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { alert } from "./module-0076.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { EditorAction, registerEditorAction, registerEditorContribution } from "./module-0097.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { KeyChord } from "./module-0019.mjs";


// src/vs/editor/contrib/anchorSelect/browser/anchorSelect.ts
var SelectionAnchorSet = new RawContextKey("selectionAnchorSet", false);

var SelectionAnchorController = class {
  constructor(editor, contextKeyService) {
    this.editor = editor;
    this.selectionAnchorSetContextKey = SelectionAnchorSet.bindTo(contextKeyService);
    this.modelChangeListener = editor.onDidChangeModel(() => this.selectionAnchorSetContextKey.reset());
  }
  static {
    this.ID = "editor.contrib.selectionAnchorController";
  }
  static get(editor) {
    return editor.getContribution(SelectionAnchorController.ID);
  }
  setSelectionAnchor() {
    if (this.editor.hasModel()) {
      const position2 = this.editor.getPosition();
      this.editor.changeDecorations((accessor) => {
        if (this.decorationId) {
          accessor.removeDecoration(this.decorationId);
        }
        this.decorationId = accessor.addDecoration(
          Selection.fromPositions(position2, position2),
          {
            description: "selection-anchor",
            stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
            hoverMessage: new MarkdownString().appendText(localize(983, null)),
            className: "selection-anchor"
          }
        );
      });
      this.selectionAnchorSetContextKey.set(!!this.decorationId);
      alert(localize(979, null, position2.lineNumber, position2.column));
    }
  }
  goToSelectionAnchor() {
    if (this.editor.hasModel() && this.decorationId) {
      const anchorPosition = this.editor.getModel().getDecorationRange(this.decorationId);
      if (anchorPosition) {
        this.editor.setPosition(anchorPosition.getStartPosition());
      }
    }
  }
  selectFromAnchorToCursor() {
    if (this.editor.hasModel() && this.decorationId) {
      const start = this.editor.getModel().getDecorationRange(this.decorationId);
      if (start) {
        const end = this.editor.getPosition();
        this.editor.setSelection(Selection.fromPositions(start.getStartPosition(), end));
        this.cancelSelectionAnchor();
      }
    }
  }
  cancelSelectionAnchor() {
    if (this.decorationId) {
      const decorationId = this.decorationId;
      this.editor.changeDecorations((accessor) => {
        accessor.removeDecoration(decorationId);
        this.decorationId = void 0;
      });
      this.selectionAnchorSetContextKey.set(false);
    }
  }
  dispose() {
    this.cancelSelectionAnchor();
    this.modelChangeListener.dispose();
  }
};

SelectionAnchorController = __decorateClass([
  __decorateParam(1, IContextKeyService)
], SelectionAnchorController);

var SetSelectionAnchor = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.setSelectionAnchor",
      label: localize2(984, "Set Selection Anchor"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 32 /* KeyB */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  async run(_accessor, editor) {
    SelectionAnchorController.get(editor)?.setSelectionAnchor();
  }
};

var GoToSelectionAnchor = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.goToSelectionAnchor",
      label: localize2(981, "Go to Selection Anchor"),
      precondition: SelectionAnchorSet
    });
  }
  async run(_accessor, editor) {
    SelectionAnchorController.get(editor)?.goToSelectionAnchor();
  }
};

var SelectFromAnchorToCursor = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.selectFromAnchorToCursor",
      label: localize2(982, "Select from Anchor to Cursor"),
      precondition: SelectionAnchorSet,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 41 /* KeyK */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  async run(_accessor, editor) {
    SelectionAnchorController.get(editor)?.selectFromAnchorToCursor();
  }
};

var CancelSelectionAnchor = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.cancelSelectionAnchor",
      label: localize2(980, "Cancel Selection Anchor"),
      precondition: SelectionAnchorSet,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 9 /* Escape */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  async run(_accessor, editor) {
    SelectionAnchorController.get(editor)?.cancelSelectionAnchor();
  }
};

registerEditorContribution(SelectionAnchorController.ID, SelectionAnchorController, 4 /* Lazy */);

registerEditorAction(SetSelectionAnchor);

registerEditorAction(GoToSelectionAnchor);

registerEditorAction(SelectFromAnchorToCursor);

registerEditorAction(CancelSelectionAnchor);
export { SelectionAnchorSet, SelectionAnchorController, SetSelectionAnchor, GoToSelectionAnchor, SelectFromAnchorToCursor, CancelSelectionAnchor };
