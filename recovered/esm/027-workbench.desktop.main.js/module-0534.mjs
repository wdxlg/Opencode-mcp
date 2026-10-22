// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/caretOperations/browser/transpose.ts
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { MoveOperations } from "./module-0118.mjs";
import { Range2 } from "./module-0106.mjs";
import { ReplaceCommand } from "./module-0115.mjs";


// src/vs/editor/contrib/caretOperations/browser/transpose.ts
var TransposeLettersAction = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.transposeLetters",
      label: localize2(993, "Transpose Letters"),
      precondition: EditorContextKeys.writable,
      kbOpts: {
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 0,
        mac: {
          primary: 256 /* WinCtrl */ | 50 /* KeyT */
        },
        weight: 100 /* EditorContrib */
      }
    });
  }
  run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    const commands = [];
    const selections = editor.getSelections();
    for (const selection of selections) {
      if (!selection.isEmpty()) {
        continue;
      }
      const lineNumber = selection.startLineNumber;
      const column = selection.startColumn;
      const lastColumn = model.getLineMaxColumn(lineNumber);
      if (lineNumber === 1 && (column === 1 || column === 2 && lastColumn === 2)) {
        continue;
      }
      const endPosition = column === lastColumn ? selection.getPosition() : MoveOperations.rightPosition(model, selection.getPosition().lineNumber, selection.getPosition().column);
      const middlePosition = MoveOperations.leftPosition(model, endPosition);
      const beginPosition = MoveOperations.leftPosition(model, middlePosition);
      const leftChar = model.getValueInRange(Range2.fromPositions(beginPosition, middlePosition));
      const rightChar = model.getValueInRange(Range2.fromPositions(middlePosition, endPosition));
      const replaceRange = Range2.fromPositions(beginPosition, endPosition);
      commands.push(new ReplaceCommand(replaceRange, rightChar + leftChar));
    }
    if (commands.length > 0) {
      editor.pushUndoStop();
      editor.executeCommands(this.id, commands);
      editor.pushUndoStop();
    }
  }
};

registerEditorAction(TransposeLettersAction);
export { TransposeLettersAction };
