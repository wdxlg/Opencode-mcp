// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/format/browser/formattingEdit.ts
import { StableEditorScrollState } from "./module-0447.mjs";
import { EditOperation } from "./module-0162.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/contrib/format/browser/formattingEdit.ts
var FormattingEdit = class _FormattingEdit {
  static _handleEolEdits(editor, edits) {
    let newEol = void 0;
    const singleEdits = [];
    for (const edit3 of edits) {
      if (typeof edit3.eol === "number") {
        newEol = edit3.eol;
      }
      if (edit3.range && typeof edit3.text === "string") {
        singleEdits.push(edit3);
      }
    }
    if (typeof newEol === "number") {
      if (editor.hasModel()) {
        editor.getModel().pushEOL(newEol);
      }
    }
    return singleEdits;
  }
  static _isFullModelReplaceEdit(editor, edit3) {
    if (!editor.hasModel()) {
      return false;
    }
    const model = editor.getModel();
    const editRange = model.validateRange(edit3.range);
    const fullModelRange = model.getFullModelRange();
    return fullModelRange.equalsRange(editRange);
  }
  static execute(editor, _edits, addUndoStops) {
    if (addUndoStops) {
      editor.pushUndoStop();
    }
    const scrollState = StableEditorScrollState.capture(editor);
    const edits = _FormattingEdit._handleEolEdits(editor, _edits);
    if (edits.length === 1 && _FormattingEdit._isFullModelReplaceEdit(editor, edits[0])) {
      editor.executeEdits("formatEditsCommand", edits.map((edit3) => EditOperation.replace(Range2.lift(edit3.range), edit3.text)));
    } else {
      editor.executeEdits("formatEditsCommand", edits.map((edit3) => EditOperation.replaceMove(Range2.lift(edit3.range), edit3.text)));
    }
    if (addUndoStops) {
      editor.pushUndoStop();
    }
    scrollState.restoreRelativeVerticalPositionOfCursor(editor);
  }
};
export { FormattingEdit };
