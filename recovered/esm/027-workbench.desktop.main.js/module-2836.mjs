// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchActionsBase.ts
import { localize2 } from "./module-0001.mjs";
import { isAncestorOfActiveElement } from "./module-0075.mjs";
import { VIEW_ID } from "./module-0999.mjs";
import { searchComparer } from "./module-2835.mjs";
import { isSearchTreeFileMatch, isSearchTreeFolderMatch, isSearchTreeMatch } from "./module-2545.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationResolverService } from "./module-1405.mjs";
import { IHistoryService } from "./module-1494.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { Schemas } from "./module-0033.mjs";
import { OpenEditorCommandId } from "./module-2833.mjs";


// src/vs/workbench/contrib/search/browser/searchActionsBase.ts
var category2 = localize2(19093, "Search");

function isSearchViewFocused(viewsService) {
  const searchView = getSearchView(viewsService);
  return !!(searchView && isAncestorOfActiveElement(searchView.getContainer()));
}

function getSearchView(viewsService) {
  return viewsService.getActiveViewWithId(VIEW_ID);
}

function getElementsToOperateOn(viewer, currElement, sortConfig) {
  let elements = viewer.getSelection().filter((x) => x !== null).sort((a, b) => searchComparer(a, b, sortConfig?.sortOrder));
  if (currElement && !(elements.length > 1 && elements.includes(currElement))) {
    elements = [currElement];
  }
  return elements;
}

function shouldRefocus(elements, focusElement) {
  if (!focusElement) {
    return false;
  }
  return !focusElement || elements.includes(focusElement) || hasDownstreamMatch(elements, focusElement);
}

function hasDownstreamMatch(elements, focusElement) {
  for (const elem of elements) {
    if (isSearchTreeFileMatch(elem) && isSearchTreeMatch(focusElement) && elem.matches().includes(focusElement) || isSearchTreeFolderMatch(elem) && (isSearchTreeFileMatch(focusElement) && elem.getDownstreamFileMatch(focusElement.resource) || isSearchTreeMatch(focusElement) && elem.getDownstreamFileMatch(focusElement.parent().resource))) {
      return true;
    }
  }
  return false;
}

function openSearchView(viewsService, focus) {
  return viewsService.openView(VIEW_ID, focus).then((view) => view ?? void 0);
}

async function findInFilesCommand(accessor, _args = {}) {
  const searchConfig = accessor.get(IConfigurationService).getValue().search;
  const viewsService = accessor.get(IViewsService);
  const commandService = accessor.get(ICommandService);
  const args2 = {};
  if (Object.keys(_args).length !== 0) {
    const configurationResolverService = accessor.get(IConfigurationResolverService);
    const historyService = accessor.get(IHistoryService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot();
    const filteredActiveWorkspaceRootUri = activeWorkspaceRootUri?.scheme === Schemas.file || activeWorkspaceRootUri?.scheme === Schemas.vscodeRemote ? activeWorkspaceRootUri : void 0;
    const lastActiveWorkspaceRoot = filteredActiveWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(filteredActiveWorkspaceRootUri) ?? void 0 : void 0;
    for (const entry of Object.entries(_args)) {
      const name = entry[0];
      const value2 = entry[1];
      if (value2 !== void 0) {
        args2[name] = typeof value2 === "string" ? await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, value2) : value2;
      }
    }
  }
  const mode = searchConfig?.mode;
  if (mode === "view") {
    openSearchView(viewsService, false).then((openedView) => {
      if (openedView) {
        const searchAndReplaceWidget = openedView.searchAndReplaceWidget;
        searchAndReplaceWidget.toggleReplace(typeof args2.replace === "string");
        let updatedText = false;
        if (typeof args2.query !== "string") {
          updatedText = openedView.updateTextFromFindWidgetOrSelection({ allowUnselectedWord: typeof args2.replace !== "string" });
        }
        openedView.setSearchParameters(args2);
        if (typeof args2.showIncludesExcludes === "boolean") {
          openedView.toggleQueryDetails(false, args2.showIncludesExcludes);
        }
        openedView.searchAndReplaceWidget.focus(void 0, updatedText, updatedText);
      }
    });
  } else {
    const convertArgs = (args3) => ({
      location: mode === "newEditor" ? "new" : "reuse",
      query: args3.query,
      filesToInclude: args3.filesToInclude,
      filesToExclude: args3.filesToExclude,
      matchWholeWord: args3.matchWholeWord,
      isCaseSensitive: args3.isCaseSensitive,
      isRegexp: args3.isRegex,
      useExcludeSettingsAndIgnoreFiles: args3.useExcludeSettingsAndIgnoreFiles,
      onlyOpenEditors: args3.onlyOpenEditors,
      showIncludesExcludes: !!(args3.filesToExclude || args3.filesToExclude || !args3.useExcludeSettingsAndIgnoreFiles)
    });
    commandService.executeCommand(OpenEditorCommandId, convertArgs(args2));
  }
}
export { isSearchViewFocused, getSearchView, getElementsToOperateOn, shouldRefocus, hasDownstreamMatch, openSearchView, findInFilesCommand, category2 };
