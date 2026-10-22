// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/emmet/browser/actions/expandAbbreviation.ts
import { EmmetEditorAction } from "./module-3287.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { MenuId } from "./module-0092.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { registerEditorAction } from "./module-0097.mjs";


// src/vs/workbench/contrib/emmet/browser/actions/expandAbbreviation.ts
var ExpandAbbreviationAction = class extends EmmetEditorAction {
  constructor() {
    super({
      id: "editor.emmet.action.expandAbbreviation",
      label: localize2(14974, "Emmet: Expand Abbreviation"),
      precondition: EditorContextKeys.writable,
      actionName: "expand_abbreviation",
      kbOpts: {
        primary: 2 /* Tab */,
        kbExpr: ContextKeyExpr.and(
          EditorContextKeys.editorTextFocus,
          EditorContextKeys.tabDoesNotMoveFocus,
          ContextKeyExpr.has("config.emmet.triggerExpansionOnTab")
        ),
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarEditMenu,
        group: "5_insert",
        title: localize(14975, null),
        order: 3,
        when: IsSessionsWindowContext.negate()
      }
    });
  }
};

registerEditorAction(ExpandAbbreviationAction);
export { ExpandAbbreviationAction };
