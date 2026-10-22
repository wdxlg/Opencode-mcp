// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchActionsFind.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { category2, findInFilesCommand, getElementsToOperateOn, getSearchView, openSearchView } from "./module-2836.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { SearchContext } from "./module-1262.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";
import { IExplorerService, getMultiSelectedResources } from "./module-2020.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IViewsService } from "./module-1246.mjs";
import { isSearchTreeFileMatch, isSearchTreeMatch } from "./module-2545.mjs";
import { ExplorerFolderContext, ExplorerRootContext, FilesExplorerFocusCondition, VIEWLET_ID5 } from "./module-1542.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { IsSessionsWindowContext } from "./module-0949.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICommandService } from "./module-0087.mjs";
import { OpenEditorCommandId } from "./module-2833.mjs";
import { forcedExpandRecursively } from "./module-2857.mjs";
import { IFileService } from "./module-0269.mjs";
import { IListService } from "./module-0636.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { dirname2 } from "./module-0034.mjs";
import { resolveResourcesForSearchIncludes } from "./module-1312.mjs";


// src/vs/workbench/contrib/search/browser/searchActionsFind.ts
registerAction2(class RestrictSearchToFolderAction extends Action2 {
  constructor() {
    super({
      id: "search.action.restrictSearchToFolder" /* RestrictSearchToFolderId */,
      title: localize2(19107, "Restrict Search to Folder"),
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(SearchContext.SearchViewVisibleKey, SearchContext.ResourceFolderFocusKey),
        primary: 1024 /* Shift */ | 512 /* Alt */ | 36 /* KeyF */
      },
      menu: [
        {
          id: MenuId.SearchContext,
          group: "search",
          order: 3,
          when: ContextKeyExpr.and(SearchContext.ResourceFolderFocusKey)
        }
      ]
    });
  }
  async run(accessor, folderMatch) {
    await searchWithFolderCommand(accessor, false, true, void 0, folderMatch);
  }
});

registerAction2(class ExpandSelectedTreeCommandAction extends Action2 {
  constructor() {
    super({
      id: "search.action.expandRecursively" /* ExpandRecursivelyCommandId */,
      title: localize(19109, null),
      category: category2,
      menu: [{
        id: MenuId.SearchContext,
        when: ContextKeyExpr.and(
          SearchContext.FolderFocusKey,
          SearchContext.HasSearchResults
        ),
        group: "search",
        order: 4
      }]
    });
  }
  async run(accessor) {
    return expandSelectSubtree(accessor);
  }
});

registerAction2(class ExcludeFolderFromSearchAction extends Action2 {
  constructor() {
    super({
      id: "search.action.excludeFromSearch" /* ExcludeFolderFromSearchId */,
      title: localize2(19099, "Exclude Folder from Search"),
      category: category2,
      menu: [
        {
          id: MenuId.SearchContext,
          group: "search",
          order: 4,
          when: SearchContext.ResourceFolderFocusKey
        }
      ]
    });
  }
  async run(accessor, folderMatch) {
    await searchWithFolderCommand(accessor, false, false, void 0, folderMatch);
  }
});

registerAction2(class ExcludeFileTypeFromSearchAction extends Action2 {
  constructor() {
    super({
      id: "search.action.excludeFileTypeFromSearch" /* ExcludeFileTypeFromSearchId */,
      title: localize2(19098, "Exclude File Type from Search"),
      category: category2,
      menu: [
        {
          id: MenuId.SearchContext,
          group: "search",
          order: 5,
          when: SearchContext.FileFocusKey
        }
      ]
    });
  }
  async run(accessor, fileMatch) {
    await modifySearchFileTypePattern(accessor, fileMatch, true);
  }
});

registerAction2(class IncludeFileTypeInSearchAction extends Action2 {
  constructor() {
    super({
      id: "search.action.includeFileTypeInSearch" /* IncludeFileTypeInSearchId */,
      title: localize2(19105, "Include File Type from Search"),
      category: category2,
      menu: [
        {
          id: MenuId.SearchContext,
          group: "search",
          order: 6,
          when: SearchContext.FileFocusKey
        }
      ]
    });
  }
  async run(accessor, fileMatch) {
    await modifySearchFileTypePattern(accessor, fileMatch, false);
  }
});

