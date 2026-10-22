// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/insertFinalNewLine/browser/insertFinalNewLine.ts
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { InsertFinalNewLineCommand } from "./module-0817.mjs";


// src/vs/editor/contrib/insertFinalNewLine/browser/insertFinalNewLine.ts
var InsertFinalNewLineAction = class _InsertFinalNewLineAction extends EditorAction {
  static {
    this.ID = "editor.action.insertFinalNewLine";
  }
  constructor() {
    super({
      id: _InsertFinalNewLineAction.ID,
      label: localize2(1427, "Insert Final New Line"),
      precondition: EditorContextKeys.writable
    });
  }
  run(_accessor, editor, args2) {
    const selection = editor.getSelection();
    if (selection === null) {
      return;
    }
    const command4 = new InsertFinalNewLineCommand(selection);
    editor.pushUndoStop();
    editor.executeCommands(this.id, [command4]);
    editor.pushUndoStop();
  }
};

registerEditorAction(InsertFinalNewLineAction);
export { InsertFinalNewLineAction };
