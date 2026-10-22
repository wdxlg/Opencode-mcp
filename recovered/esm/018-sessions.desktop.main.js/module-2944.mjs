// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/searchEditor/browser/searchEditor.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { searchConfigurationNode } from "./module-1216.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { DEFAULT_EDITOR_ASSOCIATION, EditorExtensions } from "./module-0926.mjs";
import { EditorPaneDescriptor } from "./module-1085.mjs";
import { SearchEditor } from "./module-2943.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { SEARCH_EDITOR_EXT, SearchEditorInput, getOrMakeSearchEditorInput } from "./module-2818.mjs";
import { extname2, isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorResolverService } from "./module-1114.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { URI } from "./module-0032.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { IEditorService } from "./module-0935.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { InSearchEditor, OpenEditorCommandId, OpenNewEditorCommandId, SearchEditorID, SearchEditorScheme, ToggleSearchEditorContextLinesCommandId } from "./module-2808.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { getActiveElement } from "./module-0075.mjs";
import { createEditorFromSearchResult, modifySearchEditorContextLinesCommand, openNewSearchEditor, openSearchEditor, selectAllSearchEditorMatchesCommand, toggleSearchEditorCaseSensitiveCommand, toggleSearchEditorContextLinesCommand, toggleSearchEditorRegexCommand, toggleSearchEditorWholeWordCommand } from "./module-2819.mjs";
import { SearchContext } from "./module-1261.mjs";
import { IViewsService } from "./module-1246.mjs";
import { getSearchView } from "./module-2811.mjs";
import { searchNewEditorIcon, searchRefreshIcon } from "./module-2804.mjs";
import { ActiveEditorContext } from "./module-0950.mjs";
import { ToggleCaseSensitiveKeybinding, ToggleRegexKeybinding, ToggleWholeWordKeybinding } from "./module-0595.mjs";
import { VIEW_ID } from "./module-1000.mjs";
import { Disposable } from "./module-0012.mjs";
import { IWorkingCopyEditorService } from "./module-1395.mjs";


// src/vs/workbench/contrib/searchEditor/browser/searchEditor.contribution.ts
var OpenInEditorCommandId = "search.action.openInEditor";

var OpenNewEditorToSideCommandId = "search.action.openNewEditorToSide";

var FocusQueryEditorWidgetCommandId = "search.action.focusQueryEditorWidget";

var FocusQueryEditorFilesToIncludeCommandId = "search.action.focusFilesToInclude";

var FocusQueryEditorFilesToExcludeCommandId = "search.action.focusFilesToExclude";

var ToggleSearchEditorCaseSensitiveCommandId = "toggleSearchEditorCaseSensitive";

var ToggleSearchEditorWholeWordCommandId = "toggleSearchEditorWholeWord";

var ToggleSearchEditorRegexCommandId = "toggleSearchEditorRegex";

var IncreaseSearchEditorContextLinesCommandId = "increaseSearchEditorContextLines";

var DecreaseSearchEditorContextLinesCommandId = "decreaseSearchEditorContextLines";

var RerunSearchEditorSearchCommandId = "rerunSearchEditorSearch";

var CleanSearchEditorStateCommandId = "cleanSearchEditorState";

var SelectAllSearchEditorMatchesCommandId = "selectAllSearchEditorMatches";

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...searchConfigurationNode,
  properties: {
    "search.searchEditor.doubleClickBehaviour": {
      type: "string",
      enum: ["selectWord", "goToLocation", "openLocationToSide"],
      default: "goToLocation",
      enumDescriptions: [
        localize(19284, null),
        localize(19282, null),
        localize(19283, null)
      ],
      markdownDescription: localize(19281, null)
    },
    "search.searchEditor.singleClickBehaviour": {
      type: "string",
      enum: ["default", "peekDefinition"],
      default: "default",
      enumDescriptions: [
        localize(19288, null),
        localize(19289, null)
      ],
      markdownDescription: localize(19287, null)
    },
    "search.searchEditor.reusePriorSearchConfiguration": {
      type: "boolean",
      default: false,
      markdownDescription: localize(19286, null)
    },
    "search.searchEditor.defaultNumberOfContextLines": {
      type: ["number", "null"],
      default: 1,
      markdownDescription: localize(19280, null)
    },
    "search.searchEditor.focusResultsOnSearch": {
      type: "boolean",
      default: false,
      markdownDescription: localize(19285, null)
    }
  }
});

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(
    SearchEditor,
    SearchEditor.ID,
    localize(19290, null)
  ),
  [
    new SyncDescriptor(SearchEditorInput)
  ]
);

