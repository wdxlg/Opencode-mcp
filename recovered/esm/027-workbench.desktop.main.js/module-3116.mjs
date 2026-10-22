// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchActionsNav.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { category2, getSearchView, openSearchView } from "./module-2836.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { SearchContext } from "./module-1262.mjs";
import { InSearchEditor } from "./module-2833.mjs";
import { getActiveElement } from "./module-0075.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IViewsService } from "./module-1246.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { ToggleCaseSensitiveKeybinding, TogglePreserveCaseKeybinding, ToggleRegexKeybinding, ToggleWholeWordKeybinding } from "./module-0595.mjs";
import { isSearchTreeFolderMatch } from "./module-2545.mjs";
import { SearchEditorInput } from "./module-2843.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IsSessionsWindowContext } from "./module-0949.mjs";


// src/vs/workbench/contrib/search/browser/searchActionsNav.ts
registerAction2(class ToggleQueryDetailsAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.search.toggleQueryDetails" /* ToggleQueryDetailsActionId */,
      title: localize2(19123, "Toggle Query Details"),
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.or(SearchContext.SearchViewFocusedKey, InSearchEditor),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 40 /* KeyJ */
      }
    });
  }
  run(accessor, ...args2) {
    const options3 = args2[0];
    const contextService = accessor.get(IContextKeyService).getContext(getActiveElement());
    if (contextService.getValue(InSearchEditor.serialize())) {
      accessor.get(IEditorService).activeEditorPane.toggleQueryDetails(options3?.show);
    } else if (contextService.getValue(SearchContext.SearchViewFocusedKey.serialize())) {
      const searchView = getSearchView(accessor.get(IViewsService));
      assertReturnsDefined(searchView).toggleQueryDetails(void 0, options3?.show);
    }
  }
});

registerAction2(class CloseReplaceAction extends Action2 {
  constructor() {
    super({
      id: "closeReplaceInFilesWidget" /* CloseReplaceWidgetActionId */,
      title: localize2(19111, "Close Replace Widget"),
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(SearchContext.SearchViewVisibleKey, SearchContext.ReplaceInputBoxFocusedKey),
        primary: 9 /* Escape */
      }
    });
  }
  run(accessor) {
    const searchView = getSearchView(accessor.get(IViewsService));
    if (searchView) {
      searchView.searchAndReplaceWidget.toggleReplace(false);
      searchView.searchAndReplaceWidget.focus();
    }
    return Promise.resolve(null);
  }
});

registerAction2(class ToggleCaseSensitiveCommandAction extends Action2 {
  constructor() {
    super({
      id: "toggleSearchCaseSensitive" /* ToggleCaseSensitiveCommandId */,
      title: localize2(19121, "Toggle Case Sensitive"),
      category: category2,
      keybinding: Object.assign({
        weight: 200 /* WorkbenchContrib */,
        when: isMacintosh ? ContextKeyExpr.and(SearchContext.SearchViewFocusedKey, SearchContext.FileMatchOrFolderMatchFocusKey.toNegated()) : SearchContext.SearchViewFocusedKey
      }, ToggleCaseSensitiveKeybinding)
    });
  }
  async run(accessor) {
    toggleCaseSensitiveCommand(accessor);
  }
});

registerAction2(class ToggleWholeWordCommandAction extends Action2 {
  constructor() {
    super({
      id: "toggleSearchWholeWord" /* ToggleWholeWordCommandId */,
      title: localize2(19126, "Toggle Whole Word"),
      keybinding: Object.assign({
        weight: 200 /* WorkbenchContrib */,
        when: SearchContext.SearchViewFocusedKey
      }, ToggleWholeWordKeybinding),
      category: category2
    });
  }
  async run(accessor) {
    return toggleWholeWordCommand(accessor);
  }
});

registerAction2(class ToggleRegexCommandAction extends Action2 {
  constructor() {
    super({
      id: "toggleSearchRegex" /* ToggleRegexCommandId */,
      title: localize2(19124, "Toggle Regex"),
      keybinding: Object.assign({
        weight: 200 /* WorkbenchContrib */,
        when: SearchContext.SearchViewFocusedKey
      }, ToggleRegexKeybinding),
      category: category2
    });
  }
  async run(accessor) {
    return toggleRegexCommand(accessor);
  }
});

registerAction2(class TogglePreserveCaseAction extends Action2 {
  constructor() {
    super({
      id: "toggleSearchPreserveCase" /* TogglePreserveCaseId */,
      title: localize2(19122, "Toggle Preserve Case"),
      keybinding: Object.assign({
        weight: 200 /* WorkbenchContrib */,
        when: SearchContext.SearchViewFocusedKey
      }, TogglePreserveCaseKeybinding),
      category: category2
    });
  }
  async run(accessor) {
    return togglePreserveCaseCommand(accessor);
  }
});

