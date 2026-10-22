// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/preferences/common/preferences.ts
import { createDecorator } from "./module-0077.mjs";
import { RawContextKey } from "./module-0089.mjs";
import { raceTimeout } from "./module-0036.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/preferences/common/preferences.ts
var IPreferencesSearchService = createDecorator("preferencesSearchService");

var CONTEXT_PREFERENCES_SEARCH_FOCUS = new RawContextKey("inPreferencesSearch", false);

var SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS = "settings.action.clearSearchResults";

var SETTINGS_EDITOR_COMMAND_SHOW_AI_RESULTS = "settings.action.showAIResults";

var SETTINGS_EDITOR_COMMAND_TOGGLE_AI_SEARCH = "settings.action.toggleAiSearch";

var SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU = "settings.action.showContextMenu";

var SETTINGS_EDITOR_COMMAND_SUGGEST_FILTERS = "settings.action.suggestFilters";

var CONTEXT_SETTINGS_EDITOR = new RawContextKey("inSettingsEditor", false);

var CONTEXT_SETTINGS_JSON_EDITOR = new RawContextKey("inSettingsJSONEditor", false);

var CONTEXT_SETTINGS_SEARCH_FOCUS = new RawContextKey("inSettingsSearch", false);

var CONTEXT_TOC_ROW_FOCUS = new RawContextKey("settingsTocRowFocus", false);

var CONTEXT_SETTINGS_ROW_FOCUS = new RawContextKey("settingRowFocus", false);

var CONTEXT_SETTINGS_FIRST_ROW_FOCUS = new RawContextKey("settingFirstRowFocus", false);

var CONTEXT_KEYBINDINGS_EDITOR = new RawContextKey("inKeybindings", false);

var CONTEXT_KEYBINDINGS_SEARCH_FOCUS = new RawContextKey("inKeybindingsSearch", false);

var CONTEXT_KEYBINDINGS_SEARCH_HAS_VALUE = new RawContextKey("keybindingsSearchHasValue", false);

var CONTEXT_KEYBINDING_FOCUS = new RawContextKey("keybindingFocus", false);

var CONTEXT_WHEN_FOCUS = new RawContextKey("whenFocus", false);

var CONTEXT_AI_SETTING_RESULTS_AVAILABLE = new RawContextKey("aiSettingResultsAvailable", false);

var KEYBINDINGS_EDITOR_COMMAND_SEARCH = "keybindings.editor.searchKeybindings";

var KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS = "keybindings.editor.clearSearchResults";

var KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY = "keybindings.editor.clearSearchHistory";

var KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS = "keybindings.editor.recordSearchKeys";

var KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE = "keybindings.editor.toggleSortByPrecedence";

var KEYBINDINGS_EDITOR_COMMAND_DEFINE = "keybindings.editor.defineKeybinding";

var KEYBINDINGS_EDITOR_COMMAND_ADD = "keybindings.editor.addKeybinding";

var KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN = "keybindings.editor.defineWhenExpression";

var KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN = "keybindings.editor.acceptWhenExpression";

var KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN = "keybindings.editor.rejectWhenExpression";

var KEYBINDINGS_EDITOR_COMMAND_REMOVE = "keybindings.editor.removeKeybinding";

var KEYBINDINGS_EDITOR_COMMAND_RESET = "keybindings.editor.resetKeybinding";

var KEYBINDINGS_EDITOR_COMMAND_COPY = "keybindings.editor.copyKeybindingEntry";

var KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND = "keybindings.editor.copyCommandKeybindingEntry";

var KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE = "keybindings.editor.copyCommandTitle";

var KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR = "keybindings.editor.showConflicts";

var KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS = "keybindings.editor.focusKeybindings";

var KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS = "keybindings.editor.showDefaultKeybindings";

var KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS = "keybindings.editor.showUserKeybindings";

var KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS = "keybindings.editor.showExtensionKeybindings";

var MODIFIED_SETTING_TAG = "modified";

