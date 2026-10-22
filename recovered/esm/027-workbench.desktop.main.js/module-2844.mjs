// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/searchEditor/browser/searchEditorActions.ts
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { SearchEditorInput, getOrMakeSearchEditorInput } from "./module-2843.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { getSearchView } from "./module-2836.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IConfigurationResolverService } from "./module-1405.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IHistoryService } from "./module-1494.mjs";
import { Schemas } from "./module-0033.mjs";
import { isDiffEditor } from "./module-0223.mjs";
import { ILabelService } from "./module-0641.mjs";
import { serializeSearchResultForEditor } from "./module-2841.mjs";


// src/vs/workbench/contrib/searchEditor/browser/searchEditorActions.ts
var toggleSearchEditorCaseSensitiveCommand = (accessor) => {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    editorService.activeEditorPane.toggleCaseSensitive();
  }
};

var toggleSearchEditorWholeWordCommand = (accessor) => {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    editorService.activeEditorPane.toggleWholeWords();
  }
};

var toggleSearchEditorRegexCommand = (accessor) => {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    editorService.activeEditorPane.toggleRegex();
  }
};

var toggleSearchEditorContextLinesCommand = (accessor) => {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    editorService.activeEditorPane.toggleContextLines();
  }
};

var modifySearchEditorContextLinesCommand = (accessor, increase) => {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    editorService.activeEditorPane.modifyContextLines(increase);
  }
};

var selectAllSearchEditorMatchesCommand = (accessor) => {
  const editorService = accessor.get(IEditorService);
  const input = editorService.activeEditor;
  if (input instanceof SearchEditorInput) {
    editorService.activeEditorPane.focusAllResults();
  }
};

async function openSearchEditor(accessor) {
  const viewsService = accessor.get(IViewsService);
  const instantiationService = accessor.get(IInstantiationService);
  const searchView = getSearchView(viewsService);
  if (searchView) {
    await instantiationService.invokeFunction(openNewSearchEditor, {
      filesToInclude: searchView.searchIncludePattern.getValue(),
      onlyOpenEditors: searchView.searchIncludePattern.onlySearchInOpenEditors(),
      filesToExclude: searchView.searchExcludePattern.getValue(),
      isRegexp: searchView.searchAndReplaceWidget.searchInput?.getRegex(),
      isCaseSensitive: searchView.searchAndReplaceWidget.searchInput?.getCaseSensitive(),
      matchWholeWord: searchView.searchAndReplaceWidget.searchInput?.getWholeWords(),
      useExcludeSettingsAndIgnoreFiles: searchView.searchExcludePattern.useExcludesAndIgnoreFiles(),
      showIncludesExcludes: !!(searchView.searchIncludePattern.getValue() || searchView.searchExcludePattern.getValue() || !searchView.searchExcludePattern.useExcludesAndIgnoreFiles())
    });
  } else {
    await instantiationService.invokeFunction(openNewSearchEditor);
  }
}

