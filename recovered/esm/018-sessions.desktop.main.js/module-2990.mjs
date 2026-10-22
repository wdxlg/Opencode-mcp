// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/mergeEditorAccessibilityHelp.ts
import { ContextKeyEqualsExpr } from "./module-0089.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { localize } from "./module-0001.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/mergeEditorAccessibilityHelp.ts
var MergeEditorAccessibilityHelpProvider = class {
  constructor() {
    this.name = "mergeEditor";
    this.type = "help" /* Help */;
    this.priority = 125;
    this.when = ContextKeyEqualsExpr.create("isMergeEditor", true);
  }
  getProvider(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
    if (!codeEditor) {
      return;
    }
    const content = [
      localize(17250, null),
      localize(17251, null, "<keybinding:merge.goToNextUnhandledConflict>", "<keybinding:merge.goToPreviousUnhandledConflict>"),
      localize(17252, null, "<keybinding:merge.acceptAllInput1>", "<keybinding:merge.acceptAllInput2>"),
      localize(17253, null, "<keybinding:mergeEditor.acceptMerge>"),
      localize(17254, null, "<keybinding:mergeEditor.toggleBetweenInputs>")
    ];
    return new AccessibleContentProvider(
      "mergeEditor" /* MergeEditor */,
      { type: "help" /* Help */ },
      () => content.join("\n"),
      () => codeEditor.focus(),
      "accessibility.verbosity.mergeEditor" /* MergeEditor */
    );
  }
};
export { MergeEditorAccessibilityHelpProvider };
