// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/search.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { ISearchViewModelWorkbenchService } from "./module-2845.mjs";
import { SearchViewModelWorkbenchService } from "./module-3113.mjs";
import { registerContributions } from "./module-2838.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { SearchChatContextContribution } from "./module-2859.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { SearchAccessibilityHelp } from "./module-3128.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { DEFAULT_MAX_SEARCH_RESULTS, SEARCH_EXCLUDE_CONFIG, VIEWLET_ID, VIEW_ID } from "./module-0999.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1382.mjs";
import { searchViewIcon } from "./module-2829.mjs";
import { SearchView } from "./module-2858.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { Extensions18 } from "./module-1560.mjs";
import { TEXT_SEARCH_QUICK_ACCESS_PREFIX, TextSearchQuickAccess } from "./module-3118.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { getWorkspaceSymbols, searchConfigurationNode } from "./module-1216.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { assertType } from "./module-0010.mjs";
import { Extensions14 } from "./module-1112.mjs";


// src/vs/workbench/contrib/search/browser/search.contribution.ts
registerSingleton(ISearchViewModelWorkbenchService, SearchViewModelWorkbenchService, 1 /* Delayed */);

registerContributions();

registerWorkbenchContribution2(SearchChatContextContribution.ID, SearchChatContextContribution, WorkbenchPhase.AfterRestored);

AccessibleViewRegistry.register(new SearchAccessibilityHelp());

var SEARCH_MODE_CONFIG = "search.mode";

var viewContainer2 = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
  id: VIEWLET_ID,
  title: localize2(18994, "Search"),
  ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [VIEWLET_ID, { mergeViewWithContainerWhenSingleView: true }]),
  hideIfEmpty: true,
  icon: searchViewIcon,
  order: 1
}, 0 /* Sidebar */, { doNotRegisterOpenCommand: true });

var viewDescriptor3 = {
  id: VIEW_ID,
  containerIcon: searchViewIcon,
  name: localize2(18994, "Search"),
  ctorDescriptor: new SyncDescriptor(SearchView),
  canToggleVisibility: false,
  canMoveView: true,
  openCommandActionDescriptor: {
    id: viewContainer2.id,
    mnemonicTitle: localize(18991, null),
    keybindings: {
      primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 36 /* KeyF */,
      // Yes, this is weird. See #116188, #115556, #115511, and now #124146, for examples of what can go wrong here.
      when: ContextKeyExpr.regex("neverMatch", /doesNotMatch/)
    },
    order: 1
  }
};

Registry.as(Extensions13.ViewsRegistry).registerViews([viewDescriptor3], viewContainer2);

var quickAccessRegistry4 = Registry.as(Extensions18.Quickaccess);

quickAccessRegistry4.registerQuickAccessProvider({
  ctor: TextSearchQuickAccess,
  prefix: TEXT_SEARCH_QUICK_ACCESS_PREFIX,
  contextKey: "inTextSearchPicker",
  placeholder: localize(19034, null),
  helpEntries: [
    {
      description: localize(19033, null),
      commandId: "workbench.action.quickTextSearch" /* QuickTextSearchActionId */,
      commandCenterOrder: 25
    }
  ]
});

var configurationRegistry16 = Registry.as(Extensions4.Configuration);

