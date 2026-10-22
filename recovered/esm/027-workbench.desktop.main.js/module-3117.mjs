// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchActionsRemoveReplace.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { category2, getElementsToOperateOn, getSearchView, shouldRefocus } from "./module-2836.mjs";
import { searchRemoveIcon, searchReplaceIcon } from "./module-2829.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { SearchContext } from "./module-1262.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { arrayContainsElementOrParent, isSearchResult, isSearchTreeFileMatch, isSearchTreeFolderMatch, isSearchTreeMatch, isTextSearchHeading } from "./module-2545.mjs";
import { getSelectionKeyboardEvent } from "./module-0636.mjs";
import { equals } from "./module-0007.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { MatchInNotebook } from "./module-2853.mjs";
import { IReplaceService } from "./module-2839.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { AITextSearchHeadingImpl } from "./module-2856.mjs";


// src/vs/workbench/contrib/search/browser/searchActionsRemoveReplace.ts
registerAction2(class RemoveAction2 extends Action2 {
  constructor() {
    super({
      id: "search.action.remove" /* RemoveActionId */,
      title: localize2(19129, "Dismiss"),
      category: category2,
      icon: searchRemoveIcon,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(SearchContext.SearchViewVisibleKey, SearchContext.FileMatchOrMatchFocusKey),
        primary: 20 /* Delete */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 1 /* Backspace */
        }
      },
      menu: [
        {
          id: MenuId.SearchContext,
          group: "search",
          order: 2
        },
        {
          id: MenuId.SearchActionMenu,
          group: "inline",
          when: ContextKeyExpr.or(SearchContext.FileFocusKey, SearchContext.MatchFocusKey, SearchContext.FolderFocusKey),
          order: 2
        }
      ]
    });
  }
  async run(accessor, context2) {
    const viewsService = accessor.get(IViewsService);
    const configurationService = accessor.get(IConfigurationService);
    const searchView = getSearchView(viewsService);
    if (!searchView) {
      return;
    }
    let element = context2?.element;
    let viewer = context2?.viewer;
    if (!viewer) {
      viewer = searchView.getControl();
    }
    if (!element) {
      element = viewer.getFocus()[0] ?? void 0;
    }
    const elementsToRemove = getElementsToOperateOn(viewer, element, configurationService.getValue("search"));
    let focusElement = viewer.getFocus()[0] ?? void 0;
    if (elementsToRemove.length === 0) {
      return;
    }
    if (!focusElement || isSearchResult(focusElement)) {
      focusElement = element;
    }
    let nextFocusElement;
    const shouldRefocusMatch = shouldRefocus(elementsToRemove, focusElement);
    if (focusElement && shouldRefocusMatch) {
      nextFocusElement = await getElementToFocusAfterRemoved(viewer, focusElement, elementsToRemove);
    }
    const searchResult = searchView.searchResult;
    if (searchResult) {
      searchResult.batchRemove(elementsToRemove);
    }
    await searchView.queueRefreshTree();
    if (focusElement && shouldRefocusMatch) {
      if (!nextFocusElement) {
        nextFocusElement = await getLastNodeFromSameType(viewer, focusElement).catch(() => {
        });
      }
      if (nextFocusElement && !arrayContainsElementOrParent(nextFocusElement, elementsToRemove)) {
        viewer.reveal(nextFocusElement);
        viewer.setFocus([nextFocusElement], getSelectionKeyboardEvent());
        viewer.setSelection([nextFocusElement], getSelectionKeyboardEvent());
      }
    } else if (!equals(viewer.getFocus(), viewer.getSelection())) {
      viewer.setSelection(viewer.getFocus());
    }
    viewer.domFocus();
    return;
  }
});

