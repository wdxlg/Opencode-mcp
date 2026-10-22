// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/preferences/common/preferences.ts
import { DEFAULT_EDITOR_ASSOCIATION } from "./module-0925.mjs";
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/services/preferences/common/preferences.ts
var SettingKeyMatchTypes = 128 /* AllWordsInSettingsLabel */ | 32 /* ContiguousWordsInSettingsLabel */ | 16 /* NonContiguousWordsInSettingsLabel */ | 4 /* NonContiguousQueryInSettingId */ | 64 /* ContiguousQueryInSettingId */;

function validateSettingsEditorOptions(options3) {
  return {
    // Inherit provided options
    ...options3,
    // Enforce some options for settings specifically
    override: DEFAULT_EDITOR_ASSOCIATION.id,
    pinned: true
  };
}

var IPreferencesService = createDecorator("preferencesService");

var DEFINE_KEYBINDING_EDITOR_CONTRIB_ID = "editor.contrib.defineKeybinding";

var FOLDER_SETTINGS_PATH2 = ".vscode/settings.json";

var DEFAULT_SETTINGS_EDITOR_SETTING = "workbench.settings.openDefaultSettings";

var USE_SPLIT_JSON_SETTING = "workbench.settings.useSplitJSON";

var ALWAYS_SHOW_ADVANCED_SETTINGS_SETTING = "workbench.settings.alwaysShowAdvancedSettings";

var SETTINGS_AUTHORITY = "settings";
export { validateSettingsEditorOptions, SettingKeyMatchTypes, IPreferencesService, DEFINE_KEYBINDING_EDITOR_CONTRIB_ID, FOLDER_SETTINGS_PATH2, DEFAULT_SETTINGS_EDITOR_SETTING, USE_SPLIT_JSON_SETTING, ALWAYS_SHOW_ADVANCED_SETTINGS_SETTING, SETTINGS_AUTHORITY };