registerAction2(class OpenMatchAction extends Action2 {
  constructor() {
    super({
      id: "search.action.openResult" /* OpenMatch */,
      title: localize2(19118, "Open Match"),
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(SearchContext.SearchViewVisibleKey, SearchContext.FileMatchOrMatchFocusKey),
        primary: 3 /* Enter */,
        mac: {
          primary: 3 /* Enter */,
          secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */]
        }
      }
    });
  }
  run(accessor) {
    const searchView = getSearchView(accessor.get(IViewsService));
    if (searchView) {
      const tree = searchView.getControl();
      const viewer = searchView.getControl();
      const focus = tree.getFocus()[0];
      if (isSearchTreeFolderMatch(focus)) {
        viewer.toggleCollapsed(focus);
      } else {
        searchView.open(tree.getFocus()[0], false, false, true);
      }
    }
  }
});

registerAction2(class OpenMatchToSideAction extends Action2 {
  constructor() {
    super({
      id: "search.action.openResultToSide" /* OpenMatchToSide */,
      title: localize2(19119, "Open Match To Side"),
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(SearchContext.SearchViewVisibleKey, SearchContext.FileMatchOrMatchFocusKey),
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        mac: {
          primary: 256 /* WinCtrl */ | 3 /* Enter */
        }
      }
    });
  }
  run(accessor) {
    const searchView = getSearchView(accessor.get(IViewsService));
    if (searchView) {
      const tree = searchView.getControl();
      searchView.open(tree.getFocus()[0], false, true, true);
    }
  }
});

registerAction2(class AddCursorsAtSearchResultsAction extends Action2 {
  constructor() {
    super({
      id: "addCursorsAtSearchResults" /* AddCursorsAtSearchResults */,
      title: localize2(19110, "Add Cursors at Search Results"),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(SearchContext.SearchViewVisibleKey, SearchContext.FileMatchOrMatchFocusKey),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 42 /* KeyL */
      },
      category: category2
    });
  }
  async run(accessor) {
    const searchView = getSearchView(accessor.get(IViewsService));
    if (searchView) {
      const tree = searchView.getControl();
      searchView.openEditorWithMultiCursor(tree.getFocus()[0]);
    }
  }
});

