// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/notebookAccessibilityHelp.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { IS_COMPOSITE_NOTEBOOK, NOTEBOOK_EDITOR_FOCUSED } from "./module-1844.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IEditorService } from "./module-0935.mjs";
import { localize } from "./module-0001.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";


// src/vs/workbench/contrib/notebook/browser/notebookAccessibilityHelp.ts
var NotebookAccessibilityHelp = class {
  constructor() {
    this.priority = 105;
    this.name = "notebook";
    this.when = ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, IS_COMPOSITE_NOTEBOOK.negate());
    this.type = "help" /* Help */;
  }
  getProvider(accessor) {
    const activeEditor = accessor.get(ICodeEditorService).getActiveCodeEditor() || accessor.get(ICodeEditorService).getFocusedCodeEditor() || accessor.get(IEditorService).activeEditorPane;
    if (!activeEditor) {
      return;
    }
    return getAccessibilityHelpProvider(accessor, activeEditor);
  }
};

function getAccessibilityHelpText() {
  return [
    localize(17754, null),
    localize(17745, null, "<keybinding:notebook.cell.edit>"),
    localize(17749, null, "<keybinding:notebook.cell.quitEdit>"),
    localize(17747, null, "<keybinding:notebook.cell.focusInOutput>"),
    localize(17752, null, "<keybinding:notebook.focusNextEditor>"),
    localize(17753, null, "<keybinding:notebook.focusPreviousEditor>"),
    localize(17750, null),
    localize(17746, null, "<keybinding:notebook.cell.executeAndFocusContainer>"),
    localize(17748, null, "<keybinding:notebook.cell.insertCodeCellAbove>", "<keybinding:notebook.cell.insertCodeCellBelow>"),
    localize(17751, null)
  ].join("\n");
}

function getAccessibilityHelpProvider(accessor, editor) {
  const helpText = getAccessibilityHelpText();
  return new AccessibleContentProvider(
    "notebook" /* Notebook */,
    { type: "help" /* Help */ },
    () => helpText,
    () => editor.focus(),
    "accessibility.verbosity.notebook" /* Notebook */
  );
}
export { getAccessibilityHelpText, getAccessibilityHelpProvider, NotebookAccessibilityHelp };
