// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/browser/diffEditorAccessibilityHelp.ts
import { ContextKeyEqualsExpr, IContextKeyService } from "./module-0089.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { DiffEditorWidget } from "./module-0527.mjs";
import { localize } from "./module-0001.mjs";
import { AccessibleDiffViewerNext, AccessibleDiffViewerPrev } from "./module-0528.mjs";
import { getCommentCommandInfo } from "./module-3503.mjs";
import { AccessibleContentProvider } from "./module-0799.mjs";


// src/vs/workbench/contrib/codeEditor/browser/diffEditorAccessibilityHelp.ts
var DiffEditorAccessibilityHelp = class {
  constructor() {
    this.priority = 105;
    this.name = "diff-editor";
    this.when = ContextKeyEqualsExpr.create("isInDiffEditor", true);
    this.type = "help" /* Help */;
  }
  getProvider(accessor) {
    const editorService = accessor.get(IEditorService);
    const codeEditorService = accessor.get(ICodeEditorService);
    const keybindingService = accessor.get(IKeybindingService);
    const contextKeyService = accessor.get(IContextKeyService);
    if (!(editorService.activeTextEditorControl instanceof DiffEditorWidget)) {
      return;
    }
    const codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
    if (!codeEditor) {
      return;
    }
    const switchSides = localize(13662, null, "<keybinding:diffEditor.switchSide>");
    const diffEditorActiveAnnouncement = localize(13664, null);
    const keys = ["accessibility.signals.diffLineDeleted", "accessibility.signals.diffLineInserted", "accessibility.signals.diffLineModified"];
    const content2 = [
      localize(13660, null),
      localize(13661, null, "<keybinding:" + AccessibleDiffViewerNext.id + ">", "<keybinding:" + AccessibleDiffViewerPrev.id + ">"),
      switchSides,
      diffEditorActiveAnnouncement,
      localize(13663, null, keys.join(", "))
    ];
    const commentCommandInfo = getCommentCommandInfo(keybindingService, contextKeyService, codeEditor);
    if (commentCommandInfo) {
      content2.push(commentCommandInfo);
    }
    return new AccessibleContentProvider(
      "diffEditor" /* DiffEditor */,
      { type: "help" /* Help */ },
      () => content2.join("\n"),
      () => codeEditor.focus(),
      "accessibility.verbosity.diffEditor" /* DiffEditor */
    );
  }
};
export { DiffEditorAccessibilityHelp };