registerAction2(class ReplaceAction extends Action2 {
  constructor() {
    super({
      id: "search.action.replace" /* ReplaceActionId */,
      title: localize2(19128, "Replace"),
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(SearchContext.SearchViewVisibleKey, SearchContext.ReplaceActiveKey, SearchContext.MatchFocusKey, SearchContext.IsEditableItemKey),
        primary: 1024 /* Shift */ | 2048 /* CtrlCmd */ | 22 /* Digit1 */
      },
      icon: searchReplaceIcon,
      menu: [
        {
          id: MenuId.SearchContext,
          when: ContextKeyExpr.and(SearchContext.ReplaceActiveKey, SearchContext.MatchFocusKey, SearchContext.IsEditableItemKey),
          group: "search",
          order: 1
        },
        {
          id: MenuId.SearchActionMenu,
          when: ContextKeyExpr.and(SearchContext.ReplaceActiveKey, SearchContext.MatchFocusKey, SearchContext.IsEditableItemKey),
          group: "inline",
          order: 1
        }
      ]
    });
  }
  async run(accessor, context2) {
    return performReplace(accessor, context2);
  }
});

registerAction2(class ReplaceAllAction2 extends Action2 {
  constructor() {
    super({
      id: "search.action.replaceAllInFile" /* ReplaceAllInFileActionId */,
      title: localize2(19127, "Replace All"),
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(SearchContext.SearchViewVisibleKey, SearchContext.ReplaceActiveKey, SearchContext.FileFocusKey, SearchContext.IsEditableItemKey),
        primary: 1024 /* Shift */ | 2048 /* CtrlCmd */ | 22 /* Digit1 */,
        secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 3 /* Enter */]
      },
      icon: searchReplaceIcon,
      menu: [
        {
          id: MenuId.SearchContext,
          when: ContextKeyExpr.and(SearchContext.ReplaceActiveKey, SearchContext.FileFocusKey, SearchContext.IsEditableItemKey),
          group: "search",
          order: 1
        },
        {
          id: MenuId.SearchActionMenu,
          when: ContextKeyExpr.and(SearchContext.ReplaceActiveKey, SearchContext.FileFocusKey, SearchContext.IsEditableItemKey),
          group: "inline",
          order: 1
        }
      ]
    });
  }
  async run(accessor, context2) {
    return performReplace(accessor, context2);
  }
});

registerAction2(class ReplaceAllInFolderAction extends Action2 {
  constructor() {
    super({
      id: "search.action.replaceAllInFolder" /* ReplaceAllInFolderActionId */,
      title: localize2(19127, "Replace All"),
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(SearchContext.SearchViewVisibleKey, SearchContext.ReplaceActiveKey, SearchContext.FolderFocusKey, SearchContext.IsEditableItemKey),
        primary: 1024 /* Shift */ | 2048 /* CtrlCmd */ | 22 /* Digit1 */,
        secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 3 /* Enter */]
      },
      icon: searchReplaceIcon,
      menu: [
        {
          id: MenuId.SearchContext,
          when: ContextKeyExpr.and(SearchContext.ReplaceActiveKey, SearchContext.FolderFocusKey, SearchContext.IsEditableItemKey),
          group: "search",
          order: 1
        },
        {
          id: MenuId.SearchActionMenu,
          when: ContextKeyExpr.and(SearchContext.ReplaceActiveKey, SearchContext.FolderFocusKey, SearchContext.IsEditableItemKey),
          group: "inline",
          order: 1
        }
      ]
    });
  }
  async run(accessor, context2) {
    return performReplace(accessor, context2);
  }
});

async function performReplace(accessor, context2) {
  const configurationService = accessor.get(IConfigurationService);
  const viewsService = accessor.get(IViewsService);
  const instantiationService = accessor.get(IInstantiationService);
  const viewlet = getSearchView(viewsService);
  const viewer = context2?.viewer ?? viewlet?.getControl();
  if (!viewer) {
    return;
  }
  const element = context2?.element ?? viewer.getFocus()[0];
  const elementsToReplace = getElementsToOperateOn(viewer, element ?? void 0, configurationService.getValue("search"));
  let focusElement = viewer.getFocus()[0];
  if (!focusElement || focusElement && !arrayContainsElementOrParent(focusElement, elementsToReplace) || isSearchResult(focusElement)) {
    focusElement = element;
  }
  if (elementsToReplace.length === 0) {
    return;
  }
  let nextFocusElement;
  if (focusElement) {
    nextFocusElement = await getElementToFocusAfterRemoved(viewer, focusElement, elementsToReplace);
  }
  const searchResult = viewlet?.searchResult;
  if (searchResult) {
    await searchResult.batchReplace(elementsToReplace);
  }
  await viewlet?.queueRefreshTree();
  if (focusElement) {
    if (!nextFocusElement) {
      nextFocusElement = await getLastNodeFromSameType(viewer, focusElement);
    }
    if (nextFocusElement) {
      viewer.reveal(nextFocusElement);
      viewer.setFocus([nextFocusElement], getSelectionKeyboardEvent());
      viewer.setSelection([nextFocusElement], getSelectionKeyboardEvent());
      if (isSearchTreeMatch(nextFocusElement)) {
        const useReplacePreview = configurationService.getValue().search?.useReplacePreview;
        if (!useReplacePreview || instantiationService.invokeFunction((accessor2) => hasToOpenFile(accessor2, nextFocusElement)) || nextFocusElement instanceof MatchInNotebook) {
          viewlet?.open(nextFocusElement, true);
        } else {
          instantiationService.invokeFunction((accessor2) => accessor2.get(IReplaceService)).openReplacePreview(nextFocusElement, true);
        }
      } else if (isSearchTreeFileMatch(nextFocusElement)) {
        viewlet?.open(nextFocusElement, true);
      }
    }
  }
  viewer.domFocus();
}

