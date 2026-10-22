// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/codeAction/browser/codeActionMenu.ts
import { HierarchicalKind } from "./module-0535.mjs";
import { localize } from "./module-0001.mjs";
import { CodeActionKind } from "./module-0558.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/editor/contrib/codeAction/browser/codeActionMenu.ts
var uncategorizedCodeActionGroup = Object.freeze({ kind: HierarchicalKind.Empty, title: localize(1042, null) });

var codeActionGroups = Object.freeze([
  { kind: CodeActionKind.QuickFix, title: localize(1044, null) },
  { kind: CodeActionKind.RefactorExtract, title: localize(1040, null), icon: Codicon.wrench },
  { kind: CodeActionKind.RefactorInline, title: localize(1041, null), icon: Codicon.wrench },
  { kind: CodeActionKind.RefactorRewrite, title: localize(1039, null), icon: Codicon.wrench },
  { kind: CodeActionKind.RefactorMove, title: localize(1043, null), icon: Codicon.wrench },
  { kind: CodeActionKind.SurroundWith, title: localize(1046, null), icon: Codicon.surroundWith },
  { kind: CodeActionKind.Source, title: localize(1045, null), icon: Codicon.symbolFile },
  uncategorizedCodeActionGroup
]);

function toMenuItems(inputCodeActions, showHeaders, keybindingResolver) {
  if (!showHeaders) {
    return inputCodeActions.map((action) => {
      return {
        kind: "action" /* Action */,
        item: action,
        group: uncategorizedCodeActionGroup,
        disabled: !!action.action.disabled,
        label: action.action.disabled || action.action.title,
        canPreview: !!action.action.edit?.edits.length
      };
    });
  }
  const menuEntries = codeActionGroups.map((group2) => ({ group: group2, actions: [] }));
  for (const action of inputCodeActions) {
    const kind = action.action.kind ? new HierarchicalKind(action.action.kind) : HierarchicalKind.None;
    for (const menuEntry of menuEntries) {
      if (menuEntry.group.kind.contains(kind)) {
        menuEntry.actions.push(action);
        break;
      }
    }
  }
  const allMenuItems = [];
  for (const menuEntry of menuEntries) {
    if (menuEntry.actions.length) {
      allMenuItems.push({ kind: "header" /* Header */, group: menuEntry.group });
      for (const action of menuEntry.actions) {
        const group2 = menuEntry.group;
        allMenuItems.push({
          kind: "action" /* Action */,
          item: action,
          group: action.action.isAI ? { title: group2.title, kind: group2.kind, icon: Codicon.sparkle } : group2,
          label: action.action.title,
          disabled: !!action.action.disabled,
          keybinding: keybindingResolver(action.action)
        });
      }
    }
  }
  return allMenuItems;
}
export { toMenuItems, uncategorizedCodeActionGroup, codeActionGroups };