registerAction2(class RevealInSideBarForSearchResultsAction extends Action2 {
  constructor() {
    super({
      id: "search.action.revealInSideBar" /* RevealInSideBarForSearchResults */,
      title: localize2(19108, "Reveal in Explorer View"),
      category: category2,
      menu: [{
        id: MenuId.SearchContext,
        when: ContextKeyExpr.and(SearchContext.FileFocusKey, SearchContext.HasSearchResults),
        group: "search_3",
        order: 1
      }]
    });
  }
  async run(accessor, args2) {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const explorerService = accessor.get(IExplorerService);
    const contextService = accessor.get(IWorkspaceContextService);
    const searchView = getSearchView(accessor.get(IViewsService));
    if (!searchView) {
      return;
    }
    let fileMatch;
    if (isSearchTreeFileMatch(args2)) {
      fileMatch = args2;
    } else {
      args2 = searchView.getControl().getFocus()[0];
      return;
    }
    paneCompositeService.openPaneComposite(VIEWLET_ID5, 0 /* Sidebar */, false).then((viewlet) => {
      if (!viewlet) {
        return;
      }
      const explorerViewContainer = viewlet.getViewPaneContainer();
      const uri5 = fileMatch.resource;
      if (uri5 && contextService.isInsideWorkspace(uri5)) {
        const explorerView = explorerViewContainer.getExplorerView();
        explorerView.setExpanded(true);
        explorerService.select(uri5, true).then(() => explorerView.focus(), onUnexpectedError);
      }
    });
  }
});

registerAction2(class FindInFilesAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.findInFiles" /* FindInFilesActionId */,
      title: {
        ...localize2(19100, "Find in Files"),
        mnemonicTitle: localize(19106, null)
      },
      metadata: {
        description: localize(19102, null),
        args: [
          {
            name: localize(19101, null),
            schema: {
              type: "object",
              properties: {
                query: { "type": "string" },
                replace: { "type": "string" },
                preserveCase: { "type": "boolean" },
                triggerSearch: { "type": "boolean" },
                filesToInclude: { "type": "string" },
                filesToExclude: { "type": "string" },
                isRegex: { "type": "boolean" },
                isCaseSensitive: { "type": "boolean" },
                matchWholeWord: { "type": "boolean" },
                useExcludeSettingsAndIgnoreFiles: { "type": "boolean" },
                onlyOpenEditors: { "type": "boolean" },
                showIncludesExcludes: { "type": "boolean" }
              }
            }
          }
        ]
      },
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 36 /* KeyF */
      },
      menu: [{
        id: MenuId.MenubarEditMenu,
        group: "4_find_global",
        order: 1,
        when: IsSessionsWindowContext.negate()
      }],
      f1: true,
      precondition: IsSessionsWindowContext.negate()
    });
  }
  async run(accessor, args2 = {}) {
    findInFilesCommand(accessor, args2);
  }
});

registerAction2(class FindInFolderAction extends Action2 {
  // from explorer
  constructor() {
    super({
      id: "filesExplorer.findInFolder" /* FindInFolderId */,
      title: localize2(19103, "Find in Folder..."),
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(FilesExplorerFocusCondition, ExplorerFolderContext),
        primary: 1024 /* Shift */ | 512 /* Alt */ | 36 /* KeyF */
      },
      menu: [
        {
          id: MenuId.ExplorerContext,
          group: "4_search",
          order: 10,
          when: ExplorerFolderContext
        }
      ]
    });
  }
  async run(accessor, resource) {
    await searchWithFolderCommand(accessor, true, true, resource);
  }
});

registerAction2(class FindInWorkspaceAction extends Action2 {
  // from explorer
  constructor() {
    super({
      id: "filesExplorer.findInWorkspace" /* FindInWorkspaceId */,
      title: localize2(19104, "Find in Workspace..."),
      category: category2,
      menu: [
        {
          id: MenuId.ExplorerContext,
          group: "4_search",
          order: 10,
          when: ContextKeyExpr.and(ExplorerRootContext, ExplorerFolderContext.toNegated())
        }
      ]
    });
  }
  async run(accessor) {
    const searchConfig = accessor.get(IConfigurationService).getValue().search;
    const mode = searchConfig?.mode;
    if (mode === "view") {
      const searchView = await openSearchView(accessor.get(IViewsService), true);
      searchView?.searchInFolders();
    } else {
      await accessor.get(ICommandService).executeCommand(OpenEditorCommandId, {
        location: mode === "newEditor" ? "new" : "reuse",
        filesToInclude: ""
      });
    }
  }
});

