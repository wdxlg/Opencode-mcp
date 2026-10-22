// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/diffEditor.contribution.ts
import { MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { AccessibleDiffViewerNext, AccessibleDiffViewerPrev, CollapseAllUnchangedRegions, ExitCompareMove, RevertHunkOrSelection, ShowAllUnchangedRegions, SwitchSide, ToggleCollapseUnchangedRegions, ToggleShowMovedCodeBlocks, ToggleUseInlineViewWhenSpaceIsLimited } from "./module-0528.mjs";
import { localize } from "./module-0001.mjs";
import { ContextKeyEqualsExpr, ContextKeyExpr } from "./module-0089.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { Codicon } from "./module-0085.mjs";
import { CommandsRegistry } from "./module-0087.mjs";


// src/vs/editor/browser/widget/diffEditor/diffEditor.contribution.ts
registerAction2(ToggleCollapseUnchangedRegions);

registerAction2(ToggleShowMovedCodeBlocks);

registerAction2(ToggleUseInlineViewWhenSpaceIsLimited);

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: {
    id: new ToggleUseInlineViewWhenSpaceIsLimited().desc.id,
    title: localize(246, null),
    toggled: ContextKeyExpr.has("config.diffEditor.useInlineViewWhenSpaceIsLimited"),
    precondition: ContextKeyExpr.has("isInDiffEditor")
  },
  order: 11,
  group: "1_diff",
  when: ContextKeyExpr.and(
    EditorContextKeys.diffEditorRenderSideBySideInlineBreakpointReached,
    ContextKeyExpr.has("isInDiffEditor")
  )
});

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: {
    id: new ToggleShowMovedCodeBlocks().desc.id,
    title: localize(245, null),
    icon: Codicon.move,
    toggled: ContextKeyEqualsExpr.create("config.diffEditor.experimental.showMoves", true),
    precondition: ContextKeyExpr.has("isInDiffEditor")
  },
  order: 10,
  group: "1_diff",
  when: ContextKeyExpr.has("isInDiffEditor")
});

registerAction2(RevertHunkOrSelection);

for (const ctx of [
  { icon: Codicon.arrowRight, key: EditorContextKeys.diffEditorInlineMode.toNegated() },
  { icon: Codicon.discard, key: EditorContextKeys.diffEditorInlineMode }
]) {
  MenuRegistry.appendMenuItem(MenuId.DiffEditorHunkToolbar, {
    command: {
      id: new RevertHunkOrSelection().desc.id,
      title: localize(243, null),
      icon: ctx.icon
    },
    when: ContextKeyExpr.and(EditorContextKeys.diffEditorModifiedWritable, ctx.key),
    order: 5,
    group: "primary"
  });
  MenuRegistry.appendMenuItem(MenuId.DiffEditorSelectionToolbar, {
    command: {
      id: new RevertHunkOrSelection().desc.id,
      title: localize(244, null),
      icon: ctx.icon
    },
    when: ContextKeyExpr.and(EditorContextKeys.diffEditorModifiedWritable, ctx.key),
    order: 5,
    group: "primary"
  });
}

registerAction2(SwitchSide);

registerAction2(ExitCompareMove);

registerAction2(CollapseAllUnchangedRegions);

registerAction2(ShowAllUnchangedRegions);

MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: {
    id: AccessibleDiffViewerNext.id,
    title: localize(242, null),
    precondition: ContextKeyExpr.has("isInDiffEditor")
  },
  order: 10,
  group: "2_diff",
  when: ContextKeyExpr.and(
    EditorContextKeys.accessibleDiffViewerVisible.negate(),
    ContextKeyExpr.has("isInDiffEditor")
  )
});

CommandsRegistry.registerCommandAlias("editor.action.diffReview.next", AccessibleDiffViewerNext.id);

registerAction2(AccessibleDiffViewerNext);

CommandsRegistry.registerCommandAlias("editor.action.diffReview.prev", AccessibleDiffViewerPrev.id);

registerAction2(AccessibleDiffViewerPrev);
export {};