registerAction2(class FocusNextInputAction extends Action2 {
  constructor() {
    super({
      id: "search.focus.nextInputBox" /* FocusNextInputActionId */,
      title: localize2(19112, "Focus Next Input"),
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.or(
          ContextKeyExpr.and(InSearchEditor, SearchContext.InputBoxFocusedKey),
          ContextKeyExpr.and(SearchContext.SearchViewVisibleKey, SearchContext.InputBoxFocusedKey)
        ),
        primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const input = editorService.activeEditor;
    if (input instanceof SearchEditorInput) {
      editorService.activeEditorPane.focusNextInput();
    }
    const searchView = getSearchView(accessor.get(IViewsService));
    searchView?.focusNextInputBox();
  }
});

registerAction2(class FocusPreviousInputAction extends Action2 {
  constructor() {
    super({
      id: "search.focus.previousInputBox" /* FocusPreviousInputActionId */,
      title: localize2(19114, "Focus Previous Input"),
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.or(
          ContextKeyExpr.and(InSearchEditor, SearchContext.InputBoxFocusedKey),
          ContextKeyExpr.and(SearchContext.SearchViewVisibleKey, SearchContext.InputBoxFocusedKey, SearchContext.SearchInputBoxFocusedKey.toNegated())
        ),
        primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const input = editorService.activeEditor;
    if (input instanceof SearchEditorInput) {
      editorService.activeEditorPane.focusPrevInput();
    }
    const searchView = getSearchView(accessor.get(IViewsService));
    searchView?.focusPreviousInputBox();
  }
});

registerAction2(class FocusSearchFromResultsAction extends Action2 {
  constructor() {
    super({
      id: "search.action.focusSearchFromResults" /* FocusSearchFromResults */,
      title: localize2(19116, "Focus Search From Results"),
      category: category2,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(SearchContext.SearchViewVisibleKey, ContextKeyExpr.or(SearchContext.FirstMatchFocusKey, CONTEXT_ACCESSIBILITY_MODE_ENABLED)),
        primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */
      }
    });
  }
  run(accessor) {
    const searchView = getSearchView(accessor.get(IViewsService));
    searchView?.focusPreviousInputBox();
  }
});

registerAction2(class ToggleSearchOnTypeAction extends Action2 {
  static {
    this.searchOnTypeKey = "search.searchOnType";
  }
  constructor() {
    super({
      id: "workbench.action.toggleSearchOnType" /* ToggleSearchOnTypeActionId */,
      title: localize2(19125, "Toggle Search on Type"),
      category: category2
    });
  }
  async run(accessor) {
    const configurationService = accessor.get(IConfigurationService);
    const searchOnType = configurationService.getValue(ToggleSearchOnTypeAction.searchOnTypeKey);
    return configurationService.updateValue(ToggleSearchOnTypeAction.searchOnTypeKey, !searchOnType);
  }
});

registerAction2(class FocusSearchListCommandAction extends Action2 {
  constructor() {
    super({
      id: "search.action.focusSearchList" /* FocusSearchListCommandID */,
      title: localize2(19117, "Focus List"),
      category: category2,
      f1: true
    });
  }
  async run(accessor) {
    focusSearchListCommand(accessor);
  }
});

registerAction2(class FocusNextSearchResultAction extends Action2 {
  constructor() {
    super({
      id: "search.action.focusNextSearchResult" /* FocusNextSearchResultActionId */,
      title: localize2(19113, "Focus Next Search Result"),
      keybinding: [{
        primary: 62 /* F4 */,
        weight: 200 /* WorkbenchContrib */
      }],
      category: category2,
      f1: true,
      precondition: ContextKeyExpr.or(SearchContext.HasSearchResults, InSearchEditor)
    });
  }
  async run(accessor) {
    return await focusNextSearchResult(accessor);
  }
});

registerAction2(class FocusPreviousSearchResultAction extends Action2 {
  constructor() {
    super({
      id: "search.action.focusPreviousSearchResult" /* FocusPreviousSearchResultActionId */,
      title: localize2(19115, "Focus Previous Search Result"),
      keybinding: [{
        primary: 1024 /* Shift */ | 62 /* F4 */,
        weight: 200 /* WorkbenchContrib */
      }],
      category: category2,
      f1: true,
      precondition: ContextKeyExpr.or(SearchContext.HasSearchResults, InSearchEditor)
    });
  }
  async run(accessor) {
    return await focusPreviousSearchResult(accessor);
  }
});

registerAction2(class ReplaceInFilesAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.replaceInFiles" /* ReplaceInFilesActionId */,
      title: localize2(19120, "Replace in Files"),
      keybinding: [{
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 38 /* KeyH */,
        weight: 200 /* WorkbenchContrib */
      }],
      category: category2,
      f1: true,
      precondition: IsSessionsWindowContext.negate(),
      menu: [{
        id: MenuId.MenubarEditMenu,
        group: "4_find_global",
        order: 2,
        when: IsSessionsWindowContext.negate()
      }]
    });
  }
  async run(accessor) {
    return await findOrReplaceInFiles(accessor, true);
  }
});

function toggleCaseSensitiveCommand(accessor) {
  const searchView = getSearchView(accessor.get(IViewsService));
  searchView?.toggleCaseSensitive();
}

function toggleWholeWordCommand(accessor) {
  const searchView = getSearchView(accessor.get(IViewsService));
  searchView?.toggleWholeWords();
}

function toggleRegexCommand(accessor) {
  const searchView = getSearchView(accessor.get(IViewsService));
  searchView?.toggleRegex();
}

function togglePreserveCaseCommand(accessor) {
  const searchView = getSearchView(accessor.get(IViewsService));
  searchView?.togglePreserveCase();
}

var focusSearchListCommand = (accessor) => {
  const viewsService = accessor.get(IViewsService);
  openSearchView(viewsService).then((searchView) => {
    searchView?.moveFocusToResults();
  });
};

async function focusNextSearchResult(accessor) {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    return editorService.activeEditorPane.focusNextResult();
  }
  return openSearchView(accessor.get(IViewsService)).then((searchView) => searchView?.selectNextMatch());
}

async function focusPreviousSearchResult(accessor) {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    return editorService.activeEditorPane.focusPreviousResult();
  }
  return openSearchView(accessor.get(IViewsService)).then((searchView) => searchView?.selectPreviousMatch());
}

async function findOrReplaceInFiles(accessor, expandSearchReplaceWidget) {
  return openSearchView(accessor.get(IViewsService), false).then((openedView) => {
    if (openedView) {
      const searchAndReplaceWidget = openedView.searchAndReplaceWidget;
      searchAndReplaceWidget.toggleReplace(expandSearchReplaceWidget);
      const updatedText = openedView.updateTextFromFindWidgetOrSelection({ allowUnselectedWord: !expandSearchReplaceWidget });
      openedView.searchAndReplaceWidget.focus(void 0, updatedText, updatedText);
    }
  });
}
export { toggleCaseSensitiveCommand, toggleWholeWordCommand, toggleRegexCommand, togglePreserveCaseCommand, focusNextSearchResult, focusPreviousSearchResult, findOrReplaceInFiles, focusSearchListCommand };