var EXTENSION_SETTING_TAG = "ext:";

var FEATURE_SETTING_TAG = "feature:";

var ID_SETTING_TAG = "id:";

var LANGUAGE_SETTING_TAG = "lang:";

var GENERAL_TAG_SETTING_TAG = "tag:";

var POLICY_SETTING_TAG = "hasPolicy";

var AGENTS_WINDOW_SETTING_TAG = "override:agentsWindow";

var WORKSPACE_TRUST_SETTING_TAG = "workspaceTrust";

var REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG = "requireTrustedWorkspace";

var ADVANCED_SETTING_TAG = "advanced";

var ENABLE_LANGUAGE_FILTER = true;

var ENABLE_EXTENSION_TOGGLE_SETTINGS = true;

var EXTENSION_FETCH_TIMEOUT_MS = 1e3;

var STRING_MATCH_SEARCH_PROVIDER_NAME = "local";

var TF_IDF_SEARCH_PROVIDER_NAME = "tfIdf";

var FILTER_MODEL_SEARCH_PROVIDER_NAME = "filterModel";

var EMBEDDINGS_SEARCH_PROVIDER_NAME = "embeddingsFull";

var LLM_RANKED_SEARCH_PROVIDER_NAME = "llmRanked";

var cachedExtensionToggleData;

async function getExperimentalExtensionToggleData(chatEntitlementService, extensionGalleryService, productService) {
  if (!ENABLE_EXTENSION_TOGGLE_SETTINGS) {
    return void 0;
  }
  if (!extensionGalleryService.isEnabled()) {
    return void 0;
  }
  if (chatEntitlementService.sentiment.hidden || chatEntitlementService.sentiment.disabled) {
    return void 0;
  }
  if (cachedExtensionToggleData) {
    return cachedExtensionToggleData;
  }
  if (productService.extensionRecommendations) {
    const settingsEditorRecommendedExtensions = {};
    Object.keys(productService.extensionRecommendations).forEach((extensionId) => {
      const extensionInfo = productService.extensionRecommendations[extensionId];
      if (extensionInfo.onSettingsEditorOpen) {
        settingsEditorRecommendedExtensions[extensionId] = extensionInfo;
      }
    });
    const recommendedExtensionsGalleryInfo = {};
    for (const key3 in settingsEditorRecommendedExtensions) {
      const extensionId = key3;
      const isStable = productService.quality === "stable";
      try {
        const extensions = await raceTimeout(
          extensionGalleryService.getExtensions([{ id: extensionId, preRelease: !isStable }], CancellationToken.None),
          EXTENSION_FETCH_TIMEOUT_MS
        );
        if (extensions?.length === 1) {
          recommendedExtensionsGalleryInfo[key3] = extensions[0];
        } else {
          return void 0;
        }
      } catch (e4) {
        return void 0;
      }
    }
    cachedExtensionToggleData = {
      settingsEditorRecommendedExtensions,
      recommendedExtensionsGalleryInfo
    };
    return cachedExtensionToggleData;
  }
  return void 0;
}

function compareTwoNullableNumbers(a, b) {
  const aOrMax = a ?? Number.MAX_SAFE_INTEGER;
  const bOrMax = b ?? Number.MAX_SAFE_INTEGER;
  if (aOrMax < bOrMax) {
    return -1;
  } else if (aOrMax > bOrMax) {
    return 1;
  } else {
    return 0;
  }
}

var PREVIEW_INDICATOR_DESCRIPTION = localize(18378, null);

var EXPERIMENTAL_INDICATOR_DESCRIPTION = localize(18377, null);

var ADVANCED_INDICATOR_DESCRIPTION = localize(18376, null);

var knownAcronyms = /* @__PURE__ */ new Set();

[
  "css",
  "html",
  "scss",
  "less",
  "json",
  "js",
  "ts",
  "ie",
  "id",
  "php",
  "scm"
].forEach((str) => knownAcronyms.add(str));

var knownTermMappings = /* @__PURE__ */ new Map();

