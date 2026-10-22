// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchActionsTopBar.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { category2, getSearchView } from "./module-2811.mjs";
import { searchClearIcon, searchCollapseAllIcon, searchExpandAllIcon, searchRefreshIcon, searchShowAsList, searchShowAsTree, searchStopIcon } from "./module-2804.mjs";
import { SearchStateKey } from "./module-1216.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { SearchContext } from "./module-1261.mjs";
import { WorkbenchListFocusContextKey } from "./module-0636.mjs";
import { VIEW_ID } from "./module-1000.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ISearchHistoryService } from "./module-2815.mjs";
import { isSearchResult, isSearchTreeFileMatch, isSearchTreeFolderMatch, isSearchTreeFolderMatchNoRoot, isSearchTreeFolderMatchWorkspaceRoot, isSearchTreeMatch, isTextSearchHeading } from "./module-2519.mjs";


// src/vs/workbench/contrib/search/browser/searchActionsTopBar.ts
registerAction2(class ClearSearchHistoryCommandAction extends Action2 {
  constructor() {
    super({
      id: "search.action.clearHistory" /* ClearSearchHistoryCommandId */,
      title: localize2(19135, "Clear Search History"),
      category: category2,
      f1: true
    });
  }
  async run(accessor) {
    clearHistoryCommand(accessor);
  }
});

registerAction2(class CancelSearchAction extends Action2 {
  constructor() {
    super({
      id: "search.action.cancel" /* CancelSearchActionId */,
      title: localize2(19134, "Cancel Search"),
      icon: searchStopIcon,
      category: category2,
      f1: true,
      precondition: SearchStateKey.isEqualTo(0 /* Idle */).negate(),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(SearchContext.SearchViewVisibleKey, WorkbenchListFocusContextKey),
        primary: 9 /* Escape */
      },
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 0,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_ID), SearchStateKey.isEqualTo(2 /* SlowSearch */))
      }]
    });
  }
  run(accessor) {
    return cancelSearch(accessor);
  }
});

registerAction2(class RefreshAction extends Action2 {
  constructor() {
    super({
      id: "search.action.refreshSearchResults" /* RefreshSearchResultsActionId */,
      title: localize2(19139, "Refresh"),
      icon: searchRefreshIcon,
      precondition: SearchContext.ViewHasSearchPatternKey,
      category: category2,
      f1: true,
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 0,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_ID), SearchStateKey.isEqualTo(2 /* SlowSearch */).negate())
      }]
    });
  }
  run(accessor, ...args2) {
    return refreshSearch(accessor);
  }
});

registerAction2(class CollapseDeepestExpandedLevelAction extends Action2 {
  constructor() {
    super({
      id: "search.action.collapseSearchResults" /* CollapseSearchResultsActionId */,
      title: localize2(19137, "Collapse All"),
      category: category2,
      icon: searchCollapseAllIcon,
      f1: true,
      precondition: ContextKeyExpr.and(SearchContext.HasSearchResults, SearchContext.ViewHasSomeCollapsibleKey),
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 4,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_ID), ContextKeyExpr.or(SearchContext.HasSearchResults.negate(), SearchContext.ViewHasSomeCollapsibleKey))
      }]
    });
  }
  run(accessor, ...args2) {
    return collapseDeepestExpandedLevel(accessor);
  }
});

registerAction2(class ExpandAllAction extends Action2 {
  constructor() {
    super({
      id: "search.action.expandSearchResults" /* ExpandSearchResultsActionId */,
      title: localize2(19138, "Expand All"),
      category: category2,
      icon: searchExpandAllIcon,
      f1: true,
      precondition: ContextKeyExpr.and(SearchContext.HasSearchResults, SearchContext.ViewHasSomeCollapsibleKey.toNegated()),
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 4,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_ID), SearchContext.HasSearchResults, SearchContext.ViewHasSomeCollapsibleKey.toNegated())
      }]
    });
  }
  async run(accessor, ...args2) {
    return expandAll(accessor);
  }
});

registerAction2(class ClearSearchResultsAction extends Action2 {
  constructor() {
    super({
      id: "search.action.clearSearchResults" /* ClearSearchResultsActionId */,
      title: localize2(19136, "Clear Search Results"),
      category: category2,
      icon: searchClearIcon,
      f1: true,
      precondition: ContextKeyExpr.or(SearchContext.HasSearchResults, SearchContext.ViewHasSearchPatternKey, SearchContext.ViewHasReplacePatternKey, SearchContext.ViewHasFilePatternKey),
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 1,
        when: ContextKeyExpr.equals("view", VIEW_ID)
      }]
    });
  }
  run(accessor, ...args2) {
    return clearSearchResults(accessor);
  }
});

registerAction2(class ViewAsTreeAction extends Action2 {
  constructor() {
    super({
      id: "search.action.viewAsTree" /* ViewAsTreeActionId */,
      title: localize2(19142, "View as Tree"),
      category: category2,
      icon: searchShowAsList,
      f1: true,
      precondition: ContextKeyExpr.and(SearchContext.HasSearchResults, SearchContext.InTreeViewKey.toNegated()),
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_ID), SearchContext.InTreeViewKey.toNegated())
      }]
    });
  }
  async run(accessor, ...args2) {
    const searchView = getSearchView(accessor.get(IViewsService));
    if (searchView) {
      await searchView.setTreeView(true);
    }
  }
});