async function expandSelectSubtree(accessor) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  if (searchView) {
    const viewer = searchView.getControl();
    const selected = viewer.getFocus()[0];
    await forcedExpandRecursively(viewer, selected);
  }
}

function extractSearchFilePattern(fileName) {
  const parts = fileName.split(".");
  if (parts.length <= 1) {
    return fileName;
  }
  const extensionParts = parts.slice(1);
  return `*.${extensionParts.join(".")}`;
}

function mergeSearchPatternIfNotExists(currentPatterns, newPattern) {
  if (!currentPatterns.trim()) {
    return newPattern;
  }
  const existingPatterns = currentPatterns.split(",").map((pattern) => pattern.trim()).filter((pattern) => pattern.length > 0);
  if (existingPatterns.includes(newPattern)) {
    return currentPatterns;
  }
  return `${currentPatterns}, ${newPattern}`;
}

async function searchWithFolderCommand(accessor, isFromExplorer, isIncludes, resource, folderMatch) {
  const fileService = accessor.get(IFileService);
  const viewsService = accessor.get(IViewsService);
  const contextService = accessor.get(IWorkspaceContextService);
  const commandService = accessor.get(ICommandService);
  const searchConfig = accessor.get(IConfigurationService).getValue().search;
  const mode = searchConfig?.mode;
  let resources;
  if (isFromExplorer) {
    resources = getMultiSelectedResources(resource, accessor.get(IListService), accessor.get(IEditorService), accessor.get(IEditorGroupsService), accessor.get(IExplorerService));
  } else {
    const searchView = getSearchView(viewsService);
    if (!searchView) {
      return;
    }
    resources = getMultiSelectedSearchResources(searchView.getControl(), folderMatch, searchConfig);
  }
  const resolvedResources = fileService.resolveAll(resources.map((resource2) => ({ resource: resource2 }))).then((results) => {
    const folders = [];
    results.forEach((result) => {
      if (result.success && result.stat) {
        folders.push(result.stat.isDirectory ? result.stat.resource : dirname2(result.stat.resource));
      }
    });
    return resolveResourcesForSearchIncludes(folders, contextService);
  });
  if (mode === "view") {
    const searchView = await openSearchView(viewsService, true);
    if (resources && resources.length && searchView) {
      if (isIncludes) {
        searchView.searchInFolders(await resolvedResources);
      } else {
        searchView.searchOutsideOfFolders(await resolvedResources);
      }
    }
    return void 0;
  } else {
    if (isIncludes) {
      return commandService.executeCommand(OpenEditorCommandId, {
        filesToInclude: (await resolvedResources).join(", "),
        showIncludesExcludes: true,
        location: mode === "newEditor" ? "new" : "reuse"
      });
    } else {
      return commandService.executeCommand(OpenEditorCommandId, {
        filesToExclude: (await resolvedResources).join(", "),
        showIncludesExcludes: true,
        location: mode === "newEditor" ? "new" : "reuse"
      });
    }
  }
}

function getMultiSelectedSearchResources(viewer, currElement, sortConfig) {
  return getElementsToOperateOn(viewer, currElement, sortConfig).map((renderableMatch) => isSearchTreeMatch(renderableMatch) ? null : renderableMatch.resource).filter((renderableMatch) => renderableMatch !== null);
}

async function modifySearchFileTypePattern(accessor, fileMatch, isExclude) {
  const viewsService = accessor.get(IViewsService);
  const searchView = getSearchView(viewsService);
  if (!searchView || !fileMatch) {
    return;
  }
  const resource = fileMatch.resource;
  const fileName = resource.path.split("/").pop() || "";
  const newPattern = extractSearchFilePattern(fileName);
  const patternWidget = isExclude ? searchView.searchExcludePattern : searchView.searchIncludePattern;
  const currentPatterns = patternWidget.getValue();
  const updatedPatterns = mergeSearchPatternIfNotExists(currentPatterns, newPattern);
  if (updatedPatterns !== currentPatterns) {
    patternWidget.setValue(updatedPatterns);
    searchView.toggleQueryDetails(false, true);
    searchView.triggerQueryChange({ preserveFocus: false });
  }
}
export { expandSelectSubtree, extractSearchFilePattern, mergeSearchPatternIfNotExists, searchWithFolderCommand, getMultiSelectedSearchResources, modifySearchFileTypePattern };
