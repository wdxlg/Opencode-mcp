// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/caretOperations/browser/caretOperations.ts
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { MoveCaretCommand } from "./module-0532.mjs";
import { localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";


// src/vs/editor/contrib/caretOperations/browser/caretOperations.ts
var MoveCaretAction = class extends EditorAction {
  constructor(left, opts) {
    super(opts);
    this.left = left;
  }
  run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const commands = [];
    const selections = editor.getSelections();
    for (const selection of selections) {
      commands.push(new MoveCaretCommand(selection, this.left));
    }
    editor.pushUndoStop();
    editor.executeCommands(this.id, commands);
    editor.pushUndoStop();
  }
};

var MoveCaretLeftAction = class extends MoveCaretAction {
  constructor() {
    super(true, {
      id: "editor.action.moveCarretLeftAction",
      label: localize2(991, "Move Selected Text Left"),
      precondition: EditorContextKeys.writable
    });
  }
};

var MoveCaretRightAction = class extends MoveCaretAction {
  constructor() {
    super(false, {
      id: "editor.action.moveCarretRightAction",
      label: localize2(992, "Move Selected Text Right"),
      precondition: EditorContextKeys.writable
    });
  }
};

registerEditorAction(MoveCaretLeftAction);

registerEditorAction(MoveCaretRightAction);
export { MoveCaretAction, MoveCaretLeftAction, MoveCaretRightAction };