registerAction2(class ViewAsListAction extends Action2 {
  constructor() {
    super({
      id: "search.action.viewAsList" /* ViewAsListActionId */,
      title: localize2(19141, "View as List"),
      category: category2,
      icon: searchShowAsTree,
      f1: true,
      precondition: ContextKeyExpr.and(SearchContext.HasSearchResults, SearchContext.InTreeViewKey),
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", VIEW_ID), SearchContext.InTreeViewKey)
      }]
    });
  }
  async run(accessor, ...args2) {
    const searchView = getSearchView(accessor.get(IViewsService));
    if (searchView) {
      await searchView.setTreeView(false);
    }
  }
});

registerAction2(class SearchWithAIAction extends Action2 {
  constructor() {
    super({
      id: "search.action.searchWithAI" /* SearchWithAIActionId */,
      title: localize2(19140, "Search with AI"),
      category: category2,
      f1: true,
      precondition: SearchContext.hasAIResultProvider,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(SearchContext.hasAIResultProvider, SearchContext.SearchViewFocusedKey),
        primary: 2048 /* CtrlCmd */ | 39 /* KeyI */
      }
    });
  }
  async run(accessor, ...args2) {
    const searchView = getSearchView(accessor.get(IViewsService));
    if (searchView) {
      searchView.requestAIResults();
    }
  }
});

var clearHistoryCommand = (accessor) => {
  const searchHistoryService = accessor.get(ISearchHistoryService);
  searchHistoryService.clearHistory();
};

async function expandAll(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  if (searchView) {
    const viewer = searchView.getControl();
    await forcedExpandRecursively(viewer, void 0);
  }
}

async function forcedExpandRecursively(viewer, element) {
  if (element) {
    if (!viewer.hasNode(element)) {
      return;
    }
    await viewer.expand(element, true);
  }
  const children = viewer.getNode(element)?.children;
  if (children) {
    for (const child of children) {
      if (isSearchResult(child.element)) {
        throw Error("SearchResult should not be a child of a RenderableMatch");
      }
      forcedExpandRecursively(viewer, child.element);
    }
  }
}

function clearSearchResults(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  searchView?.clearSearchResults();
}

function cancelSearch(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  searchView?.cancelSearch();
}

function refreshSearch(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  searchView?.triggerQueryChange({ preserveFocus: false, shouldUpdateAISearch: !searchView.model.searchResult.aiTextSearchResult.hidden });
}

function collapseDeepestExpandedLevel(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  if (searchView) {
    const viewer = searchView.getControl();
    const navigator2 = viewer.navigate();
    let node = navigator2.first();
    let canCollapseFileMatchLevel = false;
    let canCollapseFirstLevel = false;
    do {
      node = navigator2.next();
    } while (isTextSearchHeading(node));
    if (isSearchTreeFolderMatchWorkspaceRoot(node) || searchView.isTreeLayoutViewVisible) {
      while (node = navigator2.next()) {
        if (isTextSearchHeading(node)) {
          continue;
        }
        if (isSearchTreeMatch(node)) {
          canCollapseFileMatchLevel = true;
          break;
        }
        if (searchView.isTreeLayoutViewVisible && !canCollapseFirstLevel) {
          let nodeToTest = node;
          if (isSearchTreeFolderMatch(node)) {
            const compressionStartNode = viewer.getCompressedTreeNode(node)?.elements[0].element;
            nodeToTest = compressionStartNode && !isSearchTreeMatch(compressionStartNode) && !isTextSearchHeading(compressionStartNode) && !isSearchResult(compressionStartNode) ? compressionStartNode : node;
          }
          const immediateParent = nodeToTest.parent();
          if (!(isTextSearchHeading(immediateParent) || isSearchTreeFolderMatchWorkspaceRoot(immediateParent) || isSearchTreeFolderMatchNoRoot(immediateParent) || isSearchResult(immediateParent))) {
            canCollapseFirstLevel = true;
          }
        }
      }
    }
    if (canCollapseFileMatchLevel) {
      node = navigator2.first();
      do {
        if (isSearchTreeFileMatch(node)) {
          viewer.collapse(node);
        }
      } while (node = navigator2.next());
    } else if (canCollapseFirstLevel) {
      node = navigator2.first();
      if (node) {
        do {
          let nodeToTest = node;
          if (isSearchTreeFolderMatch(node)) {
            const compressionStartNode = viewer.getCompressedTreeNode(node)?.elements[0].element;
            nodeToTest = compressionStartNode && !isSearchTreeMatch(compressionStartNode) && !isSearchResult(compressionStartNode) ? compressionStartNode : node;
          }
          const immediateParent = nodeToTest.parent();
          if (isSearchTreeFolderMatchWorkspaceRoot(immediateParent) || isSearchTreeFolderMatchNoRoot(immediateParent)) {
            if (viewer.hasNode(node)) {
              viewer.collapse(node, true);
            } else {
              viewer.collapseAll();
            }
          }
        } while (node = navigator2.next());
      }
    } else if (isTextSearchHeading(navigator2.first())) {
      node = navigator2.first();
      do {
        if (!node) {
          break;
        }
        if (isTextSearchHeading(viewer.getParentElement(node))) {
          viewer.collapse(node);
        }
      } while (node = navigator2.next());
    } else {
      viewer.collapseAll();
    }
    const firstFocusParent = viewer.getFocus()[0]?.parent();
    if (firstFocusParent && (isSearchTreeFolderMatch(firstFocusParent) || isSearchTreeFileMatch(firstFocusParent)) && viewer.hasNode(firstFocusParent) && viewer.isCollapsed(firstFocusParent)) {
      viewer.domFocus();
      viewer.focusFirst();
      viewer.setSelection(viewer.getFocus());
    }
  }
}
export { expandAll, forcedExpandRecursively, clearSearchResults, cancelSearch, refreshSearch, collapseDeepestExpandedLevel, clearHistoryCommand };
