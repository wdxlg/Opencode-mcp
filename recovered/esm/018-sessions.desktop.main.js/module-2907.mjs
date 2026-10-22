// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/replNotebook/browser/replEditorAccessibilityHelp.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { IS_COMPOSITE_NOTEBOOK, NOTEBOOK_CELL_LIST_FOCUSED } from "./module-1844.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { localize } from "./module-0001.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";


// src/vs/workbench/contrib/replNotebook/browser/replEditorAccessibilityHelp.ts
var ReplEditorInputAccessibilityHelp = class {
  constructor() {
    this.priority = 105;
    this.name = "REPL Editor Input";
    this.when = ContextKeyExpr.and(IS_COMPOSITE_NOTEBOOK, NOTEBOOK_CELL_LIST_FOCUSED.negate());
    this.type = "help" /* Help */;
  }
  getProvider(accessor) {
    return getAccessibilityHelpProvider2(accessor.get(ICodeEditorService), getAccessibilityInputHelpText());
  }
};

function getAccessibilityInputHelpText() {
  return [
    localize(18712, null),
    localize(18704, null, "<keybinding:repl.execute>"),
    localize(18703, null),
    localize(18701, null),
    localize(18707, null, "<keybinding:repl.focusLastItemExecuted>"),
    localize(18711, null, "<keybinding:editor.action.accessibleView>"),
    localize(18708, null, "<keybinding:repl.input.focus>")
  ].join("\n");
}

var ReplEditorHistoryAccessibilityHelp = class {
  constructor() {
    this.priority = 105;
    this.name = "REPL Editor History";
    this.when = ContextKeyExpr.and(IS_COMPOSITE_NOTEBOOK, NOTEBOOK_CELL_LIST_FOCUSED);
    this.type = "help" /* Help */;
  }
  getProvider(accessor) {
    return getAccessibilityHelpProvider2(accessor.get(ICodeEditorService), getAccessibilityHistoryHelpText());
  }
};

function getAccessibilityHistoryHelpText() {
  return [
    localize(18710, null),
    localize(18705, null, "<keybinding:notebook.cell.edit>"),
    localize(18702, null, "<keybinding:notebook.cell.quitEdit>"),
    localize(18700, null, "<keybinding:editor.action.accessibleView>"),
    localize(18706, null, "<keybinding:notebook.cell.focusInOutput>"),
    localize(18709, null, "<keybinding:repl.input.focus>"),
    localize(18707, null, "<keybinding:repl.focusLastItemExecuted>")
  ].join("\n");
}

function getAccessibilityHelpProvider2(editorService, helpText) {
  const activeEditor = editorService.getActiveCodeEditor() || editorService.getFocusedCodeEditor();
  if (!activeEditor) {
    return;
  }
  return new AccessibleContentProvider(
    "replEditor" /* ReplEditor */,
    { type: "help" /* Help */ },
    () => helpText,
    () => activeEditor.focus(),
    "accessibility.verbosity.replEditor" /* ReplEditor */
  );
}
export { getAccessibilityInputHelpText, getAccessibilityHistoryHelpText, getAccessibilityHelpProvider2, ReplEditorInputAccessibilityHelp, ReplEditorHistoryAccessibilityHelp };
