// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/codeAction/browser/codeActionContributions.ts
import { registerEditorAction, registerEditorCommand, registerEditorContribution } from "./module-0097.mjs";
import { CodeActionController } from "./module-0566.mjs";
import { LightBulbWidget } from "./module-0565.mjs";
import { registerAction2 } from "./module-0092.mjs";
import { AutoFixAction, CodeActionCommand, FixAllAction, OrganizeImportsAction, QuickFixAction, RefactorAction, SourceAction } from "./module-0567.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { editorConfigurationBaseNode } from "./module-0557.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/editor/contrib/codeAction/browser/codeActionContributions.ts
registerEditorContribution(CodeActionController.ID, CodeActionController, 3 /* Eventually */);

registerEditorContribution(LightBulbWidget.ID, LightBulbWidget, 4 /* Lazy */);

registerAction2(QuickFixAction);

registerEditorAction(RefactorAction);

registerEditorAction(SourceAction);

registerEditorAction(OrganizeImportsAction);

registerEditorAction(AutoFixAction);

registerEditorAction(FixAllAction);

registerEditorCommand(new CodeActionCommand());

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...editorConfigurationBaseNode,
  properties: {
    "editor.codeActionWidget.showHeaders": {
      type: "boolean",
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      description: localize(1034, null),
      default: true
    }
  }
});

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...editorConfigurationBaseNode,
  properties: {
    "editor.codeActionWidget.includeNearbyQuickFixes": {
      type: "boolean",
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      description: localize(1033, null),
      default: true
    }
  }
});

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...editorConfigurationBaseNode,
  properties: {
    "editor.codeActions.triggerOnFocusChange": {
      type: "boolean",
      scope: 6 /* LANGUAGE_OVERRIDABLE */,
      markdownDescription: localize(1035, null, "`#editor.codeActionsOnSave#`", "`#files.autoSave#`", "`afterDelay`", "`always`"),
      default: false
    }
  }
});
export {};