knownTermMappings.set("power shell", "PowerShell");

knownTermMappings.set("powershell", "PowerShell");

knownTermMappings.set("javascript", "JavaScript");

knownTermMappings.set("typescript", "TypeScript");

knownTermMappings.set("github", "GitHub");

knownTermMappings.set("ocaml", "OCaml");

knownTermMappings.set("jet brains", "JetBrains");

knownTermMappings.set("jetbrains", "JetBrains");

knownTermMappings.set("re sharper", "ReSharper");

knownTermMappings.set("resharper", "ReSharper");

function wordifyKey(key3) {
  key3 = key3.replace(/\.([a-z0-9])/g, (_, p1) => ` \u203A ${p1.toUpperCase()}`).replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]{1,})([A-Z][a-z])/g, "$1 $2").replace(/^[a-z]/g, (match2) => match2.toUpperCase()).replace(/\b\w+\b/g, (match2) => {
    return knownAcronyms.has(match2.toLowerCase()) ? match2.toUpperCase() : match2;
  });
  for (const [k, v2] of knownTermMappings) {
    key3 = key3.replace(new RegExp(`\\b${k}\\b`, "gi"), v2);
  }
  return key3;
}
export { getExperimentalExtensionToggleData, compareTwoNullableNumbers, wordifyKey, IPreferencesSearchService, CONTEXT_PREFERENCES_SEARCH_FOCUS, SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, SETTINGS_EDITOR_COMMAND_SHOW_AI_RESULTS, SETTINGS_EDITOR_COMMAND_TOGGLE_AI_SEARCH, SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU, SETTINGS_EDITOR_COMMAND_SUGGEST_FILTERS, CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_JSON_EDITOR, CONTEXT_SETTINGS_SEARCH_FOCUS, CONTEXT_TOC_ROW_FOCUS, CONTEXT_SETTINGS_ROW_FOCUS, CONTEXT_SETTINGS_FIRST_ROW_FOCUS, CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS, CONTEXT_KEYBINDINGS_SEARCH_HAS_VALUE, CONTEXT_KEYBINDING_FOCUS, CONTEXT_WHEN_FOCUS, CONTEXT_AI_SETTING_RESULTS_AVAILABLE, KEYBINDINGS_EDITOR_COMMAND_SEARCH, KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY, KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS, KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE, KEYBINDINGS_EDITOR_COMMAND_DEFINE, KEYBINDINGS_EDITOR_COMMAND_ADD, KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN, KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN, KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN, KEYBINDINGS_EDITOR_COMMAND_REMOVE, KEYBINDINGS_EDITOR_COMMAND_RESET, KEYBINDINGS_EDITOR_COMMAND_COPY, KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND, KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE, KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR, KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS, KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS, KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS, KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS, MODIFIED_SETTING_TAG, EXTENSION_SETTING_TAG, FEATURE_SETTING_TAG, ID_SETTING_TAG, LANGUAGE_SETTING_TAG, GENERAL_TAG_SETTING_TAG, POLICY_SETTING_TAG, AGENTS_WINDOW_SETTING_TAG, WORKSPACE_TRUST_SETTING_TAG, REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG, ADVANCED_SETTING_TAG, ENABLE_LANGUAGE_FILTER, ENABLE_EXTENSION_TOGGLE_SETTINGS, EXTENSION_FETCH_TIMEOUT_MS, STRING_MATCH_SEARCH_PROVIDER_NAME, TF_IDF_SEARCH_PROVIDER_NAME, FILTER_MODEL_SEARCH_PROVIDER_NAME, EMBEDDINGS_SEARCH_PROVIDER_NAME, LLM_RANKED_SEARCH_PROVIDER_NAME, cachedExtensionToggleData, PREVIEW_INDICATOR_DESCRIPTION, EXPERIMENTAL_INDICATOR_DESCRIPTION, ADVANCED_INDICATOR_DESCRIPTION, knownAcronyms, knownTermMappings };
