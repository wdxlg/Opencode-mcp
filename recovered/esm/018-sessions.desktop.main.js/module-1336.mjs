// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentsViewActions.ts
import { ContextKeyExpr, RawContextKey } from "./module-0089.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { ViewAction } from "./module-1334.mjs";
import { localize } from "./module-0001.mjs";
import { CommentsViewFilterFocusContextKey } from "./module-1335.mjs";
import { COMMENTS_VIEW_ID } from "./module-1326.mjs";
import { FocusedViewContext } from "./module-0950.mjs";
import { viewFilterSubmenu } from "./module-1332.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/comments/browser/commentsViewActions.ts
var CONTEXT_KEY_SHOW_RESOLVED = new RawContextKey("commentsView.showResolvedFilter", true);

var CONTEXT_KEY_SHOW_UNRESOLVED = new RawContextKey("commentsView.showUnResolvedFilter", true);

var CONTEXT_KEY_SORT_BY = new RawContextKey("commentsView.sortBy", "resourceAscending" /* ResourceAscending */);

var CommentsFilters = class extends Disposable {
  constructor(options3, contextKeyService) {
    super();
    this.contextKeyService = contextKeyService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._showUnresolved = CONTEXT_KEY_SHOW_UNRESOLVED.bindTo(this.contextKeyService);
    this._showResolved = CONTEXT_KEY_SHOW_RESOLVED.bindTo(this.contextKeyService);
    this._sortBy = CONTEXT_KEY_SORT_BY.bindTo(this.contextKeyService);
    this._showResolved.set(options3.showResolved);
    this._showUnresolved.set(options3.showUnresolved);
    this._sortBy.set(options3.sortBy);
  }
  get showUnresolved() {
    return !!this._showUnresolved.get();
  }
  set showUnresolved(showUnresolved) {
    if (this._showUnresolved.get() !== showUnresolved) {
      this._showUnresolved.set(showUnresolved);
      this._onDidChange.fire({ showUnresolved: true });
    }
  }
  get showResolved() {
    return !!this._showResolved.get();
  }
  set showResolved(showResolved) {
    if (this._showResolved.get() !== showResolved) {
      this._showResolved.set(showResolved);
      this._onDidChange.fire({ showResolved: true });
    }
  }
  get sortBy() {
    return this._sortBy.get() ?? "resourceAscending" /* ResourceAscending */;
  }
  set sortBy(sortBy) {
    if (this._sortBy.get() !== sortBy) {
      this._sortBy.set(sortBy);
      this._onDidChange.fire({ sortBy });
    }
  }
};

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "commentsFocusViewFromFilter",
      title: localize(14037, null),
      keybinding: {
        when: CommentsViewFilterFocusContextKey,
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */
      },
      viewId: COMMENTS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, commentsView) {
    commentsView.focus();
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "commentsClearFilterText",
      title: localize(14035, null),
      keybinding: {
        when: CommentsViewFilterFocusContextKey,
        weight: 200 /* WorkbenchContrib */,
        primary: 9 /* Escape */
      },
      viewId: COMMENTS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, commentsView) {
    commentsView.clearFilterText();
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "commentsFocusFilter",
      title: localize(14036, null),
      keybinding: {
        when: FocusedViewContext.isEqualTo(COMMENTS_VIEW_ID),
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 36 /* KeyF */
      },
      viewId: COMMENTS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, commentsView) {
    commentsView.focusFilter();
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.${COMMENTS_VIEW_ID}.toggleUnResolvedComments`,
      title: localize(14044, null),
      category: localize(14034, null),
      toggled: {
        condition: CONTEXT_KEY_SHOW_UNRESOLVED,
        title: localize(14045, null)
      },
      menu: {
        id: viewFilterSubmenu,
        group: "1_filter",
        when: ContextKeyExpr.equals("view", COMMENTS_VIEW_ID),
        order: 1
      },
      viewId: COMMENTS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.filters.showUnresolved = !view.filters.showUnresolved;
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.${COMMENTS_VIEW_ID}.toggleResolvedComments`,
      title: localize(14041, null),
      category: localize(14034, null),
      toggled: {
        condition: CONTEXT_KEY_SHOW_RESOLVED,
        title: localize(14038, null)
      },
      menu: {
        id: viewFilterSubmenu,
        group: "1_filter",
        when: ContextKeyExpr.equals("view", COMMENTS_VIEW_ID),
        order: 1
      },
      viewId: COMMENTS_VIEW_ID
    });
  }
  async runInView(serviceAccessor, view) {
    view.filters.showResolved = !view.filters.showResolved;
  }
});

var commentSortSubmenu = new MenuId("submenu.filter.commentSort");

MenuRegistry.appendMenuItem(viewFilterSubmenu, {
  submenu: commentSortSubmenu,
  title: localize(14033, null),
  group: "2_sort",
  icon: Codicon.history,
  when: ContextKeyExpr.equals("view", COMMENTS_VIEW_ID)
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.${COMMENTS_VIEW_ID}.toggleSortByUpdatedAt`,
      title: localize(14043, null),
      category: localize(14034, null),
      icon: Codicon.history,
      viewId: COMMENTS_VIEW_ID,
      toggled: {
        condition: ContextKeyExpr.equals(CONTEXT_KEY_SORT_BY.key, "updatedAtDescending" /* UpdatedAtDescending */),
        title: localize(14040, null)
      },
      menu: {
        id: commentSortSubmenu,
        group: "navigation",
        order: 1,
        isHiddenByDefault: false
      }
    });
  }
  async runInView(serviceAccessor, view) {
    view.filters.sortBy = "updatedAtDescending" /* UpdatedAtDescending */;
  }
});

registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: `workbench.actions.${COMMENTS_VIEW_ID}.toggleSortByResource`,
      title: localize(14042, null),
      category: localize(14034, null),
      icon: Codicon.history,
      viewId: COMMENTS_VIEW_ID,
      toggled: {
        condition: ContextKeyExpr.equals(CONTEXT_KEY_SORT_BY.key, "resourceAscending" /* ResourceAscending */),
        title: localize(14039, null)
      },
      menu: {
        id: commentSortSubmenu,
        group: "navigation",
        order: 0,
        isHiddenByDefault: false
      }
    });
  }
  async runInView(serviceAccessor, view) {
    view.filters.sortBy = "resourceAscending" /* ResourceAscending */;
  }
});
export { CONTEXT_KEY_SHOW_RESOLVED, CONTEXT_KEY_SHOW_UNRESOLVED, CONTEXT_KEY_SORT_BY, CommentsFilters, commentSortSubmenu };