configurationRegistry16.registerConfiguration({
  ...searchConfigurationNode,
  properties: {
    [SEARCH_EXCLUDE_CONFIG]: {
      type: "object",
      markdownDescription: localize(18985, null),
      default: { "**/node_modules": true, "**/bower_components": true, "**/*.code-search": true },
      additionalProperties: {
        anyOf: [
          {
            type: "boolean",
            description: localize(18986, null)
          },
          {
            type: "object",
            properties: {
              when: {
                type: "string",
                // expression ({ "**/*.js": { "when": "$(basename).js" } })
                pattern: "\\w*\\$\\(basename\\)\\w*",
                default: "$(basename).ext",
                markdownDescription: localize(18987, null)
              }
            }
          }
        ]
      },
      scope: 5 /* RESOURCE */
    },
    [SEARCH_MODE_CONFIG]: {
      type: "string",
      enum: ["view", "reuseEditor", "newEditor"],
      default: "view",
      markdownDescription: localize(19008, null),
      enumDescriptions: [
        localize(19011, null),
        localize(19010, null),
        localize(19009, null)
      ]
    },
    "search.useIgnoreFiles": {
      type: "boolean",
      markdownDescription: localize(19036, null),
      default: true,
      scope: 5 /* RESOURCE */
    },
    "search.useGlobalIgnoreFiles": {
      type: "boolean",
      markdownDescription: localize(19035, null, "`#search.useIgnoreFiles#`"),
      default: false,
      scope: 5 /* RESOURCE */
    },
    "search.useParentIgnoreFiles": {
      type: "boolean",
      markdownDescription: localize(19037, null, "`#search.useIgnoreFiles#`"),
      default: false,
      scope: 5 /* RESOURCE */
    },
    "search.quickOpen.includeSymbols": {
      type: "boolean",
      description: localize(19014, null),
      default: false
    },
    "search.ripgrep.maxThreads": {
      type: "number",
      description: localize(19015, null),
      default: 0
    },
    "search.quickOpen.includeHistory": {
      type: "boolean",
      description: localize(19013, null),
      default: true,
      agentsWindow: { default: false }
    },
    "search.quickOpen.history.filterSortOrder": {
      type: "string",
      enum: ["default", "recency"],
      default: "default",
      enumDescriptions: [
        localize(18989, null),
        localize(18990, null)
      ],
      description: localize(18988, null)
    },
    "search.followSymlinks": {
      type: "boolean",
      description: localize(19005, null),
      default: true
    },
    "search.smartCase": {
      type: "boolean",
      description: localize(19024, null),
      default: false
    },
    "search.globalFindClipboard": {
      type: "boolean",
      default: false,
      description: localize(19006, null),
      included: isMacintosh
    },
    "search.maxResults": {
      type: ["number", "null"],
      default: DEFAULT_MAX_SEARCH_RESULTS,
      markdownDescription: localize(19007, null)
    },
    "search.collapseResults": {
      type: "string",
      enum: ["auto", "alwaysCollapse", "alwaysExpand"],
      enumDescriptions: [
        localize(18999, null),
        "",
        ""
      ],
      default: "alwaysExpand",
      description: localize(18998, null)
    },
    "search.useReplacePreview": {
      type: "boolean",
      default: true,
      description: localize(19026, null)
    },
    "search.showLineNumbers": {
      type: "boolean",
      default: false,
      description: localize(19023, null)
    },
    "search.actionsPosition": {
      type: "string",
      enum: ["auto", "right"],
      enumDescriptions: [
        localize(18996, null),
        localize(18997, null)
      ],
      default: "right",
      description: localize(18995, null)
    },
    "search.seedWithNearestWord": {
      type: "boolean",
      default: false,
      description: localize(19022, null)
    },
    "search.seedOnFocus": {
      type: "boolean",
      default: false,
      markdownDescription: localize(19021, null)
    },
    "search.sortOrder": {
      type: "string",
      enum: ["default" /* Default */, "fileNames" /* FileNames */, "type" /* Type */, "modified" /* Modified */, "countDescending" /* CountDescending */, "countAscending" /* CountAscending */],
      default: "default" /* Default */,
      enumDescriptions: [
        localize(19029, null),
        localize(19030, null),
        localize(19032, null),
        localize(19031, null),
        localize(19028, null),
        localize(19027, null)
      ],
      description: localize(19025, null)
    },
    "search.decorations.colors": {
      type: "boolean",
      description: localize(19001, null),
      default: true
    },
    "search.decorations.badges": {
      type: "boolean",
      description: localize(19000, null),
      default: true
    },
    "search.defaultViewMode": {
      type: "string",
      enum: ["tree" /* Tree */, "list" /* List */],
      default: "list" /* List */,
      enumDescriptions: [
        localize(18993, null),
        localize(18992, null)
      ],
      description: localize(19002, null)
    },
    "search.quickAccess.preserveInput": {
      type: "boolean",
      description: localize(19012, null),
      default: false
    },
    "search.experimental.closedNotebookRichContentResults": {
      type: "boolean",
      description: localize(19003, null),
      default: false
    },
    "search.experimental.useIgnoreFilesInFindFiles": {
      type: "boolean",
      default: false,
      markdownDescription: localize(19004, null),
      tags: ["experimental"]
    },
    "search.searchView.semanticSearchBehavior": {
      type: "string",
      description: localize(19017, null),
      enum: ["manual" /* Manual */, "runOnEmpty" /* RunOnEmpty */, "auto" /* Auto */],
      default: "manual" /* Manual */,
      enumDescriptions: [
        localize(19019, null),
        localize(19020, null),
        localize(19018, null)
      ],
      tags: ["preview"]
    },
    "search.searchView.keywordSuggestions": {
      type: "boolean",
      description: localize(19016, null),
      default: false,
      tags: ["preview"]
    }
  }
});

CommandsRegistry.registerCommand("_executeWorkspaceSymbolProvider", async function(accessor, ...args2) {
  const [query] = args2;
  assertType(typeof query === "string");
  const result = await getWorkspaceSymbols(query);
  return result.map((item) => item.symbol);
});

Registry.as(Extensions14.ConfigurationMigration).registerConfigurationMigrations([{
  key: "search.experimental.quickAccess.preserveInput",
  migrateFn: (value2, _accessor) => [
    ["search.quickAccess.preserveInput", { value: value2 }],
    ["search.experimental.quickAccess.preserveInput", { value: void 0 }]
  ]
}]);
export { SEARCH_MODE_CONFIG, viewContainer2, viewDescriptor3, quickAccessRegistry4, configurationRegistry16 };
