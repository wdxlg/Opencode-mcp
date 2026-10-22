// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/outline/browser/outlineActions.ts
import { MenuId, registerAction2 } from "./module-0092.mjs";
import { ViewAction } from "./module-1335.mjs";
import { IOutlinePane, ctxAllCollapsed, ctxFilterOnType, ctxFollowsCursor, ctxSortMode } from "./module-2003.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";


// src/vs/workbench/contrib/outline/browser/outlineActions.ts
registerAction2(class CollapseAll extends ViewAction {
  constructor() {
    super({
      viewId: IOutlinePane.Id,
      id: "outline.collapse",
      title: localize(17965, null),
      f1: false,
      icon: Codicon.collapseAll,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", IOutlinePane.Id), ctxAllCollapsed.isEqualTo(false))
      }
    });
  }
  runInView(_accessor, view) {
    view.collapseAll();
  }
});

registerAction2(class ExpandAll extends ViewAction {
  constructor() {
    super({
      viewId: IOutlinePane.Id,
      id: "outline.expand",
      title: localize(17966, null),
      f1: false,
      icon: Codicon.expandAll,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", IOutlinePane.Id), ctxAllCollapsed.isEqualTo(true))
      }
    });
  }
  runInView(_accessor, view) {
    view.expandAll();
  }
});

registerAction2(class FollowCursor extends ViewAction {
  constructor() {
    super({
      viewId: IOutlinePane.Id,
      id: "outline.followCursor",
      title: localize(17968, null),
      f1: false,
      toggled: ctxFollowsCursor,
      menu: {
        id: MenuId.ViewTitle,
        group: "config",
        order: 1,
        when: ContextKeyExpr.equals("view", IOutlinePane.Id)
      }
    });
  }
  runInView(_accessor, view) {
    view.outlineViewState.followCursor = !view.outlineViewState.followCursor;
  }
});

registerAction2(class FilterOnType extends ViewAction {
  constructor() {
    super({
      viewId: IOutlinePane.Id,
      id: "outline.filterOnType",
      title: localize(17967, null),
      f1: false,
      toggled: ctxFilterOnType,
      menu: {
        id: MenuId.ViewTitle,
        group: "config",
        order: 2,
        when: ContextKeyExpr.equals("view", IOutlinePane.Id)
      }
    });
  }
  runInView(_accessor, view) {
    view.outlineViewState.filterOnType = !view.outlineViewState.filterOnType;
  }
});

registerAction2(class SortByPosition extends ViewAction {
  constructor() {
    super({
      viewId: IOutlinePane.Id,
      id: "outline.sortByPosition",
      title: localize(17971, null),
      f1: false,
      toggled: ctxSortMode.isEqualTo(0 /* ByPosition */),
      menu: {
        id: MenuId.ViewTitle,
        group: "sort",
        order: 1,
        when: ContextKeyExpr.equals("view", IOutlinePane.Id)
      }
    });
  }
  runInView(_accessor, view) {
    view.outlineViewState.sortBy = 0 /* ByPosition */;
  }
});

registerAction2(class SortByName extends ViewAction {
  constructor() {
    super({
      viewId: IOutlinePane.Id,
      id: "outline.sortByName",
      title: localize(17970, null),
      f1: false,
      toggled: ctxSortMode.isEqualTo(1 /* ByName */),
      menu: {
        id: MenuId.ViewTitle,
        group: "sort",
        order: 2,
        when: ContextKeyExpr.equals("view", IOutlinePane.Id)
      }
    });
  }
  runInView(_accessor, view) {
    view.outlineViewState.sortBy = 1 /* ByName */;
  }
});

registerAction2(class SortByKind extends ViewAction {
  constructor() {
    super({
      viewId: IOutlinePane.Id,
      id: "outline.sortByKind",
      title: localize(17969, null),
      f1: false,
      toggled: ctxSortMode.isEqualTo(2 /* ByKind */),
      menu: {
        id: MenuId.ViewTitle,
        group: "sort",
        order: 3,
        when: ContextKeyExpr.equals("view", IOutlinePane.Id)
      }
    });
  }
  runInView(_accessor, view) {
    view.outlineViewState.sortBy = 2 /* ByKind */;
  }
});
export {};