var SearchEditorContribution = class {
  static {
    this.ID = "workbench.contrib.searchEditor";
  }
  constructor(editorResolverService, instantiationService) {
    editorResolverService.registerEditor(
      "*" + SEARCH_EDITOR_EXT,
      {
        id: SearchEditorInput.ID,
        label: localize(19269, null),
        detail: DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
        priority: "default" /* default */
      },
      {
        singlePerResource: true,
        canSupportResource: (resource) => extname2(resource) === SEARCH_EDITOR_EXT
      },
      {
        createEditorInput: ({ resource }) => {
          return { editor: instantiationService.invokeFunction(getOrMakeSearchEditorInput, { from: "existingFile", fileUri: resource }) };
        }
      }
    );
  }
};

SearchEditorContribution = __decorateClass([
  __decorateParam(0, IEditorResolverService),
  __decorateParam(1, IInstantiationService)
], SearchEditorContribution);

registerWorkbenchContribution2(SearchEditorContribution.ID, SearchEditorContribution, WorkbenchPhase.BlockStartup);

var SearchEditorInputSerializer = class {
  canSerialize(input) {
    return !!input.tryReadConfigSync();
  }
  serialize(input) {
    if (!this.canSerialize(input)) {
      return void 0;
    }
    if (input.isDisposed()) {
      return JSON.stringify({ modelUri: void 0, dirty: false, config: input.tryReadConfigSync(), name: input.getName(), matchRanges: [], backingUri: input.backingUri?.toString() });
    }
    let modelUri = void 0;
    if (input.modelUri.path || input.modelUri.fragment && input.isDirty()) {
      modelUri = input.modelUri.toString();
    }
    const config = input.tryReadConfigSync();
    const dirty = input.isDirty();
    const matchRanges = dirty ? input.getMatchRanges() : [];
    const backingUri = input.backingUri;
    return JSON.stringify({ modelUri, dirty, config, name: input.getName(), matchRanges, backingUri: backingUri?.toString() });
  }
  deserialize(instantiationService, serializedEditorInput) {
    const { modelUri, dirty, config, matchRanges, backingUri } = JSON.parse(serializedEditorInput);
    if (config && config.query !== void 0) {
      if (modelUri) {
        const input = instantiationService.invokeFunction(
          getOrMakeSearchEditorInput,
          { from: "model", modelUri: URI.parse(modelUri), config, backupOf: backingUri ? URI.parse(backingUri) : void 0 }
        );
        input.setDirty(dirty);
        input.setMatchRanges(matchRanges);
        return input;
      } else {
        if (backingUri) {
          return instantiationService.invokeFunction(
            getOrMakeSearchEditorInput,
            { from: "existingFile", fileUri: URI.parse(backingUri) }
          );
        } else {
          return instantiationService.invokeFunction(
            getOrMakeSearchEditorInput,
            { from: "rawData", resultsContents: "", config }
          );
        }
      }
    }
    return void 0;
  }
};

Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(
  SearchEditorInput.ID,
  SearchEditorInputSerializer
);

CommandsRegistry.registerCommand(
  CleanSearchEditorStateCommandId,
  (accessor) => {
    const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
    if (activeEditorPane instanceof SearchEditor) {
      activeEditorPane.cleanState();
    }
  }
);

var category4 = localize2(19270, "Search Editor");

var translateLegacyConfig = (legacyConfig = {}) => {
  const config = {};
  const overrides = {
    includes: "filesToInclude",
    excludes: "filesToExclude",
    wholeWord: "matchWholeWord",
    caseSensitive: "isCaseSensitive",
    regexp: "isRegexp",
    useIgnores: "useExcludeSettingsAndIgnoreFiles"
  };
  Object.entries(legacyConfig).forEach(([key3, value2]) => {
    config[overrides[key3] ?? key3] = value2;
  });
  return config;
};