var openNewSearchEditor = async (accessor, _args = {}, toSide = false) => {
  const editorService = accessor.get(IEditorService);
  const editorGroupsService = accessor.get(IEditorGroupsService);
  const telemetryService = accessor.get(ITelemetryService);
  const instantiationService = accessor.get(IInstantiationService);
  const configurationService = accessor.get(IConfigurationService);
  const configurationResolverService = accessor.get(IConfigurationResolverService);
  const workspaceContextService = accessor.get(IWorkspaceContextService);
  const historyService = accessor.get(IHistoryService);
  const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(Schemas.file);
  const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
  const activeEditorControl = editorService.activeTextEditorControl;
  let activeModel;
  let selected = "";
  if (activeEditorControl) {
    if (isDiffEditor(activeEditorControl)) {
      if (activeEditorControl.getOriginalEditor().hasTextFocus()) {
        activeModel = activeEditorControl.getOriginalEditor();
      } else {
        activeModel = activeEditorControl.getModifiedEditor();
      }
    } else {
      activeModel = activeEditorControl;
    }
    const selection = activeModel?.getSelection();
    selected = (selection && activeModel?.getModel()?.getValueInRange(selection)) ?? "";
    if (selection?.isEmpty() && configurationService.getValue("search").seedWithNearestWord) {
      const wordAtPosition = activeModel.getModel()?.getWordAtPosition(selection.getStartPosition());
      if (wordAtPosition) {
        selected = wordAtPosition.word;
      }
    }
  } else {
    if (editorService.activeEditor instanceof SearchEditorInput) {
      const active = editorService.activeEditorPane;
      selected = active.getSelected();
    }
  }
  telemetryService.publicLog2("searchEditor/openNewSearchEditor");
  const seedSearchStringFromSelection = _args.location === "new" || configurationService.getValue("editor").find.seedSearchStringFromSelection;
  const args2 = { query: seedSearchStringFromSelection ? selected : void 0 };
  for (const entry of Object.entries(_args)) {
    const name = entry[0];
    const value2 = entry[1];
    if (value2 !== void 0) {
      args2[name] = typeof value2 === "string" ? await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, value2) : value2;
    }
  }
  const existing = editorService.getEditors(0 /* MOST_RECENTLY_ACTIVE */).find((id2) => id2.editor.typeId === SearchEditorInput.ID);
  let editor;
  if (existing && args2.location === "reuse") {
    const group2 = editorGroupsService.getGroup(existing.groupId);
    if (!group2) {
      throw new Error("Invalid group id for search editor");
    }
    const input = existing.editor;
    editor = await group2.openEditor(input);
    if (selected) {
      editor.setQuery(selected);
    } else {
      editor.selectQuery();
    }
    editor.setSearchConfig(args2);
  } else {
    const input = instantiationService.invokeFunction(getOrMakeSearchEditorInput, { config: args2, resultsContents: "", from: "rawData" });
    editor = await editorService.openEditor(input, { pinned: true }, toSide ? SIDE_GROUP : ACTIVE_GROUP);
  }
  const searchOnType = configurationService.getValue("search").searchOnType;
  if (args2.triggerSearch === true || args2.triggerSearch !== false && searchOnType && args2.query) {
    editor.triggerSearch({ focusResults: args2.focusResults });
  }
  if (!args2.focusResults) {
    editor.focusSearchInput();
  }
};

var createEditorFromSearchResult = async (accessor, searchResult, rawIncludePattern, rawExcludePattern, onlySearchInOpenEditors) => {
  if (!searchResult.query) {
    console.error("Expected searchResult.query to be defined. Got", searchResult);
    return;
  }
  const editorService = accessor.get(IEditorService);
  const telemetryService = accessor.get(ITelemetryService);
  const instantiationService = accessor.get(IInstantiationService);
  const labelService = accessor.get(ILabelService);
  const configurationService = accessor.get(IConfigurationService);
  const sortOrder = configurationService.getValue("search").sortOrder;
  telemetryService.publicLog2("searchEditor/createEditorFromSearchResult");
  const labelFormatter = (uri5) => labelService.getUriLabel(uri5, { relative: true });
  const { text: text2, matchRanges, config } = serializeSearchResultForEditor(searchResult, rawIncludePattern, rawExcludePattern, 0, labelFormatter, sortOrder);
  config.onlyOpenEditors = onlySearchInOpenEditors;
  const contextLines = configurationService.getValue("search").searchEditor.defaultNumberOfContextLines;
  if (searchResult.isDirty || contextLines === 0 || contextLines === null) {
    const input = instantiationService.invokeFunction(getOrMakeSearchEditorInput, { resultsContents: text2, config, from: "rawData" });
    await editorService.openEditor(input, { pinned: true });
    input.setMatchRanges(matchRanges);
  } else {
    const input = instantiationService.invokeFunction(getOrMakeSearchEditorInput, { from: "rawData", resultsContents: "", config: { ...config, contextLines } });
    const editor = await editorService.openEditor(input, { pinned: true });
    editor.triggerSearch();
  }
};
export { openSearchEditor, toggleSearchEditorCaseSensitiveCommand, toggleSearchEditorWholeWordCommand, toggleSearchEditorRegexCommand, toggleSearchEditorContextLinesCommand, modifySearchEditorContextLinesCommand, selectAllSearchEditorMatchesCommand, openNewSearchEditor, createEditorFromSearchResult };
