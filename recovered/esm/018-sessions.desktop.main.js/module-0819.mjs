// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/lineSelection/browser/lineSelection.ts
import { EditorAction, registerEditorAction } from "./module-0097.mjs";
import { localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { CursorMoveCommands } from "./module-0124.mjs";


// src/vs/editor/contrib/lineSelection/browser/lineSelection.ts
var ExpandLineSelectionAction = class extends EditorAction {
  constructor() {
    super({
      id: "expandLineSelection",
      label: localize2(1428, "Expand Line Selection"),
      precondition: void 0,
      kbOpts: {
        weight: 0 /* EditorCore */,
        kbExpr: EditorContextKeys.textInputFocus,
        primary: 2048 /* CtrlCmd */ | 42 /* KeyL */
      }
    });
  }
  run(_accessor, editor, args2) {
    args2 = args2 || {};
    if (!editor.hasModel()) {
      return;
    }
    const viewModel = editor._getViewModel();
    viewModel.model.pushStackElement();
    viewModel.setCursorStates(
      args2.source,
      3 /* Explicit */,
      CursorMoveCommands.expandLineSelection(viewModel, viewModel.getCursorStates())
    );
    viewModel.revealAllCursors(args2.source, true);
  }
};

registerEditorAction(ExpandLineSelectionAction);
export { ExpandLineSelectionAction };