var openArgMetadata = {
  description: "Open a new search editor. Arguments passed can include variables like ${relativeFileDirname}.",
  args: [{
    name: "Open new Search Editor args",
    schema: {
      properties: {
        query: { type: "string" },
        filesToInclude: { type: "string" },
        filesToExclude: { type: "string" },
        contextLines: { type: "number" },
        matchWholeWord: { type: "boolean" },
        isCaseSensitive: { type: "boolean" },
        isRegexp: { type: "boolean" },
        useExcludeSettingsAndIgnoreFiles: { type: "boolean" },
        showIncludesExcludes: { type: "boolean" },
        triggerSearch: { type: "boolean" },
        focusResults: { type: "boolean" },
        onlyOpenEditors: { type: "boolean" }
      }
    }
  }]
};

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "search.searchEditor.action.deleteFileResults",
      title: localize2(19298, "Delete File Results"),
      keybinding: {
        weight: 100 /* EditorContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 1 /* Backspace */
      },
      precondition: InSearchEditor,
      category: category4,
      f1: true
    });
  }
  async run(accessor) {
    const contextService = accessor.get(IContextKeyService).getContext(getActiveElement());
    if (contextService.getValue(InSearchEditor.serialize())) {
      accessor.get(IEditorService).activeEditorPane.deleteResultBlock();
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: OpenNewEditorCommandId,
      title: localize2(19276, "New Search Editor"),
      category: category4,
      f1: true,
      metadata: openArgMetadata
    });
  }
  async run(accessor, args2) {
    await accessor.get(IInstantiationService).invokeFunction(openNewSearchEditor, translateLegacyConfig({ location: "new", ...args2 }));
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: OpenEditorCommandId,
      title: localize2(19278, "Open Search Editor"),
      category: category4,
      f1: true,
      metadata: openArgMetadata
    });
  }
  async run(accessor, args2) {
    await accessor.get(IInstantiationService).invokeFunction(openNewSearchEditor, translateLegacyConfig({ location: "reuse", ...args2 }));
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: OpenNewEditorToSideCommandId,
      title: localize2(19275, "Open New Search Editor to the Side"),
      category: category4,
      f1: true,
      metadata: openArgMetadata
    });
  }
  async run(accessor, args2) {
    await accessor.get(IInstantiationService).invokeFunction(openNewSearchEditor, translateLegacyConfig(args2), true);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: OpenInEditorCommandId,
      title: localize2(19277, "Open Results in Editor"),
      category: category4,
      f1: true,
      keybinding: {
        primary: 512 /* Alt */ | 3 /* Enter */,
        when: ContextKeyExpr.and(SearchContext.HasSearchResults, SearchContext.SearchViewFocusedKey),
        weight: 200 /* WorkbenchContrib */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 3 /* Enter */
        }
      }
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const instantiationService = accessor.get(IInstantiationService);
    const searchView = getSearchView(viewsService);
    if (searchView) {
      await instantiationService.invokeFunction(createEditorFromSearchResult, searchView.searchResult, searchView.searchIncludePattern.getValue(), searchView.searchExcludePattern.getValue(), searchView.searchIncludePattern.onlySearchInOpenEditors());
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RerunSearchEditorSearchCommandId,
      title: localize2(19279, "Search Again"),
      category: category4,
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 48 /* KeyR */,
        when: InSearchEditor,
        weight: 100 /* EditorContrib */
      },
      icon: searchRefreshIcon,
      menu: [
        ...[MenuId.EditorTitle, MenuId.CompactWindowEditorTitle].map((id2) => ({
          id: id2,
          group: "navigation",
          when: ActiveEditorContext.isEqualTo(SearchEditorID)
        })),
        {
          id: MenuId.CommandPalette,
          when: ActiveEditorContext.isEqualTo(SearchEditorID)
        }
      ]
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const input = editorService.activeEditor;
    if (input instanceof SearchEditorInput) {
      editorService.activeEditorPane.triggerSearch({ resetCursor: false });
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: FocusQueryEditorWidgetCommandId,
      title: localize2(19273, "Focus Search Editor Input"),
      category: category4,
      f1: true,
      precondition: InSearchEditor,
      keybinding: {
        primary: 9 /* Escape */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const input = editorService.activeEditor;
    if (input instanceof SearchEditorInput) {
      editorService.activeEditorPane.focusSearchInput();
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: FocusQueryEditorFilesToIncludeCommandId,
      title: localize2(19272, "Focus Search Editor Files to Include"),
      category: category4,
      f1: true,
      precondition: InSearchEditor
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const input = editorService.activeEditor;
    if (input instanceof SearchEditorInput) {
      editorService.activeEditorPane.focusFilesToIncludeInput();
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: FocusQueryEditorFilesToExcludeCommandId,
      title: localize2(19271, "Focus Search Editor Files to Exclude"),
      category: category4,
      f1: true,
      precondition: InSearchEditor
    });
  }
  async run(accessor) {
    const editorService = accessor.get(IEditorService);
    const input = editorService.activeEditor;
    if (input instanceof SearchEditorInput) {
      editorService.activeEditorPane.focusFilesToExcludeInput();
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: ToggleSearchEditorCaseSensitiveCommandId,
      title: localize2(19294, "Toggle Match Case"),
      category: category4,
      f1: true,
      precondition: InSearchEditor,
      keybinding: Object.assign({
        weight: 200 /* WorkbenchContrib */,
        when: SearchContext.SearchInputBoxFocusedKey
      }, ToggleCaseSensitiveKeybinding)
    });
  }
  run(accessor) {
    toggleSearchEditorCaseSensitiveCommand(accessor);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: ToggleSearchEditorWholeWordCommandId,
      title: localize2(19297, "Toggle Match Whole Word"),
      category: category4,
      f1: true,
      precondition: InSearchEditor,
      keybinding: Object.assign({
        weight: 200 /* WorkbenchContrib */,
        when: SearchContext.SearchInputBoxFocusedKey
      }, ToggleWholeWordKeybinding)
    });
  }
  run(accessor) {
    toggleSearchEditorWholeWordCommand(accessor);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: ToggleSearchEditorRegexCommandId,
      title: localize2(19296, "Toggle Use Regular Expression"),
      category: category4,
      f1: true,
      precondition: InSearchEditor,
      keybinding: Object.assign({
        weight: 200 /* WorkbenchContrib */,
        when: SearchContext.SearchInputBoxFocusedKey
      }, ToggleRegexKeybinding)
    });
  }
  run(accessor) {
    toggleSearchEditorRegexCommand(accessor);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: ToggleSearchEditorContextLinesCommandId,
      title: localize2(19295, "Toggle Context Lines"),
      category: category4,
      f1: true,
      precondition: InSearchEditor,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 512 /* Alt */ | 42 /* KeyL */,
        mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 42 /* KeyL */ }
      }
    });
  }
  run(accessor) {
    toggleSearchEditorContextLinesCommand(accessor);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: IncreaseSearchEditorContextLinesCommandId,
      title: localize2(19292, "Increase Context Lines"),
      category: category4,
      f1: true,
      precondition: InSearchEditor,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 512 /* Alt */ | 86 /* Equal */
      }
    });
  }
  run(accessor) {
    modifySearchEditorContextLinesCommand(accessor, true);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: DecreaseSearchEditorContextLinesCommandId,
      title: localize2(19291, "Decrease Context Lines"),
      category: category4,
      f1: true,
      precondition: InSearchEditor,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 512 /* Alt */ | 88 /* Minus */
      }
    });
  }
  run(accessor) {
    modifySearchEditorContextLinesCommand(accessor, false);
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: SelectAllSearchEditorMatchesCommandId,
      title: localize2(19293, "Select All Matches"),
      category: category4,
      f1: true,
      precondition: InSearchEditor,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 42 /* KeyL */
      }
    });
  }
  run(accessor) {
    selectAllSearchEditorMatchesCommand(accessor);
  }
});