function hasToOpenFile(accessor, currBottomElem) {
  if (!isSearchTreeMatch(currBottomElem)) {
    return false;
  }
  const activeEditor = accessor.get(IEditorService).activeEditor;
  const file = activeEditor?.resource;
  if (file) {
    return accessor.get(IUriIdentityService).extUri.isEqual(file, currBottomElem.parent().resource);
  }
  return false;
}

function compareLevels(elem1, elem2) {
  if (isSearchTreeMatch(elem1)) {
    if (isSearchTreeMatch(elem2)) {
      return 0;
    } else {
      return -1;
    }
  } else if (isSearchTreeFileMatch(elem1)) {
    if (isSearchTreeMatch(elem2)) {
      return 1;
    } else if (isSearchTreeFileMatch(elem2)) {
      return 0;
    } else {
      return -1;
    }
  } else if (isSearchTreeFolderMatch(elem1)) {
    if (isTextSearchHeading(elem2)) {
      return -1;
    } else if (isSearchTreeFolderMatch(elem2)) {
      return 0;
    } else {
      return 1;
    }
  } else {
    if (isTextSearchHeading(elem2)) {
      return 0;
    } else {
      return 1;
    }
  }
}

async function getElementToFocusAfterRemoved(viewer, element, elementsToRemove) {
  const navigator2 = viewer.navigate(element);
  if (isSearchTreeFolderMatch(element)) {
    while (!!navigator2.next() && (!isSearchTreeFolderMatch(navigator2.current()) || arrayContainsElementOrParent(navigator2.current(), elementsToRemove))) {
    }
  } else if (isSearchTreeFileMatch(element)) {
    while (!!navigator2.next() && (!isSearchTreeFileMatch(navigator2.current()) || arrayContainsElementOrParent(navigator2.current(), elementsToRemove))) {
      if (navigator2.current() instanceof AITextSearchHeadingImpl) {
        return navigator2.current();
      }
      await viewer.expand(navigator2.current());
    }
  } else {
    while (navigator2.next() && (!isSearchTreeMatch(navigator2.current()) || arrayContainsElementOrParent(navigator2.current(), elementsToRemove))) {
      if (navigator2.current() instanceof AITextSearchHeadingImpl) {
        return navigator2.current();
      }
      await viewer.expand(navigator2.current());
    }
  }
  return navigator2.current();
}

async function getLastNodeFromSameType(viewer, element) {
  let lastElem = viewer.lastVisibleElement ?? null;
  while (lastElem) {
    const compareVal = compareLevels(element, lastElem);
    if (compareVal === -1) {
      const expanded2 = await viewer.expand(lastElem);
      if (!expanded2) {
        return lastElem;
      }
      lastElem = viewer.lastVisibleElement;
    } else if (compareVal === 1) {
      const potentialLastElem = viewer.getParentElement(lastElem);
      if (isSearchResult(potentialLastElem)) {
        break;
      } else {
        lastElem = potentialLastElem;
      }
    } else {
      return lastElem;
    }
  }
  return void 0;
}
export { performReplace, hasToOpenFile, compareLevels, getElementToFocusAfterRemoved, getLastNodeFromSameType };
