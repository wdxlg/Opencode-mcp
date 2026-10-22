// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/dnd/browser/dnd.ts
import { isMacintosh } from "./module-0014.mjs";
import { Disposable } from "./module-0012.mjs";
import { Position } from "./module-0079.mjs";
import { Selection } from "./module-0107.mjs";
import { DragAndDropCommand } from "./module-0666.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { Range2 } from "./module-0106.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/editor/contrib/dnd/browser/dnd.ts
function hasTriggerModifier(e4) {
  if (isMacintosh) {
    return e4.altKey;
  } else {
    return e4.ctrlKey;
  }
}

var DragAndDropController = class _DragAndDropController extends Disposable {
  static {
    this.ID = "editor.contrib.dragAndDrop";
  }
  static {
    this.TRIGGER_KEY_VALUE = isMacintosh ? 6 /* Alt */ : 5 /* Ctrl */;
  }
  static get(editor) {
    return editor.getContribution(_DragAndDropController.ID);
  }
  constructor(editor) {
    super();
    this._editor = editor;
    this._dndDecorationIds = this._editor.createDecorationsCollection();
    this._register(this._editor.onMouseDown((e4) => this._onEditorMouseDown(e4)));
    this._register(this._editor.onMouseUp((e4) => this._onEditorMouseUp(e4)));
    this._register(this._editor.onMouseDrag((e4) => this._onEditorMouseDrag(e4)));
    this._register(this._editor.onMouseDrop((e4) => this._onEditorMouseDrop(e4)));
    this._register(this._editor.onMouseDropCanceled(() => this._onEditorMouseDropCanceled()));
    this._register(this._editor.onKeyDown((e4) => this.onEditorKeyDown(e4)));
    this._register(this._editor.onKeyUp((e4) => this.onEditorKeyUp(e4)));
    this._register(this._editor.onDidBlurEditorWidget(() => this.onEditorBlur()));
    this._register(this._editor.onDidBlurEditorText(() => this.onEditorBlur()));
    this._mouseDown = false;
    this._modifierPressed = false;
    this._dragSelection = null;
  }
  onEditorBlur() {
    this._removeDecoration();
    this._dragSelection = null;
    this._mouseDown = false;
    this._modifierPressed = false;
  }
  onEditorKeyDown(e4) {
    if (!this._editor.getOption(42 /* dragAndDrop */) || this._editor.getOption(28 /* columnSelection */)) {
      return;
    }
    if (hasTriggerModifier(e4)) {
      this._modifierPressed = true;
    }
    if (this._mouseDown && hasTriggerModifier(e4)) {
      this._editor.updateOptions({
        mouseStyle: "copy"
      });
    }
  }
  onEditorKeyUp(e4) {
    if (!this._editor.getOption(42 /* dragAndDrop */) || this._editor.getOption(28 /* columnSelection */)) {
      return;
    }
    if (hasTriggerModifier(e4)) {
      this._modifierPressed = false;
    }
    if (this._mouseDown && e4.keyCode === _DragAndDropController.TRIGGER_KEY_VALUE) {
      this._editor.updateOptions({
        mouseStyle: "default"
      });
    }
  }
  _onEditorMouseDown(mouseEvent) {
    this._mouseDown = true;
  }
  _onEditorMouseUp(mouseEvent) {
    this._mouseDown = false;
    this._editor.updateOptions({
      mouseStyle: "text"
    });
  }
  _onEditorMouseDrag(mouseEvent) {
    const target = mouseEvent.target;
    if (this._dragSelection === null) {
      const selections = this._editor.getSelections() || [];
      const possibleSelections = selections.filter((selection) => target.position && selection.containsPosition(target.position));
      if (possibleSelections.length === 1) {
        this._dragSelection = possibleSelections[0];
      } else {
        return;
      }
    }
    if (hasTriggerModifier(mouseEvent.event)) {
      this._editor.updateOptions({
        mouseStyle: "copy"
      });
    } else {
      this._editor.updateOptions({
        mouseStyle: "default"
      });
    }
    if (target.position) {
      if (this._dragSelection.containsPosition(target.position)) {
        this._removeDecoration();
      } else {
        this.showAt(target.position);
      }
    }
  }
  _onEditorMouseDropCanceled() {
    this._editor.updateOptions({
      mouseStyle: "text"
    });
    this._removeDecoration();
    this._dragSelection = null;
    this._mouseDown = false;
  }
  _onEditorMouseDrop(mouseEvent) {
    if (mouseEvent.target && (this._hitContent(mouseEvent.target) || this._hitMargin(mouseEvent.target)) && mouseEvent.target.position) {
      const newCursorPosition = new Position(mouseEvent.target.position.lineNumber, mouseEvent.target.position.column);
      if (this._dragSelection === null) {
        let newSelections = null;
        if (mouseEvent.event.shiftKey) {
          const primarySelection = this._editor.getSelection();
          if (primarySelection) {
            const { selectionStartLineNumber, selectionStartColumn } = primarySelection;
            newSelections = [new Selection(selectionStartLineNumber, selectionStartColumn, newCursorPosition.lineNumber, newCursorPosition.column)];
          }
        } else {
          newSelections = (this._editor.getSelections() || []).map((selection) => {
            if (selection.containsPosition(newCursorPosition)) {
              return new Selection(newCursorPosition.lineNumber, newCursorPosition.column, newCursorPosition.lineNumber, newCursorPosition.column);
            } else {
              return selection;
            }
          });
        }
        this._editor.setSelections(newSelections || [], "mouse", 3 /* Explicit */);
      } else if (!this._dragSelection.containsPosition(newCursorPosition) || (hasTriggerModifier(mouseEvent.event) || this._modifierPressed) && (this._dragSelection.getEndPosition().equals(newCursorPosition) || this._dragSelection.getStartPosition().equals(newCursorPosition))) {
        this._editor.pushUndoStop();
        this._editor.executeCommand(_DragAndDropController.ID, new DragAndDropCommand(this._dragSelection, newCursorPosition, hasTriggerModifier(mouseEvent.event) || this._modifierPressed));
        this._editor.pushUndoStop();
      }
    }
    this._editor.updateOptions({
      mouseStyle: "text"
    });
    this._removeDecoration();
    this._dragSelection = null;
    this._mouseDown = false;
  }
  static {
    this._DECORATION_OPTIONS = ModelDecorationOptions.register({
      description: "dnd-target",
      className: "dnd-target"
    });
  }
  showAt(position2) {
    this._dndDecorationIds.set([{
      range: new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column),
      options: _DragAndDropController._DECORATION_OPTIONS
    }]);
    this._editor.revealPosition(position2, 1 /* Immediate */);
  }
  _removeDecoration() {
    this._dndDecorationIds.clear();
  }
  _hitContent(target) {
    return target.type === 6 /* CONTENT_TEXT */ || target.type === 7 /* CONTENT_EMPTY */;
  }
  _hitMargin(target) {
    return target.type === 2 /* GUTTER_GLYPH_MARGIN */ || target.type === 3 /* GUTTER_LINE_NUMBERS */ || target.type === 4 /* GUTTER_LINE_DECORATIONS */;
  }
  dispose() {
    this._removeDecoration();
    this._dragSelection = null;
    this._mouseDown = false;
    this._modifierPressed = false;
    super.dispose();
  }
};

registerEditorContribution(DragAndDropController.ID, DragAndDropController, 2 /* BeforeFirstInteraction */);
export { hasTriggerModifier, DragAndDropController };