registerAction2(class OpenSearchEditorAction extends Action2 {
  constructor() {
    super({
      id: "search.action.openNewEditorFromView",
      title: localize(19274, null),
      category: category4,
      icon: searchNewEditorIcon,
      menu: [{
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.equals("view", VIEW_ID)
      }]
    });
  }
  run(accessor, ...args2) {
    return openSearchEditor(accessor);
  }
});

var SearchEditorWorkingCopyEditorHandler = class extends Disposable {
  constructor(instantiationService, workingCopyEditorService) {
    super();
    this.instantiationService = instantiationService;
    this._register(workingCopyEditorService.registerHandler(this));
  }
  static {
    this.ID = "workbench.contrib.searchEditorWorkingCopyEditorHandler";
  }
  handles(workingCopy) {
    return workingCopy.resource.scheme === SearchEditorScheme;
  }
  isOpen(workingCopy, editor) {
    if (!this.handles(workingCopy)) {
      return false;
    }
    return editor instanceof SearchEditorInput && isEqual2(workingCopy.resource, editor.modelUri);
  }
  createEditor(workingCopy) {
    const input = this.instantiationService.invokeFunction(getOrMakeSearchEditorInput, { from: "model", modelUri: workingCopy.resource });
    input.setDirty(true);
    return input;
  }
};

SearchEditorWorkingCopyEditorHandler = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IWorkingCopyEditorService)
], SearchEditorWorkingCopyEditorHandler);

registerWorkbenchContribution2(SearchEditorWorkingCopyEditorHandler.ID, SearchEditorWorkingCopyEditorHandler, WorkbenchPhase.BlockRestore);
export { OpenInEditorCommandId, OpenNewEditorToSideCommandId, FocusQueryEditorWidgetCommandId, FocusQueryEditorFilesToIncludeCommandId, FocusQueryEditorFilesToExcludeCommandId, ToggleSearchEditorCaseSensitiveCommandId, ToggleSearchEditorWholeWordCommandId, ToggleSearchEditorRegexCommandId, IncreaseSearchEditorContextLinesCommandId, DecreaseSearchEditorContextLinesCommandId, RerunSearchEditorSearchCommandId, CleanSearchEditorStateCommandId, SelectAllSearchEditorMatchesCommandId, SearchEditorContribution, SearchEditorInputSerializer, category4, translateLegacyConfig, openArgMetadata, SearchEditorWorkingCopyEditorHandler };
