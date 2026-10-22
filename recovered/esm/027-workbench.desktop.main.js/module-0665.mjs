// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/cursorUndo/browser/cursorUndo.ts
import { Disposable } from "./module-0012.mjs";
import { EditorAction, registerEditorAction, registerEditorContribution } from "./module-0097.mjs";
import { localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";


// src/vs/editor/contrib/cursorUndo/browser/cursorUndo.ts
var CursorState3 = class {
  constructor(selections) {
    this.selections = selections;
  }
  equals(other) {
    const thisLen = this.selections.length;
    const otherLen = other.selections.length;
    if (thisLen !== otherLen) {
      return false;
    }
    for (let i2 = 0; i2 < thisLen; i2++) {
      if (!this.selections[i2].equalsSelection(other.selections[i2])) {
        return false;
      }
    }
    return true;
  }
};

var StackElement = class {
  constructor(cursorState, scrollTop, scrollLeft) {
    this.cursorState = cursorState;
    this.scrollTop = scrollTop;
    this.scrollLeft = scrollLeft;
  }
};

var CursorUndoRedoController = class _CursorUndoRedoController extends Disposable {
  static {
    this.ID = "editor.contrib.cursorUndoRedoController";
  }
  static get(editor) {
    return editor.getContribution(_CursorUndoRedoController.ID);
  }
  constructor(editor) {
    super();
    this._editor = editor;
    this._isCursorUndoRedo = false;
    this._undoStack = [];
    this._redoStack = [];
    this._register(editor.onDidChangeModel((e) => {
      this._undoStack = [];
      this._redoStack = [];
    }));
    this._register(editor.onDidChangeModelContent((e) => {
      this._undoStack = [];
      this._redoStack = [];
    }));
    this._register(editor.onDidChangeCursorSelection((e) => {
      if (this._isCursorUndoRedo) {
        return;
      }
      if (!e.oldSelections) {
        return;
      }
      if (e.oldModelVersionId !== e.modelVersionId) {
        return;
      }
      const prevState = new CursorState3(e.oldSelections);
      const isEqualToLastUndoStack = this._undoStack.length > 0 && this._undoStack[this._undoStack.length - 1].cursorState.equals(prevState);
      if (!isEqualToLastUndoStack) {
        this._undoStack.push(new StackElement(prevState, editor.getScrollTop(), editor.getScrollLeft()));
        this._redoStack = [];
        if (this._undoStack.length > 50) {
          this._undoStack.shift();
        }
      }
    }));
  }
  cursorUndo() {
    if (!this._editor.hasModel() || this._undoStack.length === 0) {
      return;
    }
    this._redoStack.push(new StackElement(new CursorState3(this._editor.getSelections()), this._editor.getScrollTop(), this._editor.getScrollLeft()));
    this._applyState(this._undoStack.pop());
  }
  cursorRedo() {
    if (!this._editor.hasModel() || this._redoStack.length === 0) {
      return;
    }
    this._undoStack.push(new StackElement(new CursorState3(this._editor.getSelections()), this._editor.getScrollTop(), this._editor.getScrollLeft()));
    this._applyState(this._redoStack.pop());
  }
  _applyState(stackElement) {
    this._isCursorUndoRedo = true;
    this._editor.setSelections(stackElement.cursorState.selections);
    this._editor.setScrollPosition({
      scrollTop: stackElement.scrollTop,
      scrollLeft: stackElement.scrollLeft
    });
    this._isCursorUndoRedo = false;
  }
};

var CursorUndo = class extends EditorAction {
  constructor() {
    super({
      id: "cursorUndo",
      label: localize2(1088, "Cursor Undo"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 2048 /* CtrlCmd */ | 51 /* KeyU */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor, editor, args2) {
    CursorUndoRedoController.get(editor)?.cursorUndo();
  }
};

var CursorRedo = class extends EditorAction {
  constructor() {
    super({
      id: "cursorRedo",
      label: localize2(1087, "Cursor Redo"),
      precondition: void 0
    });
  }
  run(accessor, editor, args2) {
    CursorUndoRedoController.get(editor)?.cursorRedo();
  }
};

registerEditorContribution(CursorUndoRedoController.ID, CursorUndoRedoController, 0 /* Eager */);

registerEditorAction(CursorUndo);

registerEditorAction(CursorRedo);
export { CursorState3, StackElement, CursorUndoRedoController, CursorUndo, CursorRedo };
